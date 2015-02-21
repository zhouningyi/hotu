'use strict';

//对url的操作
define(['zepto'], function($) {

  function Url() {
  }

  Url.prototype.getId = function(d) {
    this.curData = d;
  };

  return Url;
});
