import swal from 'sweetalert2';
import { getParam } from '../../js/history';
import * as API from '../../js/api';
import Auth from '../../js/Auth';

const types = [
  'TECHNICAL_DOCUMENT',
  'LEGAL_DOCUMENT'
];

export default function processOrder(order) {
  const $form = $('#form-docs');
  const isEdit = $form.data('edit');

  const id = getParam('id');
  const operation = getParam('operation');
  const reference = getParam('reference');
  if (id && operation && reference) API.confirmPayment(id, operation, reference, true, Auth.token);

  $('.form__spinner').hide();
  $('.form__form').show();
  $('.docs__error').html('');

  $form.on('submit', (e) => {
    e.preventDefault();
    // const data = {
    //   id:                 orderId,
    //   legalPersonOwner:   $('#form-legalPersonOwner').prop('checked'),
    //   minorOwner:         $('#form-minorOwner').prop('checked'),
    //   onerousTransaction: $('#form-onerousTransaction').prop('checked')
    // };
    API.createOrder(order.id, Auth.token)
      .then(() => (window.location.href = $form.attr('action')))
      .catch(err => $('.docs__error').html(err.responseJSON.error));
  });

  if (Array.isArray(order.attachedFileList)) {
    types.forEach((type) => {
      const $el = $(`#${type}_LIST`);
      order.attachedFileList.forEach((file) => {
        if (file.fileType !== type) return;
        $el.append(createFile(file));
      });
    });
  }

  require.ensure([], () => {
    require('blueimp-file-upload');

    types.forEach((type) => {
      const $el = $(`#${type}`);
      const $progress = $el.find('.docs__progress');
      const $bar = $el.find('.docs__progressbar');

      $el.find('.docs__input').fileupload({
        url:         `${API_URL}order/${order.id}/file/${type}`,
        headers:     {
          token: Auth.token,
        },
        paramName:   'file',
        submit:      () => {
          $progress.show();
          $bar.css('width', 'auto');
        },
        add:         (e, data) => {
          const file = data.files[0];
          if (file.size > 25 * 1024 * 1024) return swal({
            type:  'error',
            title: 'Размер файла слишком большой. Максимальный размер 25 Мб',
          });

          data.process().then(() => data.submit());
        },
        progressall: (e, data) => {
          const progress = parseInt(data.loaded / data.total * 100, 10);
          $bar.css('width', progress + '%');
        },
        done:        (e, data) => {
          const response = data.result;
          response.files.map(file => $el.append(createFile(file)));
          $progress.hide();
        },
        fail:        (e, data) => {
          $progress.hide();
        }
      });
    });
  });

  function createFile(file) {
    const $el = $(`<div class="docs__item">${file.originalFilename}</div>`);
    if (!isEdit) {
      const $button = $('<button class="docs__delete"></button>');
      $button.on('click', (e) => {
        e.preventDefault();
        API.deleteFile(file.filePath, Auth.token).then(() => $el.remove());
      });
      $el.append($button);
    }
    return $el;
  }
};
