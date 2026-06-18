(function () {
  function initializePlayer(box) {
    var video = box.querySelector('video');
    var source = box.getAttribute('data-src');

    if (!video || !source) {
      return;
    }

    if (box.getAttribute('data-ready') === 'true') {
      video.play().catch(function () {});
      return;
    }

    box.setAttribute('data-ready', 'true');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });

      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
    } else {
      video.src = source;
      video.play().catch(function () {});
    }

    box.classList.add('is-playing');
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (box) {
      var start = box.querySelector('[data-player-start]');

      if (start) {
        start.addEventListener('click', function () {
          initializePlayer(box);
        });
      }

      box.addEventListener('click', function (event) {
        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
          return;
        }

        initializePlayer(box);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPlayers);
  } else {
    bindPlayers();
  }
})();
