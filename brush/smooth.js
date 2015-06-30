'use strict';

// 粗细变化
define(['./easing', './../libs/event', './../utils/utils'], function (Easing, Event, Util) {
var max = Math.max, cos = Math.cos, sin = Math.sin, atan2 = Math.atan2, min = Math.min, pow = Math.pow, sqrt = Math.sqrt;
  function Smooth(opt) {
    Util.extend(this, opt);
    this.values = [];
    this.setSmoothN();
    this.setEasing();
  }

  Event.extend(Smooth, {
    maxSmoothN: 10,
    smoothN: 9,
    Easing: Easing, //easing函数库
    easing: 'Sinusoidal.In',
    value: null,
    valueP: null,
    valuePP: null,
    setSmoothN: function (smoothN) {
      smoothN = smoothN || this.smoothN;
      this.smoothN = smoothN;
    },
    setEasing: function (easing) {
      easing = easing || this.easing;
      this.easing = (typeof(easing) === 'string') ? this.getEasingByName(easing) : easing;
    },
    getEasingByName: function (easingName) { //名称 -> easing函数
      var easingNames = easingName.split('.');
      return this.Easing[easingNames[0]][easingNames[1]];
    },
    genMap: function (N) { //为避免多余计算，预算序号与值的对应表
      N = N || this.smoothN;
      var easing = this.easing;
      var map = [];
      for (var k = 0; k < N; k++) {
        map[k] = easing((k + 1) / N) - easing(k / N);
      }
      this['map_' + N] = map;
      return map;
    },
    add: function (value) {
      if (typeof(value = parseFloat(value)) !== 'number') return console.log('smooth的内容须为数字');
      var values = this.values;
      values.push(value);
      if (values.length === this.maxSmoothN && !this.isFirstReady) {
        this.isFirstReady = true;
        this.emit('smooth-ready');
      }
      if (values.length > this.maxSmoothN) values.splice(0, 1);
      
      var N = min(values.length, this.smoothN);
      var map = this['map_' + N] || this.genMap(N);
      var smooth = 0;
      for (var k = 0; k < N; k++) {
        smooth += map[N - 1 - k] * values[values.length - 1 - k];
      }
      //更新暂存
      this.updatePrev(smooth);
      return this;
    },
    updatePrev: function (value) {
      this.valuePP = this.valueP;
      this.valueP = this.value;
      this.value = value;
    },
    get: function (smoothN, easing) {
      return this.smooth;
    },
    reset: function () { //从新开始新的smooth
      this.values = [];
      this.valuePP = null;
      this.valueP = null;
      this.value = null;
      this.isFirstReady = false;
    }
  });

  return Smooth;
});