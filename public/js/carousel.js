/**
 * Accessible carousel/slider.
 *
 * Markup contract:
 *   <div class="carousel" data-carousel data-autoplay="6000">
 *     <div class="carousel__viewport">
 *       <div class="carousel__track">       <- .carousel__slide children
 *     </div>
 *     <div class="carousel__controls">
 *       <ul class="carousel__dots" data-carousel-dots></ul>
 *       <button data-carousel-prev>…</button>
 *       <button data-carousel-next>…</button>
 *     </div>
 *   </div>
 *
 * Slides can ship in HTML (hero) or be rendered from JSON (testimonials);
 * the module initialises whatever exists now and after every collection render.
 * Autoplay pauses on hover, focus, hidden tabs, and prefers-reduced-motion.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initCarousel(root) {
    if (root.dataset.carouselReady === 'true') {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel__slide'));
    if (slides.length === 0) {
      return;
    }

    root.dataset.carouselReady = 'true';

    var dotsHost = root.querySelector('[data-carousel-dots]');
    var prevButton = root.querySelector('[data-carousel-prev]');
    var nextButton = root.querySelector('[data-carousel-next]');
    var index = 0;
    var dots = [];
    var timer = null;
    var delay = parseInt(root.dataset.autoplay, 10);

    slides.forEach(function (slide, position) {
      if (slide.classList.contains('is-active')) {
        index = position;
      }
    });

    if (dotsHost) {
      dotsHost.replaceChildren();
      slides.forEach(function (slide, position) {
        var item = document.createElement('li');
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel__dot';
        dot.setAttribute('aria-label', 'Go to slide ' + (position + 1) + ' of ' + slides.length);
        dot.addEventListener('click', function () {
          go(position);
          restart();
        });
        item.append(dot);
        dotsHost.append(item);
        dots.push(dot);
      });
    }

    function go(next) {
      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, position) {
        var active = position === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach(function (dot, position) {
        dot.setAttribute('aria-current', position === index ? 'true' : 'false');
      });
    }

    function stop() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function play() {
      stop();
      if (!delay || reduceMotion.matches || document.hidden) {
        return;
      }
      timer = window.setInterval(function () {
        go(index + 1);
      }, delay);
    }

    function restart() {
      play();
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        go(index - 1);
        restart();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        go(index + 1);
        restart();
      });
    }

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(index - 1);
        restart();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(index + 1);
        restart();
      }
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) {
        play();
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        play();
      }
    });

    if (typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', restart);
    }

    go(index);
    play();
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-carousel]').forEach(initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll(document);
    });
  } else {
    initAll(document);
  }

  document.addEventListener('collection:rendered', function (event) {
    var root = event.detail.host.closest('[data-carousel]');
    if (root) {
      initCarousel(root);
    }
  });
})();
