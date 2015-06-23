'use strict';
define(['zepto', './../utils/utils', './../libs/event'], function ($, Utils, event) {
  var requestAnimFrame = Utils.requestAnimFrame;
  var cancelAnimFrame = Utils.cancelAnimFrame;
  var body = $('body');

  function Draw(opt) {
    opt = opt || {};
  }
//我们并不以画一个点或画一条线作为最基本的播放单元 而是画若干个点。
  event.extend(Draw, {
    checkData: function (data) {//检查数据是否有问题
      return data && data.frameW && data.frameH && data.c && data.c.length;
    },
    addPt: function(){

    },
  });
  return Animator;
});