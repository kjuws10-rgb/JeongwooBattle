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
const obstacles = [
  { x: 100, y: 240, w: 180, h: 80 },
  { x: 620, y: 300, w: 170, h: 90 },
  { x: 330, y: 610, w: 240, h: 80 },
  { x: 90, y: 930, w: 210, h: 90 },
  { x: 600, y: 1050, w: 200, h: 90 },
  { x: 350, y: 1250, w: 150, h: 80 }
];

let lastTime = 0;
let spawnTimer = 0;
let bulletTimer = 0;
let itemTimer = 4;
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
  missiles: 0,
  shieldTime: 0,
  angle: -Math.PI / 2,
  invulnerable: 0
};

let bullets = [];
let enemies = [];
let cubes = [];
let items = [];
let particles = [];

let audioContext = null;
let musicGain = null;
let musicTimer = null;

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
  player.missiles = 0;
  player.shieldTime = 0;
  player.angle = -Math.PI / 2;
  player.invulnerable = 0;
  bullets = [];
  enemies = [];
  cubes = [];
  items = [];
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
  powerEl.textContent = `P${player.power} M${player.missiles} S${Math.ceil(player.shieldTime)}`;
  healthBar.style.width = `${Math.max(0, player.health)}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function circleRectOverlap(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

function resolveCircleObstacles(entity) {
  obstacles.forEach((rect) => {
    const nearestX = clamp(entity.x, rect.x, rect.x + rect.w);
    const nearestY = clamp(entity.y, rect.y, rect.y + rect.h);
    let dx = entity.x - nearestX;
    let dy = entity.y - nearestY;
    let length = Math.hypot(dx, dy);

    if (length >= entity.radius) return;

    if (length === 0) {
      const left = Math.abs(entity.x - rect.x);
      const right = Math.abs(rect.x + rect.w - entity.x);
      const top = Math.abs(entity.y - rect.y);
      const bottom = Math.abs(rect.y + rect.h - entity.y);
      const min = Math.min(left, right, top, bottom);

      if (min === left) dx = -1;
      else if (min === right) dx = 1;
      else if (min === top) dy = -1;
      else dy = 1;

      length = 1;
    }

    const push = entity.radius - length + 0.5;
    entity.x += (dx / length) * push;
    entity.y += (dy / length) * push;
  });
}

function bulletHitsObstacle(bullet) {
  return obstacles.some((rect) => circleRectOverlap(bullet, rect));
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

function ensureAudio() {
  if (audioContext) {
    if (audioContext.state === "suspended") audioContext.resume();
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioContext = new AudioContextClass();
  musicGain = audioContext.createGain();
  musicGain.gain.value = 0.035;
  musicGain.connect(audioContext.destination);
  startMusic();
}

function playTone(frequency, duration = 0.08, type = "square", volume = 0.05) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function startMusic() {
  if (!audioContext || musicTimer) return;

  const notes = [196, 246.94, 293.66, 246.94, 220, 277.18, 329.63, 277.18];
  let step = 0;

  musicTimer = window.setInterval(() => {
    if (!audioContext || audioContext.state === "suspended") return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(notes[step % notes.length], now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    oscillator.connect(gain);
    gain.connect(musicGain);
    oscillator.start(now);
    oscillator.stop(now + 0.34);
    step += 1;
  }, 360);
}

function shoot() {
  if (bulletTimer > 0 || gameOver) return;

  bulletTimer = Math.max(0.11, 0.28 - player.power * 0.018);
  const spread = Math.min(3, Math.floor(player.power / 3));
  const damage = 1 + Math.floor(player.power / 4);
  playTone(420, 0.06, "square", 0.04);

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

  if (player.missiles > 0) {
    player.missiles -= 1;
    bullets.push({
      x: player.x + Math.cos(player.angle) * 42,
      y: player.y + Math.sin(player.angle) * 42,
      vx: Math.cos(player.angle) * 560,
      vy: Math.sin(player.angle) * 560,
      radius: 15,
      damage: 5 + Math.floor(player.power / 2),
      life: 1.3,
      missile: true
    });
    playTone(110, 0.18, "sawtooth", 0.08);
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

function spawnFieldItem() {
  const type = Math.random() < 0.52 ? "missile" : "shield";
  let item = null;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = {
      type,
      x: 70 + Math.random() * (world.width - 140),
      y: 150 + Math.random() * (world.height - 260),
      radius: 16,
      ttl: 14
    };

    if (!obstacles.some((rect) => circleRectOverlap(candidate, rect)) && distance(candidate, player) > 180) {
      item = candidate;
      break;
    }
  }

  if (item) items.push(item);
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
  resolveCircleObstacles(player);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.shieldTime = Math.max(0, player.shieldTime - dt);

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnEnemy();
    spawnTimer = Math.max(0.28, 1.25 - wave * 0.06);
  }

  itemTimer -= dt;
  if (itemTimer <= 0) {
    spawnFieldItem();
    itemTimer = 8 + Math.random() * 5;
  }

  bulletTimer = Math.max(0, bulletTimer - dt);
  if (input.shooting || keys.has(" ")) shoot();

  bullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
  });
  bullets = bullets.filter((bullet) => bullet.life > 0 && !bulletHitsObstacle(bullet) && bullet.x > -30 && bullet.x < world.width + 30 && bullet.y > -30 && bullet.y < world.height + 30);

  enemies.forEach((enemy) => {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;
    resolveCircleObstacles(enemy);
  });

  for (const bullet of bullets) {
    for (const enemy of enemies) {
      if (distance(bullet, enemy) < bullet.radius + enemy.radius) {
        bullet.life = 0;
        enemy.health -= bullet.damage;
        addParticles(bullet.x, bullet.y, "#fde68a", 4);
        if (bullet.missile) {
          enemies.forEach((nearby) => {
            if (nearby !== enemy && distance(enemy, nearby) < 130) {
              nearby.health -= Math.ceil(bullet.damage / 2);
            }
          });
          addParticles(enemy.x, enemy.y, "#fb923c", 24);
          playTone(82, 0.24, "sawtooth", 0.1);
        }
        break;
      }
    }
  }

  const defeated = enemies.filter((enemy) => enemy.health <= 0);
  defeated.forEach((enemy) => {
    score += 10;
    const roll = Math.random();
    if (roll < 0.42) {
      cubes.push({ x: enemy.x, y: enemy.y, radius: 13 });
    } else if (roll < 0.58) {
      items.push({ type: "missile", x: enemy.x, y: enemy.y, radius: 16, ttl: 12 });
    } else if (roll < 0.72) {
      items.push({ type: "shield", x: enemy.x, y: enemy.y, radius: 16, ttl: 12 });
    }
    addParticles(enemy.x, enemy.y, enemy.color, 12);
    playTone(680, 0.07, "triangle", 0.035);
  });
  enemies = enemies.filter((enemy) => enemy.health > 0);

  enemies.forEach((enemy) => {
    if (distance(player, enemy) < player.radius + enemy.radius && player.invulnerable <= 0) {
      if (player.shieldTime > 0) {
        enemy.health -= 2;
        addParticles(enemy.x, enemy.y, "#93c5fd", 12);
        playTone(520, 0.08, "sine", 0.05);
      } else {
        player.health -= 12;
        playTone(140, 0.13, "sawtooth", 0.08);
      }
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
      playTone(820, 0.09, "triangle", 0.05);
      return false;
    }
    return true;
  });

  items.forEach((item) => {
    item.ttl -= dt;
  });
  items = items.filter((item) => {
    if (item.ttl <= 0) return false;

    if (distance(player, item) < player.radius + item.radius + 10) {
      if (item.type === "missile") {
        player.missiles += 3;
        addParticles(item.x, item.y, "#fb923c", 18);
        playTone(980, 0.08, "square", 0.055);
      } else {
        player.shieldTime = Math.max(player.shieldTime, 8);
        addParticles(item.x, item.y, "#93c5fd", 20);
        playTone(620, 0.18, "sine", 0.055);
      }
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
  playTone(92, 0.5, "sawtooth", 0.09);
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
  items.forEach(drawItem);
  bullets.forEach(drawBullet);
  enemies.forEach(drawEnemy);
  particles.forEach(drawParticle);
  drawPlayer();

  if (gameOver) drawGameOver();
  ctx.restore();
}

function drawObstacles() {
  ctx.fillStyle = "#854d0e";
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 4;
  obstacles.forEach(({ x, y, w, h }) => {
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
  if (player.shieldTime > 0) {
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
  }
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
  ctx.fillStyle = bullet.missile ? "#fb923c" : "#fde047";
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
  ctx.fill();
  if (bullet.missile) {
    ctx.strokeStyle = "#fed7aa";
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}

function drawCube(cube) {
  ctx.fillStyle = "#38bdf8";
  ctx.strokeStyle = "#e0f2fe";
  ctx.lineWidth = 3;
  ctx.fillRect(cube.x - cube.radius, cube.y - cube.radius, cube.radius * 2, cube.radius * 2);
  ctx.strokeRect(cube.x - cube.radius, cube.y - cube.radius, cube.radius * 2, cube.radius * 2);
}

function drawItem(item) {
  if (item.type === "missile") {
    ctx.fillStyle = "#fb923c";
    ctx.strokeStyle = "#ffedd5";
  } else {
    ctx.fillStyle = "#60a5fa";
    ctx.strokeStyle = "#dbeafe";
  }

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText(item.type === "missile" ? "M" : "S", item.x, item.y + 1);
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

function blockBrowserGesture(event) {
  event.preventDefault();
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
  ensureAudio();
  event.preventDefault();
  moveStick.setPointerCapture(event.pointerId);
  setStickPosition(event.clientX, event.clientY);
});

moveStick.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (moveStick.hasPointerCapture(event.pointerId)) {
    setStickPosition(event.clientX, event.clientY);
  }
});

moveStick.addEventListener("pointerup", (event) => {
  event.preventDefault();
  moveStick.releasePointerCapture(event.pointerId);
  resetStick();
});

moveStick.addEventListener("pointercancel", resetStick);

shootButton.addEventListener("pointerdown", (event) => {
  ensureAudio();
  event.preventDefault();
  shootButton.setPointerCapture(event.pointerId);
  input.shooting = true;
  shoot();
});

shootButton.addEventListener("pointerup", (event) => {
  event.preventDefault();
  shootButton.releasePointerCapture(event.pointerId);
  input.shooting = false;
});

shootButton.addEventListener("pointercancel", () => {
  input.shooting = false;
});

restartButton.addEventListener("click", () => {
  ensureAudio();
  resetGame();
});

window.addEventListener("keydown", (event) => {
  ensureAudio();
  keys.add(event.key);
});
window.addEventListener("keyup", (event) => keys.delete(event.key));
window.addEventListener("resize", resize);
document.addEventListener("contextmenu", blockBrowserGesture);
document.addEventListener("selectstart", blockBrowserGesture);
document.addEventListener("gesturestart", blockBrowserGesture);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

resize();
resetGame();
requestAnimationFrame(loop);
