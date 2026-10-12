import math as m
import random as r
import sys
import threading
import tkinter.font as tkf
import turtle as t

SC = 21
OY = 20
DURATION = 10
TICK = 16
ANIM = 42
LIFT = 34
GAP = 7
SIZES = (9, 10, 11, 12)
FONT = "Arial"
BG = "#060208"

# Temas de cores disponíveis
COLOR_THEMES = [
    {
        "id": "noiva",
        "name": "Cor de noiva",
        "subtitle": "",
        "inner": (0.84, 0.82, 0.78),
        "outer": (0.96, 0.94, 0.90),
        "edge": (1.00, 0.99, 0.96),
        "flash": (1.00, 1.00, 1.00),
        "preview": "#F4EFE6",
    },
    {
        "id": "unha",
        "name": "Cor de unha",
        "subtitle": "",
        "inner": (0.70, 0.38, 0.48),
        "outer": (0.88, 0.55, 0.65),
        "edge": (0.98, 0.72, 0.82),
        "flash": (1.00, 0.88, 0.94),
        "preview": "#E0859D",
    },
    {
        "id": "azul_bebe",
        "name": "Azul bebê",
        "subtitle": "Azul bebê pq fica bem em bebês",
        "inner": (0.35, 0.60, 0.85),
        "outer": (0.55, 0.78, 0.96),
        "edge": (0.75, 0.90, 1.00),
        "flash": (0.88, 0.96, 1.00),
        "preview": "#72B9F8",
    },
    {
        "id": "cherry",
        "name": "Cherry",
        "subtitle": "",
        "inner": (0.52, 0.02, 0.14),
        "outer": (0.85, 0.08, 0.24),
        "edge": (0.98, 0.16, 0.32),
        "flash": (1.00, 0.76, 0.82),
        "preview": "#DE184B",
    },
    {
        "id": "leite",
        "name": "Leite (sim, é diferente da cor de noiva)",
        "subtitle": "",
        "inner": (0.78, 0.80, 0.82),
        "outer": (0.92, 0.94, 0.95),
        "edge": (0.99, 1.00, 1.00),
        "flash": (1.00, 1.00, 1.00),
        "preview": "#EFF2F5",
    },
    {
        "id": "turquesa",
        "name": "Turquesa",
        "subtitle": "Turquesa, está mais para verde",
        "inner": (0.04, 0.52, 0.40),
        "outer": (0.08, 0.76, 0.56),
        "edge": (0.20, 0.92, 0.68),
        "flash": (0.78, 1.00, 0.90),
        "preview": "#1BBF8C",
    },
]

s = t.Screen()
s.setup(800, 800)
s.bgcolor(BG)
s.title("Consegui!")
s.tracer(0)

cv = s.getcanvas()
root = cv.winfo_toplevel()

PHRASES = [
    "I love you", "Seni seviyorum", "Te amo", "Je t'aime",
    "Ich liebe dich", "Ti amo", "Eu te amo", "Я тебя люблю",
    "사랑해", "愛してる", "我爱你", "मैं तुमसे प्यार करता हूँ",
    "Σ' αγαπώ", "Ik hou van jou", "Jag älskar dig", "Kocham cię",
    "ฉันรักเธอ", "Anh yêu em", "Aku cinta kamu", "Я тебе кохаю",
]

_fonts = {}


def font_for(size):
    if size not in _fonts:
        _fonts[size] = tkf.Font(
            root=cv, family=FONT, size=size, weight="bold"
        )
    return _fonts[size]


def heart(a):
    x = 16 * (m.sin(a) ** 3)
    y = (
        13 * m.cos(a)
        - 5 * m.cos(2 * a)
        - 2 * m.cos(3 * a)
        - m.cos(4 * a)
    )
    return x * SC, y * SC + OY


def hx(c):
    return "#%02x%02x%02x" % tuple(
        int(max(0, min(1, v)) * 255) for v in c
    )


def mix(a, b, k):
    return tuple(p + (q - p) * k for p, q in zip(a, b))


def dim(c, k):
    return tuple(v * k for v in c)


