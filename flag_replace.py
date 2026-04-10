#!/usr/bin/env python3
"""
Generate soccer sticker cards with flag, name and position.

Always uses Soc_Empty.png as the base canvas.

Usage:
    python flag_replace.py <country> <name> <position> [output.png]
    python flag_replace.py --list

Arguments:
    country   e.g. france, germany, sweden
    name      Player name, e.g. "Bibo Donoser"  (auto-uppercased, split across lines)
    position  Striker | Midfielder | Defender | Goalkeeper
    output    defaults to Soc_<Country>.png

Examples:
    python flag_replace.py france "Bibo Donoser" Midfielder
    python flag_replace.py germany "Karl Müller" Striker Soc_Karl.png
    python flag_replace.py --list
"""

CANVAS = "Soc_Empty.png"

# Flag region — pixel-measured from Soc_Bib.png
FLAG_X1, FLAG_Y1, FLAG_X2, FLAG_Y2 = 76, 1051, 196, 1186

# Name area (black text, centered, multiline)
NAME_BOX = (209, 1017, 447, 169)   # x, y, w, h

# Position badge area (white text, centered)
POS_BOX  = (659, 1037, 118, 54)    # x, y, w, h

# Fonts — Impact for the sticker-card look
FONT_BOLD      = "C:/Windows/Fonts/impact.ttf"
FONT_BOLD_ALT  = "C:/Windows/Fonts/arialbd.ttf"   # fallback

import sys
from PIL import Image, ImageDraw, ImageFont


# ─── Flag image loader ─────────────────────────────────────────────────────────

FLAG_DIR = "w320"   # folder with <iso2>.png files

# Country name → ISO 3166-1 alpha-2 code (and sub-national codes for home nations)
COUNTRY_CODE: dict[str, str] = {
    # Europe
    "austria": "at", "belgium": "be", "bulgaria": "bg", "croatia": "hr",
    "cyprus": "cy", "czechia": "cz", "czech": "cz", "czech_republic": "cz",
    "denmark": "dk", "england": "gb-eng", "estonia": "ee", "finland": "fi",
    "france": "fr", "georgia": "ge", "germany": "de", "greece": "gr",
    "hungary": "hu", "iceland": "is", "ireland": "ie", "italy": "it",
    "kosovo": "xk", "latvia": "lv", "liechtenstein": "li", "lithuania": "lt",
    "luxembourg": "lu", "malta": "mt", "moldova": "md", "monaco": "mc",
    "montenegro": "me", "netherlands": "nl", "north_macedonia": "mk",
    "northern_ireland": "gb-nir", "norway": "no", "poland": "pl",
    "portugal": "pt", "romania": "ro", "russia": "ru", "san_marino": "sm",
    "scotland": "gb-sct", "serbia": "rs", "slovakia": "sk", "slovenia": "si",
    "spain": "es", "sweden": "se", "switzerland": "ch", "turkey": "tr",
    "ukraine": "ua", "wales": "gb-wls", "albania": "al", "andorra": "ad",
    "armenia": "am", "azerbaijan": "az", "belarus": "by", "bosnia": "ba",
    "bosnia_herzegovina": "ba", "faroe_islands": "fo", "gibraltar": "gi",
    "uk": "gb", "great_britain": "gb",
    # Americas
    "antigua": "ag", "argentina": "ar", "bolivia": "bo", "brazil": "br",
    "canada": "ca", "chile": "cl", "colombia": "co", "costa_rica": "cr",
    "cuba": "cu", "ecuador": "ec", "el_salvador": "sv", "guatemala": "gt",
    "haiti": "ht", "honduras": "hn", "jamaica": "jm", "mexico": "mx",
    "nicaragua": "ni", "panama": "pa", "paraguay": "py", "peru": "pe",
    "trinidad": "tt", "trinidad_tobago": "tt", "uruguay": "uy", "usa": "us",
    "venezuela": "ve",
    # Africa
    "algeria": "dz", "angola": "ao", "burkina_faso": "bf", "cameroon": "cm",
    "cape_verde": "cv", "congo": "cd", "egypt": "eg", "ethiopia": "et",
    "gabon": "ga", "gambia": "gm", "ghana": "gh", "guinea": "gn",
    "guinea_bissau": "gw", "ivory_coast": "ci", "ivory coast": "ci",
    "kenya": "ke", "libya": "ly", "madagascar": "mg", "mali": "ml",
    "mauritania": "mr", "morocco": "ma", "mozambique": "mz", "namibia": "na",
    "nigeria": "ng", "rwanda": "rw", "senegal": "sn", "sierra_leone": "sl",
    "somalia": "so", "south_africa": "za", "sudan": "sd", "tanzania": "tz",
    "togo": "tg", "tunisia": "tn", "uganda": "ug", "zambia": "zm",
    "zimbabwe": "zw", "equatorial_guinea": "gq",
    # Asia & Middle East
    "afghanistan": "af", "bahrain": "bh", "bangladesh": "bd", "china": "cn",
    "india": "in", "indonesia": "id", "iran": "ir", "iraq": "iq",
    "israel": "il", "japan": "jp", "jordan": "jo", "kuwait": "kw",
    "kyrgyzstan": "kg", "lebanon": "lb", "malaysia": "my", "maldives": "mv",
    "myanmar": "mm", "nepal": "np", "north_korea": "kp", "oman": "om",
    "pakistan": "pk", "palestine": "ps", "philippines": "ph", "qatar": "qa",
    "saudi_arabia": "sa", "singapore": "sg", "south_korea": "kr",
    "sri_lanka": "lk", "syria": "sy", "taiwan": "tw", "tajikistan": "tj",
    "thailand": "th", "turkmenistan": "tm", "uae": "ae",
    "united_arab_emirates": "ae", "uzbekistan": "uz", "vietnam": "vn",
    "yemen": "ye",
    # Oceania
    "australia": "au", "fiji": "fj", "new_zealand": "nz",
    "papua_new_guinea": "pg",
    # Common aliases / alternate spellings
    "holland": "nl", "nether": "nl", "korea": "kr", "south korea": "kr",
    "usa": "us", "united_states": "us", "ivory coast": "ci",
}


