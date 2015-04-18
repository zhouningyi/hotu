'use strict';
//对UI的总体控制
define(['zepto', 'anim'], function ($) {
  var body = $('body');

  function Gui(container) {
    this.container = container;
    this.toolLeft =  $('#draw-tools');
    this.toolEnd = $('#end-tools');
  }

  Gui.prototype.outLeft = function (cb) { //隐藏
    if (!this.isOutLeft) {
      cb = cb || function () {};
      var toolLeft = this.toolLeft;
      toolLeft.keyAnim('fadeLight', {
        time: 0.5
      });
      this.isOutLeft = true;
    }
  };

  Gui.prototype.inLeft = function (cb) { //显示
    if (this.isOutLeft) {
      cb = cb || function () {};
      var toolLeft = this.toolLeft;
      toolLeft.keyAnim('fadeNormal', {
        time: 0.5
      });
      this.isOutLeft = false;
    }
  };

  Gui.prototype.out = function (cb) {
    this.outEnd(cb);
    this.outLeft(cb);
    this.isOut = true;
  };

  Gui.prototype.in = function (cb) {
    this.inEnd(cb);
    this.inLeft(cb);
    this.isOut = false;
  };

  Gui.prototype.outEnd = function (cb) { //隐藏
    if (!this.isOutEnd) {
      cb = cb || function () {};
      var toolEnd = this.toolEnd;
      toolEnd.keyAnim('fadeLight', {
        time: 0.6,
        cb: cb
      });
      this.isOutEnd = true;
    }
  };

  Gui.prototype.inEnd = function (cb) { //显示
    if (this.isOutEnd) {
      cb = cb || function () {};
      var toolEnd = this.toolEnd;
      toolEnd.keyAnim('fadeNormal', {
        time: 0.6,
        cb: cb
      });
      this.isOutEnd = false;
    }
  };

  Gui.prototype.switchUI = function () { //改变显隐关系
    (this.isOut)? this.in(): this.out();
  };

  Gui.prototype.setBackground = function (color) {
    var colors = color.split(',');
    colors[3] = '0.9)';
    colors = colors.join(',');
    this.toolLeft.css({background: colors});
    this.toolEnd.css({background: colors});
  };
  return Gui;
});
