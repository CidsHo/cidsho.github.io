// 获取元素
const scrollArea = document.querySelector('.scroll-area');
const container = document.querySelector('.container');
const pageContainers = document.querySelectorAll('.page-container');
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
    } else if (target === 'max') {
        // 滚动到最末尾
        targetPosition = element.scrollWidth - element.clientWidth;
    } else if (Math.abs(target) > 1000) {
        // 当作绝对位置处理
        targetPosition = target;
    } else {
        // 当作相对滚动量处理
        targetPosition = startPosition + target;
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
        
        // 返回上一页
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // 如果没有历史记录，返回首页
            // 使用绝对路径指向根目录
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
    if (infoContainer) {
        infoContainer.classList.toggle('fullscreen');
    }
    
    // 检查是否进入了全屏模式
    const isFullscreen = container.classList.contains('fullscreen');
    
    // 根据全屏状态调整样式
    if (isFullscreen) {
        // 进入全屏
        document.body.style.overflow = 'hidden';
        container.style.margin = '0';
        container.style.height = '100vh';
        container.style.width = '100%';
        container.style.borderRadius = '0';
    } else {
        // 退出全屏
        document.body.style.overflow = '';
        container.style.margin = '10vh 20px';
        container.style.height = '80vh';
        container.style.width = '';
        container.style.borderRadius = '12px';
    }
    
    // 切换后更新
    setTimeout(() => {
        fixPageLayout();
        scrollArea.scrollLeft = currentScrollLeft;
    }, 300);
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

// 工具栏拖拽功能
let isDraggingToolbar = false;
let toolbarOffsetX = 0;
let toolbarOffsetY = 0;

// 工具栏初始化 - 通用版
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
    
    // 强制确保工具栏可见性
    toolbar.style.display = 'flex';
    toolbar.style.visibility = 'visible';
    toolbar.style.opacity = '1';
    toolbar.style.zIndex = '2000';  // 确保足够高的层级
    
    // 添加拖拽事件
    initToolbarDrag();
    
    // 调整工具栏位置适应当前设备
    adjustToolbarForDevice();
}

// 重置工具栏到默认位置
function resetToolbarPosition() {
    toolbar.style.left = 'auto';
    toolbar.style.top = 'auto';
    toolbar.style.right = '20px';
    toolbar.style.bottom = '20px';
}

// 调整工具栏适应各种设备 (替代原来的initMobileToolbar)
function adjustToolbarForDevice() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // 移动设备上重置到右下角
        resetToolbarPosition();
    } else {
        // 大屏幕设备上检查工具栏是否在可视区域内
        const toolbarRect = toolbar.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 如果工具栏不在视图内，重置位置
        if (toolbarRect.right > viewportWidth || toolbarRect.bottom > viewportHeight || 
            toolbarRect.left < 0 || toolbarRect.top < 0) {
            resetToolbarPosition();
        }
    }
}

// 确保工具栏始终可见
function ensureToolbarVisibility() {
    const computedStyle = window.getComputedStyle(toolbar);
    
    // 如果工具栏不可见，强制设置可见
    if (computedStyle.display === 'none' || 
        computedStyle.visibility === 'hidden' || 
        computedStyle.opacity === '0' ||
        parseFloat(computedStyle.opacity) < 0.1) {
        
        // 强制设置可见性
        toolbar.style.display = 'flex';
        toolbar.style.visibility = 'visible';
        toolbar.style.opacity = '1';
        toolbar.style.zIndex = '2000';
        
        // 确保工具栏在可视区域内
        adjustToolbarForDevice();
    }
}

