var storeWithExpiration = {
    set: function (key, val, exp) {
        store.set(key, { val: val, exp: exp, time: new Date().getTime() });
    },
    get: function (key) {
        var info = store.get(key);
        if (!info) { return null; }
        if (new Date().getTime() - info.time > info.exp) { return null; }
        return info.val;
    }
};

var isLoggedIn = false;
var currentGameRoomId = null;
var isGameInProgress = false;
var thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1E3;
var gamePlayers = [];
var gameId = null;
var intermissionDuration = 0;
var roundDuration = 0;

function getApiUrl(route) {
    var url = 'http://' + window.location.hostname + ':' + 8000;
    if (route) {
        url += '/' + route;
    }
    return url;
}

function getBaseApiParams(params) {
    var userId = store.get('sessionUserId');
    var token = storeWithExpiration.get('sessionToken');
    params = params || {};
    if (userId && token) return _.extend({}, { sessionUserId: userId, sessionToken: token }, params);
    return params;
}

function checkUserSession() {
    return new Promise(function (resolve, reject) {
        var userId = store.get('sessionUserId');
        var token = storeWithExpiration.get('sessionToken');
        if (userId && token) {
            $.getJSON(getApiUrl('checksession'), { sessionUserId: userId, sessionToken: token }).done(function (response) {
                if (response.success) {
                    isLoggedIn = true;
                }
            }).always(function () {
                resolve();
            });
        } else {
            resolve();
        }
    });
}

function showCorrectContent() {
    $(isLoggedIn ? '#registrationContent' : '#restrictedContent').hide();
    $(isLoggedIn ? '#restrictedContent' : '#registrationContent').show();
    if (isLoggedIn) {
        initSockets();
        loadGameRooms();
    }
}

function setClickHandlers() {
    $('#loginSelectBtn').on('click', showLoginContent);
    $('#signupSelectBtn').on('click', showSignupContent);
}

function showSelectionContent() {
    $('#signupContent, #loginContent').hide();
    $('#selectionContent').show();
}

function hideSelectionContent() {
    $('#selectionContent').hide();
}

function showLoginContent() {
    hideSelectionContent();
    $('#signupContent').hide();
    $('#loginContent').show();
}

function showSignupContent() {
    hideSelectionContent();
    $('#loginContent').hide();
    $('#signupContent').show();
}

function setRegistrationFormHandlers() {
    $('#loginForm').on('submit', function (e) {
        submitLoginForm();
        e.preventDefault();
    });
    $('#signupForm').on('submit', function (e) {
        submitRegisterForm();
        e.preventDefault();
    });
    $('#createAnAccountLink').on('click', function (e) {
        showSignupContent();
        e.preventDefault();
    });
    $('#alreadyHaveAnAccountLink').on('click', function (e) {
        showLoginContent();
        e.preventDefault();
    });
    $('#createRoomBtn').on('click', function (e) {
        createRoom();
    });
    $('#startGameBtn').on('click', function (e) {
        createGame();
    });
    $('#goToCreateRoomTabBtn').on('click', function (e) {
        $('#createGameRoomTab > span').click();
    });
    $('#browseRoomsBtn').on('click', function (e) {
        $('#browseGameRoomsTab > span').click();
    });
    $('#createGameRoomTab').on('click', 'span', function (e) {
        showingCreateGameRoomTab();
    });
    $('#browseGameRoomsTab').on('click', 'span', function (e) {
        showingGameRoomsListTab();
    });
    $('#wordRacerGameTab').on('click', 'span', function (e, isRoomDifferent) {
        showingWordRacerGameTab(isRoomDifferent === 'changeRoom');
    });
    $('#gameRoomList').on('click', 'li', function (e) {
        const isRoomDifferent = currentGameRoomId !== $(this).attr('data-room-id');
        currentGameRoomId = $(this).attr('data-room-id');
        $('#wordRacerGameTab > span').trigger('click', isRoomDifferent ? 'changeRoom' : 'sameRoom');
    });
}

