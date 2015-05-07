'use strict';

define(['zepto', './../utils/utils', 'anim'], function ($, Utils) {
  var prevent = Utils.prevent;
  function UploadSubmit(container, opt) {
    this.opt = opt || {};
    this.container = container;
    this.init();
    this.status = 'disable';
    this.events();
  }

  UploadSubmit.prototype.switch = function () {
    if(this.status==='in') this.out();
    if(this.status==='out' || this.status==='disable') this.in();
  };

  UploadSubmit.prototype.init = function () {
    var placeholder = '昵称22';
    var opt = this.opt;
    var userName = opt.userName || '大湿，请留名';
    var drawName = opt.drawName || '给作品起个名字呗';
    var drawDesc = opt.drawDesc || '给作品写段描述呗';
    var mainNode = this.mainNode = $(
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
         <div class="submit-access selected">浏览</div>\
       </div>\
      </div>\
      \
      <div class="submit-line-group submit-button-group">\
       <div class="submit-submit-button submit-button">上传</div>\
       <div class="submit-cancel-button submit-button">取消</div>\
      </div>\
     </div>').appendTo(this.container);
    var submitNode = this.submitNode = mainNode.find('.submit-content-container') ;
    this.titleGroup = submitNode.find('.submit-title-group');
    this.inputGroup = submitNode.find('.submit-input-group');
    this.tagGroup = submitNode.find('.submit-tag-group');
    this.selectTagGroup = submitNode.find('.submit-tag-area');
    this.buttonNode = submitNode.find('.submit-submit-button');
    this.cancelButtonNode = submitNode.find('.submit-cancel-button');
    this.contentNode = submitNode.find('.submit-content-container');
    this.accessNode = submitNode.find('.submit-access-group');
    this.renderTags();
  };

  UploadSubmit.prototype.renderTags = function() {
    var selectTagGroup = this.selectTagGroup;
    var tagData = [{
      'text': '默认相册',
      'selected': 1
    }, {
      'text': '在杭州',
      'selected': 0
    }, {
      'text': '荒原',
      'selected': 0
    }, {
      'text': '荒原',
      'selected': 0
    }, {
      'text': '荒原',
      'selected': 0
    }, {
      'text': '荒原',
      'selected': 0
    }, {
      'text': '荒原',
      'selected': 0
    } ];
    var html = '';
    for (var k in tagData) {
      var tag = tagData[k];
      var text = tag.text;
      var selClass = (tag.selected) ? 'selected' : 'unselected';
      html += '<div class="submit-tag ' + selClass + '">' + text + '</div>';
    }
    selectTagGroup.html(html);
  };

  UploadSubmit.prototype.in = function () {
    if (this.status !== 'in') {
      if (this.status === 'disable') {
      this.mainNode.removeClass('out-left');
     }
     this.mainNode.keyAnim('fadeIn', {
        time: 1,
        delay: 0.3
      })
      this.submitNode.keyAnim('fadeInLeft', {
        time: 0.3
      });
      this.titleGroup.keyAnim('fadeInLeft', {
        time: 0.8,
        delay: 0.3
      });
      this.inputGroup.keyAnim('fadeInLeft', {
        time: 0.7,
        delay: 0.3
      });
      this.tagGroup.keyAnim('fadeInLeft', {
        time: 0.6,
        delay: 0.3
      });
      this.contentNode.keyAnim('fadeInLeft', {
        time: 0.4,
        delay: 0.3
      })
      this.accessNode.keyAnim('fadeInLeft', {
        time: 0.3,
        delay: 0.3
      })
      this.buttonNode.keyAnim('fadeInLeft', {
        time: 0.2,
        delay: 0.3
      })
      this.status = 'in';
    }
  };

  UploadSubmit.prototype.out = function () {
    if (this.status !== 'out') {
      this.mainNode.keyAnim('fadeOutLeft', {
        time: 0.8,
        delay: 0.5
      })
      this.submitNode.keyAnim('fadeOutLeft', {
        time: 0.8,
        delay: 0.5
      });
      this.titleGroup.keyAnim('fadeOutLeft', {
        time: 0.8,
        delay: 0.3
      });
      this.inputGroup.keyAnim('fadeOutLeft', {
        time: 0.7,
        delay: 0.3
      });
      this.tagGroup.keyAnim('fadeOutLeft', {
        time: 0.6,
        delay: 0.3
      });
      this.contentNode.keyAnim('fadeOutLeft', {
        time: 0.4,
        delay: 0.3
      })
      this.accessNode.keyAnim('fadeOutLeft', {
        time: 0.3,
        delay: 0.3
      })
      this.buttonNode.keyAnim('fadeOutLeft', {
        time: 0.2,
        delay: 0.3
      })
      this.status = 'out';
    }
  };

  UploadSubmit.prototype.events = function () {
    var self = this;
    this.buttonNode.on('touchstart mousedown', function (e) {
      self.out();
      prevent(e);
    });
    this.cancelButtonNode.on('touchstart mousedown', function (e) {
      self.out();
      prevent(e);
    });
  };

  return UploadSubmit;
});