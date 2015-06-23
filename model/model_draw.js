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

define(['zepto', './../utils/utils', './drawDataInfo'], function ($, Utils, DrawDataInfo) {
  var upper = Utils.upper;
  var computeDrawInfo = DrawDataInfo.computeDrawInfo; //计算一副绘画中的统计信息

  var metas = { //五个层级的元素
    'scene': {
      'parent': 'curDrawData',
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
  var storage, tmpStorageKey;

  function ModelDraw(obj) {
    obj = obj || {};
    var config = this.config = obj.config;
    storage = config.storage;
    tmpStorageKey = storage.tmpKey;

    this.frameH = obj.frameH || $(window).height();
    this.frameW = obj.frameW || $(window).width();
    this.recordPtBol = true;
    this.events();
    try {
      window.localStorage.setItem('cur_drawing_data_hotu_v1', '{}');
      window.localStorage.setItem('cur_drawing_data_hotu', '{}');
      window.localStorage.setItem('cur_drawing_data_hotu_v11', '{}');
      window.localStorage.setItem('cur_drawing_data_hotu_v12', '{}');
      window.localStorage.setItem('cur_drawing_data_hotu_v13', '{}');
    }catch (e) {
    }
  }
  
  ModelDraw.prototype.events = function () {
    var self = this;
    body
      .on('openid', function (e, openid) {
        self.userid = openid;
      })
      .on('drawid', function (e, drawid) {
        self.drawid = drawid;
      })
      .on('refresh-drawid', function () {
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

  ModelDraw.prototype.oldData = function (d) {
    this.curDrawData = d;
  };

  ModelDraw.prototype.beginRecord = function (opt) { //开始一组新的绘制 分有数据和没数据2种情况
    opt = opt || {};
    this.curBrushType = opt.brush;

    var curDrawData = this.curDrawData; //开始编辑过去的数据
    var type;
    if (curDrawData) {
      this.timePrev = curDrawData.timeEnd || 0; //过去数据结束的时间 为现在起始时间
      type = curDrawData.type;
      if(!curDrawData.id) {
        curDrawData.id = getId(curDrawData.type || 'frame');
      }
      this['cur' + dper(type)] = curDrawData;
    } else { //需要自己新建一份数据
      type = opt.type;
      this.timePrev = 0;
      curDrawData = this.curDrawData = this.addFrame();
      curDrawData.id = getId(curDrawData.type || 'frame');
      this.newRecord(type);
    }
    
    this.timeStart = getTimeAbsolute();
    // this.cancelSubmit();
    // this.autoSubmit();
  };

  ModelDraw.prototype.newRecord = function (type) { //\
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
  ModelDraw.prototype.add = function (type, idBol, addFunc) {
    var meta = metas[type]; //寻找这个层级的信息
    if (meta) {
      var curParent = this[meta.parent];
      if(curParent){
        var c = curParent.c;
        var last = c[c.length -1];
        if (last&&last.c&&last.c.length === 0) {return last;} //如已经创建了一个空的curve 就不要重复创建了。
      }
      var i = this['index' + upper(type)] || 0; //在这一级的编号
      var c = []; //下一级的children数组
      var curThis = this['cur' + upper(type)] = {
        'type': type,
        'c': c,
        'i': i
      };

      if (idBol) curThis.id = getId(type || 'frame');
      if (addFunc) addFunc(curThis);

      var parent = meta.parent;
      var curParent = this[parent] || this.curDrawData;

      if (curParent) curParent.c.push(curThis); //给parent的c里放进此级元素

      var children = metas[type].children;
      this['index' + upper(type)] = i + 1;
      this['index' + upper(children)] = 0;
      return curThis;
    } else {
      console.log('meta类型错误 或 type未传入');
    }
  };

  ModelDraw.prototype.addScene = function () {
    return this.add('scene');
  };

  ModelDraw.prototype.addFrame = function () {
    return this.add('frame');
  };

  ModelDraw.prototype.addCurve = function () {
    var curCurve = this.add('curve');
    if (curCurve) { //如果有重复添加，也就是上一条曲线为空，this.add() 没有返回。
      curCurve.style = this.getCurStyle();
      curCurve.brushType = this.curBrushType;
    }
  };

  ModelDraw.prototype.getCurStyle = function () {
    var style = {};
    var curBrush = this.curBrush;
    var controls = curBrush.controls;
    if (controls) {
      for (var key in controls) {
        style[key] = controls[key].value;
      }
    }
    return JSON.parse(JSON.stringify(style));
  };

  ModelDraw.prototype.addPt = function (pt) { //点：储存相对于屏幕的比例
    var frameW = this.frameW;
    this.curCurve.c.push(pt);
    this.curPt = pt;
  };

  ModelDraw.prototype.setBrushType = function (brush) {
    var brushType = brush.id;
    this.curBrush = brush;
    if (brushType !== this.curBrushType) {
      this.controls = brush.controls;
      this.curBrushType = brushType;
      var curCurve = this.curCurve;
      if (curCurve && (!curCurve.c || curCurve.c.length === 0)) {
        curCurve.brushType = brushType;
      }
    }
  };
  
  ModelDraw.prototype.setBg = function (key, value) {
    var curDrawData = this.curDrawData;
    if(!curDrawData) return console.log('no curDrawData');
    if(!curDrawData.bg) curDrawData.bg = {};
    curDrawData.bg[key] = value;
  };

  ModelDraw.prototype.setInfo = function (key, value) {
    var curDrawData = this.curDrawData;
    if(!curDrawData) return console.log('no curDrawData');
    curDrawData[key] = value;
  };
  
  ModelDraw.prototype.back = function () {
    // if(!this.curDrawData){
    //   if(this.deleteData){
    //     this.oldData(this.deleteData);
    //   }
    // }
    this.saveStorage(); //后退一笔的时候 就自动保存
    var curFrame = this.curFrame;
    var curves = curFrame.c;
    curves.pop();
    if (curves.length > 0) {
      this.curCurve = curves[curves.length - 1];
    } else {
      this.curCurve = null;
    }
  };

  ModelDraw.prototype.end = function () {
    this.saveStorage(); //画完一笔的时候 就自动保存
  };

  //时间控制相关
  ModelDraw.prototype.getTimeRelative = function () {
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
  ModelDraw.prototype.autoSubmit = function () { //开始自动保存
    var interval = this.autosaveInterval || 15000;
    this.save();
    this.submitID = setTimeout(this.autoSubmit.bind(this), interval);
  };

  ModelDraw.prototype.cancelSubmit = function () { //取消自动保存
    window.clearTimeout(this.submitID);
  };

  ModelDraw.prototype.saveImage = function () {
    if(this.exports){
      this.imageBase64 = this.exports.toImage('small').dataURL;
    }
  };

  ModelDraw.prototype.save = function (cb) { //取回数据库已经存的内容
    var curDrawData = this.curDrawData;
    curDrawData.timeEnd = this.getTimeRelative();
    curDrawData.frameH = this.frameH;
    curDrawData.frameW = this.frameW;
    var userName = curDrawData.userName;
    var drawName = curDrawData.drawName;
    var drawid = curDrawData.id;
    curDrawData.info = computeDrawInfo(curDrawData);
    
    cb = cb || function () {};
    var random = parseInt(Math.random() * 100000000);
    var saveData = {
      'userid': this.userid || this.config.login.userid,
      'userName': userName,
      'title': drawName,
      'drawid': drawid,
      'data': JSON.stringify(this.curDrawData),
      'imgBase64': this.imageBase64,
      'imgName': drawid + '_' + random + '.png',
      'dataName': drawid + '_' + random + '.js'
    };

    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'POST',
      'dataType': 'json',
      'data': saveData,
      'success': function (d) {
        cb(1, d);
      },
      'error': function (e) {
        console.log(e, 'save-err');
        cb(0);
      }
    });
  };

  ModelDraw.prototype.deleteDrawing = function (query, cb) { //删除某幅图
    cb = cb || function(){};
    query = {
      // userid: query.userid,
      drawid: query.drawid
    };
    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'DELETE',
      'dataType': 'json',
      'data': query,
      'success': function (d) {
        cb(1, d);
      },
      'error': function (e) {
        cb(0);
      }
    });
  };

  ModelDraw.prototype.saveConfig = function(){// 把app_config存在localstorage里
    if (typeof (Storage) == "undefined") return console.log('不能自动保存');
    var config = this.config;
    var savekey = config.login.saveKey;
    window.localStorage.setItem(savekey, JSON.stringify(config));
  };

  ModelDraw.prototype.getConfig = function(){// 把app_config存在localstorage里
    if (typeof (Storage) == "undefined") return console.log('不能自动保存');
    var config = this.config;
    var savekey = config.login.saveKey;
    var cfg  = JSON.parse(window.localStorage.getItem(savekey));
    if(!cfg) return false;
    config.login = cfg.login;
  };

  ModelDraw.prototype.getLastStorage = function (obj) { //从localStorage寻找数据
    if (typeof (Storage) == "undefined") return alert('无localstorage,sorry,希望您能告知公众号hotuco');
    var data = window.localStorage.getItem(tmpStorageKey);
    if (data) obj.success(data);
    return;
    if (obj.fail) obj.fail();
  };

  ModelDraw.prototype.saveStorage = function () { //从localStorage寻找数据
    if (typeof (Storage) == 'undefined') return console.log('不能自动保存');
    var curDrawData = this.curDrawData;
    if (!curDrawData) return console.log('no curDrawData');
    // var localStorageLength = JSON.stringify(localStorage).length / 1000000;
    // localStorageLength = localStorageLength.toFixed(3);
    // $('#test-container').text(localStorageLength + 'M');
    var data = {'drawing': curDrawData};
    if (data.drawing.c && data.drawing.c.length > 0){
      var saveData = JSON.stringify(data);
      window.localStorage.setItem(tmpStorageKey, saveData);
    }
  };

  ModelDraw.prototype.clear = function () {
    // if(this.curDrawData) this.delData = JSON.parse(JSON.stringify(this.curDrawData));////为了防止误删除而设计 容易出问题 不用
    var list = ['data', 'scene', 'frame', 'curve'];
    for (var k in list) {
      var name = list[k];
      this['index' + upper(name)] = null;
      this['cur' + upper(name)] = null;
      this[name + 'N'] = 0;
    }
    this.curDrawData = null;
    this.saveStorage();
    var self = this;
  };

  ModelDraw.prototype.getDrawingDataJSONP = function (opt, cb) { //取回数据库已经存的内容
    var drawid = opt.drawid;
    var dataUrl = opt.dataUrl;
    if(!drawid || !dataUrl) return;
    $.ajax({
      'url' : dataUrl,
      'type': 'get',
      'jsonpCallback': 'cb_' + drawid,
      'dataType': 'jsonp',
      'success': function(d){
        cb(d);
      },
      'error': function(e){
        console.log(e);
      }
    });
  }

  ModelDraw.prototype.getLast = function (q, cb) { //取回数据库已经存的内容
    if(!q.userid) return cb('没有userid');
    query = {
      'userid': q.userid,
    };
    if(q.drawid){
      query.drawid = q.drawid;
    }
    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'GET',
      'data': query,
      'success': function (d) {
        if (d && d.data) {
          alert(JSON.stringify(d));
          cb(null);
        } else {
          cb(null);
        }
      },
      'error': function (e) {
        cb(null);
        console.log(e, 'getlast-err');
      }
    });
  };

  ModelDraw.prototype.getData = function () { //获取当前的数据
    var curDrawData = this.curDrawData;
    curDrawData.info = computeDrawInfo(curDrawData);
    return curDrawData;
  };

  ModelDraw.prototype.getFrame = function () {
    return this.curFrame;
  };

  ModelDraw.prototype.getCurve = function () {
    return this.curCurve;
  };

  ModelDraw.prototype.getPt = function () {
    return this.curPt;
  };

  ModelDraw.prototype.getAllDrawingsById = function (openid, cb) {
    if(!openid) return;
    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'GET',
      'dataType': 'json',
      'data': {'userid': openid},
      'success': function (d) {
        cb(d);
      },
      'error': function (e) {
        console.log(e, 'save-err');
        cb(false);
      }
    });
  };
  return ModelDraw;
});