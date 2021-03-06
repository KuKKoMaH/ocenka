import swal from 'sweetalert2';
import Input from '../input/input';
import * as API from '../../js/api';
import { getParam } from '../../js/history';
import Auth from '../../js/Auth';

export default function processOrder(order) {
  const $form = $('#form-order');
  const isEdit = $form.data('edit');
  const canChange = order.canChangeOrderForm;

  const id = getParam('id');
  const operation = getParam('operation');
  const reference = getParam('reference');
  const error = getParam('error');
  if (id && operation && reference) {
    if (error) {
      swal({
        type:  'error',
        title: 'Во время оплаты произошла ошибка',
        text:  'Попробуйте еще раз',
      });
    } else {
      swal({
        type:  'success',
        title: 'Оплата успешно принята',
      });

    }
    API.confirmPayment(id, operation, reference, !error, Auth.token);
  }

  let appraisalCompanies = null;
  const $errorContainer = $('.form__response');

  $('.form__spinner').hide();
  $('.form__form').show();

  $('#orderStatus').html(order.status);
  $('#orderPayStatus').html(order.payStatus);
  $('#form-address').val(order.address);
  $('#form-flat').val(order.flatNumber);

  $('#form-customer-name').val(order.customerName);
  $('#form-customer-passport').val(order.customerPassport);

  $('#form-borrower-name').val(order.borrowerName);

  if (order.inspectionDate) $('#form-date').val(order.inspectionDate);
  if (order.inspectionTimeBlock) $('#form-time').val(order.inspectionTimeBlock);
  if (order.inspectionTime) $('#form-customer-inspection-time').val(order.inspectionTime);

  $('#form-comment').val(order.comment);

  if (!canChange) {
    $form.find('input, select, textarea, textarea').attr('disabled', true);
    $('#editInspectionTime').hide();
  } else {
    $('#viewInspectionTime').hide();
  }

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
    onChange:  (value) => {
      if (!value) return $evaluatingCompany.setOptions([]);
      setBank(value);
    }
  });
  const $evaluatingCompany = new Input({
    $el:       $('#form-evaluating-company').parent(),
    type:      'select',
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
  const $borrowerName = new Input({
    $el:         $('#form-borrower-name').parent(),
    type:        'suggestions',
    suggestType: 'NAME',
    validator:   { 'Введите ФИО': val => customerBorrowerSame || !!val },
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
  const $comment = new Input({
    $el:  $('#form-comment').parent(),
    type: 'textarea',
  });

  const fields = [
    $evaluatingCompany,
    $bank,
    $customerName,
    $customerPassport,
    $borrowerName,
    $date,
    $time,
    $comment,
    $cost
  ];

  API.getTypes(Auth.token).then(types => {
    $cost.setOptions(types);
    if (order.realtyType) $cost.setValue(order.realtyType);
  });
  API.getBanksList().then(banks => {
    $bank.setOptions(banks);
    if (banks.length > 1) $('#bank').slideDown();
    if (banks.length === 1) $bank.setValue(banks[0].id);
    if (order.bankId) $bank.setValue(order.bankId);
  });
  if (order.objectType) $cost.setValue(order.objectType);

  if (order.payStatus === 'Оплачено') {
    $('#pay_buttons').hide();
  }

  const $button_pay = $('#form-pay');
  const $bank_bonus = $('#form-paybank');
  const $offer = $('#form-offer');
  const $customerBorrowerSame = $('#form-customer-borrower-same');
  // const $borrower = $('#borrower');

  // $buttons.attr('disabled', !$offer.prop('checked'));
  $button_pay.hide();
  $offer.on('change', () => {
    const isChecked = $offer.prop('checked');
    if (typeof isChecked !== 'boolean') return;
    isChecked
      ? $offer.removeClass('form__error')
      : $offer.addClass('form__error');
  });

  let customerBorrowerSame = null;
  const onChangeCustomerBorrowerSame = () => {
    if (isEdit) return;
    customerBorrowerSame = $customerBorrowerSame.prop('checked');
    if (customerBorrowerSame) {
      $borrowerName.setValue($customerName.getValue());
      $borrowerName.validate();
    }
    $borrowerName.$input.attr('disabled', customerBorrowerSame);

  };
  $customerBorrowerSame.on('change', onChangeCustomerBorrowerSame);
  if (order.customerName === order.borrowerName) $customerBorrowerSame.prop('checked', true);
  onChangeCustomerBorrowerSame();

  setPrice();

  $bank_bonus.on('click', (e) => {
    e.preventDefault();
    const data = collectOrder();
    if (!data) return;

    API.updateDraft(data, Auth.token)
      .then(() => API.payWithInvoice(data.id, Auth.token))
      .then(() => (window.location.href = $bank_bonus.data('link') + '?order=' + data.id + '&edit=' + !!isEdit))
      .catch(err => {
        const errorText = err && err.responseJSON && err.responseJSON.message || 'Неизвестная ошибка';
        $errorContainer.html(errorText);
      })

    // API.updateOrder(data, Auth.token)
    // .then(() => API.getOrderInvoice(data.id, Auth.token))
    // .then(console.log);
  });

  $form.on('submit', (e) => {
    e.preventDefault();
    const appraisalCompany = getAppraisalCompany();
    if (!appraisalCompany || !appraisalCompany.canBePaidByCard) return;

    const data = collectOrder();
    if (!data) return;
    const url = `${$form.prop('action')}`;
    const successUrl = url + '?order=' + order.id;
    const failUrl = window.location.href;

    API.updateDraft(data, Auth.token)
      .then(() => API.payOrder(data.id, successUrl, failUrl, Auth.token))
      .then((redirect) => (window.location.href = redirect.url))
      .catch(err => {
        const errorText = err && err.responseJSON && err.responseJSON.message || 'Неизвестная ошибка';
        $errorContainer.html(errorText);
      })
  });

  return () => {
    const data = collectOrder();
    if (!data) return;

    return API.updateDraft(data, Auth.token).catch(err => {
      const errorText = err && err.responseJSON && err.responseJSON.message || 'Неизвестная ошибка';
      $errorContainer.html(errorText);
    })
  };

  function setBank(bankId) {
    API.getCompaniesList(getAddress(), bankId).then(companies => {
      appraisalCompanies = companies;
      $evaluatingCompany.setOptions(companies);
      if (order.appraisalCompanyId) $evaluatingCompany.setValue(order.appraisalCompanyId);
    });
  }

  function setPrice() {
    const $price = $("#price");
    const $priceContainer = $(".form__price");
    const appraisalCompany = getAppraisalCompany();
    const type = $cost.getValue();
    $button_pay.hide();

    if (!appraisalCompanies || !appraisalCompany || !type) {
      $priceContainer.hide();
      return;
    }
    $priceContainer.show();
    $price.html(appraisalCompany.price[type]);
    if (appraisalCompany.canBePaidByCard) $button_pay.show();
  }

  function getAppraisalCompany() {
    const appraisalCompanyId = +$evaluatingCompany.getValue();
    if (!appraisalCompanyId) return undefined;
    return appraisalCompanies.find(c => c.id === +appraisalCompanyId);
  }

  function collectOrder() {
    const isAccepted = $offer.prop('checked');
    if (typeof isAccepted === 'boolean') isAccepted
      ? $offer.removeClass('form__error')
      : $offer.addClass('form__error');

    fields.forEach(field => field.validate());
    if (fields.some(field => !field.isValid())) return null;
    if (isAccepted === false) return null;

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
