const React = require('react');
const ReactTooltip = require('react-tooltip');
const cn = require('classnames');

const sendToAddon = require('../lib/send-to-addon');
const sendMetricsEvent = require('../lib/send-metrics-event.js');

function formatTime(seconds) {
  const now = new Date(seconds * 1000);
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000));
  return utc.toLocaleTimeString('en-US', {hour12: false})
    .replace(/^00:/, '') // Strip leading "00:" if hours is empty.
    .replace(/^0/, '');  // Strip leading "0" in minutes, if any.
}

module.exports = React.createClass({
  getInitialState: function() {
    return {showVolume: false, hovered: false};
  },
  step: function() {
    window.AppData = Object.assign(window.AppData, {
      currentTime: `${formatTime(this.refs.video.currentTime)} / ${formatTime(window.AppData.duration)}`,
      progress: this.refs.video.currentTime / window.AppData.duration
    });

    if (this.refs.video.currentTime >= window.AppData.duration) {
      window.AppData.playing = false;
      window.AppData.playedCount++;
      sendMetricsEvent('player_view', 'video_ended');
    }

    if (window.AppData.playing) requestAnimationFrame(this.step);
  },
  onLoaded: function() {
    sendMetricsEvent('player_view', 'video_loaded');
    window.AppData = Object.assign(window.AppData, {
      loaded: true,
      duration: this.refs.video.duration
    });

    requestAnimationFrame(this.step);
  },
  componentDidMount: function() {
    this.refs.video.addEventListener('canplay', this.onLoaded);
    this.refs.video.addEventListener('durationchange', this.onLoaded);
    // TODO: progress here will help us calculate load/buffering of video
    this.refs.video.addEventListener('progress', ev => {});
  },
  play: function() {
    if (this.hasExited()) {
      return this.replay();
    }
    sendMetricsEvent('player_view', 'play');
    this.refs.video.play();
    window.AppData.playing = true;
    requestAnimationFrame(this.step);
  },
  pause: function() {
    sendMetricsEvent('player_view', 'pause');
    this.refs.video.pause();
    window.AppData.playing = false;
  },
  mute: function() {
    sendMetricsEvent('player_view', 'mute');
    this.refs.video.muted = true;
    window.AppData = Object.assign(window.AppData, {
      muted: true,
      volume: 0
    });
  },
  unmute: function() {
    sendMetricsEvent('player_view', 'unmute');
    this.refs.video.muted = false;
    window.AppData = Object.assign(window.AppData, {
      muted: false,
      volume: this.refs.video.volume
    });
  },
  setVolume: function(ev) {
    const muted = (ev.target.value === 0);
    this.refs.video.volume = ev.target.value;

    window.AppData = Object.assign(window.AppData, {
      muted: muted,
      volume: ev.target.value
    });
  },
  minimize: function() {
    sendMetricsEvent('player_view', 'minimize');
    sendToAddon({action: 'minimize'});
    window.AppData.minimized = true;
  },
  maximize: function() {
    sendMetricsEvent('player_view', 'maximize');
    sendToAddon({action: 'maximize'});
    window.AppData.minimized = false;
  },
  sendToTab: function() {
    sendMetricsEvent('player_view', 'send_to_tab');
    sendToAddon({
      action: 'send-to-tab',
      id: window.AppData.id,
      domain: window.AppData.domain,
      time: this.refs.video.currentTime
    });
  },
  setTime: function(ev) {
    const x = ev.pageX - ev.target.offsetLeft;
    const clickedValue = x * ev.target.max / ev.target.offsetWidth;

    this.refs.video.currentTime = this.refs.video.duration * clickedValue;
  },
  replay: function() {
    sendMetricsEvent('player_view', 'replay');
    this.refs.video.currentTime = 0;
    this.step(); // step once to set currentTime of window.AppData and progress
    this.play();
  },
  close: function() {
    sendMetricsEvent('player_view', 'close');
    sendToAddon({action: 'close'});
  },
  enterControls: function() {
    this.setState({showVolume: true});
  },
  leaveControls: function() {
    this.setState({showVolume: false});
  },
  enterPlayer: function() {
    this.setState({hovered: true});
  },
  leavePlayer: function() {
    this.setState({hovered: false});
  },
  hasExited: function() {
    if (!this.refs.video) return false;
    return (!this.props.playing && (this.refs.video.currentTime >= this.props.duration));
  },
  render: function() {
    sendMetricsEvent('player_view', 'render');
    return (
        <div className={'video-wrapper'} onMouseEnter={this.enterPlayer}
             onMouseLeave={this.leavePlayer}>
          <div className={cn('controls', {hidden: !this.state.hovered, minimized: this.props.minimized})}
               onMouseEnter={this.enterControls} onMouseLeave={this.leaveControls}>
            <div className='left'>
              <ReactTooltip place='bottom' effect='solid' />

              <a onClick={this.play} data-tip='Play'
                 className={cn('play', {hidden: this.props.playing})} />
              <a onClick={this.pause} data-tip='Pause'
                 className={cn('pause', {hidden: !this.props.playing})} />
              <a onClick={this.mute} data-tip='Mute'
                 className={cn('mute', {hidden: this.props.muted})} />
              <a onClick={this.unmute} data-tip='Unmute'
                 className={cn('unmute', {hidden: !this.props.muted})} />
              <input type='range' className={cn('volume', {hidden: !this.state.showVolume})}
                     min='0' max='1' step='.01' value={this.props.volume}
                     onChange={this.setVolume}/>
            </div>

            <div className='right'>
              <a onClick={this.sendToTab} data-tip='Send to tab' className='tab' />
              <a onClick={this.minimize} data-tip='Minimize'
                 className={cn('minimize', {hidden: this.props.minimized})} />
              <a onClick={this.maximize} data-tip='Maximize'
                 className={cn('maximize', {hidden: !this.props.minimized})} />
              <a onClick={this.close} data-tip='Close' className='close' />
            </div>
          </div>

          <div className={cn('exited', {hidden: !this.hasExited()})}>
            <div className='row'>
              <button className='exit-replay' onClick={this.replay}></button>
              <button className='exit-close' onClick={this.close}></button>
            </div>
          </div>

          <div className={cn('progress', {hidden: !this.state.hovered || this.props.minimized})}>
            <span className={'domain'}>{this.props.domain}</span>
            <div className={'time'}>{this.props.currentTime}</div>
            <progress className={'video-progress'} onClick={this.setTime}
                      value={this.props.progress + ''}  />
          </div>

          <video id={'video'} ref={'video'} src={this.props.src} autoplay={false} />
        </div>
    );
  }
});
