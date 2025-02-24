document.addEventListener('DOMContentLoaded', function() {
    var navToggle = document.getElementById('nav-toggle');
    var menuOverlay = document.getElementById('menu-overlay');

    navToggle.addEventListener('click', function() {
        menuOverlay.classList.toggle('active');
        navToggle.classList.toggle('rotate');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const sortDateAsc = document.getElementById('sort-date-asc');
    const sortDateDesc = document.getElementById('sort-date-desc');
    const filterPhotography = document.getElementById('filter-photography');
    const filterDesign = document.getElementById('filter-design');
    const filterIdeas = document.getElementById('filter-ideas');

    // 获取所有项目
    const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));

    // 排序函数
    function sortItems(order) {
        portfolioItems.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // 清空网格并重新添加排序后的项目
        portfolioGrid.innerHTML = '';
        portfolioItems.forEach(item => portfolioGrid.appendChild(item));
    }

    // 筛选函数
    function filterItems(category) {
        portfolioItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // 绑定事件
    sortDateAsc.addEventListener('click', () => sortItems('asc'));
    sortDateDesc.addEventListener('click', () => sortItems('desc'));
    filterPhotography.addEventListener('click', () => filterItems('photography'));
    filterDesign.addEventListener('click', () => filterItems('design'));
    filterIdeas.addEventListener('click', () => filterItems('ideas'));
});