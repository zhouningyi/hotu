'use strict';

define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  var upper = Utils.upper;
  var cleanCtx = Utils.cleanCtx;

  function Image(options) {
    this.initialize(options);
  }

  EventEmitter.extend(Image, {
    options: {
      tasks: ['preview']
    },
    initialize: function (options) {
      Utils.deepMerge(this.options, options);
      this.modelDraw = options.modelDraw;
      var preview = this.preview = options.preview;
      this.modelDraw = options.modelDraw;
      var layers = this.layers = options.layers;
      this.initEvents();
      this.update();
    },
    linkTo: function (editor) {
      this.editor = editor;
    },
    new: function () {
      this.layer && this.layer.clean();
      // this.preview.get('bgColor')
      // .setControl('lightSat', {
      //   light: 1,
      //   sat: 0
      // });
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
      this.checkImageLayer();//看看创建了image layer没有
      var transform, url;
      var preview = this.preview;
      if (url = d.url){
        preview.addURL(url);
        preview.setControl('url', url);
      }
      if (transform = d.transform) preview.setControl('transform', transform);
    },
    initEvents: function () {

    },
    update: function () {
    }
  });

  return Image;
});