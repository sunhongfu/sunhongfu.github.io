(function () {
  var style = document.createElement('style');
  style.id = '__nav_bp';

  function run() {
    // Re-insert style if Material's instant navigation removed it from <head>
    if (!style.parentNode) document.head.appendChild(style);

    var list = document.querySelector('.md-tabs__list');
    if (!list) return;

    // Clone off-screen at unconstrained width to measure natural size
    var ghost = list.cloneNode(true);
    Object.assign(ghost.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      visibility: 'hidden',
      width: 'max-content',
      pointerEvents: 'none'
    });
    document.body.appendChild(ghost);
    var w = ghost.offsetWidth + 48; // 48px buffer for container padding
    document.body.removeChild(ghost);

    style.textContent = [
      '@media screen and (min-width:' + w + 'px){',
        '.md-tabs{display:block!important}',
        '.md-sidebar--primary{display:none!important}',
        'label.md-header__button[for="__drawer"]{display:none!important}',
        '.md-header__button.md-logo{display:flex!important}',
      '}',
      '@media screen and (max-width:' + (w - 1) + 'px){',
        '.md-tabs{display:none!important}',
        '.md-sidebar--primary{display:block!important}',
        'label.md-header__button[for="__drawer"]{display:flex!important}',
        '.md-header__button.md-logo{display:none!important}',
      '}'
    ].join('');
  }

  function init() {
    run();

    // Watch <head> for child changes: when Material instant navigation removes
    // our style element, re-inject it immediately.
    new MutationObserver(function () {
      if (!document.getElementById('__nav_bp')) run();
    }).observe(document.head, { childList: true });

    // Re-measure after fonts load for accurate text width
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Dynamically count and display publication totals next to section headings
(function () {
  function countPubs() {
    if (!document.querySelector('.pub-list')) return;

    document.querySelectorAll('h2, h3').forEach(function (heading) {
      // Sum all pub-lists in scope (until next same/higher-level heading).
      var level = parseInt(heading.tagName[1], 10), count = 0, node = heading.nextSibling;
      while (node) {
        if (node.nodeType === 1) {
          if (/^H[1-6]$/.test(node.tagName) && parseInt(node.tagName[1], 10) <= level) break;
          if (node.classList.contains('pub-list')) count += node.querySelectorAll('.pub-card').length;
        }
        node = node.nextSibling;
      }
      if (!count) return;

      // Update the heading's first text node (leaves the ¶ anchor intact).
      var textNode = null;
      heading.childNodes.forEach(function (n) {
        if (!textNode && n.nodeType === 3 && n.textContent.trim()) textNode = n;
      });
      if (!textNode) return;
      var base = textNode.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();
      textNode.textContent = base + ' (' + count + ') ';

      // Update the matching TOC link by text content — avoids any href-format
      // or element-type assumptions about Material's sidebar markup.
      document.querySelectorAll('.md-nav--secondary .md-nav__link').forEach(function (link) {
        var el = link.querySelector('.md-ellipsis') || link;
        if (el.textContent.replace(/\s*\(\d+\)\s*$/, '').trim() === base) {
          el.textContent = base + ' (' + count + ')';
        }
      });
    });
  }

  function setup() {
    countPubs();
    // Second pass after a short delay: Material may finish populating the TOC
    // after DOMContentLoaded, so run again once it is settled.
    setTimeout(countPubs, 300);
    if (typeof document$ !== 'undefined') {
      document$.subscribe(function () { setTimeout(countPubs, 300); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
