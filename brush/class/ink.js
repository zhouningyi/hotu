'use strict';

//ink 毛笔的效果
define([], function () {
  function generateSprite(fillColor) { //根据ai+drawscript得到笔触
    fillColor = fillColor || 'rgba(0,0,0,1)';
    var width = 50;
    var height = 100;
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    // ctx.fillStyle='#900';
    // ctx.shadowBlur = 30;
    // ctx.shadowColor = '#000';
    // ctx.fillRect(0,0,width,height);
    ctx.fillStyle = fillColor;
    ctx.translate(width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(-2, -48);
    ctx.bezierCurveTo(-4, -47, -12, -26, -15, -11);
    ctx.bezierCurveTo(-19, 5, -25, 17, -22, 30);
    ctx.bezierCurveTo(-20, 43, -20, 41, -12, 46);
    ctx.bezierCurveTo(-5, 50, 8, 42, 15, 38);
    ctx.bezierCurveTo(25, 32, 24, 12, 19, -5);
    ctx.bezierCurveTo(12, -28, 9, -42, 7, -46);
    ctx.bezierCurveTo(4, -49, -4, -47, -4, -47);

    ctx.fill();
    return canvas;
  }

  function drawSprite(ctx, sprite, x, y, scale, phi) {
    if(!sprite) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(phi - Math.PI / 2);
    var wPhi = sprite.width / sprite.height;
    ctx.drawImage(sprite, -scale * wPhi, -scale, 2 * scale * wPhi, 2 * scale);
    ctx.restore();
  }

  function limit (d, limi) {
    return Math.floor(d / limi) * limi;
  }
  return {
    initOpt: {
      'desc': '墨水画笔',
      'name': '书法',
      'id': 'ink',
      'globalCompositeOperation': 'source-over',
      'lineCap': 'round',
      'lineJoin': 'miter',
      'distLimit': 2,
      'opacity': 1,
      'smooth': {
        'x': {
          'f': 'Sinusoidal.In',
          'N': 8
        },
        'y': {
          'f': 'Sinusoidal.In',
          'N': 8
        },
        'kWidth': {
          'f': 'Sinusoidal.In',
          'N': 20
        }
      },
      'phi': Math.PI / 6,
      'controls': {
        'widthMax': {
          'range': [1, 50],
          'value': 20,
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
            'light': 0,
            'sat': 0
          },
          'constructorUI': 'LightSatSelector',
          'containerName': 'color'
        }
      }
    },
    onStyleChange: function () {
      this.hsla2color();//更新颜色
      this.sprite = generateSprite(this.colorShow); //
    },
    begin: function () {
      this.secondBol = true;
      this.ptIndex = 0;
    },
    second: function (opt) { //补上一个点
      drawSprite(this.ctx, this.sprite, this.xp, this.yp, this.widthPrev, this.phi);
      this.secondBol = false;
    },
    draw: function (opt) {
      var color = this.color;
      var controls = this.controls;
      var widthMax = controls.widthMax.value;
      var Easing = this.Easing;
      var record = opt.record || {};
      var pt = this.pt = opt.pt || {};
      var ctx = this.ctx = opt.ctx;
      var speed = record.speed || 3; //速度

      var speedPhi = speed / 5000;
      speedPhi = (speedPhi < 1) ? speedPhi : 1;
      var ki = Easing.Sinusoidal.In(1 - speedPhi);
      var kWidth = this.getSmooth('kWidth', ki);
      kWidth = Math.pow(kWidth, 5);
      
      var width = widthMax * kWidth;
      var widthPrev = this.widthPrev || width;

      var x = pt[0];
      x = this.getSmooth('x', x);
      var y = pt[1];
      y = this.getSmooth('y', y);

      var xp = this.xp || x;
      var yp = this.yp || y;
      var dx = x - xp;
      var dy = y - yp;
      var l = Math.sqrt(dy * dy + dx * dx);
      var cos = Math.cos(this.phi);
      var sin = Math.sin(this.phi);
      var sinPrev = this.sinPrev || sin;
      var cosPrev = this.cosPrev || cos;

      // console.log(xp);

      // var directPhi = Math.atan(dy/dx);
      if (this.ptIndex > 0) {
        if (this.secondBol) {
            this.second(opt);
        }
        var p1x = xp + widthPrev * cosPrev;
        var p1y = yp + widthPrev * sinPrev;
        var p2x = xp - widthPrev * cosPrev;
        var p2y = yp - widthPrev * sinPrev;
        var p3x = this.pax = x - width * cos;
        var p3y = this.pay = y - width * sin;
        var p4x = this.pbx = x + width * cos;
        var p4y = this.pby = y + width * sin;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p4x, p4y);
        ctx.lineTo(p1x, p1y);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        if (kWidth > 0.5) drawSprite(ctx, this.sprite, xp, yp, widthPrev, this.phi);
      }

      // ctx.beginPath();
      // ctx.arc(xp-0.5,yp-0.5,1,0,2*Math.PI);
      // ctx.fillStyle = '#f00';
      // ctx.fill();
      // ctx.closePath();
      // ctx.drawImage(this.sprite,xp-widthPrev,yp-widthPrev,2*widthPrev,2*widthPrev);

      this.widthPrev = width;
      this.kWidthPrev = kWidth;
      this.yp = y;
      this.xp = x;
      this.cosPrev = cos;
      this.sinPrev = sin;
      this.ptIndex += 1;
    },
    end: function () {
      if (this.ptIndex > 1) {
        if (this.kWidthPrev > 0.5) {
          drawSprite(this.ctx, this.sprite, this.xp, this.yp, this.widthPrev, this.phi);
        } else {
          var ctx = this.ctx;
          ctx.beginPath();
          ctx.moveTo(this.pax, this.pay);
          var phi = 0.4;//最后一个点占用的权重
          var xEnd = this.xp*phi + this.pt[0]*(1-phi);
          var yEnd = this.yp*phi + this.pt[1]*(1-phi);
          ctx.lineTo(xEnd, yEnd);
          ctx.lineTo(this.pbx, this.pby);
          ctx.lineTo(this.pax, this.pay);
          ctx.lineWidth = 0.5;
          ctx.strokeStyle = ctx.fillStyle = this.color;
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      }
      this.widthPrev = null;
      this.yp = null;
      this.xp = null;
      this.ptIndex = 0;
      this.secondBol = false;
    },
    buttonStyle: function (node) {
      node.css({
        'textShadow': '0 0 1px #000',
        'color': '#000'
      });
    }
  };
});
