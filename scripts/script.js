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