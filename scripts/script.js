// 导航栏逻辑
const navToggle = document.getElementById('nav-toggle');
const menuOverlay = document.getElementById('menu-overlay');

// 点击按钮时切换菜单栏的显示状态
if (navToggle && menuOverlay) {
    navToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡
        menuOverlay.classList.toggle('active');
    });

    // 点击菜单栏外部时关闭菜单
    document.addEventListener('click', (event) => {
        if (!menuOverlay.contains(event.target) && !navToggle.contains(event.target)) {
            menuOverlay.classList.remove('active');
        }
    });
} else {
    console.error('navToggle or menuOverlay not found');
}

// 获取 DOM 元素
const screenMedia = document.querySelector('.screen-media');
const captionLine1 = document.querySelector('.caption-line-1');
const captionLine2 = document.querySelector('.caption-line-2');
const captionLine3 = document.querySelector('.caption-line-3');
const screenContainer = document.querySelector('.screen-container');

let images = []; // 存储图片数据
let currentImageIndex = 0; // 当前显示的图片索引
let playedIndices = []; // 记录已经播放过的图片索引

// 加载图片数据
async function loadImages() {
    try {
        const response = await fetch('assets/data/images.json');
        if (!response.ok) {
            throw new Error('Failed to load images');
        }
        images = await response.json();
        console.log('Loaded images:', images); // 打印加载的图片数据
        startSlideshow(); // 数据加载完成后启动幻灯片
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

// 显示指定索引的图片
function showImage(index, skipAnimation = false) {
    const image = images[index];
    console.log('Showing image:', image); // 打印当前图片信息
    if (screenMedia) {
        if (!skipAnimation) {
            screenMedia.classList.add('fade-out'); // 添加淡出效果
        }
        setTimeout(() => {
            screenMedia.src = image.src;
            if (!skipAnimation) {
                screenMedia.classList.remove('fade-out'); // 移除淡出效果
            }
        }, skipAnimation ? 0 : 500); // 如果跳过动画，延迟为 0
    }
    if (captionLine1) captionLine1.textContent = image.captionLine1;
    if (captionLine2) captionLine2.textContent = image.captionLine2;
    if (captionLine3) captionLine3.textContent = image.captionLine3;
}

// 随机切换图片
function showRandomImage(skipAnimation = false) {
    if (playedIndices.length === images.length) {
        playedIndices = []; // 如果所有图片都已播放，重置列表
    }

    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * images.length); // 生成随机索引
    } while (playedIndices.includes(newIndex)); // 确保新索引未被播放过

    playedIndices.push(newIndex); // 记录已播放的索引
    currentImageIndex = newIndex;
    showImage(currentImageIndex, skipAnimation); // 根据参数决定是否跳过动画
}

// 启动幻灯片
function startSlideshow() {
    if (images.length > 0) {
        showRandomImage(true); // 初始加载第一张图片，跳过动画
        setInterval(showRandomImage, 10000); // 每隔 10 秒随机切换一张图片
    } else {
        console.error('No images loaded');
    }
}

// 点击银幕容器时跳转到专属介绍页
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

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadImages(); // 加载图片数据
});

// 排序和筛选逻辑
document.addEventListener('DOMContentLoaded', function() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const sortDateAsc = document.getElementById('sort-date-asc');
    const sortDateDesc = document.getElementById('sort-date-desc');
    const filterPhotography = document.getElementById('filter-photography');
    const filterDesign = document.getElementById('filter-design');
    const filterIdeas = document.getElementById('filter-ideas');
    const resetFilter = document.getElementById('reset-filter');

    // 获取所有项目
    const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));

    // 当前筛选状态
    let currentFilter = 'all';

    // 设置当前选中的按钮
    function setActiveButton(button) {
        // 移除所有按钮的 active 类
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        // 为当前选中的按钮添加 active 类
        if (button) button.classList.add('active');
    }

    // 排序函数
    function sortItems(order) {
        // 添加移动动画
        portfolioItems.forEach(item => item.classList.add('move'));

        // 排序逻辑
        portfolioItems.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // 清空网格并重新添加排序后的项目
        portfolioGrid.innerHTML = '';
        portfolioItems.forEach(item => {
            if (currentFilter === 'all' || item.getAttribute('data-category') === currentFilter) {
                portfolioGrid.appendChild(item);
            }
        });

        // 移除移动动画
        setTimeout(() => {
            portfolioItems.forEach(item => item.classList.remove('move'));
        }, 500); // 动画持续时间
    }

    // 筛选函数
    function filterItems(category, button) {
        currentFilter = category; // 更新当前筛选状态
        portfolioItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block'; // 显示项目
            } else {
                item.style.display = 'none'; // 隐藏项目
            }
        });

        // 设置当前选中的按钮
        setActiveButton(button);

        // 重新排序以填补空白
        sortItems('asc'); // 默认按升序排序
    }

    // 重置筛选函数
    function resetFilters() {
        currentFilter = 'all'; // 重置筛选状态
        portfolioItems.forEach(item => item.style.display = 'block'); // 显示所有项目
        setActiveButton(null); // 取消所有按钮的高亮状态
        sortItems('asc'); // 重新排序
    }

    // 绑定事件
    if (sortDateAsc) {
        sortDateAsc.addEventListener('click', () => sortItems('asc'));
    }
    if (sortDateDesc) {
        sortDateDesc.addEventListener('click', () => sortItems('desc'));
    }
    if (filterPhotography) {
        filterPhotography.addEventListener('click', () => filterItems('photography', filterPhotography));
    }
    if (filterDesign) {
        filterDesign.addEventListener('click', () => filterItems('design', filterDesign));
    }
    if (filterIdeas) {
        filterIdeas.addEventListener('click', () => filterItems('ideas', filterIdeas));
    }
    if (resetFilter) {
        resetFilter.addEventListener('click', resetFilters);
    }
});

// 底部提示逻辑
window.addEventListener('scroll', function() {
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
    localStorage.setItem('preferredLanguage', lang);
}

document.querySelectorAll('.language-switcher button').forEach(button => {
    button.addEventListener('click', () => {
        const lang = button.getAttribute('onclick').match(/'(.*?)'/)[1];
        switchLanguage(lang);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(preferredLanguage);
});