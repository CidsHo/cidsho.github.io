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
        console.log('设置高亮按钮:', button); // 调试用
        document.querySelectorAll('.filter-button').forEach(btn => {
            console.log('移除 active 类:', btn); // 调试用
            btn.classList.remove('active');
        });
        if (button) {
            button.classList.add('active');
            console.log('已添加 active 类:', button); // 调试用
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
        console.log(`当前筛选: ${category}`); // 调试用
        currentFilter = category;
        portfolioItems.forEach(item => {
            const itemTags = item.getAttribute('data-tags')
                .split(',')
                .map(tag => tag.trim().toLowerCase()); // 去除空格并转换为小写

            console.log(`作品标签: ${itemTags}`); // 调试用

            const isFeatured = itemTags.includes('精选'.toLowerCase()); // 统一转换为小写比较
            console.log(`是否精选: ${isFeatured}`); // 调试用

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
            console.log('Icon 精选按钮被点击'); // 调试用
            filterItems('精选', filterStarIcon);
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
            card.setAttribute('data-category', item.category || 'all');

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

        setupFilterAndSort();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadImages();
    loadPortfolio();

    const languages = ['en', 'zh-Hans', 'zh-Hant'];
    languages.forEach(lang => {
        loadTranslations(lang);
    });

    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(preferredLanguage);
});

// 底部提示逻辑
window.addEventListener('scroll', function () {
    const bottomTip = document.getElementById('bottom-tip');
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

    // 判断是否滚动到底部
    if (scrollTop + clientHeight >= scrollHeight - 50) { // 50 是容错范围
        bottomTip.classList.add('show'); // 显示提示
    } else {
        bottomTip.classList.remove('show'); // 隐藏提示
    }
});

// 复制文本函数
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(); // 显示提示框
    }).catch(() => {
        showNotification('复制失败，请手动复制'); // 显示错误提示
    });
}

// 显示提示框
function showNotification(message = '已复制到剪贴板！') {
    const notification = document.getElementById('copy-notification');
    if (notification) {
        notification.querySelector('p').textContent = message; // 更新提示内容
        notification.classList.add('show'); // 显示提示框
        setTimeout(() => {
            notification.classList.remove('show'); // 3秒后隐藏提示框
        }, 3000);
    }
}

// 语言切换逻辑
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`assets/translations/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${lang}.json: ${response.statusText}`);
        }
        translations[lang] = await response.json();
        console.log(`Loaded ${lang}.json:`, translations[lang]);
        switchLanguage(lang);
    } catch (error) {
        console.error(error);
    }
}

function switchLanguage(lang) {
    document.documentElement.lang = lang;
    if (!translations[lang]) {
        loadTranslations(lang);
        return;
    }

// 获取所有需要翻译的元素
const elements = document.querySelectorAll('[data-key]');
elements.forEach(el => {
    const key = el.getAttribute('data-key');
    if (translations[lang][key]) {
        if (Array.isArray(translations[lang][key])) {
            // 如果是数组，动态生成列表项
            if (key === 'publicationsList') {
                // 处理出版物列表
                el.innerHTML = translations[lang][key].map(item => `
                    <li>
                        <strong>${item.title}</strong><br>
                        <em>${item.author}</em><br>
                        ${item.conference}<br>
                        <a href="${item.doi}" target="_blank"><em>[DOI]</em></a>
                    </li>
                `).join('');
            } else if (key === 'projectExperienceList') {
                // 处理项目经验列表
                el.innerHTML = translations[lang][key].map(item => `
                    <li>
                        <em>${item.period}</em>, ${item.title}<br>
                        <span>${item.institution}</span><br>
                        > ${item.role}
                    </li>
                `).join('');
            } else if (key === 'awardsList') {
                // 处理奖项列表
                el.innerHTML = translations[lang][key].map(item => `<li>${item}</li>`).join('');
            }
        } else if (typeof translations[lang][key] === 'object') {
            // 如果是对象，根据对象结构动态生成内容
            if (key === 'skillsText') {
                const skills = translations[lang][key];
                el.innerHTML = `
                    <div class="skill-category">
                        <h3>${skills.designTools}</h3>
                        <ul>${skills.designToolsList.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>
                    <div class="skill-category">
                        <h3>${skills.multimediaTools}</h3>
                        <ul>${skills.multimediaToolsList.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>
                    <div class="skill-category">
                        <h3>${skills.languageProficiency}</h3>
                        <ul>${skills.languageProficiencyList.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>
                `;
            }
        } else {
            // 如果是普通文本，直接更新内容
            el.innerHTML = translations[lang][key];
        }
    } else {
        console.warn(`Translation not found for key: ${key} in language: ${lang}`);
    }
});

// 更新语言切换按钮的状态
const languageButtons = document.querySelectorAll('.language-switcher button');
languageButtons.forEach(button => {
    if (button.getAttribute('onclick').includes(lang)) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
});

// 存储语言偏好
localStorage.setItem('preferredLanguage', lang);}

// 返回按钮逻辑
const backButton = document.getElementById('back-button');
if (backButton) {
    backButton.addEventListener('click', () => {
        window.history.back(); // 返回上一个页面
    });
} else {
    console.error('返回按钮未找到');
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

// 在加载作品集数据后调用懒加载逻辑
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

            // 图片部分
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

            // 文字介绍部分
            const info = document.createElement('div');
            info.classList.add('portfolio-info');
            const title = document.createElement('h2');
            title.textContent = item.title;

            // 标签部分
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

            // 将图片和文字介绍添加到卡片
            card.appendChild(imageContainer);
            card.appendChild(info);

            // 将卡片添加到网格
            portfolioGrid.appendChild(card);
        });

        // 初始化懒加载
        lazyLoadImages();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}