import { H as Hls } from './hls-video.js';

export function initPlayer(options) {
    var video = document.querySelector(options.selector);
    var trigger = document.querySelector(options.triggerSelector);
    var source = options.source;
    var hls = null;
    var mounted = false;

    if (!video || !source) {
        return;
    }

    function mount() {
        if (mounted) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        mounted = true;
    }

    function hideTrigger() {
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    }

    function showTrigger() {
        if (trigger) {
            trigger.classList.remove('is-hidden');
        }
    }

    async function start() {
        mount();
        hideTrigger();

        try {
            await video.play();
        } catch (error) {
            showTrigger();
        }
    }

    if (trigger) {
        trigger.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', hideTrigger);
    video.addEventListener('ended', showTrigger);
    video.addEventListener('error', showTrigger);

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
