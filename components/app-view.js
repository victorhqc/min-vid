const React = require('react');
const Draggable = require('react-draggable');
const sendToAddon = require('../client-lib/send-to-addon');

const PlayerView = require('./player-view');
const LoadingView = require('./loading-view');
const ErrorView = require('./error-view');

const xtend = Object.assign;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      style: {
        width: 320,
        height: 180
      },
      position: {
        bottom: 0,
        left: 0
      }
    };
  },
  handleDragStart: function(ev) {
    if (ev.target.classList.contains('controls') || ev.target.id === 'video') {
      sendToAddon(xtend(this.state, {action: 'expand-panel'}));
      this.setState({draggablePosition: null});
    } else return;
  },
  handleDragStop: function(ev, data) {
    this.setState({position: {
      left: data.x,
      top: data.y
    }});
    sendToAddon(xtend(this.state, {action: 'shrink-panel'}));
    this.setState({draggablePosition: {x: 0, y: 0}});
  },
  render: function() {
    return (
        <Draggable onStop={this.handleDragStop} onStart={this.handleDragStart} position={this.state.draggablePosition}>
          <div className={'app'} style={this.state.style} ref={(el) => this._element = el}>
            {/* Show Error View, ELSE Show Loading View ELSE no view */}
            {this.props.error ? <ErrorView {...this.props}/> :
              (!this.props.loaded) ? <LoadingView {...this.props}/> : null}

            <div className={this.props.loaded ? 'player-wrap' : 'player-wrap hidden'}>
              <PlayerView {...this.props} />
            </div>
          </div>
        </Draggable>
    );
  }
});
