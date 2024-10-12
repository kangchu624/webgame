const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const playerImage = new Image();
playerImage.src = 'https://opengameart.org/sites/default/files/pitrizzo-SpaceShip-gpl3-opengameart-96x96.png'; 

const enemyImage = new Image();
enemyImage.src = 'https://opengameart.org/sites/default/files/ship_1.png'; 

const bossImage = new Image();
bossImage.src = 'https://opengameart.org/sites/default/files/ship2_0.png'; 

// Player spaceship
const player = {
  x: canvas.width / 2 - 32,
  y: canvas.height - 64,
  width: 64,
  height: 64,
  speed: 5,
  hp: 3 // Player's health
};

// Game variables
let enemies = [];
let enemyMissiles = []; // Missiles shot by enemies
let missiles = [];
let missileSpeed = 8;
let enemyMissileSpeed = 5;
let score = 0;
let level = 1;
let enemiesPerLevel = 5; // Start with 5 enemies in level 1
let bossHealth = 20; // Boss health

// Boss-specific variables
let bossAppearanceInterval = 5; // Boss appears every 5 levels
let isBossLevel = (level % bossAppearanceInterval === 0); // Check if it's a boss level
let boss = null; // Will store the boss object

// Event listeners for controls
let leftPressed = false;
let rightPressed = false;
let spacePressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
  if (e.key === 'ArrowLeft') {
    leftPressed = true;
  } else if (e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === ' ') {
    spacePressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === 'ArrowLeft') {
    leftPressed = false;
  } else if (e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === ' ') {
    spacePressed = false;
  }
}

// Function to draw a rectangle (used for missiles)
function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

// Function to check for collisions
function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Function to draw an image with optional rotation
function drawImage(image, x, y, width, height, rotation = 0) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotation * Math.PI / 180); // Convert degrees to radians
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

// Function to create a new enemy
function createEnemy() {
  let enemySpeed = 1 + level * 0.2; // Increase speed every level
  let enemyShootingProbability = 0.01 + level * 0.005; // Increase shooting probability

  return {
    x: Math.random() * (canvas.width - 32),
    y: Math.random() * 100,
    width: 32,
    height: 32,
    speed: enemySpeed,
    canShoot: Math.random() < enemyShootingProbability, // Determine if enemy can shoot
    rotation: 180 // Add rotation property to enemy object (in degrees)
  };
}

// Function to create the boss
function createBoss() {
  return {
    x: canvas.width / 2 - 64, // Boss starts in the middle
    y: 50,
    width: 128,
    height: 128,
    speed: 2,
    hp: bossHealth,
    canShoot: true,
    dx: 2, // Horizontal speed component
    dy: 2,  // Vertical speed component
    rotation: 0 // Add rotation property to boss object (in degrees)
  };
}

// Function to start a new level
function startNewLevel() {
  level++;
  isBossLevel = (level % bossAppearanceInterval === 0);

  if (isBossLevel) {
    // Boss level!
    boss = createBoss();
    enemies = [boss]; // Only the boss on this level
  } else {
    // Regular level
    enemiesPerLevel = Math.floor(5 + level * 0.5);
    enemies = [];
    for (let i = 0; i < enemiesPerLevel; i++) {
      enemies.push(createEnemy());
    }
  }
}

// Function to handle game over
function gameOver() {
  // Stop the game loop 
  clearInterval(gameLoop);
  alert("Game Over! Your final score: " + score);
}

