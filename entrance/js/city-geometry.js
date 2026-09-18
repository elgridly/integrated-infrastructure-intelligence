/* =============================================================================
 * I3 CINEMATIC ENTRANCE — RIYADH GEOMETRY + INFRASTRUCTURE NETWORK GENERATION
 * -----------------------------------------------------------------------------
 * Everything here is deterministic (seeded) so the entrance composes identically
 * on every load and can be reviewed frame by frame.
 *
 * GEOGRAPHIC HONESTY
 * The urban armature is a stylised reading of Riyadh's real structure: an
 * elongated north-south plateau city, Wadi Hanifah and the Tuwaiq escarpment
 * down the western flank, a strong orthogonal street grid, ring roads, and
 * radial corridors leaving north-east and south-east. It is a recognisable
 * silhouette, not a survey.
 *
 * The infrastructure networks are CONCEPTUAL. They are generated from plausible
 * entry points and grown across the urban density field. They are not a claim
 * about where any real pipe, cable or corridor runs, and nothing in the
 * sequence labels them as operational fact.
 * ========================================================================== */
(function (global) {
  'use strict';

  var I3E = global.I3E = global.I3E || {};
  var CFG = I3E.config;

  /* ---------------------------------------------------------------------------
   * Seeded RNG (mulberry32) — deterministic, fast, good enough distribution.
   * ------------------------------------------------------------------------ */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  I3E.rng = rng;

  /* ---------------------------------------------------------------------------
   * URBAN EXTENT
   * Riyadh reads as a tall north-south blob, widest across the centre, tapering
   * north and south, cut off on the west by the wadi/escarpment.
   * ------------------------------------------------------------------------ */
  /* Wadi Hanifah: runs NW to SE down the western flank of the city. */
  var WADI = [
    [-0.24,  1.26], [-0.33,  1.08], [-0.41,  0.90], [-0.47,  0.72],
    [-0.52,  0.54], [-0.56,  0.36], [-0.58,  0.18], [-0.58,  0.00],
    [-0.55, -0.18], [-0.50, -0.36], [-0.43, -0.54], [-0.34, -0.72],
    [-0.24, -0.90], [-0.13, -1.06], [-0.02, -1.22]
  ];

  /* West edge of the buildable plateau at a given northing. */
  function wadiXAt(y) {
    if (y >= WADI[0][1]) return WADI[0][0];
    if (y <= WADI[WADI.length - 1][1]) return WADI[WADI.length - 1][0];
    for (var i = 0; i < WADI.length - 1; i++) {
      var a = WADI[i], b = WADI[i + 1];
      if (y <= a[1] && y >= b[1]) {
        var t = (a[1] - y) / (a[1] - b[1] || 1e-6);
        return a[0] + (b[0] - a[0]) * t;
      }
    }
    return -0.28;
  }

  /* ---------------------------------------------------------------------------
   * URBAN DENSITY FIELD
   * Drives where streets exist and where networks are allowed to grow. The
   * boundary is deliberately irregular — a clean ellipse reads as a generic
   * fictional city, which the brief rules out.
   * ------------------------------------------------------------------------ */
  function density(x, y) {
    var west = wadiXAt(y) + 0.045;
    if (x < west) return 0;                         /* beyond the wadi        */

    var nx = (x - 0.11) / 0.60;
    var ny = (y - 0.05) / 1.06;

    /* Irregular perimeter: lobes, notches, ragged edges. */
    var wob = 1
      + 0.150 * Math.sin(y * 3.7 + 0.8)
      + 0.095 * Math.cos(x * 5.3 - 1.4)
      + 0.070 * Math.sin(y * 7.9 + 2.3)
      + 0.048 * Math.cos(y * 13.1 - 0.4);

    var r = Math.sqrt(nx * nx * 1.22 + ny * ny * 1.34) / wob;
    var base = Math.exp(-r * r * 1.05);

    /* Dense inner core, centre and slightly north. */
    var cx = (x - 0.01) / 0.33, cy = (y - 0.19) / 0.42;
    var core = 0.52 * Math.exp(-(cx * cx + cy * cy));

    /* Outlying districts: north-east toward the airport corridor, and south. */
    var ax = (x - 0.56) / 0.22, ay = (y - 0.86) / 0.24;
    var lobeNE = 0.34 * Math.exp(-(ax * ax + ay * ay));
    var sx = (x - 0.24) / 0.24, sy = (y + 0.78) / 0.26;
    var lobeS = 0.26 * Math.exp(-(sx * sx + sy * sy));

    return Math.max(0, Math.min(1, base + core + lobeNE + lobeS));
  }
  I3E.density = density;

  /* Trim a polyline to the built-up area, allowing a short overhang so major
   * corridors visibly leave the city rather than stopping at a hard edge. */
  function trim(pts, thresh, overhang) {
    var out = [], run = [], over = 0;
    for (var i = 0; i < pts.length; i++) {
      var inside = density(pts[i][0], pts[i][1]) >= thresh;
      if (inside) { over = overhang; run.push(pts[i]); }
      else if (over > 0) { over--; run.push(pts[i]); }
      else { if (run.length > 1) out.push(run); run = []; }
    }
    if (run.length > 1) out.push(run);
    return out;
  }

  /* ---------------------------------------------------------------------------
   * ARMATURE — the urban fabric drawn beneath everything.
   *   tier 0 : wadi + escarpment (geographic context)
   *   tier 1 : street grid (fabric)
   *   tier 2 : ring roads + arterial corridors (structure)
   * ------------------------------------------------------------------------ */
  function buildArmature(rand, tier) {
    var lines = [];
    function push(t, w, pts) { if (pts && pts.length > 1) lines.push({ tier: t, w: w, pts: pts }); }

    /* --- Wadi + escarpment contours --------------------------------------- */
    push(0, 2.0, WADI.slice());
    /* Escarpment read as short broken contour fragments, not full-length arcs. */
    [[0.055, 2, 5], [0.055, 8, 11], [0.100, 4, 7], [0.100, 10, 13], [0.145, 6, 9]]
      .forEach(function (f) {
        push(0, 0.7, WADI.slice(f[1], f[2]).map(function (p) { return [p[0] - f[0], p[1] + 0.01]; }));
      });
    push(0, 1.0, [[-0.38, 0.62], [-0.31, 0.48], [-0.28, 0.32], [-0.32, 0.16]]);

    /* --- Arterial north-south spines --------------------------------------- */
    var spines = [
      { x: -0.30, major: 0 }, { x: -0.19, major: 0 }, { x: -0.10, major: 1 },
      { x:  0.00, major: 1 }, { x:  0.10, major: 0 }, { x:  0.22, major: 0 },
      { x:  0.36, major: 1 }, { x:  0.50, major: 0 }
    ];
    spines.forEach(function (sp, i) {
      var pts = [];
      for (var y = -1.22; y <= 1.24; y += 0.055) {
        pts.push([sp.x + Math.sin(y * 2.1 + i) * 0.014, y]);
      }
      trim(pts, 0.20, 1).forEach(function (seg) {
        push(sp.major ? 2 : 1, sp.major ? 1.7 : 0.8, seg);
      });
    });

    /* --- Arterial east-west corridors -------------------------------------- */
    var crosses = [
      { y: -0.86, major: 0 }, { y: -0.68, major: 0 }, { y: -0.50, major: 1 },
      { y: -0.32, major: 0 }, { y: -0.15, major: 0 }, { y:  0.02, major: 1 },
      { y:  0.17, major: 1 }, { y:  0.31, major: 0 }, { y:  0.45, major: 0 },
      { y:  0.62, major: 1 }, { y:  0.80, major: 0 }, { y:  0.98, major: 0 }
    ];
    crosses.forEach(function (cr, i) {
      var pts = [];
      for (var x = -0.72; x <= 1.00; x += 0.055) {
        pts.push([x, cr.y + Math.sin(x * 1.9 + i) * 0.012]);
      }
      trim(pts, 0.20, 1).forEach(function (seg) {
        push(cr.major ? 2 : 1, cr.major ? 1.7 : 0.8, seg);
      });
    });

    /* --- Ring road: superellipse, not a circle ----------------------------- */
    function ringPath(a, b, n, ox, oy, wob) {
      var pts = [];
      for (var t = 0; t <= Math.PI * 2 + 0.01; t += Math.PI / 40) {
        var ct = Math.cos(t), st = Math.sin(t);
        var k = 1 + wob * Math.sin(t * 3.1 + 0.6);
        var px = ox + Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n) * a * k;
        var py = oy + Math.sign(st) * Math.pow(Math.abs(st), 2 / n) * b * k;
        px = Math.max(px, wadiXAt(py) + 0.035);
        pts.push([px, py]);
      }
      return pts;
    }
    push(2, 2.2, ringPath(0.58, 1.02, 2.9, 0.07, 0.06, 0.035));
    trim(ringPath(0.33, 0.56, 2.7, 0.03, 0.16, 0.030), 0.30, 1)
      .forEach(function (seg) { push(2, 1.2, seg); });

    /* --- Radial corridors leaving the city --------------------------------- */
    [
      [[0.12, 0.40], [0.34, 0.66], [0.55, 0.90], [0.72, 1.10], [0.84, 1.24]],  /* NE */
      [[0.18, 0.14], [0.48, 0.08], [0.76, 0.01], [0.99, -0.05]],               /* E  */
      [[0.10, -0.14], [0.28, -0.46], [0.42, -0.78], [0.54, -1.08]],            /* SE */
      [[-0.12, 0.34], [-0.30, 0.52], [-0.46, 0.68], [-0.58, 0.80]],            /* NW */
      [[-0.22, 0.04], [-0.44, -0.01], [-0.62, -0.05]]                          /* W  */
    ].forEach(function (r) {
      /* Resample so trimming can cut them cleanly at the urban edge. */
      var dense = [];
      for (var i = 0; i < r.length - 1; i++) {
        for (var t = 0; t < 1; t += 0.12) {
          dense.push([r[i][0] + (r[i + 1][0] - r[i][0]) * t,
                      r[i][1] + (r[i + 1][1] - r[i][1]) * t]);
        }
      }
      dense.push(r[r.length - 1]);
      trim(dense, 0.09, 3).forEach(function (seg) { push(2, 1.5, seg); });
    });

    /* --- Street grid ------------------------------------------------------- *
     * Broken into block-length runs with gaps so it reads as urban fabric
     * rather than a drafting wireframe.
     * ---------------------------------------------------------------------- */
    var step = tier.attractors > 150 ? 0.030 : (tier.attractors > 100 ? 0.042 : 0.062);
    var gap  = step * 2.2;

    function gridRun(fixed, from, to, horizontal) {
      var run = null;
      for (var v = from; v <= to; v += step) {
        var gx = horizontal ? v : fixed;
        var gy = horizontal ? fixed : v;
        var d = density(gx, gy);
        var live = d > 0.34 && rand() < 0.40 + d * 0.55;
        if (live) {
          if (!run) run = [];
          run.push([gx + (horizontal ? 0 : (rand() - 0.5) * 0.010),
                    gy + (horizontal ? (rand() - 0.5) * 0.010 : 0)]);
          if (run.length > 4 + Math.floor(rand() * 7)) {
            if (run.length > 2) push(1, 0.5, run);
            run = null; v += gap * rand();
          }
        } else if (run) {
          if (run.length > 2) push(1, 0.5, run);
          run = null;
        }
      }
      if (run && run.length > 2) push(1, 0.5, run);
    }

    for (var gy2 = -1.16; gy2 <= 1.22; gy2 += gap) gridRun(gy2, -0.70, 0.98, true);
    for (var gx2 = -0.68; gx2 <= 0.96; gx2 += gap) gridRun(gx2, -1.20, 1.24, false);

    return lines;
  }

  /* ---------------------------------------------------------------------------
   * NETWORK GROWTH (space colonisation)
   * Attractors are sampled from the urban density field with a per-stream
   * spatial bias, then the network grows toward them from its source points.
   * The result branches the way a distribution system does: trunk, spurs,
   * capillaries — rather than a symmetrical neural-net graph.
   * ------------------------------------------------------------------------ */
  function biasWeight(bias, x, y) {
    switch (bias) {
      case 'core':      return Math.exp(-(Math.pow((x - 0.02) / 0.34, 2) + Math.pow((y - 0.20) / 0.42, 2)));
      case 'periphery': return 0.30 + Math.min(1, Math.abs(y) * 0.85 + Math.abs(x - 0.06) * 0.80);
      case 'lowland':   return 0.25 + Math.max(0, (0.30 - y)) * 1.15;
      case 'trunk':     return 0.35 + Math.exp(-Math.pow((y - 0.12) / 0.50, 2)) * 0.95;
      case 'corridor':  return 0.55 + Math.exp(-Math.pow((x - 0.04) / 0.46, 2)) * 0.70;
      default:          return 1.0;  /* mesh */
    }
  }

  function growNetwork(stream, rand, tier) {
    var nAttract = Math.round(tier.attractors * stream.density);
    var attractors = [];
    var guard = 0;
    while (attractors.length < nAttract && guard++ < nAttract * 60) {
      var x = -0.72 + rand() * 1.60;
      var y = -1.18 + rand() * 2.40;
      var d = density(x, y);
      if (d <= 0.05) continue;
      if (Math.abs(y) > 1.20 * stream.span) continue;
      if (rand() > d * biasWeight(stream.bias, x, y)) continue;
      attractors.push([x, y, false]);
    }

    /* Seed nodes from the stream's declared entry points. */
    var nodes = [];
    stream.sources.forEach(function (s) {
      nodes.push({ x: s[0], y: s[1], parent: -1, depth: 0, children: 0 });
    });
    if (!nodes.length) return { nodes: [], edges: [] };

    var influence = 0.44, kill = 0.075, stepLen = 0.052;
    var cap = Math.round(tier.nodeCap * stream.density);
    var iterations = 0, maxIter = 220;

    while (nodes.length < cap && iterations++ < maxIter) {
      var pull = {};       /* nodeIndex -> [dx, dy, count] */
      var anyLive = false;

      for (var ai = 0; ai < attractors.length; ai++) {
        var at = attractors[ai];
        if (at[2]) continue;
        anyLive = true;
        var best = -1, bestD = influence;
        for (var ni = 0; ni < nodes.length; ni++) {
          var dx = at[0] - nodes[ni].x, dy = at[1] - nodes[ni].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < kill) { at[2] = true; best = -1; break; }
          if (dist < bestD) { bestD = dist; best = ni; }
        }
        if (best < 0) continue;
        var ndx = at[0] - nodes[best].x, ndy = at[1] - nodes[best].y;
        var nl = Math.sqrt(ndx * ndx + ndy * ndy) || 1;
        var acc = pull[best] || (pull[best] = [0, 0, 0]);
        acc[0] += ndx / nl; acc[1] += ndy / nl; acc[2]++;
      }

      if (!anyLive) break;
      var grew = false;
      for (var key in pull) {
        if (nodes.length >= cap) break;
        var idx = +key, p = pull[key];
        var len = Math.sqrt(p[0] * p[0] + p[1] * p[1]) || 1;
        var jx = (rand() - 0.5) * 0.30, jy = (rand() - 0.5) * 0.30;
        var ux = p[0] / len + jx, uy = p[1] / len + jy;
        var ul = Math.sqrt(ux * ux + uy * uy) || 1;
        var nx = nodes[idx].x + (ux / ul) * stepLen;
        var ny = nodes[idx].y + (uy / ul) * stepLen;
        if (density(nx, ny) <= 0.02) continue;
        nodes[idx].children++;
        nodes.push({ x: nx, y: ny, parent: idx, depth: nodes[idx].depth + 1, children: 0 });
        grew = true;
      }
      if (!grew) break;
    }

    /* Edges are parent links; keeps the graph a clean, readable distribution
     * tree rather than a hairball. */
    var edges = [];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].parent < 0) continue;
      edges.push({ a: nodes[i].parent, b: i, depth: nodes[i].depth });
    }
    return { nodes: nodes, edges: edges };
  }

  /* ---------------------------------------------------------------------------
   * BUILD — assembles the whole scene graph.
   * ------------------------------------------------------------------------ */
  I3E.buildScene = function (tier) {
    var rand = rng(CFG.seed);
    var scene = {
      armature: buildArmature(rand, tier),
      streams: [],
      nodes: [],     /* flat list, all streams  */
      edges: [],     /* flat list, all streams  */
      couplings: [], /* cross-stream dependency links */
      flagged: [],   /* nodes that will require attention */
      maxDepth: 1
    };

    CFG.streams.forEach(function (stream, si) {
      var net = growNetwork(stream, rand, tier);
      var base = scene.nodes.length;

      net.nodes.forEach(function (n, i) {
        /* Scatter origin: where this data point sits before it is placed.
         * Fragmented information — near the camera, spatially meaningless. */
        var ang = rand() * Math.PI * 2;
        var rad = 0.10 + rand() * 0.42;
        scene.nodes.push({
          si: si,
          stream: stream.id,
          color: stream.color,
          x: n.x, y: n.y, z: 0.004 + si * 0.0022 + rand() * 0.004,
          sx: 0.02 + Math.cos(ang) * rad * 0.55,
          sy: -0.20 + Math.sin(ang) * rad * 0.42,
          sz: 0.03 + rand() * 0.17,
          depth: n.depth,
          leaf: n.children === 0,
          /* Trunk nodes place themselves first; capillaries follow. */
          settleAt: 0.115 + Math.min(0.26, n.depth * 0.012) + rand() * 0.075,
          seedPhase: rand(),
          flagged: 0,
          importance: 0
        });
        scene.maxDepth = Math.max(scene.maxDepth, n.depth);
      });

      net.edges.forEach(function (e) {
        scene.edges.push({
          si: si, stream: stream.id, color: stream.color,
          a: base + e.a, b: base + e.b,
          depth: e.depth,
          discovery: false,
          revealAt: 0, revealDur: 0,
          importance: 0,
          pulsePhase: rand(),
          pulseRate: 0.55 + rand() * 0.95,   /* varied so nothing marches */
          branch: false
        });
      });

      scene.streams.push({ def: stream, nodeStart: base, nodeCount: net.nodes.length });
    });

    /* --- Importance: what the intelligence phase will keep ----------------- */
    scene.edges.forEach(function (e) {
      var t = 1 - Math.min(1, e.depth / (scene.maxDepth * 0.55));
      e.importance = Math.max(0, Math.min(1, t));
    });
    scene.nodes.forEach(function (n) {
      n.importance = Math.max(0, Math.min(1, 1 - n.depth / (scene.maxDepth * 0.60)));
    });

    /* --- Reveal scheduling -------------------------------------------------
     * A small set of short, central edges are "discovery" links revealed one by
     * one during first-connections. The remainder reveal per stream, staggered,
     * with each edge waiting for its parent — so networks propagate outward
     * from their sources instead of switching on like a GIS layer.
     * ---------------------------------------------------------------------- */
    var fc = CFG.phases.firstConnection;
    var discovery = scene.edges
      .filter(function (e) { return e.depth <= 2; })
      .slice(0, 22);
    discovery.forEach(function (e, i) {
      e.discovery = true;
      e.revealAt = fc[0] + (i / Math.max(1, discovery.length - 1)) * (fc[1] - fc[0]) * 0.86;
      e.revealDur = 0.030 + (i % 3) * 0.010;
    });

    var order = CFG.streams.slice().sort(function (a, b) { return a.order - b.order; });
    order.forEach(function (sd, oi) {
      var winStart = 0.288 + oi * 0.036;
      var winLen = 0.200;
      scene.edges.forEach(function (e) {
        if (e.stream !== sd.id || e.discovery) return;
        var f = Math.min(1, e.depth / Math.max(1, scene.maxDepth * 0.85));
        e.revealAt = winStart + f * winLen;
        e.revealDur = 0.024 + (e.depth % 4) * 0.006;
      });
    });

    /* --- Propagation paths --------------------------------------------------
     * Energy propagation is the signature I3 motion. Pulses need to travel
     * along whole corridors, not hop across single segments, so root-to-leaf
     * chains are extracted per stream and overlapping ones discarded.
     * ---------------------------------------------------------------------- */
    scene.paths = [];
    var parentOf = {};
    scene.edges.forEach(function (e) { parentOf[e.b] = e.a; });

    scene.streams.forEach(function (st, si) {
      var lo = st.nodeStart, hi = st.nodeStart + st.nodeCount;
      var leaves = [];
      for (var i = lo; i < hi; i++) if (scene.nodes[i].leaf) leaves.push(i);

      var chains = leaves.map(function (li) {
        var chain = [], cur = li, guard = 0;
        while (cur !== undefined && guard++ < 400) {
          chain.push(cur);
          cur = parentOf[cur];
        }
        return chain.reverse();
      }).filter(function (c) { return c.length >= 4; });

      chains.sort(function (a, b) { return b.length - a.length; });

      var claimed = {}, kept = 0;
      for (var c = 0; c < chains.length && kept < 16; c++) {
        var chain = chains[c], fresh = 0;
        for (var k = 0; k < chain.length; k++) if (!claimed[chain[k]]) fresh++;
        if (fresh < Math.max(3, chain.length * 0.45)) continue;
        chain.forEach(function (n) { claimed[n] = 1; });
        scene.paths.push({
          si: si,
          stream: st.def.id,
          color: st.def.color,
          idx: chain,
          maxDepth: scene.nodes[chain[chain.length - 1]].depth,
          phase: rand(),
          rate: 0.30 + rand() * 0.42,     /* nothing marches in step */
          width: 1 + (kept < 4 ? 1 : 0)   /* trunk corridors carry more energy */
        });
        kept++;
      }
    });

    /* --- Cross-stream interdependency --------------------------------------
     * Shared nodes: where two different systems meet at the same place. A
     * signal arriving in one network provokes a response in the other. These
     * are conceptual couplings, not asserted operational dependencies.
     * ---------------------------------------------------------------------- */
    if (tier.coupling) {
      var rand2 = rng(CFG.seed ^ 0x5EED);
      var candidates = scene.nodes
        .map(function (n, i) { return { i: i, n: n }; })
        .filter(function (o) { return !o.n.leaf && o.n.depth > 1; });

      for (var c = 0; c < candidates.length && scene.couplings.length < 14; c++) {
        var A = candidates[Math.floor(rand2() * candidates.length)];
        if (!A) continue;
        var bestJ = -1, bestD = 0.085;
        for (var j = 0; j < candidates.length; j++) {
          var B = candidates[j];
          if (B.n.si === A.n.si) continue;
          var dx = B.n.x - A.n.x, dy = B.n.y - A.n.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < bestD) { bestD = d; bestJ = j; }
        }
        if (bestJ < 0) continue;
        var already = scene.couplings.some(function (k) { return k.a === A.i || k.b === candidates[bestJ].i; });
        if (already) continue;
        scene.couplings.push({
          a: A.i, b: candidates[bestJ].i,
          phase: rand2(),
          rate: 0.45 + rand2() * 0.5
        });
        A.n.importance = Math.max(A.n.importance, 0.88);
        candidates[bestJ].n.importance = Math.max(candidates[bestJ].n.importance, 0.88);
      }
    }

    /* --- Change / uncertainty ----------------------------------------------
     * A restrained number of elements need attention: a handful amber, a pair
     * critical. No numbers, no dates, no named projects — the point is that
     * something has changed, not a fabricated metric.
     * ---------------------------------------------------------------------- */
    var rand3 = rng(CFG.seed ^ 0xA1B2);
    var pool = scene.nodes
      .map(function (n, i) { return i; })
      .filter(function (i) { return scene.nodes[i].depth > 1 && scene.nodes[i].importance > 0.30; });
    for (var f = 0; f < 8 && pool.length; f++) {
      var pick = pool.splice(Math.floor(rand3() * pool.length), 1)[0];
      scene.nodes[pick].flagged = (f < 6) ? 1 : 2;    /* 1 = amber, 2 = critical */
      scene.nodes[pick].importance = 1;
      scene.flagged.push(pick);
    }

    /* --- Alternative futures ------------------------------------------------
     * Faint branching paths that diverge from a corridor and fade: several
     * possible forward states, drawn as possibility rather than prediction.
     * ---------------------------------------------------------------------- */
    scene.branches = [];
    var branchSeeds = scene.nodes
      .map(function (n, i) { return i; })
      .filter(function (i) { return scene.nodes[i].importance > 0.45 && !scene.nodes[i].leaf; });
    for (var b = 0; b < Math.min(11, branchSeeds.length); b++) {
      var srcI = branchSeeds[Math.floor(rand3() * branchSeeds.length)];
      var src = scene.nodes[srcI];
      var arms = [];
      var nArms = 2 + (rand3() > 0.72 ? 1 : 0);
      for (var k = 0; k < nArms; k++) {
        var a0 = rand3() * Math.PI * 2;
        var pts = [[src.x, src.y]];
        var cx = src.x, cy = src.y, ang2 = a0;
        for (var s = 0; s < 4; s++) {
          ang2 += (rand3() - 0.5) * 0.9;
          cx += Math.cos(ang2) * 0.055;
          cy += Math.sin(ang2) * 0.055;
          pts.push([cx, cy]);
        }
        arms.push(pts);
      }
      scene.branches.push({ node: srcI, color: src.color, arms: arms, phase: rand3() });
    }

    return scene;
  };

})(window);
