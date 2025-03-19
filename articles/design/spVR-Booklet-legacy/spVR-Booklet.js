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

// 修复返回按钮功能
function fixBackButton() {
  const goBackBtn = document.getElementById('go-back');
  if (!goBackBtn) {
    console.warn('无法找到返回按钮');
    return;
  }
  
  // 移除可能存在的旧事件监听器
  const newGoBackBtn = goBackBtn.cloneNode(true);
  goBackBtn.parentNode.replaceChild(newGoBackBtn, goBackBtn);
  
  // 添加新的事件处理
  newGoBackBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 直接返回到根目录的portfolio.html
    window.location.href = '/portfolio.html';
    
    console.log('返回到portfolio.html');
  });
  
  console.log('返回按钮功能已修复');
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
    
    // 修复返回按钮
    setTimeout(fixBackButton, 100);
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

// 完全重写的自适应布局解决方案
function fixPageLayout() {
  console.log('开始修复页面布局...');
  
  // 1. 获取关键元素
  const mainContainer = document.querySelector('.container');
  const scrollArea = document.querySelector('.scroll-area');
  const pageContainers = document.querySelectorAll('.page-container');
  
  if (!mainContainer) {
    console.error('无法找到主容器');
    return;
  }
  
  if (pageContainers.length < 2) {
    console.error('找不到足够的页面容器，当前数量:', pageContainers.length);
    return;
  }
  
  // 2. 保存当前滚动位置
  const scrollLeft = scrollArea ? scrollArea.scrollLeft : 0;
  const scrollRatio = scrollArea && scrollArea.scrollWidth > 0 ? 
                     scrollLeft / scrollArea.scrollWidth : 0;
  
  // 3. 移除之前的包装器
  const oldWrapper = document.querySelector('.pages-wrapper');
  if (oldWrapper) {
    // 获取页面元素并从包装器中移除
    Array.from(oldWrapper.querySelectorAll('.page-container')).forEach(page => {
      oldWrapper.removeChild(page);
    });
    mainContainer.removeChild(oldWrapper);
  }
  
  // 4. 容器样式设置
  // 强制设置样式确保容器行为一致
  mainContainer.style.cssText += `
    position: relative !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    box-sizing: border-box !important;
  `;
  
  // 5. 创建新的flex包装器
  const wrapper = document.createElement('div');
  wrapper.className = 'pages-wrapper';
  wrapper.style.cssText = `
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
    overflow: hidden !important;
  `;
  
  // 6. 将包装器添加到容器
  mainContainer.appendChild(wrapper);
  
  // 7. 处理每个页面
  const containerHeight = mainContainer.offsetHeight;
  let totalScaledWidth = 0;
  
  console.log('容器高度:', containerHeight);
  
  // 收集所有页面并排列
  for (let i = 0; i < pageContainers.length; i++) {
    const page = pageContainers[i];
    
    // 分离页面元素
    if (page.parentNode) {
      page.parentNode.removeChild(page);
    }
    
    // 获取原始尺寸
    let originalWidth = parseInt(page.dataset.originalWidth) || 0;
    let originalHeight = parseInt(page.dataset.originalHeight) || 0;
    
    // 如果没有存储的原始尺寸，从样式中提取
    if (!originalWidth || !originalHeight) {
      originalWidth = extractDimension(page, 'width', i === 0 ? 3840 : 7680);
      originalHeight = extractDimension(page, 'height', 2400);
      
      // 存储原始尺寸用于未来计算
      page.dataset.originalWidth = originalWidth;
      page.dataset.originalHeight = originalHeight;
    }
    
    // 计算缩放比例
    const scale = containerHeight / originalHeight;
    
    // 创建页面容器包装
    const pageWrapper = document.createElement('div');
    pageWrapper.className = `page-container-wrapper page-${i+1}`;
    
    // 计算缩放后的宽度
    const scaledWidth = Math.ceil(originalWidth * scale);
    totalScaledWidth += scaledWidth;
    
    // 设置包装器样式
    pageWrapper.style.cssText = `
      flex: 0 0 auto !important;
      width: ${scaledWidth}px !important;
      height: 100% !important;
      position: relative !important;
      overflow: hidden !important;
    `;
    
    // 设置页面样式
    page.style.cssText += `
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      transform-origin: top left !important;
      transform: scale(${scale}) !important;
      width: ${originalWidth}px !important;
      height: ${originalHeight}px !important;
    `;
    
    // 存储缩放比例
    page.dataset.scaleRatio = scale;
    
    // 添加页面到包装器
    pageWrapper.appendChild(page);
    
    // 添加页面包装器到主包装器
    wrapper.appendChild(pageWrapper);
    
    console.log(`页面 ${i+1} 缩放: ${scale.toFixed(4)}, 原始尺寸: ${originalWidth}x${originalHeight}, 缩放后宽度: ${scaledWidth}`);
  }
  
  // 8. 设置主容器的总宽度
  // 如果不是全屏模式，明确设置宽度
  if (!mainContainer.classList.contains('fullscreen')) {
    mainContainer.style.width = `${totalScaledWidth}px`;
  }
  
  console.log('总缩放宽度:', totalScaledWidth);
  
  // 9. 更新兴趣点位置
  setTimeout(() => {
    updateInterestPoints();
  }, 10);
  
  // 10. 恢复滚动位置
  if (scrollArea && scrollArea.scrollWidth > 0) {
    setTimeout(() => {
      // 使用比例计算新的滚动位置
      const newScrollPosition = scrollRatio * scrollArea.scrollWidth;
      scrollArea.scrollLeft = newScrollPosition;
      console.log('恢复滚动位置:', newScrollPosition);
    }, 50);
  }
}

