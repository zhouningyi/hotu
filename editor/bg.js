'use strict';

define(['zepto' ], function ($) {//'./../utils/exif'

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
    if (!controls) {return;}
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
    this.tmpCtx = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>')[0].getContext('2d');

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
      if(!this.imageCanvas) return;
      var tmpCtx = this.tmpCtx;
      tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
      tmpCtx.globalAlpha = this.controls.bgImageOpacity.value;
      var bgImageStyle = this.bgImageStyle;
      tmpCtx.drawImage(this.imageCanvas, bgImageStyle.left, bgImageStyle.top, bgImageStyle.width, bgImageStyle.height);
      ctx.drawImage(tmpCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };

  Bg.prototype.image = function(url, rotation) {
    if (rotation || rotation ===0) {
      this.rotation = rotation;
    }
    var container = this.container;

    var self = this;
    var image = new Image();
    image.src = url;
    image.onload = function() {
      var oHeight = this.naturalHeight;
      var oWidth = this.naturalWidth;
      var iWidth = (rotation === 270 || rotation === 90) ? oHeight : oWidth;
      var iHeight = (rotation === 270 || rotation === 90) ? oWidth : oHeight;

      var containerW = container.width();
      var containerH = container.height();
      var bgImageStyle = self.bgImageStyle = (iWidth / containerW > iHeight / containerH) ? {
        'position': 'absolute',
        'display': 'block',
        'top': (containerH - containerW * iHeight / iWidth) / 2,
        'left': 0,
        'width': containerW,
        'height': containerW * iHeight / iWidth,
      } : {
        'position': 'absolute',
        'display': 'block',
        'top': 0,
        'left': (containerW - containerH * iWidth / iHeight) / 2,
        'width': containerH * iWidth / iHeight,
        'height': containerH,
      };

      var widthMax = 2000;
      var heightMax = 2000;
      if (iWidth > widthMax) {
        iHeight = widthMax * iHeight / iWidth;
      }
      if (iHeight > heightMax) {
        iWidth = heightMax * iWidth / iHeight;
      }
      var imageCanvas = self.imageCanvas = $('<canvas width="' + iWidth + '" height="' + iHeight + '"></canvas>')
        .css(bgImageStyle)
        .appendTo(container)[0];
      var imageCtx = imageCanvas.getContext('2d');
      imageCtx.save();
      imageCtx.translate(iWidth / 2, iHeight / 2);
      imageCtx.rotate(rotation * Math.PI / 180 || 0);
      imageCtx.drawImage(this, -oWidth / 2, -oHeight / 2, oWidth, oHeight);
      imageCtx.restore();
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