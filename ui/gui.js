'use strict';
//对UI的总体控制
define(['zepto', 'anim'], function($) {
  var body = $('body');

  function Gui(container) {
    this.container = container;
    this.toolLeft =  $('#draw-tools');
    this.toolEnd = $('#end-tools');
  }

  Gui.prototype.outLeft = function(cb) { //隐藏
    if (!this.isOutLeft) {
      cb = cb || function() {};
      var toolLeft = this.toolLeft;
      toolLeft.keyAnim('fadeOutLeft', {
        time: 0.5
      });
      this.isOutLeft = true;
    }
  };

  Gui.prototype.inLeft = function(cb) { //显示
    if (this.isOutLeft) {
      cb = cb || function() {};
      var toolLeft = this.toolLeft;
      toolLeft.keyAnim('fadeInLeft', {
        time: 0.5
      });
      this.isOutLeft = false;
    }
  };

  Gui.prototype.out = function(cb) {
    this.outEnd(cb);
    this.outLeft(cb);
    this.isOut = true;
  };

  Gui.prototype.in = function(cb) {
    this.inEnd(cb);
    this.inLeft(cb);
    this.isOut = false;
  };

  Gui.prototype.outEnd = function(cb) { //隐藏
    if (!this.isOutEnd) {
      cb = cb || function() {};
      var toolEnd = this.toolEnd;
      toolEnd.keyAnim('fadeOutDown', {
        time: 0.6,
        cb: cb
      });
      this.isOutEnd = true;
    }
  };

  Gui.prototype.inEnd = function(cb) { //显示
    if (this.isOutEnd) {
      cb = cb || function() {};
      var toolEnd = this.toolEnd;
      toolEnd.keyAnim('fadeInUp', {
        time: 0.6,
        cb: cb
      });
      this.isOutEnd = false;
    }
  };

  Gui.prototype.switchUI = function() { //改变显隐关系
    (this.isOut)?this.in():this.out();
  };

  Gui.prototype.bgColor = function(color) {
    var colors = color.split(',');
    colors[3] = '0.6)';
    colors = colors.join(',');
    this.toolLeft.css({background:colors});
    this.toolEnd.css({background:colors});
  };
  return Gui;
});
