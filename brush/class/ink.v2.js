'use strict';
define(['./brush_base_round'], function(BrushBase) {
  var max = Math.max,
    cos = Math.cos,
    sin = Math.sin,
    atan2 = Math.atan2,
    min = Math.min,
    pow = Math.pow,
    sqrt = Math.sqrt;

  function generateSprite(fillColor) { //根据ai+draw_s_cript得到笔触
    fillColor = fillColor || 'rgba(0,0,0,1)';
    var width = 50;
    var height = 100;
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
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
    scale = scale * 1.2;
    if(!sprite) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(phi - Math.PI / 2);
    var wPhi = sprite.width / sprite.height;
    ctx.drawImage(sprite, -scale * wPhi, -scale, 2 * scale * wPhi, 2 * scale);
    ctx.restore();
  }

  function InkV2(obj) {
    this.init(obj);
  }

  BrushBase.extend(InkV2, {
      'desc': '墨水画笔',
      'name': '书法',
      'id': 'ink_v2',
      'globalCompositeOperation': 'source-over',
      'lineCap': 'square',
      'lineJoin': 'butt',
      'distLimit': 2,
      'phi': Math.PI / 6,
      'kStroke': 0.4,
      'opacity': 1,
      'smooth': {
        'x': {
          'f': 'Sinusoidal.In',
          'N': 12
        },
        'y': {
          'f': 'Sinusoidal.In',
          'N': 12
        },
        'kWidth': {
          'f': 'Sinusoidal.In',
          'N': 20
        },
        'width': {
        'easing': 'Sinusoidal.Out',
        'smoothN': 8
        }
      },

    'controls': {
        'widthMax': {
          'range': [1, 30],
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
    },
    init: function(obj) {
      BrushBase.prototype.init.call(this, obj);
    },
    addHooks: function() {
      var controls = this.controls;
      var Easing = this.Easing;
      var widthMax;

      var ctx = this.ctx;
      this
        .on('begin', function () {
          this.resetValues();
          ctx = this.ctx;
          widthMax = controls.widthMax.value;
        })
        .on('draw', function(record) {
          if (!record) return console.log('record不存在');
          var color = this.getValue('color');
          if (!color) return console.log('normal brush 没有颜色');
          //原始的变量
          var pt = record.pt;
          var speed = record.speed; //速度
          var speedK = this.speedK = record.speedK;
          var smoothes = record.smoothes;
          //经过光滑的变量
          var x = this.x =  smoothes.x;
          var xp = smoothes.xP;
          var y = this.y =  smoothes.y;
          var yp = smoothes.yP;
          var kCurve = smoothes.kCurve;
          var dx = this.dx = smoothes.dx;
          var dy = this.dy = smoothes.dy;
          var dPhi = smoothes.dPhi;

          var ki = Easing.Sinusoidal.In(1 - speedK);
          ki = pow(ki, 8);
          var kFinal = max(this.addAndGetSmooth('width', ki).value, 0);
          var kWidth = this.kWidth = Math.pow(kWidth, 1);
          var width = max(widthMax * kFinal, 1);
          var widthP = this.widthP;
          this.widthP = this.width;
          this.width = width;

          if (xp !== null && xp !== undefined && yp !== null && yp !== undefined) {
            var l = sqrt(dy * dy + dx * dx);
            var cos, sin;

            if (l) {
              cos = this.cos = Math.cos(this.phi);
              sin = this.sin = Math.sin(this.phi);
            }

            var p1xP = this.p1x,
              p1yP = this.p1y,
              p2xP = this.p2x,
              p2yP = this.p2y;
            var p1x = this.p1x = x - width * cos;
            var p1y = this.p1y = y - width * sin;
            var p2x = this.p2x = x + width * cos;
            var p2y = this.p2y = y + width * sin;

            if (p1xP && p2xP) {
              ctx.beginPath();
              ctx.lineWidth = width * this.kStroke;
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
              ctx.stroke();
              ctx.closePath();
            }
            if (kWidth > 0.5) drawSprite(ctx, this.sprite, xp, yp, widthPrev, this.phi);
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
          var phi = this.phi;
          // (ctx, sprite, x, y, scale, phi)
          drawSprite(this.ctx, this.sprite, xp, yp, widthP, phi);
        })
        .on('end', function() {
          if (!this.record || !this.record.smoothes) return;
          this.drawEnd();
          this.resetValues();
        })
        .on('style-change', function() {
          this.hsla2color();//更新颜色
          this.sprite = generateSprite(this.colorShow);
        });
    },
    resetValues: function() {
      this.widthP = null;
      this.width = null;
      this.p1x = null;
      this.p1y = null;
      this.p2x = null;
      this.p2y = null;
    },
    drawEnd: function () {
        if (this.kWidth > 0.5) {
          drawSprite(this.ctx, this.sprite, this.xp, this.yp, this.widthPrev, this.phi);
        } else {
          var ctx = this.ctx;
          ctx.beginPath();
          ctx.moveTo(this.pax, this.pay);
          var cos = this.cos;
          var sin = this.sin;
          var kphi = 2;//最后一个点占用的权重
          var width = this.width;
          var xEnd = this.x + this.dx * kphi;
          var yEnd = this.y + this.dy * kphi;
          ctx.lineTo(xEnd, yEnd);
          ctx.lineTo(this.x + cos * width, this.y + sin * width);
          ctx.lineTo(this.x - cos * width, this.y - sin * width);
          ctx.lineWidth = width * this.kStroke;
          ctx.strokeStyle = ctx.fillStyle = this.color;
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      },
    buttonStyle: function(node) {
      node.css({
        'textShadow': '0 0 9px #707',
        'color': '#f9f'
      });
    }
  });

  return InkV2;
});
