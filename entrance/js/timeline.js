/* =============================================================================
 * I3 CINEMATIC ENTRANCE — MASTER TIMELINE
 * -----------------------------------------------------------------------------
 * ONE normalised progress value, 0 -> 1, drives the entire sequence. Camera,
 * geometry, typography, post-processing and the handoff into the live platform
 * all read from it. There are no independent timers anywhere in the cinematic.
 *
 * Explicit states:
 *   intro-loading -> intro-ready -> intro-playing -> intro-transitioning
 *                 -> platform-ready -> intro-complete
 * ========================================================================== */
(function (global) {
  'use strict';

  var I3E = global.I3E = global.I3E || {};
  var CFG = I3E.config;
  var clamp01 = I3E.clamp01, span = I3E.span, ease = I3E.ease;

  function Timeline(opts) {
    this.mode = opts.mode || 'full';        /* full | short | reduced         */
    this.duration = (this.mode === 'short' ? CFG.shortDurationMs : CFG.durationMs) / 1000;
    this.p = (this.mode === 'short') ? CFG.shortStartP : 0;
    if (this.mode === 'reduced') { this.p = CFG.reducedP; }

    this.state = 'intro-loading';
    this.rate = 1;
    this.skipped = false;
    this.platformReady = false;
    this.holdElapsed = 0;
    this.reducedHeld = 0;
    this.onState = opts.onState || function () {};
    this._setState('intro-loading');
  }

  Timeline.prototype._setState = function (s) {
    if (this.state === s) return;
    this.state = s;
    this.onState(s, this.p);
  };

  Timeline.prototype.begin = function () {
    if (this.state === 'intro-loading' || this.state === 'intro-ready') {
      this._setState('intro-playing');
    }
  };

  Timeline.prototype.ready = function () {
    if (this.state === 'intro-loading') this._setState('intro-ready');
  };

  /* The platform behind the canvas has finished loading. */
  Timeline.prototype.markPlatformReady = function () {
    this.platformReady = true;
  };

  /* SKIP INTRO — resolves the remaining sequence at speed rather than cutting.
   * From any point this still runs the transformation, so there is never a
   * blank state, a flash, or a half-built platform. */
  Timeline.prototype.skip = function () {
    if (this.skipped || this.state === 'intro-complete') return;
    this.skipped = true;
    var remaining = Math.max(0.0001, 1 - this.p);
    var ms = Math.min(CFG.skipMaxMs, Math.max(CFG.skipMinMs, remaining * 1500));
    this.rate = (remaining / (ms / 1000)) * this.duration;
    this.holdElapsed = CFG.holdMaxMs;       /* never hold once skipping       */
    this.begin();
  };

  Timeline.prototype.update = function (dt) {
    if (this.state === 'intro-loading' || this.state === 'intro-ready') return this.p;
    if (this.state === 'intro-complete') return 1;

    /* Reduced motion: compose a single clear frame, hold, then hand over. */
    if (this.mode === 'reduced' && !this.skipped) {
      this.reducedHeld += dt * 1000;
      if (this.reducedHeld < CFG.reducedHoldMs) return this.p;
      this.rate = 2.6;
    }

    var next = this.p + (dt / this.duration) * this.rate;

    /* Loading cover: if the platform is not up yet, wait here briefly rather
     * than arriving at a transition with nothing to transition into. */
    if (!this.platformReady && !this.skipped && next > CFG.holdP && this.holdElapsed < CFG.holdMaxMs) {
      this.holdElapsed += dt * 1000;
      this.p = Math.min(next, CFG.holdP);
      return this.p;
    }

    this.p = clamp01(next);

    if (this.p >= CFG.phases.transformation[0] && this.state === 'intro-playing') {
      this._setState('intro-transitioning');
    }
    if (this.p >= 1) this._setState('platform-ready');

    return this.p;
  };

  /* Progress within a named phase, 0..1. */
  Timeline.prototype.phase = function (name) {
    var r = CFG.phases[name];
    return r ? span(this.p, r[0], r[1]) : 0;
  };

  /* Eased progress within a named phase. */
  Timeline.prototype.phaseEased = function (name) {
    return ease.smooth(this.phase(name));
  };

  Timeline.prototype.complete = function () { this._setState('intro-complete'); };

  I3E.Timeline = Timeline;

})(window);
