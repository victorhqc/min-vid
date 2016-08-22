const React = require('react');
const cn = require('classnames');
const ReactTooltip = require('react-tooltip');
const sendMetricsEvent = require('../client-lib/send-metrics-event.js');
const GeneralControls = require('./general-controls.js');

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
  render: function() {
    sendMetricsEvent('loading_view', 'render');
    return (
        <div className='loading' onMouseEnter={this.enterView} onMouseLeave={this.leaveView}>
          <ReactTooltip place='bottom' effect='solid' />
          <div className={cn('controls', {hidden: !this.state.hovered, minimized: this.props.minimized})}>
            <div className='left' />
            <GeneralControls props={this.props} />
          </div>

          <img src={'img/loading-bars.svg'} alt={'loading animation'}
               width={64} height={64}></img>
          <p>Loading video from {this.props.domain}</p>
        </div>
    );
  }
});
