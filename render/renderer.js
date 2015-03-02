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
  }

  function empty(){};
  Renderer.prototype.ptTransform = function(frameW, frameH, dataFrameW, dataFrameH){
    // var phi = frameW
    // if()
  };

  Renderer.prototype._ptTransform = function(pt){//绘制的面板可能和看到的不一致
    var frameW = this.frameW;
    pt = [pt[0]*frameW, pt[1]*frameW,pt[2]];
    return pt;
  };

  Renderer.prototype.drawDatas = function(ctx, data, opt) {
    opt = opt || {
        curve:{async:1},
        group:{async:1},
        frame:{async:1}
      };
    var dataFrameH = this.dataFrameH = data.frameH;
    var dataFrameW = this.dataFrameW = data.frameW;
    var frameW = this.frameW;
    var frameH = this.frameH;
    if(frameW!==dataFrameW&&frameH!==dataFrameH){
      this.ptTransform(frameW, frameH, dataFrameW, dataFrameH);
    }

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
    if (frame) {
      var frameOpt = opt.frame;
      var funcs = this.genDrawFrameFuncs(frame,ctx,opt);
      dispatch(funcs,done,frameOpt);
    }
  };

  Renderer.prototype.genDrawFrameFuncs = function(frame, ctx, opt){
    var funcs = [];
    var group, groups = frame.c;
    for(var index in groups){
      group = groups[index];
      funcs.push(this.genDrawGroupFunc(group, ctx, opt));
    }
    return funcs;
  };

  Renderer.prototype.genDrawGroupFunc = function(group, ctx, opt){
    var drawGroup = this.drawGroup.bind(this);
    return function(next){
      drawGroup(group, ctx, opt, next);
    };
  };

  Renderer.prototype.drawGroup = function(group, ctx, opt, done) {
    var groupOpt = opt.group;
    var brushes = this.brushes;

    if (group) {
      // var groupId = group.id;
      var brushType = group.brushType;
      var brush = brushes[brushType];
      var funcs = this.genDrawGroupFuncs(group, brush, ctx, opt);
      dispatch(funcs,done,groupOpt);
    }
  };

  Renderer.prototype.genDrawGroupFuncs = function(group, brush, ctx, opt){
    var funcs = [];
    var curve, curves = group.c;
    for(var index in curves){
      curve = curves[index];
      funcs.push(this.genDrawCurveFunc(curve, brush, ctx, opt));
    }
    return funcs;
  };

  Renderer.prototype.genDrawCurveFunc = function(curve, brush, ctx, opt) {
    var drawCurve = this.drawCurve.bind(this);
    return function(next) {
      drawCurve(curve, brush, ctx, opt, next);
    };
  };

  //
  Renderer.prototype.drawCurveDirect = function(curve, brush, ctx) {
    this.drawCurve(curve, brush, ctx, {
      curve: {
        async: 0
      }
    }, empty);
  };

  Renderer.prototype.drawCurve = function(curve, brush, ctx, opt, done) {
    var curveOpt = opt.curve;
    done = done || function(){};
    var funcs = this.genDrawCurveFuncs(curve, brush, ctx);
    dispatch(funcs,done,curveOpt);
   };



  Renderer.prototype.genDrawCurveFuncs = function(curve, brush, ctx) { //生成绘制一根曲线的函数队列
    var funcs = [];
    var pt, pts = curve.c,
      ptN = pts.length,
      _ptTransform = this._ptTransform.bind(this);
    for (var index in pts) {
      index = parseInt(index);
      pt = pts[index];
      funcs.push(genDrawPtFunc(pt, brush, ctx, index, ptN, _ptTransform));
    }
    return funcs;
  };

  function genDrawPtFunc(pt, brush, ctx, index, ptN, _ptTransform){//生成一个画点的方法
      return function(next) {
        drawPt(pt, brush, ctx, index, ptN, _ptTransform);
        next && next();
      };
  }


  function drawPt (pt, brush, ctx, index, ptN, _ptTransform) { //绘制一个点的过程
    pt = _ptTransform(pt);
    if (index === '0' || index === 0) {
      brush.begin(ctx, pt);
    } else if (index == ptN - 1) {
      brush.end(ctx);
    } else {
      brush.draw(ctx, pt);
    }
  }

  return Renderer;
});
