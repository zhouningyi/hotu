'use strict';
define(['zepto', './../utils/utils', './../libs/event'], function ($, Utils, event) {
  var requestAnimFrame = Utils.requestAnimFrame;
  var cancelAnimFrame = Utils.cancelAnimFrame;
  var body = $('body');

  function Animator(opt) {
    opt = opt || {};
    this._brushes = opt.brushes;
    this.ctx = opt.ctx;

    //事件
    var self = this;
    this
    // .on('curve-end', this.onNextCurve.bind(this))
    .on('step', function () {
      self.loopId = requestAnimFrame(this.loop.bind(this));
    });
    //开始动画
    if (opt.data) this.data(opt.data);
  }

  event.extend(Animator, {
    stepPtN: 12,
    ptInCurveIndex: 0,
    curveIndex: 0,
    data: function (data) { //传入数据 
      this._data = data;
      this._curves = data.c;
      this.reset();
      this.loop();
    },
    reset: function () {
      this.curveIndex = 0;
      this.ptInCurveIndex = 0;
      this.stepIndex = 0;
      this._dataCurrent = {}; //播放到这个位置的数据
    },
    stop: function () {
      cancelAnimFrame(this.loopId);
      this.stepIndex = 0;
    },
    to: function (index) { //到某个位置
    },
    step: function(stepPtN){
      if(!stepPtN) return;
      this._stepPtN = stepPtN;
      // this.removeListener('setp').on('step')
    },
    resume: function () {
      if (this.curveIndex < this._curves.length) {
        this.loop();
      }
    },
    loop: function () {
      this.drawStep();
    },
    onNextCurve: function () {
      var curves = this._curves;
      var curveIndex = this.curveIndex;
      if (curveIndex >= curves.length) return false;
      var curCurve = this._curCurve = curves[curveIndex];
      this.curCurvePts = curCurve.c;
      //设置笔刷
      var brushType = curCurve.brushType;
      var brushes = this._brushes;
      if (brushType && brushes[brushType]) {
        this.curBrush = brushes[brushType];
      }
      var curBrush = this.curBrush;
      //设置风格
      var style = curCurve.style;
      if (style) {
        curBrush.setCurveStyles(style);
      }
      //数字更新
      this.curveIndex++;
      this.ptInCurveIndex = 0;
      this.curCurvePtN = curCurve.length || 0;
      return true;
    },
    drawStep: function () {
      if (!this._curCurve) this.onNextCurve();
      var stepIndex = 0, isNextPt = true, isNextCurve = true, curveN = this._curves.length || 0, stepPtN = this.stepPtN;
      while (stepIndex < stepPtN) {
        isNextPt = this.drawPt();
        this.ptInCurveIndex++;
        if (!isNextPt) {
          isNextCurve = this.onNextCurve();
          if (!isNextCurve) {
            return;
          }
        }
        stepIndex++;
      }
      this.emit('step');
    },
    drawPt: function () {
      var index = this.ptInCurveIndex;
      var curCurvePts = this.curCurvePts;
      var pt = curCurvePts[index];
      var ptN = curCurvePts.length;
      if (index === '0' || index === 0) {
        this.curBrush.begin(this.ctx, pt);
      } else {
        this.curBrush.draw(this.ctx, pt);
      }
      if (index >= ptN - 1) { //目前暂时没想到要做什么
        this.curBrush.end(this.ctx);
        return false;
      }
      return true;
    },
    dataCurrent: function (index) { //获得当前播放动画的数据
      return this._dataCurrent;
    }
  });
  return Animator;
});