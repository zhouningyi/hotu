'use strict';

define(['./../action', './../../utils/utils'], function(Action, Utils) { //'./../utils/exif'

  /**
   * Bg 改变底层背景的颜色
   */
  function bgColor(options) {
    this.initialize(options);
  }

  Action.extend(bgColor, {
    color: 'hsla(180,100,100,1)',
    id: 'bgColor',
    key: 'color',
    name: '背景色',
    desc: '',
    options: {},
    controls: {
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
    },
    update: function () {
      var ctx = this.ctx;
      ctx.fillStyle = this.getValue('color');
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      window.global && global.trigger('main-color-change', this.color);
    }
  });

  return bgColor;
});