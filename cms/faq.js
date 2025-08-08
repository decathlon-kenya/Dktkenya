const searchInput = document.getElementById("faqSearch");
const faqItems = document.querySelectorAll(".faq-item");
const noResults = document.querySelector(".no-results");

function highlightText(element, query) {
    let text = element.textContent;
    if (!query) {
        element.innerHTML = text;
        return;
    }
    let regex = new RegExp(`(${query})`, "gi");
    element.innerHTML = text.replace(regex, "<mark>$1</mark>");
}

searchInput.addEventListener("input", function() {
    let query = this.value.trim().toLowerCase();
    let matches = 0;

    faqItems.forEach(item => {
        const title = item.querySelector("h3");
        const content = item.querySelector("p");
        const combinedText = (title.textContent + " " + content.textContent).toLowerCase();

        if (combinedText.includes(query)) {
            item.style.display = "block";
            highlightText(title, query);
            highlightText(content, query);
            matches++;
        } else {
            item.style.display = "none";
        }

        if (!query) {
            title.innerHTML = title.textContent;
            content.innerHTML = content.textContent;
        }
    });

    noResults.style.display = matches === 0 && query ? "block" : "none";
});
