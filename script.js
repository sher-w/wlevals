const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');

// Maze configuration
const GRID_SIZE = 16;
const CELL_SIZE = canvas.width / GRID_SIZE;
const WALL_WIDTH = 4;

// Player
const player = {
  x: 1.5 * CELL_SIZE,
  y: 1.5 * CELL_SIZE,
  radius: Math.max(6, Math.floor(CELL_SIZE * 0.18)),
  speed: Math.max(3, Math.floor(CELL_SIZE / 18))
};

// Goal will be placed on a vertical "slot" (wall above and below)
let goal = {
  x: 0,
  y: 0,
  radius: Math.max(8, Math.floor(CELL_SIZE * 0.22))
};

// Win flag to ensure redirect runs once
let won = false;

// Find a vertical slot (path cell with walls above and below) preferring bottom area
function placeGoalOnSlot() {
  // Prefer the known bottom-right slot (col 14, row 13) if it's a path
  if (GRID_SIZE > 14 && maze[13] && maze[13][14] === 0) {
    goal.x = (14 + 0.5) * CELL_SIZE;
    goal.y = (13 + 0.5) * CELL_SIZE;
    goal.radius = Math.max(6, Math.floor(CELL_SIZE * 0.22));
    return;
  }

  // fallback: search bottom-up, right-to-left to find a suitable slot near the right side
  for (let row = GRID_SIZE - 2; row >= 1; row--) { // bottom-up
    for (let col = GRID_SIZE - 2; col >= 1; col--) {
      if (maze[row][col] === 0 && maze[row - 1][col] === 1 && maze[row + 1][col] === 1) {
        goal.x = (col + 0.5) * CELL_SIZE;
        goal.y = (row + 0.5) * CELL_SIZE;
        goal.radius = Math.max(6, Math.floor(CELL_SIZE * 0.22));
        return;
      }
    }
  }
  // fallback: bottom-right-ish cell
  goal.x = 13.5 * CELL_SIZE;
  goal.y = 13.5 * CELL_SIZE;
}

// Maze layout (1 = wall, 0 = path)
const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// place goal after maze is defined
placeGoalOnSlot();

// Image assets (optional). If the files `chara.png` and `goal.png` exist in the folder,
// they will be used; otherwise we draw circles as before.
const playerImg = new Image();
let playerImgLoaded = false;
playerImg.onload = () => { playerImgLoaded = true; };
playerImg.onerror = () => { playerImgLoaded = false; };
playerImg.src = 'chara.png';

const goalImg = new Image();
let goalImgLoaded = false;
goalImg.onload = () => { goalImgLoaded = true; };
goalImg.onerror = () => { goalImgLoaded = false; };
goalImg.src = 'goal.png';

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Draw maze with thickened lines
function drawMaze() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000000';
  ctx.lineWidth = WALL_WIDTH;
  ctx.strokeStyle = '#000000';

  // Draw walls
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (maze[row][col] === 1) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

// Draw goal
function drawGoal() {
  if (goalImgLoaded) {
    const size = goal.radius * 2 * 2.5;
    ctx.drawImage(goalImg, goal.x - size / 2, goal.y - size / 2, size, size);
  } else {
    ctx.fillStyle = '#00cc44';
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI * 2);
    ctx.fill();

    // Circle outline
    ctx.strokeStyle = '#008833';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Draw player
function drawPlayer() {
  if (playerImgLoaded) {
    const size = player.radius * 2 * 2.5;
    ctx.drawImage(playerImg, player.x - size / 2, player.y - size / 2, size, size);
  } else {
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Circle outline
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Check if position is walkable
function isWalkable(x, y, radius) {
  // Check if the circle at (x, y) with given radius collides with walls
  const left = Math.floor((x - radius) / CELL_SIZE);
  const right = Math.floor((x + radius) / CELL_SIZE);
  const top = Math.floor((y - radius) / CELL_SIZE);
  const bottom = Math.floor((y + radius) / CELL_SIZE);

  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
        return false; // Out of bounds
      }
      if (maze[row][col] === 1) {
        // Check actual collision with wall boundaries
        const wallX = col * CELL_SIZE;
        const wallY = row * CELL_SIZE;
        const dx = Math.max(Math.abs(x - (wallX + CELL_SIZE / 2)) - CELL_SIZE / 2, 0);
        const dy = Math.max(Math.abs(y - (wallY + CELL_SIZE / 2)) - CELL_SIZE / 2, 0);
        if (dx * dx + dy * dy < radius * radius) {
          return false;
        }
      }
    }
  }
  return true;
}

// Update player position
function updatePlayer() {
  let newX = player.x;
  let newY = player.y;

  if (keys['arrowup'] || keys['w']) {
    newY -= player.speed;
  }
  if (keys['arrowdown'] || keys['s']) {
    newY += player.speed;
  }
  if (keys['arrowleft'] || keys['a']) {
    newX -= player.speed;
  }
  if (keys['arrowright'] || keys['d']) {
    newX += player.speed;
  }

  // Check collision
  if (isWalkable(newX, newY, player.radius)) {
    player.x = newX;
    player.y = newY;
  }

  // Check win condition
  const dx = player.x - goal.x;
  const dy = player.y - goal.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < player.radius + goal.radius) {
    winGame();
  }
}

// Win condition
function winGame() {
  if (won) return;
  won = true;
  // disable input and show overlay
  canvas.style.pointerEvents = 'none';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // increment attempts counter if present
  const attemptsEl = document.getElementById('attempts');
  if (attemptsEl) {
    const current = parseInt(attemptsEl.textContent || '0', 10);
    attemptsEl.textContent = String(current + 1);
  }

  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎉 You Won! 🎉', canvas.width / 2, canvas.height / 2 - 12);

  ctx.font = '16px Arial';
  ctx.fillText('Opening your letter...', canvas.width / 2, canvas.height / 2 + 28);

  setTimeout(() => {
    window.location.href = 'letters.html';
  }, 1200);
}

// Game loop
function gameLoop() {
  drawMaze();
  updatePlayer();
  drawGoal();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

// Audio support: play background music on loop
(function initAudio(){
  const audioEl = document.getElementById('bgMusic');
  if (audioEl) {
    audioEl.volume = 0.6;
    audioEl.play().catch(err => console.log('Audio autoplay prevented, user interaction may be needed'));
  }
})();

// Resume music when returning from letters page
window.addEventListener('pageshow', ()=>{
  const audioEl = document.getElementById('bgMusic');
  if (audioEl && audioEl.paused) {
    audioEl.play().catch(err => console.log('Could not resume audio'));
  }
});
