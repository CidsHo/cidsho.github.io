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
    
    // 代码块复制功能
    setupCodeBlocks();
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

// 代码块功能设置
function setupCodeBlocks() {
    const copyButtons = document.querySelectorAll('.copy-button');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 获取相关代码块
            const codeBlock = button.closest('.code-block');
            const codeContent = codeBlock.querySelector('.code-content code').textContent;
            
            // 复制到剪贴板
            navigator.clipboard.writeText(codeContent)
                .then(() => {
                    // 复制成功反馈
                    const originalText = button.textContent;
                    button.textContent = '已复制!';
                    button.style.backgroundColor = '#4CAF50';
                    button.style.color = 'white';
                    
                    // 2秒后恢复原样
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.backgroundColor = '';
                        button.style.color = '';
                    }, 2000);
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    button.textContent = '复制失败';
                    button.style.backgroundColor = '#f44336';
                    button.style.color = 'white';
                    
                    setTimeout(() => {
                        button.textContent = '复制';
                        button.style.backgroundColor = '';
                        button.style.color = '';
                    }, 2000);
                });
        });
    });
}

// 默认初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.blog-container')) {
        setupBlog();
    }
});