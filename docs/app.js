const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const gameShell = document.querySelector(".game-shell");
const scoreEl = document.querySelector("#score");
const waveEl = document.querySelector("#wave");
const powerEl = document.querySelector("#power");
const healthBar = document.querySelector("#healthBar");
const startPanel = document.querySelector("#startPanel");
const startButton = document.querySelector("#startButton");
const gameOverPanel = document.querySelector("#gameOverPanel");
const finalScore = document.querySelector("#finalScore");
const saveScoreButton = document.querySelector("#saveScoreButton");
const restartButton = document.querySelector("#restartButton");
const moveStick = document.querySelector("#moveStick");
const moveKnob = document.querySelector("#moveKnob");
const shootButton = document.querySelector("#shootButton");
const playerNameInput = document.querySelector("#playerName");
const unitSelect = document.querySelector("#unitSelect");
const scoreList = document.querySelector("#scoreList");

const world = { width: 900, height: 1500 };
const arenaTop = 176;
const input = { x: 0, y: 0, shooting: false };
const keys = new Set();
const storageKey = "jeongwoo-battle-records-v1";
const units = {
  tank: { label: "Tank", radius: 32, speed: 300, maxHealth: 130, fireDelay: 0.3, color: "#38bdf8", shot: "#fde047" },
  jet: { label: "Jet", radius: 25, speed: 410, maxHealth: 82, fireDelay: 0.22, color: "#f97316", shot: "#fdba74" },
  rover: { label: "Rover", radius: 28, speed: 360, maxHealth: 105, fireDelay: 0.24, color: "#22c55e", shot: "#bbf7d0" },
  ship: { label: "Ship", radius: 34, speed: 280, maxHealth: 150, fireDelay: 0.34, color: "#a855f7", shot: "#e9d5ff" }
};
const maps = [
  {
    name: "Grass",
    minScore: 0,
    bg: "#14532d",
    grid: "rgba(255,255,255,0.08)",
    block: "#854d0e",
    edge: "#facc15",
    obstacles: [
      { x: 100, y: 240, w: 180, h: 80 },
      { x: 620, y: 300, w: 170, h: 90 },
      { x: 330, y: 610, w: 240, h: 80 },
      { x: 90, y: 930, w: 210, h: 90 },
      { x: 600, y: 1050, w: 200, h: 90 },
      { x: 350, y: 1250, w: 150, h: 80 }
    ]
  },
  {
    name: "Desert",
    minScore: 250,
    bg: "#92400e",
    grid: "rgba(254,243,199,0.12)",
    block: "#451a03",
    edge: "#fed7aa",
    obstacles: [
      { x: 70, y: 190, w: 230, h: 70 },
      { x: 520, y: 230, w: 270, h: 70 },
      { x: 250, y: 520, w: 120, h: 270 },
      { x: 560, y: 720, w: 120, h: 280 },
      { x: 120, y: 1120, w: 250, h: 80 },
      { x: 510, y: 1230, w: 250, h: 80 }
    ]
  },
  {
    name: "Ice",
    minScore: 600,
    bg: "#0e7490",
    grid: "rgba(224,242,254,0.16)",
    block: "#164e63",
    edge: "#bae6fd",
    obstacles: [
      { x: 150, y: 210, w: 120, h: 260 },
      { x: 620, y: 190, w: 120, h: 260 },
      { x: 330, y: 510, w: 240, h: 90 },
      { x: 80, y: 800, w: 190, h: 180 },
      { x: 635, y: 800, w: 190, h: 180 },
      { x: 330, y: 1120, w: 240, h: 100 }
    ]
  },
  {
    name: "Space",
    minScore: 1000,
    bg: "#1e1b4b",
    grid: "rgba(221,214,254,0.16)",
    block: "#312e81",
    edge: "#c4b5fd",
    obstacles: [
      { x: 120, y: 170, w: 170, h: 170 },
      { x: 610, y: 170, w: 170, h: 170 },
      { x: 365, y: 470, w: 170, h: 170 },
      { x: 120, y: 820, w: 170, h: 170 },
      { x: 610, y: 820, w: 170, h: 170 },
      { x: 350, y: 1190, w: 200, h: 120 }
    ]
  },
  {
    name: "Nebula",
    minScore: 1500,
    bg: "#581c87",
    grid: "rgba(245,208,254,0.16)",
    block: "#701a75",
    edge: "#f0abfc",
    obstacles: [
      { x: 80, y: 230, w: 220, h: 70 },
      { x: 610, y: 250, w: 170, h: 180 },
      { x: 280, y: 520, w: 330, h: 70 },
      { x: 90, y: 820, w: 160, h: 220 },
      { x: 640, y: 880, w: 170, h: 200 },
      { x: 310, y: 1210, w: 280, h: 80 }
    ]
  },
  {
    name: "Core",
    minScore: 2200,
    bg: "#7f1d1d",
    grid: "rgba(254,202,202,0.15)",
    block: "#450a0a",
    edge: "#fca5a5",
    obstacles: [
      { x: 120, y: 220, w: 130, h: 240 },
      { x: 640, y: 220, w: 130, h: 240 },
      { x: 330, y: 500, w: 240, h: 90 },
      { x: 130, y: 780, w: 250, h: 80 },
      { x: 520, y: 930, w: 250, h: 80 },
      { x: 350, y: 1190, w: 200, h: 180 }
    ]
  }
];

