// Simple procedural wave manager for Coop vs. FUD Monsters

window.WaveManager = (function() {
  function getWaveEnemyCount(waveIdx) {
    // Example: increase number of enemies per wave
    return 3 + Math.floor(waveIdx * 1.5);
  }

  function getEnemySpawnParams(game, waveIdx) {
    // Randomize spawn positions for variety
    const enemies = [];
    const count = getWaveEnemyCount(waveIdx);
    for (let i = 0; i < count; ++i) {
      const x = 300 + Math.random() * (game.width - 400);
      const y = window.FLOOR_Y - 120 - Math.random() * 200;
      enemies.push({ x, y });
    }
    return enemies;
  }

  function spawnWave(game, waveIdx) {
    const params = getEnemySpawnParams(game, waveIdx);
    game.enemies = [];
    for (let e of params) {
      game.enemies.push(new window.Enemy(game, e.x, e.y));
    }
    game.wave = waveIdx;
  }

  return {
    spawnWave,
    getWaveEnemyCount
  };
})();