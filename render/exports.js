'use strict';
define([],function(){

  function Exports(container, bg, painter){
    this.container = container;
    this.bg = bg;
    this.painter = painter;
    this.init();
  }

  Exports.prototype.init = function(){
    var painter = this.painter;
    var quality = Math.min(painter.quality, 2.0);//这他妈得是最大的了
    var canvasW = this.canvasW= painter.containerW * quality;
    var canvasH = this.canvasH = painter.containerH * quality;
    var canvas = this.canvas = $('<canvas width="' + canvasW + '" height="' + canvasH + '"></canvas>');
    this.ctx = canvas[0].getContext('2d');

    var canvasSmall = this.canvasSmall = $('<canvas width="300" height="300"></canvas>');
    this.ctxSmall = canvasSmall[0].getContext('2d');
  };

  Exports.prototype.toImage = function(type){
    var imgBg = this.bg.toImage();
    var imgPainterLayers = this.painter.toImage();
    var ctx, canvas;
    if(type==='small'){
      ctx = this.ctxSmall;
      canvas = this.canvasSmall[0];
    }else{
      ctx = this.ctx;
      canvas = this.canvas[0];
    }

    ctx.drawImage(imgBg, 0, 0, canvas.width, canvas.height);
    for(var i in imgPainterLayers){
      var imgPainterLayer = imgPainterLayers[i];
      ctx.drawImage(imgPainterLayer, 0, 0, canvas.width, canvas.height);
    }

    var dataURL;
    var encoder = new JPEGEncoder();
    if(!canvas.toDataURL){
      dataURL = encoder.encode(ctx.getImageData(0,0,canvas.width,canvas.height), 90);
    }else{
      dataURL = canvas.toDataURL('image/png');
      if(dataURL.length<20){//有时dataurl会错误 长度很短
        dataURL = encoder.encode(ctx.getImageData(0,0,canvas.width,canvas.height), 90);
      }
    }

    var dataURLDownload = dataURL.replace('image/png', 'image/octet-stream');
    var img =
     $('<img width="'+this.canvasW+'" height="'+this.canvasH+'" src="'+dataURL+'"></img>')
     .css({
      'width':'100%',
      'height':'auto',
      'pointerEvents':'auto',
      'visibility':'visible',
      'opacity':1
    });

    return {
      'img': img,
      'downLoadURL': dataURLDownload,
      'dataURL': dataURL
    };
  };

  return Exports;
});
