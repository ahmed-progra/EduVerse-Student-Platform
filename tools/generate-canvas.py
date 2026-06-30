from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random, os

random.seed(42)

W, H = 2400, 3400
OUT = "systemic-cartography.png"
FONT_DIR = "."

class Canvas:
    def __init__(self):
        self.img = Image.new("RGB", (W, H), (18, 15, 12))
        self.draw = ImageDraw.Draw(self.img)
        self.load_fonts()

    def load_fonts(self):
        ws = os.path.join(FONT_DIR, "WorkSans-Regular.ttf")
        ws_b = os.path.join(FONT_DIR, "WorkSans-Bold.ttf")
        ws_i = os.path.join(FONT_DIR, "WorkSans-Italic.ttf")
        te = os.path.join(FONT_DIR, "Tektur-Regular.ttf")
        self.f_sm = ImageFont.truetype(ws, 22)
        self.f_md = ImageFont.truetype(ws, 28)
        self.f_xl = ImageFont.truetype(ws_b, 64)
        self.f_title_sub = ImageFont.truetype(ws, 36)
        self.f_label = ImageFont.truetype(te, 24)
        self.f_legend = ImageFont.truetype(ws_i, 18)

    def noise(self, amount=2):
        px = self.img.load()
        for _ in range(W * H // 6):
            x = random.randint(0, W - 1)
            y = random.randint(0, H - 1)
            r, g, b = px[x, y]
            n = random.randint(-amount, amount)
            px[x, y] = (max(0, min(255, r + n)), max(0, min(255, g + n)), max(0, min(255, b + n)))

    def vignette(self):
        px = self.img.load()
        cx, cy = W / 2, H / 2
        max_dist = math.sqrt(cx * cx + cy * cy)
        for x in range(W):
            for y in range(H):
                d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / max_dist
                if d > 0.5:
                    f = (d - 0.5) * 0.3
                    r, g, b = px[x, y]
                    px[x, y] = (max(0, int(r * (1 - f))), max(0, int(g * (1 - f))), max(0, int(b * (1 - f))))

    def draw_grid(self, spacing=80, color=(42, 37, 31), line_width=1):
        for x in range(0, W, spacing):
            self.draw.line([(x, 0), (x, H)], fill=color, width=line_width)
        for y in range(0, H, spacing):
            self.draw.line([(0, y), (W, y)], fill=color, width=line_width)

    def dot_cluster(self, cx, cy, count, radius, dot_radius, color):
        for _ in range(count):
            angle = random.random() * math.pi * 2
            dist = random.random() * radius
            x = cx + math.cos(angle) * dist
            y = cy + math.sin(angle) * dist
            r = dot_radius * (0.6 + random.random() * 0.4)
            self.draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

    def contour_lines(self, cx, cy, count=12, base_radius=80, step=42, color=(62, 54, 44)):
        for i in range(count):
            r = base_radius + i * step
            pts = []
            for a in range(0, 361, 2):
                rad = math.radians(a)
                n = math.sin(a * 0.13 + i * 1.7) * 10 + math.sin(a * 0.07 + i * 0.9) * 6 + math.cos(a * 0.05 + i) * 5
                rr = r + n
                x = cx + math.cos(rad) * rr
                y = cy + math.sin(rad) * rr * 0.7
                pts.append((x, y))
            if len(pts) > 2:
                for j in range(len(pts) - 1):
                    w = 1 if i < count - 2 else 2
                    self.draw.line([pts[j], pts[j + 1]], fill=color, width=w)

    def radial_grid(self, cx, cy, r, count=36, color=(42, 37, 31)):
        for i in range(count):
            a = math.radians(i * (360 / count))
            self.draw.line([(cx, cy), (cx + math.cos(a) * r, cy + math.sin(a) * r)], fill=color, width=1)

    def knowledge_graph(self, nodes, color_path=(176, 150, 94), color_node=(139, 115, 85)):
        drawn = set()
        for i, (x, y) in enumerate(nodes):
            r = 5 + random.random() * 3
            self.draw.ellipse([x - r, y - r, x + r, y + r], fill=color_node)
            for j in range(i + 1, len(nodes)):
                if (i, j) in drawn:
                    continue
                dx = nodes[j][0] - x
                dy = nodes[j][1] - y
                dist = math.sqrt(dx * dx + dy * dy)
                if dist < 450 and random.random() < 0.3:
                    drawn.add((i, j))
                    midx = (x + nodes[j][0]) / 2 + random.uniform(-25, 25)
                    midy = (y + nodes[j][1]) / 2 + random.uniform(-25, 25)
                    segs = 30
                    for t in range(segs):
                        t0 = t / segs
                        t1 = (t + 1) / segs
                        b = [(x, y), (midx, midy), nodes[j]]
                        x0 = (1 - t0) ** 2 * b[0][0] + 2 * (1 - t0) * t0 * b[1][0] + t0 ** 2 * b[2][0]
                        y0 = (1 - t0) ** 2 * b[0][1] + 2 * (1 - t0) * t0 * b[1][1] + t0 ** 2 * b[2][1]
                        x1 = (1 - t1) ** 2 * b[0][0] + 2 * (1 - t1) * t1 * b[1][0] + t1 ** 2 * b[2][0]
                        y1 = (1 - t1) ** 2 * b[0][1] + 2 * (1 - t1) * t1 * b[1][1] + t1 ** 2 * b[2][1]
                        self.draw.line([(x0, y0), (x1, y1)], fill=color_path, width=1)

    def run(self):
        # Warm gradient background
        for y in range(H):
            mix = y / H
            r = int(22 * (1 - mix) + 34 * mix)
            g = int(18 * (1 - mix) + 28 * mix)
            b = int(14 * (1 - mix) + 22 * mix)
            self.draw.rectangle([(0, y), (W, y)], fill=(r, g, b))

        # Survey grid
        self.draw_grid(spacing=80, color=(44, 39, 33), line_width=1)

        # Main territory ring
        cx, cy = W * 0.50, H * 0.47
        self.draw.ellipse([cx - 680, cy - 680, cx + 680, cy + 680], outline=(52, 46, 39), width=2)
        self.draw.ellipse([cx - 710, cy - 710, cx + 710, cy + 710], outline=(44, 39, 33), width=1)
        self.draw.ellipse([cx - 740, cy - 740, cx + 740, cy + 740], outline=(38, 33, 28), width=1)

        # Radial lines within territory
        self.radial_grid(cx, cy, 680, count=32, color=(44, 39, 33))

        # Contour cluster 1 — peak in upper-right domain
        self.contour_lines(W * 0.72, H * 0.22, count=12, base_radius=50, step=40, color=(62, 54, 44))

        # Contour cluster 2 — lower-left domain
        self.contour_lines(W * 0.25, H * 0.80, count=9, base_radius=35, step=38, color=(60, 52, 43))

        # Contour cluster 3 — upper-left
        self.contour_lines(W * 0.18, H * 0.30, count=6, base_radius=25, step=32, color=(58, 50, 41))

        # Knowledge graph — primary cluster (skill tree reference)
        nodes1 = []
        for _ in range(50):
            a = random.random() * math.pi * 2
            d = random.random() * 280
            nodes1.append((cx + math.cos(a) * d, cy + math.sin(a) * d))
        self.knowledge_graph(nodes1, color_path=(176, 150, 94), color_node=(139, 115, 85))

        # Knowledge graph — secondary cluster
        cx2, cy2 = W * 0.68, H * 0.65
        nodes2 = []
        for _ in range(30):
            a = random.random() * math.pi * 2
            d = random.random() * 200
            nodes2.append((cx2 + math.cos(a) * d, cy2 + math.sin(a) * d))
        self.knowledge_graph(nodes2, color_path=(166, 140, 88), color_node=(120, 100, 75))

        # Dot clusters
        self.dot_cluster(W * 0.35, H * 0.55, 100, 90, 2.5, (196, 167, 104))
        self.dot_cluster(W * 0.58, H * 0.35, 60, 70, 2, (160, 136, 85))
        self.dot_cluster(W * 0.78, H * 0.80, 50, 60, 2, (140, 120, 75))

        # Compass rose
        self.compass_rose(W * 0.88, H * 0.14, size=55, color=(176, 150, 94))

        # Legend
        lx, ly = 80, H - 320
        self.draw.rectangle([(lx, ly), (lx + 320, ly + 230)], outline=(58, 50, 42), width=1)
        items = [
            ("LEGEND", (120, 110, 90), self.f_label),
            ("●  Knowledge Node", (139, 115, 85), self.f_sm),
            ("—  Path of Inquiry", (166, 140, 88), self.f_sm),
            ("≈  Contour (Elevation)", (72, 64, 54), self.f_sm),
            ("◯  Territory Boundary", (60, 52, 44), self.f_sm),
            ("·  Accumulated Study", (176, 150, 94), self.f_sm),
        ]
        for i, (txt, col, fnt) in enumerate(items):
            self.draw.text((lx + 20, ly + 12 + i * 36), txt, fill=col, font=fnt)

        # Title
        self.draw.text((W // 2, 48), "SYSTEMIC CARTOGRAPHY", fill=(210, 195, 160), font=self.f_xl, anchor="mt")
        self.draw.text((W // 2, 120), "A Survey of Knowledge Territories", fill=(110, 100, 85), font=self.f_title_sub, anchor="mt")

        # Plate annotation
        self.draw.text((W // 2, H - 70), "PLATE I — DOMAINS OF ACCUMULATED UNDERSTANDING", fill=(72, 64, 54), font=self.f_legend, anchor="mb")

        # Scale bar
        sb_x, sb_y = W - 380, H - 110
        self.draw.line([(sb_x, sb_y), (sb_x + 250, sb_y)], fill=(100, 90, 75), width=2)
        for i in range(6):
            x = sb_x + i * 50
            self.draw.line([(x, sb_y - 5), (x, sb_y + 5)], fill=(100, 90, 75), width=1)
            self.draw.text((x, sb_y + 14), str(i * 10), fill=(100, 90, 75), font=self.f_sm, anchor="mt")

        # Scattered diamond markers
        for _ in range(25):
            x = random.randint(120, W - 120)
            y = random.randint(160, H - 160)
            sz = 3 + random.random() * 3
            c = (90 + random.randint(0, 30), 78 + random.randint(0, 25), 62 + random.randint(0, 20))
            self.draw.polygon([(x, y - sz), (x + sz, y), (x, y + sz), (x - sz, y)], fill=c)

        # Side columns
        self.draw.rectangle([(0, 0), (50, H)], fill=(15, 13, 10))
        self.draw.rectangle([(W - 50, 0), (W, H)], fill=(15, 13, 10))

        # Grain
        self.noise(amount=2)
        self.vignette()

        # Borders
        self.draw.rectangle([(14, 14), (W - 14, H - 14)], outline=(44, 39, 33), width=1)
        self.draw.rectangle([(18, 18), (W - 18, H - 18)], outline=(38, 33, 28), width=1)

        self.img.save(OUT, dpi=(300, 300))
        print(f"Saved {OUT} — {W}x{H}px")

    def compass_rose(self, cx, cy, size=55, color=(176, 150, 94)):
        for i in range(8):
            a = math.radians(i * 45)
            l = size if i % 2 == 0 else size * 0.55
            self.draw.line([(cx, cy), (cx + math.cos(a) * l, cy + math.sin(a) * l)], fill=color, width=2)
            if i % 4 == 0:
                self.draw.line([(cx + math.cos(a) * (l + 10), cy + math.sin(a) * (l + 10)),
                                (cx + math.cos(a) * (l + 28), cy + math.sin(a) * (l + 28))], fill=color, width=3)

if __name__ == "__main__":
    c = Canvas()
    c.run()
