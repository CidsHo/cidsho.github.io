document.addEventListener('DOMContentLoaded', function() {
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', function() {
        // 切换导航栏的显示状态
        navMenu.classList.toggle('active');

        // 切换图标的旋转状态
        navToggle.classList.toggle('rotate');
    });
});