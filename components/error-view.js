const React = require('react');
const sendMetricsEvent = require('../lib/send-metrics-event.js');

module.exports = React.createClass({
  render: function() {
    sendMetricsEvent('error_view', 'render');
    return (
        <div className={'error'}>
          <img src={'img/sadface.png'}
               alt={'sadface because of error'}
               width={164} height={164}></img>
        </div>
    );
  }
});
