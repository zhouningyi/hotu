'use strict';
define(['./../utils/utils', './animation', './../libs/event', './renderer'], function (Utils, Animator, EventsEmiter, Renderer) {
  var obj2hsla = Utils.obj2hsla;
  var merge = Utils.merge;

  function PaintRenderer(options) {
    this.initialize(options);
  }

  EventsEmiter.extend(PaintRenderer, {
    options: {
      backN: 6,
      stepPtN: 200,
      brushes: null,
      ctxFront: null,
      ctxBack: null
    },
    initialize: function (options) {
      this.options = Utils.deepMerge(this.options, options);
      this.ctxFront = options.ctxFront;
      this.ctxBack = options.ctxBack;
      this.brushes = options.brushes;
      this.renderer = new Renderer(options);
    },

    splitData: function (curves) {
      var options = this.options;
      var backN = options.backN;
      // if (!Utils.checkDrawData(data)) return;
      var curveN = curves.length;
      if (backN >= curveN) return {cache: curves};
      var splitIndex = curveN - backN - 1;
      return {cache: curves.slice(splitIndex), base: curves.slice(0, splitIndex)};
    },

    reload: function (curves, cb) {
      if (!curves) return;
      var self = this;
      var datas = this.splitData(curves);
      var base = datas.base;
      var cache = datas.cache;
      if (base) {
        this.renderBase(base, function () {
          self.redrawCurves(cache, cb);
        });
      } else {
        this.redrawCurves(cache, cb);
      }
      return datas;
    },

    renderBase: function (base, cb) {
      var options = this.options;
      var animator = new Animator({
        stepPtN: options.stepPtN,
        brushes: this.brushes,
        ctx: this.ctxBack
      });
      animator.data({c: base});
      animator.on('step', this.renderBackFront.bind(this));//为了进入的时候 可以看到动画
      if (cb) animator.on('end', cb);
    },

    renderBackFront: function () {
      var ctxFront = this.ctxFront;
      var canvasFront = ctxFront.canvas;
      var canvasBack = this.ctxBack.canvas;

      Utils.resetCtx(ctxFront);
      ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height);
      var gcOpt = ctxFront.globalCompositeOperation;
      ctxFront.globalCompositeOperation = 'source-over';
      ctxFront.drawImage(canvasBack, 0, 0,  canvasFront.width / canvasFront.quality, canvasFront.height / canvasFront.quality);//画图的一瞬间 修改globalCompositeOperation 为正常叠加模式！
      ctxFront.globalCompositeOperation = gcOpt;
    },

    redrawCurves: function (cache) {//直接绘制一组线
      this.renderBackFront();
      var ctxFront = this.ctxFront;
      //绘制笔
      for (var k in cache) {
        var curve = cache[k];
        this.renderCurve(curve, ctxFront);
      }
    },
    renderCurve: function (cData, ctx) {
      this.renderer.drawCurve(cData, ctx);
    }
  });

  return PaintRenderer;
});