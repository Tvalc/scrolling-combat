window.GAME_WIDTH = 760;
window.GAME_HEIGHT = 420;

// The background image is drawn to exactly GAME_HEIGHT.
// The visible "ground" is at the bottom of the image, so FLOOR_Y should be set so
// that the bottom of the player sprite is flush with the bottom of the canvas/background.
// Thus, FLOOR_Y = GAME_HEIGHT.
window.FLOOR_Y = window.GAME_HEIGHT; // y coordinate for ground

window.PLAYER_WIDTH = 48;
window.PLAYER_HEIGHT = 68;
window.PLAYER_SPEED = 4.2;
window.PLAYER_JUMP_VEL = -11.5;
window.PLAYER_GRAVITY = 0.65;
window.PLAYER_ATTACK_COOLDOWN = 380; // ms
window.PLAYER_ATTACK_RANGE = 55;
window.PLAYER_ATTACK_ARC = Math.PI / 2.6; // radians (attack cone)

window.ENEMY_WIDTH = 44;
window.ENEMY_HEIGHT = 60;
window.ENEMY_SPEED = 2.2;
window.ENEMY_HEALTH = 32;
window.ENEMY_ATTACK_DAMAGE = 8;
window.ENEMY_ATTACK_COOLDOWN = 950;
window.ENEMY_ATTACK_RANGE = 40;
window.ENEMY_JUMP_CHANCE = 0.06;
window.ENEMY_COLORS = ['#34b4fa', '#ef5d5b', '#f8de22', '#a4ea4f', '#e874fa'];

window.POWERUP_SIZE = 32;
window.POWERUP_TYPES = ['health', 'invincible', 'attack'];
window.POWERUP_COLORS = {
  health: ['#ff3d3d', '#fff6f6'],
  invincible: ['#fff900', '#f8ff9b'],
  attack: ['#7e00fa', '#e8c1ff']
};
window.POWERUP_EFFECTS = {
  health: {heal: 26},
  invincible: {duration: 4000},
  attack: {duration: 4000, multiplier: 1.7}
};