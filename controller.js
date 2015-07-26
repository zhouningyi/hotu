'use strict';

define(['./utils/utils', 'ui/gui', 'ui/layer_tools', 'editor/editor', 'ui/components/info_panel', 'ui/bgTools', 'brush/brushes', 'model/url', 'wx/weixin', 'model/model_draw', './model/user', './app_config', './model/browser', './ui/uploadSubmit', './action/actions', './ui/end_tools_brush', './ui/end_tools_bg', './ui/components/preview_panel', './ui/global', './ui/top_tools'], function(Utils ,Gui, LayerTools, Editor, InfoPanel, BgTools, brushes, Url, Weixin, ModelDraw, User, config, browser, UploadSubmit, Actions, EndToolsBrush, EndToolsBg, PreviewPanel, global, TopTools) {
  var prevent = Utils.prevent;
  var clickEvent = 'touchstart mousedown';

  //绘图相关组件
  var painter, bg, editor, gui, infoPanel, bgTools, actions, layers, uploadSubmit, modelDraw, endToolsBrush, endToolsBg, topTools, layerTools;

  //组件相关的node
  var body = $('body'),
    mainContainer = $('.main-container'),
    layerToolsNode = $('#layer-tools'),
    importantToolsNode = $('.important-tools'),
    uiContainer = $('.ui-container'),
    layersContainer = $('.layers-container'),
    infoContainer = $('.info-container'),
    firstContainer = $('.first-container');

  function Controller() {
    this.preInit();
    this.dispatch(this.init.bind(this));
  }

  Controller.prototype.preInit = function () {
    config.browser = browser;

    actions = new Actions(); //操作列表

    var frameOpt = {
      frameW: mainContainer.width(),
      frameH: mainContainer.height(),
      config: config
    };
    modelDraw = this.modelDraw = new ModelDraw(frameOpt); //数据
    if (config.isConfigFromStorage) {
      modelDraw.getConfig();
    }
  };

  var isLoadLast = true;
  var url, weixin, user;
  Controller.prototype.dispatch = function (next) { //登录等流程相关的组件 分出不同的流程
    var self = this;
    url = new Url(config); //从url中抽取信息 并修改config
    weixin = new Weixin(url); //微信的分享机制
    user = new User({
      'weixin': weixin,
      'url': url,
      'config': config
    });

    user.login({
      success: function (openid) {
        user.setUserInfo({
          userid: openid,
          register: 'weixin'
        });
        config.login.userid = openid;
        modelDraw.saveConfig();
        self.isLogin = 1;
        next();
      },
      fail: function() {
        // self.loading = new Loading(firstContainer, {
        //   'config': config
        // });
        self.isLogin = 0;
        next();
      }
    });
  };

  Controller.prototype.init = function () {
    this.global = global;
    this.animInUI();
    //编辑器参数
    var painterOpt = config.painter;
    var quality = painterOpt.quality = painterOpt.quality(browser);
    editor =  this.editor = new Editor(mainContainer, {
      brushes: brushes,
      modelDraw: modelDraw,
      painter: painterOpt,
      layersContainer: layersContainer,
      actions: actions
    });

    var previewPanel = new PreviewPanel(uiContainer, {
      brushes: brushes
    });
    window.infoPanel = new InfoPanel(infoContainer, {});
    window.infoPanel.help();

    bgTools = new BgTools({
      'container': uiContainer,
      'bind': layerToolsNode,
      'actions': actions,
      'bg': editor.bg,
      'quality': quality
    });

    var floatTagNode = $('');

    endToolsBrush = new EndToolsBrush(uiContainer, {
      targets: brushes,
      isOut: false
    });

    endToolsBg = new EndToolsBg(uiContainer, {
      targets: actions,
      isOut: true
    });

    topTools = new TopTools(uiContainer, {
      editor: editor
    });

    layerTools = new LayerTools(layerToolsNode, {
      layers: editor.layers
    });

    uploadSubmit = new UploadSubmit(firstContainer, {
      'config': config,
      'modelDraw': modelDraw,
      'isLogin': this.isLogin
    });

    gui = new Gui();

    this.events();
    this.loadLast();
  };

  Controller.prototype.loadLast = function () { //是否要载入banner提示
    if (isLoadLast) this.editor.load();//没有参数则载入最后编辑的数据
  };

  Controller.prototype.animInUI = function () { //动画进入
    importantToolsNode.keyAnim('fadeInLeft', {
      time: 0.2
    });
    layerToolsNode.keyAnim('fadeInLeft', {
      time: 0.2,
      delay: 0.1
    });
  };

  //事件
  Controller.prototype.events = function() {
    this.iconEvents();
    this.uiEvents();
  };

  Controller.prototype.iconEvents = function() { //所有iconfont在点击后都会闪动
    $('.iconfont-mobile').on(clickEvent, function() {
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

  Controller.prototype.uiEvents = function() {
    var self = this;
    var drawToolNode = $('#draw-tools');
    drawToolNode.delegate('i', clickEvent, function(e) {
      prevent(e);
      var node = $(this);
      var id = node.attr('id');
      var cbs = {
        'brush': function() {
        },
        'background': function() {
          bgTools.switch({
            node: node,
            parent: drawToolNode,
            helpText: '选择图片'
          });
        },
        'layers': function() {
          // layers.switch();
        },
        // 'broadcast': painter.broadcast.bind(painter),
        'refresh': window.location.reload.bind(window.location)
      };
      if (cbs[id]) {
        cbs[id]();
      }
    });

    // 底部的工具
    // endToolsNode.delegate('i', clickEvent, function(e) {
    //   prevent(e);
    //   var node = $(this);
    //   var id = node.attr('id');
    //   var cbs = {
    //     'restart': function() {
    //       floatTag.in({
    //         node: node,
    //         type: 'bottom',
    //         helpText: '删除并新建画作?',
    //         click: function() {
    //           painter.restart();
    //           floatTag.out();
    //         }
    //       }, function() {});
    //       body.trigger('refresh-drawid');
    //     },
    //     'download': function() {
    //       var imgObj = exports.toImage();
    //       var img = imgObj.img;
    //       var downloadURL = imgObj.downloadURL;
    //       floatTag.in({
    //         node: node,
    //         type: 'bottom',
    //         helpText: '长按上图下载',
    //         bgImg: img
    //       }, function() {});
    //     },
    //     'submit-message': function() {
    //       var bol = false;
    //       uploadSubmit.switch();
    //     }
    //   };
    //   if (cbs[id]) {
    //     if (id === 'download' || id === 'submit-message') {
    //       gui.outLeft();
    //     }
    //     if (floatTag.isOut) { //已经点开了
    //       cbs[id]();
    //     } else {
    //       floatTag.out();
    //     }
    //   }
    // });

    //上方的工具
    importantToolsNode.find('i').on(clickEvent, function (e) {
      prevent(e);
      editor.back();
    });
  };

  return Controller;
});