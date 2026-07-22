/* 文章聚合页逻辑（archive.html）
 * 数据源：/assets/json/posts.json（经 posts-data.js 加载）
 * 分类树：assets/js/category-config.js（window.BLOG_CATEGORY_TREE）
 * 工具：  assets/js/post-utils.js（window.BlogPostUtils）
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const categoryTree = window.BLOG_CATEGORY_TREE;
        const postUtils = window.BlogPostUtils;
        const loadPosts = window.loadBlogPostsData;

        const aside = document.getElementById('archive-tree');
        const treeList = aside && aside.querySelector('.archive-tree__list');
        const grid = document.getElementById('archive-grid');
        const breadcrumb = document.querySelector('.archive-breadcrumb');
        const countEl = document.querySelector('.archive-count');
        const emptyEl = document.querySelector('.archive-empty');
        const toggleBtn = document.querySelector('.archive-tree-toggle');

        if (!Array.isArray(categoryTree) || !postUtils || typeof loadPosts !== 'function'
            || !aside || !treeList || !grid || !breadcrumb || !countEl || !emptyEl || !toggleBtn) {
            return;
        }

        const { escapeHtml, formatYearMonth, getTagClass, normalizeTag } = postUtils;
        const mobileQuery = window.matchMedia('(max-width: 768px)');

        // 虚拟根节点「全部文章」（不进配置文件）
        const ALL_NODE = { id: 'all', label: '全部文章', matchedPosts: [], count: 0 };

        let allPosts = [];
        const nodeByPath = new Map(); // pathStr -> { node, pathIds, labels, pathStr }

        /* ---------------- 匹配与建树 ---------------- */

        // 单篇文章是否命中节点自身条件（exclude 仅作用于本节点）
        function selfMatch(node, tagSet) {
            const matched = (node.match || []).every(t => tagSet.has(normalizeTag(t)));
            const excluded = (node.exclude || []).some(t => tagSet.has(normalizeTag(t)));
            return matched && !excluded;
        }

        // 后序递归：节点命中 = 自身命中 ∪ 子孙命中（按 url 去重），结果挂载到节点
        function collectNodePosts(node, posts) {
            const byUrl = new Map();
            for (const p of posts) {
                if (selfMatch(node, p.tagSet)) byUrl.set(p.url, p);
            }
            for (const child of node.children || []) {
                for (const p of collectNodePosts(child, posts)) byUrl.set(p.url, p);
            }
            node.matchedPosts = [...byUrl.values()];
            node.count = node.matchedPosts.length;
            return node.matchedPosts;
        }

        function indexNode(node, pathIds, labels) {
            const entry = { node, pathIds, labels, pathStr: pathIds.join('/') };
            nodeByPath.set(entry.pathStr, entry);
            (node.children || []).forEach(child =>
                indexNode(child, [...pathIds, child.id], [...labels, child.label]));
        }

        /* ---------------- 树渲染 ---------------- */

        function createTreeItem(node, pathIds, depth) {
            const li = document.createElement('li');
            li.setAttribute('role', 'treeitem');
            const hasChildren = Array.isArray(node.children) && node.children.length > 0;
            const expanded = hasChildren && depth === 0; // 默认仅展开第一层
            if (hasChildren) li.setAttribute('aria-expanded', expanded ? 'true' : 'false');

            const row = document.createElement('div');
            row.className = 'archive-tree__row';

            if (hasChildren) {
                const expander = document.createElement('button');
                expander.type = 'button';
                expander.className = 'archive-tree__expander';
                expander.setAttribute('aria-label', '展开或收起 ' + node.label);
                expander.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';
                row.appendChild(expander);
            } else {
                const spacer = document.createElement('span');
                spacer.className = 'archive-tree__expander archive-tree__expander--placeholder';
                spacer.setAttribute('aria-hidden', 'true');
                row.appendChild(spacer);
            }

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'archive-tree__btn';
            btn.dataset.path = pathIds.join('/');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'archive-tree__label';
            labelSpan.textContent = node.label;
            btn.appendChild(labelSpan);

            const countSpan = document.createElement('span');
            countSpan.className = 'archive-tree__count';
            countSpan.textContent = String(node.count);
            btn.appendChild(countSpan);

            row.appendChild(btn);
            li.appendChild(row);

            if (hasChildren) {
                const group = document.createElement('ul');
                group.setAttribute('role', 'group');
                group.className = 'archive-tree__children';
                group.hidden = !expanded;
                for (const child of node.children) {
                    group.appendChild(createTreeItem(child, [...pathIds, child.id], depth + 1));
                }
                li.appendChild(group);
            }
            return li;
        }

        function renderTreeItems() {
            treeList.appendChild(createTreeItem(ALL_NODE, ['all'], 0));
            for (const node of categoryTree) {
                treeList.appendChild(createTreeItem(node, [node.id], 0));
            }
        }

        function setExpanded(btn, expanded) {
            const li = btn && btn.closest('li[role="treeitem"]');
            if (!li || li.getAttribute('aria-expanded') === null) return;
            li.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            const group = li.querySelector(':scope > .archive-tree__children');
            if (group) group.hidden = !expanded;
        }

        /* ---------------- 选中与内容渲染 ---------------- */

        function renderBreadcrumb(labels) {
            breadcrumb.textContent = '';
            const segments = labels.length > 1 ? ['全部文章', ...labels] : labels;
            segments.forEach((label, i) => {
                if (i > 0) {
                    const sep = document.createElement('span');
                    sep.className = 'archive-breadcrumb__sep';
                    sep.textContent = '/';
                    sep.setAttribute('aria-hidden', 'true');
                    breadcrumb.appendChild(sep);
                }
                const item = document.createElement('span');
                item.className = 'archive-breadcrumb__item';
                if (i === segments.length - 1) item.classList.add('current');
                item.textContent = label;
                breadcrumb.appendChild(item);
            });
        }

        function renderCards(list) {
            if (!list.length) {
                grid.innerHTML = '';
                emptyEl.hidden = false;
                return;
            }
            emptyEl.hidden = true;

            let html = '';
            for (const post of list) {
                const postTags = Array.isArray(post.tags) ? post.tags : [];
                const tagsHtml = postTags.length
                    ? postTags.map(t => `<span class="post-tag ${getTagClass(t)}">${escapeHtml(t)}</span>`).join('')
                    : '';
                html += `
                    <a href="${escapeHtml(post.url)}" class="post-card">
                        <div class="post-img"><img src="${escapeHtml(post.image || '/assets/images/default.webp')}" alt="${escapeHtml(post.title)}" loading="lazy"></div>
                        <div class="post-content">
                            <div class="post-tags">${tagsHtml}</div>
                            <h3>${escapeHtml(post.title)}</h3>
                            <time class="post-date">${escapeHtml(formatYearMonth(post.date))}</time>
                            <p class="excerpt">${escapeHtml(post.excerpt || '')}</p>
                            <div class="read-more">阅读更多 <i class="fas fa-arrow-right" aria-hidden="true"></i></div>
                        </div>
                    </a>`;
            }
            grid.innerHTML = html;

            // 入场动画（与首页卡片同一套 homeCardEnter）
            const cards = [...grid.querySelectorAll('.post-card')];
            cards.forEach((c, i) => {
                c.style.setProperty('--d', `${Math.min(i * 40, 400)}ms`);
                c.classList.add('appearing');
            });
            setTimeout(() => cards.forEach(c => c.classList.remove('appearing')), 900);
        }

        function selectNode(pathStr, fromUser) {
            const entry = nodeByPath.get(pathStr) || nodeByPath.get('all');
            const { node, pathIds, labels } = entry;

            // 树 active 态
            treeList.querySelectorAll('.archive-tree__btn').forEach(b => {
                const active = b.dataset.path === entry.pathStr;
                b.classList.toggle('active', active);
                if (active) b.setAttribute('aria-current', 'true');
                else b.removeAttribute('aria-current');
            });

            // 展开目标路径的所有祖先
            for (let i = 1; i < pathIds.length; i++) {
                const ancestorBtn = treeList.querySelector(`.archive-tree__btn[data-path="${pathIds.slice(0, i).join('/')}"]`);
                if (ancestorBtn) setExpanded(ancestorBtn, true);
            }

            renderBreadcrumb(labels);
            countEl.textContent = `共 ${node.matchedPosts.length} 篇`;
            renderCards(node.matchedPosts);

            // hash 深链（replaceState 避免污染历史记录）
            const newHash = '#/' + pathIds.join('/');
            if (window.location.hash !== newHash) {
                history.replaceState(null, '', newHash);
            }

            // 移动端：选中后自动收起分类面板
            if (fromUser && mobileQuery.matches) closePanel();
        }

        /* ---------------- hash 深链 ---------------- */

        function resolveHash() {
            const raw = window.location.hash.replace(/^#\/?/, '');
            if (!raw) return 'all';
            const ids = raw.split('/').filter(Boolean);
            if (!ids.length || ids[0] === 'all') return 'all';

            let nodes = categoryTree;
            const valid = [];
            for (const id of ids) {
                const node = (nodes || []).find(n => n.id === id);
                if (!node) return 'all'; // 非法路径静默回退
                valid.push(id);
                nodes = node.children;
            }
            return valid.join('/');
        }

        /* ---------------- 移动端面板 ---------------- */

        function closePanel() {
            aside.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        /* ---------------- 事件绑定与初始化 ---------------- */

        function bindEvents() {
            treeList.addEventListener('click', e => {
                const expander = e.target.closest('.archive-tree__expander');
                if (expander) {
                    const li = expander.closest('li[role="treeitem"]');
                    setExpanded(expander, li.getAttribute('aria-expanded') !== 'true');
                    return;
                }
                const btn = e.target.closest('.archive-tree__btn');
                if (btn) selectNode(btn.dataset.path, true);
            });

            toggleBtn.addEventListener('click', () => {
                const open = aside.classList.toggle('open');
                toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            window.addEventListener('hashchange', () => selectNode(resolveHash(), false));
        }

        loadPosts()
            .then(posts => {
                allPosts = (Array.isArray(posts) ? posts : []).filter(p => p && p.title && p.url);
                allPosts.forEach(p => {
                    p.tagSet = new Set((Array.isArray(p.tags) ? p.tags : []).map(normalizeTag));
                });
                // 日期格式为 YYYY-MM-DD，字符串比较即降序
                allPosts.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

                ALL_NODE.matchedPosts = allPosts;
                ALL_NODE.count = allPosts.length;
                categoryTree.forEach(node => collectNodePosts(node, allPosts));

                nodeByPath.set('all', { node: ALL_NODE, pathIds: ['all'], labels: [ALL_NODE.label], pathStr: 'all' });
                categoryTree.forEach(node => indexNode(node, [node.id], [node.label]));

                renderTreeItems();
                aside.hidden = false;
                bindEvents();
                selectNode(resolveHash(), false);
            })
            .catch(error => {
                console.error('Error loading archive posts:', error);
                grid.innerHTML = '';
                emptyEl.innerHTML = '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i> 文章数据加载失败，请稍后重试';
                emptyEl.hidden = false;
            });
    });
})();
