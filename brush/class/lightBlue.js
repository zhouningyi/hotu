'use strict';
//发光笔触

define(function() {
  return {
    initOpt: {
      'id': 'lightBlue',
      'name':'光绘',
      'desc': '发光笔触',
      'globalCompositeOperation': 'lighter',
      'hue': 190, // ;
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
      if (ptPrev) {
        var dist = record.dist;
        for (var i = 0; i < N; i++) {
          ctx.moveTo(ptPrev[0], ptPrev[1]);
          var ki = i / (N - 1);
          var kc = ki * ki;
          var kw = Math.sqrt(ki);
          var opacity = ki * 0.6;
          var color = Color({
            hue: hue,
            saturation: 0.6,
            value: 0.6
          });
          var r = Math.floor(color.getRed() * 255);
          var g = Math.floor(color.getGreen() * 255);
          var b = Math.floor(color.getBlue() * 255);
          // if(i == N-1){
          //   ctx.lineWidth = 2;
          //   ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          // }else{
          ctx.lineWidth = Math.floor(maxSize * (1 - kw)) * dist / 15;
          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
          // }
          ctx.lineTo(pt[0], pt[1]);
          ctx.stroke();
        }
      }
      ctx.closePath();
      ctx.beginPath();
      ctx.moveTo(pt[0], pt[1]);
    },
    buttonStyle: function(node){
      node.css({
        'textShadow': '0 0 9px #099',
        'color': '#9ff'
      });
    }
  };
});
