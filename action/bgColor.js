'use strict';

define(['zepto'], function ($) {//'./../utils/exif'
  
  /**
   * BgColor 改变底层背景的颜色
   */
  function BgColor(opt) {
    opt = opt || {};
    this.color = 'hsla(180,100,100,1)';
    this.id = 'bgColor';
    this.name = '背景色';
    this.desc = '';
    this.modelDraw = opt.modelDraw;
    this.controls = {
      'hue': {
        'range': [0, 1],
        'value': 0.3,
        'descUI': '颜色',
        'constructorUI': 'HueSlider',
        'containerName': 'color'
      },
      'lightSat': {
        'range': [{
          'light': 0,
          'sat': 0
        }, {
          'light': 1,
          'sat': 1
        }],
        'value': {
          'light': 1,
          'sat': 0
        },
        'constructorUI': 'LightSatSelector',
        'containerName': 'color'
      }
    };
    this.events();
  }

  BgColor.prototype.set = function (obj) {
    for(var k in obj){
       this[k] = obj[k];
    }
  };

  BgColor.prototype.onStyleChange = function (key) {
    if(key === 'hue' || key === 'lightSat') {
      this.hsla2color();
      this.updateNodeColor();
    } 
  };

  BgColor.prototype.updateNodeColor = function () {
    var self = this;
    this.container.css({
      background: this.color
    });
    setTimeout(function () {
      self.container.trigger('main-color-change', self.color);
    }, 100);

    self.modelDraw.setBg('color', {
      hue: self.controls.hue.value,
      lightSat: self.controls.lightSat.value,
    });

  };

  BgColor.prototype.hsla2color = function () { //默认的hsla转换
    var controls = this.controls;
    if (!controls) return;
    var opacity = controls.opacity ? controls.opacity.value : (this.opacity || 1);
    var hue =  controls.hue ? controls.hue.value : (this.hue || 0.4);
    hue =  hue * 360;
    var lightSat = controls.lightSat ? controls.lightSat.value : (this.lightSat || {sat: 1, light: 1});
    var light = Math.round(lightSat.light * 100);
    var sat = Math.round(lightSat.sat * 100);
    this.color = 'hsla(' + hue + ',' + sat + '%,' + light + '%,' + opacity + ')';
    this.colorShow = 'hsl(' + hue + ',' + sat + '%,' + light + '%)';
    this.colorShowSat = 'hsl(' + hue + ',100%,40%)';
  };

  BgColor.prototype.toImage = function (ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    return ctx;
  };

  BgColor.prototype.events = function () {
  };
  return BgColor;
});