'use strict';

//对url的操作
define(function () {

  function User(opt) {    
    var config = this.config = opt.config;
    this.loginKey = config.login.key;
    this.weixin = opt.weixin;
    this.urlObj = opt.url;

    this.initEvents();
    // this.setUserInfo({
    //    register:'weixin',
    //    'openid': 'xxxx',
    //    'isFollower': 0
    //   });
  }

  User.prototype.login = function (obj) {
    var self = this;
    this.getUserInfoCookie({//首先去cookie读取信息
      success: function (userInfo) {
        var register = userInfo.register;
        if ((register === 'weixin' || register === 'byWeixin')) { //检查是否注册于微信 目前只有微信登录 // && userInfo.openid && userInfo.isFollower
          window.global && global.trigger('userid', userInfo.openid);
          self.setUserInfoCookie(userInfo);
          obj.success();
        } else {
          self.getUserInfoHttp(obj);
        }
      },
      fail: function () {
        self.getUserInfoHttp(obj);
      }
    });
  };

  User.prototype.getUserInfoCookie = function (obj) {
    var userInfo = $.fn.cookie(this.loginKey);
    if (!userInfo || userInfo == 'null') {
      return (obj.fail && obj.fail());
    }
    return obj.success(JSON.parse(userInfo));
  };

  /**
   {userInfo:{
       register:'weixin',
       'openid': 'xxxx'
      }}
  */
  User.prototype.getUserInfoHttp = function (obj) {
    this.weixin.getOpenid(obj);
  };

  User.prototype.setUserInfoCookie = function (userInfo) {//向cookie写入信息
    if(userInfo === null || userInfo == 'null') return console.log('不能写入空的userinfo');
    $.fn.cookie(this.loginKey, JSON.stringify(userInfo));
  };


  User.prototype.clean = function () { //抹除信息
    this.setUserInfoCookie({});
  };

  User.prototype.initEvents = function(){
    var browser = this.config.browser || window.browser;
    var userInfo = browser.weixin ? {register: 'weixin'} : {};
    var self = this;
    window.global && global.on('userid', function(openid){
      userInfo.openid = openid;
      self.setUserInfoCookie(userInfo);
    });
  };

  return User;
});