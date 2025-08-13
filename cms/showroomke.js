const showroomkeAlgoliaDetails = {
    app_id: 'V7XWM1B0JY',
    api_search_key: "fa9245e29a66b9d137778d796c557a96",
    index_name: "prod_en",
};

document.addEventListener("alpine:init", () => {
    Alpine.data("products", () => ({
        products: [],
        campaignText: '',
        showroomkeUpdateImageUrl(url) {
            const newParams = "format=auto&quality=40&f=400x0";
            if (url && url.indexOf("?") > -1) {
                const urlParts = url.split("?");
                return `${urlParts[0]}?${newParams}`;
            } else {
                return url;
            }
        },
        showroomkeGetProductsManual(productsArr) {
            const clientAlg = algoliasearch(
                showroomkeAlgoliaDetails.app_id,
                showroomkeAlgoliaDetails.api_search_key
            );
            const indexAlg = clientAlg.initIndex(showroomkeAlgoliaDetails.index_name);
            const filters = productsArr.map(id => `objectID:${id}`).join(' OR ');

            indexAlg.search('', { filters: filters })
                .then(({ hits }) => {
                    const orderedHits = productsArr.map(id => hits.find(hit => hit.objectID === id));
                    this.products = orderedHits.filter(Boolean);
                    // Dispatch event to initialize carousel logic after products are loaded
                    document.dispatchEvent(new CustomEvent('showroomke:products-loaded'));
                })
                .catch(err => {
                    console.error('Algolia Error:', err);
                });
        },
    }));
});

