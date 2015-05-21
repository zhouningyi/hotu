'use strict';

define(['zepto', 'anim', './ui/displayer', './ui/gallery'], function($, k, Displayer, Gallery) {
  var displayer, gallery;
  var displayerContainer = $('.displayer-container'), ablumContainer = $('.ablum-container');
  function Controller(){
    this.init();
    this.events();
  }

  Controller.prototype.init = function() {
    displayer = new Displayer(displayerContainer);
    gallery = new Gallery(ablumContainer);
  };

  Controller.prototype.events = function() {
    $('i')
    .on('touchstart touchmove mousedown', function(e){
      $(this).addClass('node-clicked');
      e.preventDefault();
    })
    .on('touchleave touchend mouseup mouseout', function(e){
      $(this).removeClass('node-clicked');
      e.preventDefault();
    });
    
    $('.image')
    .on('touchstart touchmove mousedown', function(e){
      $(this).addClass('image-clicked');
    })
    .on('touchleave touchend mouseup mouseout', function(e){
      $(this).removeClass('image-clicked');
    });
  };
  return Controller;
});
