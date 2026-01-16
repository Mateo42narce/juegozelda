const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ======================
   JUGADOR
====================== */
const player = {
  x: 150,
  y: 110,
  size: 16,
  speed: 2
};

/* ======================
   VIDA (CORAZONES)
====================== */
let maxLife = 5;
let life = 5;

/* ======================
   ESPADA
====================== */
let attacking = false;
let attackTimer = 0;

/* ======================
   TECLADO
====================== */
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Atacar con espacio
  if (e.code === "Space" && !attacking) {
    attacking = true;
    attackTimer = 10;
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

/* ======================
   ACTUALIZAR JUEGO
====================== */
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // Temporizador de ataque
  if (attacking) {
    attackTimer--;
    if (attackTimer <= 0) {
      attacking = false;
    }
  }
}

/* ======================
   DIBUJAR CORAZONES
====================== */
function drawHearts() {
  for (let i = 0; i < maxLife; i++) {
    ctx.strokeStyle = "white";
    ctx.strokeRect(8 + i * 18, 8, 14, 14);

    if (i < life) {
      ctx.fillStyle = "red";
      ctx.fillRect(8 + i * 18, 8, 14, 14);
    }
  }
}

/* ======================
   DIBUJAR
====================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jugador
  ctx.fillStyle = "green";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Espada
  if (attacking) {
    ctx.fillStyle = "silver";
    ctx.fillRect(
      player.x + player.size,
      player.y + 4,
      12,
      4
    );
  }

  drawHearts();
}

/* ======================
   BUCLE PRINCIPAL
====================== */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
