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

// You can still use window.onload to attach other scripts if needed
window.onload = function () {
  // No toggle behavior added here
};
