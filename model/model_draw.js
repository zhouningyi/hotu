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

define(['./../utils/utils', './../libs/event', './drawDataInfo'], function (Utils, Events, DrawDataInfo) {
  var upper = Utils.upper;
  var computeDrawInfo = DrawDataInfo.computeDrawInfo; //计算一副绘画中的统计信息

  var body = $('body'),
    storage, tmpStorageKey;

  function ModelDraw(obj) {
    this.detectStorage();
    obj = obj || {};
    var config = this.config = obj.config;
    storage = config.storage;
    tmpStorageKey = storage.tmpKey;
    this.initEvents();
  }

  Events.extend(ModelDraw, {
    options: {
      prevStorageKeys: ['cur_drawing_data_hotu_v1', 'cur_drawing_data_hotu', 'cur_drawing_data_hotu_v11', 'cur_drawing_data_hotu_v12', 'cur_drawing_data_hotu_v13'],
    },
    initialize: function () {},
    //////////////////与editor绑定/////////////////////
    linkTo: function (editor) {
      this.editor = editor;
      this.frameH = editor.height;
      this.frameW = editor.width;
      return this;
    },
    ////////////////////和存储相关////////////////////
    detectStorage: function () {
      if (typeof(Storage) == "undefined") return window.infoPanel && infoPanel.alert('不好意西^*&%不能自动保存..');
    },
    ////////////////////操作////////////////////
    /**绘制结束后将曲线数据加入*/
    addCurve: function (curve) {
      if (!curve || !curve.c || !curve.c[0] || !curve.c[0].length) return;
      this.forwardCurves = [];
      curve.id = Utils.getId('curve');
      this.curves.push(curve);
      this.saveStorage(); //画完一笔 自动保存
      return curve;
    },
    back: function () {
      var curve = this.curves.pop();
      this.forwardCurves.push(curve);
      this.saveStorage();
      return curve;
    },
    forward: function () {
      var curve = this.forwardCurves.pop();
      this.curves.push(curve);
      this.saveStorage();
      return curve;
    },
    saveStorage: function () { //从localStorage寻找数据
      var d = this.curDrawData;
      d.time = this.getTimeRelative();
      if (!d) return console.log('no curDrawData');
      // var localStorageLength = JSON.stringify(localStorage).length / 1000000;
      // localStorageLength = localStorageLength.toFixed(3);
      // $('#test-container').text(localStorageLength + 'M');
      if (d.c && d.c.length > 0) window.localStorage.setItem(tmpStorageKey, JSON.stringify({
        'drawing': d
      }));
    },
    /**清除过去版本的storage*/
    cleanStorage: function () {
      var i, prevStorageKeys = this.options.prevStorageKeys;
      for (i in prevStorageKeys) {
        var key = prevStorageKeys[i];
        try {
          window.localStorage.setItem(key, '{}');
        } catch (e) {}
      }
    },
    autoSubmit: function () { //开始自动保存
      var interval = this.options.autosaveInterval || 15000;
      this.save();
      this.submitID = setTimeout(this.autoSubmit.bind(this), interval);
    },
    cancelSubmit: function () { //取消自动保存
      window.clearTimeout(this.submitID);
    },
    /**保存背景操作*/
    saveBg: function (key, value) {
      var d = this.curDrawData;
      if (!d) return console.log('no curDrawData');
      if (!d.bg) d.bg = {};
      d.bg[key] = value;
      this.saveStorage();
    },
    /**保存额外信息*/
    saveInfo: function (key, value) {
      var d = this.curDrawData;
      if (!d) return console.log('no curDrawData');
      d[key] = value;
    },
    getData: function () { //获取当前的数据
      var d = this.curDrawData;
      d.info = computeDrawInfo(d);
      return d;
    },
    /**载入数据或载入最后编辑的数据或创建数据*/
    load: function (d) {
      d = d || this.getLastStorage();
      d.info = computeDrawInfo(d);
      if (d && d.c && d.c.length) {
        this.curDrawData = d;
        return this.start();
      }
      return this.create();
    },
    /**新建数据*/
    new: function () { //新建数据
      var d = this.curDrawData = {
        id: Utils.getId('frame'),
        frameW: this.frameW || $(window).width(),
        frameH: this.frameH || $(window).height(),
        type: 'frame',
        c: [],
        time: 0
      };
      this.saveStorage();
      this.start();
      return d;
    },
    start: function (obj) { //开始一组新的绘制 分有数据和没数据2种情况
      var d = this.curDrawData;
      this.curves = d.c;
      //
      this.timePrev = d.time || 0; //已经作画的总时间
      this.timeStart = Utils.getTimeAbsolute(); //现在开始的时间
      this.forwardCurves = [];

      if (window.global) {
        global.trigger('drawing-userid', d.userid);
        global.trigger('drawing-drawid', d.drawid);
      }
      return d;
    },
    getLastStorage: function () { //从localStorage寻找数据
      if (typeof(Storage) == 'undefined') return console.log('不能自动保存');
      var d = window.localStorage.getItem(tmpStorageKey);
      return JSON.parse(d).drawing;
    },
    /**载入数据*/
    initEvents: function () {
      window.global && global
        .on('openid', function (openid) {
          self.userid = openid;
        })
        .on('drawid', function (drawid) {
          self.drawid = drawid;
        });
    },
    getTimeRelative: function () {
      return Utils.getTimeAbsolute() - this.timeStart;
    },
    //对数据库的操作
    deleteDB: function (query, cb) { //删除某幅图
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
        'success': function (d) {
          cb(1, d);
        },
        'error': function (e) {
          cb(0);
        }
      });
    },
    post: function (cb) { //取回数据库已经存的内容
      var d = this.curDrawData;
      d.time = this.getTimeRelative();
      var userName = d.userName;
      var drawName = d.drawName;
      var drawid = d.id;
      d.info = computeDrawInfo(d);

      cb = cb || function () {};
      var random = parseInt(Math.random() * 100000000);
      var saveData = {
        'userid': this.userid || this.config.login.userid,
        'userName': userName,
        'title': drawName,
        'drawid': drawid,
        'data': JSON.stringify(d),
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
    },
    getAllDrawingsById: function (openid, cb) {
      if (!openid) return;
      $.ajax({
        'url': 'http://hotu.co/hotu-api/api/hotu/drawing',
        'type': 'GET',
        'dataType': 'json',
        'data': {
          'userid': openid
        },
        'success': function (d) {
          cb(d);
        },
        'error': function (e) {
          console.log(e, 'save-err');
          cb(false);
        }
      });
    },
    getLastDB: function (q, cb) { //取回数据库已经存的内容
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
        'success': function (d) {
          if (d && d.data) {
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
    },
    getDrawingDataJSONP: function (opt, cb) { //取回数据库已经存的内容
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
    },
    saveImage: function () {
      // if (this.exports) {
      //   this.imageBase64 = this.exports.toImage('small').dataURL;
      // }
    },
    //config相关
    getConfig: function () { // 把app_config存在localstorage里
      var config = this.config;
      var savekey = config.login.saveKey;
      var cfg = JSON.parse(window.localStorage.getItem(savekey));
      if (!cfg) return false;
      config.login = cfg.login;
    }
  });
  return ModelDraw;
});