const Request = require('sdk/request').Request;
const qs = require('sdk/querystring');

const baseURL = 'https://www.youtube.com/get_video_info';

module.exports = getYouTubeUrl;

function getYouTubeUrl(videoId, cb) {
  Request({
    url: baseURL + '?' + qs.stringify({video_id: videoId}),
    onComplete: function (resp) {
      const streamParams = qs.parse(resp.text)['url_encoded_fmt_stream_map'].split(',')[0];
      cb(null, qs.parse(streamParams).url);
    }
  }).get();
}
