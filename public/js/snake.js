// ===================================
// SNAKE GAME CONSTANTS
// ===================================

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 200; // Ralenti de 150ms à 200ms pour plus de contrôle

// ===================================
// SNAKE GAME STATE
// ===================================

let snake = [{ x: 10, y: 10 }];
let direction = 'RIGHT';
let food = { x: 15, y: 15 };
let gameOver = false;
let score = 0;
let isPlaying = false;
let gameInterval = null;
let canvas = null;
let ctx = null;
let keyboardHandler = null;

// ===================================
// SNAKE GAME INITIALIZATION
// ===================================

function initSnakeGame() {
    // Reset game state
    snake = [{ x: 10, y: 10 }];
    direction = 'RIGHT';
    food = generateFood();
    gameOver = false;
    score = 0;
    isPlaying = false;

    // Create game container HTML
    const container = document.getElementById('snake-container');
    container.innerHTML = `
        <div class="snake-header">
            <div>Score: <span id="snake-score">0</span></div>
            <div class="snake-info" id="snake-info">Appuyez sur une flèche pour commencer</div>
        </div>
        <div style="position: relative;">
            <canvas id="snake-canvas" class="snake-canvas" width="${GRID_SIZE * CELL_SIZE}" height="${GRID_SIZE * CELL_SIZE}"></canvas>
        </div>
        <div class="snake-controls">
            Utilisez les flèches du clavier pour contrôler le serpent
        </div>
    `;

    // Get canvas
    canvas = document.getElementById('snake-canvas');
    ctx = canvas.getContext('2d');

    // Draw initial state
    drawGame();

    // Remove old keyboard listener if exists
    if (keyboardHandler) {
        document.removeEventListener('keydown', keyboardHandler);
    }

    // Create and add new keyboard listener
    keyboardHandler = handleKeyPress;
    document.addEventListener('keydown', keyboardHandler);

    console.log('Snake game initialized, keyboard listener attached');

    // Start game loop
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

function stopSnakeGame() {
    console.log('Stopping snake game');
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    if (keyboardHandler) {
        document.removeEventListener('keydown', keyboardHandler);
        keyboardHandler = null;
    }
}

// ===================================
// GAME LOGIC
// ===================================

function generateFood() {
    return {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    };
}

function handleKeyPress(event) {
    // Only handle arrow keys for snake game
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
    }

    console.log('Arrow key pressed:', event.key, 'isPlaying:', isPlaying, 'gameOver:', gameOver);

    // Prevent default scrolling behavior
    event.preventDefault();
    event.stopPropagation();

    if (!isPlaying && !gameOver) {
        console.log('Starting game!');
        isPlaying = true;
        const infoElement = document.getElementById('snake-info');
        if (infoElement) {
            infoElement.style.display = 'none';
        }
    }

    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'DOWN') {
                direction = 'UP';
                console.log('Direction changed to UP');
            }
            break;
        case 'ArrowDown':
            if (direction !== 'UP') {
                direction = 'DOWN';
                console.log('Direction changed to DOWN');
            }
            break;
        case 'ArrowLeft':
            if (direction !== 'RIGHT') {
                direction = 'LEFT';
                console.log('Direction changed to LEFT');
            }
            break;
        case 'ArrowRight':
            if (direction !== 'LEFT') {
                direction = 'RIGHT';
                console.log('Direction changed to RIGHT');
            }
            break;
    }
}

function gameLoop() {
    if (gameOver || !isPlaying) return;

    moveSnake();
    drawGame();
}

function moveSnake() {
    const head = { ...snake[0] };

    // Move head based on direction
    switch (direction) {
        case 'UP':
            head.y--;
            break;
        case 'DOWN':
            head.y++;
            break;
        case 'LEFT':
            head.x--;
            break;
        case 'RIGHT':
            head.x++;
            break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('snake-score').textContent = score;
        food = generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

function endGame() {
    gameOver = true;
    isPlaying = false;
    showGameOver();
}

function showGameOver() {
    const canvasContainer = canvas.parentElement;

    const overlay = document.createElement('div');
    overlay.className = 'snake-gameover';
    overlay.innerHTML = `
        <div class="gameover-text">Game Over!</div>
        <div class="gameover-score">Score: ${score}</div>
        <button class="replay-btn" id="replay-btn">Rejouer</button>
    `;

    canvasContainer.appendChild(overlay);

    // Attach replay button handler
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', resetSnakeGame);
    }
}

function resetSnakeGame() {
    // Remove game over overlay
    const overlay = document.querySelector('.snake-gameover');
    if (overlay) overlay.remove();

    // Reset game
    snake = [{ x: 10, y: 10 }];
    direction = 'RIGHT';
    food = generateFood();
    gameOver = false;
    score = 0;
    isPlaying = false;
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-info').style.display = 'block';
    document.getElementById('snake-info').textContent = 'Appuyez sur une flèche pour commencer';

    drawGame();
}

// ===================================
// DRAWING FUNCTIONS
// ===================================

function drawGame() {
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#22c55e' : '#4ade80';
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        (CELL_SIZE - 4) / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}
