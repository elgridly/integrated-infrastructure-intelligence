/* =============================================================================
 * I3 CINEMATIC ENTRANCE — ORCHESTRATOR
 * -----------------------------------------------------------------------------
 * Owns the master progress, the state machine, and the handoff into the live
 * platform. The platform loads underneath from the first frame, so the intro is
 * never followed by a wait.
 *
 * States: intro-loading -> intro-ready -> intro-playing -> intro-transitioning
 *         -> platform-ready -> intro-complete
 * ========================================================================== */
(function (global) {
  'use strict';

  var I3E = global.I3E, CFG = I3E.config;
  var ease = I3E.ease, clamp01 = I3E.clamp01, span = I3E.span;
  var doc = document;

  function qs(id) { return doc.getElementById(id); }
  function param(name) {
    return new URLSearchParams(global.location.search).get(name);
  }

  /* --- Access gate, matching the existing platform pages -------------------- */
  function gate() {
    try {
      if (sessionStorage.getItem(CFG.authKey)) return true;
      var k = global.prompt('Enter passkey to continue:');
      if (k === null || k !== CFG.authPass) return false;
      sessionStorage.setItem(CFG.authKey, '1');
      return true;
    } catch (e) { return true; }   /* storage blocked: do not lock the user out */
  }

  function storage(key, val) {
    try {
      if (val === undefined) return sessionStorage.getItem(key);
      sessionStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function pickTier() {
    var mem = global.navigator.deviceMemory || 4;
    var cpu = global.navigator.hardwareConcurrency || 4;
    var w = global.innerWidth;
    if (w < 700 || mem <= 2 || cpu <= 2) return 'low';
    if (w < 1280 || mem <= 4 || cpu <= 4) return 'medium';
    return 'high';
  }

  function Entrance() {
    this.state = 'intro-loading';
    this.p = 0;
    this.raw = 0;
    this.platformReady = false;
    this.holdMs = 0;
    this.skipping = false;
    this.done = false;
    this.lastT = performance.now();
    this.frames = []; this.slow = 0;

    this.el = {
      stage:   qs('stage'),
      canvas:  qs('cine'),
      scroller:qs('scroller'),
      skip:    qs('skip'),
      copy:    qs('copy'),
      brand:   qs('brand'),
      brandTail: qs('brand-tail'),
      brandScrim: qs('brand-scrim'),
      hint:    qs('hint'),
      app:     qs('app'),
      progress:qs('progress')
    };

    this.targetKey = CFG.targets[param('to')] ? param('to') : CFG.defaultTarget;
    this.target = CFG.targets[this.targetKey];

    this.mode = this._mode();
    this.tierName = pickTier();
    this.tier = CFG.tiers[this.tierName];

    /* Dev/test only: ?p=<0..1> freezes a moment, &skip=1 then exercises the
     * skip resolution from that moment. Both are documented in the README. */
    if (param('skip') === '1') {
      var self0 = this;
      setTimeout(function () { self0.skip(); }, 900);
    }

    this._buildCopy();
    this._mountPlatform();
    this._bind();
    this._start();
  }

  /* --- Entry mode ---------------------------------------------------------- *
   * ?intro=full forces the complete experience, which is the development and
   * demo replay mechanism. ?intro=off enters directly.
   * ------------------------------------------------------------------------ */
  Entrance.prototype._mode = function () {
    /* ?p=<0..1> freezes the sequence at one progress value. Development and
     * demo aid: it makes any moment inspectable and reviewable. */
    var frozen = parseFloat(param('p'));
    if (!isNaN(frozen)) { this.frozenAt = clamp01(frozen); return 'frozen'; }
    var forced = param('intro');
    if (forced === 'off') return 'off';
    if (forced === 'full') return 'full';
    if (forced === 'short') return 'short';
    if (forced === 'reduced') return 'reduced';
    var rm = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return 'reduced';
    if (storage(CFG.seenKey)) return 'short';
    return 'full';
  };

  /* --- Live platform, loading from the first frame -------------------------- */
  Entrance.prototype._mountPlatform = function () {
    var self = this;
    var f = doc.createElement('iframe');
    f.className = 'app-frame';
    f.setAttribute('title', this.target.title);
    f.setAttribute('scrolling', 'no');
    f.addEventListener('load', function () {
      self.platformReady = true;
      self._prepareUiMaterialisation();
    });
    f.src = this.target.url;
    this.el.app.appendChild(f);
    this.frame = f;
    doc.title = this.target.title;

    /* Never strand the user if the frame cannot load. */
    setTimeout(function () {
      if (!self.platformReady) self.platformReady = true;
    }, 9000);
  };

  /* Stages the EXISTING platform chrome so it materialises in order.
   * Nothing is restyled: this adds a short entrance transition and removes
   * itself afterwards, and it is skipped entirely under reduced motion.
   *
   * Transitions, not keyframe animations with a fill mode. An animation that
   * never advances leaves `both` holding the content at opacity 0, which
   * blanks the live platform. A transition always lands on its end state, so
   * the worst case is that the UI simply appears. */
  Entrance.prototype._prepareUiMaterialisation = function () {
    if (this.mode === 'reduced') return;
    try {
      var d = this.frame.contentDocument;
      if (!d || !d.head) return;
      if (d.querySelector('style[data-i3-entrance]')) { this.uiDoc = d; return; }
      var sel = 'header, main > *';
      var css =
        '.i3e-pre :is(' + sel + '){opacity:0;transform:translateY(10px)}' +
        '.i3e-go :is(' + sel + '){opacity:1;transform:none;' +
          'transition:opacity .50s cubic-bezier(.22,.61,.36,1),transform .50s cubic-bezier(.22,.61,.36,1)}' +
        '.i3e-go main > *:nth-child(1){transition-delay:.09s}' +
        '.i3e-go main > *:nth-child(2){transition-delay:.17s}' +
        '.i3e-go main > *:nth-child(3){transition-delay:.25s}' +
        '.i3e-go main > *:nth-child(n+4){transition-delay:.31s}' +
        '@media (prefers-reduced-motion: reduce){.i3e-pre :is(' + sel + '){opacity:1;transform:none}}';
      var st = d.createElement('style');
      st.setAttribute('data-i3-entrance', 'materialise');
      st.textContent = css;
      d.head.appendChild(st);
      this.uiDoc = d;
    } catch (e) { /* cross-origin or blocked: the platform simply appears */ }
  };

  Entrance.prototype._materialiseUi = function () {
    if (this._materialised) return;
    this._materialised = true;
    var self = this;
    try {
      var d = this.uiDoc;
      if (!d || !d.body) return;
      var b = d.body, win = d.defaultView || global;

      b.classList.add('i3e-pre');
      void b.offsetHeight;                       /* commit the start state    */
      win.requestAnimationFrame(function () {
        b.classList.remove('i3e-pre');
        b.classList.add('i3e-go');
      });

      /* Always return the live page to exactly how it ships. Runs from both
       * sides so a stalled frame cannot strand the platform mid-reveal. */
      var cleanup = function () {
        try {
          b.classList.remove('i3e-pre', 'i3e-go');
          var tag = d.querySelector('style[data-i3-entrance]');
          if (tag && tag.parentNode) tag.parentNode.removeChild(tag);
        } catch (e) {}
      };
      win.setTimeout(cleanup, 1500);
      setTimeout(cleanup, 1800);
      self._uiCleanup = cleanup;
    } catch (e) { /* no-op */ }
  };

  /* --- Cinematic typography, live DOM -------------------------------------- */
  Entrance.prototype._buildCopy = function () {
    var frag = doc.createDocumentFragment();
    this.copyEls = CFG.copy.map(function (c) {
      var el = doc.createElement('div');
      el.className = 'copy-line';
      el.textContent = c.line;
      frag.appendChild(el);
      return { el: el, spec: c };
    });
    this.el.copy.appendChild(frag);
  };

  Entrance.prototype._bind = function () {
    var self = this;
    this._onScroll = function () { self._readScroll(); };
    this._onResize = function () { if (self.reveal) self.reveal.resize(); self._readScroll(); };
    this._onKey = function (e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        if (!self.done) { e.preventDefault(); self.skip(); }
      }
    };
    global.addEventListener('scroll', this._onScroll, { passive: true });
    global.addEventListener('resize', this._onResize);
    doc.addEventListener('keydown', this._onKey);
    this.el.skip.addEventListener('click', function () { self.skip(); });
  };

  Entrance.prototype._readScroll = function () {
    if (this.mode !== 'full') return;
    var max = doc.documentElement.scrollHeight - global.innerHeight;
    this.raw = max > 0 ? clamp01(global.scrollY / max) : 0;
  };

  Entrance.prototype._setState = function (s) {
    if (this.state === s) return;
    this.state = s;
    doc.documentElement.setAttribute('data-intro-state', s);
  };

  Entrance.prototype._start = function () {
    var self = this;
    this._setState('intro-loading');

    if (this.mode === 'off') { this._finishImmediate(); return; }

    doc.documentElement.setAttribute('data-intro-mode', this.mode);
    if (this.mode === 'full') {
      this.el.scroller.style.height = CFG.scrollHeightVh + 'vh';
    }
    /* Frozen mode must not mark the entrance as seen, or the next real visit
     * would silently downgrade to the short transition. */
    this.suppressSeen = (this.mode === 'frozen');

    this.seq = new I3E.Sequence();
    this.reveal = new I3E.Reveal(this.el.canvas, this.seq, this.tier);
    this._loop();                                   /* darkness covers loading */

    this.seq.load(function (frac) {
      if (self.el.progress) self.el.progress.style.transform = 'scaleX(' + frac + ')';
    }).then(function () {
      /* Skipping during load already handed over. Without this guard the
       * pending load would start the cinematic again behind the platform. */
      if (self.done || self.state === 'platform-ready' || self.state === 'intro-complete') return;
      self._setState('intro-ready');
      if (self.seq.failed.length === self.seq.total) { self._finishImmediate(); return; }
      self._begin();
    });
  };

  Entrance.prototype._begin = function () {
    if (this.done) return;
    this._setState('intro-playing');
    this.el.stage.classList.add('is-live');
    if (this.mode === 'short') {
      this.p = CFG.shortStartP;
      this.autoFrom = CFG.shortStartP;
      this.autoStart = performance.now();
      this.autoDur = CFG.shortDurationMs;
    } else if (this.mode === 'frozen') {
      this.p = this.frozenAt;
    } else if (this.mode === 'reduced') {
      this.p = CFG.reducedP;
      this.reducedUntil = performance.now() + CFG.reducedHoldMs;
    } else {
      this._readScroll();
    }
    if (!this.suppressSeen) storage(CFG.seenKey, '1');
  };

  /* --- SKIP ---------------------------------------------------------------- *
   * Resolves the current state forward through the climax and the platform
   * transformation. It never tears the cinematic down mid-flight, so skipping
   * at any point still lands on a correct, interactive platform.
   * ------------------------------------------------------------------------ */
  Entrance.prototype.skip = function () {
    if (this.skipping || this.done) return;
    this.skipping = true;
    /* Nothing has been drawn yet, so there is no cinematic state to resolve
     * gracefully. Hand straight over rather than flashing a partial frame. */
    if (this.state === 'intro-loading') { this._finishImmediate(); return; }
    this.holdMs = CFG.holdMaxMs;
    this.autoFrom = this.p;
    this.autoStart = performance.now();
    var remaining = Math.max(0.001, 1 - this.p);
    this.autoDur = Math.min(CFG.skipMaxMs, Math.max(CFG.skipMinMs, remaining * CFG.skipMaxMs));
    this.el.skip.classList.add('is-gone');
  };

  Entrance.prototype._finishImmediate = function () {
    if (this.done) return;
    doc.documentElement.setAttribute('data-intro-mode', 'off');
    this.p = 1;
    this._setState('platform-ready');
    this._materialiseUi();
    this._complete();
  };

  /* --- Frame --------------------------------------------------------------- */
  Entrance.prototype._loop = function () {
    if (this._stopped) return;
    var self = this;
    this._raf = requestAnimationFrame(function () { self._loop(); });

    var now = performance.now();
    var dt = Math.min(0.05, (now - this.lastT) / 1000);
    this.lastT = now;

    if (this.state === 'intro-playing' || this.state === 'intro-transitioning') {
      this._advance(now, dt);
    }
    if (this.reveal) this.reveal.render(this.p);
    this._paintDom();
    this._watchPerf(now);
  };

  Entrance.prototype._advance = function (now, dt) {
    if (this.mode === 'frozen' && !this.skipping) { this.p = this.frozenAt; return; }
    if (this.mode === 'reduced' && !this.skipping) {
      if (now < this.reducedUntil) return;
      if (!this.autoStart) {
        this.autoFrom = this.p; this.autoStart = now; this.autoDur = 900;
      }
    }

    var next;
    if (this.autoStart) {
      var t = clamp01((now - this.autoStart) / this.autoDur);
      next = this.autoFrom + (1 - this.autoFrom) * ease.outCubic(t);
    } else {
      /* Scroll drives progress; smoothing gives the plane weight without ever
       * breaking the link to scroll position, so reverse scroll just works. */
      next = this.p + (this.raw - this.p) * Math.min(1, dt / CFG.scrollSmoothing);
    }

    /* Bounded wait so the handoff never lands before the platform is up. */
    if (!this.platformReady && !this.skipping && next > CFG.holdP && this.holdMs < CFG.holdMaxMs) {
      this.holdMs += dt * 1000;
      this.p = Math.min(next, CFG.holdP);
      return;
    }

    this.p = clamp01(next);
    if (this.p >= CFG.phases.transformation[0]) this._setState('intro-transitioning');
    if (this.p >= 0.9995 && !this.done) { this._setState('platform-ready'); this._complete(); }
  };

  /* --- DOM layers ---------------------------------------------------------- */
  Entrance.prototype._paintDom = function () {
    var p = this.p, st = this.el;

    for (var i = 0; i < this.copyEls.length; i++) {
      var c = this.copyEls[i], s = c.spec;
      var inT = span(p, s.enter, s.enter + 0.035);
      var outT = span(p, s.exit - 0.030, s.exit);
      var a = ease.smooth(inT) * (1 - ease.smooth(outT));
      c.el.style.opacity = a;
      c.el.style.transform = 'translateY(' + ((1 - ease.outCubic(inT)) * 12) + 'px)';
      c.el.style.filter = 'blur(' + ((1 - ease.outCubic(inT)) * 5).toFixed(2) + 'px)';
    }

    /* I3 resolves out of the clarity moment, then travels toward where the
     * mark actually lives in the application header. */
    var bIn = span(p, CFG.phases.brand[0], CFG.phases.brand[0] + 0.030);
    var tr  = span(p, CFG.phases.transformation[0], 1);
    var etr = ease.inOutCubic(tr);
    var bA = ease.smooth(bIn) * (1 - ease.smooth(span(p, 0.988, 1)));
    st.brand.style.opacity = bA;

    /* The wordmark drops away first so what actually travels is the mark
     * alone, arriving at the size and position it occupies in the real
     * header. Its final resting place is the live logo. */
    if (st.brandTail) {
      var tailOut = ease.smooth(span(p, CFG.phases.transformation[0], CFG.phases.transformation[0] + 0.020));
      st.brandTail.style.opacity = 1 - tailOut;
      st.brandTail.style.transform = 'translateY(' + (tailOut * -8).toFixed(1) + 'px)';
      /* The scrim exists to hold the wordmark over a bright city. Once the
       * wordmark has gone it would just be a halo following the mark. */
      if (st.brandScrim) st.brandScrim.style.opacity = 1 - tailOut;
    }

    /* Measured, not assumed: scale the live mark to the header logo size. */
    var markW = (st.brand.firstElementChild && st.brand.firstElementChild.offsetWidth) || 86;
    var scale = 1 - (1 - 36 / markW) * etr;
    var tx = (-0.5 * global.innerWidth + this.target.logoX) * etr;
    var ty = (-0.5 * global.innerHeight + this.target.logoY) * etr;
    /* The -50% centring lives in the transform because setting `transform`
     * from script replaces the declared value wholesale. */
    st.brand.style.transform =
      'translate(-50%,-50%) translate(' + tx.toFixed(1) + 'px,' +
      (ty + (1 - ease.outCubic(bIn)) * 14).toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';

    /* Cinematic layer hands the screen to the live platform. The stage starts
     * clearing while the platform is still resolving, so the two genuinely
     * cross rather than one replacing the other. */
    st.stage.style.opacity = 1 - ease.smooth(span(p, 0.949, 0.992));
    var appA = ease.smooth(span(p, CFG.phases.transformation[0], 0.982));
    st.app.style.opacity = appA;
    st.app.style.transform = 'scale(' + (1 + 0.035 * (1 - appA)).toFixed(4) + ')';
    st.app.style.filter = appA > 0.995 ? 'none' : 'blur(' + ((1 - appA) * 9).toFixed(2) + 'px)';

    if (p > CFG.phases.transformation[0] + 0.012) this._materialiseUi();

    if (st.hint) st.hint.style.opacity = (this.mode === 'full' && p < 0.035) ? 1 : 0;
    if (!this.skipping && !this.done) st.skip.style.opacity = p < 0.975 ? 1 : 0;
  };

  Entrance.prototype._watchPerf = function (now) {
    this.frames.push(now);
    if (this.frames.length > CFG.perfWindow) this.frames.shift();
    if (this.frames.length < CFG.perfWindow || this.tierName === 'low') return;
    var avg = (this.frames[this.frames.length - 1] - this.frames[0]) / (this.frames.length - 1);
    if (avg > CFG.perfBudgetMs) {
      this.slow++;
      if (this.slow > 2) {
        this.tierName = this.tierName === 'high' ? 'medium' : 'low';
        this.tier = CFG.tiers[this.tierName];
        if (this.reveal) { this.reveal.tier = this.tier; this.reveal.resize(); }
        this.frames.length = 0; this.slow = 0;
      }
    } else { this.slow = 0; }
  };

  /* --- Completion: release everything -------------------------------------- */
  Entrance.prototype._complete = function () {
    if (this.done) return;
    this.done = true;
    var self = this;

    this._materialiseUi();
    doc.documentElement.setAttribute('data-intro-state', 'intro-complete');
    /* Clear the frame-by-frame inline styles so nothing from the cinematic
     * can hold the platform at reduced opacity or a stale transform. */
    this.el.app.style.opacity = '';
    this.el.app.style.transform = '';
    this.el.app.style.filter = '';

    global.removeEventListener('scroll', this._onScroll);
    global.removeEventListener('resize', this._onResize);
    doc.removeEventListener('keydown', this._onKey);

    setTimeout(function () {
      self._stopped = true;
      if (self._raf) { cancelAnimationFrame(self._raf); self._raf = null; }
      if (self.reveal) { self.reveal.dispose(); self.reveal = null; }
      if (self.seq) { self.seq.dispose(); self.seq = null; }
      if (self.el.stage && self.el.stage.parentNode) {
        self.el.stage.parentNode.removeChild(self.el.stage);
      }
      if (self.el.scroller && self.el.scroller.parentNode) {
        self.el.scroller.parentNode.removeChild(self.el.scroller);
      }
      doc.documentElement.style.overflow = 'hidden';
      global.scrollTo(0, 0);
      if (self._uiCleanup) self._uiCleanup();
      self._setState('intro-complete');
      /* Address bar reflects where the user actually is, so a reload lands on
       * the real page rather than replaying the entrance. */
      try { history.replaceState(null, '', self.target.url.replace('../', '')); } catch (e) {}
    }, 420);
  };

  /* --- Boot ---------------------------------------------------------------- */
  function boot() {
    if (!gate()) {
      doc.documentElement.innerHTML =
        '<head></head><body style="background:#0D0D14;color:#888;font-family:sans-serif;' +
        'text-align:center;padding-top:40vh">Access denied.</body>';
      return;
    }
    global.I3Entrance = new Entrance();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();

})(window);
