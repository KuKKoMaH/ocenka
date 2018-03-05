import { getParam } from "../../js/history";
import loadOrder from '../../js/loadOrder';
import step1 from '../step1/step1';

const $form = $('#form-order');
if ($form.length && !$form.data('edit')) {
  loadOrder(getParam('order')).then(
    step1,
    () => {
      $('.form__spinner').hide();
      $('.form__error').show();
    }
  );
}
