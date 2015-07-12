'use strict';
//对UI的总体控制
define(['./../../utils/utils'], function (Utils) {
  var body = $('body');
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;
  var upper = Utils.upper;
  var rgbToHsl = Utils.rgbToHsl;
  var getPt = Utils.getPt;

  function LightSatSelector(container, obj) {
    this.container = container;
    this.control = obj.control;
    this.target = obj.target;
    this.targetName = obj.targetName;
    this.key = obj.key;

    this.height = 50;
    this.nodeR = 20; //指示点的大小
    this.gridX = 5;
    this.gridY = 5;
    this.gridPadding = '8';
    this.gridPaddingSel = '2';
    this.init();
    
    this.events();
    this.updateByTarget();
  }

  LightSatSelector.prototype.updateByTarget = function () {
    var controls = this.target.controls;
    var lightSat = controls.lightSat.value;
    this.lightSatGradient();
    this.updateLightSatPoint({
      x: (1 - lightSat.light) * this.container.width(),
      y: (1 - lightSat.sat) * this.height
    });
  };

  LightSatSelector.prototype.setBackground = function (bgColor) {
    this.container.css({
      background: bgColor
    });
  };

  LightSatSelector.prototype.config = function () {};

  LightSatSelector.prototype.init = function () {
    var node = this.node =
      $('<div class="light-sat-container">\
      <div class="light-sat-pointer"></div>\
      <canvas width="' + this.container.width() + '" height="' + this.height + '"></canvas>\
      </div>')
      .appendTo(this.container);
    this.gradientCanvas = node.find('canvas')[0];
    this.gradientCtx = this.gradientCanvas.getContext('2d');
    this.ptNode = node.find('.light-sat-pointer');
    this.sliderNode = node.find('.slider-container');
  };

  LightSatSelector.prototype.lightSatGradient = function () { //根据取得的值重绘明度饱和度面板
    var controls = this.target.controls;
    var hue = Math.floor(controls.hue.value * 360);

    var height = this.height;
    var width = this.container.width();

    var gridX = Math.floor(width / Math.round(width / this.gridX)); //让其格子的个数为整数
    var gridY = Math.floor(height / Math.round(height / this.gridY));

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
  };

  LightSatSelector.prototype.events = function () {
    var self = this;
    var control = this.control;
    var target = this.target;
    this.node.on('touchstart mousedown', function (e) {
      prevent(e);
      self.isDown = true;
    })
    .on('touchend mouseup touchleave mouseout', function (e) {
      self.isDown = false;
      prevent(e);
    })
    .on('touchstart mousedown touchmove mousemove', function (e) {
      prevent(e);
      var pt = getPt(e);
      var x = pt[0];
      var y = pt[1];

      var triggerBol = false;
      if (self.isDown) {
        control.value = {
          light: 1 - x / self.container.width(),
          sat: 1 - y / self.height
        };
        target.onStyleChange(self.key);
        body.trigger('preview' + '-' + self.targetName);
        self.updateLightSatPoint({
          'x': x,
          'y': y
        });
      }
    });

    body
    .on('update-ui-by-target' + this.targetName, this.updateByTarget.bind(this))
    .on('update' + '-' + 'hue' +  this.targetName, self.updateByTarget.bind(self));
  };

  LightSatSelector.prototype.updateLightSatPoint = function (obj) { //更新小球的位置 并触发事件
    this.ptNode.css({
      'left': obj.x - this.nodeR,
      'top': obj.y - this.nodeR,
      'backgroundColor': this.target.colorShow,
      'boxShadow': '1px 1px 0px rgba(150,150,150,0.4)'
    });
  };

  return LightSatSelector;
});
