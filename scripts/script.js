import './navigation.js';
import './slideshow.js';
import { loadPortfolio } from './portfolio.js';
import './copyText.js';
import './languageSwitcher.js';

// 调用 loadPortfolio
document.addEventListener('DOMContentLoaded', loadPortfolio);