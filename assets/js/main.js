
(function () {
  var stage = document.getElementById('stage');
  var viewport = document.getElementById('viewport');
  function fit() {
    var s = Math.min(1, document.documentElement.clientWidth / 1512);
    stage.style.transform = 'scale(' + s + ')';
    stage.style.left = Math.max(0, (document.documentElement.clientWidth - 1512 * s) / 2) + 'px';
    viewport.style.height = (2721 * s) + 'px';
  }
  fit();
  window.addEventListener('resize', fit);

  // double-click anywhere to replay the scribble animation
  document.addEventListener('dblclick', function () {
    var art = document.getElementById('art');
    var clone = art.cloneNode(true);
    art.parentNode.replaceChild(clone, art);
  });

  // ---- sketch-lens cursor ----
  // over the artwork the cursor grows into a circle; inside it, colour lifts away
  var HERO = [
    [214, 90, 950, 360],    // designer + its lotuses
    [400, 280, 1060, 480],  // creator
    [690, 470, 1310, 730],  // builder
  ];
  var tx = -500, ty = -500, tr = 0, cx = -500, cy = -500, cr = 0;
  function inHero(x, y) {
    for (var i = 0; i < HERO.length; i++) {
      var b = HERO[i];
      if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) return true;
    }
    return false;
  }
  document.addEventListener('mousemove', function (e) {
    var rect = stage.getBoundingClientRect();
    var sc = rect.width / 1512;
    tx = (e.clientX - rect.left) / sc;
    ty = (e.clientY - rect.top) / sc;
    tr = inHero(tx, ty) ? 105 : 0;
  });
  document.addEventListener('mouseleave', function () { tr = 0; tx = -500; ty = -500; });
  var lens = document.getElementById('lens');
  var ring = document.getElementById('curRingEl');
  var dot  = document.getElementById('curDotEl');
  (function tick() {
    cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cr += (tr - cr) * 0.14;
    var r = Math.max(0, cr);
    lens.style.clipPath = 'circle(' + r.toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)';
    ring.style.transform = 'translate(' + (cx - r).toFixed(1) + 'px,' + (cy - r).toFixed(1) + 'px) scale(' + (r / 105).toFixed(3) + ')';
    ring.style.opacity = Math.min(1, r / 40).toFixed(2);
    var ds = 1 - (r / 105) * 0.5;
    dot.style.transform = 'translate(' + (cx - 5 * ds).toFixed(1) + 'px,' + (cy - 5 * ds).toFixed(1) + 'px) scale(' + ds.toFixed(3) + ')';
    dot.style.opacity = tx > -400 ? 0.7 : 0;
    requestAnimationFrame(tick);
  })();
})();
