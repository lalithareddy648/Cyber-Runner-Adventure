const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-btn");

let player;
let obstacles = [];
let collectibles = [];
let score = 0;
let gameInterval;
let obstacleInterval;
let collectibleInterval;
let gameSpeed = 3;
let isJumping = false;
let jumpHeight = 150;
let jumpSpeed = 5;

const beginBtn = document.getElementById("begin-btn");
const instructionsOverlay = document.getElementById("instructions-overlay");

beginBtn.onclick = () => {
    instructionsOverlay.style.display = "none";
    startGame();
};

// Start game
startBtn.onclick = startGame;

function startGame() {
    startBtn.disabled = true;
    score = 0;
    gameSpeed = 3;
    scoreEl.innerText = "Score: " + score;
    messageEl.innerText = "";
    obstacles = [];
    collectibles = [];
    gameArea.innerHTML = "";

    // Create player
    player = document.createElement("div");
    player.classList.add("player");
    player.style.bottom = "0px";
    player.style.left = "50px";
    gameArea.appendChild(player);

    // Start game loop
    gameInterval = requestAnimationFrame(updateGame);

    // Spawn obstacles
    obstacleInterval = setInterval(spawnObstacle, 2000);

    // Spawn collectibles
    collectibleInterval = setInterval(spawnCollectible, 3000);
}

// Player movement
document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp" && !isJumping) {
        jump();
    }
});

function jump() {
    isJumping = true;
    let jumpCount = 0;
    const jumpInterval = setInterval(() => {
        if (jumpCount < jumpHeight / jumpSpeed) {
            let bottom = parseInt(player.style.bottom);
            player.style.bottom = (bottom + jumpSpeed) + "px";
            jumpCount++;
        } else {
            clearInterval(jumpInterval);
            fall();
        }
    }, 20);
}

function fall() {
    const fallInterval = setInterval(() => {
        let bottom = parseInt(player.style.bottom);
        if (bottom > 0) {
            player.style.bottom = Math.max(bottom - jumpSpeed, 0) + "px";
        } else {
            clearInterval(fallInterval);
            isJumping = false;
        }
    }, 20);
}

// Spawn obstacles
function spawnObstacle() {
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");
    obstacle.style.right = "0px"; // start from right
    obstacle.style.bottom = "0px";
    gameArea.appendChild(obstacle);
    obstacles.push(obstacle);
}

// Spawn collectibles
function spawnCollectible() {
    const collectible = document.createElement("div");
    collectible.classList.add("collectible");
    collectible.style.right = "0px"; // start from right
    collectible.style.bottom = Math.floor(Math.random() * (gameArea.clientHeight - 50)) + "px";
    gameArea.appendChild(collectible);
    collectibles.push(collectible);
}

// Game loop
function updateGame() {
    // Move obstacles
    obstacles.forEach((obs, index) => {
        let right = parseInt(obs.style.right);
        obs.style.right = right + gameSpeed + "px"; // moving left

        // Collision detection
        if (isColliding(player, obs)) {
            endGame();
        }

        // Remove offscreen
        if (right > gameArea.clientWidth) {
            obs.remove();
            obstacles.splice(index, 1);
            score += 5;
            scoreEl.innerText = "Score: " + score;
        }
    });

    // Move collectibles
    collectibles.forEach((col, index) => {
        let right = parseInt(col.style.right);
        col.style.right = right + gameSpeed + "px"; // moving left

        // Collect
        if (isColliding(player, col)) {
            score += 10;
            scoreEl.innerText = "Score: " + score;
            col.remove();
            collectibles.splice(index, 1);
        }

        // Remove offscreen
        if (right > gameArea.clientWidth) {
            col.remove();
            collectibles.splice(index, 1);
        }
    });

    // Increase speed gradually
    gameSpeed += 0.002;

    gameInterval = requestAnimationFrame(updateGame);
}

// Collision detection
function isColliding(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return !(
        aRect.top > bRect.bottom ||
        aRect.bottom < bRect.top ||
        aRect.right < bRect.left ||
        aRect.left > bRect.right
    );
}

// End game
function endGame() {
    cancelAnimationFrame(gameInterval);
    clearInterval(obstacleInterval);
    clearInterval(collectibleInterval);
    messageEl.innerText = "💀 Game Over! Final Score: " + score;
    startBtn.disabled = false;
}
