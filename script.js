// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initImageSliders();
    initContactForm();
    initScrollEffects();
    initSmoothScroll();
    // 暴露全局方法，兼容 HTML 中的 inline 调用
    exposeGlobalHandlers();
});

// 导航栏功能
function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    // 移动端菜单切换
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // 点击菜单项后关闭菜单
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // 滚动时改变导航栏样式
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// 图片轮播功能
function initImageSliders() {
    const collectionItems = document.querySelectorAll('.collection-item');
    
    collectionItems.forEach((item, index) => {
        const images = item.querySelectorAll('.image-slider img');
        const dots = item.querySelectorAll('.dot');
        let currentSlide = 0;
        let slideInterval;

        // 自动轮播
        function startSlideShow() {
            slideInterval = setInterval(() => {
                showSlide((currentSlide + 1) % images.length);
            }, 4000);
        }

        // 显示指定幻灯片
        function showSlide(n) {
            images[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            
            currentSlide = n;
            
            images[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        // 监听自定义事件以统一切换逻辑（兼容全局 currentSlide）
        item.addEventListener('setSlide', (e) => {
            const targetIndex = e.detail && typeof e.detail.index === 'number' ? e.detail.index : 0;
            if (targetIndex >= 0 && targetIndex < images.length) {
                clearInterval(slideInterval);
                showSlide(targetIndex);
                startSlideShow();
            }
        });

        // 点击圆点切换图片（若存在 inline onclick，则避免重复绑定）
        dots.forEach((dot, dotIndex) => {
            if (!dot.hasAttribute('onclick')) {
                dot.addEventListener('click', () => {
                    item.dispatchEvent(new CustomEvent('setSlide', { detail: { index: dotIndex } }));
                });
            }
        });

        // 鼠标悬停时暂停自动播放
        item.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        item.addEventListener('mouseleave', () => {
            startSlideShow();
        });

        // 启动自动播放
        startSlideShow();
    });
}

// 联系表单功能
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // 简单验证
            if (!name || !email || !message) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('请输入有效的邮箱地址', 'error');
                return;
            }
            
            // 模拟提交
            showNotification('正在发送消息...', 'info');
            
            setTimeout(() => {
                showNotification('消息发送成功！我们会尽快回复您。', 'success');
                this.reset();
            }, 2000);
        });
    }
}

// 邮箱验证
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 滚动动画效果
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    document.querySelectorAll('.collection-item, .team-member, .about-text').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // 考虑固定导航栏高度
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 通知系统
function showNotification(message, type = 'info') {
    // 移除现有通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 自动隐藏通知
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// 暴露全局处理函数，兼容 HTML 中的 inline 事件
function exposeGlobalHandlers() {
    // 支持 index.html 中的 currentSlide(this, n)
    window.currentSlide = function(el, n) {
        try {
            const item = el && el.closest ? el.closest('.collection-item') : null;
            if (!item) return;
            const index = Math.max(0, (parseInt(n, 10) || 1) - 1);
            item.dispatchEvent(new CustomEvent('setSlide', { detail: { index } }));
        } catch (err) {
            // 静默处理以避免影响其它交互
            console && console.warn && console.warn('currentSlide 调用失败:', err);
        }
    };
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 优化滚动性能
window.addEventListener('scroll', throttle(() => {
    // 滚动相关的性能优化处理
}, 16));

// 窗口大小改变时的处理
window.addEventListener('resize', debounce(() => {
    // 响应式处理
}, 250));