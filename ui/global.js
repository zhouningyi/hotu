'use strict';
//对UI的总体控制
define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  var prevent = Utils.prevent;

  var body = $('body');

  function Global(options){
  }

  EventEmitter.extend(Global, {
    //注册的一系列全局事件
    events:{
      'painter-tap': {
        desc: '轻按画布'
      },
      'paint-start':{
        desc: '画图开始'
      },
      'paint-end':{
        desc: '画图结束'
      },
      'select-start': {
        desc: '选择器开始操作'
      },
      'select-end':{
        desc: '选择器结束操作'
      },
      'select-tool':{
        desc: '选择选择器组'
      },
      'reload-end': {
        desc: '加载画作结束'
      },
      'main-color-change':{
        desc: '主要颜色改变'
      }
    },
    trigger: function(eName, d){
      if(!eName) return;
      if (eName in this.events) return this.emit(eName, d);
    }
  });
  
  window.global = new Global();//全局变量
  
  return global;
});