// 改进的提取元素尺寸函数
function extractDimension(element, dimension, defaultValue) {
  // 首先检查内联样式
  const inlineStyle = element.style[dimension];
  if (inlineStyle && inlineStyle.includes('px')) {
    const value = parseFloat(inlineStyle);
    if (!isNaN(value)) return value;
  }
  
  // 其次检查style属性
  const style = element.getAttribute('style');
  if (style) {
    const match = style.match(new RegExp(`${dimension}:\\s*(\\d+)px`));
    if (match) return parseInt(match[1]);
  }
  
  // 最后检查计算样式
  const computedStyle = window.getComputedStyle(element);
  const computed = computedStyle[dimension];
  if (computed && computed.includes('px')) {
    const value = parseFloat(computed);
    if (!isNaN(value)) return value;
  }
  
  // 如果都找不到，返回默认值
  console.warn(`无法确定元素的${dimension}，使用默认值:`, defaultValue);
  return defaultValue;
}

// 更新兴趣点位置
function updateInterestPoints() {
  const interestPoints = document.querySelectorAll('.interest-point');
  if (interestPoints.length === 0) return;
  
  console.log(`更新${interestPoints.length}个兴趣点位置`);
  
  // 获取所有页面容器的缩放比例
  const pageScales = {};
  const pagePositions = {};
  
  document.querySelectorAll('.page-container').forEach((page, index) => {
    const scale = parseFloat(page.dataset.scaleRatio || 1);
    pageScales[index] = scale;
    
    // 获取页面在页面内的位置
    const rect = page.getBoundingClientRect();
    pagePositions[index] = {
      left: rect.left,
      top: rect.top
    };
  });
  
  // 更新每个兴趣点的位置
  interestPoints.forEach(point => {
    // 获取原始坐标
    const originalX = parseFloat(point.getAttribute('data-original-x') || 0);
    const originalY = parseFloat(point.getAttribute('data-original-y') || 0);
    
    // 如果没有原始数据，先存储当前位置作为原始位置
    if (!originalX && !originalY) {
      const left = parseFloat(point.style.left) || 0;
      const top = parseFloat(point.style.top) || 0;
      
      point.setAttribute('data-original-x', left);
      point.setAttribute('data-original-y', top);
      
      console.log(`设置兴趣点原始位置: (${left}, ${top})`);
    }
    
    // 确定这个点属于哪个页面 (简化版 - 使用页面索引)
    // 这里可以根据项目具体情况改进判断逻辑
    const pageIndex = parseInt(point.getAttribute('data-page-index') || 0);
    const scale = pageScales[pageIndex] || 1;
    
    if (scale !== 1) {
      // 应用缩放
      point.style.left = `${originalX * scale}px`;
      point.style.top = `${originalY * scale}px`;
      
      console.log(`调整兴趣点: 原始(${originalX}, ${originalY}) -> 缩放后(${originalX * scale}, ${originalY * scale})`);
    }
  });
}

