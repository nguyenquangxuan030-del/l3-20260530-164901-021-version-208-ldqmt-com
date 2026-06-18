(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHeaderSearch() {
    var toggle = document.querySelector(".search-toggle");
    var box = document.querySelector(".header-search");
    if (!toggle || !box) {
      return;
    }
    toggle.addEventListener("click", function () {
      box.classList.toggle("is-open");
      var input = box.querySelector("input");
      if (box.classList.contains("is-open") && input) {
        input.focus();
      }
    });
  }

  function setupFiltering() {
    var cards = selectAll(".movie-card");
    if (!cards.length) {
      return;
    }
    var inputs = selectAll(".site-search-input");
    var filters = selectAll(".card-filter");
    var empty = document.querySelector(".empty-state");

    function readQuery() {
      var values = inputs.map(function (input) {
        return input.value;
      }).filter(Boolean);
      return normalize(values[values.length - 1] || "");
    }

    function apply() {
      var query = readQuery();
      var selected = {};
      filters.forEach(function (filter) {
        selected[filter.getAttribute("data-filter")] = normalize(filter.value);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var category = normalize(card.getAttribute("data-category"));
        var year = normalize(card.getAttribute("data-year"));
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (selected.category && category !== selected.category) {
          ok = false;
        }
        if (selected.year && year !== selected.year) {
          ok = false;
        }
        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", apply);
    });
    filters.forEach(function (filter) {
      filter.addEventListener("change", apply);
    });
  }

  function setupHero() {
    var slides = selectAll("[data-hero-slide]");
    var dots = selectAll("[data-hero-dot]");
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
    start();
  }

  function setupPlayers() {
    selectAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      var stream = shell.getAttribute("data-stream");
      var ready = false;
      var hls = null;
      if (!video || !button || !stream) {
        return;
      }

      function attach() {
        if (ready) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        ready = true;
      }

      function play() {
        attach();
        shell.classList.add("is-playing");
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHeaderSearch();
    setupFiltering();
    setupHero();
    setupPlayers();
  });
})();
