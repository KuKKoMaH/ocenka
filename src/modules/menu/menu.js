import Auth from '../../js/Auth';

$('.menu__cabinet').on('click', ( e ) => {
  console.log(e.target.href);
  e.preventDefault();
  Auth.getProfile().then(
    () => (window.location = e.target.href),
    () => $.magnificPopup.open({
      items: {
        src:  '#popup-register',
        type: 'inline'
      }
    })
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

