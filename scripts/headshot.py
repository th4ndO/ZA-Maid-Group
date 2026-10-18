"""Crop a photo to a square, shoulder-width headshot so every team photo matches.

Usage: python3 scripts/headshot.py IN OUT EYE_X EYE_Y FACE_W
  EYE_X, EYE_Y  point between the eyes, in pixels of the original
  FACE_W        face width (cheek to cheek), in pixels of the original
Every face ends up 40% of the frame wide with the eyes 42% down, so heads and
shoulders line up across the team grid.
"""
import sys
from PIL import Image

FACE_SHARE, EYE_LINE, SIZE = 0.40, 0.42, 640

src, out = sys.argv[1], sys.argv[2]
ex, ey, fw = (float(v) for v in sys.argv[3:6])
im = Image.open(src).convert("RGB")  # also drops EXIF (location etc.)
side = min(fw / FACE_SHARE, im.width, im.height)
left = min(max(ex - side / 2, 0), im.width - side)
top = min(max(ey - side * EYE_LINE, 0), im.height - side)
crop = im.crop((round(left), round(top), round(left + side), round(top + side)))
if side < SIZE:
    print(f"warning: only {round(side)}px of real detail; it will look soft when enlarged")
crop.resize((SIZE, SIZE), Image.LANCZOS).save(out, quality=86, optimize=True, progressive=True)
print(out, f"from a {round(side)}px square at ({round(left)},{round(top)})")
