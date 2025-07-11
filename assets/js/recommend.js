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
                // Helper function to get tag class
                const getTagClass = (tag) => {
                    const lowerTag = tag.toLowerCase();
                    if (lowerTag === '学术' || lowerTag === 'academic') {
                        return 'academic';
                    } else if (lowerTag === '生活' || lowerTag === 'life') {
                        return 'life';
                    } else {
                        return 'default';
                    }
                };

                // Helper function to format date
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    const year = date.getFullYear().toString();
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    return `${year}年${month}月`;
                };

                let html = '<h3>相关推荐</h3><div class="related-articles-grid">';
                relatedPosts.forEach(post => {
                    html += `
                        <a href="${post.url}" class="post-card">
                            <div class="post-img"><img src="${post.image}" alt="${post.title}" loading="lazy"></div>
                            <div class="post-content">
                                <div class="post-tags">
                                    ${post.tags.map(tag => `<span class="post-tag ${getTagClass(tag)}">${tag}</span>`).join('')}
                                </div>
                                <h3>${post.title}</h3>
                                <p class="excerpt">${post.excerpt}</p>
                                <p class="post-date">${formatDate(post.date)}</p>
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