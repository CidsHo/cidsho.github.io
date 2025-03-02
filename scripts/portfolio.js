// scripts/portfolio.js

import { setupSearch } from './search.js';
import { setupFilterAndSort } from './filterAndSort.js';
import { lazyLoadImages } from './lazyLoad.js';

// 加载作品集数据
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