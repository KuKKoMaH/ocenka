import 'jquery';
import SmoothScroll from 'smooth-scroll';
import 'owl.carousel';
import 'magnific-popup/dist/jquery.magnific-popup.js';
import 'jquery.maskedinput/src/jquery.maskedinput';

import './js/$.debounce';
import './modules/header/header';
import './modules/menu/menu';
import './modules/invoice/invoice';
// import './modules/works/works';
import './modules/last/last';
import './modules/step1/step1';
import './modules/docs/docs';
import './modules/registry/registry';
import './modules/profile/profile';
import './modules/partners-slider/partners-slider';
import './modules/register/register';
import './modules/popup-login/popup-login';
import './modules/popup-confirm/popup-confirm';
import './modules/form/form';
import './modules/order_step1/order_step1';
import './modules/order_step3/order_step3';
import './modules/order_edit/order_edit';

// $('input[type="phone"]').mask("+7 (999) 999-99-99");
new SmoothScroll('a[href*="#"]');

window.onpageshow = function(event) {
  if (event.persisted) {
    window.location.reload()
  }
};