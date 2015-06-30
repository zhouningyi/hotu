'use strict';
//这个模块和业务关系比较大 负责选择调用哪些模块
define(['./class/mark.v1', './class/pen.v1', './class/fatdot.v1', './class/ink', './class/fatTest', './class/eraser.v1'], function(mark, pen, fatdot, ink, FatTest,  eraser) { //加载brush基类


  // var urlBase = './brush/class/';
  // var arr = ['fatdot', 'ink', 'light', 'marknew', 'pen', 'eraser'];
  // for(var k in arr){
  //   arr[k] = urlBase + arr[k];
  // }
  // require(arr, function(){
  //   for(var k in arguments){
  //     var Brush = arguments[k];
  //     var brush = new Brush();
  //     console.log(brush.id);
  //   }
  // })

  function Brushes() {
    var brushList = this.brushList = [mark, pen, fatdot, FatTest];//pen, light, ink, , eraser
    this.creates(brushList);
  }

  Brushes.prototype.creates = function(brushList) {
    var brushTypeList = this.brushTypeList = [];
    var brushObj = this.brushObj = {};
    for (var i in brushList) {
      var Brush = brushList[i];
      var brush = new Brush();
      var id = brush.id;
      brushObj[id] = brush;
      brushTypeList.push(id);
    }
  };
  return Brushes;
});
