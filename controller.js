'use strict';

define(['./utils/utils', 'ui/layer_tools', 'editor/editor', 'ui/components/info_panel', 'brush/brushes', 'model/url', 'wx/weixin', 'model/model_draw', './model/user', './app_config', './model/browser', './ui/uploadSubmit', './action/actions', './ui/end_tools_brush', './ui/end_tools_bg', './ui/components/preview_panel', './ui/global', './ui/top_tools', './image/preview'], function(Utils, LayerTools, Editor, InfoPanel, brushes, Url, Weixin, ModelDraw, User, config, browser, UploadSubmit, Actions, EndToolsBrush, EndToolsBg, PreviewPanel, global, TopTools, Preview) {
  var prevent = Utils.prevent;
  var clickEvent = 'touchstart mousedown';

  window.print = function(text){
    $('#test-container').text(text);
  };

  //绘图相关组件
  var painter, bg, editor, infoPanel, actions, layers, uploadSubmit, modelDraw, endToolsBrush, endToolsBg, topTools, layerTools;

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
    this.init();
    this.dispatch();
  }

  Controller.prototype.preInit = function () {
    window.browser = config.browser = browser;

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
        next && next();
      },
      fail: function() {
        // self.loading = new Loading(firstContainer, {
        //   'config': config
        // });
        self.isLogin = 0;
        next && next();
      }
    });
  };

  Controller.prototype.init = function () {
    this.global = global;
    this.animInUI();
    //编辑器参数
    var painterOpt = config.painter;
    var quality = painterOpt.quality = painterOpt.quality(browser);
    var imagePreview = new Preview();
    editor =  this.editor = new Editor(mainContainer, {
      brushes: brushes,
      modelDraw: modelDraw,
      painter: painterOpt,
      layersContainer: layersContainer,
      actions: actions,
      imagePreview: imagePreview
    });

    var previewPanel = new PreviewPanel(uiContainer, {
      brushes: brushes
    });
    window.infoPanel = new InfoPanel(infoContainer, {});
    window.infoPanel.help();

    endToolsBrush = new EndToolsBrush(uiContainer, {
      targets: brushes,
      isOut: false
    });

    endToolsBg = new EndToolsBg(uiContainer, {
      targets: actions,
      preview: imagePreview,
      isOut: true
    });

    // endToolsImage = new EndToolsImage(uiContainer, {
    //   preview: imagePreview
    // });

    topTools = new TopTools(uiContainer, {
      editor: editor,
      modelDraw: modelDraw
    });

    layerTools = new LayerTools(layerToolsNode, {
      layers: editor.layers,
      modelDraw: modelDraw
    });

    uploadSubmit = new UploadSubmit(firstContainer, {
      'config': config,
      'modelDraw': modelDraw,
      'isLogin': this.isLogin
    });

    this.events();
    this.loadLast();
  };

  Controller.prototype.createImageEndTools = function () {
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
    $('i').on(clickEvent, function(e) {
      var node = $(this);
      node.keyAnim('fadeOutIn', {
        'time': 0.5,
        'icount': 5,
        'cb': node.clearKeyAnim.bind(node)
      });
    });
  };

  Controller.prototype.uiEvents = function() {
    var self = this;
    //上方的工具
    importantToolsNode.find('i').on(clickEvent, function (e) {
      prevent(e);
      editor.back();
    });
    window.global && global.on('main-color-change', function(c){
      var cs = c.split(',');
      cs[3] = '0.6)';
    importantToolsNode.css('background', cs.join(','));
    });
  };

  return Controller;
});