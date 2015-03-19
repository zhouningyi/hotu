'use strict';
//这个模块和业务关系比较大 负责选择调用哪些模块
define(['./brush', './class/fatdot', './class/ink', './class/light'], function(Brush, fatdot, ink, light) { //加载brush基类

  var brushes = [ink,light,fatdot];
  function Brushes() {
    return this.creates(brushes);
  }

  Brushes.prototype.create = function(bru, result) {
    var initOpt = bru.initOpt || {};
    var id = initOpt.id;
    var brush = new Brush(initOpt);
    if(bru.draw) brush.drawFunc = bru.draw;
    if(bru.dot) brush.dotFunc = bru.dot;
    if(bru.buttonStyle) brush.buttonStyleFunc = bru.buttonStyle;
    if(bru.end) brush.endFunc = bru.end;
    result[id] = brush;
  };

  Brushes.prototype.creates = function(brushes) {
    var result = this.result = {};
    for (var i in brushes) {
      var brush = brushes[i];
      this.create(brush, result);
    }
    return result;
  };
  return Brushes;
});
