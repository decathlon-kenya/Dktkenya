const allSportsSwiper = new Swiper('.all-sports-swiper-container', {
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
     nextEl: '.all-sports-button-next',
     prevEl: '.all-sports-button-prev',
  },
}); 
