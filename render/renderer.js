'use strict';
define(['zepto', './../utils/utils', './../libs/event'], function($, Utils, event) {
  var requestAnimFrame = Utils.requestAnimFrame;
  var cancelAnimFrame = Utils.cancelAnimFrame;
  var body = $('body');
  //最基本的绘制方法

  function Renderer(opt) {
    opt = opt || {};
    Utils.extend(this, opt);
  }
  //我们并不以画一个点或画一条线作为最基本的播放单元 而是画若干个点。
  event.extend(Renderer, {
    checkData: function (data) { //检查数据是否有问题
      return data && data.frameW && data.frameH && data.c && data.c.length;
    },
    drawCurve: function (curve, ctx) {
      if(!curve) return;
      var pt, pts = curve.c,
        index, ptN = pts.length,
        ctx = ctx || this.ctx,
        brush = this.brushes[curve.brushType];
      for (index in pts) {
        pt = pts[index];
        this.drawPt(pt, index, ptN, ctx, brush);
      }
    },
    drawPt: function (pt, index, ptN, ctx, brush) {
      if (index === '0' || index === 0) {
        brush.begin(pt, ctx);
      } else if (index < ptN - 1) {
        brush.draw(pt, ctx);
      } else {
        brush.end(ctx);
        return false;
      }
      return true;
    },
  });
  return Renderer;
});