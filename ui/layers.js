'use strict';
//对UI的总体控制
define(['zepto'], function ($) {
  var body = $('body');

  function Layers(containers, parent) {
    this.containers = containers;
    this.parent = parent;

    this.status = 'out';
    this.init();
  }

  Layers.prototype.init = function () {
    this.parent.css({
      '-webkitTransformStyle': 'preserve-3d',
      'transformStyle': 'preserve-3d',
      '-webkitPerspective': '600px',
      'perspective': '600px'
    })
    .on('touchstart mousedown', function () {
      body.trigger('root-work');
    });
  };

  Layers.prototype.switch = function () {
    if (this.status === 'out') return this.in();
    if (this.status === 'in') return this.out();
  };

  Layers.prototype.in = function () {
    if (this.status !== 'in') {
      var containers = this.containers;
      var N = containers.length;
      for (var i = 0; i < N; i++) {
        var container = containers[i];
        var ki = i / N;
        var z = ki * 420;
        container.css({//scale3d(0.5,0.5,0.5) rotate3d(1, 0, 0, 60deg) 
          '-webkitTransform': 'scale3d(0.5,0.5,0.5) rotateX(60deg) translate3d(60px, 0, ' + z + 'px)' ,// rotate3d(1, 0, 0, 60deg)
          // 'transform': 'scale3d(0.5,0.5,0.5) rotate3d(1, 0, 0, 60deg) translate3d(60px, 0px, ' + z + 'px)',
          // 'transform': 'scale3d(0.5,0.5,0.5) rotateX(60deg) translateZ(' + z + 'px ) translateX(60px)',
          'transformOrigin': '50% 59%',
          '-webkitTransformOrigin': '50% 59%',
          'boxShadow': '2px 2px 30px #999',
          'border': 'solid 1px #fff'
        });
      }
      this.status = 'in';
    }
  };

  Layers.prototype.out = function() {
    if (this.status !== 'out') {
      var containers = this.containers;
      var N = containers.length;
      for (var i = 0; i < N; i++) {
        containers[i].css({
          '-webkitTransform': 'translate3d(0px,0,0)',
          // 'transform': 'scale3d(1,1,1) rotate3d(1, 0, 0, 0deg) translate3d(0px, 0px, 0px)',
          // '-mozTransform': 'scale3d(1,1,1) rotateX(0deg) translateZ(0px) translateX(0px)',
          // 'transform': 'scale3d(1,1,1) rotateX(0deg) translateZ(' + 0 + 'px)',
          '-webkitTransformOrigin': '50% 59%',
          '-mozTransformOrigin': '50% 59%',
          'transformOrigin': '50% 59%'
        });
      }
      this.status = 'out';
      setTimeout(function() {
        for (var i = 0; i < N; i++) {
          containers[i].css({
            'boxShadow': 'none',
            'border': 'solid 0px #fff'
          });
        }
      }, 600);
    }
  };

  return Layers;
});