POLY = [heart(2 * m.pi * i / 720) for i in range(720)]
EDGES = list(zip(POLY, POLY[1:] + POLY[:1]))
YMAX = max(p[1] for p in POLY)
YMIN = min(p[1] for p in POLY)
CY = (YMAX + YMIN) / 2


def spans(y):
    xs = []
    for (x1, y1), (x2, y2) in EDGES:
        if (y1 <= y < y2) or (y2 <= y < y1):
            xs.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
    xs.sort()
    return list(zip(xs[0::2], xs[1::2]))


def intersect(A, B):
    out = []
    for a in A:
        for b in B:
            lo, hi = max(a[0], b[0]), min(a[1], b[1])
            if hi - lo > 14:
                out.append((lo, hi))
    return out


def math_dist(x, y):
    return m.hypot(x / (16 * SC), (y - CY) / (14.5 * SC))


def math_sin(v):
    return m.sin(m.pi * v)


def clamp(v):
    return max(0.0, min(1.0, v))


def build(theme):
    rng = r.Random(11)

    def phrase_cycle():
        while True:
            order = PHRASES[:]
            rng.shuffle(order)
            yield from order

    cycle = phrase_cycle()
    row_h = max(font_for(z).metrics("linespace") for z in SIZES) + 4
    half = row_h / 2
    placed = []

    y = YMAX - half
    while y > YMIN + half:
        row = intersect(spans(y + half), spans(y - half))

        for lo, hi in row:
            lo += 4
            hi -= 4
            cur = lo + rng.uniform(0, 8)
            line = []

            while True:
                fit = None
                for _ in range(10):
                    text = next(cycle)
                    size = rng.choice(SIZES)
                    w = font_for(size).measure(text)
                    if cur + w <= hi:
                        fit = (text, size, w)
                        break
                if not fit:
                    break
                text, size, w = fit
                line.append([cur + w / 2, text, size, w])
                cur += w + GAP

            if not line:
                continue

            if len(line) > 1:
                left = hi - (line[-1][0] + line[-1][3] / 2)
                for i, it in enumerate(line):
                    it[0] += left * i / (len(line) - 1)
            else:
                line[0][0] = (lo + hi) / 2

            for i, (x, text, size, w) in enumerate(line):
                edge = i == 0 or i == len(line) - 1
                placed.append(dict(x=x, y=y, text=text, size=size, edge=edge))

        y -= row_h

    inner_c = theme["inner"]
    outer_c = theme["outer"]
    edge_c = theme["edge"]
    for p in placed:
        rad = min(1.0, math_dist(p["x"], p["y"]))
        base = mix(inner_c, outer_c, 0.25 + 0.75 * rad)
        base = mix(base, edge_c, rng.uniform(0, 0.35) + (0.3 if p["edge"] else 0))
        p["color"] = tuple(min(1, v) for v in base)
        p["rad"] = rad

    edges = [p for p in placed if p["edge"]]
    inner = [p for p in placed if not p["edge"]]
    edges.sort(key=lambda p: m.atan2(p["x"], p["y"] - CY) % (2 * m.pi))
    inner.sort(key=lambda p: -p["rad"] + rng.uniform(0, 0.08))
    return edges + inner


BGC = tuple(int(BG[i:i + 2], 16) / 255 for i in (1, 3, 5))
FLASH = (1.0, 1.0, 1.0)
main_ids = []
active = []
items = None
RATE = 0
acc = 0.0
spawning = True
selected = False
menu_items = []
rng_spawn = r.Random(11)


def spawn(p):
    x, y = p["x"], -p["y"]
    size, text, c = p["size"], p["text"], p["color"]
    font = (FONT, size, "bold")
    big = (FONT, size + 1, "bold")

    shadow = cv.create_text(x + 2, y + 3, text=text, font=font, fill=BG)
    halo = cv.create_text(x, y, text=text, font=big, fill=BG)
    main = cv.create_text(x, y - LIFT, text=text, font=font, fill=BG)

    p.update(
        shadow=shadow,
        halo=halo,
        main=main,
        f=0,
        dx=rng_spawn.uniform(-10, 10),
    )
    main_ids.append((main, c))
    active.append(p)


