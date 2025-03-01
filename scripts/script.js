// script.js

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

// 图片幻灯片逻辑
const screenMedia = document.querySelector('.screen-media');
const captionLine1 = document.querySelector('.caption-line-1');
const captionLine2 = document.querySelector('.caption-line-2');
const captionLine3 = document.querySelector('.caption-line-3');
const screenContainer = document.querySelector('.screen-container');

let images = [];
let currentImageIndex = 0;
let playedIndices = [];

async function loadImages() {
    try {
        const response = await fetch('assets/data/images.json');
        if (!response.ok) {
            throw new Error('Failed to load images');
        }
        images = await response.json();
        console.log('Loaded images:', images);

        // 预加载图片
        images.forEach(image => {
            const img = new Image();
            img.src = image.src;
        });

        startSlideshow();
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function showImage(index, skipAnimation = false) {
    const image = images[index];
    console.log('Showing image:', image);
    if (screenMedia) {
        if (!skipAnimation) {
            screenMedia.classList.add('fade-out');
        }
        setTimeout(() => {
            screenMedia.src = image.src;
            if (!skipAnimation) {
                screenMedia.classList.remove('fade-out');
            }
        }, skipAnimation ? 0 : 500);
    }
    if (captionLine1) captionLine1.textContent = image.captionLine1;
    if (captionLine2) captionLine2.textContent = image.captionLine2;
    if (captionLine3) captionLine3.textContent = image.captionLine3;
}

function showRandomImage(skipAnimation = false) {
    if (playedIndices.length === images.length) {
        playedIndices = [];
    }

    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * images.length);
    } while (playedIndices.includes(newIndex));

    playedIndices.push(newIndex);
    currentImageIndex = newIndex;
    showImage(currentImageIndex, skipAnimation);
}

function startSlideshow() {
    if (images.length > 0) {
        showRandomImage(true);
        setInterval(showRandomImage, 10000);
    } else {
        console.error('No images loaded');
    }
}

if (screenContainer) {
    screenContainer.addEventListener('click', () => {
        const currentImage = images[currentImageIndex];
        if (currentImage && currentImage.link) {
            window.location.href = currentImage.link;
        } else {
            console.error('Current image or link not found');
        }
    });
} else {
    console.error('screenContainer not found');
}

// 筛选和排序逻辑
function setupFilterAndSort() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const sortDateAsc = document.getElementById('sort-date-asc');
    const sortDateDesc = document.getElementById('sort-date-desc');
    const filterPhotography = document.getElementById('filter-photography');
    const filterDesign = document.getElementById('filter-design');
    const filterIdeas = document.getElementById('filter-ideas');
    const resetFilter = document.getElementById('reset-filter');
    const filterStar = document.getElementById('filter-star'); // 文本精选按钮
    const filterStarIcon = document.getElementById('filter-star-icon'); // Icon 精选按钮

    const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
    let currentFilter = 'all';

    function setActiveButton(button) {
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        if (button) {
            button.classList.add('active');
        }
    }

    function sortItems(order) {
        portfolioItems.forEach(item => item.classList.add('move'));
        portfolioItems.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
        portfolioGrid.innerHTML = '';
        portfolioItems.forEach(item => {
            if (currentFilter === 'all' || item.getAttribute('data-tags').includes(currentFilter)) {
                portfolioGrid.appendChild(item);
            }
        });
        setTimeout(() => {
            portfolioItems.forEach(item => item.classList.remove('move'));
        }, 500);
    }

    function filterItems(category, button) {
        currentFilter = category;
        portfolioItems.forEach(item => {
            const itemTags = item.getAttribute('data-tags')
                .split(',')
                .map(tag => tag.trim().toLowerCase());

            const isFeatured = itemTags.includes('精选'.toLowerCase());

            if (category === '精选') {
                item.style.display = isFeatured ? 'block' : 'none';
            } else if (category === 'all' || itemTags.includes(category.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        setActiveButton(button);
    }

    function resetFilters() {
        currentFilter = 'all';
        portfolioItems.forEach(item => {
            item.style.display = 'block';
        });
        setActiveButton(null);
    }

    if (sortDateAsc) sortDateAsc.addEventListener('click', () => sortItems('asc'));
    if (sortDateDesc) sortDateDesc.addEventListener('click', () => sortItems('desc'));
    if (filterPhotography) filterPhotography.addEventListener('click', () => filterItems('摄影', filterPhotography));
    if (filterDesign) filterDesign.addEventListener('click', () => filterItems('设计', filterDesign));
    if (filterIdeas) filterIdeas.addEventListener('click', () => filterItems('想法', filterIdeas));
    if (resetFilter) resetFilter.addEventListener('click', resetFilters);
    if (filterStar) filterStar.addEventListener('click', () => filterItems('精选', filterStar));
    if (filterStarIcon) {
        filterStarIcon.addEventListener('click', () => {
            filterItems('精选', filterStarIcon);
        });
    }
}

// 搜索功能逻辑
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (!searchInput || !searchButton || !portfolioItems) {
        console.error('Search elements not found');
        return;
    }

    // 搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        filterPortfolioItems(searchTerm);
    });

    // 输入框回车事件
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filterPortfolioItems(searchTerm);
        }
    });

    // 筛选作品函数
    function filterPortfolioItems(searchTerm) {
        portfolioItems.forEach(item => {
            const title = item.querySelector('h2').textContent.toLowerCase();
            const tags = item.querySelector('.portfolio-tags').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();

            if (title.includes(searchTerm) || tags.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'block'; // 显示匹配的作品
            } else {
                item.style.display = 'none'; // 隐藏不匹配的作品
            }
        });
    }
}

// 加载作品集数据并生成卡片
async function loadPortfolio() {
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

// 懒加载逻辑
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

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadImages();
    loadPortfolio();
});