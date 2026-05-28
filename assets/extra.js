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
  // Counts computed by countHeadings(); consumed by applyToc().
  var tocQueue = [];
  var tocWatcher = null;

  function applyToc() {
    if (!tocQueue.length) return;
    var sidebar = document.querySelector('aside.md-sidebar--secondary');
    if (!sidebar) return;
    tocQueue.forEach(function (item) {
      var link = sidebar.querySelector('a[href$="#' + item.id + '"]');
      if (!link) return;
      var el = link.querySelector('.md-ellipsis') || link;
      el.textContent = el.textContent.replace(/\s*\(\d+\)\s*$/, '').trim() + ' (' + item.count + ')';
    });
  }

  function countHeadings() {
    if (!document.querySelector('.pub-list')) return;
    tocQueue = [];

    document.querySelectorAll('h2, h3').forEach(function (heading) {
      // Walk siblings until a heading of equal/higher level — sums all pub-lists
      // in scope so that "Conference Abstracts" gets the combined ISMRM + Other count.
      var level = parseInt(heading.tagName[1], 10);
      var count = 0;
      var node = heading.nextSibling;
      while (node) {
        if (node.nodeType === 1) {
          var tag = node.tagName;
          if (/^H[1-6]$/.test(tag) && parseInt(tag[1], 10) <= level) break;
          if (node.classList.contains('pub-list')) count += node.querySelectorAll('.pub-card').length;
        }
        node = node.nextSibling;
      }
      if (!count) return;

      // Update only the first non-empty text node — leaves the ¶ anchor intact.
      var textNode = null;
      heading.childNodes.forEach(function (n) {
        if (!textNode && n.nodeType === 3 && n.textContent.trim()) textNode = n;
      });
      if (!textNode) return;
      textNode.textContent = textNode.textContent.replace(/\s*\(\d+\)\s*$/, '').trimEnd() + ' (' + count + ') ';

      if (heading.id) tocQueue.push({ id: heading.id, count: count });
    });

    applyToc();
  }

  // Watch the TOC sidebar for DOM additions — Material populates it
  // asynchronously, so we apply counts the moment links appear.
  function watchToc() {
    if (tocWatcher) { tocWatcher.disconnect(); tocWatcher = null; }
    var sidebar = document.querySelector('aside.md-sidebar--secondary');
    if (!sidebar) return;
    tocWatcher = new MutationObserver(function (mutations) {
      var hasNewNodes = mutations.some(function (m) { return m.addedNodes.length > 0; });
      if (hasNewNodes) applyToc();
    });
    tocWatcher.observe(sidebar, { childList: true, subtree: true });
    // Disconnect once TOC is stable (3 s is more than enough).
    setTimeout(function () { if (tocWatcher) { tocWatcher.disconnect(); tocWatcher = null; } }, 3000);
  }

  function setup() {
    countHeadings();
    watchToc();
    // Check document$ inside setup() — Material defines it during page load,
    // not at script-parse time.
    if (typeof document$ !== 'undefined') {
      document$.subscribe(function () {
        setTimeout(function () { countHeadings(); watchToc(); }, 50);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
