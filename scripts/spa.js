// scripts/spa.js

// 内容容器
const contentContainer = document.getElementById('content-container');

// 导航栏容器
const navbarContainer = document.getElementById('navbar-container');

// 加载页面内容
async function loadPage(url) {
    try {
        contentContainer.classList.add('fade-out'); // 添加淡出动画
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to load page');
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('.content-container').innerHTML;
        setTimeout(() => {
            contentContainer.innerHTML = newContent;
            contentContainer.classList.remove('fade-out'); // 移除淡出动画

            // 根据页面动态设置滚动行为
            if (url.includes('index.html')) {
                document.body.classList.add('home-page');
                document.body.classList.remove('portfolio-page', 'about-page');
                document.body.style.overflow = 'hidden'; // 首页不允许滚动
            } else {
                document.body.classList.remove('home-page'); // 其他页面允许滚动
            }           

            // 动态加载样式文件
            const styles = doc.querySelectorAll('link[rel="stylesheet"]');
            styles.forEach(style => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = style.href;
                document.head.appendChild(link);
            });

            // 根据 URL 动态控制导航栏的显示与隐藏
            if (url.includes('index.html')) {
                navbarContainer.classList.add('hidden'); // 首页隐藏导航栏
                bindHomeButtons(); // 绑定首页按钮的事件监听器
                bindTextLinks(); // 绑定文本链接的事件监听器
            } else {
                navbarContainer.classList.remove('hidden'); // 其他页面显示导航栏
            }

            // 重新绑定首页按钮的事件监听器
            if (url.includes('index.html')) {
                bindHomeButtons();
            }            

            // 初始化页面逻辑
            if (url.includes('portfolio.html')) {
                import('./portfolio.js').then(module => {
                    module.loadPortfolio();
                });
            } else if (url.includes('about.html')) {
                import('./languageSwitcher.js').then(module => {
                    module.loadTranslations('en'); // 默认加载英文翻译
                });
            }
        }, 500); // 等待动画完成
    } catch (error) {
        console.error('Error loading page:', error);
        contentContainer.innerHTML = '<p>页面加载失败，请稍后重试。</p>';
    }
}

// 绑定首页按钮的事件监听器
function bindHomeButtons() {
    const homeButtons = document.querySelectorAll('.home-button');
    homeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止默认跳转行为
            const page = button.getAttribute('data-page');
            const url = `${page}.html`;
            history.pushState({ page }, '', url); // 更新浏览器历史记录
            loadPage(url); // 加载页面内容
        });
    });
}

// 绑定链接的事件监听器
function bindTextLinks() {
    const textLinks = document.querySelectorAll('.selected-works-link, .cids-ho-link');
    textLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止默认跳转行为
            const page = link.getAttribute('data-page');
            const url = `${page}.html`;
            history.pushState({ page }, '', url); // 更新浏览器历史记录
            loadPage(url); // 加载页面内容
        });
    });
}

// 处理 home-buttons 点击事件
const homeButtons = document.querySelectorAll('.home-button');
homeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // 阻止默认跳转行为
        const page = button.getAttribute('data-page');
        const url = `${page}.html`;
        history.pushState({ page }, '', url); // 更新浏览器历史记录
        loadPage(url); // 加载页面内容
    });
});

// 处理浏览器前进/后退事件
window.addEventListener('popstate', (event) => {
    if (event.state) {
        const url = `${event.state.page}.html`;
        loadPage(url);
    }
});

// 处理导航栏链接点击事件
const navLinks = document.querySelectorAll('#nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // 阻止默认跳转行为
        const page = link.getAttribute('data-page');
        const url = `${page}.html`;
        history.pushState({ page }, '', url); // 更新浏览器历史记录
        loadPage(url); // 加载页面内容
    });
});

// 处理超链接点击事件
const textLinks = document.querySelectorAll('.selected-works-link, .cids-ho-link');
textLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // 阻止默认跳转行为
        const page = link.getAttribute('data-page');
        const url = `${page}.html`;
        history.pushState({ page }, '', url); // 更新浏览器历史记录
        loadPage(url); // 加载页面内容
    });
});

// 初始化加载首页
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop(); // 获取当前页面文件名
    if (currentPage === 'index.html' || currentPage === '') {
        history.replaceState({ page: 'index' }, '', 'index.html');
        navbarContainer.classList.add('hidden'); // 首页隐藏导航栏
        bindHomeButtons(); // 绑定首页按钮的事件监听器
        bindTextLinks(); // 绑定文本链接的事件监听器
    } else {
        history.replaceState({ page: currentPage.replace('.html', '') }, '', currentPage);
        navbarContainer.classList.remove('hidden'); // 其他页面显示导航栏
    }
});