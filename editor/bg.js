'use strict';

define(['zepto'], function($) {
  function Bg(container) {
    container = this.container = container || $('.container');
    this.container = container;
    this.containerW = container.width();
    this.containerH = container.height();

    this.bgIndex = 0;
    this.setBg(this.bgIndex);

    this.dom();
    // this.events();
  }

  Bg.prototype.dom = function(obj) {
    obj = obj || {};
    var quality = obj.quality || 2;
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
    var list = ['Red','Dark','Light'];
    if(index ===null || index ===undefined){
      index = this.bgIndex = (this.bgIndex +1)%list.length;
    }
    var bgName = list[index];
    this['bg' + bgName]();
    this.container.trigger('bg-color-change',this.bgColor);
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
    var bgColor = this.bgColor;
    var ctx = this.ctx;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    var data = this.canvas.toDataURL('image/png');
    return $('<img src="'+data+'"></img>')[0];
  };

  return Bg;
});