// 初始化工具栏拖拽
function initToolbarDrag() {
    // 鼠标拖拽事件
    toolbar.addEventListener('mousedown', startToolbarDrag);
    document.addEventListener('mousemove', dragToolbar);
    document.addEventListener('mouseup', stopToolbarDrag);
    
    // 触摸拖拽事件
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

// 容器自适应函数
function applyContainerResponsiveness() {
    const designContentContainer = document.querySelector('.design-content-container');
    const pageContainers = document.querySelectorAll('.page-container');
    
    if (!designContentContainer || pageContainers.length === 0) return;
    
    // 获取当前容器高度
    const containerHeight = container.classList.contains('fullscreen') ? 
        window.innerHeight : container.clientHeight;
    
    pageContainers.forEach(pageContainer => {
        // 提取原始宽高（从style属性或dataset）
        let originalWidth, originalHeight;
        
        if (pageContainer.dataset.originalWidth && pageContainer.dataset.originalHeight) {
            originalWidth = parseInt(pageContainer.dataset.originalWidth);
            originalHeight = parseInt(pageContainer.dataset.originalHeight);
        } else {
            // 从style属性中提取
            const styleWidth = pageContainer.style.width.match(/(\d+)px/);
            const styleHeight = pageContainer.style.height.match(/(\d+)px/);
            
            originalWidth = styleWidth ? parseInt(styleWidth[1]) : 2400;
            originalHeight = styleHeight ? parseInt(styleHeight[1]) : 2400;
            
            // 存储原始尺寸
            pageContainer.dataset.originalWidth = originalWidth;
            pageContainer.dataset.originalHeight = originalHeight;
        }
        
        // 计算缩放比例（基于高度）
        const scaleRatio = containerHeight / originalHeight;
        
        // 应用CSS变量和transform
        pageContainer.style.setProperty('--original-width', `${originalWidth}px`);
        pageContainer.style.setProperty('--original-height', `${originalHeight}px`);
        pageContainer.style.setProperty('--scale-ratio', scaleRatio);
        
        // 设置缩放后的物理尺寸以正确计算布局空间
        const scaledWidth = originalWidth * scaleRatio;
        const scaledHeight = originalHeight * scaleRatio;
        
        // 更新容器尺寸（用于正确的滚动区域计算）
        designContentContainer.style.minWidth = `${scaledWidth}px`;
        designContentContainer.style.height = `${scaledHeight}px`;
    });
}

// 计算所有设计框架的位置和间距
function calculateDesignFramePositions() {
    // 每个设计框架的位置信息，用于定位兴趣点
    const framePositions = {};
    
    pageContainers.forEach(container => {
        const designId = container.getAttribute('data-design-id');
        const rect = container.getBoundingClientRect();
        
        framePositions[designId] = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
    });
    
    // 存储位置信息，供兴趣点使用
    window.framePositions = framePositions;
}

// 窗口大小改变时重新计算
window.addEventListener('resize', calculateDesignFramePositions);

// 页面加载时初始化设计内容布局
window.addEventListener('DOMContentLoaded', () => {
    initToolbar();
    // 使用新的自适应函数
    applyContainerResponsiveness();
    
    setTimeout(ensureToolbarVisibility, 500);
});

// 页面完全加载后再次检查工具栏可见性
window.addEventListener('load', () => {
    ensureToolbarVisibility();
    
    // 设置一个MutationObserver观察DOM变化
    const observer = new MutationObserver(() => {
        ensureToolbarVisibility();
    });
    
    // 观察body的子节点变化
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 3秒后再次检查，以防其他脚本覆盖我们的设置
    setTimeout(ensureToolbarVisibility, 3000);
});

// 窗口大小改变时调整工具栏
window.addEventListener('resize', () => {
    if (window.resizeTimer) clearTimeout(window.resizeTimer);
    
    window.resizeTimer = setTimeout(() => {
        // 使用新的自适应函数
        applyContainerResponsiveness();
        calculateDesignFramePositions();
        updateInterestPointPositions();
        adjustToolbarForDevice();
        ensureToolbarVisibility();
    }, 200);
});

// 更新兴趣点位置计算函数
function updateInterestPointPositions() {
    const interestPoints = document.querySelectorAll('.interest-point');
    
    interestPoints.forEach(point => {
        const originalX = parseFloat(point.getAttribute('data-original-x') || 0);
        const originalY = parseFloat(point.getAttribute('data-original-y') || 0);
        
        if (originalX && originalY) {
            // 找到所属的页面容器并应用相同的缩放比例
            let parentContainer;
            
            // 尝试获取兴趣点的父页面容器
            const containers = document.querySelectorAll('.page-container');
            for (const container of containers) {
                const scaleRatio = parseFloat(container.dataset.scaleRatio || 0);
                if (scaleRatio) {
                    // 简单的判断：检查点是否在这个容器的区域内
                    const rect = container.getBoundingClientRect();
                    const scaledX = originalX * scaleRatio;
                    
                    if (scaledX >= rect.left && scaledX <= rect.right) {
                        parentContainer = container;
                        break;
                    }
                }
            }
            
            if (parentContainer) {
                const scaleRatio = parseFloat(parentContainer.dataset.scaleRatio || 1);
                point.style.left = `${originalX * scaleRatio}px`;
                point.style.top = `${originalY * scaleRatio}px`;
            }
        }
    });
}

// 辅助函数：找到兴趣点所属的页面容器
function findParentPage(interestPoint) {
    // 首先尝试通过DOM层级关系查找
    let parent = interestPoint.closest('.page-container');
    
    if (parent) return parent;
    
    // 如果找不到，通过data-design-id属性匹配
    const designId = interestPoint.getAttribute('data-design-id');
    if (designId) {
        parent = document.querySelector(`.page-container[data-design-id="${designId}"]`);
    }
    
    return parent;
}

// 在滚动区域滚动时更新兴趣点位置
scrollArea.addEventListener('scroll', () => {
    // 延迟一点以提高性能
    if (!window.interestPointUpdateScheduled) {
        window.interestPointUpdateScheduled = true;
        requestAnimationFrame(() => {
            calculateDesignFramePositions();
            updateInterestPointPositions();
            window.interestPointUpdateScheduled = false;
        });
    }
    
    // 关闭任何打开的浮窗
    closeNotePopup();
});

// 重新绑定滚轮事件到scrollArea
function initScrollWheelSupport() {
    // 先移除可能存在的旧监听器
    scrollArea.removeEventListener('wheel', wheelHandler);
    
    // 添加新的滚轮事件处理
    scrollArea.addEventListener('wheel', wheelHandler, { passive: false });
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
});

