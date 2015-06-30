'use strict';

define(['./../brush'], function(Brush) {

  function Fatdot(obj) {
    Brush.prototype.init.call(this, obj);
  }

  Brush.extend(Fatdot, {
    'desc': '可爱 画点笔触',
    'name': '点点',
    'id': 'fatdot.v1',
    'fillStyle': 'rgba(255,255,255,1)',
    'lineWidth': 1,
    'strokeStyle': '#000',
    'globalCompositeOperation': 'source-over',
    'smoothX': {
      'easing': 'Sinusoidal.In',
      'smoothN': 9
    },
    'smoothY': {
      'easing': 'Sinusoidal.In',
      'smoothN': 9
    },
    'controls': {
      'widthMax': {
        'range': [1, 100],
        'value': 8,
        'constructorUI': 'Slider',
        'descUI': '粗细',
        'containerName': 'shape'
      }
    },

    addHooks: function() {
      var ctx, x1, y1, r, dl;
      var Easing = this.Easing;
      this
        .on('begin', function() {
          ctx = this.ctx;
          ctx.closePath();
        })
        .on('draw', function (record) {
          if(!record) return;
          var smoothes = record.smoothes;
          var speedK = smoothes.speedK;
          ctx = this.ctx;
          var x = smoothes.x, y = smoothes.y, xP = smoothes.xP, yP = smoothes.yP;
          var widthMax = this.getValue('widthMax');
          if (x && xP && y && yP) {
            speedK = Easing.Sinusoidal.Out(speedK);
            r = speedK  * widthMax;
            x1 = x * 0.5 + xP * 0.5, y1 = y * 0.5 + yP * 0.5;
            ctx.fillStyle = this.fillStyle;
            ctx.beginPath();
            ctx.arc(x1, y1, r * 5, 0, Math.PI * 2, 1);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
          }
        });
    },

    // dot: function(ctx, pt, dt) {
    //   if (pt && dt) {
    //     // var x = pt[0];
    //     // var y = pt[1];
    //     // var r = dt * 10;
    //     // ctx.arc(x, y, r, 0, Math.PI * 2);
    //     // ctx.fill();
    //     // ctx.stroke();
    //   }
    // },
    buttonStyle: function(node) {
      node.css({
        'textShadow': '0 0 2px #000',
        'color': '#fff'
      });
    }
  });
  return Fatdot;
});