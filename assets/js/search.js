document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results-container');
    let articles = [];
    let isIndexBuilt = false;    // 定义需要爬取并索引的文章列表
    // 注意：这里的路径是相对于网站的根目录
    const articleUrls = [
        '/posts/academic/ai-ethics.html',
        '/posts/life/fate.html',
        '/posts/life/key.html',
        '/posts/life/military-training.html'
        // 在这里添加你所有文章的路径
    ];

    // 建立搜索索引
    async function buildIndex() {
        console.log('Building search index...');
        try {
            const fetchPromises = articleUrls.map(url =>
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                        }
                        return response.text();
                    }).then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');

                        // 检查是否为加密文章
                        const encryptedScript = doc.querySelector('#encryptedDataContainer');
                        const isEncryptedMeta = doc.querySelector('meta[name="article-encrypted"]');
                        const isEncrypted = !!(encryptedScript || isEncryptedMeta);

                        let title, category, categoryClass, snippet;

                        if (isEncrypted && isEncryptedMeta) {
                            // 对于加密文章，从meta标签读取信息
                            title = doc.querySelector('meta[name="article-title"]')?.getAttribute('content') || '无标题';
                            category = doc.querySelector('meta[name="article-category"]')?.getAttribute('content') || '无分类';
                            categoryClass = doc.querySelector('meta[name="article-category-class"]')?.getAttribute('content') || 'academic';
                            snippet = ''; // 加密文章不显示snippet
                        } else {
                            // 对于普通文章，从页面内容读取信息
                            title = doc.querySelector('h1')?.innerText || doc.querySelector('title')?.innerText?.replace(' - Jason\'s Blog', '') || '无标题';
                            const categoryElement = doc.querySelector('.post-category');
                            category = categoryElement?.innerText || '无分类';
                            categoryClass = categoryElement?.classList.contains('life') ? 'life' : 'academic';

                            // 提取第一段作为snippet
                            const firstParagraph = doc.querySelector('.article-content p')?.innerText || '';
                            snippet = firstParagraph.substring(0, 100) + (firstParagraph.length > 100 ? '...' : '');
                        }

                        return { url, title, category, categoryClass, snippet, isEncrypted };
                    })
            );

            const articleData = await Promise.all(fetchPromises);
            articles = articleData;
            isIndexBuilt = true;
            console.log('Search index built successfully:', articles);
        } catch (error) {
            console.error('Error building search index:', error);
        }
    }

    // 执行搜索
    function performSearch(query) {
        if (!query) {
            resultsContainer.style.display = 'none';
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const searchResults = articles.filter(article =>
            article.title.toLowerCase().includes(lowerCaseQuery) ||
            article.category.toLowerCase().includes(lowerCaseQuery) ||
            article.snippet.toLowerCase().includes(lowerCaseQuery)
        );

        displayResults(searchResults);
    }

    // 显示结果
    function displayResults(results) {
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item"><span class="search-result-snippet">没有找到相关文章。</span></div>';
            resultsContainer.style.display = 'block';
            return;
        } resultsContainer.innerHTML = results.map(result => `
            <div class="search-result-item ${result.isEncrypted ? 'encrypted' : ''}">
                <a href="${result.url}">
                    <div class="search-result-title">
                        ${result.isEncrypted ? '🔒 ' : ''}${result.title}
                    </div>
                    <span class="search-result-category ${result.categoryClass}">${result.category}</span>
                    ${result.snippet ? `<p class="search-result-snippet">${result.snippet}</p>` : ''}
                </a>
            </div>
        `).join('');

        resultsContainer.style.display = 'block';
    }

    // 当用户点击搜索框时，如果索引还未建立，则开始建立索引
    searchInput.addEventListener('focus', () => {
        if (!isIndexBuilt) {
            buildIndex();
        }
    });

    // 实时搜索
    searchInput.addEventListener('input', (e) => {
        if (isIndexBuilt) {
            performSearch(e.target.value);
        }
    });

    // 点击外部区域隐藏搜索结果
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
});
