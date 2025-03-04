// portfolio.js
import { setupSearch } from './search.js';
import { setupFilterAndSort } from './filterAndSort.js';
import { lazyLoadImages } from './lazyLoad.js'; // 确保导入名称正确

let currentPage = 1;
const pageSize = 10; // 每次加载的图片数量
let isLoading = false; // 防止重复加载

// 加载更多图片
async function loadMoreItems() {
    if (isLoading) return; // 如果正在加载，则退出
    isLoading = true;

    // 显示加载提示
    const loadingMore = document.getElementById('loading-more');
    loadingMore.style.display = 'block';

    try {
        // 模拟从服务器加载数据
        const response = await fetch(`/api/portfolio?page=${currentPage}&size=${pageSize}`);
        const data = await response.json();

        if (data.length > 0) {
            const portfolioGrid = document.getElementById('portfolio-grid');
            data.forEach(item => {
                const card = createPortfolioCard(item); // 创建卡片
                portfolioGrid.appendChild(card);
            });

            currentPage++; // 加载下一页
        } else {
            // 如果没有更多数据，隐藏加载提示
            loadingMore.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading more items:', error);
    } finally {
        isLoading = false;
    }
}

// 创建图片卡片
function createPortfolioCard(item) {
    const card = document.createElement('div');
    card.classList.add('portfolio-item');
    card.innerHTML = `
        <div class="image-container">
            <img class="lazy-load" data-src="${item.image}" alt="${item.title}">
        </div>
        <div class="portfolio-info">
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <div class="portfolio-tags">
                ${item.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
            <div class="portfolio-date">${item.date}</div>
        </div>
    `;
    return card;
}

// 监听滚动事件
window.addEventListener('scroll', function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) { // 接近底部时加载更多
        loadMoreItems();
    }
});

// 初始化加载第一页
loadMoreItems();

export async function loadPortfolio() {
    try {
        const response = await fetch('assets/data/portfolio.json');
        if (!response.ok) {
            throw new Error('Failed to load portfolio data');
        }
        const portfolioData = await response.json();
        console.log('Loaded portfolio data:', portfolioData);

        portfolioData.sort((a, b) => new Date(b.date) - new Date(a.date));

        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (!portfolioGrid) {
            console.error('Portfolio grid not found');
            return;
        }

        portfolioGrid.innerHTML = '';

        portfolioData.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('portfolio-item');
            card.setAttribute('data-date', item.date);
            card.setAttribute('data-tags', item.tags.join(','));

            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            const imageLink = document.createElement('a');
            imageLink.href = item.link;
            const image = document.createElement('img');
            image.src = item.image; // 占位符图片
            image.setAttribute('data-src', item['data-src']); // 实际图片 URL
            image.alt = item.title;
            image.classList.add('portfolio-image', 'lazy-load'); // 添加 lazy-load 类
            imageLink.appendChild(image);
            imageContainer.appendChild(imageLink);

            const info = document.createElement('div');
            info.classList.add('portfolio-info');
            const title = document.createElement('h2');
            title.textContent = item.title;

            const tags = document.createElement('div');
            tags.classList.add('portfolio-tags');
            item.tags.slice(0, 5).forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.textContent = tag;
                if (tag === '精选') {
                    tagSpan.classList.add('highlighted-tag');
                }
                tags.appendChild(tagSpan);
            });

            const description = document.createElement('p');
            description.textContent = item.description;
            const date = document.createElement('div');
            date.classList.add('portfolio-date');
            date.textContent = item.date;

            info.appendChild(title);
            info.appendChild(tags);
            info.appendChild(description);
            info.appendChild(date);

            card.appendChild(imageContainer);
            card.appendChild(info);

            portfolioGrid.appendChild(card);
        });

        // 初始化搜索功能
        setupSearch();

        // 初始化筛选和排序功能
        setupFilterAndSort();

        // 初始化懒加载
        lazyLoadImages();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

// 在 DOM 加载完成后调用 loadPortfolio
document.addEventListener('DOMContentLoaded', loadPortfolio);