/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the 'License'). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

var frameEl = document.querySelector('iframe');

var controls = document.querySelector('.controls');
var progress = document.querySelector('.progress');

var volumeEl = controls.querySelector('.volume');
var minBtn = controls.querySelector('.min');
var maxBtn = controls.querySelector('.max');
var muteBtn = controls.querySelector('.mute');
var unmuteBtn = controls.querySelector('.unmute');

/*
 * update iframe src attribute on message from index.js
 */
self.port.on('set-video', url => {
  frameEl.src = url;
});

/*
 * Setup global link catch for panel
 */
Array.from(document.querySelectorAll('a')).forEach(el => {
  el.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    var opts = {
      title: el.title,
      src: frameEl.src
    };
    if (el.title === 'send-to-tab') {
      reset();
      opts.time = document.querySelector('.time').getAttribute('current-time');
    } else if (el.title === 'close') {
      reset();
    }
    self.port.emit('link', opts);
  }, false, true);
});

/*
 * Reset the whole view, on close, send-to-tab.
 */
function reset() {
  // top level view wrappers
  document.querySelector('.loading').classList.remove('hidden');
  document.querySelector('.error').classList.add('hidden');

  controls.classList.remove('minimized');
}

/*
 * Controls event handlers
 */
controls.querySelector('[title="playback"]').addEventListener('click', ev => {
  if (ev.target.classList.contains('play')) {
    ytPlay();
    ev.target.classList.add('pause');
    ev.target.classList.remove('play');
  } else {
    ytPause();
    ev.target.classList.add('play');
    ev.target.classList.remove('pause');
  }
}, false, true);

muteBtn.addEventListener('click', ev => {
  ytMute();
  muteBtn.classList.add('hidden');
  unmuteBtn.classList.remove('hidden');
  volumeEl.setAttribute('value', 0);
}, false, true);

unmuteBtn.addEventListener('click', ev => {
  ytUnmute();
  unmuteBtn.classList.add('hidden');
  muteBtn.classList.remove('hidden');
  volumeEl.setAttribute('value', unsafeWindow.ytPlayer.getVolume());
}, false, true);

minBtn.addEventListener('click', ev => {
  controls.classList.add('minimized');
  minBtn.classList.add('hidden');
  maxBtn.classList.remove('hidden');
  progress.classList.add('hidden');
}, false, true);

maxBtn.addEventListener('click', ev => {
  controls.classList.remove('minimized');
  maxBtn.classList.add('hidden');
  minBtn.classList.remove('hidden');
  progress.classList.remove('hidden');
}, false, true);

volumeEl.addEventListener('change', ev => {
  if (!parseInt(ev.target.value, 10)) {
    ytMute();
    muteBtn.classList.add('hidden');
    unmuteBtn.classList.remove('hidden');
  } else {
    unsafeWindow.ytPlayer.setVolume(parseInt(ev.target.value), 10);
    ytUnmute();
  }
}, false, true);

/*
 * wrappers around youtube api
 */

function ytMute() {
  unsafeWindow.ytPlayer.mute();
}

function ytUnmute() {
  unsafeWindow.ytPlayer.unMute();
}

function ytPlay() {
  if (unsafeWindow.ytPlayer.getPlayerState() !== unsafeWindow.YT.PlayerState.PLAYING) {
    unsafeWindow.ytPlayer.playVideo();
  }
}

function ytPause() {
  if (unsafeWindow.ytPlayer.getPlayerState() === unsafeWindow.YT.PlayerState.PLAYING) {
    unsafeWindow.ytPlayer.pauseVideo();
  }
}
