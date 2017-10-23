import Input from '../input/input';
import { getOrder, updateOrder, payBonusOrder, payOrder } from '../../js/api';
import { getParam } from '../../js/history';
import Auth from '../../js/Auth';

const $form = $('#form-order');

if ($form.length) {
  const orderId = getParam('order');

  $.when(
    Auth.getProfile(),
    getOrder(orderId, Auth.token)
  ).then((profile, [order]) => {
      $('.form__form').show();

      $('#form-address').val(order.address);
      $('#form-flat').val(order.flat);
      $('#form-sellingPrice').val(order.salePrice);

      $('#form-name').val(profile.name);
      $('#form-surname').val(profile.surname);
      $('#form-patronymic').val(profile.parentalName);
      $('#form-phone').val(profile.phone).mask('+7 (999) 999-99-99');
      if (order.inspectionDate) $('#form-date').val(order.inspectionDate.reverse().join('.'));
      if (order.timeBlock) $('#form-time').val(order.timeBlock);
      $('#form-partner').val(order.partnerCode);
      $('#form-comment').val(order.comment);

      const $sellingPrice = new Input({
        $el:       $('#form-sellingPrice').parent(),
        validator: { 'Введите цену продажи': (val) => !!+val },
      });
      const $name = new Input({
        $el:       $('#form-name').parent(),
        validator: { 'Введите имя': val => !!val },
      });
      const $surname = new Input({
        $el:       $('#form-surname').parent(),
        validator: { 'Введите фамилию': val => !!val },
      });
      const $patronymic = new Input({
        $el:       $('#form-patronymic').parent(),
        validator: { 'Введите отчество': val => !!val },
      });
      const $date = new Input({
        $el:       $('#form-date').parent(),
        type:      'date',
        validator: { 'Выберите дату': val => !!val },
      });
      const $time = new Input({
        $el:       $('#form-time').parent(),
        validator: { 'Выберите время': val => !!val },
      });
      const $partner = new Input({
        $el: $('#form-partner').parent(),
        validator: { 'Невереый код партнера': val => !val || !!window.PARTNERS[val] },
      });
      const $comment = new Input({
        $el: $('#form-comment').parent(),
      });

      const fields = [$sellingPrice, $name, $surname, $patronymic, $date, $time, $comment];
      const $buttons = $('.form__button');
      const $button_pay = $('#form-pay');
      const $button_bonus = $('#form-bonus');
      const $offer = $('#form-offer');

      $buttons.attr('disabled', true);
      $offer.on('change', () => {
        $button_pay.attr('disabled', !$offer.prop('checked'));
        if (profile.bonus > 0) $button_bonus.attr('disabled', !$offer.prop('checked'));
      });

      $button_bonus.on('click', (e) => {
        e.preventDefault();
        const data = collectOrder();
        if (!data) return;
        updateOrder(data, Auth.token)
          .then(() => payBonusOrder(data.id, Auth.token))
          .then(() => window.location.href = $form.attr('action') + '?order=' + data.id);
        // ;
      });

      $form.on('submit', (e) => {
        e.preventDefault();

        const data = collectOrder();
        const url = `${$form.prop('action')}?order=${orderId}`;
        // const url = `${$form.prop('action')}`;
        if (!data) return;

        updateOrder(data, Auth.token)
          .catch(err => {
          })
          .then(() => payOrder(data.id, url, Auth.token))
          .then((redirect) => (window.location.href = redirect.formUrl))
        // console.log(data);
      });

      function collectOrder () {
        if (!$offer.prop('checked')) return null;
        fields.forEach(field => field.validate());
        if (fields.some(field => !field.isValid())) return null;

        return {
          id:                order.id,
          inspectionDate:    $date.getValue(),
          timeBlock:         $time.getValue(),
          comment:           $comment.getValue(),
          surname:           $surname.getValue(),
          name:              $name.getValue(),
          parentalName:      $patronymic.getValue(),
          salePrice:         +$sellingPrice.getValue(),
          acceptedAgreement: true,
          partnerCode:       $partner.getValue(),
        };

      }
    }
  )
    .catch(() => $('.form__error').show())
    .always(() => $('.form__spinner').hide());
}
