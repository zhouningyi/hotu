'use strict';
//对UI的总体控制
define(['zepto', 'anim'], function($) {
  function FloatTag(container) {
    this.container = container;
    this.init();
    this.isOut = true;
  }

  FloatTag.prototype.init = function() {
    this.floatTagNode = $(
      '<div class="float-tag">\
        <div class="float-tag-add"></div>\
        <div class="float-tag-triangle"></div>\
      <div>').appendTo(this.container);
    this.floatTagAddNode = this.floatTagNode.find('.float-tag-add');
  };

  FloatTag.prototype.out = function(cb) { //隐藏
    if (!this.isOut) {
      var self = this;
      cb = cb || function() {};
      var floatTagNode = this.floatTagNode;
      floatTagNode.keyAnim('fadeOut', {
        time: 0.5,
        cb: function() {
          floatTagNode.css({
            'pointerEvents': 'none'
          });
          self.isOut = true;
        }
      });
    }
  };

  FloatTag.prototype.floatTagHelp = function(text) {
    $('<div class="float-tag-help">'+text+'<div>').appendTo(this.floatTagAddNode);
  };
  var csses = {
    'bottom': function(w, l, h, t) {
      var width = $(window).width()*0.4;
      var offset = 5;
      return {
        'left': l + w / 2 - width / 2,
        'bottom': h+offset,
        'width': width,
        'height': 'auto'
      };
    }
  };

  FloatTag.prototype.in = function(obj ,cb) { //隐藏
    if (this.isOut&&obj) {
      var self = this;
      var node = obj.node;
      // 位置
      var offset = node.offset();
      var w = offset.width;
      var l = offset.left;
      var h = offset.height;
      var t = offset.top;
      var type = obj.type || 'bottom';
      var css = csses[type](w, l, h, t);
      var floatTagNode = this.floatTagNode;
      var floatTagAddNode = this.floatTagAddNode;
      floatTagAddNode.empty();
      cb = cb || function(){};
      floatTagNode.css(css).keyAnim('fadeIn', {
        time: 0.5,
        cb: function() {
          floatTagNode.css({
            'pointerEvents': 'auto'
          });
          self.isOut = false;
          cb();
        }
      });
      //背景色
      if(obj.bgImg) obj.bgImg.appendTo(floatTagAddNode);

      //提示
      if(obj.helpText) this.floatTagHelp(obj.helpText);
    }
  };


  FloatTag.prototype.events = function() {};

  return FloatTag;
});