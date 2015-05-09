'use strict';

define(['zepto', 'anim'], function ($) {
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

  function prevent(e) { //清除默认事件
    e.preventDefault();
    e.stopPropagation();
  }

  function isNone(d) { //清除默认事件
    return (d === undefined || d === null || isNaN(d));
  }

  function values(obj) {
    var arr = [];
    for (var k in obj) {
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
    if (isNone(appendBol) || appendBol) canvas.appendTo(container); //默认是加入dom的;

    canvas = canvas[0];
    var ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);
    var result = (returns === 'canvas') ? canvas : ctx;
    return result;
  }

  function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      hue: Math.round(h * 360),
      sat: Math.round(s * 100),
      light: Math.round(l * 100)
    };
  }

  function hsla2obj(hsla) {
    var strs = hsla.split(')')[0].split(',');
    return {
      'hue': parseInt(strs[0].split('(')[1]),
      'sat': parseInt(strs[1].split('%')[0]),
      'light': parseInt(strs[2].split('%')[0]),
      'opacity': parseFloat(strs[3])
    };
  }

  function getPt(e) { //获取点相对于容器的位置
    var node = $(e.target);
    var nodeW = node.width();
    var nodeH = node.height();
    var offset = node.offset();
    var left = offset.left;
    var top = offset.top;
    var x, y;
    if (e.type.indexOf('mouse') !== -1) {
      x = e.x || e.pageX;
      y = e.y || e.pageY;
      return [x - left, y - top];
    }
    var touch = window.event.touches[0];
    x = touch.pageX - left;
    y = touch.pageY - top;
    x = (x < nodeW) ? x : nodeW;
    x = (x > 0) ? x : 1;
    y = (y < nodeH) ? y : nodeH;
    y = (y > 0) ? y : 1;
    return [x, y];
  };

  function getQueryStringByName(name) {
    var reg = new RegExp('[\?\&]' + name + '=([^\&]+)', 'i');
    var result = window.location.href.match(reg);
    if (result == null || result.length < 1) {
      return '';
    }
    return result[1];
  }

  function animateSeries(nodeList, aniName, opt) {
    var timeFunc = opt.time, delayFunc = opt.delay;
    for (var k in nodeList) {
      k = parseInt(k);
      nodeList[k].keyAnim(aniName, {
        time: timeFunc(k),
        delay: delayFunc(k)
      });
    }
  }

  return {
    'getQueryStringByName': getQueryStringByName,
    'animateSeries': animateSeries,
    'rgbToHsl': rgbToHsl,
    'hsla2obj': hsla2obj,
    'upper': upper,
    'keys': keys,
    'prevent': prevent,
    'isNone': isNone,
    'values': values,
    'getQueryString': getQueryString,
    'genCanvas': genCanvas,
    'getPt': getPt
  };

});