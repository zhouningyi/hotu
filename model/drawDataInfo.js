'use strict';

//对于绘图的数据 进行一次计算

define(['./../utils/utils'], function (Utils) {
  var isNone = Utils.isNone;

  function computeDrawInfo(d) { //计算frame文件的info
    var xMax,xMin,yMax,yMin,x,y,pt;
    var ptN = 0,
      brushes = {},
      brushChangeN = 0;
    var curves = d.c;
    var curve, pts, brushType, brushTypePrev, curBrushInfo;
    for (var i in curves) {
      curve = curves[i];
      brushType = curve.brushType;
      if (isNone(brushes[brushType])) {
        brushes[brushType] = {
          curveN: 0,
          ptN: 0
        };
      }
      curBrushInfo = brushes[brushType];
      curBrushInfo.curveN += 1;
    if (brushType !== (brushTypePrev || brushType)) brushChangeN += 1; //是否换笔刷

    if (curve) {
      pts = curve.c;
      if (pts) {
        for(var k in pts){
          pt = pts[k];
          x = parseFloat(pt[0]);
          y = parseFloat(pt[1]);
          xMax = xMax || x;
          xMin = xMin || x;
          yMax = yMax || y;
          yMin = yMin || y;
          if(xMax<x) xMax=x;
          if(xMin>x) xMin=x;
          if(yMax<y) yMax=y;
          if(yMin>y) yMin=y;
        }
        var ptNInCurve = pts.length;
        ptN+= ptNInCurve;
        curBrushInfo.ptN += ptNInCurve;
      }
    }
    brushTypePrev = brushType;
  }
  return {
    ptN: ptN,
    curveN: curves.length,
    brushChangeN: brushChangeN, //换过多少种的笔刷 至少一种
    brushes: brushes,
    lengthes: {},
    colors: {},
    bbox:{
      xMax:xMax,
      xMin:xMin,
      yMax:yMax,
      yMin:yMin
    }
  };
}

return {
  computeDrawInfo: computeDrawInfo
};
});
