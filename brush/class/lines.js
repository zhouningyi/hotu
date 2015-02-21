'use strict';
//发光笔触

define(function() {
  return {
    initOpt: {
      'id': 'lines',
      'name':'毛线',
      'desc': '毛线笔触',
      'hue': 320, // ;
      'lineJoin': 'round',
      'lineCap': 'round',
      'lineWidth': 1,
      'maxSize': 20,
      'strokeStyle':'#000',
      'fillStyle':'rgba(0,0,0,0.1)',
      'distLimit':1
    },
    draw: function(opt) {
      // var curCurve = this.model.getCurve();
      var maxSize = this.maxSize;
      var record = opt.record || {};
      var ptPrev = record.ptPrev;
      var pt = opt.pt || {};
      var ctx = opt.ctx;
      var N = 15;
      if (ptPrev) {
        var dist = record.dist;
        for (var i = 0; i < N; i++) {
          ctx.moveTo(pt[0], pt[1]);
          var r = dist/8 + 1;
          var x = pt[0] + Math.cos(dist*199)*dist/2;
          var y = pt[1] + Math.sin(dist/2)*dist/2;
          ctx.moveTo(x, y);
          ctx.arc(x,y,r,0,7);
          ctx.fill();
          // ctx.lineWidth = Math.random()*dist/5 + 1;
          // ctx.lineTo(pt[0]+Math.random()*3, pt[1]+Math.random()*3);
          // ctx.stroke();
        }
      }
      // ctx.closePath();
      ctx.beginPath();
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
