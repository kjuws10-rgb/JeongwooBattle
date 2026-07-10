const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const gameShell = document.querySelector(".game-shell");
const scoreEl = document.querySelector("#score");
const waveEl = document.querySelector("#wave");
const powerEl = document.querySelector("#power");
const healthBar = document.querySelector("#healthBar");
const healthText = document.querySelector("#healthText");
const specialBar = document.querySelector("#specialBar");
const startPanel = document.querySelector("#startPanel");
const startButton = document.querySelector("#startButton");
const gameOverPanel = document.querySelector("#gameOverPanel");
const rewardPanel = document.querySelector("#rewardPanel");
const rewardOptions = document.querySelector("#rewardOptions");
const finalScore = document.querySelector("#finalScore");
const saveScoreButton = document.querySelector("#saveScoreButton");
const restartButton = document.querySelector("#restartButton");
const moveStick = document.querySelector("#moveStick");
const moveKnob = document.querySelector("#moveKnob");
const shootButton = document.querySelector("#shootButton");
const specialButton = document.querySelector("#specialButton");
const playerNameInput = document.querySelector("#playerName");
const unitSelect = document.querySelector("#unitSelect");
const scoreList = document.querySelector("#scoreList");
const unitName = document.querySelector("#unitName");
const unitRole = document.querySelector("#unitRole");
const statRows = document.querySelector("#statRows");
const specialName = document.querySelector("#specialName");
const specialDescription = document.querySelector("#specialDescription");

