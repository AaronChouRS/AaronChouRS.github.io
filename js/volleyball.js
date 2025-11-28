// js/volleyball.js
import FullscreenManager from './modules/fullscreen.js';
import StorageManager from './modules/storage.js';
import TimerManager from './modules/timer.js';

class VolleyballRefereeAssistant {
    constructor() {
        this.homeScore = 0;
        this.guestScore = 0;
        this.currentSet = 1;
        this.homeSets = 0;
        this.guestSets = 0;
        this.homeTimeouts = 0;
        this.guestTimeouts = 0;
        
        this.fullscreenManager = new FullscreenManager();
        this.timerManager = new TimerManager(
            (seconds) => this.updateTimerDisplay(seconds),
            () => alert('时间到！')
        );
        
        this.initElements();
        this.bindEvents();
        this.loadFromStorage();
        this.updateDisplay();
        
        document.addEventListener('fullscreenchange', () => 
            this.fullscreenManager.handleFullscreenChange(() => this.onExitFullscreen()));
        document.addEventListener('webkitfullscreenchange', () => 
            this.fullscreenManager.handleFullscreenChange(() => this.onExitFullscreen()));
        document.addEventListener('msfullscreenchange', () => 
            this.fullscreenManager.handleFullscreenChange(() => this.onExitFullscreen()));
    }
    
    initElements() {
        this.normalModeEl = document.getElementById('normalMode');
        this.fullscreenModeEl = document.getElementById('fullscreenMode');
        
        this.homeScoreEl = document.getElementById('homeScore');
        this.guestScoreEl = document.getElementById('guestScore');
        this.currentSetEl = document.getElementById('currentSet');
        this.homeSetsEl = document.getElementById('homeSets');
        this.guestSetsEl = document.getElementById('guestSets');
        
        this.fsHomeScoreEl = document.getElementById('fsHomeScore');
        this.fsGuestScoreEl = document.getElementById('fsGuestScore');
        this.fsCurrentSetEl = document.getElementById('fsCurrentSet');
        this.fsHomeSetsEl = document.getElementById('fsHomeSets');
        this.fsGuestSetsEl = document.getElementById('fsGuestSets');
        
        this.addPointBtns = document.querySelectorAll('.add-point');
        this.subtractPointBtns = document.querySelectorAll('.subtract-point');
        this.nextSetBtn = document.getElementById('nextSet');
        this.resetMatchBtn = document.getElementById('resetMatch');
        this.switchSidesBtn = document.getElementById('switchSides');
        
        this.toggleFullscreenBtn = document.getElementById('toggleFullscreen');
        this.exitFullscreenBtn = document.getElementById('exitFullscreen');
        this.fsHomePointBtn = document.getElementById('fsHomePoint');
        this.fsHomePointSubtractBtn = document.getElementById('fsHomePointSubtract');
        this.fsGuestPointBtn = document.getElementById('fsGuestPoint');
        this.fsGuestPointSubtractBtn = document.getElementById('fsGuestPointSubtract');
        
        this.timeoutHomeBtn = document.getElementById('timeoutHome');
        this.timeoutGuestBtn = document.getElementById('timeoutGuest');
        this.technicalTimeoutBtn = document.getElementById('technicalTimeout');
        this.homeTimeoutsEl = document.getElementById('homeTimeouts');
        this.guestTimeoutsEl = document.getElementById('guestTimeouts');
        
        this.timerDisplayEl = document.getElementById('timer');
        this.startTimerBtn = document.getElementById('startTimer');
        this.pauseTimerBtn = document.getElementById('pauseTimer');
        this.resetTimerBtn = document.getElementById('resetTimer');
        this.presetTimerBtns = document.querySelectorAll('.preset');
    }
    
