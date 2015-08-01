'use strict';

define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  //有的工具列表
  var controls2data = Utils.controls2data;
  function Action(options) {
    this.initialize(options);
  }

  EventEmitter.extend(Action, {
    name: '请覆盖',
    id: '请覆盖',
    desc: '请覆盖',
    key: '请覆盖',
    type: 'background',
    options: {},
    controls: {},
    initialize: function (options) {
      options = Utils.deepMerge(this.options, options);
    },
    getValue: function (key) {
      if (key === 'color') {
        if(this.controls.lightSat) {
          Utils.hsla2color.bind(this)();
        }  
      }
      if(this.controls && this.controls[key]) return this.controls[key].value;
      return this[key];
    },
    workOn: function (layer) {
      if(!layer) return;
      this.layer = layer;
      this.ctx = layer.ctx || layer.ctxBg;
    },
    _update: function () {
      Utils.resetCtx(this.ctx, this.options);
      this.update();
    },
    update: function () {
      console.log('请覆盖');
    },
    setControl: function (key, value) {
      var controls = this.controls;
      if(!key || value === undefined || value === null || !controls || !controls[key]) return;
      if(controls[key].value === value) return;
      controls[key].value = value;
      this.emit('control-change', {key:key,value:value});
    },
    toData: function () {
      return controls2data(this.controls);
    },
    render: function (ds) {
      for (var k in ds){
        this.setControl(k, ds[k]);
      }
    },
    getColorShow: function () {
      return this.color;
    }
  });
  return Action;
});