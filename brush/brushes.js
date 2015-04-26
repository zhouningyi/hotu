'use strict';
//这个模块和业务关系比较大 负责选择调用哪些模块
define(['./brush', './class/fatdot', './class/ink', './class/light', './class/mark', './class/pen', './class/eraser'], function(Brush, fatdot, ink, light, mark, pen, eraser) { //加载brush基类

  function Brushes() {
    var brushList = this.brushList = [mark, pen, light, ink, fatdot, eraser];//, 
    this.creates(brushList);
  }

  Brushes.prototype.create = function(bru, brushObj) {
    var initOpt = bru.initOpt || {};
    var id = initOpt.id;
    this.brushTypeList.push(id);
    var brush = new Brush(initOpt);
    if(bru.begin) brush.beginFunc = bru.begin;
    if(bru.draw) brush.drawFunc = bru.draw;
    if(bru.dot) brush.dotFunc = bru.dot;
    if(bru.buttonStyle) brush.buttonStyleFunc = bru.buttonStyle;
    if(bru.end) brush.endFunc = bru.end;
    if(bru.second) brush.second = bru.second;
    if(bru.onStyleChange) {
      brush.onStyleChange = bru.onStyleChange;
      brush.onStyleChange();
    }
    brushObj[id] = brush;
  };

  Brushes.prototype.creates = function(brushList) {
    var brushTypeList = this.brushTypeList = [];
    var brushObj = this.brushObj = {};
    for (var i in brushList) {
      var brush = brushList[i];
      this.create(brush, brushObj);
    }
  };
  return Brushes;
});
