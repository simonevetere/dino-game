const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

var playerImage = [];
for (var i = 0; i < 22; i++) {
  playerImage[i] = new Image();
  playerImage[i].src = "img/dino/"+i+".png";
}

var obstacleImage = [];
for (var i = 0; i < 28; i++) {
  obstacleImage[i] = new Image();
  obstacleImage[i].src = "img/chicken/"+i+".png";
}

const meteorImage = new Image();
meteorImage.src = 'img/meteor.png';


setTimeout(() => main(),1000);

function main(){
    const player = {
        x: 50,
        y: 300,
        width: 50,
        height: 50,
        speed: 5,
        dx: 0,
        dy: 0,
        gravity: 0.5,
        jumpPower: -10,
        canJump: true
    };

    const ground = {
        x: 0,
        y: canvas.height - 50,
        width: canvas.width,
        height: 50
    };

    const obstacles = [];
    const meteore = [];

    function drawPlayer() {
        drawAnimatedImage(playerImage, player.x, player.y, 0, 0, player.width, player.height);
    }

    function drawGround() {
        ctx.fillStyle = 'green';
        ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
    }

    function drawObstacle(obstacle) {
        drawAnimatedImage(obstacleImage, obstacle.x-20, obstacle.y-20, 0, 0, obstacle.width, obstacle.height);
    }

    function drawMeteor(meteor) {
        ctx.drawImage(meteorImage, meteor.x - meteor.radius, meteor.y - meteor.radius, meteor.radius * 2, meteor.radius * 2);
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function newPos() {
        player.dy += player.gravity;
        player.y += player.dy;
        player.x += player.dx;

        if (player.y + player.height > ground.y) {
            player.y = ground.y - player.height;
            player.dy = 0;
            player.canJump = true;
        }
    }

    function updateObstacles() {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= obstacles[i].speed;
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
            }
        }
    }

    function createObstacle() {
        const height = Math.random() * (player.height + 20) + 10;
        obstacles.push({
            x: canvas.width,
            y: ground.y - height,
            width: 20,
            height: height,
            speed: 3
        });
    }

    function updateMeteors() {
        for (let i = meteore.length - 1; i >= 0; i--) {
            meteore[i].y += meteore[i].speed;
            if (meteore[i].y - meteore[i].radius > canvas.height) {
                meteore.splice(i, 1);
            }
        }
    }

    function createMeteor() {
        const radius = Math.random() * 10 + 10;
        meteore.push({
            x: Math.random() * canvas.width,
            y: -radius,
            radius: radius,
            speed: 3
        });
    }

    function checkCollision() {
        for (let i = 0; i < obstacles.length; i++) {
            if (
                player.x < obstacles[i].x + obstacles[i].width &&
                player.x + player.width > obstacles[i].x &&
                player.y < obstacles[i].y + obstacles[i].height &&
                player.y + player.height > obstacles[i].y
            ) {
                document.location.reload();
                alert('Game Over');
            }
        }
        for (let i = 0; i < meteore.length; i++) {
            if (
                player.x < meteore[i].x + meteore[i].radius &&
                player.x + player.width > meteore[i].x - meteore[i].radius &&
                player.y < meteore[i].y + meteore[i].radius &&
                player.y + player.height > meteore[i].y - meteore[i].radius
            ) {
                document.location.reload();
                alert('Game Over');
            }
        }
    }

    function update() {
        clear();
        drawPlayer();
        drawGround();
        newPos();
        updateObstacles();
        updateMeteors();
        checkCollision();
        obstacles.forEach(drawObstacle);
        meteore.forEach(drawMeteor);
        requestAnimationFrame(update);
    }

    function moveRight() {
        player.dx = player.speed;
    }

    function moveLeft() {
        player.dx = -player.speed;
    }

    function stop() {
        player.dx = 0;
    }

    function jump() {
        if (player.canJump) {
            player.dy = player.jumpPower;
            player.canJump = false;
        }
    }

    // Event listeners for mouse buttons
    document.getElementById('leftButton').addEventListener('mousedown', moveLeft);
    document.getElementById('leftButton').addEventListener('mouseup', stop);

    document.getElementById('rightButton').addEventListener('mousedown', moveRight);
    document.getElementById('rightButton').addEventListener('mouseup', stop);

    document.getElementById('jumpButton').addEventListener('click', jump);

    // Event listeners for keyboard
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    function keyDown(e) {
        if (e.key === 'ArrowRight' || e.key === 'Right') {
            moveRight();
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            moveLeft();
        } else if (e.key === 'ArrowUp' || e.key === 'Up') {
            jump();
        }
    }

    function keyUp(e) {
        if (
            e.key === 'ArrowRight' ||
            e.key === 'Right' ||
            e.key === 'ArrowLeft' ||
            e.key === 'Left'
        ) {
            stop();
        }
    }

    // Create new obstacles at regular intervals
    setInterval(createObstacle, 2000);

    // Create new meteors at regular intervals
    setInterval(createMeteor, 1500);

    update();
}

function drawAnimatedImage(arr,x,y,angle,factor,changespeed) {
    if (!factor) {
        factor = 1;
    }
    if (!changespeed) {
        changespeed = 1;
    }
    ctx.save();
    if (!!arr[Math.round(Date.now()/changespeed) % arr.length] ) {
        try {
            ctx.drawImage(arr[Math.round(Date.now()/changespeed) % arr.length], x, y, 64, 64);
        } catch {
            ctx.drawImage(arr[1], x, y, 64, 64);
        }
    }
    ctx.restore();
}
let timerElement = document.getElementById('timer');
let startTime = Date.now();

function updateTimer() {
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calcola i secondi trascorsi
    timerElement.textContent = 'record : ' + elapsedTime;
}

setInterval(updateTimer, 100); // Aggiorna il timer ogni secondo
