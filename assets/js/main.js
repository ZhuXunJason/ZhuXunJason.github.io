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

    // 动态粒子背景初始化
    function initParticleBackground() {
        const banner = document.querySelector('.banner');
        if (!banner) return;

        // 创建粒子容器
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        banner.appendChild(particleContainer);

        // 创建粒子
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particleContainer.appendChild(particle);
        }
    }

    // 初始化粒子背景
    initParticleBackground();

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

    // SVG动态签名修复s和动画
    function initSVGSignature() {
        const svgElement = document.querySelector('.dynamic-jason-signature-new');
        const pathElement = svgElement ? svgElement.querySelector('path') : null;

        if (svgElement && pathElement) {
            // 确保SVG可见
            svgElement.style.opacity = '1';
            svgElement.style.visibility = 'visible';

            // 添加动画类
            svgElement.classList.add('svg-animated');

            // 计算路径长度并设置动画
            const pathLength = pathElement.getTotalLength();
            pathElement.style.strokeDasharray = pathLength;
            pathElement.style.strokeDashoffset = pathLength;

            // 触发动画
            setTimeout(() => {
                pathElement.style.strokeDashoffset = '0';
            }, 500);

            console.log('SVG签名初始化成功，路径长度:', pathLength);
        } else {
            console.warn('SVG签名元素未找到，使用备用文字');
            // 显示备用文字
            const logoElement = document.querySelector('.logo');
            if (logoElement) {
                logoElement.innerHTML = '<span class="fallback-logo">Jason</span>';
            }
        }
    }

    // 初始化SVG签名
    initSVGSignature();

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
