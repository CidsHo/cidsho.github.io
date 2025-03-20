/**
 * 项目介绍网站主JS文件 - 更新版
 * 用于实现滚动动画、多语言支持和交互效果
 */

// 语言切换顺序
const languages = ['en', 'zh-CN', 'zh-TW'];
// 语言显示标签
const langLabels = {
    'en': 'EN',
    'zh-CN': '简',
    'zh-TW': '繁'
};

// 当前语言索引
let currentLangIndex = 0;

// 翻译数据
let translations = {};
let uiTranslations = {};

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化功能');
    
    try {
        // 检查assets目录是否存在
        console.log('检查翻译文件目录...');
        
        // 创建示例翻译目录和文件的辅助函数
        async function createTranslationFiles() {
            // 此函数会在控制台提供如何手动创建目录和文件的指导
            console.warn('需要手动创建以下目录结构:');
            console.warn('./assets/');
            console.warn('├── translation/');
            console.warn('│   ├── en.json');
            console.warn('│   ├── zh-CN.json');
            console.warn('│   └── zh-TW.json');
            console.warn('└── ui/');
            console.warn('    └── translation/');
            console.warn('        ├── en.json');
            console.warn('        ├── zh-CN.json');
            console.warn('        └── zh-TW.json');
        }
        
        // 检查目录和文件
        fetch('./assets/ui/translation/en.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('翻译文件不存在');
                }
                return response.json();
            })
            .catch(error => {
                console.error('翻译文件可能不存在:', error);
                createTranslationFiles();
            });
        
        // 加载语言
        loadLanguage(languages[currentLangIndex]);
        
        // 初始化滚动动画
        initScrollAnimations();
        
        // 初始化平滑滚动
        initSmoothScroll();
        
        // 初始化浮动工具栏
        initFloatingToolbar();
        
        // 初始化语言切换器
        initLanguageToggle();
        
        // 添加翻页动画初始化
        initFlipAnimation();
    } catch (error) {
        console.error('初始化过程中发生错误:', error);
    }
});

/**
 * 加载语言文件
 * @param {string} lang - 语言代码
 */
