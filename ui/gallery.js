'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../utils/utils', './displayer'], function($, a, Utils, Displayer) {
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
    {'title': '是大对的'}
    ];
    this.render();
  };

  Gallery.prototype.computeSize = function () {
    var offset = this.offset;
    var container = this.container;
    var containerW = container.width();
    var containerH = container.height();
    var galleryW = this.galleryW = containerW - 2 * offset;
    var gridSize;
    
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
    this.navH = gridSize / 2;
  };

  Gallery.prototype.init = function () {
    var offset = this.offset;
    var galleryContainer = this.galleryContainer = $('\
      <div class="gallery-container container">\
        <div class="gallery" style="left:' + offset + 'px; width:' + this.galleryW + 'px;">\
        <div class="gallery-scroll" style="padding-top:'+ (this.gridSize / 2 + offset) + 'px;"></div>\
        </div>\
        <div class="nav" style="height:' + this.navH + 'px; padding:0 ' + (2 * offset) + 'px;">\
          <div class="user-name" style=" width:' + (this.gridSize - 2 * offset) + 'px; height:'+(this.navH) + 'px">野兽</div>\
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
      url = 'http://hotu.co/hotu/others/test/' + index + '.jpg';
      html += 
      '<div class="grid" style="width:' + gridSize + 'px; height:' + gridSize + 'px;">\
        <div class="image-container" style="left:' + offset + 'px;top:' + offset + 'px;width:' + (gridSize - 2 * offset) + 'px;height:' + (gridSize - 2 * offset) + 'px;">\
          <img class="image" src="' + url + '" id="' + id + '"></img>\
        \
        </div>\
      </div>';
    }
    //<div class="image-title">' + title + '</div>\
    this.galleryNode.html(html);
  };

  Gallery.prototype.events = function () {
    var container = this.container;
    var self = this;
    this.galleryContainer.delegate('img', 'touchstart mousedown', function (e) {
      console.log(this);
    });
  };

  return Gallery;
});