import Input from '../input/input';
import * as API from '../../js/api';
import Auth from '../../js/Auth';

if ($('#header').length) {
  Auth.getProfile().then(
    profile => createForm(profile),
    () => createForm()
  );

  function createForm(profile) {
    let currentAddress = null;
    if (profile) $('.header__phone .input__input').val(profile.phone);

    const $address = new Input({
      $el:       $('.header__address .input'),
      type:      'suggestions',
      onSelect:  suggest => (currentAddress = suggest),
      validator: {
        'Укажите адрес с точностью до дома': () => !!currentAddress && !!currentAddress.data.house
      },
    });

    const $flat = new Input({
      $el:       $('.header__flat .input'),
      type:      'number',
      validator: { 'Введите номер': (val) => !!val },
    });

    const $phone = new Input({
      $el:       $('.header__phone .input'),
      type:      'phone',
      validator: { 'Введите телефон': val => !!val },
    });

    const fields = [$address, $flat, $phone];
    const $button = $('.header__submit button');
    const $error = $('.header__form-error');

    $('.header__form').on('submit', (e) => {
      e.preventDefault();

      fields.forEach(field => field.validate());
      if (fields.some(field => !field.isValid())) return;

      const phone = $phone.getValue();
      const data = {
        address:        currentAddress.value,
        houseNumber:    currentAddress.data.house,
        flatNumber:     +$flat.getValue(),
        fiasGuid:       currentAddress.data.street_fias_id,
        fiasRegionGuid: currentAddress.data.region_fias_id,
        lat:            +currentAddress.data.geo_lat,
        lon:            +currentAddress.data.geo_lon,
      };
      $button.attr('disabled', 'disabled');
      $error.html('');

      createOrder(phone, data)
        .then((order) => (window.location.href = e.target.action + '?order=' + order.id))
        .catch(err => $error.html(err.responseJSON.message))
        .always(() => $button.removeAttr('disabled'));
    });

    function createOrder(phone, data) {
      if (phone !== Auth.phone) return Auth.auth(phone).then(() => createOrder(phone, data));
      return API.createDraft(data, Auth.token).catch((err) => {
          if (err.status === 403) return Auth.auth(phone).then(() => createOrder(phone, data));
          throw err;
        },
      )
    }
  }
}