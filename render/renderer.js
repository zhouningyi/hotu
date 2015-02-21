'use strict';
define(function(){

  function Renderer(brushes, opt){
    if(brushes){
      this.brushes = brushes;
    }
    if(opt){
      this.frameH = opt.frameH;
      this.frameW = opt.frameW;
    }
  }

  Renderer.prototype.ptTransform = function(frameW, frameH, dataFrameW, dataFrameH){
    // var phi = frameW
    // if()
  };

  Renderer.prototype._ptTransform = function(pt){//绘制的面板可能和看到的不一致
    var frameW = this.frameW;
    pt = [pt[0]*frameW, pt[1]*frameW,pt[2]];
    return pt;
  };

  Renderer.prototype.drawDatas = function(ctx, data) {
    var dataFrameH = this.dataFrameH = data.frameH;
    var dataFrameW = this.dataFrameW = data.frameW;
    var frameW = this.frameW;
    var frameH = this.frameH;
    if(frameW!==dataFrameW&&frameH!==dataFrameH){
      this.ptTransform(frameW, frameH, dataFrameW, dataFrameH);
    }

    var groups, frame, dType = data.type;
    if (dType === 'frame') {
      groups = data.c;
      this.drawGroups(ctx, groups);
      return;
    } else if (dType === 'scene') {
      var frames = data.c;
      for (var i in frames) {
        frame = frames[i];
        groups = frame.c;
        this.drawGroups(ctx, groups);
      }
      return;
    } else if (dType === 'group') {
      this.drawGroup(data);
    }
  };

  Renderer.prototype.drawGroups = function(ctx, groups) {
    if (groups) {
      var group; //直接遍历
      for (var k in groups) {
        group = groups[k];
        this.drawGroup(ctx, group, 'async', 50);
      }
    }
  };

  Renderer.prototype.drawGroup = function(ctx, group, type, timeout) {
    type = type || 'sync';
    var brushes = this.brushes;
    var drawCurve = this.drawCurve.bind(this);
    if (group) {
      var brushType = group.brushType;
      var brush = brushes[brushType];
      var curve, curves = group.c;
      if (curves) {
        if (type === 'sync') {
          for (var i in curves) {
            curve = curves[i];
            drawCurve(ctx, curve, brush);
          }
        } else if (type === 'async') {
          var aniList = [];
          for (var j in curves) {
            curve = curves[j];
            aniList.push((function(c,b){return function() {
              drawCurve(ctx, c, b);
            };})(curve, brush));
          }
          animateDisplay(aniList, timeout);
        }
      }
    }
  };

  function animateDisplay(funcs, timeout) {
      var index = 0;
      var N = funcs.length;
      (function animate() {
        if (index < N) {
          var func = funcs[index];
          func();
          setTimeout(animate, timeout);
          index++;
        }
      })();
    }

  Renderer.prototype.drawCurve = function(ctx, curve, brush) {
    var _ptTransform = this._ptTransform.bind(this);
    if (curve) {
      var pts = curve.c;
      if (pts) {
        for (var k in pts) {
          var pt = pts[k];
          pt = _ptTransform(pt);
          if (k === '0' || k === 0) {
            brush.begin(ctx, pt);
          } else if (k == pts.length - 1) {
            brush.end(ctx);
          } else {
            brush.draw(ctx, pt);
          }
        }
      }
    }
  };

  return Renderer;
});
