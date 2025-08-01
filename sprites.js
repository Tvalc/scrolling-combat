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

// Use 8 frames for left walk, but you may want to reduce to 6 for symmetry if needed
// For right, we'll mirror the image draw

window.SpriteLibrary = {
  // === PLAYER ANIMATION: Use image sprites ===
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

  // === ENEMY ANIMATION: Use enemy ship images ===
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
    return function(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    };
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