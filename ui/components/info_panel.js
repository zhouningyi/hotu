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
      width: 200,
      height: 100,
      inDelay: 1000,
      in:{
        time: 0.2
      },
      out:{
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
      '*关注*: 搜微信号*hotuco*',
      '*访问*: 键入网址*hotu.co*', 
      '*双指放大*画布☜ ☞', 
      '*轻按隐藏*工具栏☜', 
      '添加桌面:浏览器->*添加到主屏幕*'
      ];
      this.helpIndex = Math.floor(Math.random() * this.helpList.length);
    },
    initDom: function() {
      var options = this.options;
      this.panelNode = $('<div class="info-node transition" style="min-width:' + options.width + 'px"></div>')
        .appendTo(this.container);
    },
    initEvents: function() {
      window.global && global
        .on('paint-start', this.out.bind(this))
        .on('select-start', this.out.bind(this))
        .on('painter-tap', this.out.bind(this))
        // .on('select-start', this.out.bind(this));
    },
    help: function(){
      this.isHelpMode = true;
      this.helpIndex = (this.helpIndex + 1) % this.helpList.length;
      var text = this.helpList[this.helpIndex];
      this.alert(text, 5000);
      this.broadcastId = setTimeout(this.help.bind(this), 3000);
    },
    initHelpEvents: function(){
      var self = this;
      this.container.on('touchstart mousedown', function(e){
        prevent(e);
        if(!self.isHelpMode) return;
        self.help();
      });
    },
    genHtml: function(text){
      var ts = text.split('*');
      if(ts.length === 1) return text;
      var html = '', tag;
      for(var i in ts){
        html += (' ' + ts[i] + ' ') ;
        html+= (i%2===0 && i!==ts.length)?' <span style="color:#fff;font-weight:bold;">':'</span> ';
      }
      return html;
    },
    alert: function(text, time){
      if(!text) return;
      this.panelNode.html(this.genHtml(text));
      this.in();
      window.clearTimeout(this.clearId);
      this.clearId = setTimeout(this.out.bind(this), time || this.options.inDelay);
    },
    in : function() {
      if (this.isIn) return;
      this.panelNode.keyAnim('fadeIn', this.options.in);
      this.panelNode.css('pointer-events', 'auto');
      this.isIn = true;
    },
    out: function() {
      if (!this.isIn) return;
      window.clearTimeout(this.broadcastId);
      this.isHelpMode = false;
      this.panelNode.keyAnim('fadeOut', this.options.out);
      this.panelNode.css('pointer-events', 'none');
      this.isIn = false;
    },
  });
  return InfoPanel;
});