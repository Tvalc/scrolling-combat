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

// == Attack Animation Preload ==
window.PlayerAttackFrames = [
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Crouch_4_1754021076784.png',
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Punch_2_1754021388739.png',
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Kick_2_1754021214028.png'
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

    // Attack animation state
    this.attackAnimFrame = 0;
    this.attackAnimTimer = 0;
    this.attackAnimSpeed = 0.18;
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

    // === Attack Animation Frame Update ===
    if (this.action === 'attack' && this.attackTime > 0) {
      this.attackAnimTimer += dt;
      if (this.attackAnimTimer > 160) { // SLOW DOWN: was 80ms, now 160ms per frame
        this.attackAnimFrame = (this.attackAnimFrame + 1) % window.PlayerAttackFrames.length;
        this.attackAnimTimer = 0;
      }
    } else {
      this.attackAnimFrame = 0;
      this.attackAnimTimer = 0;
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
    // === Attack Animation Render ===
    if (this.action === 'attack' && this.attackTime > 0) {
      const img = window.PlayerAttackFrames[this.attackAnimFrame];
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (this.facing === 1) {
        ctx.drawImage(img, 0, 0, img.width, img.height, this.x, this.y, this.width, this.height);
      } else {
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.width, this.height);
      }
      ctx.restore();
    } else if (!this.onGround) {
      // Draw jump animation, mirrored if facing left
      const img = window.PlayerJumpFrames[this.jumpAnimFrame];
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (this.facing === 1) {
        ctx.drawImage(img, 0, 0, img.width, img.height, this.x, this.y, this.width, this.height);
      } else {
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.width, this.height);
      }
      ctx.restore();
    } else {
      // Choose walk animation frame
      let frameIdx = Math.floor(this.walkFrame) % this.walkFrameCount;
      let animArr = this.facing === 1 ? window.SpriteLibrary.playerWalkRight : window.SpriteLibrary.playerWalkLeft;
      if (this.action === 'walk') {
        animArr[frameIdx](ctx, this.x, this.y, this.width, this.height, frameIdx);
      } else {
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
    this.width = 54;
    this.height = 54;
    this.vx = (Math.random() < 0.5 ? -1 : 1) * (2.2 + Math.random() * 1.2);
    this.vy = 0;
    this.groundY = 392;
    this.alive = true;
    this.health = 60 + Math.floor(game.level * 8) + Math.floor(game.stage * 6) + Math.floor(game.wave * 4);
    this.damage = 22 + Math.floor(game.level * 2.5);
    this.dashing = false;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.frame = Math.floor(Math.random() * window.SpriteLibrary.enemyFrames.length);
    this.frameTimer = 0;
    this.frameSpeed = 0.18 + Math.random() * 0.08;
  }

  update(dt, player) {
    if (!this.alive) return;

    // Dash logic
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.dashing) {
      this.dashTime -= dt;
      this.x += this.vx * 2.7;
      if (this.dashTime <= 0) {
        this.dashing = false;
        this.dashCooldown = 900 + Math.random() * 700;
      }
    } else {
      // Move toward player
      let dx = player.x - this.x;
      if (Math.abs(dx) > 8) {
        this.x += Math.sign(dx) * (1.2 + Math.random() * 0.7);
      }
      // Random dash
      if (this.dashCooldown <= 0 && Math.abs(dx) < 220 && Math.random() < 0.018) {
        this.dashing = true;
        this.dashTime = 260 + Math.random() * 120;
        this.vx = Math.sign(dx) * (3.8 + Math.random() * 1.2);
      }
    }

    // Gravity
    if (this.y < this.groundY) {
      this.vy += 0.38;
      this.y += this.vy;
      if (this.y > this.groundY) {
        this.y = this.groundY;
        this.vy = 0;
      }
    }

    // Clamp position
    this.x = window.Utils.clamp(this.x, 0, this.game.width - this.width);

    // Animation frame
    this.frameTimer += this.frameSpeed;
    if (this.frameTimer >= window.SpriteLibrary.enemyFrames.length) this.frameTimer = 0;
    this.frame = Math.floor(this.frameTimer);

    // Dash collision with player
    if (this.dashing && !player.invincible && !player.dead) {
      let dx = (this.x + this.width / 2) - (player.x + player.width / 2);
      let dy = (this.y + this.height / 2) - (player.y + player.height / 2);
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 44) {
        player.takeDamage(this.damage + 12);
        this.dashing = false;
        this.dashCooldown = 1200 + Math.random() * 600;
      }
    }
  }

  render(ctx) {
    if (!this.alive) return;
    window.SpriteLibrary.enemyFrames[this.frame](ctx, this.x, this.y, this.width, this.height, this.frame);
    // Health bar
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#f44";
    ctx.fillRect(this.x + 6, this.y + this.height - 8, this.width - 12, 6);
    ctx.fillStyle = "#8f8";
    ctx.fillRect(this.x + 6, this.y + this.height - 8, (this.width - 12) * (this.health / 100), 6);
    ctx.restore();
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
      this.health = 0;
      this.game.waveDefeated++;
    }
  }
};

// == Powerup Entity ==
window.Powerup = class Powerup {
  constructor(game, x, y, type) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 38;
    this.height = 38;
    this.type = type; // 'health', 'invincible', 'attack'
    this.alive = true;
    this.vy = -2.2 - Math.random() * 1.2;
    this.gravity = 0.19;
  }

  update(dt) {
    this.vy += this.gravity;
    this.y += this.vy;
    if (this.y > this.game.height - this.height) {
      this.y = this.game.height - this.height;
      this.vy = 0;
    }
  }

  render(ctx) {
    if (!this.alive) return;
    if (this.type === 'health') window.SpriteLibrary.powerupHealth(ctx, this.x, this.y, this.width, this.height);
    if (this.type === 'invincible') window.SpriteLibrary.powerupInvincible(ctx, this.x, this.y, this.width, this.height);
    if (this.type === 'attack') window.SpriteLibrary.powerupAttack(ctx, this.x, this.y, this.width, this.height);
  }
};