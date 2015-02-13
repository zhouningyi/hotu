'use strict';
define(function(){

  function Renderer(ctx, brushes){
    if(ctx){
      this.ctx(ctx);
    }
    if(brushes){
      this.brushes = brushes;
    }
  }

  Renderer.prototype.ctx = function(ctx) {
    this._ctx = ctx;
  }

  Renderer.prototype.drawDatas = function(data) {
    var groups, frame, dType = data.type;
    if (dType === 'frame') {
      groups = data.c;
      this.drawGroups(groups);
      return;
    } else if (dType === 'scene') {
      var frames = data.c;
      for (var i in frames) {
        frame = frames[i];
        groups = frame.c;
        this.drawGroups(groups);
      }
      return;
    } else if (dType === 'group') {
      this.drawGroup(data);
    }
  };

  Renderer.prototype.drawGroups = function(groups) {
    if (groups) {
      var group; //直接遍历
      for (var k in groups) {
        group = groups[k];
        this.drawGroup(group, 'async', 50);
      }
    }
  };

  Renderer.prototype.drawGroup = function(group, type, timeout) {
    type = type || 'sync';
    var brushes = this.brushes;
    var drawCurve = this.drawCurve;
    if (group) {
      var brushType = group.brushType;
      var brush = brushes[brushType];
      var curve, curves = group.c;
      if (curves) {
        if (type === 'sync') {
          for (var i in curves) {
            curve = curves[i];
            drawCurve(curve, brush);
          }
        } else if (type === 'async') {
          var aniList = [];
          for (var j in curves) {
            curve = curves[j];
            aniList.push((function(c,b){return function() {
              drawCurve(c, b);
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

  Renderer.prototype.drawCurve = function(curve, brush) {
    if (curve) {
      var pts = curve.c;
      if (pts) {
        for (var k in pts) {
          var pt = pts[k];
          if (k === '0' || k === 0) {
            brush.begin(pt);
          } else if (k == pts.length - 1) {
            brush.end();
          } else {
            brush.draw(pt);
          }
        }
      }
    }
  };

  return Renderer;
});
