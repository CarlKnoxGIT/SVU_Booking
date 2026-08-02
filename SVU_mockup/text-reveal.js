const REVEAL_STAGGER = 40;
const SERVICE_GROUP_STAGGER = 90;
const ACRONYM_REVEAL_STAGGER = 180;
const LEGACY_REVEAL_SECTIONS = [".hero", ".about", ".stats", ".services", ".contact", ".footer"];
const SERVICE_REVEAL_BLOCKS = [
    ".fact-grid > div",
    ".feature-grid > *",
    ".support-list > li",
    ".detail-list > div",
    ".journey-list > li",
    ".mock-form > .form-field",
    ".mock-form > .mock-form__footer",
];

function getRevealSections() {
    const declaredSections = [...document.querySelectorAll("[data-reveal-section]")];

    if (declaredSections.length) return declaredSections;

    return LEGACY_REVEAL_SECTIONS
        .map((selector) => document.querySelector(selector))
        .filter(Boolean);
}

function wrapWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
        if (!node.textContent || !node.parentNode) return;

        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            const span = document.createElement("span");
            span.className = "reveal-word";
            span.textContent = part;
            frag.appendChild(span);
        });
        node.parentNode.replaceChild(frag, node);
    });
}

function groupWordsByLine(words) {
    const groups = [];
    let current = [];
    let currentTop = null;

    words.forEach((word) => {
        // Superscripts/subscripts sit above/below the baseline, so their
        // bounding top differs from the rest of the line — keep them with
        // the current line instead of treating them as a wrap.
        const isRaised = Boolean(
            word.closest("sup, sub") || word.querySelector("sup, sub")
        );
        const top = Math.round(word.getBoundingClientRect().top);

        if (isRaised && currentTop !== null) {
            current.push(word);
            return;
        }

        if (currentTop === null) {
            currentTop = top;
            current.push(word);
            return;
        }

        if (top !== currentTop) {
            groups.push(current);
            current = [word];
            currentTop = top;
            return;
        }

        current.push(word);
    });

    if (current.length) groups.push(current);
    return groups;
}

function buildLineElement(lineWords) {
    const clip = document.createElement("span");
    clip.className = "anim-clip";
    const line = document.createElement("span");
    line.className = "reveal-line";

    lineWords.forEach((word) => {
        const text = typeof word === "string" ? word : word.text;
        const inSup = typeof word === "object" && word.inSup;

        if (inSup) {
            const sup = document.createElement("sup");
            sup.textContent = text;
            line.appendChild(sup);
            return;
        }

        line.appendChild(document.createTextNode(text));
    });

    clip.appendChild(line);
    return { clip, line };
}

function splitElementIntoLines(el) {
    if (el.dataset.revealSplit === "true") {
        return [...el.querySelectorAll(".reveal-line")];
    }

    el.dataset.revealSplit = "true";
    el.style.lineHeight = "1.2";
    wrapWords(el);

    // Force layout before measuring so wraps match the final font metrics
    void el.offsetWidth;

    const words = [...el.querySelectorAll(".reveal-word")];
    if (!words.length) return [];

    const groups = groupWordsByLine(words);
    const lineData = groups.map((lineWords) =>
        lineWords.map((word) => ({
            text: word.textContent,
            inSup: word.parentElement && word.parentElement.tagName === "SUP",
        }))
    );

    el.innerHTML = "";

    lineData.forEach((lineWords) => {
        const { clip } = buildLineElement(lineWords);
        el.appendChild(clip);
    });

    return [...el.querySelectorAll(".reveal-line")];
}

function splitPlainTextIntoLines(container, text) {
    container.innerHTML = "";

    const measure = document.createElement("div");
    measure.className = "description-measure";
    text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        const span = document.createElement("span");
        span.className = "reveal-word";
        span.textContent = part;
        measure.appendChild(span);
    });
    container.appendChild(measure);
    void measure.offsetWidth;

    const groups = groupWordsByLine([...measure.querySelectorAll(".reveal-word")]);
    container.innerHTML = "";

    const lines = [];
    groups.forEach((lineWords) => {
        const { clip, line } = buildLineElement(lineWords.map((word) => word.textContent));
        container.appendChild(clip);
        lines.push(line);
    });

    return lines;
}

