import { getParam } from "../../js/history";
import loadOrder from '../../js/loadOrder';
import docs from '../docs/docs';

const $form = $('#form-docs');
if ($form.length && !$form.data('edit')) {
  const orderId = getParam('order') || getParam('reference');
  loadOrder(orderId).then(
    docs,
    () => {
      $('.form__spinner').hide();
      $('.form__error').show();
    }
  );
}
