'use strict';
//对UI的总体控制
define(['./../libs/event', './../utils/utils'], function(EventEmitter, Utils) {

  var body = $('body');
  var prevent = Utils.prevent;

  function BrushSelector(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(BrushSelector, {
    options: {
      panel: {
        height: 50
      },
      small: {
        height: 40
      }
    },
    initialize: function(container, options) {
      this.container = container;
      this.brushes = options.brushes;
      this.subTools = options.subTools;
      Utils.merge(this.options, options);
      this.targets = options.targets;
      this.id = 'brush-selector';

      this.initDom();
      this.initSubTools();
      this.initBrushList();
      this.initEventsBrush();
      this.initEvents();
    },
    initDom: function() {
      var options = this.options,
        small = options.small,
        subTools = this.subTools;
      //
      this.brushNode = $('\
        <div class="ui-grid">\
           <i class="style-normal iconfont iconfont-mobile block icon-android-create" id="brush">&#xe614;</i>\
           <div class="icon-text gray-middle">换笔<div>\
        </div>')
        .appendTo(this.container);
      //
      var subContainer = this.subContainer = subTools.getRectSmall().css({
        height: small.height
      }).empty();
      this.panelContainer = subTools.getRectPanel().css({
        height: this.options.panel.height
      });
    },
    initSubTools: function() {
      var subTools = this.subTools;
      this.subContainer = subTools.getRectSmall().html('<div class="tools-list"></div>');
      this.toolsListNode = this.subContainer.find('.tools-list');
      this.panelContainer = subTools.getRectPanel();
      subTools.bind(this.container);
    },
    initEvents: function() {
      var self = this;
      this.brushNode.on('touchstart mousedown', function() {
        window.global && global.trigger('select-tool', self.id);
      }.bind(this));
      window.global && global.on('select-tool', function(id) {
        if (id !== self.id) return self.out();
        self.in();
      });
    },

    initBrushList: function() {
      var toolsListNode = this.toolsListNode, brushes = this.targets, self = this;
      //遍历所有的brush 并绘制
      brushes.each(function(brushId, brush) {
        var node = $('<div class="tools-list-icon" id="' + brushId + '">' + brush.name + '</div>')
          .on('touchstart mousedown', function(e) {
            brushes.current($(this).attr('id'));
            window.global && global.trigger('select-start');
            prevent(e);
          }).on('touchend mouseup', function(e) {
            window.global && global.trigger('select-end');
          });
        if (brush.id == brushes.current().id) {
          self.curBrushNode = node.addClass('tools-list-icon-active');
        }
        toolsListNode.append(node);
      });
    },
    initEventsBrush: function(){
      var self = this, toolsListNode = this.toolsListNode;
      this.targets.on('current', function(brush){
        if (self.curBrushNode) self.curBrushNode.removeClass('tools-list-icon-active');
        self.curBrushNode = toolsListNode.find('#' + brush.id).addClass('tools-list-icon-active');
        // self.brushNode.find('.icon-text').text(self.targets.current().name || '画笔');
    });
    },
    in : function() {
      this.subTools.in();
    },
    out: function() {
      this.subTools.out();
    },
    updateUI: function() {
      var target = this.target = this.targets.current();
      var controls = target.controls;
      var widthObj = controls.widthMax || controls.width;
      if (widthObj) {
        this.updateWidthSlider();
      }
    },
    updateWidthSlider: function() {
      if (this.widthSlider) this.widthSlider.setTarget(this.target);
    },
  });

  return BrushSelector;
});