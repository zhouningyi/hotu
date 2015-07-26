'use strict';
//对UI的总体控制
define(['./../../utils/utils', './../../libs/event'], function(Utils, Events) {
  var body = $('body');
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;
  var getPt = Utils.getPt;

  function Slider(container, options) {
    this.initialize(container, options);
  }

  Events.extend(Slider, {
    isDisable: false,
    options: {},
    initialize: function(container, options) {
      this.container = container;
      this.targets = options.targets;
      if(!this.targets) return console.log('必须有targets变量');
      this.key = options.key
      this.initDom();
      this.initEvents();
      this.updateByTarget();
    },
    initDom: function() {
      var descUI = this.targets.controls(this.key).descUI;
      var node = this.node = $(
      '<div class="slider-container">\
        <div class="slider-line"></div>\
        <div class="slider-pointer"></div>\
      </div>\
      <div class="slider-container-desc">' + descUI + '</div>\
      ')
        .appendTo(this.container);
      this.lineW = node.find('.slider-line').width();
      var pNodeW = this.pNodeW = node.find('.slider-pointer').width();
      var left = Math.floor(this.value * this.lineW);
      node.find('.slider-pointer').css({
        'left': left - pNodeW / 2
      });
    },
    initEvents: function() {
      var node = this.node;
      var self = this;
      node.on('touchstart mousedown', function(e) {
          prevent(e);
          if(self.isDisable) return window.infoPanel && infoPanel.alert('这支笔不能调透明度哦');
          self.isDown = true;
          window.global && global.trigger('select-start', self.targets.current());
        })
        .on('touchend mouseup', function(e) {
          prevent(e);
          if(self.isDisable);
          self.isDown = false;
          window.global && global.trigger('select-end');
        })
        .on('touchstart mousedown touchmove mousemove', function(e) {
          prevent(e);
          if(self.isDisable) return;
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
    },
    ui2Target: function(value01) {
      this.node.find('.slider-pointer').css({
        'left': value01 * this.lineW - this.pNodeW / 2
      });
      var control = this.targets.controls(this.key)
      var range = control.range;
      this.targets.controls(this.key, (range[1] - range[0]) * value01 + range[0] * (1 - value01))
    },
    updateByTarget: function() {
      var control = this.targets.controls(this.key);
      var range = control.range, value = control.value;
      var value01 = (value - range[0]) / (range[1] - range[0]);
      this.ui2Target(value01);
    },
    disable: function(){
      this.isDisable = true;
      this.container.css({opacity: 0.2});
    },
    enable: function(){
      this.isDisable = false;
      this.container.css({opacity: 1});
    }
  });

  return Slider;
});