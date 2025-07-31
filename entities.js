// Player, Enemy, Powerup, Particle classes

// --- SPRITE SHEET INIT FOR PLAYER ---

const PLAYER_WALK_LEFT_SRC = [
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_1_1753895522380.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_2_1753895538366.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_3_1753895550338.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_7_1753895618223.png", // replaced L_4
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_2_1753895538366.png", // replaced L_5
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_6_1753895595755.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_7_1753895618223.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_8_1753895628385.png"
];

function loadImages(srcs) {
  return srcs.map(src => {
    const img = new window.Image();
    img.src = src;
    return img;
  });
}

const PLAYER_WALK_LEFT_FRAMES = loadImages(PLAYER_WALK_LEFT_SRC);

window.__PLAYER_WALK_LEFT_FRAMES = PLAYER_WALK_LEFT_FRAMES;

// --- ENEMY SPRITE FRAMES (9 frames, as provided by user) ---

const ENEMY_ANIM_SRC = [
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_1_1753824654660.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_2_1753824672446.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_3_1753824680227.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_4_1753824688771.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_5_1753824699044.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_6_1753824709971.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_7_1753824720897.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_8_1753824730385.png",
  "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_9_1753824738269.png"
];
const ENEMY_ANIM_FRAMES = loadImages(ENEMY_ANIM_SRC);
window.__ENEMY_ANIM_FRAMES = ENEMY_ANIM_FRAMES;

