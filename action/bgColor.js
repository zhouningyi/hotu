'use strict';

define([], function () {//'./../utils/exif'
  
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


  //   Painter.prototype.grid = function () { //米字格
  //   var containerW = this.containerW;
  //   var containerH = this.containerH;
  //   var phi = 0.12;
  //   var offset = containerW * phi;
  //   var p1 = [offset, offset];
  //   var p2 = [containerW - offset, offset];
  //   var p3 = [containerW - offset, containerH - offset];
  //   var p4 = [offset, containerH - offset];

  //   var p12 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  //   var p23 = [(p2[0] + p3[0]) / 2, (p2[1] + p3[1]) / 2];
  //   var p34 = [(p3[0] + p4[0]) / 2, (p3[1] + p4[1]) / 2];
  //   var p41 = [(p4[0] + p1[0]) / 2, (p4[1] + p1[1]) / 2];

  //   var ctx = this.ctxMainBack;
  //   ctx.strokeStyle = '#f00';
  //   ctx.lineWidth = 3;
  //   ctx.beginPath();
  //   ctx.moveTo(p1[0], p1[1]);
  //   ctx.lineTo(p2[0], p2[1]);
  //   ctx.lineTo(p3[0], p3[1]);
  //   ctx.lineTo(p4[0], p4[1]);
  //   ctx.lineTo(p1[0], p1[1]);
  //   ctx.stroke();
  //   //+线
  //   ctx.strokeStyle = 'rgba(200,0,0,0.5)';
  //   ctx.lineWidth = 2;
  //   ctx.moveTo(p12[0], p12[1]);
  //   ctx.lineTo(p34[0], p34[1]);
  //   ctx.moveTo(p23[0], p23[1]);
  //   ctx.lineTo(p41[0], p41[1]);
  //   ctx.stroke();
  //   //斜线
  //   ctx.strokeStyle = 'rgba(200,0,0,0.3)';
  //   ctx.lineWidth = 1;
  //   ctx.beginPath();
  //   ctx.moveTo(p1[0], p1[1]);
  //   ctx.lineTo(p3[0], p3[1]);
  //   ctx.moveTo(p2[0], p2[1]);
  //   ctx.lineTo(p4[0], p4[1]);
  //   ctx.stroke();
  //   ctx.closePath();
  // };
  return BgColor;
});