  //http://www.baidufe.com/item/f07a3be0b23b4c9606bb.html
  //https://github.com/zxlie/WeixinApi
  'use strict';
  define(['./jweixin-1.0.0', 'zepto'], function(wx, $) {
    var body = $('body');

    function Weixin(url) {
      this.share();
      this.getOpenid();
      this.genShare();
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    Weixin.prototype.share = function() {
      var js_ticket_url = encodeURIComponent(window.location.origin + window.location.pathname + window.location.search);
      $.getJSON('http://mankattan.mathartworld.com/hotu-api/api/weixin/sign?url=' + js_ticket_url,
        function(data, status) {
          data = data || {};
          var config = data.config;
          // config.debug = true;
          wx.config(config);
        });
    };

    Weixin.prototype.getOpenid = function() {
      var self = this;
      var code = getQueryString('code');
        $.ajax({
          url: 'http://mankattan.mathartworld.com/hotu-api/api/weixin/getopenid',
          dataType: 'json',
          type: 'get',
          data: {
            'code': code
          },
          success: function(d) {
            var openid = d.openid;
            if(openid){
              body.trigger('openid', openid);
              self.userid = openid; //+
            }
          },
          error: function(d) {
            var openid = 'err'+ Math.floor(Math.random() * 10000000);
            body.trigger('openid',openid);
          }
        });
    };

    Weixin.prototype.events = function() {
      var self = this;
      $('body')
      .on('drawid',function(e,drawid){
        self.drawid = drawid;
        self.genShare();
      })
      .on('openid', function(e, openid){
        self.userid = openid;
        self.genShare();
      });
    };

    Weixin.prototype.genShare = function() {
      var self = this;
      wx.ready(function() {
        var title = '糊涂';
        var picUrl = 'http://open-wedding.qiniudn.com/frontlogo.png';
        var desc = '笔墨创作的感觉';
        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx05125e8c1635642f&redirect_uri=http://mankattan.mathartworld.com/hotuOrigin/?from='+(self.userid||'openid_err')+'&drawid='+(self.drawid||'drawid_err')+'&response_type=code&scope=snsapi_base&state=123&connect_redirect=1&from=timeline&isappinstalled=0#wechat_redirect';
        var shareObj = {
          title: title,
          link: url,
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
  })