const enemyTypes = {
  chaser: { label: "Chaser", radius: 28, health: 3, speed: 122, color: "#a855f7", stop: 76, score: 10 },
  sprinter: { label: "Sprinter", radius: 22, health: 2, speed: 208, color: "#f97316", stop: 88, score: 12 },
  brute: { label: "Brute", radius: 36, health: 7, speed: 84, color: "#ef4444", stop: 92, score: 18 },
  shooter: { label: "Shooter", radius: 25, health: 4, speed: 96, color: "#06b6d4", stop: 260, score: 16, shoots: true },
  orbit: { label: "Orbit", radius: 24, health: 3, speed: 132, color: "#eab308", stop: 132, score: 14, orbit: true }
};

let lastTime = 0;
let spawnTimer = 0;
let bulletTimer = 0;
let itemTimer = 4;
let score = 0;
let wave = 1;
let gameOver = false;
let gameState = "menu";
let currentMapIndex = 0;
let selectedUnit = "tank";
let records = [];
let scoreSaved = false;
let visualTier = 1;
let dynamicObjects = [];
let unlockedMapIndex = 0;
let bossTargetMapIndex = null;
let bossActive = false;

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
  invulnerable: 0,
  terrainCooldown: 0,
  boostTime: 0
};

let bullets = [];
let enemyBullets = [];
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

function resetRoundState() {
  selectedUnit = unitSelect.value;
  const unit = units[selectedUnit];
  player.x = world.width / 2;
  player.y = world.height / 2;
  player.radius = unit.radius;
  player.speed = unit.speed;
  player.maxHealth = unit.maxHealth;
  player.health = unit.maxHealth;
  player.power = 1;
  player.missiles = 0;
  player.shieldTime = 0;
  player.angle = -Math.PI / 2;
  player.invulnerable = 0;
  player.terrainCooldown = 0;
  player.boostTime = 0;
  bullets = [];
  enemyBullets = [];
  enemies = [];
  cubes = [];
  items = [];
  particles = [];
  score = 0;
  wave = 1;
  spawnTimer = 0;
  bulletTimer = 0;
  itemTimer = 4;
  currentMapIndex = 0;
  unlockedMapIndex = 0;
  bossTargetMapIndex = null;
  bossActive = false;
  scoreSaved = false;
  visualTier = 1;
  gameOver = false;
  rebuildDynamicTerrain();
  updateHud();
  renderRecords();
}

function showStartScreen() {
  resetRoundState();
  gameState = "menu";
  startPanel.hidden = false;
  gameOverPanel.hidden = true;
  gameShell.classList.add("is-menu");
  gameShell.classList.remove("is-ended");
}

function startGame() {
  ensureAudio();
  resetRoundState();
  gameState = "playing";
  startPanel.hidden = true;
  gameOverPanel.hidden = true;
  gameShell.classList.remove("is-menu", "is-ended");
  playStartSound();
}

