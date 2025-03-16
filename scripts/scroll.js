// 获取元素
const scrollArea = document.querySelector('.scroll-area');
const container = document.querySelector('.container');
const multiImageContainer = document.querySelector('.multi-image-container');
const imageWrappers = document.querySelectorAll('.image-wrapper');
const longImages = document.querySelectorAll('.long-image');
const interestPoints = document.querySelectorAll('.interest-point');
const notePopup = document.querySelector('.note-popup');
const noteContent = document.querySelector('.note-content');
const closeBtn = document.querySelector('.close-btn');
const jumpToStartBtn = document.getElementById('jump-to-start');
const togglePointsBtn = document.getElementById('toggle-points');
const goBackBtn = document.getElementById('go-back');
const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
const infoContainer = document.querySelector('.info-container');
const toolbar = document.getElementById('toolbar');
const jumpToEndBtn = document.getElementById('jump-to-end');

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

// 修复的平滑滚动函数
function smoothScroll(element, target, duration = 600) {
    // 确定目标是相对位置还是绝对位置
    let targetPosition;
    const startPosition = element.scrollLeft;
    
    // 如果target是特定值(0或'max')，当作特殊指令处理
    if (target === 0) {
        // 滚动到最开始
        targetPosition = 0;
        console.log("滚动到最开始位置");
    } else if (target === 'max') {
        // 滚动到最末尾
        targetPosition = element.scrollWidth - element.clientWidth;
        console.log("滚动到最末尾位置:", targetPosition);
    } else if (Math.abs(target) > 1000) {
        // 当作绝对位置处理
        targetPosition = target;
        console.log("滚动到绝对位置:", targetPosition);
    } else {
        // 当作相对滚动量处理
        targetPosition = startPosition + target;
        console.log("相对滚动量:", target, "目标位置:", targetPosition);
    }
    
    // 确保位置在有效范围内
    const maxScroll = element.scrollWidth - element.clientWidth;
    targetPosition = Math.max(0, Math.min(targetPosition, maxScroll));
    
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // 使用缓动函数
        const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
        element.scrollLeft = startPosition + (distance * easeOutQuint(progress));
        
        if (timeElapsed < duration) {
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

// 重新实现跳转到开始功能
jumpToStartBtn.addEventListener('click', function() {
    // 明确传入0表示滚动到最左侧
    smoothScroll(scrollArea, 0, 800);
    
    // 关闭任何打开的浮窗
    if (typeof closeNotePopup === 'function') {
        closeNotePopup();
    }
    
    console.log("点击了跳转到开始按钮");
});

// 显示/隐藏兴趣点按钮
togglePointsBtn.addEventListener('click', () => {
    togglePointsBtn.classList.toggle('active');
    
    // 检查第一个兴趣点的可见性来决定所有点的状态
    const firstPoint = interestPoints[0];
    const shouldShow = firstPoint.style.display === 'none';
    
    // 分组显示/隐藏兴趣点
    interestPoints.forEach(point => {
        point.style.display = shouldShow ? 'block' : 'none';
    });
});

// 返回按钮 - 修复版
if (goBackBtn) {
    // 移除可能存在的旧事件监听器
    goBackBtn.replaceWith(goBackBtn.cloneNode(true));
    
    // 重新获取按钮引用
    const newGoBackBtn = document.getElementById('go-back');
    
    // 添加新的事件监听器
    newGoBackBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('滚动页面返回按钮被点击');
        
        // 返回上一页
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // 如果没有历史记录，返回首页
            window.location.href = '/portfolio.html';
        }
    });
}

// 全屏切换按钮
toggleFullscreenBtn.addEventListener('click', () => {
    // 切换按钮激活状态
    toggleFullscreenBtn.classList.toggle('active');
    
    // 获取当前滚动位置以便切换后保持
    const currentScrollLeft = scrollArea.scrollLeft;
    
    // 切换容器的全屏类
    container.classList.toggle('fullscreen');
    
    // 同时为信息容器应用相同的类
    infoContainer.classList.toggle('fullscreen');
    
    // 检查是否进入了全屏模式
    const isFullscreen = container.classList.contains('fullscreen');
    
    // 根据全屏状态调整样式
    if (isFullscreen) {
        // 进入全屏
        container.style.margin = '0';
        container.style.height = '100vh';
        container.style.borderRadius = '0';
        infoContainer.style.margin = '0';
        infoContainer.style.height = '100vh';
        infoContainer.style.borderRadius = '0';
        
        // 调整多图容器高度
        multiImageContainer.style.height = '100vh';
        
        // 更新所有图片包装器的高度
        imageWrappers.forEach(wrapper => {
            wrapper.style.height = '100vh';
        });
        
        // 调整长图的最大高度
        longImages.forEach(img => {
            img.style.maxHeight = '100vh';
        });
    } else {
        // 退出全屏
        container.style.margin = '10vh 20px';
        container.style.height = '80vh';
        container.style.borderRadius = '10px';
        infoContainer.style.margin = '10vh 20px 10vh 0';
        infoContainer.style.height = '80vh';
        infoContainer.style.borderRadius = '10px';
        
        // 恢复多图容器高度
        multiImageContainer.style.height = '80vh';
        
        // 更新所有图片包装器的高度
        imageWrappers.forEach(wrapper => {
            wrapper.style.height = '80vh';
        });
        
        // 恢复长图的最大高度
        longImages.forEach(img => {
            img.style.maxHeight = '80vh';
        });
    }
    
    // 添加延迟以确保全屏切换后的布局计算
    setTimeout(() => {
        // 恢复滚动位置
        scrollArea.scrollLeft = currentScrollLeft;
        
        // 重新计算图片位置和兴趣点位置
        calculateImagePositions();
        if (typeof updateInterestPointPositions === 'function') {
            updateInterestPointPositions();
        }
        
        console.log("全屏切换完成，布局已重新计算");
    }, 100);
});

