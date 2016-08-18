const { getMostRecentBrowserWindow, getXULWindow } = require('sdk/window/utils');

module.exports = getDocumentDimensions;

function getDocumentDimensions() {
  let chromeWindow = getMostRecentBrowserWindow();
  if (!chromeWindow.document) {
    chromeWindow = getXULWindow(chromeWindow);
  }

  return chromeWindow.document.documentElement.getBoundingClientRect();
}
