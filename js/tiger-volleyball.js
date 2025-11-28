// js/tiger-volleyball.js
class TigerVolleyballGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.tiger = document.getElementById('tiger');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.toggleFullscreenBtn = document.getElementById('toggleFullscreen');
        
        this.gameWidth = this.gameArea.offsetWidth;
        this.gameHeight = this.gameArea.offsetHeight;
        this.tigerWidth = this.tiger.offsetWidth;
        
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gamePaused = false;
        this.volleyballs = [];
        this.animationId = null;
        this.lastSpawnTime = 0;
        this.spawnInterval = 1000; // 初始生成间隔(ms)
        
        this.tigerPosition = this.gameWidth / 2;
        this.tiger.style.left = `${this.tigerPosition}px`;
        
        this.initEventListeners();
        this.updateUI();
    }
    
    initEventListeners() {
        // 开始/暂停按钮
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.toggleFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // 鼠标控制
        this.gameArea.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.gameArea.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // 窗口大小调整
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleMouseMove(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const rect = this.gameArea.getBoundingClientRect();
        this.tigerPosition = e.clientX - rect.left - this.tigerWidth / 2;
        this.tigerPosition = Math.max(0, Math.min(this.tigerPosition, this.gameWidth - this.tigerWidth));
        this.tiger.style.left = `${this.tigerPosition}px`;
    }
    
    handleTouchMove(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        e.preventDefault();
        const rect = this.gameArea.getBoundingClientRect();
        this.tigerPosition = e.touches[0].clientX - rect.left - this.tigerWidth / 2;
        this.tigerPosition = Math.max(0, Math.min(this.tigerPosition, this.gameWidth - this.tigerWidth));
        this.tiger.style.left = `${this.tigerPosition}px`;
    }
    
    handleResize() {
        this.gameWidth = this.gameArea.offsetWidth;
        this.gameHeight = this.gameArea.offsetHeight;
        this.tigerWidth = this.tiger.offsetWidth;
        
        // 确保老虎位置在有效范围内
        this.tigerPosition = Math.max(0, Math.min(this.tigerPosition, this.gameWidth - this.tigerWidth));
        this.tiger.style.left = `${this.tigerPosition}px`;
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.gameLoop();
        }
    }
    
    pauseGame() {
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    restartGame() {
        // 清除现有排球
        this.volleyballs.forEach(ball => {
            if (ball.element && ball.element.parentNode) {
                ball.element.parentNode.removeChild(ball.element);
            }
        });
        
        this.volleyballs = [];
        
        // 重置游戏状态
        this.score = 0;
        this.lives = 3;
        this.spawnInterval = 1000;
        this.gameRunning = true;
        this.gamePaused = false;
        
        // 重置老虎大小
        this.tiger.style.fontSize = '3rem';
        this.tigerWidth = this.tiger.offsetWidth;
        
        // 更新UI
        this.updateUI();
        this.gameOverElement.style.display = 'none';
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.pauseBtn.textContent = '暂停';
        
        // 开始游戏循环
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.gameLoop();
    }
    
    gameLoop(timestamp) {
        if (!this.gameRunning) return;
        
        if (!this.gamePaused) {
            // 生成排球
            if (!timestamp) timestamp = 0;
            if (timestamp - this.lastSpawnTime > this.spawnInterval) {
                this.spawnVolleyball();
                this.lastSpawnTime = timestamp;
                
                // 随着分数增加，加快生成速度（但不低于200ms间隔）
                this.spawnInterval = Math.max(200, 1000 - Math.floor(this.score / 5) * 50);
            }
            
            // 更新排球位置
            this.updateVolleyballs();
            
            // 检查碰撞
            this.checkCollisions();
        }
        
        this.animationId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    spawnVolleyball() {
        const volleyball = document.createElement('div');
        volleyball.className = 'volleyball';
        volleyball.textContent = '🏐';
        
        const xPos = Math.random() * (this.gameWidth - 30); // 30是排球大概宽度
        volleyball.style.left = `${xPos}px`;
        volleyball.style.top = '0px';
        
        this.gameArea.appendChild(volleyball);
        
        this.volleyballs.push({
            element: volleyball,
            x: xPos,
            y: 0,
            speed: 2 + Math.floor(this.score / 10) * 0.5 // 随分数增加速度
        });
    }
    
    updateVolleyballs() {
        for (let i = this.volleyballs.length - 1; i >= 0; i--) {
            const ball = this.volleyballs[i];
            ball.y += ball.speed;
            ball.element.style.top = `${ball.y}px`;
            
            // 如果排球超出屏幕底部，移除并扣血
            if (ball.y > this.gameHeight) {
                ball.element.parentNode.removeChild(ball.element);
                this.volleyballs.splice(i, 1);
                this.loseLife();
            }
        }
    }
    
    checkCollisions() {
        const tigerRect = {
            left: this.tigerPosition,
            right: this.tigerPosition + this.tigerWidth,
            top: this.gameHeight - 60, // 老虎大约高度
            bottom: this.gameHeight
        };
        
        for (let i = this.volleyballs.length - 1; i >= 0; i--) {
            const ball = this.volleyballs[i];
            const ballRect = {
                left: ball.x,
                right: ball.x + 30, // 排球宽度约30px
                top: ball.y,
                bottom: ball.y + 30 // 排球高度约30px
            };
            
            // 简单的矩形碰撞检测
            if (ballRect.left < tigerRect.right &&
                ballRect.right > tigerRect.left &&
                ballRect.top < tigerRect.bottom &&
                ballRect.bottom > tigerRect.top) {
                
                // 接球反馈
                this.showCatchFeedback(ball.x, ball.y);
                
                // 老虎接球动画
                this.tiger.classList.add('catch');
                setTimeout(() => {
                    this.tiger.classList.remove('catch');
                }, 300);
                
                // 移除接住的排球
                ball.element.parentNode.removeChild(ball.element);
                this.volleyballs.splice(i, 1);
                
                // 增加分数
                this.score += 1;
                this.updateUI();
                
                // 更新老虎大小（每分线性增长）
                this.updateTigerSize();
            }
        }
    }
    
    showCatchFeedback(x, y) {
        const catchEffect = document.createElement('div');
        catchEffect.className = 'catch-feedback';
        catchEffect.textContent = '🏐';
        catchEffect.style.left = `${x}px`;
        catchEffect.style.top = `${y}px`;
        catchEffect.style.color = '#4a69bd';
        
        this.gameArea.appendChild(catchEffect);
        
        // 1秒后移除动画元素
        setTimeout(() => {
            if (catchEffect.parentNode) {
                catchEffect.parentNode.removeChild(catchEffect);
            }
        }, 800);
    }
    
    updateTigerSize() {
        // 根据得分线性调整老虎大小，每分增加0.05rem，最大5rem
        const newSize = Math.min(3 + this.score * 0.05, 5);
        this.tiger.style.fontSize = `${newSize}rem`;
        this.tigerWidth = this.tiger.offsetWidth; // 更新老虎宽度
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = '❤️'.repeat(this.lives);
    }
    
    toggleFullscreen() {
        const elem = document.documentElement;
        
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(err => {
                    console.log('无法进入全屏模式: ', err);
                });
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new TigerVolleyballGame();
});