'use strict';

define(['zepto', './../utils/utils', 'anim'], function ($, Utils) {
  var prevent = Utils.prevent;
  var animateSeries = Utils.animateSeries;
  function UploadSubmit(container, opt) {
    this.opt = opt || {};
    var config = opt.config;
    config.drawData = this.drawData = config.drawData || {};
    this.tagData = [{
      'text': '默认相册',
      'selected': 1
    }, {
      'text': '在杭州',
      'selected': 0
    }, {
      'text': '荒原',
      'selected': 0
    }];
    this.accessData = {
      'public': 1
    };
    this.container = container;
    this.init();
    this.status = 'disable';
    this.events();
  }

  UploadSubmit.prototype.switch = function () {
    if(this.status === 'in') this.out();
    if(this.status === 'out' || this.status === 'disable') this.in();
  };

  var mainNode, titleGroup, submitNode, inputGroup, tagGroup, selectTagArea, buttonSubmitNode, buttonCancelNode, buttonGroup, contentNode, accessNode, publicButton, renderTags, drawNameInput, drawDescInput, userNameInput;

  UploadSubmit.prototype.init = function () {
    var placeholder = '昵称22';
    var opt = this.opt;
    var userName = opt.userName || '大湿，请留名';
    var drawName = opt.drawName || '给作品起个名字呗';
    var drawDesc = opt.drawDesc || '给作品写段描述呗';
    mainNode = $(
    '<div class="submit-container out-left">\
      <div class="submit-content-container">\
       \
       <div class="submit-line-group submit-title-group">\
         <i class="iconfont icon-android-upload inline-block submit-title" id="submit-message">&#xe604;</i>\
         <span class="submit-vice-title">云上画册|长久保存|一键分享</span>\
       </div>\
       \
       <div class="submit-line-group submit-input-group">\
        <input id="drawing_name" type="text" placeholder="' + drawName + '" class="submit-input">\
        <input id="drawing_desc" type="text" placeholder="' + drawDesc + '" class="submit-input">\
        <input id="user_name" type="text" placeholder="' + userName + '" class="submit-input">\
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
      </div>\
     </div>').appendTo(this.container);
    var submitNode = this.submitNode = mainNode.find('.submit-content-container') ;
    titleGroup = submitNode.find('.submit-title-group');

    inputGroup = submitNode.find('.submit-input-group');
    drawNameInput = submitNode.find('#drawing_name');
    drawDescInput = submitNode.find('#drawing_desc');
    userNameInput = submitNode.find('#user_name');

    tagGroup = submitNode.find('.submit-tag-group');

    selectTagArea = submitNode.find('.submit-tag-area');

    buttonSubmitNode = submitNode.find('.submit-submit-button');
    buttonCancelNode = submitNode.find('.submit-cancel-button');
    buttonGroup = submitNode.find('.submit-button-group');
    contentNode = submitNode.find('.submit-content-container');
    accessNode = submitNode.find('.submit-access-group');
    publicButton = submitNode.find('#public');

    this.renderTags();
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
      })
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

  UploadSubmit.prototype.events = function () {
    var self = this;
    var tagData = this.tagData;
    var accessData = this.accessData;
    buttonSubmitNode.on('touchstart mousedown', function (e) {
      self.out();
      prevent(e);
    });

    buttonCancelNode.on('touchstart mousedown', function (e) {
      self.out();
      prevent(e);
    });

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

    publicButton.on('click', function (e) {
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

  return UploadSubmit;
});