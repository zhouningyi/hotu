'use strict';
//这个模块和业务关系比较大 负责选择调用哪些模块
define(['./brush', './class/fatdot', './class/thin', './class/ink', './class/light', './class/lightBlue','./class/lines'], function(Brush, fatdot, thin, ink, light, lightBlue,lines) { //加载brush基类

  var brushes = [fatdot,thin,ink,light,lightBlue,lines];
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
