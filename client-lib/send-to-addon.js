module.exports = sendToAddon;

function sendToAddon(obj) {
  window.dispatchEvent(new CustomEvent('message', {detail: obj}));
}
