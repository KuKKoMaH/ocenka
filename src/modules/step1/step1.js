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
      $('#form-purchasePrice').val(order.salePrice);

      $('#form-name').val(profile.name);
      $('#form-surname').val(profile.surname);
      $('#form-patronymic').val(profile.parentalName);
      $('#form-phone').val(profile.phone).mask('+7 (999) 999-99-99');
      if (order.inspectionDate) $('#form-date').val(order.inspectionDate.reverse().join('.'));
      if (order.timeBlock) $('#form-time').val(order.timeBlock);
      $('#form-partner').val(order.partnerCode);
      $('#form-comment').val(order.comment);

      const $bank = new Input({
        $el:       $('#form-bank').parent(),
        type:      'select',
        validator: { 'Выберите банк': val => !!val },
      });
      const $purchasePrice = new Input({
        $el:       $('#form-purchasePrice').parent(),
        type:      'currency',
        validator: { 'Введите цену продажи': (val) => !!val },
      });

      const $customerName = new Input({
        $el:       $('#form-customer-name').parent(),
        validator: { 'Введите ФИО': val => !!val },
      });
      const $customerPassport = new Input({
        $el:       $('#form-customer-passport').parent(),
        type:      'papers',
        validator: { 'Введите паспортные данные': val => !!val },
      });
      const $customerPhone = new Input({
        $el:       $('#form-customer-phone').parent(),
        type:      'phone',
        validator: { 'Введите номер телефона': val => !!val },
      });

      const $borrowerName = new Input({
        $el:       $('#form-borrower-name').parent(),
        validator: { 'Введите ФИО': val => customerBorrowerSame || !!val },
      });
      const $borrowerPassport = new Input({
        $el:       $('#form-borrower-passport').parent(),
        type:      'papers',
        validator: { 'Введите паспортные данные': val => customerBorrowerSame || !!val },
      });
      const $borrowerPhone = new Input({
        $el:       $('#form-borrower-phone').parent(),
        type:      'phone',
        validator: { 'Введите номер телефона': val => customerBorrowerSame || !!val },
      });

      const $date = new Input({
        $el:       $('#form-date').parent(),
        type:      'date',
        validator: { 'Выберите дату': val => !!val },
      });
      const $time = new Input({
        $el:       $('#form-time').parent(),
        type:      'select',
        validator: { 'Выберите время': val => !!val },
      });
      const $evaluatingCompany = new Input({
        $el:       $('#form-evaluating-company').parent(),
        type:      'select',
        render:    {
          option: (item, escape) => {
            return `<div class="option">${escape(item.text)}<span class="option__rating">рейтинг: ${item.rating}</span></div>`;
          }
        },
        validator: { 'Выберите компанию': val => !!val },
      });

      const $comment = new Input({
        $el: $('#form-comment').parent(),
      });
      const $cost = new Input({
        $el:       $('#form-cost').parent(),
        type:      'select',
        validator: { 'Выберите тип объекта': val => !!val },
      });

      const fields = [
        $bank,
        $purchasePrice,
        $customerName,
        $customerPassport,
        $customerPhone,
        $borrowerName,
        $borrowerPassport,
        $borrowerPhone,
        $date,
        $time,
        $evaluatingCompany,
        $comment,
        $cost
      ];
      const $buttons = $('.form__button');
      const $button_pay = $('#form-pay');
      const $button_bonus = $('#form-bonus');
      const $offer = $('#form-offer');
      const $customerBorrowerSame = $('#form-customer-borrower-same');
      const $borrower = $('#borrower');

      $buttons.attr('disabled', true);
      $offer.on('change', () => {
        $button_pay.attr('disabled', !$offer.prop('checked'));
        if (profile.bonus > 0) $button_bonus.attr('disabled', !$offer.prop('checked'));
      });

      let customerBorrowerSame = null;
      const onChangeCustomerBorrowerSame = () => {
        customerBorrowerSame = $customerBorrowerSame.prop('checked');
        customerBorrowerSame ? $borrower.slideUp() : $borrower.slideDown();
      };
      $customerBorrowerSame.on('change', onChangeCustomerBorrowerSame);
      onChangeCustomerBorrowerSame();

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

      function collectOrder() {
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
          salePrice:         +$purchasePrice.getValue(),
          acceptedAgreement: true,
          partnerCode:       $partner.getValue(),
        };

      }
    }
  )
    .catch(() => $('.form__error').show())
    .always(() => $('.form__spinner').hide());
}
