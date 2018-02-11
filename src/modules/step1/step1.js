import Input from '../input/input';
import * as API from '../../js/api';
import { getParam } from '../../js/history';
import Auth from '../../js/Auth';

const $form = $('#form-order');

if ($form.length) {

  Auth.getProfile()
    .then(loadOrder)
    .catch(() => {
      Auth.showLoginPopup().then(
        loadOrder,
        () => (window.location = '.')
      );
    });

  function loadOrder() {
    const orderId = getParam('order');
    API.getDraft(orderId, Auth.token).then(
      processOrder,
      () => {
        $('.form__spinner').hide();
        $('.form__error').show();
      }
    );
  }

  function processOrder( order ) {
    let appraisalCompanies = null;
    const $errorContainer = $('.form__response');

    $('.form__spinner').hide();
    $('.form__form').show();

    $('#form-address').val(order.address);
    $('#form-flat').val(order.flatNumber);

    $('#form-customer-name').val(order.customerName);
    $('#form-customer-passport').val(order.customerPassport);
    // $('#form-customer-phone').val(order.customerPhone).mask('+7 (999) 999-99-99');

    $('#form-borrower-name').val(order.borrowerName);
    // $('#form-borrower-passport').val(order.borrowerPassport);
    // $('#form-borrower-phone').val(order.borrowerPhone).mask('+7 (999) 999-99-99');

    if (order.inspectionDate) $('#form-date').val(order.inspectionDate);
    if (order.inspectionTimeBlock) $('#form-time').val(order.inspectionTimeBlock);

    // $('#form-purchasePrice').val(order.objectSalePrice);
    $('#form-comment').val(order.comment);

    const $cost = new Input({
      $el:       $('#form-cost').parent(),
      type:      'select',
      validator: { 'Выберите тип объекта': val => !!val },
      onChange:  setPrice,
    });

    const $bank = new Input({
      $el:       $('#form-bank').parent(),
      type:      'select',
      load:      API.getBanksList,
      validator: { 'Выберите банк': val => !!val },
      onChange:  ( value ) => {
        if (!value) return $evaluatingCompany.setOptions([]);
        setBank(value);
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
      onChange:  setPrice,
    });

    const $customerName = new Input({
      $el:         $('#form-customer-name').parent(),
      type:        'suggestions',
      suggestType: 'NAME',
      validator:   { 'Введите ФИО': val => !!val },
    });
    $customerName.$input.on('input', () => {
      if (customerBorrowerSame) $borrowerName.setValue($customerName.$input.val());
    });
    const $customerPassport = new Input({
      $el:       $('#form-customer-passport').parent(),
      type:      'papers',
      validator: { 'Введите паспортные данные': val => !!val },
    });
    // const $customerPhone = new Input({
    //   $el:       $('#form-customer-phone').parent(),
    //   type:      'phone',
    //   validator: { 'Введите номер телефона': val => !!val },
    // });

    const $borrowerName = new Input({
      $el:         $('#form-borrower-name').parent(),
      type:        'suggestions',
      suggestType: 'NAME',
      validator:   { 'Введите ФИО': val => customerBorrowerSame || !!val },
    });
    // const $borrowerPassport = new Input({
    //   $el:       $('#form-borrower-passport').parent(),
    //   type:      'papers',
    //   validator: { 'Введите паспортные данные': val => customerBorrowerSame || !!val },
    // });
    // const $borrowerPhone = new Input({
    //   $el:       $('#form-borrower-phone').parent(),
    //   type:      'phone',
    //   validator: { 'Введите номер телефона': val => customerBorrowerSame || !!val },
    // });

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
    // const $purchasePrice = new Input({
    //   $el:       $('#form-purchasePrice').parent(),
    //   type:      'currency',
    //   validator: { 'Введите цену продажи': ( val ) => !!val },
    // });

    const $comment = new Input({
      $el:  $('#form-comment').parent(),
      type: 'textarea',
    });

    API.getTypes(Auth.token).then(types => {
      $cost.setOptions(types);
      if (order.realtyType) $cost.setValue(order.realtyType);
    });
    API.getBanksList().then(banks => {
      if (banks.length > 1) $('#bank').slideDown();
      if (banks.length === 1) setBank(banks[0].id);
      $bank.setOptions(banks);
      if (order.bankId) $bank.setValue(order.bankId);
    });
    if (order.objectType) $cost.setValue(order.objectType);

    const fields = [
      $bank,
      // $purchasePrice,
      $customerName,
      $customerPassport,
      // $customerPhone,
      $borrowerName,
      // $borrowerPassport,
      // $borrowerPhone,
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
    // const $borrower = $('#borrower');

    $buttons.attr('disabled', !$offer.prop('checked'));
    $offer.on('change', () => {
      $button_pay.attr('disabled', !$offer.prop('checked'));
      $bank_bonus.attr('disabled', !$offer.prop('checked'));
      // if (profile.bonus > 0) $button_bonus.attr('disabled', !$offer.prop('checked'));
    });

    let customerBorrowerSame = null;
    const onChangeCustomerBorrowerSame = () => {
      customerBorrowerSame = $customerBorrowerSame.prop('checked');
      if (customerBorrowerSame) $borrowerName.setValue($customerName.getValue());
      $borrowerName.$input.attr('disabled', customerBorrowerSame);

    };
    $customerBorrowerSame.on('change', onChangeCustomerBorrowerSame);
    if (order.customerName === order.borrowerName) $customerBorrowerSame.prop('checked', true);
    onChangeCustomerBorrowerSame();

    setPrice();

    $bank_bonus.on('click', ( e ) => {
      e.preventDefault();
      const data = collectOrder();
      if (!data) return;
      API.updateDraft(data, Auth.token)
        .then(() => (window.location.href = $bank_bonus.data('link') + '?order=' + data.id))
        .catch(err => {
          const errorText = err && err.responseJSON && err.responseJSON.message || 'Неизвестная ошибка';
          $errorContainer.html(errorText);
        })

      // API.updateOrder(data, Auth.token)
      // .then(() => API.getOrderInvoice(data.id, Auth.token))
      // .then(console.log);
    });

    $form.on('submit', ( e ) => {
      e.preventDefault();

      const data = collectOrder();
      if (!data) return;
      const url = `${$form.prop('action')}`;
      const successUrl = url + '?success=true';
      const failUrl = url + '?success=false';
      console.log(successUrl, failUrl);
      API.updateDraft(data, Auth.token)
        .then(() => API.payOrder(data.id, successUrl, failUrl, Auth.token))
        .then(( redirect ) => (window.location.href = redirect.url))
        .catch(err => {
          const errorText = err && err.responseJSON && err.responseJSON.message || 'Неизвестная ошибка';
          $errorContainer.html(errorText);
        })
    });

    function setBank( bankId ) {
      API.getCompaniesList(getAddress(), bankId).then(companies => {
        console.log(companies);
        appraisalCompanies = companies;
        $evaluatingCompany.setOptions(companies);
      });
    }

    function setPrice() {
      const $price = $("#price");
      const $priceContainer = $(".form__price");
      const appraisalCompanyId = +$evaluatingCompany.getValue();
      const type = $cost.getValue();

      if (!appraisalCompanies || !appraisalCompanyId || !type) {
        $priceContainer.hide();
        return;
      }
      const appraisalCompany = appraisalCompanies.find(c => c.id === +appraisalCompanyId);
      $priceContainer.show();
      $price.html(appraisalCompany.price[type]);
    }

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
        // appraisalCompanyId:  1,
        // objectSalePrice:     +$purchasePrice.getValue().replace(/ /g, ''),
        customerName:        $customerName.getValue(),
        customerPassport:    $customerPassport.getValue(),
        borrowerName:        (customerBorrowerSame ? $customerName : $borrowerName).getValue(),
        // borrowerPassport:    (customerBorrowerSame ? $customerPassport : $borrowerPassport).getValue(),
        // borrowerPhone:       (customerBorrowerSame ? $customerPhone : $borrowerPhone).getValue(),
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
}
