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
    nav.appendChild(navToggle);

    navToggle.addEventListener('click', function () {
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
    });    // 点击导航菜单项后立即关闭菜单
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
    });

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
        }
    });    // 添加CSS样式到头部
    const style = document.createElement('style');
    style.textContent = `
        .nav-toggle {
            display: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        
        .nav-toggle:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        /* 汉堡菜单图标样式 */
        .hamburger {
            width: 24px;
            height: 18px;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .hamburger .line {
            width: 100%;
            height: 2px;
            background-color: var(--text-color, #333);
            border-radius: 1px;
            transition: all 0.3s ease;
            transform-origin: center;
        }
        
        /* 汉堡菜单激活状态动画 */
        .nav-toggle.active .line1 {
            transform: translateY(8px) rotate(45deg);
        }
        
        .nav-toggle.active .line2 {
            opacity: 0;
            transform: scaleX(0);
        }
        
        .nav-toggle.active .line3 {
            transform: translateY(-8px) rotate(-45deg);
        }

        @media (max-width: 768px) {
            nav {
                position: relative;
            }
            
            .nav-toggle {
                display: block;
                position: relative;
                margin-left: auto;
                order: 3;
                flex: 0 0 auto;
                z-index: 1002;
            }

            nav ul {
                display: none !important;
                flex-direction: column;
                width: 100%;
                text-align: center;
                padding: 1.5rem 0;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(10px);
                position: absolute;
                top: 100%;
                left: 0;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                border-top: 1px solid rgba(0, 0, 0, 0.05);
                margin: 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            }
            
            nav ul.active {
                display: flex !important;
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
                z-index: 1002;
            }
            
            nav ul li {
                margin: 0.8rem 0;
                opacity: 0;
                transform: translateX(-20px);
                animation: slideInFromLeft 0.3s ease forwards;
            }
            
            nav ul.active li {
                animation: slideInFromLeft 0.3s ease forwards;
            }
            
            /* 菜单项滑入动画 */
            @keyframes slideInFromLeft {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            nav ul li a {
                display: block;
                padding: 0.8rem 1.5rem;
                border-radius: 6px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            nav ul li a::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
                transition: left 0.5s ease;
            }
            
            nav ul li a:hover::before {
                left: 100%;
            }
            
            nav ul li a:hover {
                background-color: rgba(37, 99, 235, 0.05);
                color: var(--primary-color, #2563eb);
                transform: translateY(-2px);
            }

            /* 确保导航栏在移动端正确显示 */
            header {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                z-index: 1001 !important;
            }

            /* 密码输入框在移动端的层级调整 */
            #password-prompt-overlay {
                z-index: 1003 !important;
            }
        }
        
        header.scrolled {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);

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
