// copyText.js
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(); // 显示提示框
    }).catch(() => {
        showNotification('复制失败，请手动复制'); // 显示错误提示
    });
}

// 显示提示框
function showNotification(message = '已复制到剪贴板！') {
    const notification = document.getElementById('copy-notification');
    if (notification) {
        notification.querySelector('p').textContent = message; // 更新提示内容
        notification.classList.add('show'); // 显示提示框
        setTimeout(() => {
            notification.classList.remove('show'); // 3秒后隐藏提示框
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo) {
        contactInfo.addEventListener('click', (event) => {
            if (event.target.tagName === 'P') {
                copyText(event.target.textContent);
            }
        });
    }
});