function initializeToc() {
    const articleContent = document.querySelector(".article-content");
    const tocContainer = document.getElementById("toc-container");

    if (!articleContent || !tocContainer) {
        return;
    }

    const headings = articleContent.querySelectorAll("h2, h3, h4");

    if (headings.length === 0) {
        tocContainer.style.display = "none";
        return;
    }

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

        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });

    tocContainer.replaceChildren(tocList);

    // Scroll-spying functionality
    const tocLinks = tocContainer.querySelectorAll("a");
    const headingElements = Array.from(headings);

    window.addEventListener("scroll", () => {
        let current = "";

        headingElements.forEach(heading => {
            const headingTop = heading.offsetTop;
            if (pageYOffset >= headingTop - 60) { // 60px offset for header
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeToc);
} else {
    initializeToc();
}
