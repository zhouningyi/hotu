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
      'hue': 320, // ;
      'lineJoin': 'miter',
      'lineCap': 'butt',
      'widthMax': 8,
      'drawN': 6,
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
    },

    begin: function() {
      this.secondBol = true;
      var scaleList = this.scaleList = [];
      var drawN = this.drawN;
      var hue = this.hue;
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
    second: function(opt) { //补上一个点
      var ctx = this.ctx = opt.ctx;
      this.secondBol = false;
      var widthPrev = this.widthPrev;
      var scaleList = this.scaleList;
      var xp = this.xp;
      var yp = this.yp;
      var dx = this.dx;
      var reverseBol = (dx>0)?0:1;
      var cosp = this.cosp;
      var phiHori = Math.acos(cosp);
      for (var k in scaleList) {
        var obj = scaleList[k];
        ctx.beginPath();
        ctx.fillStyle = obj.fillStyle;
        ctx.arc(xp, yp, widthPrev * obj.widthPhi, phiHori , phiHori + Math.PI, reverseBol);
        ctx.fill();
        ctx.closePath();
      }
    },
    draw: function(opt) {
      var drawN = this.drawN; //要描边几次
      var color = this.color;
      var Easing = this.Easing;
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = opt.ctx;
      var speed = record.speed || 3; //速度

      var speedPhi = speed / 5000;
      speedPhi = (speedPhi < 1) ? speedPhi : 1;
      var ki = Easing.Sinusoidal.In(1 - speedPhi);
      ki = Math.pow(ki, 2);
      var kFinal = this.getSmooth('width', ki);
      kFinal = (kFinal < 0) ? 0 : kFinal;

      var widthMax = this.widthMax;
      var width = widthMax * kFinal;
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
          cos = this.cos =  dy / l;
          sin = this.sin =  -dx / l;
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
            var p1x = xp + widthPrev * cosp * widthPhi;
            var p1y = yp + widthPrev * sinp * widthPhi;
            var p2x = xp - widthPrev * cosp * widthPhi;
            var p2y = yp - widthPrev * sinp * widthPhi;
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

      this.widthPrev = width;
      this.yp = y;
      this.xp = x;
    },
    end: function() {
      var ctx = this.ctx;
      this.secondBol = false;
      var widthPrev = this.widthPrev;
      var scaleList = this.scaleList;
      var x = this.xp;
      var y = this.yp;
      var dx = this.dx;
      var reverseBol = (dx<0)?0:1;
      var cos = this.cos;
      var phiHori = Math.acos(cos);
      ctx.beginPath();
      for (var k in scaleList) {
        var obj = scaleList[k];
        ctx.fillStyle = obj.fillStyle;
        ctx.arc(x, y, widthPrev * obj.widthPhi, phiHori , phiHori + Math.PI, reverseBol);
        ctx.fill();
      }
      ctx.closePath();

      this.widthPrev = null;
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
