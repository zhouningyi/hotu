'use strict';
define(['zepto', './../utils/utils', './../libs/event', './renderer'], function ($, Utils, EventEmitter, Renderer) {
  var requestAnimFrame = Utils.requestAnimFrame;
  var cancelAnimFrame = Utils.cancelAnimFrame;
  var body = $('body');

  /**
   * Animation 动画插件
   * @param {[type]} opt [description]
   */
  function Animation(opt) {
    opt = opt || {};
    Utils.merge(this, opt);
    this.initialize();
  }
  /**
   * 我们并不以画一个点或画一条线作为最基本的播放单元 而是以点的个数作为step的步长
   */
  EventEmitter.extend(Animation, {
    stepPtN: 6,
    maxStepPtN: 1000,
    ptInCurveIndex: 0,
    isLooping: true,
    curveIndex: 0,
    isClean: true,
    brushes: null,
    ctx: null,
    initialize: function(){
      this.renderer = new Renderer({
        brushes: this.brushes
      });
      this.addEvents();
    },
    addEvents: function(){
     //事件
     var self = this;
     this
     .on('step', function () {
       if(!this.isLooping) return;
       self.loopId = requestAnimFrame(this.loop.bind(this));
     });
    },
    checkData: function (data) {//检查数据是否有问题
      return Utils.checkDrawData(data);
    },
    getPtsN: function (index) {
      var curves = this._curves;
      index = index || curves.length;
      index = (index < curves.length) ? index : curves.length;
      var ptsN = 0;
      for (var k = 0; k < index; k++) {
        var curve = curves[k];
        if (curve && curve.c) {
          ptsN += curve.c.length;
        }
      }
      return ptsN;
    },
    data: function (data) { //传入数据
      // if (!this.checkData(data)) alert('数据有点问题哦');
      this._data = data;
      this._curves = data.c;
      this.ptsN = this.getPtsN(data);
      this.stopPtIndex = this.ptsN;
      requestAnimFrame(this.redraw.bind(this));//有时候 播放只有一帧 end事件提前就触发了。
    },
    reset: function () {//参数全部更新
      this.curveIndex = 0;
      this.ptInCurveIndex = 0;
      this.ptIndex = 0;
      this.stepIndex = 0;
      this.isLooping = true;
    },
    broadcast: function(){
      if(this.ptIndex === this.ptsN){
        // this.stopPtIndex = null;
        this.redraw();
      }else{
        this.resume();
      }
    },
    redraw: function () {//从头开始绘制
      this.reset();
      if (this.isClean) this.clean();
      this.resume();
    },
    redrawAll: function () {//清除 stopPtIndex, 即从头播放到尾, 并开始绘制
      this.step('slow');
      this.stopPtIndex = null;
      this.redraw();
    },
    setLoopStatus: function(bool){
      this.emit('loop-statu', bool);
      this.isLooping = bool;
    },
    stop: function () {//停止播放
      this.setLoopStatus(false);
      cancelAnimFrame(this.loopId);
      this.stepIndex = 0;
    },
    resume: function () {//恢复播放
      var stopPtIndex = this.stopPtIndex || this.ptsN;
      if (this.ptIndex > stopPtIndex) return;
      this.setLoopStatus(true);
      this.loop();
    },
    switch: function () {//如果停止就播放 如果开始就停止
      if (this.isLooping) {
        this.stop();
      } else {
        this.stopPtIndex = this.ptsN;
        this.step('slow');
        this.broadcast();
      }
    },
    loop: function () {
      this.drawStep();
    },
    to: function (index, type) {
      type = type || 'ptIndex';
      if (type === 'ptIndex') return this.toPtIndex(index);
      if (type === 'curveIndex') return this.curveIndex(index);
    },
    toCurveIndex: function (index) {
      var curves = this._curves;
      if (index > curves.length) return;//大小越界
      var stopPtIndex = 0;
      for (var k in curves) {
        var curve = curves[k];
        var pts = curves.length;
      }
    },
    toPtIndex: function (stopPtIndex) {//到第N个点停下
      if (stopPtIndex === null || stopPtIndex === undefined) return;
      if (stopPtIndex <= 1) {//为百分比的情况
        stopPtIndex = Math.floor(stopPtIndex * this.ptsN);
      }
      if(Math.abs(stopPtIndex - (this.stopPtIndex || this.ptsN)) < 10) return;//阈值，太小
      this.step('fast');
      this.stopPtIndex = stopPtIndex;
      if (stopPtIndex >= this.ptIndex) {
        this.resume();
      } else {
        this.redraw();
      }
    },
    step: function (stepPtN) {
      if (!stepPtN) return;
      this.stepPtN = {'slow': 5, 'nomarl': 50, 'fast': 1000}[stepPtN] || stepPtN;
    },
    onNextCurve: function () {
      var curves = this._curves;
      var curveIndex = this.curveIndex;
      if (curveIndex >= curves.length) return false;
      var curCurve = this._curCurve = curves[curveIndex];
      this.curCurvePts = curCurve.c;
      //设置笔刷
      var curBrush = this.curBrush = this.brushes.get(curCurve.brushType);
      //设置风格
      var style = curCurve.style;
      if (style) {
        curBrush.setCurveStyles(style);
      }
      //数字更新
      this.curveIndex++;
      this.ptInCurveIndex = 0;
      return true;
    },
    
    drawStep: function () {
      if (!this._curCurve) this.onNextCurve();
      var stepIndex = 0, isNextPt = true, isNextCurve = true, curveN = this._curves.length || 0, stepPtN = this.stepPtN;
      while (stepIndex < stepPtN) {
        if(!this.isLooping) return;
        isNextPt = this.drawPt();
        if (!isNextPt) {
          isNextCurve = this.onNextCurve();
          if (!isNextCurve) {
            return this.emit('end');
          }
        }else{
          this.ptIndex++;
          this.ptInCurveIndex++;
        }
        if (this.stopPtIndex && this.stopPtIndex <= this.ptIndex) {
          this.setLoopStatus(false);
          this.emit('step', this.ptIndex / this.ptsN);
          this.emit('end');
          return this.stop();
        }
        if (this.ptsN <= this.ptIndex) {
          this.setLoopStatus(false);
          this.emit('step', 1);
          this.emit('end');
          return this.stop();
        }
        stepIndex++;
      }
      this.emit('step', this.ptIndex / this.ptsN);
    },
    drawPt: function () {//每一个点 判断位于画笔的什么位置 该执行什么
      if(!this.isLooping) return;
      var index = this.ptInCurveIndex;
      var curCurvePts = this.curCurvePts;
      var pt = curCurvePts[index];
      var ptN = curCurvePts.length;
      // console.log(pt, index, ptN, this.ctx, this.curBrush);
      return this.renderer.drawPt(pt, index, ptN, this.ctx, this.curBrush);
    },
    dataCurrent: function (index) { //获得当前播放动画的数据
      return this._dataCurrent;
    },
    clean: function () {
      var ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    destory: function(){
      this.removeAllListeners();
      this.stop();
      this._curves = null;
      this._data = null;
      this.ptsN = 0;
      this.clean();
    }
  });
  return Animation;
});