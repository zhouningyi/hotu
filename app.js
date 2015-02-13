'use strict';

define(['./config'], function() {
  require(['zepto', 'ui/loading_qingren', 'ui/gui', 'editor/bg', 'editor/painter'], function($, Loading, Gui, Bg, Painter) {

    var mode = 'direc1t';

    if (mode === 'direct') {
      init();
    } else {
      var loading = new Loading($('.main-container'));
      $('body').one('start', init);
      $('.tools').keyAnim('fadeInLeft', {
        time: 2.5
      });
      $('.end-tools').keyAnim('fadeInLeft', {
        time: 3
      });
    }

    function prevant(e) { //清除默认事件
      e.preventDefault();
      e.stopPropagation();
    }

    function init() {
      $('.tools').css('opacity', 1);
      $('.end-tools').css('opacity', 1);
      var bgContainer = $('.bg-container');
      var painter = new Painter($('.draw-container'));
      var bg = new Bg(bgContainer);
      var gui = new Gui();

      //所有的iconFont在点击后都会山闪动
      $('.iconfont-mobile').on('touchstart', function() {
        $(this).keyAnim('fadeOutIn', {
          'time': 1,
          'icount': 5,
          'cb': function() {
            $(this).clearKeyAnim();
          }
        });
      });



      $('#clear').on('touchstart', function(e) {
        prevant(e);
        painter.clear();
      });
      $('#download').on('touchstart', function(e) {
        prevant(e);
        painter.download();
      });
      $('#brush').on('touchstart', function(e) {
        prevant(e);
        painter.setBrush();
      });
      $('#background').on('touchstart', function(e) {
        prevant(e);
        bg.setBg();
      });
      $('#broadcast').on('touchstart', function(e) {
        prevant(e);
        painter.redraw();
      });
      $('#refresh').on('touchstart', function(e) {
        prevant(e);
        window.location.reload();
      });
    }


  });
});
