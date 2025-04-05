// 语言切换功能
let currentLanguage = 'zh'; // 默认为中文

export function initLanguageSwitch() {
    const languageBtn = document.getElementById('languageToggle');
    const langIndicator = languageBtn.querySelector('.lang-indicator');
    
    // 检查本地存储的语言设置
    const savedLanguage = localStorage.getItem('portfolioLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        updateLanguageIndicator();
        // 初始加载正确的语言
        setTimeout(() => {
            loadPortfolioData(currentLanguage);
        }, 100);
    }
    
    // 点击切换语言
    languageBtn.addEventListener('click', () => {
        // 切换语言
        currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
        
        // 保存设置
        localStorage.setItem('portfolioLanguage', currentLanguage);
        
        // 更新指示器
        updateLanguageIndicator();
        
        // 重新加载作品集数据
        loadPortfolioData(currentLanguage);
    });
    
    // 更新语言指示器显示
    function updateLanguageIndicator() {
        langIndicator.textContent = currentLanguage === 'zh' ? '中' : 'En';
    }
}

// 根据当前语言加载对应的JSON文件
export async function loadPortfolioData(language) {
    try {
        const jsonFile = language === 'zh' ? 'portfolio.json' : 'portfolio-Eng.json';
        const response = await fetch(`assets/data/${jsonFile}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load portfolio data: ${response.status}`);
        }
        
        const portfolioData = await response.json();
        
        // 触发自定义事件通知数据已加载
        const dataLoadedEvent = new CustomEvent('portfolioDataLoaded', {
            detail: { data: portfolioData }
        });
        document.dispatchEvent(dataLoadedEvent);
        
        console.log(`Loaded ${language} portfolio data`);
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
} 