'use strict';
//发光笔触
// 'lineCap': 'round',
// 'lineJoin': 'miter',
define(['./../brush'], function(Brush) {
var max = Math.max, cos = Math.cos, sin = Math.sin, atan2 = Math.atan2, min = Math.min, pow = Math.pow, sqrt = Math.sqrt;
function Mark(obj){
  this.init(obj);
}

 Brush.extend(Mark, {
  init: function(obj){
    Brush.prototype.init.call(this, obj);
  },
    'id': 'brush_base_round',
    'globalCompositeOperation': 'source-over',
    'lineJoin': 'butt',
    'lineCap': 'square',
    'smooth': {
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
      this
        .on('begin', function() {
          ctx = this.ctx;
        })
        .on('draw', function(record) {
          if (!record) return console.log('record不存在');
          var color = this.getValue('color');
          if (!color) return console.log('normal brush 没有颜色');
          //原始的变量
          var pt =        record.pt;
          var speed =     record.speed; //速度
          var speedK =    record.speedK;
          var smoothes =  record.smoothes;
          //经过光滑的变量
          var x =      smoothes.x;
          var xp =     smoothes.xP;
          var y =      smoothes.y;
          var yp =     smoothes.yP;
          var kCurve = smoothes.kCurve;
          var dx     = smoothes.dx;
          var dy     = smoothes.dy;
          var dPhi   = smoothes.dPhi;
          // console.log(kCurve,x,xp)

          var ki = Easing.Sinusoidal.In(1 - speedK);
          ki = pow(ki, 2);
          var kFinal = max(this.addAndGetSmooth('width', ki).value, 0);
          var width = max(widthMax * kFinal, 1);
          var widthP = this.widthP;
          this.widthP = this.width;
          this.width = width;

          if (xp !== null && xp !== undefined && yp !== null && yp !== undefined) {
            var l = sqrt(dy * dy + dx * dx);
            var cos, sin;

            if (l) {
              this.cosP = this.cos;
              this.sinP = this.sin;
              cos = this.cos = dy / l;
              sin = this.sin = -dx / l;
            }

            var p1xP = this.p1x, p1yP = this.p1y, p2xP = this.p2x, p2yP = this.p2y;
            var p1x = this.p1x = x - width * cos;
            var p1y = this.p1y = y - width * sin;
            var p2x = this.p2x = x + width * cos;
            var p2y = this.p2y = y + width * sin;

            if (p1xP && p2xP) {
              ctx.beginPath();
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              // ctx.fillStyle = 'rgba(0,0,0,'+dPhi+')';
              ctx.moveTo(x, y);
              ctx.lineTo(p1x, p1y);
              ctx.lineTo(p1xP, p1yP);
              ctx.lineTo(p2xP, p2yP);
              ctx.lineTo(p2x, p2y);
              ctx.lineTo(x, y);
              ctx.fill();
              // ctx.stroke();
              ctx.closePath();
            }
          }
        })
        .on('second', function (record) {
          var smoothes = record.smoothes;
          var color = this.getValue('color');
          if (!color) return console.log('normal brush 没有颜色');
          var widthP = this.widthP;
          var xp = smoothes.xP;
          var yp = smoothes.yP;
          var dx = smoothes.dx;
          var dy = smoothes.dy;
          var reverseBol = 0, e = 0.00000001;
          if (dx >= e) {
            reverseBol = 1;
          } else if (Math.abs(dx) < e && dy < 0) {
            reverseBol = 1;
          }
          var phiHori = Math.atan2(this.sinP, this.cosP);
          if (phiHori >= 0) {
            phiHori = phiHori - Math.PI;
          }
          ctx.save();
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.arc(xp, yp, widthP, phiHori, phiHori + Math.PI, reverseBol);
          ctx.fill();
         
          ctx.closePath();
          ctx.restore();
        })
        .on('end', function () {
          if(!this.record || !this.record.smoothes) return;
          this.drawDot(this.record.smoothes);
          this.widthP = null;
          this.width = null;
          this.p1x = null;
          this.p1y = null;
          this.p2x = null;
          this.p2y = null;
          this.cosP = null;
          this.sinP = null;
          this.sin = null;
          this.cos = null;
        })
        .on('style-change', function() {
          this.hsla2color(); //更新颜色
        });
    },
    drawDot: function(smoothes) {
      var color = this.getValue('color');
      var ctx = this.ctx;
      if (!color) return console.log('normal brush 没有颜色');
      var widthP = this.widthP;
      var x = smoothes.x;
      var y = smoothes.y;
      var dx = smoothes.dx;
      var dy = smoothes.dy;
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
      ctx.arc(x, y, widthP, phiHori, phiHori + Math.PI, reverseBol);
      ctx.fill();
      ctx.closePath();
    },
    buttonStyle: function(node) {
      node.css({
        'textShadow': '0 0 9px #707',
        'color': '#f9f'
      });
    }
  });
  return Mark;
});