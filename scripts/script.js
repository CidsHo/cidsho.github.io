// 导航栏逻辑

// 获取 DOM 元素
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

// 图片和文字数据
const images = [
    {
        src: 'assets/screen-images/jianghezhishou.jpg',
        captionLine1: '江河守護 River Guardian',
        captionLine2: '武漢, 湖北, 中國. ',
        captionLine3: 'Wuhan, Hubei, China',
        link: 'articles/photograph/RiverGuardian.html' // 专属介绍页链接
    },
    {
        src: 'assets/screen-images/void.jpg',
        captionLine1: '空中 VOID',
        captionLine2: '上海, 中國.',
        captionLine3: 'Shanghai, China.',
        link: 'articles/photograph/void.html' // 专属介绍页链接
    },
    {
        src: 'assets/screen-images/danxia.jpg',
        captionLine1: '丹霞 Danxia',
        captionLine2: '張掖, 甘肅, 中國',
        captionLine3: 'Zhangye, Gansu, China',
        link: 'articles/photograph/danxia.html' // 专属介绍页链接
    },
    {
        src: 'assets/screen-images/sandroad.jpg',
        captionLine1: '沙路 Road to the Sand',
        captionLine2: '阿拉善左旗, 内蒙古自治區, 中國.',
        captionLine3: 'Alxa East Country, Inner Mongolia, China.',
        link: 'articles/photograph/sandroad.html' // 专属介绍页链接
    },
    {
        src: 'assets/screen-images/desk.JPG',
        captionLine1: '書桌一隅 Something on Desk',
        captionLine2: '中國.',
        captionLine3: 'China.',
        link: 'articles/photograph/desk.html' // 专属介绍页链接
    },
    {
        src: 'assets/screen-images/sakana.JPG',
        captionLine1: '魚 Sakana',
        captionLine2: '2020-8-17.',
        link: 'articles/design/sakana.html' // 专属介绍页链接
    }
];

// 获取 DOM 元素
const screenMedia = document.querySelector('.screen-media');
const captionLine1 = document.querySelector('.caption-line-1');
const captionLine2 = document.querySelector('.caption-line-2');
const captionLine3 = document.querySelector('.caption-line-3');
const screenContainer = document.querySelector('.screen-container');

// 当前显示的图片索引
let currentImageIndex = 0;

// 显示指定索引的图片
function showImage(index) {
    const image = images[index];
    if (screenMedia) {
        screenMedia.classList.add('fade-out'); // 添加淡出效果
        setTimeout(() => {
            screenMedia.src = image.src;
            screenMedia.classList.remove('fade-out'); // 移除淡出效果
        }, 500); // 500ms 是淡出动画的持续时间
    }
    if (captionLine1) captionLine1.textContent = image.captionLine1;
    if (captionLine2) captionLine2.textContent = image.captionLine2;
    if (captionLine3) captionLine3.textContent = image.captionLine3;
}

// 跳转到当前图片的专属介绍页
function navigateToImagePage() {
    const currentImage = images[currentImageIndex];
    if (currentImage && currentImage.link) {
        window.location.href = currentImage.link;
    } else {
        console.error('Current image or link not found');
    }
}

// 初始加载第一张图片
showImage(currentImageIndex);

// 每隔 10 秒切换一张图片
setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % images.length; // 循环切换
    showImage(currentImageIndex);
}, 10000);

// 点击银幕容器时跳转到专属介绍页
if (screenContainer) {
    screenContainer.addEventListener('click', navigateToImagePage);
} else {
    console.error('screenContainer not found');
}

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