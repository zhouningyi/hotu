'use strict';
//对UI的总体控制
define(['./../utils/utils', './../render/renderer', './components/lightSatSelector', './components/hueSlider', './components/slider', './components/imageUploader'], function (Utils, Renderer, LightSatSelector, HueSlider, Slider, ImageUploader) {
  var values = Utils.values;
  var prevent = Utils.prevent;
  var genCanvas = Utils.genCanvas;
  var body = $('body');

var actionToolsNode, colorNode, commonNode, toolsListNode, curActionNode;

  function BgTools(opt) {
    opt = opt || {};
    this.actions = opt.actions;
    var container = this.container = opt.container;

    this.bindNode = opt.bind;

    this.init(opt.bg);
    this.uiStatus = 'null';

    this.events();

    this.status = 'select';
    body.trigger('action-change', this.curAction);
  }

  BgTools.prototype.init = function (bg) {
    this.bg = bg;
    var toolsListN = this.toolsListN = 4,
      container = this.container,
      bgToolsW = this.container.width() - this.bindNode.width() - 10,
      bgToolsNode = this.bgToolsNode = $(
      '<div class="sub-tools">\
        <div class="tools-list"></div>\
        <div class="control-ui color-ui"></div>\
        <div class="control-ui common-ui"></div>\
      </div>')
      .css({
        'width': bgToolsW,
        'height': 'auto'
      })
      .appendTo(container);
    var colorNode = this.colorNode = bgToolsNode.find('.color-ui');
    var commonNode = this.commonNode = bgToolsNode.find('.common-ui');

    var curAction = this.curAction = this.actions.get('bgColor');

    this.initHead();
    this.renderControl();
    setTimeout(function(){
      bgToolsNode.addClass('out-left');
    }, 1000);
  };

  BgTools.prototype.initHead = function () {
    var self = this;
    var actions = this.actions;
    var actionList = this.actions.actionList;
    var action, name;
    toolsListNode = this.bgToolsNode.find('.tools-list');
    for (var k in actionList) {
      action = actionList[k];
      var node = $('<div class="tools-list-icon" id="' + action.id + '">' + action.name + '</div>')
        .on('touchstart mousedown', function (e) {
          var actionType = $(this).attr('id');
          var action = actions.get(actionType);
          body.trigger('action-change', action);
          prevent(e);
        });
      toolsListNode.append(node);
    }
  };

  BgTools.prototype.renderControl = function () {
    var colorNode = this.colorNode;
    var commonNode = this.commonNode;
    colorNode.empty();
    commonNode.empty();

    var curAction = this.curAction;
    var controls = curAction.controls;

    var mapUI = {
      'HueSlider': HueSlider,
      'LightSatSelector': LightSatSelector,
      'Slider': Slider,
      'ImageUploader': ImageUploader
    };

    var mapContainer = {
      'color': colorNode,
      'common': commonNode
    };

    var obj, uiName, descUI, ConstructorUI, containerName, constructorUI, container, ki;
    for (var key in controls) {
      obj = controls[key];
      ConstructorUI = mapUI[obj.constructorUI];
      containerName = obj.containerName;
      container = mapContainer[containerName];

      if (ConstructorUI) {
        new ConstructorUI(container, {
          'key': key,
          'targetName': 'bg',
          'id': curAction.id,
          'control': obj,
          'target': curAction
        });
      }
    }
  };

  BgTools.prototype.out = function (cb) { //隐藏
    if (this.uiStatus === 'null') return;
    if (this.uiStatus !== 'out' && this.uiStatus !== 'lock') {
      var self = this;
      cb = cb || function () {};
      var bgToolsNode = this.bgToolsNode;
      this.uiStatus = 'lock';
      bgToolsNode.keyAnim('toolsOutLeft', {
        'time': 0.4,
        'cb': function () {
          bgToolsNode.css({
            'pointerEvents': 'none'
          });
          self.uiStatus = 'out';
        }
      });
      body.trigger('left-tools-out');
    }
  };

  BgTools.prototype.in = function (obj, cb) { //出现
    if (this.uiStatus !== 'in' && this.uiStatus !== 'lock' && obj) {
      if (this.uiStatus === 'null') {
        this.bgToolsNode.css({
          'display': 'block'
        });
      }
      var self = this;
      var node = obj.node;

      var bgToolsNode = this.bgToolsNode;

      var parent = obj.parent;
      var ph = parent.height();
      bgToolsNode.css({
        'minHeight': ph,
        'minWidth': ph
      });
      var iWidth = node.width();

      cb = cb || function () {};
      var width = $(window).width() * 0.8;

      this.uiStatus = 'lock';
      // 位置
      var offset = node.offset();
      var w = offset.width;
      var l = offset.left;
      var h = offset.height;
      var t = offset.top;
      var oft = 0;
      bgToolsNode.css({
        'left': l + w,
        'top': t,
        'bottom': 'auto',
        'minWidth': ph,
        'height': 'auto'
      });
      bgToolsNode.keyAnim('toolsInLeft', {
        'time': 0.4,
        'cb': function () {
          bgToolsNode
            .css({
              'pointerEvents': 'auto'
            });
          self.uiStatus = 'in';
          body.trigger('update-ui-by-target');
          cb();
        }
      });
      //背景色
      if (obj.bgImg) obj.bgImg.addClass('float-tag-img').appendTo(floatTagAddNode);

      body.trigger('left-tools-in');

      //提示
      // if(obj.helpText) this.floatTagHelp(obj.helpText);
    }
  };

  BgTools.prototype.switch = function (obj) {
    if (this.uiStatus !== 'in') this.in(obj);
    if (this.uiStatus == 'in') this.out(obj);
  };

  BgTools.prototype.events = function () {
    var self = this;
    var workLimit = 3000;
    this.bgToolsNode.on('touchstart mousedown', function (e) { //点击后 不要影响
      e.stopPropagation();
    });
    body
      .off('controlrable' + '-' + 'lightSat' + '-' + 'bg' + '-' + 'bg')
      .on('controlrable' + '-' + 'lightSat' + '-' + 'bg' + '-' + 'bg', function (e, obj) {
        self.bg.setStyle(obj);
      })
      .on('painter-work root-work', function () {
        self.out();
      })
      .on('action-change', function(e, action){
        var actionType = action.id;
        self.curAction = action;
        if (curActionNode) curActionNode.removeClass('tools-list-icon-active');
        curActionNode = toolsListNode.find('#' + actionType);
        curActionNode.addClass('tools-list-icon-active');
        self.renderControl();
      })
      .on('main-color-change', function (e, bgColor) {
        self.setBackground(bgColor);
      });
  };


  BgTools.prototype.setBackground = function (bgColor) {
    if (bgColor) {
      var colors = bgColor.split(',');
      colors[3] = '0.95)';
      bgColor = colors.join(',');
      this.bgToolsNode.css({
        background: bgColor
      });
    }
  };

  return BgTools;
});
