 const LANG_TERMS = {
            en: {
                d: "Days",
                h: "Hrs",
                m: "Min",
                s: "Sec",
            },
        };

        function startCountdown(
            startDateString,
            endDateString,
            elementId,
            wrapperId,
            lang
        ) {
            const startDate = new Date(startDateString).getTime();
            const endDate = new Date(endDateString).getTime();

            const wrapperElement = document.getElementById(wrapperId);
            if (!wrapperElement) return;

            let interval;

            const container = document.getElementById(elementId);
            if (!container) return;

            const pad = (num) => String(num).padStart(2, "0");
            const terms = LANG_TERMS[lang] || LANG_TERMS.en;

            const update = () => {
                const now = Date.now();

                if (now < startDate || now > endDate) {
                    wrapperElement.style.display = "none";
                    clearInterval(interval);
                    return;
                }

                wrapperElement.style.display = "block";

                const distance = endDate - now;

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor(
                    (distance % (1000 * 60)) / 1000
                );

                let html = "";

                if (days > 0) {
                    html += `
                        <span class="time-box">
                            <div class="number">${pad(days)}</div>
                            <div class="label">${terms.d}</div>
                        </span>`;
                }

                if (hours > 0 || days > 0) {
                    html += `
                        <span class="time-box">
                            <div class="number">${pad(hours)}</div>
                            <div class="label">${terms.h}</div>
                        </span>`;
                }

                if (minutes > 0 || hours > 0 || days > 0) {
                    html += `
                        <span class="time-box">
                            <div class="number">${pad(minutes)}</div>
                            <div class="label">${terms.m}</div>
                        </span>`;
                }

                html += `
                    <span class="time-box">
                        <div class="number">${pad(seconds)}</div>
                        <div class="label">${terms.s}</div>
                    </span>`;

                container.innerHTML = html;
            };

            update();
            interval = setInterval(update, 1000);
        }
