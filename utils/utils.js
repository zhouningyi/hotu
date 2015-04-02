'use strict';

define(['zepto'], function($) {
  function upper(str) { //首字母大写
    return str[0].toUpperCase() + str.slice(1);
  }

  function keys(o) { //算对象的keys
    var result = [];
    for (var k in o) {
      result.push(k);
    }
    return result;
  }


  function prevant(e) { //清除默认事件
      e.preventDefault();
      e.stopPropagation();
    }
  function isNone(d) { //清除默认事件
    return (d===undefined||d===null||isNaN(d));
    }

  function values(obj){
    var arr = [];
    for(var k in obj){
      if (obj.hasOwnProperty(k)) arr.push(obj[k]);
    }
    return arr;
  }

  function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

  function genCanvas(opt) { //添加一个和node等大的canvas
    var id = opt.id;
    var container = opt.container;
    var quality = opt.quality || 2;
    var appendBol = opt.appendBol;
    var returns = opt.returns || 'ctx';
    var w = container.width();
    var h = container.height();
    var canvas = $('<canvas width="' + w * quality + '" height="' + h * quality + '" id="' + id + '"></canvas>')
      .css({
        'position': 'absolute',
        'top': 0,
        'left': 0,
        'width': w,
        'height': h
      });
    if (isNone(appendBol)||appendBol) canvas.appendTo(container);//默认是加入dom的;

    canvas = canvas[0];
    var ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);
    var result =  (returns==='canvas')?canvas:ctx;
    return result;
  }
  return {
    upper:upper,
    keys:keys,
    prevant:prevant,
    isNone:isNone,
    values:values,
    getQueryString:getQueryString,
    genCanvas:genCanvas
  };


});
