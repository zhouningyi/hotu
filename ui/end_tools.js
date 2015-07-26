'use strict';
//对UI的总体控制
define(['./../libs/event', './../utils/utils', './../ui/components/width_slider', './../ui/components/slider', './../ui/color_selector', './end_sub_tools'], function(EventEmitter, Utils, WidthSlider, Slider, ColorSelector, EndSubTools) {
  var body = $('body');
  var prevent = Utils.prevent;

  function EndTools(container, opt) {
    this.initialize(container, opt);
  }
  EventEmitter.extend(EndTools, {
    type: '请覆盖',
    options: {
      isOut: false,
      background: 'rgba(45,45,45,1)',
      height: 55,
      paddingTop: 10
    },
    initialize: function (container, options) {
      this.container = container;
      this.options = Utils.deepMerge(this.options, options);
      this.targets = options.targets;
      //
      this.initDom();
      this.initEvents();
      this.isOut = !(options.isOut);
      this.switch();
    },
    initDom: function () {
      var options = this.options;
      var container = this.container;

      var endContainer = this.endContainer = $(
        '<div class="end-tools transition ' + this.type + '" id="end-tools" style="">\
        <div class="tools-group tool1"></div>\
        <div class="tools-group tool2" style="width:35%;white-space:nowrap;">\
            <div class="top-node"></div>\
            <div class="bottom-node"></div>\
        </div>\
        <div class="tools-group tool3" ></div>\
        <div class="tools-group tool4"></div>\
        </div>'
        )
        .css({
          background: options.background,
          height: options.height,
          padding: options.paddingTop + 'px 0px'
        })
        .appendTo(this.container);

      this.tool1Node = endContainer.find('.tool1');
      this.tool2Node = endContainer.find('.tool2');
      this.tool3Node = endContainer.find('.tool3');
      this.tool4Node = endContainer.find('.tool4');
      if (this.targets) this.initSelectors();
    },
    initSelectors: function () {
      console.log('initSelectors: 覆盖之');
    },
    initSubTools: function () {
      console.log('initSelectors: 覆盖之');
    },
    initEvents: function () {
      var self = this;
      this.targets.on('current', this.updateSelectors.bind(this));
      window.global && global.on('painter-tap', this.switch.bind(this));
      window.global && global.on('select-layer', function (layer) {
        var type = layer.type;
        if (type === 'add') return;
        if (type === self.type) return self.in();
        self.out();
      });
      this.endContainer.on('mousedown touchstart', prevent);
    },
    switch: function () {
      (this.isOut) ? this.in() : this.out();
    },
    in : function () {
     if (!this.isOut) return;
      this.endContainer
      .keyAnim('fadeInSlowUp', {
        time: 0.1
      });
      this.emit('in');
      this.isOut = false;
    },
    out: function () {
      if (this.isOut) return;
      this.endContainer.keyAnim('fadeOutSlowDown', {
        time: 0.4
      });
      this.emit('out');
      this.isOut = true;
    }
  });
  return EndTools;
});