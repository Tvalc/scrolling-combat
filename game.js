window.addEventListener('DOMContentLoaded', initGame);

// --- Background Image Loader for Stage 1 ---
const STAGE1_BG_URL = "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/BackGround_1_SS_1753769088005.png";
const _stage1BgImg = new window.Image();
_stage1BgImg.src = STAGE1_BG_URL;
_stage1BgImg.loaded = false;
_stage1BgImg.onload = () => { _stage1BgImg.loaded = true; };

function initGame() {
  // Clean up any previous game
  let cont = document.getElementById('gameContainer');
  cont.innerHTML = '';
  let canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.width = window.GAME_WIDTH;
  canvas.height = window.GAME_HEIGHT;
  canvas.tabIndex = 1;
  canvas.className = "shadow-xl border-2 border-slate-700 mt-2";
  cont.appendChild(canvas);

  // Show start menu
  window.UI.showMenu(
    "Side-Scrolling Beat 'Em Up",
    "Defeat all enemy waves! Powerups drop from defeated foes.<br>Survive 10 levels to win.",
    "Start Game",
    () => {
      window.UI.hideMenus();
      let game = new window.Game(canvas);
      game.start();
    }
  );
}

// Game main manager
window.Game = class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = 0;
    this.stage = 0;
    this.wave = 0;
    this.player = null;
    this.enemies = [];
    this.powerups = [];
    this.particles = [];
    this.input = {left: false, right: false, jump: false, attack: false, pause: false};
    this.paused = false;
    this.lastFrame = null;
    this.state = 'menu'; // menu, running, paused, gameover, victory
    this.waveClearedTimer = 0;
    this.stageClearedTimer = 0;
    this.levelClearedTimer = 0;
    this._ui = null;
    this.bindInput();
  }
  start() {
    this.level = 0;
    this.stage = 0;
    this.wave = 0;
    this.player = new window.Player(60, window.FLOOR_Y - window.PLAYER_HEIGHT);
    this.enemies = [];
    this.powerups = [];
    this.particles = [];
    this.state = 'running';
    this.spawnWave();
    window.UI.makeUI(this);
    this.render(performance.now());
  }
  bindInput() {
    this._keydown = (e) => {
      if (this.state !== 'running' && e.code !== 'Escape') return;
      if (['ArrowLeft','KeyA'].includes(e.code)) this.input.left = true;
      if (['ArrowRight','KeyD'].includes(e.code)) this.input.right = true;
      if (['Space','KeyW','ArrowUp'].includes(e.code)) this.input.jump = true;
      if (['KeyX','KeyK','KeyZ'].includes(e.code)) this.input.attack = true;
      if (e.code === 'Escape') {
        if (this.state === 'running') {
          this.pause();
        } else if (this.state === 'paused') {
          this.resume();
        }
      }
    };
    this._keyup = (e) => {
      if (['ArrowLeft','KeyA'].includes(e.code)) this.input.left = false;
      if (['ArrowRight','KeyD'].includes(e.code)) this.input.right = false;
      if (['Space','KeyW','ArrowUp'].includes(e.code)) this.input.jump = false;
      if (['KeyX','KeyK','KeyZ'].includes(e.code)) this.input.attack = false;
    };
    window.addEventListener('keydown', this._keydown);
    window.addEventListener('keyup', this._keyup);
  }
  unbindInput() {
    window.removeEventListener('keydown', this._keydown);
    window.removeEventListener('keyup', this._keyup);
  }
  pause() {
    if (this.state !== 'running') return;
    this.state = 'paused';
    window.UI.showPause(this, ()=>this.resume());
  }
  resume() {
    if (this.state !== 'paused') return;
    this.state = 'running';
    window.UI.hideMenus();
    this.lastFrame = performance.now();
    this.render(this.lastFrame);
  }
  spawnWave() {
    // Increase difficulty per level/stage/wave
    let numEnemies = 2 + Math.floor(this.wave*0.7) + window.randInt(0,1);
    numEnemies += Math.floor(this.stage/3);
    numEnemies = Math.min(9, numEnemies);
    this.enemies = [];
    for (let i=0; i<numEnemies; ++i) {
      let ex = window.randInt(360, window.GAME_WIDTH-70);
      let ey = window.FLOOR_Y - window.ENEMY_HEIGHT;
      let col = window.pick(window.ENEMY_COLORS);
      this.enemies.push(new window.Enemy(ex, ey, col));
    }
    // Every 10th wave, spawn a miniboss
    if ((this.wave+1)%10===0) {
      let ex = window.randInt(420, window.GAME_WIDTH-80);
      let ey = window.FLOOR_Y - window.ENEMY_HEIGHT;
      let boss = new window.Enemy(ex, ey, '#f2a742');
      boss.maxHealth = boss.health = 70 + this.level*8 + this.stage*3;
      boss.width = boss.height = 68;
      this.enemies.push(boss);
    }
  }
  advanceWaveOrStage() {
    if (this.wave < 9) {
      this.wave++;
      this.spawnWave();
      window.UI.update(this);
    } else {
      this.wave = 0;
      this.advanceStageOrLevel();
    }
  }
  advanceStageOrLevel() {
    if (this.stage < 9) {
      this.stage++;
      this.spawnWave();
      window.UI.update(this);
    } else {
      this.stage = 0;
      this.advanceLevel();
    }
  }
  advanceLevel() {
    if (this.level < 9) {
      this.level++;
      this.spawnWave();
      window.UI.update(this);
    } else {
      // Win
      this.state = 'victory';
      setTimeout(()=>{
        window.UI.showVictory(this, ()=> { this.start(); });
      }, 600);
    }
  }
  render(now) {
    if (this.state === 'menu' || this.state === 'gameover' || this.state === 'victory') return;
    let dt = 17;
    if (this.lastFrame) dt = Math.min(now - this.lastFrame, 60);
    this.lastFrame = now;
    // Update
    if (this.state === 'running') this.update(dt);
    // Draw
    this.draw();
    // Next frame
    if (this.state === 'running' || this.state === 'paused') {
      window.requestAnimationFrame((t)=>this.render(t));
    }
  }
  update(dt) {
    let p = this.player;
    p.update(this.input, dt, this);
    for (let enemy of this.enemies) {
      enemy.update(p, dt);
    }
    for (let pow of this.powerups) {
      pow.update(dt);
    }
    for (let part of this.particles) {
      part.update(dt);
    }
    // Remove dead particles
    this.particles = this.particles.filter(pt=>pt.life > 0);
    // Enemies die and maybe drop powerup
    for (let i=this.enemies.length-1; i>=0; --i) {
      let e = this.enemies[i];
      if (e.dead) {
        // Drop powerup?
        if (window.chance(1, 3)) {
          let type = window.pick(window.POWERUP_TYPES);
          let pow = new window.Powerup(e.x+e.width/2-16, e.y+e.height/2-16, type);
          this.powerups.push(pow);
        }
        // Particles
        for (let j=0;j<8+(Math.random()*4);++j) {
          this.particles.push(new window.Particle(
            e.x+e.width/2, e.y+e.height/2,
            e.color, 14+Math.random()*6, 2.1+Math.random()*2.1
          ));
        }
        this.enemies.splice(i,1);
      }
    }
    // Powerup pickup
    for (let i=this.powerups.length-1; i>=0; --i) {
      let pow = this.powerups[i];
      if (!pow.picked && window.rectsOverlap(
        pow.x, pow.y, pow.size, pow.size,
        p.x, p.y, p.width, p.height
      )) {
        pow.picked = true;
        this.applyPowerup(pow.type);
        // Add some particles
        for (let j=0;j<7;++j) {
          this.particles.push(new window.Particle(
            pow.x+pow.size/2, pow.y+pow.size/2,
            window.POWERUP_COLORS[pow.type][0], 13+Math.random()*5, 2+Math.random()*2
          ));
        }
        this.powerups.splice(i,1);
      }
    }
    // Enemy attacks player
    for (let e of this.enemies) {
      if (e.dead) continue;
      let dx = (p.x+p.width/2)-(e.x+e.width/2);
      if (Math.abs(dx) < window.ENEMY_ATTACK_RANGE+10 && e.isAttacking && e.attackAnim===7) {
        p.takeDamage(window.ENEMY_ATTACK_DAMAGE + this.level);
      }
    }
    // Player attacks enemy
    if (p.isAttacking && p.attackAnim===7) {
      let atkBase = 22 + this.level*1.2 + this.stage*0.7 + this.wave*0.3;
      let atk = p.attackBoost > 0 ? atkBase*window.POWERUP_EFFECTS.attack.multiplier : atkBase;
      for (let e of this.enemies) {
        if (e.dead) continue;
        let px = p.x + (p.dir > 0 ? p.width : 0);
        let py = p.y + p.height/2;
        let ex = e.x + e.width/2;
        let ey = e.y + e.height/2;
        let dist = window.distance(px, py, ex, ey);
        let ang = Math.abs(window.angleBetween(px, py, ex, ey));
        if (dist < window.PLAYER_ATTACK_RANGE+e.width/2 && ang < window.PLAYER_ATTACK_ARC) {
          e.takeDamage(atk);
        }
      }
    }
    // Respawn if dead
    if (p.dead) {
      setTimeout(()=>{
        if (p.lives > 0) {
          // Respawn
          let np = new window.Player(55, window.FLOOR_Y - window.PLAYER_HEIGHT);
          np.lives = p.lives;
          np.health = np.maxHealth;
          this.player = np;
          window.UI.update(this);
        } else {
          this.state = 'gameover';
          setTimeout(()=>{
            window.UI.showGameOver(this, ()=>{ this.start(); });
          }, 500);
        }
      }, 740);
      p.dead = false; // prevent multi-trigger
    }
    // Wave clear
    if (this.enemies.length === 0 && this.powerups.length === 0) {
      this.waveClearedTimer += dt;
      if (this.waveClearedTimer > 650) {
        this.waveClearedTimer = 0;
        this.advanceWaveOrStage();
      }
    } else {
      this.waveClearedTimer = 0;
    }
    window.UI.update(this);
  }
  applyPowerup(type) {
    let p = this.player;
    if (type === 'health') {
      p.heal(window.POWERUP_EFFECTS.health.heal);
    } else if (type === 'invincible') {
      p.invincible = window.POWERUP_EFFECTS.invincible.duration;
    } else if (type === 'attack') {
      p.attackBoost = window.POWERUP_EFFECTS.attack.duration;
    }
  }
  draw() {
    let ctx = this.ctx;
    ctx.clearRect(0,0,window.GAME_WIDTH,window.GAME_HEIGHT);

    // --- Background rendering ---
    if (this.stage === 0 && _stage1BgImg.loaded) {
      // Draw image, scale to canvas
      ctx.drawImage(_stage1BgImg, 0, 0, window.GAME_WIDTH, window.GAME_HEIGHT);
    } else {
      // Default background gradient for other stages (or loading fallback)
      let grad = ctx.createLinearGradient(0,0,0,window.GAME_HEIGHT);
      grad.addColorStop(0, "#4e5ba9");
      grad.addColorStop(0.6, "#20223b");
      grad.addColorStop(1, "#1a1f2d");
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,window.GAME_WIDTH,window.GAME_HEIGHT);
    }

    // Stage floor
    ctx.save();
    ctx.globalAlpha = 0.69;
    ctx.fillStyle = "#2e3145";
    ctx.fillRect(0, window.FLOOR_Y+window.ENEMY_HEIGHT-16, window.GAME_WIDTH, window.GAME_HEIGHT-window.FLOOR_Y);
    // Stripe
    ctx.fillStyle = "#384c67";
    ctx.fillRect(0, window.FLOOR_Y+window.ENEMY_HEIGHT-8, window.GAME_WIDTH, 8);
    ctx.restore();

    // Simple dynamic crowd
    for (let i=0;i<15;++i) {
      let x = 35+i*47+Math.sin(performance.now()/600+i)*4;
      let y = window.FLOOR_Y-8-Math.abs(Math.sin(i+performance.now()/1200)*6);
      ctx.save();
      ctx.globalAlpha = 0.08 + 0.06*Math.abs(Math.sin(i+performance.now()/900));
      ctx.beginPath();
      ctx.ellipse(x, y, 14, 8, 0, 0, Math.PI*2);
      ctx.fillStyle = window.pick(["#7c8cb5","#d2d7ee","#b3b8e6","#5c6793"]);
      ctx.fill();
      ctx.restore();
    }
    // Powerups
    for (let pow of this.powerups) pow.draw(ctx);
    // Enemies
    for (let e of this.enemies) e.draw(ctx);
    // Player
    this.player.draw(ctx);
    // Particles
    for (let part of this.particles) part.draw(ctx);

    // If dead, overlay
    if (this.player.dead) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#181a22";
      ctx.fillRect(0,0,window.GAME_WIDTH,window.GAME_HEIGHT);
      ctx.restore();
    }
  }
};