'use strict';
//播放作品的面板
define(['./../../utils/utils'], function (Utils) {
  var body = $('body');
  var upper = Utils.upper;
  var getPt = Utils.getPt;
  var prevent = Utils.prevent;

  function ImageUploader(container, opt) {
    opt = opt || {};
    this.container = container || $('.container');
    this.target = opt.target;
    this.targetName = opt.targetName;
    this.key = opt.key;
    this.control = opt.control;

    this.init();
    this.events();
  }

  ImageUploader.prototype.init = function () {
    var container = this.container;
    var containerW = this.containerW = container.width();
    var buttonSize = this.containerH = container.height();
    var sliderW = containerW - buttonSize;
    var displayContainer = this.displayContainer = $('\
        <div class="ui-grid">\
            <label class="label-uploader">\
            <input type="file" name="images" id="images" accept="image/*">\
            <i class="style-normal iconfont iconfont-mobile block icon-android-camera" id="background-image">&#xe602;</i>\
            <span class="icon-text gray-middle">上传<span>\
            </label>\
          </div>\
      ').appendTo(this.container);
    this.sliderNode = container.find('.slider');
    this.percentNode = container.find('.percent-line');
    this.broadcastNode = container.find('.broadcast');
  };

  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  ImageUploader.prototype.events = function () {
    var self = this;
    this.broadcastNode.on('touchstart mousedown', function (e) {
      if(self._begin) self._begin();
    });
    var photoIpt = $('.label-uploader');
    photoIpt.on('change', function (e) {
      prevent(e);
      var file = (e.target.files || e.dataTransfer.files)[0];
      if (file) {
        self.updateImageInfo(file);
      }
    });
  };

  ImageUploader.prototype.updateImageInfo = function (file) {
    var self = this;
    if (typeof FileReader !== 'undefined' && typeof window.URL !== 'undefined') {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        var url = window.URL.createObjectURL(file);
        self.emit(url, event);
      };
    } else if (typeof window.URL !== 'undefined') {
      self.emit(file);
    } else {
      return alert('亲, 您的设备不支持预览');
    }
  };

  ImageUploader.prototype.emit = function (url, e) {
    this.control.value = {url:url,e:e};
    this.target.onStyleChange(this.key);
  };

  ImageUploader.prototype.setValue = function (value) {
    var percent = parseInt(100 * value) + '%';
    this.percentNode.css({
      'width': percent
    });
  };

  ImageUploader.prototype.onBegin = function (cb) {
    this._begin = cb;
  };

  ImageUploader.prototype.onSlider = function (cb) {
    this._slider = cb;
  };
  return ImageUploader;
});
