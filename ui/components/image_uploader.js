'use strict';
//播放作品的面板
define(['./../../utils/utils'], function(Utils) {
  var prevent = Utils.prevent;

  function ImageUploader(options) {
    options = options || {};
    this.modelDraw = options.modelDraw;
    this.layers = options.layers;
    this.initEvents();
  }

  /**
   * 在这个流程里，先preview文件 同时上传到服务器并取回地址。
   */
  ImageUploader.prototype = {
    initEvents: function() {
    },
    preview: function(file, e) {
      var rotation = this.detectRotation(e);
      this.createImage(file, rotation);
    },
    //上传图片融入目前的架构 目前比较复杂 还是通过事件的方式进行传递
    createImage: function(url, rotation){
      var image = new Image();
      image.src = url;
      window.global && global.trigger('preview-image-start', image);
      image.onload = function() {
        window.global && global.trigger('preview-image-ready', image);
      }
    },
    createCanvasImage: function() {//创建和 image 等大的 canvas;
    // var opt = this.opt || {};
    // var quality = opt.quality || 1;
    // var container = this.container;
    // if (container.width() / container.height() !== this.ratio) {
    //   var canvas = $('<canvas width="' +  container.width() * quality + '" height="' +  container.height() * quality + '"></canvas>').css({
    //     'width':  container.width(),
    //     'height':  container.height()
    //   });
    //   this.tmpCtx = $('<canvas width="' +  container.width() * quality + '" height="' +  container.height() * quality + '"></canvas>')[0].getContext('2d');

    //   canvas = this.canvas = canvas[0];
    //   var ctx = this.ctx = canvas.getContext('2d');
    //   ctx.scale(quality, quality);
    // }
    },
    detectRotation: function(e) {
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
      return rotation;
    },
    upload: function() {},
    onUploadEnd: function() {}
  };


  return ImageUploader;
});