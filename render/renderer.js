'use strict';
define(['./animator','async'],function(Animator,async){

  function Renderer(brushes, opt){
    if(brushes){
      this.brushes = brushes;
    }
    if(opt){
      this.frameH = opt.frameH;
      this.frameW = opt.frameW;
    }
    this.px = 0;
    this.py =0;
    this.pw = this.frameW;
    this.ph = this.frameW;
  }

  function empty(){};

  Renderer.prototype.ptTransform = function(opt, data){
    var ptTransformStr = opt.ptTransform || 'normal';//
    var bbox = {};
    if(ptTransformStr=='center_x'){
      if(data.info){
        bbox = data.info.bbox;
        var xMin = bbox.xMin;
        var yMin = bbox.yMin;
        var xMax = bbox.xMax;
        var yMax = bbox.yMax;
        var dx = xMax - xMin;
        var dy = yMax - yMin;
        this.py = (0.5 - dy/2)*this.frameH;
      }
      return;
    }else if(ptTransformStr=='normal'){
      this.ph = this.frameW;
    }
    // var phi = frameW
    // if()
  };

  Renderer.prototype._ptTransform = function(pt){//绘制的面板可能和看到的不一致
    pt = [pt[0]*this.pw +this.px, pt[1]*this.ph+this.py, pt[2]];
    return pt;
  };

  Renderer.prototype.drawDatas = function(ctx, data, opt) {
    opt = opt || {
        curve:{async:1},
        frame:{async:1}
      };

    this.dataFrameH = data.frameH;
    this.dataFrameW = data.frameW;
    this.ptTransform(opt, data);

    var dType = data.type;
    if (dType === 'frame') {
      this.drawFrame(data, ctx, opt);
      return;
    } else if (dType === 'scene') {
      return;
    } else if (dType === 'group') {
    }
  };


  function dispatch(funcs,done,opt){//对于一组执行队列 区别是异步还是同步的方式
    var asyncBol = true;
    if(opt) asyncBol = opt.async;
    if(asyncBol){
      async.waterfall(funcs,done);
    }else{
      for(var k in funcs){
        if (funcs[k]) funcs[k]();
      }
      if(done) done();
    }
  }

  Renderer.prototype.drawFrame = function(frame, ctx, opt, done) {
    opt = opt ||{
      frame:{async:1},
      curve:{async:1},
    };
    if (frame) {
      var frameOpt = opt.frame;
      var funcs = this.genDrawFrameFuncs(frame,ctx,opt);
      dispatch(funcs,done,frameOpt);
    }
  };

  Renderer.prototype.genDrawFrameFuncs = function(frame, ctx, opt){
    var funcs = [];
    var curve, curves = frame.c;
    for(var index in curves){
      curve = curves[index];
      funcs.push(this.genDrawCurveFunc(curve, ctx, opt));
    }
    return funcs;
  };


  Renderer.prototype.genDrawCurveFunc = function(curve, ctx, opt) {
    var drawCurve = this.drawCurve.bind(this);
    return function(next) {
      drawCurve(curve, ctx, opt, next);
    };
  };

  Renderer.prototype.drawCurveDirect = function(curve, ctx) {
    this.drawCurve(curve, ctx, {
      curve: {
        async: 0
      }
    }, empty);
  };

  Renderer.prototype.drawCurve = function(curve, ctx, opt, done) {
    var curveOpt = opt.curve;
    done = done || function(){};
    var funcs = this.genDrawCurveFuncs(curve, ctx);
    dispatch(funcs,done,curveOpt);
   };

  Renderer.prototype.genDrawCurveFuncs = function(curve, ctx) { //生成绘制一根曲线的函数队列
    var brushType = curve.brushType;
    var style = curve.style;
    var brush = this.brushes[brushType];
    var funcs = [];
    var pt, pts = curve.c,
      ptN = pts.length,
      _ptTransform = this._ptTransform.bind(this);
    for (var index in pts) {
      index = parseInt(index);
      pt = pts[index];
      funcs.push(genDrawPtFunc(pt, brush, ctx, index, ptN, _ptTransform, style));
    }
    return funcs;
  };

  function genDrawPtFunc(pt, brush, ctx, index, ptN, _ptTransform, style){//生成一个画点的方法
      return function(next) {
        drawPt(pt, brush, ctx, index, ptN, _ptTransform, style);
        next && next();
      };
  }

  function drawPt (pt, brush, ctx, index, ptN, _ptTransform, style) { //绘制一个点的过程
    if(!brush) return;
    pt = _ptTransform(pt);
    if (index === '0' || index === 0) {
      brush.setCurveStyles(style);
      brush.begin(ctx, pt);
    }
    else {
      brush.draw(ctx, pt);
    }
    if (index == ptN - 1) {//目前暂时没想到要做什么
      brush.end(ctx);
    }
  }

  return Renderer;
});
