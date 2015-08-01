'use strict';

define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  var upper = Utils.upper;
  var cleanCtx = Utils.cleanCtx;

  function Bg(options) {
    this.initialize(options);
  }

  EventEmitter.extend(Bg, {
    options: {
      tasks: ['bgColor']
    },
    initialize: function (options) {
      Utils.deepMerge(this.options, options);
      this.modelDraw = options.modelDraw;
      var actions = this.actions = options.actions;
      this.modelDraw = options.modelDraw;
      this.preview = options.imagePreview;
      var layer = this.layer = options.layer;
      this.workOn(layer);
      this.initEvents();
      this.updateActions();
    },
    linkTo: function (editor) {
      this.editor = editor;
    },
    workOn: function (layer) {
      if (!layer) return;
      var actions = this.actions;
      actions.each(function (id, action) {
        action.workOn(layer);
      });
      this.preview.workOn(layer);
    },
    new: function () {
      this.layer.clean();
      this.actions.get('bgColor').setControl('lightSat', {
        light: 1,
        sat: 0
      });
    },
    // update: function () {
    //   var task, tasks = this.options.tasks;
    //   for(var k in tasks) {
    //     task = tasks[k];
    //     var draw = this['update' + upper(task)];
    //     draw && draw();
    //   }
    //   console.log('update');
    //   this.actions.each(function (id, action){
    //     console.log(action.toData());
    //   });
    //   // this.modelDraw.save('bg', );
    // },
    data: function (d) {
      if (!d) return;
      var preview = this.preview;
      var image = d.image, url = image.url, transform = image.transform;
      if(url){
        preview.setControl('url', url);
        preview.setControl('transform', transform);
        preview.addURL(url);      
      }
      //
      var bg = d.bg;
      var actions = this.actions;
      if (bg.color) actions.get('bgColor').render(bg.color);
    },

    initEvents: function () {
      var actions = this.actions;
      var modelDraw = this.modelDraw;
      actions.on('control-change', this.updateActions.bind(this));
      window.global && global.on('new-drawing', this.updateActions.bind(this));
      this.initEventsImage();
    },

    updateActions: function () {
      var actions = this.actions, modelDraw = this.modelDraw;
      actions.each(function (id, action) {
        action.update();
        modelDraw.saveBg(action.key, action.toData());
      });
    },

    ///////////////////////////// 和图片上传有关 //////////////////////////////////////
    addImage: function (image) {
      this.curImageid = 'img_' + new Date().getTime() + '_' + Math.floor(Math.random()*10000);
      this.preview.addImage(image);
      this.beginUpload(image);
    },

    beginUpload: function (image) {
      var width = image.width || image.naturalWidth, height = image.height || image.naturalHeight;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var cw = canvas.width = Math.min(1500, width);
      var ch = canvas.height = cw * height / width;
      ctx.drawImage(image, 0, 0, cw, ch);
      var imgBase64 = canvas.toDataURL();
      this.modelDraw.postImage({
        imgBase64: imgBase64,
        imgName: this.curImageid
      }, this.afterUpload.bind(this));
    },
    afterUpload: function (data) {
      if(!data) return;
      if(data.key !== this.curImageid) return console.log('图片过期');
       this.preview.setControl('url', data.url);
       this.modelDraw.saveImage('url', data.url);
    },
    checkImagePanel: function () {
      if(!this.layer) this.addImagePanel();
    },
    addImagePanel: function () {
      var layer = this.layer = this.layers.add({
        'type': 'image',
        'quality': 2,
        'index': 2,
        'id': 'image_default'
      });
      this.preview.workOn(layer);
    },
    initEventsImage: function(){
      var modelDraw = this.modelDraw;
      var preview = this.preview;
      var layer = this.layer;
      window.global && global
      .on('preview-image-start', this.checkImagePanel.bind(this))
      .on('preview-image-ready', this.addImage.bind(this))
      .on('pinch-transform', function(d) {
        modelDraw.saveImage('transform', d.transform);
        preview.setControl('transform', d.transform);
      });
    }
  });

  return Bg;
});