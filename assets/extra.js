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
      // Walk all siblings until hitting a heading of equal or higher level,
      // collecting every .pub-list found. This lets an h2 with only h3+pub-list
      // children (e.g. "Conference Abstracts") accumulate a combined total.
      var level = parseInt(heading.tagName[1], 10);
      var count = 0;
      var node = heading.nextSibling;
      while (node) {
        if (node.nodeType === 1) {
          var tag = node.tagName;
          if (/^H[1-6]$/.test(tag) && parseInt(tag[1], 10) <= level) break;
          if (node.classList.contains('pub-list')) {
            count += node.querySelectorAll('.pub-card').length;
          }
        }
        node = node.nextSibling;
      }
      if (!count) return;

      // Update only the first non-empty text node — leaves the ¶ anchor intact
      var textNode = null;
      heading.childNodes.forEach(function (n) {
        if (!textNode && n.nodeType === 3 && n.textContent.trim()) textNode = n;
      });
      if (!textNode) return;
      textNode.textContent = textNode.textContent.replace(/\s*\(\d+\)\s*$/, '').trimEnd() + ' (' + count + ') ';

      // Mirror the count in the matching TOC entry.
      // Use href$= (ends-with) to match both '#id' and '/page/#id' href formats.
      // Scope to aside.md-sidebar--secondary to avoid hitting left-nav links.
      // Material wraps the visible text in <span class="md-ellipsis">.
      var id = heading.id;
      if (id) {
        var tocLink = document.querySelector('aside.md-sidebar--secondary a[href$="#' + id + '"]');
        if (tocLink) {
          var tocTarget = tocLink.querySelector('.md-ellipsis') || tocLink;
          tocTarget.textContent = tocTarget.textContent.replace(/\s*\(\d+\)\s*$/, '').trim() + ' (' + count + ')';
        }
      }
    });
  }

  function setup() {
    countPubs(); // immediate pass — updates headings
    // Second pass after a short delay so Material has time to populate the TOC
    // sidebar (it does so asynchronously after DOMContentLoaded).
    setTimeout(countPubs, 150);
    // Check document$ inside setup() — Material initialises it during page load
    // so it is not yet defined at script-parse time.
    if (typeof document$ !== 'undefined') {
      document$.subscribe(function () { setTimeout(countPubs, 150); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
