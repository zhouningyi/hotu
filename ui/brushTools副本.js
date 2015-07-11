'use strict';
//对UI的总体控制
define(['./../utils/utils', 'zepto', './../render/painter_renderer', 'anim', './components/lightSatSelector', './components/hueSlider', './components/slider', './data_preview'], function (Utils, $, PainterRenderer, keyAnim, LightSatSelector, HueSlider, Slider, previewData) {
  var values = Utils.values;
  var genCanvas = Utils.genCanvas;
  var hsla2obj = Utils.hsla2obj;
  var body = $('body');
  var prevent = Utils.prevent;
  var previewCurve = previewData.c[0];
  function BrushTools(opt) {
    this.container = opt.container;
    this.brushes = opt.brushes;
    this.bindNode = opt.bind;

    this.init();
    this.uiStatus = 'null';

    this.addEvents();
  }
  
var brushToolsNode, colorNode, shapeNode, toolsListNode, previewNode;
  BrushTools.prototype.init = function () {
    var toolsListN = this.toolsListN = 4,
      container = this.container,
      brushToolsW = this.container.width() - this.bindNode.width() - 10;
    brushToolsNode = $(
        '<div class="sub-tools">\
          <div class="tools-list"></div>\
          <div class="sub-tools-preview"></div>\
          <div class="control-ui color-ui"></div>\
          <div class="control-ui shape-ui"></div>\
        </div>')
      .css({
        'width': brushToolsW,
        'height': 'auto'
      })
      .appendTo(container);
    this.initHead();
    this.initPreview();
    colorNode = brushToolsNode.find('.color-ui')
    shapeNode = brushToolsNode.find('.shape-ui');
    this.renderControl();
    //结束的时候
    setTimeout(function(){
      brushToolsNode.addClass('out-left');
    }, 1000);
  };

  BrushTools.prototype.initPreview = function () {
    this.rendererPreview = new PainterRenderer({brushes: this.brushes});
    this.ctxPreview = genCanvas({
      'container': brushToolsNode.find('.sub-tools-preview'),
      'id': 'brush-preview'
    });
  };

  BrushTools.prototype.renderControl = function (brush) { //根据brush渲染对应的ui控制器
    brush = brush || this.brushes.current();
    var controls = brush.controls;
    colorNode.empty();
    shapeNode.empty();
    
    var mapUI = {
      'HueSlider': HueSlider,
      'LightSatSelector': LightSatSelector,
      'Slider': Slider
    };
    var mapContainer = {
      'color': colorNode,
      'shape': shapeNode
    };
    var obj, uiName, descUI, ConstructorUI, containerName, constructorUI, container, ki;
    for (var key in controls) {
      obj = controls[key];
      constructorUI = obj.constructorUI;
      ConstructorUI = mapUI[constructorUI];
      containerName = obj.containerName;
      container = mapContainer[containerName];

      if (ConstructorUI) {
        new ConstructorUI(container, {
          'key': key,
          'targetName': 'brush',
          'id': brush.id,
          'control': obj,
          'target': brush
        });
      }
    }
  };

  BrushTools.prototype.initHead = function () {
    var self = this, brushes = this.brushes, brush, name, activeClass = '',
    toolsListNode = this.toolsListNode = brushToolsNode.find('.tools-list');
    //遍历所有的brush 并绘制
    brushes.each(function(brushId, brush){
      var node = $('<div class="tools-list-icon" id="' + brushId + '">' + brush.name + '</div>')
        .on('touchstart mousedown', function (e) {
          brushes.current($(this).attr('id'));
          prevent(e);
        });
      if(brush == brushes.current()){
        self.curBrushNode = node.addClass('tools-list-icon-active');
      } 
      toolsListNode.append(node);
    });
  };

  BrushTools.prototype.addEventsBrush = function(){
    var self = this, toolsListNode = this.toolsListNode;
    //
    this.brushes.on('curBrush', function(brush){
      self.preview(brush);
      if (self.curBrushNode) self.curBrushNode.removeClass('tools-list-icon-active');
      self.curBrushNode = toolsListNode.find('#' + brush.id).addClass('tools-list-icon-active');
      self.renderControl(brush);
    });
  };

  BrushTools.prototype.preview = function (brush) {
    if(!brush) return;
    var brushType = brush.id;
    this.brushes.current(brushType);
    if (previewCurve.brushType !== brushType) {
      previewCurve.brushType = brushType;
    }
    var ctx = this.ctxPreview;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.rendererPreview.renderCurve(previewCurve, ctx);
    ctx.name = brushType;
  };

  BrushTools.prototype.out = function (cb) { //隐藏
    if (this.uiStatus === 'null') return;
    if (this.uiStatus !== 'out' && this.uiStatus !== 'lock') {
      var self = this;
      cb = cb || function () {};
      this.uiStatus = 'lock';
      brushToolsNode.keyAnim('toolsOutLeft', {
        'time': 0.4,
        'cb': function () {
          brushToolsNode.css({
            'pointerEvents': 'none'
          });
          brushToolsNode.addClass('out-left');
          self.uiStatus = 'out';
        }
      });
      body.trigger('left-tools-out');
    }
  };

  BrushTools.prototype.in = function (obj, cb) { //隐藏
    if (this.uiStatus !== 'in' && this.uiStatus !== 'lock' && obj) {
      brushToolsNode.removeClass('out-left');
      var self = this;
      var node = obj.node;

      var parent = obj.parent;
      var ph = parent.height();
      brushToolsNode.css({
        'minHeight': ph,
        'minWidth': ph
      });
      var iWidth = node.width();

      cb = cb || function () {};
      var width = $(window).width() * 0.8;

      this.uiStatus = 'lock';
      // 位置
      var offset = node.offset();
      var w = offset.width;
      var l = offset.left;
      var h = offset.height;
      var t = offset.top;
      var oft = 0;
      brushToolsNode.css({
        'left': l + w,
        'top': t,
        'bottom': 'auto',
        'minWidth': ph,
        'height': 'auto'
      });
      brushToolsNode.keyAnim('toolsInLeft', {
        'time': 0.4,
        'cb': function () {
          brushToolsNode
            .css({
              'pointerEvents': 'auto'
            });
          self.uiStatus = 'in';
          self.preview(self.brushes.current());
          body.trigger('update-ui-by-target');
          cb();
        }
      });
      //背景色
      if (obj.bgImg) obj.bgImg.addClass('float-tag-img').appendTo(floatTagAddNode);

      //提示
      // if(obj.helpText) this.floatTagHelp(obj.helpText);
      body.trigger('left-tools-in');
    }
  };

  BrushTools.prototype.switch = function (obj) {
    if (this.uiStatus !== 'in') this.in(obj);
    if (this.uiStatus == 'in') this.out(obj);
  };

  BrushTools.prototype.addEvents = function () {
    this.addEventsBrush();
    var self = this;
    var brushes = this.brushes;
    var workLimit = 3000;
    brushToolsNode.on('touchstart mousedown', function (e) { //点击后 不要影响
      prevent(e);
    });

    body
      .on('preview-brush', function (e, obj) {
        self.preview(self.brushes.current());
      })
      .on('update-ui-by-target', function (e) { //保存画作的最后一笔 改变preview的画笔以及
        // self.updateUI();
        // self.preview(curBrush);
      })
      .on('painter-work  root-work', function () {
        self.out();
        // setTimeout(function (){
        //   body.trigger('painter-');
        // }, workLimit);
      })
      .on('main-color-change', function (e, bgColor) {
        self.setBackground(bgColor);
      });
  };

  BrushTools.prototype.stylize = function (obj) { //根据大环境的不同 设置ui的风格
    if (!obj) return;
    var bgColor;
    if (obj.background) {
      var bgColor = obj.background;
    }
  };

  BrushTools.prototype.setBackground = function (bgColor) {
    if (bgColor) {
      var colors = bgColor.split(',');
      colors[3] = '0.95)';
      bgColor = colors.join(',');
      brushToolsNode.css({
        background: bgColor
      });
    }
  };

  return BrushTools;
});