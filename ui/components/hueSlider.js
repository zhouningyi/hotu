'use strict';
//对UI的总体控制
define(['./../../utils/utils', './../../libs/event'], function(Utils, EventEmitter) {
  var body = $('body');
  var isNone = Utils.isNone;
  var upper = Utils.upper;
  var prevent = Utils.prevent;
  var getPt = Utils.getPt;


  function HueSlider(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(HueSlider, {
    options: {},
    isable: false,
    initialize: function(container, options) {
      this.container = container;
      options = Utils.merge(this.options, options);
      this.targets = options.targets;
      if (!options.targets) return console.log('hueslider 必须包含targets');
      var key = this.key = 'hue';
      if (!this.targets.controls(key)) return;
      
      this.initDom();
      this.initEvents();
      this.updateByTarget();
    },
    initDom: function() {
      var node = this.node = $(
      '<div class="hue-slider-container">\
        <div class="hue-slider-line"></div>\
      </div>')
        .appendTo(this.container);
      this.hueSliderLine = node.find('.hue-slider-line');
      this.initGradient();
    },
    disable: function(){
      this.node.css({
        'pointer-events':'none'
      });
      this.isable = false;
    },
    enable: function(){
      this.node.css({
        'pointer-events':'auto'
      });
      this.updateByTarget();
      this.isable = true;
    },
    initEvents: function() {
      var node = this.node;
      var self = this;
      node.on('touchstart mousedown', function(e) {
        if(!self.isable) return;
          prevent(e);
          self.isDown = true;
          window.global && global.trigger('select-start', self.targets.current());
        })
        .on('touchend mouseup touchleave mouseout', function(e) {
          if(!self.isable) return;
          prevent(e);
          self.isDown = false;
          window.global && global.trigger('select-end');
        })
        .on('touchstart mousedown touchmove mousemove', function(e) {
          if(!self.isable) return;
          prevent(e);
          if (self.isDown) {
            var pt = getPt(e);
            var x = pt[0];
            self.ui2Target(x / node.width());
            self.emit('change');
          }
        });
    },
    initGradient: function(){
      var hueSliderLine = this.hueSliderLine;
      var width = this.gridW  = Math.max(hueSliderLine.width(),1), height = this.gridH = Math.max(hueSliderLine.height(), 1);
      var canvas = $('<canvas width="'+width+'" height="'+height+'"></canvas>').appendTo(hueSliderLine);
      var ctx = this.ctx = canvas[0].getContext('2d');

      var gridX = 15//Math.floor(width / Math.round(width / height)); //让其格子的个数为整数
      var gridY = Math.floor(height / Math.round(height / height));

      var hue, yi;
      for (var x = 0; x < width; x += gridX) {
        hue = Math.floor(x / width * 360);
        ctx.fillStyle = 'hsl(' + hue + ',90%,50%)';
        ctx.fillRect(x, 0, gridX - 2, gridY);
      }
    },
    renderGradient: function(hue01){
      var ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      var height = this.gridH, width = this.gridW;

      var gridX = 10//Math.floor(width / Math.round(width / height)); //让其格子的个数为整数
      var gridY = Math.floor(height / Math.round(height / height));

      var hue, yi;
      ctx.globalCompositeOperation = 'source-over';
      for (var x = 0; x < width; x += gridX) {
        var percent = x / width;
        var k = Math.abs(hue01 - percent);
        var pp = Math.pow(1 - k, 4);
        hue = Math.floor(x / width * 360);
        var dh = height * (1-pp);
        ctx.fillStyle = 'hsla(' + hue + ',90%,50%,1)';
        ctx.fillRect(x, 0 , gridX*pp*1.5 , height);
      }
      ctx.globalCompositeOperation = 'destination-out';
      var cx = width * hue01;
      var triw = 20;
      var trih = 10;
      ctx.beginPath();
      ctx.moveTo(cx - triw/2, 0);
      ctx.lineTo(cx + triw/2, 0);
      ctx.lineTo(cx, trih);
      ctx.moveTo(cx - triw/2, 0);
      ctx.fill();
      ctx.closePath();
    },
    updateByTarget: function() {
      var control = this.targets.controls('hue');
      if(!control) return;
      this.ui2Target(control.value);
    },
    ui2Target: function(hue01) {
      this.renderGradient(hue01);
      var targets = this.targets;
      var container = this.container;
      var control = targets.controls('hue'), range = control.range;
      targets.controls('hue', (range[1] - range[0]) * hue01 + range[0] * (1 - hue01));
      body.trigger('preview' + '-' + this.targetName);
      body.trigger('update' + '-' + 'hue' + this.targetName);
    }
  });

  return HueSlider;
});