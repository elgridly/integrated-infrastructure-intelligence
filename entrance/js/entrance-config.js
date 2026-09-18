/* =============================================================================
 * I3 CINEMATIC ENTRANCE — CONFIGURATION
 * -----------------------------------------------------------------------------
 * Single source of truth for timing, palette, streams, camera choreography and
 * copy. Every value the cinematic reads lives here so the sequence can be tuned
 * without touching render or simulation code.
 *
 * Colours are taken verbatim from the live platform (STREAM_COLORS in
 * executive-overview.html and the :root tokens in css/landing.css). No new
 * palette is introduced.
 * ========================================================================== */
(function (global) {
  'use strict';

  var I3E = global.I3E = global.I3E || {};

  /* --- Destination whitelist -------------------------------------------------
   * ?to=<key> selects where the entrance hands off. Keys only (never a raw
   * URL) so the iframe src can't be pointed at an arbitrary origin.
   * ------------------------------------------------------------------------ */
  var TARGETS = {
    overview:  { url: '../executive-overview.html', title: 'Executive Overview — I3' },
    hub:       { url: '../index.html',              title: 'Integrated Infrastructure Intelligence Hub' },
    scenarios: { url: '../scenario-planning.html',  title: 'Scenario Planning — I3' },
    supply:    { url: '../supply-demand.html',      title: 'Supply, Demand & Gap Management — I3' }
  };

  I3E.config = {

    targets: TARGETS,
    defaultTarget: 'overview',

    /* --- Duration ---------------------------------------------------------- */
    durationMs:      10200,  /* full first-visit entrance (~10s)               */
    shortDurationMs:  2300,  /* returning-visitor branded transition           */
    shortStartP:      0.775, /* returning visitors join at "complexity->clarity"*/
    reducedHoldMs:    1100,  /* reduced-motion: how long the still frame holds */
    reducedP:         0.815, /* reduced-motion: the frame that gets composed   */

    /* Skip resolves the remaining timeline rather than cutting to black.      */
    skipMinMs: 520,
    skipMaxMs: 1150,

    /* If the platform behind the canvas is still loading we hold here, but    */
    /* never for longer than holdMaxMs. The executive is never trapped.        */
    holdP:      0.865,
    holdMaxMs:  2400,

    /* --- Session behaviour -------------------------------------------------- */
    seenKey: 'i3-entrance-seen',   /* sessionStorage, not a tracking cookie    */
    authKey: 'i3-auth',            /* matches the existing platform gate       */
    authPass: 'I-Cubed',

    /* --- Master phase map (normalised 0..1, deliberately overlapping) ------- */
    phases: {
      darkness:        [0.00, 0.10],
      scattered:       [0.05, 0.23],
      firstConnection: [0.17, 0.34],
      riyadhReveal:    [0.26, 0.46],
      infraLayers:     [0.34, 0.58],
      ecosystem:       [0.48, 0.68],
      uncertainty:     [0.58, 0.75],
      intelligence:    [0.67, 0.84],
      clarity:         [0.77, 0.91],
      transformation:  [0.87, 1.00]
    },

    /* --- Platform palette (verbatim) --------------------------------------- */
    palette: {
      bg:          '#0D0D14',
      bgDeep:      '#08080E',
      eyYellow:    '#FFE600',
      textPrimary: '#FFFFFF',
      textDim:     '#B0B0C4',
      textFaint:   '#8585A0',
      amber:       '#FFAA00',   /* --status-conditional : requires attention  */
      red:         '#FF5C5C',   /* --status-at-risk                          */
      armature:    '#3C4560',   /* urban fabric, deliberately subdued        */
      armatureLit: '#5A6486',
      wadi:        '#233046'
    },

    /* --- Infrastructure streams -------------------------------------------- *
     * id/colour/label match the live platform exactly. `order` is the reveal
     * order: roads first so the city becomes legible, then the invisible
     * systems. `emissive` is a cinematic-only luminosity lift that decays to
     * 1.0 by the end so colour settles into the real interface.
     * ----------------------------------------------------------------------- */
    streams: [
      { id: 'mobility-roads',   color: '#FF5C5C', label: 'Mobility & Roads',   order: 0, emissive: 1.10,
        sources: [[-0.06, 1.16], [0.62, -1.02]], bias: 'corridor', density: 1.00, span: 1.00 },
      { id: 'power-energy',     color: '#00C48C', label: 'Power & Energy',     order: 1, emissive: 1.18,
        sources: [[0.86, -0.92], [-0.78, -0.50]], bias: 'periphery', density: 0.92, span: 1.00 },
      { id: 'potable-water',    color: '#4DA6FF', label: 'Potable Water',      order: 2, emissive: 1.22,
        sources: [[1.04, 0.16]], bias: 'trunk', density: 0.88, span: 0.96 },
      { id: 'wastewater',       color: '#B07CFF', label: 'Wastewater',         order: 3, emissive: 1.12,
        sources: [[0.26, -1.10]], bias: 'lowland', density: 0.80, span: 0.88 },
      { id: 'district-cooling', color: '#FFAA00', label: 'District Cooling',   order: 4, emissive: 1.14,
        sources: [[-0.06, 0.46], [0.30, 0.06]], bias: 'core', density: 0.62, span: 0.46 },
      { id: 'digital-telecom',  color: '#FF8C42', label: 'Digital & Telecom',  order: 5, emissive: 1.16,
        sources: [[-0.04, 0.10]], bias: 'mesh', density: 0.95, span: 1.00 }
    ],

    /* --- Camera choreography ------------------------------------------------ *
     * World space: +x east, +y north, +z up. 1 unit ~ 20km.
     * Starts inside the data cloud (no geography readable), pulls back into a
     * held oblique aerial, then rises onto a long lens looking straight down —
     * which is the perspective the live platform's map is drawn in.
     * ----------------------------------------------------------------------- */
    cameraKeys: [
      { p: 0.00, pos: [ 0.02, -0.26, 0.085], tgt: [ 0.02, -0.10, 0.020], fov: 54 },
      { p: 0.14, pos: [ 0.04, -0.44, 0.140], tgt: [ 0.02, -0.06, 0.018], fov: 52 },
      { p: 0.26, pos: [ 0.06, -0.86, 0.300], tgt: [ 0.01,  0.00, 0.012], fov: 47 },
      { p: 0.38, pos: [ 0.09, -1.34, 0.580], tgt: [-0.01,  0.04, 0.006], fov: 43 },
      { p: 0.50, pos: [ 0.04, -1.62, 0.820], tgt: [-0.02,  0.05, 0.000], fov: 40 },
      { p: 0.62, pos: [-0.20, -1.72, 0.960], tgt: [-0.01,  0.02, 0.000], fov: 38.5 },
      { p: 0.74, pos: [-0.31, -1.63, 1.070], tgt: [ 0.02,  0.01, 0.000], fov: 37.5 },
      { p: 0.84, pos: [-0.14, -1.44, 1.270], tgt: [ 0.00,  0.01, 0.000], fov: 34 },
      { p: 0.93, pos: [-0.03, -0.88, 1.780], tgt: [ 0.00,  0.03, 0.000], fov: 28 },
      { p: 1.00, pos: [ 0.00, -0.26, 2.640], tgt: [ 0.00,  0.05, 0.000], fov: 21 }
    ],

    /* Heaviness of the rig. Lower = more architectural inertia. */
    cameraDamping: 0.185,   /* seconds; time constant of the rig. Higher = heavier */
    driftAmount:   0.016,   /* breathing so the frame is never frozen         */
    pointerParallax: 0.012, /* desktop only, deliberately almost subliminal   */

    /* --- Cinematic typography (minimum needed, live DOM text) --------------- */
    copy: [
      { id: 'beat-1', line: 'A CITY IN MOTION.',            enter: 0.290, exit: 0.450 },
      { id: 'beat-2', line: 'INFRASTRUCTURE. CONNECTED.',   enter: 0.605, exit: 0.735 },
      { id: 'beat-3', line: 'CHANGE. ANTICIPATED.',         enter: 0.700, exit: 0.775 }
    ],
    brand: { enter: 0.790, exit: 0.945 },

    /* --- Quality tiers ------------------------------------------------------ */
    tiers: {
      high:   { dpr: 1.75, attractors: 190, nodeCap: 130, particles: 420, glowPasses: 3, coupling: true, motes: 90 },
      medium: { dpr: 1.40, attractors: 130, nodeCap:  92, particles: 240, glowPasses: 2, coupling: true, motes: 60 },
      low:    { dpr: 1.00, attractors:  78, nodeCap:  56, particles: 110, glowPasses: 1, coupling: false, motes: 30 }
    },

    /* Drop one tier if frames stay this slow for this many consecutive frames */
    perfBudgetMs: 25,
    perfWindow:   36,

    seed: 0x1F3C0DE
  };

})(window);