function prepareRevealElement(element, className) {
    element.classList.add("reveal-preparing", className);
}

function prepareButton(button) {
    prepareRevealElement(button, "reveal-line");

    if (button.closest(".anim-clip")) return;

    const clip = document.createElement("span");
    clip.className = "anim-clip";
    button.parentNode.insertBefore(clip, button);
    clip.appendChild(button);
}

function prepareMedia(section) {
    const isServicePage = document.body.classList.contains("service-page");
    const mediaBlocks = [
        "[data-reveal-media]",
        ".hero .video",
        ".about-image-content > .left-column",
        ".stats > .left-column",
        ".services .image-container",
        ".services .interactive-imgs",
    ];

    const contentBlocks = [
        "[data-reveal-block]",
        ".caption",
        ".resolution",
        ".audio",
        ".data",
        ".square-img",
    ];

    mediaBlocks.forEach((sel) => {
        section.querySelectorAll(sel).forEach((el) => {
            if (isServicePage && el.matches("[data-reveal-media]")) {
                const media = el.matches("img, video")
                    ? el
                    : el.querySelector("img, video");

                prepareRevealElement(media || el, "reveal-media");
                el.querySelectorAll("figcaption").forEach((caption) => {
                    prepareRevealElement(caption, "reveal-block");
                });
                return;
            }

            prepareRevealElement(el, "reveal-media");
        });
    });

    contentBlocks.forEach((sel) => {
        section.querySelectorAll(sel).forEach((el) => {
            prepareRevealElement(el, "reveal-block");
        });
    });

    section.querySelectorAll("img").forEach((img) => {
        if (img.closest(".right-button, .down-button, .img-indicator")) return;
        if (img.closest(".reveal-media, .reveal-block")) return;
        prepareRevealElement(img, "reveal-media");
    });
}

function prepareServiceBlocks(section) {
    SERVICE_REVEAL_BLOCKS.forEach((selector) => {
        section.querySelectorAll(selector).forEach((el) => {
            prepareRevealElement(el, "reveal-block");
        });
    });
}

function prepareSection(section) {
    const isServicePage = document.body.classList.contains("service-page");
    const footerLinks = section.matches(".footer")
        ? [...section.querySelectorAll(".links a")]
        : [];

    if (isServicePage) {
        prepareServiceBlocks(section);
    }

    prepareMedia(section);

    const textSelector = isServicePage ? "h1, h2, h3, p" : "h1, h2, p";
    const serviceFooterText = isServicePage && section.matches(".footer")
        ? [...section.querySelectorAll(".footer-link-muted")]
        : [];
    const textEls = [
        ...section.querySelectorAll(textSelector),
        ...footerLinks,
        ...serviceFooterText,
    ].filter((el) => {
        if (el.closest(".text-indicator")) return false;
        if (el.closest(".cursor")) return false;
        if (isServicePage && el.closest(".reveal-block")) return false;
        if (el.classList.contains("description-measure")) return false;
        if (el.classList.contains("desc-line")) return false;
        if (el.classList.contains("reveal-line")) return false;
        if (el.dataset.revealSplit === "true") return false;
        return true;
    });

    textEls.forEach((el) => splitElementIntoLines(el));

    const buttons = [...section.querySelectorAll(".right-button, .down-button")].filter(
        (btn) =>
            !btn.classList.contains("reveal-line") &&
            (!isServicePage || !btn.closest(".reveal-block"))
    );
    buttons.forEach((btn) => prepareButton(btn));

    return getRevealItems(section);
}

function getRevealItems(section) {
    return [...section.querySelectorAll(".reveal-line, .desc-line, .reveal-media, .reveal-block")].sort(
        (a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            if (Math.abs(ra.top - rb.top) > 10) return ra.top - rb.top;
            return ra.left - rb.left;
        }
    );
}

