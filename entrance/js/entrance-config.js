/* =============================================================================
 * I3 CINEMATIC ENTRANCE — CONFIGURATION
 * -----------------------------------------------------------------------------
 * Scroll-driven vertical reveal across a registered image sequence.
 *
 * The nine images are progressive visual states of ONE environment, produced by
 * starting from the full connected city and stripping layers back to darkness.
 * The entrance reconstructs it in the opposite direction.
 *
 * Measured properties of the supplied set (see README for method):
 *   - all nine are 1672x941, aspect 1.7768
 *   - registration drift vs the master is at most 2px x / 1px y
 *   - ground luminance and cyan coverage are strictly monotonic in this order
 *   - ONE discontinuity: the sky brightens 3.26x between 07 and 08 (night->dawn)
 * ========================================================================== */
(function (global) {
  'use strict';

  var I3E = global.I3E = global.I3E || {};

  /* --- Easing -------------------------------------------------------------- */
  var ease = {
    smooth:    function (t) { return t * t * (3 - 2 * t); },
    smoother:  function (t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    outCubic:  function (t) { return 1 - Math.pow(1 - t, 3); },
    inOutCubic:function (t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; },
    outQuint:  function (t) { return 1 - Math.pow(1 - t, 5); }
  };
  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function span(p, a, b) { return clamp01((p - a) / (b - a || 1e-6)); }
  I3E.ease = ease; I3E.clamp01 = clamp01; I3E.span = span;

  /* --- Handoff destinations (key whitelist, never a raw URL) --------------- */
  var TARGETS = {
    overview:  { url: '../executive-overview.html', title: 'Executive Overview — I3',
                 logoX: 86, logoY: 26 },   /* after the back control          */
    hub:       { url: '../index.html',              title: 'Integrated Infrastructure Intelligence Hub',
                 logoX: 42, logoY: 26 },
    scenarios: { url: '../scenario-planning.html',  title: 'Scenario Planning — I3',
                 logoX: 86, logoY: 26 },
    supply:    { url: '../supply-demand.html',      title: 'Supply, Demand & Gap Management — I3',
                 logoX: 86, logoY: 26 }
  };

  /* --- The sequence, in forward (reconstruction) order ---------------------
   * `dx`/`dy` are registration corrections measured by phase correlation
   * against the master, applied as a translation so nothing jumps when the
   * divider passes over it.
   * ---------------------------------------------------------------------- */
  var SEQUENCE = [
    { file: '01-signals',    label: 'Scattered signals',      dx: -1, dy: -1 },
    { file: '02-fragments',  label: 'Fragmented connections', dx: -2, dy:  0 },
    { file: '03-corridors',  label: 'Major corridors',        dx: -1, dy:  0 },
    { file: '04-network',    label: 'Infrastructure network', dx: -1, dy:  0 },
    { file: '05-skeleton',   label: 'Infrastructure skeleton',dx: -1, dy:  0 },
    { file: '06-city-night', label: 'Physical city',          dx: -1, dy:  0 },
    { file: '07-city-dusk',  label: 'Urban fabric',           dx:  0, dy:  0 },
    { file: '08-city-dawn',  label: 'City at dawn',           dx:  0, dy:  0 },
    { file: '09-connected',  label: 'Connected city',         dx:  0, dy:  0 }   /* MASTER */
  ];

  /* --- Divider transitions --------------------------------------------------
   * Transition 0 reveals the first image out of the rendered darkness, so
   * there are SEQUENCE.length transitions in total.
   *
   * `weight` distributes scroll distance. `feather` is the soft boundary width
   * as a fraction of viewport width.
   *
   * The dawn step carries a deliberately wide feather. Images 01-07 are night
   * and 08-09 are dawn, so a tight boundary there would put two different
   * times of day side by side and read as a photo comparison. A wide band
   * makes the light sweep across the city the way dawn actually does.
   * ---------------------------------------------------------------------- */
  var TRANSITIONS = [
    { to: 0, weight: 1.00, feather: 0.170, glow: 0.45, note: 'darkness to signals' },
    { to: 1, weight: 0.90, feather: 0.055, glow: 0.80 },
    { to: 2, weight: 1.00, feather: 0.055, glow: 0.95 },
    { to: 3, weight: 1.00, feather: 0.055, glow: 0.90 },
    { to: 4, weight: 0.95, feather: 0.060, glow: 0.80 },
    { to: 5, weight: 1.15, feather: 0.065, glow: 0.70, note: 'city emerges from its infrastructure' },
    { to: 6, weight: 0.90, feather: 0.075, glow: 0.55 },
    { to: 7, weight: 1.05, feather: 0.300, glow: 0.30, note: 'DAWN — wide feather, see above' },
    { to: 8, weight: 1.70, feather: 0.070, glow: 1.00, note: 'physical city becomes connected city' }
  ];

  I3E.config = {
    targets: TARGETS,
    defaultTarget: 'overview',
    sequence: SEQUENCE,
    transitions: TRANSITIONS,
    masterIndex: SEQUENCE.length - 1,
    imageAspect: 1672 / 941,

    assetPath: 'assets/sequence/',
    mobileSuffix: '@1024',
    mobileMaxWidth: 900,          /* css px below which the 1024 set is used  */

    /* --- Master progress map (normalised 0..1, overlapping) ---------------- */
    dividerEnd: 0.800,            /* chain of reveals finishes here           */
    phases: {
      complexity:     [0.775, 0.890],
      clarity:        [0.870, 0.948],
      brand:          [0.909, 0.982],
      transformation: [0.944, 1.000]
    },

    /* --- Scroll ------------------------------------------------------------ */
    scrollHeightVh: 940,          /* tall scroller behind the pinned stage    */
    scrollSmoothing: 0.115,       /* lerp toward raw scroll; heavier = calmer */

    /* --- Alternate entry modes --------------------------------------------- */
    shortStartP: 0.760,           /* returning visitors join near the climax  */
    shortDurationMs: 2300,
    reducedP: 0.905,              /* reduced motion composes this still frame */
    reducedHoldMs: 900,
    skipMinMs: 420,
    skipMaxMs: 700,

    /* Bounded wait so the handoff never lands before the platform is up. */
    holdP: 0.940,
    holdMaxMs: 2200,

    /* --- Session ------------------------------------------------------------ */
    seenKey: 'i3-entrance-seen',
    authKey: 'i3-auth',
    authPass: 'I-Cubed',

    /* --- Boundary treatment -------------------------------------------------
     * A thin intelligence plane, not a slider handle.
     * ---------------------------------------------------------------------- */
    boundary: {
      lineWidth: 1.25,
      lineColor: 'rgba(214, 240, 255, 0.92)',
      bloomWidth: 34,
      bloomColor: [150, 214, 255],
      markerRadius: 3.0,
      revealGlowWidth: 120       /* additive band of newly-introduced light   */
    },

    /* --- Palette (from the live platform, unchanged) ------------------------ */
    palette: {
      bg:       '#0D0D14',
      bgDeep:   '#08080E',
      cyan:     '#4DA6FF',
      amber:    '#FFAA00',
      red:      '#FF5C5C',
      eyYellow: '#FFE600',
      text:     '#FFFFFF',
      textDim:  '#B0B0C4'
    },

    /* --- Priority zones ------------------------------------------------------
     * Normalised master-frame coordinates of structurally meaningful places.
     * The clarity phase retains emphasis here and lets everything else recede.
     * These are visual anchors in the cinematic image only. They are NOT
     * claims about real infrastructure locations.
     * ---------------------------------------------------------------------- */
    priorityZones: [
      { x: 0.362, y: 0.775, r: 0.150, kind: 'critical', note: 'primary interchange' },
      { x: 0.722, y: 0.617, r: 0.125, kind: 'primary',  note: 'cable-stayed crossing' },
      { x: 0.528, y: 0.285, r: 0.135, kind: 'primary',  note: 'central skyline' },
      { x: 0.790, y: 0.895, r: 0.105, kind: 'attention',note: 'utility cluster' },
      { x: 0.856, y: 0.330, r: 0.085, kind: 'primary',  note: 'eastern node' }
    ],

    /* --- Cinematic typography (live DOM, minimum needed) -------------------- */
    copy: [
      { id: 'complexity', line: 'FROM COMPLEXITY.', enter: 0.790, exit: 0.876 },
      { id: 'clarity',    line: 'TO CLARITY.',      enter: 0.874, exit: 0.918 }
    ],

    /* --- Quality tiers ------------------------------------------------------ */
    tiers: {
      high:   { dpr: 1.75, pulses: 26, featherSlices: 14, revealGlow: true },
      medium: { dpr: 1.35, pulses: 16, featherSlices: 10, revealGlow: true },
      low:    { dpr: 1.00, pulses:  8, featherSlices:  6, revealGlow: false }
    },
    perfBudgetMs: 26,
    perfWindow: 40
  };

  /* --- Derived: absolute scroll windows for each transition ----------------- */
  (function buildWindows(cfg) {
    var total = cfg.transitions.reduce(function (s, t) { return s + t.weight; }, 0);
    var acc = 0;
    cfg.transitions.forEach(function (t) {
      t.start = (acc / total) * cfg.dividerEnd;
      acc += t.weight;
      t.end = (acc / total) * cfg.dividerEnd;
    });
  })(I3E.config);

})(window);
