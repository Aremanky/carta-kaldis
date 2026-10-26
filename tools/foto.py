#!/usr/bin/env python3
"""Prepara una foto de producto para la carta.

   python3 tools/foto.py ORIGEN ID x0 y0 x1 y1 [tx0 ty0 tx1 ty1] [--brillo 1.0] [--contraste 1.06] [--color 1.06] [--calidez 0]

   - ORIGEN: foto tal cual la manda el cliente (jpg/png/heic convertido)
   - ID: id del producto en data.js / data2.js (p. ej. cafe, churros, choco-taza)
   - x0 y0 x1 y1: recorte cuadrado para la ficha (en píxeles de la foto original)
   - tx0 ty0 tx1 ty1: recorte más cerrado para la miniatura redonda (si no se da, se usa el mismo)
   Escribe fotos/ID.webp (ficha, 640 px) y fotos/ID-t.webp (miniatura, 256 px).
   Después, en data/carta.json, pon "foto": "ID" en ese producto.
   Necesita Python 3 y Pillow (pip install pillow).
"""
import argparse, pathlib
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('id'); ap.add_argument('box', type=int, nargs='+')
ap.add_argument('--brillo', type=float, default=1.0); ap.add_argument('--contraste', type=float, default=1.06)
ap.add_argument('--color', type=float, default=1.06); ap.add_argument('--calidez', type=float, default=0.0)
ap.add_argument('--out', default=str(ROOT / 'fotos'))
a = ap.parse_args()
assert len(a.box) in (4, 8), 'recorte: 4 números (ficha) u 8 (ficha + miniatura)'
big, small = a.box[:4], (a.box[4:] or a.box[:4])

im = ImageOps.exif_transpose(Image.open(a.src)).convert('RGB')

def ajustar(img):
    img = ImageEnhance.Brightness(img).enhance(a.brillo)
    img = ImageEnhance.Contrast(img).enhance(a.contraste)
    img = ImageEnhance.Color(img).enhance(a.color)
    if a.calidez:                                   # >0 más cálida, <0 más fría
        r, g, b = img.split(); k = a.calidez
        r = r.point(lambda v: min(255, int(v * (1 + .06 * k)))); b = b.point(lambda v: min(255, int(v * (1 - .06 * k))))
        img = Image.merge('RGB', (r, g, b))
    return img

def cuadrado(box, size, sharpen):
    x0, y0, x1, y1 = box; side = min(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    x0, y0 = max(0, round(cx - side / 2)), max(0, round(cy - side / 2))
    x0, y0 = min(x0, im.width - side), min(y0, im.height - side)
    img = ajustar(im.crop((x0, y0, x0 + side, y0 + side))).resize((size, size), Image.LANCZOS)
    return img.filter(ImageFilter.UnsharpMask(radius=sharpen[0], percent=sharpen[1], threshold=2))

out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
cuadrado(big, 640, (1.4, 70)).save(out / f'{a.id}.webp', 'WEBP', quality=80, method=6)
cuadrado(small, 256, (0.8, 55)).save(out / f'{a.id}-t.webp', 'WEBP', quality=82, method=6)
for f in (f'{a.id}.webp', f'{a.id}-t.webp'):
    print(f, (out / f).stat().st_size // 1024, 'KB')
print(f'Ahora pon "foto": "{a.id}" en ese producto de data/carta.json')
