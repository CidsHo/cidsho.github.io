/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    const scrollWrapper = document.querySelector('.features-scroll-wrapper');
    const prevButton = document.querySelector('.scroll-button.prev');
    const nextButton = document.querySelector('.scroll-button.next');
    const cardWidth = 330; // 卡片宽度 + 间距
    let currentPosition = 0;
    let isDragging = false;
    let startPosition = 0;
    let currentTranslate = 0;
    let animationID = 0;

    // 触摸事件处理
    scrollWrapper.addEventListener('touchstart', dragStart);
    scrollWrapper.addEventListener('touchend', dragEnd);
    scrollWrapper.addEventListener('touchmove', drag);

    // 鼠标事件处理
    scrollWrapper.addEventListener('mousedown', dragStart);
    scrollWrapper.addEventListener('mouseup', dragEnd);
    scrollWrapper.addEventListener('mouseleave', dragEnd);
    scrollWrapper.addEventListener('mousemove', drag);

    // 防止拖动时选中文本
    scrollWrapper.addEventListener('selectstart', (e) => e.preventDefault());

    function dragStart(e) {
        isDragging = true;
        scrollWrapper.classList.add('dragging');
        startPosition = getPositionX(e);
        currentTranslate = currentPosition;
        cancelMomentumTracking();
    }

    function dragEnd() {
        isDragging = false;
        scrollWrapper.classList.remove('dragging');
        
        // 计算最大滚动范围
        const containerWidth = scrollWrapper.parentElement.clientWidth;
        const cards = scrollWrapper.querySelectorAll('.feature-card');
        const lastCard = cards[cards.length - 1];
        const lastCardRight = lastCard.offsetLeft + lastCard.offsetWidth;
        const maxScroll = lastCardRight - containerWidth;
        
        // 确保最终位置在有效范围内
        currentPosition = Math.max(0, Math.min(currentPosition, maxScroll));
        currentTranslate = currentPosition;
        
        scrollWrapper.style.transform = `translateX(-${currentPosition}px)`;
        updateScrollButtons();
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const currentX = getPositionX(e);
        const diff = currentX - startPosition;
        const newPosition = currentTranslate - diff;
        
        // 计算最大滚动范围
        const containerWidth = scrollWrapper.parentElement.clientWidth;
        const cards = scrollWrapper.querySelectorAll('.feature-card');
        const lastCard = cards[cards.length - 1];
        const lastCardRight = lastCard.offsetLeft + lastCard.offsetWidth;
        const maxScroll = lastCardRight - containerWidth;
        
        // 严格限制滚动范围
        if (newPosition < 0) {
            currentPosition = 0;
        } else if (newPosition > maxScroll) {
            currentPosition = maxScroll;
        } else {
            currentPosition = newPosition;
        }
        
        scrollWrapper.style.transform = `translateX(-${currentPosition}px)`;
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    function cancelMomentumTracking() {
        cancelAnimationFrame(animationID);
    }

    function updateScrollButtons() {
        const containerWidth = scrollWrapper.parentElement.clientWidth;
        const cards = scrollWrapper.querySelectorAll('.feature-card');
        const lastCard = cards[cards.length - 1];
        const lastCardRight = lastCard.offsetLeft + lastCard.offsetWidth;
        const maxScroll = lastCardRight - containerWidth;
        
        prevButton.style.display = currentPosition <= 0 ? 'none' : 'flex';
        nextButton.style.display = currentPosition >= maxScroll ? 'none' : 'flex';
    }

    function scrollCards(direction) {
        const scrollAmount = cardWidth;
        currentPosition += direction * scrollAmount;
        
        // 计算最大滚动范围
        const containerWidth = scrollWrapper.parentElement.clientWidth;
        const cards = scrollWrapper.querySelectorAll('.feature-card');
        const lastCard = cards[cards.length - 1];
        const lastCardRight = lastCard.offsetLeft + lastCard.offsetWidth;
        const maxScroll = lastCardRight - containerWidth;
        
        // 确保不会滚动过头
        currentPosition = Math.max(0, Math.min(currentPosition, maxScroll));
        
        currentTranslate = currentPosition;
        scrollWrapper.style.transform = `translateX(-${currentPosition}px)`;
        updateScrollButtons();
    }

    prevButton.addEventListener('click', () => scrollCards(-1));
    nextButton.addEventListener('click', () => scrollCards(1));

    // 初始化按钮状态
    updateScrollButtons();

    initChoiceModule();
});

