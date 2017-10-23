const images = [];
const animationQueue = [];
let currentAnimation = null;
const playNext = () => {
  const next = animationQueue.shift();
  if (!next) return;
  play(next);
};
const play = (img, force) => {
  img.played = true;
  if (!force && currentAnimation) {
    animationQueue.push(img);
    return;
  }
  img.$el.find('animate, animateTransform').each((i, animate) => animate.beginElement());
  if (!force) {
    currentAnimation = img;
    setTimeout(() => {
      currentAnimation = null;
      img.complete = true;
      playNext();
    }, 1000);
  }
};
$('.works__image img').each((i, el) => {
  $.get(el.src, (content) => {
    const $img = $(content).find('svg');
    $(el).replaceWith($img);
    const $parent = $img.parents('.works__item');
    const img = { $el: $img, el: $parent[0], played: false, complete: false };

    let stopTimer = null;
    $parent.on('mouseenter', () => {
      if (!img.complete) return;
      play(img, true);
      stopTimer = setTimeout(() => $img[0].pauseAnimations(), 750);
    });
    $parent.on('mouseleave', () => {
      if (!img.complete) return;
      clearTimeout(stopTimer);
      $img[0].unpauseAnimations();
    });

    images.push(img);
  });
});
const isImgInViewport = () => {
  const windowTop = window.pageYOffset;
  const windowBottom = windowTop + window.innerHeight;
  images.forEach((img) => {
    if (img.played) return;
    const top = img.el.offsetTop;
    const bottom = top + img.el.offsetHeight;
    if (windowTop < top && windowBottom > bottom) play(img);
  });
  window.requestAnimationFrame(isImgInViewport);
};
isImgInViewport();