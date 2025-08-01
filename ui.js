window.UI = {
  drawHUD: function(game) {
    const ui = document.getElementById('ui-overlay');
    if (!ui) return;
    ui.innerHTML = `
      <div class="ui-bar flex-row gap-8 items-center mt-2">
        <div class="ui-label">Level <span class="text-blue-200">${game.level+1}</span> &nbsp;|&nbsp; Stage <span class="text-blue-200">${game.stage+1}</span> &nbsp;|&nbsp; Wave <span class="text-blue-200">${game.wave+1}</span></div>
        <div class="ui-label flex flex-row items-center gap-2">
          <span>Lives:</span>
          ${Array(game.player.lives).fill('<span class="ml-1 text-2xl">💙</span>').join('')}
        </div>
        <div class="ui-label flex flex-row items-center gap-2">
          <span>Health:</span>
          <div class="ui-health-bg inline-block align-middle">
            <div class="ui-health-inner" style="width: ${(game.player.health/game.player.maxHealth)*100}%"></div>
          </div>
        </div>
        <div class="ui-label flex flex-row items-center gap-2">
          ${game.player.invincible ? '<span class="ml-1 text-xl">🛡️</span>' : ''}
          ${game.player.attackBoost ? '<span class="ml-1 text-xl">💥</span>' : ''}
        </div>
      </div>
    `;
  },
  showMenu: function(title, buttons, callback) {
    const ui = document.getElementById('ui-overlay');
    if (!ui) return;
    ui.innerHTML = `
      <div class="menu-container">
        <div class="menu-title">${title}</div>
        ${buttons.map(btn => `<button class="menu-btn" id="${btn.id}">${btn.label}</button>`).join('')}
      </div>
    `;
    // Guarantee DOM is updated before callback runs (fixes timing bugs)
    if (typeof callback === 'function') {
      // Use requestAnimationFrame to allow DOM update, then call callback
      requestAnimationFrame(() => {
        callback();
      });
    }
  }
};