'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../../utils/utils', './../../libs/event'], function($, a, Utils, EventEmitter) {
  var body = $('body');
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;
  var getPt = Utils.getPt;

  function WidthSlider(container, opt) {
    this.initialize(container, opt);
  }

  EventEmitter.extend(WidthSlider, {
    lineRadius: 4,
    initialize: function(container, opt) {
      this.container = container;
      Utils.merge(this, opt);
      this.initDom();
      this.initEvents();
      this.updateByTarget();
    },
    setTarget: function(target){
      if(!brush) return;
      this.target = target;
      var controls = target.controls;
      this.control = controls[this.key];
    },
    initDom: function() {
      var container = this.container;
      var node = this.node = $(
      '<div class="slider-container-desc">' + this.control.descUI + '</div>\
       <div class="slider-container">\
       </div>').appendTo(container);
      var sliderNode = container.find('.slider-container');
      var w = this.sliderW = sliderNode.width(),
        h = this.sliderH = sliderNode.height();
      var ctx = this.ctx = Utils.genCanvas({
        'container': sliderNode
      });
    },
    drawShape: function(percent, color) {
      percent = percent || 1, color = color || 'rgb(220,220,220)';
      var ctx = this.ctx,
        lineRadius = this.lineRadius;
      var w = this.sliderW,
        h = this.sliderH;
      var triW = w * percent - lineRadius;
      var triH = h * percent;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(triW, h);
      ctx.lineTo(triW, h * (1 - percent));
      ctx.lineTo(0, h - 2);
      ctx.lineTo(0, h);
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      if (lineRadius * 2 > triH) {
        ctx.fillStyle = color;
        var cx = triW,
          cy = (1 - percent * 0.5) * h;
        ctx.arc(cx, cy, percent * 0.5 * h, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.lineCap = 'round';
        ctx.lineWidth = lineRadius * 2;
        ctx.strokeStyle = color;
        ctx.moveTo(triW, (1 - percent) * h + lineRadius);
        ctx.lineTo(triW, h - lineRadius);
        ctx.stroke();
      }
      ctx.closePath();
    },
    initEvents: function() {
      var node = this.node;
      var self = this;
      node.on('touchstart mousedown', function(e) {
          prevent(e)
          self.isDown = true;
        })
        .on('touchend mouseup touchleave', function(e) {
          prevent(e)
          self.isDown = false;
        })
        .on('touchstart mousedown touchmove mousemove', function(e) {
          prevent(e)
          if (self.isDown) {
            var pt = getPt(e);
            var x = pt[0];
            var width = node.width();
            var value = x / width;
            if (!isNone(value)) {
              self.ui2Target(value);
            }
          }
        });
      body.on('update-ui-by-target', this.updateByTarget.bind(this));
    },
    ui2Target: function(value01) {
      Utils.clean(this.ctx);
      this.drawShape();
      this.drawShape(value01, '#099');
      var control = this.control,
        range = control.range;
      control.value = (range[1] - range[0]) * value01 + range[0] * (1 - value01);
      this.target.onStyleChange(this.key);
      body.trigger('preview' + '-' + this.targetName);
    },
    updateByTarget: function() {
      var control = this.control,
        range = control.range, value = control.value;
      var value01 = (value - range[0]) / (range[1] - range[0]);
      this.ui2Target(value01);
    }
  })
  return WidthSlider;
});