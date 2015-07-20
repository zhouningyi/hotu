'use strict';
//这个模块和业务关系比较大 负责选择调用哪些模块
define(['./../libs/event', './class/mark.v1', './class/pen.v1', './class/fatdot.v1', './class/ink.v1', './class/fatTest', './class/eraser.v1', './class/fatLines.v1',  './class/caojian',  './class/light.v1'], function(EventsEmitter, mark, pen, fatdot, ink, FatTest, eraser, FatLines, Caojian, Light) { //加载brush基类

  function Brushes() {
    this.creates([mark, fatdot, FatTest, FatLines, Light, pen]);//pen Pencil
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

      this.styleChangeHookBindThis = this.styleChangeHook.bind(this);
      this.initEvents();
    },
    get: function(key) {
      if(key === undefined || key === null) return this.brushObj;
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
      var curBrush = this._curBrush;
      if(curBrush ) curBrush.off('style-change', this.styleChangeHookBindThis);//移除原有事件
      curBrush = this._curBrush = this.get(brushid);
      this.initEvents();
      this.curBrushid = brushid;
      this.emit('current', curBrush);
      return curBrush;
    },
    controls: function(key, value) {
      var curBrush = this._curBrush, arguN = arguments.length;
      if(!curBrush) return console.log('没有画笔');
      var controls = curBrush.controls;
      if(!arguN) return controls;
      var control = controls[key];
      if(arguN === 1) return control;
      var control = controls[key];
      if(!control) return console.log('当前brush没有这个参数');
      if(value === null || value === undefined) return console.log('不能为brush设置null 或 undefined的变量');
      if(control.value === value) return;
      curBrush.setControl(key, value);
      // this.emit('style-change');
    },
    initEvents: function(){
      this._curBrush
      .on('style-change', this.styleChangeHookBindThis);
      // .on('curBrush', this.styleChangeHookBindThis);
    },
    styleChangeHook: function(){
      this.emit('style-change');
    },
    // brushChangeHook: function(){
    //   this.emit('brush-change');
    // },
    getColorShow: function(){
      if(this._curBrush){
        return this._curBrush.getColorShow();
      } 
    }
  });

  return new Brushes();
});