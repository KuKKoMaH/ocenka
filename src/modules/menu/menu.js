import Auth from '../../js/Auth';

$('.menu__cabinet').on('click', ( e ) => {
  e.preventDefault();
  Auth.getProfile().then(
    () => (window.location = e.target.href),
    () => Auth.showLoginPopup().then(() => (window.location = e.target.href))
  );
});

const $menu = $('.menu__wrapper');
const activeClass = 'menu__wrapper--active';
const visibleClass = 'menu__wrapper--visible';
$('.menu__hamburger, .menu__close').on('click', () => {
  $menu.hasClass(activeClass)
    ? close()
    : open();
});
$menu.find('a').on('click', close);

function close() {
  $menu.removeClass(activeClass);
  setTimeout(() => $menu.removeClass(visibleClass), 100);
}

function open() {
  $menu.addClass(visibleClass);
  requestAnimationFrame(() => $menu.addClass(activeClass));
}

