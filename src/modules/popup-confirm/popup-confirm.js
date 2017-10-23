import Auth from '../../js/Auth';

$('.popup__resend').on('click', (e) => {
  e.preventDefault();
  Auth.resendCode().then();
});
