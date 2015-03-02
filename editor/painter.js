'use strict';
//'./../ui/util' 目前暂时不用
define(['zepto'], function($) {

  var body = $('body');

  function Painter(container, opt) {
    opt = opt || {};
    container = container || $('.container');
    this.container = container;
    var offset = container.offset();
    this.left = offset.left;
    this.top = offset.top;

    //数据
    this.modelDraw = opt.modelDraw; //数据
    this.containerW = container.width();
    this.containerH = container.height();

    //画板
    this.quality = opt.quality || 1;
    this.dom();

    //画笔相关
    this.brushes = opt.brushes;
    this.brushList = ['ink', 'light', 'lightBlue', 'fatdot', 'thin']; //'lines',
    this.brushIndex = 0;
    this.setBrush(this.brushIndex);

    //步骤相关
    this.tmpCurves = [];//临时存储的
    this.backN = 2;//可回退的次数

    //其他
    this.renderer = opt.renderer;
    this.saveN = 10;
    this.frontDrawIndex = 0;
    this.clickDistance = 4; //判断是否是点击事件
    this.clickTime = 0.15;

    this.editEvents();
  }

  Painter.prototype.beginRecord = function() { //开始数据记录
    this.timeStart = getTimeAbsolute(); //开始计时
    this.tmpCurves = [];//tmp数据储存
    this.modelDraw.beginRecord({
      type: 'frame',
      brush: this.curBrushName
    });
  };

  Painter.prototype.dom = function() {
    var container = this.container;
    this.appendCanvas('bg', container);
    this.layerGroup('main', container);
  };

  Painter.prototype.layerGroup = function(name, container) { //一个多canvas的图层组
    var layerContainer = this['node' + upper(name)] = $('<div class="container transiton" id="' + name + '"></div>').appendTo(container);
    this.appendCanvas(upper(name) + 'Back', layerContainer, 2);
    this.appendCanvas(upper(name) + 'Front', layerContainer, 1.5);
  };

  Painter.prototype.appendCanvas = function(name, container, quality) { //添加一个canvas层
    var w = this.containerW;
    var h = this.containerH;
    quality = quality || this.quality;
    var canvas = $('<canvas width="' + w * quality + '" height="' + h * quality + '" id="' + name + '"></canvas>')
      .css({
        'position': 'absolute',
        'top': 0,
        'left': 0,
        'width': w,
        'height': h
      }).appendTo(container);
    canvas = this['canvas' + upper(name)] = canvas[0];
    var ctx = this['ctx' + upper(name)] = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////绘图设置///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Painter.prototype.setBrush = function(brushIndex) {
    var brushes = this.brushes;
    var brushList = this.brushList || keys(brushes);

    if (brushIndex === undefined || brushIndex === null) {
      this.brushIndex = (this.brushIndex + 1) % brushList.length;
    } else {
      this.brushIndex = brushIndex;
    }
    var curBrushName = this.curBrushName = brushList[this.brushIndex];
    this.modelDraw.setBrushType(curBrushName);
    var curBrush = this.curBrush = brushes[curBrushName];
    curBrush.styles();
    $('body').trigger('brush-change', curBrush);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Painter.prototype.editEvents = function() {
    this.isAfterDown = false;
    this.container
      .on('touchstart mousedown', this.touchstart.bind(this))
      .on('touchmove mousemove', this.touchmove.bind(this))
      .on('touchend mouseup touchleave mouseout', this.touchleave.bind(this));
  };

  Painter.prototype.touchstart = function(e) {
    prevant(e);
    var modelDraw = this.modelDraw;
    var pt = this.getPt(e);
    var curBrush = this.curBrush;
    modelDraw.addCurve();
    // modelDraw.addPt(pt);
    curBrush.begin(this.ctxMainFront, pt);
    this.startPt = pt;
    this.touchStartTime = getTimeAbsolute();
    this.mvPt = null;
    this.isAfterDown = true; //主要解决pc、mac的问题。
    var curCurve = this.curCurve = this.modelDraw.curCurve;
    this.tmpCurves.push({
      curve: curCurve,
      brush: curBrush
    });
  };

  Painter.prototype.drawCurCurve = function(pt) {
    // var tmpCurves = this.tmpCurves;
    // var renderer = this.renderer;
    // var ctxMainFront = this.ctxMainFront;
    // for(var k in tmpCurves){
    //   var obj = tmpCurves[k];
    //   renderer.drawCurveDirect(obj.curve, obj.brush, ctxMainFront);
    // }

    var ctxMainFront = this.ctxMainFront;
    var brush = this.curBrush;
    brush.draw(ctxMainFront,pt);
  };

  Painter.prototype.touchmove = function(e) {
    prevant(e);
    var pt = this.getPt(e);
    var modelDraw = this.modelDraw;
    if (this.isAfterDown) {
      modelDraw.addPt(pt);
      this.mvPt = pt;
      this.drawCurCurve(pt);
    }
  };

  Painter.prototype.touchleave = function(e) {
    prevant(e);
    this.isAfterDown = false;
    this.curBrush.end(this.ctxMainFront);
    var dt = getTimeAbsolute() - this.touchStartTime;

    var mvPt = this.mvPt;
    if (mvPt) { //具有touch事件
      var distance = Math.sqrt(Math.pow(mvPt[0] - this.startPt[0], 2) + Math.pow(mvPt[1] - this.startPt[1], 2));
      if (distance < this.clickDistance) {
        this.container.trigger('painter-click');
      }
    } else {
      if (dt > this.clickTime) {
        this.curBrush.dot(this.ctxMainBack, this.startPt, dt);
      } else {
        this.container.trigger('painter-click');
      }
    }
    this.doneCurve();
  };

  Painter.prototype.doneCurve = function() {//画完一笔 保存tmpCurves 并决策是否放到栅格化层中
    var tmpCurves = this.tmpCurves;
    var renderer = this.renderer;
    if (tmpCurves.length > this.backN) {
      var obj = tmpCurves.splice(0, 1)[0];
      console.log(obj);
      var curve = obj.curve;
      var brush = obj.brush;
      renderer.drawCurveDirect(curve, brush, this.ctxMainBack);

      this.clean('MainFront');
      for(var k in tmpCurves){
        var obj1 = tmpCurves[k];
        var curve1 = obj1.curve;
        var brush1 = obj1.brush;
        renderer.drawCurveDirect(curve1, brush1, this.ctxMainFront);
      }
    }
  };

  Painter.prototype.displayEvents = function() {};
  Painter.prototype.getPt = function(e) { //获取点
    var left = this.left;
    var top = this.top;
    var t = this.getTimeRelative();
    if (e.type.indexOf('mouse') !== -1) {
      var x = e.x || e.pageX;
      var y = e.y || e.pageY;
      return [x - left, y - top, t];
    }
    var touch = window.event.touches[0];
    // console.log(touch);
    return [touch.pageX - left, touch.pageY - top, t];
  };

  function prevant(e) { //清除默认事件
      e.preventDefault();
      e.stopPropagation();
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////下载上传///////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // var _fixType = function(type) {
    //   type = type.toLowerCase().replace(/jpg/i, 'jpeg');
    //   var r = type.match(/png|jpeg|bmp|gif/)[0];
    //   return 'image/' + r;
    // };

  Painter.prototype.save = function(obj, cb) {
    if (this.modelDraw) this.modelDraw.save(obj, cb);
  };

  Painter.prototype.toImage = function() {
    return [this.canvasMainBack,this.canvasMainFront];
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////其他操作///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Painter.prototype.getTimeRelative = function() {
    return getTimeAbsolute() - this.timeStart;
  };

  function getTimeAbsolute() {
    return new Date().getTime() * 0.001;
  }

  Painter.prototype.clean = function(name) { //清除画面
    if(name){
     name = upper(name);
    var ctx = this['ctx' + name];
    ctx.closePath();
    ctx.clearRect(0, 0, this.containerW, this.containerH);
  }else{
    this.clean('MainBack');
    this.clean('MainFront');
  }
  };

  Painter.prototype.restart = function() { //重启
    this.clear();
    body.trigger('refresh-dataid');
    this.beginRecord();
  };

  Painter.prototype.clear = function() { //数据都初始化
    this.modelDraw.clear();
    this.clean();
  };

  Painter.prototype.broadcast = function() { //重新画一次
    this.clean('MainBack');
    this.clean('MainFront');
    var data = this.modelDraw.getData();
    this.renderer.drawDatas(this.ctxMainFront, data);
  };

  Painter.prototype.back = function() { //后退一步
    var tmpCurves = this.tmpCurves;
    var ctxMainFront = this.ctxMainFront;
    var renderer = this.renderer;
    this.clean('MainFront');
    if(tmpCurves.length>0){
      tmpCurves.pop();
      for(var k in tmpCurves){
        console.log(k);
        var obj = tmpCurves[k];
        renderer.drawCurveDirect(obj.curve, obj.brush, ctxMainFront);
      }
      this.modelDraw.back();
    }else{
      console.log('no-more-back');
    }
  };

  Painter.prototype.blur = function() { //弱化
    this.nodeMain.css({
      opacity: 0.1
    });
  };

  Painter.prototype.unblur = function() { //还原
    this.nodeMain.css({
      opacity: 1
    });
  };

  Painter.prototype.grid = function() { //米字格
    var containerW = this.containerW;
    var containerH = this.containerH;
    var phi = 0.12;
    var offset = containerW * phi;
    var p1 = [offset, offset];
    var p2 = [containerW - offset, offset];
    var p3 = [containerW - offset, containerH - offset];
    var p4 = [offset, containerH - offset];

    var p12 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    var p23 = [(p2[0] + p3[0]) / 2, (p2[1] + p3[1]) / 2];
    var p34 = [(p3[0] + p4[0]) / 2, (p3[1] + p4[1]) / 2];
    var p41 = [(p4[0] + p1[0]) / 2, (p4[1] + p1[1]) / 2];

    var ctx = this.ctxMainBack;
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.stroke();
    //+线
    ctx.strokeStyle = 'rgba(200,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.moveTo(p12[0], p12[1]);
    ctx.lineTo(p34[0], p34[1]);
    ctx.moveTo(p23[0], p23[1]);
    ctx.lineTo(p41[0], p41[1]);
    ctx.stroke();
    //斜线
    ctx.strokeStyle = 'rgba(200,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.moveTo(p2[0], p2[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.stroke();
    ctx.closePath();
  };

  //算对象的keys
  function keys(o) {
    var result = [];
    for (var k in o) {
      result.push(k);
    }
    return result;
  }

  function upper(str) {
    return str[0].toUpperCase() + str.slice(1);
  }


  //暂时不用

  // Painter.prototype.ui = function() { //生成控制面板
  //   this.leftToolPanel();
  // };

  // Painter.prototype.leftToolPanel = function() {
  //   //map 就是节点式编程
  //   var drawToolsObj = {
  //     tags: ['iconfont_mobile', 'tool_left'],
  //     c: [{
  //         'id': 'brush',
  //         'tags': ['importance_mid'],
  //         'icon': 'brush',
  //         'help': '笔刷'
  //       }, {
  //         'id': 'background',
  //         'tags': ['importance_mid'],
  //         'icon': 'layer',
  //         'help': '背景'
  //       },
  //        {
  //         'id': 'transfer',
  //         'tags': ['importance_mid'],
  //         'icon':'transfer',
  //         'help':'滤镜'
  //       },
  //       {
  //         'id': 'broadcast',
  //         'tags': ['importance_mid'],
  //         'icon':'broadcast',
  //         'help':'动画'

  //       },
  //       {
  //         'id': 'refresh',
  //         'tags': ['importance_mid'],
  //         'icon': 'refresh',
  //         'help': '刷新'
  //       }

  //     ]
  //   };
  //   var drawTools = $('#draw-tools');
  //   UiUtil.genIconList(drawToolsObj, drawTools);
  //   // var drawToolHelp =$('<div class="draw-tools-icon-help"><div>');
  //   // drawTools.append(drawToolHelp);
  // };
  return Painter;
});
