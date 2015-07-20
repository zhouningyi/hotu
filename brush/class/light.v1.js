'use strict';
//发光笔触
// 'lineCap': 'round',
// 'lineJoin': 'miter',
define(['./brush_base_round'], function(BrushBase) {
  var max = Math.max,
    cos = Math.cos,
    sin = Math.sin,
    atan2 = Math.atan2,
    min = Math.min,
    pow = Math.pow,
    sqrt = Math.sqrt;

  function Mark(obj) {
    this.init(obj);
  }

  BrushBase.extend(Mark, {
    init: function(obj) {
      BrushBase.prototype.init.call(this, obj);
    },
    'id': 'light',
    'drawNMax': 10,
    'name': '发光',
    'desc': '发光笔 适合暗色场景',
    'globalCompositeOperation': 'lighter',
    'lineJoin': 'butt',
    'lineCap': 'square',
    'smooth': {
      'width': {
        'easing': 'Sinusoidal.Out',
        'smoothN': 8
      }
    },
    'smoothY': {
      'easing': 'Sinusoidal.In',
      'smoothN': 8
    },
    'smoothX': {
      'easing': 'Sinusoidal.In',
      'smoothN': 8
    },
    'controls': {
      'widthMax': {
        'range': [1, 50],
        'value': 8,
        'constructorUI': 'WidthSlider',
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
      var widthMax;
var iindex = 0;
      var ctx = this.ctx;
      this
        .on('begin', function () {
          this.resetValues();
          ctx = this.ctx;
          ctx.globalCompositeOperation = 'lighter';
          widthMax = controls.widthMax.value;
          this.initScaleList();
          iindex = 0;
        })
        .on('draw', function (record) {
          iindex++;
          if (!record) return console.log('record不存在');
          var color = this.getValue('color');
          if (!color) return console.log('normal brush 没有颜色');
          var drawN = this.drawN; //要描边几次
          //原始的变量
          var pt = record.pt;
          var speed = record.speed; //速度
          var speedK = record.speedK;
          var smoothes = record.smoothes;
          //经过光滑的变量
          var x = this.x = smoothes.x;
          var xp = this.xp = smoothes.xP;
          var y = this.y = smoothes.y;
          var yp = this.yp = smoothes.yP;
          var kCurve = smoothes.kCurve;
          var dx = this.dx = smoothes.dx;
          var dy = this.dy = smoothes.dy;
          var dPhi = smoothes.dPhi;

          var ki = Easing.Sinusoidal.In(1 - speedK);
          ki = pow(ki, 2);
          var kFinal = max(this.addAndGetSmooth('width', ki).value, 0);
          var width = max(widthMax * kFinal, 1);
          var widthP = this.widthP;
          this.width = width;
          var cos, sin;

          if (xp !== null && xp !== undefined && yp !== null && yp !== undefined) {
            var l = sqrt(dy * dy + dx * dx);
            if (l) {
              cos = this.cos = dy / l;
              sin = this.sin = -dx / l;
            }

            var cosp = this.cosp;
            var sinp = this.sinp;

            if (cosp !== undefined && cosp !== null && sinp !== undefined && sinp !== null) {
              var scaleList = this.scaleList;

              for (var i in scaleList) {
                if(i > (scaleList.length - 2)) continue;
                ctx.beginPath();
                var obj = scaleList[i];
                var widthPhi = obj.widthPhi;
                ctx.fillStyle = obj.fillStyle;
                var p1x = xp + widthP * cosp * widthPhi;
                var p1y = yp + widthP * sinp * widthPhi;
                var p2x = xp - widthP * cosp * widthPhi;
                var p2y = yp - widthP * sinp * widthPhi;
                var p3x = x - width * cos * widthPhi;
                var p3y = y - width * sin * widthPhi;
                var p4x = x + width * cos * widthPhi;
                var p4y = y + width * sin * widthPhi;

                ctx.moveTo(xp, yp);
                ctx.lineTo(p1x, p1y);
                ctx.lineTo(p4x, p4y);
                ctx.lineTo(p3x, p3y);
                ctx.lineTo(p2x, p2y);
                ctx.lineTo(xp, yp);
                ctx.fill();
                ctx.closePath();
              }
            }
          }
          this.cosp = cos;
          this.sinp = sin;
          this.widthP = width;
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
          var reverseBol = 0,
            e = 0.00000001;
          if (dx >= e) {
            reverseBol = 1;
          } else if (Math.abs(dx) < e && dy < 0) {
            reverseBol = 1;
          }
          var phiHori = Math.atan2(this.sinp, this.cosp);
          if (phiHori >= 0) {
            phiHori = phiHori - Math.PI;
          }

          var scaleList = this.scaleList;
          for (var k in scaleList) {
            var obj = scaleList[k];
            ctx.beginPath();
            ctx.fillStyle = obj.fillStyle;
            ctx.arc(xp, yp, widthP * obj.widthPhi, phiHori, phiHori + Math.PI, reverseBol);
            ctx.fill();
            ctx.closePath();
          }
        })
        .on('end', function () {
          var ctx = this.ctx;
          var widthP = this.width;
          var scaleList = this.scaleList;
          var x = this.x;
          var y = this.y;
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

          for (var k in scaleList) {
            ctx.beginPath();
            var obj = scaleList[k];
            ctx.fillStyle = obj.fillStyle;
            ctx.arc(x, y, widthP * obj.widthPhi, phiHori, phiHori + Math.PI, reverseBol);
            ctx.fill();
            ctx.closePath();
          }
        })
        .on('style-change', function () {
          this.hsla2color(); //更新颜色
        });
    },

    initScaleList: function () {
      var controls = this.controls;
      var widthMax = controls.widthMax.value;
      var opacity = controls.opacity.value;
      var hue = Math.floor(controls.hue.value * 360);
      this.secondBol = true;
      var scaleList = this.scaleList = [];
      var drawN = this.drawN = Math.min(Math.floor(widthMax / 1.5) + 1, this.drawNMax);
      for (var i = 0; i < drawN; i++) {
        var ii = i / (drawN - 1);
        var dii = Math.pow(1 - ii, 0.5);
        var wii = Math.pow(ii, 4);
        var cii = Math.pow(ii, 2);
        var saturation = parseInt(40 + cii * 60);
        var lightness = parseInt(100 - cii * 90);
        var opact = dii * opacity;
        scaleList.push({
          'fillStyle': 'hsla(' + hue + ',' + saturation + '%,' + lightness + '%,' + opact + ')',
          'widthPhi': wii
        });
      }
    },

    resetValues: function () {
      this.widthP = null;
      this.width = null;
      this.p1x = null;
      this.p1y = null;
      this.p2x = null;
      this.p2y = null;
      this.cosp = null;
      this.sinp = null;
      this.sin = null;
      this.cos = null;
    },
    drawSeg: function() {},
    drawHead: function() {},
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