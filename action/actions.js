'use strict';

define(['./imageLayer', './bgColor'], function(ImageLayer, BgColor) {
  //有的工具列表
  function Actions() {
    var actionList = this.actionList = [new BgColor(), new ImageLayer()];
    var actionsObj = this.actionsObj = {};
    for(var k in actionList){
      var action = actionList[k];
      actionsObj[action.id] = action;
    }
  }
  Actions.prototype.get = function(id) {
    return this.actionsObj[id];
  };
  return Actions;
});