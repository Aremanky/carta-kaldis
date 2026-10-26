import { esc } from './utils.js';

/* =====================================================================
   ILUSTRACIONES · vista cenital con luz desde arriba a la izquierda.
   Cada producto se dibuja con una semilla fija (su id): sale siempre igual.
   Degradados y filtros compartidos en <svg class="defs"> (index.html).
   HI = true en la ficha y en las tarjetas grandes: añade texturas.
   Si un producto tiene `img`, se usa la foto en su lugar.
   ===================================================================== */
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => { let a = seed || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const f1 = n => Math.round(n * 10) / 10;
const BRAND = '#e86e2a', HERB = '#4f8a2a';
let HI = false, UID = 0;
const uid = p => p + (++UID).toString(36);

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function blobPath(cx, cy, rx, ry, n, jit, R, rot = 0) {
  const pts = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + (R() - .5) * .35, k = 1 - jit + R() * jit * 2;
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + 'Z';
}
const rrect = (x, y, w, h, r) => `M${f1(x + r)} ${f1(y)}H${f1(x + w - r)}A${r} ${r} 0 0 1 ${f1(x + w)} ${f1(y + r)}V${f1(y + h - r)}A${r} ${r} 0 0 1 ${f1(x + w - r)} ${f1(y + h)}H${f1(x + r)}A${r} ${r} 0 0 1 ${f1(x)} ${f1(y + h - r)}V${f1(y + r)}A${r} ${r} 0 0 1 ${f1(x + r)} ${f1(y)}Z`;
const arc = (cx, cy, r, a0, a1) => { const p = a => [cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r], [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${f1(x0)} ${f1(y0)}A${f1(r)} ${f1(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f1(x1)} ${f1(y1)}`; };
const rot = (x, y, a) => `transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})"`;
const fx = n => HI ? ` filter="url(#${n})"` : '';
const cast = (x, y, rx, ry, o = .6) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="url(#gCast)" opacity="${o}"/>`;
const vol = (d, g = 'gSphere', o = 1) => `<path d="${d}" fill="url(#${g})" opacity="${o}"/>`;
const ball = (x, y, r, col, o = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}" opacity="${o}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#gSphere)"/>`;
const spec = (x, y, rx, ry, a = -30, o = .7) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#fff" opacity="${o}" ${rot(x, y, a)}/>`;
const scatter = (R, cx, cy, rad, n, fn) => { let s = ''; for (let i = 0; i < n; i++) { const a = R() * 6.283, r = Math.sqrt(R()) * rad; s += fn(cx + Math.cos(a) * r, cy + Math.sin(a) * r, i); } return s; };
const zig = (pts, col, w, o = 1) => `<path d="M${pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
function drizzle(R, x0, y0, w, h, n, col, sw = 2) {   // hilo de salsa en zigzag suave y brillante
  let d = `M${f1(x0)} ${f1(y0)}`;
  for (let i = 0; i < n; i++) { const x = x0 + (i + 1) * w / n, y = y0 + (i % 2 ? -h : h) * (.7 + R() * .3); d += `Q${f1(x - w / n / 2)} ${f1(y + (i % 2 ? h : -h) * .4)} ${f1(x)} ${f1(y)}`; }
  return `<path d="${d}" fill="none" stroke="${shade(col, -.25)}" stroke-width="${sw + .8}" stroke-linecap="round" opacity=".55" transform="translate(.5 .8)"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${f1(sw * .28)}" stroke-linecap="round" opacity=".55" transform="translate(-.3 -.4)"/>`;
}
const herbs = (R, cx, cy, rad, n, cols = ['#4f8a2a', '#6aa23a', '#3f7a22']) => scatter(R, cx, cy, rad, n, (x, y, i) => leafSVG(x, y, 1.8 + R() * 1.6, .9 + R() * .5, R() * 180, cols[i % cols.length], false));
function leafSVG(x, y, rx, ry, a, col, veins = true) {
  const d = `M${f1(x - rx)} ${f1(y)}Q${f1(x - rx * .2)} ${f1(y - ry * 1.5)} ${f1(x + rx)} ${f1(y)}Q${f1(x - rx * .2)} ${f1(y + ry * 1.5)} ${f1(x - rx)} ${f1(y)}Z`;
  return `<g ${rot(x, y, a)}><path d="${d}" fill="${col}"/><path d="${d}" fill="url(#gLeaf)"/>${veins ? `<path d="M${f1(x - rx * .9)} ${f1(y)}Q${f1(x)} ${f1(y - ry * .15)} ${f1(x + rx * .9)} ${f1(y)}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="${f1(Math.max(.4, ry * .12))}"/>` : ''}</g>`;
}

/* ---------- Vajilla ---------- */
function plateSVG(r = 46, cx = 50, cy = 50, well = .7) {
  return cast(cx + 2.8, cy + 4.6, r * 1.03, r * .99, .95) +
    `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--plate)" stroke="#000" stroke-opacity=".07" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gPlateRim)"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${f1(r * well)}" fill="url(#gPlateWell)"/>` +
    `<path d="${arc(cx, cy, r - 1.3, 196, 292)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>`;
}
function bowlSVG(r, inner, cx = 50, cy = 50, clay = false) {
  const out = clay ? '#b5532c' : null;
  return cast(cx + 2.6, cy + 4.2, r * 1.02, r * .98, .75) +
    (clay ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${out}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gSphere)" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="${f1(r - 3)}" fill="${shade(out, -.25)}"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--plate)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gPlateRim)"/>`) +
    `<circle cx="${cx}" cy="${cy}" r="${inner}" fill="${clay ? shade(out, -.35) : 'var(--plate-2)'}"/>`;
}
const wallShade = (cx, cy, r) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="url(#gRimIn)"/>`;
function spoonSVG(x, y, a, len = 26) {
  return `<g ${rot(x, y, a)}>${cast(x + 1, y + 1.6, len * .55, 3, .35)}<rect x="${f1(x)}" y="${f1(y - 1)}" width="${len}" height="2" rx="1" fill="url(#gMetal)"/>` +
    `<ellipse cx="${f1(x - 3.6)}" cy="${f1(y)}" rx="5" ry="3.4" fill="url(#gMetal)"/><ellipse cx="${f1(x - 4.4)}" cy="${f1(y - .8)}" rx="2.2" ry="1" fill="#fff" opacity=".7"/></g>`;
}
function sugarSVG(x, y, a) {
  return `<g ${rot(x, y, a)}>${cast(x + 1, y + 1.4, 7.5, 3.6, .35)}<rect x="${f1(x - 7)}" y="${f1(y - 3.4)}" width="14" height="6.8" rx="1" fill="#fbfaf6"/>` +
    `<rect x="${f1(x - 7)}" y="${f1(y - 3.4)}" width="4.2" height="6.8" fill="${BRAND}"/><path d="M${f1(x - 1.6)} ${f1(y - 1.2)}h6.4M${f1(x - 1.6)} ${f1(y + 1)}h4.4" stroke="#c9c3b6" stroke-width=".6"/></g>`;
}

/* ---------- Superficies de bebida ---------- */
function liquidGrad(id, a, b) { return `<radialGradient id="${id}" cx=".46" cy=".42" r=".62"><stop offset="0" stop-color="${b}"/><stop offset=".62" stop-color="${a}"/><stop offset="1" stop-color="${shade(a, -.38)}"/></radialGradient>`; }
function latte(kind, cx, cy, k, foam, R) {
  const T = `translate(${f1(cx)} ${f1(cy)}) scale(${f1(k)})`, f = fx('fSoft');
  if (kind === 'heart') return `<g transform="${T}"${f}><path d="M0 .52C-.78 .06-.62-.62 0-.2.62-.62.78 .06 0 .52Z" fill="${foam}"/><path d="M0 .78C.02 .3-.02 -.1 0 -.22" stroke="${shade(foam, -.18)}" stroke-width=".05" fill="none"/></g>`;
  if (kind === 'rosetta') {
    let d = ''; for (let i = 0; i < 8; i++) { const y = .56 - i * .14, w = .66 - i * .07; d += `M${f1(-w * 10) / 10} ${f1(y * 100) / 100}Q0 ${f1((y - .24) * 100) / 100} ${f1(w * 10) / 10} ${f1(y * 100) / 100}Q0 ${f1((y - .1) * 100) / 100} ${f1(-w * 10) / 10} ${f1(y * 100) / 100}Z`; }
    return `<g transform="${T}"${f}><path d="${d}" fill="${foam}"/><path d="M0 .78V-.62" stroke="${foam}" stroke-width=".05"/><circle cx="0" cy="-.6" r=".09" fill="${foam}"/></g>`;
  }
  if (kind === 'tulip') return `<g transform="${T}"${f}>${[[.42, .36], [.1, .29], [-.2, .22], [-.44, .15]].map(([y, w]) => `<path d="M${-w} ${y}C${-w} ${f1((y - w * 1.4) * 100) / 100} ${w} ${f1((y - w * 1.4) * 100) / 100} ${w} ${y}Q0 ${f1((y - w * .45) * 100) / 100} ${-w} ${y}Z" fill="${foam}"/>`).join('')}<path d="M0 .74V-.5" stroke="${foam}" stroke-width=".05"/></g>`;
  return '';
}
function whippedSVG(R, cx, cy, r, col, tint) {   // nata montada en espiral
  let s = `<circle cx="${f1(cx + .8)}" cy="${f1(cy + 1.2)}" r="${f1(r)}" fill="#000" opacity=".12"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${col}"/>`;
  for (let k = 0; k < 4; k++) {
    const rr = r * (.88 - k * .2); let d = '';
    for (let i = 0; i <= 12; i++) { const a = i / 12 * 6.283 + k * .7, w = rr * (1 + (i % 2 ? .06 : -.04)); d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * w) + ' ' + f1(cy + Math.sin(a) * w); }
    s += `<path d="${d}Z" fill="none" stroke="${shade(col, -.14)}" stroke-width="${f1(r * .07)}" stroke-linejoin="round"/>`;
  }
  s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="url(#gDome)"/>` + spec(cx - r * .35, cy - r * .4, r * .3, r * .14);
  if (tint) s += scatter(R, cx, cy, r * .7, 26, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.25 + R() * .35)}" fill="${tint}" opacity="${f1(.5 + R() * .4)}"/>`);
  return s;
}