// 使用ResizeObserver监听容器大小变化
function setupResizeObserver() {
  if (typeof ResizeObserver !== 'undefined') {
    console.log('设置ResizeObserver监听容器大小变化');
    
    const container = document.querySelector('.container');
    if (!container) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      console.log('检测到容器大小变化');
      fixPageLayout();
    });
    
    resizeObserver.observe(container);
  } else {
    console.warn('浏览器不支持ResizeObserver，回退到window resize事件');
  }
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 窗口大小变化时重新布局 - 使用防抖避免频繁触发
const debouncedFixLayout = debounce(fixPageLayout, 100);
window.addEventListener('resize', debouncedFixLayout);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 添加必要的CSS样式
  addLayoutStyles();
  
  // 首次应用布局
  setTimeout(fixPageLayout, 10);
  
  // 设置ResizeObserver
  setTimeout(setupResizeObserver, 100);
});

// 页面加载完成后再次尝试应用布局
window.addEventListener('load', () => {
  fixPageLayout();
});

// 添加必要的CSS样式
function addLayoutStyles() {
  // 检查是否已添加样式
  if (document.getElementById('layout-fix-styles')) return;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'layout-fix-styles';
  styleEl.textContent = `
    .container {
      position: relative !important;
      overflow: hidden !important;
    }
    
    .pages-wrapper {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      width: 100% !important;
      height: 100% !important;
      position: relative !important;
      overflow: hidden !important;
    }
    
    .page-container-wrapper {
      flex: 0 0 auto !important;
      position: relative !important;
      overflow: hidden !important;
      height: 100% !important;
    }
    
    .page-container {
      position: absolute !important;
      transform-origin: top left !important;
    }
    
    .scroll-area {
      overflow-x: auto !important;
      overflow-y: hidden !important;
      width: 100% !important;
      height: 100vh !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
    }
  `;
  
  document.head.appendChild(styleEl);
  console.log('添加布局修复CSS样式');
}

// 全屏切换事件处理
toggleFullscreenBtn.addEventListener('click', () => {
  // 切换按钮激活状态
  toggleFullscreenBtn.classList.toggle('active');
  
  // 将当前滚动位置保存为百分比
  const scrollArea = document.querySelector('.scroll-area');
  let scrollRatio = 0;
  if (scrollArea && scrollArea.scrollWidth > scrollArea.clientWidth) {
    scrollRatio = scrollArea.scrollLeft / (scrollArea.scrollWidth - scrollArea.clientWidth);
  }
  
  // 切换容器的全屏类
  container.classList.toggle('fullscreen');
  
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
  
  // 切换后更新布局
  setTimeout(() => {
    fixPageLayout();
    
    // 恢复滚动位置
    if (scrollArea && scrollArea.scrollWidth > scrollArea.clientWidth) {
      const newScrollPosition = scrollRatio * (scrollArea.scrollWidth - scrollArea.clientWidth);
      scrollArea.scrollLeft = newScrollPosition;
    }
  }, 50);
});

// 设置实时响应的ResizeObserver
function setupRealTimeResizeObserver() {
  if (typeof ResizeObserver !== 'undefined') {
    console.log('设置实时响应ResizeObserver');
    
    const container = document.querySelector('.container');
    const scrollArea = document.querySelector('.scroll-area');
    if (!container) return;
    
    // 创建新的ResizeObserver实例
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === container) {
          // 获取当前滚动比例以便后续恢复
          let scrollRatio = 0;
          if (scrollArea && scrollArea.scrollWidth > scrollArea.clientWidth) {
            scrollRatio = scrollArea.scrollLeft / (scrollArea.scrollWidth - scrollArea.clientWidth);
          }
          
          // 立即应用新布局
          requestAnimationFrame(() => {
            applyRealTimeLayout(scrollRatio);
          });
          break;
        }
      }
    });
    
    // 开始观察容器
    resizeObserver.observe(container);
    console.log('实时布局观察器已启动');
    
    // 保存observer引用以便可能的清理
    window._layoutResizeObserver = resizeObserver;
  } else {
    console.warn('浏览器不支持ResizeObserver，回退到实时window resize事件');
    
    // 使用resize事件作为备选
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => {
        const scrollArea = document.querySelector('.scroll-area');
        let scrollRatio = 0;
        if (scrollArea && scrollArea.scrollWidth > scrollArea.clientWidth) {
          scrollRatio = scrollArea.scrollLeft / (scrollArea.scrollWidth - scrollArea.clientWidth);
        }
        applyRealTimeLayout(scrollRatio);
      });
    });
  }
}

