'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../../../utils/utils'], function ($, a, Utils) {
  var body = $('body');
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;

  function Gallery(container) {
    this.container = container;
    container.css({display: 'block'});
    container.removeClass('out-left');
    this.offset = 4;

    this.gridMax = 250;
    this.gridMin = 80;
    this.computeSize();

    this.init();
    this.events();

    this.getData();
  }

  Gallery.prototype.getData = function () {
    this.ds = [
    {'title': '是大'},
    {'title': '是对的大'},
    {'title': '是是大'},
    {'title': '是啊大'},
    {'title': '是是大'},
    {'title': '是大'},
    {'title': '是大'},
    {'title': '是萨达大'},
    {'title': '是事实上大'},
    {'title': '是啊啊大'},
    {'title': '是大'},
    {'title': '是大'},
    {'title': '是萨达大'},
    {'title': '是事实上大'},
    {'title': '是啊啊大'},
    ];
    this.render();
  };

var gridSize;
  Gallery.prototype.computeSize = function () {
    var container = this.container;
    var containerW = container.width();
    var galleryW = this.galleryW = containerW - 2 * this.offset;
    
    var gridMax = this.gridMax;
    var gridMin = this.gridMin;

    var size = galleryW / 3;
    if (size > gridMax) {
      gridSize = galleryW / parseInt(galleryW / gridMax);
    }else if (size < gridMin) {
      gridSize = galleryW / parseInt(galleryW / gridMin);
    }else {
      gridSize =  size;
    }
    this.gridSize = gridSize;
    this.navH = gridSize * 0.75;
  };

  Gallery.prototype.init = function () {
    var offset = this.offset;
    var galleryContainer = this.galleryContainer = $('\
      <div class="gallery-container container">\
        <div class="gallery" style="left:' + offset + 'px; width:' + this.galleryW + 'px;">\
        <div class="gallery-scroll" style="padding-top:'+ (this.gridSize * 0.75 + offset) + 'px;"></div>\
        </div>\
        <div class="nav" style="height:' + this.navH + 'px; padding:0 ' + (2 * offset) + 'px;">\
        <div class="top-area">\
          <div class="cancel icon-div icon-containter">\
          <i class="iconfont iconfont-display transiton" style="display:inline-block">&#xe604;</i>\
          <span class="iconfont-name-text">野狩</span>\
          </div>\
        </div>\
        </div>\
      </div>\
      ').appendTo(this.container);
    this.galleryNode = galleryContainer.find('.gallery-scroll');
    this.navNode = galleryContainer.find('nav');
  };

  Gallery.prototype.render = function () {
    var ds = this.ds;
    var gridSize = this.gridSize;
    var html = '';
    var offset = this.offset;
    var index = 0;
    var d, url, bgColor, title, id;
    for (var k in ds) {
      d = ds[k];
      title = d.title;
      id = d.id;
      index++;
      url = 'http://hotu.co/hotu/others/test/' + (index%10 + 1) + '.jpg';
      html += 
      '<div class="grid" style="width:' + gridSize + 'px; height:' + gridSize + 'px;">\
        <div class="image-container" style="left:' + offset + 'px;top:' + offset + 'px;width:' + (gridSize - 2 * offset) + 'px;height:' + (gridSize - 2 * offset) + 'px;">\
          <img class="image transition" src="' + url + '" id="' + id + '"></img>\
        \
        </div>\
      </div>';
    }
    //<div class="image-title">' + title + '</div>\
    this.galleryNode.html(html);
    console.log(this.galleryNode.find('img'))
    this.galleryNode.find('img').on('load', function(){
      $(this).parent().keyAnim('bounceIn', {
        'time': 1,
        'delay':Math.random()*0.5
      });
    });
  };

  Gallery.prototype.events = function () {
    var container = this.container;
    var self = this;
    this.galleryContainer.delegate('img', 'touchstart mousedown', function (e) {
    });
  };

  return Gallery;
});