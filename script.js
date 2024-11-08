document.body.onselectstart = function() {
    return false;
}

const canvas = document.getElementById('gameCanvas');
var lives = 3;

const fireballs = [];
let powerupActive = false;
let powerupStartTime;
let fireballRadius = 5;
let fireballSpeed = 20;
let canShoot = true; // Flag to control shooting cooldown

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
let speedHard = 1;
let playerSpeed = 2;
let points = 0;

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
for (var i = 1; i < 64; i++) {
  obstacleImage[i] = new Image();
  obstacleImage[i].src = "img/chicken/"+i+".png";
}

var fireballImage = [];
for (var i = 1; i < 4; i++) {
  fireballImage[i] = new Image();
  fireballImage[i].src = "img/fireball/"+i+".png";
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
    speed: playerSpeed,
    dx: 0,
    dy: 0,
    gravity: 0.5,
    jumpPower: -22,
    canJump: true
};

const ground = {
    x: 0,
    y: canvas.height - 70,
    width: canvas.width,
    height: 70
};

const obstacles = [];
const meteore = [];

function drawPlayer() {
    drawAnimatedImage(playerImage, player.x, player.y, 0, 0, 64, 64);
}

function drawPlayerRed() {
    drawAnimatedImage(playerRed, player.x, player.y, 0, 0, 64, 64);
}

const grassImage = new Image();
grassImage.src = 'img/prato.png';

