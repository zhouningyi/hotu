'use strict';

define(['zepto'], function($) {
  function Bg(container) {
    container = this.container = container || $('.container');
    this.container = container;
    this.containerW = container.width();
    this.containerH = container.height();

    this.color = {
      hue: 180,
      light: 100,
      sat:80
    };

    this.bgIndex = 0;
    this.dom();
    this.update();
    this.events();
  }

  Bg.prototype.getHSLcolor = function(){
    var color = this.color || {};
    return 'hsla('+color.hue+','+color.sat+'%,'+color.light+'%,1)';
  };

  Bg.prototype.update = function(){
    var bgColor = this.bgColor = this.getHSLcolor();
    var self = this;
    setTimeout(function(){
      self.container.trigger('bg-color-change', bgColor);
    },100);

    this.container.css({
      'background': bgColor
    });
    this.updateCanvas();
  };

  Bg.prototype.setOptions = function(obj){
    if(obj){
      this.bgColor = obj.value;
      this.update();
    }
  };

  Bg.prototype.dom = function(obj) {
    obj = obj || {};
    var quality = obj.quality || 1;
    var canvas = $('<canvas width="' + this.containerW * quality + '" height="' + this.containerH * quality + '"></canvas>').css({
      'width': this.containerW,
      'height': this.containerH,
      'pointerEvents':'none',
      'opacity':0
    }).appendTo(this.container);

    canvas = this.canvas = canvas[0];
    var ctx = this.ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);
  };


/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////背景替换///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

  Bg.prototype.toImage = function() {
    return this.canvas;
  };

  Bg.prototype.updateCanvas = function() {
    var ctx = this.ctx;
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
  };


  Bg.prototype.applyStyle = function(node) {
    var width = node[0].width;
    var height = node[0].height;
    var containerW = this.container.width();
    var containerH = this.container.height();

    if (width / containerW > height / containerH) return node.css({
      'position':'absolute',
      'top':(containerH - containerW*height/width)/2,
      'display':'block',
      'width': '100%',
      'height': 'auto',
      'backgroundPosition': 'center'
    });

    return node.css({
      'position':'absolute',
      'display':'block',
      'height': '100%',
      'width': 'auto',
      'verticalAlign': 'middle',
      'backgroundPosition': 'center'
    });
  };
    Bg.prototype.events = function(obj){
      var imageContainer = this.container.find('.bg-image-container');
      var self = this;
      $('body') .on('controlrable', function(e, obj) {
        if(!obj) return;
        var target = obj.target;
        var value = obj.value;
        var name = obj.name;
        if(target==='bg'&&name==='color'){
          if(value) self.color = value;
        }else if(target==='bg'&&name==='image'){
          if(value) {
            var url = value.url;
            var bgImg =
            $('<img src="'+url+'"></img>').appendTo(imageContainer.empty());
            setTimeout(function(){self.applyStyle(bgImg);},10);
          }
        }
      });
    };

  return Bg;
});
