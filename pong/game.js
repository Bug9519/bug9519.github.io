const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 14;
const PADDLE_SPEED = 6;
const AI_SPEED = 4;

let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() * 2 - 1);

let paused = false;
let pauseIndicator = document.getElementById('pause-indicator');

let playerScore = 0;
let aiScore = 0;

// Mouse control for player paddle
canvas.addEventListener('mousemove', e => {
	if (paused) return;
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - PADDLE_HEIGHT) playerY = canvas.height - PADDLE_HEIGHT;
});

// --- Pause toggle with "p" ---
document.addEventListener('keydown', function(e) {
    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
        pauseIndicator.style.display = paused ? 'block' : 'none';
        if (!paused) requestAnimationFrame(gameLoop);
    }
});

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Net
    ctx.strokeStyle = "#44ff99";
    ctx.beginPath();
    for (let i = 0; i < canvas.height; i += 30) {
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 15);
    }
    ctx.stroke();

    // Scores
    ctx.font = "40px monospace";
    ctx.fillStyle = "#44ff99";
    ctx.fillText(playerScore, canvas.width / 2 - 60, 50);
    ctx.fillText(aiScore, canvas.width / 2 + 30, 50);

    // Paddles
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(10, playerY, PADDLE_WIDTH, PADDLE_HEIGHT); // Player
    ctx.fillRect(canvas.width - 10 - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT); // AI

    // Ball
    ctx.beginPath();
    ctx.arc(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#44ff99";
    ctx.fill();
}

// Move AI paddle
function moveAI() {
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    let ballCenter = ballY + BALL_SIZE / 2;
    if (ballCenter < aiCenter - 10) {
        aiY -= AI_SPEED;
    } else if (ballCenter > aiCenter + 10) {
        aiY += AI_SPEED;
    }
    // Clamp
    if (aiY < 0) aiY = 0;
    if (aiY > canvas.height - PADDLE_HEIGHT) aiY = canvas.height - PADDLE_HEIGHT;
}

// Move ball & handle collision
function moveBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top/Bottom wall collision
    if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
        ballSpeedY = -ballSpeedY;
        ballY = Math.max(0, Math.min(ballY, canvas.height - BALL_SIZE));
    }

    // Left paddle collision
    if (
        ballX <= 10 + PADDLE_WIDTH &&
        ballY + BALL_SIZE >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT
    ) {
        ballSpeedX = -ballSpeedX * 1.05;
        let hitPos = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ballSpeedY = hitPos * 0.2;
        ballX = 10 + PADDLE_WIDTH;
    }

    // Right paddle collision (AI)
    if (
        ballX + BALL_SIZE >= canvas.width - 10 - PADDLE_WIDTH &&
        ballY + BALL_SIZE >= aiY &&
        ballY <= aiY + PADDLE_HEIGHT
    ) {
        ballSpeedX = -ballSpeedX * 1.05;
        let hitPos = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ballSpeedY = hitPos * 0.2;
        ballX = canvas.width - 10 - PADDLE_WIDTH - BALL_SIZE;
    }

    // Score
    if (ballX < 0) {
        aiScore++;
        resetBall();
    }
    if (ballX > canvas.width) {
        playerScore++;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ballX = canvas.width / 2 - BALL_SIZE / 2;
    ballY = canvas.height / 2 - BALL_SIZE / 2;
    ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() * 2 - 1);
}

// Main game loop
function gameLoop() {
	if (paused) return;
	
    moveAI();
    moveBall();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();