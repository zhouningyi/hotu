'use strict';
//对UI的总体控制
define(['./../../utils/utils', './../../libs/event', './../data_preview', './../../render/painter_renderer'], function(Utils, Event, data, PainterRenderer) {
  var body = $('body');
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
      in:{
        time: 0.2
      },
      out:{
        delay: 0.2,
        time: 0.3
      }
    },
    initialize: function(container, options) {
      this.container = container;
      var brushes = this.brushes = options.brushes;
      Utils.extend(this.options, options);

      //
      this.renderer = new PainterRenderer({brushes: brushes});
      this.initDom();
      this.initEvents();
      this.transformData();
    },
    initDom: function() {
      var options = this.options;
      this.panelNode = $('<div class="preview-node transition" style="height:' + options.height + 'px;width:' + options.width + 'px"></div>')
        .appendTo(this.container);
      this.ctx = Utils.genCanvas({
        container: this.panelNode
      });
    },
    initEvents: function() {
      this.brushes.on('style-change', this.render.bind(this));
      this.brushes.on('current', this.render.bind(this));
      
      global && global
        .on('select-start', this.in.bind(this))
        .on('select-end', this.out.bind(this));
    },
    transformData: function(){
      var options = this.options;
      var width = options.width, height = options.height;
      var curves = c.c, pt;
      for(var k in curves){ 
        pt = curves[k];
        pt[0] = pt[0] / 1.8 + 10;
        pt[1] = pt[1] / 1.5 + 20;
      }
    },
    in : function() {
      if (this.isIn) return;
      this.panelNode.keyAnim('fadeIn', this.options.in);
      this.isIn = true;
    },
    out: function() {
      if (!this.isIn) return;
      this.panelNode.keyAnim('fadeOut', this.options.out);
      this.isIn = false;
    },
    render: function() {
      var brushType = c.brushType = this.brushes.current().id;
      var ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.renderer.renderCurve(c, ctx);
      ctx.name = brushType;
    }
  });
  return PreviewPanel;
});