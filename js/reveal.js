// Scroll-reveal utility — plain JS, no React needed.
// Toggles .vis on any .reveal / .reveal-r element once it enters the
// viewport. Styling for these classes lives in css/styles.css.
(function () {
    function init() {
        const targets = document.querySelectorAll('.reveal, .reveal-r');
        if (!targets.length) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('vis');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });

        targets.forEach((el) => io.observe(el));
    }

    document.addEventListener('DOMContentLoaded', init);
})();
