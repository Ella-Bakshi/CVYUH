/* Progressive enhancement: the static page and original image links work without JS. */
(() => {
  'use strict';
  const tablist = document.querySelector('.view-tabs');
  const tabs = Array.from(tablist.querySelectorAll('.view-tab'));
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
  tablist.setAttribute('role', 'tablist');
  function activate(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', event => { event.preventDefault(); activate(index); });
    tab.addEventListener('keydown', event => {
      const offsets = { ArrowRight: 1, ArrowLeft: -1 };
      if (event.key in offsets) {
        event.preventDefault();
        activate((index + offsets[event.key] + tabs.length) % tabs.length, true);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        activate(event.key === 'Home' ? 0 : tabs.length - 1, true);
      }
    });
  });
  const initialIndex = panels.findIndex(panel => '#' + panel.id === location.hash);
  activate(initialIndex < 0 ? 0 : initialIndex);

  const dialog = document.querySelector('.image-dialog');
  if (typeof dialog.showModal !== 'function') return;
  const expanded = dialog.querySelector('img');
  let returnFocus;
  document.querySelectorAll('.preview-image-link, .expand-link').forEach(link => {
    link.addEventListener('click', event => {
      // Preserve modified-click and normal link fallback semantics.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const original = link.closest('.preview-panel').querySelector('img');
      event.preventDefault();
      returnFocus = link;
      expanded.src = original.src;
      expanded.alt = original.alt;
      expanded.width = original.width;
      expanded.height = original.height;
      dialog.querySelector('h2').textContent = link.closest('.preview-panel').querySelector('h3').textContent;
      dialog.showModal();
      document.documentElement.classList.add('dialog-open');
      dialog.querySelector('button').focus();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      // Close is the only interactive control in this image-only dialog.
      event.preventDefault();
      dialog.querySelector('.dialog-close').focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('dialog-open');
    if (returnFocus) returnFocus.focus({ preventScroll: true });
  });
})();
