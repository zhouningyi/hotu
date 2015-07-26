'use strict';
//对UI的总体控制
define(['./../libs/event', './../utils/utils', './components/lightsatSelector','./components/hueSlider'], function (EventEmitter, Utils, LightsatSelector, HueSlider) {
  var requestAnimFrame = Utils.requestAnimFrame;
  var prevent = Utils.prevent;
  var body = $('body');
  function ColorSelector(container, options){
    this.initialize(container, options);
  }

  EventEmitter.extend(ColorSelector, {
    // isSubIn: false,
    isColorPanelIn: false,
    isDisable: false,
    initialize: function (container, options) {
      this.options = {
      panel: {
        height: 50
      },
      grid: {
        margin: 5,
        width:  30,
        height: 30,
        dotH:   10,
        dotW:   10
      },
      colors: [
      'hsla(0,0%,0%,1)',
      'hsla(0, 0%, 50%,1)',
      'hsla(0, 0%, 100%,1)',
      'hsla(0, 80%, 40%,1)',
      'hsla(45, 80%, 50%,1)',
      'hsla(75, 80%, 50%,1)',
      'hsla(190, 80%, 40%,1)',
      'hsla(210, 80%, 40%,1)',
      'hsla(330,80%,40%,1)',
      'hsla(29,80%,40%,1)']
     },
      this.container = container;
      this.id = 'color-selector';
      this.targets = options.targets;
      this.subTools = options.subTools;
      this.options = Utils.deepMerge(this.options, options);

      this.initDom();
      this.initEventsMain();
      this.initEventsGlobal();
    },
    initDom: function () {
      var container = this.container;
      this.initColorNode();
      this.initSubTools();
    },
    initSubTools: function () {
      var subTools = this.subTools, grid = this.options.grid;
      var subContainer = this.subContainer = subTools.getRectSmall()
      .html('<div class="hue-slider"></div><div class="color-grids"></div>');

      this.panelContainer = subTools.getRectPanel();
      subTools.bind(this.container);
      
      this.colorGridsContainer = subContainer.find('.color-grids');
      this.hueSliderContainer = subContainer.find('.hue-slider');

      this.initSubColorGrids();
      this.initSubHueSlider();
      this.initColorPanel();
    },
    initEventsGlobal: function () {
      window.global && global.on('painter-tap', this.outColorDetail.bind(this));//画画时候 详细色彩面板收缩
    },
    initEventsMain: function () {
      var self = this;
      this.colorDot
      .on('touchstart mousedown', function (e) {
        prevent(e);
        if (self.isDisable) return window.infoPanel && infoPanel.alert('这支笔不能选择颜色哦');
        window.global && global.trigger('select-start', self.targets.current());
        window.global && global.trigger('select-tool', self.id);
      })
      .on('touchend mouseup', function (e) {
        prevent(e);
        if (self.isDisable) return window.infoPanel && infoPanel.alert('这支笔不能选择颜色哦');
        window.global && global.trigger('select-end', self.id);
      });
      //
      window.global && global.on('select-tool', function (id) {
        if (id !== self.id) return self.out();
        if (!self.subTools.isOut) self.switchColorPanel();
        self.in();
      });

      var lightsatSelector = this.lightsatSelector;
      this.hueSlider.on('change', lightsatSelector.updateByTarget.bind(lightsatSelector));
    },
    //和三级菜单有关
    initColorPanel: function () {
      var options = this.options, panel = options.panel;
      var panelContainer = this.panelContainer;
      panelContainer.html(
        '<div class="color-panel-left"></div>\
        <div class="color-panel-right"></div>'
        );
      var panelLeft = this.panelLeft = panelContainer.find('.color-panel-left');
      var panelRight = this.panelRight = panelContainer.find('.color-panel-right');
      //选择器
      this.lightsatSelector = new LightsatSelector(panelLeft, {
        target: this.targets.current(),
        targets: this.targets,
        key: 'lightSat',
        targetName: 'targetName',
        height: panel.height,
        gridX: 10,
        gridY: 10
      });
    },
    inColorDetail: function () {
      if (!this.isColorPanelIn) {
        this.panelContainer.keyAnim('fadeIn', {time: 0.3}).css({
          'pointerEvents': 'auto'
        });
        this.colorGridsContainer.keyAnim('fadeOut', {'time': 0.2}).css({
          'pointerEvents': 'auto'
        });;
        this.hueSliderContainer.keyAnim('fadeIn', {'time': 0.2, 'delay': 0.2}).css({
          'pointerEvents': 'auto'
        });;
        this.hueSlider.enable();
        this.lightsatSelector.enable();
        this.isColorPanelIn = true;
      }
    },
    outColorDetail: function () {
      if (this.isColorPanelIn) {
        this.panelContainer.keyAnim('fadeOut', { time: 0.3}).css({
          'pointerEvents': 'none'
        });
        this.colorGridsContainer.keyAnim('fadeIn', {'time': 0.2, 'delay': 0.2}).css({
          'pointerEvents': 'auto'
        });;
        this.hueSliderContainer.keyAnim('fadeOut', {'time': 0.2}).css({
          'pointerEvents': 'none'
        });
        this.hueSlider.disable();
        this.lightsatSelector.disable();
        this.isColorPanelIn = false;
      }
    },
    switchColorPanel: function () {
      if(this.isColorPanelIn) return this.outColorDetail();
      return this.inColorDetail();
    },
    //和一级菜单有关
    initColorNode: function () {
      var colortext = '<span style="color: #ff7">换</span><span style="color: #f7f">颜</span><span style="color: #7ff">色</span>';
      $('<div class="color-selector-dot button-normal transition"></div><div class="slider-container-desc gray-middle" style="text-align:center; padding-top: 5px;">' + colortext + '</div>')
      .appendTo(this.container);
      this.colorDot = this.container.find('.color-selector-dot');
      this.initEventsDot();
    },
    initEventsDot: function () {
      var self = this, colorDot = this.colorDot;
      this.targets
      .on('style-change', function () {
        colorDot.css('background-color', this.getColorShow());
      })
      .on('current', function () {
        colorDot.css('background-color', this.getColorShow());
      });
      //
      colorDot
      .on('touchstart mousedown', function () {
        if (self.isDisable) return window.infoPanel && infoPanel.alert('这支笔不能选择颜色哦');;
        colorDot.keyAnim('fadeOutIn', {
          time: 0.2,
          cb: function () {
            colorDot.clearKeyAnim();
          }
        })
      });
    },
    //和二级菜单有关
    initSubColorGrids: function () {
      var options = this.options, colors = options.colors, colorObj;
      for (var i in colors) {
        colors[i] = this.initColorGrid(colors[i]);
      }
    },
    initSubHueSlider: function () {
      var container = this.hueSliderContainer;
      this.hueSlider = new HueSlider(container, {
        targets: this.targets
      });
    },
    initEventsGrid: function (gridNode) {
      var self = this;
      gridNode.on('touchstart mousedown', function () {
        if (self.isDisable) return window.infoPanel && infoPanel.alert('这支笔不能选择颜色哦');
        window.global && global.trigger('select-start', self.targets.current());
        //
        var color = gridNode.attr('grid-color');
        var cObj = Utils.hsla2obj(color);
        var lightSat = cObj.lightSat;
        var hue = cObj.hue;
        self.targets.controls('hue', hue);
        self.targets.controls('lightSat', lightSat);
        gridNode.keyAnim('fadeOutIn', {
          time: 0.2,
          cb: function () {
            gridNode.clearKeyAnim();
          }
        })
      })
      .on('touchend mouseup touchleave mouseout', function () {
        if(self.isDisable) return;
        window.global && global.trigger('select-end');
      });
    },
    addSubColor: function (color){
    },
    initColorGrid: function (color){
      var options = this.options, grid = options.grid;
      var gridH = grid.height, gridMargin = grid.margin,  gridW = grid.width, dotH = grid.dotH, dotW = grid.dotW;
      var gridNode = $(
        '<div class="color-grid" style="height:' + gridH + 'px;width:' + gridH + 'px; margin:' + gridMargin +'px '+ gridMargin +'px; ">\
          <div class="dot" style="height:' + dotH + 'px;width:' + dotH +'px; margin:'+ (gridW - dotW) / 2 +'px '+(gridH - dotH) / 2+'px; background-color:'+color+';"></div>\
        </div>').appendTo(this.colorGridsContainer);
      gridNode.attr('grid-color', color);
      this.initEventsGrid(gridNode);
      return {
        color: color,
        node: gridNode
      }
    },
    in: function () {
      this.subTools.in();
    },
    out: function () {
      this.subTools.out();
    },
    disable: function () {
      this.isDisable = true;
      this.container.css({opacity: 0.2});
      var colorDot = this.colorDot;
      setTimeout(function () {
         colorDot.css('backgroundColor', '#000');
      })
    },
    enable: function () {
      this.isDisable = false;
      this.container.css({opacity: 1});
    },
  });

  return ColorSelector;
});