// 获取元素
const scrollArea = document.querySelector('.scroll-area');
const container = document.querySelector('.container');
const imageContainer = document.querySelector('.image-container');
const longImage = document.querySelector('.long-image');
const interestPoints = document.querySelectorAll('.interest-point');
const notePopup = document.querySelector('.note-popup');
const noteContent = document.querySelector('.note-content');
const closeBtn = document.querySelector('.close-btn');
const jumpToStartBtn = document.getElementById('jump-to-start');
const togglePointsBtn = document.getElementById('toggle-points');
const goBackBtn = document.getElementById('go-back');
const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
const infoContainer = document.querySelector('.info-container');

// 拖动状态跟踪
let isDragging = false;
let startX, scrollLeft;
let lastX, lastTimestamp, velocityX = 0;
let momentum = 0;
let isScrolling = false;

// 参数配置
const scrollSpeed = 1.5;  // 拖动速度系数
const friction = 0.95;    // 摩擦系数

// 禁用右键菜单
document.addEventListener('contextmenu', e => e.preventDefault());

// 禁用复制功能
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('cut', e => e.preventDefault());
document.addEventListener('paste', e => e.preventDefault());

// 拖动开始
scrollArea.addEventListener('mousedown', (e) => {
    // 防止在特定元素上触发拖拽
    if (e.target.closest('.info-panel, .toolbar, .close-btn')) {
        return;
    }
    
    // 关闭任何打开的浮窗
    closeNotePopup();
    
    isDragging = true;
    startX = e.pageX;
    scrollLeft = scrollArea.scrollLeft;
    scrollArea.style.cursor = 'grabbing';
    
    // 记录数据用于计算惯性
    lastX = e.pageX;
    lastTimestamp = Date.now();
    velocityX = 0;
    
    // 停止正在进行的惯性滚动
    isScrolling = false;
});

// 拖动过程
scrollArea.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX;
    const walk = (startX - x) * scrollSpeed;
    scrollArea.scrollLeft = scrollLeft + walk;
    
    // 关闭任何打开的浮窗
    closeNotePopup();
    
    // 计算速度用于惯性效果
    const now = Date.now();
    const dt = now - lastTimestamp;
    if (dt > 0) {
        velocityX = (x - lastX) / dt * -10; // 负值是因为滚动方向相反
    }
    
    lastX = x;
    lastTimestamp = now;
});

// 拖动结束
scrollArea.addEventListener('mouseup', () => {
    if (!isDragging) return;
    
    isDragging = false;
    scrollArea.style.cursor = 'grab';
    
    // 如果有足够的速度，启动惯性滚动
    if (Math.abs(velocityX) > 0.5) {
        momentum = velocityX;
        isScrolling = true;
        inertiaScroll();
    }
});

// 鼠标离开区域
scrollArea.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        scrollArea.style.cursor = 'grab';
        
        if (Math.abs(velocityX) > 0.5) {
            momentum = velocityX;
            isScrolling = true;
            inertiaScroll();
        }
    }
});

// 惯性滚动函数
function inertiaScroll() {
    if (!isScrolling) return;
    
    momentum *= friction; // 应用摩擦力
    
    // 速度太小时停止滚动
    if (Math.abs(momentum) < 0.5) {
        isScrolling = false;
        return;
    }
    
    scrollArea.scrollLeft += momentum;
    
    // 检查边界
    if (scrollArea.scrollLeft <= 0 || 
        scrollArea.scrollLeft >= scrollArea.scrollWidth - scrollArea.clientWidth) {
        isScrolling = false;
        return;
    }
    
    // 滚动时关闭浮窗
    closeNotePopup();
    
    requestAnimationFrame(inertiaScroll);
}

// 使用更现代的方法控制滚动
function initScrollHandling() {
    // 为滚动区域添加CSS样式控制触摸行为
    scrollArea.style.touchAction = 'pan-x'; // 只允许水平平移
    
    // 使用wheel事件控制水平滚动
    scrollArea.addEventListener('wheel', (e) => {
        if (e.target.closest('.description-container')) return;
        
        // 如果有shift键按下，默认就是水平滚动，不需干预
        if (!e.shiftKey) {
            e.preventDefault();
            scrollArea.scrollLeft += e.deltaY;
            closeNotePopup();
        }
    }, { passive: false });
}

