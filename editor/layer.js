'use strict';
define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  var body = $('body');
  var prevent = Utils.prevent;

 /**
  * Layer 创建一个图层
  * @param {Object} container 单个图层
  * @param {Object} options   配置
  */
  function Layer(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(Layer, {
    isHide: false,
    options: {
      zoom:{
        min: 1,
        max: 4
      },
      type: 'xxxx', //brush  background a
      quality: 2,
      id: 'id_' + parseInt(Math.random() * 10000)
    },
    initialize: function (container, options) {
      this.container = container;
      this.width = container.width();
      this.height = container.height();
      this.options = Utils.deepMerge(this.options, options);
      this.type = options.type;
      this.id = options.id;

      this.initDom();
      this.initEvents();
    },
    initDom: function () {
      console.log('请替换')
    },
    clean: function (type) {//清除canvas内容
      if (type === 'front' || !type) {
        this.frontCtx && this.frontCtx.clearRect(0, 0, this.frontCtx.canvas.width, this.frontCtx.canvas.height);
      }
      if (type === 'back' || !type) {
        this.backCtx && this.backCtx.clearRect(0, 0, this.backCtx.canvas.width, this.backCtx.canvas.height);
      }
      this.layerContainer.css('background', 'rgba(0,0,0,0)');
    },
    active: function () {
      this.container.css({'pointer-events': 'auto'});
    },
    unActive: function () {
      this.container.css({'pointer-events': 'none'});
    },
    initEvents: function () {
    },
    switch: function () {
      if (this.isOut) return this.in();
      this.out();
    },
    in : function () {
      if (!this.isOut) return;
      this.container.keyAnim('fadeIn', {
        time: 0.1
      });
      this.isOut = false;
    },
    out: function () {
      if (this.isOut) return;
      this.container.keyAnim('fadeOut', {
        time: 0.1
      });
      this.isOut = true;
    },
    destroy: function () {
      this.container.remove();
      this.off();
    },
    getCanvas: function () {
      console.log('请覆盖');
    },
    addTo: function (editor) {
      this.editor = editor;
    },
    enable: function(){},
    disable: function(){},
    getPt: function (e) { //获取点
    var left = this.left,
      top = this.top;
    var x, y, t = this.getTimeRelative().toFixed(4);
    if (e.type.indexOf('mouse') !== -1) {
      x = (e.x || e.pageX) - left;
      y = (e.y || e.pageY) - top;
    } else {
      var touch = window.event.touches[0];
      x = touch.pageX - left;
      y = touch.pageY - top;
    }
    var pinchScale = this.pinchScale;
    var originX = this.cx * (1 - pinchScale) + this.pinchX;
    x = (x - originX) / pinchScale;
    var originY = this.cy * (1 - pinchScale) + this.pinchY;
    y = (y - originY) / pinchScale;
    return [x, y, t];
  }
  });
  return Layer;
});
