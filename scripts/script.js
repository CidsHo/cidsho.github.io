// 导航栏

document.addEventListener('DOMContentLoaded', function() {
    var navToggle = document.getElementById('nav-toggle');
    var menuOverlay = document.getElementById('menu-overlay');

    navToggle.addEventListener('click', function() {
        menuOverlay.classList.toggle('active');
        navToggle.classList.toggle('rotate');
    });
});

// 导航函数
function navigateTo(url) {
    const content = document.getElementById('content');
    content.classList.add('fade-out'); // 添加淡出动画

    setTimeout(() => {
        window.location.href = url; // 跳转到目标页面
    }, 500); // 500ms 是过渡动画的持续时间
}

// 页面加载时添加淡入动画
window.addEventListener('load', () => {
    const content = document.getElementById('content');
    content.classList.add('fade-in');
});

// 排序和筛选

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
    sortDateAsc.addEventListener('click', () => sortItems('asc'));
    sortDateDesc.addEventListener('click', () => sortItems('desc'));
    filterPhotography.addEventListener('click', () => filterItems('photography', filterPhotography));
    filterDesign.addEventListener('click', () => filterItems('design', filterDesign));
    filterIdeas.addEventListener('click', () => filterItems('ideas', filterIdeas));
    resetFilter.addEventListener('click', resetFilters);
});


// 动态添加高亮效果

function setActiveButton(button) {
    document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
}

filterPhotography.addEventListener('click', () => {
    filterItems('photography');
    setActiveButton(filterPhotography);
});

filterDesign.addEventListener('click', () => {
    filterItems('design');
    setActiveButton(filterDesign);
});

filterIdeas.addEventListener('click', () => {
    filterItems('ideas');
    setActiveButton(filterIdeas);
});

resetFilter.addEventListener('click', () => {
    resetFilters();
    setActiveButton(null); // 重置时取消高亮
});