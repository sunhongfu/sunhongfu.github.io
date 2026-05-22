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
      // Find the immediately following .pub-list sibling
      var next = heading.nextSibling;
      while (next && (next.nodeType === 3 || (next.nodeType === 1 && !next.classList.contains('pub-list')))) {
        next = next.nextSibling;
      }
      if (!next || !next.classList.contains('pub-list')) return;

      var count = next.querySelectorAll('.pub-card').length;
      if (!count) return;

      // Update only the first non-empty text node — leaves the ¶ anchor intact
      var textNode = null;
      heading.childNodes.forEach(function (node) {
        if (!textNode && node.nodeType === 3 && node.textContent.trim()) textNode = node;
      });
      if (!textNode) return;
      textNode.textContent = textNode.textContent.replace(/\s*\(\d+\)\s*$/, '').trimEnd() + ' (' + count + ') ';

      // Mirror the count in the matching TOC entry
      var id = heading.id;
      if (id) {
        var tocLink = document.querySelector('.md-nav--secondary a[href="#' + id + '"]');
        if (tocLink) {
          tocLink.textContent = tocLink.textContent.replace(/\s*\(\d+\)\s*$/, '').trim() + ' (' + count + ')';
        }
      }
    });
  }

  // document$ is MkDocs Material's Observable; it fires after every page swap
  // (including instant same-page anchor navigation), making it the correct hook.
  if (typeof document$ !== 'undefined') {
    document$.subscribe(countPubs);
  } else {
    // Fallback for non-Material or deferred script load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', countPubs);
    } else {
      countPubs();
    }
  }
})();