// 优化的实时布局应用函数
function applyRealTimeLayout(scrollRatio = 0) {
  // 1. 获取关键元素
  const mainContainer = document.querySelector('.container');
  const scrollArea = document.querySelector('.scroll-area');
  const pageContainers = document.querySelectorAll('.page-container');
  
  if (!mainContainer || pageContainers.length < 2) {
    return; // 静默退出以避免控制台错误
  }
  
  // 2. 获取容器尺寸
  const containerHeight = mainContainer.offsetHeight;
  const isFullscreen = mainContainer.classList.contains('fullscreen');
  
  // 3. 确保wrapper存在
  let wrapper = mainContainer.querySelector('.pages-wrapper');
  if (!wrapper) {
    // 创建新wrapper并移动页面
    wrapper = document.createElement('div');
    wrapper.className = 'pages-wrapper';
    wrapper.style.cssText = `
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      width: 100% !important;
      height: 100% !important;
      position: relative !important;
      overflow: hidden !important;
    `;
    
    // 从DOM中移除页面并保存
    const pagesToMove = [];
    pageContainers.forEach(page => {
      if (page.parentNode) {
        page.parentNode.removeChild(page);
      }
      pagesToMove.push(page);
    });
    
    // 添加wrapper到容器
    mainContainer.appendChild(wrapper);
    
    // 为每个页面创建wrapper
    pagesToMove.forEach((page, index) => {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = `page-container-wrapper page-${index+1}`;
      wrapper.appendChild(pageWrapper);
      pageWrapper.appendChild(page);
    });
  }
  
  // 4. 实时调整每个页面和其wrapper
  let totalScaledWidth = 0;
  const pageWrappers = wrapper.querySelectorAll('.page-container-wrapper');
  
  pageWrappers.forEach((pageWrapper, index) => {
    const page = pageWrapper.querySelector('.page-container');
    if (!page) return;
    
    // 获取或设置原始尺寸
    let originalWidth = parseInt(page.dataset.originalWidth) || 0;
    let originalHeight = parseInt(page.dataset.originalHeight) || 0;
    
    if (!originalWidth || !originalHeight) {
      originalWidth = extractDimension(page, 'width', index === 0 ? 3840 : 7680);
      originalHeight = extractDimension(page, 'height', 2400);
      page.dataset.originalWidth = originalWidth;
      page.dataset.originalHeight = originalHeight;
    }
    
    // 计算新的缩放比例
    const scale = containerHeight / originalHeight;
    const scaledWidth = Math.ceil(originalWidth * scale);
    totalScaledWidth += scaledWidth;
    
    // 更新页面wrapper尺寸
    pageWrapper.style.width = `${scaledWidth}px`;
    
    // 更新页面缩放
    page.style.transformOrigin = 'top left';
    page.style.transform = `scale(${scale})`;
    page.dataset.scaleRatio = scale;
  });
  
  // 5. 更新容器总宽度 (非全屏模式)
  if (!isFullscreen) {
    mainContainer.style.width = `${totalScaledWidth}px`;
  }
  
  // 6. 实时更新兴趣点位置
  updateInterestPointsRealTime();
  
  // 7. 恢复滚动位置
  if (scrollArea && scrollArea.scrollWidth > scrollArea.clientWidth && scrollRatio > 0) {
    const newScrollPosition = scrollRatio * (scrollArea.scrollWidth - scrollArea.clientWidth);
    scrollArea.scrollLeft = newScrollPosition;
  }
}

