'use strict';
//这个模块和业务关系比较大 负责选择调用哪些模块
define(['./../libs/event', './class/mark.v1', './class/pen.v1', './class/fatdot.v1', './class/ink', './class/fatTest', './class/eraser.v1', './class/fatLines.v1',  './class/caojian'], function(EventsEmitter, mark, pen, fatdot, ink, FatTest, eraser, FatLines, Caojian) { //加载brush基类

  function Brushes() {
    this.creates([mark, fatdot, FatTest, FatLines, Caojian]);//pen Pencil
  }
  EventsEmitter.extend(Brushes, {
    curBrushid: null,
    creates: function(brushConstruList) {
      var brushTypeList = this.brushTypeList = [];
      var brushObj = this.brushObj = {};
      var brushList = this.brushList = [];
      for (var i in brushConstruList) {
        var Brush = brushConstruList[i];
        var brush = new Brush();
        brushObj[brush.id] = brush;
        brushList.push(brush);
        brushTypeList.push(brush.id);
      }
      this._curBrush = brushList[0];
    },
    get: function(key) {
      if (typeof(key) === 'number') return this.brushList[key];
      return this.brushObj[key];
    },
    each: function(cb) {
      var brushObj = this.brushObj;
      for (var id in brushObj) {
        cb(id, brushObj[id]);
      }
    },
    current: function(brushid) {
      if(!this._curBrush) this._curBrush = this.brushList[0];
      if (brushid === undefined || brushid === null) return this._curBrush;
      if(brushid === this.curBrushid) return;
      var curBrush = this._curBrush = this.get(brushid);
      this.curBrushid = brushid; 
      this.emit('curBrush', curBrush);
      return curBrush;
    }
  });

  return new Brushes();
});