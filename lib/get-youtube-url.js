var Request = require('sdk/request').Request;
var qs = require('sdk/querystring');

const baseURL = 'http://www.youtube.com/get_video_info';

module.exports = getYoutubeUrl;

function getYoutubeUrl(videoId, cb) {
  Request({
    url: baseURL + '?' + qs.stringify({video_id: videoId}),
    onComplete: function (resp) {
      var streamParams = qs.parse(resp.text)['url_encoded_fmt_stream_map'].split(',')[0];
      cb(null, qs.parse(streamParams).url);
    }
  }).get();
}
