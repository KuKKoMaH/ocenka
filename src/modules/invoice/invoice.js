import { getParam } from '../../js/history';
import * as API from '../../js/api';
import Auth from '../../js/Auth';

const orderId = getParam('order');
const $invoice = $('#invoice');

if ($invoice.length) {
  Auth.getProfile()
    .then(getInvoice)
    .catch(() => {
      Auth.showLoginPopup().then(
        getInvoice,
        () => (window.location = '.')
      );
    });

  function getInvoice() {
    API.getOrderInvoice(orderId, Auth.token).then(resp => {
      console.log(resp);

      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(resp.response);
      $('.invoice__image').attr('src', imageUrl);
      $('#toInvoice').attr('download', `invoice_${orderId}.png`);
      $('#toInvoice').attr('href', imageUrl);
    });

    $('#toDocs').on('click', (e) => {
      e.preventDefault();
      window.location.href = `${$('#toDocs').prop('href')}?order=${orderId}`;
    });
  }
}