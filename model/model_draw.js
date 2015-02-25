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

  var body = $('body');
  function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }
  function ModelDraw(obj) {
    obj = obj || {};
    this.frameH = obj.frameH || $(window).height();
    this.frameW = obj.frameW || $(window).width();
    this.recordPtBol = true;
    this.olderData = null;
    this.events();
  }

  ModelDraw.prototype.events = function(){
    var self = this;
    body
    .on('openid',function(e, openid){
      self.userid = openid;
    })
    .on('drawid', function(e, drawid){
      self.drawid = drawid;
    })
    .on('refresh-drawid', function(){
      var drawid = self.drawid = getId('frame');
      body.trigger('drawid',drawid);
    });
  };

  ModelDraw.prototype.oldData = function(d) {
    this.curData = d;
  };

  ModelDraw.prototype.beginRecord = function(opt) { //开始一组新的绘制 分有数据和没数据2种情况
    opt = opt || {};
    this.curBrush = opt.brush;

    var curData = this.curData;//开始编辑过去的数据
    var type;
    if (curData) {
      this.ptN = curData.ptN;
      this.curveN = curData.curveN;
      this.groupN = curData.groupN;
      if(!(this.ptN&&this.curveN&&this.groupN))  this.getFrameN(curData);
      this.timePrev = curData.timeEnd || 0;//过去数据结束的时间 为现在起始时间
      type = curData.type;
      this['cur' + upper(type)] = curData;
    } else {//需要自己新建一份数据
      type = opt.type;
      this.ptN = 0;
      this.curveN = 0;
      this.groupN = 0;
      this.timePrev = 0;
      this.curData = this['add' + upper(type)]();
    }
    this.newRecord(type);
    this.timeStart = getTimeAbsolute();
    // this.cancelSubmit();
    // this.autoSubmit();
  };

  ModelDraw.prototype.getFrameN = function(d) { //计算文件各元素数量
    var ptN = 0;
    var curveN = 0;
    var groups = d.c;
    var group, curves, curve, pts;
    this.groupN = groups.length;
    if (groups) {
      for (var i in groups) {
        group = groups[i];
        curves = group.c;
        if (curves) {
          curveN += curves.length;
          for (var j in curves) {
            curve = curves[j];
            pts = curve.c;
            if (pts) {
              ptN += pts.length;
            }
          }
        }
      }
    }
    this.curveN = curveN;
    this.ptN = ptN;
  };

  ModelDraw.prototype.newRecord = function(type) { //\
    var obj = metas[type];
    if (obj) {
      var childrenName = obj.children;
      if (childrenName) {
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
  ModelDraw.prototype.add = function(type, idBol, addFunc) {
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

      var children = metas[type].children;
      this['index' + upper(type)] = i + 1;
      this['index' + upper(children)] = 0;
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
    if (this.curData) this.curData.groupN = 1 + this.groupN++;
    var self = this;
    return this.add('group', true, function(obj) {
      obj.brushType = brushType || self.curBrush;
    });
  };

  ModelDraw.prototype.addCurve = function() {
    if (this.curData) this.curData.curveN = 1 + this.curveN++ ;
    return this.add('curve');
  };

  ModelDraw.prototype.addPt = function(pt) {
    var frameW = this.frameW;
    pt = [pt[0] / frameW, pt[1] / frameW, pt[2]];
    this.curCurve.c.push(pt);
    this.curData.ptN = 1 + this.ptN++;
  };

  ModelDraw.prototype.setBrushType = function(brush) {
    if(brush!==this.curBrush){
      this.addGroup(brush);
      this.curBrush = brush;
    }
  };

  ModelDraw.prototype.back = function() {
    // var curFrame = this.curFrame;
    console.log('back');
  };

  // ModelDraw.prototype.register = function() {

  // };

  ModelDraw.prototype.getData = function() {
    console.log(this.curData);
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
    var num = Math.floor(Math.random()*10000000);
    var d = new Date();
    var dateStr = [d.getFullYear(), (d.getMonth() + 1), d.getDate(), d.getHours(), d.getMinutes()].join('');
    return type + '_'+ dateStr + '_'+ num;
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


  ModelDraw.prototype.save = function(obj, cb) { //取回数据库已经存的内容
    var curData = this.curData;
    curData.timeEnd = this.getTimeRelative();
    curData.frameH = this.frameH;
    curData.frameW = this.frameW;
    cb = cb || function(){};
    var saveData = {
      'userid': this.userid || 'first',
      'drawid': this.drawid || 'draw',
      'data':JSON.stringify(this.curData)
    };

    $.ajax({
      'url': 'http://mankattan.mathartworld.com/hotu-api/api/hotu/drawing',
      'type': 'POST',
      'dataType':'json',
      'data': saveData,
      'success': function(d) {
        console.log(d,'save-data');
        cb(1);
      },
      'error': function(e) {
        console.log(e,'save-err');
        cb(0);
      }
    });
  };

  ModelDraw.prototype.clear = function(){
    var list = ['data','scene','frame','group','curve'];
    for(var k in list){
      var name = list[k];
      this['index'+upper(name)] = null;
      this['cur'+upper(name)] = null;
      this[name+'N'] = 0;
    }
  };

  ModelDraw.prototype.getLast = function(query, cb) { //取回数据库已经存的内容
    query = {
      'userid': query.userid || 'first',
      'drawid': query.drawid || 'draw',
    };
    $.ajax({
      'url': 'http://mankattan.mathartworld.com/hotu-api/api/hotu/drawing',
      'type': 'GET',
      'data': query,
      'success': function(d) {
        if(d&&d.data){
          cb(d.data);
        }else{
          cb(null);
        }
      },
      'error': function(e) {
        cb(null);
        console.log(e,'getlast-err');
      }
    });
  };

  return ModelDraw;
});
