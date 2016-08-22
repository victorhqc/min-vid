const React = require('react');
const cn = require('classnames');
const sendToAddon = require('../client-lib/send-to-addon');
const sendMetricsEvent = require('../client-lib/send-metrics-event.js');

module.exports = React.createClass({
  close: function() {
    sendMetricsEvent('loading_view', 'close');
    sendToAddon({action: 'close'});
  },
  minimize: function() {
    sendMetricsEvent('loading_view', 'minimize');
    sendToAddon({action: 'minimize'});
    window.AppData.minimized = true;
  },
  maximize: function() {
    sendMetricsEvent('loading_view', 'maximize');
    sendToAddon({action: 'maximize'});
    window.AppData.minimized = false;
  },
  sendToTab: function() {
    sendMetricsEvent('loading_view', 'send_to_tab');
    sendToAddon({
      action: 'send-to-tab',
      id: window.AppData.id,
      domain: window.AppData.domain,
      time: this.refs.video.currentTime
    });
  },
  render: function() {
    return (
      <div className='right'>
        <a onClick={this.sendToTab} data-tip='Send to tab' className='tab' />
        <a className={cn('minimize', {hidden: this.props.minimized})}
          onClick={this.minimize} data-tip='Minimize' />
        <a onClick={this.maximize} data-tip='Maximize'
          className={cn('maximize', {hidden: !this.props.minimized})} />
        <a className='close' onClick={this.close} data-tip='Close' /> 
      </div>
    );  
  }
});
