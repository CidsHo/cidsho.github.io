// 初始化浮动工具栏
function initFloatingToolbar() {
    console.log('初始化工具栏...');
    const toolbar = document.getElementById('floatingToolbar');
    if (!toolbar) {
        console.error('未找到floatingToolbar元素');
        return;
    }
    
    // 回到顶部按钮
    const topBtn = document.getElementById('backToTop');
    if (topBtn) {
        topBtn.addEventListener('click', function(e) {
            console.log('点击回到顶部');
            e.stopPropagation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.error('未找到backToTop按钮');
    }
    
    // 到底部按钮
    const bottomBtn = document.getElementById('goToBottom');
    if (bottomBtn) {
        bottomBtn.addEventListener('click', function(e) {
            console.log('点击滚动到底部');
            e.stopPropagation();
            window.scrollTo({ 
                top: document.body.scrollHeight, 
                behavior: 'smooth' 
            });
        });
    } else {
        console.error('未找到goToBottom按钮');
    }
    
    // 拖拽功能
    setupDrag(toolbar);
}

// 设置拖拽功能
function setupDrag(toolbar) {
    let isDragging = false;
    let toolbarOffsetX, toolbarOffsetY;

    toolbar.addEventListener('mousedown', startDrag);
    toolbar.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        // 如果点击的是按钮，不启动拖动
        if (e.target.closest('button')) {
            return;
        }
        
        isDragging = true;
        const rect = toolbar.getBoundingClientRect();
        
        if (e.type === 'mousedown') {
            toolbarOffsetX = e.clientX - rect.left;
            toolbarOffsetY = e.clientY - rect.top;
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
        } else if (e.type === 'touchstart') {
            e.preventDefault();
            const touch = e.touches[0];
            toolbarOffsetX = touch.clientX - rect.left;
            toolbarOffsetY = touch.clientY - rect.top;
            document.addEventListener('touchmove', onDrag, { passive: false });
            document.addEventListener('touchend', stopDrag);
        }
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        let clientX, clientY;
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchmove') {
            const touch = e.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        }
        
        toolbar.style.right = 'auto';
        toolbar.style.bottom = 'auto';
        
        const left = clientX - toolbarOffsetX;
        const top = clientY - toolbarOffsetY;
        
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

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化工具栏');
    initFloatingToolbar();
}); 