'use strict';
//这个模块和业务关系比较大 负责选择调用哪些模块
define(['./brush', './class/fatdot', './class/ink', './class/light', './class/marknew', './class/pen', './class/eraser'], function(Brush, fatdot, ink, light, mark, pen, eraser) { //加载brush基类

  function Brushes() {
    var brushList = this.brushList = [mark];//pen, light, ink, fatdot, eraser
    this.creates(brushList);
  }

  Brushes.prototype.creates = function(brushList) {
    var brushTypeList = this.brushTypeList = [];
    var brushObj = this.brushObj = {};
    for (var i in brushList) {
      var Brush = brushList[i];
      var brush = new Brush();
      var id = brush.id;
      brushObj[id] = brush;
      brushTypeList.push(id);
    }
  };
  return Brushes;
});
