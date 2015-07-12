'use strict';

define([], function () {
  function Bg(container, opt) {
    opt = opt || {};
    var modelDraw = this.modelDraw = opt.modelDraw;
    container = this.container = container || $('.container');
    this.container = container;
    this.containerW = container.width();
    this.containerH = container.height();
    var actions = this.actions = opt.actions;
    var actionList = actions.actionList;

    for (var k in actionList) {
      var action = actionList[k];
      action.set({
        'container': container,
        'modelDraw': modelDraw
      });
    }
    this.dom();
    this.events();
  }

  Bg.prototype.dom = function (obj) {
    obj = obj || {};
    var quality = obj.quality || 1;
    var canvas = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>').css({
      'width': this.containerW,
      'height': this.containerH,
      'pointerEvents': 'none',
    });
    canvas = this.canvas = canvas[0];
    var ctx = this.ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };


  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////背景替换///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  Bg.prototype.toImage = function () {
    var actionList = this.actions.actionList;
    var ctx = this.ctx;
    for(var k in actionList){
      var action = actionList[k];
      action.toImage(ctx);
    }
    return this.canvas;
  };

  Bg.prototype.reload = function (d) {
    if(!d) return;
    var bg = d.bg;
    var actions = this.actions.actionsObj;
    if (bg) {
      if (bg.image) {
        // this.updateImage(bg.image.file);
      }
      if (bg.color) {
        var color = bg.color;
        for(var key in color){
          actions.bgColor.controls[key].value = color[key];
          actions.bgColor.onStyleChange(key);
        }
      }
    }
  };

  Bg.prototype.events = function () {

  };

  return Bg;
});