// blog.js

// 动态显示 Banner
function setupBanner() {
    const banner = document.querySelector('.blog-banner');
    const bannerImage = banner.querySelector('img');

    // 如果没有 Banner 图片，隐藏 Banner 区
    if (!bannerImage || bannerImage.src.includes('placeholder.jpg')) {
        banner.style.display = 'none';
    } else {
        banner.style.display = 'block';
    }
}

// 可折叠内容模块功能 - 彻底重写解决滚动问题
function setupCollapsibleSections() {
    const collapsibles = document.querySelectorAll('.collapsible-container');
    
    collapsibles.forEach(collapsible => {
        const header = collapsible.querySelector('.collapsible-header');
        const content = collapsible.querySelector('.collapsible-content');
        
        // 初始状态设置
        content.style.height = '0';
        
        header.addEventListener('click', async function(event) {
            // 阻止默认行为和冒泡
            event.preventDefault();
            event.stopPropagation();
            
            // 1. 记录当前滚动位置和按钮位置
            const headerRect = header.getBoundingClientRect();
            const headerPositionY = headerRect.top + window.scrollY;
            
            // 2. 切换激活状态
            const willBeActive = !collapsible.classList.contains('active');
            collapsible.classList.toggle('active');
            
            if (willBeActive) {
                // 展开内容
                
                // 3. 临时冻结整个文档滚动 - 防止浏览器自动滚动
                document.body.style.overflow = 'hidden';
                document.body.style.height = '100%';
                
                // 4. 设置内容高度为自动，计算实际高度
                content.style.height = 'auto';
                const actualHeight = content.scrollHeight;
                content.style.height = '0';
                
                // 5. 强制重绘
                void content.offsetHeight;
                
                // 6. 设置为实际高度触发展开动画
                content.style.height = actualHeight + 'px';
                
                // 7. 等待过渡完成
                await new Promise(resolve => {
                    setTimeout(() => {
                        // 8. 恢复文档滚动
                        document.body.style.overflow = '';
                        document.body.style.height = '';
                        
                        // 9. 关键：确保滚动位置保持在按钮位置
                        window.scrollTo({
                            top: headerPositionY,
                            behavior: 'instant'
                        });
                        
                        resolve();
                    }, 300); // 配合过渡时间
                });
            } else {
                // 折叠内容
                const currentHeight = content.scrollHeight;
                content.style.height = currentHeight + 'px';
                
                // 强制重绘
                void content.offsetHeight;
                
                // 开始折叠动画
                content.style.height = '0';
            }
        });
    });
}

// 修复返回按钮功能 - 使用正确的根目录路径
function setupBackButton() {
    const backButton = document.querySelector('.back-button');
    
    if (backButton) {
        // 移除任何可能已存在的点击事件
        backButton.replaceWith(backButton.cloneNode(true));
        
        // 重新获取按钮引用并添加新的事件监听
        const newBackButton = document.querySelector('.back-button');
        
        newBackButton.addEventListener('click', (event) => {
            // 阻止默认行为
            event.preventDefault();
            
            // 当前页面URL
            const currentUrl = window.location.href;
            // 获取referrer（来源页面）
            const referrer = document.referrer;
            
            console.log('当前页面:', currentUrl);
            console.log('上一页地址:', referrer);
            
            // 1. 检查是否有浏览历史且来源不为空
            if (window.history.length > 1 && referrer) {
                // 正常情况：有历史记录，直接返回
                window.history.back();
            } else {
                // 2. 没有历史记录（可能是新标签页打开）：尝试智能返回
                
                // 分析当前URL，尝试确定合适的返回页面
                let returnUrl = '/index.html'; // 默认返回首页
                
                // 检查当前路径是否包含博客文章路径
                const isArticlePage = currentUrl.includes('/articles/blog/');
                
                if (isArticlePage) {
                    // 如果是文章页面，默认返回作品集页面
                    returnUrl = '/portfolio.html';
                    
                    // 如果URL中包含特定分类，可以进一步细化返回目标
                    if (currentUrl.includes('/tech/')) {
                        // 技术类文章
                        returnUrl = '/portfolio.html#tech';
                    } else if (currentUrl.includes('/design/')) {
                        // 设计类文章
                        returnUrl = '/portfolio.html#design';
                    } else if (currentUrl.includes('/other/')) {
                        // 其他类别
                        returnUrl = '/portfolio.html#other';
                    }
                }
                
                // 跳转到确定的返回页面
                console.log('智能返回到:', returnUrl);
                window.location.href = returnUrl;
            }
        });
    }
}

// 初始化博客页功能
export function setupBlog() {
    console.log('Setting up blog page...'); // 调试信息

    // 动态显示 Banner
    if (document.querySelector('.blog-banner')) {
        setupBanner();
    }

    // 初始化返回按钮
    setupBackButton();

    // 图片懒加载功能
    if (document.querySelectorAll('.lazy-load').length > 0) {
        lazyLoadImages();
    }
    
    // 代码块复制功能
    setupCodeBlocks();
    
    // 初始化可折叠模块
    setupCollapsibleSections();
}

// 图片懒加载功能
function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('.lazy-load');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.getAttribute('data-src')) {
                    img.src = img.getAttribute('data-src'); // 加载实际图片
                    img.classList.remove('lazy-load'); // 移除 lazy-load 类
                    observer.unobserve(img); // 停止观察已加载的图片
                }
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

// 代码块功能设置
function setupCodeBlocks() {
    const copyButtons = document.querySelectorAll('.copy-button');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 获取相关代码块
            const codeBlock = button.closest('.code-block');
            const codeContent = codeBlock.querySelector('code').textContent;
            
            // 创建临时文本区域复制到剪贴板
            const textarea = document.createElement('textarea');
            textarea.value = codeContent;
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                // 尝试使用旧方法复制
                const successful = document.execCommand('copy');
                if (successful) {
                    // 复制成功反馈
                    button.textContent = '已复制!';
                    button.style.backgroundColor = '#4CAF50';
                    button.style.color = 'white';
                } else {
                    throw new Error('复制失败');
                }
            } catch (err) {
                // 如果旧方法失败，尝试使用Clipboard API
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(codeContent)
                        .then(() => {
                            button.textContent = '已复制!';
                            button.style.backgroundColor = '#4CAF50';
                            button.style.color = 'white';
                        })
                        .catch(err => {
                            console.error('复制失败:', err);
                            button.textContent = '复制失败';
                            button.style.backgroundColor = '#f44336';
                            button.style.color = 'white';
                        });
                } else {
                    console.error('复制失败:', err);
                    button.textContent = '复制失败';
                    button.style.backgroundColor = '#f44336';
                    button.style.color = 'white';
                }
            }
            
            // 移除临时文本区域
            document.body.removeChild(textarea);
            
            // 2秒后恢复原样
            setTimeout(() => {
                button.textContent = '复制';
                button.style.backgroundColor = '';
                button.style.color = '';
            }, 2000);
        });
    });
}

// 默认初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.blog-container')) {
        setupBlog();
    }
});