'use strict';
//发光笔触
// 'lineCap': 'round',
// 'lineJoin': 'miter',
define(['./../../utils/utils'], function (Utils) {
  var hsla2obj = Utils.hsla2obj;
  return {
    initOpt: {
      'redraw': false,
      'id': 'mark',
      'name': '马克笔',
      'desc': '马克笔',
      'globalCompositeOperation': 'source-over',
      'lineJoin': 'butt',
      'lineCap': 'square',
      'distLimit': 5,
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
      }
    },
    begin: function () {
      this.secondBol = true;
    },
    onStyleChange: function () {
      this.hsla2color();//更新颜色
    },
    second: function (opt) { //补上一个点
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
    },
    draw: function (opt) {
      var controls = this.controls;
      var ctx = this.ctx = opt.ctx || this.ctx;
      ctx.lineWidth = 0.01;
      var color = this.color;
      if (!color) return console.log('normal brush 没有颜色');
      var Easing = this.Easing;
      var record = opt.record || {};
      var pt = opt.pt || {};

      var speed = record.speed || 3; //速度

      var speedPhi = speed / 6000;
      speedPhi = (speedPhi < 1) ? speedPhi : 1;
      var ki = Easing.Sinusoidal.In(1 - speedPhi);
      ki = Math.pow(ki, 2);
      var kFinal = this.getSmooth('width', ki);
      kFinal = (kFinal < 0) ? 0 : kFinal;

      var widthMax = this.widthMax || controls.widthMax.value;
      var width = widthMax * kFinal;
      width = (width < 1) ? 1 : width;
      var widthPrev = this.widthPrev || width;

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
          var p1x = xp + widthPrev * cosp;
          var p1y = yp + widthPrev * sinp;
          var p2x = xp - widthPrev * cosp;
          var p2y = yp - widthPrev * sinp;
          var p3x = x - width * cos;
          var p3y = y - width * sin;
          var p4x = x + width * cos;
          var p4y = y + width * sin;
          
          //这似乎是canvas画线的一个bug
          // xp = Math.round(xp) + 0.5;
          // yp = Math.round(yp) + 0.5;
          // p1x = Math.round(p1x) + 0.5;
          // p2x = Math.round(p2x) + 0.5;
          // p3x = Math.round(p3x) + 0.5;
          // p4x = Math.round(p4x) + 0.5;
          // p1y = Math.round(p1y) + 0.5;
          // p2y = Math.round(p2y) + 0.5;
          // p3y = Math.round(p3y) + 0.5;
          // p4y = Math.round(p4y) + 0.5;

          // ctx.lineWidth = 1;

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
    },
    end: function () {
      var color = this.color;
      if (!color) return console.log('normal brush 没有颜色');
      var ctx = this.ctx;
      this.secondBol = false;
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

    },
    buttonStyle: function (node) {
      node.css({
        'textShadow': '0 0 9px #707',
        'color': '#f9f'
      });
    }
  };
});