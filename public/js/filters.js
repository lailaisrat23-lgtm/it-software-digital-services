/**
 * Portfolio search + multi-dimension filtering.
 *
 * Filters the rendered DOM, so the project dataset stays the only source of
 * truth. Cards carry data-category (discipline) and data-vertical (partner
 * type) written by data.js.
 *
 * Markup contract:
 *   <section data-filters>
 *     <input data-filter-search>
 *     <ul data-filter-group="discipline">
 *       <button data-filter-value="all" aria-pressed="true">…
 *     </ul>
 *     <ul data-filter-group="vertical"> … </ul>
 *     <p data-filter-count></p>
 *     <ul data-project-grid>…</ul>
 *     <div data-filter-empty hidden>…</div>
 *     <button data-filter-reset>…
 *   </section>
 *
 * Groups combine with AND: a card must match the active value in every group.
 */
(function () {
  'use strict';

  function initFilters(root) {
    if (root.dataset.filtersReady === 'true') {
      return;
    }

    var grid = root.querySelector('[data-project-grid]');
    if (!grid) {
      return;
    }

    root.dataset.filtersReady = 'true';

    var search = root.querySelector('[data-filter-search]');
    var groupNodes = Array.prototype.slice.call(root.querySelectorAll('[data-filter-group]'));
    var count = root.querySelector('[data-filter-count]');
    var empty = root.querySelector('[data-filter-empty]');
    var reset = root.querySelector('[data-filter-reset]');
    var debounceId = null;

    var groups = groupNodes.map(function (node) {
      return {
        key: node.getAttribute('data-filter-group'),
        chips: Array.prototype.slice.call(node.querySelectorAll('[data-filter-value]')),
        value: 'all'
      };
    });

    function matchesGroup(card, group) {
      if (group.value === 'all') {
        return true;
      }
      return card.getAttribute('data-' + group.key) === group.value;
    }

    function apply() {
      var items = Array.prototype.slice.call(grid.children);
      if (items.length === 0) {
        return;
      }

      var term = search ? search.value.trim().toLowerCase() : '';
      var visible = 0;

      items.forEach(function (item) {
        var card = item.querySelector('.project-card');
        if (!card) {
          return;
        }

        var matches = groups.every(function (group) {
          return matchesGroup(card, group);
        });

        if (matches && term !== '') {
          matches = (card.dataset.search || '').indexOf(term) !== -1;
        }

        item.hidden = !matches;
        if (matches) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent =
          'Showing ' + visible + ' of ' + items.length + (items.length === 1 ? ' project' : ' projects');
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }

      grid.hidden = visible === 0;
    }

    function setGroup(group, value) {
      group.value = value;
      group.chips.forEach(function (chip) {
        chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter-value') === value));
      });
    }

    groups.forEach(function (group) {
      group.chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          setGroup(group, chip.getAttribute('data-filter-value') || 'all');
          apply();
        });
      });
    });

    if (search) {
      search.addEventListener('input', function () {
        window.clearTimeout(debounceId);
        debounceId = window.setTimeout(apply, 120);
      });
      search.addEventListener('search', apply);
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        groups.forEach(function (group) {
          setGroup(group, 'all');
        });
        apply();
      });
    }

    document.addEventListener('collection:rendered', function (event) {
      if (event.detail.name === 'projects') {
        apply();
      }
    });
  }

  function initAll() {
    document.querySelectorAll('[data-filters]').forEach(initFilters);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
