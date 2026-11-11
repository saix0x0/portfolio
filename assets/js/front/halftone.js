// ─────────────────────────────────────────────────────────────────────────────
//  HALFTONE: a painting printed in dots, like the rest of the page. The image
//  is sampled on a grid and each cell becomes one dot, sized by how light the
//  paint is there (or how dark, with `invert`, for dark ink on a light
//  ground). `tone` above 1 darkens the picture before it is printed; `res`
//  draws extra pixels for a canvas the camera zooms into. Sized from layout,
//  not the screen, so a scaled parent doesn't change the print. Redrawn when
//  the canvas changes size.
// ─────────────────────────────────────────────────────────────────────────────
export function halftone(canvas, img, { cell = 7, ink = '#ecebe4', invert = false, tone = 1, res = 1 } = {}) {
  const ctx = canvas.getContext('2d');
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  let w = 0;
  const draw = () => {
    const r = { width: canvas.offsetWidth, height: canvas.offsetHeight };
    if (!r.width || Math.abs(r.width - w) < 1) return;
    w = r.width;
    const dpr = Math.min(2, devicePixelRatio || 1) * res;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    const cols = Math.ceil(r.width / cell);
    const rows = Math.ceil(r.height / cell);
    probe.canvas.width = cols;
    probe.canvas.height = rows;
    // cover-fit the painting into the grid, as object-fit: cover would
    const k = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
    const dw = img.naturalWidth * k;
    const dh = img.naturalHeight * k;
    probe.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
    const px = probe.getImageData(0, 0, cols, rows).data;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.fillStyle = ink;
    ctx.beginPath();
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const lum = ((0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255) ** tone;
      const l = invert ? 1 - lum : lum;
      const rad = (cell / 2) * Math.sqrt(l) * 0.98;
      if (rad < 0.35) continue;
      const cx = x * cell + cell / 2;
      const cy = y * cell + cell / 2;
      ctx.moveTo(cx + rad, cy);
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    }
    ctx.fill();
  };
  const go = () => (img.complete && img.naturalWidth ? draw() : img.addEventListener('load', draw, { once: true }));
  new ResizeObserver(go).observe(canvas);
  go();
}
