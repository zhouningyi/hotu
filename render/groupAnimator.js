'use strict';
define([], function(){
  var body = $('body');

  function GroupAnimator(funcs, opt){
    opt = opt || {};
    this.funcs = funcs;
    this.cb = opt.cb||function(){};
    this.timeout = opt.timeout || 30;
    this.broadcastIndex = 0;
    if(funcs&&funcs.length){
      this.animate();
    }else{
      console.log('函数数组为空');
    }
  }

  Animator.prototype.animate = function() {
    var funcs = this.funcs;
    var funcsN = funcs.length;
    if (this.broadcastIndex < funcsN) {
      var func = funcs[this.broadcastIndex];
      func();
      requestAnimationFrame(this.animate.bind(this), this.timeout);
      this.broadcastIndex++;
    } else {
      this.cb();
    }
  };

  return GroupAnimator;
});
