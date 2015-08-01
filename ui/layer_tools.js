'use strict';
define(['./../libs/event', './../utils/utils', './layer_tools_add'], function (EventEmitter, Utils, LayerToolsAdd) {

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
        'currentBol': false
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
      this.modelDraw = options.modelDraw;

      this.initDom();
      this.initEvents();
    },
    initDom: function () {
      var container = this.container;
      var layersNode = this.layersNode = $('<div style="width:100%;height:auto;position:relative;"></div>').appendTo(container);
      var layers = this.layers, self = this;
      layers.each(function (layer) {
        self.createIcon(layer, true, layersNode);
      }, true);

      // add 按钮
      this.createIcon({
        type: 'add'
      });
      var subAdd = this.subAdd = new LayerToolsAdd(container,{
        'modelDraw': this.modelDraw,
        'layers': this.layers
      });
      subAdd.bindTo(container);
      container.find('#' + layers.current().id).addClass('layer-tools-selected');
    },
    initEvents: function () {
      var container = this.container;
      var layers = this.layers;
      var self = this;
      window.global && global
      .on('add-layer', function(layer){
        self.createIcon(layer, true, self.layersNode);
        // var zList = layers.zList;
        // var id = layer.id;
        // for(var i in zList){
        //   if(id === zList[i]){
        //     var nodeid = zList[(i+1)%zList.length];
        //     var node = nodeid

        //   }
        // }
        // console.log(zList, id);
      })
      .on('painter-tap', this.switch.bind(this))
      .on('main-color-change', function(c){
        var cs = c.split(',');
        cs[3] = '0.6)';
        c = cs.join(',');
        console.log(c);
        container.css({'background': c});
      });

      //
      this.layers
      .on('select', function (layer) {
        container.find('#' + layer.id).addClass('layer-tools-selected');
      })
      .on('unselect', function (layer) {
        container.find('#' + layer.id).removeClass('layer-tools-selected');
      });
    },
    addLayerIcon: function(layer){
      var id = layer.id;
      console.log(id);
    },
    createIcon: function (obj, layerBol, container) {
      container = container || this.container;
      var options = this.options, type = obj.type, info = options[type];
      var node = obj.node = $(
        '<div class="ui-grid">\
           <i class="style-dark iconfont iconfont-mobile block layer-tools-normal ' + info.class + '" id="' + obj.id + '" type="' + type  + '" style="border-radius:5px; width:40px;">' + info.iconfont + '</i>\
           <span class="icon-text gray-middle">' + info.name + '<span>\
         </div>').appendTo(container);
      if (layerBol) return this.initEventsLayerNode(node);
      this.initEventsAddNode(node);
    },
    initEventsLayerNode: function (node) {//有图层的layer的图标的事件
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
    initEventsAddNode: function(node){//添加按钮的事件
      var self = this;
      node
      .on('touchstart mousedown', function (e) {
        window.global && global.trigger('select-start', 'add-image');
        prevent(e);
        self.subAdd.switch();
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
  