// 兴趣点点击
interestPoints.forEach(point => {
    point.addEventListener('click', (e) => {
        const note = point.getAttribute('data-note');
        noteContent.textContent = note;
        
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
    
// 添加滚轮支持初始化
initScrollWheelSupport();


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
longImages.forEach(img => img.addEventListener('dragstart', (e) => e.preventDefault()));

// 工具栏拖拽功能 - 完全重写，确保可靠性
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
    
    console.log("工具栏已初始化");
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

// 更新多图初始化函数
function initMultiImageLayout() {
    // 获取当前容器高度
    const containerHeight = container.classList.contains('fullscreen') ? '100vh' : '80vh';
    
    // 设置多图容器高度
    multiImageContainer.style.height = containerHeight;
    
    // 设置所有图片包装器高度
    imageWrappers.forEach(wrapper => {
        wrapper.style.height = containerHeight;
        
        // 获取图片并监听加载完成事件
        const img = wrapper.querySelector('.long-image');
        if (img) {
            if (img.complete) {
                // 图片已加载，直接计算位置
                calculateImagePositions();
            } else {
                // 图片未加载，等待加载完成
                img.onload = () => {
                    calculateImagePositions();
                };
            }
        }
    });
    
    // 初始计算图片位置
    calculateImagePositions();
    console.log("多图布局初始化完成");
}

// 计算所有图片的位置和间距
function calculateImagePositions() {
    // 每个图片包装器的位置信息，用于定位兴趣点
    const wrapperPositions = {};
    
    imageWrappers.forEach(wrapper => {
        const imageId = wrapper.getAttribute('data-image-id');
        const rect = wrapper.getBoundingClientRect();
        
        wrapperPositions[imageId] = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
    });
    
    // 存储位置信息，供兴趣点使用
    window.wrapperPositions = wrapperPositions;
}

// 窗口大小改变时重新计算
window.addEventListener('resize', calculateImagePositions);

// 页面加载时初始化多图布局
window.addEventListener('DOMContentLoaded', () => {
    initMultiImageLayout();
    initToolbar();
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

// 更新兴趣点位置，确保它们正确对应各自的图片位置
function updateInterestPointPositions() {
    // 需要在图片加载完成后和窗口大小改变时调用
    if (!window.wrapperPositions) return;
    
    interestPoints.forEach(point => {
        const imageId = point.getAttribute('data-image-id');
        const wrapper = document.querySelector(`.image-wrapper[data-image-id="${imageId}"]`);
        
        if (wrapper) {
            // 获取兴趣点的相对位置（百分比）
            const leftPercent = parseFloat(point.style.left) || 50;
            const topPercent = parseFloat(point.style.top) || 50;
            
            // 计算绝对位置
            const wrapperRect = wrapper.getBoundingClientRect();
            const absoluteLeft = wrapperRect.left + (wrapperRect.width * leftPercent / 100);
            const absoluteTop = wrapperRect.top + (wrapperRect.height * topPercent / 100);
            
            // 如果需要，可以在这里进行位置调整
        }
    });
}

// 在滚动区域滚动时更新兴趣点位置
scrollArea.addEventListener('scroll', () => {
    // 延迟一点以提高性能
    if (!window.interestPointUpdateScheduled) {
        window.interestPointUpdateScheduled = true;
        requestAnimationFrame(() => {
            calculateImagePositions();
            updateInterestPointPositions();
            window.interestPointUpdateScheduled = false;
        });
    }
    
    // 关闭任何打开的浮窗
    closeNotePopup();
});

// 改进窗口大小变化事件处理
window.addEventListener('resize', () => {
    // 使用节流避免过多计算
    if (window.resizeTimer) clearTimeout(window.resizeTimer);
    
    window.resizeTimer = setTimeout(() => {
        calculateImagePositions();
        updateInterestPointPositions();
    }, 100);
});

// 修复滚轮功能

// 重新绑定滚轮事件到scrollArea
function initScrollWheelSupport() {
    // 先移除可能存在的旧监听器
    scrollArea.removeEventListener('wheel', wheelHandler);
    
    // 添加新的滚轮事件处理
    scrollArea.addEventListener('wheel', wheelHandler, { passive: false });
    
    console.log("滚轮支持已初始化");
}

// 滚轮事件处理函数
function wheelHandler(e) {
    // 如果在描述容器内滚动，不拦截其默认行为
    if (e.target.closest('.description-container')) {
        return;
    }
    
    // 阻止默认的垂直滚动
    e.preventDefault();
    
    // 计算滚动量
    const scrollAmount = e.deltaY;
    
    // 使用平滑滚动效果，这里使用相对滚动量
    smoothScroll(scrollArea, scrollAmount, 200);
    
    // 滚动时关闭浮窗
    if (typeof closeNotePopup === 'function') {
        closeNotePopup();
    }
}

// 平滑滚动函数
function smoothScrollBy(element, amount) {
    const startPosition = element.scrollLeft;
    const targetPosition = startPosition + amount;
    const duration = 200; // 较短的时间使滚动更响应
    let startTime = null;
    
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // 使用简单的缓动函数
        const easing = t => t * (2 - t);
        element.scrollLeft = startPosition + (amount * easing(progress));
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// 实现跳转到末尾功能
jumpToEndBtn.addEventListener('click', function() {
    // 使用'max'特殊值表示滚动到最右侧
    smoothScroll(scrollArea, 'max', 800);
    
    // 关闭任何打开的浮窗
    if (typeof closeNotePopup === 'function') {
        closeNotePopup();
    }
    
    console.log("点击了跳转到末尾按钮");
});