// Standalone script for the generic loader animation
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('showroomke-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// Carousel initialization logic, now triggered by a custom event
document.addEventListener('showroomke:products-loaded', function showroomkeInitCarousel() {
    const showroomkeProductCarousel = document.querySelector('.showroomke-product-carousel');
    const showroomkeProductGrid = document.querySelector('.showroomke-product-grid');
    const showroomkeNextButton = document.querySelector('.showroomke-next-button');
    const showroomkePrevButton = document.querySelector('.showroomke-prev-button');
    const showroomkeScrollTrack = document.querySelector('.showroomke-scroll-track');
    const showroomkeScrollThumb = document.querySelector('.showroomke-scroll-thumb');
    
    let showroomkeCurrentPosition = 0;
    let showroomkeStartX;
    let showroomkeIsDragging = false;
    let showroomkeCurrentTranslate;
    let showroomkePrevTranslate = 0;
    let showroomkeIsDraggingThumb = false;
    let showroomkeStartThumbX;
    let showroomkeStartThumbPosition;
    let showroomkeDraggedDistance = 0;
    const showroomkeDragThreshold = 5;

    function showroomkeGetProductCardWidth() {
        if (!showroomkeProductGrid) return 0;
        const firstCard = showroomkeProductGrid.querySelector('.showroomke-product-card');
        if (!firstCard) return 0;
        const cardWidth = firstCard.offsetWidth;
        const gap = parseFloat(getComputedStyle(showroomkeProductGrid).gap);
        return cardWidth + gap;
    }

    function showroomkeUpdateButtons() {
        if (!showroomkePrevButton || !showroomkeNextButton || !showroomkeProductGrid || !showroomkeProductCarousel) return;
        showroomkePrevButton.disabled = showroomkeCurrentPosition <= 0;
        const maxPosition = showroomkeProductGrid.scrollWidth - showroomkeProductCarousel.clientWidth;
        showroomkeNextButton.disabled = showroomkeCurrentPosition >= maxPosition;
    }

    function showroomkeTranslateGrid(position) {
        if (!showroomkeProductGrid) return;
        showroomkeProductGrid.style.transform = `translateX(-${position}px)`;
    }

    function showroomkeUpdateScrollThumb() {
        if (!showroomkeScrollTrack || !showroomkeProductGrid || !showroomkeProductCarousel || !showroomkeScrollThumb) return;
        const carouselClientWidth = showroomkeProductCarousel.clientWidth;
        const gridScrollWidth = showroomkeProductGrid.scrollWidth;
        const trackClientWidth = showroomkeScrollTrack.clientWidth;

        if (gridScrollWidth <= carouselClientWidth) {
            showroomkeScrollTrack.style.display = 'none';
            return;
        } else {
            showroomkeScrollTrack.style.display = 'block';
        }

        const maxScroll = gridScrollWidth - carouselClientWidth;
        let thumbWidth = (carouselClientWidth / gridScrollWidth) * trackClientWidth;
        thumbWidth = Math.max(thumbWidth, 20);

        let thumbPosition = (showroomkeCurrentPosition / maxScroll) * (trackClientWidth - thumbWidth);
        if (isNaN(thumbPosition)) thumbPosition = 0;

        showroomkeScrollThumb.style.width = `${thumbWidth}px`;
        showroomkeScrollThumb.style.left = `${thumbPosition}px`;
    }

    if(showroomkeNextButton) {
        showroomkeNextButton.addEventListener('click', function showroomkeNextClick() {
            const cardWidth = showroomkeGetProductCardWidth();
            showroomkeCurrentPosition += cardWidth;
            const maxPosition = showroomkeProductGrid.scrollWidth - showroomkeProductCarousel.clientWidth;
            if (showroomkeCurrentPosition > maxPosition) {
                showroomkeCurrentPosition = maxPosition;
            }
            showroomkeTranslateGrid(showroomkeCurrentPosition);
            showroomkeUpdateButtons();
            showroomkeUpdateScrollThumb();
        });
    }

    if(showroomkePrevButton) {
        showroomkePrevButton.addEventListener('click', function showroomkePrevClick() {
            const cardWidth = showroomkeGetProductCardWidth();
            showroomkeCurrentPosition -= cardWidth;
            if (showroomkeCurrentPosition < 0) {
                showroomkeCurrentPosition = 0;
            }
            showroomkeTranslateGrid(showroomkeCurrentPosition);
            showroomkeUpdateButtons();
            showroomkeUpdateScrollThumb();
        });
    }

    // Unified drag and touch logic
    function showroomkeHandleDragStart(clientX) {
        if (!showroomkeProductGrid) return;
        showroomkeIsDragging = true;
        showroomkeStartX = clientX;
        showroomkePrevTranslate = showroomkeCurrentPosition;
        showroomkeProductGrid.style.transition = 'none';
        showroomkeProductGrid.classList.add('is-dragging');
        showroomkeDraggedDistance = 0;
    }

    function showroomkeHandleDragMove(clientX) {
        if (!showroomkeIsDragging || !showroomkeProductGrid || !showroomkeProductCarousel) return;
        const deltaX = clientX - showroomkeStartX;
        showroomkeCurrentTranslate = showroomkePrevTranslate - deltaX;
        showroomkeDraggedDistance = Math.abs(deltaX);

        const maxScroll = showroomkeProductGrid.scrollWidth - showroomkeProductCarousel.clientWidth;
        if (showroomkeCurrentTranslate < 0) {
            showroomkeCurrentTranslate = 0;
        } else if (showroomkeCurrentTranslate > maxScroll) {
            showroomkeCurrentTranslate = maxScroll;
        }

        showroomkeTranslateGrid(showroomkeCurrentTranslate);
        showroomkeUpdateScrollThumb();
    }

    function showroomkeHandleDragEnd(e) {
        if (!showroomkeIsDragging || !showroomkeProductGrid || !showroomkeProductCarousel) return;
        showroomkeIsDragging = false;
        showroomkeProductGrid.style.transition = 'transform 0.5s ease-in-out';
        showroomkeProductGrid.classList.remove('is-dragging');

        if (showroomkeDraggedDistance > showroomkeDragThreshold) {
            e.preventDefault();
            e.stopPropagation();
        }

        const cardWidth = showroomkeGetProductCardWidth();
        let targetCardIndex = Math.round(showroomkeCurrentTranslate / cardWidth);
        let newPosition = targetCardIndex * cardWidth;

        const maxPosition = showroomkeProductGrid.scrollWidth - showroomkeProductCarousel.clientWidth;
        if (newPosition < 0) newPosition = 0;
        if (newPosition > maxPosition) newPosition = maxPosition;

        showroomkeCurrentPosition = newPosition;
        showroomkeTranslateGrid(showroomkeCurrentPosition);
        showroomkeUpdateButtons();
        showroomkeUpdateScrollThumb();
    }
    
    if (showroomkeProductGrid) {
        showroomkeProductGrid.addEventListener('touchstart', (e) => showroomkeHandleDragStart(e.touches[0].clientX));
        showroomkeProductGrid.addEventListener('touchmove', (e) => showroomkeHandleDragMove(e.touches[0].clientX), { passive: false });
        showroomkeProductGrid.addEventListener('touchend', (e) => showroomkeHandleDragEnd(e));
        showroomkeProductGrid.addEventListener('touchcancel', (e) => showroomkeHandleDragEnd(e));

        showroomkeProductGrid.addEventListener('mousedown', (e) => {
            showroomkeHandleDragStart(e.clientX);
            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', (e) => showroomkeHandleDragMove(e.clientX));
    document.addEventListener('mouseup', (e) => showroomkeHandleDragEnd(e));

    // Drag events for the custom scroll thumb
    function showroomkeHandleThumbDragStart(clientX) {
        if (!showroomkeScrollThumb || !showroomkeProductGrid) return;
        showroomkeIsDraggingThumb = true;
        showroomkeStartThumbX = clientX;
        showroomkeStartThumbPosition = showroomkeScrollThumb.offsetLeft;
        showroomkeProductGrid.style.transition = 'none';
    }

    function showroomkeHandleThumbDragMove(clientX) {
        if (!showroomkeIsDraggingThumb || !showroomkeScrollTrack || !showroomkeProductGrid || !showroomkeProductCarousel || !showroomkeScrollThumb) return;
        const deltaX = clientX - showroomkeStartThumbX;
        let newThumbLeft = showroomkeStartThumbPosition + deltaX;
        const maxThumbLeft = showroomkeScrollTrack.clientWidth - showroomkeScrollThumb.offsetWidth;
        newThumbLeft = Math.max(0, Math.min(newThumbLeft, maxThumbLeft));

        showroomkeScrollThumb.style.left = `${newThumbLeft}px`;

        const scrollRatio = newThumbLeft / maxThumbLeft;
        const maxCarouselScroll = showroomkeProductGrid.scrollWidth - showroomkeProductCarousel.clientWidth;
        showroomkeCurrentPosition = scrollRatio * maxCarouselScroll;
        
        showroomkeTranslateGrid(showroomkeCurrentPosition);
        showroomkeUpdateButtons();
    }

    function showroomkeHandleThumbDragEnd() {
        if (!showroomkeIsDraggingThumb || !showroomkeProductGrid) return;
        showroomkeIsDraggingThumb = false;
        showroomkeProductGrid.style.transition = 'transform 0.5s ease-in-out';
        showroomkeUpdateButtons();
        showroomkeUpdateScrollThumb();
    }

    if (showroomkeScrollThumb) {
        showroomkeScrollThumb.addEventListener('mousedown', (e) => {
            showroomkeHandleThumbDragStart(e.clientX);
            e.preventDefault();
        });
    }
    document.addEventListener('mousemove', (e) => showroomkeHandleThumbDragMove(e.clientX));
    document.addEventListener('mouseup', showroomkeHandleThumbDragEnd);

    if (showroomkeScrollThumb) {
        showroomkeScrollThumb.addEventListener('touchstart', (e) => {
            showroomkeHandleThumbDragStart(e.touches[0].clientX);
            e.preventDefault();
        }, { passive: false });
        showroomkeScrollThumb.addEventListener('touchmove', (e) => {
            showroomkeHandleThumbDragMove(e.touches[0].clientX);
            e.preventDefault();
        }, { passive: false });
        showroomkeScrollThumb.addEventListener('touchend', showroomkeHandleThumbDragEnd);
        showroomkeScrollThumb.addEventListener('touchcancel', showroomkeHandleThumbDragEnd);
    }

    document.querySelectorAll('.showroomke-add-to-cart-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    window.addEventListener('resize', () => {
        showroomkeUpdateButtons();
        showroomkeUpdateScrollThumb();
        if (!showroomkeProductGrid || !showroomkeProductCarousel) return;
        const maxPosition = showroomkeProductGrid.scrollWidth - showroomkeProductCarousel.clientWidth;
        if (showroomkeCurrentPosition > maxPosition) {
            showroomkeCurrentPosition = maxPosition;
            showroomkeTranslateGrid(showroomkeCurrentPosition);
        }
    });
});
