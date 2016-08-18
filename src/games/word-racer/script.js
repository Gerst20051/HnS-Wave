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

function getApiUrl(route) {
    var url = 'http://' + window.location.hostname + ':' + 8000;
    if (route) {
        url += '/' + route;
    }
    return url;
}

function getBaseApiParams() {
    var userId = store.get('sessionUserId');
    var token = storeWithExpiration.get('sessionToken');
    if (userId && token) return { sessionUserId: userId, sessionToken: token };
    return {};
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
}

function showingCreateGameRoomTab() {
    console.log('HERE 1');
}

function showingGameRoomsListTab() {
    console.log('HERE 2');
    loadGameRooms();
}

function showingWordRacerGameTab() {
    console.log('HERE 3');
    if (currentGameRoomId) {
        $('#noGameContent').hide();
        $('#canvasContent').show();
    } else {
        $('#canvasContent').hide();
        $('#noGameContent').show();
    }
}

function postRawJSON(url, data, cb) {
    return $.ajax(url, {
        'contentType': 'application/json',
        'data': JSON.stringify(data),
        'processData': false,
        'type': 'POST'
    }).then(cb);
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
        storeWithExpiration.set('sessionToken', response.sessionToken, 30 * 24 * 60 * 60 * 1E3); // expires 30 days from now
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
        storeWithExpiration.set('sessionToken', response.sessionToken, 30 * 24 * 60 * 60 * 1E3); // expires 30 days from now
        isLoggedIn = true;
        clearRegisterForm();
        showCorrectContent();
    });
}

function initSockets() {
    window.socket = io.connect(getApiUrl());
    socket.on('data', function (data) {
        console.log('data from server', data);
    });
    setTimeout(function () {
        socket.emit('data', {
            hello: 'server'
        });
    }, 1E3);
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
                return '<li data-room-id="' + room._id + '"><div><div class="roomTitle">' + room._id + '</div><div class="roomSubTitle">' + room.ownerId + ' Players</div></div></li>';
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

$(document).ready(function () {
    checkUserSession().then(function () {
        showCorrectContent();
        setClickHandlers();
        setRegistrationFormHandlers();
    });
});
