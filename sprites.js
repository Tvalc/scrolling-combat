// All sprite and animation drawing logic - pure Canvas

// --- IMAGE ASSET PRELOAD ---
const preloadImage = (src) => {
  const img = new window.Image();
  img.src = src;
  return img;
};

// === PLAYER SPRITES ===
const playerWalkLeftImages = [
  preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_1_1753895522380.png"),
  preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_2_1753895538366.png"),
  preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_3_1753895550338.png"),
  preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_7_1753895618223.png"),
  preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_2_1753895538366.png"),
  preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_6_1753895595755.png"),
  preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_7_1753895618223.png"),
  preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Coop_Walk_L_8_1753895628385.png")
];

// === PLAYER SPRITE SCALING FOR ALL PLAYER ANIMATIONS ===
// Remove PLAYER_ANIM_SCALE for player animations - all player animation drawing should use full logical size (w, h)

// ----------------------
// === ENEMY 2 (DoomShroom) WALK FRAMES ===
const doomShroomWalkImages = [
  preloadImage('https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/DooomShroom_Walk_17_1754073487719.png'),
  preloadImage('https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/DooomShroom_Walk_14_1754073455661.png'),
  preloadImage('https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/DooomShroom_Walk_12_1754073415027.png'),
  preloadImage('https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/DoomShroom_Walk_7_1754072016048.png'),
  preloadImage('https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/DooomShroom_Walk_11_1754073404717.png')
];

// === FLYING ENEMY SPRITE SCALING ===
const FLYING_ENEMY_SCALE = 0.5; // 50% of original size

window.SpriteLibrary = {
  // === PLAYER ANIMATION: Use image sprites with NO scaling (draw at w × h) ===
  playerWalkLeft: playerWalkLeftImages.map(img => {
    return function(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    };
  }),
  playerWalkRight: playerWalkLeftImages.map(img => {
    // Mirror image for right-walk
    return function(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
    };
  }),

  // === ENEMY ANIMATION: Use enemy ship images with scaling for flying enemies ===
  enemyFrames: [
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_1_1753824654660.png"),
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_2_1753824672446.png"),
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_3_1753824680227.png"),
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_4_1753824688771.png"),
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_5_1753824699044.png"),
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_6_1753824709971.png"),
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_7_1753824720897.png"),
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_8_1753824730385.png"),
    preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/Enemy_Ship_9_1753824738269.png")
  ].map(img => {
    // For GroundJumperEnemy compatibility, attach .img property for easy access
    const fn = function(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      const scaledW = w * FLYING_ENEMY_SCALE;
      const scaledH = h * FLYING_ENEMY_SCALE;
      ctx.drawImage(img, x + (w - scaledW) / 2, y + (h - scaledH) / 2, scaledW, scaledH);
      ctx.restore();
    };
    fn.img = img;
    return fn;
  }),

  // === ENEMY 2: DooomShroom Frames ===
  doomShroomFrames: doomShroomWalkImages.map(img => {
    const fn = function(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    };
    fn.img = img;
    return fn;
  }),

  // === POWERUPS (simple shapes) ===
  powerupHealth: function(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + w/2, y + h/2, w/2.3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(40,230,100,0.87)';
    ctx.shadowColor = '#8cffb7'; ctx.shadowBlur = 12;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${w*0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', x + w/2, y + h/2);
    ctx.restore();
  },
  powerupInvincible: function(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + w/2, y + h/2, w/2.3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(80,180,255,0.87)';
    ctx.shadowColor = '#a6e2ff'; ctx.shadowBlur = 12;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${w*0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛡', x + w/2, y + h/2);
    ctx.restore();
  },
  powerupAttack: function(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + w/2, y + h/2, w/2.3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,200,50,0.90)';
    ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 12;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${w*0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💥', x + w/2, y + h/2);
    ctx.restore();
  },

  // === ENEMY EXPLOSION EFFECT ===
  enemyExplosion: function(ctx, cx, cy, w, h, t) {
    // t: 0.0 (start) to 1.0 (end)
    ctx.save();
    ctx.globalAlpha = 1 - t;
    // Main burst
    let r = w * (0.32 + 0.55 * t);
    let grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, '#fffbe0');
    grad.addColorStop(0.3, '#ffe066');
    grad.addColorStop(0.7, '#ff9900');
    grad.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = '#fffbe0';
    ctx.shadowBlur = 18 + 22 * (1 - t);
    ctx.fill();

    // Blue sparks
    for (let i = 0; i < 7; ++i) {
      let ang = (i / 7) * Math.PI * 2 + t * 2;
      let rr = r * (0.7 + 0.5 * Math.sin(t * 8 + i));
      ctx.save();
      ctx.globalAlpha = 0.5 * (1 - t);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 6 + 8 * (1 - t), 0, Math.PI * 2);
      ctx.fillStyle = '#6df';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    // Debris
    for (let i = 0; i < 8; ++i) {
      let ang = (i / 8) * Math.PI * 2 + t * 3;
      let rr = r * (0.9 + 0.7 * t) * (1 + 0.2 * Math.sin(i * 2 + t * 7));
      ctx.save();
      ctx.globalAlpha = 0.4 * (1 - t);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 3 + 2 * (1 - t), 0, Math.PI * 2);
      ctx.fillStyle = '#ffb300';
      ctx.shadowColor = '#fffbe0';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  },

  // === BACKGROUND: Use background image ===
  backgroundStage1: (function() {
    const bgImg = preloadImage("https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/0f84fe06-5c42-40c3-b563-1a28d18f37cc/library/BackGround_1_SS_1753769088005.png");
    return function(ctx, width, height, time) {
      if (bgImg.complete) {
        ctx.save();
        ctx.drawImage(bgImg, 0, 0, width, height);
        ctx.restore();
      } else {
        // fallback: fill with basic gradient until image loads
        let grad = ctx.createLinearGradient(0,0,0,height);
        grad.addColorStop(0, "#0a213d");
        grad.addColorStop(0.5, "#2356a0");
        grad.addColorStop(1, "#6daffe");
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,width,height);
      }
    };
  })()
};