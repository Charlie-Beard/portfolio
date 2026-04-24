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

  // ── Sound (Web Audio API) ─────────────────────────────────────────────────
  // Lazy-initialised on first user gesture to satisfy browser autoplay policy.
  let audioCtx = null;

  function initAudio() {
    if (audioCtx) return;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
  }

  function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ac = audioCtx;
    const t  = ac.currentTime;

    function tone(freq, wave, startT, dur, vol) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = wave;
      o.frequency.setValueAtTime(freq, startT);
      g.gain.setValueAtTime(vol, startT);
      g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
      o.start(startT); o.stop(startT + dur + 0.01);
    }

    function sweep(f0, f1, wave, startT, dur, vol) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = wave;
      o.frequency.setValueAtTime(f0, startT);
      o.frequency.exponentialRampToValueAtTime(f1, startT + dur);
      g.gain.setValueAtTime(vol, startT);
      g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
      o.start(startT); o.stop(startT + dur + 0.01);
    }

    switch (type) {
      case 'jump':       sweep(220, 440, 'sine',     t,    0.08, 0.12); break;
      case 'land':       sweep(160,  80, 'triangle', t,    0.06, 0.18); break;
      case 'duck-start': sweep(300, 180, 'sine',     t,    0.07, 0.08); break;
      case 'duck-end':   sweep(180, 260, 'sine',     t,    0.06, 0.07); break;
      case 'die':       [330, 220, 165].forEach((f, i) => tone(f, 'square', t + i * 0.12, 0.10, 0.10)); break;
      case 'milestone': [440, 660].forEach((f, i)       => tone(f, 'sine',   t + i * 0.10, 0.15, 0.10)); break;
      case 'hiscore':   [440, 554, 659].forEach((f, i)  => tone(f, 'sine',   t + i * 0.12, 0.18, 0.12)); break;
    }
  }

  // ── Screen effects ────────────────────────────────────────────────────────
  let shakeFr = 0, flashFr = 0;

  // ── Particles ─────────────────────────────────────────────────────────────
  let particles = [];

  function spawnDust() {
    // Landing: orange particles burst upward from feet
    const cx = CHAR_X + CHAR_W * 0.5;
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: cx + (Math.random() - 0.5) * 28,
        y: GY,
        dx: (Math.random() - 0.5) * 2.2,
        dy: -(Math.random() * 1.8 + 0.4),
        life: 18, max: 18, rgb: '212,103,61',
      });
    }
  }

  function spawnJumpDust() {
    // Take-off: orange particles pushed outward and slightly downward
    const cx = CHAR_X + CHAR_W * 0.5;
    for (let i = 0; i < 5; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      particles.push({
        x: cx + side * (6 + Math.random() * 12),
        y: GY,
        dx: side * (1.2 + Math.random() * 1.4),
        dy: Math.random() * 0.8,           // downward push-off
        life: 14, max: 14, rgb: '212,103,61',
      });
    }
  }

  function spawnDuckDust(rising) {
    // Duck start/end: blue particles fan outward from character sides
    const cx = CHAR_X + CHAR_W * 0.5;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      particles.push({
        x: cx + side * (8 + Math.random() * 10),
        y: GY - (rising ? 14 : 4),
        dx: side * (1.0 + Math.random() * 1.2),
        dy: rising ? -(0.8 + Math.random() * 1.2) : (Math.random() * 0.4),
        life: 14, max: 14, rgb: '90,148,255',
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.dx; p.y += p.dy; p.dy += 0.14; p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const a  = p.life / p.max;
      const sz = Math.round(2 + a * 2);
      ctx.fillStyle = `rgba(${p.rgb},${(a * 0.62).toFixed(2)})`;
      ctx.fillRect(Math.round(p.x - sz / 2), Math.round(p.y - sz / 2), sz, sz);
    }
  }

  // ── Score milestones ──────────────────────────────────────────────────────
  const MILESTONES = [
    { score: 100,  msg: 'Context loading...'          },
    { score: 250,  msg: 'Running on vibes'             },
    { score: 500,  msg: 'Full context window'          },
    { score: 750,  msg: 'Entering Sonnet territory'    },
    { score: 1000, msg: 'Anthropic certified'          },
    { score: 1500, msg: 'Opus mode unlocked'           },
    { score: 2000, msg: 'Beyond the context limit'     },
  ];
  let milestoneMsg = null, milestoneFr = 0, nextMilestoneIdx = 0;

  function drawMilestone() {
    if (!milestoneMsg || milestoneFr <= 0) return;
    const elapsed = 90 - milestoneFr;
    let alpha;
    if      (elapsed < 10) alpha = elapsed / 10;
    else if (elapsed < 75) alpha = 1;
    else                   alpha = (90 - elapsed) / 15;
    alpha = Math.max(0, Math.min(1, alpha));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const tw  = ctx.measureText(milestoneMsg).width;
    const pad = 18;
    const bw  = tw + pad * 2, bh = 32;
    const cy  = H * 0.28;
    rr(W / 2 - bw / 2, cy - bh / 2, bw, bh, bh / 2, 'rgba(31,95,214,0.12)');
    ctx.fillStyle = C_ACCENT;
    ctx.fillText(milestoneMsg, W / 2, cy);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── Death screen state ────────────────────────────────────────────────────
  const DEATH_LINES = [
    'Context limit reached.',
    'Tokens exhausted.',
    'Rate limit hit.',
    'Session terminated.',
  ];
  let deathLine = '', deathScore = 0, deathDisplayScore = 0, deathFrame = 0;

  // ── Share button ──────────────────────────────────────────────────────────
  let shareBtnRect = null, shareConfirmFr = 0;

  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      shareConfirmFr = 90;
    } catch (_) {}
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => { shareConfirmFr = 90; }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function handleShare() {
    const msg = `I scored ${deathScore} in DinoClaude 🦕\nJump the CONTEXT LIMIT · Duck the OUT OF TOKENS\n${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'DinoClaude', text: msg }).catch(() => copyToClipboard(msg));
    } else {
      copyToClipboard(msg);
    }
  }

  // ── AutoClicker ───────────────────────────────────────────────────────────
  let autoMode      = false;
  let autoHiScore   = 0;
  let showAutoModal = false;

  // Hit-test rects set each frame during draw (null when not visible)
  let autoBtnRect       = null; // "AutoClicker" button on idle screen
  let autoIndicatorRect = null; // pulsing "AUTO" badge during running
  let modalCancelRect   = null; // modal Cancel button
  let modalStartRect    = null; // modal Start AutoClicker button
  let stopAutoBtnRect   = null; // "Stop AutoClicker" on game-over screen in auto mode
  let tryAutoBtnRect    = null; // "⚡ AutoClicker" on normal game-over screen

  try { autoHiScore = parseInt(localStorage.getItem('dc-hi-auto'), 10) || 0; } catch (_) {}

  function stopAutoMode() {
    autoMode      = false;
    showAutoModal = false;
    state         = S.IDLE;
    obstacles     = [];
    particles     = [];
    char.y        = GY; char.vy = 0; char.ground = true; char.ducking = false;
    char.animF    = 0;  char.animT = 0;
  }

  // ── AutoClicker AI ────────────────────────────────────────────────────────
  // Called every running frame when autoMode is on.
  // Scans upcoming obstacles and fires jump() / duck() at the right distance.
  //
  // Jump window: the character clears a 68 px obstacle from frame 6–88 of its
  // 93-frame arc. Jumping when the obstacle is speed×28 px ahead puts arrival
  // at frame 28 — comfortably inside the safe window at all speeds.
  //
  // Duck: engage when a cloud ceiling is within speed×22 px or overhead;
  // release as soon as no cloud remains within that range.

  function autoAct() {
    let needsDuck  = false;
    let shouldJump = false;

    for (const ob of obstacles) {
      const rightEdge = ob.x + ob.w;
      if (rightEdge < CHAR_X - 10) continue; // already fully past

      const distToChar = ob.x - (CHAR_X + CHAR_W);

      if (!ob.ground) {
        // Cloud ceiling — duck when approaching or overhead
        if (distToChar < Math.max(160, speed * 22)) needsDuck = true;
      } else {
        // Ground obstacle — jump
        const jumpThreshold = Math.max(180, speed * 28);
        if (distToChar < jumpThreshold && distToChar > -(ob.w + CHAR_W)) shouldJump = true;
      }
    }

    if (needsDuck) {
      if (!char.ducking) duck(true);
    } else {
      if (char.ducking) duck(false);
      if (shouldJump && char.ground) jump();
    }
  }

  // ── AutoClicker draw helpers ──────────────────────────────────────────────

  function drawAutoBtn() {
    // "AutoClicker" button in the top-left of the idle screen
    const bw = 130, bh = 32;
    const bx = 14, by = 14;
    autoBtnRect = { x: bx, y: by, w: bw, h: bh };
    rr(bx, by, bw, bh, 8, C_ACCENT);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('⚡ AutoClicker', bx + bw / 2, by + bh / 2);
    ctx.restore();
  }

  function drawAutoIndicator() {
    // Pulsing badge in top-left while autoMode is running — click to stop
    const pulse = 0.72 + 0.28 * Math.sin(frame * 0.13);
    const bw = 68, bh = 26;
    const bx = 14, by = 14;
    autoIndicatorRect = { x: bx, y: by, w: bw, h: bh };
    ctx.save();
    ctx.globalAlpha = pulse;
    rr(bx, by, bw, bh, 7, C_ACCENT);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('● AUTO', bx + bw / 2, by + bh / 2);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawAutoModal() {
    if (!showAutoModal) return;

    // Dim backdrop
    ctx.fillStyle = 'rgba(18,32,51,0.58)';
    ctx.fillRect(0, 0, W, H);

    // Card
    const mw = Math.min(360, W - 40);
    const mh = 210;
    const mx = W / 2 - mw / 2;
    const my = H / 2 - mh / 2;
    rr(mx, my, mw, mh, 14, '#ffffff');

    ctx.save();
    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_TEXT;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('AutoClicker', W / 2, my + 46);

    // Description lines
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_MUTED;
    const lines = [
      'AutoClicker will automatically jump and duck',
      'to see how far an automated machine can get.',
      'Scores are tracked on a separate leaderboard.',
    ];
    lines.forEach((l, i) => ctx.fillText(l, W / 2, my + 80 + i * 21));

    // Buttons
    const cancelW = 100, startW = 148, btnH = 36, gap = 10;
    const totalBW = cancelW + gap + startW;
    const cbx = W / 2 - totalBW / 2;
    const sbx = cbx + cancelW + gap;
    const btnY = my + mh - 58;

    // Cancel
    modalCancelRect = { x: cbx, y: btnY, w: cancelW, h: btnH };
    rr(cbx, btnY, cancelW, btnH, 8, 'rgba(18,32,51,0.09)');
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_TEXT;
    ctx.textBaseline = 'middle';
    ctx.fillText('Cancel', cbx + cancelW / 2, btnY + btnH / 2);

    // Start AutoClicker
    modalStartRect = { x: sbx, y: btnY, w: startW, h: btnH };
    rr(sbx, btnY, startW, btnH, 8, C_ACCENT);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Start AutoClicker', sbx + startW / 2, btnY + btnH / 2);

    ctx.restore();
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  function inRect(x, y, r) {
    return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function canvasXY(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top)  * (H / rect.height),
    };
  }

  // ── Background scenery ────────────────────────────────────────────────────
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
      char.vy = JUMP_VY; char.ground = false;
      buzz(12); playSound('jump'); spawnJumpDust();
    }
  }

  function duck(on) {
    if (state !== S.RUNNING) return;
    if (on === char.ducking) return;
    char.ducking = on;
    if (on && !char.ground) char.vy = Math.max(char.vy, 5);
    playSound(on ? 'duck-start' : 'duck-end');
    if (char.ground) spawnDuckDust(!on);
  }

  function begin() {
    state = S.RUNNING; score = 0; speed = BASE_SPD; frame = 0;
    obstacles = []; spawnCD = 80; groundOffset = 0;
    firstCloudDone = false; initBg();
    char.y = GY; char.vy = 0; char.ground = true;
    char.ducking = false; char.animF = 0; char.animT = 0;
    particles = [];
    milestoneMsg = null; milestoneFr = 0; nextMilestoneIdx = 0;
    shakeFr = 0; flashFr = 0;
    shareBtnRect = null; shareConfirmFr = 0;
    stopAutoBtnRect = null; tryAutoBtnRect = null;
  }

  function die() {
    state = S.DEAD;
    buzz([30, 20, 70]);
    flashFr = 15;
    deathScore        = score;
    deathDisplayScore = 0;
    deathFrame        = 0;
    deathLine         = DEATH_LINES[Math.floor(Math.random() * DEATH_LINES.length)];

    if (autoMode) {
      if (score > autoHiScore) {
        autoHiScore = score;
        try { localStorage.setItem('dc-hi-auto', autoHiScore); } catch (_) {}
        setTimeout(() => playSound('hiscore'), 350);
      } else {
        playSound('die');
      }
    } else {
      if (score > hiScore) {
        hiScore = score;
        try { localStorage.setItem('dc-hi', hiScore); } catch (_) {}
        setTimeout(() => playSound('hiscore'), 350);
      } else {
        playSound('die');
      }
    }
  }

  // ── Keyboard input ────────────────────────────────────────────────────────
  // Space tap  (released before 150 ms) → jump
  // Space hold (still down after 150 ms) → duck until released
  // Escape → close modal or stop AutoClicker

  let spaceHoldTimer = null;
  let spacePending   = false;
  let spaceDown      = false;

  window.addEventListener('keydown', e => {
    if (e.code === 'Escape') {
      if (showAutoModal) { showAutoModal = false; return; }
      if (autoMode)      { stopAutoMode(); return; }
      return;
    }

    if (e.code !== 'Space' || spaceDown) return;
    e.preventDefault();
    initAudio();

    // Block space if modal is open
    if (showAutoModal) return;

    spaceDown = true;

    if (state !== S.RUNNING) {
      jump();
    } else if (!autoMode) {
      // Manual control only — auto mode drives its own inputs
      spacePending   = true;
      spaceHoldTimer = setTimeout(() => { spacePending = false; duck(true); }, 150);
    }
  });

  window.addEventListener('keyup', e => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    spaceDown = false;
    clearTimeout(spaceHoldTimer);
    if (!autoMode) {
      if (spacePending) { spacePending = false; jump(); }
      else              { duck(false); }
    }
  });

  // ── Touch input ───────────────────────────────────────────────────────────

  let touchId = null, touchStart = 0, touchHoldTimer = null, touchDucking = false;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    initAudio();
    if (touchId !== null) return;
    touchId      = e.changedTouches[0].identifier;
    touchStart   = Date.now();
    touchDucking = false;

    // Don't start hold timer if modal is open or auto mode is controlling
    if (showAutoModal || (autoMode && state === S.RUNNING)) return;
    touchHoldTimer = setTimeout(() => { touchDucking = true; duck(true); }, 150);
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== touchId) continue;
      touchId = null;
      clearTimeout(touchHoldTimer);

      const rect = canvas.getBoundingClientRect();
      const tx = (t.clientX - rect.left) * (W / rect.width);
      const ty = (t.clientY - rect.top)  * (H / rect.height);

      // Modal buttons
      if (showAutoModal) {
        if (inRect(tx, ty, modalCancelRect)) { showAutoModal = false; return; }
        if (inRect(tx, ty, modalStartRect))  { showAutoModal = false; autoMode = true; begin(); return; }
        return; // tap outside modal — close it
      }

      // AutoClicker button on idle screen
      if (state === S.IDLE && inRect(tx, ty, autoBtnRect)) {
        showAutoModal = true; return;
      }

      // AUTO indicator badge (stop auto mode)
      if (autoMode && state === S.RUNNING && inRect(tx, ty, autoIndicatorRect)) {
        stopAutoMode(); return;
      }

      // Stop AutoClicker button on game-over screen
      if (autoMode && state === S.DEAD && inRect(tx, ty, stopAutoBtnRect)) {
        stopAutoMode(); return;
      }

      // Share button on game-over screen (non-auto mode)
      if (!autoMode && state === S.DEAD && inRect(tx, ty, shareBtnRect)) {
        handleShare(); return;
      }
      if (!autoMode && state === S.DEAD && inRect(tx, ty, tryAutoBtnRect)) {
        autoMode = true; begin(); return;
      }

      if (!touchDucking) {
        if (!autoMode || state !== S.RUNNING) jump();
      } else {
        touchDucking = false; duck(false);
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchcancel', e => {
    e.preventDefault(); touchId = null;
    clearTimeout(touchHoldTimer);
    if (touchDucking) { touchDucking = false; duck(false); }
  }, { passive: false });

  // ── Mouse click handler ───────────────────────────────────────────────────

  canvas.addEventListener('click', e => {
    const pos = canvasXY(e);

    if (showAutoModal) {
      if (inRect(pos.x, pos.y, modalCancelRect)) { showAutoModal = false; return; }
      if (inRect(pos.x, pos.y, modalStartRect))  { showAutoModal = false; autoMode = true; begin(); return; }
      showAutoModal = false; return; // click outside closes modal
    }

    if (state === S.IDLE && inRect(pos.x, pos.y, autoBtnRect)) {
      showAutoModal = true; return;
    }

    if (autoMode && state === S.RUNNING && inRect(pos.x, pos.y, autoIndicatorRect)) {
      stopAutoMode(); return;
    }

    if (autoMode && state === S.DEAD && inRect(pos.x, pos.y, stopAutoBtnRect)) {
      stopAutoMode(); return;
    }

    if (!autoMode && state === S.DEAD && inRect(pos.x, pos.y, shareBtnRect)) {
      handleShare(); return;
    }
    if (!autoMode && state === S.DEAD && inRect(pos.x, pos.y, tryAutoBtnRect)) {
      autoMode = true; begin();
    }
  });

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

  function drawPxLabel(line1, line2, rx, ry, rw, rh, color) {
    const lh  = 5 * FS + 4;
    const tot = lh * 2 - 4;
    const ty  = ry + Math.round((rh - tot) / 2);
    drawPxText(line1, rx + Math.round((rw - pxW(line1)) / 2), ty,      color);
    drawPxText(line2, rx + Math.round((rw - pxW(line2)) / 2), ty + lh, color);
  }

  // ── Obstacle definitions ──────────────────────────────────────────────────

  const BRICK_W = 130;
  const CLOUD_W = 160;

  const OBSTACLE_DEFS = [
    { ground: true,  w: BRICK_W, h: 68                    },
    { ground: true,  w: BRICK_W, h: 68, double: true      },
    { ground: false, w: CLOUD_W, h: 0  /* set at spawn */  },
  ];

  let firstCloudDone = false;

  function spawnObstacle() {
    const pool = (score < 100 && !firstCloudDone)
      ? OBSTACLE_DEFS.filter(o => o.ground)
      : OBSTACLE_DEFS;
    const forceCloud = score >= 100 && !firstCloudDone;
    const t = forceCloud
      ? OBSTACLE_DEFS.find(o => !o.ground)
      : pool[Math.floor(Math.random() * pool.length)];
    if (!t.ground) firstCloudDone = true;

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
    // Dead state: tick death-screen animation; auto-restart after 2.5 s
    if (state === S.DEAD) {
      deathFrame++;
      deathDisplayScore = Math.min(
        deathScore,
        Math.floor(deathScore * Math.min(1, deathFrame / 60))
      );
      if (shareConfirmFr > 0) shareConfirmFr--;
      if (autoMode && deathFrame >= 150) begin(); // auto-restart
      return;
    }
    if (state !== S.RUNNING) return;

    frame++;
    score = Math.floor(frame / 8);
    speed = Math.min(BASE_SPD + score * 0.0117, MAX_SPD);

    const wasGround = char.ground;

    if (!char.ground) {
      char.vy += GRAVITY;
      char.y  += char.vy;
      if (char.y >= GY) { char.y = GY; char.vy = 0; char.ground = true; }
      if (char.y - char.h < 4) { char.y = 4 + char.h; char.vy = 0; }
    }

    // Landing: spawn dust + play land sound
    if (!wasGround && char.ground) { spawnDust(); playSound('land'); }

    if (char.ground && !char.ducking) {
      const thresh = Math.max(3, Math.round(7 - speed * 0.28));
      if (++char.animT >= thresh) { char.animT = 0; char.animF ^= 1; }
    }

    groundOffset = (groundOffset + speed) % 60;
    updateBg();
    updateParticles();

    // AutoClicker AI
    if (autoMode) autoAct();

    // Milestone check
    if (nextMilestoneIdx < MILESTONES.length &&
        score >= MILESTONES[nextMilestoneIdx].score) {
      milestoneMsg = MILESTONES[nextMilestoneIdx].msg;
      milestoneFr  = 90;
      nextMilestoneIdx++;
      playSound('milestone');
    }
    if (milestoneFr > 0) milestoneFr--;

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
          ctx.fillStyle = 'rgba(255,200,160,0.08)';
          ctx.fillRect(bx, y, bw, 2);
        }
      }
      row++;
    }
    ctx.restore();

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

    ctx.save();
    ctx.beginPath();
    ctx.rect(ob.x, ob.y, ob.w, ob.h + PUFF_R);
    ctx.clip();

    const puffY = ob.y + ob.h;
    ctx.fillStyle = BODY_COL;
    for (let px = ob.x + PUFF_R; px < ob.x + ob.w - PUFF_R * 0.5; px += PUFF_R * 1.8) {
      ctx.beginPath();
      ctx.arc(px, puffY, PUFF_R, Math.PI, 0);
      ctx.fill();
    }

    ctx.fillStyle = BODY_COL;
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = EDGE_COL;
    ctx.lineWidth   = 1.5;
    for (let px = ob.x + PUFF_R; px < ob.x + ob.w - PUFF_R * 0.5; px += PUFF_R * 1.8) {
      ctx.beginPath();
      ctx.arc(px, puffY, PUFF_R, Math.PI, 0);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(80,120,200,0.05)';
    for (let y = ob.y + 6; y < ob.y + ob.h; y += 10) {
      ctx.fillRect(ob.x, y, ob.w, 3);
    }
    ctx.restore();

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

  // ── Background colour (atmospheric shift by score) ────────────────────────

  function lerpC(a, b, t) {
    return [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t));
  }

  function getBgColor() {
    const WHITE = [255, 255, 255];
    const WARM  = [255, 251, 245];
    const ELEC  = [240, 244, 255];
    const DUSK  = [232, 238, 255];
    let rgb;
    if      (score < 400)  rgb = WHITE;
    else if (score < 700)  rgb = lerpC(WHITE, WARM,  (score - 400) / 300);
    else if (score < 1000) rgb = lerpC(WARM,  ELEC,  (score - 700) / 300);
    else                   rgb = lerpC(ELEC,  DUSK,  Math.min(1, (score - 1000) / 500));
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
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
    const hi    = autoMode ? autoHiScore : hiScore;
    const label = autoMode ? 'AUTO HI' : 'HI';
    ctx.fillText(
      label + ' ' + String(hi).padStart(5, '0') + '  ' + String(score).padStart(5, '0'),
      W - 16, 16
    );
    ctx.restore();
  }

  // ── Overlays ──────────────────────────────────────────────────────────────

  function drawIdle() {
    // AutoClicker button — top-left
    drawAutoBtn();

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
    ctx.fillStyle = 'rgba(240,244,255,0.88)';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

    // Claude-flavored death line
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_SUBTLE;
    ctx.fillText(deathLine, W / 2, H / 2 - 52);

    // GAME OVER
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_TEXT;
    ctx.fillText('GAME OVER', W / 2, H / 2 - 28);

    // Animated score count-up
    const scoreLabel = autoMode ? 'Auto score: ' : 'Score: ';
    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = C_MUTED;
    ctx.fillText(scoreLabel + deathDisplayScore, W / 2, H / 2);

    // High score celebration
    const isNewHi = autoMode
      ? (deathScore > 0 && deathScore >= autoHiScore)
      : (deathScore > 0 && deathScore >= hiScore);
    if (isNewHi) {
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = C_ACCENT;
      ctx.fillText(autoMode ? 'New auto record!' : 'New high score!', W / 2, H / 2 + 22);
    }

    const btnW = 160, btnH = 36;
    const btnX = W / 2 - btnW / 2;
    const btnY = H / 2 + 40;
    ctx.textBaseline = 'middle';

    if (autoMode) {
      // Stop AutoClicker button
      stopAutoBtnRect = { x: btnX, y: btnY, w: btnW, h: btnH };
      rr(btnX, btnY, btnW, btnH, 8, '#516072');
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Stop AutoClicker', W / 2, btnY + btnH / 2);

      // Auto-restart notice
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = C_SUBTLE;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Restarting automatically…', W / 2, H / 2 + 96);
    } else {
      // Share button
      shareBtnRect = { x: btnX, y: btnY, w: btnW, h: btnH };
      rr(btnX, btnY, btnW, btnH, 8, shareConfirmFr > 0 ? '#1e7a3c' : C_ACCENT);
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(shareConfirmFr > 0 ? '✓ Copied!' : 'Share score', W / 2, btnY + btnH / 2);

      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = C_SUBTLE;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Tap or press Space to restart', W / 2, H / 2 + 88);

      // AutoClicker switch — subtle secondary button
      const acW = 148, acH = 28;
      const acX = W / 2 - acW / 2, acY = H / 2 + 100;
      tryAutoBtnRect = { x: acX, y: acY, w: acW, h: acH };
      rr(acX, acY, acW, acH, acH / 2, 'rgba(31,95,214,0.10)');
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = C_ACCENT;
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ Try AutoClicker', W / 2, acY + acH / 2);
    }

    ctx.restore();
  }

  // ── Main loop ─────────────────────────────────────────────────────────────

  function draw() {
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, W, H);

    // Screen shake wraps the game world (not the HUD or overlays)
    ctx.save();
    if (shakeFr > 0) {
      const amp = shakeFr * 0.32;
      ctx.translate(
        (Math.random() - 0.5) * amp * 2,
        (Math.random() - 0.5) * amp * 2
      );
      shakeFr--;
    }

    drawBg();
    drawGround();
    drawObstacles();
    drawParticles();
    drawChar();

    ctx.restore(); // end shake region

    drawHUD();
    drawMilestone();

    // AutoClicker running indicator (top-left, pulsing)
    if (autoMode && state === S.RUNNING) drawAutoIndicator();

    // Death flash (above HUD, below state overlay)
    if (flashFr > 0) {
      ctx.fillStyle = `rgba(200,50,30,${((flashFr / 15) * 0.32).toFixed(2)})`;
      ctx.fillRect(0, 0, W, H);
      flashFr--;
    }

    if (state === S.IDLE) drawIdle();
    if (state === S.DEAD) drawGameOver();

    // Modal draws last — on top of everything
    drawAutoModal();
  }

  function loop() { update(); draw(); requestAnimationFrame(loop); }

  char.y = GY;
  requestAnimationFrame(loop);
})();
