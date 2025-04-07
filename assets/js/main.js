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
    nav.appendChild(navToggle);

    navToggle.addEventListener('click', function () {
        document.querySelector('nav ul').classList.toggle('active');
        this.classList.toggle('active');
    });

    // 添加CSS样式到头部
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
                top: 1rem;
            }
            
            nav ul {
                display: none;
                flex-direction: column;
                width: 100%;
                text-align: center;
                padding: 1rem 0;
            }
            
            nav ul.active {
                display: flex;
            }
            
            nav ul li {
                margin: 0.5rem 0;
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
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imgObserver.observe(img);
        });
    }
});
