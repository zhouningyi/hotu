'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../utils/utils'], function ($, a, Utils) {
  var body = $('body');
  var isNone = Utils.isNone;
  var getPt = Utils.getPt;

  function Slider(container, obj) {
    this.container = container;
    this.control = obj.control;
    this.target = obj.target;
    this.key = obj.key;
    this.targetName = obj.targetName;
    this.init();
    this.events();
    this.updateByTarget();
  }


  Slider.prototype.init = function () {
    var descUI = this.control.descUI;
    var node = this.node = $(
        '<div class="slider-container-desc">' + descUI + '</div>\
      <div class="slider-container">\
        <div class="slider-line"></div>\
        <div class="slider-pointer"></div>\
      </div>')
      .appendTo(this.container);
    this.lineW = node.find('.slider-line').width();
    var pNodeW = this.pNodeW = node.find('.slider-pointer').width();
    var left = Math.floor(this.value * this.lineW);
    node.find('.slider-pointer').css({
      'left': left - pNodeW / 2
    });
  };

  Slider.prototype.events = function () {
    var node = this.node;
    var self = this;
    node.on('touchstart mousedown', function (e) {
        self.isDown = true;
        e.preventDefault();
      })
      .on('touchend mouseup touchleave mouseout', function (e) {
        self.isDown = false;
        e.preventDefault();
      })
      .on('touchstart mousedown touchmove mousemove', function (e) {
        if (self.isDown) {
          var pt = getPt(e);
          var x = pt[0];
          var width = node.width();
          var value = x / width;
          if (!isNone (value)) {
            self.ui2Target(value);
          }
        }
        e.preventDefault();
      });
    body.on('update-ui-by-brush', this.updateByTarget.bind(this));
  };

  Slider.prototype.ui2Target = function (value01) {
    this.node.find('.slider-pointer').css({
      'left': value01 * this.lineW - this.pNodeW / 2
    });
    var control = this.control, range = control.range;
    control.value = (range[1] - range[0]) * value01 + range[0] * (1 - value01);
    this.target.onStyleChange();
    body.trigger('preview' + '-' + this.targetName);
  };

  Slider.prototype.updateByTarget = function () {
    var control = this.control, range = control.range;
    var value = this.target.controls[this.key].value;
    var value01 = (value - range[0]) / (range[1] - range[0]);
    this.ui2Target(value01);
  };

  return Slider;
});