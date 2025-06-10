document.addEventListener('DOMContentLoaded', function () {    // 打字机效果
    function typeWriter() {
        const text = "Welcome to my blog";
        const element = document.getElementById('typewriter-text');
        if (!element) return;

        let i = 0;
        element.textContent = ''; // 清空内容

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, 100); // 每个字符间隔100ms
            }
        }

        // 延迟500ms开始打字效果
        setTimeout(type, 500);
    }

    // 执行打字机效果
    typeWriter();

    // 导航栏滚动效果
    const header = document.querySelector('header');
    const scrollThreshold = 100;

    window.addEventListener('scroll', function () {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
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
    });// 点击导航菜单项后立即关闭菜单
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
    });// 点击页面其他区域关闭导航菜单（仅在移动端执行）
    document.addEventListener('click', function (e) {
        // 只在移动端（窗口宽度 <= 768px）执行导航菜单关闭逻辑
        if (window.innerWidth > 768) {
            return;
        }

        const nav = document.querySelector('nav');
        const navMenu = document.querySelector('nav ul');
        const toggle = document.querySelector('.nav-toggle');

        if (nav && !nav.contains(e.target) && navMenu && toggle) {
            // 立即隐藏菜单，避免闪烁
            navMenu.style.display = 'none';
            navMenu.classList.remove('active');
            toggle.classList.remove('active');

            // 短暂延迟后恢复正常显示状态
            setTimeout(() => {
                navMenu.style.display = '';
            }, 50);
        }
    });    // 窗口大小调整时重置导航菜单状态
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
