'use strict';
//发光笔触
// 'lineCap': 'round',
// 'lineJoin': 'miter',
define(['./brush_base_round'], function(Mark) {
  function Eraser(obj) {
    this.init(obj);
  }
  Mark.extend(Eraser, {
    init: function(obj) {
      Mark.prototype.init.call(this, obj);
    },
    'id': 'eraser_v1',
    'name': '橡皮',
    'desc': '橡皮工具',
    'color': '#fff',
    'globalCompositeOperation': 'destination-out',
    'controls': {
      'widthMax': {
        'range': [1, 50],
        'value': 8,
        'constructorUI': 'Slider',
        'descUI': '粗细',
        'containerName': 'shape'
      },
      'opacity': {
        'range': [0, 1],
        'value': 0.5,
        'constructorUI': 'Slider',
        'descUI': '透明',
        'containerName': 'color'
      }
    },
  });
  return Eraser;
});