// 添加调试功能
function debugLayout() {
  // 获取关键元素
  const designContainer = document.querySelector('.design-content-container');
  const firstPage = document.querySelector('.page-container:nth-child(1)');
  const secondPage = document.querySelector('.page-container:nth-child(2)');
  
  // 创建调试面板
  const debugPanel = document.createElement('div');
  debugPanel.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 9999; max-width: 300px; max-height: 200px; overflow: auto;';
  
  // 添加调试信息
  debugPanel.innerHTML = `
    <h4 style="margin: 0 0 5px 0;">布局调试</h4>
    <div>容器高度: ${container.offsetHeight}px</div>
    <div>设计容器宽度: ${designContainer.offsetWidth}px</div>
    <div>第一页变换: ${firstPage.style.transform}</div>
    <div>第一页位置: left=${firstPage.style.left}, top=${firstPage.style.top}</div>
    <div>第二页位置: left=${secondPage.style.left}, top=${secondPage.style.top}</div>
    <button id="force-layout" style="margin-top: 5px; padding: 3px;">强制应用布局</button>
  `;
  
  document.body.appendChild(debugPanel);
  
  // 添加强制应用布局按钮事件
  document.getElementById('force-layout').addEventListener('click', function() {
    fixPageLayout();
    debugPanel.innerHTML += '<div style="color: #aaffaa;">布局已重新应用</div>';
  });
  
  // 30秒后自动移除
  setTimeout(() => debugPanel.remove(), 30000);
}

// 添加键盘快捷键调出调试面板
document.addEventListener('keydown', function(e) {
  // 按下Ctrl+Shift+D调出调试面板
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    debugLayout();
  }
});

