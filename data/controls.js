/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the 'License'). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

document.querySelector('.controls').style.display = 'none';
document.querySelector('.video').style.display = 'none';

Array.from(document.querySelectorAll('a')).forEach(el => {
  el.onclick = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    self.port.emit('link', {
      title: el.title,
      src: document.querySelector('iframe').src
    });
  };
});

self.port.on('set-video', url => {
  document.querySelector('.welcome').style.display = 'none';
  document.querySelector('.controls').style.display = 'block';
  document.querySelector('.video').style.display = 'block';
  document.querySelector('iframe').src = url;
});
