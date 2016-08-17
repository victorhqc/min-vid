const { getActiveView } = require('sdk/view/core');

module.exports = makePanelTransparent;

function makePanelTransparent(panel) {
  // Get the panel element in the XUL DOM and make its background
  // transparent.
  // TODO: not sure this is e10s compatible.
  const el = getActiveView(panel);
  el.style.background = 'rgba(0,0,0,0)';

  // Go up the XUL DOM till you hit the Document (nodeType 9).
  let parentNode = el;
  while (parentNode !== null && parentNode.nodeType !== 9) {
    parentNode = parentNode.parentNode;
  }

  if (!parentNode) {
    console.error('unable to find the document parent; giving up'); // eslint-disable-line no-console
    return;
  }

  // Now that we've found it, call the document a document.
  const xulDocument = parentNode;

  // Use the document pointer to access and style 'anonymous'
  // content.
  const xulContainer = xulDocument.getAnonymousElementByAttribute(el, 'class', 'panel-arrowcontent')
  xulContainer.style.background = 'rgba(0,0,0,0)';
  xulContainer.style.boxShadow = 'none';
}
