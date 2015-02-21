'use strict';

define(function() {
  return {
    desc: '瘦的线条，连续 柔化',
    name:'细线',
    initOpt: {
      'id': 'thin',
      'globalCompositeOperation': 'lighter',
      'strokeStyle': 'rgba(0,0,0,1)', // ;
      'lineJoin': 'miter',
      'lineCap': 'round',
      'lineWidth': 1,
      'maxSize': 1,
    },
    'draw': function(opt) {
      var self = opt.self;
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = opt.ctx;
      ctx.lineWidth = self.maxSize;
      ctx.lineTo(pt[0], pt[1]);
      ctx.stroke();
    },
    buttonStyle: function(node){
      node.css({
        'textShadow': '0 0 2px #000',
        'color': '#fff'
      });
    }
  };
});
