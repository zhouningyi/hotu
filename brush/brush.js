'use strict';

// brush 初始设置为this.style() 绘制有3个过程 开始画线 画线和 结束
define(['./easing', './../utils/utils', './../libs/event', './smooth'], function(Easing, Utils, Event, Smooth) {
  var isNone = Utils.isNone;
  var extend = Utils.extend;

  var sqrt = Math.sqrt,
    pow = Math.pow,
    abs = Math.abs;

  var emptyFunc = function() {};
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


  function Brush(opt) {
    this.opt = opt || {};
    this.setBrushStyles();
    extend(this, opt);
    this.initSmoothes();
    this.addHooks();
  }

  Event.extend(Brush, {
    isComputeCurvature: 1,
    maxSmoothN: 10,
    Easing: Easing,
    ptIndexInCurve: 0,
    dlLimit: 2, //多少像素以内的间距不绘制
    begin: function(pt, ctx) {
      this.setCtx(ctx);
      this.checkBrushStyle(); //是否ctx的绘图参数是否正确 属于本brush
      this.setCurveStyles();
      this.reset();
      this.ptP = this.firstPt = pt;//记录第一个点
      this.emit('begin', {
        pt: pt
      });
    },
    initSmoothes: function () {
      var smooth = this.smooth,
        obj, smoothN, easing;
      if (!smooth) return;
      for (var key in smooth) {
        obj = smooth[key];
        easing = obj.easing;
        smoothN = obj.smoothN;
        smooth[key] = new Smooth({
          smoothN: smoothN,
          easing: easing
        });
      }
    },

    reset: function () {
      this.ptIndexInCurve = 0;
      this.resetSmoothes();
    },

    resetSmoothes: function () {
      var smooth = this.smooth,
        obj, smoothN, easing;
      if (!smooth) return;
      for (var key in smooth) {
        obj = smooth[key];
        easing = obj.easing;
        smoothN = obj.smoothN;
        smooth[key].reset();
      }
    },
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
    draw: function (pt, ctx) { //中间过程
      if (!ctx || !pt) return console.log('ctx|pt缺失');
      var ctx = this.setCtx(ctx || this.ctx);
      var record = this.processing(pt);
      if (record) {
        ctx.save();
        this.emit('draw', record);
        if (this.ptIndexInCurve++ === 2) this.emit('second');
        ctx.restore();
        return this.pt;
      }
      return false;
    },

    processing: function (pt) { //绘制点的中间件 计算出速度、平均值等相关量
      var ptPP, ptP, dt, dx, dy, dl, v, vk, ddx, y1, y2, kCurve;
      var vmax = 6000;
      var record = {};
      //记录
      ptPP = this.ptPP;
      ptP = this.ptPP = this.ptP;
      this.ptP = pt;
      //第一次则不返回
      if (!ptP) return;

      dx = pt[0] - ptP[0];
      dy = pt[1] - ptP[1];
      dl = sqrt(dx * dx + dy * dy);
      if (dl < this.dlLimit) return;
      dt = pt[2] - ptP[2];
      v = dl / dt;
      vk = Math.min(v / vmax, 1);//将速度归一化 但现在vmax是设定死的
      if (ptPP && this.isComputeCurvature) kCurve = Utils.getCurvatureBy3Pt(ptPP[0], ptPP[1], ptP[0], ptP[1], pt[0], pt[1]);
      return {
        'speed': v,
        'speedK': vk,
        'dl': dl,
        'ptPrev': ptP,
        'kCurve': kCurve,
        'pt': pt
      };
    },
    addAndGetSmooth: function (key, value) {
      var smooth = this.smooth;
      var obj = smooth[key];
      if (!obj) return console.log('key错误');
      obj.add(value);
      return obj;
    },
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
    end: function(ctx) { //结束
      this.setCtx(ctx);
      var ctx = this.ctx;
      this.pt = null;
      this.emit('end');
      ctx.closePath();
      ctx.fillStyle = null;
      ctx.strokeStyle = null;
    },
    'buttonStyleFunc': emptyFunc,
    'onStyleChange': emptyFunc,
    'checkBrushStyle': function() { //查看是否符合画笔标准
      if (this.ctx.brushid !== this.id) this.setBrushStyles();
    },
    'setBrushStyles': function() { //设置笔刷相关的基本参数
      var ctx = this.ctx;
      var opt = this.opt;
      if (!opt || !ctx) return;
      for (var key in opt) {
        this[key] = opt[key];
      }
      ctx.brushid = this.id;
      this.markCtx(opt);
      //平滑的设置
    },
    'setCurveStyles': function(style, ctx) { //设置风格相关的基本参数
      ctx = this.ctx = ctx || this.ctx;
      var controls = this.controls;
      if (!ctx || !style || !controls) return;

      for (var key in style) {
        controls[key].value = style[key];
      }

      this.markCtx(controls);

      this.emit('style-change', controls);
      return;
    },
    'setCtx': function(ctx) {
      if (!ctx) return;
      return this.ctx = ctx;
    },
    'markCtx': function(obj) { //因为ctx是共用的 把ctx标注特性
      var key, ctx = this.ctx;
      for (key in obj) {
        if (!(key in ctxOpts)) continue;
        ctx[key] = obj[key];
      }
    },
    'hsla2color': function() { //默认的hsla转换
      var controls = this.controls;
      if (!controls) return;
      var opacity = controls.opacity ? controls.opacity.value : (this.opacity || 1);
      var hue = controls.hue ? controls.hue.value : (this.hue || 0.4);
      hue = hue * 360;
      var lightSat = controls.lightSat ? controls.lightSat.value : (this.lightSat || {
        sat: 1,
        light: 1
      });
      var light = Math.round(lightSat.light * 100);
      var sat = Math.round(lightSat.sat * 100);
      this.color = 'hsla(' + hue + ',' + sat + '%,' + light + '%,' + opacity + ')';
      this.colorShow = 'hsl(' + hue + ',' + sat + '%,' + light + '%)';
      this.colorShowSat = 'hsl(' + hue + ',100%,40%)';
    },
    addHooks: function () {
      throw '必须重写，以加入业务逻辑';
    }
  });

  // Brush.prototype.initSmooth = function(variableName, N, type) { //type:back.inout
  //   type = type || 'Sinusoidal.In';
  //   this['smoothN' + variableName] = N;
  //   this['smoothList' + variableName] = [];
  //   this.smoothNames.push(variableName);
  //   var typeNames = type.split('.');
  //   var easing = Easing[typeNames[0]][typeNames[1]];
  //   var smoothMap = this['smoothMap' + variableName] = [];
  //   for (var k = 0; k < N; k++) {
  //     smoothMap[k] = easing((k + 1) / N) - easing(k / N);
  //   }
  //   this['smoothFunc' + variableName] = function(k, N) {
  //     return easing((k + 1) / N) - easing(k / N);
  //   };
  // };

  // Brush.prototype.getSmooth = function(variableName, num) { //如果sList的点不足 采用函数处理 点到了阈值 用储存好的list
  //   var smoothN = this['smoothN' + variableName];
  //   var sList = this['smoothList' + variableName];
  //   var smoothMap = this['smoothMap' + variableName];
  //   var sFunc = this['smoothFunc' + variableName];
  //   if (smoothMap) {
  //     sList.push(num);
  //     if (sList.length > smoothN) {
  //       sList.splice(0, 1);
  //       sFunc = function(k) {
  //         return smoothMap[k];
  //       };
  //     }
  //     var ki, result = 0; // ki为权重
  //     var sListN = sList.length;
  //     for (var k = 0; k < sListN; k++) {
  //       var value = sList[k];
  //       ki = sFunc(k, sListN);
  //       result += ki * value;
  //     }
  //     return result;
  //   } else {
  //     console.log('该变量没加入smooth列表');
  //     return null;
  //   }
  // };

  Brush.prototype.buttonStyle = function(node) { //中间过程
    try {
      node.removeStyle('box-shadow').removeStyle('text-shadow').removeStyle('border');
    } catch (e) {}
    this.buttonStyleFunc(node);
  };


  Brush.prototype.change = function(obj) {};
  return Brush;
});