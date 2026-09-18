/* =============================================================================
 * I3 CINEMATIC ENTRANCE — IMAGE SEQUENCE LOADER
 * -----------------------------------------------------------------------------
 * Loads the registered state images and reports progress so the cinematic can
 * use its own opening darkness as the loading cover. Nothing is decoded on the
 * critical path twice: images are decoded once and held as ImageBitmap where
 * the browser supports it, otherwise as HTMLImageElement.
 * ========================================================================== */
(function (global) {
  'use strict';

  var I3E = global.I3E = global.I3E || {};
  var CFG = I3E.config;

  function pickSet() {
    var w = Math.max(global.innerWidth || 0, document.documentElement.clientWidth || 0);
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    /* Use the 1024 set on small viewports, and on low-DPR small laptops where
     * the extra pixels would never be resolved anyway. */
    return (w * dpr) <= (CFG.mobileMaxWidth * 2) ? CFG.mobileSuffix : '';
  }

  function Sequence() {
    this.frames = new Array(CFG.sequence.length);
    this.loaded = 0;
    this.total = CFG.sequence.length;
    this.suffix = pickSet();
    this.ready = false;
    this.failed = [];
  }

  Sequence.prototype.url = function (i) {
    return CFG.assetPath + CFG.sequence[i].file + this.suffix + '.webp';
  };

  /* Loads in narrative order so the opening states are available first and the
   * sequence can begin before the heavy late frames have arrived. */
  Sequence.prototype.load = function (onProgress) {
    var self = this;
    var jobs = CFG.sequence.map(function (spec, i) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.decoding = 'async';
        img.onload = function () {
          var finish = function (bmp) {
            self.frames[i] = { img: bmp || img, w: img.naturalWidth, h: img.naturalHeight,
                               dx: spec.dx, dy: spec.dy, label: spec.label };
            self.loaded++;
            if (onProgress) onProgress(self.loaded / self.total, i);
            resolve();
          };
          if (global.createImageBitmap) {
            global.createImageBitmap(img).then(finish).catch(function () { finish(null); });
          } else { finish(null); }
        };
        img.onerror = function () {
          self.failed.push(spec.file);
          self.loaded++;
          if (onProgress) onProgress(self.loaded / self.total, i);
          resolve();
        };
        img.src = self.url(i);
      });
    });
    return Promise.all(jobs).then(function () {
      self.ready = true;
      return self;
    });
  };

  /* The first N frames needed before playback can safely begin. */
  Sequence.prototype.headReady = function (n) {
    for (var i = 0; i < n && i < this.frames.length; i++) if (!this.frames[i]) return false;
    return true;
  };

  Sequence.prototype.get = function (i) {
    if (i < 0) return null;
    /* Fall back to the nearest available frame so a failed asset degrades to a
     * held state rather than a hole in the sequence. */
    for (var k = i; k >= 0; k--) if (this.frames[k]) return this.frames[k];
    for (var j = i; j < this.frames.length; j++) if (this.frames[j]) return this.frames[j];
    return null;
  };

  Sequence.prototype.dispose = function () {
    this.frames.forEach(function (f) {
      if (f && f.img && typeof f.img.close === 'function') f.img.close();
    });
    this.frames.length = 0;
  };

  I3E.Sequence = Sequence;

})(window);
