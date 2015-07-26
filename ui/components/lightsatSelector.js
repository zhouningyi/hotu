'use strict';
//对UI的总体控制
define(['./../../utils/utils', './../../libs/event'], function (Utils, EventEmitter) {
  var body = $('body');
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;
  var upper = Utils.upper;
  var rgbToHsl = Utils.rgbToHsl;
  var getPt = Utils.getPt;

  function LightSatSelector(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(LightSatSelector, {
    options: {
      height: 50,
      nodeR: 10, //指示点的大小
      gridX: 5,
      gridY: 5
    },
    isable: false,
    initialize: function(container, options) {
      this.container = container;
      options = Utils.merge(this.options, options);
      var targets;
      if (!(targets = this.targets = options.targets)) return console.log('LightSatSelector: 必须有targets');
      var key = this.key = 'lightSat';
      if(!targets.controls(key)) return console.log('brush 没有lightSat变量');

      this.initDom();
      this.initEvents();
      this.updateByTarget();
    },
    disable: function(){
      this.node.css({
        'pointer-events':'none'
      });
      this.isable = false;
    },
    enable: function(){
      this.node.css({
        'pointer-events':'auto'
      });
      this.updateByTarget();
      this.isable = true;
    },
    updateByTarget: function() {
      var control = this.targets.controls('lightSat');
      if(!control) return;
      var lightSat = control.value;
      this.lightSatGradient();
      this.updateLightSatPoint({
        x: (1 - lightSat.light) * this.container.width(),
        y: (1 - lightSat.sat) * this.options.height
      });
    },
    setBackground: function(bgColor) {
      this.container.css({
        background: bgColor
      });
    },
    initDom: function() {
      var options = this.options;
      var node = this.node =
        $('<div class="light-sat-container">'+
      '<div class="light-sat-pointer"></div>'+
      '<canvas width="' + this.container.width() + '" height="' + options.height + '"></canvas>\
      </div>')
        .appendTo(this.container);
      this.gradientCanvas = node.find('canvas')[0];
      this.gradientCtx = this.gradientCanvas.getContext('2d');
      this.ptNode = node.find('.light-sat-pointer');
      this.sliderNode = node.find('.slider-container');
    },
    lightSatGradient: function() { //根据取得的值重绘明度饱和度面板
      var options = this.options;
      var control = this.targets.controls('hue');
      var hue = Math.floor(control.value * 360);

      var width = this.canvasW = this.container.width(), height = this.canvasH = options.height;

      var gridX = this.gridX = Math.floor(width / Math.round(width / options.gridX)); //让其格子的个数为整数
      var gridY = this.gridY = Math.floor(height / Math.round(height / options.gridY));

      var ctx = this.gradientCtx;
      var xi, yi;
      for (var x = 0; x < width; x += gridX) {
        xi = Math.floor(x / width * 100);
        for (var y = 0; y < height; y += gridY) {
          yi = Math.round((y + gridY) / height * 100);
          ctx.fillStyle = 'hsl(' + hue + ',' + (100 - yi) + '%,' + (100 - xi) + '%)';
          ctx.fillRect(x, y, gridX, gridY);
        }
      }
    },
    initEvents: function() {
      var self = this;
      this.node
        .on('touchstart mousedown', function(e) {
          if(!self.isable) return;
          prevent(e);
          self.isDown = true;
          window.global && global.trigger('select-start', self.targets.current());
        })
        .on('touchstart mousedown touchmove mousemove', function(e) {
          if(!self.isable) return;
          prevent(e);
          var pt = getPt(e);
          var x = pt[0];
          var y = pt[1];

          var triggerBol = false;
          if (self.isDown) {
            self.targets.controls('lightSat', {
              light: 1 - x / self.container.width(),
              sat: 1 - y / self.options.height
            });
            self.updateLightSatPoint({
              'x': x,
              'y': y
            });
          }
        })
        .on('touchend mouseup', function(e) {
          if(!self.isable) return;
          self.isDown = false;
          prevent(e);
          window.global && global.trigger('select-end');
        });
    },
    updateLightSatPoint: function(obj) { //更新小球的位置 并触发事件
      var options = this.options;
      var colorShow = (this.targets.getColorShow) ? this.targets.getColorShow() : 'rgba(255,255,255,1)';
      this.ptNode.css({
        'left': obj.x - options.nodeR,
        'top': obj.y - options.nodeR,
        'backgroundColor': colorShow,
        'boxShadow': '1px 1px 0px rgba(150,150,150,0.4)'
      });
      // this.updateGradient(obj);
    }
  })

  return LightSatSelector;
});