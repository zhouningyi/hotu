'use strict';

define(['./../utils/utils'], function (Utils) {
  var prevent = Utils.prevent;
  var animateSeries = Utils.animateSeries;

  function UploadSubmit(container, opt) {
    this.opt = opt || {};
    var config = this.config = opt.config;
    config.drawData = this.drawData = config.drawData || {};
    this.modelDraw = opt.modelDraw;
    this.isLogin = opt.isLogin;
    // this.isLogin = true;
    
    this.tagData = [{
      'text': '默认相册',
      'selected': 1
    }];
    this.accessData = {
      'public': 1
    };
    this.container = container;
    this.init();
    this.autoFillInputs();
    // this.done();
    
    this.status = 'disable';
    this.events();
  }

  UploadSubmit.prototype.switch = function () {
    if(this.status === 'in') this.out();
    if(this.status === 'out' || this.status === 'disable') this.in();
  };

  var mainNode, titleGroup, submitNode, inputGroup, tagGroup, selectTagArea, buttonSubmitNode, buttonCancelNode, buttonGroup, contentNode, accessNode, publicButton, renderTags, drawNameInput, drawDescInput, userNameInput;
  var qrcodeNode;

  UploadSubmit.prototype.init = function () {
    var opt = this.opt;
    var userName = opt.userName || '您的大名';
    var drawName = opt.drawName || '作品名字';
    var drawDesc = opt.drawDesc || '作品描述（选）';
    var unloginText = this.isLogin ?'':'注册 -> ';
    var bannerHTML = '<div class="submit-line-group submit-title-group">\
         <i class="iconfont icon-android-upload inline-block submit-title" id="submit-message">&#xe604;</i>\
         <span class="submit-vice-title">'+ unloginText +'云上画册|长久保存|一键分享</span>\
       </div>';

    var loginedHTML = '<div class="submit-line-group submit-input-group">\
        <input id="drawingName" type="text" placeholder="' + drawName + '" class="submit-input">\
        <input id="drawingDesc" type="text" placeholder="' + drawDesc + '" class="submit-input">\
        <input id="username" type="text" placeholder="' + userName + '" class="submit-input">\
      </div>\
      \
      <div class="submit-line-group submit-tag-group">\
       <div class="input-desc">把作品分享到这些相册：</div>\
       <div class="submit-tag-area"></div>\
      </div>\
      \
      <div class="submit-line-group submit-access-group">\
        <div class="input-desc">权限：</div>\
        <div class="submit-access-area">\
           <div id="public" class="transition-fast submit-access selected">浏览</div>\
        </div>\
      </div>\
      \
      <div class="submit-line-group submit-button-group">\
       <div class="submit-submit-button submit-button">上传</div>\
       <div class="submit-cancel-button submit-button">取消</div>\
      </div>';

    var unLoginedHTML = '\
    <div class="entry-image-container" style="padding-top: 10%">\
      <img class="entry-word entry-img" src="http://open-wedding.qiniudn.com/word3.png">\
      <img class="entry-image" src="http://open-wedding.qiniudn.com/qrcodeblack.jpg"></img>\
    </div>\
    <div class="submit-line-group submit-button-group">\
       <div class="submit-cancel-button submit-button">取消</div>\
      </div>';

    var html = this.isLogin? loginedHTML: unLoginedHTML;

    mainNode = $(
    '<div class="submit-container out-left">\
      <div class="submit-content-container">' + bannerHTML + html + 
      '</div>\
     </div>').appendTo(this.container);
    submitNode = this.submitNode = mainNode.find('.submit-content-container') ;
    titleGroup = submitNode.find('.submit-title-group');

    inputGroup = submitNode.find('.submit-input-group');
    drawNameInput = submitNode.find('#drawingName');
    drawDescInput = submitNode.find('#drawingDesc');
    userNameInput = submitNode.find('#username');

    tagGroup = submitNode.find('.submit-tag-group');

    selectTagArea = submitNode.find('.submit-tag-area');

    buttonSubmitNode = submitNode.find('.submit-submit-button');
    buttonCancelNode = submitNode.find('.submit-cancel-button');
    buttonGroup = submitNode.find('.submit-button-group');
    contentNode = submitNode.find('.submit-content-container');
    accessNode = submitNode.find('.submit-access-group');
    publicButton = submitNode.find('#public');

    qrcodeNode = submitNode.find('.entry-image-container');

    this.renderTags();
  };

  UploadSubmit.prototype.autoFillInputs = function () {//自动补充数据库已经存储的
    var config = this.config;
    var userName = config.login.userName;
    if(userName){
      var input = inputGroup.find('#username')[0];
      if(input){
        input.value = userName;
      }
    }
  };

  UploadSubmit.prototype.renderTags = function () {
    var tagData = this.tagData;
    var html = '';
    for (var k in tagData) {
      var tag = tagData[k];
      var text = tag.text;
      var selClass = (tag.selected) ? 'selected' : 'unselected';
      html += '<div class="transition-fast submit-tag ' + selClass + '" id="' + k + '">' + text + '</div>';
    }
    selectTagArea.html(html);
  };

  UploadSubmit.prototype.in = function () {
    var self = this;
    setTimeout(this.modelDraw.saveImage.bind(this.modelDraw), 1000);
    var config = this.config;
    var userid = config.login.userid;
    if (this.status !== 'in') {
      if (this.status === 'disable') {
        mainNode.removeClass('out-left');
      }
      mainNode
      .css({
        'pointer-events': 'auto'
      })
      .keyAnim('fadeIn', {
        time: 0.75
      })
      .find('div')
      .css({
        'pointerEvents': 'auto'
      });

      qrcodeNode.keyAnim('fadeInLeft', {time: 0.3});
      animateSeries ([titleGroup, drawNameInput, drawDescInput, userNameInput, tagGroup, buttonSubmitNode, accessNode, buttonCancelNode], 'fadeInLeft', {
        time: function (k) {return 0.06 * (k + 1);},
        delay: function (k) {return 0.03 * (k + 1);}
      });
      this.status = 'in';
    }
  };

  UploadSubmit.prototype.out = function () {
    if (this.status !== 'out') {
      mainNode
      .keyAnim('fadeOut', {
        time: 2,
        delay: 0.6
      })
      .css({
        'pointerEvents': 'none'
      })
      .find('div')
      .css({
        'pointerEvents': 'none'
      })
      qrcodeNode.keyAnim('fadeOutLeft', {time: 0.3});
      animateSeries ([titleGroup, drawNameInput, drawDescInput, userNameInput, tagGroup, buttonSubmitNode, accessNode, buttonCancelNode], 'fadeOutLeft', {
        time: function (k) {return 0.1 * (k + 1);},
        delay: function (k) {return 0.05 * (k + 1);}
      });
      this.status = 'out';
    }
  };

  function sumSel(obj) {
    var sum = 0;
    for (var k in obj) {
      if (obj[k].selected) sum++;
    }
    return sum;
  }

  UploadSubmit.prototype.warn = function (node) {
    node.keyAnim('warn', {
      time: 0.3,
    });
    setTimeout(function(){node.clearKeyAnim();}, 1400);
  };

  UploadSubmit.prototype.checkInputs = function () {
    var config = this.config;
    var modelDraw = this.modelDraw;
    var nameNode = inputGroup.find('#drawingName');
    var drawName = nameNode[0].value;
    var descNode = inputGroup.find('#drawingDesc');
    var desc = descNode[0].value;
    var userNameNode = inputGroup.find('#username');
    var userName = userNameNode[0].value;
    if(!userName) return this.warn(userNameNode);
    modelDraw.setInfo('drawName', drawName);
    config.login.userName = userName;
    modelDraw.saveConfig();
    if(!drawName) return this.warn(nameNode);
    modelDraw.setInfo('userName', userName);
    if(desc){
      modelDraw.setInfo('desc', desc);
    }
    return 'ok';
  };

  UploadSubmit.prototype.events = function () {
    var self = this;
    var tagData = this.tagData;
    var accessData = this.accessData;

    selectTagArea.delegate('.submit-tag', 'click', function (d) {
      var node = $(this);
      var id = node.attr('id');
      if (node.hasClass('selected') && sumSel(tagData) > 1) {
        node.removeClass('selected').addClass('unselected');
        tagData[id].selected = 0;
      } else {
        node.removeClass('unselected').addClass('selected');
        tagData[id].selected = 1;
      }
    });

    $('.submit-button')
    .on('touchstart mousedown', function(){
      $(this).addClass('selected');
    })
    .on('touchend mouseleave', function(){
      $(this).removeClass('selected');
    });

    var config = this.config; 
    this.container.find('.entry-image-container').on('click', function () {
      window.location.href = config.helpLink;
    });

    buttonSubmitNode.on('click', function (e) {
      var status = self.checkInputs();
      if(status === 'ok'){
        buttonSubmitNode.addClass('submit-submit-loading').text('上传中..');
        self.modelDraw.save(function(bol){
          if(bol){
            self.done();
          }else{
            buttonSubmitNode.removeClass('submit-submit-loading').text('重传');
          }
        });
      }
      prevent(e);
    });

    buttonCancelNode.on('click', function (e) {
      self.out();
      prevent(e);
    });

    publicButton
    .on('click', function (e) {
      var node = $(this);
      var id = node.attr('id');
      if (node.hasClass('selected')) {
        node.removeClass('selected').addClass('unselected');
        accessData[id] = 0;
      } else {
        node.removeClass('unselected').addClass('selected');
        accessData[id] = 1;
      }
    });
  };

  UploadSubmit.prototype.done = function () {
    var self = this;
    qrcodeNode.empty();
    inputGroup.empty();
    tagGroup.empty();
    accessNode.empty();
    buttonGroup.empty();
    var toAblumNode = $('<div class="submit-line-group to-gallary big-button">上传成功，去相册看看</div>').appendTo(titleGroup);
    var toDrawingNode = $('<div class="submit-line-group to-drawing big-button">不去，继续画画</div>').appendTo(titleGroup);
    toAblumNode.on('touchstart mousedown', function (e) {
      window.location.href = self.config.galleryURL;
      prevent(e);
    });
    toDrawingNode.on('touchstart mousedown', function (e) {
      self.out();
      prevent(e);
    });
  };

  return UploadSubmit;
});