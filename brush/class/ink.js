'use strict';

//ink 毛笔的效果
define(function() {

  function limit(d, limi){
    return Math.floor(d/limi)*limi;

  }
  return {
    desc: '墨水画笔',
    name: '书法',
    initOpt: {
      'id': 'ink',
      'globalCompositeOperation': 'source-over',
      'lineCap': 'round',
      'lineJoin': 'miter',
      'distLimit': 2,
    },
    draw: function(opt) {
      var Easing = this.Easing;
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = opt.ctx;
      var dist = record.dist || 3;
      var distPhi = record.distPhi||0.1;
      var ptPrev = record.ptPrev;
      var speed = record.speed || 3; //速度

      var speedPhi = Math.log(speed)/ Math.log(3900);
      speedPhi = (speedPhi<1)?speedPhi:1;

      var ki = Easing.Sinusoidal.Out(1-distPhi);
      ki = Math.pow(ki,20);
      var  kFinal = this.getSmooth(ki);
      kFinal = (kFinal<0)?0:kFinal;

      var widthMax = 9;
      var width = widthMax * kFinal;

      var widthPrev = this.widthPrev || width;

      var x = pt[0];
      var y = pt[1];
      var xp = ptPrev[0];
      var yp = ptPrev[1];
      var dx = x-xp;
      var dy = y-yp;
      var l = Math.sqrt(dy*dy + dx*dx);
      var cos = dy/l;
      var sin = -dx/l;
      var p1x = xp + widthPrev*cos;
      var p1y = yp + widthPrev*sin;
      var p2x = xp - widthPrev*cos;
      var p2y = yp - widthPrev*sin;
      var p3x = x - width*cos;
      var p3y = y - width*sin;
      var p4x = x + width*cos;
      var p4y = y + width*sin;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(p1x,p1y);
      ctx.lineTo(p2x,p2y);
      ctx.lineTo(p3x,p3y);
      ctx.lineTo(p4x,p4y);
      ctx.lineTo(p1x,p1y);
      ctx.fill();
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.arc(x,y,width*1.0,0,6.28);
      ctx.fill();
      ctx.arc(xp,yp,widthPrev*1.0,0,6.28);
      ctx.fill();
      //
      // ctx.lineWidth = lineWidth;
      // ctx.lineTo(x,y);
      // ctx.stroke();
      // ctx.closePath();
      // ctx.beginPath();
      // ctx.moveTo(x,y);

      this.widthPrev  =  width;

    },
    buttonStyle: function(node){
      node.css({
        'textShadow': '0 0 1px #000',
        'color': '#000'
      });
    }
  };
});
