$("form").submit(function (e) {

    e.preventDefault();

    var nickname = $('#nickname').val();
    var email = $('#email').val();
    var password = $('#password').val();

    // Remove spaces from beginning and end of nickname
    nickname = nickname.trim();
    $('#nickname').val(nickname);

    var isValid = true;

    $('.form-error').hide();

    if (password.length < 6 || password.length > 100) {
        $('#password').addClass('is-invalid').focus();
        $('.form-error').text('Invalid password').show();
        isValid = false;
    } else {
        $('#password').removeClass('is-invalid');
    }

    if (!checkEmail(email)) {
        $('#email').addClass('is-invalid').focus();
        $('.form-error').text('Invalid email address').show();
        isValid = false;
    } else {
        $('#email').removeClass('is-invalid');
    }


    if (!checkNickname(nickname)) {
        $('#nickname').addClass('is-invalid').focus();
        $('.form-error').text('Invalid nickname').show();
        isValid = false;
    } else if (nickname.length < 3 || nickname.length > 25) {
        $('#nickname').addClass('is-invalid').focus();
        $('.form-error').text('Invalid nickname').show();
        isValid = false;
    } else {
        $('#nickname').removeClass('is-invalid');
    }

    if (isValid) {
		$.ajax({
			type: "POST",
			url: "/register",
			data: {
				nickname: nickname,
				email: email,
				password: password
			},
			success: function(result) {
				console.log(result);
				sessionStorage.setItem("playerId", result.playerId);
				sessionStorage.setItem("sessionTicket", result.sessionTicket);
				sessionStorage.setItem("isNewPlayer", true);
				document.location.href = '/play/index.html';
			},
			error: function(error) {
				error = error.responseJSON;

				$('.form-error').text(error.errorMessage).show();

				// Password error
				if (error.error == 'InvalidParams') {
					$('#password').addClass('is-invalid').focus();
				} else {
					$('#password').removeClass('is-invalid');
				}

				if (error.error == 'EmailAddressNotAvailable') {
					$('#email').addClass('is-invalid').focus();
				} else {
					$('#email').removeClass('is-invalid');
				}

				if (error.error == 'NameNotAvailable') {
					$('#nickname').addClass('is-invalid').focus();
					$('.form-error').text('Nickname is not available. Try again');
				} else {
					$('#inputNickname').removeClass('is-invalid');
				}
			}
        });
    }

});
