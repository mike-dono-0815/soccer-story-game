"""
Generate Panini-style sticker album portraits for The Gaffer characters.
Run from the soccer-story-game directory.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "gemini-api"))
from generate_image import generate_image  # noqa: E402

STICKER_TEMPLATE = """\
Edit this soccer sticker image. Keep the exact same sticker layout, frame style, background, typography style, badge/flag placement, and overall Panini-album look — only change the character content:

- Replace the animal character with a {animal}, shown from the chest up, facing slightly toward the camera
- Change the name label to: {name}
- Change the national flag to the flag of: {country}
- Change the role/position label to: {role}
- Change the jersey color to: {jersey_color}

Do not alter the sticker border, the layout structure, the font style, or the background gradient. The result should look like a different player card printed in the same sticker album series.
"""

CHARACTERS = {
    "chairman": {
        "animal": "Bull",
        "name": "Paulo Ferretti",
        "role": "Club Chairman",
        "country": "Italy",
        "jersey_color": "Crimson Red",
    },
    "assistant": {
        "animal": "Border Collie",
        "name": "Lena Brandt",
        "role": "Assistant Coach",
        "country": "Germany",
        "jersey_color": "Emerald Green",
    },
    "star": {
        "animal": "Cheetah",
        "name": 'Marco "El Tornado" Silva',
        "role": "Star Forward",
        "country": "Brazil",
        "jersey_color": "Golden Yellow",
    },
    "veteran": {
        "animal": "Elephant",
        "name": "Roberto Okafor",
        "role": "Club Veteran",
        "country": "Nigeria",
        "jersey_color": "Royal Blue",
    },
    "prodigy": {
        "animal": "Fox",
        "name": "Kai Voss",
        "role": "Youth Prodigy",
        "country": "Netherlands",
        "jersey_color": "Violet Purple",
    },
    "rival": {
        "animal": "Wolf",
        "name": "Ivan Sorokin",
        "role": "Rival Manager",
        "country": "Russia",
        "jersey_color": "Slate Grey",
    },
    "journalist": {
        "animal": "Owl",
        "name": "Alexandra Chen",
        "role": "Sports Reporter",
        "country": "Hong Kong",
        "jersey_color": "Amber Orange",
    },
}


REFERENCE_IMAGE = Path(__file__).parent / "stickers" / "sticker_prodigy_0_0.png"


def generate_sticker(char_key: str) -> None:
    char = CHARACTERS[char_key]
    prompt = STICKER_TEMPLATE.format(**char)
    print(f"Generating sticker for {char['name']} ({char['animal']})...")
    ref_bytes = REFERENCE_IMAGE.read_bytes() if REFERENCE_IMAGE.exists() else None
    result = generate_image(
        prompt=prompt,
        image_bytes=ref_bytes,
        image_mime_type="image/png",
        aspect_ratio="2:3",
        output_dir="stickers",
        output_filename=f"sticker_{char_key}",
    )
    print(f"Saved: {result['images']}")
    if result["texts"]:
        print(f"Model note: {result['texts']}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate character stickers")
    parser.add_argument(
        "character",
        nargs="?",
        default="chairman",
        choices=list(CHARACTERS.keys()) + ["all"],
        help="Character key to generate (default: chairman)",
    )
    args = parser.parse_args()

    if args.character == "all":
        for key in CHARACTERS:
            generate_sticker(key)
    else:
        generate_sticker(args.character)
