'use strict';

define(['./../brush', './../../utils/utils'], function(Brush, Utils) {

  function Fatdot(obj) {
    Brush.prototype.init.call(this, obj);
  }

  Brush.extend(Fatdot, {
    'desc': '~',
    'name': '草间',
    'id': 'caojian',
    'fillStyle': 'rgba(255,255,255,1)',
    'strokeStyle': '#000',
    'lineWidth': 1,
    'globalCompositeOperation': 'source-over',
    'smoothX': {
      'easing': 'Sinusoidal.In',
      'smoothN': 3
    },
    'smoothY': {
      'easing': 'Sinusoidal.In',
      'smoothN': 3
    },
    'controls': {
      'widthMax': {
        'range': [1, 100],
        'value': 30,
        'constructorUI': 'Slider',
        'descUI': '粗细',
        'containerName': 'shape'
      },
      'hue': {
        'range': [0, 1],
        'value': 0.5,
        'descUI': '颜色',
        'constructorUI': 'HueSlider',
        'containerName': 'color'
      },
      'opacity': {
        'range': [0, 1],
        'value': 0.5,
        'constructorUI': 'Slider',
        'descUI': '透明',
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
          'light': 0.4,
          'sat': 0.9
        },
        'constructorUI': 'LightSatSelector',
        'containerName': 'color'
      }
    },

    addHooks: function() {
      var ctx, x1, y1, r, dl;
      var Easing = this.Easing;
      this
        .on('begin', function() {
          ctx = this.ctx;
          ctx.strokeStyle = this.strokeStyle;
          ctx.fillStyle = this.fillStyle;
          ctx.lineWidth = this.lineWidth;
          ctx.lineCap = 'butt'
          ctx.closePath();
        })
        .on('draw', function(record) {
          var color = this.getValue('color');
          if (!record) return;
          var smoothes = record.smoothes;
          var speedK = smoothes.speedK;
          var dx = smoothes.dx;
          var dy = smoothes.dy;
          ctx = this.ctx;
          var x = smoothes.x,
            y = smoothes.y,
            xP = smoothes.xP,
            yP = smoothes.yP;
          var widthMax = this.getValue('widthMax');
          if (x && xP && y && yP) {
            speedK = Easing.Sinusoidal.Out(speedK);
            var l = Math.sqrt(dy * dy + dx * dx);
            var cos, sin;
            var cosp = this.cos || dy / l;
            var sinp = this.sin || -dx / l;
            if (l) {
              cos = this.cos = dy / l;
              sin = this.sin = -dx / l;
            }
            var ki = Easing.Sinusoidal.In(1 - speedK);
            ki = Math.pow(ki, 5);
            r = ki * widthMax;
            this.createPencil(xP, yP, x, y, color, ki, r);
          }
        })
        .on('end', function (record) {
          this.cos = null;
          this.sin = null;
        });
    },

    createPencil: function (sx, sy, tx, ty, color, speedK, width) {
      var ctx = this.ctx;
      var dx = tx - sx,
        dy = ty - sy;
      var dis = Math.sqrt(dx * dx + dy * dy);
      var cos = dx / dis;
      var sin = dy / dis;
      if (!ctx) return;
      for (var k = 0; k < 1; k += 1 / dis) {
        var x = sx + k * dx;
        var y = sy + k * dy;
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        var xf = x + Math.cos(speedK * 100 * k) * width;
        var yf = y + Math.cos(speedK * 1001 * k) * width;
        var xt = xf + cos * 3, yt = yf + sin * 3;
        ctx.moveTo(xf, yf);
        ctx.lineTo(xt, yt);
        ctx.stroke();
        ctx.closePath();
      }
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