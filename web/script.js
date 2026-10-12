/**
 * Love Heart - Web Edition
 * Recriação fiel do love.py para a Web
 */

// Configurações do Coração
const SC = 21;
const OY = 20;
const DURATION = 10;
const TICK = 16;
const ANIM = 42;
const LIFT = 34;
const GAP = 7;
const SIZES = [9, 10, 11, 12];
const FONT = "Arial";
const BG = "#060208";

// Temas de cores disponíveis (idênticos ao love.py)
const COLOR_THEMES = [
  {
    id: "noiva",
    name: "Cor de noiva",
    subtitle: "",
    inner: [0.84, 0.82, 0.78],
    outer: [0.96, 0.94, 0.90],
    edge: [1.00, 0.99, 0.96],
    flash: [1.00, 1.00, 1.00],
    preview: "#F4EFE6",
  },
  {
    id: "unha",
    name: "Cor de unha",
    subtitle: "",
    inner: [0.70, 0.38, 0.48],
    outer: [0.88, 0.55, 0.65],
    edge: [0.98, 0.72, 0.82],
    flash: [1.00, 0.88, 0.94],
    preview: "#E0859D",
  },
  {
    id: "azul_bebe",
    name: "Azul bebê",
    subtitle: "Azul bebê pq fica bem em bebês",
    inner: [0.35, 0.60, 0.85],
    outer: [0.55, 0.78, 0.96],
    edge: [0.75, 0.90, 1.00],
    flash: [0.88, 0.96, 1.00],
    preview: "#72B9F8",
  },
  {
    id: "cherry",
    name: "Cherry",
    subtitle: "",
    inner: [0.52, 0.02, 0.14],
    outer: [0.85, 0.08, 0.24],
    edge: [0.98, 0.16, 0.32],
    flash: [1.00, 0.76, 0.82],
    preview: "#DE184B",
  },
  {
    id: "leite",
    name: "Leite (sim, é diferente da cor de noiva)",
    subtitle: "",
    inner: [0.78, 0.80, 0.82],
    outer: [0.92, 0.94, 0.95],
    edge: [0.99, 1.00, 1.00],
    flash: [1.00, 1.00, 1.00],
    preview: "#EFF2F5",
  },
  {
    id: "turquesa",
    name: "Turquesa",
    subtitle: "Turquesa, está mais para verde",
    inner: [0.04, 0.52, 0.40],
    outer: [0.08, 0.76, 0.56],
    edge: [0.20, 0.92, 0.68],
    flash: [0.78, 1.00, 0.90],
    preview: "#1BBF8C",
  },
];

const PHRASES = [
  "I love you", "Seni seviyorum", "Te amo", "Je t'aime",
  "Ich liebe dich", "Ti amo", "Eu te amo", "Я тебя люблю",
  "사랑해", "愛してる", "我爱你", "मैं तुमसे प्यार करता हूँ",
  "Σ' αγαπώ", "Ik hou van jou", "Jag älskar dig", "Kocham cię",
  "ฉันรักเธอ", "Anh yêu em", "Aku cinta kamu", "Я тебе кохаю",
];

// Gerador pseudo-aleatório com semente (Mulberry32)
class PRNG {
  constructor(seed = 11) {
    this.s = seed >>> 0;
  }
  random() {
    this.s = (this.s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  uniform(min, max) {
    return min + (max - min) * this.random();
  }
  choice(arr) {
    return arr[Math.floor(this.random() * arr.length)];
  }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }
}

// Funções matemáticas e de cor
function heart(a) {
  const sinA = Math.sin(a);
  const cosA = Math.cos(a);
  const x = 16 * Math.pow(sinA, 3);
  const y = 13 * cosA - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
  return [x * SC, y * SC + OY];
}

const POLY = Array.from({ length: 720 }, (_, i) => heart(2 * Math.PI * i / 720));
const EDGES = POLY.map((p, i) => [p, POLY[(i + 1) % POLY.length]]);
const YMAX = Math.max(...POLY.map(p => p[1]));
const YMIN = Math.min(...POLY.map(p => p[1]));
const CY = (YMAX + YMIN) / 2;

function spans(y) {
  const xs = [];
  for (let i = 0; i < EDGES.length; i++) {
    const [p1, p2] = EDGES[i];
    const x1 = p1[0], y1 = p1[1];
    const x2 = p2[0], y2 = p2[1];
    if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
      xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
  }
  xs.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < xs.length; i += 2) {
    if (i + 1 < xs.length) {
      result.push([xs[i], xs[i + 1]]);
    }
  }
  return result;
}

