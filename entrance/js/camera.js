/* =============================================================================
 * I3 CINEMATIC ENTRANCE — CAMERA RIG + PROJECTION
 * -----------------------------------------------------------------------------
 * A minimal pinhole camera with a critically-damped follow. Keyframes describe
 * the intent; the damping gives the rig mass so it reads as an architectural
 * crane move rather than a scripted tween.
 *
 * World space: +x east, +y north, +z up.
 * ========================================================================== */
(function (global) {
  'use strict';

  var I3E = global.I3E = global.I3E || {};
  var CFG = I3E.config;

  /* --- Easing ------------------------------------------------------------- */
  var ease = {
    smooth: function (t) { return t * t * (3 - 2 * t); },
    smoother: function (t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    outQuint: function (t) { return 1 - Math.pow(1 - t, 5); }
  };
  I3E.ease = ease;

  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  I3E.clamp01 = clamp01;

  /* Normalised progress through a [start, end] window. */
  function span(p, a, b) { return clamp01((p - a) / (b - a || 1e-6)); }
  I3E.span = span;

  function Camera() {
    this.pos = CFG.cameraKeys[0].pos.slice();
    this.tgt = CFG.cameraKeys[0].tgt.slice();
    this.fov = CFG.cameraKeys[0].fov;
    this.px = 0; this.py = 0;           /* smoothed pointer parallax */
    this._basis = { r: [0, 0, 0], u: [0, 0, 0], f: [0, 0, 0] };
    this.scale = 1;
  }

  /* Interpolate the keyframe path at normalised progress p. */
  Camera.prototype.sample = function (p) {
    var K = CFG.cameraKeys, i = 0;
    while (i < K.length - 2 && p > K[i + 1].p) i++;
    var a = K[i], b = K[i + 1];
    var t = ease.smoother(clamp01((p - a.p) / (b.p - a.p || 1e-6)));
    return {
      pos: [a.pos[0] + (b.pos[0] - a.pos[0]) * t,
            a.pos[1] + (b.pos[1] - a.pos[1]) * t,
            a.pos[2] + (b.pos[2] - a.pos[2]) * t],
      tgt: [a.tgt[0] + (b.tgt[0] - a.tgt[0]) * t,
            a.tgt[1] + (b.tgt[1] - a.tgt[1]) * t,
            a.tgt[2] + (b.tgt[2] - a.tgt[2]) * t],
      fov: a.fov + (b.fov - a.fov) * t
    };
  };

  /* Advance the rig. dt in seconds. pointer in [-1,1] or null. */
  Camera.prototype.update = function (p, dt, pointer, instant) {
    var k = this.sample(p);

    /* Micro-motion: the frame breathes so quiet moments never feel frozen.
     * Damped toward the end so the landing is stable. */
    var t = performance.now() / 1000;
    var settle = 1 - ease.smooth(span(p, 0.86, 1.0));
    var d = CFG.driftAmount * settle;
    k.pos[0] += (Math.sin(t * 0.23) * 0.6 + Math.sin(t * 0.41 + 1.7) * 0.4) * d;
    k.pos[1] += (Math.sin(t * 0.19 + 2.2) * 0.5) * d * 0.8;
    k.pos[2] += (Math.sin(t * 0.27 + 0.6) * 0.5) * d * 0.7;
    k.tgt[0] += Math.sin(t * 0.17 + 1.1) * d * 0.35;

    if (pointer && CFG.pointerParallax > 0) {
      this.px += (pointer.x - this.px) * Math.min(1, dt * 1.6);
      this.py += (pointer.y - this.py) * Math.min(1, dt * 1.6);
      var pp = CFG.pointerParallax * settle;
      k.pos[0] += this.px * pp;
      k.pos[2] += this.py * pp * 0.55;
    }

    var a = instant ? 1 : (1 - Math.exp(-dt / CFG.cameraDamping));
    for (var i = 0; i < 3; i++) {
      this.pos[i] += (k.pos[i] - this.pos[i]) * a;
      this.tgt[i] += (k.tgt[i] - this.tgt[i]) * a;
    }
    this.fov += (k.fov - this.fov) * a;
  };

  /* Rebuild the view basis and focal length for the current frame. */
  Camera.prototype.prepare = function (w, h) {
    var f = [this.tgt[0] - this.pos[0], this.tgt[1] - this.pos[1], this.tgt[2] - this.pos[2]];
    var fl = Math.hypot(f[0], f[1], f[2]) || 1;
    f[0] /= fl; f[1] /= fl; f[2] /= fl;

    /* right = forward x worldUp. Degenerates when looking straight down, so
     * fall back to a fixed north reference to keep the roll stable. */
    var r = [f[1] * 1 - f[2] * 0, f[2] * 0 - f[0] * 1, 0];
    var rl = Math.hypot(r[0], r[1], r[2]);
    if (rl < 1e-4) { r = [1, 0, 0]; rl = 1; }
    r[0] /= rl; r[1] /= rl; r[2] /= rl;

    var u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];

    this._basis.f = f; this._basis.r = r; this._basis.u = u;
    this.w = w; this.h = h;
    this.focal = (h * 0.5) / Math.tan(this.fov * Math.PI / 360);
    this.cx = w * 0.5; this.cy = h * 0.5;
  };

  /* Project a world point. Returns false when behind the camera.
   * out = [screenX, screenY, depth, scaleFactor] */
  Camera.prototype.project = function (x, y, z, out) {
    var dx = x - this.pos[0], dy = y - this.pos[1], dz = z - this.pos[2];
    var B = this._basis;
    var cz = dx * B.f[0] + dy * B.f[1] + dz * B.f[2];
    if (cz < 0.012) return false;
    var cx = dx * B.r[0] + dy * B.r[1] + dz * B.r[2];
    var cy = dx * B.u[0] + dy * B.u[1] + dz * B.u[2];
    var k = this.focal / cz;
    out[0] = this.cx + cx * k;
    out[1] = this.cy - cy * k;
    out[2] = cz;
    out[3] = k;
    return true;
  };

  I3E.Camera = Camera;

})(window);
