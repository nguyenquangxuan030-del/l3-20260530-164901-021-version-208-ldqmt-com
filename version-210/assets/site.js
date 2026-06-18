(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let slideIndex = 0;

  function setSlide(next) {
    if (!slides.length) {
      return;
    }
    slideIndex = (next + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === slideIndex);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === slideIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(slideIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter(input) {
    const box = input.closest('main') || document;
    const cards = Array.from(box.querySelectorAll('[data-card]'));
    const empty = box.querySelector('[data-empty-state]');
    const query = normalize(input.value);
    let visible = 0;

    cards.forEach(function (card) {
      const text = normalize(card.getAttribute('data-search') || card.textContent);
      const matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    if (q) {
      input.value = q;
    }
    applyFilter(input);
    input.addEventListener('input', function () {
      applyFilter(input);
    });
  });

  document.querySelectorAll('[data-clear-filter]').forEach(function (button) {
    button.addEventListener('click', function () {
      const wrap = button.closest('.catalog-search-box');
      const input = wrap ? wrap.querySelector('[data-filter-input]') : null;
      if (input) {
        input.value = '';
        applyFilter(input);
        input.focus();
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.play-overlay');
    const playUrl = player.getAttribute('data-play');
    let hlsInstance = null;

    function attachStream() {
      if (!video || !playUrl || video.dataset.ready === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playUrl;
      }
      video.dataset.ready = '1';
    }

    function startVideo() {
      attachStream();
      player.classList.add('is-playing');
      const started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        startVideo();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
