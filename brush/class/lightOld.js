'use strict';
//发光笔触
// 'lineCap': 'round',
// 'lineJoin': 'miter',
define(function() {
  return {
    initOpt: {
      'id': 'light',
      'name': '光绘',
      'desc': '发光笔触',
      'globalCompositeOperation': 'lighter',
      'lineJoin': 'miter',
      'lineCap': 'butt',
      'drawNMax': 8,
      'smooth': {
        'x': {
          'f': 'Sinusoidal.In',
          'N': 6
        },
        'y': {
          'f': 'Sinusoidal.In',
          'N': 6
        },
        'width': {
          'f': 'Sinusoidal.Out',
          'N': 8
        }
      },
      'controls': {
        'widthMax': {
          'range': [1, 20],
          'value': 10,
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
        }
      }
    },
    addHooks: function() {
      var controls = this.controls;
      var Easing = this.Easing;
      var widthMax = this.widthMax || controls.widthMax.value;
      var ctx = this.ctx;
      this
        .on('begin', function() {
          ctx = this.ctx;
          this.initScaleList();
        })
        .on('second', function(record) {
          if(!record) return;
          var widthP = this.widthP;
          var scaleList = this.scaleList;
          var xp = record.xp;
          var yp = record.yp;
          var dx = record.dx;
          var dy = record.dy;
          var reverseBol = 0;
          var e = 0.00000001;
          if (dx >= e) {
            reverseBol = 1;
          } else if (Math.abs(dx) < e && dy < 0) {
            reverseBol = 1;
          }
          var phiHori = Math.atan2(this.sinp, this.cosp);
          if (phiHori >= 0) {
            phiHori = phiHori - Math.PI;
          }
          for (var k in scaleList) {
            var obj = scaleList[k];
            ctx.beginPath();
            ctx.fillStyle = obj.fillStyle;
            ctx.arc(xp, yp, widthP * obj.widthPhi, phiHori, phiHori + Math.PI, reverseBol);
            ctx.fill();
            ctx.closePath();
          }
        })
        .on('draw', function(record) {
          var drawN = this.drawN; //要描边几次
          var controls = this.controls;
          var widthMax = controls.widthMax.value;
          var Easing = this.Easing;
          var record = opt.record || {};
          var pt = opt.pt || {};
          var ctx = opt.ctx;
          var speed = record.speed || 3; //速度

          var speedK = record.speedK;
          var ki = Easing.Sinusoidal.In(1 - speedK);
          ki = Math.pow(ki, 2);
          var kFinal = this.getSmooth('width', ki);
          kFinal = (kFinal < 0) ? 0 : kFinal;

          var width = widthMax * kFinal;
          width = (width < 1) ? 1 : width;
          var widthP = this.drawN || width;

          var x = pt[0];
          x = this.getSmooth('x', x);
          var y = pt[1];
          y = this.getSmooth('y', y);

          var xp = this.xp;
          var yp = this.yp;
          if (xp !== null && xp !== undefined && yp !== null && yp !== undefined) {
            var dx = this.dx = x - xp;
            var dy = this.dy = y - yp;
            var l = Math.sqrt(dy * dy + dx * dx);
            var cos, sin;

            if (l) {
              cos = this.cos = dy / l;
              sin = this.sin = -dx / l;
            }
            var cosp = this.cosp;
            var sinp = this.sinp;

            if (cosp !== undefined && cosp !== null && sinp !== undefined && sinp !== null) {
              if (this.secondBol) {
                this.second(opt);
              }
              var scaleList = this.scaleList;
              ctx.beginPath();
              for (var i = 1; i < drawN; i++) {
                var obj = scaleList[i];
                var widthPhi = obj.widthPhi;
                var p1x = xp + widthP * cosp * widthPhi;
                var p1y = yp + widthP * sinp * widthPhi;
                var p2x = xp - widthP * cosp * widthPhi;
                var p2y = yp - widthP * sinp * widthPhi;
                var p3x = x - width * cos * widthPhi;
                var p3y = y - width * sin * widthPhi;
                var p4x = x + width * cos * widthPhi;
                var p4y = y + width * sin * widthPhi;
                ctx.fillStyle = obj.fillStyle;
                ctx.moveTo(xp, yp);
                ctx.lineTo(p1x, p1y);
                ctx.lineTo(p4x, p4y);
                ctx.lineTo(p3x, p3y);
                ctx.lineTo(p2x, p2y);
                ctx.lineTo(xp, yp);
                ctx.fill();
              }
              ctx.closePath();
            }
            this.cosp = cos;
            this.sinp = sin;
          }

          this.widthP = width;
          this.yp = y;
          this.xp = x;
        });
    },
    initScaleList: function() {
      var controls = this.controls;
      var widthMax = controls.widthMax.value;
      var hue = Math.floor(controls.hue.value * 360);
      this.secondBol = true;
      var scaleList = this.scaleList = [];
      var drawN = this.drawN = Math.min(Math.floor(widthMax / 1.5) + 1, this.drawNMax);
      for (var i = 0; i < drawN; i++) {
        var ii = i / (drawN - 1);
        var dii = Math.pow(1 - ii, 0.5);
        ii = Math.pow(ii, 3);
        var saturation = parseInt(70 + ii * 30);
        var lightness = parseInt(70 - ii * 50);
        var opacity = dii * 0.9;
        scaleList.push({
          'fillStyle': 'hsla(' + hue + ',' + saturation + '%,' + lightness + '%,' + opacity + ')',
          'widthPhi': ii
        });
      }
    },

    end: function() {
      var ctx = this.ctx;
      this.secondBol = false;
      var widthP = this.widthP;
      var scaleList = this.scaleList;
      var x = this.xp;
      var y = this.yp;
      var dx = this.dx;
      var dy = this.dy;
      var reverseBol = 1;
      var e = 0.00000001;
      if (dx >= e) {
        reverseBol = 0;
      } else if (Math.abs(dx) < e && dy < 0) {
        reverseBol = 0;
      }
      var phiHori = Math.atan2(this.sin, this.cos);
      if (phiHori >= 0) {
        phiHori = phiHori - Math.PI;
      }

      ctx.beginPath();
      for (var k in scaleList) {
        var obj = scaleList[k];
        ctx.fillStyle = obj.fillStyle;
        ctx.arc(x, y, widthP * obj.widthPhi, phiHori, phiHori + Math.PI, reverseBol);
        ctx.fill();
      }
      ctx.closePath();

      this.widthP = null;
      this.yp = null;
      this.xp = null;
      this.cosp = null;
      this.sinp = null;

    },
    buttonStyle: function(node) {
      node.css({
        'textShadow': '0 0 9px #707',
        'color': '#f9f'
      });
    }
  };
});