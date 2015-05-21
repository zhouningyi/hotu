'use strict';

define(['zepto', 'anim'], function ($, l) { //'./../utils/qrcode' QRCode
  function Helper(container, opt) {
    this.container = container;
    this.config = opt.config;

    this.init();
    this.animateIn();
    this.genAnimation();
    this.events();
  }

  // Helper.prototype.qrcode = function (node) {
  //   var d = node.width() - 20;
  //   var qrcode = new QRCode(node[0], {
  //     text: 'http://hotu.co',
  //     width: d,
  //     height: d,
  //     colorLight: '#ffffff',
  //     colorDark: 'rgba(0,0,0,0.8)',
  //     correctLevel: QRCode.CorrectLevel.H
  //   });
  // };

  Helper.prototype.init = function () {
    var container = this.container;
    container.append(
      $('<div class="loading-container">\
          <div class="loading-animation-container"></div>\
          <div class="entry-image-container">\
          <img class="entry-image" src="http://open-wedding.qiniudn.com/qrcodeblack.jpg"></img>\
          <img class="entry-word entry-img" src="http://open-wedding.qiniudn.com/word3.png">\
          </div>\
          <div class="loading-submit-button">跳 过</div>\
        </div>')
      );
    // /hotu/others/
    this.imageNode = container.find('.entry-image');
    // this.qrcode(this.imageNode);
    this.loadingNode = container.find('.loading-container');
    this.wordNode = container.find('.entry-word');
    this.buttonNode = container.find('.loading-submit-button');

    this.animationContainer = container.find('.loading-animation-container');
  };

  Helper.prototype.fullScreen = function (element) {
    var fullScreens = ['webkitRequestFullScreen', 'requestFullScreen', 'mozRequestFullScreen', 'msRequestFullscreen'];
    for (var k in fullScreens) {
      if (element[fullScreens[k]]) {
        element[fullScreens[k]]();
      }
    }
  };

  Helper.prototype.animateIn = function () {
    this.loadingNode.keyAnim('fadeIn', {
        'time': 0.2
      });
    this.imageNode.keyAnim('fadeInLeft', {
        'time': 1.0,
        'delay': 0.3
      });
    this.wordNode.keyAnim('fadeInLeft', {
        'time': 1.5,
        'delay': 0.3
      });
    this.buttonNode.keyAnim('fadeInLeft', {
        'time': 1.8,
        'delay': 0.3
      });
  };

  Helper.prototype.animateOut = function () {
    var loadingNode = this.loadingNode;
    loadingNode
    .css({
      'pointerEvents': 'none'
    })
    .clearKeyAnim();
    loadingNode.keyAnim('fadeOut', {
        'time': 1.5,
        'delay': 0.5,
        'cb': function () {
          setTimeout(function () {
            loadingNode.css({
              'display': 'none'
            });
          }, 2000);
        }
      });
    this.imageNode.keyAnim('fadeOutLeft', {
        'time': 0.3
      });
    this.wordNode.keyAnim('fadeOutLeft', {
        'time': 0.5
      });
    this.buttonNode.keyAnim('fadeOutLeft', {
        'time': 0.8
      });
  };

  Helper.prototype.genAnimation = function () {
    var animationContainer = this.animationContainer;
    var containerW = animationContainer.width();
    var containerH = animationContainer.height();
    var animationN = 16;
    var k = 0, html = '', cos = Math.cos, sin = Math.sin, abs = Math.abs, ki, cx, cy, width, height, time, animDiv, cOffset, PI = Math.PI;
    for (k = 0; k < animationN; k++) {
      var cosk = abs(cos(ki * PI));
      var sink = abs(sin(ki * PI));
      ki = k / animationN;
      cy = sink * containerH;
      cx = cosk * containerW;
      width = cosk * containerW * 2  + 200;
      height = sink * containerH * 2 + 200;
      cOffset = Math.floor(cosk * 100);
      time = 2 + 6 * sink;
      animDiv = $('<div></div>').css({
        'position': 'absolute',
        'width': width,
        'height': height,
        'left': cx - width / 2,
        'top': cy - height / 2,
        'background': 'hsl(' + Math.floor(cosk * 180 + 160) + ',100%,50%)'
      })
      .keyAnim('loading-animation', {
        'time': time
      })
      .appendTo(animationContainer);
    }
  };

  Helper.prototype.events = function () {
    var config = this.config;
    var buttonNode = this.buttonNode;
    var self = this;
    buttonNode.on('click', function () {
      // self.fullScreen(this);
      self.animateOut();
    });
    this.container.find('.entry-image-container').on('click', function () {
      window.location.href = config.helpLink;
    });
  };

  return Helper;
});