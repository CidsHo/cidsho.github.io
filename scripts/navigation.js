// 导航栏逻辑
const navToggle = document.getElementById('nav-toggle');
const menuOverlay = document.getElementById('menu-overlay');

if (navToggle && menuOverlay) {
    navToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        menuOverlay.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!menuOverlay.contains(event.target) && !navToggle.contains(event.target)) {
            menuOverlay.classList.remove('active');
        }
    });
} else {
    console.error('navToggle or menuOverlay not found');
}

// 导航栏滚动行为
document.addEventListener('DOMContentLoaded', () => {
    // 获取当前页面的文件名
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop(); // 提取文件名
    
    // 移除所有导航项的active类
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 根据当前页面设置对应导航项的active类
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        
        // 精确匹配当前页面
        if (href === currentPage) {
            item.classList.add('active');
        } 
        // 处理首页特殊情况
        else if (currentPage === '' && href === 'index.html') {
            item.classList.add('active');
        }
    });
    
    // 移动端导航栏滚动行为
    const navbar = document.querySelector('.top-navbar');
    let lastScrollY = window.scrollY;
    let scrollingTimeout;
    
    // 只在移动设备上应用滚动行为
    function handleScroll() {
        if (window.innerWidth <= 768) { // 移动设备断点
            const currentScrollY = window.scrollY;
            
            // 向下滚动超过10px，隐藏导航栏
            if (currentScrollY > lastScrollY + 10) {
                navbar.classList.add('hidden');
            } 
            // 向上滚动超过10px，显示导航栏
            else if (currentScrollY < lastScrollY - 10) {
                navbar.classList.remove('hidden');
            }
            
            lastScrollY = currentScrollY;
            
            // 清除之前的定时器
            clearTimeout(scrollingTimeout);
            
            // 滚动停止后显示导航栏
            scrollingTimeout = setTimeout(() => {
                navbar.classList.remove('hidden');
            }, 1500); // 滚动停止1.5秒后显示
        }
    }
    
    // 添加滚动事件监听
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 页面加载和调整窗口大小时重置
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navbar.classList.remove('hidden');
        }
    });
});

// 返回按钮逻辑
const backButton = document.getElementById('back-button');
if (backButton) {
    backButton.addEventListener('click', () => {
        window.history.back();
    });
} else {
    console.error('返回按钮未找到');
}