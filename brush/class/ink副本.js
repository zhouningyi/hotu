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
      'distLimit': 5,
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

      var ki = Math.pow((1-distPhi*0.9),2);
      var  kFinal = this.getSmooth(ki);

      var lineWidthMax = 30;
      var linePhi = Easing.Quartic.In(kFinal);
      var lineWidth = lineWidthMax * linePhi;


      // var lineWidth = Math.min(lineWidthMax * (Math.pow(dist,-2)  * 10 + 0.1), lineWidthMax);
      // lineWidth = lineWidth + lineWidthMax * 0.0 * Math.sin(lineWidth);
      // var x = limit(pt[0], 20);
      // var y = limit(pt[1], 20);
      var x = pt[0];
      var y = pt[1];

      var kk = linePhi;
      // ctx.strokeStyle = 'hsla(' + 180 + ',' + 80*kk + '%,' + 20/kk + '%,' + 1 + ')';
      // ctx.strokeStyle = 'hsla('+(180+80*kk)+',90%,50%,1)';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = lineWidth;
      ctx.lineTo(x,y);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.moveTo(x,y);

    },
    buttonStyle: function(node){
      node.css({
        'textShadow': '0 0 1px #000',
        'color': '#000'
      });
    }
  };
});
