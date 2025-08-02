window.addEventListener('DOMContentLoaded', initGame);

function initGame() {
  window.gameInstance = new window.GameManager();
  window.gameInstance.render();
}

// === New Enemy Class: GroundJumperEnemy ===
window.GroundJumperEnemy = class GroundJumperEnemy {
  constructor(game, x) {
    this.game = game;
    this.x = x;
    this.width = 48;
    this.height = 54;
    // Set groundY to window.FLOOR_Y for correct alignment with ground in background
    this.groundY = window.FLOOR_Y;
    // Always spawn on ground:
    this.y = this.groundY - this.height;
    this.vx = 1.65 + Math.random() * 0.65;
    this.facing = 1;
    this.health = 38;
    this.alive = true;
    this.damage = 18;
    this.stepCounter = 0;
    this.nextJumpSteps = 24 + window.Utils.randInt(0, 26);
    this.jumping = false;
    this.vy = 0;
    this.gravity = 0.5 + Math.random() * 0.1;
    this.jumpPower = -8 - Math.random() * 2.2;

    // === All ground enemies use DooomShroom frames ===
    this.walkFrames = window.SpriteLibrary.doomShroomFrames.map(fn => fn.img || null).filter(Boolean);
    this.usesFrameFunctions = false;
    this.animFrame = 0;
    this.animTimer = 0;
  }

  update(dt, player) {
    if (!this.alive) return;

    // Walk logic
    if (!this.jumping) {
      this.facing = player.x > this.x ? 1 : -1;
      this.x += this.vx * this.facing;
      this.stepCounter++;
      // Clamp to ground
      if (this.y + this.height < this.groundY) {
        this.y += this.gravity * (dt / 16.67);
        if (this.y + this.height > this.groundY) {
          this.y = this.groundY - this.height;
        }
      } else {
        this.y = this.groundY - this.height;
      }
      // Jump towards player after N steps
      if (this.stepCounter >= this.nextJumpSteps && Math.abs(this.x - player.x) > 24) {
        this.jumping = true;
        // Set jump velocity toward player
        let dx = (player.x + player.width / 2) - (this.x + this.width / 2);
        let dtot = Math.max(Math.abs(dx), 60);
        this.vy = this.jumpPower;
        this.vx_jump = (dx / dtot) * (2.0 + Math.random() * 1.8);
        // Reset step counter
        this.stepCounter = 0;
        this.nextJumpSteps = 24 + window.Utils.randInt(0, 28);
      }
    } else {
      // In jumping phase: arc toward player
      this.x += this.vx_jump;
      this.y += this.vy;
      this.vy += this.gravity * (dt / 16.67);
      // Land on ground
      if (this.y + this.height >= this.groundY) {
        this.y = this.groundY - this.height;
        this.jumping = false;
        this.vy = 0;
      }
    }

    // Clamp inside screen
    this.x = window.Utils.clamp(this.x, 0, this.game.width - this.width);

    // Animation
    this.animTimer += dt;
    if (this.animTimer > 90) {
      this.animFrame = (this.animFrame + 1) % (this.walkFrames.length || 1);
      this.animTimer = 0;
    }
  }

  render(ctx) {
    if (!this.alive) return;
    if (this.usesFrameFunctions) {
      window.SpriteLibrary.enemyFrames[this.animFrame % window.SpriteLibrary.enemyFrames.length](
        ctx, this.x, this.y, this.width, this.height, this.animFrame
      );
    } else {
      let img = this.walkFrames[this.animFrame];
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(this.facing, 1);
      ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    }
    // Optionally: draw health bar
    if (this.alive && this.health < 38) {
      ctx.save();
      ctx.fillStyle = '#222';
      ctx.fillRect(this.x + 4, this.y - 10, this.width - 8, 5);
      ctx.fillStyle = '#a00';
      ctx.fillRect(this.x + 4, this.y - 10, (this.width - 8) * (this.health / 38), 5);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x + 4, this.y - 10, this.width - 8, 5);
      ctx.restore();
    }
  }

  takeDamage(dmg) {
    this.health -= dmg;
    if (this.health <= 0) {
      this.alive = false;
    }
  }
};

