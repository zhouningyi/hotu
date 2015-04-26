'use strict';
//'./../ui/util' 目前暂时不用
define(['zepto', './../utils/utils'], function ($, Utils) {
  var prevant = Utils.prevant; //清除默认事件
  var upper = Utils.upper; //首字母大写
  var keys = Utils.keys; //算对象的keys
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
    this.modelDraw = opt.modelDraw; //数据
    this.containerW = container.width();
    this.containerH = container.height();

    //画板
    this.quality = opt.quality || 2;
    this.dom();

    //画笔相关
    var brushes = this.brushes = opt.brushes;
    this.brushObj = brushes.brushObj;
    var brushTypeList = this.brushTypeList = brushes.brushTypeList; //'lines',
    this.brushIndex = 0;
    this.setBrush(brushTypeList[0]);

    //步骤相关
    this.tmpCurves = []; //临时存储的
    this.backN = 2; //可回退的次数

    //其他
    this.renderer = opt.renderer;
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
    this.tmpCurves = []; //tmp数据储存
    this.modelDraw.beginRecord({
      type: 'frame',
      brush: this.curBrushType
    });
  };

  Painter.prototype.dom = function () {
    var container = this.container;
    this.appendCanvas('bg', container);
    this.layerGroup('main', container);
  };

  Painter.prototype.layerGroup = function (name, container) { //一个多canvas的图层组
    var layerContainer = this['node' + upper(name)] = $('<div class="container transition" id="' + name + '"></div>').appendTo(container);
    this.appendCanvas(upper(name) + 'Back', layerContainer, 2, false);
    this.appendCanvas(upper(name) + 'Front', layerContainer, 2);
    this.appendCanvas(upper(name) + 'Tmp', layerContainer, 2);
  };

  Painter.prototype.appendCanvas = function (name, container, quality, appendBol) { //添加一个canvas层

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
      });
    if (isNone(appendBol) || appendBol) canvas.appendTo(container); //默认是加入dom的;

    canvas = this['canvas' + upper(name)] = canvas[0];
    var ctx = this['ctx' + upper(name)] = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////绘图设置///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Painter.prototype.setBrush = function (brushType) {
    var brush = this.brushObj[brushType];
    if (brush) {
      this.curBrushType = brushType;
      this.modelDraw.setBrushType(brush);
      this.curBrush = brush;
    }
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
      self.modelDraw.setBrushType(brush);
    });
  };

  //////////////////////////start的阶段//////////////////////////
  Painter.prototype.touchstart = function (e) {
    var curBrush = this.curBrush;
    var modelDraw = this.modelDraw;

    prevant(e);
    var pt = this.getPt(e);
    this.startPt = pt;
    this.mvPt = null;
    this.isAfterDown = true; //主要解决pc、mac的问题。
    this.touchStartTime = getTimeAbsolute();

    modelDraw.addCurve();
    modelDraw.addPt(pt);
    var ctx = (curBrush.redraw) ? this.ctxMainTmp : this.ctxMainFront;
    curBrush.begin(ctx, pt);

    var curCurve = this.curCurve = modelDraw.getCurve();
    this.tmpCurves.push({
      curve: curCurve
    });
  };

  //////////////////////////move的阶段//////////////////////////
  Painter.prototype.touchmove = function (e) {
    prevant(e);
    var container = this.container;
    var pt = this.getPt(e);
    var modelDraw = this.modelDraw;
    var brush = this.curBrush;
    var ctx = (this.curBrush.redraw) ? this.ctxMainTmp : this.ctxMainFront;
    if (this.isAfterDown) {
      container.trigger('painter-moving');
      modelDraw.addPt(pt);
      brush.draw(ctx, pt);
      this.mvPt = pt;
    }
  };

  //////////////////////////leave的阶段//////////////////////////
  Painter.prototype.touchleave = function (e) {
    prevant(e);
    if (this.isAfterDown) {
      this.curBrush.end(this.ctxMainFront);
      this.leaveEvents();//touchleave时 按照事件移动距离 对本次操作类型进行判断
      this.doneCurve();//完成绘制
      this.modelDraw.end();
    }
    this.mvPt = null;
    this.isAfterDown = false;
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

  // var ctx = (this.curBrush.redraw) ? this.ctxMainTmp : this.ctxMainFront;

  Painter.prototype.doneCurve = function () { //画完一笔 保存tmpCurves 并决策是否放到栅格化层中
    var tmpCurves = this.tmpCurves;
    var renderer = this.renderer;
    if (tmpCurves.length > this.backN) {
      var obj = tmpCurves.splice(0, 1)[0];
      var curve = obj.curve;
      renderer.drawCurveDirect(curve, this.ctxMainBack); //把出栈的线绘制到后面去
      this.redraw(); //前面的canvas刷新
    } else {
      if (this.curBrush.redraw) {
        this.ctxMainFront.drawImage(this.canvasMainTmp, 0, 0, this.containerW, this.containerH);
      }
    }
    this.ctxMainTmp.clearRect(0, 0, this.containerW, this.containerH);
  };

  Painter.prototype.displayEvents = function () {};
  Painter.prototype.getPt = function (e) { //获取点
    var left = this.left;
    var top = this.top;
    var t = this.getTimeRelative();
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

  Painter.prototype.broadcast = function () { //重新画一次
    this.clean('MainFront');
    var data = this.modelDraw.getData();
    this.renderer.drawDatas(this.ctxMainFront, data);
  };

  Painter.prototype.back = function () { //后退一步
    var tmpCurves = this.tmpCurves;
    if (tmpCurves.length > 0) {
      tmpCurves.pop(); //临时组去除
      this.redraw(); //绘制刷新
      this.modelDraw.back();
    } else {
      console.log('no-more-back');
    }
  };

  Painter.prototype.redraw = function () { //前端canvas重绘
    this.clean('MainFront'); //清除画面
    var tmpCurves = this.tmpCurves;
    var ctxMainFront = this.ctxMainFront;
    var renderer = this.renderer;
    var globalCompositeOperation = ctxMainFront.globalCompositeOperation;
    ctxMainFront.globalCompositeOperation = 'source-over';
    ctxMainFront.drawImage(this.canvasMainBack, 0, 0, this.containerW, this.containerH);//画图的一瞬间 修改globalCompositeOperation 为正常叠加模式！
    ctxMainFront.globalCompositeOperation = globalCompositeOperation;
    for (var k in tmpCurves) {
      var obj = tmpCurves[k];
      renderer.drawCurveDirect(obj.curve, ctxMainFront);
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
    if (!d) {
      return console.log('no reload data');
    }
    var c = d.c;
    var lastCurve = d.c[d.c.length - 1];
    if (lastCurve.c.length === 0) {
      d.splice(d.c.length - 1, d.c.length);
      lastCurve = d.c[d.c.length - 1];
    }
    var self = this;
    var ctxMainFront = this.ctxMainFront;
    var canvasMainBack = this.canvasMainBack;
    var canvasMainFront = this.canvasMainFront;
    this.renderer.drawDatas(this.ctxMainBack, d, {
      curve: {
        async: 0
      },
      frame: {
        async: 1
      },
      doneCurve: function () {
        ctxMainFront.clearRect(0, 0, self.containerW, self.containerH);
        ctxMainFront.drawImage(canvasMainBack, 0, 0, self.containerW, self.containerH);
      },
      done: function () {
        ctxMainFront.clearRect(0, 0, self.containerW, self.containerH);
        ctxMainFront.drawImage(canvasMainBack, 0, 0, self.containerW, self.containerH);
        // console.log(self.curBrush.color);

        body.trigger('update-ui-by-brush');//根据最后一条线的风格 更新ui参数
        self.setBrush(lastCurve.brushType);
        body.trigger('brush-change', self.curBrush);
        body.trigger('animate-render-done');
      }
    }); //画出上一次的数据
  };

  Painter.prototype.grid = function () { //米字格
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

  //暂时不用

  // Painter.prototype.ui = function () { //生成控制面板
  //   this.leftToolPanel();
  // };

  // Painter.prototype.leftToolPanel = function () {
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