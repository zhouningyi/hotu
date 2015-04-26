'use strict';

define(['zepto', 'anim'], function ($) {
  function Helper(container, cb) {
    this.container = container;

    this.cb = cb || function () {};
    this.entry();
    this.events();
  }

  Helper.prototype.entry = function () {
    var entryNode = this.entryNode = $('<div class="entry"></div>')
      .keyAnim('fadeInLeft', {
        time: 0.6
      });

    var titleNode = this.titleNode = $('<img class="entry-image" src="http://open-wedding.qiniudn.com/qrcode_min.png">')
      .keyAnim('fadeInLeft', {
        time: 1.2
      });
    entryNode.append(titleNode); //.append(helpNode);
    this.container.append(entryNode);
  };

  Helper.prototype.events = function () {
    var container = this.container;
    var cb = this.cb;
    container.on('touchstart', function () {
      $('.entry').keyAnim('fadeOut', {
        time: 0.5,
        cb: cb
      });
    });
  };

  return Helper;
});