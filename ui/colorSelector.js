'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../utils/utils'], function($,a,Utils) {
  var isNone = Utils.isNone;
  var upper = Utils.upper;
  function ColorSelector(container) {
    this.container = container;
    this.containerW = container.width();
    this.containerH = container.height();
    this.gridX = 15;
    this.gridY = 15;
    this.gridPadding = '8';
    this.gridPaddingSel = '2';
    this.init();
    this.isOut = true;
    this.events();

    var defaults = this.defaults = {
      hue:0.5,
      lightSat:{
        lightness:0.5,
        sat:1
      }
    };
    var self = this;
    setTimeout(function(){
      self.setDefaults(defaults);
    },100);
    container.trigger('light-sat-change');
  }

  ColorSelector.prototype.setDefaults = function(obj){
    var value;
    for(var key in obj){
      value = obj[key];
      if(!isNone(value)){
        this[key] = value;
        if(this['set'+upper(key)]) this['set'+upper(key)](value); //比如背景的background变了 触发了菜单栏的background也改变
      }
    }
  };

  ColorSelector.prototype.setHue = function(hue01) {
    var container = this.container;
    var sliderPointer = this.sliderNode.find('.slider-pointer');
    var sliderPointerW = sliderPointer.width();
    if (isNone(hue01)) hue01 = this.defaults.hue;

    var hue = this.hue = 360 * hue01;
    var hsl = 'hsl(' + hue + ',90%,50%)';
    var x = hue01 * this.sliderNodeW;
    // console.log('xxx',x, this.sliderNode.width());
    sliderPointer.css({
      'left': x - sliderPointerW / 2,
      'background': hsl
    });
    container.trigger('hue-change', hue);
    container.trigger('light-sat-change');
    this.lightSatGradient(hue);
  };


  ColorSelector.prototype.setBackground = function(bgColor){
    this.container.css({
      background: bgColor
    });
  };

  ColorSelector.prototype.initHueSlider = function() {
    var hueSlider = this.hueSlider = this.sliderNode.html(
      '<div class="slider-line"></div>\
      <div class="slider-pointer"></div>'
    );
    this.sliderNodeH =hueSlider.height();
    this.sliderNodeW =hueSlider.width();
  };

  ColorSelector.prototype.hueSliderEvents = function() {
    var sliderNode = this.sliderNode;
    var self = this;
    sliderNode.on('touchstart mousedown touchmove mousemove',function(e){
      var pt = self.getPt(e);
      var x = pt[0];
      var width = sliderNode.width();
      var hue01 = x/width;
      self.setHue(hue01);
    });
  };

  ColorSelector.prototype.config = function() {
  };

  ColorSelector.prototype.init = function() {
    var container = this.container.html(
      '<div class="slider-container"></div>\
      <div class="light-sat-container">\
      <div class="light-sat-pointer"></div>\
      <canvas width="' + this.containerW + '" height="' + 50 + '"></canvas>\
      </div>');
    this.gradientCanvas = container.find('canvas')[0];
    this.gradientCtx = this.gradientCanvas.getContext('2d');
    this.ptNode = container.find('.light-sat-pointer');
    this.sliderNode = container.find('.slider-container');

    this.initHueSlider();
  };

  ColorSelector.prototype.lightSatGradient = function(hue) {
    if(isNone(hue)) hue = this.hue;
    var width = this.containerW;
    if(isNone(this.lightSatPtX)) this.lightSatPtX = width/2;

    var height = 50;
    if(isNone(this.lightSatPtY)) this.lightSatPtY = 0;

    var gridX = Math.floor(width/Math.round(width/this.gridX));//让其格子的个数为整数
    var gridY = Math.floor(height/Math.round(height/this.gridY));

    var ctx = this.gradientCtx;
    var xi, yi;
    for (var x = 0; x < width; x += gridX) {
      xi = Math.floor(x / width * 100);
      for (var y = 0; y < height; y += gridY) {
        yi = Math.round((y+gridY) / height * 100);
        ctx.fillStyle = 'hsl(' + hue + ',' + (100 - yi) + '%,' + (100 - xi) + '%)';
        ctx.fillRect(x, y, gridX, gridY);
      }
    }
  };

  ColorSelector.prototype.lightSatEvents = function() {
    var self = this;
    var container = this.container;
    var lightSatNode = this.lightSatNode = this.container.find('.light-sat-container');
    var canvasW = this.canvasW = this.gradientCanvas.width;
    var canvasH = this.canvasH = this.gradientCanvas.height-1;
    container.on('light-sat-change',function(){
      self.updateLightSat();
    });
    lightSatNode.on('touchstart mousedown touchmove mousemove', function(e) {
      var pt = self.getPt(e);
      var x = pt[0];
      var y = pt[1];

      var triggerBol = false;

      if (Math.abs(self.lightSatPtX - x) > 3) {
          self.lightSatPtX = x;
          triggerBol = true;
        }

        if (Math.abs(self.lightSatPtY - y) > 3) {
          self.lightSatPtY = y;
          triggerBol = true;
        }
        if (triggerBol) self.updateLightSat();
      });
  };

  ColorSelector.prototype.updateLightSat = function() {
    this.setLightSat({
      lightness:this.lightSatPtX/this.canvasW,
      sat:this.lightSatPtY/this.canvasH
    });
  };

  ColorSelector.prototype.setLightSat = function(obj) {
    var nodeR = this.ptNode.width() / 2;
    var light = obj.lightness;
    var sat = obj.sat;
    var x = Math.floor(light * this.canvasW);
    var y = Math.floor(sat * this.canvasH);
    if (isNone(x)) return;
    if (isNone(y)) return;

      var data = this.gradientCtx.getImageData(x, y, 1, 1).data;
      var r = data[0],
        g = data[1],
        b = data[2];
      var rgb = this.rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
      var offset = 100; //parseInt(120*(p-)/255);
      r = (r - offset < 0) ? 0 : r - offset;
      g = (g - offset < 0) ? 0 : g - offset;
      b = (b - offset < 0) ? 0 : b - offset;
      var shadow = '1px 1px 0px rgb(' + r + ',' + g + ',' + b + ')';
      this.ptNode.css({
        'left': x - nodeR,
        'top': y - nodeR,
        'background': rgb,
        'boxShadow': shadow
      });
      this.container.trigger('color-change', {
        color: rgb,
        hue: this.hue
      });
  };

  ColorSelector.prototype.getPt = function(e) { //获取点相对于容器的位置
    var node = $(e.target);
    var nodeW = node.width();
    var nodeH = node.height();
    var offset = node.offset();
    var left = offset.left;
    var top = offset.top;
    var x, y;
    if (e.type.indexOf('mouse') !== -1) {
      x = e.x || e.pageX;
      y = e.y || e.pageY;
    }
    var touch = window.event.touches[0];
    x = touch.pageX - left;
    y = touch.pageY - top;
    x = (x < nodeW) ? x : nodeW;
    x = (x > 0) ? x : 1;
    y = (y < nodeH) ? y : nodeH;
    y = (y > 0) ? y : 1;
    return [ x, y ];
  };

  ColorSelector.prototype.events = function() {
    var self = this;
    this.container.on('hue-change', function(e, hue) {
      self.lightSatGradient(hue);
    });
    this.lightSatEvents();
    this.hueSliderEvents();
  };

  function mergeGrids() {}

  return ColorSelector;
});