window.GameManager = class GameManager {
  constructor() {
    // PATCH: Set canvas and logical size to 1280x720
    this.width = 1280;
    this.height = 720;
    this.canvas = document.getElementById('game-canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.input = { left: false, right: false, jump: false, attack: false };
    this.player = new window.Player(this);
    this.entities = [];
    this.enemies = [];
    this.powerups = [];
    this.level = 0;
    this.stage = 0;
    this.wave = 0;
    this.state = 'menu'; // menu, running, pause, gameover, win
    this.lastFrame = window.Utils.now();
    this.spawnDelay = 0;
    this.waveEnemies = 0;
    this.waveDefeated = 0;
    this.bgScroll = 0;
    this.bindInput();
    // Only call menuHandlers after DOM and UI are ready
    setTimeout(() => this.menuHandlers(), 0);
    this.render();
  }

  bindInput() {
    window.addEventListener('keydown', (e) => {
      if (this.state !== 'running') return;
      if (['a','A','ArrowLeft'].includes(e.key)) this.input.left = true;
      if (['d','D','ArrowRight'].includes(e.key)) this.input.right = true;
      if (['w','W','ArrowUp',' '].includes(e.key)) this.input.jump = true;
      if (['j','J','z','Z'].includes(e.key)) this.input.attack = true;
    });
    window.addEventListener('keyup', (e) => {
      if (['a','A','ArrowLeft'].includes(e.key)) this.input.left = false;
      if (['d','D','ArrowRight'].includes(e.key)) this.input.right = false;
      if (['w','W','ArrowUp',' '].includes(e.key)) this.input.jump = false;
      if (['j','J','z','Z'].includes(e.key)) this.input.attack = false;
    });
    // Prevent scroll/jump on space/up
    this.canvas.tabIndex = 1;
    this.canvas.addEventListener('keydown', e => e.preventDefault());
  }

  menuHandlers() {
    console.log('[menuHandlers] called');
    window.UI.showMenu(
      '🌟 Side-Scrolling Beat \'Em Up 🌟',
      [
        {label: 'Start Game', id: 'btnStart'},
        {label: 'Controls', id: 'btnControls'}
      ],
      () => {
        const btnStart = document.getElementById('btnStart');
        const btnControls = document.getElementById('btnControls');
        if (btnStart) btnStart.onclick = () => this.startGame();
        if (btnControls) {
          btnControls.onclick = () => {
            window.UI.showMenu(
              'Controls',
              [
                {label: '←/A/D/→: Move', id: 'noop1'},
                {label: 'W/↑/Space: Jump', id: 'noop2'},
                {label: 'J/Z: Attack', id: 'noop3'},
                {label: 'Back', id: 'btnBack'}
              ],
              () => {
                const btnBack = document.getElementById('btnBack');
                if (btnBack) btnBack.onclick = ()=>this.menuHandlers();
              }
            );
          };
        }
      }
    );
  }

  startGame() {
    window.UI.hideMenu(); // <-- Add this!
    this.state = 'running';
    this.level = 0;
    this.stage = 0;
    this.wave = 0;
    this.player = new window.Player(this);
    this.enemies = [];
    this.powerups = [];
    this.waveEnemies = 0;
    this.waveDefeated = 0;
    this.spawnDelay = 0;
    this.bgScroll = 0;
    window.UI.drawHUD(this);
    this.lastFrame = window.Utils.now();
    // Spawn the first wave so enemies appear!
    this.spawnWave();
    this.render();
  }

  nextWave() {
    this.wave++;
    if (this.wave >= 10) {
      this.wave = 0;
      this.stage++;
      if (this.stage >= 10) {
        this.stage = 0;
        this.level++;
        if (this.level >= 10) {
          this.state = 'win';
          this.showEnd('🏆 Victory! You Cleared All Levels!');
          return;
        }
      }
    }
    this.spawnWave();
  }

  spawnWave() {
    this.enemies = [];
    this.powerups = [];
    let enemyCount = 3 + Math.floor(this.level*0.6) + Math.floor(this.stage*0.4) + Math.floor(this.wave*0.6);
    this.waveEnemies = enemyCount;
    this.waveDefeated = 0;
    for (let i=0; i<enemyCount; i++) {
      let ex = 170 + i*window.Utils.randInt(30, 50) + window.Utils.randInt(0, 10) + 80;
      // --- 40% chance to spawn GroundJumperEnemy ---
      if (Math.random() < 0.4) {
        // Always use DooomShroom frames and spawn on ground
        let groundEnemy = new window.GroundJumperEnemy(this, ex);
        this.enemies.push(groundEnemy);
      } else {
        // Flying enemies (ships) can use original y logic
        let ey = this.height*0.41 + window.Utils.randInt(-18, 30);
        this.enemies.push(new window.Enemy(this, ex, ey));
      }
    }
    window.UI.drawHUD(this);
  }

  update(dt) {
    if (this.state !== 'running') return;
    this.player.update(this.input, dt);

    // Enemies
    for (let enemy of this.enemies) {
      if (enemy.alive) enemy.update(dt, this.player);
    }

    // Powerups
    for (let p of this.powerups) {
      if (p.alive) p.update(dt);
    }

    // Player attacks: Only allow hitbox during frames 2–4 (index 1–3)
    if (
      this.player.attackTime > 0 &&
      this.player.action === 'attack' &&
      this.player.attackAnimFrame >= 1 &&
      this.player.attackAnimFrame <= 3
    ) {
      for (let enemy of this.enemies) {
        if (!enemy.alive) continue;
        let dx = (enemy.x+enemy.width/2)-(this.player.x+this.player.width/2+this.player.facing*38);
        let dy = (enemy.y+enemy.height/2)-(this.player.y+this.player.height/1.7);
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < this.player.attackRange+26) {
          enemy.takeDamage(this.player.attackBoost ? 60 : 32);
          // knockback
          enemy.x += this.player.facing*30;
          // Powerup drop chance
          if (!enemy.alive && Math.random()<0.32) {
            // Pick type
            let types = ['health','invincible','attack'];
            let t = types[window.Utils.randInt(0,2)];
            this.powerups.push(new window.Powerup(this, enemy.x, enemy.y, t));
          }
        }
      }
    }

    // Enemy attacks player (normal contact damage, dash damage handled in Enemy)
    for (let enemy of this.enemies) {
      if (!enemy.alive) continue;
      // Don't apply normal contact damage if enemy is dashing (dash handles its own collision/damage)
      if (enemy.dashing) continue;
      let dx = (enemy.x+enemy.width/2)-(this.player.x+this.player.width/2);
      let dy = (enemy.y+enemy.height/2)-(this.player.y+this.player.height/2);
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 44) {
        this.player.takeDamage(enemy.damage);
        enemy.x += this.player.facing*18;
      }
    }

    // Powerup collect
    for (let p of this.powerups) {
      if (!p.alive) continue;
      let dx = (p.x+p.width/2)-(this.player.x+this.player.width/2);
      let dy = (p.y+p.height/2)-(this.player.y+this.player.height/2);
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 48) {
        this.player.collectPowerup(p.type);
        p.alive = false;
      }
    }
    this.powerups = this.powerups.filter(p=>p.alive);

    // Enemies defeated check
    let living = this.enemies.filter(e=>e.alive).length;
    if (living === 0 && this.enemies.length>0) {
      setTimeout(()=>this.nextWave(), 700);
      this.enemies = [];
    }

    // Death/game over
    if (this.player.dead && this.state==='running') {
      this.state = 'gameover';
      this.showEnd('💀 Game Over');
    }
  }

  render() {
    // Timing
    let now = window.Utils.now();
    let dt = now - this.lastFrame;
    if (dt > 60) dt = 60; // clamp for tab switches
    this.lastFrame = now;

    // -- DRAW --
    // Background
    window.SpriteLibrary.backgroundStage1(this.ctx, this.width, this.height, now);

    // Entities
    for (let enemy of this.enemies) enemy.render(this.ctx);
    for (let p of this.powerups) p.render(this.ctx);
    this.player.render(this.ctx);

    // UI
    window.UI.drawHUD(this);

    // -- UPDATE --
    if (this.state === 'running') {
      this.update(dt);
    }

    // Always continue the render loop so overlays persist and UI is responsive
    requestAnimationFrame(()=>this.render());
  }

  showEnd(msg) {
    window.UI.showMenu(
      msg,
      [
        {label: 'Restart', id: 'btnRestart'},
        {label: 'Main Menu', id: 'btnMenu'}
      ],
      () => {
        const btnRestart = document.getElementById('btnRestart');
        const btnMenu = document.getElementById('btnMenu');
        if (btnRestart) btnRestart.onclick = ()=>this.startGame();
        if (btnMenu) btnMenu.onclick = ()=>this.menuHandlers();
      }
    );
  }
};