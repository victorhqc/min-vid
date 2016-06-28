/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the 'License'). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

const qs = require('sdk/querystring');
var panel = require('sdk/panel').Panel({
  contentURL: './default.html',
  contentScriptFile: './controls.js',
  width: 320,
  height: 180,
  position: {
    bottom: 10,
    left: 10
  }
});

var { getActiveView } = require('sdk/view/core');
getActiveView(panel).setAttribute('noautohide', true);
getActiveView(panel).setAttribute('backdrag', true);

panel.port.on('link', opts => {
  var title = opts.title;

  if (title === 'send-to-tab') {
    require('sdk/tabs').open('https://youtube.com/watch?v=' + parseYoutubeId(opts.src) + '&t=' + opts.time);
    updatePanel('');
    panel.hide();
  } else if (title === 'close') {
    updatePanel('');
    panel.hide();
  } else if (title === 'minimize') {
    panel.hide();
    panel.show({
      height: 40,
      position: {
        bottom: 0,
        left: 10
      }
    });
  } else if (title === 'maximize') {
    panel.hide();
    panel.show({
      height: 180,
      position: {
        bottom: 10,
        left: 10
      }
    });
  }
});

function parseYoutubeId(src) {
  return src.substr(src.indexOf('embed/') + 6);
}

var cm = require('sdk/context-menu');

cm.Item({
  label: 'Send to mini player',
  context: cm.SelectorContext('[href*="youtube.com"], [href*="youtu.be"]'),
  contentScript: "self.on('click', function (node, data) {" +
                 '  self.postMessage(node.href);' +
                 '});',
  onMessage: function(url) {
    updatePanel(constructYoutubeEmbedUrl(url));
  }
});

cm.Item({
  label: 'Send to mini player',
  context: [
    cm.URLContext(['*.youtube.com']),
    cm.SelectorContext('[class*="yt-uix-sessionlink"]')
  ],
  contentScript: "self.on('click', function (node, data) {" +
                 '  self.postMessage(node.href);' +
                 '});',
  onMessage: function(url) {
    updatePanel(constructYoutubeEmbedUrl(url));
  }
});

function updatePanel(url) {
  panel.port.emit('set-video', url);
  panel.show();
}

function constructYoutubeEmbedUrl(url) {
  const params = qs.stringify({
    autoplay: 0,
    showinfo: 0,
    controls: 0,
    enablejsapi: 1,
    modestbranding: 1
  });

  return 'https://www.youtube.com/embed/' + require('get-youtube-id')(url) + '?' + params;
}

var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: '*',
  contentScriptFile: './resize-listener.js',
  onAttach: function(worker) {
    worker.port.on("resized", function() {
      refreshPanel();
    });
  }
});

function refreshPanel() {
  if (panel.isShowing) {
    panel.hide();
    panel.show();
  }
}