def animate(p):
    p["f"] += 1
    u = clamp(p["f"] / ANIM)
    e = 1 - (1 - u) ** 3
    c = p["color"]
    x, y = p["x"], -p["y"]
    hover = (1 - e) * LIFT
    px = x + p["dx"] * (1 - e)
    py = y - hover

    cv.itemconfig(p["shadow"], fill=hx(mix(BGC, dim(c, 0.30), e)))
    cv.itemconfig(p["halo"], fill=hx(mix(BGC, dim(c, 0.20), e * e)))
    cv.coords(p["halo"], px, py)

    flash = 0.75 * math_sin(clamp((u - 0.55) / 0.45))
    col = mix(mix(BGC, c, e ** 1.5), FLASH, flash)
    cv.itemconfig(p["main"], fill=hx(col))
    cv.coords(p["main"], px, py)

    if u >= 1:
        cv.coords(p["halo"], x, y)
        cv.coords(p["main"], x, y)
        cv.itemconfig(p["main"], fill=hx(c))
        return False
    return True


def step():
    global spawning, acc
    if spawning:
        acc += RATE
        try:
            while acc >= 1:
                acc -= 1
                spawn(next(items))
        except StopIteration:
            spawning = False

    active[:] = [p for p in active if animate(p)]

    if not spawning and not active:
        shimmer()
        return
    cv.after(TICK, step)


def _safe(i, c):
    try:
        cv.itemconfig(i, fill=hx(c))
    except Exception:
        pass


def shimmer():
    for _ in range(1):
        i, c = rng_spawn.choice(main_ids)
        _safe(i, mix(c, FLASH, 0.6))
        cv.after(260, lambda i=i, c=c: _safe(i, c))
    cv.after(140, shimmer)


def start_heart(theme):
    global FLASH, items, RATE, acc, spawning, main_ids, active, rng_spawn
    FLASH = theme["flash"]
    rng_spawn = r.Random(11)
    main_ids = []
    active = []
    order = build(theme)
    items = iter(order)
    RATE = len(order) / (DURATION * 1000 / TICK)
    acc = 0.0
    spawning = True
    cv.after(150, step)


def select_theme(idx):
    global selected
    if selected:
        return
    selected = True

    try:
        root.unbind("<Key>")
    except Exception:
        pass

    for k in (
        "1", "2", "3", "4", "5", "6",
        "KP_1", "KP_2", "KP_3", "KP_4", "KP_5", "KP_6",
    ):
        try:
            s.onkey(None, k)
        except Exception:
            pass

    chosen = COLOR_THEMES[idx]
    print(f"\nCor escolhida: {chosen['name']}")
    if chosen["subtitle"]:
        print(f"({chosen['subtitle']})")

    for item in menu_items:
        try:
            cv.delete(item)
        except Exception:
            pass
    menu_items.clear()
    start_heart(chosen)


