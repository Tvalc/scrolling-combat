window.UI = window.UI || {};
window.UI.drawHUD = function(game) {
  const ctx = game.ctx;
  ctx.save();
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#222";
  ctx.fillRect(18, 18, 180, 22);
  ctx.fillStyle = "#4cf55a";
  ctx.fillRect(18, 18, 180 * (game.player.health / game.player.maxHealth), 22);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 180, 22);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`Health: ${game.player.health}/${game.player.maxHealth}`, 24, 21);
  ctx.font = "bold 22px Arial";
  ctx.fillText("Lives: " + game.player.lives, 18, 48);

  // --- NEW: Draw Level/Stage/Wave Info in upper left below HUD ---
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#ffe066";
  // Fallback values if undefined
  const level = (typeof game.level !== "undefined") ? game.level + 1 : 1;
  const stage = (typeof game.stage !== "undefined") ? game.stage + 1 : 1;
  const wave = (typeof game.wave !== "undefined") ? game.wave + 1 : 1;

  ctx.fillText(`Level ${level}  -  Stage ${stage}  -  Wave ${wave}`, 18, 78);

  ctx.restore();
};

// Menu system
window.UI.showMenu = function(title, buttons, cb) {
  console.log('[UI.showMenu] called', title, buttons);
  const overlay = document.getElementById('menu-overlay');
  const content = document.getElementById('menu-content');
  if (!overlay || !content) return;

  // Build menu HTML
  let html = '';
  if (title) {
    html += `<h1 style="margin-top:0;margin-bottom:18px;font-size:2rem;text-align:center;">${title}</h1>`;
  }
  for (let btn of buttons) {
    // If id starts with 'noop', render disabled label/button (for controls display)
    if (btn.id && btn.id.startsWith('noop')) {
      html += `<div style="margin:12px 0;font-size:1.1rem;opacity:0.76;text-align:center;">${btn.label}</div>`;
    } else {
      html += `<button id="${btn.id}" style="margin:10px auto 0 auto;display:block;width:220px;font-size:1.15rem;padding:13px 0;border-radius:7px;border:none;background:#34b4fa;color:#fff;cursor:pointer;">${btn.label}</button>`;
    }
  }
  content.innerHTML = html;

  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  if (typeof cb === 'function') setTimeout(cb, 0);
};

window.UI.hideMenu = function() {
  const overlay = document.getElementById('menu-overlay');
  if (overlay) overlay.style.display = 'none';
};