// Player class
window.Player = class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.dir = 1; // 1:right, -1:left
    this.width = window.PLAYER_WIDTH;
    this.height = window.PLAYER_HEIGHT;
    this.grounded = false;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.lives = 3;
    this.isAttacking = false;
    this.attackAnim = 0; // frames left
    this.attackCooldown = 0;
    this.invincible = 0;
    this.attackBoost = 0;
    this.dead = false;
    this.hurtAnim = 0;
    this.score = 0;

    // Animation state
    this.anim = {
      walkFrame: 0,
      walkTimer: 0,
      lastMoving: false
    };
  }
  update(input, dt, game) {
    if (this.dead) return;
    // Movement
    let speed = window.PLAYER_SPEED;
    let moving = false;
    if (input.left) { this.vx = -speed; this.dir = -1; moving = true; }
    else if (input.right) { this.vx = speed; this.dir = 1; moving = true; }
    else { this.vx = 0; }

    // Animation frame logic for walk
    if (moving) {
      this.anim.walkTimer += dt;
      if (this.anim.walkTimer > 70) {
        this.anim.walkFrame = (this.anim.walkFrame + 1) % window.__PLAYER_WALK_LEFT_FRAMES.length;
        this.anim.walkTimer = 0;
      }
      this.anim.lastMoving = true;
    } else {
      this.anim.walkFrame = 0;
      this.anim.walkTimer = 0;
      this.anim.lastMoving = false;
    }

    // Jump
    if (input.jump && this.grounded) {
      this.vy = window.PLAYER_JUMP_VEL;
      this.grounded = false;
    }
    // Gravity
    this.vy += window.PLAYER_GRAVITY;
    // Position
    this.x += this.vx;
    this.y += this.vy;
    // Floor collision
    // Ensure the bottom of the player is flush with the bottom of the background/canvas
    if (this.y + this.height >= window.FLOOR_Y) {
      this.y = window.FLOOR_Y - this.height;
      this.vy = 0;
      this.grounded = true;
    }
    // Bounds
    this.x = window.clamp(this.x, 0, window.GAME_WIDTH-this.width);
    // Attack
    if (input.attack && !this.isAttacking && this.attackCooldown <= 0) {
      this.isAttacking = true;
      this.attackAnim = 13;
      this.attackCooldown = window.PLAYER_ATTACK_COOLDOWN + (this.attackBoost>0 ? -120 : 0);
    }
    if (this.attackAnim > 0) this.attackAnim--;
    if (this.attackAnim === 0) this.isAttacking = false;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    if (this.hurtAnim > 0) this.hurtAnim--;
    if (this.invincible > 0) this.invincible -= dt;
    if (this.attackBoost > 0) this.attackBoost -= dt;
  }
  draw(ctx) {
    // --- Custom sprite-based rendering ---
    ctx.save();
    ctx.translate(this.x + this.width/2, this.y + this.height/2);

    // Select animation frame & direction
    let frame = window.__PLAYER_WALK_LEFT_FRAMES[0];
    let walking = (this.vx !== 0);
    if (walking) {
      frame = window.__PLAYER_WALK_LEFT_FRAMES[this.anim.walkFrame];
    }

    // Determine mirroring for direction (right uses scale(-1,1))
    let mirrored = (this.dir === 1);

    // Attacking overlay (draw sprite, then attack effect)
    if (mirrored) {
      ctx.scale(-1, 1); // Mirror horizontally for right
    }

    // Draw sprite image centered
    if (frame && frame.complete) {
      ctx.globalAlpha = this.hurtAnim>0 ? 0.57 : 1;
      ctx.drawImage(
        frame,
        -this.width/2, -this.height/2,
        this.width, this.height
      );
    } else {
      // Fallback: colored rectangle
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#ff6e40';
      ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    }

    // Visual effects overlays
    if (this.invincible > 0 && Math.floor(performance.now()/120)%2===0) {
      ctx.globalAlpha = 0.27;
      ctx.fillStyle = '#fcff81';
      ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    }
    if (this.attackBoost > 0) {
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = '#be7aff';
      ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    }

    // Attack swing effect (above sprite)
    if (this.isAttacking && this.attackAnim >= 7) {
      ctx.save();
      ctx.rotate(this.dir * -0.4);
      ctx.strokeStyle = this.attackBoost>0 ? '#c2a2ff' : '#ffecb8';
      ctx.globalAlpha = 0.55 + Math.random()*0.25;
      ctx.lineWidth = 16 + Math.random()*6;
      ctx.beginPath();
      ctx.arc(12, 6, 32, -0.9, 0.6);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
  takeDamage(dmg) {
    if (this.invincible > 0 || this.dead) return;
    this.health -= dmg;
    this.hurtAnim = 14;
    if (this.health <= 0) {
      this.lives--;
      this.dead = true;
    }
  }
  heal(amount) {
    this.health = window.clamp(this.health + amount, 0, this.maxHealth);
  }
};

// --- ENEMY CLASS: Animated, floating, targets player randomly ---

window.Enemy = class Enemy {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.vx = 0;
    this.vy = 0;
    this.width = window.ENEMY_WIDTH;
    this.height = window.ENEMY_HEIGHT;
    this.dir = 1;
    this.grounded = false;
    this.maxHealth = window.ENEMY_HEALTH + window.randInt(-6,8);
    this.health = this.maxHealth;
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.attackAnim = 0;
    this.hurtAnim = 0;
    this.dead = false;

    // Animation
    this.anim = {
      frame: Math.floor(Math.random() * window.__ENEMY_ANIM_FRAMES.length),
      timer: 0
    };

    // Floating
    this.floatPhase = window.randFloat(0, Math.PI * 2);

    // Attack logic
    this.targeting = false;
    this.targetTimer = window.randInt(1400, 3000); // initial random wait
    this.targetVx = 0;
    this.targetVy = 0;
    this.charging = false;
    this.chargeCooldown = 0;
    this.color = color || window.pick(window.ENEMY_COLORS);
  }

  update(player, dt) {
    if (this.dead) return;

    // Animate frame
    this.anim.timer += dt;
    if (this.anim.timer > 80) {
      this.anim.frame = (this.anim.frame + 1) % window.__ENEMY_ANIM_FRAMES.length;
      this.anim.timer = 0;
    }

    // Floating up and down (sinusoidal movement)
    let floatAmplitude = 12;
    let floatSpeed = 0.0022;
    this.y = this.baseY + Math.sin(performance.now() * floatSpeed + this.floatPhase) * floatAmplitude;

    // Targeting logic
    if (!this.charging) {
      this.targetTimer -= dt;
      // If timer expires, lock onto player and rush
      if (this.targetTimer <= 0) {
        this.charging = true;
        // Aim at player center
        let px = player.x + player.width / 2;
        let py = player.y + player.height / 2;
        let ex = this.x + this.width / 2;
        let ey = this.y + this.height / 2;
        let dx = px - ex;
        let dy = py - ey;
        let len = Math.sqrt(dx * dx + dy * dy) || 1;
        // Set rush velocity
        let rushSpeed = window.ENEMY_SPEED * 2.7 + window.randFloat(-0.6, 0.7);
        this.targetVx = dx / len * rushSpeed;
        this.targetVy = dy / len * rushSpeed;
        this.chargeCooldown = window.randInt(370, 600); // Duration of the rush
      } else {
        // Idle floating movement, drift left/right
        this.vx = Math.sin(performance.now() * 0.0007 + this.floatPhase) * 0.7;
        this.dir = this.vx >= 0 ? 1 : -1;
      }
    } else {
      // Charging at player
      this.x += this.targetVx;
      this.y += this.targetVy;
      this.chargeCooldown -= dt;
      this.dir = this.targetVx >= 0 ? 1 : -1;
      if (this.chargeCooldown <= 0) {
        this.charging = false;
        this.targetVx = 0;
        this.targetVy = 0;
        this.targetTimer = window.randInt(1400, 3000); // next attack in 1.4s-3s
        // Clamp back to floor area if off
        if (this.y + this.height > window.FLOOR_Y) {
          this.baseY = window.FLOOR_Y - this.height;
          this.y = this.baseY;
        } else {
          this.baseY = this.y;
        }
      }
    }

    // Stay in screen bounds
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > window.GAME_WIDTH) this.x = window.GAME_WIDTH - this.width;
    if (this.y < 16) this.y = 16;
    if (this.y + this.height > window.FLOOR_Y) {
      this.y = window.FLOOR_Y - this.height;
      this.baseY = this.y;
    }

    // Attacking logic (simple: if near player while charging, do attack)
    let px = player.x + player.width / 2;
    let py = player.y + player.height / 2;
    let ex = this.x + this.width / 2;
    let ey = this.y + this.height / 2;
    let dist = window.distance(px, py, ex, ey);

    if (this.charging && dist < window.ENEMY_ATTACK_RANGE + 12 && this.attackCooldown <= 0) {
      this.isAttacking = true;
      this.attackAnim = 8;
      this.attackCooldown = window.ENEMY_ATTACK_COOLDOWN + window.randInt(-80, 90);
    }
    if (this.attackAnim > 0) this.attackAnim--;
    else this.isAttacking = false;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.hurtAnim > 0) this.hurtAnim--;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.dir, 1);

    let frame = window.__ENEMY_ANIM_FRAMES[this.anim.frame];
    if (frame && frame.complete) {
      ctx.globalAlpha = this.hurtAnim > 0 ? 0.58 : 1;
      ctx.drawImage(
        frame,
        -this.width / 2, -this.height / 2,
        this.width, this.height
      );
    } else {
      // Fallback: colored rectangle
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    // Attack swing effect
    if (this.isAttacking && this.attackAnim >= 4) {
      ctx.save();
      ctx.rotate(this.dir * -0.4);
      ctx.strokeStyle = '#fffba0';
      ctx.globalAlpha = 0.34 + Math.random() * 0.27;
      ctx.lineWidth = 7 + (Math.random() * 5);
      ctx.beginPath();
      ctx.arc(10, 5, 18, -1, 0.8);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  takeDamage(dmg) {
    this.health -= dmg;
    this.hurtAnim = 9;
    if (this.health <= 0) {
      this.dead = true;
    }
  }
};

window.Powerup = class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'health', 'invincible', 'attack'
    this.size = window.POWERUP_SIZE;
    this.picked = false;
    this.popAnim = 18;
    // For simple float
    this.floatPhase = window.randFloat(0, 2*Math.PI);
  }
  update(dt) {
    if (this.popAnim > 0) this.popAnim--;
  }
  draw(ctx) {
    let t = performance.now()/380 + this.floatPhase;
    let bobY = Math.sin(t)*5;
    ctx.save();
    ctx.globalAlpha = 0.88 + 0.06*Math.sin(performance.now()/90);
    ctx.translate(this.x + this.size/2, this.y + this.size/2 + bobY);
    // Visual style per type
    if (this.type === 'health') {
      // Heart shape
      ctx.save();
      ctx.scale(1.16, 1.16);
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.bezierCurveTo(12,-6, 17,12, 0, 24);
      ctx.bezierCurveTo(-17,12, -12,-6, 0, 7);
      ctx.closePath();
      let grad = ctx.createRadialGradient(0, 9, 5, 0, 13, 18);
      grad.addColorStop(0, window.POWERUP_COLORS.health[0]);
      grad.addColorStop(1, window.POWERUP_COLORS.health[1]);
      ctx.fillStyle = grad;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'invincible') {
      // Star
      ctx.save();
      ctx.rotate(t/2);
      ctx.beginPath();
      let spikes = 6, outer=15, inner=7;
      for(let i=0;i<spikes*2;i++) {
        let r = i%2===0 ? outer : inner;
        let ang = i*Math.PI/spikes;
        ctx.lineTo(Math.cos(ang)*r, Math.sin(ang)*r);
      }
      ctx.closePath();
      let grad = ctx.createRadialGradient(0,0,3,0,0,17);
      grad.addColorStop(0.0, window.POWERUP_COLORS.invincible[1]);
      grad.addColorStop(1.0, window.POWERUP_COLORS.invincible[0]);
      ctx.fillStyle = grad;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'attack') {
      // Lightning bolt
      ctx.save();
      ctx.rotate(Math.sin(t/2)*0.06);
      ctx.beginPath();
      ctx.moveTo(-7, -8);
      ctx.lineTo(3, 0);
      ctx.lineTo(-2, 2);
      ctx.lineTo(8, 13);
      ctx.lineTo(1, 4);
      ctx.lineTo  (7, 1);
      ctx.lineTo(-7, -8);
      ctx.closePath();
      let grad = ctx.createLinearGradient(-8, -8, 8, 13);
      grad.addColorStop(0, window.POWERUP_COLORS.attack[0]);
      grad.addColorStop(1, window.POWERUP_COLORS.attack[1]);
      ctx.fillStyle = grad;
      ctx.shadowColor = '#d9b3ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
};

window.Particle = class Particle {
  // For simple visual effects (e.g. enemy death, powerup collect)
  constructor(x, y, color, life=16, size=2.8) {
    this.x = x; this.y = y;
    this.color = color;
    this.life = life;
    this.size = size;
    this.vx = window.randFloat(-2,2);
    this.vy = window.randFloat(-2,2);
  }
  update(dt) {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= dt/16;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life/16);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
};