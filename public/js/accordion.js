/**
 * FAQ accordion.
 *
 * Markup contract: a container with [data-accordion] holding buttons of class
 * .accordion__trigger (aria-expanded + aria-controls) and the panels they own.
 * Panels are toggled with the `hidden` attribute, so state is exposed to AT.
 */
(function () {
  'use strict';

  function initAccordion(root) {
    if (root.dataset.accordionReady === 'true') {
      return;
    }
    root.dataset.accordionReady = 'true';

    root.addEventListener('click', function (event) {
      var trigger = event.target.closest('.accordion__trigger');
      if (!trigger || !root.contains(trigger)) {
        return;
      }

      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      var panelId = trigger.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;

      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (panel) {
        panel.hidden = isOpen;
      }
    });
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-accordion]').forEach(initAccordion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll(document);
    });
  } else {
    initAll(document);
  }

  document.addEventListener('collection:rendered', function (event) {
    initAll(event.detail.host);
  });
})();
