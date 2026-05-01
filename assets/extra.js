(function () {
  var style = document.createElement('style');
  style.id = '__nav_bp';

  function run() {
    // Re-insert style if Material's instant navigation removed it from <head>
    if (!style.parentNode) {
      document.head.appendChild(style);
    }

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
      '}',
      '@media screen and (max-width:' + (w - 1) + 'px){',
        '.md-tabs{display:none!important}',
        '.md-sidebar--primary{display:block!important}',
        'label.md-header__button[for="__drawer"]{display:flex!important}',
      '}'
    ].join('');
  }

  function init() {
    run();
    // Re-run on every instant navigation: Material updates <title> each time
    var title = document.querySelector('title');
    if (title) new MutationObserver(run).observe(title, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Re-run after fonts load for more accurate text measurement
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run);
  }
})();
