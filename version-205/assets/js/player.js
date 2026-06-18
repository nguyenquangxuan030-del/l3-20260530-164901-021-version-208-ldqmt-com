import { H as Hls } from "./hls-module.js";

function setupPlayer(frame) {
  const video = frame.querySelector("video[data-src]");
  const button = frame.querySelector("[data-play-button]");

  if (!video || !button) {
    return;
  }

  let initialized = false;
  let hlsInstance = null;

  function initializeSource() {
    if (initialized) {
      return;
    }

    initialized = true;
    const source = video.dataset.src;

    if (!source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    }
  }

  function playVideo() {
    initializeSource();
    video.play().then(function () {
      frame.classList.add("is-playing");
    }).catch(function () {
      frame.classList.remove("is-playing");
    });
  }

  button.addEventListener("click", playVideo);
  video.addEventListener("play", function () {
    frame.classList.add("is-playing");
  });
  video.addEventListener("pause", function () {
    frame.classList.remove("is-playing");
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-video-frame]").forEach(setupPlayer);
});
