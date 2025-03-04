// blog.js

// 动态显示 Banner
function setupBanner() {
    const banner = document.querySelector('.blog-banner');
    const bannerImage = banner.querySelector('.banner-image');

    // 如果没有 Banner 图片，隐藏 Banner 区
    if (bannerImage.src.includes('placeholder.jpg')) {
        banner.style.display = 'none';
    } else {
        banner.style.display = 'block';
    }
}

// 初始化博客页功能
export function setupBlog() {
    console.log('Setting up blog page...'); // 调试信息

    // 动态显示 Banner
    if (document.querySelector('.blog-banner')) {
        setupBanner();
    }

    // 返回按钮功能
    if (document.querySelector('.back-button')) {
        const backButton = document.querySelector('.back-button');
        backButton.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'index.html'; // 如果没有历史记录，跳转到首页
            }
        });
    }

    // 图片懒加载功能
    if (document.querySelector('.lazy-load')) {
        lazyLoadImages();
    }
}

// 图片懒加载功能
function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('.lazy-load');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src'); // 加载实际图片
                img.classList.remove('lazy-load'); // 移除 lazy-load 类
                observer.unobserve(img); // 停止观察已加载的图片
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1 // 当图片进入视口 10% 时触发加载
    });

    lazyImages.forEach(img => {
        observer.observe(img); // 开始观察图片
    });
}

// 默认初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.blog-container')) {
        setupBlog();
    }
});