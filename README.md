# Antara Paul — Portfolio

Hand-sketched hero built from the Figma design: the lettering, lotuses, and sparkles
are the original vectors, drawn on with pencil-style stroke animation, then
scribble-filled with crayon texture.

## Structure
- `index.html` — page markup + all inline SVG artwork (the artwork must stay inline:
  the draw-on animation, scribble masks, and cursor lens all target it with CSS/JS)
- `assets/css/style.css` — fonts, layout, all animation timing (delays live in inline
  `animation-delay` styles on the SVG paths)
- `assets/js/main.js` — responsive scaling, double-click replay, sketch-lens cursor
- `assets/fonts/` — Loved by the King, Cormorant Garamond, Inter (woff2)

## Run
Just open `index.html` in a browser. No build step, no dependencies.

Interactions: hover the artwork for the sketch lens; double-click to replay the animation.