// 修改DOM结构，移除设计内容容器
function restructureDOM() {
  // 获取容器和设计内容容器
  const mainContainer = document.querySelector('.container');
  const designContainer = document.querySelector('.design-content-container');
  
  // 如果找不到元素或已经重构，则退出
  if (!mainContainer || !designContainer || mainContainer.dataset.restructured) {
    return;
  }
  
  console.log('重构DOM...');
  
  // 获取页面容器
  const pageContainers = Array.from(designContainer.querySelectorAll('.page-container'));
  
  if (pageContainers.length < 2) {
    console.error('找不到足够的页面容器');
    return;
  }
  
  // 保存页面容器，但从DOM中移除
  pageContainers.forEach(page => designContainer.removeChild(page));
  
  // 从容器中移除设计内容容器
  mainContainer.removeChild(designContainer);
  
  // 将页面容器直接添加到主容器
  pageContainers.forEach(page => mainContainer.appendChild(page));
  
  // 标记已重构
  mainContainer.dataset.restructured = 'true';
  
  console.log('DOM重构完成');
}

// 修复容器包含问题的最终方案
function fixPageLayout() {
  // 获取主容器和页面
  const mainContainer = document.querySelector('.container');
  const pageContainers = document.querySelectorAll('.container > .page-container');
  
  if (!mainContainer || pageContainers.length < 2) {
    console.error('找不到必要的元素');
    return;
  }
  
  // 清除可能存在的包装器
  const existingWrapper = mainContainer.querySelector('.pages-wrapper');
  if (existingWrapper) {
    mainContainer.removeChild(existingWrapper);
  }
  
  // 获取所有页面
  const firstPage = pageContainers[0];
  const secondPage = pageContainers[1];
  
  // 从DOM中移除页面
  if (firstPage.parentNode) {
    firstPage.parentNode.removeChild(firstPage);
  }
  if (secondPage.parentNode) {
    secondPage.parentNode.removeChild(secondPage);
  }
  
  // 获取容器的实际高度
  const containerHeight = mainContainer.offsetHeight;
  console.log('容器高度:', containerHeight);
  
  // 确保container有明确的样式
  mainContainer.style.position = 'relative';
  mainContainer.style.overflow = 'hidden';
  mainContainer.style.whiteSpace = 'normal'; // 防止flex布局问题
  
  // 从内联样式获取原始尺寸
  const firstPageOriginalWidth = extractDimension(firstPage, 'width', 3840);
  const firstPageOriginalHeight = extractDimension(firstPage, 'height', 2400);
  const secondPageOriginalWidth = extractDimension(secondPage, 'width', 7680);
  const secondPageOriginalHeight = extractDimension(secondPage, 'height', 2400);
  
  // 计算缩放比例
  const scale = containerHeight / firstPageOriginalHeight;
  
  // 创建flex包装器
  const wrapper = document.createElement('div');
  wrapper.className = 'pages-wrapper';
  wrapper.style.cssText = `
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  `;
  
  // 添加包装器到主容器
  mainContainer.appendChild(wrapper);
  
  // 为每个页面创建容器
  const firstPageContainer = document.createElement('div');
  firstPageContainer.className = 'page-container-wrapper first';
  firstPageContainer.style.cssText = `
    flex: 0 0 auto;
    width: ${firstPageOriginalWidth * scale}px;
    height: 100%;
    position: relative;
    overflow: hidden;
  `;
  
  const secondPageContainer = document.createElement('div');
  secondPageContainer.className = 'page-container-wrapper second';
  secondPageContainer.style.cssText = `
    flex: 0 0 auto;
    width: ${secondPageOriginalWidth * scale}px;
    height: 100%;
    position: relative;
    overflow: hidden;
  `;
  
  // 添加页面包装器到flex容器
  wrapper.appendChild(firstPageContainer);
  wrapper.appendChild(secondPageContainer);
  
  // 设置页面样式
  firstPage.style.position = 'absolute';
  firstPage.style.left = '0';
  firstPage.style.top = '0';
  firstPage.style.transformOrigin = 'top left';
  firstPage.style.transform = `scale(${scale})`;
  firstPageContainer.appendChild(firstPage);
  
  secondPage.style.position = 'absolute';
  secondPage.style.left = '0';
  secondPage.style.top = '0';
  secondPage.style.transformOrigin = 'top left';
  secondPage.style.transform = `scale(${scale})`;
  secondPageContainer.appendChild(secondPage);
  
  // 存储缩放比例
  firstPage.dataset.scaleRatio = scale;
  secondPage.dataset.scaleRatio = scale;
  
  // 计算容器总宽度
  const firstPageScaledWidth = Math.ceil(firstPageOriginalWidth * scale);
  const secondPageScaledWidth = Math.ceil(secondPageOriginalWidth * scale);
  const totalWidth = firstPageScaledWidth + secondPageScaledWidth;
  
  // 设置容器宽度
  mainContainer.style.width = `${totalWidth}px`;
  
  console.log('布局已应用:');
  console.log('- 缩放比例:', scale);
  console.log('- 第一页缩放后宽度:', firstPageScaledWidth);
  console.log('- 第二页缩放后宽度:', secondPageScaledWidth);
  console.log('- 总宽度:', totalWidth);
  
  // 更新兴趣点位置
  updateInterestPoints();
}

