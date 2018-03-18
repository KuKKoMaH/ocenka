import swal from 'sweetalert2';
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
    API.getOrderInvoice(orderId, Auth.token).then(request => {
      const contentDisposition = request.getResponseHeader('content-disposition');
      const fileName = contentDisposition ? contentDisposition.split('=')[1] : `invoice_${orderId}.png`;

      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(request.response);

      $('.invoice__image').attr('src', imageUrl);
      $('#toInvoice').attr('href', imageUrl);
      $('#toInvoice').attr('download', fileName);

      // $('#toInvoice').on('click', (e) => {
      //   e.preventDefault();

      // window.open($('.invoice__image')[0].src, '_blank');

      // var w = window.open("");
      // w.document.write($('.invoice__image')[0].outerHTML);
      // });

    });

    const isEdit = getParam('edit') === 'true';
    if(isEdit) {
      $('#toOrder').show();
    }else {
      $('#toDocs').show();
      $('#toDone').show();
    }

    $('#toDone').on('click', (e) => {
      e.preventDefault();
      const $button = $(e.currentTarget);
      API.createOrder(orderId, Auth.token)
        .then(() => (window.location.href = `${$button.prop('href')}?order=${orderId}`))
        .catch(err => swal({
          type:  'error',
          title: err.responseJSON.error,
        }));
    });

    $('#toDocs, #toOrder').on('click', (e) => {
      e.preventDefault();
      const $button = $(e.currentTarget);
      window.location.href = `${$button.prop('href')}?order=${orderId}`;
    });
  }
}