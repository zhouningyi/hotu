'use strict';
//对UI的总体控制
define(['./../../utils/utils', './../../libs/event'], function(Utils, EventEmitter) {
  var body = $('body');
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;
  var getPt = Utils.getPt;

  function WidthSlider(container, opt) {
    this.initialize(container, opt);
  }

  EventEmitter.extend(WidthSlider, {
    isDisable: false,
    options: {
      lineRadius: 2,
    },
    initialize: function(container, options) {
      this.container = container;
      Utils.merge(this.options, options);
      this.targets = options.targets;
      if(!this.targets) return console.log('widthslider 必须包含targets');
      this.initDom();
      this.on('dom-done', function(){
        this.initEvents();
        this.updateByTarget();
      })
    },
    initDom: function() {
      var container = this.container;
      var self = this;
      var node = this.node = $(
      '<div class="horizontal-selector-desc">' + '粗细' + '</div>\
       <div class="horizontal-selector-container"></div>')
      .appendTo(container);

      var sliderNode = this.sliderNode = container.find('.horizontal-selector-container');
      setTimeout(function(){
        var w = self.sliderW = sliderNode.width(),
        h = self.sliderH = sliderNode.height();
        var ctx = self.ctx = Utils.genCanvas({'container': sliderNode});
        self.emit('dom-done');
      }, 400);
    },
    drawShape: function(percent, color) {
      percent = percent || 1, color = color || 'rgb(60,60,60)';
      var options = this.options;
      var ctx = this.ctx,
        lineRadius = options.lineRadius;
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
      var sliderNode = this.sliderNode;
      var self = this;
      sliderNode.on('touchstart mousedown', function(e) {
          prevent(e);
          if(self.isDisable) return window.infoPanel && infoPanel.alert('这支笔不能调宽度哦');
          self.isDown = true;
          window.global && global.trigger('select-start');
        })
        .on('touchstart mousedown touchmove mousemove', function(e) {
          prevent(e);
          if(self.isDisable) return;
          if (self.isDown) {
            var pt = getPt(e);
            var x = pt[0];
            var width = sliderNode.width();
            var value = x / width;
            if (!isNone(value)) {
              self.ui2Target(value);
            }
          }
        })
        .on('touchend mouseup touchleave', function(e) {
          prevent(e);
          if(self.isDisable) return;
          self.isDown = false;
          window.global && global.trigger('select-end');
        });
    },
    disable: function(){
      this.isDisable = true;
      this.container.css({opacity: 0.2});
    },
    enable: function(){
      this.isDisable = false;
      this.container.css({opacity: 1});
    },
    ui2Target: function(value01) {
      Utils.clean(this.ctx);
      this.drawShape();
      this.drawShape(value01, '#eee');
      var targets = this.targets;
      var control = targets.controls('widthMax'), range = control.range;
      var width = (range[1] - range[0]) * value01 + range[0] * (1 - value01);
      targets.controls('widthMax', width);
    },
    updateByTarget: function() {
      var control = this.targets.controls('widthMax'),
        range = control.range, value = control.value;
      var value01 = (value - range[0]) / (range[1] - range[0]);
      this.ui2Target(value01);
    }
  })
  return WidthSlider;
});