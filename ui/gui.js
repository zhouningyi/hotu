'use strict';
//对UI的总体控制
define(['zepto', 'anim'], function($) {
  function Gui(container) {
    this.container = container;
    this.events();
    var shExNode = this.shExNode = $('#shrink-expand');
    shExNode.isExpand = true;
  }

  Gui.prototype.out = function(cb) {//隐藏
    cb = cb || function() {};
    var toolLeft = $('#draw-tools');
    var toolEnd = $('#end-tools');
    toolLeft.keyAnim('fadeOutLeft', {
      time: 0.5
    });
    toolEnd.keyAnim('fadeOutDown', {
      time: 0.6,
      cb: cb
    });
  };

  Gui.prototype.in = function(cb) {//显示
    cb = cb || function() {};
    var toolLeft = $('#draw-tools');
    var toolEnd = $('#end-tools');
    toolLeft.keyAnim('fadeInLeft', {
      time: 0.5
    });
    toolEnd.keyAnim('fadeInUp', {
      time: 0.6,
      cb: cb
    });
  };

  Gui.prototype.switchUI = function() {//改变显隐关系
    var shExNode = this.shExNode;
    var clearNode = $('#clear');
    if (shExNode.isExpand) {
      clearNode.css('opacity',0.5);
      this.out(function() {
        shExNode.isExpand = false;
      });
    } else {
      clearNode.css('opacity',1);
      this.in(function() {
        shExNode.isExpand = true;
      });
    }
  };
  Gui.prototype.events = function() {
    $('#shrink-expand').on('click', this.switchUI.bind(this));
    $('body').on('painter-click', this.switchUI.bind(this));
  };

  return Gui;
});
