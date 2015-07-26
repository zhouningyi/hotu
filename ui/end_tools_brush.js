'use strict';
//对UI的总体控制
define(['./end_tools', './../utils/utils', './../ui/components/width_slider', './../ui/components/slider', './../ui/color_selector', './../ui/brush_selector', './end_sub_tools'], function(EndToolsBase, Utils, WidthSlider, Slider, ColorSelector, BrushSelector, EndSubTools) {
  var body = $('body');

  function EndTools(container, opt) {
    this.initialize(container, opt);
  }

  EndToolsBase.extend(EndTools, {
    isOut: false,
    type: 'brush',
    options: {
      background: 'rgba(45,45,45,1)',
      height: 55,
      paddingTop: 10
    },
    initSelectors: function () {
      this.selectors = {};
      this.initSubTools();
      this.initColorSelector();
      this.initBrushSelector();
      this.initWidthSlider();
      this.initOpacitySlider();
    },
    initSubTools: function () {
      this.endSubToolsColor = new EndSubTools(this.endContainer, {
        parent: this.options,
        isOut: true || this.isOut,
        type: this.type
      });
      this.endSubToolsBrush = new EndSubTools(this.endContainer, {
        parent: this.options,
        isOut: false || this.isOut,
        type: this.type
      });
      this.initEventsSubTools();
    },
    initEventsSubTools: function () {
      // this
      // .on('out', function () {
      // });
    },
    initBrushSelector: function () {
      var brushSelector = this.brushSelector = new BrushSelector(this.tool1Node, {
        'targets': this.targets,
        'subTools': this.endSubToolsBrush
      });
    },
    initColorSelector: function () {
      var colorSelector = this.selectors.hue  = this.colorSelector = new ColorSelector(this.tool3Node, {
        'key': 'color',
        'targets': this.targets,
        'parent': this.options,
        'subTools': this.endSubToolsColor
      });
      colorSelector.on('select', function() {});
    },
    initWidthSlider: function () {
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
    updateSelectors: function (){//并不是所有的笔触都有默认的控制器
      var selectors = this.selectors, targets = this.targets;
      for(var key in selectors){
        var selector = selectors[key];
        if(targets.controls(key)){
          selector.enable && selector.enable();
        } else {
          selector.disable && selector.disable();
        }
      }
    }
  });
  return EndTools;
});