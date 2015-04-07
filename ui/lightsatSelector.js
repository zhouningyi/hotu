'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../utils/utils'], function($, a, Utils) {
  var isNone = Utils.isNone;
  var upper = Utils.upper;
  var rgbToHsl = Utils.rgbToHsl;


  function LightSatSelector(container, obj) {
    this.container = container;
    this.target = obj.target || 'brush';
    this.opacity = 1;
    this.height = 50;
    var color = this.color = obj.value || {
      hue:180,
      light:80,
      sat:50
    };

    this.containerW = container.width();
    this.containerH = container.height();
    this.gridX = 5;
    this.gridY = 5;
    this.gridPadding = '8';
    this.gridPaddingSel = '2';
    this.init();


    this.events();

    this.lightSatGradient(color.hue);
    this.updateLightSat();

    // var defaults = this.defaults = {
    //   lightSat: {
    //     lightness: 0.5,
    //     sat: 1
    //   }
    // };
    // var self = this;
    // setTimeout(function() {
    //   self.setDefaults(defaults);
    // }, 100);
    // this.node.keyAnim('slideDown',{
    //     time:1
    //   });
  }

  // LightSatSelector.prototype.setDefaults = function(obj) {
  //   var value;
  //   for (var key in obj) {
  //     value = obj[key];
  //     if (!isNone(value)) {
  //       this[key] = value;
  //       if (this['set' + upper(key)]) this['set' + upper(key)](value); //比如背景的background变了 触发了菜单栏的background也改变
  //     }
  //   }
  // };

  LightSatSelector.prototype.setBackground = function(bgColor) {
    this.container.css({
      background: bgColor
    });
  };

  LightSatSelector.prototype.config = function() {};

  LightSatSelector.prototype.init = function() {
    var node = this.node =
      $('<div class="light-sat-container">\
      <div class="light-sat-pointer"></div>\
      <canvas width="' + this.containerW + '" height="' + this.height + '"></canvas>\
      </div>')
      .appendTo(this.container);
    this.gradientCanvas = node.find('canvas')[0];
    this.gradientCtx = this.gradientCanvas.getContext('2d');
    this.ptNode = node.find('.light-sat-pointer');
    this.sliderNode = node.find('.slider-container');
  };

  LightSatSelector.prototype.lightSatGradient = function(hue) { //根据取得的值重绘明度饱和度面板
    if (isNone(hue)) hue = this.hue;
    this.hue = hue;

    var height = this.height;
    var width = this.containerW;

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

  LightSatSelector.prototype.events = function() {
    var self = this;
    var container = this.container;
    var lightSatNode = this.node;
    var canvasW = this.canvasW = this.gradientCanvas.width;
    var canvasH = this.canvasH = this.gradientCanvas.height - 1;

    container
      .on('controlrable', function(e, obj) {
        if (obj.name === 'hue') {
          self.lightSatGradient(obj.value * 360 || 180);
          self.updateLightSat();
        }
        if(obj.name==='opacity'){
          self.opacity = obj.value;
          self.lightSatGradient();
          self.updateLightSat();
        }
      });

    lightSatNode.on('touchstart mousedown', function() {
      self.isDown = true;
    });
    lightSatNode.on('touchend mouseup touchleave mouseout', function() {
      self.isDown = false;
    });

    lightSatNode.on('touchstart mousedown touchmove mousemove', function(e) {
      var pt = self.getPt(e);
      var x = pt[0];
      var y = pt[1];

      var triggerBol = false;
      if (self.isDown) {
        if (Math.abs(self.lightSatPtX - x) > 3) {
          self.lightSatPtX = x;
          triggerBol = true;
        }

        if (Math.abs(self.lightSatPtY - y) > 3) {
          self.lightSatPtY = y;
          triggerBol = true;
        }
        if (triggerBol) self.updateLightSat();
      }
    });
  };

  LightSatSelector.prototype.updateLightSat = function() {//更新小球的位置 并触发事件
    var canvasW = this.canvasW;
    var canvasH = this.canvasH;

    var opacity = this.opacity;

    if (isNone(this.lightSatPtY)) this.lightSatPtY = (100-this.color.sat)*canvasH/ 100;
    if (isNone(this.lightSatPtX)) this.lightSatPtX = (100-this.color.light)*canvasW/ 100;


    var lightSatPtX = this.lightSatPtX;
    var lightSatPtY = this.lightSatPtY;
    if(!isNone(lightSatPtY)&&!isNone(lightSatPtX)){

    var light  = Math.floor(100 - lightSatPtX/canvasW*100);
    var  sat = Math.floor(100 - lightSatPtY/canvasH*100);
    var hue = this.hue || this.color.hue;
    var nodeR = 20;//点的大小


    var hslShow = 'hsla('+hue+','+sat+'%,'+light+'%,1)';
    var hsl = 'hsla('+hue+','+sat+'%,'+light+'%,'+opacity+')';

    // var light = obj.lightness;
    // var sat = obj.sat;
    // var x = Math.floor(light * this.canvasW);
    // var y = Math.floor(sat * this.canvasH);
    // if (isNone(x)) return;
    // if (isNone(y)) return;

    // var data = this.gradientCtx.getImageData(x, y, 1, 1).data;
    // var r = data[0],
    //   g = data[1],
    //   b = data[2];
    // var rgb = this.rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
    // var offset = 100; //parseInt(120*(p-)/255);
    // r = (r - offset < 0) ? 0 : r - offset;
    // g = (g - offset < 0) ? 0 : g - offset;
    // b = (b - offset < 0) ? 0 : b - offset;
    var shadow = '1px 1px 0px ' + hsl;
    this.ptNode.css({
      'left': lightSatPtX - nodeR,
      'top': lightSatPtY - nodeR,
      'backgroundColor': hslShow,
      'boxShadow': shadow
    });

    this.container.trigger('controlrable', {
      'name': 'color',
      'value': {
        'light':light,
        'sat':sat,
        'color':hsl,
        'opacity':opacity,
        'hue':this.hue
      },
      'target': this.target
    });
    }
  };

  LightSatSelector.prototype.getPt = function(e) { //获取点相对于容器的位置
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
      return [x - left, y - top];
    }
    var touch = window.event.touches[0];
    x = touch.pageX - left;
    y = touch.pageY - top;
    x = (x < nodeW) ? x : nodeW;
    x = (x > 0) ? x : 1;
    y = (y < nodeH) ? y : nodeH;
    y = (y > 0) ? y : 1;
    return [x, y];
  };


  function mergeGrids() {}

  return LightSatSelector;
});
