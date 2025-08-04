// Basic input state system for Coop vs. FUD Monsters

window.input = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  attack: false,
};

(function() {
  const keyMap = {
    'ArrowLeft': 'left',
    'a': 'left',
    'A': 'left',
    'ArrowRight': 'right',
    'd': 'right',
    'D': 'right',
    'ArrowUp': 'jump',
    'w': 'jump',
    'W': 'jump',
    ' ': 'jump',
    'Space': 'jump',
    'j': 'attack',
    'J': 'attack',
    'k': 'attack',
    'K': 'attack',
    'Enter': 'attack',
  };

  window.addEventListener('keydown', function(e) {
    const key = e.key || e.code;
    const mapped = keyMap[key] || keyMap[e.code];
    if (mapped) window.input[mapped] = true;
  });

  window.addEventListener('keyup', function(e) {
    const key = e.key || e.code;
    const mapped = keyMap[key] || keyMap[e.code];
    if (mapped) window.input[mapped] = false;
  });

  // Optional: simple touch controls (tap left/right/jump/attack)
  // For a full implementation, add touch buttons to the DOM and update window.input accordingly.
})();