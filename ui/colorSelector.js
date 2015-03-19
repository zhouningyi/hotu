'use strict';
//对UI的总体控制
define(['zepto', 'anim'], function($) {
  function ColorSelector(container) {
    this.container = container;
    this.containerW = container.width();
    this.containerH = container.height();
    this.gridW = 30;
    this.init();
    this.isOut = true;
    this.events();
  }

  ColorSelector.prototype.init = function() {
    var gridW = this.gridW,
      containerW = this.containerW,
      container = this.container;
    var c, xi, yi;
    var xN = Math.round(containerW / gridW);
    gridW = containerW / xN;
    var yN = 5;
    for (var y = 0; y < yN; y++) {
      yi = y / (yN - 1);
      for (var x = 0; x < xN; x++) {
        xi = x / (xN - 1);
        c = Color({
          'hue': 360 * xi,
          'saturation': yi,
          'value': 1 - yi / 3
        }).toString();
        var grid = $('<div class="color-grid color-grid-unselected"></div>').css({
          'width': gridW - 2,
          'height': gridW - 2,
          'background': c
        });
        container.append(grid);
      }
    }
  };

    ColorSelector.prototype.initHueSlider = function() {

    };

  ColorSelector.prototype.events = function() {
    var self = this;
    this.container.delegate('div','touchstart mousedown', function(i, d){
      self.curColorNode && self.curColorNode.removeClass('color-grid-selected').addClass('color-grid-unselected');
      self.curColorNode = $(this).removeClass('color-grid-unselected').addClass('color-grid-selected');
    });
  };

  return ColorSelector;
});
