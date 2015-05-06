'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../utils/utils'], function ($,a,Utils) {
  var body = $('body');
  var isNone = Utils.isNone;
  var upper = Utils.upper;
  var prevent = Utils.prevent;
  var getPt = Utils.getPt;
  function HueSelector(container, obj) {
    this.container = container;

    this.control = obj.control;
    this.target = obj.target;
    this.targetName = obj.targetName;

    this.init();
    this.events();

    this.updateByTarget();
  }

  HueSelector.prototype.updateByTarget = function () {
    this.ui2Target(this.target.controls.hue.value);
  };

  HueSelector.prototype.ui2Target = function (hue01) {
    var lineNode = this.node.find('.slider-line-gradient');
    var pNode = this.node.find('.slider-pointer');
    var target = this.target;
    
    var container = this.container;

    var control = this.control, range = control.range;
    control.value = (range[1] - range[0]) * hue01 + range[0] * (1 - hue01);
    target.onStyleChange();
    var colorShowSat = target.colorShowSat;
    pNode.css({
      'left': hue01 * lineNode.width() - pNode.width() / 2,
      'background': colorShowSat
    });
    
    body.trigger('preview' + '-' + this.targetName);
    body.trigger('update' + '-' + 'hue' +  this.targetName);
  };

  HueSelector.prototype.init = function () {
    var node = this.node = $(
      '<div class="slider-container-desc">颜色</div>\
      <div class="slider-container">\
        <div class="slider-line-gradient"></div>\
        <div class="slider-pointer"></div>\
      </div>')
    .appendTo(this.container);
  };

  HueSelector.prototype.events = function () {
    var node = this.node;
    var self = this;
    node.on('touchstart mousedown', function (e) {
      prevent(e);
      self.isDown = true;
    })
    .on('touchend mouseup touchleave mouseout', function (e) {
      prevent(e);
      self.isDown = false;
    })
    .on('touchstart mousedown touchmove mousemove', function (e) {
      prevent(e);
      if (self.isDown) {
        var pt = getPt(e);
        var x = pt[0];
        self.ui2Target(x / node.width());
      }
    });
    body.on('update-ui-by-brush', this.updateByTarget.bind(this));
  };

  return HueSelector;
});
