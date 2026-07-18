(function () {
    const target = document.getElementById("main-article-content");
    const entryPanel = document.getElementById("password-prompt-overlay");
    const passwordInput = document.getElementById("password-input");
    const submitButton = document.getElementById("password-submit-button");
    let started = false;

    if (!target || !entryPanel || !passwordInput || !submitButton) {
        return;
    }

    function normalizeSubmitButtonLabel() {
        if (!submitButton || submitButton.disabled) return;
        if (submitButton.textContent.trim() === "解锁") {
            submitButton.innerHTML = "<span>展开</span>";
        }
    }

    function cakeMarkMarkup() {
        return `
            <svg viewBox="0 0 64 64" focusable="false">
                <path d="M32 8v8" />
                <path d="M28 13c2.5 2.4 5.5 2.4 8 0" />
                <path d="M18 30h28a6 6 0 0 1 6 6v14H12V36a6 6 0 0 1 6-6Z" />
                <path d="M16 42c4 3 8 3 12 0s8-3 12 0 8 3 12 0" />
                <path d="M10 50h44" />
                <path d="M22 30v-5a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v5" />
            </svg>`;
    }

    function addEntryCakeMark() {
        if (!entryPanel || entryPanel.querySelector(".cake-mark")) return;
        const ornament = entryPanel.querySelector(".entry__ornament");
        const mark = document.createElement("div");
        mark.className = "cake-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.innerHTML = cakeMarkMarkup();
        if (ornament) {
            ornament.insertAdjacentElement("afterend", mark);
        } else {
            entryPanel.insertBefore(mark, entryPanel.firstChild);
        }
    }

    function setParagraphStagger(surface) {
        const paragraphs = surface.querySelectorAll(".letter__body p, .content p, p");
        paragraphs.forEach((p, i) => p.style.setProperty("--i", i));
    }

    function hydrateLegacyTypeText(surface) {
        surface.querySelectorAll(".type[data-text]").forEach((node) => {
            if (!node.textContent.trim()) {
                node.textContent = node.dataset.text || "";
            }
            node.removeAttribute("data-typing");
        });
    }

    function decorateBirthdayTitle(surface) {
        surface.querySelectorAll(".letter__title, .title, h1, h2").forEach((node) => {
            const text = node.textContent.trim().replace(/\s+/g, " ").toLowerCase();
            if (text === "happy birthday" || text.includes("happy birthday")) {
                node.classList.add("birthday-art-title");
            }
        });
    }

    function initPhotos(surface) {
        surface.querySelectorAll(".photos figure[data-src], .photo-slot[data-src]").forEach((figure) => {
            if (figure.dataset.loaded === "true") return;
            const src = figure.getAttribute("data-src");
            if (!src) return;

            const img = new Image();
            img.alt = figure.getAttribute("data-alt") || "";
            img.onload = () => {
                figure.dataset.loaded = "true";
                figure.classList.add("loaded", "has-image");
                figure.appendChild(img);
            };
            img.src = src;
        });
    }

    function initImageDecorations(surface) {
        const decorations = surface.querySelectorAll(".image-decor, .photo-decor, .image-sprinkle");
        decorations.forEach((node, i) => {
            node.style.setProperty("--i", i);
            if (node.dataset.loaded === "true" || node.querySelector("img")) {
                node.classList.add("loaded");
                return;
            }

            const src = node.getAttribute("data-src");
            if (!src) return;

            const img = new Image();
            img.alt = node.getAttribute("data-alt") || "";
            img.onload = () => {
                node.dataset.loaded = "true";
                node.classList.add("loaded");
                node.appendChild(img);
            };
            img.src = src;
        });
    }

    function addLetterRule(surface) {
        if (surface.querySelector(".letter__rule, .divider")) return;
        const rule = document.createElement("div");
        rule.className = "letter__rule";
        rule.setAttribute("aria-hidden", "true");
        surface.insertBefore(rule, surface.firstChild);
    }

    function addLetterCakeMark(surface) {
        if (surface.querySelector(".letter-cake-mark")) return;
        const mark = document.createElement("div");
        mark.className = "cake-mark letter-cake-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.innerHTML = cakeMarkMarkup();
        const title = surface.querySelector(".letter__title, .title, h1, h2");
        surface.insertBefore(mark, title || surface.firstChild);
    }

    function revealLetter() {
        if (started) return;
        started = true;

        const surface = target.querySelector(".letter") || target;
        if (surface === target) {
            target.classList.add("letter-surface");
        }

        if (entryPanel && entryPanel.style.display !== "none") {
            entryPanel.style.opacity = "0";
            entryPanel.style.transform = "translateY(-8px)";
            setTimeout(() => { entryPanel.style.display = "none"; }, 400);
        }

        target.style.display = "block";
        addLetterRule(surface);
        addLetterCakeMark(surface);
        hydrateLegacyTypeText(surface);
        decorateBirthdayTitle(surface);
        setParagraphStagger(surface);
        initPhotos(surface);
        initImageDecorations(surface);

        requestAnimationFrame(() => {
            target.classList.add("visible");
            surface.classList.add("visible");
        });
    }

    const observer = new MutationObserver((mutations, obs) => {
        if (mutations.some((mutation) => mutation.type === "childList" && mutation.addedNodes.length > 0)) {
            revealLetter();
            obs.disconnect();
        }
    });

    observer.observe(target, { childList: true });

    const errorObserver = new MutationObserver(() => {
        if (!passwordInput) return;
        passwordInput.classList.remove("shake");
        void passwordInput.offsetWidth;
        passwordInput.classList.add("shake");
    });
    const errorMessage = document.getElementById("error-message");
    if (errorMessage) {
        errorObserver.observe(errorMessage, { childList: true });
    }

    if (submitButton) {
        new MutationObserver(normalizeSubmitButtonLabel).observe(submitButton, { childList: true, subtree: true });
        normalizeSubmitButtonLabel();
    }

    addEntryCakeMark();
})();
