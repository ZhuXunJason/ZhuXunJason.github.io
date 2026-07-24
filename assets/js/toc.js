function initializeToc() {
    const articleContent = document.querySelector(".article-content");
    const tocContainer = document.getElementById("toc-container");

    if (!tocContainer) return;

    const headings = articleContent ? articleContent.querySelectorAll("h2, h3, h4") : [];

    if (headings.length > 0) {
        buildTocList(tocContainer, headings);
    }

    buildToolbar(tocContainer);
    buildMobileDock();
    setupScrollSpy(headings);
    setupBackToTop();
    setupPrevNext();
    setupCollapse(tocContainer);
}

function buildTocList(tocContainer, headings) {
    const tocList = document.createElement("ul");
    tocList.className = "toc-list";

    headings.forEach((heading, index) => {
        const id = heading.id || `heading-${index}`;
        heading.setAttribute("id", id);

        const level = heading.tagName.toLowerCase();
        const title = heading.textContent.trim();
        const listItem = document.createElement("li");
        const link = document.createElement("a");

        link.href = `#${id}`;
        link.className = `toc-${level}`;
        link.textContent = title;
        link.title = title;

        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });

    tocContainer.replaceChildren(tocList);
}

function buildToolbar(tocContainer) {
    const toolbar = document.createElement("div");
    toolbar.className = "toc-toolbar";

    const prevBtn = document.createElement("a");
    prevBtn.className = "toc-btn toc-prev-btn";
    prevBtn.setAttribute("aria-label", "上一篇");
    prevBtn.setAttribute("title", "上一篇");
    prevBtn.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';
    prevBtn.classList.add("is-disabled");

    const topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "toc-btn toc-top-btn";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.setAttribute("title", "回到顶部");
    topBtn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';

    const bottomBtn = document.createElement("button");
    bottomBtn.type = "button";
    bottomBtn.className = "toc-btn toc-bottom-btn";
    bottomBtn.setAttribute("aria-label", "前往底部");
    bottomBtn.setAttribute("title", "前往底部");
    bottomBtn.innerHTML = '<i class="fas fa-arrow-down" aria-hidden="true"></i>';

    const nextBtn = document.createElement("a");
    nextBtn.className = "toc-btn toc-next-btn";
    nextBtn.setAttribute("aria-label", "下一篇");
    nextBtn.setAttribute("title", "下一篇");
    nextBtn.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';
    nextBtn.classList.add("is-disabled");

    const collapseBtn = document.createElement("button");
    collapseBtn.type = "button";
    collapseBtn.className = "toc-btn toc-collapse-btn";
    collapseBtn.setAttribute("aria-label", "收起目录");
    collapseBtn.setAttribute("title", "收起");
    collapseBtn.innerHTML = '<i class="fas fa-angles-left" aria-hidden="true"></i>';

    toolbar.appendChild(prevBtn);
    toolbar.appendChild(topBtn);
    toolbar.appendChild(bottomBtn);
    toolbar.appendChild(nextBtn);
    toolbar.appendChild(collapseBtn);

    const expandBtn = document.createElement("button");
    expandBtn.type = "button";
    expandBtn.className = "toc-btn toc-expand-btn";
    expandBtn.setAttribute("aria-label", "展开目录");
    expandBtn.setAttribute("title", "展开");
    expandBtn.innerHTML = '<i class="fas fa-angles-right" aria-hidden="true"></i>';

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    bottomBtn.addEventListener("click", () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    });

    const existingList = tocContainer.querySelector(".toc-list");
    tocContainer.replaceChildren(toolbar, existingList || document.createDocumentFragment(), expandBtn);
}

function buildMobileDock() {
    if (document.querySelector(".toc-mobile-dock")) return;

    const dock = document.createElement("div");
    dock.className = "toc-mobile-dock";

    const prevBtn = document.createElement("a");
    prevBtn.className = "toc-mobile-btn toc-mobile-prev";
    prevBtn.setAttribute("aria-label", "上一篇");
    prevBtn.setAttribute("title", "上一篇");
    prevBtn.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';
    prevBtn.classList.add("is-disabled");

    const topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "toc-mobile-btn toc-mobile-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.setAttribute("title", "回到顶部");
    topBtn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';

    const bottomBtn = document.createElement("button");
    bottomBtn.type = "button";
    bottomBtn.className = "toc-mobile-btn toc-mobile-bottom";
    bottomBtn.setAttribute("aria-label", "前往底部");
    bottomBtn.setAttribute("title", "前往底部");
    bottomBtn.innerHTML = '<i class="fas fa-arrow-down" aria-hidden="true"></i>';

    const nextBtn = document.createElement("a");
    nextBtn.className = "toc-mobile-btn toc-mobile-next";
    nextBtn.setAttribute("aria-label", "下一篇");
    nextBtn.setAttribute("title", "下一篇");
    nextBtn.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';
    nextBtn.classList.add("is-disabled");

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    bottomBtn.addEventListener("click", () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    });

    dock.appendChild(prevBtn);
    dock.appendChild(topBtn);
    dock.appendChild(bottomBtn);
    dock.appendChild(nextBtn);

    document.body.appendChild(dock);
}

