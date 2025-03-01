// lazyLoad.js
export function lazyLoadImages() {
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