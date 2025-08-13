document.addEventListener("alpine:init", () => {
    Alpine.data("products", () => ({
        products: [],
        campaignText: '',
        showroomkeUpdateImageUrl(url) {
            const newParams = "format=auto&quality=40&f=400x0";
            if (url && url.indexOf("?") > -1) {
                const urlParts = url.split("?");
                return `${urlParts[0]}?${newParams}`;
            } else return url;
        },
        showroomkeGetProductsManual(productsArr) {
            const clientAlg = algoliasearch(
                'V7XWM1B0JY',
                'fa9245e29a66b9d137778d796c557a96'
            );
            const indexAlg = clientAlg.initIndex("prod_en");
            const filters = productsArr.map(id => `objectID:${id}`).join(' OR ');

            indexAlg.search('', { filters: filters })
                .then(({ hits }) => {
                    const orderedHits = productsArr.map(id => hits.find(hit => hit.objectID === id));
                    this.products = orderedHits.filter(Boolean);
                    document.dispatchEvent(new CustomEvent('showroomke:products-loaded'));
                })
                .catch(err => console.error('Algolia Error:', err));
        },
    }));
});

document.addEventListener('showroomke:products-loaded', () => {
    const carousels = document.querySelectorAll('.showroomke-product-carousel');

    carousels.forEach(carousel => {
        const container = carousel.closest('.showroomke-container');
        const productGrid = carousel.querySelector('.showroomke-product-grid');
        const nextButton = container.querySelector('.showroomke-next-button');
        const prevButton = container.querySelector('.showroomke-prev-button');
        const scrollTrack = container.querySelector('.showroomke-scroll-track');
        const scrollThumb = container.querySelector('.showroomke-scroll-thumb');

        if (!productGrid) return;

        let currentPosition = 0;
        let startX, isDragging = false, currentTranslate, prevTranslate = 0;
        let isDraggingThumb = false, startThumbX, startThumbPosition, draggedDistance = 0;
        const dragThreshold = 5;

        function getProductCardWidth() {
            const firstCard = productGrid.querySelector('.showroomke-product-card');
            if (!firstCard) return 0;
            const gap = parseFloat(getComputedStyle(productGrid).gap);
            return firstCard.offsetWidth + gap;
        }

        function updateButtons() {
            if (!prevButton || !nextButton) return;
            prevButton.disabled = currentPosition <= 0;
            const maxPosition = productGrid.scrollWidth - carousel.clientWidth;
            nextButton.disabled = currentPosition >= maxPosition;
        }

        function translateGrid(position) {
            productGrid.style.transform = `translateX(-${position}px)`;
        }

        function updateScrollThumb() {
            if (!scrollTrack || !scrollThumb) return;
            const carouselWidth = carousel.clientWidth;
            const gridWidth = productGrid.scrollWidth;
            const trackWidth = scrollTrack.clientWidth;

            if (gridWidth <= carouselWidth) {
                scrollTrack.style.display = 'none';
                return;
            } else scrollTrack.style.display = 'block';

            let thumbWidth = (carouselWidth / gridWidth) * trackWidth;
            thumbWidth = Math.max(thumbWidth, 20);

            let thumbPosition = (currentPosition / (gridWidth - carouselWidth)) * (trackWidth - thumbWidth);
            if (isNaN(thumbPosition)) thumbPosition = 0;

            scrollThumb.style.width = `${thumbWidth}px`;
            scrollThumb.style.left = `${thumbPosition}px`;
        }

        // Buttons
        if(nextButton) nextButton.addEventListener('click', () => {
            currentPosition += getProductCardWidth();
            const maxPosition = productGrid.scrollWidth - carousel.clientWidth;
            if(currentPosition > maxPosition) currentPosition = maxPosition;
            translateGrid(currentPosition);
            updateButtons();
            updateScrollThumb();
        });

        if(prevButton) prevButton.addEventListener('click', () => {
            currentPosition -= getProductCardWidth();
            if(currentPosition < 0) currentPosition = 0;
            translateGrid(currentPosition);
            updateButtons();
            updateScrollThumb();
        });

        // Grid drag
        function handleDragStart(clientX) {
            isDragging = true;
            startX = clientX;
            prevTranslate = currentPosition;
            productGrid.style.transition = 'none';
            productGrid.classList.add('is-dragging');
            draggedDistance = 0;
        }
        function handleDragMove(clientX) {
            if(!isDragging) return;
            const deltaX = clientX - startX;
            currentTranslate = prevTranslate - deltaX;
            draggedDistance = Math.abs(deltaX);

            const maxScroll = productGrid.scrollWidth - carousel.clientWidth;
            if(currentTranslate < 0) currentTranslate = 0;
            else if(currentTranslate > maxScroll) currentTranslate = maxScroll;

            translateGrid(currentTranslate);
            updateScrollThumb();
        }
        function handleDragEnd() {
            if(!isDragging) return;
            isDragging = false;
            productGrid.style.transition = 'transform 0.5s ease-in-out';
            productGrid.classList.remove('is-dragging');

            const cardWidth = getProductCardWidth();
            let targetCardIndex = Math.round(currentTranslate / cardWidth);
            let newPosition = targetCardIndex * cardWidth;

            const maxPosition = productGrid.scrollWidth - carousel.clientWidth;
            if(newPosition < 0) newPosition = 0;
            if(newPosition > maxPosition) newPosition = maxPosition;

            currentPosition = newPosition;
            translateGrid(currentPosition);
            updateButtons();
            updateScrollThumb();
        }

        productGrid.addEventListener('mousedown', e => { handleDragStart(e.clientX); e.preventDefault(); });
        productGrid.addEventListener('touchstart', e => handleDragStart(e.touches[0].clientX));
        document.addEventListener('mousemove', e => handleDragMove(e.clientX));
        document.addEventListener('mouseup', handleDragEnd);
        productGrid.addEventListener('touchmove', e => handleDragMove(e.touches[0].clientX), { passive: false });
        productGrid.addEventListener('touchend', handleDragEnd);
        productGrid.addEventListener('touchcancel', handleDragEnd);

        // Thumb drag
        if(scrollThumb) {
            function handleThumbDragStart(clientX) {
                isDraggingThumb = true;
                startThumbX = clientX;
                startThumbPosition = scrollThumb.offsetLeft;
                productGrid.style.transition = 'none';
            }
            function handleThumbDragMove(clientX) {
                if(!isDraggingThumb) return;
                const deltaX = clientX - startThumbX;
                let newThumbLeft = startThumbPosition + deltaX;
                const maxThumbLeft = scrollTrack.clientWidth - scrollThumb.offsetWidth;
                newThumbLeft = Math.max(0, Math.min(newThumbLeft, maxThumbLeft));

                scrollThumb.style.left = `${newThumbLeft}px`;

                const scrollRatio = newThumbLeft / maxThumbLeft;
                const maxCarouselScroll = productGrid.scrollWidth - carousel.clientWidth;
                currentPosition = scrollRatio * maxCarouselScroll;
                translateGrid(currentPosition);
                updateButtons();
            }
            function handleThumbDragEnd() {
                if(!isDraggingThumb) return;
                isDraggingThumb = false;
                productGrid.style.transition = 'transform 0.5s ease-in-out';
                updateButtons();
                updateScrollThumb();
            }

            scrollThumb.addEventListener('mousedown', e => { handleThumbDragStart(e.clientX); e.preventDefault(); });
            scrollThumb.addEventListener('touchstart', e => { handleThumbDragStart(e.touches[0].clientX); e.preventDefault(); }, { passive:false });
            document.addEventListener('mousemove', e => handleThumbDragMove(e.clientX));
            document.addEventListener('mouseup', handleThumbDragEnd);
            scrollThumb.addEventListener('touchmove', e => { handleThumbDragMove(e.touches[0].clientX); e.preventDefault(); }, { passive:false });
            scrollThumb.addEventListener('touchend', handleThumbDragEnd);
            scrollThumb.addEventListener('touchcancel', handleThumbDragEnd);
        }

        updateButtons();
        updateScrollThumb();

        window.addEventListener('resize', () => {
            updateButtons();
            updateScrollThumb();
            const maxPosition = productGrid.scrollWidth - carousel.clientWidth;
            if(currentPosition > maxPosition) {
                currentPosition = maxPosition;
                translateGrid(currentPosition);
            }
        });
    });
});