function showingCreateGameRoomTab() {
    $('body').removeClass('gameInProgress');
    destroyCanvas();
}

function showingGameRoomsListTab() {
    $('body').removeClass('gameInProgress');
    destroyCanvas();
    loadGameRooms();
}

function showingWordRacerGameTab(shouldLoadGameRoomData) {
    if (currentGameRoomId) {
        $('#noGameContent').hide();
        if (shouldLoadGameRoomData !== false) {
            loadGameRoomData();
        } else {
            if (isGameInProgress) {
                showCanvasContent();
            } else {
                hideCanvasContent();
            }
        }
    } else {
        $('#canvasContent').hide();
        $('#startGameContent').hide();
        $('body').removeClass('gameInProgress');
        $('#noGameContent').show();
    }
}

function postRawJSON(url, data, cb) {
    return $.ajax(url, {
        'contentType': 'application/json',
        'data': JSON.stringify(data),
        'processData': false,
        'type': 'POST'
    }).then(cb || $.noop);
}

function validateLoginForm() {
    return $('#email-username-login-input').val().trim().length && $('#password-login-input').val().trim().length;
}

function clearLoginForm() {
    $('#email-username-login-input, #password-login-input').val('');
}

function submitLoginForm() {
    if (!validateLoginForm()) return;
    postRawJSON(getApiUrl('login'), {
        'user': $('#email-username-login-input').val().trim(),
        'pass': $('#password-login-input').val().trim()
    }, function (response) {
        store.set('sessionUserId', response.user._id);
        storeWithExpiration.set('sessionToken', response.sessionToken, thirtyDaysInMilliseconds);
        isLoggedIn = true;
        clearLoginForm();
        showCorrectContent();
    });
}

function validateRegisterForm() {
    return $('#username-signup-input').val().trim().length && $('#email-signup-input').val().trim().length && $('#password-signup-input').val().trim().length && ~$('#email-signup-input').val().indexOf('@');
}

function clearRegisterForm() {
    $('#username-signup-input, #email-signup-input, #password-signup-input').val('');
}

function submitRegisterForm() {
    if (!validateRegisterForm()) return;
    postRawJSON(getApiUrl('register'), {
        'username': $('#username-signup-input').val().trim(),
        'email': $('#email-signup-input').val().trim(),
        'pass': $('#password-signup-input').val().trim()
    }, function (response) {
        store.set('sessionUserId', response.user._id);
        storeWithExpiration.set('sessionToken', response.sessionToken, thirtyDaysInMilliseconds);
        isLoggedIn = true;
        clearRegisterForm();
        showCorrectContent();
    });
}

function initSockets() {
    window.socket = io.connect(getApiUrl(), {
        query: $.param({
            sessionUserId: store.get('sessionUserId')
        })
    });
    socket.on('PlayerJoined', function (data) {
        console.log('Player Joined', data);
        gamePlayers[data.userId] = {
            userId: data.userId,
            username: data.username
        };
    });
    socket.on('PlayerLeft', function (data) {
        console.log('Player Left', data);
        delete gamePlayers[data.userId];
    });
    socket.on('WordFound', function (data) {
        console.log('Word Found', data);
        // TODO: Check gameId, roomId, and roundNumber
        wordsFound[currentGridIndex].unshift({
            userId: data.userId,
            username: data.username,
            word: data.word
        });
        addWordsFoundToPanel();
    });
    socket.on('GameStarted', function (data) {
        console.log('Game Started', data);
        $('#searchterm').text('');
        $('#progressinfo').removeClass('gameover');
        joinGame(data);
    });
    socket.on('StartRound', function (data) {
        console.log('Start Round', data);
        currentGridIndex = data.roundNumber - 1;
        roundDuration = data.duration;
        roundTimeLimitInSeconds = data.duration / 1E3;
        currentGridSolutionsCount = data.solutionsCount;
        beginningOfRound();
    });
    socket.on('StartIntermission', function (data) {
        console.log('Start Intermission', data);
        currentGridIndex = data.roundNumber - 2;
        intermissionDuration = data.duration;
        roundIntermissionInSeconds = data.duration / 1E3;
        gridSolutions[currentGridIndex] = data.solutions;
        endOfRound();
    });
    socket.on('GameOver', function (data) {
        console.log('Game Over', data);
        gridSolutions[currentGridIndex] = data.solutions;
        endOfRound();
        resetGame();
    });
}

