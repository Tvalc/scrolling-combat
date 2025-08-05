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
// Add 3 new frames to the front, keep the rest of the attack frames after.
window.PlayerAttackFrames = [
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Crouch_3_1754021059629.png',
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Crouch_5_1754021239410.png',
  'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Crouch_2_1754021030845.png',
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
    this.width = 52;
    this.height = 78;
    // Set groundY to window.FLOOR_Y for correct alignment with ground
    this.groundY = window.FLOOR_Y;
    this.y = this.groundY - this.height;
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

    // === Attack Animation Parameters (FIXED) ===
    this.attackAnimFrameTime = 85; // ms per frame (6 frames × 85ms ≈ 510ms)
    this.attackAnimLoopsTarget = 1; // Only 1 loop for a single attack
    this.attackAnimFramesCount = window.PlayerAttackFrames.length;
    this.attackDuration = this.attackAnimFrameTime * this.attackAnimFramesCount; // ≈ 510ms
    this.attackCooldown = 0; // Will be set on attack
    this.attackTime = 0;
    this.dead = false;

    // Jump animation state
    this.jumpAnimFrame = 0;
    this.jumpAnimTimer = 0;

    // Attack animation state
    this.attackAnimFrame = 0;
    this.attackAnimTimer = 0;
    this.attackAnimSpeed = 0.18; // not used but kept for reference
    this.attackAnimLoop = 0;
  }

  update(input, dt) {
    // Frame-rate independence: scale movement by dt/16.67, but scale durations/animation by dt only
    const speedScale = dt / 16.67;
    if (this.dead) return;
    // Movement input
    let prevX = this.x;
    if (this.action !== 'attack') { // Do not interrupt attack animation
      if (input.left) {
        this.x -= this.speed * speedScale;
        this.facing = -1;
        if (this.onGround) this.action = 'walk';
      }
      if (input.right) {
        this.x += this.speed * speedScale;
        this.facing = 1;
        if (this.onGround) this.action = 'walk';
      }
      if (!input.left && !input.right && this.onGround) {
        this.action = 'idle';
        this.walkFrame = 0;
      }
      if (input.jump && this.onGround) {
        this.vy = this.jumpVel; // FIX: do not scale jump velocity by speedScale
        this.onGround = false;
        this.action = 'jump';
      }
    } else {
      // Still allow gravity/jump to work during attack in air
      if (!this.onGround && input.jump && this.vy > 0) {
        this.vy = this.jumpVel; // FIX: do not scale jump velocity by speedScale
      }
    }

    // Attack (allow in air and on ground)
    if (input.attack && this.attackCooldown <= 0 && this.action !== 'attack') {
      this.action = 'attack';
      this.attackTime = this.attackDuration;
      this.attackCooldown = this.attackDuration + 120; // animation duration + 120ms buffer
      this.attackAnimFrame = 0;
      this.attackAnimTimer = 0;
      this.attackAnimLoop = 0;
    }

    // Gravity
    if (!this.onGround) {
      this.vy += this.gravity * speedScale;
      this.y += this.vy * speedScale;
      if (this.y >= this.groundY - this.height) {
        this.y = this.groundY - this.height;
        this.vy = 0;
        this.onGround = true;
        if (this.action === 'jump') this.action = 'idle';
      }
    }

    // Clamp position
    this.x = window.Utils.clamp(this.x, 0, this.game.width - this.width);

    // Animation
    if (this.action === 'walk') {
      this.walkFrame += this.walkAnimSpeed * speedScale;
      if (this.walkFrame >= this.walkFrameCount) this.walkFrame = 0;
    }

    // === Jump Animation Frame Update ===
    if (!this.onGround) {
      this.jumpAnimTimer += dt;
      if (this.jumpAnimTimer > 180) { // SLOWER: 180ms per frame
        this.jumpAnimFrame = (this.jumpAnimFrame + 1) % window.PlayerJumpFrames.length;
        this.jumpAnimTimer = 0;
      }
    } else {
      this.jumpAnimFrame = 0;
      this.jumpAnimTimer = 0;
    }

    // === Attack Animation Frame Update (play ONCE, 85ms per frame, NO LOOP) ===
    if (this.action === 'attack') {
      this.attackAnimTimer += dt;
      if (this.attackAnimTimer > this.attackAnimFrameTime) {
        this.attackAnimFrame++;
        this.attackAnimTimer = 0;
        if (this.attackAnimFrame >= this.attackAnimFramesCount) {
          // Animation done
          this.action = this.onGround ? 'idle' : 'jump';
          this.attackAnimFrame = 0;
          this.attackAnimLoop = 0;
          this.attackTime = 0;
        }
      }
    } else {
      // Reset attack animation state if not attacking
      this.attackAnimFrame = 0;
      this.attackAnimTimer = 0;
      this.attackAnimLoop = 0;
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
    // === All player animations: draw at full logical size (no scaling) ===

    // === Attack Animation Render ===
    if (this.action === 'attack') {
      const img = window.PlayerAttackFrames[Math.min(this.attackAnimFrame, this.attackAnimFramesCount - 1)];
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      // Indices of attack frames that are left-facing at the source (adjust as needed)
      const leftFacingAttackFrames = [0, 1];

      if (this.facing === 1) {
        // Facing right: mirror these two frames so all appear as right-facing
        if (leftFacingAttackFrames.includes(this.attackAnimFrame)) {
          ctx.translate(this.x + this.width, this.y);
          ctx.scale(-1, 1);
          ctx.drawImage(
            img,
            0, 0, img.width, img.height,
            0, 0,
            this.width, this.height
          );
        } else {
          ctx.drawImage(
            img,
            0, 0, img.width, img.height,
            this.x,
            this.y,
            this.width, this.height
          );
        }
      } else {
        // Facing left: always mirror as usual (so right-facing source images appear left)
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
          img,
          0, 0, img.width, img.height,
          0, 0,
          this.width, this.height
        );
      }
      ctx.restore();
    } else if (!this.onGround) {
      // Draw jump animation, mirrored if facing left
      const img = window.PlayerJumpFrames[this.jumpAnimFrame];
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (this.facing === 1) {
        ctx.drawImage(
          img,
          0, 0, img.width, img.height,
          this.x,
          this.y,
          this.width, this.height
        );
      } else {
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
          img,
          0, 0, img.width, img.height,
          0, 0,
          this.width, this.height
        );
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
        this.y = this.groundY - this.height;
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
    // PATCH: Ensure default flying enemies are above the ground, but not in the middle of the screen
    if (typeof y === "undefined" || y === null) {
      this.y = window.FLOOR_Y - 120;
    } else {
      this.y = y;
    }
    this.width = 52;
    this.height = 78;
    this.health = 60;
    this.alive = true;
    this.dashing = false;
    this.damage = 24;
    this.dashCooldown = 0;
    this.dashTime = 0;
    this.dashSpeed = 9;
    this.speed = 2.2;
    this.attackRange = 48;
    this.frameTimer = 0;
    this.frameIdx = Math.floor(Math.random() * window.SpriteLibrary.enemyFrames.length);
    this.colorIdx = Math.floor(Math.random() * window.SpriteLibrary.enemyFrames.length);

    // --- NEW: Floating/AI state ---
    this.state = 'float'; // 'float', 'targeting', 'zoom', 'cooldown', 'dead'
    this.floatAngle = Math.random() * Math.PI * 2;
    this.floatRadius = 32 + Math.random() * 32;
    this.floatSpeed = 0.008 + Math.random() * 0.012;
    this.targetCooldown = 800 + Math.random() * 1200;
    this.targetX = this.x;
    this.targetY = this.y;
    this.zoomVX = 0;
    this.zoomVY = 0;
    this.zoomTime = 0;

    // --- Explosion animation ---
    this.exploding = false;
    this.explosionTime = 0;
    this.explosionDuration = 520; // ms
  }

  update(dt, player) {
    if (!this.alive && !this.exploding) return;

    // --- EXPLOSION ANIMATION ---
    if (this.exploding) {
      this.explosionTime += dt;
      if (this.explosionTime >= this.explosionDuration) {
        this.exploding = false;
      }
      return;
    }

    // --- AI STATE MACHINE ---
    if (this.state === 'float') {
      // Float in a loose circle
      this.floatAngle += this.floatSpeed * dt;
      this.x += Math.cos(this.floatAngle) * 0.7;
      this.y += Math.sin(this.floatAngle) * 0.5;
      // Clamp inside screen
      this.x = window.Utils.clamp(this.x, 0, this.game.width - this.width);
      this.y = window.Utils.clamp(this.y, 40, this.game.height - this.height - 120);

      this.targetCooldown -= dt;
      if (this.targetCooldown <= 0) {
        this.state = 'targeting';
        this.targetCooldown = 800 + Math.random() * 1200;
      }
    } else if (this.state === 'targeting') {
      // Move toward player center
      let px = player.x + player.width / 2;
      let py = player.y + player.height / 2;
      let dx = px - (this.x + this.width / 2);
      let dy = py - (this.y + this.height / 2);
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        this.x += (dx / dist) * this.speed * (dt / 16.67);
        this.y += (dy / dist) * this.speed * (dt / 16.67);
      } else {
        // Once close, zoom at player
        this.state = 'zoom';
        let dzx = px - (this.x + this.width / 2);
        let dzy = py - (this.y + this.height / 2);
        let dzdist = Math.sqrt(dzx * dzx + dzy * dzy);
        this.zoomVX = (dzx / dzdist) * (7.5 + Math.random() * 2.5);
        this.zoomVY = (dzy / dzdist) * (7.5 + Math.random() * 2.5);
        this.zoomTime = 0;
      }
    } else if (this.state === 'zoom') {
      // Zoom at player for a short burst
      this.x += this.zoomVX * (dt / 16.67);
      this.y += this.zoomVY * (dt / 16.67);
      this.zoomTime += dt;
      // Clamp inside screen
      this.x = window.Utils.clamp(this.x, 0, this.game.width - this.width);
      this.y = window.Utils.clamp(this.y, 40, this.game.height - this.height - 120);

      // Collision with player
      let dx = (this.x + this.width / 2) - (player.x + player.width / 2);
      let dy = (this.y + this.height / 2) - (player.y + player.height / 2);
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.attackRange && !player.invincible) {
        player.takeDamage(this.damage + 16);
        this.state = 'cooldown';
        this.targetCooldown = 900 + Math.random() * 700;
      } else if (this.zoomTime > 340 + Math.random() * 120) {
        this.state = 'cooldown';
        this.targetCooldown = 900 + Math.random() * 700;
      }
    } else if (this.state === 'cooldown') {
      // Drift slowly
      this.x += Math.cos(this.floatAngle) * 0.5;
      this.y += Math.sin(this.floatAngle) * 0.3;
      this.targetCooldown -= dt;
      if (this.targetCooldown <= 0) {
        this.state = 'float';
        this.targetCooldown = 800 + Math.random() * 1200;
      }
    }

    // Animation frame update
    this.frameTimer += dt;
    if (this.frameTimer > 110) {
      this.frameIdx = (this.frameIdx + 1) % window.SpriteLibrary.enemyFrames.length;
      this.frameTimer = 0;
    }
  }

  render(ctx) {
    // --- EXPLOSION EFFECT ---
    if (this.exploding) {
      window.SpriteLibrary.enemyExplosion(
        ctx,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width,
        this.height,
        this.explosionTime / this.explosionDuration
      );
      return;
    }
    if (!this.alive) return;

    // Example: use enemy sprite frame (with 50% scale handled in sprites.js)
    let frameIdx = this.frameIdx;
    window.SpriteLibrary.enemyFrames[frameIdx](ctx, this.x, this.y, this.width, this.height, frameIdx);

    // Health bar
    if (this.alive && this.health < 60) {
      ctx.save();
      ctx.fillStyle = '#222';
      ctx.fillRect(this.x + 6, this.y - 12, this.width - 12, 6);
      ctx.fillStyle = '#f55';
      ctx.fillRect(this.x + 6, this.y - 12, ((this.health / 60) * (this.width - 12)), 6);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x + 6, this.y - 12, this.width - 12, 6);
      ctx.restore();
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
      this.exploding = true;
      this.explosionTime = 0;
    }
  }
};

// == Powerup Entity ==

window.Powerup = class Powerup {
  constructor(game, x, y, type) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.type = type; // 'health', 'invincible', 'attack'
    this.width = 38;
    this.height = 38;
    this.alive = true;
    this.vy = -2.2 - Math.random(); // float up a bit on spawn
    this.floatTimer = 0;
  }

  update(dt) {
    // Float up then hover
    if (this.floatTimer < 320) {
      this.y += this.vy;
      this.vy += 0.09;
      this.floatTimer += dt;
    } else {
      this.y += Math.sin(Date.now()/220 + this.x) * 0.18;
    }
    // Clamp to ground
    if (this.y > this.game.height - this.height - 24) {
      this.y = this.game.height - this.height - 24;
      this.vy = 0;
    }
  }

  render(ctx) {
    // Use SpriteLibrary for drawing
    if (this.type === 'health') {
      window.SpriteLibrary.powerupHealth(ctx, this.x, this.y, this.width, this.height);
    } else if (this.type === 'invincible') {
      window.SpriteLibrary.powerupInvincible(ctx, this.x, this.y, this.width, this.height);
    } else if (this.type === 'attack') {
      window.SpriteLibrary.powerupAttack(ctx, this.x, this.y, this.width, this.height);
    }
  }
};