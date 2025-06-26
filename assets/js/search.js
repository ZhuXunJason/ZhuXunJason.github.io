document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results-container');
    const searchIcon = document.querySelector('.search-icon');
    let articles = [];
    let isIndexBuilt = false;
    let searchTimeout = null;

    // 从 script 标签中获取 Jekyll 生成的文章数据
    function loadArticlesFromData() {
        const articlesDataElement = document.getElementById('search-articles-data');

        if (!articlesDataElement) {
            console.error('Search articles data element not found.');
            articles = [];
            isIndexBuilt = false;
            return;
        }

        try {
            const textContent = articlesDataElement.textContent.trim();

            if (!textContent) {
                console.warn('Search articles data element is empty.');
                articles = [];
                isIndexBuilt = false;
                return;
            }

            console.log('Raw JSON data:', textContent.substring(0, 200) + '...');

            const data = JSON.parse(textContent);

            if (!Array.isArray(data)) {
                console.error('Search data is not an array:', typeof data);
                articles = [];
                isIndexBuilt = false;
                return;
            }

            articles = data.filter(article => {
                const isValid = article &&
                    article.title &&
                    article.url &&
                    article.title.trim() !== '';

                if (!isValid) {
                    console.warn('Invalid article found:', article);
                }

                return isValid;
            });

            isIndexBuilt = true;
            console.log(`Successfully loaded ${articles.length} valid articles for search`);
            console.log('Sample article:', articles[0]);

        } catch (error) {
            console.error('Error parsing articles data:', error);
            console.error('Raw content:', articlesDataElement.textContent.substring(0, 500));
            articles = [];
            isIndexBuilt = false;
        }
    }

    // 格式化日期，只显示年份和月份
    function formatDateForSearch(dateString) {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // getMonth() 返回 0-11，需要加1
            return `${year}年${month}月`;
        } catch (error) {
            console.warn('Invalid date format:', dateString);
            return dateString; // 如果解析失败，返回原始字符串
        }
    }

    // 增强的文本相似度匹配
    function calculateRelevance(article, query) {
        const lowerQuery = query.toLowerCase();
        let score = 0;

        // 标题匹配 (最高权重)
        if (article.title) {
            const title = article.title.toLowerCase();
            if (title === lowerQuery) score += 100;
            else if (title.includes(lowerQuery)) score += 50;
            else {
                // 模糊匹配
                const words = lowerQuery.split(/\s+/);
                words.forEach(word => {
                    if (title.includes(word)) score += 20;
                });
            }
        }

        // 标签匹配 (中等权重)
        if (article.tags && Array.isArray(article.tags)) {
            article.tags.forEach(tag => {
                if (tag && tag.toLowerCase().includes(lowerQuery)) {
                    score += 30;
                }
            });
        }

        // 摘要/内容匹配 (较低权重)
        if (article.excerpt) {
            const excerpt = article.excerpt.toLowerCase();
            if (excerpt.includes(lowerQuery)) score += 10;

            // 检查查询词在摘要中的密度
            const queryOccurrences = (excerpt.match(new RegExp(lowerQuery, 'g')) || []).length;
            score += queryOccurrences * 5;
        }

        return score;
    }

    // 高亮搜索关键词 - 增强版
    function highlightText(text, query) {
        if (!query || !text) return text;

        // 转义特殊字符
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // 支持多个关键词
        const keywords = query.trim().split(/\s+/);
        let highlightedText = text;

        keywords.forEach(keyword => {
            if (keyword.length > 1) { // 忽略单字符搜索
                const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
            }
        });

        return highlightedText;
    }

    // 显示搜索结果 - 优化版
    function displayResults(results, query = '') {
        // 清除之前的超时
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result-item no-results">
                    <div class="search-result-title">没有找到相关文章</div>
                    <span class="search-result-snippet">尝试使用其他关键词进行搜索</span>
                </div>`;
            showResults();
            return;
        }

        // 限制显示结果数量以提高性能
        const maxResults = Math.min(results.length, 10);
        const limitedResults = results.slice(0, maxResults);

        resultsContainer.innerHTML = limitedResults.map((article, index) => {
            // 确定文章类别
            let categoryDisplay = '';
            let categoryClass = 'general';

            if (article.tags && article.tags.length > 0) {
                const firstTag = article.tags[0].toLowerCase();
                categoryDisplay = article.tags[0];
                if (firstTag === 'academic' || firstTag === '学术') {
                    categoryClass = 'academic';
                } else if (firstTag === 'life' || firstTag === '生活') {
                    categoryClass = 'life';
                }
            } else if (article.category) {
                categoryDisplay = article.category;
                categoryClass = article.category.toLowerCase();
            }

            // 生成摘要并高亮关键词
            const snippet = article.excerpt;
            const highlightedTitle = highlightText(article.title, query);
            const highlightedSnippet = highlightText(snippet, query);

            return `
                <a href="${article.url}" class="search-result-item" data-index="${index}">
                    <div class="search-result-title">${highlightedTitle}</div>
                    <div class="search-result-meta">
                        ${categoryDisplay ? `<span class="search-result-category ${categoryClass}">${categoryDisplay}</span>` : ''}
                        ${article.date ? `<span class="search-result-date">${formatDateForSearch(article.date)}</span>` : ''}
                    </div>
                    <p class="search-result-snippet">${highlightedSnippet}</p>
                </a>
            `;
        }).join('');

        // 如果有更多结果，显示提示
        if (results.length > maxResults) {
            resultsContainer.innerHTML += `
                <div class="search-result-item more-results">
                    <div class="search-result-snippet">还有 ${results.length - maxResults} 个相关结果...</div>
                </div>`;
        }

        showResults();
    }

    // 显示搜索结果容器
    function showResults() {
        resultsContainer.style.display = 'block';
        // 强制重排以确保动画正常工作
        resultsContainer.offsetHeight;
        resultsContainer.classList.add('show');
    }

    // 隐藏搜索结果容器
    function hideResults() {
        resultsContainer.classList.remove('show');
        searchTimeout = setTimeout(() => {
            resultsContainer.style.display = 'none';
        }, 300); // 匹配CSS过渡时间
    }

    // 执行搜索 - 优化版
    function performSearch(query) {
        if (!query || !query.trim()) {
            hideResults();
            return;
        }

        const trimmedQuery = query.trim();

        // 最小查询长度检查
        if (trimmedQuery.length < 2) {
            hideResults();
            return;
        }

        if (!isIndexBuilt) {
            resultsContainer.innerHTML = `
                <div class="search-result-item loading">
                    <div class="search-result-title">搜索索引正在加载...</div>
                    <div class="search-result-snippet">请稍后再试</div>
                </div>`;
            showResults();
            return;
        }

        if (articles.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result-item no-data">
                    <div class="search-result-title">暂无可搜索的文章</div>
                    <div class="search-result-snippet">请检查网站配置</div>
                </div>`;
            showResults();
            return;
        }

        try {
            const lowerCaseQuery = trimmedQuery.toLowerCase();

            // 计算每篇文章的相关性分数
            const searchResults = articles
                .map(article => ({
                    ...article,
                    relevance: calculateRelevance(article, trimmedQuery)
                }))
                .filter(article => article.relevance > 0)
                .sort((a, b) => b.relevance - a.relevance);

            displayResults(searchResults, trimmedQuery);

        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div class="search-result-item error">
                    <div class="search-result-title">搜索出错</div>
                    <div class="search-result-snippet">请刷新页面重试</div>
                </div>`;
            showResults();
        }
    }

    // 防抖函数 - 优化版
    function debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // 页面加载时加载文章数据
    loadArticlesFromData();

    // 搜索功能事件监听
    const debouncedSearch = debounce(performSearch, 250);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            performSearch(searchInput.value);
        }
    });

    searchInput.addEventListener('blur', () => {
        // 延迟隐藏以允许点击搜索结果
        setTimeout(() => {
            hideResults();
        }, 200);
    });

    // 搜索图标点击事件
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            searchInput.focus();
            if (searchInput.value.trim()) {
                performSearch(searchInput.value);
            }
        });
    }

    // 点击其他地方隐藏搜索结果
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideResults();
        }
    });

    // 防止搜索结果容器点击时隐藏
    resultsContainer.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 键盘导航支持 - 增强版
    let selectedIndex = -1;

    searchInput.addEventListener('keydown', (e) => {
        const items = resultsContainer.querySelectorAll('.search-result-item:not(.no-results):not(.loading):not(.error):not(.more-results)');

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    // 模拟点击
                    items[selectedIndex].click();
                } else if (searchInput.value.trim()) {
                    // 如果没有选中项但有搜索内容，选择第一个结果
                    if (items.length > 0) {
                        items[0].click();
                    }
                }
                break;
            case 'Escape':
                hideResults();
                searchInput.blur();
                selectedIndex = -1;
                break;
            case 'Tab':
                // Tab 键切换焦点时隐藏结果
                setTimeout(() => hideResults(), 100);
                break;
        }
    });

    function updateSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });

        // 滚动到选中项
        if (selectedIndex >= 0 && items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }

    // 鼠标悬停更新选中状态
    resultsContainer.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.search-result-item:not(.no-results):not(.loading):not(.error):not(.more-results)');
        if (item) {
            const items = resultsContainer.querySelectorAll('.search-result-item:not(.no-results):not(.loading):not(.error):not(.more-results)');
            selectedIndex = Array.from(items).indexOf(item);
            updateSelection(items);
        }
    });
});