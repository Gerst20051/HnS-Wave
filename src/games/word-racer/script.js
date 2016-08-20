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

var gameGrids = [];
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
    $('#wordRacerGameTab').on('click', 'span', function (e) {
        showingWordRacerGameTab();
    });
    $('#gameRoomList').on('click', 'li', function (e) {
        currentGameRoomId = $(this).attr('data-room-id');
        $('#wordRacerGameTab > span').click();
    });
}

function showingCreateGameRoomTab() {
    $('body').removeClass('gameInProgress');
}

function showingGameRoomsListTab() {
    $('body').removeClass('gameInProgress');
    loadGameRooms();
}

function showingWordRacerGameTab() {
    if (currentGameRoomId) {
        $('#noGameContent').hide();
        if (isGameInProgress) {
            $('#startGameContent').hide();
            $('body').addClass('gameInProgress');
            $('#canvasContent').show();
        } else {
            $('#canvasContent').hide();
            $('body').removeClass('gameInProgress');
            $('#startGameContent').show();
        }
        loadGameRoomData();
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
    });
    socket.on('PlayerLeft', function (data) {
        console.log('Player Left', data);
    });
    socket.on('GameStarted', function (data) {
        console.log('Game Started', data);
        playGrids = data.gameGrids;
        gameId = data.gameId;
        intermissionDuration = data.intermissionDuration;
        roundIntermissionInSeconds = data.intermissionDuration;
        roundDuration = data.roundDuration;
        roundTimeLimitInSeconds = data.roundDuration;
        isGameInProgress = true;
        $('#startGameContent').hide();
        $('body').addClass('gameInProgress');
        $('#canvasContent').show();
    });
    socket.on('StartRound', function (data) {
        console.log('Start Round', data);
        currentGridIndex = data.roundNumber - 1;
    });
    socket.on('StartIntermission', function (data) {
        console.log('Start Intermission', data);
        currentGridIndex = data.roundNumber - 1;
    });
    socket.on('GameOver', function (data) {
        console.log('Game Over', data);
        isGameInProgress = false;
    });
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
                return '<li data-room-id="' + room._id + '"' + gameRoomListItemClass + '><div><div class="roomTitle">' + room._id + '</div><div class="roomSubTitle">' + playerString + '</div></div></li>';
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
        // TODO: is game in progress??
    });
}

function createGame() {
    postRawJSON(getApiUrl('creategame'), getBaseApiParams({ roomId: currentGameRoomId }));
}

$(document).ready(function () {
    checkUserSession().then(function () {
        showCorrectContent();
        setClickHandlers();
        setRegistrationFormHandlers();
    });
});