async function loadLanguage(lang) {
    try {
        console.log(`尝试加载语言: ${lang}`);
        
        // 修正文件路径，使用当前目录下的assets
        const uiUrl = `./assets/ui/translation/${lang}.json`;
        const contentUrl = `./assets/translation/${lang}.json`;
        
        console.log(`加载UI翻译: ${uiUrl}`);
        console.log(`加载内容翻译: ${contentUrl}`);
        
        // 创建一个简单的加载指示器
        const loadingMsg = document.createElement('div');
        loadingMsg.style.position = 'fixed';
        loadingMsg.style.top = '10px';
        loadingMsg.style.right = '10px';
        loadingMsg.style.background = 'rgba(0,0,0,0.7)';
        loadingMsg.style.color = 'white';
        loadingMsg.style.padding = '10px';
        loadingMsg.style.borderRadius = '5px';
        loadingMsg.style.zIndex = '9999';
        loadingMsg.textContent = `正在加载${lang}语言...`;
        document.body.appendChild(loadingMsg);
        
        // 加载UI翻译
        try {
            const uiResponse = await fetch(uiUrl);
            if (!uiResponse.ok) {
                throw new Error(`HTTP错误: ${uiResponse.status} ${uiResponse.statusText}`);
            }
            const uiText = await uiResponse.text(); // 先获取文本以便检查
            
            if (!uiText || uiText.trim() === '') {
                throw new Error(`UI翻译文件为空`);
            }
            
            try {
                uiTranslations = JSON.parse(uiText);
            } catch (jsonError) {
                throw new Error(`UI翻译文件不是有效的JSON: ${jsonError.message}`);
            }
            
            console.log('UI翻译加载成功');
        } catch (uiError) {
            document.body.removeChild(loadingMsg);
            throw new Error(`UI翻译加载失败: ${uiError.message}`);
        }
        
        // 加载内容翻译
        try {
            const contentResponse = await fetch(contentUrl);
            if (!contentResponse.ok) {
                throw new Error(`HTTP错误: ${contentResponse.status} ${contentResponse.statusText}`);
            }
            const contentText = await contentResponse.text(); // 先获取文本以便检查
            
            if (!contentText || contentText.trim() === '') {
                throw new Error(`内容翻译文件为空`);
            }
            
            try {
                translations = JSON.parse(contentText);
            } catch (jsonError) {
                throw new Error(`内容翻译文件不是有效的JSON: ${jsonError.message}`);
            }
            
            console.log('内容翻译加载成功');
        } catch (contentError) {
            document.body.removeChild(loadingMsg);
            throw new Error(`内容翻译加载失败: ${contentError.message}`);
        }
        
        // 应用翻译
        applyTranslations();
        
        // 更新HTML语言属性
        document.documentElement.lang = lang;
        
        // 更新语言指示器
        updateLanguageIndicator(lang);
        
        // 保存用户语言偏好
        localStorage.setItem('preferredLanguage', lang);
        
        // 移除加载指示器
        document.body.removeChild(loadingMsg);
        
        console.log(`语言已切换为: ${lang}`);
        
    } catch (error) {
        console.error('加载翻译时出错:', error);
        
        // 显示错误提示给用户
        const errorMsg = document.createElement('div');
        errorMsg.style.position = 'fixed';
        errorMsg.style.top = '10px';
        errorMsg.style.left = '50%';
        errorMsg.style.transform = 'translateX(-50%)';
        errorMsg.style.background = 'rgba(255,0,0,0.8)';
        errorMsg.style.color = 'white';
        errorMsg.style.padding = '15px';
        errorMsg.style.borderRadius = '5px';
        errorMsg.style.zIndex = '9999';
        errorMsg.style.maxWidth = '80%';
        errorMsg.style.textAlign = 'center';
        errorMsg.innerHTML = `<strong>语言加载错误</strong><br>${error.message}<br><small>请检查翻译文件是否存在且内容有效</small>`;
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.marginTop = '10px';
        closeBtn.style.padding = '5px 10px';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '3px';
        closeBtn.style.background = 'white';
        closeBtn.style.color = 'black';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function() {
            document.body.removeChild(errorMsg);
        };
        errorMsg.appendChild(closeBtn);
        
        document.body.appendChild(errorMsg);
        
        // 5秒后自动关闭错误提示
        setTimeout(() => {
            if (document.body.contains(errorMsg)) {
                document.body.removeChild(errorMsg);
            }
        }, 5000);
    }
}

/**
 * 应用翻译到页面元素
 */
function applyTranslations() {
    console.log('正在应用翻译...');
    
    // 应用正常文本翻译
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        let text = null;
        
        // 检查是否是UI元素
        if (key.startsWith('ui.')) {
            // 从UI翻译获取
            const uiKey = key.substring(3); // 移除 'ui.' 前缀
            text = getNestedProperty(uiTranslations, uiKey);
        } else {
            // 从内容翻译获取
            text = getNestedProperty(translations, key);
        }
        
        if (text) {
            element.textContent = text;
        } else {
            console.warn(`未找到翻译键: ${key}`);
        }
    });
    
    // 应用placeholder翻译
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        let text = null;
        
        if (key.startsWith('ui.')) {
            const uiKey = key.substring(3);
            text = getNestedProperty(uiTranslations, uiKey);
        } else {
            text = getNestedProperty(translations, key);
        }
        
        if (text) {
            element.placeholder = text;
        } else {
            console.warn(`未找到placeholder翻译键: ${key}`);
        }
    });
    
    console.log('翻译应用完成');
}

/**
 * 获取嵌套对象的属性值
 * @param {Object} obj - 嵌套对象
 * @param {string} path - 属性路径，如 'home.title'
 * @returns {string|null} - 属性值或null
 */
