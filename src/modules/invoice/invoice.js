import * as API from '../../js/api';
import { getParam } from '../../js/history';
import Auth from '../../js/Auth';

const orderId = getParam('order');
const $invoice = $('#invoice');

if ($invoice.length) {
  $.when(
    Auth.getProfile(),
  ).then(( profile ) => {
    $invoice.on('submit', (e) => {
      e.preventDefault();
      window.location.href = `${$invoice.prop('action')}?order=${orderId}`;
    });
    API.getOrderInvoice(orderId, Auth.token).then(console.log);
  });
}