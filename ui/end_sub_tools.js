'use strict';
//对UI的总体控制
define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {
  var prevent = Utils.prevent;
  var body = $('body');

  function EndSubTools(container, options){
    this.initialize(container, options);
  }


  EventEmitter.extend(EndSubTools, {
    isOut: false,
    options: {
      background: 'rgba(30,30,30,1)',
      parent: {
        height: 10,
        paddingTop: 10
      },
      tri: {
        height: 10,
        width: 15
      },
      rectSmall:{
        height: 40,
      },
      rectPanel:{
        height: 50,
      }
    },
    initialize: function (container, options) {
      this.container = container;
      this.options = Utils.deepMerge(this.options, options);
      this.initDom();
      this.initEvents();
    },
    initEvents: function(){//防止乱拖动
      var events = 'touchstart mousedown mousemove touchmove';
      this.container.on(events, prevent);
      this.container.delegate('*', events, prevent);
    },
    initDom: function(){
      var container = this.container, options = this.options, tri = options.tri, rectSmall = options.rectSmall, rectPanel = options.rectPanel, parent = options.parent;
      var background = options.background;
      //次级方形栏
      var mainNode = this.mainNode = $('<div class="end-tools-sub ' + options.type + '"></div>').css({
        bottom: parent.height + parent.paddingTop * 2
      });
      if(options.isOut) {
        this.isOut = true;
         mainNode.css({
          '-webkit-transform': 'translate3d(100%, 0%, 0)',
          '-ms-transform': 'translate3d(100%, 0%, 0)',
          'transform': 'translate3d-100%, 0%, 0)'
         });
       }
       //
      this.rectPanelNode =  $('<div class="rect-panel"></div>')
      .css({
        'background': background,
        'height': rectPanel.height
      })
      .appendTo(mainNode);

      this.rectSmallNode =  $('<div class="rect-small"></div>')
      .css({
        'background': background,
        'height': rectSmall.height
      })
      .appendTo(mainNode);

      //三角
      this.triNode = $('<div class="tri transition"></div>').css({
        'border-bottom': tri.height + 'px',
        'border-right': tri.width + 'px solid transparent',
        'border-top': tri.height + 'px solid ' + background,
        'border-left': tri.width + 'px solid transparent',
        'height': tri.height + 'px',
      })
      .appendTo(mainNode);

      mainNode.appendTo(container);
    },
    bind: function(node){
      var options = this.options, tri = options.tri;
      var offset = node.offset();
      var w = node.width();
      var l = offset.left;
      var h = node.height();
      var t = offset.top;

      var triNode = this.triNode;
      triNode.css({
        left: w / 2 + l - tri.width 
      });
    },
    in: function(){
      if(!this.isOut) return;
      this.mainNode
      .keyAnim('fadeInSlowRight', {
        time: 0.2,
      });
      this.isOut = false;
    },
    out: function(){
      if(this.isOut) return;
      this.mainNode
      .keyAnim('fadeOutSlowLeft', {
        time: 0.2,
      });
      this.isOut = true;
    },
    getRectSmall: function(){
      return this.rectSmallNode;
    },
    getRectPanel: function(){
      return this.rectPanelNode;
    }
  });

  return EndSubTools;
});