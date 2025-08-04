// Simple audio system

window.AudioSystem = {
  sounds: {},
  music: null,

  loadSound: function(name, url) {
    const audio = new window.Audio();
    audio.src = url;
    audio.preload = "auto";
    this.sounds[name] = audio;
  },

  play: function(name, volume = 1.0) {
    const sfx = this.sounds[name];
    if (sfx) {
      try {
        sfx.currentTime = 0;
        sfx.volume = volume;
        sfx.play();
      } catch (e) {}
    }
  },

  loadMusic: function(url) {
    if (this.music) this.music.pause();
    this.music = new window.Audio();
    this.music.src = url;
    this.music.loop = true;
    this.music.volume = 0.65;
    this.music.preload = "auto";
  },

  playMusic: function() {
    if (this.music) {
      this.music.currentTime = 0;
      this.music.play();
    }
  },

  stopMusic: function() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }
};

// Example: preload SFX and music
window.AudioSystem.loadSound("attack", "https://cdn.pixabay.com/audio/2022/10/16/audio_12e6e7c0e5.mp3");
window.AudioSystem.loadSound("hit", "https://cdn.pixabay.com/audio/2022/10/16/audio_127b0e6b2a.mp3");
window.AudioSystem.loadMusic("https://cdn.pixabay.com/audio/2022/03/15/audio_115b5e2d36.mp3");