// Function to update game objects
function update() {
    // Move player
    if (leftPressed && player.x > 0) {
      player.x -= player.speed;
    }
    if (rightPressed && player.x < canvas.width - player.width) {
      player.x += player.speed;
    }
  
    // Shoot missiles
    if (spacePressed) {
      missiles.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10
      });
      spacePressed = false;
    }
  
    // Move player missiles
    for (let i = missiles.length - 1; i >= 0; i--) {
      missiles[i].y -= missileSpeed;
  
      if (missiles[i].y < 0) {
        missiles.splice(i, 1);
      }
    }
  
    // Move enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
  
      if (enemy === boss) {
        // Boss movement (bouncing off edges)
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
  
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
          enemy.dx = -enemy.dx; // Reverse horizontal direction
        }
        if (enemy.y + enemy.height > canvas.height / 2 || enemy.y < 0) {
          enemy.dy = -enemy.dy; // Reverse vertical direction
        }
      } else {
        // Regular enemy movement
        enemy.y += enemy.speed;
  
        if (enemy.y > canvas.height) {
          enemy.y = 0;
          enemy.x = Math.random() * (canvas.width - 32);
        }
      }
  
      // Enemy shooting logic
      if (enemy.canShoot && Math.random() < 0.02) { // 2% chance to shoot per frame
        enemyMissiles.push({
          x: enemy.x + enemy.width / 2 - 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 10
        });
      }
  
      // Check for collisions (enemies vs. player)
      if (checkCollision(enemy, player)) {
        player.hp--;
        enemies.splice(i, 1); // Remove the enemy after collision
  
        if (player.hp <= 0) {
          gameOver();
        }
      }
    }
  
    // Move enemy missiles
    for (let i = enemyMissiles.length - 1; i >= 0; i--) {
      enemyMissiles[i].y += enemyMissileSpeed;
  
      if (enemyMissiles[i].y > canvas.height) {
        enemyMissiles.splice(i, 1);
      }
    }
  
    // Check for collisions (player missiles vs. enemies)
    for (let i = missiles.length - 1; i >= 0; i--) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (checkCollision(missiles[i], enemies[j])) {
          missiles.splice(i, 1);
  
          // Check if the current enemy is the boss
          if (enemies[j] === boss) {
            boss.hp--; // Decrease boss health
            if (boss.hp <= 0) {
              enemies.splice(j, 1);
              score += 100; // Bonus for defeating the boss
            }
          } else {
            enemies.splice(j, 1);
            score++;
          }
  
          break;
        }
      }
    }
  
    // Check for collisions (enemy missiles vs. player)
    for (let i = enemyMissiles.length - 1; i >= 0; i--) {
      if (checkCollision(enemyMissiles[i], player)) {
        enemyMissiles.splice(i, 1);
        player.hp--;
  
        if (player.hp <= 0) {
          gameOver();
        }
      }
    }

  // Check if level is complete
  if (enemies.length === 0) { // Only check if there are no enemies left
    startNewLevel();
  }

  // Draw everything
  draw();

  // Request the next frame
  requestAnimationFrame(update);
}

// Function to draw game objects
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  drawImage(playerImage, player.x, player.y, player.width, player.height);

  // Draw enemies
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i] === boss) {
      drawImage(bossImage, boss.x, boss.y, boss.width, boss.height, boss.rotation);
      // Draw boss health bar
      let healthBarWidth = boss.width * (boss.hp / bossHealth);
      ctx.fillStyle = 'green';
      ctx.fillRect(boss.x, boss.y - 10, healthBarWidth, 5);
    } else {
      drawImage(enemyImage, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height, enemies[i].rotation);
    }
  }

  // Draw player missiles 
  for (let i = 0; i < missiles.length; i++) {
    drawRect(missiles[i].x, missiles[i].y, missiles[i].width, missiles[i].height, 'white');
  }

  // Draw enemy missiles 
  for (let i = 0; i < enemyMissiles.length; i++) {
    drawRect(enemyMissiles[i].x, enemyMissiles[i].y, enemyMissiles[i].width, enemyMissiles[i].height, 'yellow');
  }

  // Draw score, level, and player health
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
  ctx.fillText('Level: ' + level, canvas.width - 80, 20);
  ctx.fillText('HP: ' + player.hp, canvas.width / 2 - 30, 20); // Display player health
}

// Start the game loop
startNewLevel(); // Start the first level
update();