// 平滑滚动函数
function smoothScroll(element, targetPosition, duration = 600) {
    const startPosition = element.scrollLeft;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // 缓动函数
        const easeOutQuad = progress => 1 - (1 - progress) * (1 - progress);
        element.scrollLeft = startPosition + distance * easeOutQuad(progress);
        
        if (elapsedTime < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// 关闭浮窗函数
function closeNotePopup() {
    if (notePopup.classList.contains('active')) {
        notePopup.classList.remove('active');
    }
}

// 点击document关闭浮窗
document.addEventListener('click', (e) => {
    // 如果点击的不是兴趣点且不是浮窗内的元素，关闭浮窗
    if (!e.target.closest('.interest-point') && !e.target.closest('.note-popup')) {
        closeNotePopup();
    }
});

// 跳转到开始按钮
jumpToStartBtn.addEventListener('click', () => {
    smoothScroll(scrollArea, 0);
    closeNotePopup();
});

// 显示/隐藏兴趣点按钮
togglePointsBtn.addEventListener('click', () => {
    togglePointsBtn.classList.toggle('active');
    interestPoints.forEach(point => {
        point.style.display = point.style.display === 'none' ? 'block' : 'none';
    });
});

// 返回按钮
goBackBtn.addEventListener('click', () => {
    window.history.back();
});

// 全屏切换按钮
toggleFullscreenBtn.addEventListener('click', () => {
    toggleFullscreenBtn.classList.toggle('active');
    
    // 切换container的全屏类
    container.classList.toggle('fullscreen');
    
    // 同时为infoContainer应用相同的类
    infoContainer.classList.toggle('fullscreen');
    
    // 全屏切换后确保滚动位置一致
    requestAnimationFrame(() => {
        // 这里不需要额外代码，因为滚动区域不变
    });
});

// 兴趣点点击
interestPoints.forEach(point => {
    point.addEventListener('click', (e) => {
        noteContent.textContent = point.getAttribute('data-note');
        
        // 计算弹出位置
        const pointRect = point.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        // 根据兴趣点位置决定弹出框位置
        if (pointRect.left > windowWidth / 2) {
            // 兴趣点在右侧，弹出框显示在左侧
            notePopup.style.left = (pointRect.left - 320) + 'px';
        } else {
            // 兴趣点在左侧，弹出框显示在右侧
            notePopup.style.left = (pointRect.right + 20) + 'px';
        }
        
        notePopup.style.top = pointRect.top + 'px';
        notePopup.style.transform = 'scale(0.9)';
        
        // 先确保浮窗不可见，然后显示它
        notePopup.style.display = 'block';
        
        // 强制浏览器重绘
        notePopup.offsetHeight;
        
        // 添加active类以触发动画
        notePopup.classList.add('active');
        
        e.stopPropagation();
    });
});

// 关闭弹窗
closeBtn.addEventListener('click', () => {
    closeNotePopup();
});

// 移动端触摸支持
scrollArea.addEventListener('touchstart', (e) => {
    if (e.target.closest('.info-panel, .toolbar, .close-btn')) {
        return;
    }
    
    closeNotePopup();
    
    isDragging = true;
    startX = e.touches[0].pageX;
    scrollLeft = scrollArea.scrollLeft;
    
    lastX = startX;
    lastTimestamp = Date.now();
    velocityX = 0;
    isScrolling = false;
}, { passive: true });

scrollArea.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const x = e.touches[0].pageX;
    const walk = (startX - x) * scrollSpeed;
    scrollArea.scrollLeft = scrollLeft + walk;
    
    closeNotePopup();
    
    const now = Date.now();
    const dt = now - lastTimestamp;
    if (dt > 0) {
        velocityX = (x - lastX) / dt * -10;
    }
    
    lastX = x;
    lastTimestamp = now;
    
    e.preventDefault();
}, { passive: false });

scrollArea.addEventListener('touchend', () => {
    if (!isDragging) return;
    
    isDragging = false;
    
    if (Math.abs(velocityX) > 0.5) {
        momentum = velocityX;
        isScrolling = true;
        inertiaScroll();
    }
});

