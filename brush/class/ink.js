'use strict';

//ink 毛笔的效果
define(function() {
  return {
    desc: '墨水画笔',
    name: '书法',
    initOpt: {
      'id': 'ink',
      'globalCompositeOperation': 'source-over',
      'lineCap': 'round',
      'lineJoin': 'round',
      'distLimit': 4,
    },
    draw: function(opt) {
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = this.ctx;
      var dist = record.dist || 3;
      var speed = record.speed || 3; //速度
      var lineWidthMax = 15;
      var lineWidth = Math.min(lineWidthMax / (dist * dist * 0.02 + 0.5), 3 * lineWidthMax);
      lineWidth = lineWidth * 0.9;
      lineWidth = lineWidth + lineWidthMax * 0.5 * Math.random();

      for (var i = 0; i < 2; i++) {
        var ki = 1 / (i + 1);
        ctx.strokeStyle = 'rgba(' + 0 + ',' + 0 + ',' + 0 + ',' + 1 + ')';
        ctx.lineWidth = lineWidth * ki;
        ctx.lineTo(pt[0], pt[1]);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(pt[0], pt[1]);
    }
  };
})
