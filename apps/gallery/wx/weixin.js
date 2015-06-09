  //http://www.baidufe.com/item/f07a3be0b23b4c9606bb.html
  //https://github.com/zxlie/WeixinApi
  'use strict';
  define(['./jweixin-1.0.0', 'zepto'], function(wx, $) {
    var body = $('body');

    function Weixin(url) {
      this.url = url;
      this.sign();
      this.genShare();
      this.events();
    }

    Weixin.prototype.sign = function () {
      var self = this;
      var jsTicketUrl = encodeURIComponent(window.location.origin + window.location.pathname + window.location.search);
      $.getJSON('http://hotu.co/hotu-api/api/weixin/sign?url=' + jsTicketUrl,
        function (data, status) {
          data = data || {};
          var config = data.config;
          config.debug = false;
          wx.config(config);
          self.genShare();
        });
    };

    Weixin.prototype.getOpenid = function(obj) {
      var self = this;
      var url = this.url;
      $.ajax({
        url: 'http://hotu.co/hotu-api/api/weixin/getopenid',
        dataType: 'json',
        type: 'get',
        data: {
          'code': url.getCode()
        },
        success: function (d) {
          if (d && d.openid) {return obj.success(d.openid);}
          return obj.fail(d);
        },
        error: function (e) {
          return obj.fail(e);
        }
      });
    };

    Weixin.prototype.events = function() {
      var self = this;
      $('body')
      .on('update-share-username', function(e, obj){
        self.genShare(obj);
      })
        .on('drawid', function(e, drawid) {
          self.drawid = drawid;
          self.genShare();
        });
    };

    Weixin.prototype.genShare = function(opt) {
      opt = opt || {};
      var self = this;
      var url = this.url;
      wx.ready(function() {
        var title = (opt.userName)? opt.userName + '的画册': '糊涂.画册';
        var picUrl = opt.imgUrl || 'http://open-wedding.qiniudn.com/tu.shu.png';
        var desc = '云上画册|记录创造的瞬间';
        var state = url.genState({
          fromid: self.userid || 'open_id_err',
          drawid: self.drawid || 'draw_id_err'
        });
        var shareUrl = 'http://hotu.co/gallery?drawUserId=' + (window.drawUserId || window.openid);
        // var shareUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx05125e8c1635642f&redirect_uri=http://hotu.co/gallery?response_type=code&scope=snsapi_base&state=' + state + '&connect_redirect=1&from=timeline&isappinstalled=0#wechat_redirect';
        var shareObj = {
          title: title,
          link: shareUrl,
          imgUrl: picUrl,
          desc: desc,
          success: function() {
            // window.location.href = 'http://mankattan.mathartworld.com/hotu/';
            // 用户确认分享后执行的回调函数
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        };

        wx.onMenuShareTimeline(shareObj);
        wx.onMenuShareAppMessage(shareObj);
      });
    };

    return Weixin;
  });

  
