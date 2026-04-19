"""
Remove dark/black background from sticker images by flood-filling from all
edges. Pixels connected to the border that are within `tolerance` of the
sampled corner colour are made transparent.
"""

from pathlib import Path
from PIL import Image
import collections

STICKERS_DIR = Path(__file__).parent / "stickers"
TOLERANCE = 40  # colour distance threshold (0-255)


def colour_distance(c1, c2):
    return max(abs(a - b) for a, b in zip(c1[:3], c2[:3]))


def remove_background(path: Path, tolerance: int = TOLERANCE) -> None:
    img = Image.open(path).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    # Sample background colour from the four corners
    corners = [pixels[0, 0], pixels[w - 1, 0], pixels[0, h - 1], pixels[w - 1, h - 1]]
    bg_colour = corners[0]  # top-left is usually clean background

    # BFS flood-fill from every edge pixel
    visited = set()
    queue = collections.deque()

    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        if x < 0 or x >= w or y < 0 or y >= h:
            continue
        px = pixels[x, y]
        if colour_distance(px, bg_colour) > tolerance:
            continue
        visited.add((x, y))
        pixels[x, y] = (px[0], px[1], px[2], 0)  # make transparent
        queue.append((x + 1, y))
        queue.append((x - 1, y))
        queue.append((x, y + 1))
        queue.append((x, y - 1))

    # Crop to the bounding box of non-transparent pixels so all images
    # have the same visual density when rendered at the same CSS width.
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(path)
    print(f"  done: {path.name}")


if __name__ == "__main__":
    pngs = sorted(STICKERS_DIR.glob("sticker_*.png"))
    if not pngs:
        print("No sticker PNGs found.")
    else:
        print(f"Processing {len(pngs)} sticker(s)...")
        for p in pngs:
            remove_background(p)
        print("Done.")
