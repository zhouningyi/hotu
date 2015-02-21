'use strict';

define(function() {
  return {
    'desc': '可爱 画点笔触',
    'name':'点点',
    'initOpt': {
      'id': 'fatdot',
      // 'fillStyle': 'rgba(55,155,155,0.1)',
      'lineWidth': 1,
      'strokeStyle': '#000',
      'globalCompositeOperation': 'source-over',
      'distLimit': 1,
      'maxSize': 8,
    },
    dot: function(ctx, pt, dt) {
      if (pt && dt) {
        ctx.closePath();
        ctx.beginPath();
        var x = pt[0];
        var y = pt[1];
        var r = dt * 10;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    },
    draw: function(opt) {
      var record = opt.record || {};
      var pt = opt.pt;
      var ptPrev = record.ptPrev;
      var self = opt.self;
      var x1, x2, y1, y2;
      if (pt && ptPrev) {
        var dist = record.dist * 0.6 || 0.1;
        var r = (this.r || 1) * dist / 2;
        var maxSize = self.maxSize;
        if (maxSize) r = (r > maxSize) ? maxSize : r;
        var ctx = opt.ctx;
        ctx.closePath();
        x1 = pt[0] * 0.5 + ptPrev[0] * 0.5;
        y1 = pt[1] * 0.5 + ptPrev[1] * 0.5;
        ctx.beginPath();
        ctx.arc(x1, y1, r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    },
    buttonStyle: function(node){
      node.css({
        'textShadow': '0 0 2px #000',
        'color': '#fff'
      });
    }
  };
});