const ART = {
  /* Taza con plato, cuchara y azucarillo */
  cup(id, R, cols, o) {
    const [a, b] = cols || ['#7a4a2a', '#f3e3c8'];
    const cr = o.size === 'small' ? 19 : o.size === 'big' ? 27 : 23.5, cx = 46, cy = 48, lr = cr - 2.6, gid = uid('lq');
    let s = `<defs>${liquidGrad(gid, a, shade(a, .28))}</defs>` + plateSVG(44, 50, 50, .62);
    s += spoonSVG(30, 79, -24 + R() * 10) + (o.latte === 'tea' ? '' : sugarSVG(70, 76, -18 + R() * 20));
    s += cast(cx + 3, cy + 4.4, cr + 2.4, cr + 1.6, .9);
    s += `<rect x="${f1(cx + cr - 4)}" y="${f1(cy - 5)}" width="14" height="10" rx="5" style="fill:var(--plate)"/><rect x="${f1(cx + cr - 1.5)}" y="${f1(cy - 2.4)}" width="8" height="4.8" rx="2.4" style="fill:var(--plate-2)"/>`;
    s += `<rect x="${f1(cx + cr - 4)}" y="${f1(cy - 5)}" width="14" height="10" rx="5" fill="url(#gSphere)" opacity=".5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${cr}" style="fill:var(--plate)"/><circle cx="${cx}" cy="${cy}" r="${cr}" fill="url(#gSphere)" opacity=".45"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${lr}" fill="url(#${gid})"/>`;
    const k = lr * .8, foam = b;
    switch (o.latte) {
      case 'heart': case 'rosetta': case 'tulip':
        s += `<circle cx="${cx}" cy="${cy}" r="${f1(lr * .93)}" fill="${shade(a, .12)}" opacity=".5"/>` + latte(o.latte, cx, cy + lr * .05, k, foam, R); break;
      case 'cocoa':
        s += `<circle cx="${cx}" cy="${cy}" r="${f1(lr * .9)}" fill="${foam}"${fx('fFoam')}/>` + scatter(R, cx, cy, lr * .62, 70, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.22 + R() * .32)}" fill="#5a3320" opacity="${f1(.35 + R() * .5)}"/>`) +
          `<circle cx="${cx}" cy="${cy}" r="${f1(lr * .9)}" fill="url(#gDome)" opacity=".7"/>`; break;
      case 'crema':
        s += `<circle cx="${cx}" cy="${cy}" r="${lr}" fill="#c98a4e" opacity=".55"${fx('fFoam')}/>` + scatter(R, cx, cy, lr * .7, 14, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.5 + R() * .8)}" fill="#7a4220" opacity=".35"/>`); break;
      case 'cream': case 'caramel':
        s += whippedSVG(R, cx, cy, lr * .86, foam, o.latte === 'cream' ? '#8a4a24' : null);
        if (o.latte === 'caramel') s += drizzle(R, cx - lr * .6, cy - lr * .2, lr * 1.2, 2.4, 5, '#c47a2a', 1.4) + drizzle(R, cx - lr * .5, cy + lr * .25, lr, 2.2, 4, '#c47a2a', 1.3);
        break;
      case 'swirl': {
        let d = ''; for (let i = 0; i < 40; i++) { const t2 = i / 40, ang = t2 * 12, rr = lr * .75 * t2; d += (i ? 'L' : 'M') + f1(cx + Math.cos(ang) * rr) + ' ' + f1(cy + Math.sin(ang) * rr); }
        s += `<path d="${d}" fill="none" stroke="${b}" stroke-width="1.6" stroke-linecap="round" opacity=".85"${fx('fSoft')}/>`; break;
      }
      case 'tea':
        s += `<ellipse cx="${f1(cx - lr * .25)}" cy="${f1(cy - lr * .3)}" rx="${f1(lr * .45)}" ry="${f1(lr * .2)}" fill="#fff" opacity=".2" ${rot(cx, cy, -30)}/>` +
          `<path d="M${f1(cx + lr * .2)} ${f1(cy + lr * .2)}C${f1(cx + cr * .6)} ${f1(cy + cr * .9)} ${f1(cx + cr * .9)} ${f1(cy + cr)} 70 74" fill="none" stroke="#efe9dc" stroke-width=".7"/>` +
          `<g ${rot(72, 76, -14)}>${cast(73, 78, 7, 7.4, .45)}<rect x="67" y="70" width="11" height="13" rx="1.2" fill="#fbfaf6"/><rect x="67" y="70" width="11" height="4.4" fill="${BRAND}"/><path d="M69 77.5h7M69 80h5" stroke="#d6cfc2" stroke-width=".6"/></g>`; break;
      default:
        s += `<ellipse cx="${f1(cx - lr * .25)}" cy="${f1(cy - lr * .32)}" rx="${f1(lr * .48)}" ry="${f1(lr * .18)}" fill="#fff" opacity=".16" ${rot(cx, cy, -32)}/>`;
    }
    s += wallShade(cx, cy, lr) + `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="none" stroke="#000" stroke-opacity=".14" stroke-width=".9"/>`;
    return s + `<path d="${arc(cx, cy, cr - 1.1, 195, 285)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".95"/>`;
  },

  /* Vaso o copa vistos desde arriba */
  glass(id, R, cols, o) {
    const [a, b, c] = cols || ['#e9a92e', '#f8f0de', '#d4901f'];
    const r0 = o.small ? 25 : 36, lr = o.stem ? r0 * .62 : r0 - (o.small ? 2.8 : 3.6), cx = 50, cy = 50, gid = uid('gl');
    let s = `<defs>${liquidGrad(gid, a, b)}</defs>`;
    if (o.stem) s += cast(cx + 7, cy + 10, r0 * .8, r0 * .76, .4) + `<circle cx="${cx + 6}" cy="${cy + 8}" r="${f1(r0 * .7)}" fill="#fff" fill-opacity=".14" stroke="var(--line-2)" stroke-width="1"/><circle cx="${cx + 6}" cy="${cy + 8}" r="${f1(r0 * .7)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".9"/>`;
    s += cast(cx + 3, cy + 4.5, r0 * 1.02, r0 * .98, .55);
    s += `<circle cx="${cx}" cy="${cy}" r="${r0}" fill="#fff" fill-opacity=".22" stroke="var(--line-2)" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${f1(r0 - .7)}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.3"/>`;
    if (o.stem) s += `<circle cx="${cx}" cy="${cy}" r="${f1(r0 * .82)}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1"/><path d="${arc(cx, cy, r0 * .74, 20, 120)}" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>`;
    s += `<circle cx="${f1(cx + (o.stem ? 2 : 0))}" cy="${f1(cy + (o.stem ? 3 : 0))}" r="${f1(lr)}" fill="url(#${gid})"/>`;
    if (o.layers) s += `<circle cx="${cx}" cy="${cy}" r="${f1(lr - 1.2)}" fill="none" stroke="${b}" stroke-width="2.4" opacity=".75"/><circle cx="${cx}" cy="${cy}" r="${f1(lr * .62)}" fill="#c98a4e" opacity=".5"${fx('fFoam')}/>`;
    if (o.foam) {
      const fr = lr * .84;
      s += `<circle cx="${cx + .6}" cy="${cy + .9}" r="${f1(fr)}" fill="#000" opacity=".18"/><circle cx="${cx}" cy="${cy}" r="${f1(fr)}" fill="${b}"${fx('fFoam')}/><circle cx="${cx}" cy="${cy}" r="${f1(fr)}" fill="none" stroke="${shade(b, -.12)}" stroke-width="2" opacity=".6"/>`;
      s += scatter(R, cx, cy, fr * .9, 30, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.5 + R() * 1.5)}" fill="none" stroke="${shade(b, -.18)}" stroke-width=".5" opacity=".7"/>`);
      s += `<circle cx="${cx}" cy="${cy}" r="${f1(fr)}" fill="url(#gDome)" opacity=".6"/>`;
    }
    if (o.ice) for (let i = 0; i < 4; i++) {
      const g = i * 1.571 + R() * .5, x = cx + Math.cos(g) * lr * .42, y = cy + Math.sin(g) * lr * .42, z = lr * .44;
      s += `<g ${rot(x, y, R() * 60)}><path d="${rrect(x - z / 2, y - z / 2, z, z, z * .22)}" fill="#fff" fill-opacity=".2" stroke="#fff" stroke-opacity=".75" stroke-width=".9"/><path d="M${f1(x - z * .3)} ${f1(y - z * .3)}h${f1(z * .45)}" stroke="#fff" stroke-opacity=".8" stroke-width="1" stroke-linecap="round"/></g>`;
    }
    if (o.crushed) s += scatter(R, cx, cy, lr * .95, 90, (x, y) => `<path d="M${f1(x)} ${f1(y)}l${f1(1 + R())} ${f1(-.6 - R())}l${f1(.4 + R())} ${f1(1.2 + R())}z" fill="#fff" opacity="${f1(.35 + R() * .45)}"/>`);
    if (o.cream) s += whippedSVG(R, cx - 2, cy + 1, lr * .66, '#fbf6ee', null) + scatter(R, cx - 2, cy + 1, lr * .5, 10, (x, y) => `<rect x="${f1(x)}" y="${f1(y)}" width="2" height=".8" rx=".4" fill="${['#e84a5f', '#f2c94c', '#5fb0e8', '#7fbf5a'][(R() * 4) | 0]}" ${rot(x, y, R() * 180)}/>`);
    if (o.slice) {
      const x = cx + r0 * .62, y = cy - r0 * .58, rr = o.small ? 8 : 11;
      s += `<g>${cast(x + 1.5, y + 2, rr, rr * .95, .45)}<circle cx="${f1(x)}" cy="${f1(y)}" r="${rr}" fill="${c}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr - 1.4)}" fill="#fbf6df"/>`;
      for (let i = 0; i < 9; i++) { const g1 = i / 9 * 6.283 + .1, g2 = (i + 1) / 9 * 6.283 - .1, r1 = rr - 2.2; s += `<path d="M${f1(x)} ${f1(y)}L${f1(x + Math.cos(g1) * r1)} ${f1(y + Math.sin(g1) * r1)}A${f1(r1)} ${f1(r1)} 0 0 1 ${f1(x + Math.cos(g2) * r1)} ${f1(y + Math.sin(g2) * r1)}Z" fill="${shade(c, .3)}"/>`; }
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}" fill="url(#gDome)" opacity=".6"/></g>`;
    }
    if (o.straw) s += `<g ${rot(cx, cy, -40)}><rect x="${cx}" y="${cy - 2.4}" width="${f1(r0 + 14)}" height="4.8" rx="2.4" fill="${o.straw}"/><rect x="${cx}" y="${cy - 2.4}" width="${f1(r0 + 14)}" height="4.8" rx="2.4" fill="url(#gCyl)"/><circle cx="${f1(cx + r0 + 12)}" cy="${cy}" r="1.4" fill="#000" opacity=".35"/></g>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${f1(lr)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`;
    return s + `<path d="${arc(cx, cy, r0 - 2.4, 190, 260)}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>` + spec(cx + r0 * .45, cy + r0 * .5, 3, 1.2, -40, .5);
  },

  /* Lata vista desde arriba */
  can(id, R, cols) {
    const [ring, accent] = cols;
    return cast(53, 54.5, 39, 37, .6) + `<circle cx="50" cy="50" r="38" fill="${ring}"/><circle cx="50" cy="50" r="38" fill="url(#gSphere)" opacity=".8"/><circle cx="50" cy="50" r="38" fill="none" stroke="${accent}" stroke-width="2.2" opacity=".75"/>` +
      `<circle cx="50" cy="50" r="33" fill="url(#gMetal)"/><circle cx="50" cy="50" r="33" fill="none" stroke="#7d8590" stroke-width="1"/><circle cx="50" cy="50" r="28.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"/><circle cx="50" cy="50" r="27.5" fill="none" stroke="#8a929d" stroke-width="1"/>` +
      `<path d="M38 33c4-5.6 20-5.6 24 0l-2.4 6.4c-4.4-3.4-14.8-3.4-19.2 0z" fill="#69717c"/><path d="M39.6 34c4-4 16.8-4 20.8 0" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/>` +
      `<g ${rot(50, 50, -12 + R() * 24)}>${cast(51, 54, 8, 13, .4)}<rect x="43" y="39.5" width="14" height="25" rx="7" fill="url(#gMetal)" stroke="#8a929d" stroke-width="1"/><rect x="46.6" y="54" width="6.8" height="7" rx="3.4" fill="#7d8590"/><circle cx="50" cy="45" r="1.7" fill="#69717c"/></g>` +
      `<path d="${arc(50, 50, 35.5, 192, 262)}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  },

  /* Botella vista desde arriba: chapa o tapón */
  bottle(id, R, cols, o) {
    const [glass, cap] = cols, gid = uid('bt');
    let s = `<defs><radialGradient id="${gid}" cx=".4" cy=".36" r=".66"><stop offset="0" stop-color="${shade(glass, .45)}"/><stop offset=".55" stop-color="${glass}"/><stop offset="1" stop-color="${shade(glass, -.35)}"/></radialGradient></defs>`;
    s += cast(53, 55, 37, 35, .55) + `<circle cx="50" cy="50" r="34" fill="url(#${gid})" opacity=".94"/><circle cx="50" cy="50" r="34" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>`;
    s += `<circle cx="50" cy="50" r="21" fill="${shade(glass, -.15)}" opacity=".85"/><circle cx="50" cy="50" r="16.5" fill="${shade(glass, .15)}"/>`;
    if (o.crown) {
      let d = ''; const n = 21;
      for (let i = 0; i <= n * 2; i++) { const g = i / (n * 2) * 6.283, r = i % 2 ? 12.4 : 13.8; d += (i ? 'L' : 'M') + f1(50 + Math.cos(g) * r) + ' ' + f1(50 + Math.sin(g) * r); }
      s += cast(51, 51.5, 13.5, 13, .5) + `<path d="${d}Z" fill="${cap}"/><path d="${d}Z" fill="url(#gSphere)" opacity=".7"/><circle cx="50" cy="50" r="9.6" fill="${shade(cap, .12)}"/><circle cx="50" cy="50" r="9.6" fill="url(#gDome)"/><circle cx="50" cy="50" r="5.5" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>`;
    } else {
      s += cast(51, 51.5, 13, 12.5, .5) + `<circle cx="50" cy="50" r="12.6" fill="${cap}"/><circle cx="50" cy="50" r="12.6" fill="none" stroke="${shade(cap, -.3)}" stroke-width="1.4" stroke-dasharray="1.2 1.2"/><circle cx="50" cy="50" r="9" fill="${shade(cap, .15)}"/><circle cx="50" cy="50" r="12.6" fill="url(#gSphere)" opacity=".7"/>`;
    }
    if (o.lime) s += `<g>${cast(64, 40, 11, 6, .4)}<path d="M55 36a13 13 0 0 1 17 9z" fill="#5f9a2a"/><path d="M56.8 37.2a10.5 10.5 0 0 1 13.4 7.2z" fill="#c9e08a"/><path d="M58 38.6l9 4.8M60.6 37.6l4 6" stroke="#9cc25a" stroke-width=".7"/></g>`;
    if (o.bubbles) s += scatter(R, 50, 50, 30, 16, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.6 + R() * .9)}" fill="none" stroke="#fff" stroke-width=".6" opacity=".8"/>`);
    return s + `<path d="${arc(50, 50, 31, 190, 255)}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".6"/>`;
  },

  /* Helado: tarrina, copa o vaso con café */
  scoops(id, R, cols, o) {
    const n = o.n || 1;
    let s = '';
    if (o.coffee) {   // vaso con café o chocolate y una bola encima
      s += ART.glass(id, R, [o.coffee, shade(o.coffee, .35), o.coffee], {});
    } else if (o.sauce) {   // copa de cristal
      s += cast(53, 55, 40, 38, .5) + `<circle cx="50" cy="50" r="40" fill="#fff" fill-opacity=".25" stroke="var(--line-2)" stroke-width="1.2"/><circle cx="50" cy="50" r="39" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.4"/><circle cx="50" cy="50" r="34" fill="#fff" fill-opacity=".18"/>`;
    } else {   // tarrina de papel
      s += cast(53, 55, 39, 37, .6) + `<circle cx="50" cy="50" r="38" fill="#fbfaf6"/>`;
      for (let i = 0; i < 36; i++) { const g = i / 36 * 6.283; s += `<path d="M${f1(50 + Math.cos(g) * 33)} ${f1(50 + Math.sin(g) * 33)}L${f1(50 + Math.cos(g) * 38)} ${f1(50 + Math.sin(g) * 38)}" stroke="#e6e0d4" stroke-width=".7"/>`; }
      s += `<circle cx="50" cy="50" r="38" fill="none" stroke="${BRAND}" stroke-width="2.2"/><circle cx="50" cy="50" r="33" fill="#efe9de"/>` + wallShade(50, 50, 33);
    }
    const P = n === 1 ? [[50, 50]] : n === 2 ? [[41, 46], [60, 55]] : [[39, 42], [61, 42], [50, 61]];
    const rr = n === 1 ? (o.coffee ? 17 : 19) : 14.5;
    P.forEach(([x, y], i) => {
      const col = cols[i % cols.length], d = blobPath(x, y, rr, rr, 14, .07, R);
      s += cast(x + 1.5, y + 2.5, rr, rr * .95, .55) + `<path d="${d}" fill="${col}"/>`;
      for (let k = 0; k < 7; k++) { const g = R() * 6.283, q = rr * (.35 + R() * .45); s += `<path d="${arc(x + Math.cos(g) * q, y + Math.sin(g) * q, 2.6 + R() * 2, 20, 160)}" fill="none" stroke="${shade(col, -.12)}" stroke-width=".9" stroke-linecap="round" opacity=".8"/>`; }
      s += `<path d="${d}" fill="url(#gSphere)"/>` + spec(x - rr * .36, y - rr * .42, rr * .28, rr * .13);
    });
    if (o.sauce) s += drizzle(R, 30, 46, 40, 4, 5, o.sauce, 2) + whippedSVG(R, 68, 68, 8, '#fbf6ee') + `<g ${rot(70, 30, -36)}><rect x="58" y="27" width="26" height="6" rx="3" fill="#e3b46a"/><rect x="58" y="27" width="26" height="6" rx="3" fill="url(#gCyl)"/><path d="M62 27v6M66 27v6M70 27v6M74 27v6M78 27v6" stroke="#c48f42" stroke-width=".6"/></g>`;
    else if (!o.coffee && n > 1) s += `<g ${rot(70, 72, -30)}>${cast(71, 74, 10, 3, .4)}<rect x="62" y="70" width="16" height="3.4" rx="1.7" fill="${BRAND}"/><ellipse cx="60" cy="71.7" rx="4" ry="3" fill="${BRAND}"/><ellipse cx="59" cy="70.8" rx="1.6" ry=".8" fill="#fff" opacity=".6"/></g>`;
    return s;
  },
  cone(id, R, cols) {
    const [a, b] = cols;
    let s = cast(53, 55, 37, 35, .6) + `<circle cx="50" cy="50" r="34" fill="#d9a35f"/>`;
    for (let i = 0; i < 16; i++) { const g = i / 16 * 6.283; s += `<path d="M50 50L${f1(50 + Math.cos(g) * 34)} ${f1(50 + Math.sin(g) * 34)}" stroke="#b9823e" stroke-width=".8"/>`; }
    s += `<circle cx="50" cy="50" r="34" fill="url(#gSphere)" opacity=".6"/><circle cx="50" cy="50" r="31" fill="${b}"/><circle cx="50" cy="50" r="31" fill="url(#gSphere)" opacity=".6"/>`;
    s += scatter(R, 50, 50, 29, 26, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r=".9" fill="${['#f2c94c', '#f4e8dc', '#d98a4a'][(R() * 3) | 0]}"/>`);
    const d = blobPath(50, 49, 23, 23, 14, .07, R);
    return s + cast(51, 52, 23, 22, .5) + `<path d="${d}" fill="${a}"/><path d="${d}" fill="url(#gSphere)"/>` + spec(42, 40, 6, 2.6);
  },

  /* Churros, porras y rellenos */
  churros(id, R, cols, o) {
    const [a, b] = cols, n = o.n || 4, w = o.thick ? 11.5 : 7.4, L = o.thick ? 54 : 60, gap = o.thick ? 3 : 1.6;
    let s = plateSVG() + `<g transform="rotate(${f1(-32 + R() * 8)} 50 50)">`;
    for (let i = 0; i < n; i++) {
      const y = 50 + (i - (n - 1) / 2) * (w + gap), x0 = 50 - L / 2 + (R() - .5) * 6, x1 = x0 + L, bend = (R() - .5) * 5;
      const d = `M${f1(x0)} ${f1(y)}Q${f1((x0 + x1) / 2)} ${f1(y + bend)} ${f1(x1)} ${f1(y)}`;
      s += `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="${w + 1}" stroke-linecap="round" transform="translate(1 1.8)"/>`;
      s += `<path d="${d}" fill="none" stroke="${shade(a, -.3)}" stroke-width="${w + .8}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${a}" stroke-width="${w}" stroke-linecap="round"/>`;
      const ridges = o.thick ? [-.3, 0, .3] : [-.33, -.1, .12, .34];
      ridges.forEach(k => { s += `<path d="${d}" fill="none" stroke="${shade(a, -.32)}" stroke-width="${f1(w * .07)}" stroke-linecap="round" transform="translate(0 ${f1(k * w)})" opacity=".85"/>`; });
      s += `<path d="${d}" fill="none" stroke="${shade(a, .38)}" stroke-width="${f1(w * .16)}" stroke-linecap="round" transform="translate(0 ${f1(-w * .24)})" opacity=".85"/>`;
      if (o.filled) s += `<ellipse cx="${f1(x1 + w * .05)}" cy="${f1(y)}" rx="${f1(w * .22)}" ry="${f1(w * .36)}" fill="${b}"/><ellipse cx="${f1(x1 - w * .02)}" cy="${f1(y - w * .1)}" rx="${f1(w * .08)}" ry="${f1(w * .12)}" fill="#fff" opacity=".35"/>`;
      if (!o.filled) for (let k = 0; k < 9; k++) { const x = x0 + R() * L, yy = y + (R() - .5) * w * .7; s += `<rect x="${f1(x)}" y="${f1(yy)}" width=".9" height=".9" fill="#fff" opacity="${f1(.6 + R() * .4)}" ${rot(x, yy, R() * 90)}/>`; }
    }
    return s + '</g>';
  },

  /* Postres de plato */
  dessert(id, R, cols, o) {
    const [a, b, c] = cols;
    let s = plateSVG();
    if (o.kind === 'waffle') {
      const g = `<g transform="rotate(${f1(-12 + R() * 8)} 50 50)">`;
      s += cast(52, 54, 30, 29, .6) + g + `<path d="${rrect(21, 21, 58, 58, 13)}" fill="${shade(a, -.22)}"/><path d="${rrect(23, 23, 54, 54, 11)}" fill="${a}"${fx('fGrain')}/>`;
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const x = 26.5 + i * 10, y = 26.5 + j * 10; s += `<rect x="${x}" y="${y}" width="7.4" height="7.4" rx="1.6" fill="${shade(a, -.3)}"/><path d="M${x} ${f1(y + 7.4)}V${f1(y + 1.6)}Q${x} ${y} ${f1(x + 1.6)} ${y}H${f1(x + 7.4)}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.2"/>`; }
      s += `<path d="${rrect(23, 23, 54, 54, 11)}" fill="url(#gDome)" opacity=".6"/></g>`;
      return s + drizzle(R, 27, 44, 46, 5, 6, c, 2.2) + whippedSVG(R, 63, 62, 10, b) + scatter(R, 50, 50, 24, 20, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r=".5" fill="#fff" opacity=".8"/>`);
    }
    if (o.kind === 'crepe') {
      s += `<g transform="rotate(${f1(-28 + R() * 14)} 50 50)">` + cast(47, 51, 22, 22, .5) +
        `<path d="M26 72L26 27A45 45 0 0 1 71 72Z" fill="${shade(a, -.1)}"/><path d="M29 69L29 31A38 38 0 0 1 67 69Z" fill="${a}"${fx('fGrain')}/>` +
        scatter(R, 42, 54, 16, 28, (x, y) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(1 + R() * 2)}" ry="${f1(.6 + R())}" fill="${shade(a, -.28)}" opacity="${f1(.25 + R() * .35)}"/>`) +
        `<path d="M29 49C39 49 47 57 47 69" fill="none" stroke="${shade(a, -.25)}" stroke-width="1.2"/><path d="M29 69L29 31A38 38 0 0 1 67 69Z" fill="url(#gDome)" opacity=".5"/></g>`;
      if (b === '#fbf4ea') return s + drizzle(R, 31, 45, 34, 3, 6, c, 1.8) + whippedSVG(R, 70, 64, 8.5, b);
      return s + `<path d="M33 66c6-3 14-2 20 1" fill="none" stroke="${b}" stroke-width="3.4" stroke-linecap="round"/><path d="M31 61c5-2 10-2 16 0" fill="none" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`;
    }
    if (o.kind === 'pancakes') {
      [[44, 45], [49, 50], [55, 55]].forEach(([x, y]) => { s += cast(x + 1.5, y + 2.5, 21, 20, .45) + `<circle cx="${x}" cy="${y}" r="21" fill="${shade(a, -.18)}"/><circle cx="${x}" cy="${y}" r="19.4" fill="${a}"${fx('fGrain')}/><circle cx="${x}" cy="${y}" r="19.4" fill="url(#gDome)" opacity=".7"/>`; });
      s += `<path d="${blobPath(55, 53, 13, 10, 9, .25, R)}" fill="#b5651e" opacity=".85"/><path d="M48 50c4-3 10-2 13 2" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round"/>`;
      s += `<rect x="52" y="47" width="8" height="6.4" rx="1.6" fill="#f6e39a"/><rect x="52" y="47" width="8" height="6.4" rx="1.6" fill="url(#gSphere)" opacity=".6"/>`;
      return s + ball(70, 41, 3.2, c) + ball(66, 37, 2.8, c) + ball(38, 66, 3, '#3a3a7a') + ball(43, 69, 2.6, '#3a3a7a') + whippedSVG(R, 34, 40, 6, b);
    }
    if (o.kind === 'bar') {   // brownie o torrija
      s += `<path d="${blobPath(64, 64, 12, 9, 9, .2, R)}" fill="${b}" opacity=".95"/>`;
      s += `<g transform="rotate(-16 46 46)">` + cast(48, 49, 20, 15, .55) + `<path d="${rrect(25, 31, 42, 30, 6)}" fill="${shade(a, -.25)}"/><path d="${rrect(27, 33, 38, 26, 5)}" fill="${a}"${fx('fGrain')}/>`;
      for (let i = 0; i < 5; i++) { const x = 30 + R() * 30, y = 36 + R() * 18; s += `<path d="M${f1(x)} ${f1(y)}l${f1(3 + R() * 4)} ${f1((R() - .5) * 3)}l${f1(2 + R() * 3)} ${f1((R() - .5) * 3)}" fill="none" stroke="${shade(a, .25)}" stroke-width=".7" opacity=".8"/>`; }
      s += `<path d="${rrect(27, 33, 38, 26, 5)}" fill="url(#gDome)"/>` + spec(36, 39, 7, 2, -10, .45) + '</g>';
      const d = blobPath(68, 64, 9, 8.5, 12, .08, R);
      return s + cast(69, 66, 9, 8.5, .45) + `<path d="${d}" fill="#f6efdf"/><path d="${d}" fill="url(#gSphere)"/>` + drizzle(R, 28, 66, 30, 3, 5, c, 1.8) + scatter(R, 46, 46, 18, 16, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.5 + R() * .6)}" fill="#a8622a"/>`);
    }
    return s;
  }
};

