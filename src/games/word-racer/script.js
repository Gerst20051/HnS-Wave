
function showCorrectContent() {
    const isLoggedIn = true;
    $(isLoggedIn ? '#registrationContent' : '#restrictedContent').hide();
    $(isLoggedIn ? '#restrictedContent' : '#registrationContent').show();
}

function setClickHandlers() {
    $('#loginSelectBtn').on('click', showLoginContent);
    $('#signupSelectBtn').on('click', showSignupContent);
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
    $('#loginForm').on('submit', function () {
        return false;
    });
    $('#signupForm').on('submit', function () {
        return false;
    });
}

$(document).ready(function () {
    showCorrectContent();
    setClickHandlers();
    setRegistrationFormHandlers();
});