const world = { width: 900, height: 1500 };
const arenaTop = 176;
const maxStage = 100;
const stageScoreStep = 320;
const bossStageInterval = 10;
const input = { x: 0, y: 0, shooting: false };
const keys = new Set();
const storageKey = "jeongwoo-battle-records-v1";
const units = {
  tank: {
    label: "탱크", role: "화력과 방어가 균형 잡힌 전방 유닛", radius: 32, speed: 300, maxHealth: 165, fireDelay: 0.3, color: "#38bdf8", shot: "#fde047",
    attack: 1.08, defense: 0.88, startPower: 1, stats: { strength: 7, speed: 4, defense: 7, durability: 8, power: 6 },
    specialName: "강철 포격", specialDescription: "보호막을 얻고 강력한 미사일 원형 폭격을 발사합니다.", special: "barrage"
  },
  jet: {
    label: "전투기", role: "빠르지만 장갑이 약한 고속 공격 유닛", radius: 25, speed: 410, maxHealth: 112, fireDelay: 0.22, color: "#f97316", shot: "#fdba74",
    attack: 1.12, defense: 1.12, startPower: 1, stats: { strength: 6, speed: 9, defense: 3, durability: 4, power: 7 },
    specialName: "애프터버너", specialDescription: "속도를 높이고 전방으로 넓은 탄막을 발사합니다.", special: "afterburner"
  },
  rover: {
    label: "로버", role: "회복과 안정적인 조작이 강점인 지원 유닛", radius: 28, speed: 360, maxHealth: 140, fireDelay: 0.24, color: "#22c55e", shot: "#bbf7d0",
    attack: 0.95, defense: 0.94, startPower: 2, stats: { strength: 5, speed: 6, defense: 6, durability: 7, power: 5 },
    specialName: "수리장", specialDescription: "에너지를 회복하고 파워를 올리며 짧은 보호를 얻습니다.", special: "repair"
  },
  ship: {
    label: "전함", role: "생존력이 강한 중장갑 비행 유닛", radius: 34, speed: 280, maxHealth: 190, fireDelay: 0.34, color: "#a855f7", shot: "#e9d5ff",
    attack: 1.02, defense: 0.82, startPower: 1, stats: { strength: 6, speed: 3, defense: 8, durability: 9, power: 6 },
    specialName: "중력파", specialDescription: "주변 적에게 피해를 주고 위험을 밀어냅니다.", special: "gravity"
  },
  mech: {
    label: "메카", role: "느리지만 가장 단단한 돌격 프레임", radius: 35, speed: 285, maxHealth: 220, fireDelay: 0.36, color: "#f43f5e", shot: "#fecdd3",
    attack: 1.25, defense: 0.78, startPower: 1, stats: { strength: 9, speed: 3, defense: 9, durability: 10, power: 8 },
    specialName: "중화기 일제사격", specialDescription: "모든 방향으로 강력한 미사일을 발사합니다.", special: "salvo"
  },
  drone: {
    label: "드론", role: "스페셜 충전이 빠른 소형 고기동 유닛", radius: 23, speed: 430, maxHealth: 105, fireDelay: 0.2, color: "#14b8a6", shot: "#99f6e4",
    attack: 0.92, defense: 1.16, startPower: 2, stats: { strength: 4, speed: 9, defense: 3, durability: 4, power: 9 },
    specialName: "군집 폭발", specialDescription: "주변으로 고속 탄막을 방출합니다.", special: "swarm", specialGain: 1.18
  },
  speeder: {
    label: "스피더", role: "생존력은 낮지만 극단적으로 빠른 유닛", radius: 24, speed: 465, maxHealth: 98, fireDelay: 0.26, color: "#eab308", shot: "#fef08a",
    attack: 1.0, defense: 1.2, startPower: 1, stats: { strength: 5, speed: 10, defense: 2, durability: 3, power: 6 },
    specialName: "시간 질주", specialDescription: "잠시 무적이 되고 적 탄환을 제거합니다.", special: "dash"
  },
  walker: {
    label: "워커", role: "근거리 제압이 강한 방어형 보행 유닛", radius: 33, speed: 310, maxHealth: 185, fireDelay: 0.29, color: "#64748b", shot: "#cbd5e1",
    attack: 1.04, defense: 0.8, startPower: 1, stats: { strength: 6, speed: 4, defense: 9, durability: 9, power: 5 },
    specialName: "방어 충격파", specialDescription: "충격파를 만들고 보호막과 소량 회복을 얻습니다.", special: "stomp"
  },
  phantom: {
    label: "팬텀", role: "순간 화력이 강한 은신형 타격 유닛", radius: 24, speed: 445, maxHealth: 115, fireDelay: 0.21, color: "#8b5cf6", shot: "#ddd6fe",
    attack: 1.18, defense: 1.08, startPower: 1, stats: { strength: 8, speed: 9, defense: 4, durability: 4, power: 8 },
    specialName: "위상 절단", specialDescription: "탄환을 지우고 안전하게 질주하며 관통탄을 날립니다.", special: "dash"
  },
  titan: {
    label: "타이탄", role: "압도적인 에너지를 가진 초중장갑 공성 유닛", radius: 38, speed: 255, maxHealth: 260, fireDelay: 0.39, color: "#b91c1c", shot: "#fecaca",
    attack: 1.32, defense: 0.72, startPower: 1, stats: { strength: 10, speed: 2, defense: 10, durability: 10, power: 7 },
    specialName: "타이탄 포화", specialDescription: "중미사일을 발사하고 추가 보호를 얻습니다.", special: "salvo"
  },
  medic: {
    label: "메딕", role: "에너지를 안정적으로 유지하는 회복 유닛", radius: 27, speed: 350, maxHealth: 150, fireDelay: 0.25, color: "#10b981", shot: "#a7f3d0",
    attack: 0.9, defense: 0.92, startPower: 2, stats: { strength: 4, speed: 6, defense: 7, durability: 8, power: 6 },
    specialName: "완전 수복", specialDescription: "에너지를 회복하고 보호 시간을 추가합니다.", special: "repair", specialGain: 1.12
  },
  artillery: {
    label: "포병", role: "강력한 미사일을 쓰는 장거리 유닛", radius: 31, speed: 285, maxHealth: 155, fireDelay: 0.33, color: "#f59e0b", shot: "#fde68a",
    attack: 1.28, defense: 0.9, startPower: 1, stats: { strength: 9, speed: 3, defense: 6, durability: 7, power: 9 },
    specialName: "대폭격", specialDescription: "강화 미사일을 넓게 퍼뜨려 발사합니다.", special: "barrage"
  },
  blade: {
    label: "블레이드", role: "제어력이 높은 근거리 고속 유닛", radius: 25, speed: 485, maxHealth: 120, fireDelay: 0.2, color: "#06b6d4", shot: "#cffafe",
    attack: 1.08, defense: 1.04, startPower: 1, stats: { strength: 7, speed: 10, defense: 4, durability: 4, power: 7 },
    specialName: "칼날 질주", specialDescription: "위험을 뚫고 질주하며 칼날 탄막을 퍼뜨립니다.", special: "dash"
  },
  nova: {
    label: "노바", role: "스페셜 제어가 강한 에너지 코어 유닛", radius: 29, speed: 365, maxHealth: 145, fireDelay: 0.24, color: "#ec4899", shot: "#fbcfe8",
    attack: 1.05, defense: 0.98, startPower: 2, stats: { strength: 6, speed: 7, defense: 5, durability: 6, power: 10 },
    specialName: "노바 파동", specialDescription: "중력 파동을 방출하고 스페셜을 빠르게 채웁니다.", special: "gravity", specialGain: 1.22
  }
};
const statLabels = {
  strength: "힘",
  speed: "속도",
  defense: "방어",
  durability: "맷집",
  power: "파워"
};
const specialMax = 100;
const shotTierColors = ["#fde047", "#fef08a", "#86efac", "#67e8f9", "#c4b5fd", "#f9a8d4", "#ffffff"];
const missileTierColors = ["#fb923c", "#fdba74", "#facc15", "#38bdf8", "#a78bfa", "#f472b6", "#ffffff"];
const itemSettings = {
  fieldSpawnBase: 13,
  fieldSpawnVariance: 8,
  fieldMissileChance: 0.38,
  fieldEnergyChance: 0.28,
  dropCubeChance: 0.28,
  dropMissileChance: 0.08,
  dropShieldChance: 0.06,
  dropEnergyChance: 0.09
};
const rewardCatalog = [
  {
    title: "에너지 50% 회복",
    description: "최대 에너지의 50%를 회복합니다.",
    apply: () => {
      player.health = Math.min(player.maxHealth, player.health + Math.ceil(player.maxHealth * 0.5));
    }
  },
  {
    title: "에너지 100% 회복",
    description: "에너지를 가득 채웁니다.",
    apply: () => {
      player.health = player.maxHealth;
    }
  },
  {
    title: "스페셜 완전 충전",
    description: "스페셜 게이지를 100% 채웁니다.",
    apply: () => {
      player.specialCharge = specialMax;
    }
  },
  {
    title: "미사일 강화",
    description: "미사일을 얻고 파워가 증가합니다.",
    apply: () => {
      player.missiles += 6;
      player.power += 2;
    }
  },
  {
    title: "최대 에너지 코어",
    description: "최대 에너지가 증가하고 같은 양만큼 회복합니다.",
    apply: () => {
      const gain = Math.ceil(player.maxHealth * 0.14);
      player.maxHealth += gain;
      player.health = Math.min(player.maxHealth, player.health + gain);
    }
  },
  {
    title: "보호막 배터리",
    description: "긴 보호막 시간과 에너지 회복을 얻습니다.",
    apply: () => {
      player.shieldTime = Math.max(player.shieldTime, 14);
      player.health = Math.min(player.maxHealth, player.health + Math.ceil(player.maxHealth * 0.25));
    }
  },
  {
    title: "파워 서지",
    description: "파워가 증가하고 스페셜이 충전됩니다.",
    apply: () => {
      player.power += 3;
      gainSpecial(35);
    }
  },
  {
    title: "오버드라이브",
    description: "일시적인 속도 상승과 미사일을 얻습니다.",
    apply: () => {
      player.boostTime = Math.max(player.boostTime, 10);
      player.missiles += 4;
    }
  }
];
const maps = [
  {
    name: "초원",
    minScore: 0,
    bg: "#14532d",
    grid: "rgba(255,255,255,0.08)",
    block: "#854d0e",
    edge: "#facc15",
    obstacles: [
      { x: 100, y: 240, w: 180, h: 80 },
      { x: 620, y: 300, w: 170, h: 90, shape: "round" },
      { x: 330, y: 610, w: 240, h: 80 },
      { x: 90, y: 930, w: 210, h: 90 },
      { x: 600, y: 1050, w: 200, h: 90, shape: "cross" },
      { x: 350, y: 1250, w: 150, h: 80, shape: "diamond" }
    ]
  },
  {
    name: "사막",
    minScore: 650,
    bg: "#92400e",
    grid: "rgba(254,243,199,0.12)",
    block: "#451a03",
    edge: "#fed7aa",
    obstacles: [
      { x: 70, y: 190, w: 230, h: 70 },
      { x: 520, y: 230, w: 270, h: 70 },
      { x: 250, y: 520, w: 120, h: 270, shape: "pillar" },
      { x: 560, y: 720, w: 120, h: 280, shape: "pillar" },
      { x: 120, y: 1120, w: 250, h: 80, shape: "diamond" },
      { x: 510, y: 1230, w: 250, h: 80 }
    ]
  },
  {
    name: "빙하",
    minScore: 1450,
    bg: "#0e7490",
    grid: "rgba(224,242,254,0.16)",
    block: "#164e63",
    edge: "#bae6fd",
    obstacles: [
      { x: 150, y: 210, w: 120, h: 260, shape: "pillar" },
      { x: 620, y: 190, w: 120, h: 260, shape: "pillar" },
      { x: 330, y: 510, w: 240, h: 90 },
      { x: 80, y: 800, w: 190, h: 180, shape: "round" },
      { x: 635, y: 800, w: 190, h: 180, shape: "round" },
      { x: 330, y: 1120, w: 240, h: 100, shape: "cross" }
    ]
  },
  {
    name: "우주",
    minScore: 2500,
    bg: "#1e1b4b",
    grid: "rgba(221,214,254,0.16)",
    block: "#312e81",
    edge: "#c4b5fd",
    obstacles: [
      { x: 120, y: 170, w: 170, h: 170, shape: "diamond" },
      { x: 610, y: 170, w: 170, h: 170, shape: "round" },
      { x: 365, y: 470, w: 170, h: 170, shape: "cross" },
      { x: 120, y: 820, w: 170, h: 170, shape: "round" },
      { x: 610, y: 820, w: 170, h: 170, shape: "diamond" },
      { x: 350, y: 1190, w: 200, h: 120, shape: "pillar" }
    ]
  },
  {
    name: "성운",
    minScore: 3900,
    bg: "#581c87",
    grid: "rgba(245,208,254,0.16)",
    block: "#701a75",
    edge: "#f0abfc",
    obstacles: [
      { x: 80, y: 230, w: 220, h: 70, shape: "diamond" },
      { x: 610, y: 250, w: 170, h: 180, shape: "round" },
      { x: 280, y: 520, w: 330, h: 70, shape: "cross" },
      { x: 90, y: 820, w: 160, h: 220, shape: "pillar" },
      { x: 640, y: 880, w: 170, h: 200, shape: "round" },
      { x: 310, y: 1210, w: 280, h: 80, shape: "diamond" }
    ]
  },
  {
    name: "코어",
    minScore: 5600,
    bg: "#7f1d1d",
    grid: "rgba(254,202,202,0.15)",
    block: "#450a0a",
    edge: "#fca5a5",
    obstacles: [
      { x: 120, y: 220, w: 130, h: 240, shape: "pillar" },
      { x: 640, y: 220, w: 130, h: 240, shape: "pillar" },
      { x: 330, y: 500, w: 240, h: 90, shape: "cross" },
      { x: 130, y: 780, w: 250, h: 80, shape: "diamond" },
      { x: 520, y: 930, w: 250, h: 80, shape: "diamond" },
      { x: 350, y: 1190, w: 200, h: 180, shape: "round" }
    ]
  }
];

