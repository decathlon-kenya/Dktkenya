function toggleDelivery(menuId, button) {
    const menu = document.getElementById(menuId);
    const isOpen = menu.style.maxHeight;

    // Close all other menus
    document.querySelectorAll('.delivery-menu').forEach((otherMenu) => {
        if (otherMenu !== menu) {
            otherMenu.style.maxHeight = null;
            otherMenu.previousElementSibling.querySelector('i').className = 'ri-add-line';
        }
    });

    // Toggle current menu
    if (isOpen) {
        menu.style.maxHeight = null;
        button.querySelector('i').className = 'ri-add-line';
    } else {
        menu.style.maxHeight = menu.scrollHeight + 'px';
        button.querySelector('i').className = 'ri-subtract-line';
    }
}
