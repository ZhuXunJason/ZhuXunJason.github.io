document.addEventListener('DOMContentLoaded', function () {
    const relatedPostsContainer = document.getElementById('related-posts-container');
    const currentPostUrl = window.location.pathname;
    const postUtils = window.BlogPostUtils;

    if (!relatedPostsContainer || !postUtils) {
        return;
    }

    const { escapeHtml, getTagClass, normalizeTag } = postUtils;

    const tagsElement = document.querySelector('.post-tags');
    if (!tagsElement) return;

    const currentTags = Array.from(tagsElement.querySelectorAll('.post-tag')).map(tag => tag.textContent.trim());
    const currentTagSet = new Set(currentTags.map(normalizeTag));
    if (currentTags.length === 0) return;

    const loadPosts = typeof window.loadBlogPostsData === 'function'
        ? window.loadBlogPostsData()
        : fetch('/assets/json/posts.json').then(response => response.json());

    loadPosts
        .then(posts => {
            const relatedPosts = posts.map(post => {
                if (post.url === currentPostUrl) {
                    return null;
                }

                const postTags = Array.isArray(post.tags) ? post.tags : [];
                const commonTags = postTags.filter(tag => currentTagSet.has(normalizeTag(tag)));
                const score = commonTags.length;
                return { ...post, score };
            })
            .filter(post => post && post.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 2);

            if (relatedPosts.length > 0) {
                let html = '<div class="related-articles-grid">';
                relatedPosts.forEach(post => {
                    const postTags = Array.isArray(post.tags) ? post.tags : [];
                    html += `
                        <a href="${escapeHtml(post.url)}" class="post-card">
                            <div class="post-img"><img src="${escapeHtml(post.image || "/assets/images/default.webp")}" alt="${escapeHtml(post.title)}" loading="lazy"></div>
                            <div class="post-content">
                                <div class="post-tags">
                                    ${postTags.map(tag => `<span class="post-tag ${getTagClass(tag)}">${escapeHtml(tag)}</span>`).join('')}
                                </div>
                                <h3>${escapeHtml(post.title)}</h3>
                                <p class="excerpt">${escapeHtml(post.excerpt)}</p>
                                <div class="read-more">阅读更多 <i class="fas fa-arrow-right"></i></div>
                            </div>
                        </a>
                    `;
                });
                html += '</div>';
                relatedPostsContainer.innerHTML = html;
            } else {
                relatedPostsContainer.style.display = 'none';
            }
        })
        .catch(error => console.error('Error fetching related posts:', error));
});
