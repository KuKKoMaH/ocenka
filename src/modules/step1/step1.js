import Input from '../input/input';
import * as API from '../../js/api';
import { getParam } from '../../js/history';
import Auth from '../../js/Auth';

const $form = $('#form-order');

if ($form.length) {
  const orderId = getParam('order');

  $.when(
    Auth.getProfile(),
    API.getDraft(orderId, Auth.token)
  ).then(( profile, [order] ) => {
      let appraisalCompanies = null;

      $('.form__form').show();

      $('#form-address').val(order.address);
      $('#form-flat').val(order.flatNumber);

      $('#form-customer-name').val(order.customerName);
      $('#form-customer-passport').val(order.customerPassport);
      $('#form-customer-phone').val(order.customerPhone).mask('+7 (999) 999-99-99');

      $('#form-borrower-name').val(order.borrowerName);
      $('#form-borrower-passport').val(order.borrowerPassport);
      $('#form-borrower-phone').val(order.borrowerPhone).mask('+7 (999) 999-99-99');

      if (order.inspectionDate) $('#form-date').val(order.inspectionDate);
      if (order.inspectionTimeBlock) $('#form-time').val(order.inspectionTimeBlock);

      $('#form-purchasePrice').val(order.objectSalePrice);
      $('#form-comment').val(order.comment);

      const $bank = new Input({
        $el:       $('#form-bank').parent(),
        type:      'select',
        load:      API.getBanksList,
        validator: { 'Выберите банк': val => !!val },
        onChange:  ( value ) => {
          if (!value) return $evaluatingCompany.setOptions([]);
          API.getCompaniesList(getAddress(), value).then(companies => {
            appraisalCompanies = companies;
            $evaluatingCompany.setOptions(companies);
          });
        }
      });

      const $evaluatingCompany = new Input({
        $el:       $('#form-evaluating-company').parent(),
        type:      'select',
        render:    {
          option: ( item, escape ) => {
            return `<div class="option">${escape(item.name)}<span class="option__rating">рейтинг: ${item.rating}</span></div>`;
          }
        },
        validator: { 'Выберите компанию': val => !!val },
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
      const $purchasePrice = new Input({
        $el:       $('#form-purchasePrice').parent(),
        type:      'currency',
        validator: { 'Введите цену продажи': ( val ) => !!val },
      });

      const $comment = new Input({
        $el:  $('#form-comment').parent(),
        type: 'textarea',
      });
      const $cost = new Input({
        $el:       $('#form-cost').parent(),
        type:      'select',
        validator: { 'Выберите тип объекта': val => !!val },
      });

      API.getBanksList().then(banks => {
        $bank.setOptions(banks);
        if (order.bankId) $bank.setValue(order.bankId);
      });
      if (order.objectType) $cost.setValue(order.objectType);

      API.getTypes(Auth.token).then(types => {
        $cost.setOptions(types);
        if (order.realtyType) $cost.setValue(order.realtyType);
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
      const $bank_bonus = $('#form-paybank');
      const $offer = $('#form-offer');
      const $customerBorrowerSame = $('#form-customer-borrower-same');
      const $borrower = $('#borrower');

      $buttons.attr('disabled', !$offer.prop('checked'));
      $offer.on('change', () => {
        $button_pay.attr('disabled', !$offer.prop('checked'));
        $bank_bonus.attr('disabled', !$offer.prop('checked'));
        // if (profile.bonus > 0) $button_bonus.attr('disabled', !$offer.prop('checked'));
      });

      let customerBorrowerSame = null;
      const onChangeCustomerBorrowerSame = () => {
        customerBorrowerSame = $customerBorrowerSame.prop('checked');
        customerBorrowerSame ? $borrower.slideUp() : $borrower.slideDown();
      };
      $customerBorrowerSame.on('change', onChangeCustomerBorrowerSame);
      if (
        order.customerName === order.borrowerName &&
        order.customerPassport === order.borrowerPassport &&
        order.customerPhone === order.borrowerPhone
      ) $customerBorrowerSame.prop('checked', true);
      onChangeCustomerBorrowerSame();

      $bank_bonus.on('click', ( e ) => {
        e.preventDefault();
        const data = collectOrder();
        if (!data) return;
        API.updateDraft(data, Auth.token)
          .then(() => (window.location.href = '/invoice.html?order=' + data.id));

        // API.updateOrder(data, Auth.token)
        // .then(() => API.getOrderInvoice(data.id, Auth.token))
        // .then(console.log);
      });

      $form.on('submit', ( e ) => {
        e.preventDefault();

        const data = collectOrder();
        if (!data) return;
        const url = `${$form.prop('action')}?order=${orderId}`;
        const successUrl = url + '&success=true';
        const failUrl = url + '&success=false';
        // const url = `${$form.prop('action')}`;
        const companyId = +$evaluatingCompany.getValue();
        const company = appraisalCompanies.find(c => c.id === companyId);

        API.updateDraft(data, Auth.token)
        // .then(() => API.createOrder(data.id))
          .then(() => API.payOrder(data.id, successUrl, failUrl, company.price, Auth.token))
          .then(( redirect ) => (window.location.href = redirect.url))
          .catch(err => {
          })
      });

      function collectOrder() {
        if (!$offer.prop('checked')) return null;
        fields.forEach(field => field.validate());
        if (fields.some(field => !field.isValid())) return null;

        return {
          id:                  order.id,
          address:             order.address,
          fiasGuid:            order.fiasGuid,
          houseNumber:         order.houseNumber,
          flatNumber:          order.flatNumber,
          lat:                 order.lat,
          lon:                 order.lon,
          bankId:              $bank.getValue(),
          appraisalCompanyId:  $evaluatingCompany.getValue(),
          objectSalePrice:     +$purchasePrice.getValue().replace(/ /g, ''),
          customerName:        $customerName.getValue(),
          customerPassport:    $customerPassport.getValue(),
          borrowerName:        (customerBorrowerSame ? $customerName : $borrowerName).getValue(),
          borrowerPassport:    (customerBorrowerSame ? $customerPassport : $borrowerPassport).getValue(),
          borrowerPhone:       (customerBorrowerSame ? $customerPhone : $borrowerPhone).getValue(),
          inspectionDate:      $date.getValue(),
          inspectionTimeBlock: $time.getValue(),
          comment:             $comment.getValue(),
          realtyType:          $cost.getValue(),
        };
      }

      function getAddress() {
        return {
          address:        order.address,
          fiasGuid:       order.fiasGuid,
          fiasRegionGuid: order.fiasRegionGuid,
          houseNumber:    order.houseNumber,
          flatNumber:     order.flatNumber,
          lat:            order.lat,
          lon:            order.lon,
        }
      }
    }
  )
    .catch(() => $('.form__error').show())
    .always(() => $('.form__spinner').hide());
}
