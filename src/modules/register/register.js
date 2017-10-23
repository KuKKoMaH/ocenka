document.addEventListener('wpcf7mailsent', (event) => {
  $.magnificPopup.open({
    items:          {
      src:  '#register-popup',
      type: 'inline'
    },
    closeOnBgClick: false,
    closeBtnInside: false,
  });
});