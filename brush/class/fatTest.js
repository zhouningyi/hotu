'use strict';

define(['./../brush'], function(Brush) {

  function Fatdot(obj) {
    Brush.prototype.init.call(this, obj);
  }

  Brush.extend(Fatdot, {
    'desc': '可爱 画点笔触',
    'name': '漫画',
    'id': 'fatTest',
    // 'fillStyle': 'rgba(0,200,200,1)',
    'rPhi': 5,
    'shadowPhi': 0.6, //阴影和半径的比例
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
    'smoothSpeed': {
      'easing': 'Sinusoidal.In',
      'smoothN': 12
    },
    'controls': {
      'widthMax': {
        'range': [1, 100],
        'value': 30,
        'constructorUI': 'Slider',
        'descUI': '粗细',
        'containerName': 'shape'
      },
      'contrast': {
        'range': [0, 1],
        'value': 0.6,
        'constructorUI': 'Slider',
        'descUI': '对比',
        'containerName': 'color'
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
        .on('begin', function() {
          ctx = this.ctx;
          ctx.shadowColor = 'rgba(40,40,40,1)';
          ctx.shadowBlur = 1;
        })
        .on('draw', function(record) {
          var color = this.getValue('color');
          var contrast = this.getValue('contrast');
          if (!record || !color) return;
          var smoothes = record.smoothes;
          var speedK = smoothes.speedK;
          if(speedK>1) alert(speedK);
          ctx = this.ctx;
          ctx.beginPath();
          var x = smoothes.x,
            y = smoothes.y,
            xP = smoothes.xP,
            yP = smoothes.yP;
          var widthMax = this.getValue('widthMax');
          if (x && xP && y && yP) {
            speedK = Easing.Sinusoidal.Out(speedK);
            r = speedK * widthMax * this.rPhi;
            ctx.shadowOffsetX = r * this.shadowPhi;
            ctx.shadowOffsetY = r * this.shadowPhi;
            ctx.shadowColor = this.offsetColor(color, contrast);
            x1 = x * 0.5 + xP * 0.5, y1 = y * 0.5 + yP * 0.5;
            ctx.fillStyle = color;
            ctx.arc(x1, y1, r, 0, Math.PI * 2, 1);
            ctx.fill();
            ctx.closePath();
          }
        })
        .on('end', function(record) {
          // ctx.stroke();
          ctx.closePath();
        });
    }
  });
  return Fatdot;
});