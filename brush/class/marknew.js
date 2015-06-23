'use strict';
//发光笔触
// 'lineCap': 'round',
// 'lineJoin': 'miter',
define(['./../../utils/utils', './../brush'], function(Utils, Brush) {
  var hsla2obj = Utils.hsla2obj;

  // function Mark(){
  // };

  var Mark = Brush.extend(Brush, {
    'redraw': false,
    'id': 'mark',
    'name': '马克笔',
    'desc': '常用笔 圆头 可以选择透明度',
    'globalCompositeOperation': 'source-over',
    'lineJoin': 'butt',
    'lineCap': 'square',
    'distLimit': 5,
    'smooth': {
      'x': {
        'easing': 'Sinusoidal.In',
        'smoothN': 6
      },
      'y': {
        'easing': 'Sinusoidal.In',
        'smoothN': 6
      },
      'width': {
        'easing': 'Sinusoidal.Out',
        'smoothN': 8
      }
    },
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
      var controls = this.controls;
      var Easing = this.Easing;
      var widthMax = this.widthMax || controls.widthMax.value;
      var ctx = this.ctx;
      var max = Math.max, cos = Math.cos, sin = Math.sin, atan2 = Math.atan2, min = Math.min, pow = Math.pow, sqrt = Math.sqrt;

      this
        .on('begin', function(record) {
          ctx = this.ctx;
        })
        .on('draw', function(record) {
          if (!record) return console.log('record不存在');
          var color = this.color;
          if (!color) return console.log('normal brush 没有颜色');

          var pt = record.pt;
          var speed = record.speed; //速度
          var speedK = record.speedK;

          var ki = Easing.Sinusoidal.In(1 - speedK);
          ki = pow(ki, 2);
          var kFinal = max(this.addAndGetSmooth('width', ki).value, 0);
          var widthPrev = this.widthPrev || width;
          var width = max(widthMax * kFinal, 1);
          
          var yp = this.yp, xp = this.xp;
          var xSmooth = this.addAndGetSmooth('x', pt[0]);
          var x = this.xp = xSmooth.value;
          var ySmooth = this.addAndGetSmooth('y', pt[1]);
          var y = this.yp = ySmooth.value;

          if(xSmooth.valueP && xSmooth.valuePP && xSmooth.value){
            var kCurve = Utils.getCurvatureBy3Pt(xSmooth.valuePP, ySmooth.valuePP, xSmooth.valueP, ySmooth.valueP, xSmooth.value, ySmooth.value);
            console.log(kCurve);
          }


          if (xp !== null && xp !== undefined && yp !== null && yp !== undefined) {
            var dx = this.dx = x - xp;
            var dy = this.dy = y - yp;
            var l = sqrt(dy * dy + dx * dx);
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

              var p1x = xp + widthPrev * cosp;
              var p1y = yp + widthPrev * sinp;
              var p2x = xp - widthPrev * cosp;
              var p2y = yp - widthPrev * sinp;
              var p3x = x - width * cos;
              var p3y = y - width * sin;
              var p4x = x + width * cos;
              var p4y = y + width * sin;

              ctx.beginPath();
              ctx.fillStyle = color;
              ctx.fillStyle = 'rgba(0,0,0,' + (record.kCurve * 2) + ')';
              ctx.strokeStyle = color;
              ctx.moveTo(xp, yp);
              ctx.lineTo(p1x, p1y);
              ctx.lineTo(p4x, p4y);
              ctx.lineTo(p3x, p3y);
              ctx.lineTo(p2x, p2y);
              ctx.lineTo(xp, yp);
              ctx.fill();
              // ctx.stroke();
              ctx.closePath();
            }
            this.cosp = cos;
            this.sinp = sin;
          }

          this.widthPrev = width;
          this.yp = y;
          this.xp = x;
        })
        .on('second', function () {

        })
        .on('second', function (record) {
          var color = this.color;
          if (!color) return console.log('normal brush 没有颜色');
          var ctx = this.ctx;
          this.secondBol = false;
          var widthPrev = this.widthPrev;
          var xp = this.xp;
          var yp = this.yp;
          var dx = this.dx;
          var dy = this.dy;
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
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.arc(xp, yp, widthPrev, phiHori, phiHori + Math.PI, reverseBol);
          ctx.fill();
          ctx.closePath();
        })
        .on('end', function () {
          var color = this.color;
          if (!color) return console.log('normal brush 没有颜色');
          var widthPrev = this.widthPrev;
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
          ctx.fillStyle = color;
          ctx.arc(x, y, widthPrev, phiHori, phiHori + Math.PI, reverseBol);
          ctx.fill();
          ctx.closePath();

          this.widthPrev = null;
          this.yp = null;
          this.xp = null;
          this.cosp = null;
          this.sinp = null;
        })
        .on('style-change', function() {
          this.hsla2color(); //更新颜色
        });
    },
    buttonStyle: function(node) {
      node.css({
        'textShadow': '0 0 9px #707',
        'color': '#f9f'
      });
    }
  });

console.log(Brush, Mark)

  return Mark;
});