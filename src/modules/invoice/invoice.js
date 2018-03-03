import { getParam } from '../../js/history';
import Auth from '../../js/Auth';

const orderId = getParam('order');
const $invoice = $('#invoice');

if ($invoice.length) {
  $.when(
    Auth.getProfile(),
  ).then((profile) => {
    const invoiceUrl = `/invoice?id=${orderId}`;
    $('.invoice__image').attr('src', invoiceUrl);
    $('#toInvoice').attr('href', invoiceUrl);
    $('#toDocs').on('click', (e) => {
      e.preventDefault();
      window.location.href = `${$('#toDocs').prop('href')}?order=${orderId}`;
    });
    // API.getOrderInvoice(orderId, Auth.token).then(console.log);
  });
}