/**
 * 初始化应用程序
 */
function initApp() {
    console.log('初始化应用程序...');
    initFloatingToolbar();
    initFlipAnimation();
    initScrollEvents();
    // 其他初始化函数...
}

/**
 * 初始化浮动工具栏
 */
function initFloatingToolbar() {
    console.log('初始化浮动工具栏...');
    const toolbar = document.getElementById('floatingToolbar');
    if (!toolbar) {
        console.error('未找到floatingToolbar元素');
        return;
    }
    
    // 主页按钮
    const homeBtn = document.getElementById('goToHome');
    if (homeBtn) {
        homeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.location.href = '/portfolio.html';
        });
    }
    
    // 回到顶部按钮
    const topBtn = document.getElementById('backToTop');
    if (topBtn) {
        topBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // 到底部按钮
    const bottomBtn = document.getElementById('goToBottom');
    if (bottomBtn) {
        bottomBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.scrollTo({ 
                top: document.body.scrollHeight, 
                behavior: 'smooth' 
            });
        });
    }

    // 翻译按钮
    const translateBtn = document.getElementById('translateBtn');
    if (translateBtn) {
        translateBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleTranslation();
        });
    }
    
    // 拖拽功能
    let isDragging = false;
    let startX, startY;
    let toolbarOffsetX, toolbarOffsetY;

    // 添加拖动事件监听器
    toolbar.addEventListener('mousedown', startDrag);
    toolbar.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        // 如果点击的是按钮，不启动拖动
        if (e.target.closest('button')) {
            return;
        }
        
        isDragging = true;
        const rect = toolbar.getBoundingClientRect();
        
        // 如果工具栏使用right/bottom定位，转换为left/top
        if (getComputedStyle(toolbar).right !== 'auto') {
            toolbar.style.left = rect.left + 'px';
            toolbar.style.top = rect.top + 'px';
            toolbar.style.right = 'auto';
            toolbar.style.bottom = 'auto';
        }
        
        if (e.type === 'mousedown') {
            startX = e.clientX;
            startY = e.clientY;
            toolbarOffsetX = e.clientX - rect.left;
            toolbarOffsetY = e.clientY - rect.top;
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
        } else if (e.type === 'touchstart') {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            toolbarOffsetX = touch.clientX - rect.left;
            toolbarOffsetY = touch.clientY - rect.top;
            document.addEventListener('touchmove', onDrag, { passive: false });
            document.addEventListener('touchend', stopDrag);
        }
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        let currentX, currentY;
        if (e.type === 'mousemove') {
            currentX = e.clientX;
            currentY = e.clientY;
        } else if (e.type === 'touchmove') {
            const touch = e.touches[0];
            currentX = touch.clientX;
            currentY = touch.clientY;
        }
        
        // 计算新位置
        const left = currentX - toolbarOffsetX;
        const top = currentY - toolbarOffsetY;
        
        // 限制在窗口范围内
        const maxX = window.innerWidth - toolbar.offsetWidth;
        const maxY = window.innerHeight - toolbar.offsetHeight;
        
        toolbar.style.left = Math.max(0, Math.min(left, maxX)) + 'px';
        toolbar.style.top = Math.max(0, Math.min(top, maxY)) + 'px';
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('touchend', stopDrag);
    }
}

/**
 * 初始化滚动动画
 */
function initScrollEvents() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // 初始检查元素
    checkElements();
    
    // 滚动时检查元素
    window.addEventListener('scroll', checkElements);
    
    function checkElements() {
        const triggerBottom = window.innerHeight * 0.8;
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('animated');
            }
        });
    }
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
    console.log('初始化翻页动画...');
    const flipLetters = document.querySelectorAll('.flip-letter');
    const artisticTitle = document.querySelector('.artistic-title');
    let hasTriggeredByScroll = false;
    let isFlipped = false;
    let animationInProgress = false;
    
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
        if (!flipLetters || flipLetters.length === 0) {
            console.error('未找到.flip-letter元素');
            return;
        }
        
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

