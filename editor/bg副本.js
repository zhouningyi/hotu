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
      var layer = this.layer = options.layer;
      this.workOn(layer);
      this.initEvents();
      this.update();
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
      var color, image;
      var actions = this.actions;
      if (image = d.image) {
          // this.updateImage(bg.image.file);
      }
      if (color = d.color) actions.get('bgColor').render(color);
    },
    initEvents: function () {
      var actions = this.actions;
      var modelDraw = this.modelDraw;
      actions.on('control-change', this.update.bind(this));
      window.global && global.on('new-drawing', this.update.bind(this));
    },
    update: function () {
      var actions = this.actions, modelDraw = this.modelDraw;
      actions.each(function (id, action) {
        action.update();
        modelDraw.saveBg(action.key, action.toData());
      });
    }
  });

  return Bg;
});