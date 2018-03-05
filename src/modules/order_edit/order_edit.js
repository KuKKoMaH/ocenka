import swal from "sweetalert2";
import * as API from '../../js/api';
import Auth from '../../js/Auth';
import { getParam } from "../../js/history";
import loadOrder from '../../js/loadOrder';
import step1 from '../step1/step1';
import docs from '../docs/docs';
import decodeArrayBuffer from "../../js/decodeArrayBuffer";

const $form = $('#order_edit');
if ($form.length) {
  const $editButtons = $('#edit_buttons');
  const $downloadReportButton = $('#download_report');
  const $changeCompanyButton = $('#change_company');
  const $cancelOrderButton = $('#cancel_order');
  const $doneButton = $('#done');

  $downloadReportButton.hide();
  $changeCompanyButton.hide();
  $cancelOrderButton.hide();

  loadOrder(getParam('order')).then(
    (order) => {
      const saveOrder = step1(order);
      docs(order);

      $editButtons.show();
      if (order.status === 'Готово') {
        $downloadReportButton.show().on('click', (e) => {
          e.preventDefault();
          downloadReport(order.id)
        });
      }

      if (order.status === 'Смена оценочной компании') {
        $changeCompanyButton.show().on('click', (e) => {
          e.preventDefault();
          changeCompany(order.id);
        });
      }

      if (order.canBeCancelled) {
        $cancelOrderButton.show().on('click', (e) => {
          e.stopPropagation();
          cancelOrder(order.id);
        });
      }

      $doneButton.on('click', (e) => {
        e.preventDefault();
        const res = saveOrder();
        if (res) res.then(() => window.location.href = '/profile')
      })
    },
    () => {
      $('.form__spinner').hide();
      $('.form__error').show();
    }
  );

  function downloadReport(orderId) {
    const $button = $(e.currentTarget);
    const $progress = $button.find('.progress');
    if ($button.hasClass('active')) return;

    $button.addClass('active');
    require.ensure([], () => {
      const FileSaver = require('file-saver');
      API.getReport(
        orderId,
        Auth.token,
        (e) => $progress.css('width', parseInt(e.loaded / e.total * 100, 10)),
        (request) => {
          console.log(request);
          $button.removeClass('active');
          if (request.status !== 200) {
            const response = JSON.parse(decodeArrayBuffer(request.response));
            return swal({
              type:  'error',
              title: response.error,
            });
          }
          const blob = new Blob([request.response], { type: request.getResponseHeader('content-type') });
          FileSaver.saveAs(blob, `report_${orderId}.docx`);
          //Access-Control-Expose-Headers: Location
        },
      );
    });
  }

  function changeCompany(orderId) {
    API.changeCompany(orderId, Auth.token).then((order) => {
      window.location.href = '/order?order=' + order.id;
    })
  }

  function cancelOrder(orderId) {
    swal({
      type:                'question',
      title:               'Вы действительно хотите отменить заказ?',
      showCancelButton:    true,
      reverseButtons:      true,
      showCloseButton:     true,
      confirmButtonText:   'Отменить',
      cancelButtonText:    'Нет',
      showLoaderOnConfirm: true,
      preConfirm:          () => API.cancelOrder(orderId, Auth.token),
    }).then(result => {
      if (result.value) {
        swal({
          type:  'success',
          title: 'Заказ успешно отменен',
        });
      } else {
        swal({
          type:  'error',
          title: result.err.responseJSON.error,
        });
      }
      loadOrders();
    });
  }
}
