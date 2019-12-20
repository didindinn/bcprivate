function checkEmail(email) {

    var reg = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (!reg.test(email)) {
        return false;
    } else {
        return true;
    }

}

function checkNickname(nickname) {

    var reg = /^[a-zA-Z0-9 ]*$/;

    if (!reg.test(nickname)) {
        return false;
    } else {
        return true;
    }

}

function checkUsername(username) {

    var reg = /^[a-zA-Z0-9 ]*$/;

    if (!reg.test(username)) {
        return false;
    } else {
        return true;
    }

}