function intersect(A, B) {
  const out = [];
  for (const a of A) {
    for (const b of B) {
      const lo = Math.max(a[0], b[0]);
      const hi = Math.min(a[1], b[1]);
      if (hi - lo > 14) {
        out.push([lo, hi]);
      }
    }
  }
  return out;
}

function mathDist(x, y) {
  return Math.hypot(x / (16 * SC), (y - CY) / (14.5 * SC));
}

function clamp(v) {
  return Math.max(0.0, Math.min(1.0, v));
}

function mix(a, b, k) {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function dim(c, k) {
  return [c[0] * k, c[1] * k, c[2] * k];
}

function hx(c) {
  const r = Math.round(Math.max(0, Math.min(1, c[0])) * 255).toString(16).padStart(2, "0");
  const g = Math.round(Math.max(0, Math.min(1, c[1])) * 255).toString(16).padStart(2, "0");
  const b = Math.round(Math.max(0, Math.min(1, c[2])) * 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

const BGC = [
  parseInt(BG.slice(1, 3), 16) / 255,
  parseInt(BG.slice(3, 5), 16) / 255,
  parseInt(BG.slice(5, 7), 16) / 255,
];

// Medidor de texto em canvas
const measureCanvas = document.createElement("canvas");
const measureCtx = measureCanvas.getContext("2d");
function measureWidth(text, size) {
  measureCtx.font = `bold ${size}px Arial`;
  return measureCtx.measureText(text).width;
}

// Algoritmo de distribuição das frases no coração
function buildPlaced(theme) {
  const rng = new PRNG(11);
  function* phraseCycle() {
    while (true) {
      const order = [...PHRASES];
      rng.shuffle(order);
      for (const phrase of order) yield phrase;
    }
  }

  const cycle = phraseCycle();
  const row_h = 20; // max linespace + 4
  const half = row_h / 2;
  const placed = [];
  let y = YMAX - half;

  while (y > YMIN + half) {
    const row = intersect(spans(y + half), spans(y - half));
    for (const [rLo, rHi] of row) {
      const lo = rLo + 4;
      const hi = rHi - 4;
      let cur = lo + rng.uniform(0, 8);
      const line = [];

      while (true) {
        let fit = null;
        for (let attempt = 0; attempt < 10; attempt++) {
          const text = cycle.next().value;
          const size = rng.choice(SIZES);
          const w = measureWidth(text, size);
          if (cur + w <= hi) {
            fit = { text, size, w };
            break;
          }
        }
        if (!fit) break;
        line.push([cur + fit.w / 2, fit.text, fit.size, fit.w]);
        cur += fit.w + GAP;
      }

      if (line.length === 0) continue;

      if (line.length > 1) {
        const left = hi - (line[line.length - 1][0] + line[line.length - 1][3] / 2);
        for (let i = 0; i < line.length; i++) {
          line[i][0] += (left * i) / (line.length - 1);
        }
      } else {
        line[0][0] = (lo + hi) / 2;
      }

      for (let i = 0; i < line.length; i++) {
        const edge = i === 0 || i === line.length - 1;
        placed.push({
          x: line[i][0],
          y: y,
          text: line[i][1],
          size: line[i][2],
          w: line[i][3],
          edge: edge,
        });
      }
    }
    y -= row_h;
  }

  const inner_c = theme.inner;
  const outer_c = theme.outer;
  const edge_c = theme.edge;

  for (const p of placed) {
    const rad = Math.min(1.0, mathDist(p.x, p.y));
    let base = mix(inner_c, outer_c, 0.25 + 0.75 * rad);
    base = mix(base, edge_c, rng.uniform(0, 0.35) + (p.edge ? 0.3 : 0));
    p.color = [Math.min(1, base[0]), Math.min(1, base[1]), Math.min(1, base[2])];
    p.rad = rad;
  }

  const edges = placed.filter((p) => p.edge);
  const inner = placed.filter((p) => !p.edge);

  edges.sort((a, b) => {
    const angleA = (Math.atan2(a.x, a.y - CY) + 2 * Math.PI) % (2 * Math.PI);
    const angleB = (Math.atan2(b.x, b.y - CY) + 2 * Math.PI) % (2 * Math.PI);
    return angleA - angleB;
  });

  inner.sort((a, b) => {
    return -a.rad + rng.uniform(0, 0.08) - (-b.rad + rng.uniform(0, 0.08));
  });

  return [...edges, ...inner];
}

// Elementos da Interface
const menuScreen = document.getElementById("menu-screen");
const heartScreen = document.getElementById("heart-screen");
const cardsContainer = document.getElementById("cards-container");
const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
const btnBack = document.getElementById("btn-back");

// Suporte a monitores High-DPI / Retina
function setupDpi() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 800 * dpr;
  canvas.height = 800 * dpr;
  ctx.scale(dpr, dpr);
}
setupDpi();

// Gerar os cartões da interface
function renderMenuCards() {
  cardsContainer.innerHTML = "";
  COLOR_THEMES.forEach((theme, idx) => {
    const card = document.createElement("div");
    card.className = "theme-card";
    card.style.setProperty("--preview-color", theme.preview);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    card.innerHTML = `
      <div class="color-dot"></div>
      <div class="card-num">${idx + 1}</div>
      <div class="card-texts">
        <div class="card-name">${theme.name}</div>
        ${theme.subtitle ? `<div class="card-sub">${theme.subtitle}</div>` : ""}
      </div>
      <div class="card-arrow">›</div>
    `;

    card.addEventListener("click", () => selectTheme(idx));
    cardsContainer.appendChild(card);
  });
}

// Controle da Animação do Coração
let animId = null;
let shimmerTimer = null;
let currentTheme = null;
let placedItems = [];
let itemsQueue = [];
let activeItems = [];
let settledItems = [];
let spawning = false;
let acc = 0;
let rate = 0;
let rngSpawn = null;
let FLASH = [1, 1, 1];

function startHeart(theme) {
  // Cancelar animações anteriores
  if (animId) cancelAnimationFrame(animId);
  if (shimmerTimer) clearInterval(shimmerTimer);

  currentTheme = theme;
  FLASH = theme.flash;
  rngSpawn = new PRNG(11);

  placedItems = buildPlaced(theme);
  itemsQueue = [...placedItems];
  activeItems = [];
  settledItems = [];

  rate = placedItems.length / (DURATION * 1000 / TICK);
  acc = 0.0;
  spawning = true;

  // Alternar telas com transição
  menuScreen.classList.add("hidden");
  heartScreen.classList.remove("hidden");

  let lastTime = performance.now();

  function loop(now) {
    const delta = now - lastTime;
    lastTime = now;

    // Atualiza spawn com base no tempo
    if (spawning) {
      acc += (delta / TICK) * rate;
      while (acc >= 1 && itemsQueue.length > 0) {
        acc -= 1;
        const p = itemsQueue.shift();
        p.screenX = 400 + p.x;
        p.screenY = 400 - p.y;
        p.f = 0;
        p.dx = rngSpawn.uniform(-10, 10);
        p.shimmer = false;
        p.shimmerColor = null;
        activeItems.push(p);
      }
      if (itemsQueue.length === 0) {
        spawning = false;
      }
    }

    // Desenha o fundo
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, 800, 800);

    // 1. Desenha itens já assentados (settled)
    for (let i = 0; i < settledItems.length; i++) {
      const p = settledItems[i];
      const font = `bold ${p.size}px ${FONT}`;
      const bigFont = `bold ${p.size + 1}px ${FONT}`;

      // Sombra
      ctx.font = font;
      ctx.fillStyle = hx(dim(p.color, 0.30));
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text, p.screenX + 2, p.screenY + 3);

      // Halo
      ctx.font = bigFont;
      ctx.fillStyle = hx(dim(p.color, 0.20));
      ctx.fillText(p.text, p.screenX, p.screenY);

      // Texto Principal
      ctx.font = font;
      ctx.fillStyle = p.shimmer ? p.shimmerColor : hx(p.color);
      ctx.fillText(p.text, p.screenX, p.screenY);
    }

    // 2. Atualiza e desenha itens em voo (active)
    const remainingActive = [];
    for (let i = 0; i < activeItems.length; i++) {
      const p = activeItems[i];
      p.f += 1;
      const u = clamp(p.f / ANIM);
      const e = 1 - Math.pow(1 - u, 3);
      const hover = (1 - e) * LIFT;
      const px = p.screenX + p.dx * (1 - e);
      const py = p.screenY - hover;

      const flash = 0.75 * Math.sin(Math.PI * clamp((u - 0.55) / 0.45));
      const col = mix(mix(BGC, p.color, Math.pow(e, 1.5)), FLASH, flash);
      const shadowCol = mix(BGC, dim(p.color, 0.30), e);
      const haloCol = mix(BGC, dim(p.color, 0.20), e * e);

      const font = `bold ${p.size}px ${FONT}`;
      const bigFont = `bold ${p.size + 1}px ${FONT}`;

      // Sombra
      ctx.font = font;
      ctx.fillStyle = hx(shadowCol);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text, p.screenX + 2, p.screenY + 3);

      // Halo
      ctx.font = bigFont;
      ctx.fillStyle = hx(haloCol);
      ctx.fillText(p.text, px, py);

      // Texto Principal
      ctx.font = font;
      ctx.fillStyle = hx(col);
      ctx.fillText(p.text, px, py);

      if (u >= 1) {
        settledItems.push(p);
      } else {
        remainingActive.push(p);
      }
    }
    activeItems = remainingActive;

    // Se terminou o spawn e todos assentaram, ativa o shimmer
    if (!spawning && activeItems.length === 0 && !shimmerTimer) {
      startShimmer();
    }

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);
}