const enemyTypes = {
  chaser: { label: "추격병", radius: 28, health: 3, speed: 122, color: "#a855f7", stop: 76, score: 10 },
  sprinter: { label: "질주병", radius: 22, health: 2, speed: 208, color: "#f97316", stop: 88, score: 12 },
  brute: { label: "중장병", radius: 36, health: 7, speed: 84, color: "#ef4444", stop: 92, score: 18 },
  shooter: { label: "사격병", radius: 25, health: 4, speed: 96, color: "#06b6d4", stop: 260, score: 16, shoots: true },
  orbit: { label: "회전병", radius: 24, health: 3, speed: 132, color: "#eab308", stop: 132, score: 14, orbit: true }
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
let bossTargetStage = null;
let bossActive = false;
let rewardPending = false;
let clearedBossStage = 0;

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
  boostTime: 0,
  specialCharge: 0
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
  player.maxHealth = maxHealthForTier(unit, 1);
  player.health = player.maxHealth;
  player.power = unit.startPower || 1;
  player.missiles = 0;
  player.shieldTime = 0;
  player.angle = -Math.PI / 2;
  player.invulnerable = 0;
  player.terrainCooldown = 0;
  player.boostTime = 0;
  player.specialCharge = 0;
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
  bossTargetStage = null;
  bossActive = false;
  rewardPending = false;
  clearedBossStage = 0;
  scoreSaved = false;
  visualTier = 1;
  gameOver = false;
  rebuildDynamicTerrain();
  updateHud();
  updateUnitPreview();
  renderRecords();
}

function showStartScreen() {
  resetRoundState();
  gameState = "menu";
  startPanel.hidden = false;
  gameOverPanel.hidden = true;
  rewardPanel.hidden = true;
  gameShell.classList.add("is-menu");
  gameShell.classList.remove("is-ended", "is-reward");
}

function startGame() {
  ensureAudio();
  resetRoundState();
  gameState = "playing";
  startPanel.hidden = true;
  gameOverPanel.hidden = true;
  rewardPanel.hidden = true;
  gameShell.classList.remove("is-menu", "is-ended", "is-reward");
  playStartSound();
}

function updateHud() {
  scoreEl.textContent = score;
  waveEl.textContent = bossActive ? `보스 ${bossTargetStage || playerTier()}단계` : `${currentMap().name} ${playerTier()}/${maxStage}단계`;
  const missileType = player.missiles > 0 ? ` ${missileLabel(missileKindForTier(weaponTierValue())).slice(0, 3).toUpperCase()}` : "";
  powerEl.textContent = `파워${player.power} 미사일${player.missiles}${missileType} 보호${Math.ceil(player.shieldTime)}`;
  healthBar.style.width = `${Math.max(0, (player.health / player.maxHealth) * 100)}%`;
  healthText.textContent = `${Math.max(0, Math.ceil(player.health))} / ${Math.ceil(player.maxHealth)}`;
  specialBar.style.width = `${Math.max(0, (player.specialCharge / specialMax) * 100)}%`;
  specialButton.classList.toggle("is-ready", player.specialCharge >= specialMax);
  specialButton.disabled = player.specialCharge < specialMax || gameState !== "playing";
  specialButton.title = player.specialCharge >= specialMax ? `${currentUnit().specialName} 준비 완료` : `${currentUnit().specialName} 충전 중`;
  specialButton.setAttribute("aria-label", specialButton.title);
}

function updateUnitPreview() {
  const unit = units[unitSelect.value] || units.tank;
  unitName.textContent = unit.label;
  unitRole.textContent = `${unit.role} / 에너지 ${maxHealthForTier(unit, 1)}`;
  specialName.textContent = unit.specialName;
  specialDescription.textContent = unit.specialDescription;
  specialButton.title = `${unit.specialName} 충전 중`;
  specialButton.setAttribute("aria-label", specialButton.title);
  statRows.innerHTML = "";

  Object.entries(unit.stats).forEach(([key, value]) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const label = document.createElement("span");
    label.textContent = statLabels[key] || key;

    const track = document.createElement("span");
    track.className = "stat-track";
    const fill = document.createElement("span");
    fill.className = "stat-fill";
    fill.style.width = `${value * 10}%`;
    track.appendChild(fill);

    const scoreText = document.createElement("span");
    scoreText.textContent = value;

    row.append(label, track, scoreText);
    statRows.appendChild(row);
  });
}

function currentUnit() {
  return units[selectedUnit] || units.tank;
}

function maxHealthForTier(unit, tier) {
  return Math.round(unit.maxHealth * 2 + unit.maxHealth * 0.2 * (tier - 1));
}

function tierAttackMultiplier() {
  return 1 + (playerTier() - 1) * 0.07;
}

function tierDefenseMultiplier() {
  return Math.max(0.72, 1 - (playerTier() - 1) * 0.04);
}

function tierSpeedMultiplier() {
  return 1 + (playerTier() - 1) * 0.025;
}

function attackDamage(base) {
  return Math.max(1, Math.round(base * currentUnit().attack * tierAttackMultiplier()));
}

function takeDamage(amount) {
  player.health -= Math.max(1, Math.round(amount * currentUnit().defense * tierDefenseMultiplier()));
}

function gainSpecial(amount) {
  const bonus = currentUnit().specialGain || 1;
  player.specialCharge = Math.min(specialMax, player.specialCharge + amount * bonus);
}

function tierColor(colors, tier = weaponTierValue()) {
  return colors[Math.min(colors.length - 1, tier - 1)];
}

