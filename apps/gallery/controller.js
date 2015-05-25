'use strict';

define(['zepto', 'anim', './ui/displayer', './ui/gallery', './../../model/user','./../../model/url','./../../model/browser', './../../app_config', './wx/weixin'], function($, k, Displayer, Gallery, User, Url, browser,  config, Weixin) {
  var displayer, gallery, weixin, user;
  var displayerContainer = $('.displayer-container'), ablumContainer = $('.ablum-container');
  function Controller(){
    this.init();
    this.events();
    this.dispatch(function(){});
  }

  Controller.prototype.dispatch = function(next){
    config.browser = browser;
    var url = new Url(config);
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
        next();
      },
      fail: function () {
        next();
      }
    });
  };

  Controller.prototype.init = function() {
    displayer = new Displayer(displayerContainer);
    gallery = new Gallery(ablumContainer);
  };

  Controller.prototype.events = function() {
    $('i')
    .on('touchstart touchmove mousedown', function(e){
      $(this).addClass('node-clicked');
      e.preventDefault();
    })
    .on('touchleave touchend mouseup mouseout', function(e){
      $(this).removeClass('node-clicked');
      e.preventDefault();
    });
    
    $('.image')
    .on('click', function(){
      displayer.show();
    })
    .on('touchstart touchmove mousedown', function(e){
      $(this).addClass('image-clicked');
    })
    .on('touchleave touchend mouseup mouseout', function(e){
      $(this).removeClass('image-clicked');
    });
  };
  return Controller;
});
