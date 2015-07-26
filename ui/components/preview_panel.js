'use strict';
//对UI的总体控制
define(['./../../utils/utils', './../../libs/event', './../data_preview', './../../render/renderer'], function (Utils, Event, data, Renderer) {
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;
  var c = data.c[0];

  function PreviewPanel(container, options) {
    this.initialize(container, options);
  }
  Event.extend(PreviewPanel, {
    isIn: false,
    options: {
      width: 200,
      height: 100,
      background: '#333',
      bgColor: 'rgba(0,0,0,0.2)',
      in: {
        time: 0.2
      },
      out: {
        delay: 0.2,
        time: 0.3
      }
    },
    initialize: function (container, options) {
      this.container = container;
      var brushes = this.brushes = options.brushes;
      Utils.extend(this.options, options);

      //
      this.renderer = new Renderer({brushes: brushes});
      this.initDom();
      this.initEvents();
      this.transformData();
    },
    initDom: function () {
      var options = this.options;
      this.panelNode = $('<div class="preview-node" style="height:' + options.height + 'px;width:' + options.width + 'px; background:' + options.background + ';"></div>')
        .appendTo(this.container);
      this.ctx = Utils.genCanvas({
        container: this.panelNode
      });
    },
    initEvents: function () {
      this.brushes.on('style-change', this.render.bind(this));
      this.brushes.on('current', this.render.bind(this));

      global && global
        .on('main-color-change', this.setBg.bind(this))
        .on('select-start-brush', this.in.bind(this))
        .on('select-end', this.out.bind(this))
        .on('new-drawing', this.reset.bind(this));
    },
    setBg: function (color) {
      this.options.background = color;
      this.panelNode.css({background: color});
    },
    reset: function () {
      this.setBg('#fff');
    },
    transformData: function () {
      var options = this.options;
      var width = options.width, height = options.height;
      var curves = c.c, pt;
      for (var k in curves) {
        pt = curves[k];
        pt[0] = pt[0] / 1.8 + 10;
        pt[1] = pt[1] / 1.5 + 20;
      }
    },
    in : function (e) {
      if (this.isIn) return;
      this.panelNode.keyAnim('fadeIn', this.options.in);
      this.isIn = true;
    },
    out: function (e) {
      if (!this.isIn) return;
      this.panelNode.keyAnim('fadeOut', this.options.out);
      this.isIn = false;
    },
    render: function () {
      var brushType = c.brushType = this.brushes.current().id;
      var ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (brushType.indexOf('eraser') !== -1) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.options.bgColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = 'rgba(255,30,0,0.5)';
      }
      this.renderer.drawCurve(c, ctx);
      ctx.name = brushType;
    }
  });
  return PreviewPanel;
});