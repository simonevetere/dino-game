document.body.onselectstart = function() {
    return false;
}

const canvas = document.getElementById('gameCanvas');
var lives = 3;

window.scrollTo(0, document.body.scrollHeight); 

window.addEventListener('scroll', 
    function() {
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight) { 
            document.body.classList.add('no-scroll'); 
        } 
    }
);

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;


const ctx = canvas.getContext('2d');

var playerImage = [];
for (var i = 1; i < 22; i++) {
  playerImage[i] = new Image();
  playerImage[i].src = "img/dino/"+i+".png";
}

var playerRed = [];
for (var i = 1; i < 22; i++) {
  playerRed[i] = new Image();
  playerRed[i].src = "img/dino-red/"+i+".png";
}

var obstacleImage = [];
for (var i = 1; i < 28; i++) {
  obstacleImage[i] = new Image();
  obstacleImage[i].src = "img/chicken/"+i+".png";
}

const meteorImage = new Image();
meteorImage.src = 'img/meteor.png';
let meteorAngle = 0;
let intervalRed = false;


const player = {
    x: 50,
    y: 300,
    width: 50,
    height: 50,
    speed: 2,
    dx: 0,
    dy: 0,
    gravity: 0.1,
    jumpPower: -7,
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
    drawAnimatedImage(playerImage, player.x, player.y, 0, 0, 64, 64);
}

function drawPlayerRed() {
    drawAnimatedImage(playerRed, player.x, player.y, 0, 0, 64, 64);
}

function drawGround() {
    ctx.fillStyle = 'green';
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawObstacle(obstacle) {
    drawAnimatedImage(obstacleImage, obstacle.x-20, obstacle.y-20, 0, 0, 1, obstacle.height, obstacle.width);
}

function drawMeteor(meteor) {
    drawMeteor(meteorImage, meteor.x - meteor.radius, meteor.y - meteor.radius, meteor.radius * 2, meteor.radius * 2);
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
    const height = Math.floor(Math.random() * canvas.height);

    randomFactor = Math.floor(Math.random() * 141) + 50;

    obstacles.push({
        x: canvas.width,
        y: ground.y - height,
        height : randomFactor,
        width : randomFactor,
        speed: 1
    });
}

function updateMeteors() {
    for (let i = meteore.length - 1; i >= 0; i--) {
        meteore[i].y += meteore[i].speed;
        if (meteore[i].y - meteore[i].radius > canvas.height) {
            meteore.splice(i, 1);
        }
    }

    meteorAngle += 0.01;
}

function createMeteor() {
    const radius = Math.random() * 10 + 10;
    meteore.push({
        x: Math.random() * canvas.width,
        y: -radius,
        radius: radius,
        speed: 1
    });
}

var hit = false;
let livesElement = document.getElementById('lives');

function checkCollision() {
    if (!hit) { // Controlla se 'hit' è ancora falso
        for (let i = 0; i < obstacles.length; i++) {
            if (
                player.x < obstacles[i].x + obstacles[i].width &&
                player.x + player.width > obstacles[i].x &&
                player.y < obstacles[i].y + obstacles[i].height &&
                player.y + player.height > obstacles[i].y
            ) { 
                if(lives == 0){
                    window.location.reload();
                }

                livesstring = "";
                lives -= 1;
                hit = true; // Imposta 'hit' a true

                for(let y = 0; y <= lives; y++){
                    livesstring = livesstring + "❤️";
                }
                
                livesElement.textContent = livesstring;

                intervalRed = true;

                setTimeout(() => resetHit(), 1000);

                break;
            }
        }
        
        for (let i = 0; i < meteore.length; i++) {
            if (
                player.x < meteore[i].x + meteore[i].radius &&
                player.x + player.width > meteore[i].x - meteore[i].radius &&
                player.y < meteore[i].y + meteore[i].radius &&
                player.y + player.height > meteore[i].y - meteore[i].radius
            ) { 
                if(lives == 0){
                    window.location.reload();
                }

                livesstring = "";
                lives -= 1;
                hit = true; // Imposta 'hit' a true

                for(let y = 0; y <= lives; y++){
                    livesstring = livesstring + "❤️";
                }
                
                livesElement.textContent = livesstring;
                
                intervalRed = true;

                setTimeout(() => resetHit(), 1000);
                
                break;
            }
        }
    }

}

// Usa questa funzione per resettare 'hit' quando necessario
function resetHit() {
    hit = false;
    intervalRed = false;
}


function update() {
    clear();
    drawGround();
    if(intervalRed){
        drawPlayerRed();
    } else {
        drawPlayer();
    }
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

 document.addEventListener('touchstart', function(event) {
    var touch = event.touches[0];
    var x = touch.clientX;
    var y = touch.clientY;

    console.log(canvas.height / 5);
    console.log(y);

    if(canvas.height - y > (canvas.height / 5)){
        jump();
    }

    if(x < (canvas.width / 2)){
        moveLeft();
    } else {
        moveRight();
    }

}, false);

 document.addEventListener('touchend', function(event) {
    stop()

}, false);

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

function drawAnimatedImage(arr,x,y,angle,factor,changespeed,w = "",h = "") {
    let width = 64;
    let height = 64;

    if(w != ""){
        width = w;
    }

    if(h != ""){
        height = h;
    }

    if (!factor) {
        factor = 1;
    }
    if (!changespeed) {
        changespeed = 0.001;
    }
    ctx.save();

    if (!!arr[Math.round(Date.now()/changespeed) % arr.length] ) {
        try {
            ctx.drawImage(arr[Math.round(Date.now()/changespeed) % arr.length], x, y, width, height);
        } catch {
            ctx.drawImage(arr[arr.length], x, y, width, height);
        }
    } else {
        try {
            ctx.drawImage(arr[1], x, y, width, height);
        } catch {
            console.log("aiutami non capisco perchè va in errore");
        }
        
    }
    ctx.restore();
}

function drawStaticImage(image, x, y, width, height, angle) {
    ctx.save(); // Salva lo stato del contesto

    // Trasla il contesto al centro dell'immagine
    ctx.translate(x + width / 2, y + height / 2);

    // Ruota il contesto
    ctx.rotate(angle);

    // Disegna l'immagine
    ctx.drawImage(image, -width / 2, -height / 2, width, height);

    ctx.restore(); // Ripristina lo stato del contesto
}

// Usalo nella funzione drawMeteor
function drawMeteor(meteor) {
    var angle = meteorAngle; // Genera un angolo casuale per la rotazione
    drawStaticImage(meteorImage, meteor.x - meteor.radius, meteor.y - meteor.radius, meteor.radius * 2, meteor.radius * 2, angle);
}

let timerElement = document.getElementById('timer');
let startTime = Date.now();
let lastUpdateTime = 0;

function updateTimer() {
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calcola i secondi trascorsi
    timerElement.textContent = 'record : ' + elapsedTime;

    // Check if a minute has passed since the last update (or since startTime if no previous update)
    if (elapsedTime - lastUpdateTime >= 13) {
        lastUpdateTime = elapsedTime; // Update lastUpdateTime for future checks

        // Create new obstacles at regular intervals
        setInterval(createObstacle, 1500);

        // Create new meteors at regular intervals
        setInterval(createMeteor, 1000);
    }
}

setInterval(updateTimer, 100); // Aggiorna il timer ogni secondo
