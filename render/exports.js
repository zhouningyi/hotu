'use strict';
define(['zepto'],function($){

  function Exports(container, bg, painter){
    this.container = container;
    this.bg = bg;
    this.painter = painter;
    this.init();
  }

  Exports.prototype.init = function(){
    var painter = this.painter;
    var quality = painter.quality;
    var containerW = this.containerW = painter.containerW;
    var containerH = this.containerH = painter.containerH;
    this.canvasW = containerW*quality;
    this.canvasH = containerH*quality;
    var canvas = this.canvas = $('<canvas width="'+containerW*quality+'" height="'+containerH*quality+'"></canvas>');
    // .css({
    //   width:'100%',
    //   height:'100%',
    //   // visible:'hidden'
    // });
    // .appendTo(this.container);
    this.ctx = canvas[0].getContext('2d');
  };

  Exports.prototype.toImage = function(){
    var imgBg = this.bg.toImage();
    var imgPainterLayers = this.painter.toImage();
    var ctx = this.ctx;
    var canvasW = this.canvasW,canvasH=this.canvasH;
    ctx.drawImage(imgBg, 0,0,canvasW,canvasH);
    for(var i in imgPainterLayers){
      var imgPainterLayer = imgPainterLayers[i];
      ctx.drawImage(imgPainterLayer, 0, 0, canvasW, canvasH);
    }

    var data = ctx.canvas.toDataURL('image/png');
    // data = data.replace('image/png', 'image/octet-stream');
    var img = $('<img width="'+this.canvasW+'" height="'+this.canvasH+'" src="'+data+'"></img>').css({
      'width':'100%',
      'height':'auto',
    });

    return img;
  };

  return Exports;
});