/**
 * 禁止图片拖动
 */
function preventImageDragging() {
    // 选择所有图片
    const images = document.querySelectorAll('img');
    
    // 为每个图片添加事件监听器
    images.forEach(img => {
        // 阻止拖动开始事件
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
        
        // 阻止鼠标按下事件 (可选)
        img.addEventListener('mousedown', (e) => {
            e.preventDefault();
        }, false);
    });
}

// 在页面加载完成后调用
document.addEventListener('DOMContentLoaded', preventImageDragging);

// 翻译功能相关变量
let isTranslated = false;
let originalTexts = new Map();
let translations = null;

// 加载翻译文件
async function loadTranslations() {
    try {
        const response = await fetch('/articles/design/spVR-allinone/assets/translation/zh-CN.json');
        translations = await response.json();
        console.log('翻译文件加载成功');
    } catch (error) {
        console.error('加载翻译文件失败:', error);
    }
}

// 保存原始文本
function saveOriginalTexts() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        // 保存包含HTML标签的原始内容
        originalTexts.set(key, element.innerHTML);
    });
}

// 切换翻译
async function toggleTranslation() {
    if (!translations) {
        await loadTranslations();
    }
    
    if (!translations) {
        console.error('无法加载翻译文件');
        return;
    }
    
    if (!isTranslated) {
        // 保存原始文本
        saveOriginalTexts();
        
        // 应用翻译
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                // 处理换行符
                const translatedText = translations[key].replace(/\\n/g, '\n');
                element.innerHTML = translatedText.replace(/\n/g, '<br>');
            }
        });
        
        // 更新按钮状态
        const translateBtn = document.getElementById('translateBtn');
        if (translateBtn) {
            translateBtn.querySelector('.lang-indicator').textContent = 'CN';
        }
    } else {
        // 恢复原始文本
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (originalTexts.has(key)) {
                element.innerHTML = originalTexts.get(key);
            }
        });
        
        // 更新按钮状态
        const translateBtn = document.getElementById('translateBtn');
        if (translateBtn) {
            translateBtn.querySelector('.lang-indicator').textContent = 'EN';
        }
    }
    
    isTranslated = !isTranslated;
}

/**
 * 初始化选择模块
 */
function initChoiceModule() {
    const choiceImages = document.querySelectorAll('.choice-image-container');
    const choiceContents = document.querySelectorAll('.choice-detail');
    const choiceContent = document.querySelector('.choice-content');
    let currentChoice = null;

    // 为每个图片添加点击事件
    choiceImages.forEach(image => {
        image.addEventListener('click', () => {
            const choice = image.getAttribute('data-choice');
            showChoiceContent(choice);
        });
    });

    // 为内容区域添加切换事件
    choiceContents.forEach(content => {
        const switchButtons = content.querySelectorAll('.content-switch');
        switchButtons.forEach(button => {
            button.addEventListener('click', () => {
                const isRight = button.classList.contains('right');
                if (isRight) {
                    showChoiceContent('B');
                } else {
                    showChoiceContent('A');
                }
            });
        });
    });

    // 显示选择的内容
    function showChoiceContent(choice) {
        if (currentChoice === choice) return;
        
        // 先移除所有活动状态
        choiceContents.forEach(content => {
            content.classList.remove('active');
            content.style.visibility = 'hidden';
        });

        // 添加新的活动状态
        const targetContent = document.getElementById(`choice${choice}-content`);
        if (targetContent) {
            // 如果内容区域未展开，先展开
            if (!choiceContent.classList.contains('expanded')) {
                choiceContent.classList.add('expanded');
                // 等待展开动画完成后再显示内容
                setTimeout(() => {
                    targetContent.style.visibility = 'visible';
                    targetContent.classList.add('active');
                    currentChoice = choice;
                }, 500);
            } else {
                // 如果已经展开，直接显示内容
                targetContent.style.visibility = 'visible';
                targetContent.classList.add('active');
                currentChoice = choice;
            }
        }
    }

    // 默认不显示任何内容
    choiceContent.classList.remove('expanded');
    choiceContents.forEach(content => {
        content.style.visibility = 'hidden';
    });
}