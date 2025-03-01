// 导航栏逻辑
const navToggle = document.getElementById('nav-toggle');
const menuOverlay = document.getElementById('menu-overlay');

if (navToggle && menuOverlay) {
    navToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        menuOverlay.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!menuOverlay.contains(event.target) && !navToggle.contains(event.target)) {
            menuOverlay.classList.remove('active');
        }
    });
} else {
    console.error('navToggle or menuOverlay not found');
}