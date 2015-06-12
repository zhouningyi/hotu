'use strict';
//对UI的总体控制
define(['zepto', 'anim', './../../../utils/utils'], function ($, a, Utils) {
  var body = $('body');
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;

  function Gallery(container, opt) {
    opt = opt || {};
    this.modelDraw = opt.modelDraw;
    this.weixin = opt.weixin;
    this.container = container;
    container.css({display: 'block'});
    container.removeClass('out-left');
    this.offset = 4;

    this.gridMax = 250;
    this.gridMin = 80;
    this.computeSize();

    this.init();
    this.events();
  }

  Gallery.prototype.data = function (datas) {
     this.ds = datas;
    for (var k in datas) {
      this.getDrawData(datas[k]);
    }
    this.render();
  };

Gallery.prototype.getDrawData = function (d) {
  var weixin = this.weixin;
  var ds = this.ds;
  var container = this.container;
  this.modelDraw.getDrawingDataJSONP({
    drawid: d.drawid,
    dataUrl: d.dataUrl
  }, function(drawData){
    d.drawData = JSON.parse(drawData);
    var drawid = d.drawid;
    container.find('#' + drawid).removeClass('gray');
    if(d.drawData && d.drawData.userName&&d.imgUrl){
      $('body').trigger('update-share-username', {userName:d.drawData.userName, imgUrl:d.imgUrl + '?imageView2/2/w/100'});
    }
  });
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
        <div class="gallery-scroll" style="padding-top:'+ (this.navH + offset) + 'px;"></div>\
        </div>\
        <div class="nav" style="height:' + this.navH + 'px; padding:0 ' + (2 * offset) + 'px;">\
        <div class="top-area">\
        \
          <div class="icon-div icon-containter user">\
          <i class="iconfont iconfont-display transiton" style="display:inline-block">&#xe604;</i>\
          <span class="iconfont-name-text">画册</span>\
          </div>\
          \
          <div class="icon-div my-icon-containter todraw" href="http://hotu.co/hua">\
          <i class="iconfont iconfont-display transiton" style="display:inline-block;color:hsl(160,100%,35%);">&#xe606;</i>\
          <span class="iconfont-name-text" style="color:hsl(160,100%,35%);">开始创作</span>\
          </div>\
          </div>\
        </div>\
      </div>\
      ').appendTo(this.container);
    this.galleryNode = galleryContainer.find('.gallery-scroll');
    this.navNode = galleryContainer.find('.nav');
    this.galleryNode.css({
      paddingTop: this.navNode.height() + offset/2
    });
  };

  Gallery.prototype.render = function () {
    var ds = this.ds;
    var gridSize = this.gridSize;
    var html = '';
    var offset = this.offset;
    var index = 0;
    var d, imgUrl, bgColor, title, drawid, dataUrl, img;
    for (var k in ds) {
      d = ds[k];
      title = d.title;
      drawid = d.drawid;
      dataUrl = d.dataUrl;
      index++;
      imgUrl = d.imgUrl + '?imageView2/2/w/200';
      html += 
      '<div class="grid" style="width:' + gridSize + 'px; height:' + gridSize + 'px;">\
        <div class="image-container" style="left:' + offset + 'px;top:' + offset + 'px;width:' + (gridSize - 2 * offset) + 'px;height:' + (gridSize - 2 * offset) + 'px;">\
          <img class="image transition gray" src="' + imgUrl + '" id="' + drawid + '" dataUrl="'+dataUrl+'"></img>\
        \
        </div>\
      </div>';
    }

    this.galleryNode.html(html);
    img = this.galleryNode.find('img');
    img.attr('dataUrl', dataUrl);
    img.on('load', function(){
      $(this).parent().keyAnim('bounceIn', {
        'time': 1,
        'delay': Math.random()*0.5
      });
    });
  };

  Gallery.prototype.addMyGalleryNode = function(){
    var toMyGalleryNode = $('<div class="icon-div my-icon-containter toMyGallery" href="http://hotu.co/hua">\
      <i class="iconfont iconfont-display transiton" style="display:inline-block;color:hsl(160,100%,35%);">&#xe600;</i>\
      <span class="iconfont-name-text" style="color:hsl(160,100%,35%);">我的相册</span>\
      </div>');
    toMyGalleryNode.insertbefore(this.galleryContainer.find('.todraw'));
    toMyGalleryNode.on('touchstart mousedown', function(){
    });
  };

  Gallery.prototype.events = function () {
    var container = this.container;
    var self = this;
    this.galleryContainer.find('.todraw').on('touchstart mousedown', function(){
      window.location.href = 'http://hotu.co';
    });
    // this.galleryContainer.delegate('img', 'touchstart mousedown', function (e) {
    // });
  };

  return Gallery;
});