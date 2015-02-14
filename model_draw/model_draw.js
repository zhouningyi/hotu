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
      'parent': 'curData',
      'children': 'frame',
    },
    'frame': {
      'parent': 'curScene',
      'children': 'group',
    },
    'group': {
      'parent': 'curFrame',
      'children': 'curve',
    },
    'curve': {
      'parent': 'curGroup',
      'children': 'pt',
    },
    'pt': {
      'parent': 'curCurve',
    }
  };

  function ModelDraw(obj) {
    obj = obj || {};
    this.frameH = obj.frameH || $(window).height();
    this.frameW = obj.frameW || $(window).width();
    this.recordPtBol = true;
    this.olderData = null;
  }

  ModelDraw.prototype.oldData = function(d) {
    this.curData = d;
  };

  ModelDraw.prototype.beginRecord = function(opt) { //开始一组新的绘制 分有数据和没数据2种情况
    this.curBrush = opt.brush;
    this.userid = opt.userid;
    this.drawid = opt.drawid;

    var curData = this.curData;//开始编辑过去的数据
    var type;
    if (curData) {
      this.ptN = curData.ptN;
      this.timePrev = curData.timeEnd || 0;//过去数据结束的时间 为现在起始时间
      type = curData.type;
      this['cur' + upper(type)] = curData;
    } else {//需要自己新建一份数据
      type = opt.type;
      this.ptsN = 0;
      this.timePrev = 0;
      this.curData = this['add' + upper(type)]();
    }
    this.newRecord(type);
    this.timeStart = getTimeAbsolute();
    // this.cancelSubmit();
    // this.autoSubmit();
  };

  ModelDraw.prototype.newRecord = function(type) { //\
    var obj = metas[type];
    if (obj) {
      var childrenName = obj.children;
      if (childrenName) {
        console.log(brush);
        this['add' + upper(childrenName)]();
      }
    } else {
      console.log(type, 'type 错误');
    }
  };

  function upper(str){
    return str[0].toUpperCase()+str.slice(1);
  }

  /**
   * 增加数据
   * @param {String} type    类型
   * @param {Function} addFunc 额外的增加字段的方法
   * @param {Object} idBol   是否生成id
   */
  ModelDraw.prototype.add = function(type, idBol, addFunc) { //
    var meta = metas[type];
    if (meta) {
      var parent = meta.parent;
      var c = []; //下一级的children数组
      var i = this['index' + upper(type)] || 0; //在这一级的编号

      var obj = this['cur' + upper(type)] = {
        'type': type,
        'c': c,
        'i': i
      };

      if (idBol) obj.id = getId(type || 'frame');
      if (addFunc) addFunc(obj);
      if (this[parent]) this[parent].c.push(obj);
      this['index' + upper(type)] = i + 1;
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
    return this.add('group', true, function(obj) {
      obj.brushType = brushType || self.curBrush;
    });
  };

  ModelDraw.prototype.addCurve = function() {
    return this.add('curve');
  };

  ModelDraw.prototype.addPt = function(pt) {
    var frameW = this.frameW;
    pt = [pt[0] / frameW, pt[1] / frameW, pt[2]];
    this.curCurve.c.push(pt);
    this.ptN++;
    this.curData.ptN = this.ptN;
  };


  ModelDraw.prototype.setBrushType = function(brushType) {
    this.addGroup(brushType);
  };


  // ModelDraw.prototype.register = function() {

  // };

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

  //和数据库交互
  ModelDraw.prototype.autoSubmit = function() { //开始自动保存
    var interval = this.autosaveInterval || 15000;
    this.save();
    this.submitID = setTimeout(this.autoSubmit.bind(this), interval);
  };

  ModelDraw.prototype.cancelSubmit = function() { //取消自动保存
    window.clearTimeout(this.submitID);
  };

  var server = 'http://localhost:9101/';

  ModelDraw.prototype.save = function() { //取回数据库已经存的内容
    var curData = this.curData;
    curData.timeEnd = this.getTimeRelative();
    curData.frameH = this.frameH;
    curData.frameW = this.frameW;
    console.log(this.curData);
    var saveData = {
      'userid': this.userid || 'first',
      'drawid': this.drawid || 'draw',
      'data': JSON.stringify(this.curData)
    };
    $.ajax({
      'url': server + 'api/hotu/drawing',
      'type': 'POST',
      'data': saveData,
      'success': function(d) {
        console.log(d, 'save');
      },
      'error': function(e) {
        console.log(e);
      }
    });
  };
  ModelDraw.prototype.clear = function(){
    var list = ['Data','Scene','Frame','Group','Curve'];
    for(var k in list){
      var name = list[k];
      this['index'+name] = null;
      this['cur'+name] = null;
    }
  };

  ModelDraw.prototype.getLast = function(query, cb) { //取回数据库已经存的内容
    var query = {
      'userid': query.userid || 'first',
      'drawid': query.drawid || 'draw',
    };
    $.ajax({
      'url': server+'api/hotu/drawing',
      'type': 'GET',
      'data': query,
      'success': function(d) {
        var data = JSON.parse(d.data);
        cb(data);
      },
      'error': function(e) {
        console.log(e);
      }
    });
  };

  return ModelDraw;
});
