'use strict';

define(['zepto', './../utils/utils'], function ($, Utils) {
  var setCanvasOpacity = Utils.setCanvasOpacity;
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
    this.opacity = 1;
    this.controls = {
      'widthMax': {
        'range': [1, 50],
        'value': 30,
        'constructorUI': 'Slider',
        'descUI': '粗细',
        'containerName': 'shape'
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
      },
      'bgImageOpacity': {
        'range': [0, 1],
        'value': 1,
        'descUI': '背景透明度',
        'constructorUI': 'LightSatSelector',
        'containerName': 'color'
      }
    };
  }

  Bg.prototype.onStyleChange = function () {
    this.hsla2color();
    this.update();
    this.updateImageOpacity();
  };

  Bg.prototype.hsla2color = function () { //默认的hsla转换
    var controls = this.controls;
    if (!controls) return;
    var opacity = this.opacity;
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

  Bg.prototype.dom = function (obj) {
    obj = obj || {};
    var quality = obj.quality || 1;
    var canvas = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>').css({
      'width': this.containerW,
      'height': this.containerH,
      'pointerEvents': 'none',
      'opacity': 0
    }).appendTo(this.container);
    var tmpCtx = this.tmpCtx = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>')[0].getContext('2d');

    canvas = this.canvas = canvas[0];
    var ctx = this.ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };


  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////背景替换///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  Bg.prototype.toImage = function () {
    this.updateCanvas({
      bgImg: true
    });
    return this.canvas;
  };

  Bg.prototype.updateCanvas = function (obj) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if(obj && obj.bgImg) {
      if(!this.bgImg) return;
      var tmpCtx = this.tmpCtx;
      tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
      var bgImageStyle = this.bgImageStyle;
      tmpCtx.drawImage(this.bgImg[0], bgImageStyle._left, bgImageStyle._top, bgImageStyle._width, bgImageStyle._height);
      setCanvasOpacity(this.tmpCtx, this.controls.bgImageOpacity.value);
      ctx.drawImage(tmpCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };

  Bg.prototype.setImageStyle = function (node) {
    var width = node[0].width;
    var height = node[0].height;
    var containerW = this.container.width();
    var containerH = this.container.height();
    var bgImageStyle = this.bgImageStyle = (width / containerW > height / containerH) ? {
      'position': 'absolute',
      'display': 'block',
      'top': (containerH - containerW * height / width) / 2,
      '_top': (containerH - containerW * height / width) / 2,
      'left': 0,
      '_left': 0,
      'height': 'auto',
      'width': '100%',
      '_width': containerW,
      '_height': containerW * height / width,
      'backgroundPosition': 'center'
    } : {
      'position': 'absolute',
      'display': 'block',
      'top': 0,
      '_top': 0,
      'left': (containerW - containerH * width / height) / 2,
      '_left': (containerW - containerH * width / height) / 2,
      '_width': containerH * width / height,
      'width': 'auto',
      '_height': containerH,
      'height': '100%',
      'verticalAlign': 'middle',
      'backgroundPosition': 'center'
    };
    return node.css(bgImageStyle);
  };

  Bg.prototype.image = function (url) {
    var self = this;
    var image = new Image();
    image.src = url;
    image.onload = function () {
      var bgImg = self.bgImg = $(this).appendTo(self.container.find('.bg-image-container').empty());
      window.bgImg = bgImg[0];
      self.setImageStyle(bgImg);
    };
  };

  Bg.prototype.updateImageOpacity = function () {
    this.container.find('.bg-image-container').css({
      opacity: this.controls.bgImageOpacity.value
    });
  };

  Bg.prototype.events = function () {

  };

  return Bg;
});