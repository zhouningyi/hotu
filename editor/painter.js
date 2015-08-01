'use strict';
//'./../ui/util' 目前暂时不用
define(['./../utils/utils', './../libs/event', './../render/painter_renderer'], function (Utils, EventEmitter, PainterRenderer) {
  var prevent = Utils.prevent; //清除默认事件
  var upper = Utils.upper; //首字母大写
  var isNone = Utils.isNone; //是否存在

  var body = $('body');
  var testNode = $('#test-container');

  function Painter(options) {
    this.initialize(options);
  }

  EventEmitter.extend(Painter, {
    options: {
      backN: 6
    },
    initialize: function (options) {
      options = Utils.deepMerge(this.options, options);
      this.modelDraw = options.modelDraw;//数据
      this.quality = options.quality || 2;//画板
      var brushes = this.brushes = options.brushes;//画笔相关
      var layer = this.layer = options.layer;//图层
      this.layers = options.layers;//
      //步骤相关
      this.cacheCurves = []; //临时存储的
      var backN = this.backN = options.backN || 20; //可回退的次数

      //其他
      this.renderer = new PainterRenderer({
        backN: backN,
        brushes: brushes,
        ctxFront: layer.frontCtx,
        ctxBack: layer.backCtx
      });
      this.saveN = 10;
      this.frontDrawIndex = 0;
      this.clickTime = 0.15;

      this.initEvents();
    },
    initEvents: function () {
      var curBrush, curFrontCtx, curve, self = this, brushes = this.brushes, layers = this.layers;
      var cacheCurves = this.cacheCurves, modelDraw = this.modelDraw;
      //
      layers
        .on('drawstart', function (d) {
          curBrush = brushes.current();
          curFrontCtx = layers.current().frontCtx;
          curBrush.begin(d.pt, curFrontCtx);
        })
        .on('draw', function (d) {
          window.global && global.trigger('paint-start');
          curBrush && curBrush.draw(d.pt, curFrontCtx);
        })
        .on('drawend', function (d) {
          if (!curBrush) return;
          var curve = curBrush.end(curFrontCtx);
          modelDraw.addCurve(curve);
          self.cacheCurves.push(curve);
          self.doneCurve(); //完成绘制
          window.global && global.trigger('paint-end');
        });
      window.global && global.on('painter-redraw', this.redraw.bind(this));
    },
    doneCurve: function () { //画完一笔 保存cacheCurves 并决策是否放到栅格化层中a
      var cacheCurves = this.cacheCurves;
      var renderer = this.renderer;
      var backCtx = this.layer.backCtx;
      if (cacheCurves.length > this.backN) {
        var curve = cacheCurves.splice(0, 1)[0];
        renderer.renderCurve(curve, backCtx); //把出栈的线绘制到后面去
        this.redraw(); //canvasFront刷新
      }
    },
    redraw: function () { //前端canvas重绘
      this.layer.clean('front'); //清除画面
      this.renderer.redrawCurves(this.cacheCurves);
    },
    save: function (obj, cb) {
      if (this.modelDraw) this.modelDraw.save(obj, cb);
    },
    new: function () { //重启
      this.cacheCurves = []; //tmp数据存储
      this.layer.clean();
    },
    back: function () { //后退一步
      var cache = this.cacheCurves;
      if (cache.length > 0) {
        cache.pop(); //临时组去除
        this.redraw(); //绘制刷新
        this.modelDraw.back();
      } else {
        return window.infoPanel && infoPanel.alert('不能再返回的过去....');
      }
    },
    linkTo: function (editor) {
      this.editor = editor;
    },
    data: function (c) {
      if (!c) return console.log('no data');
      if (!c || !c.length) return;
      var lastCurve = c[c.length - 1];
      if (lastCurve.c.length === 0) {
        c.splice(c.length - 1, c.length);
        if (!c.length) return;
        lastCurve = c[c.length - 1];
      }
      this.brushes.current(lastCurve.brushType);
      var datas = this.renderer.reload(c);
      this.cacheCurves = datas.cache;
    }
  });

  return Painter;
});