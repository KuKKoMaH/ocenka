import Input from '../input/input';
import Auth from '../../js/Auth';

const $form = $('#popup-register');

if ($form.length) {
  const $phone = new Input({
    $el:       $form.find('.popup__input'),
    type:      'phone',
    validator: { 'Введите телефон': val => !!val },
  });

  $form.on('submit', (e) => {
    e.preventDefault();

    Auth.auth($phone.getValue()).then(() => (window.location.href = e.target.action));
  })
}