function getNestedProperty(obj, path) {
    return path.split('.').reduce((prev, curr) => {
        return prev && prev[curr] ? prev[curr] : null;
    }, obj);
}

/**
 * 更新语言指示器显示
 * @param {string} lang - 当前语言代码
 */
function updateLanguageIndicator(lang) {
    const indicator = document.querySelector('.lang-indicator');
    if (indicator) {
        indicator.textContent = langLabels[lang] || lang.toUpperCase();
    }
}

/**
 * 初始化语言切换按钮
 */
function initLanguageToggle() {
    // 检查本地存储中的语言偏好
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        // 找到保存的语言在数组中的索引
        const savedIndex = languages.indexOf(savedLang);
        if (savedIndex !== -1) {
            currentLangIndex = savedIndex;
            loadLanguage(languages[currentLangIndex]);
        }
    }
    
    // 为语言切换按钮添加点击事件
    const langToggleBtn = document.getElementById('langToggle');
    if (langToggleBtn) {
        console.log('找到语言切换按钮，添加点击事件');
        langToggleBtn.addEventListener('click', function(e) {
            console.log('语言按钮被点击');
            // 循环切换语言
            currentLangIndex = (currentLangIndex + 1) % languages.length;
            console.log(`切换到语言索引: ${currentLangIndex}, 语言: ${languages[currentLangIndex]}`);
            loadLanguage(languages[currentLangIndex]);
        });
    } else {
        console.error('未找到ID为langToggle的按钮!');
    }
}

/**
 * 初始化浮动工具栏
 */
function initFloatingToolbar() {
    const toolbar = document.getElementById('floatingToolbar');
    const handle = toolbar.querySelector('.toolbar-handle');
    
    // 主页按钮 - 跳转到portfolio.html
    document.getElementById('goToHome').addEventListener('click', function() {
        window.location.href = '/portfolio.html';
    });
    
    // 回到顶部按钮
    document.getElementById('backToTop').addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // 到底部按钮
    document.getElementById('goToBottom').addEventListener('click', function() {
        window.scrollTo({ 
            top: document.body.scrollHeight, 
            behavior: 'smooth' 
        });
    });
    
    // 拖拽功能
    let isDragging = false;
    let offsetX, offsetY;
    
    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: false });
    
    function startDrag(e) {
        isDragging = true;
        
        // 鼠标事件
        if (e.type === 'mousedown') {
            offsetX = e.clientX - toolbar.getBoundingClientRect().left;
            offsetY = e.clientY - toolbar.getBoundingClientRect().top;
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
        } 
        // 触摸事件
        else if (e.type === 'touchstart') {
            e.preventDefault();
            const touch = e.touches[0];
            offsetX = touch.clientX - toolbar.getBoundingClientRect().left;
            offsetY = touch.clientY - toolbar.getBoundingClientRect().top;
            document.addEventListener('touchmove', onDrag, { passive: false });
            document.addEventListener('touchend', stopDrag);
        }
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        
        let clientX, clientY;
        
        // 鼠标事件
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } 
        // 触摸事件
        else if (e.type === 'touchmove') {
            e.preventDefault();
            const touch = e.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        }
        
        // 计算新位置
        const newLeft = clientX - offsetX;
        const newTop = clientY - offsetY;
        
        // 确保工具栏不超出视口边界
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const toolbarWidth = toolbar.offsetWidth;
        const toolbarHeight = toolbar.offsetHeight;
        
        const maxX = windowWidth - toolbarWidth;
        const maxY = windowHeight - toolbarHeight;
        
        // 设置新位置，并保持在视口内
        toolbar.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
        toolbar.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
        
        // 拖动时移除原来的靠右固定位置和垂直居中
        toolbar.style.right = 'auto';
        toolbar.style.transform = 'none';
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('touchend', stopDrag);
        
        // 保存工具栏位置到本地存储
        const rect = toolbar.getBoundingClientRect();
        localStorage.setItem('toolbarPosition', JSON.stringify({
            left: rect.left,
            top: rect.top
        }));
    }
    
    // 从本地存储中恢复工具栏位置
    const savedPosition = localStorage.getItem('toolbarPosition');
    if (savedPosition) {
        const position = JSON.parse(savedPosition);
        toolbar.style.left = position.left + 'px';
        toolbar.style.top = position.top + 'px';
        toolbar.style.right = 'auto';
        toolbar.style.transform = 'none';
    }
}

