'use strict';
define(['./../libs/event', './../utils/utils', './layer', './layers.exports', './layers.events'], function(EventEmitter, Utils, Layer, Exports, Events) {
  var body = $('body');

  function Layers(container, options) {
    this.initialize(container, options);
  }

  EventEmitter.extend(Layers, {
    isOut: false,
    isDraw: true,
    _data: {
      brush_default: {
        type: 'brush',
        quality: 2,
        index: 1,
        id: 'brush_default',
        current: true
      },
      background_default: {
        type: 'background',
        quality: 2,
        index: 2,
        id: 'background_default'
      }
    },
    zList: ['background_default', 'brush_default'],
    options: {
      zoom: {
        min: 1,
        max: 4
      },
      quality: 2
    },
    initialize: function (container, options) {
      this.container = container;
      this.width = container.width();
      this.height = container.height();
      Utils.merge(this.options, options);
      this.eventsNode = options.eventsNode;
      this.id = 'layer-tools';

      this.render(this._data, this.zList);
      this.initEvents();
      this.initExports();
    },
    render: function (ds, zList) {
      for (var i in zList) {
        var key = zList[i];
        this.create(ds[key]);
      }
    },
    each: function (fn, reverse) {
      if (typeof (fn) !== 'function') return console.log('layers.each: 请输入函数');
      var data, key, index, datas = this._data;
      var list = this.zList;
      for (var i in list) {
        index = reverse? list.length - 1 - i : i;
        key = list[index];
        data = datas[key];
        fn(data.layer, data);
      }
    },
    add: function (options) {
      options = options || {type: 'brush-layer'};
      if (!options.type) return console.log('必须带有类型');
      if (!options.id) options.id = 'id_' + parseInt(Math.random() * 10000);
      this._data[options.id] = options;
      this.create(options);
    },
    create: function (options) {
      var container = this.container;
      var layer = options.layer = new Layer(container, options);
      if(options.current) this.current(options.id);
    },

   //选择
    current: function (id) {
      var curLayer = this.curLayer;
      if (!id) return curLayer;
      if (curLayer && curLayer.id === id) return curLayer;
      this.unSelect(curLayer);
      this.curLayer = this.get(id);
      this.select(this.curLayer);
      return this.curLayer;
    },

    get: function (id) {
      var layers = this._data;
      for (var k in layers) {
        var layer = layers[k];
        if (layer.id === id) return layer.layer;
      }
    },
    unSelect: function (layer) {
      if (!layer) return;
      this.emit('unselect', layer);
    },

    select: function (layer) {
      if (!layer) return;
      var type = layer.type;
      if (type === 'brush') {
        this.isDraw = true;
      } else if (type === 'background') {
        this.isDraw = false;
      }
      this.emit('select', layer);
    },
    //
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

 var p = Layers.prototype;
 Utils.merge(p, Exports);
 Utils.merge(p, Events);

  return Layers;
});