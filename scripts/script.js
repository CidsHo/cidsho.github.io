import './navigation.js';
import './slideshow.js';
import { loadPortfolio } from './portfolio.js';
import './copyText.js';
import './languageSwitcher.js';

// 调用 loadPortfolio
document.addEventListener('DOMContentLoaded', loadPortfolio);

document.addEventListener('DOMContentLoaded', () => {
    // 其他初始化代码
    setupNavigation(); // 假设你在 navigation.js 中定义了 setupNavigation 函数
});

window.addEventListener('load', function () {
    // 确保所有资源加载完成
    const loadingScreen = document.getElementById('loading-screen');
    const content = document.getElementById('content');

    // 隐藏加载页面，显示内容
    loadingScreen.style.display = 'none';
    content.style.display = 'block';
});