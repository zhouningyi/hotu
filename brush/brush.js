'use strict';

// brush 初始设置为this.style() 绘制有3个过程 开始画线 画线和 结束
define(['./../utils/utils', './../libs/event', './smooth'], function (Utils, Event, Smooth) {
  var isNone = Utils.isNone;
  var extend = Utils.extend;

  var sqrt = Math.sqrt,
    pow = Math.pow,
    acos = Math.acos,
    asin = Math.asin,
    abs = Math.abs;

  function Brush(opt) {
    this.init(opt);
  }

  Event.extend(Brush, {
    type: 'brush',
    'init': function (opt){
      this.opt = opt || {};
      this.setBrushStyles();
      extend(this, opt);
      this._initSmoothes();
      this.initSmoothes();
      this.addHooks();
    },
    'isComputeCurvature': 1,
    'maxSmoothN': 40,
    'Easing': Easing,
    'ptIndexInCurve': 0,
    'smoothX': {
      'easing': 'Sinusoidal.In',
      'smoothN': 8
    },
    'smoothY': {
      'easing': 'Sinusoidal.In',
      'smoothN': 8
    },
    'smoothSpeed': {
      'easing': 'Sinusoidal.Out',
      'smoothN': 10
    },
    dlLimit: 2, //多少像素以内的间距不绘制
    begin: function (pt, ctx) {
      this.dataArray = [pt];//数据
      this.setCtx(ctx);
      this.setBrushStyles(); //是否ctx的绘图参数是否正确 属于本brush
      this.reset();
      this.ptP = this.firstPt = pt;//记录第一个点
      this.processing(pt);
      this.emit('begin', {
        pt: pt
      });
    },
    _initSmoothes: function (){
      var list = ['smoothX','smoothY','smoothSpeed'];
      for(var i in list){
        var key = list[i];
        var obj = this[key];
        this[key] = new Smooth({
          maxSmoothN: this.maxSmoothN,
          id: key,
          smoothN: obj.smoothN,
          easing: obj.easing
        });
      }
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
          maxSmoothN: this.maxSmoothN,
          smoothN: smoothN,
          easing: easing
        });
      }
      this.hsla2color();
    },

    reset: function () {
      this.ptIndexInCurve = 0;
      this.resetSmoothes();
    },

    resetSmoothes: function () {
      //默认部分
      this.smoothX.reset();
      this.smoothY.reset();
      this.smoothSpeed.reset();

      //用户设置部分
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
    // dynamicSmooth: function (record){
    //   var smoothes = record.smoothes;
    //   var speedK = smoothes.speed/ 6000;
    //   var smoothN = parseInt(this.smoothX.maxSmoothN * Math.pow(speedK, 0.6));
    //   console.log(smoothN);
    //   this.smoothX.setSmoothN(smoothN);
    //   this.smoothY.setSmoothN(smoothN);
    // },

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
    draw: function (pt, ctx) { //中间过程
      if (!ctx || !pt) return console.log('ctx|pt缺失');
      this.dataArray.push(pt);
      var ctx = this.setCtx(ctx || this.ctx);
      var record = this.processing(pt);
      record = this._updateSmooth(record);
      // this.dynamicSmooth(record);
      if (record) {
        this.emit('draw', record);
        if (this.ptIndexInCurve++ === 2) this.emit('second', record);
        return this.pt;
      }
      return false;
    },

    dot: function () {

    },

    _updateSmooth: function (record) {
      if(!record) return;
      var x, y,speed, sx, sy, sspeed, dx, dy, dxP, dyP, dPhi, dl;
      var pt = record.pt;
      var smoothes = {};
      sx = this.smoothX.add(pt[0]);//x更新
      sy = this.smoothY.add(pt[1]);//y更新
      sspeed = this.smoothSpeed.add(record.speed);//speed更新
      var dx = sx.value - sx.valueP, dy = sy.value - sy.valueP, dxP = sx.valueP - sx.valuePP,dyP = sy.valueP - sy.valuePP;
      dPhi = acos((dx * dxP + dy * dyP)/ sqrt(dx * dx + dy * dy) / sqrt(dxP * dxP   + dyP * dyP ));
      dl = sqrt(dx * dx + dy * dy);
      var smoothes = {
        xPP: sx.valuePP,
        xP:  sx.valueP,
        x:   sx.value,
        yPP: sy.valuePP,
        yP:  sy.valueP,
        y :  sy.value,
        dx:  dx,
        dy:  dy,
        dxP: dxP,
        dyP:  dyP,
        dPhi: dPhi,
        dl: dl,
        speedPP: sspeed.valuePP,
        speedP:  sspeed.valueP,
        speed:   sspeed.value,
        speedK: Math.min(sspeed.value / 6000, 1),
        kCurve: Utils.getCurvatureBy3Pt(sx.valuePP, sy.valuePP, sx.valueP, sy.valueP, sx.value, sy.value) || 0//曲率更新
      };
      record.smoothes = smoothes;
      return record;
    },

    processing: function (pt) { //绘制点的中间件 计算出速度、平均值等相关量
      var ptPP, ptP, dt, dx, dy, dl, v, vk, ddx, y1, y2, kCurve;
      var vmax = 6000;
      //记录
      ptPP = this.ptPP;
      ptP = this.ptPP = this.ptP;
      this.ptP = pt;
      //第一次则不返回
      if (!ptP) return;
      
      var x = pt[0], y = pt[1], xP = ptP[0], yP = ptP[1];
      dx = x - xP;
      dy = y - yP;
      dl = sqrt(dx * dx + dy * dy);
      dt = pt[2] - ptP[2];
      v = dl / dt;
      vk = Math.min(v / vmax, 1);//将速度归一化 但现在vmax是设定死的

      // var dPhi = acos((dx*dxP + dy*dyP)/ sqrt(dx * dx + dy * dy)/sqrt(dxP * dxP   + dyP * dyP ));
      // if(abs(dPhi)<0.02){
      //   this.record = false;
      //   return false;
      // } 
      if (ptPP && this.isComputeCurvature) kCurve = Utils.getCurvatureBy3Pt(ptPP[0], ptPP[1], ptP[0], ptP[1], pt[0], pt[1]);
      return this.record = {
        'speed': v,
        'speedK': vk,
        'dl': dl,
        'kCurve': kCurve,
        'pt': pt,
        'ptPP':ptPP,
        'ptP':ptP,
        'x': x,
        'y': y,
        'xP': xP,
        'yP': yP,
        'dx':dx,
        'dy':dy
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
    end: function (ctx) { //结束
      this.emit('end');
      this.setCtx(ctx);
      var ctx = this.ctx;
      this.pt = null;
      ctx.fillStyle = null;
      ctx.strokeStyle = null;
      this.record = null;
      this.smoothes = null;
      this.ptPP = null;
      this.ptP = null;
      this.pt = null;
      return {
        c: this.dataArray,
        style: this.getCurveStyles(),
        brushType: this.id,
        type: 'curve'
      };
    },
    'buttonStyleFunc': function () {},
    'onStyleChange': function () {},
    'setBrushStyles': function () { //设置笔刷相关的基本参数
      var ctx = this.ctx;
      if (!ctx || ctx.brushid === this.id) return;
      ctx.brushid = this.id
      Utils.resetCtx(ctx, this);
    },
    getValue: function (key) {
      if(key === 'color') {
        if(this.controls.lightSat) {
          this.hsla2color();
        }  
      }
      if(this.controls && this.controls[key]) return this.controls[key].value;
      return this[key];
    },
    'setCurveStyles': function (style, ctx) { //设置风格相关的基本参数
      if(!style) return;
      ctx = this.ctx = ctx || this.ctx;
      var controls = this.controls;
      if (!ctx || !style || !controls) return;

      for (var key in style) {
        if(controls[key]) {
          controls[key].value = style[key];
        }
      }
      Utils.resetCtx(ctx, controls);
      this.emit('style-change', controls);
      return;
    },
    'getCurveStyles': function () {
      var style = {}, controls = this.controls;
      for (var key in controls) {
        style[key] = controls[key].value;
      }
      return style;
    },
    'setCtx': function (ctx) {
      if (!ctx) return;
      return this.ctx = ctx;
    },
    'setControl': function(key, value){
      var controls = this.controls;
      if(!key || value === undefined || value === null || !controls || !controls[key]) return;
      if(controls[key].value === value) return;
      controls[key].value = value;
      this.emit('style-change', {key:key,value:value});
    },
    offsetColor: function(hsla, percent){
      var cs = hsla.split(',');
      cs[1] = Math.floor(Math.min(cs[1].split('%')[0] * ( 1 + percent), 100)) + '%';
      cs[2] = Math.floor(Math.min(cs[2].split('%')[0] * ( 1 - percent), 100)) + '%';
      hsla = cs.join(',');
      return hsla;
    },
    hsla2color: function () { //默认的hsla转换
      var controls = this.controls;
      if (!controls || !controls.lightSat) return;
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
      this.colorShowSat = 'hsl(' + hue + ',100%, 40%)';
    },
    getColorShow: function(){
      this.hsla2color();
      return this.colorShow;
    },
    addHooks: function () {
      throw '必须重写，以加入业务逻辑';
    }
  });

  Brush.prototype.buttonStyle = function (node) { //中间过程
    try {
      node.removeStyle('box-shadow').removeStyle('text-shadow').removeStyle('border');
    } catch (e) {}
    this.buttonStyleFunc(node);
  };


  Brush.prototype.change = function (obj) {};
  return Brush;
});