/* Vapor animado para la ficha (no es parte del dibujo) */
export const steamSVG = () => `<svg class="steam" viewBox="0 0 60 40" aria-hidden="true"><path d="M16 38c-6-7 6-11 0-19s4-12 0-17"/><path d="M30 38c-6-7 6-11 0-19s4-12 0-17"/><path d="M44 38c-6-7 6-11 0-19s4-12 0-17"/></svg>`;

export function dishArt(d, hi = false) {
  if (d.img) return `<img src="${esc(hi ? d.img : (d.thumb || d.img))}" alt="" loading="lazy" decoding="async">`;
  const a = d.art || { type: 'plate', colors: ['#b8743a', '#e9c27a', HERB] };
  const fn = ART[a.type] || ART.plate;
  HI = hi;
  const out = `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">${fn(uid('a'), rng(hashStr(d.id)), a.colors, a)}</svg>`;
  HI = false;
  return out;
}

/* ---------- Ilustraciones II: pan, bocadillos, tapas, ensaladas y bowls ---------- */
function smooth(pts) {
  const n = pts.length; let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + 'Z';
}
function squircle(cx, cy, w, h, R, jit = .025, e = 2.8, n = 28) {   // rebanada de pan
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * 6.283, c = Math.cos(t), s = Math.sin(t), k = 1 + (R() - .5) * jit * 2;
    pts.push([cx + Math.sign(c) * Math.pow(Math.abs(c), 2 / e) * w / 2 * k, cy + Math.sign(s) * Math.pow(Math.abs(s), 2 / e) * h / 2 * k - (s < 0 ? Math.abs(c) < .5 ? h * .03 : 0 : 0)]);
  }
  return smooth(pts);
}
const dotsIn = (R, b, n, col, r0 = .6, op = 1) => { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f1(b.x + R() * b.w)}" cy="${f1(b.y + R() * b.h)}" r="${f1(r0 * (.6 + R() * .8))}" fill="${col}" opacity="${op}"/>`; return s; };
const chunkSVG = (x, y, z, col, R, hl = true) => `<g ${rot(x, y, R() * 90)}><path d="${rrect(x - z / 2, y - z / 2, z, z, z * .26)}" fill="${col}"/>${hl ? `<path d="${rrect(x - z / 2, y - z / 2, z, z, z * .26)}" fill="url(#gSphere)" opacity=".8"/>` : ''}</g>`;