    bindEvents() {
        this.addPointBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const team = btn.dataset.team;
                this.addPoint(team);
            });
        });
        
        this.subtractPointBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const team = btn.dataset.team;
                this.subtractPoint(team);
            });
        });
        
        this.nextSetBtn.addEventListener('click', () => this.nextSet());
        this.resetMatchBtn.addEventListener('click', () => this.resetMatch());
        this.switchSidesBtn.addEventListener('click', () => this.switchSides());
        
        this.toggleFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.exitFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        this.fsHomePointBtn.addEventListener('click', () => this.addPoint('home'));
        this.fsHomePointSubtractBtn.addEventListener('click', () => this.subtractPoint('home'));
        this.fsGuestPointBtn.addEventListener('click', () => this.addPoint('guest'));
        this.fsGuestPointSubtractBtn.addEventListener('click', () => this.subtractPoint('guest'));
        
        this.timeoutHomeBtn.addEventListener('click', () => this.useTimeout('home'));
        this.timeoutGuestBtn.addEventListener('click', () => this.useTimeout('guest'));
        this.technicalTimeoutBtn.addEventListener('click', () => this.callTechnicalTimeout());
        
        this.startTimerBtn.addEventListener('click', () => this.timerManager.start());
        this.pauseTimerBtn.addEventListener('click', () => this.timerManager.pause());
        this.resetTimerBtn.addEventListener('click', () => {
            this.timerManager.reset();
            this.updateTimerDisplay(0);
        });
        
        this.presetTimerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseInt(btn.dataset.time);
                this.timerManager.setPresetTime(time);
                this.updateTimerDisplay(time);
            });
        });
    }
    
    onExitFullscreen() {
        this.normalModeEl.style.display = 'block';
        this.fullscreenModeEl.style.display = 'none';
        this.updateDisplay();
    }
    
    toggleFullscreen() {
        const isFullscreen = this.fullscreenManager.toggleFullscreen(
            this.normalModeEl, 
            this.fullscreenModeEl
        );
        this.updateDisplay();
    }
    
    addPoint(team) {
        if (team === 'home') {
            this.homeScore++;
        } else {
            this.guestScore++;
        }
        
        this.checkSetEnd();
        this.updateDisplay();
        this.saveToStorage();
    }
    
    subtractPoint(team) {
        if (team === 'home' && this.homeScore > 0) {
            this.homeScore--;
        } else if (team === 'guest' && this.guestScore > 0) {
            this.guestScore--;
        }
        
        this.updateDisplay();
        this.saveToStorage();
    }
    
    checkSetEnd() {
        const setPoint = this.currentSet === 5 ? 15 : 25;
        
        if ((this.homeScore >= setPoint || this.guestScore >= setPoint) && 
            Math.abs(this.homeScore - this.guestScore) >= 2) {
            
            if (this.homeScore > this.guestScore) {
                this.homeSets++;
            } else {
                this.guestSets++;
            }
            
            this.endSet();
        }
    }
    
    endSet() {
        if (this.homeSets >= 3 || this.guestSets >= 3) {
            setTimeout(() => {
                alert(`比赛结束! ${this.homeSets > this.guestSets ? '主队' : '客队'} 获胜!`);
            }, 100);
            this.resetMatch();
            return;
        }
        
        setTimeout(() => {
            alert(`第${this.currentSet}局结束! 即将开始下一局。`);
        }, 100);
        this.currentSet++;
        this.homeScore = 0;
        this.guestScore = 0;
        this.homeTimeouts = 0;
        this.guestTimeouts = 0;
    }
    
    nextSet() {
        if (this.homeScore > 0 || this.guestScore > 0) {
            if (!confirm('确定要跳过当前局吗？当前比分将丢失')) {
                return;
            }
        }
        
        this.currentSet++;
        this.homeScore = 0;
        this.guestScore = 0;
        this.homeTimeouts = 0;
        this.guestTimeouts = 0;
        this.updateDisplay();
        this.saveToStorage();
    }
    
    useTimeout(team) {
        if (team === 'home' && this.homeTimeouts < 2) {
            this.homeTimeouts++;
        } else if (team === 'guest' && this.guestTimeouts < 2) {
            this.guestTimeouts++;
        } else {
            alert('该队暂停次数已用完！');
            return;
        }
        
        alert(`${team === 'home' ? '主队' : '客队'} 使用了暂停`);
        this.updateDisplay();
        this.saveToStorage();
    }
    
    callTechnicalTimeout() {
        alert('技术暂停');
    }
    
    switchSides() {
        alert('交换场地');
    }
    
    resetMatch() {
        if (!confirm('确定要重置整个比赛吗？所有数据将被清除。')) {
            return;
        }
        
        this.homeScore = 0;
        this.guestScore = 0;
        this.currentSet = 1;
        this.homeSets = 0;
        this.guestSets = 0;
        this.homeTimeouts = 0;
        this.guestTimeouts = 0;
        this.timerManager.reset();
        this.updateTimerDisplay(0);
        
        this.updateDisplay();
        this.saveToStorage();
    }
    
    updateTimerDisplay(seconds) {
        this.timerDisplayEl.textContent = this.timerManager.formatTime(seconds);
    }
    
    updateDisplay() {
        this.homeScoreEl.textContent = this.homeScore;
        this.guestScoreEl.textContent = this.guestScore;
        this.currentSetEl.textContent = this.currentSet;
        this.homeSetsEl.textContent = this.homeSets;
        this.guestSetsEl.textContent = this.guestSets;
        this.homeTimeoutsEl.textContent = this.homeTimeouts;
        this.guestTimeoutsEl.textContent = this.guestTimeouts;
        
        if (this.fullscreenManager.isFullscreen) {
            this.fsHomeScoreEl.textContent = this.homeScore;
            this.fsGuestScoreEl.textContent = this.guestScore;
            this.fsCurrentSetEl.textContent = this.currentSet;
            this.fsHomeSetsEl.textContent = this.homeSets;
            this.fsGuestSetsEl.textContent = this.guestSets;
        }
    }
    
    saveToStorage() {
        const data = {
            homeScore: this.homeScore,
            guestScore: this.guestScore,
            currentSet: this.currentSet,
            homeSets: this.homeSets,
            guestSets: this.guestSets,
            homeTimeouts: this.homeTimeouts,
            guestTimeouts: this.guestTimeouts
        };
        StorageManager.saveGameData(data);
    }
    
    loadFromStorage() {
        const data = StorageManager.loadGameData();
        if (data) {
            this.homeScore = data.homeScore || 0;
            this.guestScore = data.guestScore || 0;
            this.currentSet = data.currentSet || 1;
            this.homeSets = data.homeSets || 0;
            this.guestSets = data.guestSets || 0;
            this.homeTimeouts = data.homeTimeouts || 0;
            this.guestTimeouts = data.guestTimeouts || 0;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VolleyballRefereeAssistant();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
});