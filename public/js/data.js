/**
 * Repeated-collection renderers.
 *
 * Every host declares which dataset it needs:
 *   data-collection="services|verticals|projects|testimonials|faqs"
 * Optional attributes:
 *   data-limit="3"              render the first N items
 *   data-filter="featured"      render only items flagged featured
 *   data-variant="…"            alternate output for the same dataset:
 *                                 services     -> card (default) | detail | links | options
 *                                 verticals    -> card (default) | detail
 *                                 testimonials -> carousel slides (default) | grid
 *
 * Content lives once in JSON; markup details (icons, initials, class names)
 * are generated here. Nothing is written as inline style.
 */
(function () {
  'use strict';

  // Pages live in resources/views/frontend/, three levels below the project root.
  var DATA_PATH = '../../../jsonData/';
  var IMAGE_PATH = '../../../public/img/projects/';
  var cache = {};

  var ICONS = {
    code: 'M8 6l-5 6 5 6M16 6l5 6-5 6',
    layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
    device: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM10 19h4',
    cloud: 'M17 18a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9.5 3.5 3.5 0 0 0 7 18h10z',
    spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
    pen: 'M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 6.5l3 3'
  };

  var CATEGORY_LABELS = {
    web: 'Web platform',
    mobile: 'Mobile app',
    cloud: 'Cloud & DevOps',
    data: 'Data & AI',
    design: 'Product design'
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function icon(key) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ICONS[key] || ICONS.code);
    svg.append(path);
    return svg;
  }

  function initials(text) {
    return text
      .split(/\s+/)
      .slice(0, 2)
      .map(function (word) {
        return word.charAt(0).toUpperCase();
      })
      .join('');
  }

  function loadDataset(name) {
    if (!cache[name]) {
      cache[name] = fetch(DATA_PATH + name + '.json', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin'
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      });
    }
    return cache[name];
  }

  function selectItems(items, host) {
    var filtered = items;

    if (host.dataset.filter === 'featured') {
      filtered = filtered.filter(function (item) {
        return item.featured === true;
      });
    }

    var limit = parseInt(host.dataset.limit, 10);
    if (!Number.isNaN(limit) && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  /* ---------------------------------------------------------------- services */

  function deliverableChips(features) {
    var list = el('ul', 'deliverables');
    features.forEach(function (feature) {
      list.append(el('li', null, feature));
    });
    return list;
  }

  function renderServiceCard(service) {
    var card = el('article', 'card');
    card.id = 'service-' + service.id;

    var badge = el('p', 'card__icon');
    badge.append(icon(service.icon));

    var title = el('h3', 'card__title', service.title);
    var summary = el('p', 'card__text', service.summary);

    var features = el('ul', 'card__list');
    service.features.forEach(function (feature) {
      features.append(el('li', null, feature));
    });

    var footer = el('div', 'card__footer');
    var link = el('a', 'card__link', 'Explore this service');
    link.href = 'services.html#' + service.id;
    footer.append(link);

    card.append(badge, title, summary, features, footer);
    return card;
  }

  function renderServiceDetail(service, index) {
    var article = el('article', 'service-card');
    article.id = service.id;

    var head = el('div', 'service-card__head');
    var badge = el('span', 'service-card__icon');
    badge.append(icon(service.icon));
    head.append(badge);
    head.append(el('span', 'service-card__index', '0' + (index + 1)));

    var body = el('div', 'service-card__body');
    body.append(el('h2', 'service-card__title', service.title));

    (service.details || [service.summary]).forEach(function (paragraph) {
      body.append(el('p', 'service-card__text', paragraph));
    });

    body.append(deliverableChips(service.features));

    var link = el('a', 'card__link service-card__link', 'Talk about this service');
    link.href = 'contact.html';
    body.append(link);

    article.append(head, body);
    return article;
  }

  function renderServices(items, host) {
    var selected = selectItems(items, host);
    var variant = host.dataset.variant;

    if (variant === 'links') {
      var list = el('ul', 'footer__links');
      selected.forEach(function (service) {
        var item = el('li');
        var anchor = el('a', null, service.title);
        anchor.href = 'services.html#' + service.id;
        item.append(anchor);
        list.append(item);
      });
      host.append(list);
      return;
    }

    if (variant === 'options') {
      selected.forEach(function (service) {
        var option = el('option', null, service.title);
        option.value = service.title;
        host.append(option);
      });
      return;
    }

    if (variant === 'detail') {
      selected.forEach(function (service, index) {
        host.append(renderServiceDetail(service, index));
      });
      return;
    }

    selected.forEach(function (service) {
      host.append(renderServiceCard(service));
    });
  }

  /* --------------------------------------------------------------- verticals */

  function renderVerticalCard(vertical) {
    var card = el('article', 'vertical-card');

    var badge = el('span', 'vertical-card__icon');
    badge.append(icon(vertical.icon));
    card.append(badge);

    card.append(el('h3', 'vertical-card__title', vertical.title));
    card.append(el('p', 'vertical-card__tagline', vertical.tagline));

    var list = el('ul', 'vertical-card__offers');
    vertical.offers.forEach(function (offer) {
      list.append(el('li', null, offer));
    });
    card.append(list);

    var link = el('a', 'card__link', 'See how we fit');
    link.href = 'industries.html#for-' + vertical.id;
    card.append(link);

    return card;
  }

  function renderVerticalDetail(vertical) {
    var article = el('article', 'vertical-block');
    article.id = 'for-' + vertical.id;

    var head = el('div', 'vertical-block__head');
    var badge = el('span', 'vertical-block__icon');
    badge.append(icon(vertical.icon));
    head.append(badge);
    head.append(el('h2', 'vertical-block__title', vertical.title));
    head.append(el('p', 'vertical-block__tagline', vertical.tagline));

    var metric = el('p', 'vertical-block__metric');
    metric.append(el('strong', null, vertical.metric.value));
    metric.append(el('span', null, vertical.metric.label));
    head.append(metric);

    var body = el('div', 'vertical-block__body');
    body.append(el('p', 'vertical-block__summary', vertical.summary));

    var lists = el('div', 'vertical-lists');

    var painWrap = el('div', 'vertical-list');
    painWrap.append(el('h3', null, 'What usually hurts'));
    var pains = el('ul', 'pain-list');
    vertical.pains.forEach(function (pain) {
      pains.append(el('li', null, pain));
    });
    painWrap.append(pains);

    var offerWrap = el('div', 'vertical-list');
    offerWrap.append(el('h3', null, 'What we take off your plate'));
    var offers = el('ul', 'check-list');
    vertical.offers.forEach(function (offer) {
      offers.append(el('li', null, offer));
    });
    offerWrap.append(offers);

    lists.append(painWrap, offerWrap);
    body.append(lists);

    var footer = el('div', 'vertical-block__footer');
    var link = el('a', 'card__link', 'Discuss a partnership');
    link.href = 'contact.html';
    footer.append(link);
    body.append(footer);

    article.append(head, body);
    return article;
  }

  function renderVerticals(items, host) {
    var selected = selectItems(items, host);

    if (host.dataset.variant === 'detail') {
      selected.forEach(function (vertical) {
        host.append(renderVerticalDetail(vertical));
      });
      return;
    }

    selected.forEach(function (vertical) {
      host.append(renderVerticalCard(vertical));
    });
  }

  /* ---------------------------------------------------------------- projects */

  function renderProjectBrief(project) {
    var details = el('details', 'project-card__details');
    details.append(el('summary', 'project-card__summary', 'Read the brief'));

    var list = el('dl', 'project-card__brief');
    [
      ['Challenge', project.challenge],
      ['Approach', project.approach],
      ['Result', project.result]
    ].forEach(function (pair) {
      if (!pair[1]) {
        return;
      }
      var row = el('div', 'project-card__brief-row');
      row.append(el('dt', null, pair[0]));
      row.append(el('dd', null, pair[1]));
      list.append(row);
    });

    details.append(list);
    return details;
  }

  function renderProjectCard(project, index) {
    var item = el('li');
    var card = el('article', 'project-card');
    card.dataset.category = project.category;
    card.dataset.vertical = project.vertical || '';
    card.dataset.search = [
      project.title,
      project.summary,
      project.challenge,
      project.approach,
      project.result,
      project.partnerType,
      project.category,
      CATEGORY_LABELS[project.category] || '',
      project.vertical,
      (project.tags || []).join(' ')
    ]
      .join(' ')
      .toLowerCase();

    var media = el('div', 'project-card__media project-card__media--' + ((index % 5) + 1));
    var monogram = el('span', 'project-card__monogram', initials(project.title));
    monogram.setAttribute('aria-hidden', 'true');
    media.append(monogram);
    media.append(el('span', 'project-card__year', String(project.year)));

    if (project.cover) {
      var cover = document.createElement('img');
      cover.className = 'project-card__img';
      cover.alt = project.coverAlt || project.title;
      cover.width = 1200;
      cover.height = 760;
      cover.loading = 'lazy';
      cover.decoding = 'async';

      // If the artwork is missing, fall back to the gradient tile + monogram.
      // The listener is bound before src so a fast 404 cannot beat it.
      cover.addEventListener('error', function () {
        cover.remove();
        media.classList.remove('project-card__media--image');
      });

      media.classList.add('project-card__media--image');
      media.append(cover);
      cover.src = IMAGE_PATH + project.cover;
    }

    var body = el('div', 'project-card__body');
    body.append(el('p', 'project-card__category', CATEGORY_LABELS[project.category] || project.category));
    body.append(el('h3', 'project-card__title', project.title));
    body.append(el('p', 'project-card__text', project.summary));
    body.append(el('p', 'project-card__outcome', project.outcome));

    if (project.partnerType) {
      body.append(el('p', 'project-card__partner', project.partnerType));
    }

    if (project.challenge || project.approach || project.result) {
      body.append(renderProjectBrief(project));
    }

    var tags = el('ul', 'project-card__tags');
    (project.tags || []).forEach(function (tag) {
      tags.append(el('li', null, tag));
    });
    body.append(tags);

    card.append(media, body);
    item.append(card);
    return item;
  }

  function renderProjects(items, host) {
    selectItems(items, host).forEach(function (project, index) {
      host.append(renderProjectCard(project, index));
    });
  }

  /* ------------------------------------------------------------ testimonials */

  function renderQuoteCard(testimonial) {
    var card = el('article', 'quote-card');
    card.append(el('p', 'quote-card__mark', '\u201c'));
    card.append(el('blockquote', 'quote-card__text', testimonial.quote));

    var rating = el('p', 'quote-card__rating');
    rating.append(el('span', null, '\u2605'.repeat(testimonial.rating || 5)));
    rating.setAttribute('aria-label', (testimonial.rating || 5) + ' out of 5');
    card.append(rating);

    var person = el('div', 'quote-card__person');
    person.append(el('span', 'avatar', initials(testimonial.name)));

    var identity = el('div');
    identity.append(el('span', 'quote-card__name', testimonial.name));
    identity.append(el('span', 'quote-card__role', testimonial.role + ', ' + testimonial.company));
    person.append(identity);

    card.append(person);
    return card;
  }

  function renderTestimonials(items, host) {
    var selected = selectItems(items, host);
    var asGrid = host.dataset.variant === 'grid';

    selected.forEach(function (testimonial, index) {
      var card = renderQuoteCard(testimonial);
      if (asGrid) {
        host.append(card);
        return;
      }

      var slide = el('div', 'carousel__slide' + (index === 0 ? ' is-active' : ''));
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', index + 1 + ' of ' + selected.length);
      slide.append(card);
      host.append(slide);
    });
  }

  /* -------------------------------------------------------------------- faqs */

  function renderFaqs(items, host) {
    var groups = [];
    var byCategory = {};

    items.forEach(function (faq) {
      if (!byCategory[faq.category]) {
        byCategory[faq.category] = [];
        groups.push(faq.category);
      }
      byCategory[faq.category].push(faq);
    });

    groups.forEach(function (category) {
      var section = el('section', 'faq-group');
      section.id = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      section.append(el('h2', 'faq-group__title', category));

      var list = el('ul', 'accordion');
      list.setAttribute('data-accordion', '');

      byCategory[category].forEach(function (faq) {
        var item = el('li', 'accordion__item');
        var heading = el('h3');
        var trigger = el('button', 'accordion__trigger');
        trigger.type = 'button';
        trigger.id = faq.id + '-trigger';
        trigger.setAttribute('aria-controls', faq.id + '-panel');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.append(el('span', null, faq.question));
        trigger.append(el('span', 'accordion__sign'));

        var panel = el('div', 'accordion__panel');
        panel.id = faq.id + '-panel';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', faq.id + '-trigger');
        panel.hidden = true;
        panel.append(el('p', null, faq.answer));

        heading.append(trigger);
        item.append(heading, panel);
        list.append(item);
      });

      section.append(list);
      host.append(section);
    });
  }

  /* ------------------------------------------------------------------ wiring */

  var RENDERERS = {
    services: renderServices,
    verticals: renderVerticals,
    projects: renderProjects,
    testimonials: renderTestimonials,
    faqs: renderFaqs
  };

  /**
   * Sections rendered from JSON do not exist when the browser handles the
   * initial fragment, so a deep link such as services.html#cloud-devops would
   * stop at the top of the page. Re-apply the fragment once markup exists.
   */
  var restoredHash = null;

  function restoreHash() {
    var hash = window.location.hash;
    if (!hash || hash === restoredHash) {
      return;
    }

    var target = document.getElementById(hash.slice(1));
    if (!target) {
      return;
    }

    restoredHash = hash;
    target.scrollIntoView({ block: 'start' });
  }

  function renderError(host, name, error) {
    var box = el('div', 'collection-error');
    box.append(
      document.createTextNode(
        'This ' + name + ' list could not be loaded. Please refresh the page, or '
      )
    );
    var link = el('a', null, 'contact us directly');
    link.href = 'contact.html';
    box.append(link, document.createTextNode('.'));
    host.replaceChildren(box);
    console.error('[data] Could not render "' + name + '":', error);
  }

  function renderCollection(host) {
    if (host.dataset.collectionReady === 'true') {
      return;
    }
    host.dataset.collectionReady = 'true';

    var name = host.dataset.collection;
    var renderer = RENDERERS[name];

    if (!renderer) {
      console.warn('[data] Unknown collection "' + name + '".');
      return;
    }

    loadDataset(name)
      .then(function (items) {
        renderer(items, host);
        document.dispatchEvent(
          new CustomEvent('collection:rendered', { detail: { name: name, host: host } })
        );
        restoreHash();
      })
      .catch(function (error) {
        renderError(host, name, error);
      });
  }

  function init() {
    document.querySelectorAll('[data-collection]').forEach(renderCollection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Footer service links live inside the fetched footer fragment.
  document.addEventListener('components:loaded', init);
})();
