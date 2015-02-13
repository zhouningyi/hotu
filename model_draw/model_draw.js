'use strict';

//数据格式
// 对于画的数据，有很多层次，每层都是对象{}, 他们有相似的结构：
// @type 这个层级的类型，5层结构： "scene" "frame" "group" "curve" "pt"
// @t 开始时间(相对于frame开始的时间)
// @c 下级元素的数组集合(除了点数据外都有)
// @i 在元素中的时间序号
// @id 可选

define(['zepto'], function($) {

  var metas = { //五个层级的元素
    'scene': {
      'parent':'curData',
      'children': 'frame',
      'upper': 'Scene'
    },
    'frame': {
      'parent':'curScene',
      'children': 'group',
      'upper': 'Frame'
    },
    'group': {
      'parent':'curFrame',
      'children': 'curve',
      'upper': 'Group'
    },
    'curve': {
      'parent':'curGroup',
      'children': 'pt',
      'upper': 'Curve'
    },
    'pt': {
      'parent':'curCurve',
      'upper': 'Pt'
    }
  };

  function ModelDraw(obj) {
    obj = obj || {};
    this.frameH = obj.frameH || $(window).height();
    this.frameW = obj.frameW || $(window).width();
    this.recordPtBol = true;
  }

  ModelDraw.prototype.start = function(type, brush) {//开始一组新的绘制
    this.ptN = 0;
    this.curBrush = brush;
    var obj = metas[type];
    if (obj) {
      var typeUpper = obj.upper;
      var children = obj.children;
      var curElement = this['add'+typeUpper]();

      // this['cur' + typeUpper] = {
      //   type: type,
      //   c: [],
      //   id: getId('data')
      // };
      this.curData = curElement;
      this.ptsN = 0;
      this.timeStart = getTimeAbsolute();

      if(children){
        var typeUpperChildren = metas[children].upper;
        this['add'+typeUpperChildren](brush);
      }
    } else {
      console.log(type, 'type 错误');
    }
  };

  /**
   * 增加数据
   * @param {String} type    类型
   * @param {Function} addFunc 额外的增加字段的方法
   * @param {Object} idBol   是否生成id
   */
  ModelDraw.prototype.add = function(type, idBol, addFunc) { //
    var meta = metas[type];
    if (meta) {
      var typeUpper = meta.upper;
      var parent = meta.parent;
      var c = []; //下一级的children数组
      var i = this['index' + typeUpper] || 0; //在这一级的编号

      var obj = this['cur' + typeUpper] = {
        'type': type,
        'c': c,
        'i': i
      };

      if (idBol) obj.id = getId(type || 'frame');
      if (addFunc) addFunc(obj);
      if(this[parent]) this[parent].c.push(obj);

      this['index' + typeUpper] = i + 1;
      return obj;
    } else {
      console.log('meta类型错误 或 type未传入');
    }
  };

  ModelDraw.prototype.addScene = function() {
    return this.add('scene');
  };

  ModelDraw.prototype.addFrame = function() {
    return this.add('frame');
  };

  ModelDraw.prototype.addGroup = function(brushType) {
    var self = this;
    return this.add('group',true,function(obj){
      console.log(self.curBrush,brushType,8888)
      obj.brushType = brushType || self.curBrush;
    });
  };

  ModelDraw.prototype.addCurve = function() {
    // console.log(this.curGroup,this.curFrame,this.curData)
    return this.add('curve');
  };

  ModelDraw.prototype.addPt = function(pt) {
    this.curCurve.c.push(pt);
    this.ptN++;
    this.curData.ptN = this.ptN;
  };


  ModelDraw.prototype.setBrushType = function(brushType) {
    this.addGroup(brushType);
  };


  ModelDraw.prototype.register = function() {

  };

  ModelDraw.prototype.save = function() {

  };

  ModelDraw.prototype.post = function() {

  };

  ModelDraw.prototype.getData = function() {
    return this.curData;
  };

  ModelDraw.prototype.getCurve = function() {
    return this.curCurve;
  };

  //时间控制相关
  ModelDraw.prototype.getTimeRelative = function() {
    return getTimeAbsolute() - this.timeStart;
  };

  function getTimeAbsolute() {
    return new Date().getTime() * 0.001;
  }
 //生成id
  function getId(type) {
    var num = Math.random().toFixed(4);
    var d = new Date();
    var dateStr = [d.getFullYear(), (d.getMonth() + 1), d.getDate(), d.getHours(), d.getMinutes()].join(',');
    return type + dateStr + num;
  }

  return ModelDraw;
});
