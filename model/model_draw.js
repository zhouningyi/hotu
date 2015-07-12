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

define(['./../utils/utils', './drawDataInfo'], function(Utils, DrawDataInfo) {
  var upper = Utils.upper;
  var computeDrawInfo = DrawDataInfo.computeDrawInfo; //计算一副绘画中的统计信息

  var body = $('body'), storage, tmpStorageKey;

  function ModelDraw(obj) {
    obj = obj || {};
    var config = this.config = obj.config;
    storage = config.storage;
    tmpStorageKey = storage.tmpKey;

    this.frameH = obj.frameH || $(window).height();
    this.frameW = obj.frameW || $(window).width();

    this.events();
    try {
      window.localStorage.setItem('cur_drawing_data_hotu_v1', '{}');
      window.localStorage.setItem('cur_drawing_data_hotu', '{}');
      window.localStorage.setItem('cur_drawing_data_hotu_v11', '{}');
      window.localStorage.setItem('cur_drawing_data_hotu_v12', '{}');
      window.localStorage.setItem('cur_drawing_data_hotu_v13', '{}');
    } catch (e) {}
  }

  ModelDraw.prototype.events = function() {
    var self = this;
    body
      .on('openid', function(e, openid) {
        self.userid = openid;
      })
      .on('drawid', function(e, drawid) {
        self.drawid = drawid;
      })
      .on('refresh-drawid', function() {
        var drawid = self.drawid = Utils.getId('frame');
        body.trigger('drawid', drawid);
      });
  };

  ModelDraw.prototype.oldData = function (d) {
    if(!d) return;
    this.curDrawData = this.curFrame = d;
  };

  ModelDraw.prototype.beginRecord = function (obj) { //开始一组新的绘制 分有数据和没数据2种情况
    var curDrawData = this.curDrawData; //开始编辑过去的数据
    var type;
    if (curDrawData) {

      this.timePrev = curDrawData.time || 0; //过去数据结束的时间 为现在起始时间
      if (!curDrawData.id) curDrawData.id = Utils.getId('frame');
      this.curFrame = curDrawData;
    } else {//需要自己新建一份数据
      this.timePrev = 0;
      this.curDrawData = this.addFrame(obj);
    }
    this.timeStart = getTimeAbsolute();
  };

   /**
    * 绘制结束后将曲线数据加入
    * @param {Array} c 点的数组
    */
   ModelDraw.prototype.addCurve = function (obj) {
    if(!obj || !obj.c || !obj.c[0] || !obj.c[0].length) return;
    this.curCurve = obj;
    obj.id = Utils.getId('curve');
    this.curFrame.c.push(obj);
    this.saveStorage(); //画完一笔的时候 就自动保存
    return obj;
   };

   /**
    * 绘制结束后将曲线数据加入
    * @param {Array} c 点的数组
    */
   ModelDraw.prototype.addFrame = function (obj) {
    return this.curFrame = {
      c: [],
      id: Utils.getId('frame'),
      type: 'frame',
      frameW: obj.frameW, //////////////////////////////////////////////////////////////////////////,//////////////////////////////////////////////////////////////////////////
      frameH: obj.frameH
    };
   };

  ModelDraw.prototype.setBg = function(key, value) {
    var curDrawData = this.curDrawData;
    if (!curDrawData) return console.log('no curDrawData');
    if (!curDrawData.bg) curDrawData.bg = {};
    curDrawData.bg[key] = value;
  };

  ModelDraw.prototype.setInfo = function(key, value) {
    var curDrawData = this.curDrawData;
    if (!curDrawData) return console.log('no curDrawData');
    curDrawData[key] = value;
  };

  ModelDraw.prototype.back = function() {
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

  //时间控制相关
  ModelDraw.prototype.getTimeRelative = function() {
    return getTimeAbsolute() - this.timeStart;
  };

  function getTimeAbsolute() {
    return new Date().getTime() * 0.001;
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

  ModelDraw.prototype.saveImage = function() {
    if (this.exports) {
      this.imageBase64 = this.exports.toImage('small').dataURL;
    }
  };

  ModelDraw.prototype.save = function(cb) { //取回数据库已经存的内容
    var curDrawData = this.curDrawData;
    curDrawData.timeEnd = this.getTimeRelative();
    curDrawData.frameH = this.frameH;
    curDrawData.frameW = this.frameW;
    var userName = curDrawData.userName;
    var drawName = curDrawData.drawName;
    var drawid = curDrawData.id;
    curDrawData.info = computeDrawInfo(curDrawData);

    cb = cb || function() {};
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
      'success': function(d) {
        cb(1, d);
      },
      'error': function(e) {
        console.log(e, 'save-err');
        cb(0);
      }
    });
  };

  ModelDraw.prototype.deleteDrawing = function(query, cb) { //删除某幅图
    cb = cb || function () {};
    query = {
      // userid: query.userid,
      drawid: query.drawid
    };
    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'DELETE',
      'dataType': 'json',
      'data': query,
      'success': function(d) {
        cb(1, d);
      },
      'error': function(e) {
        cb(0);
      }
    });
  };

  ModelDraw.prototype.saveConfig = function() { // 把app_config存在localstorage里
    if (typeof(Storage) == "undefined") return console.log('不能自动保存');
    var config = this.config;
    var savekey = config.login.saveKey;
    window.localStorage.setItem(savekey, JSON.stringify(config));
  };

  ModelDraw.prototype.getConfig = function() { // 把app_config存在localstorage里
    if (typeof(Storage) == "undefined") return console.log('不能自动保存');
    var config = this.config;
    var savekey = config.login.saveKey;
    var cfg = JSON.parse(window.localStorage.getItem(savekey));
    if (!cfg) return false;
    config.login = cfg.login;
  };

  ModelDraw.prototype.getLastStorage = function(obj) { //从localStorage寻找数据
    if (typeof(Storage) == "undefined") return alert('无localstorage,sorry,希望您能告知公众号hotuco');
    var data = window.localStorage.getItem(tmpStorageKey);
    if (data) obj.success(data);
    return;
    if (obj.fail) obj.fail();
  };

  ModelDraw.prototype.saveStorage = function () { //从localStorage寻找数据
    if (typeof (Storage) == 'undefined') return console.log('不能自动保存');
    var curDrawData = this.curDrawData;
    if (!curDrawData) return console.log('no curDrawData');
    curDrawData.frameH = this.frameH;
    curDrawData.frameW = this.frameW;
    // var localStorageLength = JSON.stringify(localStorage).length / 1000000;
    // localStorageLength = localStorageLength.toFixed(3);
    // $('#test-container').text(localStorageLength + 'M');
    if (curDrawData.c && curDrawData.c.length > 0) {
      var saveData = JSON.stringify({'drawing': curDrawData});
      window.localStorage.setItem(tmpStorageKey, saveData);
    }
  };

  ModelDraw.prototype.clear = function () {
    this.curDrawData = null;
    this.saveStorage();
  };

  ModelDraw.prototype.getDrawingDataJSONP = function (opt, cb) { //取回数据库已经存的内容
    var drawid = opt.drawid;
    var dataUrl = opt.dataUrl;
    if (!drawid || !dataUrl) return;
    $.ajax({
      'url': dataUrl,
      'type': 'get',
      'jsonpCallback': 'cb_' + drawid,
      'dataType': 'jsonp',
      'success': cb,
      'error': function (e) {
        console.log(e);
      }
    });
  }

  ModelDraw.prototype.getLast = function(q, cb) { //取回数据库已经存的内容
    if (!q.userid) return cb('没有userid');
    query = {
      'userid': q.userid,
    };
    if (q.drawid) {
      query.drawid = q.drawid;
    }
    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'GET',
      'data': query,
      'success': function(d) {
        if (d && d.data) {
          alert(JSON.stringify(d));
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

  ModelDraw.prototype.getData = function () { //获取当前的数据
    var curDrawData = this.curDrawData;
    curDrawData.info = computeDrawInfo(curDrawData);
    return curDrawData;
  };

  ModelDraw.prototype.getFrame = function() {
    return this.curFrame;
  };

  ModelDraw.prototype.getCurve = function() {
    return this.curCurve;
  };

  ModelDraw.prototype.getAllDrawingsById = function(openid, cb) {
    if (!openid) return;
    $.ajax({
      'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
      'type': 'GET',
      'dataType': 'json',
      'data': {
        'userid': openid
      },
      'success': function(d) {
        cb(d);
      },
      'error': function(e) {
        console.log(e, 'save-err');
        cb(false);
      }
    });
  };
  return ModelDraw;
});
