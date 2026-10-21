/**
 * Tabs with the WAI-ARIA tabs pattern.
 *
 * Markup contract:
 *   <div data-tabs>
 *     <div role="tablist" class="tabs__list">
 *       <button class="tabs__tab" role="tab" aria-controls="panel-id" aria-selected="true">…
 *     </div>
 *     <div class="tabs__panel" id="panel-id" role="tabpanel">…
 *   </div>
 */
(function () {
  'use strict';

  function initTabs(root) {
    if (root.dataset.tabsReady === 'true') {
      return;
    }

    var tabs = Array.prototype.slice.call(root.querySelectorAll('.tabs__tab'));
    if (tabs.length === 0) {
      return;
    }

    root.dataset.tabsReady = 'true';

    function select(target) {
      tabs.forEach(function (tab) {
        var selected = tab === target;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;

        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !selected;
        }
      });
    }

    tabs.forEach(function (tab, position) {
      tab.addEventListener('click', function () {
        select(tab);
      });

      tab.addEventListener('keydown', function (event) {
        var target = null;

        if (event.key === 'ArrowRight') {
          target = tabs[(position + 1) % tabs.length];
        } else if (event.key === 'ArrowLeft') {
          target = tabs[(position - 1 + tabs.length) % tabs.length];
        } else if (event.key === 'Home') {
          target = tabs[0];
        } else if (event.key === 'End') {
          target = tabs[tabs.length - 1];
        }

        if (target) {
          event.preventDefault();
          target.focus();
          select(target);
        }
      });
    });

    select(root.querySelector('.tabs__tab[aria-selected="true"]') || tabs[0]);
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-tabs]').forEach(initTabs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll(document);
    });
  } else {
    initAll(document);
  }
})();
