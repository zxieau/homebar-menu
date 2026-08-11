from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

sys.path.insert(0, "/private/tmp/jimmys_qr_runtime")
import qrcode
from qrcode.constants import ERROR_CORRECT_H


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "exports"
HERO = ROOT / "public/assets/hero/jimmys-bar-hero-v2.webp"

FRONT_URL = "https://jimmysbar-d5grrbik0144c55a9-1256678114.tcloudbaseapp.com/"
ADMIN_URL = "https://jimmysbar-d5grrbik0144c55a9-1256678114.tcloudbaseapp.com/#/admin"

GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"


def font(path, size, index=0):
    return ImageFont.truetype(path, size=size, index=index)


def qr_image(url, pixels, ink=(35, 22, 14), paper=(255, 247, 218)):
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=16,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color=ink, back_color=paper).convert("RGB")
    return image.resize((pixels, pixels), Image.Resampling.NEAREST)


def centered_text(draw, y, text, face, fill, width=1200):
    box = draw.textbbox((0, 0), text, font=face)
    x = (width - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=face, fill=fill)


def rounded_panel(canvas, xy, radius, fill, outline, width=4, shadow=True):
    x0, y0, x1, y1 = xy
    if shadow:
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.rounded_rectangle((x0 + 10, y0 + 18, x1 + 10, y1 + 18), radius, fill=(20, 10, 6, 105))
        layer = layer.filter(ImageFilter.GaussianBlur(18))
        canvas.alpha_composite(layer)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(xy, radius, fill=fill, outline=outline, width=width)


def make_guest_card():
    hero = Image.open(HERO).convert("RGB")
    hero = hero.resize((1200, 1600), Image.Resampling.LANCZOS)
    hero = ImageEnhance.Color(hero).enhance(0.92)
    hero = ImageEnhance.Contrast(hero).enhance(1.04)
    canvas = hero.convert("RGBA")

    # A soft vignette keeps the share card legible after social-app compression.
    vignette = Image.new("L", canvas.size, 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse((-220, -170, 1420, 1810), fill=195)
    vignette = vignette.filter(ImageFilter.GaussianBlur(170))
    shade = Image.new("RGBA", canvas.size, (24, 12, 10, 100))
    shade.putalpha(Image.eval(vignette, lambda p: 110 - p // 2))
    canvas.alpha_composite(shade)

    paper = (247, 224, 171, 248)
    ink = (46, 28, 18, 255)
    ochre = (132, 79, 34, 255)
    rounded_panel(canvas, (132, 380, 1068, 1480), 64, paper, (105, 65, 31, 255), 5)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((160, 408, 1040, 1452), 48, outline=(148, 105, 58, 145), width=3)

    centered_text(d, 438, "JIMMY'S HOME BAR", font(GEORGIA_BOLD, 52), ink)
    centered_text(d, 515, "PRIVATE MENU AFTER DUSK", font(GEORGIA, 25), ochre)
    d.line((238, 570, 962, 570), fill=(122, 78, 39, 180), width=3)

    qr = qr_image(FRONT_URL, 610)
    qr_x, qr_y = 295, 620
    canvas.paste(qr, (qr_x, qr_y))

    centered_text(d, 1260, "扫一扫，今晚喝一杯", font(SONGTI, 42), ink)
    centered_text(d, 1324, "Scan to open tonight's menu", font(GEORGIA, 27), ochre)
    centered_text(d, 1390, "No sign-up · Order from your phone", font(GEORGIA, 21), (92, 60, 39, 255))

    path = OUT / "jimmys-bar-guest-qr.png"
    canvas.convert("RGB").save(path, quality=95, optimize=True)
    return path


def make_admin_card():
    canvas = Image.new("RGBA", (1000, 1200), (43, 25, 18, 255))
    d = ImageDraw.Draw(canvas)
    # Subtle menu-paper stripes rather than a decorative public-facing poster.
    for x in range(0, 1000, 120):
        d.line((x, 0, x, 1200), fill=(82, 49, 30, 90), width=2)
    rounded_panel(canvas, (95, 92, 905, 1108), 52, (239, 216, 166, 255), (143, 91, 46, 255), 4)
    d = ImageDraw.Draw(canvas)
    centered_text(d, 148, "JIMMY'S BACK BAR", font(GEORGIA_BOLD, 45), (49, 29, 18, 255), width=1000)
    centered_text(d, 210, "ADMIN ACCESS", font(GEORGIA, 24), (129, 75, 35, 255), width=1000)
    qr = qr_image(ADMIN_URL, 600)
    canvas.paste(qr, (200, 305))
    centered_text(d, 955, "Scan to manage tonight's tickets", font(GEORGIA, 24), (71, 41, 23, 255), width=1000)
    centered_text(d, 1004, "后台入口 · 请勿转发", font(SONGTI, 30), (121, 40, 31, 255), width=1000)
    path = OUT / "jimmys-bar-admin-qr.png"
    canvas.convert("RGB").save(path, quality=95, optimize=True)
    return path


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    print(make_guest_card())
    print(make_admin_card())
