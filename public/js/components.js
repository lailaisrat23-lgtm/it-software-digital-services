/**
 * Shared HTML fragment loader + primary navigation behaviour.
 *
 * Contract (documented in README.md):
 *   <div data-component="header"></div>   -> resources/views/components/header.html
 *   <div data-component="footer"></div>   -> resources/views/components/footer.html
 *
 * Fragments are fetched relative to the page, so pages must live together in one
 * folder and the site must be served over HTTP (file:// blocks fetch()).
 * Pages live in resources/views/frontend/, one level below the components folder.
 * Failures never remove the user's ability to navigate: each failed host
 * renders a plain link fallback.
 */
(function () {
  'use strict';

  var COMPONENT_PATH = '../components/';
  var MOBILE_BREAKPOINT = 999;

  var FALLBACK_LINKS = [
    { href: 'index.html', label: 'Home' },
    { href: 'services.html', label: 'Services' },
    { href: 'portfolio.html', label: 'Portfolio' },
    { href: 'about.html', label: 'About' },
    { href: 'faq.html', label: 'FAQ' },
    { href: 'contact.html', label: 'Contact' }
  ];

  function loadFragment(name) {
    return fetch(COMPONENT_PATH + name + '.html', {
      headers: { Accept: 'text/html' },
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return response.text();
    });
  }

  function renderFallback(host, name) {
    var message = document.createElement('p');
    message.className = 'component-error';

    if (name === 'footer') {
      message.append('The footer could not be loaded. Email ');
      var mail = document.createElement('a');
      mail.href = 'mailto:hello@techspire.dev';
      mail.textContent = 'hello@techspire.dev';
      message.append(mail, ' or use the ');

      var contact = document.createElement('a');
      contact.href = 'contact.html';
      contact.textContent = 'contact page';
      message.append(contact, '.');
      host.replaceChildren(message);
      return;
    }

    message.append('Navigation could not be loaded. ');

    FALLBACK_LINKS.forEach(function (link, index) {
      if (index > 0) {
        message.append(' \u00b7 ');
      }
      var anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.label;
      message.append(anchor);
    });

    host.replaceChildren(message);
  }

  function markActiveLink() {
    var page = document.body.getAttribute('data-page');
    if (!page) {
      return;
    }
    var link = document.querySelector('[data-nav-item="' + page + '"]');
    if (link) {
      link.setAttribute('aria-current', 'page');
    }
  }

  function initNavToggle() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) {
      return;
    }

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) {
        return;
      }
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > MOBILE_BREAKPOINT && nav.classList.contains('is-open')) {
        setOpen(false);
      }
    });
  }

  function setCopyrightYear() {
    var year = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (node) {
      node.textContent = String(year);
    });
  }

  function loadAll() {
    var hosts = Array.prototype.slice.call(document.querySelectorAll('[data-component]'));
    if (hosts.length === 0) {
      return Promise.resolve();
    }

    var tasks = hosts.map(function (host) {
      var name = host.getAttribute('data-component');
      host.classList.add('is-loading');

      return loadFragment(name)
        .then(function (html) {
          host.classList.remove('is-loading');
          host.innerHTML = html;
          if (name === 'header') {
            markActiveLink();
            initNavToggle();
          }
          if (name === 'footer') {
            setCopyrightYear();
          }
        })
        .catch(function (error) {
          host.classList.remove('is-loading');
          renderFallback(host, name);
          console.error('[components] Could not load "' + name + '" fragment:', error);
        });
    });

    return Promise.all(tasks).then(function () {
      document.dispatchEvent(new CustomEvent('components:loaded'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
