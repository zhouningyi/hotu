'use strict';
//对UI的总体控制
define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  var prevent = Utils.prevent;

  var body = $('body');

  function Global(options){
    this.initEvents();
  }

  EventEmitter.extend(Global, {
    //注册的一系列全局事件
    events: {
      'painter-tap': {
        desc: '轻按画布'
      },
      'paint-start': {
        desc: '画图开始'
      },
      'paint-end': {
        desc: '画图结束'
      },
      'select-start': {
        desc: '选择器开始操作'
      },
      'select-end': {
        desc: '选择器结束操作'
      },
      'select-tool': {
        desc: '选择选择器组'
      },
      'select-layer': {
        desc: '选择图层'
      },
      'reload-end': {
        desc: '加载画作结束'
      },
      'main-color-change': {
        desc: '主要颜色改变'
      },
      'new-drawing': {
        desc: '创建新的画作'
      },
      'drawing-userid': {
        desc: '编辑器刚载入的画的作者id'
      },
      'drawing-drawid': {
        desc: '编辑器刚载入的画的作品id'
      },
      'bg-change': {
        desc: '背景发生变化'
      },
      'draw-image': {
        desc: 'html string, 要下载的图片'
      },
      'draw-image-url': {
        desc: 'html string, 要下载的图片的 dataurl'
      }
    },
    trigger: function (eName, d) {
      if (!eName) return;
      if (eName in this.events) return this.emit(eName, d);
    },
    initEvents: function () {
      this.on('select-start', function (e) {
        if (!e) return console.log('select-start, 需要指定target类型');
        if (e.type === 'brush') this.emit('select-start-brush');
        if (e.type === 'background') this.emit('select-start-background');
      });
    }
  });
  
  window.global = new Global();//全局变量
  
  return global;
});