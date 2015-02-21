'use strict';
//'./../ui/util' 目前暂时不用
define(['zepto'], function($) {

  function Painter(container, opt) {
    opt = opt || {};
    container = container || $('.container');
    this.container = container;
    var offset = container.offset();
    this.left = offset.left;
    this.top = offset.top;

    //数据
    this.modelDraw = opt.modelDraw;//数据
    this.containerW = container.width();
    this.containerH = container.height();

    //画板
    this.quality = opt.quality || 2;
    this.dom();

    //画笔相关
    this.brushes = opt.brushes;
    this.brushList = ['ink', 'light', 'lightBlue', 'fatdot', 'thin'];//'lines',
    this.brushIndex = 0;
    this.setBrush(this.brushIndex);


    //其他
    this.renderer = opt.renderer;
    this.saveN = 10;
    this.frontDrawIndex = 0;

    var isAutoSave = this.isAutoSave = false;
    var isLoadLast = this.isLoadLast = true;
    if (isLoadLast) {
      this.loadLast();
    }
    if (isAutoSave) {
    }
    this.editEvents();
  }

  Painter.prototype.loadLast = function() {//载入上一幅画
    // drawid \ userid
    var self = this;
    self.beginRecord();//开始记录
  };

  Painter.prototype.beginRecord = function() {//开始数据记录
    this.timeStart = getTimeAbsolute();//开始计时
    this.modelDraw.beginRecord({
      type:'frame',
      brush:this.curBrushName
    });
  };


  Painter.prototype.dom = function() {
    var container = this.container;
    this.appendCanvas('bg', container);
    this.layerGroup('main', container);
  };

  Painter.prototype.layerGroup = function(name, container){//一个带有暂存canvas的图层组
    var layerContainer = this['node'+upper(name)] = $('<div class="container transiton" id="'+name+'"></div>').appendTo(container);
    this.appendCanvas(upper(name)+'Back', layerContainer);
    this.appendCanvas(upper(name)+'Front', layerContainer);
  };

  Painter.prototype.appendCanvas = function(name, container, quality){//添加一个canvas层
    var w = this.containerW;
    var h = this.containerH;
    quality = quality || this.quality;
    var canvas = $('<canvas width="' +  w* quality + '" height="' + h * quality + '" id="'+name+'"></canvas>')
    .css({
      'position':'absolute',
      'top':0,
      'left':0,
      'width': w,
      'height': h
    }).appendTo(container);
    canvas = this['canvas'+upper(name)] = canvas[0];
    var ctx = this['ctx'+upper(name)] = canvas.getContext('2d');
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
    this.status = 'none';
    var self = this;
    var container = this.container;
    var startPt, mvPt, touchStartTime, isAfterDown = false;
    var ctxMainBack = this.ctxMainBack;
    container
      .on('touchstart mousedown', function(e) {
        prevant(e);
        var pt = self.getPt(e);
        self.modelDraw.addCurve();
        self.curBrush.begin(ctxMainBack, pt);
        startPt = pt;
        touchStartTime = getTimeAbsolute();
        mvPt = null;
        isAfterDown = true; //主要解决pc、mac的问题。
      })
      .on('touchmove mousemove', function(e) {
        prevant(e);
        var pt = self.getPt(e);
        if (isAfterDown) {
          self.curBrush.draw(ctxMainBack, pt);
          self.modelDraw.addPt(pt);
          mvPt = pt;
        }
      })
      .on('touchend mouseup touchleave mouseout', function(e) {
        prevant(e);
        isAfterDown = false;
        self.curBrush.end(ctxMainBack);
        var dt = getTimeAbsolute() - touchStartTime;

        if (mvPt) { //具有touch事件
          var distance = Math.sqrt(Math.pow(mvPt[0] - startPt[0], 2) + Math.pow(mvPt[1] - startPt[1], 2));
          if (distance < 3) {
            container.trigger('painter-click');
          }
        } else {
          if (dt > 0.15) {
            self.curBrush.dot(ctxMainBack,startPt, dt);
          } else {
            container.trigger('painter-click');
          }
        }
    });
  };

  Painter.prototype.displayEvents = function() {
  };
  Painter.prototype.getPt = function(e) { //获取点
    var left = this.left;
    var top = this.top;
    var t = this.getTimeRelative();
    if (e.type.indexOf('mouse') !== -1) {
      var x = e.x || e.pageX;
      var y = e.y || e.pageY;
      return [x-left, y-top, t];
    }
    var touch = window.event.touches[0];
    // console.log(touch);
    return [touch.pageX-left, touch.pageY-top, t];
  };

  function prevant(e) { //清除默认事件
      e.preventDefault();
      e.stopPropagation();
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////下载上传///////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
  var _fixType = function(type) {
    type = type.toLowerCase().replace(/jpg/i, 'jpeg');
    var r = type.match(/png|jpeg|bmp|gif/)[0];
    return 'image/' + r;
  };

  Painter.prototype.save = function(obj,cb) {
    if (this.modelDraw) this.modelDraw.save(obj,cb);
  };

  Painter.prototype.toImage = function() {
    var imgData = this.canvasMainBack.toDataURL('image/png');
    return $('<img src="' + imgData + '"></img>')[0];
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

  Painter.prototype.clean = function() { //只是清除画面
    var containerH = this.containerH;
    var containerW = this.containerW;
    var ctxMain = this.ctxMainBack;
    ctxMain.closePath();
    ctxMain.clearRect(0, 0, containerW, containerH);
  };

  Painter.prototype.restart = function() { //重启
    this.clear();
    this.beginRecord();
  };

  Painter.prototype.clear = function() { //数据都初始化
    this.modelDraw.clear();
    this.clean();
  };

  Painter.prototype.redraw = function() {//重新画一次
    this.clean();
    var data = this.modelDraw.getData();
    this.renderer.drawDatas(this.ctxMainBack,data);
  };

  Painter.prototype.back = function() {//后退一步
    this.modelDraw.back();
  };

  Painter.prototype.blur = function() {//弱化
    this.nodeMain.css({opacity:0.1});
  };

  Painter.prototype.unblur = function() {//还原
    this.nodeMain.css({opacity:1});
  };

  Painter.prototype.grid = function(){//米字格
    var containerW = this.containerW;
    var containerH = this.containerH;
    var phi = 0.12;
    var offset = containerW*phi;
    var p1 = [offset,offset];
    var p2 = [containerW - offset,offset];
    var p3 = [containerW - offset,containerH - offset];
    var p4 = [offset, containerH- offset];

    var p12 = [(p1[0]+p2[0])/2,(p1[1]+p2[1])/2];
    var p23 = [(p2[0]+p3[0])/2,(p2[1]+p3[1])/2];
    var p34 = [(p3[0]+p4[0])/2,(p3[1]+p4[1])/2];
    var p41 = [(p4[0]+p1[0])/2,(p4[1]+p1[1])/2];

    var ctx = this.ctxMainBack;
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1[0],p1[1]);
    ctx.lineTo(p2[0],p2[1]);
    ctx.lineTo(p3[0],p3[1]);
    ctx.lineTo(p4[0],p4[1]);
    ctx.lineTo(p1[0],p1[1]);
    ctx.stroke();
    //+线
    ctx.strokeStyle = 'rgba(200,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.moveTo(p12[0],p12[1]);
    ctx.lineTo(p34[0],p34[1]);
    ctx.moveTo(p23[0],p23[1]);
    ctx.lineTo(p41[0],p41[1]);
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
  function upper(str){
    return str[0].toUpperCase()+str.slice(1);
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
