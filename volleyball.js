// volleyball.js
class VolleyballRefereeAssistant {
    constructor() {
        this.homeScore = 0;
        this.guestScore = 0;
        this.currentSet = 1;
        this.homeSets = 0;
        this.guestSets = 0;
        this.homeTimeouts = 0;
        this.guestTimeouts = 0;
        this.isTimerRunning = false;
        this.timerInterval = null;
        this.secondsLeft = 0;
        this.isFullscreen = false;
        
        this.initElements();
        this.bindEvents();
        this.loadFromStorage();
        this.updateDisplay();
    }
    
    initElements() {
        // 正常模式元素
        this.normalModeEl = document.getElementById('normalMode');
        this.fullscreenModeEl = document.getElementById('fullscreenMode');
        
        // 比分元素
        this.homeScoreEl = document.getElementById('homeScore');
        this.guestScoreEl = document.getElementById('guestScore');
        this.currentSetEl = document.getElementById('currentSet');
        this.homeSetsEl = document.getElementById('homeSets');
        this.guestSetsEl = document.getElementById('guestSets');
        
        // 全屏模式比分元素
        this.fsHomeScoreEl = document.getElementById('fsHomeScore');
        this.fsGuestScoreEl = document.getElementById('fsGuestScore');
        this.fsCurrentSetEl = document.getElementById('fsCurrentSet');
        this.fsHomeSetsEl = document.getElementById('fsHomeSets');
        this.fsGuestSetsEl = document.getElementById('fsGuestSets');
        
        // 按钮元素
        this.addPointBtns = document.querySelectorAll('.add-point');
        this.subtractPointBtns = document.querySelectorAll('.subtract-point');
        this.nextSetBtn = document.getElementById('nextSet');
        this.resetMatchBtn = document.getElementById('resetMatch');
        this.switchSidesBtn = document.getElementById('switchSides');
        
        // 全屏控制按钮
        this.toggleFullscreenBtn = document.getElementById('toggleFullscreen');
        this.exitFullscreenBtn = document.getElementById('exitFullscreen');
        this.fsHomePointBtn = document.getElementById('fsHomePoint');
        this.fsHomePointSubtractBtn = document.getElementById('fsHomePointSubtract');
        this.fsGuestPointBtn = document.getElementById('fsGuestPoint');
        this.fsGuestPointSubtractBtn = document.getElementById('fsGuestPointSubtract');
        
        // 暂停相关元素
        this.timeoutHomeBtn = document.getElementById('timeoutHome');
        this.timeoutGuestBtn = document.getElementById('timeoutGuest');
        this.technicalTimeoutBtn = document.getElementById('technicalTimeout');
        this.homeTimeoutsEl = document.getElementById('homeTimeouts');
        this.guestTimeoutsEl = document.getElementById('guestTimeouts');
        
        // 计时器元素
        this.timerDisplayEl = document.getElementById('timer');
        this.startTimerBtn = document.getElementById('startTimer');
        this.pauseTimerBtn = document.getElementById('pauseTimer');
        this.resetTimerBtn = document.getElementById('resetTimer');
        this.presetTimerBtns = document.querySelectorAll('.preset');
    }
    
    bindEvents() {
        // 正常模式事件
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
        
        // 全屏切换事件
        this.toggleFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.exitFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // 全屏模式控制
        this.fsHomePointBtn.addEventListener('click', () => this.addPoint('home'));
        this.fsHomePointSubtractBtn.addEventListener('click', () => this.subtractPoint('home'));
        this.fsGuestPointBtn.addEventListener('click', () => this.addPoint('guest'));
        this.fsGuestPointSubtractBtn.addEventListener('click', () => this.subtractPoint('guest'));
        
        // 暂停事件
        this.timeoutHomeBtn.addEventListener('click', () => this.useTimeout('home'));
        this.timeoutGuestBtn.addEventListener('click', () => this.useTimeout('guest'));
        this.technicalTimeoutBtn.addEventListener('click', () => this.callTechnicalTimeout());
        
        // 计时器事件
        this.startTimerBtn.addEventListener('click', () => this.startTimer());
        this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        this.resetTimerBtn.addEventListener('click', () => this.resetTimer());
        
        this.presetTimerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseInt(btn.dataset.time);
                this.setPresetTime(time);
            });
        });
    }
    
    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        this.normalModeEl.style.display = this.isFullscreen ? 'none' : 'block';
        this.fullscreenModeEl.style.display = this.isFullscreen ? 'flex' : 'none';
        
        if (this.isFullscreen) {
            // 进入全屏时尝试锁定屏幕方向为横向
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(err => {
                    console.log('无法锁定屏幕方向: ', err);
                });
            }
        } else {
            // 退出全屏时解锁屏幕方向
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        }
        
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
        
        // 检查是否达到赛点
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
        // 检查比赛是否结束
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
        // 这里可以添加更多技术暂停逻辑
    }
    
    switchSides() {
        alert('交换场地');
        // 可以添加交换场地的视觉效果或通知
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
        this.resetTimer();
        
        this.updateDisplay();
        this.saveToStorage();
    }
    
    // 计时器功能
    startTimer() {
        if (this.isTimerRunning) return;
        
        this.isTimerRunning = true;
        this.timerInterval = setInterval(() => {
            if (this.secondsLeft > 0) {
                this.secondsLeft--;
                this.updateTimerDisplay();
            } else {
                this.pauseTimer();
                alert('时间到！');
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isTimerRunning = false;
        clearInterval(this.timerInterval);
    }
    
    resetTimer() {
        this.pauseTimer();
        this.secondsLeft = 0;
        this.updateTimerDisplay();
    }
    
    setPresetTime(seconds) {
        this.pauseTimer();
        this.secondsLeft = seconds;
        this.updateTimerDisplay();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.secondsLeft / 60);
        const seconds = this.secondsLeft % 60;
        this.timerDisplayEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        // 更新正常模式显示
        this.homeScoreEl.textContent = this.homeScore;
        this.guestScoreEl.textContent = this.guestScore;
        this.currentSetEl.textContent = this.currentSet;
        this.homeSetsEl.textContent = this.homeSets;
        this.guestSetsEl.textContent = this.guestSets;
        this.homeTimeoutsEl.textContent = this.homeTimeouts;
        this.guestTimeoutsEl.textContent = this.guestTimeouts;
        
        // 更新全屏模式显示
        if (this.isFullscreen) {
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
        localStorage.setItem('volleyballRefereeData', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const data = localStorage.getItem('volleyballRefereeData');
        if (data) {
            const parsed = JSON.parse(data);
            this.homeScore = parsed.homeScore || 0;
            this.guestScore = parsed.guestScore || 0;
            this.currentSet = parsed.currentSet || 1;
            this.homeSets = parsed.homeSets || 0;
            this.guestSets = parsed.guestSets || 0;
            this.homeTimeouts = parsed.homeTimeouts || 0;
            this.guestTimeouts = parsed.guestTimeouts || 0;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new VolleyballRefereeAssistant();
});