function missileKindForTier(tier) {
  if (tier >= 6) return "gas";
  if (tier >= 5) return "homing";
  if (tier >= 4) return "boomerang";
  if (tier >= 3) return "laser";
  return "rocket";
}

function missileLabel(kind) {
  if (kind === "laser") return "레이저";
  if (kind === "boomerang") return "부메랑";
  if (kind === "homing") return "유도";
  if (kind === "gas") return "가스";
  return "로켓";
}

function createMissile(angle, tier, bonusDamage = 0, radiusBonus = 0) {
  const kind = missileKindForTier(tier);
  const speedByKind = {
    rocket: 560 + tier * 24,
    laser: 900 + tier * 18,
    boomerang: 500 + tier * 18,
    homing: 470 + tier * 16,
    gas: 430 + tier * 12
  };
  const radiusByKind = {
    rocket: 15,
    laser: 7,
    boomerang: 16,
    homing: 14,
    gas: 18
  };
  const damageByKind = {
    rocket: 5,
    laser: 7,
    boomerang: 6,
    homing: 6,
    gas: 4
  };

  return {
    x: player.x + Math.cos(angle) * 42,
    y: player.y + Math.sin(angle) * 42,
    vx: Math.cos(angle) * speedByKind[kind],
    vy: Math.sin(angle) * speedByKind[kind],
    radius: radiusByKind[kind] + Math.floor(tier / 3) + radiusBonus,
    damage: attackDamage(damageByKind[kind] + Math.floor(player.power / 2) + Math.floor(tier / 2) + bonusDamage),
    life: kind === "laser" ? 0.42 : 1.35 + tier * 0.06,
    color: tierColor(missileTierColors),
    tier,
    missile: true,
    kind,
    age: 0,
    turnTime: 0.42,
    pierce: kind === "laser" ? 2 : 0,
    label: missileLabel(kind)
  };
}

function fireRadialShots(count, speed, damage, radius, missile = false) {
  if (gameState !== "playing" || gameOver) return;

  const tier = weaponTierValue();
  const kind = missile ? missileKindForTier(tier) : null;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    bullets.push({
      x: player.x + Math.cos(angle) * (player.radius + 12),
      y: player.y + Math.sin(angle) * (player.radius + 12),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      damage: attackDamage(damage),
      life: missile ? 1.35 : 0.9,
      color: missile ? tierColor(missileTierColors) : tierColor(shotTierColors),
      tier,
      missile,
      kind,
      age: 0,
      turnTime: 0.42,
      pierce: kind === "laser" ? 2 : 0
    });
  }
}

function damageEnemiesInRadius(radius, damage, push) {
  enemies.forEach((enemy) => {
    const dist = distance(player, enemy);
    if (dist > radius) return;

    enemy.health -= attackDamage(enemy.boss ? damage * 0.65 : damage);
    if (push > 0 && dist > 1) {
      const force = ((radius - dist) / radius) * push;
      enemy.x += ((enemy.x - player.x) / dist) * force;
      enemy.y += ((enemy.y - player.y) / dist) * force;
      clampToArena(enemy);
      resolveCircleObstacles(enemy);
    }
    addParticles(enemy.x, enemy.y, currentUnit().shot, 8);
  });
}

function useSpecial() {
  if (gameState !== "playing" || gameOver || player.specialCharge < specialMax) return;

  ensureAudio();
  const unit = currentUnit();
  player.specialCharge = 0;
  addParticles(player.x, player.y, unit.shot, 34);

  if (unit.special === "barrage") {
    player.shieldTime = Math.max(player.shieldTime, 7);
    fireRadialShots(10, 590, 5 + player.power, 14, true);
    playTone(120, 0.2, "sawtooth", 0.09);
  } else if (unit.special === "afterburner") {
    player.boostTime = Math.max(player.boostTime, 5.5);
    for (let i = -4; i <= 4; i += 1) {
      const angle = player.angle + i * 0.16;
      bullets.push({
        x: player.x + Math.cos(angle) * 42,
        y: player.y + Math.sin(angle) * 42,
        vx: Math.cos(angle) * 900,
        vy: Math.sin(angle) * 900,
        radius: 9,
        damage: attackDamage(3 + Math.floor(player.power / 2)),
        life: 0.75,
        color: unit.shot
      });
    }
    playTone(760, 0.12, "square", 0.08);
  } else if (unit.special === "repair") {
    player.health = Math.min(player.maxHealth, player.health + Math.round(player.maxHealth * 0.38));
    player.power += 1;
    player.shieldTime = Math.max(player.shieldTime, 4);
    playTone(840, 0.16, "triangle", 0.08);
  } else if (unit.special === "gravity") {
    damageEnemiesInRadius(280, 8 + player.power, 90);
    enemyBullets = enemyBullets.filter((bullet) => distance(player, bullet) > 320);
    player.invulnerable = Math.max(player.invulnerable, 1);
    playTone(180, 0.24, "sine", 0.09);
  } else if (unit.special === "salvo") {
    fireRadialShots(14, 540, 8 + player.power, 16, true);
    player.missiles += 2;
    playTone(92, 0.28, "sawtooth", 0.1);
  } else if (unit.special === "swarm") {
    fireRadialShots(18, 820, 3 + Math.floor(player.power / 2), 7, false);
    window.setTimeout(() => fireRadialShots(18, 760, 2 + Math.floor(player.power / 2), 7, false), 130);
    playTone(980, 0.1, "square", 0.075);
  } else if (unit.special === "dash") {
    player.boostTime = Math.max(player.boostTime, 6.5);
    player.invulnerable = Math.max(player.invulnerable, 2.1);
    enemyBullets = [];
    fireRadialShots(8, 860, 3 + player.power, 8, false);
    playTone(1120, 0.12, "triangle", 0.08);
  } else if (unit.special === "stomp") {
    player.shieldTime = Math.max(player.shieldTime, 6);
    player.health = Math.min(player.maxHealth, player.health + 18);
    damageEnemiesInRadius(235, 7 + player.power, 120);
    playTone(140, 0.22, "sawtooth", 0.09);
  }

  updateMapByScore();
  updateHud();
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
  return clamp(1 + Math.floor(score / stageScoreStep), 1, maxStage);
}

function visualTierValue() {
  return clamp(1 + Math.floor((playerTier() - 1) / 10), 1, 12);
}

function weaponTierValue() {
  return clamp(1 + Math.floor((playerTier() - 1) / 14), 1, 7);
}

function mapIndexForStage(stage) {
  return clamp(Math.floor((stage - 1) / 17), 0, maps.length - 1);
}

function stageDifficulty() {
  return playerTier();
}

function rebuildDynamicTerrain() {
  const map = currentMap();
  const level = Math.max(currentMapIndex + 1, visualTierValue());
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
      const force = 190 + visualTierValue() * 22;
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
    applyPlayerTierUpgrade(nextTier);
    rebuildDynamicTerrain();
    addParticles(player.x, player.y, units[selectedUnit].shot, 42);
    playTone(520 + nextTier * 70, 0.18, "triangle", 0.08);
  }

  if (rewardPending || bossActive) return;

  const nextMapIndex = mapIndexForStage(nextTier);
  if (nextMapIndex > unlockedMapIndex) {
    spawnBoss(nextMapIndex, nextTier, true);
    return;
  }

  const nextBossStage = Math.floor(nextTier / bossStageInterval) * bossStageInterval;
  if (nextBossStage >= bossStageInterval && nextBossStage > clearedBossStage) {
    spawnBoss(currentMapIndex, nextBossStage, false);
  }
}

