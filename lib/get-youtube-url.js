const baseURL = 'https://www.youtube.com/embed';
const params = require('sdk/querystring').stringify({
  autoplay: 0,
  modestbranding: 1,
  controls: 0,
  disablekb: 0,
  enablejsapi: 1,
  fs: 0,
  iv_load_policy: 3,
  loop: 0,
  rel: 0,
  showinfo: 0
});

module.exports = getYouTubeUrl;

function getYouTubeUrl(videoId, cb) {
  cb(null, `${baseURL}/${videoId}/?${params}`);
}