function drawGround(){
    const pattern = ctx.createPattern(grassImage, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
};

function drawObstacle(obstacle) {
    drawAnimatedImage(obstacleImage, obstacle.x, obstacle.y, 0, 0, 1, obstacle.height, obstacle.width);
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

        obstacles[i].y -= obstacles[i].direction;

        // Cambia direzione ogni tot frame
        if (obstacles[i].x % 50 === 0) {
            obstacles[i].direction *= -1;
        }
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function createObstacle() {

    randomFactor = Math.floor(Math.random() * canvas.height) + 70;

    obstacles.push({
        x: canvas.width,
        y: randomFactor,
        height : 64,
        width : 64,
        direction : Math.random() > 0.5 ? 1 : -1,
        speed: speedHard
    });
}

function updateMeteors() {

    for (let i = meteore.length - 1; i >= 0; i--) {

        meteore[i].x += Math.cos(meteore[i].angle) * meteore[i].speed;
        meteore[i].y += Math.sin(meteore[i].angle) * meteore[i].speed;

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
        angle: Math.random() * Math.PI,
        speed: speedHard
    });
}

let canShoottimer = 100;
function createFireball() {
  if (canShoot) {
    fireballs.push({
      x: player.x + player.width / 2 - (((32*fireballRadius)/5)/2),
      y: player.y + player.height + ((32*fireballRadius)/5),
      radius: fireballRadius,
      width: (32*fireballRadius)/5,
      height: (32*fireballRadius)/5
    });
    canShoot = false;
    setTimeout(() => { canShoot = true }, canShoottimer); // Cooldown for shooting
  }
}

function drawFireball(fireball) {
  drawAnimatedImage(fireballImage, fireball.x, fireball.y - 16, fireball.radius, 0, 2 * Math.PI, fireball.width, fireball.height);
}

function updateFireballs() {

    // Se il potere è attivo, spara automaticamente palle di fuoco
    if (powerupActive) {

        createFireball();

        canShoottimer = 50;

        // Controlla se il potere è scaduto
        if (Date.now() - powerupStartTime > 10000) { // 10000 millisecondi = 10 secondi
            powerupActive = false;
        }
    }

    for (let i = fireballs.length - 1; i >= 0; i--) {
        fireballs[i].y -= fireballSpeed;

        // Check collision with meteors
        for (let j = meteore.length - 1; j >= 0; j--) {
            const distanceX = fireballs[i].x - meteore[j].x;
            const distanceY = fireballs[i].y - meteore[j].y;
            const combinedRadius = fireballs[i].radius * 1.5 + meteore[j].radius;

            if (distanceX < combinedRadius && distanceX > -combinedRadius &&
                distanceY < combinedRadius && distanceY > -combinedRadius) {
                meteore.splice(j, 1);
                
                fireballs.splice(i, 1);
                
                break; // Only destroy one meteor per fireball
            }
        }

        try {
        // Check collision with obstacles
        for (let j = obstacles.length - 1; j >= 0; j--) {
          const distanceX = fireballs[i].x - obstacles[j].x;
          const distanceY = fireballs[i].y - obstacles[j].y;
          const combinedRadius = fireballs[i].radius + obstacles[j].width / 2;

          if (distanceX * distanceX + distanceY * distanceY < combinedRadius * combinedRadius) {
            obstacles.splice(j, 1);

            fireballs.splice(i, 1);
            
            const randomReward = Math.floor(Math.random() * 3);

            switch (randomReward) {
              case 0:
                activatePowerup();
                break;
              case 1:
                addlife();
                break;
              case 2:
                immunita();
                break;
            }
          }
        }

        // Remove fireballs that go off-screen
        if (fireballs[i].y < 0) {
          fireballs.splice(i, 1);
        }
        } catch {
            console.log("già eliminata");
        }
    }
}
var hit = false;
let livesElement = document.getElementById('lives');

setInterval(() => resetHit(), 1000);

function checkCollision() {
    
    for (let i = 0; i < obstacles.length; i++) {
        if (
            player.x < obstacles[i].x + obstacles[i].width &&
            player.x + player.width > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y
        ) { 
            obstacles.splice(i, 1);

            points++;

            timerElement.textContent = "record : " + points;

            break;
        }
    }
        

    if (!hit) { // Controlla se 'hit' è ancora falso
        for (let i = 0; i < meteore.length; i++) {
            if (
                player.x < meteore[i].x + meteore[i].radius &&
                player.x + player.width > meteore[i].x - meteore[i].radius &&
                player.y < meteore[i].y + meteore[i].radius &&
                player.y + player.height > meteore[i].y - meteore[i].radius
            ) { 
                meteore.splice(i, 1);

                if(lives == 0){
                    window.location.reload();
                }

                livesstring = "";

                if(!ismega){
                    lives -= 1;
                }
                hit = true; // Imposta 'hit' a true

                for(let y = 1; y <= lives; y++){
                    livesstring = livesstring + "❤️";
                }
                
                livesElement.textContent = livesstring;
                
                intervalRed = true;
                
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
    fireballs.forEach(drawFireball);
    updateFireballs();
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

function goDown() {
    player.dy = - player.jumpPower;
    player.canJump = false;
}


// Event listeners for touch
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchend', handleTouchEnd);

function handleTouchStart(event) {
    var touch = event.touches[0];
    var x = touch.clientX;
    var y = touch.clientY;

    if (canvas.height - y > (canvas.height / 5)) {
        keyDown({ key: 'ArrowUp' });
    } else if (canvas.height - y < (canvas.height / 5)) {
        keyDown({ key: 'ArrowDown' });
    }

    if (x < (canvas.width / 2)) {
        keyDown({ key: 'ArrowLeft' });
    } else {
        keyDown({ key: 'ArrowRight' });
    }
    
    if (x > (canvas.width / 2) && y < (canvas.height / 5)) {
        keyDown({ key: ' ' });
    }
}

function handleTouchEnd(event) {
    keyUp({ key: 'ArrowRight' });
    keyUp({ key: 'ArrowLeft' });
    keyUp({ key: 'ArrowUp' });
    keyUp({ key: 'ArrowDown' });
    keyUp({ key: ' ' });
}


// Event listeners for keyboard
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a') {
        moveLeft();
    } else if (e.key === 'ArrowUp' || e.key === 'Up' || e.key === 'w') {
        jump();
    } else if (e.key === 'ArrowDown' || e.key === 'Down' || e.key === 's') {
        goDown();
    } else if (e.key === ' ' && canShoot) {
        createFireball();
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left' ||
        e.key === 'a' ||
        e.key === 'd' 
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
            console.log("aiutami non capisco perchè va in errore");
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

    // Check if a minute has passed since the last update (or since startTime if no previous update)
    if (elapsedTime - lastUpdateTime >= 13) {
        lastUpdateTime = elapsedTime; // Update lastUpdateTime for future checks
        speedHard++;
        player.speed++;
        // Create new meteors at regular intervals
        setInterval(createMeteor, 1500);
    }
}

// Funzione per attivare il potere
function activatePowerup() {
    showNotification('10 sec Power Up!', 1000);

    powerupActive = true;
    powerupStartTime = Date.now();
}

function addlife() {
    showNotification('+1 Lives', 1000);
    livesstring = "";
    lives++;

    for(let y = 1; y <= lives; y++){
        livesstring = livesstring + "❤️";
    }
    
    livesElement.textContent = livesstring;

}

let lastfireballtimeot = 0;
let ismega = false;

function immunita() {
    showNotification('10 sec Immunity!', 1000);

    ismega = true;

    clearTimeout(lastfireballtimeot);

    lastfireballtimeot = setTimeout(() => { fireballRadius = 5; ismega = false; }, 10000); // Cooldown for shooting

}

function showNotification(message, duration) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.display = 'block';
    
    setTimeout(function() {
        notification.style.display = 'none';
    }, duration);
}

setInterval(updateTimer, 100); // Aggiorna il timer ogni secondo
setInterval(activatePowerup(), 10000); // Aggiorna il timer ogni secondo