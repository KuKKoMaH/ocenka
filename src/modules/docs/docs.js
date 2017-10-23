import { getParam } from '../../js/history';
import { getOrder, confirmOrder, confirmPayment, deleteFile } from '../../js/api';
import Auth from '../../js/Auth';

const $form = $('#form-docs');
const types = [
  'TECHNICAL_DOCUMENT',
  'LEGAL_DOCUMENT'
];

if ($form.length) {
  const orderId = getParam('order');

  getOrder(orderId, Auth.token).then((order) => {
    confirmPayment(orderId, getParam('orderId'), getParam('q'), true, Auth.token);

    $('.form__form').show();

    $form.on('submit', (e) => {
      e.preventDefault();
      const data = {
        legalPersonOwner:   $('#form-legalPersonOwner').prop('checked'),
        minorOwner:         $('#form-minorOwner').prop('checked'),
        onerousTransaction: $('#form-onerousTransaction').prop('checked')
      };
      confirmOrder(orderId, data, Auth.token)
        .then(() => (window.location.href = $form.attr('action')))
    });

    if (Array.isArray(order.attachedFileList)) {
      types.forEach((type) => {
        const $el = $(`#${type}`);
        order.attachedFileList.forEach((file) => {
          if (file.fileType !== type) return;
          $el.append(createFile(file));
        });
      });
    }
  })
    .catch(() => $('.form__error').show())
    .always(() => $('.form__spinner').hide());

  require.ensure([], () => {
    require('blueimp-file-upload');

    types.forEach((type) => {
      const $el = $(`#${type}`);

      $el.find('.docs__input').fileupload({
        url:       `${API_URL}order/${orderId}/file/${type}`,
        headers:   {
          token: Auth.token,
        },
        paramName: 'file',
        done:      (e, data) => {
          const response = data.result;
          response.files.map(file => $el.append(createFile(file)));
        },
      });

    });
  });

  function createFile (file) {
    const $button = $('<button class="docs__delete"></button>');
    const $el = $(`<div class="docs__item">${file.originalFilename}</div>`);
    $button.on('click', (e) => {
      e.preventDefault();
      deleteFile(file.filePath, Auth.token).then(() => $el.remove());
    });
    $el.append($button);
    return $el;
  }
}
