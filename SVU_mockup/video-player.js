(() => {
    const launcher = document.querySelector("[data-video-launcher]");
    const openButton = launcher?.querySelector("[data-video-open]");
    const backgroundVideo = launcher?.querySelector("video");
    const modal = document.querySelector("[data-video-modal]");
    const video = modal?.querySelector("[data-video-full]");

    if (!launcher || !openButton || !backgroundVideo || !modal || !video) {
        return;
    }

    const closeButton = modal.querySelector("[data-video-close]");
    const controls = modal.querySelector("[data-video-controls]");
    const playButton = modal.querySelector("[data-video-play]");
    const muteButton = modal.querySelector("[data-video-mute]");
    const progress = modal.querySelector("[data-video-progress]");
    const volume = modal.querySelector("[data-video-volume]");
    const currentOutput = modal.querySelector("[data-video-current]");
    const durationOutput = modal.querySelector("[data-video-duration]");
    let returnFocusTo = openButton;
    let previousVolume = 1;
    let lastPointerY = Number.NEGATIVE_INFINITY;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateControlVisibility = () => {
        const pointerInRevealZone = lastPointerY >= window.innerHeight * 0.85;
        const controlsHaveFocus = controls.contains(document.activeElement);
        const shouldShow = modal.open && (
            !finePointer.matches || pointerInRevealZone || controlsHaveFocus
        );

        controls.classList.toggle("is-visible", shouldShow);
    };

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds)) return "0:00";

        const rounded = Math.max(0, Math.floor(seconds));
        const hours = Math.floor(rounded / 3600);
        const minutes = Math.floor((rounded % 3600) / 60);
        const remainder = String(rounded % 60).padStart(2, "0");

        return hours
            ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`
            : `${minutes}:${remainder}`;
    };

    const updatePlayState = () => {
        const isPlaying = !video.paused && !video.ended;
        playButton.setAttribute("aria-label", isPlaying ? "Pause video" : "Play video");
        modal.classList.toggle("is-playing", isPlaying);
        modal.classList.toggle("is-paused", !isPlaying);
    };

    const updateMuteState = () => {
        const isMuted = video.muted || video.volume === 0;
        const displayedVolume = isMuted ? 0 : video.volume;
        muteButton.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
        modal.classList.toggle("is-muted", isMuted);
        volume.value = String(displayedVolume);
        volume.style.setProperty("--range-progress", `${displayedVolume * 100}%`);
        volume.setAttribute(
            "aria-valuetext",
            isMuted ? "Muted" : `${Math.round(video.volume * 100)} percent`
        );
    };

    const updateProgress = () => {
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;

        progress.max = String(duration || 100);
        progress.value = String(currentTime);
        progress.style.setProperty(
            "--range-progress",
            `${duration ? (currentTime / duration) * 100 : 0}%`
        );
        progress.setAttribute(
            "aria-valuetext",
            `${formatTime(currentTime)} of ${formatTime(duration)}`
        );
        currentOutput.textContent = formatTime(currentTime);
        durationOutput.textContent = formatTime(duration);
    };

    const playVideo = async () => {
        try {
            await video.play();
        } catch {
            updatePlayState();
        }
    };

    const togglePlayback = () => {
        if (video.paused || video.ended) {
            if (video.ended) video.currentTime = 0;
            playVideo();
        } else {
            video.pause();
            updatePlayState();
        }
    };

    const stopPageScroll = () => {
        document.documentElement.classList.add("video-modal-open");
        document.body.classList.add("video-modal-open");

        if (typeof lenis !== "undefined" && typeof lenis.stop === "function") {
            lenis.stop();
        }
    };

    const restorePageScroll = () => {
        document.documentElement.classList.remove("video-modal-open");
        document.body.classList.remove("video-modal-open");

        if (typeof lenis !== "undefined" && typeof lenis.start === "function") {
            lenis.start();
        }
    };

    const openModal = () => {
        returnFocusTo = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : openButton;

        video.currentTime = 0;

        backgroundVideo.pause();
        video.muted = false;
        video.volume = Number(volume.value);
        modal.showModal();
        stopPageScroll();
        updateControlVisibility();
        updateProgress();
        updateMuteState();
        closeButton.focus();
        playVideo();
    };

    const closeModal = () => {
        if (!modal.open) return;

        video.pause();
        if (Number.isFinite(video.currentTime)) {
            backgroundVideo.currentTime = video.currentTime;
        }

        modal.close();
        controls.classList.remove("is-visible");
        restorePageScroll();
        backgroundVideo.play().catch(() => {});
        returnFocusTo?.focus();
    };

    openButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);
    playButton.addEventListener("click", togglePlayback);
    video.addEventListener("click", togglePlayback);

    muteButton.addEventListener("click", () => {
        if (video.muted || video.volume === 0) {
            video.muted = false;
            video.volume = previousVolume || 1;
        } else {
            previousVolume = video.volume;
            video.muted = true;
        }
        updateMuteState();
    });

    volume.addEventListener("input", () => {
        const nextVolume = Number(volume.value);
        video.volume = nextVolume;
        video.muted = nextVolume === 0;
        if (nextVolume > 0) previousVolume = nextVolume;
        updateMuteState();
    });

    progress.addEventListener("input", () => {
        const nextTime = Number(progress.value);
        const duration = Number.isFinite(video.duration) ? video.duration : 0;

        video.currentTime = nextTime;
        currentOutput.textContent = formatTime(nextTime);
        progress.style.setProperty(
            "--range-progress",
            `${duration ? (nextTime / duration) * 100 : 0}%`
        );
        progress.setAttribute(
            "aria-valuetext",
            `${formatTime(nextTime)} of ${formatTime(duration)}`
        );
    });

    video.addEventListener("loadedmetadata", updateProgress);
    video.addEventListener("durationchange", updateProgress);
    video.addEventListener("seeked", updateProgress);
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", updatePlayState);
    video.addEventListener("pause", updatePlayState);
    video.addEventListener("ended", updatePlayState);
    video.addEventListener("volumechange", updateMuteState);

    window.addEventListener("pointermove", (event) => {
        lastPointerY = event.clientY;
        if (modal.open) updateControlVisibility();
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", () => {
        lastPointerY = Number.NEGATIVE_INFINITY;
        updateControlVisibility();
    });

    window.addEventListener("resize", updateControlVisibility, { passive: true });
    controls.addEventListener("focusin", updateControlVisibility);
    controls.addEventListener("focusout", () => {
        window.requestAnimationFrame(updateControlVisibility);
    });

    if (typeof finePointer.addEventListener === "function") {
        finePointer.addEventListener("change", updateControlVisibility);
    }

    modal.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (!modal.open || event.defaultPrevented) return;

        const activeTag = document.activeElement?.tagName;
        const isRange = activeTag === "INPUT";

        if (event.key === " " && activeTag !== "BUTTON" && !isRange) {
            event.preventDefault();
            togglePlayback();
        }

        if (event.key.toLowerCase() === "m" && !isRange) {
            event.preventDefault();
            muteButton.click();
        }

        if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !isRange) {
            event.preventDefault();
            const step = event.key === "ArrowLeft" ? -5 : 5;
            video.currentTime = Math.min(
                Math.max(video.currentTime + step, 0),
                video.duration || 0
            );
            updateProgress();
        }
    });

    updatePlayState();
    updateMuteState();
    updateProgress();
})();
