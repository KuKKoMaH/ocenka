$('.last__slider').owlCarousel({
  items:      3,
  autoWidth:  true,
  margin:     24,
  dots:       false,
  nav:        true,
  navText:    ['', ''],
  center:     true,
  responsive: {
    768:  {
      items:     3,
      center:    false,
      autoWidth: false,
    },
    992:  {
      items:     4,
      center:    false,
      autoWidth: false,
    },
    1199: {
      items:     5,
      center:    false,
      autoWidth: false,
    }
    // 420:  { items: 2, },
    // 660:  { items: 3, },
  }
});