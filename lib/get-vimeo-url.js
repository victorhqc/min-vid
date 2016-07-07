var Request = require("sdk/request").Request;

module.exports = getVimeoUrl;

function getVimeoUrl(videoId, cb) {
  Request({
    url: 'https://player.vimeo.com/video/' + videoId + '/config',
    onComplete: function (resp) {
      cb(null, resp.json.request.files.progressive[0].url);
    }
  }).get();
}
