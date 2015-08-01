'use strict';
define(['./../utils/utils', './layer'], function (Utils, Layer) {
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
      this.layerContainer = $(
        '<div class="container layer transition"  id="' + id + '" style="pointer-events:none; z-index:2;">\
          <canvas width="' + w * quality + '" height="' + h * quality + '" style="z-index:1;' + canvasStyle + '" class="front"></canvas>\
        </div>'
        ).appendTo(container);
      //backCanvas 是离线的
      var backCanvas = this.backCanvas = $('<canvas width="' + w * quality + '" height="' + h * quality + '" class="back"></canvas>')[0];
      var backCtx = this.backCtx = backCanvas.getContext('2d');
      backCanvas.quality = quality;
      backCtx.scale(quality, quality);
      //
      var frontCanvas = this.frontCanvas = this.canvas = container.find('.front')[0];
      var frontCtx = this.frontCtx = this.ctx = frontCanvas.getContext('2d');
      frontCanvas.quality = quality;
      frontCtx.scale(quality, quality);
    },
    getCanvas: function(){
      return [this.backCanvas, this.frontCanvas];
    },
    clean: function (type) {//清除canvas内容
      if (type === 'front' || !type) {
        this.frontCtx && this.frontCtx.clearRect(0, 0, this.frontCtx.canvas.width, this.frontCtx.canvas.height);
      }
      if (type === 'back' || !type) {
        this.backCtx && this.backCtx.clearRect(0, 0, this.backCtx.canvas.width, this.backCtx.canvas.height);
      }
      this.layerContainer.css('background', 'rgba(0,0,0,0)');
    },
    addImage: function(image){
      console.log(image, 'add_imageimageimageimage');
    },
  });
  return LayerImage;
});