def show_menu():
    global menu_items
    menu_items.clear()

    t1 = cv.create_text(
        0, -280,
        text="ESCOLHA A COR DO CORAÇÃO",
        font=(FONT, 18, "bold"),
        fill="#FFFFFF",
    )
    t2 = cv.create_text(
        0, -250,
        text="Clique numa opção ou pressione a tecla (1 - 6)",
        font=(FONT, 11, "normal"),
        fill="#8E8598",
    )
    menu_items.extend([t1, t2])

    y_starts = [-195, -122, -49, 24, 97, 170]
    card_h = 58
    card_w = 540
    half_w = card_w / 2

    for idx, theme in enumerate(COLOR_THEMES):
        y_top = y_starts[idx]
        y_bot = y_top + card_h
        y_mid = (y_top + y_bot) / 2
        tag = f"theme_card_{idx}"

        bg_rect = cv.create_rectangle(
            -half_w, y_top, half_w, y_bot,
            fill="#120A1A", outline="#251833", width=1.5,
            tags=(tag, "clickable")
        )

        circle = cv.create_oval(
            -half_w + 18, y_mid - 12, -half_w + 42, y_mid + 12,
            fill=theme["preview"], outline=theme["preview"],
            tags=(tag, "clickable")
        )

        num_txt = cv.create_text(
            -half_w + 64, y_mid,
            text=f"{idx + 1}",
            font=(FONT, 12, "bold"), fill="#9085A0",
            tags=(tag, "clickable")
        )

        text_x = -half_w + 92
        if theme["subtitle"]:
            title_txt = cv.create_text(
                text_x, y_mid - 9,
                text=theme["name"],
                font=(FONT, 13, "bold"), fill="#FFFFFF", anchor="w",
                tags=(tag, "clickable")
            )
            sub_txt = cv.create_text(
                text_x, y_mid + 11,
                text=theme["subtitle"],
                font=(FONT, 10, "italic"), fill=theme["preview"], anchor="w",
                tags=(tag, "clickable")
            )
            card_texts = [title_txt, sub_txt]
        else:
            title_txt = cv.create_text(
                text_x, y_mid,
                text=theme["name"],
                font=(FONT, 13, "bold"), fill="#FFFFFF", anchor="w",
                tags=(tag, "clickable")
            )
            card_texts = [title_txt]

        arrow_txt = cv.create_text(
            half_w - 24, y_mid,
            text="›",
            font=(FONT, 18, "bold"), fill="#443555",
            tags=(tag, "clickable")
        )

        card_items = [bg_rect, circle, num_txt, *card_texts, arrow_txt]
        menu_items.extend(card_items)

        def make_handlers(r=bg_rect, a=arrow_txt, p=theme["preview"], i=idx):
            def on_enter(e):
                cv.itemconfig(r, fill="#1D122B", outline=p)
                cv.itemconfig(a, fill=p)

            def on_leave(e):
                cv.itemconfig(r, fill="#120A1A", outline="#251833")
                cv.itemconfig(a, fill="#443555")

            def on_click(e):
                select_theme(i)

            return on_enter, on_leave, on_click

        on_enter, on_leave, on_click = make_handlers()
        cv.tag_bind(tag, "<Enter>", on_enter)
        cv.tag_bind(tag, "<Leave>", on_leave)
        cv.tag_bind(tag, "<Button-1>", on_click)

    tip_txt = cv.create_text(
        0, 248,
        text="Dica: Use o mouse para clicar ou as teclas 1 a 6",
        font=(FONT, 10, "italic"), fill="#5D5469"
    )
    credit_txt = cv.create_text(
        0, 275,
        text="Motivação, Célia T.",
        font=(FONT, 9, "italic"), fill="#382C42"
    )
    menu_items.extend([tip_txt, credit_txt])


def setup_bindings():
    def on_key(event):
        if event.char in ("1", "2", "3", "4", "5", "6"):
            select_theme(int(event.char) - 1)

    root.bind("<Key>", on_key)

    for i in range(len(COLOR_THEMES)):
        idx = i
        key_char = str(i + 1)
        s.onkey(lambda idx=idx: select_theme(idx), key_char)
        s.onkey(lambda idx=idx: select_theme(idx), f"KP_{key_char}")
    s.listen()


def print_cli_menu():
    print("=" * 55)
    print("        ❤️  ESCOLHA A COR DO CORAÇÃO  ❤️")
    print("=" * 55)
    for i, t_info in enumerate(COLOR_THEMES, 1):
        if t_info["subtitle"]:
            print(f" {i}. {t_info['name']} ({t_info['subtitle']})")
        else:
            print(f" {i}. {t_info['name']}")
    print("=" * 55)
    print("Selecione clicando na janela ou digitando 1-6.")
    print("Motivação, Célia T.")
    print("=" * 55)


def start_terminal_listener():
    def term_thread():
        try:
            if sys.stdin and sys.stdin.isatty():
                for line in sys.stdin:
                    line = line.strip()
                    if line in ("1", "2", "3", "4", "5", "6"):
                        cv.after(0, lambda idx=int(line) - 1: select_theme(idx))
                        break
        except Exception:
            pass

    t_listener = threading.Thread(target=term_thread, daemon=True)
    t_listener.start()


print_cli_menu()
show_menu()
setup_bindings()
start_terminal_listener()

try:
    t.done()
except (t.Terminator, Exception):
    pass
