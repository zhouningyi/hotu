'use strict';

//对url的操作
define(['./../utils/zepto_cookie'], function () {

  function User(opt) {
    this.weixin = opt.weixin;
    this.urlObj = opt.url;
    var config = this.config = opt.config;
    this.loginKey = config.login.key;
    this.clean();
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
        if ((register === 'weixin' || register === 'byWeixin') && userInfo.openid && userInfo.isFollower) { //检查是否注册于微信 目前只有微信登录
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

  /**
   {userInfo:{
       register:'weixin',
       'openid': 'xxxx'
      }}
  */
  User.prototype.getUserInfoHttp = function (obj) {
    this.weixin.getOpenid(obj);
  };

  User.prototype.setUserInfo = function (userInfo) {
    userInfo = JSON.stringify(userInfo);
    this.setUserInfoCookie(userInfo);
  };

  User.prototype.setUserInfoCookie = function (userInfo) {//向cookie写入信息
    $.fn.cookie(this.loginKey, userInfo);
  };

  User.prototype.getUserInfoCookie = function (obj) {
    var userInfo = $.fn.cookie(this.loginKey);
    if (!userInfo) {
      return obj.fail();
    }
    return obj.success(JSON.parse(userInfo));
  };

  User.prototype.clean = function () { //抹除信息
    this.setUserInfoCookie(null);
  };

  return User;
});