(function () {
  'use strict';

  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');

  // ── Palette ──────────────────────────────────────────────────────────────
  const C_TEXT   = '#122033';
  const C_MUTED  = '#516072';
  const C_SUBTLE = '#66758a';
  const C_ACCENT = '#1f5fd6';

  // Claude Code mascot
  const OR  = '#D4673D';
  const OR2 = '#B85530';
  const DK  = '#1E0A02';

  // ── Character constants ───────────────────────────────────────────────────
  // Sprite: 8 cols × 11 rows at P=6 → 48 × 66 px (normal)
  //         10 cols × 5 rows at P=6 → 60 × 30 px (duck)
  const P           = 6;
  const CHAR_X      = 44;
  const CHAR_W      = 44;
  const CHAR_H      = 66;   // 11 × P
  const CHAR_DUCK_H = 30;   //  5 × P

  // ── Physics ───────────────────────────────────────────────────────────────
  const GRAVITY  = 0.229;  // reduced for 1.75× hang time (same peak height)
  const JUMP_VY  = -10.71; // +25% air time via higher peak
  const BASE_SPD = 5;
  const MAX_SPD  = 15;

  // ── State ────────────────────────────────────────────────────────────────
  const S = { IDLE: 0, RUNNING: 1, DEAD: 2 };
  let state = S.IDLE;

  let W, H, GY, dpr;
  let score = 0, hiScore = 0, speed = BASE_SPD, frame = 0;
  let obstacles = [], spawnCD = 80, groundOffset = 0;

  // ── Background scenery ────────────────────────────────────────────────────
  // Each layer scrolls at a fraction of game speed (parallax).
  // Items are plain strings rendered with canvas fillText.

  // Multi-line ASCII cloud shapes. Each entry: fractional x/y, lines array, size variant.
  const CLOUD_SHAPES = [
    [             // small
      '  .--.',
      ' (    )',
      '(  ~  )',
      ' `----\'',
    ],
    [             // medium
      '   .---.',
      ' .(     ).',
      '(   ~ ~  )',
      ' `-------\'',
    ],
    [             // wide
      '  .----.  .',
      '.(       ).',
      '(  ~  ~   )',
      ' `---------\'',
    ],
  ];

  const BIRD_SHAPES = [
    [             // small bird in flight
      '   ___',
      '  (o >-',
      ' _/ |  ',
      '/   v  ',
    ],
    [             // larger bird
      '    ___',
      '   (o_>--',
      '  /  |   ',
      ' /   v   ',
    ],
  ];

  const BG_CLOUDS = [
    { x: 0.12, y: 0.14, s: 1 },
    { x: 0.40, y: 0.07, s: 2 },
    { x: 0.65, y: 0.19, s: 0 },
    { x: 0.85, y: 0.10, s: 1 },
    { x: 1.20, y: 0.15, s: 2 },
    { x: 1.52, y: 0.06, s: 0 },
  ];

  const BG_BIRDS_INIT = [
    { x: 0.55, y: 0.25, s: 0 },
    { x: 1.85, y: 0.32, s: 1 },
  ];

  let bgClouds = [], bgBirds = [];

  function initBg() {
    bgClouds = BG_CLOUDS.map(c => ({ x: c.x * W, y: c.y, lines: CLOUD_SHAPES[c.s] }));
    bgBirds  = BG_BIRDS_INIT.map(b => ({ x: b.x * W, y: b.y, lines: BIRD_SHAPES[b.s] }));
  }

  const char = {
    y: 0, vy: 0, ground: true, ducking: false,
    animF: 0, animT: 0,
    get h() { return char.ducking ? CHAR_DUCK_H : CHAR_H; },
  };

  try { hiScore = parseInt(localStorage.getItem('dc-hi'), 10) || 0; } catch (_) {}

  // ── Resize ───────────────────────────────────────────────────────────────

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const el = canvas.parentElement;
    W = el.offsetWidth;
    H = el.offsetHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    GY = Math.round(H * 0.76);
    if (state !== S.RUNNING) char.y = GY;
    initBg();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  // ── Haptics ──────────────────────────────────────────────────────────────

  function buzz(p) { try { navigator.vibrate(p); } catch (_) {} }

  // ── Game actions ─────────────────────────────────────────────────────────

  function jump() {
    if (state === S.IDLE || state === S.DEAD) { begin(); return; }
    if (char.ground && !char.ducking) {
      char.vy = JUMP_VY; char.ground = false; buzz(12);
    }
  }

  function duck(on) {
    if (state !== S.RUNNING) return;
    char.ducking = on;
    if (on && !char.ground) char.vy = Math.max(char.vy, 5);
  }

  function begin() {
    state = S.RUNNING; score = 0; speed = BASE_SPD; frame = 0;
    obstacles = []; spawnCD = 80; groundOffset = 0;
    firstCloudDone = false; initBg();
    char.y = GY; char.vy = 0; char.ground = true;
    char.ducking = false; char.animF = 0; char.animT = 0;
  }

  function die() {
    state = S.DEAD; buzz([30, 20, 70]);
    if (score > hiScore) {
      hiScore = score;
      try { localStorage.setItem('dc-hi', hiScore); } catch (_) {}
    }
  }

  // ── Keyboard input ────────────────────────────────────────────────────────
  // Space tap  (released before 150 ms) → jump
  // Space hold (still down after 150 ms) → duck until released

  let spaceHoldTimer = null;
  let spacePending   = false;
  let spaceDown      = false;

  window.addEventListener('keydown', e => {
    if (e.code !== 'Space' || spaceDown) return;
    e.preventDefault();
    spaceDown = true;

    if (state !== S.RUNNING) {
      // Idle / dead: any press starts the game
      jump();
    } else {
      spacePending   = true;
      spaceHoldTimer = setTimeout(() => { spacePending = false; duck(true); }, 150);
    }
  });

  window.addEventListener('keyup', e => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    spaceDown = false;
    clearTimeout(spaceHoldTimer);
    if (spacePending) { spacePending = false; jump(); }  // was a tap → jump
    else              { duck(false); }                   // was a hold → end duck
  });

  // ── Touch input ───────────────────────────────────────────────────────────

  let touchId = null, touchStart = 0, touchHoldTimer = null, touchDucking = false;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (touchId !== null) return;
    touchId      = e.changedTouches[0].identifier;
    touchStart   = Date.now();
    touchDucking = false;
    touchHoldTimer = setTimeout(() => { touchDucking = true; duck(true); }, 150);
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== touchId) continue;
      touchId = null;
      clearTimeout(touchHoldTimer);
      if (!touchDucking) jump(); else { touchDucking = false; duck(false); }
    }
  }, { passive: false });

  canvas.addEventListener('touchcancel', e => {
    e.preventDefault(); touchId = null;
    clearTimeout(touchHoldTimer);
    if (touchDucking) { touchDucking = false; duck(false); }
  }, { passive: false });

  // ── Bitmap pixel font (5×5, flat row-major 25-element arrays) ─────────────

  const FONT5 = {
    ' ': [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0],
    'C': [0,1,1,1,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 0,1,1,1,0],
    'E': [1,1,1,1,1, 1,0,0,0,0, 1,1,1,1,0, 1,0,0,0,0, 1,1,1,1,1],
    'F': [1,1,1,1,1, 1,0,0,0,0, 1,1,1,1,0, 1,0,0,0,0, 1,0,0,0,0],
    'I': [0,1,1,1,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0],
    'K': [1,0,0,1,0, 1,0,1,0,0, 1,1,0,0,0, 1,0,1,0,0, 1,0,0,1,0],
    'L': [1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,1,1,1,1],
    'M': [1,0,0,0,1, 1,1,0,1,1, 1,0,1,0,1, 1,0,0,0,1, 1,0,0,0,1],
    'N': [1,0,0,0,1, 1,1,0,0,1, 1,0,1,0,1, 1,0,0,1,1, 1,0,0,0,1],
    'O': [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
    'S': [0,1,1,1,1, 1,0,0,0,0, 0,1,1,1,0, 0,0,0,0,1, 1,1,1,1,0],
    'T': [1,1,1,1,1, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0],
    'U': [1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
    'X': [1,0,0,0,1, 0,1,0,1,0, 0,0,1,0,0, 0,1,0,1,0, 1,0,0,0,1],
  };

  const FS  = 2;          // px per font pixel
  const FG  = 2;          // gap between chars
  const FCW = 5 * FS + FG; // char advance width = 12

  function pxW(str) { return str.length * FCW - FG; }

  function drawPxText(str, x, y, color) {
    ctx.fillStyle = color;
    let cx = Math.round(x);
    const cy = Math.round(y);
    for (const ch of str.toUpperCase()) {
      const b = FONT5[ch];
      if (b) {
        for (let r = 0; r < 5; r++)
          for (let c = 0; c < 5; c++)
            if (b[r * 5 + c]) ctx.fillRect(cx + c * FS, cy + r * FS, FS, FS);
      }
      cx += FCW;
    }
  }

  // Draw two lines of pixel text centred inside a rectangle
  function drawPxLabel(line1, line2, rx, ry, rw, rh, color) {
    const lh  = 5 * FS + 4; // line height (10px chars + 4px gap)
    const tot = lh * 2 - 4;
    const ty  = ry + Math.round((rh - tot) / 2);
    drawPxText(line1, rx + Math.round((rw - pxW(line1)) / 2), ty,          color);
    drawPxText(line2, rx + Math.round((rw - pxW(line2)) / 2), ty + lh,     color);
  }

  // ── Obstacle definitions ──────────────────────────────────────────────────
  //
  // CONTEXT LIMIT  = brick wall, ground = true,  JUMP over it
  // OUT OF TOKENS  = cloud ceiling, ground = false, DUCK under it
  //
  // Cloud height is computed dynamically in spawnObstacle so the ceiling
  // always reaches high enough that jumping never clears it:
  //   ob.h = GY - CHAR_DUCK_H - 20
  //
  // Collision verification (margin = 7):
  //   Standing effective top = (GY - 66) + 7 = GY - 59
  //   Cloud effective bottom = (GY - 50) - 7 = GY - 57
  //   GY-59 < GY-57 → TRUE  → hit ✓
  //
  //   Ducking effective top  = (GY - 30) + 7 = GY - 23
  //   GY-23 < GY-57         → FALSE → clear ✓
  //
  //   Max-jump char top  ≈ GY - 227  → effective = GY - 220
  //   GY-220 < GY-57                 → TRUE  → can't jump over ✓

  const BRICK_W = 130; // obstacle width (fits pixel text)
  const CLOUD_W = 160;

  const OBSTACLE_DEFS = [
    { ground: true,  w: BRICK_W, h: 68                    },
    { ground: true,  w: BRICK_W, h: 68, double: true      },
    { ground: false, w: CLOUD_W, h: 0  /* set at spawn */  },
  ];

  let firstCloudDone = false;

  function spawnObstacle() {
    // After 100 pts, guarantee the first cloud spawns immediately; after that, full pool
    const pool = (score < 100 && !firstCloudDone)
      ? OBSTACLE_DEFS.filter(o => o.ground)
      : OBSTACLE_DEFS;
    // Force a cloud for the very first spawn after crossing 100
    const forceCloud = score >= 100 && !firstCloudDone;
    const t = forceCloud
      ? OBSTACLE_DEFS.find(o => !o.ground)
      : pool[Math.floor(Math.random() * pool.length)];
    if (!t.ground) firstCloudDone = true;

    // 35% chance to make single ground obstacles double height
    const makeTall = t.ground && !t.double && Math.random() < 0.35;
    const oh = t.ground ? (makeTall ? t.h * 2 : t.h) : Math.max(60, GY - CHAR_DUCK_H - 20);
    const oy = t.ground ? GY - oh : 0;

    obstacles.push({ ...t, x: W + 20, y: oy, h: oh });

    if (t.double) {
      obstacles.push({ ...t, x: W + 20 + t.w + 18, y: oy, h: oh, double: false });
    }
  }

  // ── Collision ─────────────────────────────────────────────────────────────

  function hits(ob) {
    const m  = 7;
    const lx = CHAR_X + m,           rx = CHAR_X + CHAR_W - m;
    const ty = char.y - char.h + m,  by = char.y - m;
    return lx < ob.x + ob.w - m && rx > ob.x + m &&
           ty < ob.y + ob.h - m && by > ob.y + m;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  function update() {
    if (state !== S.RUNNING) return;

    frame++;
    score = Math.floor(frame / 8);
    speed = Math.min(BASE_SPD + score * 0.0117, MAX_SPD);

    if (!char.ground) {
      char.vy += GRAVITY;
      char.y  += char.vy;
      if (char.y >= GY) { char.y = GY; char.vy = 0; char.ground = true; }
      if (char.y - char.h < 4) { char.y = 4 + char.h; char.vy = 0; }
    }

    if (char.ground && !char.ducking) {
      const thresh = Math.max(3, Math.round(7 - speed * 0.28));
      if (++char.animT >= thresh) { char.animT = 0; char.animF ^= 1; }
    }

    groundOffset = (groundOffset + speed) % 60;
    updateBg();

    if (--spawnCD <= 0) {
      spawnObstacle();
      spawnCD = Math.max(50, Math.round(195 - score * 0.11) + Math.floor(Math.random() * 48));
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= speed;
      if (obstacles[i].x + obstacles[i].w < 0) { obstacles.splice(i, 1); continue; }
      if (hits(obstacles[i])) { die(); return; }
    }
  }

  // ── Pixel helper ─────────────────────────────────────────────────────────
  // sq(bx, by, col, row, w, h, color)
  // row 0 = ground (by), increases upward.

  function sq(bx, by, col, row, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(bx + col * P), Math.round(by - (row + h) * P), w * P, h * P);
  }

  // ── Draw character ────────────────────────────────────────────────────────

  function drawChar() {
    const bx = CHAR_X;
    const by = char.y;
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (char.ducking) {
      sq(bx, by, -1, 1, 10, 4, OR);
      sq(bx, by, -1, 1, 10, 1, OR2);
      sq(bx, by,  0, 3,  2, 1, DK);
      sq(bx, by,  6, 3,  2, 1, DK);
      sq(bx, by,  0, 0,  2, 1, OR);
      sq(bx, by,  3, 0,  2, 1, OR2);
      sq(bx, by,  6, 0,  2, 1, OR);
    } else {
      sq(bx, by, 1, 9, 2, 2, OR);    // antenna L
      sq(bx, by, 5, 9, 2, 2, OR);    // antenna R
      sq(bx, by, 0, 3, 8, 6, OR);    // body
      sq(bx, by, 0, 3, 8, 1, OR2);   // belly shading
      sq(bx, by, 1, 6, 2, 2, DK);    // eye L
      sq(bx, by, 5, 6, 2, 2, DK);    // eye R
      if (char.animF === 0) {
        sq(bx, by, 1, 0, 2, 3, OR);  // left extended
        sq(bx, by, 5, 1, 2, 2, OR2); // right raised
      } else {
        sq(bx, by, 1, 1, 2, 2, OR2); // left raised
        sq(bx, by, 5, 0, 2, 3, OR);  // right extended
      }
    }
    ctx.restore();
  }

  // ── Draw brick wall ("CONTEXT LIMIT") ────────────────────────────────────

  function drawBrickWall(ob) {
    const BH = 11, BG = 2, BW = 34;
    const DARK = '#4A1A08', BRICK_A = '#7A2E18', BRICK_B = '#8F3820';

    ctx.save();
    ctx.beginPath(); ctx.rect(ob.x, ob.y, ob.w, ob.h); ctx.clip();

    ctx.fillStyle = DARK;
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

    let row = 0;
    for (let y = ob.y; y < ob.y + ob.h; y += BH + BG) {
      const off = row % 2 === 0 ? 0 : BW / 2;
      for (let x = ob.x - off; x < ob.x + ob.w + BW; x += BW + BG) {
        const bx = Math.max(x, ob.x);
        const bw = Math.min(x + BW, ob.x + ob.w) - bx;
        const bh = Math.min(y + BH, ob.y + ob.h) - y;
        if (bw > 0 && bh > 0) {
          ctx.fillStyle = row % 2 === 0 ? BRICK_A : BRICK_B;
          ctx.fillRect(bx, y, bw, bh);
          // subtle highlight on top edge of brick
          ctx.fillStyle = 'rgba(255,200,160,0.08)';
          ctx.fillRect(bx, y, bw, 2);
        }
      }
      row++;
    }
    ctx.restore();

    // Canvas text label centred on the brick face
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillText('CONTEXT', ob.x + ob.w / 2 + 1, ob.y + ob.h / 2 - 9 + 1);
    ctx.fillText('LIMIT',   ob.x + ob.w / 2 + 1, ob.y + ob.h / 2 + 9 + 1);
    ctx.fillStyle = '#FFD8C0';
    ctx.fillText('CONTEXT', ob.x + ob.w / 2, ob.y + ob.h / 2 - 9);
    ctx.fillText('LIMIT',   ob.x + ob.w / 2, ob.y + ob.h / 2 + 9);
    ctx.restore();
  }

  // ── Draw cloud ceiling ("OUT OF TOKENS") ──────────────────────────────────

  function drawCloud(ob) {
    const PUFF_R   = 14;
    const BODY_COL = 'rgba(16,26,50,0.97)';
    const EDGE_COL = 'rgba(80,130,220,0.35)';

    // Clip so puffs don't bleed outside the obstacle zone
    ctx.save();
    ctx.beginPath();
    ctx.rect(ob.x, ob.y, ob.w, ob.h + PUFF_R);
    ctx.clip();

    // Puff bumps on the bottom edge (upper semicircles facing downward into play area)
    const puffY = ob.y + ob.h;
    ctx.fillStyle = BODY_COL;
    for (let px = ob.x + PUFF_R; px < ob.x + ob.w - PUFF_R * 0.5; px += PUFF_R * 1.8) {
      ctx.beginPath();
      ctx.arc(px, puffY, PUFF_R, Math.PI, 0); // upper semicircle hangs downward
      ctx.fill();
    }

    // Main body (drawn after puffs so it covers puff tops cleanly)
    ctx.fillStyle = BODY_COL;
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

    ctx.restore();

    // Faint glow stroke along puff arcs
    ctx.save();
    ctx.strokeStyle = EDGE_COL;
    ctx.lineWidth   = 1.5;
    for (let px = ob.x + PUFF_R; px < ob.x + ob.w - PUFF_R * 0.5; px += PUFF_R * 1.8) {
      ctx.beginPath();
      ctx.arc(px, puffY, PUFF_R, Math.PI, 0);
      ctx.stroke();
    }

    // Scanline texture
    ctx.fillStyle = 'rgba(80,120,200,0.05)';
    for (let y = ob.y + 6; y < ob.y + ob.h; y += 10) {
      ctx.fillRect(ob.x, y, ob.w, 3);
    }
    ctx.restore();

    // Pixel label centred in body, clear of the puff zone
    const labelH = 28;
    const labelY = ob.y + Math.round((ob.h - labelH) / 2) - 4;
    drawPxLabel('OUT OF', 'TOKENS', ob.x, labelY, ob.w, labelH, '#A8C4F0');
  }

  // ── Draw obstacles (dispatch) ─────────────────────────────────────────────

  function drawObstacles() {
    for (const ob of obstacles) {
      if (ob.ground) drawBrickWall(ob);
      else           drawCloud(ob);
    }
  }

  // ── Round-rect helper ─────────────────────────────────────────────────────

  function rr(x, y, w, h, r, color) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }

  // ── Background scenery update + draw ─────────────────────────────────────

  function updateBg() {
    for (const c of bgClouds) { c.x -= speed * 0.18; if (c.x + 100 < 0) c.x += W + 150; }
    for (const b of bgBirds)  { b.x -= speed * 0.32; if (b.x + 100 < 0) b.x += W + 400; }
  }

  function drawBg() {
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.font = '13px monospace';
    const LINE_H = 14;

    // Clouds — multi-line, blue tint
    for (const c of bgClouds) {
      const cx = Math.round(c.x);
      const cy = Math.round(c.y * H);
      ctx.fillStyle = 'rgba(20,60,180,0.22)';
      c.lines.forEach((l, i) => ctx.fillText(l, cx + 1, cy + i * LINE_H + 1));
      ctx.fillStyle = 'rgba(90,155,255,0.52)';
      c.lines.forEach((l, i) => ctx.fillText(l, cx, cy + i * LINE_H));
      ctx.fillStyle = 'rgba(200,225,255,0.22)';
      c.lines.forEach((l, i) => ctx.fillText(l, cx - 1, cy + i * LINE_H - 1));
    }

    // Birds — rare, multi-line ASCII, muted blue-grey
    ctx.font = '11px monospace';
    const BIRD_LINE_H = 12;
    for (const b of bgBirds) {
      const bx = Math.round(b.x);
      const by = Math.round(b.y * H);
      ctx.fillStyle = 'rgba(20,40,80,0.18)';
      b.lines.forEach((l, i) => ctx.fillText(l, bx + 1, by + i * BIRD_LINE_H + 1));
      ctx.fillStyle = 'rgba(80,115,165,0.40)';
      b.lines.forEach((l, i) => ctx.fillText(l, bx, by + i * BIRD_LINE_H));
      ctx.fillStyle = 'rgba(180,200,240,0.16)';
      b.lines.forEach((l, i) => ctx.fillText(l, bx - 1, by + i * BIRD_LINE_H - 1));
    }

    ctx.restore();
  }

  // ── Draw ground ───────────────────────────────────────────────────────────

  function drawGround() {
    ctx.strokeStyle = C_TEXT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GY + 2); ctx.lineTo(W, GY + 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(18,32,51,0.18)'; ctx.lineWidth = 1.5;
    for (let x = groundOffset - 60; x < W + 60; x += 60) {
      ctx.beginPath(); ctx.moveTo(x,      GY + 10); ctx.lineTo(x + 22, GY + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 32, GY + 17); ctx.lineTo(x + 50, GY + 17); ctx.stroke();
    }
  }

  // ── HUD ───────────────────────────────────────────────────────────────────

  function drawHUD() {
    ctx.save();
    ctx.font = 'bold 15px monospace'; ctx.fillStyle = C_MUTED;
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText(
      'HI ' + String(hiScore).padStart(5, '0') + '  ' + String(score).padStart(5, '0'),
      W - 16, 16
    );
    ctx.restore();
  }

  // ── Overlays ──────────────────────────────────────────────────────────────

  function drawIdle() {
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_TEXT;
    ctx.fillText('DinoClaude', W / 2, H / 2 - 36);
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_MUTED;
    ctx.fillText('Tap or press Space to begin', W / 2, H / 2 - 10);
    if (W >= 480) {
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = C_SUBTLE;
      ctx.fillText('Jump over  CONTEXT LIMIT  ·  Duck under  OUT OF TOKENS', W / 2, H / 2 + 14);
      ctx.fillText('Tap to jump  ·  Tap and hold to duck', W / 2, H / 2 + 30);
    }
    ctx.restore();
  }

  function drawGameOver() {
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_TEXT;
    ctx.fillText('GAME OVER', W / 2, H / 2 - 40);
    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_MUTED;
    ctx.fillText('Score: ' + score, W / 2, H / 2 - 12);
    if (score > 0 && score >= hiScore) {
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = C_ACCENT;
      ctx.fillText('New high score!', W / 2, H / 2 + 12);
    }
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_MUTED;
    ctx.fillText('Tap or press Space to restart', W / 2, H / 2 + 42);
    ctx.restore();
  }

  // ── Main loop ─────────────────────────────────────────────────────────────

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawGround();
    drawObstacles();
    drawChar();
    drawHUD();
    if (state === S.IDLE) drawIdle();
    if (state === S.DEAD) drawGameOver();
  }

  function loop() { update(); draw(); requestAnimationFrame(loop); }

  char.y = GY;
  requestAnimationFrame(loop);
})();