function updateHud() {
  scoreEl.textContent = score;
  waveEl.textContent = bossActive ? `Boss -> ${maps[bossTargetMapIndex].name}` : `${currentMap().name} L${playerTier()}`;
  powerEl.textContent = `P${player.power} M${player.missiles} S${Math.ceil(player.shieldTime)}`;
  healthBar.style.width = `${Math.max(0, (player.health / player.maxHealth) * 100)}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function currentMap() {
  return maps[currentMapIndex];
}

function currentObstacles() {
  return currentMap().obstacles.concat(dynamicObjects.filter((object) => object.blocks).map(dynamicObjectRect));
}

function playerTier() {
  return clamp(1 + Math.floor(score / 250), 1, 7);
}

function rebuildDynamicTerrain() {
  const map = currentMap();
  const level = Math.max(currentMapIndex + 1, playerTier());
  dynamicObjects = [];

  dynamicObjects.push({ type: "jump", x: 385, y: 390 + level * 34, w: 130, h: 64, color: map.edge });

  if (level >= 2) {
    dynamicObjects.push({ type: "moving", blocks: true, baseX: 115, baseY: 680, w: 170, h: 58, amp: 90, speed: 1.1, phase: 0.4, color: map.block });
    dynamicObjects.push({ type: "jump", x: 610, y: 960, w: 145, h: 64, color: "#fb923c" });
  }

  if (level >= 3) {
    dynamicObjects.push({ type: "portal", id: "a", x: 165, y: 560, radius: 34, targetId: "b", color: "#67e8f9" });
    dynamicObjects.push({ type: "portal", id: "b", x: 735, y: 1120, radius: 34, targetId: "a", color: "#c084fc" });
    dynamicObjects.push({ type: "moving", blocks: true, baseX: 590, baseY: 520, w: 120, h: 120, amp: 110, speed: 1.35, phase: 1.2, color: map.block });
  }

  if (level >= 4) {
    dynamicObjects.push({ type: "portal", id: "c", x: 735, y: 360, radius: 30, targetId: "d", color: "#f0abfc" });
    dynamicObjects.push({ type: "portal", id: "d", x: 165, y: 1260, radius: 30, targetId: "c", color: "#7dd3fc" });
    dynamicObjects.push({ type: "moving", blocks: true, baseX: 330, baseY: 820, w: 240, h: 62, amp: 150, speed: 1.55, phase: 2.1, color: map.block });
  }

  if (level >= 5) {
    dynamicObjects.push({ type: "jump", x: 140, y: 1040, w: 130, h: 66, color: "#86efac" });
    dynamicObjects.push({ type: "moving", blocks: true, baseX: 120, baseY: 1180, w: 180, h: 54, amp: 210, speed: 1.85, phase: 2.8, color: map.block });
  }
}

function dynamicObjectRect(object) {
  if (object.type !== "moving") return object;

  const offset = Math.sin(lastTime / 1000 * object.speed + object.phase) * object.amp;
  return {
    x: object.baseX + offset,
    y: object.baseY,
    w: object.w,
    h: object.h
  };
}

function clampToArena(entity) {
  entity.x = clamp(entity.x, entity.radius, world.width - entity.radius);
  entity.y = clamp(entity.y, arenaTop + entity.radius, world.height - entity.radius);
}

function updateTerrainEffects(dt) {
  player.terrainCooldown = Math.max(0, player.terrainCooldown - dt);
  player.boostTime = Math.max(0, player.boostTime - dt);

  if (player.terrainCooldown > 0) return;

  for (const object of dynamicObjects) {
    if (object.type === "jump" && circleRectOverlap(player, object)) {
      const force = 190 + playerTier() * 22;
      player.x += Math.cos(player.angle) * force;
      player.y += Math.sin(player.angle) * force;
      clampToArena(player);
      player.boostTime = 0.42;
      player.invulnerable = Math.max(player.invulnerable, 0.32);
      player.terrainCooldown = 0.85;
      addParticles(player.x, player.y, object.color, 26);
      playTone(740, 0.12, "triangle", 0.065);
      return;
    }

    if (object.type === "portal" && distance(player, object) < player.radius + object.radius) {
      const target = dynamicObjects.find((candidate) => candidate.id === object.targetId);
      if (!target) return;
      addParticles(player.x, player.y, object.color, 28);
      player.x = target.x;
      player.y = target.y + target.radius + player.radius + 10;
      clampToArena(player);
      player.terrainCooldown = 1.15;
      player.invulnerable = Math.max(player.invulnerable, 0.5);
      addParticles(player.x, player.y, target.color, 34);
      playTone(260, 0.08, "sine", 0.06);
      window.setTimeout(() => playTone(620, 0.12, "sine", 0.06), 90);
      return;
    }
  }
}

function updateMapByScore() {
  const nextTier = playerTier();
  if (nextTier > visualTier) {
    visualTier = nextTier;
    rebuildDynamicTerrain();
    addParticles(player.x, player.y, units[selectedUnit].shot, 42);
    playTone(520 + nextTier * 70, 0.18, "triangle", 0.08);
  }

  const nextMapIndex = unlockedMapIndex + 1;
  if (!bossActive && nextMapIndex < maps.length && score >= maps[nextMapIndex].minScore) {
    spawnBoss(nextMapIndex);
  }
}

function spawnBoss(targetMapIndex) {
  bossActive = true;
  bossTargetMapIndex = targetMapIndex;
  enemies = enemies.filter((enemy) => enemy.boss);
  enemyBullets = [];
  const targetMap = maps[targetMapIndex];
  enemies.push({
    type: "boss",
    boss: true,
    x: world.width / 2,
    y: arenaTop + 170,
    radius: 58 + targetMapIndex * 4,
    health: 38 + targetMapIndex * 16,
    maxHealth: 38 + targetMapIndex * 16,
    speed: 72 + targetMapIndex * 5,
    color: targetMap.edge,
    stopDistance: 210,
    scoreValue: 80 + targetMapIndex * 35,
    shootCooldown: 1.2,
    pulse: 0
  });
  addParticles(world.width / 2, arenaTop + 170, targetMap.edge, 64);
  playTone(120, 0.24, "sawtooth", 0.1);
  window.setTimeout(() => playTone(220, 0.22, "sawtooth", 0.09), 180);
  updateHud();
}

function clearBoss(enemy) {
  if (!enemy.boss || bossTargetMapIndex == null) return;

  unlockedMapIndex = bossTargetMapIndex;
  currentMapIndex = unlockedMapIndex;
  bossTargetMapIndex = null;
  bossActive = false;
  enemyBullets = [];
  rebuildDynamicTerrain();
  addParticles(player.x, player.y, currentMap().edge, 76);
  playTone(392, 0.14, "triangle", 0.085);
  window.setTimeout(() => playTone(523.25, 0.16, "triangle", 0.085), 130);
  window.setTimeout(() => updateMapByScore(), 220);
}

function loadRecords() {
  try {
    records = JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    records = [];
  }
}

function saveRecords() {
  localStorage.setItem(storageKey, JSON.stringify(records.slice(0, 8)));
}

function renderRecords() {
  scoreList.innerHTML = "";
  const shownRecords = [...records];

  if (gameState === "ended" && !scoreSaved) {
    shownRecords.push({
      name: playerName(),
      score,
      unit: units[selectedUnit].label,
      zone: currentMap().name,
      pending: true
    });
    shownRecords.sort((a, b) => b.score - a.score);
  }

  shownRecords.slice(0, 8).forEach((record) => {
    const item = document.createElement("li");
    item.textContent = `${record.name} ${record.score} ${record.unit}`;
    if (record.pending) item.className = "pending-record";
    scoreList.appendChild(item);
  });

  if (shownRecords.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No records";
    scoreList.appendChild(item);
  }
}

function playerName() {
  const name = playerNameInput.value.trim();
  return name || "Player";
}

function saveScoreRecord() {
  if (scoreSaved) return;

  scoreSaved = true;
  records.push({
    name: playerName(),
    score,
    unit: units[selectedUnit].label,
    zone: currentMap().name,
    date: new Date().toISOString()
  });
  records.sort((a, b) => b.score - a.score);
  records = records.slice(0, 8);
  saveRecords();
  renderRecords();
  saveScoreButton.disabled = true;
  saveScoreButton.textContent = "Saved";
  playSaveSound();
}

function circleRectOverlap(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

function resolveCircleObstacles(entity) {
  currentObstacles().forEach((rect) => {
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
  return currentObstacles().some((rect) => circleRectOverlap(bullet, rect));
}

function spawnEnemy() {
  if (bossActive && enemies.some((enemy) => enemy.boss) && Math.random() < 0.55) return;

  const side = Math.floor(Math.random() * 4);
  const margin = 80;
  let x = Math.random() * world.width;
  let y = Math.random() * world.height;

  if (side === 0) y = -margin;
  if (side === 1) x = world.width + margin;
  if (side === 2) y = world.height + margin;
  if (side === 3) x = -margin;

  const type = chooseEnemyType();
  const spec = enemyTypes[type];
  const levelBonus = Math.floor(wave / 3);
  enemies.push({
    type,
    x,
    y,
    radius: spec.radius,
    health: spec.health + levelBonus,
    maxHealth: spec.health + levelBonus,
    speed: spec.speed + wave * 4,
    color: spec.color,
    stopDistance: spec.stop,
    scoreValue: spec.score,
    shootCooldown: 0.9 + Math.random() * 0.8,
    orbitDir: Math.random() < 0.5 ? -1 : 1
  });
}

function chooseEnemyType() {
  const options = ["chaser"];
  if (wave >= 2) options.push("sprinter");
  if (wave >= 3) options.push("brute");
  if (wave >= 4) options.push("shooter");
  if (wave >= 5) options.push("orbit");
  return options[Math.floor(Math.random() * options.length)];
}

function shootEnemyBullet(enemy, angle, speed = 340, radius = 8, damage = 9) {
  enemyBullets.push({
    x: enemy.x + Math.cos(angle) * (enemy.radius + 10),
    y: enemy.y + Math.sin(angle) * (enemy.radius + 10),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    damage,
    life: 2.2,
    color: enemy.boss ? "#fca5a5" : enemy.color
  });
}

function updateEnemy(enemy, dt) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  const stopDistance = enemy.stopDistance || player.radius + enemy.radius + 22;
  let moveAngle = angle;
  let moveSpeed = enemy.speed;

  if (enemy.type === "orbit") {
    moveAngle = angle + enemy.orbitDir * 0.72;
    moveSpeed = enemy.speed * (dist > stopDistance + 45 ? 1 : 0.62);
  }

  if (dist > stopDistance) {
    enemy.x += Math.cos(moveAngle) * moveSpeed * dt;
    enemy.y += Math.sin(moveAngle) * moveSpeed * dt;
  } else if (dist < stopDistance - 12) {
    const push = Math.min(120 * dt, stopDistance - dist);
    enemy.x -= Math.cos(angle) * push;
    enemy.y -= Math.sin(angle) * push;
  }

  if (enemy.shoots || enemy.type === "shooter" || enemy.boss) {
    enemy.shootCooldown -= dt;
    if (enemy.shootCooldown <= 0 && dist < 620) {
      if (enemy.boss) {
        for (let i = -1; i <= 1; i += 1) shootEnemyBullet(enemy, angle + i * 0.22, 300 + currentMapIndex * 25, 10, 12);
        enemy.shootCooldown = Math.max(0.65, 1.25 - currentMapIndex * 0.08);
      } else {
        shootEnemyBullet(enemy, angle, 330, 8, 9);
        enemy.shootCooldown = 1.2 + Math.random() * 0.7;
      }
      playTone(enemy.boss ? 180 : 240, 0.06, "square", 0.035);
    }
  }
}

function separateEnemiesFromPlayer() {
  enemies.forEach((enemy) => {
    const minDistance = enemy.stopDistance || player.radius + enemy.radius + 20;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    if (dist >= minDistance) return;

    const push = minDistance - dist;
    enemy.x += (dx / dist) * push;
    enemy.y += (dy / dist) * push;
    clampToArena(enemy);
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

function playStartSound() {
  playTone(261.63, 0.08, "triangle", 0.055);
  window.setTimeout(() => playTone(329.63, 0.08, "triangle", 0.055), 80);
  window.setTimeout(() => playTone(392, 0.12, "triangle", 0.06), 160);
}

function playSaveSound() {
  playTone(523.25, 0.07, "sine", 0.05);
  window.setTimeout(() => playTone(659.25, 0.08, "sine", 0.05), 90);
}

function playGameOverSound() {
  playTone(196, 0.12, "sawtooth", 0.075);
  window.setTimeout(() => playTone(146.83, 0.18, "sawtooth", 0.07), 110);
  window.setTimeout(() => playTone(98, 0.32, "sawtooth", 0.08), 260);
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

  const notes = [196, 246.94, 293.66, 392, 329.63, 277.18, 246.94, 220];
  const bass = [98, 98, 123.47, 123.47, 110, 110, 146.83, 146.83];
  let step = 0;

  musicTimer = window.setInterval(() => {
    if (!audioContext || audioContext.state === "suspended" || gameState === "menu") return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const bassOscillator = audioContext.createOscillator();
    const bassGain = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(notes[step % notes.length], now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    oscillator.connect(gain);
    gain.connect(musicGain);
    oscillator.start(now);
    oscillator.stop(now + 0.34);

    if (step % 2 === 0) {
      bassOscillator.type = "sine";
      bassOscillator.frequency.setValueAtTime(bass[step % bass.length], now);
      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.045, now + 0.03);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      bassOscillator.connect(bassGain);
      bassGain.connect(musicGain);
      bassOscillator.start(now);
      bassOscillator.stop(now + 0.44);
    }

    step += 1;
  }, 360);
}

function shoot() {
  if (bulletTimer > 0 || gameState !== "playing" || gameOver) return;

  bulletTimer = Math.max(0.1, units[selectedUnit].fireDelay - player.power * 0.018);
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
      life: 0.8,
      color: units[selectedUnit].shot
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
      y: arenaTop + 70 + Math.random() * (world.height - arenaTop - 180),
      radius: 16,
      ttl: 14
    };

    if (!currentObstacles().some((rect) => circleRectOverlap(candidate, rect)) && distance(candidate, player) > 180) {
      item = candidate;
      break;
    }
  }

  if (item) items.push(item);
}

function update(dt) {
  if (gameState !== "playing" || gameOver) return;

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

  const speedBoost = player.boostTime > 0 ? 1.18 : 1;
  player.x += moveX * player.speed * speedBoost * dt;
  player.y += moveY * player.speed * speedBoost * dt;
  clampToArena(player);
  resolveCircleObstacles(player);
  updateTerrainEffects(dt);
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

  enemyBullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
  });
  enemyBullets = enemyBullets.filter((bullet) => bullet.life > 0 && !bulletHitsObstacle(bullet) && bullet.x > -40 && bullet.x < world.width + 40 && bullet.y > arenaTop - 40 && bullet.y < world.height + 40);

  enemies.forEach((enemy) => {
    updateEnemy(enemy, dt);
    clampToArena(enemy);
    resolveCircleObstacles(enemy);
  });
  separateEnemiesFromPlayer();

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

  enemyBullets.forEach((bullet) => {
    if (player.invulnerable > 0) return;
    if (distance(player, bullet) < player.radius + bullet.radius) {
      bullet.life = 0;
      if (player.shieldTime > 0) {
        addParticles(bullet.x, bullet.y, "#93c5fd", 10);
        playTone(520, 0.08, "sine", 0.05);
      } else {
        player.health -= bullet.damage;
        player.invulnerable = 0.45;
        addParticles(player.x, player.y, "#ef4444", 14);
        playTone(160, 0.12, "sawtooth", 0.07);
        if (player.health <= 0) endGame();
      }
    }
  });
  enemyBullets = enemyBullets.filter((bullet) => bullet.life > 0);

  const defeated = enemies.filter((enemy) => enemy.health <= 0);
  defeated.forEach((enemy) => {
    score += enemy.scoreValue || 10;
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
    if (enemy.boss) clearBoss(enemy);
  });
  if (defeated.length > 0) updateMapByScore();
  enemies = enemies.filter((enemy) => enemy.health > 0);

  enemies.forEach((enemy) => {
    const attackDistance = enemy.stopDistance || player.radius + enemy.radius + 18;
    if (distance(player, enemy) < attackDistance + 8 && player.invulnerable <= 0) {
      if (player.shieldTime > 0) {
        enemy.health -= enemy.boss ? 1 : 2;
        addParticles(enemy.x, enemy.y, "#93c5fd", 12);
        playTone(520, 0.08, "sine", 0.05);
      } else {
        player.health -= enemy.boss ? 18 : 10;
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
      updateMapByScore();
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
  gameState = "ended";
  finalScore.textContent = `Score ${score}`;
  saveScoreButton.disabled = false;
  saveScoreButton.textContent = "Save Score";
  startPanel.hidden = true;
  gameOverPanel.hidden = false;
  gameShell.classList.add("is-ended");
  renderRecords();
  playGameOverSound();
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
  const map = currentMap();
  ctx.fillStyle = map.bg;
  ctx.fillRect(0, 0, world.width, world.height);
  drawBackgroundPattern(map);
  ctx.strokeStyle = map.grid;
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

  drawArenaBoundary();
  drawObstacles();
  drawDynamicTerrain();
  cubes.forEach(drawCube);
  items.forEach(drawItem);
  bullets.forEach(drawBullet);
  enemyBullets.forEach(drawEnemyBullet);
  enemies.forEach(drawEnemy);
  particles.forEach(drawParticle);
  drawPlayer();

  if (gameOver) drawGameOver();
  ctx.restore();
}

function drawObstacles() {
  const map = currentMap();
  ctx.fillStyle = map.block;
  ctx.strokeStyle = map.edge;
  ctx.lineWidth = 4;
  currentObstacles().forEach(({ x, y, w, h }) => {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  });
}

function drawArenaBoundary() {
  ctx.save();
  ctx.fillStyle = "rgba(2, 6, 23, 0.72)";
  ctx.fillRect(0, 0, world.width, arenaTop);
  ctx.fillStyle = "rgba(248, 250, 252, 0.08)";
  ctx.fillRect(0, arenaTop - 18, world.width, 18);
  ctx.strokeStyle = currentMap().edge;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, arenaTop);
  ctx.lineTo(world.width, arenaTop);
  ctx.stroke();
  ctx.restore();
}

function drawDynamicTerrain() {
  dynamicObjects.forEach((object) => {
    if (object.type === "jump") {
      ctx.save();
      ctx.fillStyle = object.color;
      ctx.strokeStyle = "#fff7ed";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(object.x, object.y + object.h);
      ctx.lineTo(object.x + object.w / 2, object.y);
      ctx.lineTo(object.x + object.w, object.y + object.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#111827";
      ctx.font = "900 24px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("JUMP", object.x + object.w / 2, object.y + object.h * 0.58);
      ctx.restore();
    } else if (object.type === "portal") {
      ctx.save();
      const pulse = 1 + Math.sin(lastTime / 180) * 0.08;
      ctx.translate(object.x, object.y);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = object.color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, object.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, object.radius * 0.56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (object.type === "moving") {
      const rect = dynamicObjectRect(object);
      ctx.save();
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 12]);
      ctx.strokeRect(rect.x + 8, rect.y + 8, rect.w - 16, rect.h - 16);
      ctx.restore();
    }
  });
}

function drawBackgroundPattern(map) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  if (map.name === "Desert") {
    ctx.fillStyle = "#fbbf24";
    for (let i = 0; i < 18; i += 1) {
      ctx.beginPath();
      ctx.arc((i * 131) % world.width, 120 + ((i * 211) % 1250), 18 + (i % 4) * 8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (map.name === "Ice") {
    ctx.strokeStyle = "#e0f2fe";
    ctx.lineWidth = 5;
    for (let i = 0; i < 10; i += 1) {
      const x = 80 + ((i * 211) % 730);
      const y = 160 + ((i * 173) % 1180);
      ctx.beginPath();
      ctx.moveTo(x - 32, y);
      ctx.lineTo(x + 32, y);
      ctx.moveTo(x, y - 32);
      ctx.lineTo(x, y + 32);
      ctx.stroke();
    }
  } else if (map.name === "Space") {
    ctx.fillStyle = "#f8fafc";
    for (let i = 0; i < 64; i += 1) {
      ctx.fillRect((i * 67) % world.width, (i * 149) % world.height, 3, 3);
    }
  } else if (map.name === "Nebula") {
    ctx.strokeStyle = "#f5d0fe";
    ctx.lineWidth = 4;
    for (let i = 0; i < 14; i += 1) {
      const x = 70 + ((i * 181) % 760);
      const y = 210 + ((i * 137) % 1160);
      ctx.beginPath();
      ctx.arc(x, y, 28 + (i % 3) * 12, 0.2, Math.PI * 1.7);
      ctx.stroke();
    }
  } else if (map.name === "Core") {
    ctx.fillStyle = "#fb7185";
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 151) % world.width;
      const y = arenaTop + ((i * 229) % (world.height - arenaTop));
      ctx.beginPath();
      ctx.moveTo(x, y - 24);
      ctx.lineTo(x + 18, y + 24);
      ctx.lineTo(x - 18, y + 24);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.fillStyle = "#86efac";
    for (let i = 0; i < 16; i += 1) {
      ctx.fillRect((i * 97) % world.width, 80 + ((i * 191) % 1320), 34, 8);
    }
  }
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  ctx.globalAlpha = player.invulnerable > 0 ? 0.62 : 1;
  drawUnitBody();
  if (player.shieldTime > 0) {
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawUnitBody() {
  const unit = units[selectedUnit];
  const tier = playerTier();
  ctx.fillStyle = unit.color;
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 3 + tier;

  if (tier >= 3) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = unit.shot;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 12 + tier * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (selectedUnit === "jet") {
    ctx.beginPath();
    ctx.moveTo(42 + tier * 3, 0);
    ctx.lineTo(-24, -24 - tier * 2);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-24, 24 + tier * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (tier >= 2) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(-14, -34, 18 + tier * 3, 8);
      ctx.fillRect(-14, 26, 18 + tier * 3, 8);
    }
    if (tier >= 4) {
      ctx.fillStyle = unit.shot;
      ctx.fillRect(-34, -8, 18, 6);
      ctx.fillRect(-34, 2, 18, 6);
    }
  } else if (selectedUnit === "rover") {
    ctx.fillRect(-28 - tier, -22 - tier, 56 + tier * 2, 44 + tier * 2);
    ctx.strokeRect(-28 - tier, -22 - tier, 56 + tier * 2, 44 + tier * 2);
    ctx.fillStyle = "#111827";
    ctx.fillRect(-22, -30, 14, 12);
    ctx.fillRect(8, -30, 14, 12);
    ctx.fillRect(-22, 18, 14, 12);
    ctx.fillRect(8, 18, 14, 12);
    if (tier >= 2) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(8, -7, 36 + tier * 4, 14);
    }
    if (tier >= 4) {
      ctx.fillStyle = unit.shot;
      ctx.fillRect(-20, -6, 12, 12);
      ctx.fillRect(-38, -26, 16, 10);
      ctx.fillRect(-38, 16, 16, 10);
    }
  } else if (selectedUnit === "ship") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 38 + tier * 2, 26 + tier, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#dbeafe";
    ctx.beginPath();
    ctx.arc(10, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    if (tier >= 2) {
      ctx.fillStyle = unit.shot;
      ctx.beginPath();
      ctx.ellipse(-18, -22, 22, 8, -0.35, 0, Math.PI * 2);
      ctx.ellipse(-18, 22, 22, 8, 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tier >= 4) {
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 52, -0.75, 0.75);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + tier, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(8, -8, 34 + tier * 5, 16);
    if (tier >= 2) {
      ctx.fillStyle = unit.shot;
      ctx.fillRect(-18, -24, 20, 10);
      ctx.fillRect(-18, 14, 20, 10);
    }
    if (tier >= 4) {
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 16, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawEnemy(enemy) {
  ctx.fillStyle = enemy.color;
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = enemy.boss ? 5 : 3;

  if (enemy.boss) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(lastTime / 650);
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      const radius = i % 2 === 0 ? enemy.radius + 14 : enemy.radius - 4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (enemy.type === "brute") {
    ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius, enemy.radius * 2, enemy.radius * 2);
    ctx.strokeRect(enemy.x - enemy.radius, enemy.y - enemy.radius, enemy.radius * 2, enemy.radius * 2);
  } else if (enemy.type === "sprinter") {
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.radius, enemy.y);
    ctx.lineTo(enemy.x - enemy.radius * 0.8, enemy.y - enemy.radius);
    ctx.lineTo(enemy.x - enemy.radius * 0.5, enemy.y);
    ctx.lineTo(enemy.x - enemy.radius * 0.8, enemy.y + enemy.radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (enemy.type === "shooter") {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(enemy.x - 6, enemy.y - enemy.radius - 12, 12, 28);
  } else if (enemy.type === "orbit") {
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y, enemy.radius + 6, enemy.radius - 4, lastTime / 500, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#111827";
  ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 12, enemy.radius * 2, 6);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 12, enemy.radius * 2 * Math.max(0, enemy.health / (enemy.maxHealth || 6)), 6);
}

function drawEnemyBullet(bullet) {
  ctx.fillStyle = bullet.color;
  ctx.strokeStyle = "#fee2e2";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawBullet(bullet) {
  ctx.fillStyle = bullet.missile ? "#fb923c" : bullet.color || "#fde047";
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
  ctx.font = "700 26px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText(`${playerName()} / ${units[selectedUnit].label} / ${currentMap().name}`, world.width / 2, world.height / 2 + 62);
}

function loop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function blockBrowserGesture(event) {
  if (event.target && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) {
    return;
  }
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
  if (gameState !== "playing") return;
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
  if (gameState !== "playing") return;
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

startButton.addEventListener("click", startGame);

saveScoreButton.addEventListener("click", saveScoreRecord);

restartButton.addEventListener("click", () => {
  showStartScreen();
});

unitSelect.addEventListener("change", () => {
  if (gameState === "playing") {
    unitSelect.value = selectedUnit;
    return;
  }
  selectedUnit = unitSelect.value;
  resetRoundState();
});

playerNameInput.addEventListener("input", () => {
  localStorage.setItem("jeongwoo-battle-player-name", playerNameInput.value);
  if (gameState === "ended" && !scoreSaved) renderRecords();
});

window.addEventListener("keydown", (event) => {
  if (gameState === "playing") ensureAudio();
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

loadRecords();
playerNameInput.value = localStorage.getItem("jeongwoo-battle-player-name") || playerNameInput.value;
resize();
showStartScreen();
requestAnimationFrame(loop);