/* ---------- Pan ---------- */
function breadSVG(R, cx, cy, w, h, kind) {
  const crust = kind === 'grain' ? '#7a4a22' : kind === 'big' ? '#985626' : '#a5622b';
  const crumbIn = kind === 'grain' ? '#d4a96e' : '#f3dcae', crumbOut = kind === 'grain' ? '#b98952' : '#e2b574', gid = uid('cr');
  const outer = squircle(cx, cy, w, h, R), inner = squircle(cx, cy - .4, w - 6, h - 6, R, .04);
  let s = `<defs><radialGradient id="${gid}" cx=".45" cy=".42" r=".65"><stop offset="0" stop-color="${crumbIn}"/><stop offset=".75" stop-color="${crumbOut}"/><stop offset="1" stop-color="${shade(crumbOut, -.18)}"/></radialGradient></defs>`;
  s += cast(cx + 2, cy + 3.2, w / 2 + 1, h / 2 + 1, .6) + `<path d="${outer}" fill="${crust}"/><path d="${outer}" fill="url(#gSphere)" opacity=".55"/>`;
  s += `<path d="${inner}" fill="url(#${gid})"${fx('fGrain')}/>`;
  const box = { x: cx - (w - 10) / 2, y: cy - (h - 10) / 2, w: w - 10, h: h - 10 };
  for (let i = 0; i < 22; i++) { const x = box.x + R() * box.w, y = box.y + R() * box.h; s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(.5 + R() * 1.2)}" ry="${f1(.4 + R() * .6)}" fill="${shade(crumbOut, -.25)}" opacity=".55" ${rot(x, y, R() * 180)}/>`; }
  if (kind === 'grain') s += dotsIn(R, box, 10, '#3d2412', .7) + (() => { let r = ''; for (let i = 0; i < 9; i++) { const x = box.x + R() * box.w, y = box.y + R() * box.h; r += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="1.6" ry=".8" fill="#e7dcc4" ${rot(x, y, R() * 180)}/>`; } return r; })();
  s += `<path d="${inner}" fill="url(#gDome)" opacity=".5"/>`;
  return { s, box };
}

/* Ingredientes sobre una tostada (b = caja donde caben) */
function topping(name, R, b) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, px = f => b.x + b.w * f, py = f => b.y + b.h * f;
  let s = '';
  const spread = (col, jit = .14) => { const d = blobPath(cx, cy, b.w * .5, b.h * .47, 11, jit, R); return `<path d="${d}" fill="${shade(col, -.15)}"/><path d="${blobPath(cx - .5, cy - .5, b.w * .46, b.h * .42, 11, jit, R)}" fill="${col}"/>`; };
  switch (name) {
    case 'tomato': return spread('#cf3e26') + dotsIn(R, b, 14, '#f0805e', .9, .8) + dotsIn(R, b, 9, '#f2c64a', .5, .9) + dotsIn(R, b, 5, '#e6b12a', 1.1, .7) + spec(cx - b.w * .2, cy - b.h * .2, b.w * .14, b.h * .07, -15, .4);
    case 'salmorejo': return spread('#e47b46', .08) + dotsIn(R, b, 8, '#f4b06a', .8, .7) + `<path d="M${f1(px(.1))} ${f1(py(.75))}q${f1(b.w * .3)} ${f1(-b.h * .3)} ${f1(b.w * .8)} ${f1(-b.h * .2)}" fill="none" stroke="#d9b62a" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>`;
    case 'lard': return spread('#d9542c') + (() => { let r = ''; for (let i = 0; i < 12; i++) { const x = px(.1 + R() * .8), y = py(.15 + R() * .7); r += `<path d="M${f1(x)} ${f1(y)}l${f1(2 + R() * 2)} ${f1((R() - .5) * 2)}" stroke="#6e2412" stroke-width="1.6" stroke-linecap="round"/>`; } return r; })() + spec(cx - b.w * .2, cy - b.h * .2, b.w * .14, b.h * .07, -15, .35);
    case 'butter': return `<path d="${blobPath(cx, cy, b.w * .4, b.h * .34, 9, .2, R)}" fill="#f6e39a" opacity=".5"/>` + cast(px(.68), py(.4), 7, 5, .4) + `<g ${rot(px(.66), py(.34), 14)}><path d="${rrect(px(.66) - 6, py(.34) - 4.4, 12, 8.8, 2)}" fill="#f8e7a6"/><path d="${rrect(px(.66) - 6, py(.34) - 4.4, 12, 8.8, 2)}" fill="url(#gSphere)" opacity=".7"/></g>`;
    case 'cream': return `<path d="${blobPath(cx, cy, b.w * .46, b.h * .42, 10, .1, R)}" fill="#f8f5ef"/><path d="M${f1(px(.2))} ${f1(py(.5))}q${f1(b.w * .3)} ${f1(-b.h * .3)} ${f1(b.w * .6)} 0" fill="none" stroke="#e3ddd2" stroke-width="1.2"/>`;
    case 'omelette': return `<path d="${blobPath(cx, cy, b.w * .48, b.h * .45, 11, .1, R)}" fill="#f0bf3e"/>` + dotsIn(R, b, 10, '#c98a26', 1.2, .5) + `<path d="${blobPath(cx, cy, b.w * .48, b.h * .45, 11, .1, R)}" fill="url(#gDome)" opacity=".7"/>`;
    case 'york': for (let i = 0; i < 2; i++) { const x = px(.3 + i * .4), y = cy + (i ? 1.5 : -1.5), d = blobPath(x, y, b.w * .27, b.h * .46, 10, .06, R, .2); s += cast(x + 1, y + 1.5, b.w * .25, b.h * .4, .35) + `<path d="${d}" fill="#f7cfcf"/><path d="${blobPath(x, y, b.w * .23, b.h * .4, 10, .06, R, .2)}" fill="#efa9ad"/><path d="${d}" fill="url(#gDome)" opacity=".6"/>`; } return s;
    case 'turkey': for (let i = 0; i < 3; i++) { const x = px(.22 + i * .28), y = cy + (R() - .5) * 3, d = blobPath(x, y, b.w * .18, b.h * .42, 9, .1, R, .3); s += cast(x + 1, y + 1.4, b.w * .17, b.h * .38, .3) + `<path d="${d}" fill="#f2d8c4"/><path d="${blobPath(x, y, b.w * .14, b.h * .36, 9, .1, R, .3)}" fill="#ebc6ad"/><path d="${d}" fill="url(#gDome)" opacity=".55"/>`; } return s;
    case 'ham': for (let i = 0; i < 3; i++) { const x = px(.2 + i * .3), y = cy + (R() - .5) * 4, d = blobPath(x, y, b.w * .17, b.h * .44, 10, .2, R, .4); s += cast(x + 1, y + 1.4, b.w * .16, b.h * .4, .35) + `<path d="${d}" fill="${i % 2 ? '#a3303a' : '#992a34'}"/><path d="M${f1(x - 2)} ${f1(y - b.h * .32)}q3.4 ${f1(b.h * .3)} -1 ${f1(b.h * .62)}M${f1(x + 2.4)} ${f1(y - b.h * .2)}q1.6 ${f1(b.h * .2)} -.6 ${f1(b.h * .4)}" fill="none" stroke="#f6e2d6" stroke-width="1.2" stroke-linecap="round" opacity=".9"/><path d="${d}" fill="url(#gDome)" opacity=".7"/>`; } return s;
    case 'mechada': for (let i = 0; i < 3; i++) { const x = px(.2 + i * .3), y = cy + (R() - .5) * 3, r = b.h * .38; s += cast(x + 1, y + 1.5, r, r * .95, .4) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#6e3a1e"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .78)}" fill="#b07a5a"/><circle cx="${f1(x + .8)}" cy="${f1(y - .6)}" r="${f1(r * .22)}" fill="#c8402c"/><circle cx="${f1(x - r * .3)}" cy="${f1(y + r * .25)}" r="${f1(r * .14)}" fill="#5f8f3a"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#gSphere)" opacity=".6"/>`; } return s;
    case 'avocado': for (let i = 0; i < 6; i++) { const x = px(.13 + i * .148), y = cy, gid = uid('av'); s += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3e98f"/><stop offset=".7" stop-color="#9ec55a"/><stop offset="1" stop-color="#3f6a1f"/></linearGradient></defs><g ${rot(x, y, -16)}>${cast(x + .8, y + 1.2, b.w * .08, b.h * .44, .3)}<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(b.w * .082)}" ry="${f1(b.h * .45)}" fill="url(#${gid})"/><ellipse cx="${f1(x - b.w * .02)}" cy="${f1(y - b.h * .15)}" rx="${f1(b.w * .02)}" ry="${f1(b.h * .15)}" fill="#fff" opacity=".35"/></g>`; } return s;
    case 'cheese': for (let i = 0; i < 7; i++) { const x = px(.12 + R() * .76), y = py(.15 + R() * .7), d = blobPath(x, y, 2.8 + R() * 1.8, 2.3 + R() * 1.3, 7, .28, R, R() * 3); s += `<path d="${d}" fill="#000" opacity=".15" transform="translate(.6 .9)"/><path d="${d}" fill="#fbfaf5"/><path d="${d}" fill="url(#gSphere)" opacity=".45"/>`; } return s;
    case 'salmon': for (let i = 0; i < 3; i++) { const x = px(.2 + i * .3), y = cy + (R() - .5) * 3, d = blobPath(x, y, b.w * .16, b.h * .44, 10, .2, R, .5); s += cast(x + 1, y + 1.4, b.w * .15, b.h * .4, .35) + `<path d="${d}" fill="#f2845a"/>`; for (let k = -2; k <= 2; k++) s += `<path d="M${f1(x - 4)} ${f1(y + k * 3.4)}l8 -2.4" stroke="#fbd6c2" stroke-width=".8" stroke-linecap="round" opacity=".9"/>`; s += `<path d="${d}" fill="url(#gDome)" opacity=".7"/>`; } return s;
    case 'tomatoSlice': for (let i = 0; i < 2; i++) { const x = px(.3 + i * .4), y = cy, r = b.h * .46; s += cast(x + 1, y + 1.5, r, r * .95, .4) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#c9301e"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .84)}" fill="#e4553c"/>`; for (let k = 0; k < 4; k++) { const a = k * 1.571 + .4, ex = x + Math.cos(a) * r * .42, ey = y + Math.sin(a) * r * .42; s += `<ellipse cx="${f1(ex)}" cy="${f1(ey)}" rx="${f1(r * .26)}" ry="${f1(r * .16)}" fill="#f2a54a" opacity=".85" ${rot(ex, ey, a * 57.3)}/><circle cx="${f1(ex)}" cy="${f1(ey)}" r=".7" fill="#f6dc8a"/>`; } s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#gDome)" opacity=".6"/>`; } return s;
    case 'anchovy': for (let i = 0; i < 4; i++) { const x = px(.15 + i * .23), d = `M${f1(x)} ${f1(py(.1))}q${f1(3 + R() * 2)} ${f1(b.h * .4)} -1 ${f1(b.h * .8)}`; s += `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="3.8" stroke-linecap="round" transform="translate(.6 .8)"/><path d="${d}" fill="none" stroke="#6e5038" stroke-width="3.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#c9b49a" stroke-width="1" stroke-linecap="round" transform="translate(-.6 0)"/><path d="${d}" fill="none" stroke="#fff" stroke-width=".5" stroke-linecap="round" opacity=".6" transform="translate(-1 -.4)"/>`; } return s;
    case 'egg': for (let i = 0; i < 2; i++) { const x = px(.32 + i * .36), y = cy + (i ? 2 : -2), gid = uid('yk'); s += `<defs><radialGradient id="${gid}" cx=".4" cy=".35"><stop offset="0" stop-color="#ffd25a"/><stop offset="1" stop-color="#e89a1e"/></radialGradient></defs>` + cast(x + 1, y + 1.4, 8, 6, .4) + `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="8" ry="6" fill="#fbfaf5" ${rot(x, y, 20)}/><circle cx="${f1(x)}" cy="${f1(y)}" r="3.3" fill="url(#${gid})"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="8" ry="6" fill="url(#gDome)" opacity=".5" ${rot(x, y, 20)}/>`; } return s;
    case 'tuna': for (let i = 0; i < 11; i++) { const x = px(.12 + R() * .76), y = py(.15 + R() * .7), d = blobPath(x, y, 3 + R() * 2, 2 + R() * 1.4, 7, .3, R, R() * 3); s += `<path d="${d}" fill="#c9a77a"/><path d="M${f1(x - 2)} ${f1(y)}l4 -1" stroke="#a88456" stroke-width=".5"/><path d="${d}" fill="url(#gSphere)" opacity=".5"/>`; } return s;
    case 'pepper': for (let i = 0; i < 3; i++) { const x = px(.2 + i * .3), d = `M${f1(x - 4)} ${f1(py(.18))}q6 ${f1(b.h * .32)} 2 ${f1(b.h * .64)}`; s += `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="4" stroke-linecap="round" transform="translate(.6 .8)"/><path d="${d}" fill="none" stroke="#b8241c" stroke-width="3.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#f07a5a" stroke-width="1" stroke-linecap="round" transform="translate(-.7 -.3)" opacity=".9"/>`; } return s;
    case 'quince': for (let i = 0; i < 4; i++) { const x = px(.15 + R() * .7), y = py(.2 + R() * .6); s += cast(x + .8, y + 1.2, 3.4, 3, .4) + `<g ${rot(x, y, R() * 90)}><path d="${rrect(x - 2.8, y - 2.8, 5.6, 5.6, 1.2)}" fill="#b85e1e"/><path d="${rrect(x - 2.8, y - 2.8, 5.6, 5.6, 1.2)}" fill="url(#gSphere)" opacity=".9"/><rect x="${f1(x - 1.8)}" y="${f1(y - 1.8)}" width="2.2" height=".8" rx=".4" fill="#fff" opacity=".55"/></g>`; } return s;
    case 'cherry': for (let i = 0; i < 4; i++) { const x = px(.12 + R() * .76), y = py(.2 + R() * .6); s += cast(x + .8, y + 1.2, 3.8, 3.6, .4) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.8" fill="#c8241c"/><circle cx="${f1(x)}" cy="${f1(y)}" r="2.9" fill="#e9503a"/><circle cx="${f1(x - 1)}" cy="${f1(y)}" r=".55" fill="#f6d06a"/><circle cx="${f1(x + 1)}" cy="${f1(y + .4)}" r=".55" fill="#f6d06a"/><circle cx="${f1(x)}" cy="${f1(y)}" r="3.8" fill="url(#gDome)" opacity=".7"/>`; } return s;
    case 'walnut': for (let i = 0; i < 4; i++) { const x = px(.12 + R() * .76), y = py(.2 + R() * .6), d = blobPath(x, y, 3.4, 2.8, 8, .3, R, R() * 3); s += `<path d="${d}" fill="#000" opacity=".2" transform="translate(.6 .9)"/><path d="${d}" fill="#9a6a38"/><path d="M${f1(x - 2.4)} ${f1(y)}q1.2 -1.6 2.4 0t2.4 0" fill="none" stroke="#6a4220" stroke-width=".6"/><path d="${d}" fill="url(#gSphere)" opacity=".7"/>`; } return s;
    case 'rocket': for (let i = 0; i < 8; i++) { const x = px(.06 + R() * .88), y = py(.08 + R() * .84); s += rocketLeaf(x, y, 3.8 + R() * 2.2, R() * 180, R() < .5 ? '#3f7a22' : '#5a9632'); } return s;
  }
  return '';
}
function rocketLeaf(x, y, l, a, col) {
  const d = `M${f1(x - l)} ${f1(y)}q${f1(l * .2)} -1.4 ${f1(l * .4)} -.6q.2 -1.2 ${f1(l * .4)} -1.2q.2 1 ${f1(l * .4)} .6q.4 -1 ${f1(l * .4)} -.6q${f1(l * .2)} .4 ${f1(l * .4)} 1.8q${f1(-l * .9)} 1.6 ${f1(-l * 2)} 0z`;
  return `<g ${rot(x, y, a)}><path d="${d}" fill="${col}"/><path d="M${f1(x - l)} ${f1(y)}h${f1(l * 1.9)}" stroke="#fff" stroke-opacity=".3" stroke-width=".4"/></g>`;
}

/* Bocadillos y montaditos */
function rollDome(cx, cy, rx, ry, col, R, a = 0) {
  const d = blobPath(cx, cy, rx, ry, 12, .03, R, a);
  return cast(cx + 1.5, cy + 2.5, rx, ry, .55) + `<path d="${d}" fill="${shade(col, -.3)}"/><path d="${blobPath(cx - .5, cy - .5, rx - 1, ry - 1, 12, .03, R, a)}" fill="${col}"/><path d="${d}" fill="url(#gSphere)"/>` +
    spec(cx - rx * .3, cy - ry * .4, rx * .3, ry * .12, a * 57.3 - 20, .35) + dotsIn(R, { x: cx - rx * .6, y: cy - ry * .5, w: rx * 1.2, h: ry }, 8, '#fff', .5, .5);
}

Object.assign(ART, {
  toast(id, R, cols, o) {
    const [a, b, c] = cols || ['#e2b06a', '#a8323a', '#f3dccf'];
    if (o.kind === 'top') {
      const big = o.big, w = big ? 74 : 64, h = big ? 46 : 40, ang = -14 + R() * 8;
      const br = breadSVG(R, 50, 50, w, h, o.grain ? 'grain' : big ? 'big' : 'plain');
      let s = plateSVG() + `<g transform="rotate(${f1(ang)} 50 50)">` + br.s;
      (o.top || []).forEach(n => { s += topping(n, rng((R() * 4294967295) >>> 0), br.box); });
      return s + '</g>';
    }
    if (o.kind === 'mini') {   // montadito: base con relleno y tapa de pan
      let s = plateSVG() + `<g transform="rotate(${f1(-18 + R() * 10)} 50 50)">`;
      const base = blobPath(46, 54, 25, 17, 12, .03, R);
      s += cast(48, 57, 26, 18, .55) + `<path d="${base}" fill="${shade(a, -.3)}"/><path d="${blobPath(46, 53.6, 23, 15, 12, .04, R)}" fill="#efd3a2"${fx('fGrain')}/>`;
      s += `<path d="${blobPath(45, 53, 20, 12.5, 11, .16, R)}" fill="${b}"/><path d="${blobPath(45, 53, 20, 12.5, 11, .16, R)}" fill="url(#gDome)" opacity=".7"/>`;
      s += scatter(R, 45, 53, 11, 6, (x, y) => `<path d="${blobPath(x, y, 2.6, 1.8, 6, .3, R, R() * 3)}" fill="${c}"/>`);
      s += rollDome(60, 41, 21, 15, a, R, .2);
      return s + `<path d="M48 35q12 4 24 2" fill="none" stroke="${shade(a, -.25)}" stroke-width="1" opacity=".6" ${rot(60, 41, 11)}/></g>`;
    }
    if (o.kind === 'mixto') {   // sándwich en dos triángulos
      const hot = a === '#e8bd7a';
      let s = plateSVG() + `<g transform="rotate(${f1(-8 + R() * 6)} 50 50)">`;
      [[[20, 28], [62, 28], [20, 70]], [[80, 72], [38, 72], [80, 30]]].forEach((tri, i) => {
        const [p, q, r2] = tri, d = `M${p[0]} ${p[1]}L${q[0]} ${q[1]}L${r2[0]} ${r2[1]}Z`, dx = i ? 2.2 : -2.2, cid = uid('tr');
        s += `<g transform="translate(${dx} ${-dx})"><path d="${d}" fill="#000" opacity=".2" transform="translate(1.4 2.4)"/>`;
        s += `<path d="M${q[0]} ${q[1]}L${r2[0]} ${r2[1]}" stroke="${b}" stroke-width="6.4" stroke-linecap="round"/><path d="M${q[0]} ${q[1]}L${r2[0]} ${r2[1]}" stroke="${c}" stroke-width="3" stroke-linecap="round" transform="translate(${i ? -1.4 : 1.4} ${i ? -1.4 : 1.4})"/>`;
        s += `<clipPath id="${cid}"><path d="${d}"/></clipPath><path d="${d}" fill="#c08a4e" stroke="#c08a4e" stroke-width="3.4" stroke-linejoin="round"/><path d="${d}" fill="${hot ? '#e7b873' : '#f4e2bf'}"${fx('fGrain')}/>`;
        if (hot) { s += `<g clip-path="url(#${cid})">`; for (let k = 0; k < 6; k++) s += `<path d="M${10 + k * 12} 90L${60 + k * 12} 10" stroke="#8a4a1e" stroke-width="2.2" opacity=".35"/>`; s += '</g>'; }
        s += `<path d="${d}" fill="url(#gDome)" opacity=".55"/></g>`;
      });
      return s + '</g>';
    }
    if (o.kind === 'baguette' || o.kind === 'hotdog') {
      let s = plateSVG() + `<g transform="rotate(${f1(-26 + R() * 8)} 50 50)">`;
      if (o.kind === 'hotdog') {
        s += cast(51, 53, 36, 13, .55) + `<path d="${rrect(14, 38, 72, 24, 12)}" fill="${shade(a, -.2)}"/><path d="${rrect(15, 39, 70, 22, 11)}" fill="${a}"/><path d="${rrect(15, 39, 70, 22, 11)}" fill="url(#gCyl)"/>`;
        s += `<path d="${rrect(10, 44.5, 80, 11, 5.5)}" fill="${b}"/><path d="${rrect(10, 44.5, 80, 11, 5.5)}" fill="url(#gCyl)"/><path d="M16 47h68" stroke="#fff" stroke-opacity=".35" stroke-width="1.1" stroke-linecap="round"/>`;
        return s + drizzle(R, 18, 50, 64, 2.6, 12, c, 1.6) + drizzle(R, 22, 48, 56, 2, 10, '#c8241c', 1.2) + '</g>';
      }
      // baguette (larga y fina) o bocadillo (más corto y ancho): abierto por un lado, se ve el relleno
      const bag = a === '#d9a05a', x0 = bag ? 8 : 14, w = bag ? 84 : 72, h = bag ? 22 : 27, y0 = 50 - h / 2 - 3;
      s += cast(51, 56, w / 2 + 2, h / 2 + 6, .55);
      s += `<path d="${rrect(x0 + 2, y0 + h - 4, w - 4, 12, 6)}" fill="${shade(a, -.2)}"/><path d="${rrect(x0 + 3, y0 + h - 3.4, w - 6, 9.6, 4.8)}" fill="#ecd2a0"/>`;
      s += `<path d="M${x0 + 4} ${f1(y0 + h + 1)}c8 4 14-3 22 0s14 4 22 0 14-3 ${w - 52} 0" fill="none" stroke="${b}" stroke-width="7" stroke-linecap="round"/>`;
      for (let i = 0; i < 8; i++) { const x = x0 + 8 + R() * (w - 16), y = y0 + h + .5 + R() * 4; s += `<path d="${blobPath(x, y, 2.4, 1.6, 6, .3, R, R() * 3)}" fill="${c}"/>`; }
      s += `<path d="${rrect(x0, y0, w, h, h / 2)}" fill="${shade(a, -.28)}"/><path d="${rrect(x0 + 1, y0 + 1, w - 2, h - 2.4, h / 2 - 1)}" fill="${a}"/><path d="${rrect(x0 + 1, y0 + 1, w - 2, h - 2.4, h / 2 - 1)}" fill="url(#gCyl)"/>`;
      const cuts = bag ? 5 : 3;
      for (let i = 0; i < cuts; i++) { const x = x0 + w * (i + .7) / (cuts + .4); s += `<g ${rot(x, y0 + h / 2, 26)}><ellipse cx="${f1(x)}" cy="${f1(y0 + h / 2)}" rx="${bag ? 6.6 : 8}" ry="2.4" fill="${shade(a, -.32)}"/><ellipse cx="${f1(x)}" cy="${f1(y0 + h / 2 + .3)}" rx="${bag ? 5.6 : 7}" ry="1.5" fill="${shade(a, .4)}"/></g>`; }
      return s + spec(x0 + w * .3, y0 + h * .28, w * .2, 1.6, -4, .45) + dotsIn(R, { x: x0 + 6, y: y0 + 3, w: w - 12, h: h * .5 }, 12, '#fff', .45, .5) + '</g>';
    }
    if (o.kind === 'pastry') {   // hojaldre
      let s = plateSVG() + `<g transform="rotate(${f1(-14 + R() * 8)} 50 50)">` + cast(52, 54, 26, 19, .55);
      for (let k = 3; k >= 0; k--) s += `<path d="${rrect(25 - k * .3, 32 + k * 1.1, 50, 34, 5)}" fill="${shade(a, -.12 - k * .05)}"/>`;
      s += `<path d="${rrect(25, 31, 50, 33, 5)}" fill="${a}"${fx('fGrain')}/><path d="${rrect(25, 31, 50, 33, 5)}" fill="url(#gDome)"/>`;
      s += `<path d="M35 40l8 8M45 37l10 10M57 40l8 8" stroke="${shade(a, -.3)}" stroke-width="2.2" stroke-linecap="round"/><path d="M35.6 40.6l6.8 6.8M45.6 37.6l8.8 8.8M57.6 40.6l6.8 6.8" stroke="${b}" stroke-width="1" stroke-linecap="round"/>`;
      return s + spec(36, 36, 8, 1.6, -10, .55) + '</g>';
    }
    return '';
  },

  /* Bowl de fruta y granola */
  sbowl(id, R, cols, o) {
    const cid = uid('bw');
    let s = bowlSVG(45, 38.5) + `<circle cx="50" cy="50" r="38" fill="${o.base}"/>`;
    s += `<path d="M24 46c8-10 22-12 30-4s18 6 24-2" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2.4" stroke-linecap="round"/>`;
    const stripes = (o.top || []).filter(x => !['chia', 'peanut', 'choc'].includes(x));
    s += `<clipPath id="${cid}"><circle cx="50" cy="50" r="37.5"/></clipPath><g clip-path="url(#${cid})"><g transform="rotate(-28 50 50)">`;
    stripes.forEach((tp, i) => {
      const x = 14 + i * 12.8;
      for (let y = 8; y < 94;) {
        const jx = x + (R() - .5) * 2.4;
        if (tp === 'banana') { s += cast(jx + .8, y + 1.2, 5.6, 5.4, .45) + `<circle cx="${f1(jx)}" cy="${y}" r="5.6" fill="#f3e1a0"/><circle cx="${f1(jx)}" cy="${y}" r="4.4" fill="#f8eec2"/>` + scatter(R, jx, y, 1.6, 5, (a2, b2) => `<circle cx="${f1(a2)}" cy="${f1(b2)}" r=".35" fill="#8a7a4a"/>`) + `<circle cx="${f1(jx)}" cy="${y}" r="5.6" fill="url(#gDome)" opacity=".6"/>`; y += 10; }
        else if (tp === 'mango') { s += chunkSVG(jx, y, 7.4, '#f6a226', R); y += 8; }
        else if (tp === 'strawberry') { const d = `M${f1(jx)} ${f1(y + 5.6)}c-6.6-4-6.6-11.2 0-10.2 6.6-1 6.6 6.2 0 10.2z`; s += `<path d="${d}" fill="#000" opacity=".2" transform="translate(.8 1.2)"/><path d="${d}" fill="#d42f3a"/><path d="M${f1(jx)} ${f1(y + 3.8)}c-4-2.8-4-7.4 0-6.8 4-.6 4 4 0 6.8z" fill="#f4848a"/>` + scatter(R, jx, y, 3.4, 6, (a2, b2) => `<ellipse cx="${f1(a2)}" cy="${f1(b2)}" rx=".35" ry=".55" fill="#f8e7a0"/>`) + `<path d="${d}" fill="url(#gDome)" opacity=".6"/>`; y += 10; }
        else if (tp === 'blueberry') { for (let k = 0; k < 2; k++) { const bx = jx + (k ? 3 : -3), by = y + (k ? 2.4 : 0); s += ball(bx, by, 2.9, '#2e3270') + `<path d="M${f1(bx - .8)} ${f1(by - .5)}l.8 .7.8-.7" fill="none" stroke="#1a1c48" stroke-width=".5"/>`; } y += 6.4; }
        else if (tp === 'granola') { s += `<path d="${blobPath(jx, y, 3.4, 2.6, 7, .35, R, R() * 3)}" fill="${R() < .5 ? '#c0884a' : '#a8723a'}"/><ellipse cx="${f1(jx + 1)}" cy="${f1(y - .6)}" rx="1.4" ry=".7" fill="#e8d0a0" ${rot(jx, y, R() * 180)}/>`; y += 4.4; }
        else if (tp === 'walnut') { const d = blobPath(jx, y, 4.2, 3.4, 8, .3, R, R() * 3); s += `<path d="${d}" fill="#000" opacity=".2" transform="translate(.6 .9)"/><path d="${d}" fill="#9a6a38"/><path d="M${f1(jx - 3)} ${f1(y)}q1.5 -2 3 0t3 0" fill="none" stroke="#6a4220" stroke-width=".7"/><path d="${d}" fill="url(#gSphere)" opacity=".7"/>`; y += 8.6; }
        else if (tp === 'cookie') { s += cast(jx + .8, y + 1.2, 5.2, 5, .4) + `<circle cx="${f1(jx)}" cy="${y}" r="5.2" fill="#c98a4a"/>` + scatter(R, jx, y, 3.4, 4, (a2, b2) => `<path d="${blobPath(a2, b2, .9, .8, 5, .3, R)}" fill="#3d2116"/>`) + `<circle cx="${f1(jx)}" cy="${y}" r="5.2" fill="url(#gSphere)" opacity=".7"/>`; y += 11.4; }
        else y += 10;
      }
    });
    s += '</g>';
    if (o.top.includes('chia')) s += scatter(R, 66, 54, 15, 46, (x, y) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx=".5" ry=".35" fill="#2a2420" ${rot(x, y, R() * 180)}/>`);
    if (o.top.includes('choc')) s += scatter(R, 66, 52, 15, 30, (x, y) => `<path d="M${f1(x)} ${f1(y)}l${f1(1 + R())} ${f1(.4 + R() * .6)}" stroke="#2a160c" stroke-width=".9" stroke-linecap="round"/>`);
    if (o.top.includes('peanut')) s += drizzle(R, 28, 72, 46, 3, 6, '#c68a4a', 2.2);
    return s + '</g>' + wallShade(50, 50, 38.5) + `<path d="${arc(50, 50, 43.4, 192, 288)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
  },

  /* Ensaladas */
  salad(id, R, cols, o) {
    let s = plateSVG();
    const G = ['#86b84f', '#6aa23a', '#a8cf6a', '#4f8a2a', '#9cc95a'];
    for (let i = 0; i < 18; i++) { const a = R() * 6.283, r = Math.sqrt(R()) * 22, x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r; s += cast(x + .8, y + 1.2, 9, 5, .25) + leafSVG(x, y, 9 + R() * 5, 4.6 + R() * 2.6, R() * 180, G[i % G.length]); }
    const b = { x: 32, y: 32, w: 36, h: 36 };
    (o.top || []).forEach(tp => {
      if (tp === 'chicken') for (let i = 0; i < 5; i++) { const x = b.x + R() * b.w, y = b.y + R() * b.h, a = R() * 180; s += `<g ${rot(x, y, a)}>${cast(x + .8, y + 1.2, 5, 2.4, .4)}<rect x="${f1(x - 5)}" y="${f1(y - 2.2)}" width="10" height="4.4" rx="2" fill="#e2b77e"/><path d="M${f1(x - 3)} ${f1(y - 2)}l-1 4M${f1(x)} ${f1(y - 2)}l-1 4M${f1(x + 3)} ${f1(y - 2)}l-1 4" stroke="#8a5a2a" stroke-width=".8" opacity=".7"/><rect x="${f1(x - 5)}" y="${f1(y - 2.2)}" width="10" height="4.4" rx="2" fill="url(#gCyl)" opacity=".7"/></g>`; }
      if (tp === 'crouton') for (let i = 0; i < 7; i++) s += chunkSVG(b.x + R() * b.w, b.y + R() * b.h, 5.2, '#d9a04e', R);
      if (tp === 'cheddar') for (let i = 0; i < 10; i++) { const x = b.x + R() * b.w, y = b.y + R() * b.h; s += `<path d="M${f1(x)} ${f1(y)}l${f1(3 + R() * 2)} ${f1(1 + R())}" stroke="#ec9a28" stroke-width="1.6" stroke-linecap="round"/>`; }
      if (tp === 'dressing') s += drizzle(R, 30, 50, 40, 3, 7, '#f4ecd6', 1.6);
      if (tp === 'balsamic') s += drizzle(R, 30, 56, 40, 3, 7, '#3a1a14', 1.3);
      if (tp === 'cheese') s += topping('cheese', R, b);
      if (tp === 'walnut') s += topping('walnut', R, b);
      if (tp === 'prune') for (let i = 0; i < 4; i++) { const x = b.x + R() * b.w, y = b.y + R() * b.h; s += `<path d="${blobPath(x, y, 3.2, 2.6, 7, .3, R)}" fill="#3a1a2e"/>` + spec(x - .8, y - .8, 1.2, .5, -20, .5); }
      if (tp === 'raisin') for (let i = 0; i < 10; i++) { const x = b.x + R() * b.w, y = b.y + R() * b.h; s += `<path d="${blobPath(x, y, 1.4, 1.1, 6, .35, R)}" fill="#4a2414"/>`; }
      if (tp === 'avocado') s += topping('avocado', R, { x: 34, y: 40, w: 32, h: 20 });
      if (tp === 'lemon') s += cast(73, 68, 8, 5, .4) + `<path d="M64 71a10 10 0 0 1 14-10z" fill="#e8c41e"/><path d="M65.8 69.4a7.5 7.5 0 0 1 10.6-7.4z" fill="#fbeea0"/><path d="M68 67.4l7-4M69.6 69l3.8-6" stroke="#f2d84a" stroke-width=".6"/>`;
    });
    return s;
  },

  /* Tablas de madera: jamón, lomo, queso, chicharrón… */
  board(id, R, cols, o) {
    const [a, b, c] = cols;
    let s = `<g transform="rotate(-12 50 50)">` + cast(52, 54, 46, 31, .7) + `<path d="${rrect(5, 22, 82, 56, 9)}" style="fill:var(--wood)"/><path d="${rrect(84, 42, 14, 16, 6)}" style="fill:var(--wood)"/><circle cx="92" cy="50" r="2.4" fill="#000" opacity=".35"/>`;
    for (let i = 0; i < 7; i++) { const y = 26 + i * 8 + R() * 3; s += `<path d="M9 ${f1(y)}c16 ${f1(-2 + R() * 4)} 40 ${f1(-2 + R() * 4)} 76 ${f1(-1 + R() * 2)}" fill="none" style="stroke:var(--wood-2)" stroke-width="${f1(.5 + R() * .6)}" opacity=".5"/>`; }
    s += `<path d="${rrect(5, 22, 82, 56, 9)}" fill="url(#gDome)" opacity=".35"/><path d="M10 23.4h72" stroke="#fff" stroke-opacity=".35" stroke-width="1"/></g>`;
    const hamSlice = (x, y, i) => { const d = blobPath(x, y, 6, 13, 9, .18, R, -.5 + R() * .3); return cast(x + 1, y + 1.6, 6, 12, .35) + `<path d="${d}" fill="${i % 2 ? shade(a, .07) : a}"/><path d="M${f1(x - 3)} ${f1(y - 9)}q2.6 7 -.6 16M${f1(x + 1.5)} ${f1(y - 5)}q1.4 4 -.4 9" fill="none" stroke="${b}" stroke-width="1.4" stroke-linecap="round" opacity=".9"/><path d="${d}" fill="url(#gDome)" opacity=".7"/>`; };
    const round = (x, y, r, col, rim, dots) => cast(x + 1, y + 1.5, r, r * .95, .4) + `<circle cx="${x}" cy="${y}" r="${r}" fill="${rim}"/><circle cx="${x}" cy="${y}" r="${f1(r * .84)}" fill="${col}"/>` + (dots ? scatter(R, x, y, r * .7, 7, (a2, b2) => `<circle cx="${f1(a2)}" cy="${f1(b2)}" r="${f1(.5 + R() * .5)}" fill="${dots}"/>`) : `<path d="M${f1(x - r * .4)} ${f1(y)}q${f1(r * .4)} ${f1(-r * .3)} ${f1(r * .8)} 0" fill="none" stroke="${rim}" stroke-width=".8" opacity=".7"/>`) + `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gDome)" opacity=".7"/>`;
    const wedge = (x, y, r, i, col) => { const gid = uid('qs'); return `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(col, .2)}"/><stop offset="1" stop-color="${col}"/></linearGradient></defs><g transform="translate(${x} ${y}) rotate(${r})">${cast(1, 2, 9, 9, .4)}<path d="M-9.5 7L0 -11L9.5 7Z" fill="url(#${gid})"/><path d="M-9.5 7H9.5" stroke="#b07a2a" stroke-width="2.6" stroke-linecap="round"/><circle cx="-2" cy="1" r="1" fill="${shade(col, -.15)}"/><circle cx="2.6" cy="-3" r=".7" fill="${shade(col, -.15)}"/></g>`; };
    const k = o.kind;
    if (k === 'slices') for (let i = 0; i < 7; i++) s += hamSlice(20 + i * 8.6 + R() * 2, 49 + (R() - .5) * 8, i);
    else if (k === 'rounds') [[24, 44], [38, 55], [52, 43], [66, 54], [32, 66], [60, 32], [74, 40]].forEach(([x, y]) => { s += round(x, y, 8, a, b); });
    else if (k === 'wedges') [[26, 42, -20], [44, 56, 10], [60, 40, 35], [74, 58, -5], [34, 63, 60], [56, 64, -40]].forEach(([x, y, r], i) => { s += wedge(x, y, r, i, a); });
    else if (k === 'squares') {
      for (let i = 0; i < 8; i++) { const x = 20 + (i % 4) * 14.5 + R() * 2, y = 38 + ((i / 4) | 0) * 15 + R() * 2; s += `<g ${rot(x + 6, y + 6, -8 + R() * 16)}>${cast(x + 7, y + 7.4, 7, 6.4, .35)}<rect x="${f1(x)}" y="${f1(y)}" width="13" height="12" rx="2" fill="${a}"/><rect x="${f1(x)}" y="${f1(y + 3)}" width="13" height="2.6" fill="${b}"/><rect x="${f1(x)}" y="${f1(y + 8)}" width="13" height="1.8" fill="${b}"/><rect x="${f1(x)}" y="${f1(y)}" width="13" height="1.6" rx=".8" fill="#c08a5a"/><rect x="${f1(x)}" y="${f1(y)}" width="13" height="12" rx="2" fill="url(#gDome)" opacity=".6"/></g>`; }
      s += dotsIn(R, { x: 20, y: 36, w: 60, h: 30 }, 16, '#fff', .5, .9) + cast(77, 69, 8, 5, .4) + `<path d="M70 72a10 10 0 0 1 14-10z" fill="#e8c41e"/><path d="M71.8 70.4a7.5 7.5 0 0 1 10.6-7.4z" fill="#fbeea0"/>`;
    }
    else if (k === 'mixed') { for (let i = 0; i < 4; i++) s += hamSlice(18 + i * 8, 48 + (R() - .5) * 8, i); s += round(56, 38, 7.4, '#8a2626', '#f3dccf') + round(70, 46, 7.4, '#b8302a', '#d84a3a', '#f3dccf') + round(60, 58, 7.4, '#7a2232', '#a83a4a', '#f6e6e0') + wedge(76, 64, 20, 0, c); }
    else if (k === 'mechada') [[26, 46], [40, 56], [54, 44], [68, 55]].forEach(([x, y]) => { s += round(x, y, 9, '#b07a5a', '#6e3a1e', null) + `<circle cx="${x + 1}" cy="${y - 1}" r="2" fill="#c8402c"/><circle cx="${x - 2.4}" cy="${y + 2}" r="1.4" fill="#5f8f3a"/>`; });
    return s;
  },

  /* Platos con salsa, guisos y gratinados */
  plate(id, R, cols, o) {
    const [a, b, c] = cols || ['#e8c27a', '#d9a43a', '#c9a23a'];
    let s = plateSVG();
    if (o.mound) {   // ensaladilla
      const d = blobPath(50, 50, 23, 20, 12, .1, R);
      s += cast(52, 53, 24, 21, .55) + `<path d="${d}" fill="${a}"/>` + scatter(R, 50, 50, 17, 26, (x, y) => `<path d="${arc(x, y, 1.6 + R() * 1.6, 200, 340)}" fill="none" stroke="#fff" stroke-width=".8" opacity=".6"/>`) +
        `<path d="${d}" fill="url(#gSphere)"/>` + scatter(R, 50, 48, 12, 8, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r=".9" fill="${HERB}"/>`);
      for (let i = 0; i < 4; i++) { const g = .6 + i * .5, x = 50 + Math.cos(g) * 30, y = 50 + Math.sin(g) * 30; s += `<g ${rot(x, y, g * 57.3 + 90)}>${cast(x + .8, y + 1.2, 7, 2, .4)}<rect x="${f1(x - 7)}" y="${f1(y - 1.7)}" width="14" height="3.4" rx="1.7" fill="#e3b46a"/><rect x="${f1(x - 7)}" y="${f1(y - 1.7)}" width="14" height="3.4" rx="1.7" fill="url(#gCyl)"/></g>`; }
      return s;
    }
    if (o.rounds) {   // rulo de cabra gratinado
      s += drizzle(R, 26, 72, 46, 3, 6, b, 2.2);
      [[38, 42], [62, 42], [50, 62]].forEach(([x, y]) => { s += cast(x + 1.4, y + 2.2, 11, 10.6, .5) + `<circle cx="${x}" cy="${y}" r="11" fill="#efe9dc"/><circle cx="${x}" cy="${y}" r="9.4" fill="${a}"/><path d="${blobPath(x, y, 7.4, 6.6, 9, .25, R)}" fill="${c}" opacity=".8"/><path d="${blobPath(x - 1, y - 1, 4, 3, 7, .3, R)}" fill="${shade(c, -.25)}" opacity=".6"/><circle cx="${x}" cy="${y}" r="11" fill="url(#gDome)" opacity=".6"/>`; });
      return s + herbs(R, 50, 50, 26, 6);
    }
    // por defecto: pollo en salsa de mostaza
    s += `<path d="${blobPath(50, 50, 30, 27, 12, .08, R)}" fill="${b}"/><path d="${blobPath(50, 50, 30, 27, 12, .08, R)}" fill="url(#gDome)" opacity=".8"/>` + scatter(R, 50, 50, 24, 40, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r=".55" fill="#a8741e" opacity=".8"/>`);
    for (let i = 0; i < 6; i++) { const g = i / 6 * 6.283 + R() * .4, r = 6 + R() * 10, x = 50 + Math.cos(g) * r, y = 50 + Math.sin(g) * r, d = blobPath(x, y, 6.4, 5, 8, .2, R, R() * 3); s += cast(x + 1, y + 1.5, 6.4, 5, .4) + `<path d="${d}" fill="${a}"/><path d="${d}" fill="url(#gSphere)"/>`; }
    return s + herbs(R, 50, 50, 22, 8);
  },
  bowl(id, R, cols, o) {
    const [a, b, c] = cols, gid = uid('sp');
    let s = `<defs>${liquidGrad(gid, a, shade(a, .2))}</defs>` + bowlSVG(45, 37, 50, 50, !!o.chunks) + `<circle cx="50" cy="50" r="36" fill="url(#${gid})"/>`;
    if (o.chunks) {   // carne con tomate en cazuela
      for (let i = 0; i < 12; i++) { const g = R() * 6.283, r = Math.sqrt(R()) * 24, x = 50 + Math.cos(g) * r, y = 50 + Math.sin(g) * r, d = blobPath(x, y, 5, 4, 7, .25, R, R() * 3); s += `<path d="${d}" fill="${b}"/><path d="${d}" fill="url(#gSphere)"/>`; }
      s += herbs(R, 50, 50, 22, 7);
    } else {   // salmorejo con huevo, jamón y aceite
      s += `<path d="${arc(50, 50, 22, 200, 330)}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>`;
      for (let i = 0; i < 6; i++) { const x = 40 + R() * 20, y = 40 + R() * 20; s += chunkSVG(x, y, 3.8, i % 3 ? c : '#f2c14e', R); }
      for (let i = 0; i < 6; i++) { const x = 38 + R() * 24, y = 38 + R() * 24; s += `<path d="${blobPath(x, y, 2.4, 1.6, 6, .3, R, R() * 3)}" fill="${b}"/>`; }
      s += drizzle(R, 30, 60, 26, 2, 4, '#d9b62a', 1.2);
    }
    return s + wallShade(50, 50, 37) + `<path d="${arc(50, 50, 43.5, 192, 288)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>`;
  },
  pieces(id, R, cols, o) {
    const [a, b, c] = cols;
    if (o.shape === 'snail') {
      const gid = uid('cl');
      let s = `<defs>${liquidGrad(gid, '#b8862e', '#e0b860')}</defs>` + bowlSVG(45, 37) + `<circle cx="50" cy="50" r="36" fill="url(#${gid})" opacity=".95"/>`;
      for (let i = 0; i < 16; i++) {
        const g = R() * 6.283, r = Math.sqrt(R()) * 25, x = 50 + Math.cos(g) * r, y = 50 + Math.sin(g) * r, z = 3.8 + R() * 1.2;
        s += `<circle cx="${f1(x + .6)}" cy="${f1(y + .9)}" r="${f1(z)}" fill="#000" opacity=".25"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(z)}" fill="${a}"/>` +
          `<path d="M${f1(x)} ${f1(y)}m${f1(-z * .62)} 0a${f1(z * .62)} ${f1(z * .62)} 0 1 1 ${f1(z * .62)} ${f1(z * .62)}a${f1(z * .32)} ${f1(z * .32)} 0 1 1 ${f1(-z * .32)} ${f1(-z * .32)}" fill="none" stroke="${b}" stroke-width=".9"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(z)}" fill="url(#gSphere)"/>`;
      }
      return s + herbs(R, 50, 50, 26, 9, ['#3f8a3a', '#5aa24a']) + wallShade(50, 50, 37);
    }
    if (o.shape === 'nacho') {
      let s = plateSVG();
      for (let i = 0; i < 14; i++) { const g = R() * 6.283, r = Math.sqrt(R()) * 22, x = 50 + Math.cos(g) * r, y = 50 + Math.sin(g) * r, d = `M${f1(x)} ${f1(y - 8.5)}L${f1(x + 7.5)} ${f1(y + 5.5)}L${f1(x - 7.5)} ${f1(y + 5.5)}Z`; s += `<g ${rot(x, y, R() * 360)}><path d="${d}" fill="#000" opacity=".18" transform="translate(.8 1.2)"/><path d="${d}" fill="${i % 3 ? a : shade(a, -.08)}" stroke="${shade(a, -.2)}" stroke-width=".6" stroke-linejoin="round"/>${dotsIn(R, { x: x - 4, y: y - 3, w: 8, h: 7 }, 3, shade(a, -.3), .6, .6)}<path d="${d}" fill="url(#gDome)" opacity=".5"/></g>`; }
      return s + `<path d="M26 46c10 9 16-6 25 2s14-4 23 4" fill="none" stroke="${shade(b, -.15)}" stroke-width="6" stroke-linecap="round"/><path d="M26 46c10 9 16-6 25 2s14-4 23 4" fill="none" stroke="${b}" stroke-width="4.4" stroke-linecap="round"/><path d="M27 45c10 9 16-6 25 2" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".5"/>` + herbs(R, 50, 50, 20, 6);
    }
    return plateSVG();
  },
  tomatoes(id, R) {
    let s = plateSVG();
    for (let i = 0; i < 6; i++) {
      const g = i / 6 * 6.283 + R() * .3, x = 50 + Math.cos(g) * 15, y = 50 + Math.sin(g) * 15, r = 11.4;
      s += cast(x + 1.2, y + 1.8, r, r * .95, .4) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="#c4301e"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r - 1.8)}" fill="#e2563c"/>`;
      for (let k = 0; k < 4; k++) { const q = k * 1.571 + R(), ex = x + Math.cos(q) * 4.8, ey = y + Math.sin(q) * 4.8; s += `<ellipse cx="${f1(ex)}" cy="${f1(ey)}" rx="2.8" ry="1.8" fill="#f2a54a" opacity=".85" ${rot(ex, ey, q * 57.3)}/><circle cx="${f1(ex)}" cy="${f1(ey)}" r=".6" fill="#f6dc8a"/>`; }
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="url(#gDome)" opacity=".55"/>`;
    }
    s += `<circle cx="50" cy="50" r="7.4" fill="none" stroke="#f3e2ef" stroke-width="2.2"/><circle cx="50" cy="50" r="4.2" fill="none" stroke="#e9cfe4" stroke-width="1.8"/>`;
    return s + herbs(R, 50, 50, 24, 12) + scatter(R, 50, 50, 26, 12, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.6 + R() * .8)}" fill="#d9b62a" opacity=".55"/>`) + scatter(R, 50, 50, 24, 10, (x, y) => `<rect x="${f1(x)}" y="${f1(y)}" width=".9" height=".9" fill="#fff" opacity=".9" ${rot(x, y, 45)}/>`);
  },
  gratin(id, R, cols) {
    const [a, b] = cols;
    let s = `<g transform="rotate(${f1(-10 + R() * 6)} 50 50)">` + cast(52, 54, 40, 32, .7) + `<path d="${rrect(10, 20, 80, 60, 11)}" style="fill:var(--plate)"/><path d="${rrect(10, 20, 80, 60, 11)}" fill="url(#gPlateRim)"/>` +
      `<path d="${rrect(17, 27, 66, 46, 6)}" fill="${b}"/><path d="${blobPath(50, 50, 31, 21, 14, .05, R)}" fill="${a}"${fx('fGrain')}/>`;
    for (let i = 0; i < 16; i++) s += `<path d="${blobPath(21 + R() * 58, 31 + R() * 38, 2.4 + R() * 2.6, 1.8 + R() * 1.8, 6, .3, R)}" fill="${shade(a, -.32)}" opacity="${f1(.5 + R() * .4)}"/>`;
    s += scatter(R, 50, 50, 22, 10, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.8 + R())}" fill="#fff" opacity=".35"/>`);
    return s + `<path d="${rrect(17, 27, 66, 46, 6)}" fill="url(#gRimIn)" opacity=".9"/>` + herbs(R, 50, 50, 16, 5) + '</g>';
  },
  skewer(id, R, cols) {
    const [a, b, c] = cols;
    let s = plateSVG();
    for (let k = 0; k < 2; k++) {
      s += `<g transform="rotate(-35 50 50) translate(0 ${k ? 10 : -10})"><path d="M10 50H90" stroke="#000" stroke-opacity=".2" stroke-width="2" transform="translate(.6 1)"/><path d="M10 50H90" stroke="#c9a46a" stroke-width="1.8" stroke-linecap="round"/>`;
      for (let i = 0; i < 5; i++) {
        const x = 21 + i * 13.5;
        if (i % 2) s += cast(x + 1, 51.4, 4.4, 5.6, .35) + `<rect x="${x - 4.2}" y="44.4" width="8.4" height="11.2" rx="2.6" fill="${b}"/><rect x="${x - 4.2}" y="44.4" width="8.4" height="11.2" rx="2.6" fill="url(#gSphere)"/><rect x="${x - 1}" y="44.4" width="2" height="11.2" fill="${c}" opacity=".7"/>`;
        else { const d = blobPath(x, 50, 6.6, 6.4, 8, .12, R); s += cast(x + 1, 51.6, 6.6, 6.2, .4) + `<path d="${d}" fill="${a}"/><path d="M${x - 4} 46l7 6M${x - 2} 44.6l6 5" stroke="#5a2a10" stroke-width="1.4" stroke-linecap="round" opacity=".55"/><path d="${d}" fill="url(#gSphere)"/>`; }
      }
      s += '</g>';
    }
    return s + scatter(R, 50, 50, 26, 10, (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r=".7" fill="#b8302a" opacity=".7"/>`);
  },
  slice(id, R, cols, o) {   // tortilla en salsa
    const [a, b, c] = cols;
    let s = plateSVG();
    if (o.sauce) s += `<path d="${blobPath(50, 52, 30, 26, 12, .1, R)}" fill="${c}"/><path d="${blobPath(50, 52, 30, 26, 12, .1, R)}" fill="url(#gDome)" opacity=".7"/>`;
    s += `<g transform="rotate(${f1(-20 + R() * 30)} 50 50)">` + cast(52, 52, 18, 20, .5) + `<path d="M50 74L27 31A44 44 0 0 1 73 31Z" fill="${shade(a, -.2)}"/><path d="M50 70L30 33.5A39 39 0 0 1 70 33.5Z" fill="${b}"${fx('fGrain')}/>`;
    s += scatter(R, 50, 44, 14, 12, (x, y) => `<path d="${blobPath(x, y, 2.6, 1.6, 6, .3, R, R() * 3)}" fill="#e8c46a" opacity=".8"/>`) + `<path d="M50 70L30 33.5A39 39 0 0 1 70 33.5Z" fill="url(#gDome)" opacity=".7"/></g>`;
    return s + herbs(R, 50, 50, 26, 6);
  }
});
