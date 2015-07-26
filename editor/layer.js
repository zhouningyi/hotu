'use strict';
define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {

  var body = $('body');
  var prevent = Utils.prevent;

 /**
  * Layer 创建一个图层
  * @param {Object} container 单个图层
  * @param {Object} options   配置
  */
  function Layer(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(Layer, {
    isHide: false,
    options: {
      type: 'brush', //brush  background image
      quality: 2,
      id: 'id_' + parseInt(Math.random() * 10000)
    },
    initialize: function (container, options) {
      this.container = container;
      this.options = Utils.deepMerge(this.options, options);
      this.type = options.type;
      this.id = options.id;

      this.initDom();
      this.initEvents();

      this.layerContainer = container.find('.layer');
    },
    initDom: function () {
      if (this.type === 'brush') return this.initDomBrushLayer();
      this.initDomCommonLayer();
    },
    initDomBrushLayer: function () {
      var options = this.options, quality = options.quality || 2, id = options.id;
      var container = this.container;
      var w = container.width();
      var h = container.height();
      var canvasStyle = 'position:absolute;top:0;left:0;width:' + w + 'px; height:' + h + 'px;';
      $(
        '<div class="container layer transition"  id="' + id + '" style="pointer-events:none; z-index:1;">\
          <canvas width="' + w * quality + '" height="' + h * quality + '" style="z-index:1;' + canvasStyle + '" class="front"></canvas>\
        </div>'
        ).appendTo(container);
      //backCanvas 是离线的
      var backCanvas = this.backCanvas = $('<canvas width="' + w * quality + '" height="' + h * quality + '" class="back"></canvas>')[0];
      var backCtx = this.backCtx = backCanvas.getContext('2d');
      backCanvas.quality = quality;
      backCtx.scale(quality, quality);
      //
      var frontCanvas = this.frontCanvas = this.canvas = container.find('.front')[0];
      var frontCtx = this.frontCtx = this.ctx = frontCanvas.getContext('2d');
      frontCanvas.quality = quality;
      frontCtx.scale(quality, quality);
    },
    initDomCommonLayer: function () {
      var options = this.options, quality = options.quality || 2, id = options.id;
      var container = this.container;
      var w = container.width();
      var h = container.height();
      var canvasStyle = 'position:absolute;top:0;left:0;width:' + w + 'px; height:' + h + 'px;';
      $(
        '<div class="container layer"  id="' + id + '" style="pointer-events:none; z-index:0;">\
          <canvas width="' + w * quality + '" height="' + h * quality + '" style="z-index:1;' + canvasStyle + '" class="main"></canvas>\
        </div>'
        ).appendTo(container);
      var canvas = this.canvas = this.frontCanvas = container.find('.main')[0];
      var ctx = this.ctx = this.frontCtx = canvas.getContext('2d');
      canvas.quality = quality;
      ctx.scale(quality, quality);
    },
    clean: function (type) {//清除canvas内容
      if (type === 'front' || !type) {
        this.frontCtx && this.frontCtx.clearRect(0, 0, this.frontCtx.canvas.width, this.frontCtx.canvas.height);
      }
      if (type === 'back' || !type) {
        this.backCtx && this.backCtx.clearRect(0, 0, this.backCtx.canvas.width, this.backCtx.canvas.height);
      }
      this.layerContainer.css('background', 'rgba(0,0,0,0)');
    },
    active: function () {
      this.container.css({'pointer-events': 'auto'});
    },
    unActive: function () {
      this.container.css({'pointer-events': 'none'});
    },
    initEvents: function () {
    },
    switch: function () {
      if (this.isOut) return this.in();
      this.out();
    },
    in : function () {
      if (!this.isOut) return;
      this.container.keyAnim('fadeIn', {
        time: 0.1
      });
      this.isOut = false;
    },
    out: function () {
      if (this.isOut) return;
      this.container.keyAnim('fadeOut', {
        time: 0.1
      });
      this.isOut = true;
    },
    destroy: function () {
      this.container.remove();
      this.off();
    },
    getCanvas: function () {
      if(this.type === 'brush') return [this.backCanvas, this.frontCanvas];
      return [this.frontCanvas];
    },
    addTo: function (editor) {
      this.editor = editor;
    },
    getPt: function (e) { //获取点
    var left = this.left,
      top = this.top;
    var x, y, t = this.getTimeRelative().toFixed(4);
    if (e.type.indexOf('mouse') !== -1) {
      x = (e.x || e.pageX) - left;
      y = (e.y || e.pageY) - top;
    } else {
      var touch = window.event.touches[0];
      x = touch.pageX - left;
      y = touch.pageY - top;
    }
    var pinchScale = this.pinchScale;
    var originX = this.cx * (1 - pinchScale) + this.pinchX;
    x = (x - originX) / pinchScale;
    var originY = this.cy * (1 - pinchScale) + this.pinchY;
    y = (y - originY) / pinchScale;
    return [x, y, t];
  },
  restart: function () {//删除后重新新建一幅画
  }
  });
  return Layer;
});
