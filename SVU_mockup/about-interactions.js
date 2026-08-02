const aboutSection = document.querySelector("[data-about-interaction]");

if (aboutSection) {
    const aboutCopy = aboutSection.querySelector("[data-about-copy]");
    const aboutImage = aboutSection.querySelector("[data-about-feature-image]");
    const aboutCaption = aboutSection.querySelector("[data-about-caption-output]");
    const aboutTriggers = [...aboutSection.querySelectorAll(".about-copy__trigger")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const imageTransitionDuration = 160;
    const lineTransitionDuration = 500;
    const lineStagger = 40;
    const defaultFeature = {
        image: aboutImage.getAttribute("src"),
        alt: aboutImage.getAttribute("alt"),
        caption: aboutCaption.textContent,
    };

    let activeTrigger = null;
    let transitionId = 0;
    let displayedImage = defaultFeature.image;
    let transitionTimers = [];

    function featureFromTrigger(trigger) {
        if (!trigger) return defaultFeature;

        return {
            image: trigger.dataset.aboutImage,
            alt: trigger.dataset.aboutAlt,
            caption: trigger.dataset.aboutCaption,
        };
    }

    function clearTransitionTimers() {
        transitionTimers.forEach((timer) => window.clearTimeout(timer));
        transitionTimers = [];
    }

    function scheduleTransition(callback, delay) {
        const timer = window.setTimeout(callback, delay);
        transitionTimers.push(timer);
    }

    function captionLines() {
        let lines = [...aboutCaption.querySelectorAll(".reveal-line")];

        if (!lines.length && typeof window.splitPlainTextIntoLines === "function") {
            lines = window.splitPlainTextIntoLines(
                aboutCaption,
                aboutCaption.textContent
            );
            aboutCaption.dataset.revealSplit = "true";
            lines.forEach((line) => line.classList.add("is-visible"));
        }

        return lines;
    }

    function replaceCaption(text, enterFromBelow) {
        if (typeof window.splitPlainTextIntoLines !== "function") {
            aboutCaption.textContent = text;
            return [];
        }

        const lines = window.splitPlainTextIntoLines(aboutCaption, text);
        aboutCaption.dataset.revealSplit = "true";

        lines.forEach((line, index) => {
            line.style.transitionDelay = `${index * lineStagger}ms`;
            line.classList.add("is-visible");

            if (enterFromBelow) {
                line.classList.add("is-enter-start");
            }
        });

        return lines;
    }

    function clearCaptionLineState() {
        captionLines().forEach((line) => {
            line.style.transitionDelay = "0ms";
            line.classList.remove("is-exiting", "is-enter-start");
            line.classList.add("is-visible");
        });
    }

    function commitImage(feature) {
        aboutImage.setAttribute("src", feature.image);
        aboutImage.setAttribute("alt", feature.alt);
        displayedImage = feature.image;
    }

    function swapFeature(feature) {
        clearTransitionTimers();
        transitionId += 1;
        const currentTransition = transitionId;

        if (displayedImage === feature.image) {
            aboutImage.classList.remove("is-changing");
            aboutImage.setAttribute("alt", feature.alt);
            clearCaptionLineState();
            return;
        }

        if (reducedMotion.matches) {
            aboutImage.classList.remove("is-changing");
            commitImage(feature);
            replaceCaption(feature.caption, false);
            return;
        }

        const outgoingLines = captionLines();
        outgoingLines.forEach((line, index) => {
            line.style.transitionDelay = `${index * lineStagger}ms`;
            line.classList.remove("is-enter-start");
            line.classList.add("is-visible", "is-exiting");
        });

        const captionExitDuration = outgoingLines.length
            ? lineTransitionDuration + (outgoingLines.length - 1) * lineStagger
            : imageTransitionDuration;

        aboutImage.classList.add("is-changing");

        scheduleTransition(() => {
            if (currentTransition !== transitionId) return;

            commitImage(feature);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (currentTransition !== transitionId) return;

                    aboutImage.classList.remove("is-changing");
                });
            });
        }, imageTransitionDuration);

        scheduleTransition(() => {
            if (currentTransition !== transitionId) return;

            const incomingLines = replaceCaption(feature.caption, true);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (currentTransition !== transitionId) return;

                    incomingLines.forEach((line) => {
                        line.classList.remove("is-enter-start");
                    });
                });
            });

            const enterDuration = incomingLines.length
                ? lineTransitionDuration +
                  (incomingLines.length - 1) * lineStagger
                : imageTransitionDuration;

            scheduleTransition(() => {
                if (currentTransition !== transitionId) return;
                clearCaptionLineState();
            }, enterDuration);
        }, captionExitDuration);
    }

    function activateTrigger(trigger) {
        if (activeTrigger === trigger) return;

        activeTrigger = trigger;
        aboutCopy.classList.add("is-interacting");
        aboutTriggers.forEach((item) => {
            item.classList.toggle("is-active", item === trigger);
        });
        swapFeature(featureFromTrigger(trigger));
    }

    function resetInteraction() {
        activeTrigger = null;
        aboutCopy.classList.remove("is-interacting");
        aboutTriggers.forEach((item) => item.classList.remove("is-active"));
        swapFeature(defaultFeature);
    }

    aboutTriggers.forEach((trigger) => {
        const preloadedImage = new Image();
        preloadedImage.src = trigger.dataset.aboutImage;

        trigger.addEventListener("pointerenter", () => activateTrigger(trigger));
        trigger.addEventListener("pointerleave", () => {
            if (document.activeElement !== trigger) resetInteraction();
        });
        trigger.addEventListener("focus", () => activateTrigger(trigger));
        trigger.addEventListener("click", () => activateTrigger(trigger));
        trigger.addEventListener("blur", () => {
            requestAnimationFrame(() => {
                if (!aboutTriggers.includes(document.activeElement)) {
                    resetInteraction();
                }
            });
        });
        trigger.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            trigger.blur();
            resetInteraction();
        });
    });

    document.addEventListener("pointerdown", (event) => {
        if (!aboutCopy.contains(event.target)) resetInteraction();
    });
}
