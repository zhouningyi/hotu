'use strict';

define(['zepto', 'ui/gui', 'editor/bg', 'editor/painter', 'ui/floatTag', 'ui/brushTools', 'ui/bgTools', 'render/exports', 'brush/brushes', 'model/url', 'wx/weixin', 'model/model_draw', 'render/renderer', 'ui/loading', './model/user', './app_config', './model/browser', './ui/uploadSubmit', './ui/displayer'], function ($, Gui, Bg, Painter, FloatTag, BrushTools, BgTools, Exports, Brushes, Url, Weixin, ModelDraw, Renderer, Loading, User, config, browser, UploadSubmit, Displayer) {
  var clickEvent = 'touchstart mousedown';

  //绘图相关组件
  var painter, bg, exports, gui, floatTag, brushTools, bgTools, brushes, layers, uploadSubmit;

  //组件相关的node
  var body = $('body'), drawToolsNode = $('#draw-tools'), endToolsNode = $('.end-tools'),
  importantToolsNode = $('.important-tools'), floatTagNode = $('.float-tag'), mainNode = $('.main-container'),
  uiContainer = $('.ui-container'), drawContainer = $('.draw-container'), bgContainer = $('.bg-container'),
  layersContainer = $('.layers-container');

  function Controller() {
    this.init();
    this.dispatch();
    this.test();
  }
  
  Controller.prototype.test = function () {
    // this.displayer = new Displayer(mainNode);
    // uploadSubmit = new UploadSubmit(mainNode, {
    //   config: config
    // });
    // uploadSubmit.in();
  };

  var isLoadLast = true;
  var url, weixin, user;
  Controller.prototype.dispatch = function () { //登录等流程相关的组件 分出不同的流程
    url = new Url(config); //从url中抽取信息 并修改config
    weixin = new Weixin(url); //微信的分享机制
    user = new User({
      'weixin': weixin,
      'url': url,
      'config': config
    });
    user.login({
      success: function (d) {
        // new Loading(mainNode, {
        //   'config': config
        // });
      },
      fail: function () {
        // new Loading(mainNode, {
        //   'config': config
        // });
      }
    });
  };

  Controller.prototype.init = function () {
    this.animInUI();
    brushes = new Brushes();
    var brushObj = brushes.brushObj;
    var frameOpt = {
      frameW: drawContainer.width(),
      frameH: drawContainer.height()
    };
    var modelDraw = this.modelDraw = new ModelDraw(frameOpt); //数据
    var renderer = this.renderer = new Renderer(brushObj, frameOpt); //动画播放等

    floatTag = new FloatTag(uiContainer); //底部子菜单
    brushTools = new BrushTools({ //工具子菜单
      container: uiContainer,
      bind: drawToolsNode,
      brushes: brushObj,
      renderer: this.renderer
    });

    config.browser = browser;
    var quality = config.draw.quality = config.draw.quality(browser);
    painter = this.painter = new Painter(drawContainer, {
      'brushes': brushes,
      'modelDraw': modelDraw,
      'renderer': renderer,
      'quality': quality
    });

    //背景层
    bg = new Bg(bgContainer);
    bgTools = new BgTools({
      'container': uiContainer,
      'bind': drawToolsNode,
      'brushes': brushObj,
      'bg': bg,
      'quality': quality
    });

    exports = new Exports(floatTagNode, bg, painter);
    gui = new Gui();

    this.events();
    painter.beginRecord(); //开始记录
    this.loadLast();
  };


  Controller.prototype.loadLast = function () { //是否要载入banner提示
    var modelDraw = this.modelDraw;
    var self = this;
    if (isLoadLast) {
      modelDraw.getLastStorage({
        success: function (d) {
          if (!d) return;
          self.processingDrawData(d);
        },
        fail: function () {
          modelDraw.getLast({
            userid: openid,
            drawid: drawid
          }, self.processingDrawData.bind(self));
        }
      });
    } else {
    }
  };

  Controller.prototype.animInUI = function () { //动画进入
    importantToolsNode.keyAnim('fadeInLeft', {
      time: 0.4
    });
    drawToolsNode.keyAnim('fadeInLeft', {
      time: 0.6
    });
    endToolsNode.keyAnim('fadeInLeft', {
      time: 0.8
    });
  };

  Controller.prototype.processingDrawData = function (d) {
    var self = this;
    setTimeout(function () {
      d = JSON.parse(d);
      self.painter.reload(d.drawing);
    });
  };

  //事件
  Controller.prototype.events = function () {
    this.painterEvents();
    this.iconEvents();
    this.uiEvents();
  };

  Controller.prototype.painterEvents = function () {
    var self = this;
    body
      .on('painter-work', function () {
        gui.out();
      })
      .on('painter-unwork', function () {
        gui.in();
      })
      .on('bg-color-change', function (e, bgColor) {
        gui.setBackground(bgColor);
      });
  };

  Controller.prototype.iconEvents = function () { //所有iconfont在点击后都会闪动
    $('.iconfont-mobile').on(clickEvent, function () {
      var node = $(this);
      node.keyAnim('fadeOutIn', {
        'time': 0.5,
        'icount': 5,
        'cb': function () {
          node.clearKeyAnim();
        }
      });
    });
  };

  Controller.prototype.uiEvents = function () {
    var self = this;
    var drawToolNode = $('#draw-tools');
    drawToolNode.delegate('i', clickEvent, function (e) {
      prevant(e);
      var node = $(this);
      var id = node.attr('id');
      var cbs = {
        'brush': function () {
          self.painter.setBrush();
          bgTools.out();
          brushTools.switch({
            node: node,
            parent: drawToolNode,
            helpText: '选择画笔'
          });
        },
        'background': function () {
          brushTools.out();
          bgTools.switch({
            node: node,
            parent: drawToolNode,
            helpText: '选择图片'
          });
        },
        'layers': function () {
          layers.switch();
        },
        'broadcast': painter.broadcast.bind(painter),
        'refresh': window.location.reload.bind(window.location)
      };
      if (cbs[id]) {
        cbs[id]();
      }
    });

    //底部的工具
    endToolsNode.delegate('i', clickEvent, function (e) {
      prevant(e);
      var node = $(this);
      var id = node.attr('id');
      var cbs = {
        'restart': function () {
          painter.restart();
          body.trigger('refresh-drawid');
        },
        'download': function () {
          var imgObj = exports.toImage();
          var img = imgObj.img;
          var downloadURL = imgObj.downloadURL;
          floatTag.in({
            node: node,
            type: 'bottom',
            helpText: '长按上图下载',
            bgImg: img
          }, function () {});
        },
        'submit-message': function () {
          var bol = false;
          // uploadSubmit.switch();
          // painter.save({}, function (bol) {
            // floatTag.in({
            //   node: node,
            //   type: 'bottom',
            //   helpText: bol ? '敬请期待' : '敬请期待' //,
            // });
          // });
        }
      };
      if (cbs[id]) {
        if (id === 'download' || id === 'submit-message') {
          gui.outLeft();
        }
        if (floatTag.isOut) { //已经点开了
          cbs[id]();
        } else {
          floatTag.out();
        }
      }
    });
    //上方的工具
    importantToolsNode.delegate('i', clickEvent, function (e) {
      prevant(e);
      var node = $(this);
      var id = node.attr('id');
      var cbs = {
        'back': painter.back.bind(painter)
      };
      if (cbs[id]) cbs[id]();
    });

    //挂在body上的一些事件
    body.on('blur', function () {
      painter.blur();
    });
    body.on('unblur', function () {
      gui.in();
      painter.unblur();
    });
  };

  function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

  function prevant(e) { //清除默认事件
    e.preventDefault();
    e.stopPropagation();
  }

  return Controller;
});