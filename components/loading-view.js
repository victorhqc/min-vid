const React = require('react');
const cn = require('classnames');
const ReactTooltip = require('react-tooltip');
const sendToAddon = require('../lib/send-to-addon');
const sendMetricsEvent = require('../lib/send-metrics-event.js');

module.exports = React.createClass({
  getInitialState: function() {
    return {hovered: false};
  },
  enterView: function() {
    this.setState({hovered: true});
  },
  leaveView: function() {
    this.setState({hovered: false});
  },
  close: function() {
    sendMetricsEvent('loading_view', 'close');
    sendToAddon({action: 'close'});
  },
  render: function() {
    sendMetricsEvent('loading_view', 'render');
    return (
        <div className={'loading'} onMouseEnter={this.enterView} onMouseLeave={this.leaveView}>
          <ReactTooltip place='bottom' effect='solid' />

          <a className={cn('close', {hidden: this.state.hovered})}
             onClick={this.close} data-tip='Close' />

          <img src={'img/loading-bars.svg'} alt={'loading animation'}
               width={64} height={64}></img>
          <p>Loading video from {this.props.domain}</p>
        </div>
    );
  }
});