// 实时更新兴趣点位置 - 优化版
function updateInterestPointsRealTime() {
  const interestPoints = document.querySelectorAll('.interest-point');
  if (interestPoints.length === 0) return;
  
  // 获取页面和缩放比例
  const pages = document.querySelectorAll('.page-container');
  if (pages.length === 0) return;
  
  // 对每个兴趣点应用缩放
  interestPoints.forEach(point => {
    // 获取原始坐标
    const originalX = parseFloat(point.getAttribute('data-original-x') || 0);
    const originalY = parseFloat(point.getAttribute('data-original-y') || 0);
    
    // 如果没有原始数据，保存当前位置
    if (!originalX && !originalY) {
      const left = parseFloat(point.style.left) || 0;
      const top = parseFloat(point.style.top) || 0;
      point.setAttribute('data-original-x', left);
      point.setAttribute('data-original-y', top);
      return;
    }
    
    // 确定点属于哪个页面 (可根据项目具体逻辑调整)
    const pageIndex = parseInt(point.getAttribute('data-page-index') || 0);
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const page = pages[pageIndex];
      const scale = parseFloat(page.dataset.scaleRatio || 1);
      
      // 应用缩放
      point.style.left = `${originalX * scale}px`;
      point.style.top = `${originalY * scale}px`;
    }
  });
}

// 添加必要的CSS样式 - 实时版本使用更高优先级
function addRealTimeLayoutStyles() {
  // 检查是否已添加样式
  if (document.getElementById('realtime-layout-styles')) return;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'realtime-layout-styles';
  styleEl.textContent = `
    /* 高优先级的容器样式 */
    .container {
      position: relative !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      transform: translateZ(0) !important; /* 触发硬件加速 */
    }
    
    /* 实时flex包装器 */
    .pages-wrapper {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      width: 100% !important;
      height: 100% !important;
      position: relative !important;
      overflow: hidden !important;
      will-change: contents !important; /* 提升性能 */
    }
    
    /* 页面包装器 */
    .page-container-wrapper {
      flex: 0 0 auto !important;
      position: relative !important;
      overflow: hidden !important;
      height: 100% !important;
      will-change: width !important;
      transition: width 0.05s linear !important; /* 平滑过渡 */
    }
    
    /* 页面元素 */
    .page-container {
      position: absolute !important;
      transform-origin: top left !important;
      will-change: transform !important; /* 提升缩放性能 */
      transition: transform 0.05s linear !important; /* 平滑缩放 */
    }
    
    /* 确保滚动区域可见且正确工作 */
    .scroll-area {
      overflow-x: auto !important;
      overflow-y: hidden !important;
      width: 100% !important;
      height: 100vh !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      will-change: scroll-position !important;
      -webkit-overflow-scrolling: touch !important; /* iOS平滑滚动 */
    }
  `;
  
  document.head.appendChild(styleEl);
}

// 初始化实时布局系统
function initRealTimeLayout() {
  // 添加优化的CSS样式
  addRealTimeLayoutStyles();
  
  // 首次应用布局
  const scrollArea = document.querySelector('.scroll-area');
  let scrollRatio = 0;
  if (scrollArea && scrollArea.scrollWidth > scrollArea.clientWidth) {
    scrollRatio = scrollArea.scrollLeft / (scrollArea.scrollWidth - scrollArea.clientWidth);
  }
  
 // 立即应用一次布局
  applyRealTimeLayout(scrollRatio);
  
  // 设置实时响应观察器
  setupRealTimeResizeObserver();
  
  console.log('实时布局系统已初始化');
}

// 全屏切换优化版 - 支持实时布局
toggleFullscreenBtn.addEventListener('click', () => {
  // 切换按钮激活状态
  toggleFullscreenBtn.classList.toggle('active');
  
  // 保存当前滚动比例
  const scrollArea = document.querySelector('.scroll-area');
  let scrollRatio = 0;
  if (scrollArea && scrollArea.scrollWidth > scrollArea.clientWidth) {
    scrollRatio = scrollArea.scrollLeft / (scrollArea.scrollWidth - scrollArea.clientWidth);
  }
  
  // 切换容器的全屏类
  container.classList.toggle('fullscreen');
  
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
  
  // 立即应用新布局
  requestAnimationFrame(() => {
    applyRealTimeLayout(scrollRatio);
  });
});