function setupScrollSpy(headings) {
    if (headings.length === 0) return;

    const tocLinks = document.querySelectorAll(".toc-container a[href^='#']");
    const headingElements = Array.from(headings);

    window.addEventListener("scroll", () => {
        let current = "";

        headingElements.forEach(heading => {
            const headingTop = heading.offsetTop;
            if (pageYOffset >= headingTop - 60) {
                current = heading.getAttribute("id");
            }
        });

        tocLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").substring(1) === current) {
                link.classList.add("active");
            }
        });
    });
}

function setupBackToTop() {
    const desktopTopBtn = document.querySelector(".toc-top-btn");
    const desktopBottomBtn = document.querySelector(".toc-bottom-btn");
    const mobileTopBtn = document.querySelector(".toc-mobile-top");
    const mobileBottomBtn = document.querySelector(".toc-mobile-bottom");

    const updateScrollControls = () => {
        const visible = window.pageYOffset > 300;
        const atBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2;

        if (desktopTopBtn) {
            desktopTopBtn.classList.toggle("is-disabled", !visible);
            desktopTopBtn.disabled = !visible;
        }

        if (mobileTopBtn) {
            mobileTopBtn.classList.toggle("is-disabled", !visible);
            mobileTopBtn.disabled = !visible;
        }

        [desktopBottomBtn, mobileBottomBtn].forEach(button => {
            if (!button) return;
            button.classList.toggle("is-disabled", atBottom);
            button.disabled = atBottom;
        });
    };

    window.addEventListener("scroll", updateScrollControls);
    updateScrollControls();
}

function setupPrevNext() {
    if (!window.loadBlogPostsData) return;

    window.loadBlogPostsData().then(posts => {
        if (!posts || posts.length === 0) return;

        const utils = window.BlogPostUtils || {};
        const normalizeTag = utils.normalizeTag || (t => String(t ?? '').trim().toLowerCase());
        const getTagClass = utils.getTagClass || (t => {
            const n = String(t ?? '').trim().toLowerCase();
            if (n === '学术' || n === 'academic') return 'academic';
            if (n === '生活' || n === 'life') return 'life';
            return 'default';
        });

        const currentUrl = window.location.pathname.replace(/\/+$/, "");
        const allSorted = posts
            .filter(p => p && p.title && p.url)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));

        const currentIdx = allSorted.findIndex(p => {
            const url = (p.url || '').replace(/\/+$/, "");
            return url === currentUrl || url === currentUrl + ".html" || url + "/" === currentUrl;
        });

        if (currentIdx === -1) return;

        const currentPost = allSorted[currentIdx];
        const currentTags = (currentPost.tags || []).map(normalizeTag);
        const currentClass = currentTags.some(t => t === '学术' || t === 'academic') ? 'academic'
            : currentTags.some(t => t === '生活' || t === 'life') ? 'life' : 'default';

        const sameGroup = allSorted.filter(p => {
            const tags = (p.tags || []).map(normalizeTag);
            const cls = tags.some(t => t === '学术' || t === 'academic') ? 'academic'
                : tags.some(t => t === '生活' || t === 'life') ? 'life' : 'default';
            return cls === currentClass;
        });

        const groupIdx = sameGroup.findIndex(p => p === currentPost);
        const prevPost = groupIdx > -1 && groupIdx < sameGroup.length - 1 ? sameGroup[groupIdx + 1] : null;
        const nextPost = groupIdx > 0 ? sameGroup[groupIdx - 1] : null;

        applyPrevNext(prevPost, nextPost);
    }).catch(() => {});
}

function applyPrevNext(prevPost, nextPost) {
    const setBtn = (sel, post, isAnchor) => {
        document.querySelectorAll(sel).forEach(btn => {
            if (post) {
                btn.classList.remove("is-disabled");
                if (isAnchor) btn.setAttribute("href", post.url);
                btn.removeAttribute("aria-disabled");
            } else {
                btn.classList.add("is-disabled");
                if (isAnchor) btn.removeAttribute("href");
                btn.setAttribute("aria-disabled", "true");
            }
        });
    };

    setBtn(".toc-prev-btn", prevPost, true);
    setBtn(".toc-next-btn", nextPost, true);
    setBtn(".toc-mobile-prev", prevPost, true);
    setBtn(".toc-mobile-next", nextPost, true);
}

function setupCollapse(tocContainer) {
    const collapseBtn = tocContainer.querySelector(".toc-collapse-btn");
    const expandBtn = tocContainer.querySelector(".toc-expand-btn");

    if (collapseBtn) {
        collapseBtn.addEventListener("click", () => {
            tocContainer.classList.add("is-collapsed");
        });
    }

    if (expandBtn) {
        expandBtn.addEventListener("click", () => {
            tocContainer.classList.remove("is-collapsed");
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeToc);
} else {
    initializeToc();
}