def load_flag(country: str, box_w: int, box_h: int) -> Image.Image:
    """
    Load the flag image for *country* from FLAG_DIR, scale it to fit inside
    the box (box_w × box_h) while maintaining aspect ratio (contain), and
    return an RGBA image of exactly box_w × box_h with the flag centered on a
    white background.
    """
    key = country.lower().replace(" ", "_").replace("-", "_")
    if key not in COUNTRY_CODE:
        available = ", ".join(sorted(COUNTRY_CODE.keys()))
        raise ValueError(f"Unknown country '{country}'.\nAvailable:\n{available}")

    iso = COUNTRY_CODE[key]
    path = f"{FLAG_DIR}/{iso}.png"

    try:
        flag = Image.open(path).convert("RGBA")
    except FileNotFoundError:
        raise FileNotFoundError(f"Flag file not found: {path}")

    fw, fh = flag.size

    # Scale to contain: fit fully inside the box, preserving aspect ratio.
    scale = min(box_w / fw, box_h / fh)
    new_w = round(fw * scale)
    new_h = round(fh * scale)
    flag = flag.resize((new_w, new_h), Image.LANCZOS)

    # Fill letterbox areas with the card banner background colour
    BG = (95, 146, 173, 255)
    canvas = Image.new("RGBA", (box_w, box_h), BG)
    x_off = (box_w - new_w) // 2
    y_off = (box_h - new_h) // 2
    canvas.paste(flag, (x_off, y_off), flag)
    return canvas


# ─── Text rendering ────────────────────────────────────────────────────────────

def _load_font(size: int) -> ImageFont.FreeTypeFont:
    for path in (FONT_BOLD, FONT_BOLD_ALT):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()


def _text_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0], bb[3] - bb[1]


def _bb(draw, text, font):
    """Return full textbbox at origin as (left, top, right, bottom)."""
    return draw.textbbox((0, 0), text, font=font)


