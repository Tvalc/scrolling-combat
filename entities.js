// Player, Enemy, Powerup, and related logic

// == Jump Animation Preload ==
window.PlayerJumpFrames = [
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Crouch_1_1754021015142.png',
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Crouch_4_1754021076784.png',
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Jump_2_1754021265406.png'
].map(src => {
  const img = new window.Image();
  img.src = src;
  return img;
});

// == Player Entity ==
window.Player = class Player {
  constructor(game) {
    this.game = game;
    this.x = 150;
    this.y = 320;
    this.width = 52;
    this.height = 78;
    this.groundY = 392;
    this.vx = 0;
    this.vy = 0;
    this.speed = 4.6;
    this.jumpVel = -11.5;
    this.gravity = 0.52;
    this.onGround = true;
    this.facing = 1; // 1: right, -1: left
    this.walkFrame = 0;
    this.walkAnimSpeed = 0.15;
    this.walkFrameCount = window.SpriteLibrary.playerWalkLeft.length;
    this.action = 'idle'; // idle, walk, jump, attack
    this.attackCooldown = 0;
    this.lives = 3;
    this.maxHealth = 120;
    this.health = this.maxHealth;
    this.invincible = false;
    this.attackBoost = false;
    this.invincibleTimer = 0;
    this.attackBoostTimer = 0;
    this.attackRange = 46;
    this.attackDuration = 200;
    this.attackTime = 0;
    this.dead = false;

    // Jump animation state
    this.jumpAnimFrame = 0;
    this.jumpAnimTimer = 0;
  }

  update(input, dt) {
    if (this.dead) return;
    // Movement input
    let prevX = this.x;
    if (input.left) {
      this.x -= this.speed;
      this.facing = -1;
      if (this.onGround) this.action = 'walk';
    }
    if (input.right) {
      this.x += this.speed;
      this.facing = 1;
      if (this.onGround) this.action = 'walk';
    }
    if (!input.left && !input.right && this.onGround) {
      this.action = 'idle';
      this.walkFrame = 0;
    }
    if (input.jump && this.onGround) {
      this.vy = this.jumpVel;
      this.onGround = false;
      this.action = 'jump';
    }

    // Attack (allow in air and on ground)
    if (input.attack && this.attackCooldown <= 0) {
      this.action = 'attack';
      this.attackTime = this.attackDuration;
      this.attackCooldown = 360;
    }

    // Gravity
    if (!this.onGround) {
      this.vy += this.gravity;
      this.y += this.vy;
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.vy = 0;
        this.onGround = true;
        this.action = 'idle';
      }
    }

    // Clamp position
    this.x = window.Utils.clamp(this.x, 0, this.game.width - this.width);

    // Animation
    if (this.action === 'walk') {
      this.walkFrame += this.walkAnimSpeed;
      if (this.walkFrame >= this.walkFrameCount) this.walkFrame = 0;
    }

    // === Jump Animation Frame Update ===
    if (!this.onGround) {
      this.jumpAnimTimer += dt;
      if (this.jumpAnimTimer > 80) { // 80ms per frame
        this.jumpAnimFrame = (this.jumpAnimFrame + 1) % window.PlayerJumpFrames.length;
        this.jumpAnimTimer = 0;
      }
    } else {
      this.jumpAnimFrame = 0;
      this.jumpAnimTimer = 0;
    }

    // Attack cooldown
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.attackTime > 0) this.attackTime -= dt;

    // Powerups
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }
    if (this.attackBoost) {
      this.attackBoostTimer -= dt;
      if (this.attackBoostTimer <= 0) {
        this.attackBoost = false;
      }
    }
  }

  render(ctx) {
    // === Jump Animation Render ===
    if (!this.onGround) {
      // Draw jump animation, mirrored if facing left
      const img = window.PlayerJumpFrames[this.jumpAnimFrame];
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (this.facing === 1) {
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
      } else {
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, this.width, this.height);
      }
      ctx.restore();
    } else {
      // Choose walk animation frame
      let frameIdx = Math.floor(this.walkFrame) % this.walkFrameCount;
      let animArr = this.facing === 1 ? window.SpriteLibrary.playerWalkRight : window.SpriteLibrary.playerWalkLeft;
      if (this.action === 'walk') {
        animArr[frameIdx](ctx, this.x, this.y, this.width, this.height, frameIdx);
      } else {
        // Use first frame for idle/attack
        animArr[0](ctx, this.x, this.y, this.width, this.height, 0);
      }
    }
    // Attack effect
    if (this.attackTime > 0) {
      ctx.save();
      ctx.globalAlpha = 0.16 + 0.13 * Math.sin(this.attackTime/30);
      ctx.beginPath();
      ctx.arc(this.x + this.width/2 + this.facing*36, this.y + this.height/1.7, 34, 0, Math.PI*2);
      ctx.fillStyle = this.attackBoost ? '#ffe066' : '#f77';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 22;
      ctx.fill();
      ctx.restore();
    }
    // Invincible overlay
    if (this.invincible) {
      ctx.save();
      ctx.globalAlpha = 0.18 + 0.1*Math.sin(Date.now()/80);
      ctx.beginPath();
      ctx.ellipse(this.x+this.width/2, this.y+this.height/2, this.width*0.56, this.height*0.54, 0, 0, Math.PI*2);
      ctx.fillStyle = '#bffcff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 19;
      ctx.fill();
      ctx.restore();
    }
  }

  takeDamage(amount) {
    if (this.invincible || this.dead) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.lives--;
      if (this.lives > 0) {
        this.health = this.maxHealth;
        this.x = 120;
        this.y = this.groundY;
      } else {
        this.dead = true;
        this.health = 0;
      }
    }
    this.invincible = true;
    this.invincibleTimer = 1200;
  }

  collectPowerup(type) {
    if (type === 'health') {
      this.health = Math.min(this.health + 60, this.maxHealth);
    }
    if (type === 'invincible') {
      this.invincible = true;
      this.invincibleTimer = 2500;
    }
    if (type === 'attack') {
      this.attackBoost = true;
      this.attackBoostTimer = 2000;
    }
  }
};

