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
    var quality = Math.min(painter.quality,2.5);//这他妈得是最大的了
    var canvasW = this.canvasW= painter.containerW*quality;
    var canvasH = this.canvasH = painter.containerH*quality;
    var canvas = this.canvas = $('<canvas width="'+canvasW+'" height="'+canvasH+'"></canvas>');
    this.ctx = canvas[0].getContext('2d');
  };

  Exports.prototype.toImage = function(){
    var imgBg = this.bg.toImage();
    var imgPainterLayers = this.painter.toImage();
    var ctx = this.ctx;
    ctx.drawImage(imgBg, 0,0,this.canvasW,this.canvasH);
    for(var i in imgPainterLayers){
      var imgPainterLayer = imgPainterLayers[i];
      ctx.drawImage(imgPainterLayer, 0, 0, this.canvasW, this.canvasH);
    }

    var dataURL = this.canvas[0].toDataURL('image/png');
    // dataURL = dataURL.replace('image/png', 'image/octet-stream');
    var img = $('<img width="'+this.canvasW+'" height="'+this.canvasH+'" src="'+dataURL+'"></img>').css({
      'width':'100%',
      'height':'auto',
      'pointerEvents':'auto',
      'visibility':'visible',
      'opacity':1
    });

    return img;
  };

  return Exports;
});
