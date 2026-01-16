// ================= CONFIG =================
const TILE = 32;
const MAP_W = 120;
const MAP_H = 120;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;

// ================= PLAYER =================
const player = {
  x: 15 * TILE,
  y: 15 * TILE,
  w: 26,
  h: 26,
  speed: 3,
  dir: "down",
  hearts: 3,
  maxHearts: 3,
  damage: 1,
  rupees: 20,
  attacking: false
};

// ================= CAMERA =================
const camera = { x: 0, y: 0 };

// ================= MAP =================
// 0 hierba | 1 arbol | 2 agua | 3 roca | 4 suelo poblado | 5 tienda
const map = Array.from({ length: MAP_H }, () =>
  Array.from({ length: MAP_W }, () => {
    const r = Math.random();
    if (r < 0.03) return 1;
    if (r < 0.05) return 3;
    return 0;
  })
);

// Bordes de agua
for (let y = 0; y < MAP_H; y++) {
  for (let x = 0; x < MAP_W; x++) {
    if (x < 2 || y < 2 || x > MAP_W - 3 || y > MAP_H - 3) {
      map[y][x] = 2;
    }
  }
}

// ================= POBLADO =================
const villageX = 50;
const villageY = 50;

for (let y = villageY; y < villageY + 10; y++) {
  for (let x = villageX; x < villageX + 12; x++) {
    map[y][x] = 4;
  }
}

// Tienda
map[villageY + 4][villageX + 5] = 5;

// ================= ENEMIES =================
const enemies = [];
for (let i = 0; i < 15; i++) {
  enemies.push({
    x: Math.random() * MAP_W * TILE,
    y: Math.random() * MAP_H * TILE,
    w: 26,
    h: 26,
    speed: 1,
    hp: 2,
    alive: true,
    chasing: false
  });
}

// ================= INPUT =================
const keys = {};
window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === "k") attack();
});
window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// ================= COLLISION =================
function blocked(x, y) {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  return [1, 2, 3].includes(map[ty]?.[tx]);
}

// ================= ATTACK =================
function attack() {
  if (player.attacking) return;
  player.attacking = true;

  setTimeout(() => player.attacking = false, 200);

  let hitX = player.x;
  let hitY = player.y;

  if (player.dir === "up") hitY -= 28;
  if (player.dir === "down") hitY += 28;
  if (player.dir === "left") hitX -= 28;
  if (player.dir === "right") hitX += 28;

  enemies.forEach(e => {
    if (!e.alive) return;

    const hit =
      hitX < e.x + e.w &&
      hitX + 18 > e.x &&
      hitY < e.y + e.h &&
      hitY + 18 > e.y;

    if (hit) {
      e.hp -= player.damage;
      if (e.hp <= 0) e.alive = false;
    }
  });
}

// ================= SHOP =================
function openShop() {
  const choice = prompt(
`TIENDA DE HYRULE
1 - +1 Corazón (10 rupias)
2 - +Daño espada (8 rupias)
3 - +Velocidad (6 rupias)`
  );

  if (choice === "1" && player.rupees >= 10) {
    player.maxHearts++;
    player.hearts = player.maxHearts;
    player.rupees -= 10;
  }
  if (choice === "2" && player.rupees >= 8) {
    player.damage++;
    player.rupees -= 8;
  }
  if (choice === "3" && player.rupees >= 6) {
    player.speed += 0.5;
    player.rupees -= 6;
  }
}

// ================= UPDATE =================
function update() {
  let nx = player.x;
  let ny = player.y;

  if (keys["w"]) { ny -= player.speed; player.dir = "up"; }
  if (keys["s"]) { ny += player.speed; player.dir = "down"; }
  if (keys["a"]) { nx -= player.speed; player.dir = "left"; }
  if (keys["d"]) { nx += player.speed; player.dir = "right"; }

  if (!blocked(nx, player.y)) player.x = nx;
  if (!blocked(player.x, ny)) player.y = ny;

  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  // tienda
  const tx = Math.floor(player.x / TILE);
  const ty = Math.floor(player.y / TILE);
  if (map[ty]?.[tx] === 5 && keys["e"]) openShop();

  // enemigos
  enemies.forEach(e => {
    if (!e.alive) return;

    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 180) e.chasing = true;
    if (e.chasing) {
      e.x += Math.sign(dx) * e.speed;
      e.y += Math.sign(dy) * e.speed;
    }
  });
}

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = map[y][x];
      const px = x * TILE - camera.x;
      const py = y * TILE - camera.y;

      if (t === 0) ctx.fillStyle = "#3fa93f";
      if (t === 1) ctx.fillStyle = "#145214";
      if (t === 2) ctx.fillStyle = "#1e90ff";
      if (t === 3) ctx.fillStyle = "#777";
      if (t === 4) ctx.fillStyle = "#c2b280";
      if (t === 5) ctx.fillStyle = "#8b4513";

      ctx.fillRect(px, py, TILE, TILE);
    }
  }

  // jugador
  ctx.fillStyle = "green";
  ctx.fillRect(player.x - camera.x, player.y - camera.y, player.w, player.h);

  // espada
  if (player.attacking) {
    ctx.fillStyle = "silver";
    let sx = player.x;
    let sy = player.y;

    if (player.dir === "up") sy -= 20;
    if (player.dir === "down") sy += 20;
    if (player.dir === "left") sx -= 20;
    if (player.dir === "right") sx += 20;

    ctx.fillRect(sx - camera.x, sy - camera.y, 14, 14);
  }

  // enemigos
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    if (e.alive)
      ctx.fillRect(e.x - camera.x, e.y - camera.y, e.w, e.h);
  });

  // HUD
  for (let i = 0; i < player.hearts; i++) {
    ctx.fillStyle = "red";
    ctx.fillRect(10 + i * 20, 10, 16, 16);
  }

  ctx.fillStyle = "yellow";
  ctx.fillText(`Rupias: ${player.rupees}`, 10, 50);
}

// ================= LOOP =================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
