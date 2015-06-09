'use strict';
//对UI的总体控制
define(['./../utils/utils', 'zepto', './../render/renderer', 'anim', './components/lightSatSelector', './components/hueSlider', './components/slider', './data_preview'], function (Utils, $, Renderer, keyAnim, LightSatSelector, HueSlider, Slider, previewData) {
  var values = Utils.values;
  var genCanvas = Utils.genCanvas;
  var hsla2obj = Utils.hsla2obj;
  var body = $('body');
  var prevent = Utils.prevent;
  function BrushTools(opt) {
    this.container = opt.container;
    this.brushes = opt.brushes;
    this.bindNode = opt.bind;

    this.init(opt.brushes);
    this.uiStatus = 'null';

    this.events();
    body.trigger('brush-change', this.curBrush);
  }
  
var brushToolsNode, colorNode, shapeNode, toolsListNode, previewNode, curBrushNode;
  BrushTools.prototype.init = function (brushes) {
    var toolsListN = this.toolsListN = 4,
      brushes = brushes || this.brushes,
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
    this.initHead(brushes);
    this.initPreview(brushes);
    colorNode = brushToolsNode.find('.color-ui')
    shapeNode = brushToolsNode.find('.shape-ui');
    this.renderControl();
    //结束的时候
    setTimeout(function(){
      brushToolsNode.addClass('out-left');
    }, 1000);
  };

  BrushTools.prototype.renderControl = function () { //根据brush渲染对应的ui控制器
    var curBrush = this.curBrush;
    var controls = curBrush.controls;
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
          'id': curBrush.id,
          'control': obj,
          'target': curBrush
        });
      }
    }
  };

  BrushTools.prototype.initHead = function (brushes) {
    var self = this;
    var brushArr = values(brushes);
    var curBrush = this.curBrush = brushArr[0];
    var brushes = this.brushes;
    var brush, name;
    toolsListNode = brushToolsNode.find('.tools-list');
    for (var k = 0; k < brushArr.length; k++) {
      brush = brushArr[k];
      var node = $('<div class="tools-list-icon" id="' + brush.id + '">' + brush.name + '</div>')
        .on('touchstart mousedown', function (e) {
          var brushType = $(this).attr('id');
          var brush = brushes[brushType];
          body.trigger('brush-change', brush);
          prevent(e);
        });
      toolsListNode.append(node);
    }
  };
  
  BrushTools.prototype.initPreview = function (brushes) {
    previewNode = brushToolsNode.find('.sub-tools-preview');
    this.rendererPreview = new Renderer(brushes, {
      frameW: previewNode.width(),
      frameH: previewNode.height()
    });
    this.ctxPreview = genCanvas({
      'container': previewNode,
      'id': 'brush-preview'
    });
  };

  BrushTools.prototype.preview = function (brush) {
    brush = brush || this.curBrush;
    var brushType = brush.id;
    if (previewData.c[0].brushType !== brushType) {
      previewData.c[0].brushType = brushType;
    }
    var ctx = this.ctxPreview;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.rendererPreview.drawDatas(ctx, previewData, {
      curve: {
        async: 0
      },
      ptTransform: 'center_x'
    });
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
      // if (this.uiStatus === 'null') {
        brushToolsNode.removeClass('out-left');
      // }
      var self = this;
      var node = obj.node;
      var curBrush = this.curBrush;

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
          self.preview(self.curBrush);
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

  BrushTools.prototype.events = function () {
    var self = this;
    var brushes = this.brushes;
    var workLimit = 3000;
    brushToolsNode.on('touchstart mousedown', function (e) { //点击后 不要影响
      prevent(e);
    });

    body
      .on('brush-change', function (e, brush) {
        var brushType = brush.id;
        self.preview(brush);
        self.curBrush = brush;
        if (curBrushNode) curBrushNode.removeClass('tools-list-icon-active');
        curBrushNode = toolsListNode.find('#' + brushType);
        curBrushNode.addClass('tools-list-icon-active');
        self.renderControl(brush);
      })
      .on('preview-brush', function (e, obj) {
        self.preview(self.curBrush);
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