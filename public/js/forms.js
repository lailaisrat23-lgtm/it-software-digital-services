/**
 * Client-side form validation for the enquiry form.
 *
 * Markup contract (see contact.html):
 *   <form data-validate novalidate>
 *     <div class="field"> …control + .field__error… </div>
 *     <div class="form__status" data-form-status role="status"></div>
 *     <div class="form-success" data-form-success hidden tabindex="-1">…</div>
 *
 * The site has no backend, so a valid submission reveals a confirmation panel
 * that points the visitor to email instead of pretending data was sent.
 */
(function () {
  'use strict';

  var EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  var PHONE = /^[+()\d\s-]{7,20}$/;

  var RULES = {
    name: function (value) {
      return value.trim().length >= 2 ? '' : 'Please tell us your name (at least 2 characters).';
    },
    email: function (value) {
      return EMAIL.test(value.trim()) ? '' : 'Enter a valid email address, e.g. name@company.com.';
    },
    phone: function (value) {
      if (value.trim() === '') {
        return '';
      }
      return PHONE.test(value.trim()) ? '' : 'Use digits, spaces, +, - or brackets only.';
    },
    message: function (value) {
      return value.trim().length >= 20
        ? ''
        : 'Please add a little more detail — at least 20 characters.';
    },
    consent: function (value, control) {
      return control.checked ? '' : 'Please confirm that we may reply to your enquiry.';
    }
  };

  function getControls(form) {
    return Array.prototype.slice
      .call(form.elements)
      .filter(function (control) {
        if (!control.name || control.disabled) {
          return false;
        }
        return ['INPUT', 'SELECT', 'TEXTAREA'].indexOf(control.tagName) !== -1 &&
          ['submit', 'button', 'reset', 'hidden'].indexOf(control.type) === -1;
      });
  }

  function errorNode(control) {
    return control.closest('.field') ? control.closest('.field').querySelector('.field__error') : null;
  }

  function messageFor(control) {
    var value = control.type === 'checkbox' ? String(control.checked) : control.value;

    if (control.hasAttribute('required') && control.type !== 'checkbox' && value.trim() === '') {
      return 'This field is required.';
    }

    var rule = RULES[control.name];
    return rule ? rule(value, control) : '';
  }

  function paint(control, message) {
    var node = errorNode(control);
    var invalid = message !== '';

    control.setAttribute('aria-invalid', String(invalid));

    if (node) {
      node.textContent = message;
      node.classList.toggle('is-visible', invalid);
    }
  }

  function initForm(form) {
    if (form.dataset.validateReady === 'true') {
      return;
    }
    form.dataset.validateReady = 'true';

    var controls = getControls(form);
    var wrapper = form.parentElement || form;
    var status = form.querySelector('[data-form-status]');
    var success = wrapper.querySelector('[data-form-success]');
    var greeting = wrapper.querySelector('[data-success-name]');
    var submitted = false;

    function validateAll() {
      var firstInvalid = null;

      controls.forEach(function (control) {
        var message = messageFor(control);
        paint(control, message);
        if (message && !firstInvalid) {
          firstInvalid = control;
        }
      });

      return firstInvalid;
    }

    controls.forEach(function (control) {
      control.addEventListener('blur', function () {
        if (submitted || control.getAttribute('aria-invalid') === 'true') {
          paint(control, messageFor(control));
        }
      });

      control.addEventListener(control.type === 'checkbox' || control.tagName === 'SELECT' ? 'change' : 'input', function () {
        if (control.getAttribute('aria-invalid') === 'true') {
          paint(control, messageFor(control));
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submitted = true;

      var firstInvalid = validateAll();

      if (firstInvalid) {
        if (status) {
          status.textContent = 'Please fix the highlighted fields and try again.';
          status.classList.remove('form__status--success');
        }
        firstInvalid.focus();
        return;
      }

      if (status) {
        status.textContent = '';
      }

      if (greeting) {
        var nameControl = form.querySelector('[name="name"]');
        var firstName = nameControl ? nameControl.value.trim().split(/\s+/)[0] : '';
        greeting.textContent = firstName;
      }

      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
    });

    var restart = wrapper.querySelector('[data-form-restart]');
    if (restart && success) {
      restart.addEventListener('click', function () {
        form.reset();
        submitted = false;
        controls.forEach(function (control) {
          paint(control, '');
        });
        success.hidden = true;
        form.hidden = false;
        var first = controls[0];
        if (first) {
          first.focus();
        }
      });
    }
  }

  function initAll() {
    document.querySelectorAll('[data-validate]').forEach(initForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
