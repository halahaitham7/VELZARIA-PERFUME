"""
Builds the website's photography from the VÉLZARIA collection image.

Source:  public/images/campaign/velzaria-collection-original.webp  (1536 x 1024)

Rule for every crop: each bottle that appears is shown COMPLETE — cap to
pedestal — and nothing of the printed labels (y > 855) or of the logo /
tagline at the top is included. Bottles are never stretched; the site shows
every image at its natural aspect ratio (see src/data/images.js).

Output
  public/images/campaign/hero.webp                  full campaign line-up
  public/images/products/<id>-bottle.webp           packshot, 4:5, softened background
  public/images/products/<id>-tight.webp            the bottle in its natural setting, tall
  public/images/editorial/<name>.webp               duos and trios of complete bottles
  src/data/images.js                                manifest (paths + exact sizes)

Upgrading: drop real studio photographs over any of these files (keep the
same name and roughly the same aspect ratio) and update the sizes in
src/data/images.js — or re-run this script on a higher-resolution source.

Run:  python scripts/make-product-images.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public/images/campaign/velzaria-collection-original.webp'
PUB = ROOT / 'public'
MANIFEST = ROOT / 'src/data/images.js'

BOTTOM = 852        # just above the printed name labels
TEXT_FREE_TOP = 232 # below the tagline — required for any crop that overlaps x 500–1030

# Measured bottle bounds in the source (x range includes the pedestal).
BOTTLES = {
    'sovereign': dict(x0=66, x1=362, top=172, cx=212),
    'romantic': dict(x0=378, x1=612, top=298, cx=495),
    'conqueror': dict(x0=650, x1=906, top=256, cx=778),
    'artist': dict(x0=936, x1=1182, top=284, cx=1058),
    'spark': dict(x0=1226, x1=1495, top=308, cx=1360),
}

# Editorial compositions: (x0, x1, top). Each includes only complete bottles.
EDITORIAL = {
    'duo-romantic-conqueror': (368, 930, TEXT_FREE_TOP),
    'duo-conqueror-artist': (624, 1212, TEXT_FREE_TOP),
    'duo-artist-spark': (916, 1532, TEXT_FREE_TOP),
    'trio-romantic-conqueror-artist': (368, 1212, TEXT_FREE_TOP),
    'trio-conqueror-artist-spark': (624, 1532, TEXT_FREE_TOP),
}

PACK_W, PACK_H = 720, 900
TIGHT_RATIO = 0.46  # width / height
PAD = 400
manifest = {'campaign': {}, 'products': {}, 'editorial': {}}


def save(img, rel, q=88):
    path = PUB / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'WEBP', quality=q, method=6)
    print(f'  public/{rel}  {img.size[0]}x{img.size[1]}')
    return {'src': '/' + rel.replace('\\', '/'), 'w': img.size[0], 'h': img.size[1]}


def scale_to(img, max_w=None, max_h=None, factor=1.5):
    w, h = img.size
    f = factor
    if max_w:
        f = min(f, max_w / w)
    if max_h:
        f = min(f, max_h / h)
    return img.resize((round(w * f), round(h * f)), Image.LANCZOS)


def check_inside(box, b, name):
    x0, y0, x1, y1 = box
    assert x0 <= b['x0'] - 6 and x1 >= b['x1'] + 6 and y0 <= b['top'] - 10 and y1 <= BOTTOM, f'{name}: bottle would be cut by {box}'


def packshot(padded, pid, b):
    """Sharp bottle; the surroundings softly defocused like a shallow depth-of-field studio shot."""
    top = min(b['top'] - 44, 250) if pid != 'sovereign' else 132
    top = max(top, TEXT_FREE_TOP if 500 < b['cx'] < 1030 else 0)
    h = BOTTOM - top
    w = round(h * PACK_W / PACK_H)
    cx = b['cx'] + PAD
    box = (cx - w // 2, top, cx - w // 2 + w, BOTTOM)
    check_inside((box[0] - PAD, top, box[2] - PAD, BOTTOM), b, pid)
    region = padded.crop(box)
    soft = region.filter(ImageFilter.GaussianBlur(38))
    soft = Image.blend(soft, Image.new('RGB', soft.size, (70, 52, 45)), 0.18)
    x = np.arange(w)
    half = (b['x1'] - b['x0']) / 2 + 10
    left, right = w / 2 - half, w / 2 + half
    ramp = 56
    m = np.clip((x - (left - ramp)) / ramp, 0, 1) * np.clip(((right + ramp) - x) / ramp, 0, 1)
    mask = Image.fromarray((np.tile(m, (h, 1)) * 255).astype('uint8'))
    return Image.composite(region, soft, mask).resize((PACK_W, PACK_H), Image.LANCZOS)


def tight(im, pid, b):
    """The bottle exactly as photographed, no retouching, tall frame."""
    top = b['top'] - 26
    if 500 < b['cx'] < 1030:
        top = max(top, TEXT_FREE_TOP)
    # Same ratio for all five so they line up; a wide bottle gets more headroom instead.
    h = max(BOTTOM - top, round((b['x1'] - b['x0'] + 16) / TIGHT_RATIO))
    top = BOTTOM - h
    w = round(h * TIGHT_RATIO)
    x0 = round(b['cx'] - w / 2)
    box = (x0, top, x0 + w, BOTTOM)
    check_inside(box, b, f'{pid}-tight')
    out = im.crop(box)
    return out.resize((460, 1000), Image.LANCZOS)


def main():
    im = Image.open(SRC).convert('RGB')
    padded = Image.fromarray(np.pad(np.asarray(im), ((0, 0), (PAD, PAD), (0, 0)), mode='edge'))
    print('Building photography from', SRC.relative_to(ROOT))

    manifest['campaign']['hero'] = save(im.crop((0, 0, im.width, BOTTOM)), 'images/campaign/hero.webp', q=90)
    for pid, b in BOTTLES.items():
        manifest['products'][pid] = {
            'bottle': save(packshot(padded, pid, b), f'images/products/{pid}-bottle.webp'),
            'tight': save(tight(im, pid, b), f'images/products/{pid}-tight.webp'),
        }
    for name, (x0, x1, top) in EDITORIAL.items():
        box = (x0, top, x1, BOTTOM)
        for pid, b in BOTTLES.items():
            if b['x0'] < x1 and b['x1'] > x0:
                check_inside(box, b, name)
        manifest['editorial'][name] = save(scale_to(im.crop(box), max_w=1400), f'images/editorial/{name}.webp')

    MANIFEST.write_text(
        '// Generated by scripts/make-product-images.py — exact image sizes so nothing is ever stretched.\n'
        f'export const IMAGES = {json.dumps(manifest, indent=2)};\n',
        encoding='utf-8',
    )
    print('  src/data/images.js')


if __name__ == '__main__':
    main()
