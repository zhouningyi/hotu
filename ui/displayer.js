'use strict';
//播放作品的面板
define(['zepto', './../utils/utils', './components/display_slider', './../render/renderer', './../brush/brushes', './data/mock'], function ($, Utils, DisplaySlider, Renderer, Brushes, data) {
  var body = $('body');
  var upper = Utils.upper;

  function Displayer(container, opt) {
    opt = opt || {};
    this.data = data;
    this.dataLength = data.c.length;
    this.bgColor = data.bgColor || '#fff';

    container = container || $('.container');
    this.container = container;
    container.css({display: 'block'});
    container.removeClass('out-left');

    var offset = container.offset();
    this.left = offset.left;
    this.top = offset.top;
    var containerW = this.containerW = container.width();
    var containerH = this.containerH = container.height();
    var quality = this.quality = opt.quality || 2;

    if (opt.renderer) {
      this.renderer = opt.renderer;
    } else {
      var brushes = new Brushes();
      var brushObj = brushes.brushObj;
      var frameOpt = {
        frameW: containerW,
        frameH: containerH
      };
      this.renderer = new Renderer(brushObj, frameOpt); //动画播放等
    }

    this.init();
    this.appendCanvas('display', this.displayContainer, quality);
    this.events();
    this.renderer.drawDatas(this.ctxDisplay, data, {
      curve: {
        async: 0
      },
      frame: {
        async: 1
      }
     }); //把出栈的线绘制到后面去
  }

  Displayer.prototype.init = function () {
    var displayContainer = this.displayContainer =
    $('\
      <div class="displayer-container container">\
        <div class="display-area"></div>\
        <div class="info-area">\
          <div class="control"></div>\
          <div class="text-area">\
            <div class="title">荒原的心</div>\
            <div class="love icon-div">\
            <i class="iconfont iconfont-display" style="display:inline-block">&#xe60a;</i>\
            <span class="iconfont-add">23</span>\
            </div>\
            <div class="view icon-div">\
            <i class="iconfont iconfont-display" style="display:inline-block">&#xe60e;</i>\
            <span class="iconfont-add">野狩</span>\
            </div>\
          </div>\
        </div>\
      </div>\
      ').appendTo(this.container);//<div class="desc">阿达荒原的心荒心</div>\
    var controlNode = this.controlNode = displayContainer.find('.control');
    this.displaySlider = new DisplaySlider(controlNode);
    this.loveNode = displayContainer.find('.love').find('.iconfont');
  };

  Displayer.prototype.appendCanvas = function (name, container, quality) { //添加一个canvas层
    var w = this.containerW;
    var h = this.containerH;
    quality = quality || this.quality;
    var canvas = $('<canvas width="' + w * quality + '" height="' + h * quality + '" id="' + name + '"></canvas>')
      .css({
        'position': 'absolute',
        'pointerEvents': 'none',
        'top': 0,
        'left': 0,
        'width': w,
        'height': h
      }).appendTo(container);
    canvas = this['canvas' + upper(name)] = canvas[0];
    var ctx = this['ctx' + upper(name)] = canvas.getContext('2d');
    ctx.scale(quality, quality);
    //默认为白色
    $(canvas).css({
      'background': '#fff'
    });
  };

  Displayer.prototype.start = function () {
    var displaySlider = this.displaySlider;
    if (this.starting) return;
    this.starting = true;
    var renderIndex = 0;
    var dataLength = this.dataLength;
    var self = this;
    var ctx = this.ctxDisplay;
    // ctx.fillStyle = this.bgColor;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.renderer.drawDatas(this.ctxDisplay, this.data, {
      curve: {
        async: 1
      },
      frame: {
        async: 1
      },
      doneCurve: function () {
        displaySlider.setValue(renderIndex++ / dataLength);
      },
      done: function () {
        displaySlider.setValue(1);
        self.starting = false;
      }
    });
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Displayer.prototype.events = function () {
    this.displaySlider.onBegin(this.start.bind(this));
    this.loveNode.on('click', function () {
      var node = $(this);
      if (node.hasClass('iconfont-selected')) {
        node.removeClass('iconfont-selected');
      } else {
        node.addClass('iconfont-selected');
      }
    });
  };

  return Displayer;
});