// == Enemy Entity ==
window.Enemy = class Enemy {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.width = 48;
    this.height = 56;
    this.hp = 40;
    this.maxHp = 40;
    this.alive = true;
    this.frame = window.Utils.randInt(0, window.SpriteLibrary.enemyFrames.length - 1);
    this.frameTime = window.Utils.randFloat(0,2*Math.PI);
    this.facing = Math.random() < 0.5 ? -1 : 1;
    this.floatPhase = Math.random() * Math.PI * 2;
    this.targeting = false;
    this.targetDelay = window.Utils.randInt(1500, 3000);
    this.targetTimer = this.targetDelay;
    this.vx = 0; this.vy = 0;
    this.speed = 2.1;
    this.damage = 16;

    // --- Dash properties ---
    this.dashing = false;
    this.dashCooldown = window.Utils.randInt(1000, 3000); // ms until dash ready
    this.dashTimer = this.dashCooldown;
    this.dashVx = 0;
    this.dashVy = 0;
    this.dashDuration = 0;
    this.dashDurationMax = 340; // ms (short, fast dash)
    this.dashSpeed = 7.3;
    this.dashHit = false; // So damage is only applied once per dash
  }

  update(dt, player) {
    // Animate float (unless dashing)
    if (!this.dashing) {
      this.y = this.baseY + Math.sin(window.Utils.now()/430 + this.floatPhase) * 16;
    }
    // Animation frame
    this.frameTime += dt/90;
    if (this.frameTime > 1) {
      this.frame = (this.frame+1)%window.SpriteLibrary.enemyFrames.length;
      this.frameTime = 0;
    }

    // --- Dash logic ---
    if (this.dashing) {
      // Dash in progress
      this.x += this.dashVx * dt/16.67;
      this.y += this.dashVy * dt/16.67;
      this.dashDuration -= dt;
      // Dash-player collision (once per dash)
      if (!this.dashHit) {
        let dx = (this.x+this.width/2)-(player.x+player.width/2);
        let dy = (this.y+this.height/2)-(player.y+player.height/2);
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < Math.max(this.width, this.height, 42)) {
          player.takeDamage(this.damage * 1.2 | 0); // dash is stronger
          this.dashHit = true;
        }
      }
      // End dash if time up or out of bounds
      if (
        this.dashDuration <= 0 ||
        this.x < 0 ||
        this.x > this.game.width-this.width ||
        this.y < 0 ||
        this.y > this.game.height-this.height
      ) {
        this.dashing = false;
        this.dashTimer = window.Utils.randInt(1000, 3000);
        this.dashVx = 0;
        this.dashVy = 0;
        // rebase Y to new float center after dash
        this.baseY = this.game.height*0.41 + window.Utils.randInt(-22, 22);
      }
      return;
    }

    // Dash cooldown countdown
    this.dashTimer -= dt;
    if (this.dashTimer <= 0 && !this.dashing && this.alive) {
      // Start dash toward player
      let dx = (player.x + player.width/2) - (this.x + this.width/2);
      let dy = (player.y + player.height/2) - (this.y + this.height/2);
      let dist = Math.sqrt(dx*dx + dy*dy) || 1;
      this.dashVx = (dx/dist) * this.dashSpeed;
      this.dashVy = (dy/dist) * this.dashSpeed;
      this.dashDuration = this.dashDurationMax;
      this.dashing = true;
      this.dashHit = false;
      // Dash overrides normal movement for now
      return;
    }

    // Targeting logic (normal movement, only if not dashing)
    this.targetTimer -= dt;
    if (this.targetTimer <= 0 && !this.targeting) {
      this.targeting = true;
      // Set direction toward player
      let dx = (player.x + player.width/2) - (this.x + this.width/2);
      let dy = (player.y + player.height/2) - (this.y + this.height/2);
      let dist = Math.sqrt(dx*dx + dy*dy) || 1;
      this.vx = (dx/dist) * this.speed * 2.3;
      this.vy = (dy/dist) * this.speed * 2.3;
      this.targetTimer = window.Utils.randInt(1100, 2100);
    }
    if (this.targeting) {
      this.x += this.vx;
      this.y += this.vy;
      // Stop after flying some distance or going offscreen
      if (
        Math.abs(this.vx) < 0.01 ||
        this.x < 0 ||
        this.x > this.game.width-this.width ||
        this.y < 0 ||
        this.y > this.game.height-this.height
      ) {
        this.targeting = false;
        this.vx = 0;
        this.vy = 0;
        // rebase Y to new float center
        this.baseY = this.game.height*0.41 + window.Utils.randInt(-22, 22);
      }
    }
  }

  render(ctx) {
    let f = this.frame % window.SpriteLibrary.enemyFrames.length;
    window.SpriteLibrary.enemyFrames[f](ctx, this.x, this.y, this.width, this.height, f);

    // Visual effect for dash (optional: add a faint glow/trail while dashing)
    if (this.dashing) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = "#fff8";
      ctx.shadowColor = "#e3d180";
      ctx.shadowBlur = 13;
      ctx.fill();
      ctx.restore();
    }

    // HP bar
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x+6, this.y+this.height-8, this.width-12, 7);
    ctx.fillStyle = "#f55";
    ctx.fillRect(this.x+6, this.y+this.height-8, (this.width-12)*(this.hp/this.maxHp), 7);
    ctx.restore();
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }
};

// == Powerup Entity ==
window.Powerup = class Powerup {
  constructor(game, x, y, type) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 36;
    this.type = type; // 'health', 'invincible', 'attack'
    this.vy = -2.1;
    this.alive = true;
    this.bounce = 0;
  }

  update(dt) {
    this.y += this.vy;
    this.vy += 0.24;
    if (this.y + this.height > this.game.height*0.87) {
      this.y = this.game.height*0.87 - this.height;
      this.vy = -this.vy * 0.36;
      this.bounce++;
      if (this.bounce > 2) this.vy = 0;
    }
  }

  render(ctx) {
    if (this.type === 'health') {
      window.SpriteLibrary.powerupHealth(ctx, this.x, this.y, this.width, this.height);
    }
    if (this.type === 'invincible') {
      window.SpriteLibrary.powerupInvincible(ctx, this.x, this.y, this.width, this.height);
    }
    if (this.type === 'attack') {
      window.SpriteLibrary.powerupAttack(ctx, this.x, this.y, this.width, this.height);
    }
  }
};