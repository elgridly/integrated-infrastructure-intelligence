/* =============================================================================
 * I3 CINEMATIC ENTRANCE — REVEAL RENDERER
 * -----------------------------------------------------------------------------
 * Canvas 2D. Chosen over WebGL because the whole effect is compositing two
 * registered images with a soft moving boundary plus additive light, which
 * Canvas does natively and cheaply. No rendering dependency is introduced.
 *
 * CORE RULE
 *   LEFT of the boundary  = previous state
 *   RIGHT of the boundary = next state
 * Forward progress moves the boundary RIGHT -> LEFT, so the next state
 * progressively takes the screen. Neither image ever moves. Only the boundary
 * moves, which is what keeps the city stationary.
 * ========================================================================== */
(function (global) {
  'use strict';

  var I3E = global.I3E = global.I3E || {};
  var CFG = I3E.config, ease = I3E.ease, clamp01 = I3E.clamp01, span = I3E.span;

  function Reveal(canvas, sequence, tier) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.seq = sequence;
    this.tier = tier;
    this.mask = document.createElement('canvas');
    this.maskCtx = this.mask.getContext('2d');
    this.t0 = performance.now();
    this.settle = 0;            /* 0 cinematic .. 1 settled toward platform  */
    this.links = this._buildLinks();
    this.resize();
  }

  /* Conceptual relationships between the frame's structural anchors. These
   * carry the complexity and prioritisation beats. They are visual anchors in
   * the cinematic image, not claims about real infrastructure. */
  Reveal.prototype._buildLinks = function () {
    var pairs = [[0,1],[0,2],[0,3],[1,2],[1,4],[2,4]];
    return pairs.map(function (p, i) {
      return { a: p[0], b: p[1], phase: (i * 0.37) % 1, rate: 0.26 + (i % 3) * 0.085 };
    });
  };

  Reveal.prototype.resize = function () {
    var dpr = Math.min(global.devicePixelRatio || 1, this.tier.dpr);
    var w = this.canvas.clientWidth || global.innerWidth;
    var h = this.canvas.clientHeight || global.innerHeight;
    this.cssW = w; this.cssH = h;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.mask.width = this.canvas.width;
    this.mask.height = this.canvas.height;
    this.W = this.canvas.width; this.H = this.canvas.height;
    this.dpr = dpr;

    /* One cover-fit for every frame. Identical mapping is what guarantees the
     * states stay registered on screen. */
    var ia = CFG.imageAspect, ca = this.W / this.H;
    if (ca > ia) { this.dw = this.W; this.dh = this.W / ia; }
    else         { this.dh = this.H; this.dw = this.H * ia; }
    this.dx0 = (this.W - this.dw) / 2;
    this.dy0 = (this.H - this.dh) / 2;
    this.regScale = this.dw / 1672;      /* registration nudges are in source px */
  };

  Reveal.prototype._drawFrame = function (ctx, frame, alpha, composite) {
    if (!frame) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (composite) ctx.globalCompositeOperation = composite;
    ctx.drawImage(frame.img,
      this.dx0 + frame.dx * this.regScale,
      this.dy0 + frame.dy * this.regScale,
      this.dw, this.dh);
    ctx.restore();
  };

  Reveal.prototype._darkness = function (ctx) {
    var g = ctx.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, '#0A0A13');
    g.addColorStop(0.55, CFG.palette.bg);
    g.addColorStop(1, CFG.palette.bgDeep);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.W, this.H);
  };

  /* ---------------------------------------------------------------------------
   * The moving boundary.
   * ------------------------------------------------------------------------ */
  /* Smoothstep approximated as gradient stops. A stepped slice ramp banded
   * visibly in the sky, which is exactly the crossfade artefact to avoid, so
   * the boundary is masked with a real gradient instead. */
  Reveal.prototype._rampStops = function (g, invert) {
    for (var i = 0; i <= 8; i++) {
      var t = i / 8;
      var a = t * t * (3 - 2 * t);
      g.addColorStop(t, 'rgba(255,255,255,' + (invert ? 1 - a : a).toFixed(4) + ')');
    }
  };

  Reveal.prototype._transition = function (ctx, prevFrame, nextFrame, t, spec) {
    var W = this.W, H = this.H;

    /* LEFT = previous. Fills the frame; the next state is laid over its right. */
    if (prevFrame) this._drawFrame(ctx, prevFrame, 1); else this._darkness(ctx);
    if (!nextFrame || t <= 0) return;

    var et = ease.smooth(t);
    var xDiv = W * (1 - et);                       /* right -> left            */
    /* The feather opens and closes across the travel so the boundary never
     * clips at either end of its journey. */
    var fw = Math.max(2, spec.feather * W * Math.sin(Math.PI * clamp01(t)));
    var half = fw / 2;
    var xHard = xDiv + half;

    /* Fully revealed region: drawn straight to the canvas. Only the soft band
     * needs masking, so the expensive offscreen work is confined to it rather
     * than repeated at full frame width every frame. */
    if (xHard < W) {
      ctx.save();
      ctx.beginPath(); ctx.rect(xHard, 0, W - xHard, H); ctx.clip();
      this._drawFrame(ctx, nextFrame, 1);
      ctx.restore();
    }

    /* Feathered band, masked with a real gradient. A stepped alpha ramp banded
     * visibly across the sky, which is precisely the crossfade artefact to
     * avoid, so the ramp is a gradient rather than a series of slices. */
    var bx = Math.max(0, Math.floor(xDiv - half));
    var bw = Math.min(W - bx, Math.ceil(fw) + 2);
    if (bw > 0) {
      var m = this.maskCtx;
      m.globalCompositeOperation = 'source-over';
      m.clearRect(bx, 0, bw, H);
      m.save();
      m.beginPath(); m.rect(bx, 0, bw, H); m.clip();
      this._drawFrame(m, nextFrame, 1);
      m.restore();
      m.globalCompositeOperation = 'destination-in';
      var gm = m.createLinearGradient(xDiv - half, 0, xDiv + half, 0);
      this._rampStops(gm, false);
      m.fillStyle = gm;
      m.fillRect(bx, 0, bw, H);
      m.globalCompositeOperation = 'source-over';
      ctx.drawImage(this.mask, bx, 0, bw, H, bx, 0, bw, H);
    }

    /* Reveal glow. The next state is added back over the strip it has just
     * taken, so light the next state INTRODUCES flares as the plane passes,
     * while unchanged areas stay untouched. Additive compositing does the
     * differencing for free, with no precomputed masks to drift out of
     * registration. */
    if (this.tier.revealGlow && spec.glow > 0 && t > 0.02 && t < 0.985) {
      var gwid = CFG.boundary.revealGlowWidth * this.dpr + fw * 0.25;
      var gx = Math.max(0, Math.floor(xDiv - half * 0.4));
      var gwPx = Math.min(W - gx, Math.ceil(half * 0.4 + gwid) + 2);
      if (gwPx > 0) {
        var mg = this.maskCtx;
        mg.globalCompositeOperation = 'source-over';
        mg.clearRect(gx, 0, gwPx, H);
        mg.save();
        mg.beginPath(); mg.rect(gx, 0, gwPx, H); mg.clip();
        this._drawFrame(mg, nextFrame, 1);
        mg.restore();
        mg.globalCompositeOperation = 'destination-in';
        var gg = mg.createLinearGradient(xDiv - half * 0.4, 0, xDiv + gwid, 0);
        gg.addColorStop(0.00, 'rgba(255,255,255,0)');
        gg.addColorStop(0.18, 'rgba(255,255,255,0.85)');
        gg.addColorStop(0.45, 'rgba(255,255,255,0.35)');
        gg.addColorStop(1.00, 'rgba(255,255,255,0)');
        mg.fillStyle = gg;
        mg.fillRect(gx, 0, gwPx, H);
        mg.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = spec.glow * 0.30 * (1 - this.settle);
        ctx.drawImage(this.mask, gx, 0, gwPx, H, gx, 0, gwPx, H);
        ctx.restore();
      }
    }

    this._boundary(ctx, xDiv, t, fw);
  };

  Reveal.prototype._boundary = function (ctx, x, t, fw) {
    var H = this.H, B = CFG.boundary;
    var vis = Math.pow(Math.sin(Math.PI * clamp01(t)), 0.35) * (1 - this.settle);
    if (vis <= 0.01) return;

    /* Soft luminous plane around the line. Wider when the feather is wide, so
     * the dawn step reads as light rather than as an edge. */
    var bw = (B.bloomWidth * this.dpr) + fw * 0.22;
    var c = B.bloomColor;
    var g = ctx.createLinearGradient(x - bw, 0, x + bw, 0);
    g.addColorStop(0.0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
    g.addColorStop(0.5, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.085 * vis) + ')');
    g.addColorStop(1.0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.fillRect(x - bw, 0, bw * 2, H);
    ctx.restore();

    /* The line itself: thin, cool, never a slider handle. */
    ctx.save();
    ctx.globalAlpha = vis * 0.78;
    ctx.strokeStyle = B.lineColor;
    ctx.lineWidth = B.lineWidth * this.dpr;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();

    /* A single small marker travelling with the plane. */
    var my = H * (0.5 + Math.sin(this.time * 0.35) * 0.055);
    var r = B.markerRadius * this.dpr;
    ctx.globalCompositeOperation = 'lighter';
    var rg = ctx.createRadialGradient(x, my, 0, x, my, r * 6);
    rg.addColorStop(0, 'rgba(190,230,255,' + (0.70 * vis) + ')');
    rg.addColorStop(1, 'rgba(120,190,255,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(x, my, r * 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(235,248,255,' + vis + ')';
    ctx.beginPath(); ctx.arc(x, my, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  /* ---------------------------------------------------------------------------
   * Complexity -> clarity.
   * The connected state (09) is laid over the physical state (08) through an
   * alpha mask. Letting the mask fall globally while holding it at the priority
   * anchors IS the filtering: the city stays, the noise recedes, and what
   * matters keeps its emphasis.
   * ------------------------------------------------------------------------ */
  Reveal.prototype._intelligence = function (ctx, p) {
    var base = this.seq.get(CFG.masterIndex - 1);
    var net  = this.seq.get(CFG.masterIndex);
    if (!net) return;
    if (!base) { this._drawFrame(ctx, net, 1); return; }

    this._drawFrame(ctx, base, 1);

    var cx = span(p, CFG.phases.complexity[0], CFG.phases.complexity[1]);
    var cl = span(p, CFG.phases.clarity[0], CFG.phases.clarity[1]);

    /* Complexity builds to full, then recedes to a quiet baseline. */
    var shimmer = 1 + Math.sin(this.time * 1.25) * 0.05 * (1 - cl);
    var globalA = (0.55 + 0.45 * ease.smooth(cx)) * shimmer;
    globalA *= (1 - ease.inOutCubic(cl) * 0.86);

    var m = this.maskCtx, W = this.W, H = this.H;
    m.clearRect(0, 0, W, H);
    m.globalCompositeOperation = 'source-over';
    m.fillStyle = 'rgba(255,255,255,' + clamp01(globalA) + ')';
    m.fillRect(0, 0, W, H);

    /* Anchors retain emphasis as everything else quietens. */
    var hold = ease.smooth(cl);
    if (hold > 0) {
      m.globalCompositeOperation = 'lighter';
      for (var i = 0; i < CFG.priorityZones.length; i++) {
        var z = CFG.priorityZones[i];
        var zx = this.dx0 + z.x * this.dw, zy = this.dy0 + z.y * this.dh;
        var zr = z.r * this.dw;
        var breathe = 1 + Math.sin(this.time * 0.9 + i * 1.3) * 0.05;
        var g = m.createRadialGradient(zx, zy, 0, zx, zy, zr * breathe);
        g.addColorStop(0, 'rgba(255,255,255,' + (0.62 * hold) + ')');
        g.addColorStop(0.55, 'rgba(255,255,255,' + (0.26 * hold) + ')');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        m.fillStyle = g;
        m.beginPath(); m.arc(zx, zy, zr * breathe, 0, Math.PI * 2); m.fill();
      }
    }

    /* The field above is an alpha field painted in white. source-in replaces
     * its colour with the connected state while keeping that alpha, so what
     * lands on screen is the network at the field's strength. Using
     * destination-in here would paint the white field itself. */
    m.globalCompositeOperation = 'source-in';
    m.drawImage(net.img,
      this.dx0 + net.dx * this.regScale, this.dy0 + net.dy * this.regScale,
      this.dw, this.dh);
    m.globalCompositeOperation = 'source-over';

    ctx.drawImage(this.mask, 0, 0);
    this._pulses(ctx, cx, cl);
  };

  /* Relationships carrying activity between anchors. During complexity many
   * are live; during clarity only those touching retained anchors persist. */
  Reveal.prototype._pulses = function (ctx, cx, cl) {
    var n = this.tier.pulses;
    if (n <= 0) return;
    var intensity = ease.smooth(cx) * (1 - this.settle);
    if (intensity <= 0.02) return;
    var Z = CFG.priorityZones;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var li = 0; li < this.links.length; li++) {
      var L = this.links[li];
      var a = Z[L.a], b = Z[L.b];
      /* Clarity keeps the material relationships and drops the rest. */
      var material = (a.kind !== 'primary' || b.kind !== 'primary');
      var w = material ? 1 : (1 - ease.smooth(cl) * 0.88);
      if (w < 0.04) continue;

      var ax = this.dx0 + a.x * this.dw, ay = this.dy0 + a.y * this.dh;
      var bx = this.dx0 + b.x * this.dw, by = this.dy0 + b.y * this.dh;
      var mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.abs(bx - ax) * 0.13;

      var attention = (a.kind === 'critical' || b.kind === 'critical' ||
                       a.kind === 'attention' || b.kind === 'attention');
      var col = attention ? CFG.palette.amber : CFG.palette.cyan;

      var per = Math.max(2, Math.round(n / this.links.length));
      for (var k = 0; k < per; k++) {
        var u = ((this.time * L.rate) + L.phase + k / per) % 1;
        var iu = 1 - u, px = iu*iu*ax + 2*iu*u*mx + u*u*bx, py = iu*iu*ay + 2*iu*u*my + u*u*by;
        var fade = Math.sin(Math.PI * u);
        var r = (2.0 + fade * 2.6) * this.dpr;
        var alpha = 0.38 * fade * intensity * w;
        var g = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
        g.addColorStop(0, this._rgba(col, alpha));
        g.addColorStop(1, this._rgba(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, r * 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  };

  Reveal.prototype._rgba = function (hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  };

  /* ---------------------------------------------------------------------------
   * Frame.
   * ------------------------------------------------------------------------ */
  Reveal.prototype.render = function (p) {
    var ctx = this.ctx;
    this.time = (performance.now() - this.t0) / 1000;
    /* Cinematic treatment recedes as the platform takes over. */
    this.settle = ease.smooth(span(p, CFG.phases.transformation[0], 1.0));

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    if (p >= CFG.dividerEnd) { this._intelligence(ctx, p); return; }

    /* Which link in the chain is live. */
    var T = CFG.transitions, idx = 0;
    for (var i = 0; i < T.length; i++) { if (p >= T[i].start) idx = i; }
    var spec = T[idx];
    var t = clamp01((p - spec.start) / (spec.end - spec.start || 1e-6));

    /* Completed states become the previous state for the next reveal, with no
     * reset and no black frame between links. */
    var prev = spec.to === 0 ? null : this.seq.get(spec.to - 1);
    var next = this.seq.get(spec.to);
    this._transition(ctx, prev, next, t, spec);
  };

  Reveal.prototype.dispose = function () {
    this.mask.width = this.mask.height = 1;
    this.canvas.width = this.canvas.height = 1;
    this.ctx = null; this.maskCtx = null; this.seq = null;
  };

  I3E.Reveal = Reveal;

})(window);
