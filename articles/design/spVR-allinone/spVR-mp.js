/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

/**
 * 初始化应用程序
 */
function initApp() {
    console.log('初始化应用程序...');
    initFloatingToolbar();
    initFlipAnimation();
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
    
    const handle = toolbar.querySelector('.toolbar-handle');
    
    // 主页按钮
    const homeBtn = document.getElementById('goToHome');
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            window.location.href = '/portfolio.html';
        });
    }
    
    // 回到顶部按钮
    const topBtn = document.getElementById('backToTop');
    if (topBtn) {
        topBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // 到底部按钮
    const bottomBtn = document.getElementById('goToBottom');
    if (bottomBtn) {
        bottomBtn.addEventListener('click', function() {
            window.scrollTo({ 
                top: document.body.scrollHeight, 
                behavior: 'smooth' 
            });
        });
    }
    
    // 拖拽功能
    let isDragging = false;
    let offsetX, offsetY;
    
    if (handle) {
        handle.addEventListener('mousedown', startDrag);
        handle.addEventListener('touchstart', startDrag, { passive: false });
    }
    
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
        
        e.preventDefault();
        
        let clientX, clientY;
        
        // 鼠标事件
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } 
        // 触摸事件
        else if (e.type === 'touchmove') {
            const touch = e.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        }
        
        // 计算新位置
        let left = clientX - offsetX;
        let top = clientY - offsetY;
        
        // 限制在窗口范围内
        const maxX = window.innerWidth - toolbar.offsetWidth;
        const maxY = window.innerHeight - toolbar.offsetHeight;
        
        left = Math.max(0, Math.min(left, maxX));
        top = Math.max(0, Math.min(top, maxY));
        
        // 应用新位置
        toolbar.style.left = left + 'px';
        toolbar.style.top = top + 'px';
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