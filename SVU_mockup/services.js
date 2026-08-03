const servicesSection = document.querySelector(".services");
const mainImage = servicesSection.querySelector(".image-container img");
const titleEl = servicesSection.querySelector(".services-info .title h1");
const descriptionLinesEl = servicesSection.querySelector(".services-info .description-lines");
const ctaButton = servicesSection.querySelector(".services-info .title .right-button");
const ctaLabels = ctaButton.querySelectorAll(".text-indicator p");
const controlButtons = [...servicesSection.querySelectorAll(".services-info .controls .right-button")];
const prevButton = controlButtons[0];
const nextButton = controlButtons[1];
const interactiveImgs = [...servicesSection.querySelectorAll(".interactive-imgs")];

const DURATION_IMAGE = 800;
const DURATION_TEXT = 1100;
const STAGGER = 20;

let isAnimating = false;

function getActiveIndex() {
    return interactiveImgs.findIndex((img) => img.classList.contains("active"));
}

function goToRelativeService(step) {
    const current = getActiveIndex();
    const nextIndex = (current + step + interactiveImgs.length) % interactiveImgs.length;
    updateService(interactiveImgs[nextIndex]);
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function setExiting(els, baseDelay = 0) {
    els.forEach((el, i) => {
        el.style.transitionDelay = `${baseDelay + i * STAGGER}ms`;
        el.classList.remove("is-enter-start");
        el.classList.add("is-exiting");
    });
}

function setEnterStart(els) {
    els.forEach((el) => {
        el.style.transitionDelay = "0ms";
        el.classList.remove("is-exiting");
        el.classList.add("is-enter-start");
    });
}

function setEntering(els, baseDelay = 0) {
    els.forEach((el, i) => {
        el.style.transitionDelay = `${baseDelay + i * STAGGER}ms`;
        el.classList.remove("is-enter-start");
    });
}

function clearDelays(els) {
    els.forEach((el) => {
        el.style.transitionDelay = "0ms";
    });
}

function getInfoTextEls() {
    return [...servicesSection.querySelectorAll(".services-info .reveal-line")];
}

function setTitleText(text) {
    titleEl.textContent = text;
    titleEl.removeAttribute("data-reveal-split");
    const lines = window.splitElementIntoLines(titleEl);
    lines.forEach((line) => line.classList.add("is-visible"));
    return lines;
}

function splitDescriptionIntoLines(text) {
    const lines = window.splitPlainTextIntoLines(descriptionLinesEl, text);
    const sectionRevealed = servicesSection.dataset.revealed === "true";

    if (sectionRevealed) {
        lines.forEach((line) => line.classList.add("is-visible"));
    }

    return lines;
}

async function updateService(item) {
    if (isAnimating || item.classList.contains("active")) return;
    isAnimating = true;

    const { title, description, cta, href } = item.dataset;
    const thumb = item.querySelector("img");
    const thumbImages = interactiveImgs.map((el) => el.querySelector("img"));
    const allImages = [mainImage, ...thumbImages];
    const textEls = getInfoTextEls();
    const exitMs = Math.max(
        DURATION_IMAGE,
        DURATION_TEXT + (textEls.length - 1) * STAGGER
    );

    setExiting(allImages);
    setExiting(textEls);

    await delay(exitMs);

    mainImage.src = thumb.src;
    setTitleText(title);
    const descLines = splitDescriptionIntoLines(description);
    ctaLabels.forEach((label) => {
        label.textContent = cta;
    });
    ctaButton.setAttribute("href", href || "");

    interactiveImgs.forEach((img) => img.classList.remove("active"));
    item.classList.add("active");

    const enterTextEls = getInfoTextEls();
    const enterMs = Math.max(
        DURATION_IMAGE,
        DURATION_TEXT + (enterTextEls.length - 1) * STAGGER
    );

    setEnterStart(allImages);
    setEnterStart(enterTextEls);
    await nextFrame();

    setEntering(allImages);
    setEntering(enterTextEls);

    await delay(enterMs);

    clearDelays(allImages);
    clearDelays(enterTextEls);
    isAnimating = false;
}

const initial = interactiveImgs.find((img) => img.classList.contains("active")) || interactiveImgs[0];

function initServiceDescription() {
    if (initial) {
        splitDescriptionIntoLines(initial.dataset.description);
    }
}

document.addEventListener("textreveal:ready", initServiceDescription, { once: true });

interactiveImgs.forEach((item) => {
    item.addEventListener("click", () => updateService(item));
});

prevButton.addEventListener("click", (event) => {
    event.preventDefault();
    goToRelativeService(-1);
});

nextButton.addEventListener("click", (event) => {
    event.preventDefault();
    goToRelativeService(1);
});
