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
   ENEMIGOS
====================== */
let enemies = [
  { x: 50, y: 50, size: 16, alive: true },
  { x: 250, y: 150, size: 16, alive: true },
  { x: 180, y: 80, size: 16, alive: true }
];

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
   FUNCIONES AUXILIARES
====================== */

// Comprobar colisión entre dos rectángulos
function collides(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

/* ======================
   ACTUALIZAR JUEGO
====================== */
function update() {
  // Movimiento jugador
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // Ataque
  if (attacking) {
    attackTimer--;
    if (attackTimer <= 0) attacking = false;
  }

  // Comprobar colisiones con enemigos
  enemies.forEach(enemy => {
    if (enemy.alive) {
      // Daño jugador si toca enemigo
      if (collides(player, enemy)) {
        life -= 1;
        enemy.alive = false; // enemigo muere al tocar al jugador
        if (life < 0) life = 0;
      }

      // Espada mata enemigos
      if (attacking) {
        const sword = { x: player.x + player.size, y: player.y + 4, size: 12, height: 4 };
        const swordRect = { x: sword.x, y: sword.y, size: sword.size, height: sword.height };
        const enemyRect = { x: enemy.x, y: enemy.y, size: enemy.size, height: enemy.size };

        if (
          swordRect.x < enemyRect.x + enemyRect.size &&
          swordRect.x + swordRect.size > enemyRect.x &&
          swordRect.y < enemyRect.y + enemyRect.height &&
          swordRect.y + swordRect.height > enemyRect.y
        ) {
          enemy.alive = false;
        }
      }
    }
  });
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
    ctx.fillRect(player.x + player.size, player.y + 4, 12, 4);
  }

  // Enemigos
  enemies.forEach(enemy => {
    if (enemy.alive) {
      ctx.fillStyle = "red";
      ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    }
  });

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
