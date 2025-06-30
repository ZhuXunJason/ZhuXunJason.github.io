document.addEventListener('DOMContentLoaded', function () {
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
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
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
    });    // 移动端导航菜单
    const navToggle = document.createElement('div');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = `
        <div class="hamburger">
            <span class="line line1"></span>
            <span class="line line2"></span>
            <span class="line line3"></span>
        </div>
    `;
    const nav = document.querySelector('nav');
    nav.appendChild(navToggle); navToggle.addEventListener('click', function () {
        const navMenu = document.querySelector('nav ul');
        const isActive = this.classList.contains('active');

        this.classList.toggle('active');
        navMenu.classList.toggle('active');

        // 为每个菜单项添加延迟动画
        if (!isActive) {
            const menuItems = navMenu.querySelectorAll('li');
            menuItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
            });
        }
    });

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

    // 订阅表单处理
    const subscribeForm = document.querySelector('.subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');

            if (emailInput.value) {
                // 这里应该是发送到后端或API的代码
                alert('感谢您的订阅！');
                emailInput.value = '';
            } else {
                alert('请输入有效的电子邮箱地址');
            }
        });
    }

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
});