function startShimmer() {
  shimmerTimer = setInterval(() => {
    if (settledItems.length === 0) return;
    const item = rngSpawn.choice(settledItems);
    item.shimmer = true;
    item.shimmerColor = hx(mix(item.color, FLASH, 0.6));
    setTimeout(() => {
      item.shimmer = false;
    }, 260);
  }, 140);
}

function selectTheme(idx) {
  if (idx < 0 || idx >= COLOR_THEMES.length) return;
  startHeart(COLOR_THEMES[idx]);
}

// Botão voltar para o menu
btnBack.addEventListener("click", () => {
  if (animId) cancelAnimationFrame(animId);
  if (shimmerTimer) clearInterval(shimmerTimer);
  shimmerTimer = null;
  heartScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
});

// Teclas de atalho 1 a 6
window.addEventListener("keydown", (e) => {
  if (menuScreen.classList.contains("hidden")) {
    // Se estiver no coração e apertar Escape ou Backspace, volta ao menu
    if (e.key === "Escape" || e.key === "Backspace") {
      btnBack.click();
    }
    return;
  }
  const key = e.key;
  if (["1", "2", "3", "4", "5", "6"].includes(key)) {
    selectTheme(parseInt(key, 10) - 1);
  }
});

// Suporte a parâmetro de URL (ex: ?cor=cherry ou ?cor=3)
function checkUrlParam() {
  const params = new URLSearchParams(window.location.search);
  const corParam = params.get("cor") || params.get("color");
  if (!corParam) return false;

  const num = parseInt(corParam, 10);
  if (!isNaN(num) && num >= 1 && num <= COLOR_THEMES.length) {
    selectTheme(num - 1);
    return true;
  }

  const foundIdx = COLOR_THEMES.findIndex(
    (t) => t.id.toLowerCase() === corParam.toLowerCase()
  );
  if (foundIdx !== -1) {
    selectTheme(foundIdx);
    return true;
  }
  return false;
}

// Inicialização
renderMenuCards();
checkUrlParam();