// 禁用图片拖拽
longImage.addEventListener('dragstart', (e) => e.preventDefault());

// 工具栏拖拽功能 - 完全重写，确保可靠性
const toolbar = document.getElementById('toolbar');
let isDraggingToolbar = false;
let toolbarOffsetX = 0;
let toolbarOffsetY = 0;

// 工具栏初始化
function initToolbar() {
    // 从本地存储加载位置
    const savedPosition = localStorage.getItem('toolbarPosition');
    if (savedPosition) {
        try {
            const position = JSON.parse(savedPosition);
            toolbar.style.left = position.left;
            toolbar.style.top = position.top;
            toolbar.style.right = 'auto';
            toolbar.style.bottom = 'auto';
        } catch (e) {
            console.error('工具栏位置恢复失败', e);
            resetToolbarPosition();
        }
    }
    
    // 添加拖拽事件
    initToolbarDrag();
}

// 重置工具栏到默认位置
function resetToolbarPosition() {
    toolbar.style.left = 'auto';
    toolbar.style.top = 'auto';
    toolbar.style.right = '20px';
    toolbar.style.bottom = '20px';
}

// 初始化工具栏拖拽
function initToolbarDrag() {
    // 鼠标拖拽事件
    toolbar.addEventListener('mousedown', startToolbarDrag);
    document.addEventListener('mousemove', dragToolbar);
    document.addEventListener('mouseup', stopToolbarDrag);
    
    // 触摸拖拽事件 - 添加passive: false
    toolbar.addEventListener('touchstart', startToolbarDragTouch, { passive: false });
    document.addEventListener('touchmove', dragToolbarTouch, { passive: false });
    document.addEventListener('touchend', stopToolbarDrag);
}

// 开始拖拽 (鼠标)
function startToolbarDrag(e) {
    // 如果点击的是按钮，不启动拖拽
    if (e.target.closest('.toolbar-btn')) {
        return;
    }
    
    // 阻止默认行为和文本选择
    e.preventDefault();
    
    isDraggingToolbar = true;
    toolbar.classList.add('dragging');
    
    // 获取工具栏当前位置
    const rect = toolbar.getBoundingClientRect();
    
    // 如果工具栏使用right/bottom定位，转换为left/top
    if (getComputedStyle(toolbar).right !== 'auto') {
        toolbar.style.left = rect.left + 'px';
        toolbar.style.top = rect.top + 'px';
        toolbar.style.right = 'auto';
        toolbar.style.bottom = 'auto';
    }
    
    // 计算鼠标在工具栏内的偏移
    toolbarOffsetX = e.clientX - rect.left;
    toolbarOffsetY = e.clientY - rect.top;
    
    // 防止事件冒泡
    e.stopPropagation();
}

// 拖拽过程 (鼠标)
function dragToolbar(e) {
    if (!isDraggingToolbar) return;
    
    // 计算新位置
    const left = e.clientX - toolbarOffsetX;
    const top = e.clientY - toolbarOffsetY;
    
    // 确保工具栏不会被拖出屏幕
    const maxX = window.innerWidth - toolbar.offsetWidth;
    const maxY = window.innerHeight - toolbar.offsetHeight;
    
    toolbar.style.left = Math.max(0, Math.min(left, maxX)) + 'px';
    toolbar.style.top = Math.max(0, Math.min(top, maxY)) + 'px';
}

// 开始拖拽 (触摸)
function startToolbarDragTouch(e) {
    // 如果触摸的是按钮，不启动拖拽
    if (e.target.closest('.toolbar-btn')) {
        return;
    }
    
    // 获取第一个触摸点
    const touch = e.touches[0];
    
    isDraggingToolbar = true;
    toolbar.classList.add('dragging');
    
    // 获取工具栏当前位置
    const rect = toolbar.getBoundingClientRect();
    
    // 如果工具栏使用right/bottom定位，转换为left/top
    if (getComputedStyle(toolbar).right !== 'auto') {
        toolbar.style.left = rect.left + 'px';
        toolbar.style.top = rect.top + 'px';
        toolbar.style.right = 'auto';
        toolbar.style.bottom = 'auto';
    }
    
    // 计算触摸点在工具栏内的偏移
    toolbarOffsetX = touch.clientX - rect.left;
    toolbarOffsetY = touch.clientY - rect.top;
    
    // 阻止默认行为（例如滚动）
    e.preventDefault();
}

