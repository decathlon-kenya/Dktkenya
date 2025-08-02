<script>
    function searchFAQs() {
      const query = document.getElementById('pages-searchInput').value.toLowerCase();
      const items = document.querySelectorAll('.pages-faq-item');
      let found = 0;

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
          item.classList.remove('pages-hidden');
          found++;
        } else {
          item.classList.add('pages-hidden');
        }
      });

      document.getElementById('pages-noResults').classList.toggle('pages-hidden', found > 0);
    }

    function scrollSlider(amount) {
      const slider = document.getElementById('pages-slider');
      slider.scrollBy({ left: amount, behavior: 'smooth' });
    }

    // Auto-scroll on mobile
    const slider = document.getElementById('pages-slider');
    let scrollAmount = 0;
    setInterval(() => {
      if (window.innerWidth <= 768) {
        scrollAmount += 250;
        if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
          scrollAmount = 0;
        }
        slider.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3000);

    // FAQ toggle
    document.querySelectorAll('.pages-faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const parent = q.parentElement;
        parent.classList.toggle('active');
      });
    });
  </script>
