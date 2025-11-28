// js/tiger-merge.js
class TigerMergeGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.previewBall = document.getElementById('previewBall');
        this.scoreElement = document.getElementById('score');
        this.nextItemElement = document.getElementById('nextItem');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.toggleFullscreenBtn = document.getElementById('toggleFullscreen');
        
        // 游戏物品定义（从小到大）
        this.items = [
            { name: '🍵', className: 'item-0' },  // 绿茶
            { name: '🥥', className: 'item-1' },  // 椰子
            { name: '👑', className: 'item-2' },  // 王冠
            { name: '🥚', className: 'item-3' },  // 蛋
            { name: '🪿', className: 'item-4' },  // 鹅
            { name: '🐑', className: 'item-5' },  // 羊
            { name: '🧑', className: 'item-6' },  // 光头
            { name: '🐻', className: 'item-7' },  // 熊
            { name: '🐅', className: 'item-8' }   // 虎
        ];
        
        this.gameWidth = this.gameArea.offsetWidth;
        this.gameHeight = this.gameArea.offsetHeight;
        
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.balls = [];
        this.nextItemType = Math.floor(Math.random() * 3); // 初始随机生成0-2级物品
        this.currentBall = null;
        this.animationId = null;
        this.isDragging = false; // 标记是否正在拖拽
        
        this.previewPosition = this.gameWidth / 2;
        this.previewBall.style.left = `${this.previewPosition}px`;
        
        this.initEventListeners();
        this.updateNextItem();
        this.updatePreviewBall(); // 初始化预览球样式
    }
    
    initEventListeners() {
        // 按钮事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.toggleFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // 鼠标控制预览球位置
        this.gameArea.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.gameArea.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.gameArea.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.gameArea.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // 触摸控制预览球位置
        this.gameArea.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.gameArea.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.gameArea.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // 窗口大小调整
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleMouseDown(e) {
        if (!this.gameRunning || this.gamePaused) return;
        this.isDragging = true;
    }
    
    handleMouseMove(e) {
        if (!this.gameRunning || this.gamePaused || !this.isDragging) return;
        
        const rect = this.gameArea.getBoundingClientRect();
        this.previewPosition = e.clientX - rect.left;
        this.previewPosition = Math.max(20, Math.min(this.previewPosition, this.gameWidth - 20));
        this.previewBall.style.left = `${this.previewPosition}px`;
    }
    
    handleMouseUp(e) {
        if (!this.gameRunning || this.gamePaused || !this.isDragging) return;
        this.isDragging = false;
        this.placeBall();
    }
    
    handleTouchStart(e) {
        if (!this.gameRunning || this.gamePaused) return;
        this.isDragging = true;
        e.preventDefault();
    }
    
    handleTouchMove(e) {
        if (!this.gameRunning || this.gamePaused || !this.isDragging) return;
        
        e.preventDefault();
        const rect = this.gameArea.getBoundingClientRect();
        this.previewPosition = e.touches[0].clientX - rect.left;
        this.previewPosition = Math.max(20, Math.min(this.previewPosition, this.gameWidth - 20));
        this.previewBall.style.left = `${this.previewPosition}px`;
    }
    
    handleTouchEnd(e) {
        if (!this.gameRunning || this.gamePaused || !this.isDragging) return;
        this.isDragging = false;
        this.placeBall();
    }
    
    placeBall() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // 创建新的球体
        this.createBall();
        
        // 延迟0.5秒后再预览下一个球体
        setTimeout(() => {
            if (this.gameRunning && !this.gamePaused) {
                this.nextItemType = Math.floor(Math.random() * 5); // 下一个球体类型为0-4级
                this.updateNextItem();
                this.updatePreviewBall();
            }
        }, 500);
    }
    
    handleResize() {
        this.gameWidth = this.gameArea.offsetWidth;
        this.gameHeight = this.gameArea.offsetHeight;
        
        // 确保预览球位置在有效范围内
        this.previewPosition = Math.max(20, Math.min(this.previewPosition, this.gameWidth - 20));
        this.previewBall.style.left = `${this.previewPosition}px`;
        
        // 重新定位所有已存在的球体
        this.balls.forEach(ball => {
            ball.x = Math.max(ball.radius, Math.min(ball.x, this.gameWidth - ball.radius));
        });
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.updatePreviewBall(); // 显示预览球
            this.gameLoop();
        }
    }
    
    pauseGame() {
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
        this.previewBall.style.display = this.gamePaused ? 'none' : 'block';
    }
    
    resetGame() {
        // 清除现有球体
        this.balls.forEach(ball => {
            if (ball.element && ball.element.parentNode) {
                ball.element.parentNode.removeChild(ball.element);
            }
        });
        
        this.balls = [];
        this.score = 0;
        this.nextItemType = Math.floor(Math.random() * 3);
        this.gameRunning = false;
        this.gamePaused = false;
        this.isDragging = false;
        
        // 更新UI
        this.updateUI();
        this.updateNextItem();
        this.updatePreviewBall();
        this.gameOverElement.style.display = 'none';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        
        // 停止动画循环
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.gamePaused) {
            // 更新球体物理状态
            this.updateBalls();
            
            // 检查碰撞
            this.checkCollisions();
            
            // 检查游戏是否结束（合成出虎）
            this.checkWinCondition();
        }
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    updatePreviewBall() {
        // 更新预览球的样式以匹配下一个球体类型
        this.previewBall.textContent = this.items[this.nextItemType].name;
        this.previewBall.className = `preview-ball ${this.items[this.nextItemType].className}`;
        
        // 根据类型计算半径（等级越高，半径越大）- 进一步增大尺寸
        const radius = 30 + this.nextItemType * 12;
        this.previewBall.style.width = `${radius * 2}px`;
        this.previewBall.style.height = `${radius * 2}px`;
        this.previewBall.style.fontSize = `${radius}px`;
        this.previewBall.style.lineHeight = `${radius * 2}px`;
        this.previewBall.style.marginLeft = `${-radius}px`;
    }
    
    createBall() {
        const ball = document.createElement('div');
        ball.className = `game-ball ${this.items[this.nextItemType].className}`;
        ball.textContent = this.items[this.nextItemType].name;
        
        // 根据类型计算半径（等级越高，半径越大）- 进一步增大尺寸
        const radius = 30 + this.nextItemType * 12;
        const x = this.previewPosition;
        const y = radius + 5; // 从预览线下方开始
        
        ball.style.width = `${radius * 2}px`;
        ball.style.height = `${radius * 2}px`;
        ball.style.fontSize = `${radius}px`;
        ball.style.lineHeight = `${radius * 2}px`;
        ball.style.left = `${x - radius}px`;
        ball.style.top = `${y - radius}px`;
        
        this.gameArea.appendChild(ball);
        
        // 添加到球体数组
        this.balls.push({
            element: ball,
            x: x,
            y: y,
            radius: radius,
            type: this.nextItemType,
            velocityX: 0,
            velocityY: 0,
            isResting: false
        });
    }
    
    updateBalls() {
        const gravity = 0.3;
        const verticalDamping = 0.1; // 极小的垂直弹性
        const horizontalDamping = 0.7; // 正常的水平弹性
        const friction = 0.99; // 添加摩擦力
        
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            
            if (ball.isResting) continue;
            
            // 应用重力
            ball.velocityY += gravity;
            
            // 应用摩擦力
            ball.velocityX *= friction;
            
            // 更新位置
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;
            
            // 边界检测（左右边界）
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.velocityX = -ball.velocityX * horizontalDamping;
            } else if (ball.x + ball.radius > this.gameWidth) {
                ball.x = this.gameWidth - ball.radius;
                ball.velocityX = -ball.velocityX * horizontalDamping;
            }
            
            // 底部边界检测
            if (ball.y + ball.radius > this.gameHeight) {
                ball.y = this.gameHeight - ball.radius;
                ball.velocityY = -ball.velocityY * verticalDamping; // 极小的垂直弹性
                
                // 当垂直速度足够小时，认为球体静止
                if (Math.abs(ball.velocityY) < 0.5 && Math.abs(ball.velocityX) < 0.5) {
                    ball.velocityY = 0;
                    ball.velocityX = 0;
                    ball.isResting = true;
                }
            }
            
            // 更新球体位置
            ball.element.style.left = `${ball.x - ball.radius}px`;
            ball.element.style.top = `${ball.y - ball.radius}px`;
        }
    }
    
    checkCollisions() {
        // 检查球体之间的碰撞
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball1 = this.balls[i];
                const ball2 = this.balls[j];
                
                const dx = ball2.x - ball1.x;
                const dy = ball2.y - ball1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 如果两个球体接触并且类型相同，则合并
                if (distance < ball1.radius + ball2.radius && ball1.type === ball2.type && !ball1.isMerging && !ball2.isMerging) {
                    this.mergeBalls(i, j);
                    continue; // 合并后跳过此对球体的物理碰撞计算
                }
                
                // 物理碰撞计算（仅对未合并且未静止的球体）
                if (distance < ball1.radius + ball2.radius && !ball1.isMerging && !ball2.isMerging) {
                    // 计算碰撞后的速度（弹性碰撞）
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);
                    
                    // 旋转速度向量
                    const vx1 = ball1.velocityX * cos + ball1.velocityY * sin;
                    const vy1 = ball1.velocityY * cos - ball1.velocityX * sin;
                    const vx2 = ball2.velocityX * cos + ball2.velocityY * sin;
                    const vy2 = ball2.velocityY * cos - ball2.velocityX * sin;
                    
                    // 一维弹性碰撞公式
                    const finalVx1 = ((ball1.radius*2 - ball2.radius*2) * vx1 + (ball2.radius*2) * vx2 * 2) / (ball1.radius*2 + ball2.radius*2);
                    const finalVx2 = ((ball1.radius*2) * vx1 * 2 + (ball2.radius*2 - ball1.radius*2) * vx2) / (ball1.radius*2 + ball2.radius*2);
                    
                    // 旋转回原坐标系
                    ball1.velocityX = finalVx1 * cos - vy1 * sin;
                    ball1.velocityY = vy1 * cos + finalVx1 * sin;
                    ball2.velocityX = finalVx2 * cos - vy2 * sin;
                    ball2.velocityY = vy2 * cos + finalVx2 * sin;
                    
                    // 防止球体粘连
                    const overlap = (ball1.radius + ball2.radius - distance) / 2;
                    ball1.x -= overlap * Math.cos(angle);
                    ball1.y -= overlap * Math.sin(angle);
                    ball2.x += overlap * Math.cos(angle);
                    ball2.y += overlap * Math.sin(angle);
                    
                    // 标记为非静止状态
                    ball1.isResting = false;
                    ball2.isResting = false;
                }
            }
        }
        
        // 检查球体与容器壁的碰撞
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            
            // 左右墙壁碰撞
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.velocityX = Math.abs(ball.velocityX) * 0.7; // 正常的水平弹性
            } else if (ball.x + ball.radius > this.gameWidth) {
                ball.x = this.gameWidth - ball.radius;
                ball.velocityX = -Math.abs(ball.velocityX) * 0.7; // 正常的水平弹性
            }
        }
    }
    
    mergeBalls(index1, index2) {
        const ball1 = this.balls[index1];
        const ball2 = this.balls[index2];
        
        // 标记正在合并，防止重复处理
        ball1.isMerging = true;
        ball2.isMerging = true;
        
        // 计算新球体的位置（两个球体的中心点）
        const newX = (ball1.x + ball2.x) / 2;
        const newY = (ball1.y + ball2.y) / 2;
        
        // 计算合并后的新速度
        const newVelocityX = (ball1.velocityX + ball2.velocityX) / 2;
        const newVelocityY = (ball1.velocityY + ball2.velocityY) / 2;
        
        // 移除旧的球体
        ball1.element.parentNode.removeChild(ball1.element);
        ball2.element.parentNode.removeChild(ball2.element);
        
        // 从数组中移除
        this.balls.splice(Math.max(index1, index2), 1);
        this.balls.splice(Math.min(index1, index2), 1);
        
        // 创建新球体（类型+1）
        const newType = Math.min(ball1.type + 1, this.items.length - 1);
        
        const newBall = document.createElement('div');
        newBall.className = `game-ball ${this.items[newType].className} merge-animation`;
        newBall.textContent = this.items[newType].name;
        
        // 根据类型计算半径（等级越高，半径越大）- 进一步增大尺寸
        const radius = 30 + newType * 12;
        
        newBall.style.width = `${radius * 2}px`;
        newBall.style.height = `${radius * 2}px`;
        newBall.style.fontSize = `${radius}px`;
        newBall.style.lineHeight = `${radius * 2}px`;
        newBall.style.left = `${newX - radius}px`;
        newBall.style.top = `${newY - radius}px`;
        
        this.gameArea.appendChild(newBall);
        
        // 添加到球体数组
        this.balls.push({
            element: newBall,
            x: newX,
            y: newY,
            radius: radius,
            type: newType,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
            isResting: false,
            isMerging: false
        });
        
        // 增加分数
        this.score += newType * 10;
        this.updateUI();
        
        // 移除动画类名
        setTimeout(() => {
            newBall.classList.remove('merge-animation');
        }, 500);
    }
    
    checkWinCondition() {
        // 检查是否有虎（类型8）
        for (let i = 0; i < this.balls.length; i++) {
            if (this.balls[i].type === 8) {
                this.winGame();
                return;
            }
        }
    }
    
    winGame() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }
    
    updateNextItem() {
        this.nextItemElement.textContent = this.items[this.nextItemType].name;
        this.nextItemElement.className = this.items[this.nextItemType].className;
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
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
    new TigerMergeGame();
});