// 辅助函数：从元素样式中提取尺寸
function extractDimension(element, dimension, defaultValue) {
  const style = element.getAttribute('style');
  const match = style ? style.match(new RegExp(`${dimension}:\\s*(\\d+)px`)) : null;
  return match ? parseInt(match[1]) : defaultValue;
}

// 更新兴趣点位置函数
function updateInterestPoints() {
  const interestPoints = document.querySelectorAll('.interest-point');
  if (!interestPoints.length) return;
  
  // 获取第一个页面容器
  const firstPage = document.querySelector('.page-container');
  if (!firstPage) return;
  
  // 获取缩放比例
  const scaleRatio = parseFloat(firstPage.dataset.scaleRatio || 1);
  
  // 应用到所有兴趣点
  interestPoints.forEach(point => {
    const originalX = parseFloat(point.getAttribute('data-original-x') || 0);
    const originalY = parseFloat(point.getAttribute('data-original-y') || 0);
    
    if (originalX && originalY) {
      // 直接设置位置
      point.style.left = `${originalX * scaleRatio}px`;
      point.style.top = `${originalY * scaleRatio}px`;
    }
  });
}

// 替换原有函数
window.fixPageLayout = fixPageLayout;
window.applyContainerResponsiveness = fixPageLayout;
window.applyPageLayout = fixPageLayout;

// 全屏切换逻辑
toggleFullscreenBtn.addEventListener('click', () => {
  // 切换按钮激活状态
  toggleFullscreenBtn.classList.toggle('active');
  
  // 获取当前滚动位置以便切换后保持
  const currentScrollLeft = scrollArea.scrollLeft;
  
  // 切换容器的全屏类
  container.classList.toggle('fullscreen');
  
  // 同时为信息容器应用相同的类
  if (infoContainer) {
    infoContainer.classList.toggle('fullscreen');
  }
  
  // 检查是否进入了全屏模式
  const isFullscreen = container.classList.contains('fullscreen');
  
  // 根据全屏状态调整样式
  if (isFullscreen) {
    // 进入全屏
    document.body.style.overflow = 'hidden';
    container.style.margin = '0';
    container.style.height = '100vh';
    container.style.width = '100%';
    container.style.borderRadius = '0';
  } else {
    // 退出全屏
    document.body.style.overflow = '';
    container.style.margin = '10vh 20px';
    container.style.height = '80vh';
    container.style.width = '';
    container.style.borderRadius = '12px';
  }
  
  // 切换后更新
  setTimeout(() => {
    fixPageLayout();
    scrollArea.scrollLeft = currentScrollLeft;
  }, 300);
});

// 在DOM加载后执行
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(fixPageLayout, 100);
});

// 窗口大小变化时重新应用布局
window.addEventListener('resize', () => {
  if (window.resizeTimer) clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(fixPageLayout, 200);
});

// 添加必要的样式
const styleElem = document.createElement('style');
styleElem.textContent = `
  .container {
    overflow: hidden !important;
    position: relative !important;
  }
  
  .pages-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .page-container-wrapper {
    flex: 0 0 auto;
    position: relative;
    overflow: hidden;
    height: 100%;
  }
  
  .page-container {
    position: absolute !important;
    transform-origin: top left !important;
  }
`;
document.head.appendChild(styleElem);