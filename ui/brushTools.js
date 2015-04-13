'use strict';
//对UI的总体控制
define(['./../utils/utils', 'zepto', './../render/renderer', 'anim', './lightSatSelector', './hueSlider', './slider'], function(Utils, $, Renderer, keyAnim, LightSatSelector, HueSlider, Slider) {
  var values = Utils.values,
    genCanvas = Utils.genCanvas,
    body = $('body'),
    previewData = {
      "type": "frame",
      "c": [{
        "type": "curve",
        "c": [
          ["0.06625", "0.11041", "2.833"],
          ["0.07256", "0.11041", "3.157"],
          ["0.09779", "0.09464", "3.171"],
          ["0.13565", "0.07886", "3.188"],
          ["0.18139", "0.05915", "3.205"],
          ["0.22082", "0.03785", "3.221"],
          ["0.24290", "0.03155", "3.239"],
          ["0.27603", "0.01972", "3.256"],
          ["0.29338", "0.01577", "3.273"],
          ["0.31940", "0.00789", "3.291"],
          ["0.33912", "0.00789", "3.308"],
          ["0.36278", "0.00631", "3.325"],
          ["0.38249", "0.01183", "3.342"],
          ["0.39826", "0.02366", "3.359"],
          ["0.41798", "0.04338", "3.376"],
          ["0.42981", "0.05126", "3.394"],
          ["0.44164", "0.05678", "3.410"],
          ["0.45347", "0.06703", "3.428"],
          ["0.46688", "0.07886", "3.444"],
          ["0.49290", "0.08675", "3.462"],
          ["0.50868", "0.09069", "3.479"],
          ["0.52681", "0.09464", "3.497"],
          ["0.54811", "0.09858", "3.514"],
          ["0.56388", "0.09858", "3.530"],
          ["0.57177", "0.09858", "3.547"],
          ["0.58360", "0.09779", "3.564"],
          ["0.59148", "0.09858", "3.581"],
          ["0.60331", "0.09858", "3.599"],
          ["0.61514", "0.09779", "3.616"],
          ["0.63091", "0.09464", "3.633"],
          ["0.65457", "0.08675", "3.650"],
          ["0.67823", "0.06940", "3.668"],
          ["0.70978", "0.05678", "3.685"],
          ["0.73186", "0.04732", "3.703"],
          ["0.75315", "0.04338", "3.721"],
          ["0.77287", "0.03470", "3.737"],
          ["0.78864", "0.02524", "3.754"],
          ["0.79653", "0.02760", "3.771"],
          ["0.80442", "0.02524", "3.788"],
          ["0.80442", "0.02524", "3.811"],
          ["0.80836", "0.02760", "3.906"],
          ["0.81625", "0.02760", "3.922"],
          ["0.83596", "0.02524", "3.940"],
          ["0.85568", "0.02760", "3.957"],
          ["0.87539", "0.02760", "3.974"],
          ["0.88328", "0.02524", "3.991"],
          ["0.89117", "0.02760", "4.009"],
          ["0.89117", "0.02760", "4.029"],
          ["0.89511", "0.02760", "4.116"],
          ["0.90694", "0.02760", "4.133"],
          ["0.91483", "0.03155", "4.150"],
          ["0.93060", "0.03155", "4.167"],
          ["0.94243", "0.03549", "4.185"],
          ["0.95032", "0.03549", "4.202"],
          ["0.95820", "0.03549", "4.220"],
          ["0.96215", "0.03470", "4.237"],
          ["0.96609", "0.04338", "4.253"]
        ],
        "i": 0,
        "brushType": "null"
      }],
      "i": 0,
      "info": {
        "ptN": 57,
        "curveN": 1,
        "brushChangeN": 0,
        "brushes": {
          "ink": {
            "curveN": 1,
            "ptN": 57
          }
        },
        "lengthes": {},
        "colors": {},
        "bbox": {
          "xMax": 0.96609,
          "xMin": 0.06625,
          "yMin": 0.11041,
          "yMax": 0.26609
        }
      }
    };

  function BrushTools(opt) {
    this.container = opt.container;
    this.brushes = opt.brushes;
    this.bindNode = opt.bind;

    this.init(opt.brushes);
    this.uiStatus = 'null';

    this.events();
    body.trigger('brush-change', this.curBrush);

    this.status = 'select';
    this.brushToolsNode.addClass('tools-out-left');
  }

  BrushTools.prototype.init = function(brushes) {
    var toolsListN = this.toolsListN = 4,
      brushes = brushes||this.brushes,
      container = this.container,
      brushToolsW = this.container.width() - this.bindNode.width() - 10,
      brushToolsNode = this.brushToolsNode = $(
        '<div class="sub-tools">\
        <div class="brush-list"></div>\
        <div class="sub-tools-preview"></div>\
        <div class="control-ui color-ui"></div>\
        <div class="control-ui shape-ui"></div>\
      </div>')
      .css({
        'width': brushToolsW,
        'height': 'auto'
      })
      .appendTo(container);
    this.initBrushList(brushes);
    this.initPreview(brushes);
    var colorNode = this.colorNode = brushToolsNode.find('.color-ui')
    var shapeNode = this.shapeNode = brushToolsNode.find('.shape-ui');
    var curBrush = this.curBrush;
    this.renderControl(curBrush);
  };

  BrushTools.prototype.renderControl = function(brush) { //根据brush渲染对应的ui控制器
    var controls = brush.controls;
    var colorNode = this.colorNode.empty();
    var shapeNode = this.shapeNode.empty();
    var curBrush = this.curBrush;
    var mapUI = {
      'HueSlider': HueSlider,
      'LightSatSelector': LightSatSelector,
      'Slider': Slider
    };
    var mapContainer = {
      'color': this.colorNode,
      'shape': this.shapeNode
    };
    var obj, uiName, descUI, ConstructorUI, containerName, constructorUI, container, ki;
    for (var key in controls) {
      obj = controls[key];
      constructorUI = obj.constructorUI;
      descUI = obj.descUI;
      ConstructorUI = mapUI[constructorUI];
      containerName = obj.containerName;
      container = mapContainer[containerName];
      var value = curBrush[key];
      ki = (obj.set) ? obj.set(value) : 0;

      if (ConstructorUI) {
        new ConstructorUI(container, {
          'descUI': descUI,
          'value': ki,
          'key':key,
          'target':'brush'
        });
      }
    }
  };

  BrushTools.prototype.initBrushList = function(brushes) {
    var self = this;
    var brushArr = values(brushes);
    var curBrush = this.curBrush = brushArr[0];
    var brushToolsNode = this.brushToolsNode,
      brushes = this.brushes;
    var brush, name;
    var toolsListNode = this.toolsListNode = brushToolsNode.find('.brush-list');
    for (var k = 0; k < brushArr.length; k++) {
      brush = brushArr[k];
      var node = $('<div class="brush-list-icon" id="' + brush.id + '">' + brush.name + '</div>')
        .on('touchstart mousedown', function() {
          var brushType = $(this).attr('id');
          var brush = brushes[brushType];
          body.trigger('brush-change', brush);
        });
      toolsListNode.append(node);
    }
  };

  BrushTools.prototype.initPreview = function(brushes) {
    var previewNode = this.previewNode = this.brushToolsNode.find('.sub-tools-preview');
    this.rendererPreview = new Renderer(brushes, {
      frameW: previewNode.width(),
      frameH: previewNode.height()
    });
    this.ctxPreview = genCanvas({
      'container': previewNode,
      'id': 'brush-preview'
    });
  };

  BrushTools.prototype.preview = function(brush) {
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

  BrushTools.prototype.out = function(cb) { //隐藏
    if (this.uiStatus === 'null') return;
    if (this.uiStatus !== 'out' && this.uiStatus !== 'lock') {
      var self = this;
      cb = cb || function() {};
      var brushToolsNode = this.brushToolsNode;
      this.uiStatus = 'lock';
      brushToolsNode.keyAnim('toolsOutLeft', {
        'time': 0.4,
        'cb': function() {
          brushToolsNode.css({
            'pointerEvents': 'none'
          });
          self.uiStatus = 'out';
        }
      });
    }
  };

  BrushTools.prototype.in = function(obj, cb) { //隐藏
    if (this.uiStatus !== 'in' && this.uiStatus !== 'lock' && obj) {
      if (this.uiStatus === 'null') {
        this.brushToolsNode.css({
          'display': 'block'
        });
      }
      var self = this;
      var node = obj.node;
      var curBrush = this.curBrush;

      var brushToolsNode = this.brushToolsNode;

      var parent = obj.parent;
      var ph = parent.height();
      brushToolsNode.css({
        'minHeight': ph,
        'minWidth': ph
      });
      var iWidth = node.width();

      cb = cb || function() {};
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
        'cb': function() {
          brushToolsNode
            .css({
              'pointerEvents': 'auto'
            });
          self.uiStatus = 'in';
          self.preview(self.curBrush);
          cb();
        }
      });
      //背景色
      if (obj.bgImg) obj.bgImg.addClass('float-tag-img').appendTo(floatTagAddNode);

      //提示
      // if(obj.helpText) this.floatTagHelp(obj.helpText);
    }
  };

  BrushTools.prototype.switch = function(obj) {
    if (this.uiStatus !== 'in') this.in(obj);
    if (this.uiStatus == 'in') this.out(obj);
  };

  BrushTools.prototype.events = function() {
    var self = this;
    var brushes = this.brushes;
    var workLimit = 3000;
    this.brushToolsNode.on('touchstart mousedown', function(e) { //点击后 不要影响
      e.preventDefault();
    });
    body
      .on('brush-change', function(e, brush) {
        var brushType = brush.id;
        self.preview(brush);
        self.curBrush = brush;
        if (self.curBrushNode) self.curBrushNode.removeClass('brush-list-icon-active');
        self.curBrushNode = self.toolsListNode.find('#' + brushType);
        self.curBrushNode.addClass('brush-list-icon-active');
        self.renderControl(brush);
      })
      .on('controlrable', function(e, obj) {
        if (!obj) return console.log('controlrable事件必须带数据obj');
        var target = obj.target;
        if (!target) return console.log('controlrable事件的obj必须带有target 如"brush"');
        if (target === 'brush') { //为传达给brush的色彩事件
          var curBrush = self.curBrush;
          if (curBrush && curBrush.controls) {
            var controls = curBrush.controls;
            var name = obj.name;
            var style = {};
            if (name in controls) {
              var conObj = controls[name];
              var get = conObj.get;
              var value = obj.value;
              if (get) {
                style[name] = get(value);
              }
            }
            curBrush.setCurveStyles(style);
            self.preview(curBrush);
          }
        }
      })
      // .on('light-sat-change',function(e, colorInfo){
      //   this.colorInfo = colorInfo;
      //   if(self.curBrush) self.curBrush.setOptions(colorInfo);
      //   self.preview(self.curBrush);
      // })
      .on('painter-work', function() {
        self.out();
        // setTimeout(function(){
        //   body.trigger('painter-');
        // }, workLimit);
      })
      .on('bg-color-change', function(e, bgColor) {
        self.setBackground(bgColor);
      });
  };

  BrushTools.prototype.stylize = function(obj) { //根据大环境的不同 设置ui的风格
    if (!obj) return;
    var bgColor;
    if (obj.background) {
      var bgColor = obj.background;
    }
  };


  BrushTools.prototype.setBackground = function(bgColor) {
    if (bgColor) {
      var colors = bgColor.split(',');
      colors[3] = '0.95)';
      bgColor = colors.join(',');
      this.brushToolsNode.css({
        background: bgColor
      });
    }
  };

  return BrushTools;
});
