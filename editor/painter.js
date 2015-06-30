'use strict';
//'./../ui/util' 目前暂时不用
define(['zepto', './../utils/utils', './../render/painter_renderer'], function ($, Utils, PainterRenderer) {
  var prevent = Utils.prevent; //清除默认事件
  var upper = Utils.upper; //首字母大写
  var isNone = Utils.isNone; //是否存在

  var body = $('body');

  function Painter(container, opt) {
    opt = opt || {};
    container = container || $('.container');
    this.container = container;
    var offset = container.offset();
    this.left = offset.left;
    this.top = offset.top;

    //数据
    this.modelDraw = opt.modelDraw;
    this.containerW = container.width();
    this.containerH = container.height();

    //画板
    this.quality = opt.quality || 2;
    this.addLayers();

    //画笔相关
    var brushes = this.brushes = opt.brushes;
    var brushObj = this.brushObj = brushes.brushObj;
    var brushTypeList = this.brushTypeList = brushes.brushTypeList; //'lines',
    this.brushIndex = 0;
    this.setBrush(brushTypeList[0]);

    //步骤相关
    this.cacheCurves = []; //临时存储的
    var backN = this.backN = 2//opt.backN || 2; //可回退的次数

    //其他
    this.renderer = new PainterRenderer({
      backN: backN,
      brushes: brushObj,
      ctxFront: this.ctxMainFront,
      ctxBack: this.ctxMainBack
    });
    this.saveN = 10;
    this.frontDrawIndex = 0;
    this.clickDistance = 4; //判断是否是点击事件
    this.clickTime = 0.15;

    this.editEvents();
    this.uiEvents();
    this.painteWorkEvents();
  }

  Painter.prototype.beginRecord = function () { //开始数据记录
    this.timeStart = getTimeAbsolute(); //开始计时
    this.cacheCurves = []; //tmp数据储存
    this.modelDraw.beginRecord({frameW: this.containerW, frameH: this.containerH});
  };

  Painter.prototype.addLayers = function () {
    var container = this.container;
    this.appendCanvas('bg', container);
    this.layerGroup('main', container);
  };

  Painter.prototype.layerGroup = function (name, container) { //一个多canvas的图层组
    var quality = this.quality;
    var layerContainer = this['node' + upper(name)] = $('<div class="container" id="' + name + '"></div>').appendTo(container);
    this.appendCanvas(upper(name) + 'Back', layerContainer, quality, false);//////////////////////sssadadcqfc
    this.appendCanvas(upper(name) + 'Front', layerContainer, quality);
  };

  Painter.prototype.appendCanvas = function (name, container, quality, appendBol) { //添加一个canvas层
    quality = quality || this.quality || 2;
    var canvas = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '" id="' + name + '"></canvas>')
      .css({
        'position': 'absolute',
        'top': 0,
        'left': 0,
        'width': this.containerW,
        'height': this.containerH
      });
    if (isNone(appendBol) || appendBol) canvas.appendTo(container); //默认是加入dom的;

    canvas = this['canvas' + upper(name)] = canvas[0];
    canvas.quality = quality;

    var ctx = this['ctx' + upper(name)] = canvas.getContext('2d');
    ctx.lineWidth = 0;
    ctx.scale(quality, quality);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////绘图设置///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Painter.prototype.setBrush = function (brushType) {
    if(!brushType) return console.log('没有brushType');
    var brush = this.brushObj[brushType];
    if (!brush) return;
    this.curBrushType = brushType;
    this.curBrush = brush;
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Painter.prototype.editEvents = function () {
    this.isAfterDown = false;
    this.container
      .on('touchstart mousedown', this.touchstart.bind(this))
      .on('touchmove mousemove', this.touchmove.bind(this))
      .on('touchend mouseup touchleave mouseout', this.touchleave.bind(this));
  };

  Painter.prototype.painteWorkEvents = function () {
    var self = this;
    self.painterWorkStatus = false;
    var timeEmit = 900;
    this.container.on('painter-moving touchstart mousedown', function () {
      if (!self.painterWorkStatus) {
        self.painterWorkStatus = true;
      }
      body.trigger('painter-work');
      window.clearTimeout(self.painterUnWorkId);
    });
    this.container.on('touchend mouseup touchleave mouseout', function () {
      self.painterUnWorkId = setTimeout(function () {
        body.trigger('painter-unwork');
        self.painterWorkStatus = true;
      }, timeEmit);
    });
  };

  Painter.prototype.uiEvents = function () {
    var self = this;
    body.on('brush-change', function (e, brush) {
      var brushType = brush.id;
      self.curBrush = brush;
      self.curBrushType = brushType;
    });
  };

  //////////////////////////start的阶段//////////////////////////
  Painter.prototype.touchstart = function (e) {
    var pt = this.getPt(e);
    this.startPt = pt;
    this.mvPt = null;
    this.isAfterDown = true; //主要解决pc、mac的问题。
    this.touchStartTime = getTimeAbsolute();
    this.curBrush.begin(pt, this.ctxMainFront);
    prevent(e);
  };

  //////////////////////////move的阶段//////////////////////////
  Painter.prototype.touchmove = function (e) {
    if (!this.isAfterDown) return;
    var pt = this.getPt(e);
    this.mvPt = pt;
    this.container.trigger('painter-moving');
    this.curBrush.draw(pt, this.ctxMainFront);
    prevent(e);
  };

  //////////////////////////leave的阶段//////////////////////////
  Painter.prototype.touchleave = function (e) {
    if (this.isAfterDown) {
      var curve = this.curBrush.end(this.ctxMainFront);
      this.modelDraw.addCurve(curve);
      this.cacheCurves.push(curve);
      this.leaveEvents();//touchleave时 按照事件移动距离 对本次操作类型进行判断
      this.doneCurve();//完成绘制
    }
    this.mvPt = null;
    this.isAfterDown = false;
    prevent(e);
  };

  Painter.prototype.leaveEvents = function () {
    var dt = getTimeAbsolute() - this.touchStartTime;
    var mvPt = this.mvPt;
    if (mvPt) { //具有touch事件
      var distance = Math.sqrt(Math.pow(mvPt[0] - this.startPt[0], 2) + Math.pow(mvPt[1] - this.startPt[1], 2));
      if (distance < this.clickDistance) {
        this.container.trigger('painter-click');
      }
    } else {
      if (dt > this.clickTime) {
        this.curBrush.dot(this.ctxMainFront, this.startPt, dt);
      } else {
        this.container.trigger('painter-click');
      }
    }
  };

  Painter.prototype.doneCurve = function () { //画完一笔 保存cacheCurves 并决策是否放到栅格化层中
    var cacheCurves = this.cacheCurves;
    var renderer = this.renderer;
    if (cacheCurves.length > this.backN) {
      var curve = cacheCurves.splice(0, 1)[0];
      renderer.renderCurve(curve, this.ctxMainBack); //把出栈的线绘制到后面去
      this.redraw();//canvasFront刷新
    }
  };

  Painter.prototype.redraw = function () { //前端canvas重绘
    this.clean('MainFront'); //清除画面
    var cacheCurves = this.cacheCurves;
    var ctxMainFront = this.ctxMainFront;
    var renderer = this.renderer;
    // console.log(cacheCurves);
    renderer.redrawCurves(cacheCurves);
    // var globalCompositeOperation = ctxMainFront.globalCompositeOperation;
    // ctxMainFront.globalCompositeOperation = 'source-over';
    // ctxMainFront.drawImage(this.canvasMainBack, 0, 0, this.containerW, this.containerH);//画图的一瞬间 修改globalCompositeOperation 为正常叠加模式！
    // ctxMainFront.globalCompositeOperation = globalCompositeOperation;
    // for (var k in cacheCurves) {
    //   var obj = cacheCurves[k];
    //   renderer.renderCurve(obj.curve, ctxMainFront);
    // }
  };

  Painter.prototype.displayEvents = function () {};
  Painter.prototype.getPt = function (e) { //获取点
    var left = this.left;
    var top = this.top;
    var t = this.getTimeRelative();
    t = t.toFixed(4);
    if (e.type.indexOf('mouse') !== -1) {
      var x = e.x || e.pageX;
      var y = e.y || e.pageY;
      return [x - left, y - top, t];
    }
    var touch = window.event.touches[0];
    return [touch.pageX - left, touch.pageY - top, t];
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////下载上传///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  // var _fixType = function (type) {
  //   type = type.toLowerCase().replace(/jpg/i, 'jpeg');
  //   var r = type.match(/png|jpeg|bmp|gif/)[0];
  //   return 'image/' + r;
  // };

  Painter.prototype.save = function (obj, cb) {
    if (this.modelDraw) this.modelDraw.save(obj, cb);
  };

  Painter.prototype.toImage = function () {
    return [this.canvasMainFront];
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////其他操作///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Painter.prototype.getTimeRelative = function () {
    return getTimeAbsolute() - this.timeStart;
  };

  function getTimeAbsolute() {
    return new Date().getTime() * 0.001;
  }

  Painter.prototype.clean = function (name) { //清除画面
    if (name) {
      name = upper(name);
      var ctx = this['ctx' + name];
      ctx.closePath();
      ctx.clearRect(0, 0, this.containerW, this.containerH);
    } else {
      this.clean('MainBack');
      this.clean('MainFront');
    }
  };

  Painter.prototype.restart = function () { //重启
    this.clear();
    this.modelDraw.clear();
    body.trigger('refresh-dataid');
    this.beginRecord();
  };

  Painter.prototype.clear = function () { //数据都初始化
    this.modelDraw.clear();
    this.clean();
  };

  Painter.prototype.back = function () { //后退一步
    var cache = this.cacheCurves;
    if (cache.length > 0) {
      cache.pop(); //临时组去除
      this.redraw(); //绘制刷新
      this.modelDraw.back();
    } else {
      if (this.modelDraw.delData){
        // this.reload(this.modelDraw.delData); //容易出问题 不用
      }else{
        console.log('no-more-back');
      }
    }
  };

  Painter.prototype.blur = function () { //弱化
    this.nodeMain.css({
      opacity: 0.1
    });
  };

  Painter.prototype.unblur = function () { //还原
    this.nodeMain.css({
      opacity: 1
    });
  };

  Painter.prototype.reload = function (d) {
    if (!d) return console.log('no reload data');
    var c = d.c;
    if(!c || !c.length) return;
    var lastCurve = c[c.length - 1];
    if (lastCurve.c.length === 0) {
      c.splice(c.length - 1, c.length);
      if(!c.length) return;
      lastCurve = c[c.length - 1];
    }

    this.modelDraw.oldData(d); //存储上次的数据
    var datas = this.renderer.reload(d);
    this.cacheCurves = datas.cache;
  };

  return Painter;
});