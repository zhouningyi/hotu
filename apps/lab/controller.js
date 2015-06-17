'use strict';

define(['zepto', 'anim', './data/mock1', './../../render/animator', './../../brush/brushes', './../gallery/ui/display_slider'], function($, k, dataMock, Animator, Brushes, DisplaySlider) {
  
  var brushes = new Brushes();
  var brushObj = brushes.brushObj;

  function Controller() {
    this.container = $('.main-container');
    this.initCanvas(dataMock);
    this.initSlider();
    this.initAim(dataMock);
    this.events();
  }

  Controller.prototype.events = function () {
    var curAnimation = this.curAnimation;
    $('.button').on('click', function () {
      var node = $(this);
      var hasClick = node.hasClass('button-clicked');
      if (!hasClick) {
        curAnimation.to(600);
        return node.addClass('button-clicked');
      }
      curAnimation.to(200);
      node.removeClass('button-clicked');
    });

    var displaySlider = this.displaySlider;
    curAnimation.on('step', function (percent) {
      displaySlider.setValue(percent);
    });
    displaySlider.onBegin(curAnimation.switch.bind(curAnimation));
    displaySlider.onSlider(curAnimation.to.bind(curAnimation));
  };

  Controller.prototype.initCanvas = function (data) {
    var canvas = this.canvas = $('<canvas width="' + data.frameW + '" height="' + data.frameH + '"></canvas>').appendTo(this.container)[0];
    this.ctx = canvas.getContext('2d');
  };

  Controller.prototype.initSlider = function () {
    var controlNode = $('.control');
    this.displaySlider = new DisplaySlider(controlNode);
  };

  Controller.prototype.initAim = function (data) {
    this.curAnimation = new Animator({
      brushes: brushObj,
      data: data,
      ctx: this.ctx
    });
  };

  Controller.prototype.init = function () {
  };
  return Controller;
});
