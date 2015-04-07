'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../utils/utils'], function($,a,Utils) {
  var isNone = Utils.isNone;
  var upper = Utils.upper;
  function HueSelector(container, obj) {
    this.container = container;
    this.hue = this.hue01 = obj.value;
    this.key = 'hue';
    this.target = obj.target || 'brush';
    this.containerW = container.width();
    this.containerH = container.height();
    this.init();
    this.events();

    var self = this;
  }

  HueSelector.prototype.setHue = function(hue01) {
    var container = this.container;
    var pNode = this.node.find('.slider-pointer');
    if (isNone(hue01)) hue01 = this.hue01 || 0;

    var hue = this.hue = parseInt(360 * hue01, 10);
    var hsl = 'hsl(' + hue + ',90%,50%)';
    var x = hue01 * this.lineW;
    pNode.css({
      'left': x - this.pNodeW / 2,
      'background': hsl
    });
    container.trigger('controlrable', {
      'target':this.target,
      'name':this.key,
      'value':hue01,
    });
  };

  HueSelector.prototype.init = function () {
    var node = this.node = $(
      '<div class="slider-container-desc">色相</div>\
      <div class="slider-container">\
        <div class="slider-line-gradient"></div>\
        <div class="slider-pointer"></div>\
      </div>')
    .appendTo(this.container);
    this.lineW = node.find('.slider-line-gradient').width();
    var pNodeW = this.pNodeW = node.find('.slider-pointer').width();
    var left = Math.floor(this.hue01*this.lineW);
    node.find('.slider-pointer').css({'left':left-pNodeW/2});
  };


  HueSelector.prototype.events = function() {
    var node = this.node;
    var self = this;
    node.on('touchstart mousedown', function() {
      self.isDown = true;
    })
    .on('touchend mouseup touchleave mouseout', function() {
      self.isDown = false;
    })
    .on('touchstart mousedown touchmove mousemove',function(e){
      if(self.isDown){
        var pt = self.getPt(e);
        var x = pt[0];
        var width = node.width();
        var hue01 = x/width;
        self.setHue(hue01);
      }
    });
  };

  HueSelector.prototype.getPt = function(e) { //获取点相对于容器的位置
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


  return HueSelector;
});
