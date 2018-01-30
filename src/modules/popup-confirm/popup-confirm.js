import Auth from '../../js/Auth';

$('.popup__resend').on('click', ( e ) => {
  e.preventDefault();
  Auth.resendCode().then();
});

const $form = $('#popup-confirm');

if ($form.length) {
  $('#auth-password').mask('999999');
}
