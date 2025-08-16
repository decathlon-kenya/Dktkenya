const blockskeSwiper = new Swiper('.blockske-swiper-container', {
  loop: false,
  slidesPerView: 1.85,
  spaceBetween: 24,
  slidesPerGroup: 2,
  breakpoints: {
    640: {
      slidesPerView: 1.85,
    },
    1024: {
      slidesPerView: 5,
    }
  },
  navigation: {
    nextEl: '.blockske-button-next',
    prevEl: '.blockske-button-prev',
  },
});
