'use strict';
//对UI的总体控制
define(['./../../utils/utils', './../../libs/event'], function(Utils, Event) {
  var body = $('body');
  var isNone = Utils.isNone;
  var prevent = Utils.prevent;

  function InfoPanel(container, options) {
    this.initialize(container, options);
  }
  Event.extend(InfoPanel, {
    isIn: false,
    isHelpMode: false,
    options: {
      width: 150,
      height: 100,
      top: '40%',
      imageTop: '20%',
      inDelay: 1000,
      in: {
        time: 0.2
      },
      out: {
        delay: 0,
        time: 0.2
      }
    },
    initialize: function(container, options) {
      this.container = container;
      Utils.extend(this.options, options);

      //
      this.initDom();
      this.initEvents();
      this.initHelpEvents();

      this.helpList = [
      '*关注*: 微信号*hotuco*',
      '*记下*: 网址*hotu.co*',
      '*两根手指*放大画布',
      '*轻按画布*隐藏工具',
      '浏览器->*添加到主屏幕*',
      '*pad打开*,大画幅'
      ];
      this.helpIndex = Math.floor(Math.random() * this.helpList.length);
    },
    initDom: function () {
      var options = this.options;
      var maxWidth = Math.min(500, this.container.width() * 0.5);
      this.panelNode = $(
        '<div class="info-node transition" style="min-width:' + options.width + 'px; max-width:' + maxWidth + 'px;"></div>')
        .appendTo(this.container);
    },
    initEvents: function () {
      var out = this.out.bind(this);
      var imageNode = this.imageNode, panelNode = this.panelNode;
      window.global && global
        .on('in-using', out)
        .on('draw-image', this.image.bind(this));
    },
    image: function (imageHTML) {
      window.global && global.trigger('painter-tap');
      if (this.isImageIn) return;
      this.in();
      this.isImageIn = true;
      var style = 'color:#ccc;z-index:1;text-align:center;margin-left:auto;margin-right:auto;position:relative;line-height:30px;font-size:12px;';
      imageHTML += '<div style="' + style + '">长按图片下载 点击空白还原</div>';
      window.clearTimeout(this.clearId);
      this.panelNode
      .css('top', this.options.imageTop)
      .html(imageHTML);
    },
    help: function () {
      this.isHelpMode = true;
      this.helpIndex = (this.helpIndex + 1) % this.helpList.length;
      var text = this.helpList[this.helpIndex];
      this.alert(text, 5000);
      if (Math.random() < 0.2) return this.out();
      this.broadcastId = setTimeout(this.help.bind(this), 3000);
    },
    initHelpEvents: function () {
      var self = this;
      this.container.on('touchstart mousedown', function (e) {
        prevent(e);
        if (!self.isHelpMode) return;
        self.out();
      });
    },
    genHtml: function (text) {
      var ts = text.split('*');
      if (ts.length === 1) return text;
      var html = '', tag;
      for (var i in ts) {
        html += (' ' + ts[i] + ' ') ;
        html += (i % 2 === 0 && i !== ts.length) ? ' <span style="color:#fff;font-weight:bold;">' : '</span> ';
      }
      html += '<br><span style="color:hsl(160,0%,50%);font-weight:bold;font-size:12px;">轻按返回/开始创作</span>';
      return html;
    },
    alert: function (text, time) {
      if (!text) return;
      this.panelNode
      .html(this.genHtml(text))
      .css('top', this.options.top);
      this.in();
      window.clearTimeout(this.clearId);
      this.clearId = setTimeout(this.out.bind(this), time || this.options.inDelay);
    },
    in : function () {
      if (this.isIn) return;
      this.panelNode.keyAnim('fadeIn', this.options.in);
      // this.panelNode.css('pointer-events', 'auto');
      this.isIn = true;
    },
    out: function () {
      if (!this.isIn) return;
      this.isImageIn = false;
      window.clearTimeout(this.broadcastId);
      this.isHelpMode = false;
      this.panelNode.keyAnim('fadeOutSlowDown', this.options.out);
      // this.panelNode.css('pointer-events', 'none');
      this.isIn = false;
    }
  });
  return InfoPanel;
});