// 获取元素
const imageContainer = document.querySelector('.image-container');
const longImage = document.querySelector('.long-image');
const interestPoints = document.querySelectorAll('.interest-point');
const notePopup = document.querySelector('.note-popup');
const noteContent = document.querySelector('.note-content');
const closeBtn = document.querySelector('.close-btn');
const infoPanel = document.querySelector('.info-panel');
const jumpToStartBtn = document.getElementById('jump-to-start');
const togglePointsBtn = document.getElementById('toggle-points');
const goBackBtn = document.getElementById('go-back');
const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
const container = document.querySelector('.container');

// 拖动逻辑
let isDragging = false;
let startX, scrollLeft;

imageContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - imageContainer.offsetLeft;
    scrollLeft = imageContainer.scrollLeft;
    imageContainer.style.cursor = 'grabbing';
});

imageContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    imageContainer.style.cursor = 'grab';
});

imageContainer.addEventListener('mouseup', () => {
    isDragging = false;
    imageContainer.style.cursor = 'grab';
});

imageContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - imageContainer.offsetLeft;
    const walk = (x - startX) * 2; // 调整滚动速度
    imageContainer.scrollLeft = scrollLeft - walk;
});

// 移动端拖动逻辑
imageContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - imageContainer.offsetLeft;
    scrollLeft = imageContainer.scrollLeft;
});

imageContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - imageContainer.offsetLeft;
    const walk = (x - startX) * 2; // 调整滚动速度
    imageContainer.scrollLeft = scrollLeft - walk;
});

imageContainer.addEventListener('touchend', () => {
    isDragging = false;
});

// 滚动逻辑
imageContainer.addEventListener('scroll', () => {
    // 检查是否滚动到底部
    const scrollPercentage = (imageContainer.scrollLeft + imageContainer.clientWidth) / imageContainer.scrollWidth;
    infoPanel.style.opacity = scrollPercentage >= 0.95 ? 1 : scrollPercentage * 1.2;
});

// 兴趣点点击逻辑
interestPoints.forEach(point => {
    point.addEventListener('click', () => {
        noteContent.textContent = point.getAttribute('data-note');
        notePopup.classList.add('active');
    });
});

// 关闭浮窗
closeBtn.addEventListener('click', () => {
    notePopup.classList.remove('active');
});

// 工具栏功能
jumpToStartBtn.addEventListener('click', () => {
    imageContainer.scrollLeft = 0;
});

togglePointsBtn.addEventListener('click', () => {
    interestPoints.forEach(point => {
        point.style.display = point.style.display === 'none' ? 'block' : 'none';
    });
});

goBackBtn.addEventListener('click', () => {
    window.history.back();
});

toggleFullscreenBtn.addEventListener('click', () => {
    container.classList.toggle('fullscreen');
});