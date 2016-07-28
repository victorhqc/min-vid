const hiddenFrames = require('sdk/frame/hidden-frame');

module.exports = getVineUrl;

// getVineUrl: Given a vine.co URL, returns URL of the video.
//
// Takes two arguments: the vine.co URL and a callback.
// The callback will be passed two arguments:
// the first argument is null or an error string,
// the second argument is the vine CDN URL of the mp4 video (or null).
function getVineUrl(vineURL, cb) {
  const hiddenFrame = hiddenFrames.add(hiddenFrames.HiddenFrame({
    onReady: function() {
      this.element.contentWindow.location = vineURL;
      this.element.addEventListener('DOMContentLoaded', () => {
        const doc = this.element.contentDocument;
        const videoEl = doc.querySelector('meta[property="twitter:player:stream"]');
        const videoURL = videoEl ? videoEl.content : null;
        cb(null, videoURL);

        hiddenFrames.remove(hiddenFrame);
      });
    }
  }));
}