def draw_name(draw: ImageDraw.ImageDraw, name: str):
    """
    Write the player name into NAME_BOX in black, auto-sized.
    Splits the name into up to 2 lines at the first space.

    Fitting checks actual rendered pixel bounds (draw.textbbox top/bottom offsets
    included), so the text never escapes the box.
    """
    bx, by, bw, bh = NAME_BOX
    name = name.upper()
    parts = name.split(None, 1)
    lines = parts if len(parts) > 1 else [name]

    padding = 8
    avail_w = bw - padding * 2
    line_gap = 4

    chosen_size = 12
    for size in range(120, 11, -1):
        font = _load_font(size)
        bbs = [_bb(draw, ln, font) for ln in lines]

        # Width check: bb[2]-bb[0] per line
        if max(b[2] - b[0] for b in bbs) > avail_w:
            continue

        # Height check: simulate the draw positions and check actual pixel bounds.
        # When drawing line i at y_draw, its pixels span y_draw+bb[1]..y_draw+bb[3].
        heights = [b[3] - b[1] for b in bbs]
        total_h = sum(heights) + line_gap * (len(lines) - 1)
        y_start = by + (bh - total_h) // 2   # where line 0 is drawn

        # Actual top pixel of line 0
        actual_top = y_start + bbs[0][1]
        # Actual bottom pixel of last line
        y_last = y_start + sum(heights[:-1]) + line_gap * (len(lines) - 1)
        actual_bottom = y_last + bbs[-1][3]

        if actual_top >= by and actual_bottom <= by + bh:
            chosen_size = size
            break

    font = _load_font(chosen_size)
    bbs = [_bb(draw, ln, font) for ln in lines]
    heights = [b[3] - b[1] for b in bbs]
    total_h = sum(heights) + line_gap * (len(lines) - 1)

    y = by + (bh - total_h) // 2
    for line, bb in zip(lines, bbs):
        tw = bb[2] - bb[0]
        x = bx + (bw - tw) // 2
        draw.text((x, y), line, fill=(0, 0, 0, 255), font=font)
        y += (bb[3] - bb[1]) + line_gap


def draw_position(draw: ImageDraw.ImageDraw, position: str):
    """
    Write the position label into POS_BOX in white, auto-sized.
    Uses actual pixel bounds for the fit check (same approach as draw_name).
    """
    bx, by, bw, bh = POS_BOX
    text = position.upper()

    padding = 4
    avail_w = bw - padding * 2

    chosen_size = 12
    for size in range(60, 8, -1):
        font = _load_font(size)
        bb = _bb(draw, text, font)
        tw = bb[2] - bb[0]
        if tw > avail_w:
            continue
        # Simulate draw position and check pixel bounds
        th = bb[3] - bb[1]
        y_draw = by + (bh - th) // 2
        actual_top    = y_draw + bb[1]
        actual_bottom = y_draw + bb[3]
        if actual_top >= by and actual_bottom <= by + bh:
            chosen_size = size
            break

    font = _load_font(chosen_size)
    bb = _bb(draw, text, font)
    tw = bb[2] - bb[0]
    th = bb[3] - bb[1]
    x = bx + (bw - tw) // 2
    y = by + (bh - th) // 2
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)


# ─── Main card generation ───────────────────────────────────────────────────────

def generate_card(country: str, name: str, position: str, output_path: str):
    img = Image.open(CANVAS).convert("RGBA")

    # 1. Flag — load from w320/, scale to fit box, center
    flag_w = FLAG_X2 - FLAG_X1
    flag_h = FLAG_Y2 - FLAG_Y1
    flag_img = load_flag(country, flag_w, flag_h)
    img.paste(flag_img, (FLAG_X1, FLAG_Y1), flag_img)

    # 2. Name + position text
    draw = ImageDraw.Draw(img)
    draw_name(draw, name)
    draw_position(draw, position)

    img.save(output_path)
    print(f"  Saved: {output_path}")


# ─── CLI ───────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if not args or args[0] in ("--help", "-h"):
        print(__doc__)
        sys.exit(0)

    if args[0] == "--list":
        print("Available countries:")
        for k in sorted(COUNTRY_CODE.keys()):
            print(f"  {k:30s} → {COUNTRY_CODE[k]}")
        sys.exit(0)

    if len(args) < 3:
        print("Usage: python flag_replace.py <country> <name> <position> [output.png]")
        sys.exit(1)

    country  = args[0]
    name     = args[1]
    position = args[2]
    output_path = args[3] if len(args) > 3 else f"Soc_{country.capitalize()}.png"

    print(f"Generating card: country={country}, name={name!r}, position={position}")
    generate_card(country, name, position, output_path)
    print("Done.")


if __name__ == "__main__":
    main()
