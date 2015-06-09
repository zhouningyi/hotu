'use strict';

define(['zepto', 'anim', './ui/displayer', './ui/gallery', './../../model/user','./../../model/url','./../../model/browser','./../../model/model_draw', './../../utils/utils', './../../app_config', './wx/weixin'], function($, k, Displayer, Gallery, User, Url, browser, ModelDraw, Utils, config,  Weixin) {
  var displayer, gallery, weixin, user, modelDraw;
  var displayerContainer = $('.displayer-container'),
    ablumContainer = $('.ablum-container');

  var getQueryString = Utils.getQueryString;
  
  function Controller() {
    this.init();
    var self = this;

    if(window.drawUserId && window.drawUserId!=='null'){
      this.getDrawingsById(window.drawUserId);
    }

    this.dispatch(function(openid) {
      window.openid = openid;
      if(window.drawUserId === null || window.drawUserId === 'null' || window.drawUserId === undefined){
        self.getDrawingsById(openid);
      } else if (window.openid === window.drawUserId){
       return;
      }else{
       return gallery.addMyGalleryNode();
      }
    });
  }

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

    gallery = new Gallery(ablumContainer, {
      modelDraw: modelDraw
    });
    
    config.browser = browser;
    var url = new Url(config);
    weixin = new Weixin(url); //微信的分享机制
    user = new User({
      'weixin': weixin,
      'url': url,
      'config': config
    });

    window.drawUserId = getQueryString('drawUserId') || url.getInfo().drawUserId;
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
