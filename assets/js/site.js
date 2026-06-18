(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    startHero();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var container = panel.parentElement.querySelector('[data-card-container]');
    var search = panel.querySelector('[data-filter-search]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var empty = panel.parentElement.querySelector('[data-filter-empty]');

    if (!container) {
      return;
    }

    var cards = Array.prototype.slice.call(container.children);

    function applyFilters() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var selectedType = type ? type.value : 'all';
      var selectedYear = year ? year.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = Number(card.getAttribute('data-year') || 0);
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchType = selectedType === 'all' || cardType === selectedType;
        var matchYear = selectedYear === 'all' || Math.floor(cardYear / 10) * 10 === Number(selectedYear);
        var show = matchQuery && matchType && matchYear;

        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    if (type) {
      type.addEventListener('change', applyFilters);
    }

    if (year) {
      year.addEventListener('change', applyFilters);
    }
  });
})();

function setupMoviePlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var started = false;
  var hlsInstance = null;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function bindStream() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    if (!started) {
      started = true;
      bindStream();
      video.controls = true;
      overlay.classList.add('is-hidden');
    }

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  overlay.addEventListener('click', startPlayback);

  video.addEventListener('click', function () {
    if (!started) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
