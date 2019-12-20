PlayFab.settings.titleId = '5417';

$("form").submit(function (e) {

    e.preventDefault();

    var email = $('#email').val();

    var isValid = true;

    if (!checkEmail(email)) {
        $('#email').addClass('is-invalid').focus();
        $('.form-error').text('Invalid email address').show();
        isValid = false;
    } else {
        $('#email').removeClass('is-invalid');
    }

    if (isValid) {
        PlayFabClientSDK.SendAccountRecoveryEmail({
            TitleId: '5417',
            Email: email
        }, function (result, error) {
            if (error) {
                console.error(error);
                $('.form-error').text(error.errorMessage).show();
            } else if (result) {
                document.location.href = 'sent.html';
            } else {
                $('.form-error').text('Grub! Something went wrong');
            }
        });
    }

});
