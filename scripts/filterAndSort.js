// filterAndSort.js
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
        // 添加移动动画
        portfolioItems.forEach(item => item.classList.add('move'));

        // 延迟执行排序和重新布局
        setTimeout(() => {
            portfolioItems.sort((a, b) => {
                const dateA = new Date(a.getAttribute('data-date'));
                const dateB = new Date(b.getAttribute('data-date'));
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            });

            // 清空网格
            portfolioGrid.innerHTML = '';

            // 重新添加卡片
            portfolioItems.forEach(item => {
                if (currentFilter === 'all' || item.getAttribute('data-tags').includes(currentFilter)) {
                    portfolioGrid.appendChild(item);
                }
            });

            // 移除移动动画
            setTimeout(() => {
                portfolioItems.forEach(item => item.classList.remove('move'));
            }, 10); // 稍微延迟以确保动画生效
        }, 500); // 等待动画完成
    }

    function filterItems(category, button) {
        currentFilter = category;

        // 添加移动动画
        portfolioItems.forEach(item => item.classList.add('move'));

        // 延迟执行筛选和重新布局
        setTimeout(() => {
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

            // 移除移动动画
            setTimeout(() => {
                portfolioItems.forEach(item => item.classList.remove('move'));
            }, 10); // 稍微延迟以确保动画生效
        }, 500); // 等待动画完成

        setActiveButton(button);
    }

    function resetFilters() {
        currentFilter = 'all';

        // 添加移动动画
        portfolioItems.forEach(item => item.classList.add('move'));

        // 延迟执行重置和重新布局
        setTimeout(() => {
            portfolioItems.forEach(item => {
                item.style.display = 'block';
            });

            // 移除移动动画
            setTimeout(() => {
                portfolioItems.forEach(item => item.classList.remove('move'));
            }, 10); // 稍微延迟以确保动画生效
        }, 500); // 等待动画完成

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

document.addEventListener('DOMContentLoaded', setupFilterAndSort);