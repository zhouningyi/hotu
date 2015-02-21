'use strict';

define(['zepto', 'ui/loading', 'ui/gui', 'editor/bg', 'editor/painter', 'ui/floatTag', 'render/exports', 'brush/brushes', 'model/url', 'wx/weixin','model/model_draw',  'render/renderer'], function($, Loading, Gui, Bg, Painter, FloatTag, Exports, Brushes, Url, Weixin, ModelDraw, Renderer) {

  var clickEvent = 'touchstart mousedown';
  var body = $('body');

  var painter, bg, exports, gui, floatTag, brushes;

  var drawToolsNode = $('#draw-tools');
  var endToolsNode = $('.end-tools');
  var importantToolsNode = $('.important-tools');
  var floatTagNode = $('.float-tag');

  var uiContainer = $('.ui-container');
  var drawContainer = $('.draw-container');
  var bgContainer = $('.bg-container');


  var loadLast = true;
  // var url = new Url();//从url中抽取数值

  function Controller() {
    this.weixin = new Weixin(); //微信的分享机制

    body.on('brush-change', function(e, brush) {
      brush.buttonStyle($('#brush'));
    }); //笔触更换导致ui变化

    this.dispatchBanner(this.init.bind(this), 'direct'); //判断走哪一种方式进入主程序
  }


  Controller.prototype.dispatchBanner = function(cb, type) { //是否要载入banner提示
    if (type === 'direct') {
      return cb();
    }
    new Loading($('.main-container'), cb);
  };

  Controller.prototype.animIn = function() {//动画进入
    importantToolsNode.keyAnim('fadeInLeft',{
      time: 0.4
    });
    drawToolsNode.keyAnim('fadeInLeft', {
      time: 0.6
    });
    endToolsNode.keyAnim('fadeInLeft', {
      time: 0.8
    });
  };

  Controller.prototype.init = function() {
    this.animIn();

    brushes = new Brushes();
    floatTag = new FloatTag(uiContainer);
    // 初始化
    var frameOpt = {
      frameW: drawContainer.width(),
      frameH: drawContainer.height()
    };
    var modelDraw = this.modelDraw = new ModelDraw(frameOpt); //数据
    var renderer = this.renderer = new Renderer(brushes, frameOpt);//动画播放等
    painter = this.painter = new Painter(drawContainer, {
      'brushes': brushes,
      'modelDraw':modelDraw,
      'renderer':renderer
    });
    bg = new Bg(bgContainer);
    exports = new Exports(floatTagNode, bg, painter);
    gui = new Gui();

    this.events();
    this.dispatchLoadlast();
    bg.setBg(0);
  };

  Controller.prototype.dispatchLoadlast = function() { //是否要载入banner提示
    var self = this;
    if (loadLast) {
      this.modelDraw.getLast({}, function(d) {
        if (d) {
          d = JSON.parse(d);
          self.modelDraw.oldData(d); //存储上次的数据
          self.renderer.drawDatas(self.painter.ctxMainBack, d); //画出上一次的数据
        }
        self.painter.beginRecord(); //开始记录
      });
    }else{
      body.trigger('refresh-dataid');
      self.painter.beginRecord();
    }
  };

//事件
  Controller.prototype.events = function() {
    this.painterEvents();
    this.iconEvents();
    this.uiEvents();
  };

  Controller.prototype.painterEvents = function() {
    var self = this;
    body.on('painter-click', function(e) {
      prevant(e);
      if (!self.isGuiLock) {
        gui.switchUI();
      } else { //被底部点击锁定
        gui.inLeft();
        gui.inEnd();
        floatTag.out();
        painter.unblur();
        self.isGuiLock = false;
      }
    }).on('bg-color-change', function(e, color) {
      gui.bgColor(color);
    });
  };

  Controller.prototype.iconEvents = function() {
    //所有iconfont在点击后都会闪动
    $('.iconfont-mobile').one(clickEvent, function() {
      $(this).keyAnim('fadeOutIn', {
        'time': 1,
        'icount': 5,
      });
    });
  };

  Controller.prototype.uiEvents = function() {
    var self = this;
    var drawToolNode = $('#draw-tools');
    drawToolNode.delegate('i', clickEvent, function(e) {
      prevant(e);
      var node = $(this);
      var id = node.attr('id');
      var cbs = {
        'brush': painter.setBrush.bind(painter),
        'background': bg.setBg.bind(bg),
        'broadcast': painter.redraw.bind(painter),
        'refresh': window.location.reload
      };
      if (cbs[id]) cbs[id]();
    });

    //底部的工具
    endToolsNode.delegate('i', clickEvent, function(e) {
      prevant(e);
      var node = $(this);
      var id = node.attr('id');
      var cbs = {
        'download': function() {
          var img = exports.toImage();
          floatTag.in({
            node: node,
            type: 'bottom',
            helpText: '长按上图下载',
            bgImg: img
          }, function() {});
        },
        'submit-message': function() {
          painter.save({},function(bol){
          floatTag.in({
            node: node,
            type: 'bottom',
            helpText: bol?'上传成功':'请您重试' //,
          });
          });
        }
      };
      if (cbs[id]) {
        if (self.isGuiLock) { //已经点开了
          painter.unblur();
          gui.in();
          floatTag.out();
          self.isGuiLock = false;
        } else {
          gui.outLeft();
          cbs[id]();
          painter.blur();
          self.isGuiLock = true;
        }
      }
    });
    //上方的工具
    importantToolsNode.delegate('i', clickEvent, function(e) {
      prevant(e);
      var node = $(this);
      var id = node.attr('id');
      var cbs = {
        'restart': painter.restart.bind(painter),
        'back': painter.back
      };
      if (cbs[id]) cbs[id]();
    });
  };


  function prevant(e) { //清除默认事件
    e.preventDefault();
    e.stopPropagation();
  }

  return Controller;
});