// 拖拽过程 (触摸)
function dragToolbarTouch(e) {
    if (!isDraggingToolbar) return;
    
    // 获取第一个触摸点
    const touch = e.touches[0];
    
    // 计算新位置
    const left = touch.clientX - toolbarOffsetX;
    const top = touch.clientY - toolbarOffsetY;
    
    // 确保工具栏不会被拖出屏幕
    const maxX = window.innerWidth - toolbar.offsetWidth;
    const maxY = window.innerHeight - toolbar.offsetHeight;
    
    toolbar.style.left = Math.max(0, Math.min(left, maxX)) + 'px';
    toolbar.style.top = Math.max(0, Math.min(top, maxY)) + 'px';
    
    // 阻止默认行为
    e.preventDefault();
}

// 停止拖拽 (通用)
function stopToolbarDrag() {
    if (!isDraggingToolbar) return;
    
    isDraggingToolbar = false;
    toolbar.classList.remove('dragging');
    
    // 保存工具栏位置
    saveToolbarPosition();
}

// 保存工具栏位置
function saveToolbarPosition() {
    const position = {
        left: toolbar.style.left,
        top: toolbar.style.top
    };
    
    localStorage.setItem('toolbarPosition', JSON.stringify(position));
}

// 强制横屏检测和屏幕方向处理
function checkOrientation() {
    // 处理屏幕方向变化
    if (window.innerHeight > window.innerWidth) {
        // 竖屏模式
        document.querySelector('.orientation-message').style.display = 'flex';
        document.querySelector('.scroll-area').style.visibility = 'hidden';
    } else {
        // 横屏模式
        document.querySelector('.orientation-message').style.display = 'none';
        document.querySelector('.scroll-area').style.visibility = 'visible';
    }
}

// 监听屏幕方向变化
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    initToolbar();
    initScrollHandling();
    checkOrientation();
});

// 移动端工具栏初始化
function initMobileToolbar() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 重置工具栏位置，确保在移动设备上可见
        toolbar.style.position = 'fixed';
        toolbar.style.bottom = '20px';
        toolbar.style.right = '20px';
        toolbar.style.left = 'auto';
        toolbar.style.top = 'auto';
        
        // 调整工具栏尺寸适应移动设备
        adjustToolbarForMobile();
    }
}

// 调整工具栏大小适应移动设备
function adjustToolbarForMobile() {
    // 添加移动端特有的类
    toolbar.classList.add('mobile-toolbar');
    
    // 确保工具栏位于可见区域内
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 如果保存的位置使工具栏超出屏幕，重置位置
    const toolbarRect = toolbar.getBoundingClientRect();
    if (toolbarRect.right > viewportWidth || toolbarRect.bottom > viewportHeight) {
        toolbar.style.left = 'auto';
        toolbar.style.top = 'auto';
        toolbar.style.right = '20px';
        toolbar.style.bottom = '20px';
    }
}

// 移动端专用调试代码，确保工具栏可见
function ensureToolbarVisibility() {
    // 强制工具栏可见
    toolbar.style.display = 'flex';
    toolbar.style.visibility = 'visible';
    toolbar.style.opacity = '1';
    toolbar.style.zIndex = '9999';
    
    // 重置位置到右下角
    if (window.innerWidth < 768) { // 移动设备
        resetToolbarPosition();
    }
    
    console.log('工具栏可见性检查完成');
}

// 页面完全加载后执行
window.addEventListener('load', () => {
    // 延迟执行，确保其他脚本不会覆盖我们的设置
    setTimeout(ensureToolbarVisibility, 500);
});

// 如果5秒后工具栏仍不可见，强制重置
setTimeout(() => {
    const computedStyle = window.getComputedStyle(toolbar);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
        console.log('工具栏不可见，强制重置');
        ensureToolbarVisibility();
    }
}, 5000);