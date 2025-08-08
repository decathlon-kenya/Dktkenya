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

   // window.onload = function () {
//   document.querySelectorAll('.pages-faq-question').forEach(q => {
//     q.addEventListener('click', () => {
//       const parent = q.parentElement;
//       parent.classList.toggle('active');

//       const icon = q.querySelector('.pages-faq-toggle');
//       if (parent.classList.contains('active')) {
//         icon.textContent = '–';
//       } else {
//         icon.textContent = '+';
//       }
//     });
//   });
// };

