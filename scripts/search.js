// search.js
export function setupSearch() {
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