function joinGame(data) {
    // TODO: need to pull down list of players?
    playGrids = data.gameGrids;
    gameId = data.gameId;
    intermissionDuration = data.intermissionDuration;
    roundIntermissionInSeconds = data.intermissionDuration / 1E3;
    roundDuration = data.roundDuration;
    roundTimeLimitInSeconds = data.roundDuration / 1E3;
    isGameInProgress = true;
    showCanvasContent();
    setupCanvas();
    startGame();
}

function showCanvasContent() {
    $('#startGameContent').hide();
    $('body').addClass('gameInProgress');
    $('#canvasContent').show();
}

function hideCanvasContent() {
    $('#canvasContent').hide();
    $('body').removeClass('gameInProgress');
    $('#startGameContent').show();
}

function resetGame() {
    isGameInProgress = false;
    playGrids = [];
    gameId = null;
    intermissionDuration = 0;
    roundIntermissionInSeconds = 0
    roundDuration = 0;
    roundTimeLimitInSeconds = 0;
}

function createRoom() {
    postRawJSON(getApiUrl('createroom'), getBaseApiParams(), function (response) {
        currentGameRoomId = response._id;
        $('#wordRacerGameTab > span').click();
    });
}

function loadGameRooms() {
    $.getJSON(getApiUrl('rooms'), getBaseApiParams()).done(function (response) {
        $('#loadingGameRoomsContent').hide();
        if (response.length) {
            var gameRoomListItems = _.map(response, function (room) {
                var gameRoomListItemClass = currentGameRoomId === room._id ? ' class="currentGameRoom"' : '';
                var playerString = room.playerCount + ' Player' + (1 !== room.playerCount ? 's' : '');
                var gameStatusString = '';
                if (!_.isNull(room.gameStatus)) {
                    if (room.gameStatus.intermission) {
                        gameStatusString = ' - Intermission Waiting For Round ' + (room.gameStatus.roundNumber + 1) + ' To Start';
                    } else if (!room.gameStatus.started) {
                        gameStatusString = ' - Waiting For Game To Begin';
                    } else {
                        gameStatusString = ' - Round ' + room.gameStatus.roundNumber;
                    }
                }
                var roomSubTitle = playerString + gameStatusString;
                return '<li data-room-id="' + room._id + '"' + gameRoomListItemClass + '><div><div class="roomTitle">' + room._id + '</div><div class="roomSubTitle">' + roomSubTitle + '</div></div></li>';
            });
            $('#gameRoomList').html(gameRoomListItems);
            $('#noGameRoomsAvailable').hide();
            $('#gameRoomsListContent').show();
        } else {
            $('#gameRoomsListContent').hide();
            $('#noGameRoomsAvailable').show();
        }
    });
}

function loadGameRoomData() {
    $.getJSON(getApiUrl('room'), getBaseApiParams({ roomId: currentGameRoomId, join: true })).done(function (response) {
        if (response.gameId) {
            isGameInProgress = true;
            showCanvasContent();
            setupCanvas();
            joinGame(response);
        } else {
            isGameInProgress = false;
            resetGame();
            hideCanvasContent();
            destroyCanvas();
        }
    });
}

function createGame() {
    postRawJSON(getApiUrl('creategame'), getBaseApiParams({ roomId: currentGameRoomId }));
}

setInterval(loadGameRooms, 5E3);

$(document).ready(function () {
    checkUserSession().then(function () {
        showCorrectContent();
        setClickHandlers();
        setRegistrationFormHandlers();
    });
});
