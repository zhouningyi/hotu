'use strict';

define(function() {
  return {
    'login': {//isFollower
      'key': 'login_info_hotu_painter',
    },

    'cookie': { //cookie相关的设置
      'expires': 7
    },

    'url': {
      'domain': 'hotu.co',
      'redirect_hotu_co': 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2b66f49eb82d70de&redirect_uri=http%3A%2F%2Fhotu.co%2Fhua%2F&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
    },

    'brush': {},

    'storage': { //在localstorage中临时存储画作的位置
      'tmpKey': 'cur_drawing_data_hotu_v12'
    },

    'weixin': {
      'url': { //对state参数进行改写
        'and': 'annnd',
        'equals': 'equuualsto',
        'keysWeixinInStates': { //被微信转发时候 state参数记录的字段
          'fromid': 1, //谁转发了这个链接
          'fromType': 1, //fromid是什么类型 如 openid | keyword
          'drawid': 1 //画作id
        }
      }
    },

    'sns': { //和社交相关的属性
    },
    
    'draw': {
      'quality': function (browser) { //根据浏览器的情况进行设置
        var setting = {
          'ipad': 1.6,
          'iphone': 2,
          'android': 1.5,
          'android23': 1.5
        };
        for (var key in browser) {
          if (setting[key]) {
            return setting[key];
          }
        }
        return 1.75;
      }
    }
  };
});