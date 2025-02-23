document.addEventListener('DOMContentLoaded', function() {
    var navToggle = document.getElementById('nav-toggle');
    var menuOverlay = document.getElementById('menu-overlay');

    navToggle.addEventListener('click', function() {
        menuOverlay.classList.toggle('active');
        navToggle.classList.toggle('rotate');
    });
});