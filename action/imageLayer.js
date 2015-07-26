'use strict';

define([], function () {//'./../utils/exif'
  var BinaryFile = window.Binary.BinaryFile;
  
  /**
   * BgImage 增加图片图层
   */
  function ImageLayer(opt) {
    opt = opt || {};
    this.color = 'hsla(180,100,100,1)';
    this.id = 'imageLayer';
    this.name = '背景图';
    this.desc = '上传一张图片';
    this.modelDraw = opt.modelDraw;
    this.controls = {
      'imageUrl': {
        'value': null,
        'descUI': '图片',
        'constructorUI': 'ImageUploader',
        'containerName': 'common'
      },
      'imageOpacity': {
        'range': [0, 1],
        'value': 1,
        'descUI': '图片透明度',
        'constructorUI': 'Slider',
        'containerName': 'color'
      }
    };
    this.events();
    this.ratio = null; //显示长宽比
  }

  ImageLayer.prototype.set = function (obj) {
    for(var k in obj){
       this[k] = obj[k];
    }
    this.initCanvas();
  };


  ImageLayer.prototype.onStyleChange = function (key) {
    console.log(key);
    if(key === 'imageOpacity') {
      this.updateImageOpacity();
    } else if(key === 'imageUrl') {
      this.updateImage();
    }
  };

  ImageLayer.prototype.initCanvas = function() {
    var opt = this.opt || {};
    var quality = opt.quality || 1;
    var container = this.container;
    if (container.width() / container.height() !== this.ratio) {
      var canvas = $('<canvas width="' +  container.width() * quality + '" height="' +  container.height() * quality + '"></canvas>').css({
        'width':  container.width(),
        'height':  container.height()
      });
      this.tmpCtx = $('<canvas width="' +  container.width() * quality + '" height="' +  container.height() * quality + '"></canvas>')[0].getContext('2d');

      canvas = this.canvas = canvas[0];
      var ctx = this.ctx = canvas.getContext('2d');
      ctx.scale(quality, quality);
    }
  };


  ImageLayer.prototype.clearImage = function () {
    this.container.find('#image-canvas').remove();
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////背景替换///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  ImageLayer.prototype.toImage = function (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if(!this.imageCanvas) return;
    var tmpCtx = this.tmpCtx;
    tmpCtx.clearRect(0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height);
    tmpCtx.globalAlpha = this.controls.imageOpacity.value;
    var bgImageStyle = this.bgImageStyle;
    tmpCtx.drawImage(this.imageCanvas, bgImageStyle.left, bgImageStyle.top, bgImageStyle.width, bgImageStyle.height);
    ctx.drawImage(tmpCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    return ctx;
  };

  ImageLayer.prototype.updateImage = function () {//file -> url -> image -> canvas
    var obj = this.controls.imageUrl.value;
    var url = obj.url;
    var e = obj.e;
    var rotation = 0;
    if (e) {
      var base64 = e.target.result.replace(/^.*?,/, '');
      var binary = atob(base64);
      var binaryData = new BinaryFile(binary);
      var exif = EXIF.readFromBinaryFile(binaryData);
      var orientation = exif.Orientation || 1;
      var rotation = 0;
      switch (orientation) {
        case 3:
          rotation = 180;
          break;
        case 6:
          rotation = 90;
          break;
        case 8:
          rotation = 270;
          break;
      }
    }
    if (rotation || rotation === 0) {
      this.rotation = rotation;
    }
    var container = this.container;

    var self = this;
    var image = new Image();
    image.src = url;
    self.modelDraw.setBg('image', {'url':url});
    image.onload = function () {
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
      self.clearImage();
      var imageCanvas = self.imageCanvas = $('<canvas id="image-canvas" width="' + iWidth + '" height="' + iHeight + '"></canvas>')
        .css(bgImageStyle)
        .appendTo(container)[0];
      var imageCtx = imageCanvas.getContext('2d');
      imageCtx.save();
      imageCtx.translate(iWidth / 2, iHeight / 2);
      imageCtx.rotate(rotation * Math.PI / 180 || 0);
      imageCtx.drawImage(this, -oWidth / 2, -oHeight / 2, oWidth, oHeight);
      imageCtx.restore();

      self.updateImageOpacity();
    };
  };

  ImageLayer.prototype.updateImageOpacity = function () {
    this.container.find('#image-canvas').css({
      opacity: this.controls.imageOpacity.value
    });
  };
  ImageLayer.prototype.events = function () {
    
  };
  return ImageLayer;
});