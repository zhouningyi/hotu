'use strict';

define(['zepto', 'anim', './ui/displayer', './ui/gallery', './../../model/user','./../../model/url','./../../model/browser','./../../model/model_draw', './../../utils/utils', './../../app_config', './wx/weixin'], function($, k, Displayer, Gallery, User, Url, browser, ModelDraw, Utils, config,  Weixin) {
  var displayer, gallery, weixin, user, modelDraw, url;
  var displayerContainer = $('.displayer-container'),
    ablumContainer = $('.ablum-container');

  var getQueryString = Utils.getQueryString;

  function checkId(id){
    return id !== null && id !== 'null' && id !== undefined && id.length && id.length > 2;
  }
  
  function Controller() {
    this.isRequested = false;
    this.init();
    var self = this;
    
    if (!browser.weixin) { //浏览器的情况 浏览器中只有短网址
      if (checkId(window.drawUserId)) { //drawUserId存在
        this.getDrawingsById(window.drawUserId);
      }else{
        this.caseNoDrawUserId();
      }
    } else {//在微信的情况
      window.drawUserId = url.getInfo().drawUserId;
      if (checkId(window.drawUserId)) { 
        this.getDrawingsById(window.drawUserId);
      }
    }

    this.dispatch(function(openid) {
      window.openid = openid;
      if(!self.isRequested && openid){
        window.drawUserId = openid;
        self.getDrawingsById(drawUserId);
        body.trigger('drawUserId', drawUserId);
      } else if (window.openid === window.drawUserId){
       return;
      } else {
       return gallery.addMyGalleryNode();
      }
    });
  }
  
  Controller.prototype.caseNoDrawUserId = function() {//没有id的情况
  };

  Controller.prototype.init = function() {
    var frameOpt = {
      frameW: displayerContainer.width(),
      frameH: displayerContainer.height(),
      config: config
    };
    modelDraw = this.modelDraw = new ModelDraw(frameOpt); //数据
    if (config.isConfigFromStorage) {
      modelDraw.getConfig();
    }

    displayer = new Displayer(displayerContainer, {
      modelDraw: modelDraw
    });
    
    config.browser = browser;
    url = new Url(config);
    weixin = new Weixin(url); //微信的分享机制
    user = new User({
      'weixin': weixin,
      'url': url,
      'config': config
    });

    gallery = new Gallery(ablumContainer, {
      'modelDraw': modelDraw,
      'weixin': weixin
    });
  };

  Controller.prototype.dispatch = function(next, fail){
    fail = fail || function(){};
    user.login({
      success: function (openid) {
        user.setUserInfo({
          userid: openid,
          register: 'weixin'
        });
        next(openid);
      },
      fail: function () {
        fail();
      }
    });
  };

  Controller.prototype.getDrawingsById = function(id) {
    this.isRequested = true;
    if (!id) return console.log('没有openid');
    var self = this;
    weixin && weixin.genShare();
    var self = this;
    modelDraw.getAllDrawingsById(id, function(data) {
      if(!data)return;
      var drawdata = {};
      for(var k in data){
        var d = data[k];
        var drawid = d.drawid;
        drawdata[drawid] = d;
      }
      self._drawdata = drawdata;
      gallery.data(drawdata);
      self.events();
    });
  };

  Controller.prototype.events = function() {
    var drawdata = this._drawdata;
    $('i')
    .on('touchstart touchmove mousedown', function(e){
      $(this).addClass('node-clicked');
      e.preventDefault();
    })
    .on('touchleave touchend mouseup mouseout', function(e){
      $(this).removeClass('node-clicked');
      e.preventDefault();
    });

    ablumContainer
    .delegate('.image', 'click', function(e){
      var node = $(this);
      var drawid = node.attr('id');
      var d = drawdata[drawid];
      if(!d) return;
      displayer.show(d, node);
    })
    .on('touchstart touchmove mousedown', function (e){
      $(this).addClass('image-clicked');
    })
    .on('touchleave touchend mouseup mouseout', function(e){
      $(this).removeClass('image-clicked');
    });
  };
  return Controller;
});
