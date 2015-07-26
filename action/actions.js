'use strict';

define(['./../libs/event', './class/bgColor'], function (EventEmitter, BgColor) {
  //有的工具列表
  
  function Actions() {
    this.creates([BgColor]);
    this.initEvents();
  }

  EventEmitter.extend(Actions, {
    creates: function (actionContrulist) {
      var actionTypeList = this.actionTypeList = [];
      var actionList = this.actionList = [];//, new ImageLayer()
      var actionsObj = this.actionsObj = {};
      for (var k in actionContrulist) {
        var Action = actionContrulist[k];
        var action = new Action();
        actionsObj[action.id] = action;
        actionList.push(action);
        actionTypeList.push(action.id);
      }
      this.curAction = actionList[0];
    },
    get: function (key) {
      if (key === undefined || key === null) return this.actionsObj;
      if (typeof (key) === 'number') return this.actionList[key];
      return this.actionsObj[key];
    },
    current: function (actionid) {
      if (!this.curAction) this.curAction = this.actionList[0];
      if (actionid === undefined || actionid === null) return this.curAction;
      if (actionid === this.curAction.id) return;
      var curAction = this.curAction;
      curAction = this.curAction = this.get(actionid);
      this.emit('current', curAction);
      return curAction;
    },
    initEvents: function () {
      var self = this;
      this.each(function (id, action) {
        action.on('control-change', self.styleChangeHook.bind(self));
      });
    },
    styleChangeHook: function () {
      this.emit('control-change');
    },
    controls: function (key, value) {
      var curAction = this.curAction, arguN = arguments.length;
      if(!curAction) return console.log('没有背景操作');
      var controls = curAction.controls;
      if(!arguN) return controls;
      var control = controls[key];
      if(arguN === 1) return control;
      var control = controls[key];
      if(!control) return console.log('当前brush没有这个参数');
      if(value === null || value === undefined) return console.log('不能为brush设置null 或 undefined的变量');
      if(control.value === value) return;
      curAction.setControl(key, value);
      // this.emit('style-change');
    },
    each: function (process) {
      var actionsObj = this.actionsObj;
      for (var id in actionsObj) {
        process(id, actionsObj[id]);
      }
    },
    getColorShow: function () {
      if(this.curAction) return this.curAction.getColorShow();
    }
  });
  return Actions;
});