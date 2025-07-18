    const articleContent = document.querySelector(".article-content");
    const tocContainer = document.getElementById("toc-container");

    const headings = articleContent.querySelectorAll("h2, h3, h4");

    if (headings.length === 0) {
        tocContainer.style.display = "none";
    }

    let tocHTML = "";
    let h2Index = 0;
    let h3Index = 0;

    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.setAttribute("id", id);
        const level = heading.tagName.toLowerCase();
        const title = heading.textContent.trim();

        if (level === 'h2') {
            if (h2Index > 0) {
                tocHTML += '</li>';
            }
            h2Index++;
            h3Index = 0;
            tocHTML += `<li><a href="#${id}" class="toc-h2">${title}</a>`;
        } else if (level === 'h3') {
            h3Index++;
            tocHTML += `<li><a href="#${id}" class="toc-h3">${title}</a></li>`;
        }
        else if (level === 'h4') {
            tocHTML += `<li><a href="#${id}" class="toc-h4">${title}</a></li>`;
        }
    });

    if (h2Index > 0) {
        tocHTML += '</li>';
    }
    
    tocContainer.innerHTML = tocHTML;

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