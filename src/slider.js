var swiper = new Swiper('.swiper', {
        centeredSlides: true,
        loop: true,
        spaceBetween: 20,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + '">' + (index + 1) + '</span>';
            },
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            1280: { slidesPerView: 3 },
            1024: { slidesPerView: 2.6 },
            992: { slidesPerView: 2.2 },
            720: { slidesPerView: 2 },
            599: { slidesPerView: 1.6 },
            500: { slidesPerView: 1.2 },
            0: { slidesPerView: 1 }
        }
    });

    document.querySelector('.nav-button-mobile.prev').addEventListener('click', function () {
        swiper.slidePrev();
    });

    document.querySelector('.nav-button-mobile.next').addEventListener('click', function () {
        swiper.slideNext();
    });

    var playPauseButton = document.getElementById("playPauseButton");
    var isPlaying = true;

    playPauseButton.addEventListener("click", function () {
        if (isPlaying) {
            swiper.autoplay.stop();
            playPauseButton.innerHTML = '<i class="ri-play-line"></i>';
        } else {
            swiper.autoplay.start();
            playPauseButton.innerHTML = '<i class="ri-pause-line"></i>';
        }
        isPlaying = !isPlaying;
    });

    function updateSlideTabindex(swiper) {
        swiper.slides.forEach((slide) => {
            slide.setAttribute('tabindex', '-1');
            slide.querySelectorAll('a, button, input').forEach(el => el.setAttribute('tabindex', '-1'));
        });

        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide) {
            activeSlide.setAttribute('tabindex', '0');
            activeSlide.querySelectorAll('a, button, input').forEach(el => el.setAttribute('tabindex', '0'));
        }
    }

    swiper.on('slideChange', () => {
        updateSlideTabindex(swiper);
    });

    updateSlideTabindex(swiper);

    function cleanUpAriaRolesOnLinks() {
        document.querySelectorAll('.swiper-slide[role="group"]').forEach((slide) => {
            if (slide.tagName.toLowerCase() === 'a') {
                slide.removeAttribute('role');
                slide.removeAttribute('aria-label');
            }
        });
    }

    cleanUpAriaRolesOnLinks();
    swiper.on('slideChange', cleanUpAriaRolesOnLinks);