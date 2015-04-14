'use strict';

//数据格式
// 对于画的数据，有很多层次，每层都是对象{}, 他们有相似的结构：
// @type 这个层级的类型，5层结构： "scene" "frame" "group" "curve" "pt"
// @t 开始时间(相对于frame开始的时间)
// @c 下级元素的数组集合(除了点数据外都有)
// @i 在元素中的时间序号
// @id 可选

//统计数据
//ptN curveN groupN(换了几笔)
//brushes:{ink:{ptN:xx,curveN...}};//对brush的统计
//color://对color的统计
//length://对长度的统计

define(['zepto', './../utils/utils', './drawDataInfo'], function($, Utils, DrawDataInfo) {
  var upper = Utils.upper;
  var computeDrawInfo = DrawDataInfo.computeDrawInfo; //计算一副绘画中的统计信息

  var metas = { //五个层级的元素
    'scene': {
      'parent': 'curData',
      'children': 'frame',
    },
    'frame': {
      'parent': 'curScene',
      'children': 'curve',
    },
    'curve': {
      'parent': 'curFrame',
      'children': 'pt',
    },
    'pt': {
      'parent': 'curCurve',
    }
  };

  var body = $('body');

  function ModelDraw(obj) {
    obj = obj || {};
    this.frameH = obj.frameH || $(window).height();
    this.frameW = obj.frameW || $(window).width();
    this.recordPtBol = true;
    this.events();
  }

  ModelDraw.prototype.events = function() {
    var self = this;
    body
      .on('controlrable', function(e, obj) {
        if (obj && obj.target === 'brush') {
          var controls = self.controls;
          var name = obj.name;
          if (controls) {
            if (name in controls) {
              var conObj = controls[name];
              var get = conObj.get;
              var value = obj.value;
              if (get) {
                var style = self.style || {};
                style[name] = get(value);
              }
            }
          }
        }
      })
      .on('openid', function(e, openid) {
        self.userid = openid;
      })
      .on('drawid', function(e, drawid) {
        self.drawid = drawid;
      })
      .on('refresh-drawid', function() {
        var drawid = self.drawid = getId('frame');
        body.trigger('drawid', drawid);
      });
  };

  function bind(a, b) {
    if (a && b) {
      for (var k in b) {
        a[k] = b[k];
      }
      return a;
    }
  }

  ModelDraw.prototype.oldData = function(d) {
    this.curData = d;
  };

  ModelDraw.prototype.beginRecord = function(opt) { //开始一组新的绘制 分有数据和没数据2种情况
    opt = opt || {};
    this.curBrushType = opt.brush;

    var curData = this.curData; //开始编辑过去的数据
    var type;
    if (curData) {
      this.timePrev = curData.timeEnd || 0; //过去数据结束的时间 为现在起始时间
      type = curData.type;
      this['cur' + upper(type)] = curData;
    } else { //需要自己新建一份数据
      type = opt.type;
      this.timePrev = 0;
      curData = this.curData = this.addFrame();
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
        this['add' + upper(childrenName)]();
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
  ModelDraw.prototype.add = function(type, idBol, addFunc) {
    var meta = metas[type]; //寻找这个层级的信息
    if (meta) {
      var curThis = this['cur' + upper(type)];
      if (curThis && curThis.c && curThis.c.length === 0) return; //如已经创建了一个空的curve 就不要重复创建了。

      var i = this['index' + upper(type)] || 0; //在这一级的编号
      var c = []; //下一级的children数组
      curThis = this['cur' + upper(type)] = {
        'type': type,
        'c': c,
        'i': i
      };

      if (idBol) curThis.id = getId(type || 'frame');
      if (addFunc) addFunc(curThis);

      var parent = meta.parent;
      var curParent = this[parent] || this.curData;

      if (curParent) curParent.c.push(curThis); //给parent的c里放进此级元素

      var children = metas[type].children;
      this['index' + upper(type)] = i + 1;
      this['index' + upper(children)] = 0;
      return curThis;
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

  ModelDraw.prototype.addCurve = function() {
    this.autoSaveStorage();//画一笔的时候 就自动保存
    var curCurve = this.add('curve');
    if (curCurve) { //如果有重复添加，也就是上一条曲线为空，this.add() 没有返回。
      if (this.style) {
        curCurve.style = JSON.parse(JSON.stringify(this.style));
        // this.styleChanging=null;
      }
      curCurve.brushType = this.curBrushType;
    }
  };

  ModelDraw.prototype.addPt = function(pt) { //点：储存相对于屏幕的比例
    var frameW = this.frameW;
    var x = (pt[0] / frameW); //.toFixed(6);
    var y = (pt[1] / frameW); //.toFixed(6);
    var t = pt[2]; //.toFixed(3);
    pt = [x, y, t];
    // pt = [pt[0] / frameW, pt[1] / frameW, pt[2]];
    this.curCurve.c.push(pt);
    this.curPt = pt;
  };

  ModelDraw.prototype.setBrushType = function(brush) {
    var brushType = brush.id;
    if (brushType !== this.curBrushType) {
      var controls = this.controls = brush.controls;
      var style = this.style = {};
      if (controls) {
        for (var name in controls) {
          style[name] = brush[name];
        }
      }
      this.curBrushType = brushType;
      var curCurve = this.curCurve;
      if(curCurve&&(!curCurve.c||curCurve.c.length===0)){
        curCurve.brushType = brushType;
      }
    }
  };


  ModelDraw.prototype.back = function() {
    this.autoSaveStorage();//后退一笔的时候 就自动保存
    var curFrame = this.curFrame;
    var curves = curFrame.c;
    curves.pop();
    if (curves.length > 0) {
      this.curCurve = curves[curves.length - 1];
    } else {
      this.curCurve = null;
    }
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
    var num = Math.floor(Math.random() * 10000000);
    var d = new Date();
    var dateStr = [d.getFullYear(), (d.getMonth() + 1), d.getDate(), d.getHours(), d.getMinutes()].join('');
    return type + '_' + dateStr + '_' + num;
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
    cb = cb || function() {};
    var saveData = {
      'userid': this.userid || 'first',
      'drawid': this.drawid || 'draw',
      'data': JSON.stringify(this.curData)
    };

    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'POST',
      'dataType': 'json',
      'data': saveData,
      'success': function(d) {
        console.log(d, 'save-data');
        cb(1);
      },
      'error': function(e) {
        console.log(e, 'save-err');
        cb(0);
      }
    });
  };

  ModelDraw.prototype.getLastStorage = function(obj) { //从localStorage寻找数据
    if (typeof(Storage) == "undefined") return alert('无localstorage,sorry,看到这个bug, 请您告知公众号或zhouningyi1');
      var data = window.localStorage.getItem('cur_drawing_data_hotu');
      if(data) obj.success(data);return;
      if(obj.fail) obj.fail();
  };

  ModelDraw.prototype.autoSaveStorage = function() { //从localStorage寻找数据
    if (typeof(Storage) == "undefined") return;
    var data = this.curData;
    if(!data) return;
    if(data.c&&data.c.length>1) window.localStorage.setItem('cur_drawing_data_hotu', JSON.stringify(data));
  };

  ModelDraw.prototype.clear = function() {
    var list = ['data', 'scene', 'frame', 'curve'];
    for (var k in list) {
      var name = list[k];
      this['index' + upper(name)] = null;
      this['cur' + upper(name)] = null;
      this[name + 'N'] = 0;
    }
  };

  ModelDraw.prototype.getLast = function(query, cb) { //取回数据库已经存的内容
    query = {
      'userid': query.userid || 'first1',
      'drawid': query.drawid || 'draw',
    };
    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'GET',
      'data': query,
      'success': function(d) {
        if (d && d.data) {
          // cb(d.data);
          cb(null);
        } else {
          cb(null);
        }
      },
      'error': function(e) {
        cb(null);
        console.log(e, 'getlast-err');
      }
    });
  };

  ModelDraw.prototype.getData = function() { //获取当前的数据
    var curData = this.curData;
    curData.info = computeDrawInfo(curData);
    console.log(JSON.stringify(curData));
    return curData;
  };
  ModelDraw.prototype.getFrame = function() {
    return this.curFrame;
  };
  ModelDraw.prototype.getCurve = function() {
    return this.curCurve;
  };
  ModelDraw.prototype.getPt = function() {
    return this.curPt;
  };
  return ModelDraw;
});
