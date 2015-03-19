'use strict';
//发光笔触

define(function() {
  return {
    initOpt: {
      'id': 'light',
      'name':'光绘',
      'desc': '发光笔触',
      'globalCompositeOperation': 'lighter',
      'hue': 320, // ;
      'lineJoin': 'round',
      'lineCap': 'butt',
      'lineWidth': 1,
      'maxSize': 20,
    },
    draw: function(opt) {
      // var curCurve = this.model.getCurve();
      var maxSize = this.maxSize;
      var record = opt.record || {};
      var ptPrev = record.ptPrev;
      var pt = opt.pt || {};
      var hue = this.hue;
      var ctx = opt.ctx;
      var N = 5;
      ctx.beginPath();
      if (ptPrev) {
        var dist = record.dist;
        var color = Color({
            hue: hue,
            saturation: 0.6,
            value: 0.6
          });
        for (var i = 0; i < N; i++) {
          ctx.moveTo(ptPrev[0], ptPrev[1]);
          var ki = i / (N - 1);
          var kc = ki * ki;
          var kw = Math.sqrt(ki);
          var opacity = ki * 0.6;
          var r = Math.floor(color.getRed() * 255);
          var g = Math.floor(color.getGreen() * 255);
          var b = Math.floor(color.getBlue() * 255);
          ctx.lineWidth = Math.floor(maxSize * (1 - kw)) * dist / 15;
          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
          ctx.lineTo(pt[0], pt[1]);
          ctx.stroke();
        }
      }
      ctx.closePath();
      ctx.moveTo(pt[0], pt[1]);
    },
    buttonStyle: function(node){
      node.css({
        'textShadow': '0 0 9px #707',
        'color': '#f9f'
      });
    }
  };
});
