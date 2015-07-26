'use strict';
//对UI的总体控制
define (['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  var prevent = Utils.prevent;

  function TopTools(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(TopTools, {
    isOut: false,
    options: {
      background: 'rgba(40,40,40,1)',
      height: 40,
      paddingTop: 10
    },
    initialize: function (container, options) {
      this.container = container;
      this.editor = options.editor;
      //
      this.options = Utils.merge(this.options, options);
      this.initDom();
      this.initEvents();
      this.initDelete();
      this.initDownload();
      this.initUpload();
    },
    initDom: function () {
      var options = this.options;
      this.topToolsNode = $('<div class="top-tools"></div>')
      .css({
        'background': options.background,
        'height': options.height
      })
      .appendTo(this.container);
    },
    initEvents: function () {
      window.global && global.on('painter-tap', this.switch.bind(this));
    },
    initDelete: function () {
      var editor = this.editor;
      this.deleteNode =
      $('<i class="style-normal iconfont iconfont-mobile icon-ios-trash inline-block" id="restart" style="height:'+this.options.height+'">&#xe60f;</i>')
      .appendTo(this.topToolsNode);
      this.deleteNode.on('mousedown touchstart', function (e) {
        window.global && global.trigger('select-start');
        prevent(e);
        editor.new();
      });
    },
    initDownload: function () {
      var editor = this.editor;
      this.downloadNode =
      $('<i class="style-normal iconfont iconfont-mobile inline-block" id="download" style="height:' + this.options.height+'">&#xe606;</i>')
      .appendTo(this.topToolsNode);
      this.downloadNode.on('mousedown touchstart', function (e) {
        window.global && global.trigger('select-start');
        prevent(e);
        editor.toImage();
      });
    },
    initUpload: function () {
      this.uploadNode =
      $('<i class="style-normal iconfont iconfont-mobile icon-android-upload inline-block" id="submit-message" style="color:hsl(160,100%,40%);">&#xe605;</i>')
      .appendTo(this.topToolsNode);
    },
    initSubTools: function () {
      this.endSubTools = new EndSubTools(this.container, {parent: this.options});
    },
    switch: function () {
      (this.isOut) ? this.in() : this.out();
    },
    in : function () {
      if (!this.isOut) return;
      this.container
      .keyAnim('fadeInSlowUp', {
        time: 0.1,
        delay: 0.1
      });
      this.isOut = false;
    },
    out: function () {
      if (this.isOut) return;
      this.container.keyAnim('fadeOutSlowDown', {
        time: 0.1,
        delay: 0.1
      });
      this.isOut = true;
    }
  });

  return TopTools;
});