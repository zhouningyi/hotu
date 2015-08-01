'use strict';
define(['./../utils/utils', './layer', './../libs/pinchzoom'], function (Utils, Layer, PinchZoom) {
  var prevent = Utils.prevent;

 /**
  * Layer 创建一个图层
  * @param {Object} container 单个图层
  * @param {Object} options   配置
  */
  function LayerImage(container, options) {
    this.initialize(container, options);
  }

  Layer.extend(LayerImage, {
    isHide: false,
    options: {
      zoom:{
        min: 1,
        max: 4
      },
      type: 'brush', //brush  background a
      quality: 2,
      id: 'id_' + parseInt(Math.random() * 10000)
    },
    initDom: function () {
       var options = this.options, quality = options.quality || 2, id = options.id;
      var container = this.container;
      var w = container.width();
      var h = container.height();
      var canvasStyle = 'position:absolute;top:0;left:0;width:' + w + 'px; height:' + h + 'px;';
      var layerContainer = this.layerContainer = $(
        '<div class="container layer"  id="' + id + '" style="pointer-events:none; z-index:0;">\
          <div class="container image-wrapper" style="z-index:2;"></div>\
          <canvas width="' + w * quality + '" height="' + h * quality + '" style="z-index:1;' + canvasStyle + '" class="main" style="z-index:1;"></canvas>\
        </div>'
        ).appendTo(container);
      var canvas = this.canvasBg = container.find('.main')[0];
      var ctx = this.ctxBg = canvas.getContext('2d');
      canvas.quality = quality;
      ctx.scale(quality, quality);

      var canvasImage = this.canvasImage = $('<canvas width="' + w * quality + '" height="' + h * quality + '" class="back"></canvas>')[0];
      this.ctxImage = canvasImage.getContext('2d');
      this.imageWrapper = layerContainer.find('.image-wrapper');
    },
    
    /**
     * initEventsImage 为image增加缩放等的功能
     */
    initEventsImage: function(){
      var imageNode = this.imageNode = this.imageWrapper.find('img');
      this.imagePinch = new PinchZoom(imageNode, {
        isInBounding: false,
        targetId: 'default_image',
        isNeedUpdate: false
      });
      imageNode
      .on('touchstart mousedown', function(){
        self.timestart = Utils.getTimeAbsolute();
      })
      .on('touchend mouseup', function(){
      });
    },
    disable: function(){
      this.imageWrapper.find('img').css('pointer-events', 'none');
      this.imagePinch && this.imagePinch.disable();
    },
    enable: function(){
      this.imageWrapper.find('img').css('pointer-events', 'auto');
      this.imagePinch && this.imagePinch.enable();
    },
    clean: function (type) {//清除canvas内容
      this.ctxBg.clearRect(0, 0, this.ctxBg.canvas.width, this.ctxBg.canvas.height);
      this.ctxImage.clearRect(0, 0, this.ctxImage.canvas.width, this.ctxImage.canvas.height);
      this.imageWrapper.empty();
      this.layerContainer.css('background', 'rgba(0,0,0,0)');
    },
    getCanvas: function(){
      return [this.canvasBg].concat(this.getCanvasImage());
    },
    getCanvasImage: function(){
      var image = this.imageNode;
      if(!image) return [];
      var img = image[0];
      var quality = this.options.quality;
      var rect = img.getBoundingClientRect();
      var ctx = this.ctxImage, canvas = ctx.canvas;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, rect.left * quality, rect.top * quality, rect.width * quality, rect.height * quality);
      return [canvas];
    },
  });
  return LayerImage;
});
