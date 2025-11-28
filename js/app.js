// app.js - 主页功能脚本

document.addEventListener('DOMContentLoaded', function() {
    console.log("Aaron's Tools loaded");
    
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
    
    // 工具卡片悬停效果增强（针对触摸设备）
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.classList.add('hover');
        });
        
        card.addEventListener('touchend', function() {
            this.classList.remove('hover');
        });
        
        card.addEventListener('touchcancel', function() {
            this.classList.remove('hover');
        });
    });
});