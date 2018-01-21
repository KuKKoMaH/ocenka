import * as API from '../../js/api';
import { getParam } from '../../js/history';
import Auth from '../../js/Auth';

const orderId = getParam('orderId');
const $invoice = $('#invoice');

if ($invoice.length) {
  $.when(
    Auth.getProfile(),
  ).then(( profile ) => {

    API.getOrderInvoice(orderId, Auth.token).then(image => $invoice.attr('src', 'data:image/jpg;base64,' + image));
  });
}