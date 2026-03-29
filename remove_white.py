"""
Aggressive white background remover:
1. Uses rembg AI model for main removal
2. Pillow ImageDraw flood-fill from all 4 corners to kill any remaining white
3. A final pixel-level scan to remove near-white semi-transparent fringe
"""
import os
from PIL import Image
from rembg import remove

GARMENTS_DIR = r"c:\Users\dines\Desktop\epics\Epics-\frontend\public\garments"

def aggressive_remove(img):
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    def is_near_white(r, g, b, a, threshold=230):
        return r >= threshold and g >= threshold and b >= threshold

    def flood_fill_transparent(start_x, start_y):
        """BFS flood fill from a corner, making near-white pixels transparent."""
        visited = set()
        queue = [(start_x, start_y)]
        while queue:
            x, y = queue.pop()
            if (x, y) in visited:
                continue
            if x < 0 or x >= width or y < 0 or y >= height:
                continue
            r, g, b, a = pixels[x, y]
            if (x, y) in visited or not is_near_white(r, g, b, a):
                visited.add((x, y))
                continue
            visited.add((x, y))
            pixels[x, y] = (r, g, b, 0)
            queue.extend([(x+1, y), (x-1, y), (x, y+1), (x, y-1)])

    # Flood fill from all 4 corners
    flood_fill_transparent(0, 0)
    flood_fill_transparent(width-1, 0)
    flood_fill_transparent(0, height-1)
    flood_fill_transparent(width-1, height-1)

    # Final pass: kill any remaining near-white semi-transparent pixel
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if is_near_white(r, g, b, a, threshold=235) and a < 255:
                pixels[x, y] = (r, g, b, 0)

    return img


def process(filename):
    input_path  = os.path.join(GARMENTS_DIR, filename)
    backup_path = os.path.join(GARMENTS_DIR, "backup_" + filename)
    source_path = backup_path if os.path.exists(backup_path) else input_path

    print(f"Processing {filename}...")
    raw = Image.open(source_path).convert("RGBA")

    # Step 1: rembg AI removal
    print("  Running AI model...")
    ai_result = remove(raw)

    # Step 2: Aggressive corner flood fill + fringe cleanup
    print("  Cleaning up edges...")
    final = aggressive_remove(ai_result)

    final.save(input_path, "PNG")
    print(f"  [OK] Done: {filename}")


if __name__ == "__main__":
    for f in sorted(os.listdir(GARMENTS_DIR)):
        if f.endswith(".png") and not f.startswith("backup_"):
            process(f)
    print("\nAll garments processed successfully!")
