'use strict';

// brush 初始设置为this.style() 绘制有3个过程 开始画线 画线和 结束
define(['./easing', './../utils/utils'], function (Easing, Utils) {
  var isNone = Utils.isNone;

  var emptyFunc = function () {};

  function Brush(opt) {
    this.opt = opt || {};
    this.Easing = Easing;

    this.smoothNames = [];
    this.setBrushStyles();

    this.maxDist = 80;
    this.distLimit = 2;
    this.smoothList = [];
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////记录分析/////////////////////////////////////////////
  ////////////////////////////////////////////// /////// ////////////////////////////////////////////
  Brush.prototype.record = function (pt) { //判断是否记录点
    this.isDraw = true;
    var maxDist = this.maxDist;
    var ptPrev = this.pt;
    var timePrev = this.time;

    var ptThis = pt;
    var timeThis = ptThis[2];

    if (ptPrev && timePrev) {
      var dx = pt[0] - ptPrev[0];
      var dy = pt[1] - ptPrev[1];
      var dist = Math.sqrt(dx * dx + dy * dy);
      var distPhi = dist / maxDist;
      distPhi = (distPhi < 1) ? distPhi : 1;
      if (dist < this.distLimit) {
        this.isDraw = false;
        return {
          'drawBol': false
        };
      } else {
        this.isDraw = true;
        this.pt = ptThis;
        this.time = timeThis;
        var dTime = timeThis - timePrev;
        var speed = dist / dTime;
        this.speed = speed;
        return {
          'speed': speed,
          'dist': dist,
          'drawBol': true,
          'ptPrev': ptPrev,
          'distPhi': distPhi
        };
      }
    } else {
      this.pt = ptThis;
      this.time = timeThis;
      return {
        'drawBol': false
      };
    }
  };

  var ctxOpts = {
    'id': 1,
    'lineCap': 1,
    'globalCompositeOperation': 1,
    'lineJoin': 1,
    'strokeStyle': 1,
    'fillStyle': 1,
    'lineWidth': 1,
    'curStyle': 1
  };

  Brush.prototype.setBrushStyles = function () { //设置笔刷相关的基本参数
    var ctx = this.ctx;
    var opt = this.opt;
    if (!opt) return;
    var value;
    for (var key in opt) {
      value = this[key] = opt[key];
      if (key in ctxOpts && ctx) {
        ctx[key] = value;
      }
    }
    //平滑的设置
    if (opt.smooth) {
      var smoothList = opt.smooth;
      var smooth;
      for (var l in smoothList) {
        smooth = smoothList[l];
        this.initSmooth(l, smooth.N, smooth.f);
      }
    }
  };

  Brush.prototype.setCurveStyles = function(style, ctx) { //设置风格相关的基本参数
    ctx = this.ctx = ctx || this.ctx;
    if (!style) return;
    var controls = this.controls;
    if (!controls) return;

    for (var key in style) {
      controls[key].value = style[key];
    }
    if (ctx && key in ctxOpts) {
      for (var key in controls) {
        if (key in ctxOpts) {
          ctx[key] = controls[key].value;
        }
      }
    }

    this.onStyleChange(controls);
    return;
  };

   Brush.prototype.onStyleChange = function () {};
  /**
   * [initSmooth description]
   * @param  {String} variableName [进行smooth的变量]
   * @param  {Int} N               [进行smooth的数量]
   * @param  {String} type         [easing的方式]
   */
  Brush.prototype.initSmooth = function (variableName, N, type) { //type:back.inout
    type = type || 'Sinusoidal.In';
    this['smoothN' + variableName] = N;
    this['smoothList' + variableName] = [];
    this.smoothNames.push(variableName);
    var typeNames = type.split('.');
    var easing = this.Easing[typeNames[0]][typeNames[1]];
    var smoothMap = this['smoothMap' + variableName] = [];
    for (var k = 0; k < N; k++) {
      smoothMap[k] = easing((k + 1) / N) - easing(k / N);
    }
    this['smoothFunc' + variableName] = function (k, N) {
      return easing((k + 1) / N) - easing(k / N);
    };
  };

  Brush.prototype.getSmooth = function (variableName, num) { //如果sList的点不足 采用函数处理 点到了阈值 用储存好的list
    var smoothN = this['smoothN' + variableName];
    var sList = this['smoothList' + variableName];
    var smoothMap = this['smoothMap' + variableName];
    var sFunc = this['smoothFunc' + variableName];
    if (smoothMap) {
      sList.push(num);
      if (sList.length > smoothN) {
        sList.splice(0, 1);
        sFunc = function (k) {
          return smoothMap[k];
        };
      }
      var ki, result = 0; // ki为权重
      var sListN = sList.length;
      for (var k = 0; k < sListN; k++) {
        var value = sList[k];
        ki = sFunc(k, sListN);
        result += ki * value;
      }
      return result;
    } else {
      console.log('该变量没加入smooth列表');
      return null;
    }
  };


  //////////////////////开始画线//////////////////////
  Brush.prototype.begin = function (ctx, pt) {
    this.ctx = ctx;
    this.checkBrushStyle(); //是否ctx的绘图参数是否正确 属于本brush
    this.setCurveStyles();
    this.record(pt);
    this.smoothList = [];
    this.smoothListX = [];
    this.smoothListY = [];
    this.beginFunc();
  };

  //////////////////////中间过程//////////////////////

  Brush.prototype.dotFunc = emptyFunc;
  Brush.prototype.drawFunc = emptyFunc;
  Brush.prototype.buttonStyleFunc = emptyFunc;
  Brush.prototype.endFunc = emptyFunc;
  Brush.prototype.beginFunc = emptyFunc;

  Brush.prototype.dot = function (ctx, pt, dt) { //中间过程
    this.ctx = ctx;
    this.dotFunc(ctx, pt, dt);
  };

  Brush.prototype.buttonStyle = function (node) { //中间过程
    try {
      node.removeStyle('box-shadow').removeStyle('text-shadow').removeStyle('border');
    } catch (e) {}
    this.buttonStyleFunc(node);
  };

  Brush.prototype.draw = function (ctx, pt) { //中间过程
    if (!ctx) console.log('drawFrame', ctx);
    ctx = ctx || this.ctx;
    ctx.save();
    var record = this.record(pt) || {};
    if (this.isDraw) {
      this.drawFunc({
        'pt': pt,
        'record': record,
        'ctx': ctx,
        'maxSize': this.maxSize,
        'self': this
      });
      ctx.restore();
      return this.pt;
    }
    return false;
  };

  //////////////////////结束过程//////////////////////
  Brush.prototype.end = function (ctx) { //结束
    ctx = ctx || this.ctx;
    this.endFunc();
    this.widthPrev = null;
    this.pt = null;
    ctx.closePath();
    ctx.fillStyle = null;
    ctx.strokeStyle = null;
    var smoothNames = this.smoothNames;
    for (var i in smoothNames) {
      var name = smoothNames[i];
      this['smoothList' + name] = [];
    }
    this.isDraw = true;
  };

  Brush.prototype.checkBrushStyle = function () { //查看是否符合画笔标准
    var ctx = this.ctx;
    var brushid = ctx.brushid;
    if (brushid !== this.id) {
      this.setBrushStyles();
      ctx.brushid = this.id;
    }
  };

  Brush.prototype.hsla2color = function () { //默认的hsla转换
    var controls = this.controls;
    if (!controls) return;
    var opacity = controls.opacity ? controls.opacity.value : (this.opacity || 1);
    var hue =  controls.hue ? controls.hue.value : (this.hue || 0.4);
    hue =  hue * 360;
    var lightSat = controls.lightSat ? controls.lightSat.value : (this.lightSat || {sat: 1, light: 1});
    var light = Math.round(lightSat.light * 100);
    var sat = Math.round(lightSat.sat * 100);
    this.color = 'hsla(' + hue + ',' + sat + '%,' + light + '%,' + opacity + ')';
    this.colorShow = 'hsl(' + hue + ',' + sat + '%,' + light + '%)';
    this.colorShowSat = 'hsl(' + hue + ',100%,40%)';
  };
  
  Brush.prototype.change = function (obj) {};
  return Brush;
});