const activeClass = 'form__mark--active';
const $window = $(window);

$('.form__mark')
  .on('mouseenter', (e) => {
    const $el = $(e.delegateTarget);
    const $content = $el.find('.form__mark-content');
    const content = $content[0];
    const pos = content.getClientRects()[0];

    $el.addClass(activeClass);
    if ((pos.left + pos.width) > $window.outerWidth()) {
      $content.css('right', 0);
    }
  })
  .on('mouseleave', (e) => {
    const $el = $(e.delegateTarget);
    const $content = $el.find('.form__mark-content');
    $el.removeClass(activeClass);
    setTimeout(() => $content.css('right', 'auto'), 200);
  });
