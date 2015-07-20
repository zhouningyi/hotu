'use strict';

define(['./../brush'], function(Brush) {

  function Fatdot(obj) {
    Brush.prototype.init.call(this, obj);
  }

  Brush.extend(Fatdot, {
    'desc': '可爱 画点笔触',
    'name': '点点',
    'id': 'fatdot_v1',
    'fillStyle': 'rgba(255,255,255,1)',
    'strokeStyle': '#000',
    'lineWidth': 1,
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
        'range': [1, 400],
        'value': 150,
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

    addHooks: function () {
      var ctx, x1, y1, r, dl;
      var Easing = this.Easing;
      this
        .on('begin', function () {
          ctx = this.ctx;
          ctx.strokeStyle = this.strokeStyle;
          ctx.fillStyle = this.fillStyle;
          ctx.lineWidth = this.lineWidth;
          ctx.closePath();
        })
        .on('draw', function (record) {
          var color = this.getValue('color');
          if (!record) return;
          var smoothes = record.smoothes;
          var speedK = smoothes.speedK;
          ctx = this.ctx;
          var x = smoothes.x,
            y = smoothes.y,
            xP = smoothes.xP,
            yP = smoothes.yP;
          var widthMax = this.getValue('widthMax');
          if (x && xP && y && yP) {
            speedK = Easing.Sinusoidal.Out(speedK);
            r = this.r = speedK * widthMax;
            var x1 = x * 0.5 + xP * 0.5, y1 = y * 0.5 + yP * 0.5;
            this.drawX = x1, this.drawY = y1;
            this.drawCircle(x1, y1, r);
          }
        })
        .on('end', function () {
          var dis = 6, drawY = this.drawY, drawX = this.drawX, r = this.r;
          for (var k = r - 2 * dis; k >= 0; k -= dis) {
            var r1 =  r * this.Easing.Sinusoidal.InOut(k / r);
            this.drawCircle(drawX, drawY, r1);
          }
          this.r = null, this.drawX = null, this.drawY = null;
        });
    },

    drawCircle: function (x, y, r) {
      var ctx = this.ctx;
      ctx.beginPath();
      ctx.lineWidth = this.lineWidth;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.arc(x, y, r, 0, Math.PI * 2, 1);
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.lineWidth;
      ctx.globalCompositeOperation = 'source-over';
      ctx.arc(x, y, r, 0, Math.PI * 2, 1);
      ctx.stroke();
      ctx.closePath();
    },

    buttonStyle: function(node) {
      node.css({
        'textShadow': '0 0 2px #000',
        'color': '#fff'
      });
    }
  });
  return Fatdot;
});