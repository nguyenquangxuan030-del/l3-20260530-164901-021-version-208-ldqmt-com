(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initQuerySearch();
        initPlayers();
    });

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = document.body.classList.toggle("mobile-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                var active = i === index;
                slide.classList.toggle("active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, i) {
                var active = i === index;
                dot.classList.toggle("active", active);
                dot.setAttribute("aria-current", active ? "true" : "false");
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (!q) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var category = panel.querySelector("[data-category-filter]");
            var year = panel.querySelector("[data-year-filter]");
            var list = document.querySelector("[data-movie-list]");
            var empty = document.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            if (year) {
                var years = cards.map(function (card) {
                    return card.getAttribute("data-year") || "";
                }).filter(Boolean).filter(function (value, idx, arr) {
                    return arr.indexOf(value) === idx;
                }).sort(function (a, b) {
                    return Number(b) - Number(a);
                });
                years.forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    year.appendChild(option);
                });
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var cat = category ? category.value : "";
                var yr = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var okCategory = !cat || card.getAttribute("data-category") === cat;
                    var okYear = !yr || card.getAttribute("data-year") === yr;
                    var show = okKeyword && okCategory && okYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (category) {
                category.addEventListener("change", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            apply();
        });
    }

    function initPlayers() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        panels.forEach(function (panel) {
            var video = panel.querySelector("video");
            var button = panel.querySelector("[data-play-button]");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var hlsInstance = null;
            var loaded = false;

            function attemptPlay() {
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {});
                }
            }

            function playVideo() {
                if (!stream) {
                    return;
                }
                panel.classList.add("is-playing");
                if (!loaded) {
                    loaded = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                        attemptPlay();
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true });
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
                        attemptPlay();
                    } else {
                        video.src = stream;
                        attemptPlay();
                    }
                    return;
                }
                attemptPlay();
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            panel.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                if (!panel.classList.contains("is-playing")) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                panel.classList.add("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
