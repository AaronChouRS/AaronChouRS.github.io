// js/modules/timer.js
class TimerManager {
    constructor(onTick, onTimeout) {
        this.isTimerRunning = false;
        this.timerInterval = null;
        this.secondsLeft = 0;
        this.onTick = onTick;
        this.onTimeout = onTimeout;
    }
    
    start() {
        if (this.isTimerRunning) return;
        
        this.isTimerRunning = true;
        this.timerInterval = setInterval(() => {
            if (this.secondsLeft > 0) {
                this.secondsLeft--;
                if (this.onTick) this.onTick(this.secondsLeft);
            } else {
                this.pause();
                if (this.onTimeout) this.onTimeout();
            }
        }, 1000);
    }
    
    pause() {
        this.isTimerRunning = false;
        clearInterval(this.timerInterval);
    }
    
    reset() {
        this.pause();
        this.secondsLeft = 0;
    }
    
    setPresetTime(seconds) {
        this.pause();
        this.secondsLeft = seconds;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

export default TimerManager;