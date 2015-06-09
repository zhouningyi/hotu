'use strict';

//管理url相关的操作
define(['zepto', './../utils/utils'], function ($, Utils) {
  var getQueryStringByName = Utils.getQueryStringByName;

  function Url(config) {
    this.config = config;
    var browser = config.browser;
    if (browser.weixin) { //切分state参数的字符
      this.browser = 'weixin';
      var weixin = config.weixin;
      var weixinUrl = weixin.url;
      this.keysWeixinInStates = weixinUrl.keysWeixinInStates;
      this.and = weixinUrl.and;
      this.equalto = weixinUrl.equals;
      var info = this.info = this.getInfo();
      if (info.fromid) {// && info.fromtype === 'openid'
        config.sns.fromid = info.fromid;
      }
      if (info.drawid) {
        config.draw.previd = info.drawid;
      }
    }
  }

  /////////////////////从url获取信息
  Url.prototype.getFromid = function() {
    if (this.browser === 'weixin') {
      return this.info.fromid || 'default';
    }
  };
  
  Url.prototype.getDrawid = function () {
    if(this.browser === 'weixin'){
      return this.info.drawid || 'default';
    }else{

    }
  };

  Url.prototype.getCode = function () {
    return getQueryStringByName('code');
  };

  Url.prototype.getState = function () {
    return getQueryStringByName('state');
  };

  Url.prototype.get = function (name) {
    return getQueryStringByName(name);
  };

  Url.prototype.genState = function (obj) { //生成url的state参数
    if (this.browser !== 'weixin') {
      return console.log('必须微信登录');
    }
    var keysWeixinInStates = this.keysWeixinInStates;
    var key, value, result = [];
    for (key in obj) {
      if (key in keysWeixinInStates) {
        value = obj[key];
        result.push(key + this.equalto + value);
      }
    }

    return result.join(this.and);
  };

  Url.prototype.genURL = function (obj) { //生成url
    var state = this.genState(obj);
  };
  /////////////////////从url中获取
  Url.prototype.getInfo = function () {
    var states = getQueryStringByName('state');
    var arr = states.split(this.and);
    var str, splits, key, value, result = {};
    for (var k in arr) {
      str = arr[k];
      splits = str.split(this.equalto);
      key = splits[0];
      value = splits[1];
      result[key] = value;
    }
    return result;
  };

  return Url;
});