function applyPlayerTierUpgrade(tier) {
  const targetMaxHealth = maxHealthForTier(currentUnit(), tier);
  if (targetMaxHealth > player.maxHealth) {
    const gain = targetMaxHealth - player.maxHealth;
    player.maxHealth = targetMaxHealth;
    player.health = Math.min(player.maxHealth, player.health + Math.ceil(gain * 0.82));
  }

  player.power += 1;
  gainSpecial(12);
}

function spawnBoss(targetMapIndex, targetStage = playerTier(), unlockMap = true) {
  bossActive = true;
  bossTargetMapIndex = unlockMap ? targetMapIndex : null;
  bossTargetStage = targetStage;
  enemies = [];
  enemyBullets = [];
  const targetMap = maps[targetMapIndex];
  const bossLevel = targetStage;
  const bossHealth = 110 + targetStage * 18 + targetStage * targetStage * 1.8 + targetMapIndex * 80;
  enemies.push({
    type: "boss",
    boss: true,
    bossLevel,
    x: world.width / 2,
    y: arenaTop + 170,
    radius: 58 + Math.min(22, Math.floor(targetStage / 5)) + targetMapIndex * 3,
    health: bossHealth,
    maxHealth: bossHealth,
    speed: 72 + targetMapIndex * 8 + targetStage * 0.9,
    color: targetMap.edge,
    stopDistance: 225,
    scoreValue: 90 + targetStage * 12 + targetMapIndex * 55,
    shootCooldown: 0.85,
    bulletDamage: 8 + targetMapIndex * 3 + Math.floor(targetStage / 8),
    bulletSpeed: 200 + targetMapIndex * 16 + targetStage * 1.6,
    contactDamage: 14 + targetMapIndex * 5 + Math.floor(targetStage / 6),
    volley: 3 + Math.floor(targetStage / 20),
    pulse: 0
  });
  addParticles(world.width / 2, arenaTop + 170, targetMap.edge, 64);
  playTone(120, 0.24, "sawtooth", 0.1);
  window.setTimeout(() => playTone(220, 0.22, "sawtooth", 0.09), 180);
  updateHud();
}

function clearBoss(enemy) {
  if (!enemy.boss) return;

  if (bossTargetMapIndex != null) {
    unlockedMapIndex = bossTargetMapIndex;
    currentMapIndex = unlockedMapIndex;
  }
  if (bossTargetStage != null) {
    clearedBossStage = Math.max(clearedBossStage, bossTargetStage);
  }
  bossTargetMapIndex = null;
  bossTargetStage = null;
  bossActive = false;
  rewardPending = true;
  enemyBullets = [];
  rebuildDynamicTerrain();
  addParticles(player.x, player.y, currentMap().edge, 76);
  playTone(392, 0.14, "triangle", 0.085);
  window.setTimeout(() => playTone(523.25, 0.16, "triangle", 0.085), 130);
  window.setTimeout(() => showRewardChoices(), 220);
}

function randomRewards() {
  return [...rewardCatalog]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
}

function showRewardChoices() {
  if (gameOver) return;

  gameState = "reward";
  input.shooting = false;
  rewardOptions.innerHTML = "";
  randomRewards().forEach((reward) => {
    const button = document.createElement("button");
    button.className = "reward-option";
    button.type = "button";
    const title = document.createElement("strong");
    title.textContent = reward.title;
    const description = document.createElement("span");
    description.textContent = reward.description;
    button.append(title, description);
    button.addEventListener("click", () => chooseReward(reward), { once: true });
    rewardOptions.appendChild(button);
  });
  rewardPanel.hidden = false;
  gameShell.classList.add("is-reward");
  updateHud();
}

function chooseReward(reward) {
  reward.apply();
  rewardPending = false;
  rewardPanel.hidden = true;
  gameShell.classList.remove("is-reward");
  gameState = "playing";
  addParticles(player.x, player.y, currentMap().edge, 40);
  playTone(880, 0.14, "triangle", 0.07);
  updateHud();
  updateMapByScore();
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
    item.textContent = `${record.name} ${record.score}점 ${record.unit}`;
    if (record.pending) item.className = "pending-record";
    scoreList.appendChild(item);
  });

  if (shownRecords.length === 0) {
    const item = document.createElement("li");
    item.textContent = "기록 없음";
    scoreList.appendChild(item);
  }
}

function playerName() {
  const name = playerNameInput.value.trim();
  return name || "플레이어";
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
  saveScoreButton.textContent = "저장 완료";
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
  if (bossActive && enemies.some((enemy) => enemy.boss)) return;

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
  const stage = stageDifficulty();
  enemies.push({
    type,
    x,
    y,
    radius: spec.radius,
    health: spec.health + levelBonus + currentMapIndex * 2 + Math.floor(stage / 5),
    maxHealth: spec.health + levelBonus + currentMapIndex * 2 + Math.floor(stage / 5),
    speed: spec.speed + wave * 4 + currentMapIndex * 10 + stage * 0.9,
    color: spec.color,
    stopDistance: spec.stop,
    scoreValue: spec.score + currentMapIndex * 4,
    contactDamage: 10 + currentMapIndex * 3 + Math.floor(wave / 5) + Math.floor(stage / 12),
    bulletDamage: 9 + currentMapIndex * 2 + Math.floor(wave / 6) + Math.floor(stage / 15),
    bulletSpeed: 330 + currentMapIndex * 24 + stage * 1.2,
    shootCooldown: Math.max(0.45, 0.9 - currentMapIndex * 0.05) + Math.random() * 0.8,
    orbitDir: Math.random() < 0.5 ? -1 : 1
  });
}

