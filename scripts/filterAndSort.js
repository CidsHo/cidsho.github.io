// filterAndSort.js
let currentFilter = 'all'; // 当前筛选状态
let currentSort = 'desc'; // 当前排序状态（默认按日期降序）

export function setupFilterAndSort() {
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

    // 设置按钮的选中状态
    function setActiveButton(button, type) {
        // 清除同类型按钮的选中状态
        if (type === 'filter') {
            document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        } else if (type === 'sort') {
            document.querySelectorAll('.sort-button').forEach(btn => btn.classList.remove('active'));
        }

        // 设置当前按钮的选中状态
        if (button) {
            button.classList.add('active');
        }
    }

    // 应用筛选和排序
    function applyFilterAndSort() {
        portfolioItems.forEach(item => item.classList.add('move'));

        setTimeout(() => {
            // 筛选
            portfolioItems.forEach(item => {
                // 获取并预处理标签
                const itemTags = item.getAttribute('data-tags')
                    .split(',')
                    .map(tag => tag.trim()); // 不转换为小写，保持原始大小写

                // 检查精选/Featured标签
                const isFeatured = itemTags.some(tag => 
                    tag === '精选' || tag === 'Featured'
                );

                // 根据当前筛选条件显示/隐藏项目
                let shouldShow = false;

                if (currentFilter === '精选' || currentFilter === 'Featured') {
                    shouldShow = isFeatured;
                } else if (currentFilter === 'all') {
                    shouldShow = true;
                } else {
                    // 标签映射表
                    const tagMap = {
                        '摄影': ['摄影', 'Photography'],
                        'Photography': ['摄影', 'Photography'],
                        '设计': ['设计', 'Design'],
                        'Design': ['设计', 'Design'],
                        '想法': ['想法', 'Ideas'],
                        'Ideas': ['想法', 'Ideas']
                    };

                    // 检查标签是否匹配（考虑中英文对应关系）
                    shouldShow = itemTags.some(tag => 
                        tagMap[currentFilter]?.includes(tag)
                    );
                }

                item.style.display = shouldShow ? 'block' : 'none';
            });

            // 排序
            portfolioItems.sort((a, b) => {
                const dateA = new Date(a.getAttribute('data-date'));
                const dateB = new Date(b.getAttribute('data-date'));
                return currentSort === 'asc' ? dateA - dateB : dateB - dateA;
            });

            // 清空网格
            portfolioGrid.innerHTML = '';

            // 重新添加卡片
            portfolioItems.forEach(item => {
                if (item.style.display !== 'none') {
                    portfolioGrid.appendChild(item);
                }
            });

            // 移除移动动画
            setTimeout(() => {
                portfolioItems.forEach(item => item.classList.remove('move'));
            }, 10);
        }, 500);
    }

    // 设置筛选状态
    function setFilter(category, button) {
        console.log('Setting filter to:', category); // 调试日志
        currentFilter = category;
        applyFilterAndSort();
        setActiveButton(button, 'filter');
    }

    // 设置排序状态
    function setSort(order, button) {
        currentSort = order;
        applyFilterAndSort();
        setActiveButton(button, 'sort'); // 设置排序按钮的选中状态
    }

    // 重置筛选
    function resetFilters() {
        currentFilter = 'all';
        applyFilterAndSort();
        setActiveButton(null, 'filter'); // 清除筛选按钮的选中状态
    }

    // 修改事件监听器设置
    if (sortDateAsc) sortDateAsc.addEventListener('click', () => setSort('asc', sortDateAsc));
    if (sortDateDesc) sortDateDesc.addEventListener('click', () => setSort('desc', sortDateDesc));
    
    // 筛选按钮事件监听器
    if (filterPhotography) {
        filterPhotography.addEventListener('click', () => {
            setFilter('摄影', filterPhotography);
        });
    }
    
    if (filterDesign) {
        filterDesign.addEventListener('click', () => {
            setFilter('设计', filterDesign);
        });
    }
    
    if (filterIdeas) {
        filterIdeas.addEventListener('click', () => {
            setFilter('想法', filterIdeas);
        });
    }
    
    if (resetFilter) {
        resetFilter.addEventListener('click', resetFilters);
    }
    
    if (filterStar || filterStarIcon) {
        const starHandler = () => {
            setFilter('精选', filterStar || filterStarIcon);
        };
        if (filterStar) filterStar.addEventListener('click', starHandler);
        if (filterStarIcon) filterStarIcon.addEventListener('click', starHandler);
    }

    // 初始化默认状态
    setSort('desc', sortDateDesc); // 默认按日期降序
    setFilter('all', null); // 默认显示所有内容
}