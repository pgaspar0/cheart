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

const CHERRY_PHRASES = [
  "I love you", "Te amo", "Je t'aime", "Ich liebe dich",
  "Ti amo", "Eu te amo", "Я тебя люблю", "사랑해",
  "愛してる", "我爱你", "Σ' αγαπώ", "Ik hou van jou",
  "Jag älskar dig", "Kocham cię", "Anh yêu em", "Seni seviyorum",
  "Face it, Tiger...",
  "You just hit the jackpot",
  "Pardonne-tu",
  "Queres muito me ser",
  "Estou bem acordada",
  "Patavinas",
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
  const phrasePool = (theme.id === "cherry") ? CHERRY_PHRASES : PHRASES;
  function* phraseCycle() {
    while (true) {
      const order = [...phrasePool];
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

// Elementos do Leitor de Áudio (Cherry Spider-Man)
const cherryAudioPlayer = document.getElementById("cherry-audio-player");
const spidermanAudio = document.getElementById("spiderman-audio");
const audioPlayBtn = document.getElementById("audio-play-btn");
const playIcon = document.getElementById("play-icon");
const audioProgressWrap = document.getElementById("audio-progress-wrap");
const audioProgressBar = document.getElementById("audio-progress-bar");
const audioTime = document.getElementById("audio-time");
const audioLoopBtn = document.getElementById("audio-loop-btn");

let isAudioLooping = false;

function formatAudioTime(sec) {
  if (isNaN(sec) || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function updatePlayButtonUI(isPlaying) {
  if (!playIcon || !cherryAudioPlayer) return;
  if (isPlaying) {
    playIcon.textContent = "❚❚";
    audioPlayBtn.title = "Pausar som";
    cherryAudioPlayer.classList.add("playing");
  } else {
    playIcon.textContent = "▶";
    audioPlayBtn.title = "Reproduzir som";
    cherryAudioPlayer.classList.remove("playing");
  }
}

function stopAndResetAudio() {
  if (!spidermanAudio) return;
  spidermanAudio.pause();
  spidermanAudio.currentTime = 0;
  if (audioProgressBar) audioProgressBar.style.width = "0%";
  if (audioTime) audioTime.textContent = "0:00";
  updatePlayButtonUI(false);
}

if (spidermanAudio && audioPlayBtn) {
  audioPlayBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (spidermanAudio.paused) {
      spidermanAudio.play().then(() => updatePlayButtonUI(true)).catch(() => {});
    } else {
      spidermanAudio.pause();
      updatePlayButtonUI(false);
    }
  });

  if (audioLoopBtn) {
    audioLoopBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isAudioLooping = !isAudioLooping;
      spidermanAudio.loop = isAudioLooping;
      audioLoopBtn.classList.toggle("active", isAudioLooping);
      audioLoopBtn.title = isAudioLooping ? "Repetir em loop: ativado" : "Repetir em loop: desativado";
    });
  }

  if (audioProgressWrap) {
    audioProgressWrap.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = audioProgressWrap.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      if (spidermanAudio.duration) {
        spidermanAudio.currentTime = pct * spidermanAudio.duration;
        if (spidermanAudio.paused) {
          spidermanAudio.play().then(() => updatePlayButtonUI(true)).catch(() => {});
        }
      }
    });
  }

  spidermanAudio.addEventListener("timeupdate", () => {
    if (!spidermanAudio.duration) return;
    const pct = (spidermanAudio.currentTime / spidermanAudio.duration) * 100;
    if (audioProgressBar) audioProgressBar.style.width = pct + "%";
    if (audioTime) audioTime.textContent = formatAudioTime(spidermanAudio.currentTime);
  });

  spidermanAudio.addEventListener("ended", () => {
    if (!isAudioLooping) {
      updatePlayButtonUI(false);
      if (audioProgressBar) audioProgressBar.style.width = "0%";
      if (audioTime) audioTime.textContent = "0:00";
    }
  });
}

// Dimensões responsivas e suporte a monitores High-DPI / Retina
let screenW = window.innerWidth;
let screenH = window.innerHeight;
let dpr = window.devicePixelRatio || 1;
let fitScale = 1;

