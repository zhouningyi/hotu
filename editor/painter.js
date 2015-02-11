'use strict';
//'./../ui/util' 目前暂时不用
define(['zepto', './../model_draw/model_draw', './../brush/brushes'], function($, ModelDraw, Brushes) {
  function Painter(container) {
    container = container || $('.container');
    this.container = container;
    this.containerW = container.width();
    this.containerH = container.height();

    this.modelDraw = new ModelDraw(); //数据
    this.dom();
    // this.ui();
    //画笔相关
    this.brushes = new Brushes(this.ctx);
    this.brushList = ['fatdot', 'ink', 'light'];
    this.brushIndex = 0;
    this.setBrush(this.brushIndex);
    this.isNew = true;

    this.events();
  }

  Painter.prototype.dataStart = function() {
    this.modelDraw.start('frame', this.curBrushName);
  };



  Painter.prototype.dom = function(obj) {
    obj = obj || {};
    var quality = obj.quality || 2;
    var container = this.container;
    var canvas = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>').css({
      width: this.containerW,
      height: this.containerH
    });
    container.append(canvas);

    canvas = this.canvas = canvas[0];
    var ctx = this.ctx = canvas.getContext('2d');
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
    this.curBrush = brushes[curBrushName];
    this.curBrush.styles();
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Painter.prototype.events = function() {
    this.status = 'none';
    var self = this;
    var container = this.container;
    var startPt, endPt, touchStartTime, touchEndTime, isAfterDown = false;
    container
      .on('touchstart mousedown', function(e) {
        prevant(e);
        if (self.isNew) { //是否是该frame第一次画图
          container.trigger('first-draw');
          self.isNew = false;
        }
        var pt = self.getPt(e);
        self.modelDraw.addCurve();
        self.curBrush.begin(pt);
        startPt = pt;
        touchStartTime = getTimeAbsolute();
        endPt = null;
        isAfterDown = true; //主要解决pc、mac的问题。
      })
      .on('touchmove mousemove', function(e) {
        prevant(e);
        var pt = self.getPt(e);
        if (isAfterDown) {
          self.curBrush.draw(pt);
          self.modelDraw.addPt(pt);
          endPt = pt;
        }
      })
      .on('touchend mouseup touchleave mouseout', function(e) {
        prevant(e);
        isAfterDown = false;
        self.curBrush.end();
        var dt = getTimeAbsolute() - touchStartTime;

        if(endPt){//具有touch事件
          var distance = Math.sqrt(Math.pow(endPt[0] - startPt[0], 2) + Math.pow(endPt[1] - startPt[1], 2));
          if(distance<3){
            container.trigger('painter-click');
          }
        }else{
          if(dt>0.15){
            self.curBrush.dot(startPt, dt);
          }else{
            container.trigger('painter-click');
          }
        }
      })
      .on('first-draw', function() { //开始数据记录 开始计时
        self.timeStart = getTimeAbsolute(); //开始时间 其实应该修改到 开始点击第一笔的时候。
        self.dataStart();
      });
  };

  Painter.prototype.getPt = function(e) { //获取点
    var t = this.getTimeRelative();
    if (e.type.indexOf('mouse') !== -1) {
      var x = e.x || e.pageX;
      var y = e.y || e.pageY;
      return [x, y, t];
    }
    var touch = window.event.touches[0];
    return [touch.pageX, touch.pageY, t];
  };

  function prevant(e) { //清除默认事件
      e.preventDefault();
      e.stopPropagation();
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////下载图片///////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
  var _fixType = function(type) {
    type = type.toLowerCase().replace(/jpg/i, 'jpeg');
    var r = type.match(/png|jpeg|bmp|gif/)[0];
    return 'image/' + r;
  };

  Painter.prototype.download = function() {
    var imgData = this.canvas.toDataURL("image/png");
    // this.container.append();
    document.write('<img src="' + imgData + '" style="width:100%;height:100%;position:absolute;top:0;left:0;"/>');

    // imgData = imgData.replace('image/png','image/octet-stream');
    // window.location.href = imgData;


    // var saveName = '涂书';

    // var saveLink = $('#download')[0];
    // saveLink.href = imgData;
    // saveLink.download = saveName + '.png';

    // var event = document.createEvent('MouseEvents');
    // event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    // saveLink.dispatchEvent(event);
    return;
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

  Painter.prototype.clean = function() {
    var ctx = this.ctx;
    ctx.closePath();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.isNew = true;
  };

  Painter.prototype.redraw = function() {
    this.clean();
    var data = this.modelDraw.getData();
    console.log(data);
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

  Painter.prototype.drawGroups = function(groups) {
    if (groups) {
      var group; //直接遍历
      for (var k in groups) {
        group = groups[k];
        this.drawGroup(group);
      }
    }
  };

  Painter.prototype.drawGroup = function(group) {
    var brushes = this.brushes;
    var drawCurve = this.drawCurve;
    if (group) {
      var brushType = group.brushType;
      var brush = brushes[brushType];
      var curve, curves = group.c;
      if (curves) {
        for (var i in curves) {
          curve = curves[i];
          drawCurve(curve, brush);
        }
      }
    }
  };

  // Painter.prototype.animateGroup = function(group) {
  //   var brushes = this.brushes;
  //   var drawCurve = this.drawCurve;

  // };

  Painter.prototype.drawCurve = function(curve, brush) {
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

  //算对象的keys
  function keys(o) {
    var result = [];
    for (var k in o) {
      result.push(k);
    }
    return result;
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
