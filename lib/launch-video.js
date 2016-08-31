const getVideoId = require('get-video-id');
const makePanelTransparent = require('./make-panel-transparent.js');

module.exports = launchVideo;

// Pass in a video URL as opts.src or pass in a video URL lookup function as opts.getUrlFn
function launchVideo(opts, panel) {
  if (!panel) throw new Error('panel needs to be provided as second argument');
  // opts {url: url,
  //       getUrlFn: getYouTubeUrl,
  //       domain: 'youtube.com',
  //       src: streamURL or ''}
  const id = getVideoId(opts.url);
  panel.port.emit('set-video', {domain: opts.domain, id: id, src: opts.src || ''});
  panel.show();
  if (!opts.src) {
    opts.getUrlFn(id, function(err, streamUrl) {
      if (!err) {
        panel.port.emit('set-video', {src: streamUrl});
        panel.show();
      }
    });
  }
  // todo: see if we can just call this when initializing the panel
  makePanelTransparent(panel);
}
