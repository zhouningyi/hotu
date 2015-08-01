'use strict';

define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  //有的工具列表
  var controls2data = Utils.controls2data;
  function ImagePreview(options) {
    this.initialize(options);
  }

  EventEmitter.extend(ImagePreview, {
    name: '图片预览',
    id: 'image_preview',
    desc: '输入url 显示图片',
    key: 'preview',
    type: 'image',
    options: {},
    controls: {
      'transform': {
        'value': {
          'dy': 0,
          'dx': 0,
          'scale': 1
        },
        'descUI': '变换',
      },
      'opacity': {
        'range': [0, 1],
        'value': 1,
        'descUI': '透明度'
      }
    },
    initialize: function (options) {
      this.options = Utils.deepMerge(this.options, options);
      this.initEvents();
    },
    getValue: function (key) {
      if(this.controls && this.controls[key]) return this.controls[key].value;
      return this[key];
    },
    workOn: function (layer) {
      if(!layer) return;
      this.layer = layer;
      this.imageWrapper = layer.imageWrapper;
    },
    _update: function () {
      Utils.resetCtx(this.ctx, this.options);
      this.update();
    },
    update: function () {
      console.log('请覆盖');
    },
    setControl: function (key, value) {
      var controls = this.controls;
      if(!key || value === undefined || value === null || !controls || !controls[key]) return;
      if(controls[key].value === value) return;
      controls[key].value = value;
    },    
    addURL: function(url){
      var img = this.image = new Image();
      img.setAttribute('crossorigin', 'anonymous');
      img.src = url;
      img.onload = function(){
        this.addImage(img);
        setTimeout(this.updateTransfrom.bind(this), 100);
      }.bind(this);
    },
    addImage: function(image) {
      var imageWrapper = this.imageWrapper.empty();
      if(!imageWrapper) return console.log('没绑定image_layer');
      var width = image.width || image.naturalWidth, height = image.height || image.naturalHeight;
      var cwidth = this.layer.width, cheight = this.layer.height;

      var cssWrap = {
        'pointer-events': 'none',
        'z-index': 22,
      };
      var cssImg = {
        'pointer-events': 'auto',
        'left': 0,
        'top': 0
      };
      if(height / width > cheight / cwidth) {
        cssWrap.top = 0;
        cssWrap.left = (cwidth - cheight * width / height) / 2;
        cssWrap.height = cssImg.height = cheight;
      } else {
        cssWrap.left = 0;
        cssWrap.top =  (cheight - cwidth * height / width) / 2; 
        cssWrap.width = cssImg.width = cwidth;
      }
      image = this.image = $(image).css(cssImg);
      imageWrapper.css(cssWrap).append(image);

      this.layer.initEventsImage();
    },
    updateTransfrom: function(transform){
      transform = transform || this.controls.transform.value;
      if(!this.image || !transform) return;
      var scale = transform.scale, dx = transform.dx, dy = transform.dy;
      var scale3d = 'scale3d('+scale+',' + scale + ',1) ';
      var translate3d = 'translate3d('+dx+'px,' + dy + 'px,0px)';
      transform = scale3d + translate3d;
      $(this.image).css({
        'transform': transform,
        '-webkit-transform': transform
      });
    },
    toData: function () {
      return controls2data(this.controls);
    },
    render: function (ds) {
      for (var k in ds){
        this.setControl(k, ds[k]);
      }
    },
    initEvents: function(){
    },
    getColorShow: function () {
      return this.color;
    },

    detectPreviewImage: function(image) {
      var oHeight = image.naturalHeight;
      var oWidth = image.naturalWidth;
      var iWidth = (rotation === 270 || rotation === 90) ? oHeight : oWidth;
      var iHeight = (rotation === 270 || rotation === 90) ? oWidth : oHeight;
    }
  });
  return ImagePreview;
});