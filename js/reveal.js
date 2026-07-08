// Scroll-reveal utility — plain JS, no React needed.
// Toggles .vis on any .reveal / .reveal-r element once it enters the
// viewport. Styling for these classes lives in css/styles.css.
(function () {
    const observed = new WeakSet();
    let io = null;

    function show(el) {
        el.classList.add('vis');
    }

    function observe(el) {
        if (!el || observed.has(el) || el.classList.contains('vis')) return;
        observed.add(el);

        if (!io) {
            show(el);
            return;
        }

        io.observe(el);
    }

    function observeFrom(root) {
        if (!root) return;

        if (root.nodeType === Node.ELEMENT_NODE && root.matches('.reveal, .reveal-r')) {
            observe(root);
        }

        if (typeof root.querySelectorAll === 'function') {
            root.querySelectorAll('.reveal, .reveal-r').forEach(observe);
        }
    }

    function init() {
        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        show(entry.target);
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });
        }

        observeFrom(document);

        // Cards and rows on several pages are injected after initial load.
        // Observe newly added .reveal/.reveal-r nodes so they can animate in.
        const mo = new MutationObserver((records) => {
            records.forEach((record) => {
                record.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        observeFrom(node);
                    }
                });
            });
        });

        if (document.body) {
            mo.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
