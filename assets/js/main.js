document.addEventListener('DOMContentLoaded', function () {
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
    });

    // 移动端导航菜单
    const navToggle = document.createElement('div');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    const nav = document.querySelector('nav');
    nav.appendChild(navToggle); navToggle.addEventListener('click', function () {
        document.querySelector('nav ul').classList.toggle('active');
        this.classList.toggle('active');
    });    // 点击导航菜单项后立即关闭菜单
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function () {
            const navMenu = document.querySelector('nav ul');
            const toggle = document.querySelector('.nav-toggle');
            if (navMenu && toggle) {
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
    });    // 点击页面其他区域关闭导航菜单
    document.addEventListener('click', function (e) {
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
    });// 添加CSS样式到头部
    const style = document.createElement('style');
    style.textContent = `
        .nav-toggle {
            display: none;
            cursor: pointer;
            font-size: 1.5rem;
        }
        
        @media (max-width: 768px) {
            nav {
                position: relative;
            }
            
            .nav-toggle {
                display: block;
                position: absolute;
                right: 1rem;
                top: 50%;
                transform: translateY(-50%);
                z-index: 1002;
            }            nav ul {
                display: none !important;
                flex-direction: column;
                width: 100%;
                text-align: center;
                padding: 1rem 0;
                background: rgba(255, 255, 255, 0.98);
                position: absolute;
                top: 100%;
                left: 0;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                border-top: 1px solid rgba(0, 0, 0, 0.05);
                margin: 0;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
            }
            
            nav ul.active {
                display: flex !important;
                opacity: 1;
                visibility: visible;
                z-index: 1002;
            }
            
            nav ul li {
                margin: 0.5rem 0;
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
