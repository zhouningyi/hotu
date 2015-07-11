'use strict';

define(['./../brush'], function(Brush) {

  function Fatdot(obj) {
    Brush.prototype.init.call(this, obj);
  }

  Brush.extend(Fatdot, {
    'desc': '~',
    'name': '排线',
    'id': 'fatLines',
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
            r = widthMax;
            var l = Math.sqrt(dy * dy + dx * dx);
            var cos, sin;
            var cosp = this.cos || dy / l;
            var sinp = this.sin || -dx / l;
            if (l) {
            cos = this.cos = dy / l;
            sin = this.sin = -dx / l;
            }
            for(var k = 0; k < r; k+= 6){
              var xfrom = xP + cosp * k;
              var yFrom = yP + sinp * k;
              var xTo = x + cos * k;
              var yTo = y + sin * k;
              this.createLine(xfrom, yFrom, xTo, yTo, color);
              var xfrom = xP - cosp * k;
              var yFrom = yP - sinp * k;
              var xTo = x - cos * k;
              var yTo = y - sin * k;
              this.createLine(xfrom, yFrom, xTo, yTo, color);
            }
          }
      })
      .on('end', function(record) {
        this.cos = null;
        this.sin = null;
      });
    },

    createLine: function (xfrom, yFrom, xTo, yTo, color) {
      // xfrom += Math.random()*2, yFrom += Math.random()*2, xTo += Math.random()*2, yTo += Math.random()*2
      var ctx = this.ctx;
      if (!ctx) return;
      // var cx = xfrom + 2 * Math.cos(xfrom);
      // var cy = yFrom + 2 * Math.cos(yFrom);
      // var tx = xTo - 2 * Math.cos(xTo);
      // var ty = yTo - 2 * Math.cos(yTo);
      ctx.beginPath();
      ctx.lineWidth = this.lineWidth * 6;
      ctx.moveTo(xfrom,  yFrom);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = '#fff';
      // ctx.bezierCurveTo(cx, cy, tx, ty, xTo, yTo);
      ctx.lineTo(xTo,  yTo);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.lineWidth = this.lineWidth;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.moveTo(xfrom, yFrom);
      ctx.lineTo(xTo, yTo);
      // ctx.bezierCurveTo(cx, cy, tx, ty, xTo, yTo);
      ctx.stroke();
      ctx.closePath();
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