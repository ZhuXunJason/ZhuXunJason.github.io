document.addEventListener('DOMContentLoaded', function () {
    const relatedPostsContainer = document.getElementById('related-posts-container');
    const currentPostUrl = window.location.pathname;

    if (!relatedPostsContainer) {
        return;
    }

    const tagsElement = document.querySelector('.post-tags');
    if (!tagsElement) return;

    const currentTags = Array.from(tagsElement.querySelectorAll('.post-tag')).map(tag => tag.textContent.trim());
    if (currentTags.length === 0) return;

    fetch('/assets/json/posts.json')
        .then(response => response.json())
        .then(posts => {
            const relatedPosts = posts.map(post => {
                if (post.url === currentPostUrl) {
                    return null;
                }

                const commonTags = post.tags ? post.tags.filter(tag => currentTags.includes(tag)) : [];
                const score = commonTags.length;
                return { ...post, score };
            })
            .filter(post => post && post.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

            if (relatedPosts.length > 0) {
                let html = '<h3>相关推荐</h3><div class="related-articles-grid">';
                relatedPosts.forEach(post => {
                    // Determine tag class based on the first tag
                    let tagClass = 'default';
                    if (post.tags && post.tags.length > 0) {
                        const lowerTag = post.tags[0].toLowerCase();
                        if (lowerTag === '学术' || lowerTag === 'academic') {
                            tagClass = 'academic';
                        } else if (lowerTag === '生活' || lowerTag === 'life') {
                            tagClass = 'life';
                        }
                    }

                    html += `
                        <article class="post-card">
                            ${post.image ? `<a href="${post.url}" class="post-img"><img src="${post.image}" alt="${post.title}" loading="lazy"></a>` : ''}
                            <div class="post-content">
                                <div class="post-tags">
                                    ${post.tags.map(tag => `<span class="post-tag ${tagClass}">${tag}</span>`).join('')}
                                </div>
                                <h3><a href="${post.url}">${post.title}</a></h3>
                                <p class="excerpt">${post.excerpt}</p>
                                <p class="post-date">${post.date}</p>
                                <a href="${post.url}" class="read-more">阅读更多 <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </article>
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