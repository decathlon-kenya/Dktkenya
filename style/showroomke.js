document.addEventListener('DOMContentLoaded', function() {
            /**
             * Initializes a single carousel with its full functionality.
             * @param {HTMLElement} container The root container element for the carousel.
             */
            function initializeCarousel(container) {
                const productCarousel = container.querySelector('.showroomke-product-carousel');
                const productGrid = container.querySelector('.showroomke-product-grid');
                const nextButton = container.querySelector('.showroomke-next-button');
                const prevButton = container.querySelector('.showroomke-prev-button');
                const scrollTrackContainer = container.querySelector('.showroomke-scroll-track-container');
                const scrollTrack = container.querySelector('.showroomke-scroll-track');
                const scrollThumb = container.querySelector('.showroomke-scroll-thumb');

                if (!productCarousel || !productGrid) {
                    console.error("Carousel elements not found in container.");
                    return;
                }

                let currentPosition = 0;
                let isDragging = false;
                let startX;
                let prevTranslate = 0;
                let draggedDistance = 0;
                const dragThreshold = 5;

                let isDraggingThumb = false;
                let startThumbX;
                let startThumbPosition;

                /**
                 * Dynamically updates the visibility and content of badges based on product data.
                 */
                function updateBadges() {
                    container.querySelectorAll('.showroomke-product-card').forEach(card => {
                        const stickerText = card.dataset.stickerText;
                        const discountPercentage = card.dataset.discountPercentage;
                        const imageBadgesWrapper = card.querySelector('.showroomke-image-badges-wrapper');
                        const priceDiscountTextElement = card.querySelector('.showroomke-price-discount-text');

                        imageBadgesWrapper.innerHTML = '';

                        if (priceDiscountTextElement) {
                            priceDiscountTextElement.style.display = 'none';
                        }

                        if (stickerText) {
                            const stickerBadge = document.createElement('span');
                            stickerBadge.classList.add('showroomke-sticker-badge');
                            stickerBadge.textContent = stickerText;
                            imageBadgesWrapper.appendChild(stickerBadge);

                            if (priceDiscountTextElement && discountPercentage) {
                                priceDiscountTextElement.style.display = 'inline-block';
                            }
                        } else if (discountPercentage) {
                            const topDiscountBadge = document.createElement('span');
                            topDiscountBadge.classList.add('showroomke-top-discount-badge');
                            topDiscountBadge.textContent = discountPercentage;
                            imageBadgesWrapper.appendChild(topDiscountBadge);
                        }
                    });
                }
                
                /**
                 * Calculates the width of a single product card including its gap.
                 * @returns {number} The effective width of one product card.
                 */
                function getProductCardWidth() {
                    const firstCard = productGrid.querySelector('.showroomke-product-card');
                    if (!firstCard) return 0;
                    const cardWidth = firstCard.offsetWidth;
                    const gap = parseFloat(getComputedStyle(productGrid).gap);
                    return cardWidth + gap;
                }

                /**
                 * Updates the disabled state of the carousel navigation buttons.
                 */
                function updateButtons() {
                    const maxPosition = productGrid.scrollWidth - productCarousel.clientWidth;
                    prevButton.disabled = currentPosition <= 0;
                    nextButton.disabled = currentPosition >= maxPosition;
                }

                /**
                 * Translates the product grid to the new position.
                 * @param {number} position - The new scroll position in pixels.
                 */
                function translateGrid(position) {
                    productGrid.style.transform = `translateX(-${position}px)`;
                }

                /**
                 * Updates the position and size of the custom scroll thumb.
                 */
                function updateScrollThumb() {
                    const carouselClientWidth = productCarousel.clientWidth;
                    const gridScrollWidth = productGrid.scrollWidth;
                    const trackClientWidth = scrollTrack.clientWidth;

                    if (gridScrollWidth <= carouselClientWidth) {
                        scrollTrackContainer.style.display = 'none';
                        return;
                    } else {
                        if (window.innerWidth <= 768) {
                            scrollTrackContainer.style.display = 'flex';
                        } else {
                            scrollTrackContainer.style.display = 'none';
                        }
                    }

                    const maxScroll = gridScrollWidth - carouselClientWidth;
                    let thumbWidth = (carouselClientWidth / gridScrollWidth) * trackClientWidth;
                    thumbWidth = Math.max(thumbWidth, 20);

                    let thumbPosition = (currentPosition / maxScroll) * (trackClientWidth - thumbWidth);
                    if (isNaN(thumbPosition)) thumbPosition = 0;

                    scrollThumb.style.width = `${thumbWidth}px`;
                    scrollThumb.style.left = `${thumbPosition}px`;
                }

                // Event listeners for navigation buttons
                nextButton.addEventListener('click', function() {
                    const cardWidth = getProductCardWidth();
                    currentPosition += cardWidth;
                    const maxPosition = productGrid.scrollWidth - productCarousel.clientWidth;
                    if (currentPosition > maxPosition) {
                        currentPosition = maxPosition;
                    }
                    translateGrid(currentPosition);
                    updateButtons();
                    updateScrollThumb();
                });

                prevButton.addEventListener('click', function() {
                    const cardWidth = getProductCardWidth();
                    currentPosition -= cardWidth;
                    if (currentPosition < 0) {
                        currentPosition = 0;
                    }
                    translateGrid(currentPosition);
                    updateButtons();
                    updateScrollThumb();
                });

                // Event listeners for touch swiping on the product grid
                productGrid.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    isDragging = true;
                    productGrid.style.transition = 'none';
                    productGrid.classList.add('is-dragging');
                    draggedDistance = 0;
                    prevTranslate = currentPosition;
                });

                productGrid.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    const currentX = e.touches[0].clientX;
                    const deltaX = currentX - startX;
                    let currentTranslate = prevTranslate - deltaX;
                    draggedDistance = Math.abs(deltaX);

                    const maxScroll = productGrid.scrollWidth - productCarousel.clientWidth;
                    if (currentTranslate < 0) {
                        currentTranslate = 0;
                    } else if (currentTranslate > maxScroll) {
                        currentTranslate = maxScroll;
                    }
                    
                    translateGrid(currentTranslate);
                    currentPosition = currentTranslate;
                    updateScrollThumb();
                });

                productGrid.addEventListener('touchend', (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    productGrid.style.transition = 'transform 0.5s ease-in-out';
                    productGrid.classList.remove('is-dragging');

                    if (draggedDistance > dragThreshold) {
                        e.preventDefault();
                    }

                    const cardWidth = getProductCardWidth();
                    const targetCardIndex = Math.round(currentPosition / cardWidth);
                    let newPosition = targetCardIndex * cardWidth;

                    const maxPosition = productGrid.scrollWidth - productCarousel.clientWidth;
                    newPosition = Math.max(0, Math.min(newPosition, maxPosition));
                    currentPosition = newPosition;
                    translateGrid(currentPosition);
                    updateButtons();
                    updateScrollThumb();
                });

                // Event listeners for mouse dragging on the product grid
                let isMouseDown = false;

                productGrid.addEventListener('mousedown', (e) => {
                    isMouseDown = true;
                    startX = e.clientX;
                    prevTranslate = currentPosition;
                    productGrid.style.transition = 'none';
                    productGrid.classList.add('is-dragging');
                    draggedDistance = 0;
                    e.preventDefault();
                });

                document.addEventListener('mousemove', (e) => {
                    if (!isMouseDown) return;
                    const currentX = e.clientX;
                    const deltaX = currentX - startX;
                    let currentTranslate = prevTranslate - deltaX;
                    draggedDistance = Math.abs(deltaX);

                    const maxScroll = productGrid.scrollWidth - productCarousel.clientWidth;
                    currentTranslate = Math.max(0, Math.min(currentTranslate, maxScroll));

                    translateGrid(currentTranslate);
                    currentPosition = currentTranslate;
                    updateScrollThumb();
                });

                document.addEventListener('mouseup', (e) => {
                    if (!isMouseDown) return;
                    isMouseDown = false;
                    productGrid.style.transition = 'transform 0.5s ease-in-out';
                    productGrid.classList.remove('is-dragging');

                    if (draggedDistance > dragThreshold) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    const cardWidth = getProductCardWidth();
                    const targetCardIndex = Math.round(currentPosition / cardWidth);
                    let newPosition = targetCardIndex * cardWidth;

                    const maxPosition = productGrid.scrollWidth - productCarousel.clientWidth;
                    newPosition = Math.max(0, Math.min(newPosition, maxPosition));
                    currentPosition = newPosition;
                    translateGrid(currentPosition);
                    updateButtons();
                    updateScrollThumb();
                });
                
                // Event listeners for custom scroll thumb dragging
                scrollThumb.addEventListener('mousedown', (e) => {
                    isDraggingThumb = true;
                    startThumbX = e.clientX;
                    startThumbPosition = scrollThumb.offsetLeft;
                    productGrid.style.transition = 'none';
                    e.preventDefault();
                });

                scrollThumb.addEventListener('touchstart', (e) => {
                    isDraggingThumb = true;
                    startThumbX = e.touches[0].clientX;
                    startThumbPosition = scrollThumb.offsetLeft;
                    productGrid.style.transition = 'none';
                    e.preventDefault();
                }, { passive: false });

                document.addEventListener('mousemove', (e) => {
                    if (!isDraggingThumb) return;
                    const currentX = e.clientX;
                    const deltaX = currentX - startThumbX;
                    
                    let newThumbLeft = startThumbPosition + deltaX;
                    const maxThumbLeft = scrollTrack.clientWidth - scrollThumb.offsetWidth;
                    newThumbLeft = Math.max(0, Math.min(newThumbLeft, maxThumbLeft));

                    scrollThumb.style.left = `${newThumbLeft}px`;

                    const scrollRatio = newThumbLeft / maxThumbLeft;
                    const maxCarouselScroll = productGrid.scrollWidth - productCarousel.clientWidth;
                    currentPosition = scrollRatio * maxCarouselScroll;
                    
                    translateGrid(currentPosition);
                    updateButtons();
                });

                document.addEventListener('touchmove', (e) => {
                    if (!isDraggingThumb) return;
                    const currentX = e.touches[0].clientX;
                    const deltaX = currentX - startThumbX;
                    
                    let newThumbLeft = startThumbPosition + deltaX;
                    const maxThumbLeft = scrollTrack.clientWidth - scrollThumb.offsetWidth;
                    newThumbLeft = Math.max(0, Math.min(newThumbLeft, maxThumbLeft));

                    scrollThumb.style.left = `${newThumbLeft}px`;

                    const scrollRatio = newThumbLeft / maxThumbLeft;
                    const maxCarouselScroll = productGrid.scrollWidth - productCarousel.clientWidth;
                    currentPosition = scrollRatio * maxCarouselScroll;
                    
                    translateGrid(currentPosition);
                    updateButtons();
                    e.preventDefault();
                }, { passive: false });

                const endDragging = () => {
                    if (isDraggingThumb) {
                        isDraggingThumb = false;
                        productGrid.style.transition = 'transform 0.5s ease-in-out';
                        updateButtons();
                        updateScrollThumb();
                    }
                    if (isMouseDown) {
                         isMouseDown = false;
                    }
                };

                document.addEventListener('mouseup', endDragging);
                document.addEventListener('touchend', endDragging);
                document.addEventListener('touchcancel', endDragging);

                // Prevent navigation on click after drag
                productGrid.addEventListener('click', function(e) {
                    if (draggedDistance > dragThreshold) {
                        e.preventDefault();
                    }
                }, true);

                // Add to cart button stop propagation
                container.querySelectorAll('.showroomke-add-to-cart-button').forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.stopPropagation();
                        console.log('Add to cart clicked!');
                    });
                });

                // Initial setup and resize event listener
                updateBadges();
                updateButtons();
                updateScrollThumb();

                window.addEventListener('resize', () => {
                    currentPosition = 0;
                    translateGrid(currentPosition);
                    updateButtons();
                    updateScrollThumb();
                });
            }

            // Find all carousel containers and initialize each one
            document.querySelectorAll('.showroomke-container').forEach(container => {
                initializeCarousel(container);
            });
        });
