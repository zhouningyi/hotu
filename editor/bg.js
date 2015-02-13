'use strict';

define(['zepto'], function($) {
  function Bg(container) {
    container = container || $('.container');
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
    var container = this.container;
    var canvas = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>').css({
      width: this.containerW,
      height: this.containerH
    });
    container.append(canvas);

    canvas = this.canvas = canvas[0];
    var ctx = this.ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };


/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////背景替换///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
  Bg.prototype.setBg = function(index) {
    var list = ['Dark', 'Light'];
    if(index ===null || index ===undefined){
      index = this.bgIndex = (this.bgIndex +1)%list.length;
    }
    var bgName = list[index];
    this['bg'+bgName]();
  };

  Bg.prototype.bgDark = function() {
    this.container.css({
      'background': '#222'
    });
  };

  Bg.prototype.bgLight = function() {
    this.container.css({
      'background': '#fff'
    });
  };

  return Bg;
});
