const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const waveEl = document.querySelector("#wave");
const powerEl = document.querySelector("#power");
const healthBar = document.querySelector("#healthBar");
const restartButton = document.querySelector("#restartButton");
const moveStick = document.querySelector("#moveStick");
const moveKnob = document.querySelector("#moveKnob");
const shootButton = document.querySelector("#shootButton");

const world = { width: 900, height: 1500 };
const input = { x: 0, y: 0, shooting: false };
const keys = new Set();

let lastTime = 0;
let spawnTimer = 0;
let bulletTimer = 0;
let score = 0;
let wave = 1;
let gameOver = false;

const player = {
  x: world.width / 2,
  y: world.height / 2,
  radius: 30,
  speed: 330,
  health: 100,
  maxHealth: 100,
  power: 1,
  angle: -Math.PI / 2,
  invulnerable: 0
};

let bullets = [];
let enemies = [];
let cubes = [];
let particles = [];

function resize() {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resetGame() {
  player.x = world.width / 2;
  player.y = world.height / 2;
  player.health = player.maxHealth;
  player.power = 1;
  player.angle = -Math.PI / 2;
  player.invulnerable = 0;
  bullets = [];
  enemies = [];
  cubes = [];
  particles = [];
  score = 0;
  wave = 1;
  spawnTimer = 0;
  bulletTimer = 0;
  gameOver = false;
  restartButton.hidden = true;
  updateHud();
}

function updateHud() {
  scoreEl.textContent = score;
  waveEl.textContent = wave;
  powerEl.textContent = player.power;
  healthBar.style.width = `${Math.max(0, player.health)}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  const margin = 80;
  let x = Math.random() * world.width;
  let y = Math.random() * world.height;

  if (side === 0) y = -margin;
  if (side === 1) x = world.width + margin;
  if (side === 2) y = world.height + margin;
  if (side === 3) x = -margin;

  const fast = Math.random() < Math.min(0.35, wave * 0.035);
  enemies.push({
    x,
    y,
    radius: fast ? 22 : 28,
    health: fast ? 2 + Math.floor(wave / 3) : 3 + Math.floor(wave / 2),
    speed: fast ? 178 + wave * 7 : 112 + wave * 5,
    color: fast ? "#f97316" : "#a855f7"
  });
}

function shoot() {
  if (bulletTimer > 0 || gameOver) return;

  bulletTimer = Math.max(0.11, 0.28 - player.power * 0.018);
  const spread = Math.min(3, Math.floor(player.power / 3));
  const damage = 1 + Math.floor(player.power / 4);

  for (let i = -spread; i <= spread; i += 1) {
    const angle = player.angle + i * 0.13;
    bullets.push({
      x: player.x + Math.cos(angle) * 34,
      y: player.y + Math.sin(angle) * 34,
      vx: Math.cos(angle) * 760,
      vy: Math.sin(angle) * 760,
      radius: 8,
      damage,
      life: 0.8
    });
  }
}

function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 70 + Math.random() * 220;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35 + Math.random() * 0.35,
      color
    });
  }
}

function update(dt) {
  if (gameOver) return;

  const keyboardX = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0);
  const keyboardY = (keys.has("ArrowDown") || keys.has("s") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("w") ? 1 : 0);
  let moveX = input.x || keyboardX;
  let moveY = input.y || keyboardY;
  const length = Math.hypot(moveX, moveY);

  if (length > 0) {
    moveX /= Math.max(1, length);
    moveY /= Math.max(1, length);
    player.angle = Math.atan2(moveY, moveX);
  }

  player.x = clamp(player.x + moveX * player.speed * dt, player.radius, world.width - player.radius);
  player.y = clamp(player.y + moveY * player.speed * dt, player.radius, world.height - player.radius);
  player.invulnerable = Math.max(0, player.invulnerable - dt);

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnEnemy();
    spawnTimer = Math.max(0.28, 1.25 - wave * 0.06);
  }

  bulletTimer = Math.max(0, bulletTimer - dt);
  if (input.shooting || keys.has(" ")) shoot();

  bullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
  });
  bullets = bullets.filter((bullet) => bullet.life > 0 && bullet.x > -30 && bullet.x < world.width + 30 && bullet.y > -30 && bullet.y < world.height + 30);

  enemies.forEach((enemy) => {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;
  });

  for (const bullet of bullets) {
    for (const enemy of enemies) {
      if (distance(bullet, enemy) < bullet.radius + enemy.radius) {
        bullet.life = 0;
        enemy.health -= bullet.damage;
        addParticles(bullet.x, bullet.y, "#fde68a", 4);
        break;
      }
    }
  }

  const defeated = enemies.filter((enemy) => enemy.health <= 0);
  defeated.forEach((enemy) => {
    score += 10;
    if (Math.random() < 0.42) {
      cubes.push({ x: enemy.x, y: enemy.y, radius: 13 });
    }
    addParticles(enemy.x, enemy.y, enemy.color, 12);
  });
  enemies = enemies.filter((enemy) => enemy.health > 0);

  enemies.forEach((enemy) => {
    if (distance(player, enemy) < player.radius + enemy.radius && player.invulnerable <= 0) {
      player.health -= 12;
      player.invulnerable = 0.55;
      addParticles(player.x, player.y, "#ef4444", 14);
      if (player.health <= 0) endGame();
    }
  });

  cubes = cubes.filter((cube) => {
    if (distance(player, cube) < player.radius + cube.radius + 8) {
      player.power += 1;
      player.maxHealth = Math.min(140, player.maxHealth + 2);
      player.health = Math.min(player.maxHealth, player.health + 7);
      score += 5;
      addParticles(cube.x, cube.y, "#38bdf8", 10);
      return false;
    }
    return true;
  });

  wave = 1 + Math.floor(score / 120);

  particles.forEach((particle) => {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
  });
  particles = particles.filter((particle) => particle.life > 0);

  updateHud();
}

function endGame() {
  gameOver = true;
  restartButton.hidden = false;
}

function worldToScreen() {
  const scale = Math.min(canvas.clientWidth / world.width, canvas.clientHeight / world.height);
  const viewWidth = canvas.clientWidth / scale;
  const viewHeight = canvas.clientHeight / scale;
  const camX = clamp(player.x - viewWidth / 2, 0, world.width - viewWidth);
  const camY = clamp(player.y - viewHeight / 2, 0, world.height - viewHeight);
  return { scale, camX, camY };
}

function draw() {
  const { scale, camX, camY } = worldToScreen();
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-camX, -camY);

  const grid = 90;
  ctx.fillStyle = "#14532d";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  for (let x = 0; x <= world.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y <= world.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }

  drawObstacles();
  cubes.forEach(drawCube);
  bullets.forEach(drawBullet);
  enemies.forEach(drawEnemy);
  particles.forEach(drawParticle);
  drawPlayer();

  if (gameOver) drawGameOver();
  ctx.restore();
}

function drawObstacles() {
  const blocks = [
    [100, 240, 180, 80],
    [620, 300, 170, 90],
    [330, 610, 240, 80],
    [90, 930, 210, 90],
    [600, 1050, 200, 90]
  ];

  ctx.fillStyle = "#854d0e";
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 4;
  blocks.forEach(([x, y, w, h]) => {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  });
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  ctx.globalAlpha = player.invulnerable > 0 ? 0.62 : 1;
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(8, -8, 32, 16);
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.fillStyle = enemy.color;
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 12, enemy.radius * 2, 6);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 12, enemy.radius * 2 * Math.max(0, enemy.health / 6), 6);
}

function drawBullet(bullet) {
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCube(cube) {
  ctx.fillStyle = "#38bdf8";
  ctx.strokeStyle = "#e0f2fe";
  ctx.lineWidth = 3;
  ctx.fillRect(cube.x - cube.radius, cube.y - cube.radius, cube.radius * 2, cube.radius * 2);
  ctx.strokeRect(cube.x - cube.radius, cube.y - cube.radius, cube.radius * 2, cube.radius * 2);
}

function drawParticle(particle) {
  ctx.globalAlpha = Math.max(0, particle.life * 2);
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawGameOver() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.font = "900 76px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText("Game Over", world.width / 2, world.height / 2 - 40);
  ctx.font = "700 34px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText(`Score ${score}`, world.width / 2, world.height / 2 + 20);
}

function loop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function setStickPosition(x, y) {
  const rect = moveStick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const length = Math.min(46, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  const knobX = Math.cos(angle) * length;
  const knobY = Math.sin(angle) * length;

  input.x = knobX / 46;
  input.y = knobY / 46;
  moveKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
}

function resetStick() {
  input.x = 0;
  input.y = 0;
  moveKnob.style.transform = "translate(0, 0)";
}

moveStick.addEventListener("pointerdown", (event) => {
  moveStick.setPointerCapture(event.pointerId);
  setStickPosition(event.clientX, event.clientY);
});

moveStick.addEventListener("pointermove", (event) => {
  if (moveStick.hasPointerCapture(event.pointerId)) {
    setStickPosition(event.clientX, event.clientY);
  }
});

moveStick.addEventListener("pointerup", (event) => {
  moveStick.releasePointerCapture(event.pointerId);
  resetStick();
});

shootButton.addEventListener("pointerdown", (event) => {
  shootButton.setPointerCapture(event.pointerId);
  input.shooting = true;
  shoot();
});

shootButton.addEventListener("pointerup", (event) => {
  shootButton.releasePointerCapture(event.pointerId);
  input.shooting = false;
});

restartButton.addEventListener("click", resetGame);

window.addEventListener("keydown", (event) => keys.add(event.key));
window.addEventListener("keyup", (event) => keys.delete(event.key));
window.addEventListener("resize", resize);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

resize();
resetGame();
requestAnimationFrame(loop);
