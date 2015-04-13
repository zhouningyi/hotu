'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../utils/utils'], function($, a, Utils) {
  var isNone = Utils.isNone;
  var upper = Utils.upper;

  function Slider(container, obj) {
    this.target = obj.target || 'brush';
    this.key = obj.key || 'light';
    obj = obj || {};
    this.container = container;
    this.descUI = obj.descUI;
    this.value = obj.value;
    this.containerW = container.width();
    this.containerH = container.height();
    this.init();
    this.events();

    var defaults = this.defaults = {
      hue: 0.5,
    };
    var self = this;
    setTimeout(function() {
      self.setValue(self.value);
    }, 100);
  }


  Slider.prototype.setValue = function(value01) {
    var container = this.container;
    var pNode = this.node.find('.slider-pointer');
    if (isNone(value01)) value01 = 0;

    this.value01 = value01;
    var x = value01 * this.lineW;
    pNode.css({
      'left': x - this.pNodeW / 2,
    });
    container.trigger('controlrable', {
      'name': this.key,
      'value': value01,
      'target':this.target
    });
  };

  Slider.prototype.init = function() {
    var descUI = this.descUI;
    var node = this.node = $(
        '<div class="slider-container-desc">' + descUI + '</div>\
      <div class="slider-container">\
        <div class="slider-line"></div>\
        <div class="slider-pointer"></div>\
      </div>')
      .appendTo(this.container);
    this.lineW = node.find('.slider-line').width();
    var pNodeW = this.pNodeW = node.find('.slider-pointer').width();
    var left = Math.floor(this.value*this.lineW);
    node.find('.slider-pointer').css({'left':left-pNodeW/2});
  };


  Slider.prototype.events = function() {
    var node = this.node;
    var self = this;
    node.on('touchstart mousedown', function() {
        self.isDown = true;
      })
      .on('touchend mouseup touchleave mouseout', function() {
        self.isDown = false;
      })
      .on('touchstart mousedown touchmove mousemove', function(e) {
        if (self.isDown) {
          var pt = self.getPt(e);
          var x = pt[0];
          var width = node.width();
          var value = x / width;
          self.setValue(value);
        }
      });
  };

  Slider.prototype.getPt = function(e) { //获取点相对于容器的位置
    var node = $(e.target);
    var nodeW = node.width();
    var nodeH = node.height();
    var offset = node.offset();
    var left = offset.left;
    var top = offset.top;
    var x, y;
    if (e.type.indexOf('mouse') !== -1) {
      x = e.x || e.pageX;
      y = e.y || e.pageY;
      return [x - left, y - top];
    }
    var touch = window.event.touches[0];
    x = touch.pageX - left;
    y = touch.pageY - top;
    x = (x < nodeW) ? x : nodeW;
    x = (x > 0) ? x : 1;
    y = (y < nodeH) ? y : nodeH;
    y = (y > 0) ? y : 1;
    return [x, y];
  };

  return Slider;
});
