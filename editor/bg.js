'use strict';

define(['zepto'], function($) {
  function Bg(container) {
    container = this.container = container || $('.container');
    this.container = container;
    this.containerW = container.width();
    this.containerH = container.height();

    this.color = 'hsla(180,100,100,1)';

    this.bgIndex = 0;
    this.dom();
    this.update();
    this.events();
    this.controls = {
      'widthMax': {
        'range': [1, 50],
        'value': 30,
        'constructorUI': 'Slider',
        'descUI': '粗细',
        'containerName': 'shape'
      },
      'opacity': {
        'range': [0, 1],
        'value': 0.8,
        'constructorUI': 'Slider',
        'descUI': '透明',
        'containerName': 'color'
      },
      'hue': {
        'range': [0, 1],
        'value': 0.3,
        'descUI': '颜色',
        'constructorUI': 'HueSlider',
        'containerName': 'color'
      },
      'lightSat': {
        'range': [{
          'light': 0,
          'sat': 0
        }, {
          'light': 1,
          'sat': 1
        }],
        'value': {
          'light': 1,
          'sat': 0
        },
        'constructorUI': 'LightSatSelector',
        'containerName': 'color'
      }
    };
  }

  Bg.prototype.onStyleChange = function () {
    this.hsla2color();
    this.update();
  };

  Bg.prototype.hsla2color = function () { //默认的hsla转换
    var controls = this.controls;
    if (!controls) return;
    var opacity = controls.opacity.value;
    var hue = Math.round(controls.hue.value * 360);
    var lightSat = controls.lightSat.value;
    var light = Math.round(lightSat.light * 100);
    var sat = Math.round(lightSat.sat * 100);
    this.color = 'hsla(' + hue + ',' + sat + '%,' + light + '%,' + opacity + ')';
    this.colorShow = 'hsl(' + hue + ',' + sat + '%,' + light + '%)';
    this.colorShowSat = 'hsl(' + hue + ',100%,40%)';
  };

  Bg.prototype.update = function () {
    var bgColor = this.color;
    var self = this;
    setTimeout(function () {
      self.container.trigger('bg-color-change', bgColor);
    }, 100);
    // console.log(bgColor,9999)

    this.container.css({
      'background': bgColor
    });
    this.updateCanvas();
  };

  Bg.prototype.dom = function(obj) {
    obj = obj || {};
    var quality = obj.quality || 1;
    var canvas = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>').css({
      'width': this.containerW,
      'height': this.containerH,
      'pointerEvents': 'none',
      'opacity': 0
    }).appendTo(this.container);

    canvas = this.canvas = canvas[0];
    var ctx = this.ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };


  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////背景替换///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  Bg.prototype.toImage = function() {
    return this.canvas;
  };

  Bg.prototype.updateCanvas = function() {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };


  Bg.prototype.applyStyle = function(node) {
    var width = node[0].width;
    var height = node[0].height;
    var containerW = this.container.width();
    var containerH = this.container.height();

    if (width / containerW > height / containerH) return node.css({
      'position': 'absolute',
      'top': (containerH - containerW * height / width) / 2,
      'display': 'block',
      'width': '100%',
      'height': 'auto',
      'backgroundPosition': 'center'
    });

    return node.css({
      'position': 'absolute',
      'display': 'block',
      'height': '100%',
      'width': 'auto',
      'verticalAlign': 'middle',
      'backgroundPosition': 'center'
    });
  };

  Bg.prototype.image = function (url) {
    var self = this;
    var bgImg =$('<img src="' + url + '"></img>').appendTo(this.container.find('.bg-image-container').empty());
    setTimeout(function() {
      self.applyStyle(bgImg);
    }, 10);
  };

  Bg.prototype.events = function(obj) {

  };

  return Bg;
});