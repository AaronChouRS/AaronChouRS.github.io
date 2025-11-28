// js/modules/fullscreen.js
class FullscreenManager {
    constructor() {
        this.isFullscreen = false;
    }
    
    toggleFullscreen(normalModeEl, fullscreenModeEl) {
        this.isFullscreen = !this.isFullscreen;
        normalModeEl.style.display = this.isFullscreen ? 'none' : 'block';
        fullscreenModeEl.style.display = this.isFullscreen ? 'flex' : 'none';
        
        if (this.isFullscreen) {
            this.enterFullscreenAPI();
        } else {
            this.exitFullscreenAPI();
        }
        
        return this.isFullscreen;
    }
    
    enterFullscreenAPI() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log('无法进入全屏模式: ', err);
            });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => {
                console.log('无法锁定屏幕方向: ', err);
            });
        }
    }
    
    exitFullscreenAPI() {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => {
                console.log('退出全屏失败: ', err);
            });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }
    
    handleFullscreenChange(callback) {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            this.isFullscreen = false;
            callback();
        }
    }
}

export default FullscreenManager;