'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../utils/utils'], function($, a, Utils) {
  var isNone = Utils.isNone;
  var upper = Utils.upper;

  function Slider(container, uiDesc) {
    this.container = container;
    this.uiDesc = uiDesc;
    this.containerW = container.width();
    this.containerH = container.height();
    this.init();
    this.events();

    var defaults = this.defaults = {
      hue: 0.5,
    };
    var self = this;
    setTimeout(function() {
      self.setDefaults(defaults);
    }, 100);
  }

  Slider.prototype.setDefaults = function(obj) {
    var value;
    for (var key in obj) {
      value = obj[key];
      if (!isNone(value)) {
        this[key] = value;
        if (this['set' + upper(key)]) this['set' + upper(key)](value); //比如背景的background变了 触发了菜单栏的background也改变
      }
    }
  };

  Slider.prototype.setValue = function(value) {
    var container = this.container;
    var pNode = this.node.find('.slider-pointer');
    if (isNone(value)) value = this.defaults.hue;

    this.value = value;
    var x = value * this.lineW;
    pNode.css({
      'left': x - this.pNodeW / 2,
    });
    container.trigger('controlrable', {
      'name': 'widthMax',
      'value': value,
    });
  };

  Slider.prototype.init = function() {
    var uiDesc = this.uiDesc;
    var node = this.node = $(
        '<div class="slider-container-desc">' + uiDesc + '</div>\
      <div class="slider-container">\
        <div class="slider-line"></div>\
        <div class="slider-pointer"></div>\
      </div>')
      .appendTo(this.container);
    this.lineW = node.find('.slider-line').width();
    this.pNodeW = node.find('.slider-pointer').width();
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