// 替换原有初始化代码
document.addEventListener('DOMContentLoaded', () => {
  // 使用实时布局系统替代原有系统
  setTimeout(initRealTimeLayout, 10);
});

// 页面加载完成后确保布局正确
window.addEventListener('load', () => {
  // 再次应用实时布局
  setTimeout(() => {
    applyRealTimeLayout();
  }, 100);
});

// 阻止所有图片的拖拽行为
function preventImageDragging() {
  // 获取容器内所有图片
  const allImages = document.querySelectorAll('.container img');
  
  // 对每个图片应用防拖拽设置
  allImages.forEach(img => {
    // 1. 添加样式防止拖拽
    img.style.pointerEvents = 'none';
    img.style.userSelect = 'none';
    img.style.webkitUserSelect = 'none';
    img.style.userDrag = 'none';
    img.style.webkitUserDrag = 'none';
    
    // 2. 添加draggable属性
    img.setAttribute('draggable', 'false');
    
    // 3. 添加事件监听器阻止默认行为
    img.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
    
    // 4. 阻止鼠标按下行为
    img.addEventListener('mousedown', (e) => {
      e.preventDefault();
      return false;
    });
  });
  
  console.log(`已阻止${allImages.length}个图片的拖拽行为`);
  
  // 为容器添加CSS规则以阻止所有子元素的选择和拖拽
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .container * {
      user-select: none !important;
      -webkit-user-drag: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
    
    .container img {
      pointer-events: none !important;
    }
    
    /* 确保滚动区域的拖拽行为不受影响 */
    .scroll-area {
      cursor: grab !important;
    }
    
    .scroll-area:active {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(styleEl);
}

// 使用MutationObserver监视DOM变化，为新添加的图片应用防拖拽设置
function setupImageDragPreventionObserver() {
  // 创建一个MutationObserver实例
  const observer = new MutationObserver((mutations) => {
    let newImagesFound = false;
    
    // 检查每个变化
    mutations.forEach(mutation => {
      // 如果有节点添加
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 遍历添加的节点
        mutation.addedNodes.forEach(node => {
          // 如果是图片元素
          if (node.nodeName === 'IMG') {
            // 应用防拖拽设置
            node.style.pointerEvents = 'none';
            node.style.userSelect = 'none';
            node.setAttribute('draggable', 'false');
            newImagesFound = true;
            
            // 添加事件监听器
            node.addEventListener('dragstart', (e) => {
              e.preventDefault();
              return false;
            });
            
            node.addEventListener('mousedown', (e) => {
              e.preventDefault();
              return false;
            });
          }
          // 如果是包含其他节点的元素，检查其中的图片
          else if (node.querySelectorAll) {
            const nestedImages = node.querySelectorAll('img');
            if (nestedImages.length > 0) {
              nestedImages.forEach(img => {
                img.style.pointerEvents = 'none';
                img.style.userSelect = 'none';
                img.setAttribute('draggable', 'false');
                newImagesFound = true;
                
                img.addEventListener('dragstart', (e) => {
                  e.preventDefault();
                  return false;
                });
                
                img.addEventListener('mousedown', (e) => {
                  e.preventDefault();
                  return false;
                });
              });
            }
          }
        });
      }
    });
    
    if (newImagesFound) {
      console.log('为新添加的图片应用了防拖拽设置');
    }
  });
  
  // 开始观察整个容器的变化
  const container = document.querySelector('.container');
  if (container) {
    observer.observe(container, {
      childList: true,  // 观察子节点添加/删除
      subtree: true     // 观察所有后代节点
    });
    console.log('已启动图片防拖拽观察器');
  }
}

// 在文档加载完成后应用防拖拽措施
document.addEventListener('DOMContentLoaded', () => {
  // 其他初始化代码...
  
  // 应用防拖拽措施
  setTimeout(preventImageDragging, 100);
  
  // 设置观察器处理动态添加的图片
  setTimeout(setupImageDragPreventionObserver, 200);
});

// 如果有任何布局重建的函数，在它们之后再次运行防拖拽措施
const originalFixPageLayout = window.fixPageLayout || function(){};
window.fixPageLayout = function() {
  originalFixPageLayout.apply(this, arguments);
  
  // 布局更新后重新应用防拖拽设置
  setTimeout(preventImageDragging, 50);
};