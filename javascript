let player, obstacle, coin, train, powerBox;
let score = 0;
let speed = 5;
let lane = 1;
let lanesY = [240, 160, 80];
let running = false;
let paused = false;

let magnetActive = false;
let shieldActive = false;
let hoverActive = false;

// SELECT CHARACTER
let selectedChar = 1;

document.querySelectorAll(".char").forEach(c => {
    c.addEventListener("click", () => {
        selectedChar = c.dataset.id;
        document.querySelectorAll(".char").forEach(x => x.style.border = "");
        c.style.border = "4px solid yellow";
    });
});

function startGame() {
    document.getElementById("characterSelect").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    document.getElementById("score").classList.remove("hidden");

    player = document.getElementById("player");
    obstacle = document.getElementById("obstacle");
    coin = document.getElementById("coin");
    train = document.getElementById("train");
    powerBox = document.getElementById("power");

    player.style.backgroundImage = `url('assets/run-sprite.png')`;
    player.classList.add("running");
    player.style.bottom = lanesY[lane] + "px";

    document.getElementById("bgm").play();

    running = true;
    loop();
}

/* ------------------ MOVEMENT ------------------ */
function moveUp() {
    if (lane > 0) lane--;
    updatePlayerLane();
}
function moveDown() {
    if (lane < 2) lane++;
    updatePlayerLane();
}

function updatePlayerLane() {
    player.style.bottom = lanesY[lane] + "px";
    player.style.transform = `translateZ(${lane * 30}px) scale(${1 + lane * 0.1})`;
}

/* ------------------ KEYBOARD ------------------ */
document.addEventListener("keydown", e => {
    if (e.code === "ArrowUp") moveUp();
    if (e.code === "ArrowDown") moveDown();
    if (e.code === "KeyP") togglePause();
});

/* ------------------ PAUSE ------------------ */
function togglePause() {
    if (!running) return;
    paused = !paused;

    if (paused) {
        document.getElementById("pauseMenu").classList.remove("hidden");
    } else {
        document.getElementById("pauseMenu").classList.add("hidden");
        loop();
    }
}

function resumeGame() {
    paused = false;
    document.getElementById("pauseMenu").classList.add("hidden");
    loop();
}

/* ------------------ GAME LOOP ------------------ */
function loop() {
    if (paused) return;

    score += 0.1;
    document.getElementById("score").innerText = "Score: " + Math.floor(score);

    moveElement(obstacle);
    moveElement(train);
    moveElement(coin);
    moveElement(powerBox);

    checkCoin();
    checkPowerup();
    checkCollision();

    speed += 0.003;

    requestAnimationFrame(loop);
}

/* ------------------ ELEMENT LOOP MOTION ------------------ */
function moveElement(el) {
    let x = parseInt(el.style.right || -200);
    x += speed;
    el.style.right = x + "px";

    if (x > 700) {
        el.style.right = "-200px";
        el.style.bottom = lanesY[Math.floor(Math.random() * 3)] + "px";
    }
}

/* ------------------ COLLISIONS ------------------ */
function checkCollision() {
    let obsX = obstacle.offsetLeft;
    let trainX = train.offsetLeft;
    let playerX = player.offsetLeft;

    if (isCollision(player, obstacle) || isCollision(player, train)) {
        if (shieldActive || hoverActive) {
            shieldActive = false;
            hoverActive = false;
            return;
        }
        document.getElementById("crashSound").play();
        alert("💥 CRASH! Score: " + Math.floor(score));
        location.reload();
    }
}

function isCollision(a, b) {
    let r1 = a.getBoundingClientRect();
    let r2 = b.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

/* ------------------ COINS ------------------ */
function checkCoin() {
    if (isCollision(player, coin)) {
        score += 10;
        document.getElementById("coinSound").play();
        coin.style.right = "-300px";
    }

    // MAGNET EFFECT
    if (magnetActive) {
        let coinX = coin.offsetLeft;
        if (coinX < 200) {
            coin.style.bottom = lanesY[lane] + 40 + "px";
        }
    }
}

/* ------------------ POWER UPS ------------------ */
function checkPowerup() {
    if (isCollision(player, powerBox)) {
        document.getElementById("powerSound").play();

        let type = Math.floor(Math.random() * 3);

        if (type === 0) magnetActive = true;       // Magnet
        if (type === 1) shieldActive = true;       // Shield
        if (type === 2) hoverActive = true;        // Hoverboard

        powerBox.style.right = "-300px";

        setTimeout(() => {
            magnetActive = false;
            shieldActive = false;
        }, 6000);
    }
}
