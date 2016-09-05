/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the 'License'). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

const pageMod = require('sdk/page-mod');
const getYouTubeUrl = require('./lib/get-youtube-url.js');
const getVimeoUrl = require('./lib/get-vimeo-url.js');
const launchVideo = require('./lib/launch-video');
const sendMetricsData = require('./lib/send-metrics-data.js');
const getDocumentDimensions = require('./lib/get-document-dimensions.js');
const initContextMenuHandlers = require('./lib/context-menu-handlers.js');
const { getActiveView } = require('sdk/view/core');

let dimensions = getDocumentDimensions();

const panel = require('sdk/panel').Panel({
  contentURL: './default.html',
  contentScriptFile: './controls.js',
  width: 320,
  height: 180,
  position: {
    bottom: 10,
    left: 10
  }
});

// Makes an SDK panel draggable. Pass in an SDK panel.
function draggifyPanel(panel) {
  // Remove the panel from the XUL DOM, make some attribute changes, then
  // reattach it. Reseating in the DOM triggers updates in the XBL bindings
  // that give the panel draggability and remove some SDK styling.
  const panelEl = getActiveView(panel);
  const parentEl = panelEl.parentNode;

  parentEl.removeChild(panelEl);

  panelEl.setAttribute('noautohide', true);
  panelEl.setAttribute('backdrag', true);
  panelEl.setAttribute('style', '-moz-appearance: none; border: 0; margin: 0; background: rgba(0,0,0,0)');
  panelEl.removeAttribute('type');

  // Next, we need a XUL document to create a drag handle. There may be better
  // ways to obtain the document element, but this works:
  let doc = parentEl;
  while (doc !== null && doc.nodeType !== 9) {
    doc = doc.parentNode;
  }

  const dragHandle = doc.createElement('label');
  dragHandle.id = 'backdragspot';
  // TODO: the drag handle doesn't seem to be visible--maybe the iframe is set
  // to full height, or has a higher z-index?
  dragHandle.setAttribute('value', 'click here to drag the thing');
  dragHandle.setAttribute('style', 'background: #2b2b2b; border: 1px solid black; color: #d5d5d5; cursor: grab');
  dragHandle.setAttribute('hidden', true);
  dragHandle.onmousedown = () => { dragHandle.style.cursor = 'grabbing' }
  dragHandle.onmouseup = () => { dragHandle.style.cursor = 'grab' }
  panelEl.appendChild(dragHandle);

  // make the drag handle only visible on mouseover
  panelEl.onmouseenter = () => { dragHandle.setAttribute('hidden', false) };
  panelEl.onmouseleave = () => { dragHandle.setAttribute('hidden', true) };

  parentEl.appendChild(panelEl);
}

draggifyPanel(panel);

panel.port.on('addon-message', opts => {
  const title = opts.action;

  if (title === 'send-to-tab') {
    const pageUrl = getPageUrl(opts.domain, opts.id, opts.time);
    if (pageUrl) require('sdk/tabs').open(pageUrl);
    else {
      console.error('could not parse page url for ', opts); // eslint-disable-line no-console
      panel.port.emit('set-video', {error: 'Error loading video from ' + opts.domain});
    }
    panel.port.emit('set-video', {domain: '', src: ''});
    panel.hide();
  } else if (title === 'close') {
    panel.port.emit('set-video', {domain: '', src: ''});
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
  } else if (title === 'expand-panel') {
    panel.hide();
    panel.show({
      width: dimensions.width,
      height: dimensions.height,
      position: opts.position
    });
  } else if (title === 'shrink-panel') {
    panel.hide();
    panel.show({
      width: opts.style.width,
      height: opts.style.height,
      position: opts.position
    });
  } else if (title === 'metrics-event') {
    sendMetricsData(opts, panel);
  }
});

function getPageUrl(domain, id, time) {
  let url;
  if (domain.indexOf('youtube') > -1) {
    url = `https://youtube.com/watch?v=${id}&t=${Math.floor(time)}`;
  } else if (domain.indexOf('vimeo') > -1) {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time - min * 60);
    url = `https://vimeo.com/${id}#t=${min}m${sec}s`;
  } else if (domain.indexOf('vine') > -1) {
    url = `https://vine.co/v/${id}`;
  }

  return url;
}

// handle browser resizing
pageMod.PageMod({
  include: '*',
  contentScriptFile: './resize-listener.js',
  onAttach: function(worker) {
    worker.port.on('resized', function() {
      if (panel.isShowing) {
        panel.hide();
        panel.show();
      }

      // update our document dimensions
      dimensions = getDocumentDimensions();
    });
  }
});

// add launch icon to video embeds
pageMod.PageMod({
  include: '*',
  contentStyleFile: './icon-overlay.css',
  contentScriptFile: './icon-overlay.js',
  onAttach: function(worker) {
    worker.port.on('launch', function(opts) {
      if (opts.domain.indexOf('youtube.com') > -1) {
        opts.getUrlFn = getYouTubeUrl;
        sendMetricsData({
          object: 'overlay_icon',
          method: 'launch',
          domain: opts.domain
        }, panel);
        launchVideo(opts, panel);
      } else if (opts.domain.indexOf('vimeo.com')  > -1) {
        opts.getUrlFn = getVimeoUrl;
        sendMetricsData({
          object: 'overlay_icon',
          method: 'launch',
          domain: opts.domain
        }, panel);
        launchVideo(opts, panel);
      }
    });

    worker.port.on('metrics', function(opts) {
      sendMetricsData(opts);
    });
  }
});

// add 'send-to-mini-player' option to context menu
initContextMenuHandlers(panel);
