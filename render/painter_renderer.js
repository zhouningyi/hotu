'use strict';
define(['./../utils/utils', './animator', './../libs/event', './renderer'], function (Utils, Animator, EventsEmiter, Renderer) {
  var obj2hsla = Utils.obj2hsla;
  var merge = Utils.extend;

  function PaintRenderer(opt) {
    merge(this, opt);
    this.renderer = new Renderer(opt);
  }

  EventsEmiter.extend(PaintRenderer, {
    backN: 15,
    maxStepPtN: 620,
    brushes: null,
    ctxFront: null,
    ctxBack: null,
    splitData: function (data) {
      var backN = this.backN;
      if (!Utils.checkDrawData(data)) return;
      var curves = data.c, curveN = curves.length;
      if (backN >= curveN) return {cache: curves, info: data};
      var splitIndex = curveN - backN - 1;
      return {cache: curves.slice(splitIndex), base: curves.slice(0, splitIndex), info: data};
    },

    reload: function (data, cb) {
      var self = this;
      var datas = this.splitData(data);
      var base = datas.base;
      var cache = datas.cache;
      if (base) {
        this.renderBase(base, function () {
          self.renderCache(cache, cb);
        });
      } else {
        this.renderCache(cache, cb);
      }
      return datas;
    },
    renderBase: function (base, cb) {
      var animator = new Animator({
        maxStepPtN: this.maxStepPtN,
        brushes: this.brushes,
        ctx: this.ctxBack
      });
      animator.data({c: base});
      if(cb) animator.on('end', cb);
    },

    renderCache: function (cache) {
      this.renderBackFront();
      var curve;
      for (var i in cache) {
        curve = cache[i];
        this.renderCurve(curve, this.ctxFront);
      }
    },

    renderBackFront: function () {
      var ctxFront = this.ctxFront;
      var canvasFront = ctxFront.canvas;
      var canvasBack = this.ctxBack.canvas;

      Utils.resetCtx(ctxFront);
      ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height);
      var globalCompositeOperation = ctxFront.globalCompositeOperation;
      ctxFront.globalCompositeOperation = 'source-over';
      ctxFront.drawImage(canvasBack, 0, 0,  canvasFront.width / canvasFront.quality, canvasFront.height / canvasFront.quality);//画图的一瞬间 修改globalCompositeOperation 为正常叠加模式！
      ctxFront.globalCompositeOperation = globalCompositeOperation;
    },

    redrawCurves: function (cache) {
      this.renderBackFront();

      //绘制笔
      for (var k in cache) {
        var curve = cache[k];
        this.renderCurve(curve, this.ctxFront);
      }
    },
    renderCurve: function (cData, ctx) {
      this.renderer.drawCurve(cData, ctx);
    }
  });

  return PaintRenderer;
});