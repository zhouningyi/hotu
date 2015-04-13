'use strict';
//播放作品的面板
define(['zepto'], function($) {

  var body = $('body');

  function Displayer(container, opt) {
    opt = opt || {};

    container = container || $('.container');
    this.container = container;
    var offset = container.offset();
    this.left = offset.left;
    this.top = offset.top;
    this.containerW = container.width();
    this.containerH = container.height();
    var quality = this.quality = opt.quality || 2;
    this.appendCanvas(name, container, quality);

    //数据
    this.modelDraw = opt.modelDraw; //数据
    this.containerW = container.width();
    this.containerH = container.height();

    //其他
    this.renderer = opt.renderer;
    this.events();
  }

  Displayer.prototype.dom = function(){
  };

  Displayer.prototype.appendCanvas = function(name, container, quality) { //添加一个canvas层
    var w = this.containerW;
    var h = this.containerH;
    quality = quality || this.quality;
    var canvas = $('<canvas width="' + w * quality + '" height="' + h * quality + '" id="' + name + '"></canvas>')
      .css({
        'position': 'absolute',
        'top': 0,
        'left': 0,
        'width': w,
        'height': h
      }).appendTo(container);
    canvas = this['canvas' + upper(name)] = canvas[0];
    var ctx = this['ctx' + upper(name)] = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Displayer.prototype.events = function() {
    var uiContainer = this.container.find();
    uiContainer
      .on('touchstart mousedown', this.touchstart.bind(this))
      .on('touchmove mousemove', this.touchmove.bind(this))
      .on('touchend mouseup touchleave mouseout', this.touchleave.bind(this));
  };


  return Painter;
});
