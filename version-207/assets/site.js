(function () {
    function bySelector(root, selector) {
        return Array.from(root.querySelectorAll(selector));
    }

    function initNavigation() {
        var header = document.querySelector('[data-site-header]');
        var toggle = document.querySelector('[data-nav-toggle]');

        if (!header || !toggle) {
            return;
        }

        toggle.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    function initHero() {
        bySelector(document, '[data-hero]').forEach(function (hero) {
            var slides = bySelector(hero, '[data-hero-slide]');
            var dots = bySelector(hero, '[data-hero-dot]');
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            if (slides.length <= 1) {
                return;
            }

            function show(index) {
                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    start();
                });
            });

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        });
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initFilters() {
        bySelector(document, '[data-filter-scope]').forEach(function (scope) {
            var cards = bySelector(scope, '[data-movie-card]');
            var search = scope.querySelector('[data-search-box]');
            var filters = bySelector(scope, '[data-filter-field]');
            var empty = scope.querySelector('[data-empty-state]');

            function apply() {
                var keyword = normalize(search ? search.value : '');
                var activeFilters = filters.map(function (field) {
                    return {
                        name: field.getAttribute('data-filter-field'),
                        value: normalize(field.value)
                    };
                });
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search-text'));
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedFilters = activeFilters.every(function (filter) {
                        if (!filter.value) {
                            return true;
                        }

                        return normalize(card.getAttribute('data-' + filter.name)) === filter.value;
                    });
                    var visible = matchedKeyword && matchedFilters;

                    card.style.display = visible ? '' : 'none';

                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visibleCount === 0);
                }
            }

            if (search) {
                search.addEventListener('input', apply);
            }

            filters.forEach(function (field) {
                field.addEventListener('change', apply);
            });

            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