function revealItems(items, initialDelay = 0) {
    let delay = initialDelay;
    let clearAfter = 0;

    items.forEach((item) => {
        const isAcronymLetter = Boolean(item.closest(".footer .acronym"));
        item.style.transitionDelay = `${delay}ms`;
        item.classList.add("is-visible");
        clearAfter = Math.max(clearAfter, delay + (isAcronymLetter ? 1400 : 1200));
        delay += isAcronymLetter ? ACRONYM_REVEAL_STAGGER : REVEAL_STAGGER;
    });

    window.setTimeout(() => {
        items.forEach((item) => {
            item.style.transitionDelay = "0ms";
        });
    }, clearAfter);
}

function revealSection(section) {
    if (section.dataset.revealed === "true") return;
    section.dataset.revealed = "true";
    revealItems(getRevealItems(section));
}

function getServiceRevealTrigger(item) {
    const acronym = item.closest(".footer .acronym");
    if (acronym) return acronym;

    if (item.classList.contains("reveal-line") || item.classList.contains("desc-line")) {
        if (item.matches(".right-button, .down-button")) {
            return item.closest(".anim-clip") || item;
        }

        return item.closest("[data-reveal-split='true']") || item;
    }

    return item;
}

function observeServiceRevealItems(sections, observerOptions) {
    const revealGroups = new Map();

    sections.forEach((section) => {
        getRevealItems(section).forEach((item) => {
            const trigger = getServiceRevealTrigger(item);
            if (!revealGroups.has(trigger)) {
                revealGroups.set(trigger, { items: [], section });
            }
            revealGroups.get(trigger).items.push(item);
        });
    });

    const observer = new IntersectionObserver((entries) => {
        const sectionOffsets = new Map();
        const intersectingEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => {
                const ra = a.target.getBoundingClientRect();
                const rb = b.target.getBoundingClientRect();
                if (Math.abs(ra.top - rb.top) > 10) return ra.top - rb.top;
                return ra.left - rb.left;
            });

        intersectingEntries.forEach((entry) => {
            const group = revealGroups.get(entry.target);
            if (!group) return;

            const sectionOffset = sectionOffsets.get(group.section) || 0;
            revealItems(group.items, sectionOffset);
            sectionOffsets.set(
                group.section,
                sectionOffset + SERVICE_GROUP_STAGGER
            );
            observer.unobserve(entry.target);
        });
    }, observerOptions);

    revealGroups.forEach((group, trigger) => observer.observe(trigger));
}

function waitForRevealPreparationFrame() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.querySelectorAll(".reveal-preparing").forEach((item) => {
                    item.classList.remove("reveal-preparing");
                });
                requestAnimationFrame(resolve);
            });
        });
    });
}

async function initTextReveal() {
    const sections = getRevealSections();
    const isServicePage = document.body.classList.contains("service-page");

    sections.forEach((section) => {
        if (isServicePage) prepareServiceBlocks(section);
        prepareMedia(section);
    });

    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    sections.forEach((section) => prepareSection(section));
    await waitForRevealPreparationFrame();

    if (window.location.hash) {
        const hashTarget = document.getElementById(
            decodeURIComponent(window.location.hash.slice(1))
        );

        if (hashTarget) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    hashTarget.scrollIntoView({ block: "start" });
                });
            });
        }
    }

    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
    };

    if (document.body.classList.contains("service-page")) {
        observeServiceRevealItems(sections, observerOptions);
        document.dispatchEvent(new Event("textreveal:ready"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                revealSection(entry.target);
                observer.unobserve(entry.target);
            });
        },
        observerOptions
    );

    sections.forEach((section) => observer.observe(section));

    document.dispatchEvent(new Event("textreveal:ready"));
}

window.splitElementIntoLines = splitElementIntoLines;
window.splitPlainTextIntoLines = splitPlainTextIntoLines;
window.prepareSection = prepareSection;
window.revealSection = revealSection;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTextReveal);
} else {
    initTextReveal();
}
