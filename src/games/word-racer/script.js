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

function getApiUrl(route) {
    var url = 'http://' + window.location.hostname + ':' + 8000;
    if (route) {
        url += '/' + route;
    }
    return url;
}

function checkUserSession() {
    return new Promise(function (resolve, reject) {
        var userId = store.get('sessionUserId');
        var token = storeWithExpiration.get('sessionToken');
        if (userId && token) {
            $.getJSON(getApiUrl('checksession'), { userId: userId, sessionToken: token }).done(function (response) {
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

$(document).ready(function () {
    checkUserSession().then(function () {
        showCorrectContent();
        setClickHandlers();
        setRegistrationFormHandlers();
    });
});
