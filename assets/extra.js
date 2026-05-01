(function () {
  var style = document.createElement('style');
  document.head.appendChild(style);

  function run() {
    var list = document.querySelector('.md-tabs__list');
    if (!list) return;

    // Clone the list off-screen at unconstrained width to measure its natural size
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
      // Viewport fits all tabs: show tabs, hide sidebar and hamburger
      '@media screen and (min-width:' + w + 'px){',
        '.md-tabs{display:block!important}',
        '.md-sidebar--primary{display:none!important}',
        'label.md-header__button[for="__drawer"]{display:none!important}',
      '}',
      // Too narrow to fit: hide tabs, restore hamburger and sidebar drawer
      '@media screen and (max-width:' + (w - 1) + 'px){',
        '.md-tabs{display:none!important}',
        '.md-sidebar--primary{display:block!important}',
        'label.md-header__button[for="__drawer"]{display:flex!important}',
      '}'
    ].join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  // Re-run after fonts load for accurate text measurement
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run);
  }
})();
