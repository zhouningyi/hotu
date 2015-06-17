'use strict';
//播放作品的面板
define(['zepto', './../../../utils/utils'], function ($, Utils) {
  var body = $('body');
  var upper = Utils.upper;
  var getPt = Utils.getPt;

  function DisplaySlider(container, opt) {
    opt = opt || {};
    this.container = container || $('.container');

    this.init();
    this.events();
  }

  DisplaySlider.prototype.init = function () {
    var container = this.container;
    var containerW = this.containerW = container.width();
    var buttonSize = this.containerH = container.height();
    var sliderW = containerW - buttonSize;
    var displayContainer = this.displayContainer = $('\
        <div class="broadcast" style="width:' + buttonSize + 'px;">\
          <i class="iconfont-broadcast iconfont-display transiton loop" style="display:inline-block">&#xe608;</i>\
        </div>\
        \
        <div class="slider" style="width:' + sliderW + 'px;">\
           <div class="slider-line">\
             <div class="percent-line transition-fast"></div>\
           </div>\
        </div>\
      ').appendTo(this.container);
    this.sliderNode = container.find('.slider');
    this.sliderLineNode = container.find('.slider-line');
    this.percentNode = container.find('.percent-line');
    this.broadcastNode = container.find('.broadcast');
  };

  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  DisplaySlider.prototype.events = function () {
    var self = this;
    var isDown = false;
    this.sliderNode
    .on('touchstart mousedown', function (e) {
      isDown = true;
      self.updateValue(e, $(this));
    })
    .on('touchmove mousemove', function (e) {
      if (!isDown) return;
      self.updateValue(e, $(this));
    })
    .on('mouseup touchup touchleave', function (e) {
      isDown = false;
    });

    this.broadcastNode
    .on('click', function (e) {
      if(self._begin) self._begin();
    });
  };

  DisplaySlider.prototype.stopButton = function () {
    this.broadcastNode.html('<i class="iconfont-broadcast iconfont-display transiton" style="display:inline-block">&#xe607;</i>');
  }

  DisplaySlider.prototype.loopButton = function () {
    this.broadcastNode.html('<i class="iconfont-broadcast iconfont-display transiton" style="display:inline-block">&#xe608;</i>');
  }

  DisplaySlider.prototype.updateValue = function (e, node) {
    var pt = getPt(e);
    var sliderLineNode = this.sliderLineNode;
    var sliderLineW = sliderLineNode.width();
    var realW = pt[0] - 0.04 * node.width();
    if(realW < 0) realW = 0;
    if(realW > sliderLineW) realW = sliderLineW;
    var value = realW / sliderLineW;
    if (this._slider) this._slider (value);
  };

  DisplaySlider.prototype.setValue = function (value) {
    var percent = parseInt(100 * value) + '%';
    this.percentNode.css({
      'width': percent
    });
  };

  DisplaySlider.prototype.onBegin = function (cb) {
    this._begin = cb;
  };

  DisplaySlider.prototype.onSlider = function (cb) {
    this._slider = cb;
  };
  return DisplaySlider;
});