function chooseEnemyType() {
  const stage = stageDifficulty();
  const options = ["chaser"];
  if (wave >= 2 || stage >= 2) options.push("sprinter");
  if (wave >= 3 || stage >= 3) options.push("brute");
  if (wave >= 4 || stage >= 4) options.push("shooter");
  if (wave >= 5 || stage >= 5) options.push("orbit");
  if (stage >= 4) options.push("shooter", "brute");
  if (stage >= 5) options.push("orbit", "sprinter");
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
        const level = enemy.bossLevel || currentMapIndex + 1;
        const volley = enemy.volley || 3;
        const center = (volley - 1) / 2;
        const bossBulletRadius = 10 + Math.min(10, Math.floor(level / 12));
        for (let i = 0; i < volley; i += 1) {
          shootEnemyBullet(enemy, angle + (i - center) * 0.18, enemy.bulletSpeed, bossBulletRadius, enemy.bulletDamage);
        }
        if (level >= 4) {
          shootEnemyBullet(enemy, angle + Math.PI * 0.5, enemy.bulletSpeed * 0.86, 9, Math.max(12, enemy.bulletDamage - 3));
          shootEnemyBullet(enemy, angle - Math.PI * 0.5, enemy.bulletSpeed * 0.86, 9, Math.max(12, enemy.bulletDamage - 3));
        }
        enemy.shootCooldown = Math.max(0.44, 1.05 - level * 0.08);
      } else {
        shootEnemyBullet(enemy, angle, enemy.bulletSpeed || 330, 8, enemy.bulletDamage || 9);
        enemy.shootCooldown = Math.max(0.55, 1.2 - currentMapIndex * 0.08) + Math.random() * 0.7;
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

  const tier = weaponTierValue();
  bulletTimer = Math.max(0.1, currentUnit().fireDelay - player.power * 0.018);
  const spread = Math.min(3, Math.floor(player.power / 3));
  const damage = attackDamage(1 + Math.floor(player.power / 4) + Math.floor((tier - 1) / 3));
  const shotSpeed = 760 + tier * 24;
  const shotRadius = 8 + Math.floor((tier - 1) / 2);
  playTone(420, 0.06, "square", 0.04);

  for (let i = -spread; i <= spread; i += 1) {
    const angle = player.angle + i * 0.13;
    bullets.push({
      x: player.x + Math.cos(angle) * 34,
      y: player.y + Math.sin(angle) * 34,
      vx: Math.cos(angle) * shotSpeed,
      vy: Math.sin(angle) * shotSpeed,
      radius: shotRadius,
      damage,
      life: 0.82 + tier * 0.035,
      color: tierColor(shotTierColors),
      tier
    });
  }

  if (player.missiles > 0) {
    player.missiles -= 1;
    bullets.push(createMissile(player.angle, tier));
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
  const roll = Math.random();
  const type = roll < itemSettings.fieldMissileChance ? "missile" : roll < itemSettings.fieldMissileChance + itemSettings.fieldEnergyChance ? "energy" : "shield";
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

function nearestEnemyForBullet(bullet, range) {
  let nearest = null;
  let nearestDistance = range;

  enemies.forEach((enemy) => {
    const dist = distance(bullet, enemy);
    if (dist < nearestDistance) {
      nearest = enemy;
      nearestDistance = dist;
    }
  });

  return nearest;
}

function steerBulletToward(bullet, target, turnRate) {
  if (!target) return;

  const currentSpeed = Math.max(1, Math.hypot(bullet.vx, bullet.vy));
  const currentAngle = Math.atan2(bullet.vy, bullet.vx);
  const targetAngle = Math.atan2(target.y - bullet.y, target.x - bullet.x);
  let delta = targetAngle - currentAngle;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  const nextAngle = currentAngle + clamp(delta, -turnRate, turnRate);
  bullet.vx = Math.cos(nextAngle) * currentSpeed;
  bullet.vy = Math.sin(nextAngle) * currentSpeed;
}

function updatePlayerBullet(bullet, dt) {
  bullet.age = (bullet.age || 0) + dt;

  if (bullet.kind === "homing") {
    steerBulletToward(bullet, nearestEnemyForBullet(bullet, 420), 0.11);
  } else if (bullet.kind === "boomerang" && bullet.age > bullet.turnTime) {
    steerBulletToward(bullet, player, 0.16);
  } else if (bullet.kind === "gas" && Math.random() < 0.45) {
    addParticles(bullet.x, bullet.y, "#bef264", 2);
  }

  bullet.x += bullet.vx * dt;
  bullet.y += bullet.vy * dt;
  bullet.life -= dt;
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

  const speedBoost = (player.boostTime > 0 ? 1.18 : 1) * tierSpeedMultiplier();
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
    spawnTimer = Math.max(0.18, 1.25 - wave * 0.045 - currentMapIndex * 0.08 - playerTier() * 0.004);
  }

  itemTimer -= dt;
  if (itemTimer <= 0) {
    spawnFieldItem();
    itemTimer = itemSettings.fieldSpawnBase + Math.random() * itemSettings.fieldSpawnVariance;
  }

  bulletTimer = Math.max(0, bulletTimer - dt);
  if (input.shooting || keys.has(" ")) shoot();

  bullets.forEach((bullet) => updatePlayerBullet(bullet, dt));
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
        if (bullet.pierce > 0) bullet.pierce -= 1;
        else bullet.life = 0;
        enemy.health -= bullet.damage;
        addParticles(bullet.x, bullet.y, "#fde68a", 4);
        if (bullet.kind === "gas") {
          enemies.forEach((nearby) => {
            if (nearby !== enemy && distance(enemy, nearby) < 170) {
              nearby.health -= Math.max(2, Math.ceil(bullet.damage * 0.7));
              addParticles(nearby.x, nearby.y, "#bef264", 6);
            }
          });
          addParticles(enemy.x, enemy.y, "#bef264", 34);
          playTone(180, 0.2, "triangle", 0.08);
        } else if (bullet.missile && bullet.kind !== "laser") {
          enemies.forEach((nearby) => {
            if (nearby !== enemy && distance(enemy, nearby) < 130) {
              nearby.health -= Math.ceil(bullet.damage / 2);
            }
          });
          addParticles(enemy.x, enemy.y, "#fb923c", 24);
          playTone(82, 0.24, "sawtooth", 0.1);
        } else if (bullet.kind === "laser") {
          addParticles(enemy.x, enemy.y, "#67e8f9", 18);
          playTone(980, 0.08, "sawtooth", 0.06);
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
        takeDamage(bullet.damage);
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
    gainSpecial(enemy.boss ? 35 : 6);
    const roll = Math.random();
    const missileLimit = itemSettings.dropCubeChance + itemSettings.dropMissileChance;
    const shieldLimit = missileLimit + itemSettings.dropShieldChance;
    const energyLimit = shieldLimit + itemSettings.dropEnergyChance;
    if (roll < itemSettings.dropCubeChance) {
      cubes.push({ x: enemy.x, y: enemy.y, radius: 13 });
    } else if (roll < missileLimit) {
      items.push({ type: "missile", x: enemy.x, y: enemy.y, radius: 16, ttl: 12 });
    } else if (roll < shieldLimit) {
      items.push({ type: "shield", x: enemy.x, y: enemy.y, radius: 16, ttl: 12 });
    } else if (roll < energyLimit) {
      items.push({ type: "energy", x: enemy.x, y: enemy.y, radius: 17, ttl: 12 });
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
        takeDamage(enemy.boss ? enemy.contactDamage || 22 : enemy.contactDamage || 10);
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
      player.maxHealth = Math.min(maxHealthForTier(currentUnit(), playerTier()) + 72, player.maxHealth + 4);
      player.health = Math.min(player.maxHealth, player.health + 18);
      score += 5;
      gainSpecial(5);
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
        gainSpecial(8);
        addParticles(item.x, item.y, "#fb923c", 18);
        playTone(980, 0.08, "square", 0.055);
      } else if (item.type === "shield") {
        player.shieldTime = Math.max(player.shieldTime, 8);
        gainSpecial(8);
        addParticles(item.x, item.y, "#93c5fd", 20);
        playTone(620, 0.18, "sine", 0.055);
      } else {
        player.health = Math.min(player.maxHealth, player.health + Math.ceil(player.maxHealth * 0.32));
        gainSpecial(6);
        addParticles(item.x, item.y, "#86efac", 22);
        playTone(740, 0.16, "triangle", 0.06);
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
  finalScore.textContent = `점수 ${score}`;
  saveScoreButton.disabled = false;
  saveScoreButton.textContent = "점수 저장";
  startPanel.hidden = true;
  gameOverPanel.hidden = false;
  rewardPanel.hidden = true;
  gameShell.classList.add("is-ended");
  gameShell.classList.remove("is-reward");
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
  currentObstacles().forEach((obstacle) => drawObstacleShape(obstacle));
}

function drawObstacleShape({ x, y, w, h, shape }) {
  if (shape === "round") {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (shape === "diamond") {
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape === "pillar") {
    const cap = Math.min(w, h) * 0.22;
    ctx.beginPath();
    ctx.moveTo(x + cap, y);
    ctx.lineTo(x + w - cap, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + cap);
    ctx.lineTo(x + w, y + h - cap);
    ctx.quadraticCurveTo(x + w, y + h, x + w - cap, y + h);
    ctx.lineTo(x + cap, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - cap);
    ctx.lineTo(x, y + cap);
    ctx.quadraticCurveTo(x, y, x + cap, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.32, y + 12);
    ctx.lineTo(x + w * 0.32, y + h - 12);
    ctx.moveTo(x + w * 0.68, y + 12);
    ctx.lineTo(x + w * 0.68, y + h - 12);
    ctx.stroke();
    ctx.restore();
  } else if (shape === "cross") {
    const barW = Math.max(34, w * 0.34);
    const barH = Math.max(34, h * 0.34);
    ctx.fillRect(x + (w - barW) / 2, y, barW, h);
    ctx.fillRect(x, y + (h - barH) / 2, w, barH);
    ctx.strokeRect(x + (w - barW) / 2, y, barW, h);
    ctx.strokeRect(x, y + (h - barH) / 2, w, barH);
  } else {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }
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
      ctx.fillText("점프", object.x + object.w / 2, object.y + object.h * 0.58);
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
  if (map.name === "사막") {
    ctx.fillStyle = "#fbbf24";
    for (let i = 0; i < 18; i += 1) {
      ctx.beginPath();
      ctx.arc((i * 131) % world.width, 120 + ((i * 211) % 1250), 18 + (i % 4) * 8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (map.name === "빙하") {
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
  } else if (map.name === "우주") {
    ctx.fillStyle = "#f8fafc";
    for (let i = 0; i < 64; i += 1) {
      ctx.fillRect((i * 67) % world.width, (i * 149) % world.height, 3, 3);
    }
  } else if (map.name === "성운") {
    ctx.strokeStyle = "#f5d0fe";
    ctx.lineWidth = 4;
    for (let i = 0; i < 14; i += 1) {
      const x = 70 + ((i * 181) % 760);
      const y = 210 + ((i * 137) % 1160);
      ctx.beginPath();
      ctx.arc(x, y, 28 + (i % 3) * 12, 0.2, Math.PI * 1.7);
      ctx.stroke();
    }
  } else if (map.name === "코어") {
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
  const tier = visualTierValue();
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
  } else if (selectedUnit === "mech") {
    ctx.beginPath();
    ctx.moveTo(28 + tier * 2, -22 - tier);
    ctx.lineTo(36 + tier * 2, 0);
    ctx.lineTo(28 + tier * 2, 22 + tier);
    ctx.lineTo(-20 - tier, 28 + tier);
    ctx.lineTo(-36 - tier, 12);
    ctx.lineTo(-36 - tier, -12);
    ctx.lineTo(-20 - tier, -28 - tier);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.fillRect(-28 - tier, -34 - tier, 22, 18);
    ctx.fillRect(-28 - tier, 16 + tier, 22, 18);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(8, -9, 42 + tier * 6, 18);
    if (tier >= 3) {
      ctx.fillStyle = unit.shot;
      ctx.fillRect(-6, -32, 16, 12);
      ctx.fillRect(-6, 20, 16, 12);
    }
  } else if (selectedUnit === "drone") {
    const rotor = 17 + tier;
    [[-30, -24], [-30, 24], [30, -24], [30, 24]].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, rotor, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = unit.shot;
      ctx.beginPath();
      ctx.moveTo(rx - rotor, ry);
      ctx.lineTo(rx + rotor, ry);
      ctx.moveTo(rx, ry - rotor);
      ctx.lineTo(rx, ry + rotor);
      ctx.stroke();
      ctx.strokeStyle = "#f8fafc";
    });
    ctx.beginPath();
    ctx.arc(0, 0, 22 + tier, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(8, -6, 28 + tier * 4, 12);
    if (tier >= 4) {
      ctx.strokeStyle = unit.shot;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (selectedUnit === "speeder") {
    ctx.beginPath();
    ctx.moveTo(48 + tier * 3, 0);
    ctx.lineTo(0, -20 - tier);
    ctx.lineTo(-34 - tier, -12);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-34 - tier, 12);
    ctx.lineTo(0, 20 + tier);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.fillRect(-10, -8, 22, 16);
    if (tier >= 2) {
      ctx.fillStyle = unit.shot;
      ctx.fillRect(-42, -18, 18, 8);
      ctx.fillRect(-42, 10, 18, 8);
    }
    if (tier >= 4) {
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(14, -26);
      ctx.lineTo(36, 0);
      ctx.lineTo(14, 26);
      ctx.stroke();
    }
  } else if (selectedUnit === "walker") {
    [[-22, -30], [14, -30], [-22, 18], [14, 18]].forEach(([lx, ly]) => {
      ctx.fillRect(lx - tier, ly - tier, 18 + tier * 2, 20 + tier);
      ctx.strokeRect(lx - tier, ly - tier, 18 + tier * 2, 20 + tier);
    });
    ctx.fillRect(-30 - tier, -22 - tier, 60 + tier * 2, 44 + tier * 2);
    ctx.strokeRect(-30 - tier, -22 - tier, 60 + tier * 2, 44 + tier * 2);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(10, -8, 38 + tier * 5, 16);
    if (tier >= 3) {
      ctx.strokeStyle = unit.shot;
      ctx.lineWidth = 5;
      ctx.strokeRect(-20, -12, 28, 24);
    }
  } else if (selectedUnit === "phantom") {
    ctx.globalAlpha *= 0.9;
    ctx.beginPath();
    ctx.moveTo(42 + tier * 2, 0);
    ctx.lineTo(-10, -28 - tier);
    ctx.lineTo(-30 - tier, 0);
    ctx.lineTo(-10, 28 + tier);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = unit.shot;
    ctx.beginPath();
    ctx.moveTo(-18, -20);
    ctx.lineTo(18 + tier * 3, 0);
    ctx.lineTo(-18, 20);
    ctx.stroke();
  } else if (selectedUnit === "titan") {
    ctx.fillRect(-36 - tier, -28 - tier, 72 + tier * 2, 56 + tier * 2);
    ctx.strokeRect(-36 - tier, -28 - tier, 72 + tier * 2, 56 + tier * 2);
    ctx.fillStyle = "#111827";
    ctx.fillRect(-46, -36, 22, 18);
    ctx.fillRect(-46, 18, 22, 18);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(8, -11, 54 + tier * 6, 22);
  } else if (selectedUnit === "medic") {
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + tier, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(-7, -24, 14, 48);
    ctx.fillRect(-24, -7, 48, 14);
    ctx.fillStyle = unit.shot;
    ctx.fillRect(14, -7, 34 + tier * 4, 14);
  } else if (selectedUnit === "artillery") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 34 + tier, 24 + tier, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.fillRect(-28, -30, 20, 12);
    ctx.fillRect(-28, 18, 20, 12);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(4, -13, 62 + tier * 6, 26);
  } else if (selectedUnit === "blade") {
    ctx.beginPath();
    ctx.moveTo(46 + tier * 3, 0);
    ctx.lineTo(-8, -18 - tier);
    ctx.lineTo(-34 - tier, -30 - tier);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-34 - tier, 30 + tier);
    ctx.lineTo(-8, 18 + tier);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = unit.shot;
    ctx.beginPath();
    ctx.moveTo(-2, -28);
    ctx.lineTo(30 + tier * 3, 0);
    ctx.lineTo(-2, 28);
    ctx.stroke();
  } else if (selectedUnit === "nova") {
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + tier, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = unit.shot;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 12, 0.25, Math.PI * 1.75);
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(8, 0, 10 + tier, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(12, -5, 36 + tier * 4, 10);
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
  drawUnitUpgradeFx(unit, tier);
}

function drawUnitUpgradeFx(unit, tier) {
  if (tier < 5) return;

  ctx.save();
  ctx.strokeStyle = unit.shot;
  ctx.fillStyle = unit.shot;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.86;
  ctx.beginPath();
  ctx.arc(0, 0, player.radius + 18, -0.82, 0.82);
  ctx.arc(0, 0, player.radius + 18, Math.PI - 0.82, Math.PI + 0.82);
  ctx.stroke();

  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.moveTo(-player.radius - 10, -18);
  ctx.lineTo(-player.radius - 26 - tier, -7);
  ctx.lineTo(-player.radius - 10, 0);
  ctx.lineTo(-player.radius - 26 - tier, 7);
  ctx.lineTo(-player.radius - 10, 18);
  ctx.stroke();

  if (tier >= 6) {
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(0, 0, 6 + tier, 0, Math.PI * 2);
    ctx.fill();
  }

  if (tier >= 7) {
    ctx.globalAlpha = 0.52;
    ctx.rotate(lastTime / 500);
    ctx.strokeStyle = "#f8fafc";
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const inner = player.radius + 24;
      const outer = player.radius + 34;
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    }
    ctx.stroke();
  }
  ctx.restore();
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
  const tier = bullet.tier || 1;
  ctx.save();
  ctx.translate(bullet.x, bullet.y);
  ctx.rotate(Math.atan2(bullet.vy, bullet.vx));

  if (bullet.missile) {
    ctx.fillStyle = bullet.color || tierColor(missileTierColors);
    ctx.strokeStyle = "#fed7aa";
    ctx.lineWidth = 3 + Math.min(3, Math.floor(tier / 2));
    if (bullet.kind === "laser") {
      ctx.fillStyle = "#67e8f9";
      ctx.fillRect(-bullet.radius * 2, -4, bullet.radius * 8 + tier * 5, 8);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, -2, bullet.radius * 5 + tier * 3, 4);
    } else if (bullet.kind === "boomerang") {
      ctx.beginPath();
      ctx.arc(0, 0, bullet.radius + 8, -0.9, 0.9);
      ctx.arc(0, 0, bullet.radius - 2, 0.55, -0.55, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (bullet.kind === "gas") {
      ctx.fillStyle = "#84cc16";
      ctx.globalAlpha = 0.86;
      ctx.beginPath();
      ctx.arc(0, 0, bullet.radius + 6, 0, Math.PI * 2);
      ctx.arc(-8, -4, bullet.radius * 0.72, 0, Math.PI * 2);
      ctx.arc(8, 5, bullet.radius * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#ecfccb";
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(bullet.radius + 8 + tier, 0);
      ctx.lineTo(-bullet.radius, -bullet.radius * 0.62);
      ctx.lineTo(-bullet.radius * 0.72, 0);
      ctx.lineTo(-bullet.radius, bullet.radius * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (bullet.kind === "homing") {
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(2, 0, 4 + tier * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = tier >= 4 ? "#fef08a" : "#fee2e2";
      ctx.beginPath();
      ctx.moveTo(-bullet.radius - 2, 0);
      ctx.lineTo(-bullet.radius - 14 - tier * 2, -6 - tier);
      ctx.lineTo(-bullet.radius - 10 - tier, 0);
      ctx.lineTo(-bullet.radius - 14 - tier * 2, 6 + tier);
      ctx.closePath();
      ctx.fill();
    }
  } else if (tier >= 5) {
    ctx.fillStyle = bullet.color || tierColor(shotTierColors);
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bullet.radius + 8, 0);
    ctx.lineTo(0, -bullet.radius);
    ctx.lineTo(-bullet.radius - 5, 0);
    ctx.lineTo(0, bullet.radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.36;
    ctx.beginPath();
    ctx.arc(0, 0, bullet.radius + 9, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = bullet.color || tierColor(shotTierColors);
    ctx.beginPath();
    ctx.arc(0, 0, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
    if (tier >= 3) {
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.restore();
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
  } else if (item.type === "shield") {
    ctx.fillStyle = "#60a5fa";
    ctx.strokeStyle = "#dbeafe";
  } else {
    ctx.fillStyle = "#86efac";
    ctx.strokeStyle = "#dcfce7";
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
  ctx.fillText(item.type === "missile" ? "미" : item.type === "shield" ? "보" : "에", item.x, item.y + 1);
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
  ctx.fillText("게임 종료", world.width / 2, world.height / 2 - 40);
  ctx.font = "700 34px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText(`점수 ${score}`, world.width / 2, world.height / 2 + 20);
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

specialButton.addEventListener("pointerdown", (event) => {
  if (gameState !== "playing") return;
  event.preventDefault();
  specialButton.setPointerCapture(event.pointerId);
  useSpecial();
});

specialButton.addEventListener("pointerup", (event) => {
  event.preventDefault();
  if (specialButton.hasPointerCapture(event.pointerId)) {
    specialButton.releasePointerCapture(event.pointerId);
  }
});

specialButton.addEventListener("pointercancel", () => {});

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
  updateUnitPreview();
});

playerNameInput.addEventListener("input", () => {
  localStorage.setItem("jeongwoo-battle-player-name", playerNameInput.value);
  if (gameState === "ended" && !scoreSaved) renderRecords();
});

window.addEventListener("keydown", (event) => {
  if (gameState === "playing") ensureAudio();
  if ((event.key === "e" || event.key === "E") && gameState === "playing") {
    event.preventDefault();
    useSpecial();
    return;
  }
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
