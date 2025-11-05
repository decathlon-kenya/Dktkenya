document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll(".slider-wrapper-vf");

  sliders.forEach((slider) => {
    const imageList = slider.querySelector(".image-list-vf");
    const prevButton = slider.querySelector(".prev-slide-vf");
    const nextButton = slider.querySelector(".next-slide-vf");
    const sliderScrollbar = slider.querySelector(".slider-scrollbar-vf");
    const scrollbarThumb = sliderScrollbar.querySelector(".scrollbar-thumb-vf");

    let maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;
    let scrollAmount = imageList.clientWidth * 0.6;

    nextButton.addEventListener("click", () => {
      imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    prevButton.addEventListener("click", () => {
      imageList.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    let isDragging = false;
    let startX, thumbStartX;

    scrollbarThumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      thumbStartX = scrollbarThumb.offsetLeft;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      let deltaX = e.clientX - startX;
      let newLeft = Math.max(
        0,
        Math.min(sliderScrollbar.clientWidth - scrollbarThumb.clientWidth, thumbStartX + deltaX)
      );
      let scrollPercent = newLeft / (sliderScrollbar.clientWidth - scrollbarThumb.clientWidth);
      imageList.scrollLeft = scrollPercent * maxScrollLeft;
      scrollbarThumb.style.left = `${newLeft}px`;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });

    function updateScrollThumbPosition() {
      let scrollPercent = imageList.scrollLeft / maxScrollLeft;
      scrollbarThumb.style.left = `${scrollPercent * (sliderScrollbar.clientWidth - scrollbarThumb.clientWidth)}px`;
    }

    imageList.addEventListener("scroll", updateScrollThumbPosition);

    function initSlider() {
      maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;
      updateScrollThumbPosition();
    }

    window.addEventListener("resize", initSlider);
    initSlider();
  });
});






document.addEventListener("DOMContentLoaded", () => {
  const deck = document.getElementById('deck');
  let order = Array.from(deck.querySelectorAll('.catdeck__img'));
  const STEP_TIME = 110;                 
  let isAnimating = false;
  let pendingId = null;

  const links = Array.from(document.querySelectorAll('.catdeck__link'));
  const linkById = Object.fromEntries(links.map(a => [a.dataset.img, a]));

  function setActiveById(id) {
    links.forEach(l => l.classList.remove('is-active'));
    const L = linkById[id];
    if (L) L.classList.add('is-active');
  }

  function updateActiveFromTop() {
    const id = order[0]?.dataset.img;
    if (id) setActiveById(id);
  }

  function paint() {
    order.forEach((img, i) => {
      img.classList.remove('is-top', 'is-back-1', 'is-back-2', 'is-hidden');
      if (i === 0) img.classList.add('is-top');
      else if (i === 1) img.classList.add('is-back-1');
      else if (i === 2) img.classList.add('is-back-2');
      else img.classList.add('is-hidden');
      img.style.zIndex = String(order.length - i);
    });
    updateActiveFromTop();
  }

  function rotateForwardOnce() {
    const first = order.shift();
    order.push(first);
    deck.appendChild(first);
    paint();
  }

  function rotateBackwardOnce() {
    const last = order.pop();
    order.unshift(last);
    deck.insertBefore(last, deck.firstChild);
    void last.offsetWidth; 
    paint();
  }

  function stepProcess(steps, direction) {
    if (steps <= 0) {
      isAnimating = false;
      if (pendingId && order[0].dataset.img !== pendingId) startProcess();
      else pendingId = null;
      return;
    }
    if (direction === 'forward') rotateForwardOnce();
    else rotateBackwardOnce();
    setTimeout(() => stepProcess(steps - 1, direction), STEP_TIME);
  }

  function startProcess() {
    if (!pendingId) return;

    const targetEl = Array.from(deck.children).find(el => el.dataset.img === pendingId);
    if (!targetEl) { pendingId = null; return; }

    const idx = order.indexOf(targetEl);
    if (idx === 0) { pendingId = null; return; }

    const forwardSteps  = idx;
    const backwardSteps = order.length - idx;
    const direction = forwardSteps <= backwardSteps ? 'forward' : 'backward';
    const steps = Math.min(forwardSteps, backwardSteps);

    isAnimating = true;
    stepProcess(steps, direction);
  }

  function rotateToId(id) {
    pendingId = id;
    if (!isAnimating) startProcess();
  }

  paint();
  if (links.length) {
    links[0].classList.add('is-active');
  }

  links.forEach(link => {
    const id = link.dataset.img;

    link.addEventListener('mouseenter', () => {
      rotateToId(id);
      setActiveById(id);
    });

    link.addEventListener('focus', () => {
      rotateToId(id);
      setActiveById(id);
    });

    link.addEventListener('click', () => {
      rotateToId(id);
      setActiveById(id);
    });
  });

  let startX = 0;
  let deltaX = 0;
  let dragging = false;
  const SWIPE_THRESHOLD = 40; 

  deck.addEventListener('touchstart', (e) => {
    if (isAnimating) return;
    if (!e.touches || !e.touches.length) return;
    startX = e.touches[0].clientX;
    deltaX = 0;
    dragging = true;
  }, { passive: true });

  deck.addEventListener('touchmove', (e) => {
    if (!dragging || !e.touches || !e.touches.length) return;
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });

  deck.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        rotateForwardOnce();
      } else {
        rotateBackwardOnce();
      }
      updateActiveFromTop(); 
    }

    deltaX = 0;
  });

  deck.addEventListener('click', () => {
    const topId = order[0]?.dataset.img;
    if (topId) setActiveById(topId);
  });
});