/**
 * 初始化元素滚动动画
 */
function initScrollAnimations() {
    // 获取所有带有animate-on-scroll类的元素
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        animatedElements.forEach(element => {
            // 检查元素是否在可视区域内
            if (isElementInViewport(element)) {
                element.classList.add('visible');
            } else {
                // 可选：当元素离开可视区域时移除动画类
                // element.classList.remove('visible');
            }
        });
    });
    
    // 页面加载时立即检查一次
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 100);
}

/**
 * 判断元素是否在可视区域内
 * @param {HTMLElement} element - 需要检查的DOM元素
 * @returns {boolean} - 是否在可视区域内
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // 元素顶部在视口下方，且元素底部在视口上方
    return (
        rect.top <= windowHeight * 0.8 && // 当元素的顶部进入视口的下半部分时触发
        rect.bottom >= 0
    );
}

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 防止默认的锚点跳转
            e.preventDefault();
            
            // 获取目标元素
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // 滚动到目标元素
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * 初始化翻页动画
 */
function initFlipAnimation() {
    const flipLetters = document.querySelectorAll('.flip-letter');
    const artisticTitle = document.querySelector('.artistic-title');
    let hasTriggeredByScroll = false; // 跟踪是否已通过滚轮触发过
    let isFlipped = false; // 跟踪当前状态
    let animationInProgress = false; // 防止动画重叠
    
    // 初始显示
    setTimeout(() => {
        // 触发第一次翻转
        triggerFlipAnimation();
    }, 2000); // 页面加载2秒后开始第一次翻转
    
    // 添加鼠标悬停触发
    if (artisticTitle) {
        artisticTitle.addEventListener('mouseenter', () => {
            if (!animationInProgress) {
                triggerFlipAnimation();
            }
        });
    }

    // 添加滚轮触发 (只在第一次滚动时触发)
    window.addEventListener('wheel', () => {
        if (!hasTriggeredByScroll && !animationInProgress) {
            triggerFlipAnimation();
            hasTriggeredByScroll = true;
        }
    }, { passive: true });
    
    // 设置周期性翻转动画
    setInterval(() => {
        if (!animationInProgress) {
            triggerFlipAnimation();
        }
    }, 12000); // 每12秒自动触发一次
    
    // 触发翻转动画的核心函数
    function triggerFlipAnimation() {
        animationInProgress = true;
        
        // 定义交错延迟序列
        const delays = [];
        for (let i = 0; i < flipLetters.length; i++) {
            delays.push(Math.random() * 400 + 100); // 100-500ms的随机延迟
        }
        
        if (!isFlipped) {
            // 翻转到VRINTERACT
            flipLetters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.classList.add('flipped');
                    playFlipSound();
                    
                    // 最后一个字母翻转完成后，更新状态
                    if (index === flipLetters.length - 1) {
                        setTimeout(() => {
                            isFlipped = true;
                            animationInProgress = false;
                        }, 500);
                    }
                }, delays[index]);
            });
        } else {
            // 翻转回SHADOWPLAY
            flipLetters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.classList.remove('flipped');
                    playFlipSound();
                    
                    // 最后一个字母翻转完成后，更新状态
                    if (index === flipLetters.length - 1) {
                        setTimeout(() => {
                            isFlipped = false;
                            animationInProgress = false;
                        }, 500);
                    }
                }, delays[index]);
            });
        }
    }
    
    // 辅助函数：播放翻转声音（可选）
    function playFlipSound() {
        // 如果想添加真实声音，可以在这里实现
    }
}