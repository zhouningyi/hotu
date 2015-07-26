'use strict';
define(['./../libs/event', './../utils/utils'], function (EventEmitter, Utils) {

  var body = $('body');
  var prevent = Utils.prevent;

  function LayerTools(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(LayerTools, {
    isOut: false,
    options: {
      brush: {
        type: 'brush',
        iconfont: '&#xe614;',
        name: '画布',
        class: 'icon-android-create',
        'currentBol': true
      },
      background: {
        type: 'background',
        iconfont: '&#xe615;',
        name: '背景',
        class: 'icon-social-buffer',
        'currentBol': true
      },
      add: {
        type: 'add',
        iconfont: '&#xe600;',
        name: '增加',
        class: 'icon-social-buffer',
        'currentBol': false
      }
    },
    initialize: function (container, options) {
      this.container = container;
      Utils.merge(this.options, options);
      this.layers = options.layers;
      this.id = 'layer-tools';

      this.initDom();
      this.initEvents();
    },
    initDom: function () {
      var layers = this.layers, self = this;
      var container = this.container;
      layers.each(function (layer) {
        self.createIcon(layer);
      }, true);

      container.find('#' + layers.current().id).addClass('layer-tools-selected');
    },
    initEvents: function () {
      var container = this.container;
      window.global && global.on('painter-tap', this.switch.bind(this));
      this.layers
      .on('select', function (layer) {
        container.find('#' + layer.id).addClass('layer-tools-selected');
      })
      .on('unselect', function (layer) {
        container.find('#' + layer.id).removeClass('layer-tools-selected');
      });
    },
    createIcon: function (obj) {
      var options = this.options, type = obj.type, info = options[type];
      var node = obj.node = $(
        '<div class="ui-grid">\
           <i class="style-dark iconfont iconfont-mobile block layer-tools-normal ' + info.class + '" id="' + obj.id + '" type="' + type  + '" style="border-radius:5px; width:40px;">' + info.iconfont + '</i>\
           <span class="icon-text gray-middle">' + info.name + '<span>\
         </div>').appendTo(this.container);
      this.initEventsNode(node);
      return node;
    },
    initEventsNode: function (node) {
      var layers = this.options.layers;
      var self = this;
      node
      .on('touchstart mousedown', function (e) {
        prevent(e);
        var id = node.find('i').attr('id');
        var layer = self.layers.current(id);
        window.global && global.trigger('select-layer', layer);
      })
      .on('touchend mouseup', function (e) {
        prevent(e);
        window.global && global.trigger('select-end');
      });
    },
    switch: function () {
      if (this.isOut) return this.in();
      this.out();
    },
    in : function () {
      if (!this.isOut) return;
      this.container.keyAnim('fadeInLeft', {
        time: 0.1
      });
      this.isOut = false;
    },
    out: function () {
      if (this.isOut) return;
      this.container.keyAnim('fadeOutLeft', {
        time: 0.1
      });
      this.isOut = true;
    }
  });

  return LayerTools;
});

   // <!--  <div class="ui-grid">
   //       <i class="style-normal iconfont iconfont-mobile block icon-social-buffer" id="layers">&#xe60f;</i>
   //       <span class="icon-text gray-middle">图层<span>
   //      </div> -->
   //     <!-- <i class="style-normal iconfont-mobile block icon-shuffle" id="transfer"></i> -->
   //      <!-- <div class="ui-grid"> -->
   //       <!-- <i class="style-normal iconfont-mobile block icon-social-youtube" id="broadcast">&#xe60d;</i> -->
   //      <!-- </div> -->
   //      <!-- <div class="ui-grid"> -->
   //       <!-- <i class="style-normal iconfont-mobile block icon-arrow-return-right" id="refresh">&#xe606;</i> -->
   //      <!-- </div> -->
  
