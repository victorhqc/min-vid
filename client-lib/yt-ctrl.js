module.exports = {
  init: init,
  play: play,
  pause: pause,
  mute: mute,
  unmute: unmute,
  setVolume: setVolume,
  getVolume: getVolume,
  getTime: getTime,
  setTime: setTime,
  getDuration: getDuration,
};

function init(id, opts) {
  if (!window.YT) return opts.onError('window.YT not yet initialized');

  window.YTPlayer = new window.YT.Player(id, {
    events: {
      onReady: opts.onReady,
      onError: opts.onError
    }
  });
}

function play() {
  window.YTPlayer.playVideo();
}

function pause() {
  window.YTPlayer.pauseVideo();
}

function mute() {
  window.YTPlayer.mute();
}

function unmute() {
  window.YTPlayer.unMute();
}

// v:int
function setVolume(v) {
  window.YTPlayer.setVolume(v);
}

function getVolume() {
  return window.YTPlayer.getVolume();
}

function getTime() {
  return window.YTPlayer.getCurrentTime();
}

function setTime(seconds) {
  window.YTPlayer.seekTo(seconds, true);
}

function getDuration() {
  return window.YTPlayer.getDuration();
}
