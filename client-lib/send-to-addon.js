module.exports = sendToAddon;

function sendToAddon(obj) {
  window.dispatchEvent(new CustomEvent('addon-message', {detail: obj}));
}
