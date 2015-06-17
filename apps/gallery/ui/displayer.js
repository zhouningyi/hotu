'use strict';
//播放作品的面板
define(['zepto', './../../../utils/utils', './display_slider', './../../../render/animator', './../../../brush/brushes'], function ($, Utils, DisplaySlider, Animator, Brushes) {
  var body = $('body');
  var upper = Utils.upper;
  var prevent = Utils.prevent;
  var obj2hsla = Utils.obj2hsla;
  var setRgbaAlpha = Utils.setRgbaAlpha;

  function Displayer(container, opt) {
    this.isLock = true;
    opt = opt || {};
    // this.bgColor = data.bgColor || '#fff';

    container = container || $('.container');
    this.container = container;

    container.css({display: 'block'}).removeClass('out-left');

    var offset = container.offset();
    this.left = offset.left;
    this.top = offset.top;
    var containerW = this.containerW = container.width();
    var containerH = this.containerH = container.height();
    var quality = this.quality = opt.quality || 2;

    var brushes = new Brushes();
    var brushObj = this.brushObj = brushes.brushObj;
    // this.animation = new Animator({
    //   brushes: brushObj,
    // });

    this.modelDraw = opt.modelDraw;

    this.init();
    this.events();
    container.css({display: 'none'});
  }

  Displayer.prototype.init = function () {
    var displayContainer = this.displayContainer =
    $('\
      <div class="displayer-container container displayer-transition">\
        <div class="display-area"></div>\
          \
        <div class="info-area displayer-transition-normal">\
          <div class="control"></div>\
          <div class="text-area">\
          \
            <div class="title">作品</div>\
            <div class="delete icon-div">\
            <i class="iconfont iconfont-display transiton" style="display:inline-block">&#xe605;</i>\
            <span class="iconfont-add">23</span>\
            </div>\
          </div>\
          \
        </div>\
      </div>\
      ')
      .appendTo(this.container);//<div class="desc">阿达荒原的心荒心</div>\
    var controlNode = this.controlNode = displayContainer.find('.control');
    this.slider = new DisplaySlider(controlNode);
    this.deleteNode = displayContainer.find('.delete').find('.iconfont');
    this.cancelNode = displayContainer.find('.cancel').find('.iconfont');
  };

  Displayer.prototype.checkCanvas = function (w, h) { //添加一个canvas层
    if(this.canvasW !==w || this.canvasH !==h){
      if(this.canvasDisplay){
        $(this.canvasDisplay).remove();
      }
      var quality = 2;
      var canvas = $(this.appendCanvas('display', this.displayContainer, quality, w, h));
      if(h/w > this.containerH/this.containerW){
        var top = (this.containerH - this.containerW * h / w) / 2 + 'px';
        canvas.css({
          'top': '0',
          'left': (this.containerW - this.containerH * w / h) / 2 + 'px',
          'width': 'auto',
          'height': '100%'
        });
      }else{
        canvas.css({
          'top': (this.containerH - this.containerW * h / w) / 2 + 'px',
          'left': 0,
          'height': 'auto',
          'width': '100%'
        });
      }
    }
    // this.appendCanvas('display', this.displayContainer, quality);
  };

  Displayer.prototype.appendCanvas = function (name, container, quality, w, h) { //添加一个canvas层
    w = w || this.containerW;
    h = h || this.containerH;
    quality = quality || this.quality;
    this.canvasW = w;
    this.canvasH = h;
    var canvas = $('<canvas width="' + w * quality + '" height="' + h * quality + '" id="' + name + '"></canvas>')
      .css({
        'position': 'absolute',
        'pointerEvents': 'none',
        'top': 0,
        'left': 0,
        'width': '100%',
        'height': '100%',
        'background': '#fff'//默认为白色
      }).appendTo(container);
    canvas = this['canvas' + upper(name)] = canvas[0];
    var ctx = this['ctx' + upper(name)] = canvas.getContext('2d');
    ctx.scale(quality, quality);
    return canvas;
  };

  Displayer.prototype.data = function(d){
    this._data = d;
  };

  Displayer.prototype.start = function () {
    var drawData = this._data.drawData;
    if(!drawData) return;
    var dataLength;
    if(drawData.c) dataLength = drawData.c.length;
    var slider = this.slider;
    if (this.starting) return;
    this.starting = true;
    var renderIndex = 0;
    var self = this;
    var background = 'rgba(255,255,255,1)';
    if(drawData.bg){
      background = obj2hsla(drawData.bg.color)
    }
    $(this.canvasDisplay).css({
      'background': background
    });
  };

  Displayer.prototype.show = function(data, node) {
    var self = this;
    if (data) this.data(data);
    data = this._data;
    var drawData = data.drawData;
    var bgColor = (drawData.bg)?obj2hsla(drawData.bg.color):'rgba(255,255,255,1)';
    var bgDivColor = setRgbaAlpha(bgColor, 0.05);
    this.displayContainer.css({
      'background': bgDivColor
    });

    this.animation = new Animator({
      brushes: this.brushObj,
    });
    this.addHooks();

    var offset = this.curOffset = node.offset();
    var container = this.container;
    container
      .css({
        'display': 'block',
        'width': offset.width,
        'height': offset.height,
        'left': offset.left,
        'top': offset.top
      })
    .removeClass('displayer-transition-fast')
    .addClass('displayer-transition-normal');

    this.checkCanvas(drawData.frameW, drawData.frameH);

    var animation = this.animation;
    animation.ctx(this.ctxDisplay);
    animation.step('fast');
    animation.data(drawData);

    setTimeout(function() {
      container.css({
        'pointerEvents':'auto',
        'opacity':'1',
        'width': '100%',
        'height': '100%',
        'top': '0%',
        'left': '0%',
      });
    }, 200);

    setTimeout(function() {
      self.isLock = false;
    }, 1000);
    
    this.container.find('.title').text(data.title);

    // var background = 'rgba(255,255,255,1)';
    // if(drawData.bg){
    //   background = obj2hsla(drawData.bg.color)
    // }
    // $(this.canvasDisplay).css({
    //   'background': background
    // });

    $(this.canvasDisplay).css({
        'background': bgColor
      });
  };

  Displayer.prototype.hide = function () {
    var animation = this.animation;
    if(this.isLock) return;
    var self = this;
    this.ctxDisplay.clearRect(0,0,this.ctxDisplay.canvas.width,this.ctxDisplay.canvas.height);
    var container = this.container;
    var offset = this.curOffset 
    container.css({
      'opacity': 0,
      'width': offset.width,
      'height': offset.height,
      'left': offset.left,
      'top': offset.top,
      'pointerEvents':'none'
    });
     this.isLock = true;
    animation.destory();
    setTimeout(function(){
      container.removeClass('displayer-transition-normal').addClass('displayer-transition-fast');
    }, 100);
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Displayer.prototype.events = function () {
    var self = this;
    var modelDraw = this.modelDraw;

    this.deleteNode.on('click', function () {
      if(!self._data) return;
      modelDraw.deleteDrawing({
        drawid: self._data.drawid
      });
      var node = $(this);
      if (node.hasClass('iconfont-selected')) {
        node.removeClass('iconfont-selected');
      } else {
        node.addClass('iconfont-selected');
      }
    });
    this.container
    .on('click', function(e){
      self.hide();
      prevent(e);
    });

    $('.info-area')
    .on('click', function(e){
      prevent(e);
    })
    .on('touchstart mousedown', function(e){
      prevent(e);
    });
  };

  Displayer.prototype.addHooks = function(){
    var animation = this.animation;
    var slider = this.slider;
    slider.onBegin(animation.switch.bind(animation));
    slider.onSlider(animation.to.bind(animation));
    animation
    .on('step', function (percent) {
      slider.setValue(percent);
    })
    .on('loop-statu', function(bool){
      if(bool) return slider.stopButton();
      slider.loopButton();
    });
  }
  return Displayer;
});
