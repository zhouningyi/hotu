'use strict';
//对UI的总体控制
define(['./../libs/event', './../utils/utils', './../ui/components/width_slider', './../ui/components/slider', './../ui/color_selector', './../ui/brush_selector', './end_sub_tools'], function(EventEmitter, Utils, WidthSlider, Slider, ColorSelector, BrushSelector, EndSubTools) {
  var body = $('body');

  function EndTools(container, opt) {
    this.initialize(container, opt);
  }

  EventEmitter.extend(EndTools, {
    isOut:false,
    options: {
      background: 'rgba(45,45,45,1)',
      height: 55,
      paddingTop: 10
    },
    initialize: function(container, options) {
      this.container = container;
      var options = Utils.merge(this.options, options);
      this.targets = options.targets;
      //
      this.initDom();
    },
    initDom: function() {
      var options = this.options;
      var container = this.container.css({
        background: options.background,
        height: options.height,
        padding: options.paddingTop + 'px 0px'
      });
      var subTools = this.subTools = $('\
        <div class="tools-group tool1"></div>\
        <div class="tools-group tool2" style="width:35%;white-space:nowrap;">\
            <div class="top-node"></div>\
            <div class="bottom-node"></div>\
        </div>\
        <div class="tools-group tool3" ></div>\
        <div class="tools-group tool4"></div>\
        ')
        .appendTo(this.container);

      this.tool1Node = container.find('.tool1');
      this.tool2Node = container.find('.tool2');
      this.tool3Node = container.find('.tool3');
      this.tool4Node = container.find('.tool4');
      if (this.targets) this.initSelectors();
    },
    initSelectors: function() {
      this.selectors = {};
      this.initEvents();
      this.initSubTools();
      this.initBrushSelector();
      this.initColorSelector();
      this.initWidthSlider();
      this.initOpacitySlider();
    },
    initSubTools: function() {
      this.endSubToolsColor = new EndSubTools(this.container, {
        parent: this.options,
        isOutInit: false
      });
      this.endSubToolsBrush = new EndSubTools(this.container, {
        parent: this.options,
        isOutInit: true
      });
    },
    initBrushSelector: function() {
      var brushSelector = this.brushSelector = new BrushSelector(this.tool1Node, {
        'targets': this.targets,
        'subTools': this.endSubToolsBrush
      });
    },
    initColorSelector: function() {
      var colorSelector = this.selectors.hue  = this.colorSelector = new ColorSelector(this.tool3Node, {
        'key': 'color',
        'targets': this.targets,
        'parent': this.options,
        'subTools': this.endSubToolsColor
      });
      colorSelector.on('select', function() {});
    },
    initWidthSlider: function() {
      this.widthSlider = this.selectors.widthMax  = new WidthSlider(this.tool2Node.find('.top-node'), {
        'key': 'width',
        'targets': this.targets
      });
    },
    initOpacitySlider: function() {
      this.opacitySlider = this.selectors.opacity  = new Slider(this.tool2Node.find('.bottom-node'), {
        'key': 'opacity',
        'targets': this.targets
      });
    },
    updateSelectors: function(){//并不是所有的笔触都有默认的控制器
      var selectors = this.selectors, targets = this.targets;
      for(var key in selectors){
        var selector = selectors[key];
        if(targets.controls(key)){
          selector.enable && selector.enable();
        } else {
          selector.disable && selector.disable();
        }
      }
    },
    initEvents: function() {
      var self = this;
      this.targets.on('current', this.updateSelectors.bind(this));
      window.global && global.on('painter-tap', this.switch.bind(this));
    },
    switch: function(){
      (this.isOut)? this.in(): this.out();
    },
    in : function() {
    if (!this.isOut) return;
      this.container
      .keyAnim('fadeInSlowUp', {
        time: 0.1,
      });
      this.isOut = false;
    },
    out: function() {
      if (this.isOut) return;
      this.container.keyAnim('fadeOutSlowDown', {
        time: 0.4,
      });
      this.isOut = true;
    }
  });
  return EndTools;
});