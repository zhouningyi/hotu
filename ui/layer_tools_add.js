"use strict";
//对UI的总体控制

define(['./../utils/utils', './components/image_uploader'], function(Utils, ImageUploader) {
  var prevent = Utils.prevent;

  function LayerToolsAdd(container, options) {
    this.modelDraw = options.modelDraw;
    this.layers = options.layers;
    this.container = container;
    //
    this.initDom();
    this.initUploader();
    this.initEvents();
    this.isOut = true;
  }

  function getLeftCss(node) {
    var pos = node[0].getBoundingClientRect();
    var offset = -5;
    var w = pos.width;
    var l = pos.left;
    var h = pos.height;
    var t = pos.top;
    return {
      'left': l + w + offset,
      'top': t - 3,
      'bottom': 'auto',
      'height': 'auto',
    };
  }
  LayerToolsAdd.prototype = {
    initDom: function() {
      this.floatTagNode = $(
          '<div class="float-tag">\
          <div class="float-tag-triangle"></div>\
          <div class="float-tag-add">\
            <div class="ui-grid">\
              <label class="label-uploader">\
              <input type="file" name="images" id="images" accept="image/*">\
              <i class="style-normal iconfont iconfont-mobile block icon-android-camera" id="background-image" style="color:#fff;">&#xe602;</i>\
              <span class="icon-text gray-middle" style="color:#ccc;">图片<span>\
              </label>\
            </div>\
          </div>\
        <div>')
        .css('display', 'none')
        .appendTo(this.container);
      this.floatTagAddNode = this.floatTagNode.find('.float-tag-add');
      this.initEventsUpload();
    },
    initEventsUpload: function() {
      var self = this;
      var photoIpt = this.container.find('.label-uploader');
      photoIpt.on('change', function(e) {
        prevent(e);
        var file = (e.target.files || e.dataTransfer.files)[0];
        if (file) {
          self.getImageInfo(file);
        }
      });
    },
    initUploader: function(){
      this.imageUploader = new ImageUploader({
        modelDraw:this.modelDraw,
        layers: this.layers
      });
    },
    getImageInfo: function (file) {
    var self = this;
    if (typeof FileReader !== 'undefined' && typeof window.URL !== 'undefined') {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        var url = window.URL.createObjectURL(file);
        self.preview(url, event);
      };
    } else if (typeof window.URL !== 'undefined') {
      self.preview(file);
    } else {
      return alert('亲, 您的设备不支持预览');
    }
  },
    preview: function(url, e){//可以预览
      this.imageUploader.preview(url, e)
    },
    upload: function(){
    },
    bindTo: function(node) {
      if (!node) return;
      // 位置
      this.bindNode = node;
    },
    switch: function() {
      var self = this;
      var isOut = this.isOut;
      setTimeout(function(){
       if (isOut) return self.in();
       self.out();
      })
    },
    out: function() { //隐藏
      if (this.isOut) return;
      var floatTagNode = this.floatTagNode
        .keyAnim('fadeOut', {
          time: 0.1,
        });
      this.isOut = true;
      this.outKey = setTimeout(function() {
        floatTagNode.css('display', 'none');
      }, 500);
    },
    in : function() { //隐藏
      if (!this.isOut) return;
      window.clearTimeout(this.outKey);
      var css = getLeftCss(this.bindNode);
      this.floatTagNode.css(css);
      this.floatTagNode
        .css('display', 'block')
        .keyAnim('fadeIn', {
          time: 0.1,
        });
      this.isOut = false;
    },
    initEvents: function() {
      var self = this;
      window.global && global.on('in-using', function(e){
        if(e === 'add-image') return;
        self.out();
      });
     window.global && global.on('preview-image-start',this.out.bind(this));
    }
  };

  return LayerToolsAdd;
});