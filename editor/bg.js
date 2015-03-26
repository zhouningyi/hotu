'use strict';

define(['zepto'], function($) {
  function Bg(container) {
    container = this.container = container || $('.container');
    this.container = container;
    this.containerW = container.width();
    this.containerH = container.height();

    this.bgIndex = 0;
    this.dom();

    this.setBg(this.bgIndex);
    // this.events();
  }

  Bg.prototype.dom = function(obj) {
    obj = obj || {};
    var quality = obj.quality || 1;
    var canvas = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>').css({
      width: this.containerW,
      height: this.containerH,
      opacity:0
    }).appendTo(this.container);

    canvas = this.canvas = canvas[0];
    var ctx = this.ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };


/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////背景替换///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
  Bg.prototype.setBg = function(index) {
    var list = ['Dark','Light', 'Red'];
    if(index ===null || index ===undefined){
      index = this.bgIndex = (this.bgIndex +1)%list.length;
    }
    var bgName = list[index];
    this['bg' + bgName]();
    this.container.trigger('bg-color-change',this.bgColor);
    this.updateCanvas();
  };

  Bg.prototype.bgDark = function() {
    var bgColor = this.bgColor = 'rgba(40,40,40,1)';
    this.container.css({
      'background':bgColor
    });
  };

  Bg.prototype.bgLight = function() {
    var bgColor = this.bgColor =  'rgba(255,255,255,1)';
    this.container.css({
      'background': bgColor
    });
  };

  Bg.prototype.bgRed = function() {
    var bgColor = this.bgColor =  'rgba(230,0,0,1)';
    this.container.css({
      'background': bgColor
    });
  };

  Bg.prototype.toImage = function() {
    return this.canvas;
  };

  Bg.prototype.updateCanvas = function() {
    var ctx = this.ctx;
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
  };

  return Bg;
});
