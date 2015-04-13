'use strict';

//对url的操作
define(['zepto'], function($) {

  function Url() {
    var states = getQueryStringByName('state');
    this._states = getInfoObj(states.split('andandand'));
  }

  /////////////////////从url获取信息
  Url.prototype.getFromid = function() {
    return this._states.fromid || 'default';
  };

  Url.prototype.getDrawid = function() {
    return this._states.drawid || 'default';
  };

  Url.prototype.getCode = function() {
    return getQueryStringByName('code');
  };

  /////////////////////生成url
  Url.prototype.genState = function(obj) {
    var value, result=[];
    for(var key in obj){
      value = obj[key];
      result.push(key + 'equalsto' + value);
    }
    return result.join('andandand');
  };


  function getQueryStringByName(name) {
    var reg =new RegExp('[\?\&]' + name + '=([^\&]+)', 'i');
    var result = window.location.href.match(reg);
    if (result == null || result.length < 1) {
      return '';
    }
    return result[1];
  }

  function getInfoObj(arr) {
    var str, splits, key, value, result = {};
    for (var k in arr) {
      str = arr[k];
      splits = str.split('equalsto');
      key = splits[0];
      value = splits[1];
      result[key] = value;
    }
    return result;
  }
  return Url;
});
