'use strict';

define(['zepto', 'anim', './data/mock1', './../../render/animator', './../../brush/brushes'], function($, k, dataMock, Animator, Brushes) {
  
  var brushes = new Brushes();
  var brushObj = brushes.brushObj;

  function Controller() {
    this.container = $('.main-container');
    this.initCanvas(dataMock);
    this.initAim(dataMock);
    this.events();
  }

  Controller.prototype.events = function () {
    var curAnimation = this.curAnimation;
    $('.button').on('click', function () {
      var node = $(this);
      var hasClick = node.hasClass('button-clicked');
      if(!hasClick){
        curAnimation.stop();
        return node.addClass('button-clicked');
      }
      curAnimation.resume();
      node.removeClass('button-clicked');
    });
  };

  Controller.prototype.initCanvas = function (data) {
    var canvas = this.canvas = $('<canvas width="' + data.frameW + '" height="' + data.frameH + '"></canvas>').appendTo(this.container)[0];
    this.ctx = canvas.getContext('2d');
  };

  Controller.prototype.initAim = function (data) {
    this.curAnimation = new Animator({
      brushes: brushObj,
      data: dataMock,
      ctx: this.ctx
    });
  };

  Controller.prototype.init = function() {
  };
  return Controller;
});
