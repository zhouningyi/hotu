'use strict';
//'./../ui/util' 目前暂时不用
define(['./../utils/utils', './../libs/event', './painter', './bg', './layers'], function(Utils, EventEmitter, Painter, Bg, Layers) {
  var prevent = Utils.prevent; //清除默认事件
  var upper = Utils.upper; //首字母大写
  var isNone = Utils.isNone; //是否存在

  var body = $('body');
  var testNode = $('#test-container');

  function Editor(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(Editor, {
    options: {
      'painter': {
        'backN': 6,
        'quality': 1.5
      }
    },
    initialize: function (container, options) {
      this.mainContainer = container;
      this.layersContainer = options.layersContainer;
      //
      options = Utils.extend(this.options, options);

      this.width = container.width();
      this.height = container.height();
      this.quality = options.quality;

      this.brushes = options.brushes;
      this.actions = options.actions;
      this.imagePreview = options.imagePreview;
      this.modelDraw = options.modelDraw.linkTo(this);

      this.initLayers();
      this.initBg();
      this.initPainter();
      //
      this.initEvents();
    },
    initEvents: function () {},
    ////////////////////////////////各种初始化
    initLayers: function () {
      this.layers = new Layers(this.layersContainer, {
        eventsNode: this.mainContainer
      });
    },
    //画板层
    initPainter: function () {
      var options = Utils.deepMerge(this.options.painter, {
        'layer': this.layers.get('brush_default'),
        'layers': this.layers,
        'brushes': this.brushes,
        'modelDraw': this.modelDraw
      });
      var painter = this.painter = new Painter(options);
      painter.linkTo(this);
    },
    //背景层
    initBg: function () {
      this.bg = new Bg({
        'modelDraw': this.modelDraw,
        'actions': this.actions,
        'imagePreview': this.imagePreview,
        'layer': this.layers.get('background_default')
      });
    },
    toImage: function () {
      return this.layers.toImage();
    },
    toDataURL: function () {
    },
    load: function (d) {
      d = this._data = this.modelDraw.load(d);
      if (!Utils.checkDrawData(d)) return console.log('数据不规范');
      this.painter.data(d.c);
      this.bg.data({
        'bg': d.bg,
        'image': d.image
      });
    },
    new: function () {
      this.modelDraw.new();
      this.painter.new();
      this.bg.new();
    },
    back: function () {
      this.painter.back();
    }
  });

  Editor.prototype.data = Editor.prototype.load;

  return Editor;
});