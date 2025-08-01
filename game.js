window.addEventListener('DOMContentLoaded', initGame);

function initGame() {
  window.gameInstance = new window.GameManager();
  window.gameInstance.render();
}

window.GameManager = class GameManager {
  constructor() {
    this.width = 900;
    this.height = 480;
    this.canvas = document.getElementById('game-canvas');
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
      let ex = 170 + i*window.Utils.randInt(40, 90) + window.Utils.randInt(0, 30) + 180;
      let ey = this.height*0.41 + window.Utils.randInt(-18, 30);
      this.enemies.push(new window.Enemy(this, ex, ey));
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

    // Player attacks
    if (this.player.attackTime > 0) {
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

    // State overlays
    if (this.state === 'menu' || this.state === 'gameover' || this.state==='win') {
      // Don't animate loop, wait for button
      return;
    }
    // -- UPDATE --
    this.update(dt);

    // Next frame
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