function resizeCanvas() {
  screenW = window.innerWidth;
  screenH = window.innerHeight;
  dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(screenW * dpr);
  canvas.height = Math.round(screenH * dpr);

  // Escala responsiva do coração: aproveita a tela mantendo proporção e margens de respiro
  const availableW = Math.max(280, screenW - 40);
  const availableH = Math.max(280, screenH - 60);
  fitScale = Math.min(1.45, Math.min(availableW / 760, availableH / 760));
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ===================================================
// Efeitos Especiais Spider-Man & Mary Jane (Opção Cherry)
// ===================================================

let webBursts = [];
let webParticles = [];

function initWebParticles() {
  webParticles = [];
  const count = Math.min(60, Math.max(24, Math.round((screenW * screenH) / 28000)));
  for (let i = 0; i < count; i++) {
    webParticles.push({
      x: Math.random() * screenW,
      y: Math.random() * screenH,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.35,
      size: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.45,
      pulse: Math.random() * Math.PI * 2,
    });
  }
}

function updateAndDrawWebParticles(ctx, delta) {
  ctx.save();
  for (const p of webParticles) {
    p.y += p.vy;
    p.x += p.vx;
    p.pulse += 0.03;
    if (p.y < 0) {
      p.y = screenH;
      p.x = Math.random() * screenW;
    }
    if (p.x < 0) p.x = screenW;
    if (p.x > screenW) p.x = 0;
    const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
    ctx.fillStyle = `rgba(255, 90, 130, ${currentAlpha})`;
    ctx.shadowColor = "#de184b";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function createWebBurst(x, y) {
  webBursts.push({
    x,
    y,
    radius: 4,
    maxRadius: 65,
    life: 1.0,
  });
}

function updateAndDrawWebBursts(ctx, delta) {
  const next = [];
  for (const b of webBursts) {
    b.life -= delta * 0.0016;
    b.radius += (b.maxRadius - b.radius) * 0.12;
    if (b.life > 0) {
      drawSpiderWebBurst(ctx, b.x, b.y, b.radius, b.life);
      next.push(b);
    }
  }
  webBursts = next;
}

function drawSpiderWebBurst(ctx, x, y, radius, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
  ctx.shadowColor = "rgba(222, 24, 75, 0.85)";
  ctx.shadowBlur = 6;
  ctx.lineWidth = 1;

  const rays = 8;
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.stroke();
  }

  const rings = 3;
  for (let r = 1; r <= rings; r++) {
    const rRadius = (r / rings) * radius;
    ctx.beginPath();
    for (let i = 0; i < rays; i++) {
      const a1 = (i / rays) * Math.PI * 2;
      const a2 = ((i + 1) / rays) * Math.PI * 2;
      const p1x = Math.cos(a1) * rRadius;
      const p1y = Math.sin(a1) * rRadius;
      const p2x = Math.cos(a2) * rRadius;
      const p2y = Math.sin(a2) * rRadius;
      const midA = (a1 + a2) / 2;
      const cpx = Math.cos(midA) * (rRadius * 0.88);
      const cpy = Math.sin(midA) * (rRadius * 0.88);

      if (i === 0) ctx.moveTo(p1x, p1y);
      ctx.quadraticCurveTo(cpx, cpy, p2x, p2y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpiderWebCorner(ctx, x0, y0, radius, raysCount, ringCount, angleStart, angleEnd) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.shadowColor = "rgba(222, 24, 75, 0.55)";
  ctx.shadowBlur = 4;
  ctx.lineWidth = 1;

  const rayAngles = [];
  for (let i = 0; i < raysCount; i++) {
    const angle = angleStart + (i / (raysCount - 1)) * (angleEnd - angleStart);
    rayAngles.push(angle);
    const rx = x0 + Math.cos(angle) * radius;
    const ry = y0 + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(rx, ry);
    ctx.stroke();
  }

  for (let r = 1; r <= ringCount; r++) {
    const ringRadius = (r / ringCount) * radius;
    ctx.beginPath();
    for (let i = 0; i < raysCount - 1; i++) {
      const a1 = rayAngles[i];
      const a2 = rayAngles[i + 1];
      const p1x = x0 + Math.cos(a1) * ringRadius;
      const p1y = y0 + Math.sin(a1) * ringRadius;
      const p2x = x0 + Math.cos(a2) * ringRadius;
      const p2y = y0 + Math.sin(a2) * ringRadius;

      const midAngle = (a1 + a2) / 2;
      const cpx = x0 + Math.cos(midAngle) * (ringRadius * 0.90);
      const cpy = y0 + Math.sin(midAngle) * (ringRadius * 0.90);

      if (i === 0) ctx.moveTo(p1x, p1y);
      ctx.quadraticCurveTo(cpx, cpy, p2x, p2y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpiderWebs(ctx) {
  // Apenas no canto superior direito da tela (atrás de onde o Spidey ancora)
  // Deixa o botão de voltar (top-left) e os créditos (bottom-right) 100% livres de teias
  const webRadius = Math.min(180, Math.max(120, screenW * 0.12));
  drawSpiderWebCorner(ctx, screenW, 0, webRadius, 6, 5, Math.PI / 2, Math.PI);
}

function drawHangingSpidey(ctx, time) {
  // Posicionado na zona livre do canto superior direito da viewport
  // Não sobrepõe nenhuma palavra do coração e nem qualquer botão
  const offsetFromRight = Math.min(110, Math.max(60, screenW * 0.075));
  const anchorX = screenW - offsetFromRight;
  const anchorY = 0;
  const threadLength = Math.min(85, Math.max(52, screenH * 0.08));
  const swing = 0.045 * Math.sin(time * 0.0018);

  ctx.save();
  ctx.translate(anchorX, anchorY);
  ctx.rotate(swing);
  const spideyScale = Math.min(1.0, Math.max(0.78, screenW / 1200));
  ctx.scale(spideyScale, spideyScale);

  // Fio de teia de aranha cintilante
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, threadLength);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
  ctx.shadowBlur = 3;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Desloca para a ponta do fio
  ctx.translate(0, threadLength);

  // Pernas (para cima segurando o fio)
  ctx.strokeStyle = "#1b3b6f";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-6, -16); ctx.lineTo(0, -28);
  ctx.moveTo(0, 0); ctx.lineTo(6, -16); ctx.lineTo(0, -28);
  ctx.stroke();

  // Botas vermelhas
  ctx.strokeStyle = "#de184b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-2, -22); ctx.lineTo(0, -28);
  ctx.moveTo(2, -22); ctx.lineTo(0, -28);
  ctx.stroke();

  // Tronco (azul nas laterais)
  ctx.fillStyle = "#1b3b6f";
  ctx.beginPath();
  ctx.ellipse(0, 10, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tronco (vermelho no centro)
  ctx.fillStyle = "#de184b";
  ctx.beginPath();
  ctx.ellipse(0, 10, 5.5, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pequena aranha no peito
  ctx.fillStyle = "#11050a";
  ctx.beginPath();
  ctx.ellipse(0, 10, 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Braços
  ctx.strokeStyle = "#de184b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-5, 6); ctx.lineTo(-12, 14); ctx.lineTo(-7, 20);
  ctx.moveTo(5, 6); ctx.lineTo(13, 14); ctx.lineTo(8, 20);
  ctx.stroke();

  // Cabeça (invertida)
  ctx.save();
  ctx.translate(0, 25);

  ctx.fillStyle = "#de184b";
  ctx.shadowColor = "rgba(222, 24, 75, 0.7)";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.5, 10.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Teias na máscara
  ctx.strokeStyle = "rgba(20, 0, 10, 0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-8, 0); ctx.lineTo(8, 0);
  ctx.moveTo(0, -10); ctx.lineTo(0, 10);
  ctx.stroke();

  // Olhos angulados clássicos do Spider-Man
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#100008";
  ctx.lineWidth = 1.3;

  // Olho esquerdo
  ctx.beginPath();
  ctx.moveTo(-1.5, 1);
  ctx.lineTo(-6.5, -3);
  ctx.quadraticCurveTo(-7, 3, -2, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Olho direito
  ctx.beginPath();
  ctx.moveTo(1.5, 1);
  ctx.lineTo(6.5, -3);
  ctx.quadraticCurveTo(7, 3, 2, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Coração pulsando suavemente ao lado do Homem-Aranha
  const heartPulse = 1 + 0.15 * Math.sin(time * 0.005);
  ctx.save();
  ctx.translate(14, 8);
  ctx.scale(heartPulse, heartPulse);
  ctx.fillStyle = "#ff2a6d";
  ctx.shadowColor = "#ff2a6d";
  ctx.shadowBlur = 6;
  ctx.font = "bold 9px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("♥", 0, 0);
  ctx.restore();

  ctx.restore();
  ctx.restore();
}

// Gerar os cartões da interface
function renderMenuCards() {
  cardsContainer.innerHTML = "";
  COLOR_THEMES.forEach((theme, idx) => {
    const card = document.createElement("div");
    card.className = "theme-card";
    card.setAttribute("data-theme", theme.id);
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
      <div class="card-arrow-wrap">
        ${theme.id === "cherry" ? '<span class="cherry-web-icon">🕸️</span>' : ""}
        <span class="card-arrow">›</span>
      </div>
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

  resizeCanvas();

  currentTheme = theme;
  FLASH = theme.flash;
  rngSpawn = new PRNG(11);

  if (theme.id === "cherry") {
    initWebParticles();
    webBursts = [];
    if (cherryAudioPlayer && spidermanAudio) {
      cherryAudioPlayer.classList.remove("hidden");
      spidermanAudio.currentTime = 0;
      spidermanAudio.play()
        .then(() => updatePlayButtonUI(true))
        .catch(() => updatePlayButtonUI(false));
    }
  } else {
    stopAndResetAudio();
    if (cherryAudioPlayer) cherryAudioPlayer.classList.add("hidden");
  }

  // Atualiza créditos no canto da tela
  const heartCreditEl = document.querySelector(".heart-credit");
  if (heartCreditEl) {
    if (theme.id === "cherry") {
      heartCreditEl.innerHTML = `
        <div class="culinaria-quote">A culinária não é uma ciência exacta, pipoca no jantar é válido.</div>
        <div>Motivação, Mary Jane</div>
        <div class="fun-credit">Consegui ahahahahahaha!</div>
      `;
    } else {
      heartCreditEl.innerHTML = `
        <div>Motivação, Célia T.</div>
        <div class="fun-credit">Consegui ahahahahahaha!</div>
      `;
    }
  }

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

    // Reset de DPI para a resolução nativa da tela
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Desenha o fundo cobrindo toda a tela
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, screenW, screenH);

    // Efeitos especiais exclusivos do Homem-Aranha / Mary Jane (Cherry) em tela cheia
    if (currentTheme && currentTheme.id === "cherry") {
      drawSpiderWebs(ctx);
      updateAndDrawWebParticles(ctx, delta);
      updateAndDrawWebBursts(ctx, delta);
    }

    // Centraliza e escala o coração responsivamente no centro da viewport
    ctx.save();
    ctx.translate(screenW / 2, screenH / 2);
    ctx.scale(fitScale, fitScale);
    ctx.translate(-400, -400);

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

    ctx.restore();

    // Spidey pendurado de cabeça para baixo no canto da viewport
    if (currentTheme && currentTheme.id === "cherry") {
      drawHangingSpidey(ctx, now);
    }

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
  stopAndResetAudio();
  if (cherryAudioPlayer) cherryAudioPlayer.classList.add("hidden");
  heartScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
});

// Disparo de teia ao clicar no canvas (interativo para Mary Jane)
canvas.addEventListener("click", (e) => {
  if (!currentTheme || currentTheme.id !== "cherry") return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  createWebBurst(x, y);

  // Easter Egg: clicar no Homem-Aranha pendurado toca/reinicia o som!
  const offsetFromRight = Math.min(110, Math.max(60, screenW * 0.075));
  const spideyX = screenW - offsetFromRight;
  const threadLength = Math.min(85, Math.max(52, screenH * 0.08));
  const spideyY = threadLength + 18;
  if (Math.hypot(x - spideyX, y - spideyY) < 38 && spidermanAudio) {
    spidermanAudio.currentTime = 0;
    spidermanAudio.play().then(() => updatePlayButtonUI(true)).catch(() => {});
  }
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
