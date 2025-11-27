document.addEventListener('DOMContentLoaded', function () {
    // 主题初始化（根据时间自动切换：19:00-06:00 为暗色模式）
    (function initTheme() {
        const root = document.documentElement;

        function setThemeByTime() {
            const hour = new Date().getHours();
            // 19:00 (晚7点) 到 06:00 (早6点) 为暗色模式
            const isDarkTime = hour >= 19 || hour < 6;
            const theme = isDarkTime ? 'dark' : 'light';
            root.setAttribute('data-theme', theme);
        }

        // 初始设置
        setThemeByTime();

        // 每分钟检查一次时间，确保准时切换
        setInterval(setThemeByTime, 60000);

        // 如果有手动切换按钮，保留其功能（可选）
        const toggle = document.getElementById('modeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const cur = root.getAttribute('data-theme') || 'light';
                const next = cur === 'light' ? 'dark' : 'light';
                root.setAttribute('data-theme', next);
                // 注意：手动切换后，下一分钟会根据时间重新设置
            });
        }
    })();

    // 修复移动端地址栏导致的视口高度抖动：设置 CSS 变量 --vh 为 window.innerHeight 的 1%
    (function initVhVariable() {
        function setVh() {
            try {
                document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            } catch (e) {
                // 忽略在某些旧浏览器上可能抛出的异常
            }
        }

        // 初始设置
        setVh();

        // 防抖更新（resize 频繁触发）
        let resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setVh, 120);
        });

        // 方向切换可能不会触发 resize 或会延迟，额外调用保障
        window.addEventListener('orientationchange', function () {
            setTimeout(setVh, 200);
        });

        // pageshow 用于处理 bfcache 恢复（例如后退）
        window.addEventListener('pageshow', function (e) {
            if (e.persisted) setVh();
        });
    })();

    // 移动端：单一按钮搜索形变
    (function initMorphSearch() {
        const header = document.querySelector('.header');
        const wrap = document.querySelector('.search__wrap');
        const input = document.getElementById('search-input');
        if (!header || !wrap || !input) return;
        wrap.addEventListener('click', (e) => {
            const small = matchMedia('(max-width:780px)').matches;
            if (!small) return;
            if (header.classList.contains('is-searching') && e.target === input) return;
            header.classList.toggle('is-searching');
            if (header.classList.contains('is-searching')) setTimeout(() => input.focus(), 10); else input.value = '';
        });
        document.addEventListener('click', (e) => {
            const small = matchMedia('(max-width:780px)').matches;
            if (!small) return;
            if (!header.contains(e.target)) header.classList.remove('is-searching');
        });
    })();

    // 增强的打字机效果
    function typeWriter() {
        const texts = [
            "Welcome to my Blog",
            "欢迎来到我的博客",
        ];
        const element = document.getElementById('typewriter-text');
        if (!element) return;

        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const pauseTime = 2000;

        function type() {
            const currentText = texts[textIndex];

            if (isDeleting) {
                element.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                element.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let speed = isDeleting ? deleteSpeed : typeSpeed;

            if (!isDeleting && charIndex === currentText.length) {
                speed = pauseTime;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                speed = 500;
            }

            setTimeout(type, speed);
        }

        // 启动打字效果
        setTimeout(type, 1000);
    }

    // 执行打字机效果
    typeWriter();

    // 导航栏滚动效果增强
    const header = document.querySelector('header');
    const scrollThreshold = 50;

    window.addEventListener('scroll', function () {
        const scrolled = window.scrollY;

        if (scrolled > scrollThreshold) {
            header.classList.add('scrolled');
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.classList.remove('scrolled');
            header.style.backdropFilter = '';
            header.style.backgroundColor = '';
        }
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 移动端导航菜单
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function () {
            const navMenu = document.querySelector('nav ul');
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // 点击导航菜单项后立即关闭菜单
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function () {
            const navMenu = document.querySelector('nav ul');
            const toggle = document.querySelector('.nav-toggle');
            if (navMenu && toggle && window.innerWidth <= 768) {
                // 添加关闭动画
                navMenu.classList.add('closing');
                toggle.classList.remove('active');

                setTimeout(() => {
                    navMenu.classList.remove('active', 'closing');
                }, 300);
            }
        });
    });

    // 点击页面其他区域关闭导航菜单（仅在移动端执行）
    document.addEventListener('click', function (e) {
        // 只在移动端（窗口宽度 <= 768px）执行导航菜单关闭逻辑
        if (window.innerWidth > 768) {
            return;
        }

        const nav = document.querySelector('nav');
        const navMenu = document.querySelector('nav ul');
        const toggle = document.querySelector('.nav-toggle');
        const searchContainer = document.querySelector('.search-container');

        // 如果点击的是搜索容器内的元素，不关闭菜单
        if (searchContainer && searchContainer.contains(e.target)) {
            return;
        }

        if (nav && !nav.contains(e.target) && navMenu && toggle) {
            // 平滑关闭菜单，避免闪烁
            navMenu.classList.add('closing');
            toggle.classList.remove('active');

            setTimeout(() => {
                navMenu.classList.remove('active', 'closing');
            }, 300);
        }
    });

    // 修复搜索框失焦闪烁问题
    const searchInput = document.getElementById('search-input');
    const searchContainer = document.querySelector('.search-container');

    if (searchInput && searchContainer) {
        // 防止搜索框失焦时的闪烁
        let searchFocusTimeout;

        searchInput.addEventListener('focus', function () {
            clearTimeout(searchFocusTimeout);
            this.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        searchInput.addEventListener('blur', function () {
            // 延迟应用失焦样式，防止闪烁
            searchFocusTimeout = setTimeout(() => {
                this.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 100);
        });

        // 搜索容器点击事件
        searchContainer.addEventListener('click', function (e) {
            if (e.target === searchInput) {
                e.stopPropagation();
            }
        });
    }

    // 窗口大小调整时重置导航菜单状态
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            const navMenu = document.querySelector('nav ul');
            const toggle = document.querySelector('.nav-toggle');
            if (navMenu && toggle) {
                // 在桌面端时，确保导航菜单状态正常
                navMenu.style.display = '';
                navMenu.classList.remove('active');
                toggle.classList.remove('active');
            }
            // 移除移动端类
            document.body.classList.remove('mobile-body');
            const header = document.querySelector('header');
            if (header) {
                header.classList.remove('mobile-header');
            }
        } else {
            // 添加移动端类
            document.body.classList.add('mobile-body');
            const header = document.querySelector('header');
            if (header) {
                header.classList.add('mobile-header');
            }
        }
    });

    // 初始化移动端样式类
    function initMobileClasses() {
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-body');
            const header = document.querySelector('header');
            if (header) {
                header.classList.add('mobile-header');
            }
        }
    }

    // 页面加载完成后初始化
    initMobileClasses();

    // 图片懒加载
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }); document.querySelectorAll('img[data-src]').forEach(img => {
            imgObserver.observe(img);
        });
    }

    // 动态签名SVG初始化
    const newSignaturePath = document.querySelector('.dynamic-jason-signature-new path#jason-new-path');
    if (newSignaturePath) {
        const length = newSignaturePath.getTotalLength();

        document.documentElement.style.setProperty('--path-length', length);

        // 设置stroke-dash属性
        newSignaturePath.style.strokeDasharray = length;
        newSignaturePath.style.strokeDashoffset = length;

        console.log('SVG签名路径长度:', length); // 调试信息
    }

    // Back to top button functionality
    const backToTopButton = document.getElementById("back-to-top-btn");

    if (backToTopButton) {
        window.addEventListener("scroll", () => {
            if (window.pageYOffset > 300) { // Show button after scrolling 300px
                backToTopButton.style.display = "block";
            } else {
                backToTopButton.style.display = "none";
            }
        });

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // 音乐控件功能
    function initMusicController() {
        const musicController = document.getElementById("music-controller");
        const musicBtn = document.getElementById("music-btn");
        const backgroundMusic = document.getElementById("background-music");

        if (!musicController || !musicBtn || !backgroundMusic) return;

        let isPlaying = false;

        // 设置音乐音量
        backgroundMusic.volume = 0.08;

        // 音乐控件始终显示（仅在生活类文章中）
        if (musicController) {
            musicController.style.display = "block";
        }

        // 播放/暂停切换功能
        musicBtn.addEventListener("click", () => {
            if (isPlaying) {
                backgroundMusic.pause();
                musicBtn.classList.remove("playing");
                musicBtn.classList.add("paused");
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                isPlaying = false;
            } else {
                // 尝试播放音乐
                const playPromise = backgroundMusic.play();

                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        musicBtn.classList.remove("paused");
                        musicBtn.classList.add("playing");
                        musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                        isPlaying = true;
                    }).catch((error) => {
                        console.log("音乐播放失败:", error);
                        // 显示提示信息
                        musicBtn.title = "请先与页面交互后再尝试播放";
                    });
                }
            }
        });

        // 音乐加载错误处理
        backgroundMusic.addEventListener("error", () => {
            console.log("音乐文件加载失败");
            musicBtn.style.opacity = "0.5";
            musicBtn.style.cursor = "not-allowed";
            musicBtn.title = "音乐文件加载失败";
        });

        // 音乐播放结束时重置状态
        backgroundMusic.addEventListener("ended", () => {
            musicBtn.classList.remove("playing");
            musicBtn.classList.add("paused");
            musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            isPlaying = false;
        });

        // 页面离开时暂停音乐
        window.addEventListener("beforeunload", () => {
            if (!backgroundMusic.paused) {
                backgroundMusic.pause();
            }
        });
    }

    // 初始化音乐控件
    initMusicController();

    // 代码块复制功能
    function initCodeCopy() {
        // 为所有代码块添加复制按钮和文件类型标签
        const highlights = document.querySelectorAll('.highlight');

        highlights.forEach((highlight, index) => {
            const pre = highlight.querySelector('pre');
            if (!pre) return;

            // 检测语言类型
            let language = 'text';
            const languageClass = highlight.className.match(/language-(\w+)/);
            if (languageClass) {
                language = languageClass[1];
            } else {
                // 从父元素或其他地方检测语言
                const parent = highlight.closest('[class*="language-"]');
                if (parent) {
                    const match = parent.className.match(/language-(\w+)/);
                    if (match) language = match[1];
                }
            }

            // 创建语言标签
            const langLabel = document.createElement('span');
            langLabel.className = 'lang-label';
            langLabel.textContent = language;
            highlight.appendChild(langLabel);

            // 创建复制按钮
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.setAttribute('data-code-index', index);

            // 添加复制按钮到highlight容器
            highlight.appendChild(copyBtn);

            // 复制功能
            copyBtn.addEventListener('click', async function () {
                const code = pre.textContent;

                try {
                    await navigator.clipboard.writeText(code);

                    // 显示复制成功状态
                    copyBtn.classList.add('copied');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>Copied!';

                    // 2秒后恢复原状
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);

                } catch (err) {
                    console.error('复制失败:', err);
                }
            });
        });
    }

    // 初始化代码复制功能
    initCodeCopy();

    function createFootnoteTooltips() {
        // kramdown 会为脚注引用生成 class="footnote" 的 <a> 标签
        const footnoteLinks = document.querySelectorAll('a.footnote');

        footnoteLinks.forEach(link => {
            // 1. 获取脚注定义的 ID (例如，从 href="#fn:1" 中获取 "fn:1")
            const footnoteId = link.href.split('#').pop();
            if (!footnoteId) return;

            // 2. 根据 ID 找到对应的脚注定义元素
            const footnoteElement = document.getElementById(footnoteId);
            if (!footnoteElement) return;

            // 3. 复制脚注内容。我们使用 innerHTML 来保留格式，并移除返回链接
            let footnoteContent = footnoteElement.innerHTML.trim();
            footnoteContent = footnoteContent.replace(/<a.+?class="reversefootnote".+?<\/a>/, ''); // 移除 "↩" 返回链接

            // 4. 创建 tooltip 元素
            const tooltip = document.createElement('span');
            tooltip.classList.add('footnote-tooltip');
            tooltip.innerHTML = footnoteContent;

            // 5. 将 tooltip 插入到脚注引用的父元素 (<sup>) 中
            if (link.parentElement && link.parentElement.tagName === 'SUP') {
                link.parentElement.appendChild(tooltip);
            }
        });
    }

    // 执行函数
    createFootnoteTooltips();

});
