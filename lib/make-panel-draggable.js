const { getActiveView } = require('sdk/view/core');

module.exports = makePanelDraggable;

// Makes an SDK panel draggable. Pass in an SDK panel.
function makePanelDraggable(panel) {
  // Remove the panel from the XUL DOM, make some attribute changes, then
  // reattach it. Reseating in the DOM triggers updates in the XBL bindings
  // that give the panel draggability and remove some SDK styling.
  const panelEl = getActiveView(panel);
  const parentEl = panelEl.parentNode;

  parentEl.removeChild(panelEl);

  panelEl.setAttribute('noautohide', true);
  panelEl.setAttribute('backdrag', true);
  panelEl.setAttribute('style', '-moz-appearance: none; border: 0; margin: 0; background: rgba(0,0,0,0)');
  panelEl.removeAttribute('type');

  // Next, we need a XUL document to create a drag handle. There may be better
  // ways to obtain the document element, but this works:
  let doc = parentEl;
  while (doc !== null && doc.nodeType !== 9) {
    doc = doc.parentNode;
  }

  const dragHandle = doc.createElement('label');
  dragHandle.id = 'backdragspot';
  dragHandle.setAttribute('value', 'click here to drag the thing');
  dragHandle.setAttribute('style', 'background: #2b2b2b; border: 1px solid black; color: #d5d5d5; cursor: grab');
  dragHandle.setAttribute('hidden', true);
  dragHandle.onmousedown = () => { dragHandle.style.cursor = 'grabbing' }
  dragHandle.onmouseup = () => { dragHandle.style.cursor = 'grab' }
  panelEl.appendChild(dragHandle);

  // make the drag handle only visible on mouseover
  panelEl.onmouseenter = () => { dragHandle.setAttribute('hidden', false) };
  panelEl.onmouseleave = () => { dragHandle.setAttribute('hidden', true) };

  parentEl.appendChild(panelEl);
}
