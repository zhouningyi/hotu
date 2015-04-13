'use strict';

define(['zepto'], function($) {
  var icon2css = {
    //本身
    'options': {
      'css': 'ion-gear-b',
      'desc': '选项',
    },
    //分类
    'lab': {
      'css': 'ion-erlenmeyer-flask',
      'desc': '实验室图标',
    },

    //操作
    'brush': {
      'css': 'ion-android-create',
      'desc': '画笔',
    },
    'backward': {
      'css': 'ion-arrow-left-c',
      'desc': '后退',
    },
    'forward': {
      'css': 'ion-arrow-right-c',
      'desc': '前进一步',
    },
    'transfer': {
      'css': 'ion-shuffle',
      'desc': '（滤镜）转换',
    },
    'delete': {
      'css': 'ion-android-delete',
      'desc': '删除',
    },
    'deleteOutline': {
      'css': 'ion-ios-trash-outline',
      'desc': '删除细线',
    },
    'broadcast': {
      'css': 'ion-social-youtube',
      'desc': '播放youtube风格',
    },

    //帮助
    'help': {
      'css': 'ion-help',
      'desc': '问号',
    },
    'left': {
      'css': 'ion-ios-arrow-left',
      'desc': '向左<',
    },
    'right': {
      'css': 'ion-ios-arrow-right',
      'desc': '向右>',
    },
    'more': {
      'css': 'ion-ios-more',
      'desc': '更多。。。',
    },

    //设备
    'computer': {
      'css': 'ion-monitor',
      'desc': '问号',
    },
    'pad': {
      'css': 'ion-ipad',
      'desc': 'pad',
    },
    'mobile': {
      'css': 'ion-iphone',
      'desc': '手机',
    },


    //工具设置
    'lightness': {
      'css': 'ion-android-sunny',
      'desc': '亮度',
    },
    'grid': {
      'css': 'ion-ios-grid-view ',
      'desc': '网格线',
    },
    'layer': {
      'css': 'ion-social-buffer',
      'desc': '图层',
    },

    //社交
    'star': {
      'css': 'ion-ios-star',
      'desc': '加星',
    },
    'heart': {
      'css': 'ion-android-favorite',
      'desc': '点赞',
    },

    'github': {
      'css': 'ion-social-github',
      'desc': 'github',
    },
    'download': {
      'css': 'ion-archive',
      'desc': '下载',
    },
    'downloadOutline': {
      'css': 'ion-ios-download-outline',
      'desc': '下载细线条',
    },
    'share': {
      'css': 'ion-share',
      'desc': '分享',
    },
    //其他 ion-ios-grid-view grid
    'recordVoice': {
      'css': 'ion-mic-a',
      'desc': 'ccc',
    },
    'zan': {
      'css': 'ion-thumbsup',
      'desc': '赞（大拇指）',
    },
    'refresh': {
      'css': 'ion-arrow-return-right',
      'desc': '刷新',
    }
  };


  var tag2css = { //这属于template
    'importance_high': {
      'csses': ['red']
    },
    'importance_mid': {
      'csses': ['gray-high']
    },
    'importance_low': {
      'csses': ['gray-middle']
    },
    'btn_mobile':{
      'csses': ['btn-mobile']
    },
    'iconfont_mobile':{
      'csses':['iconfont-mobile']
    },
    'tool_left':{
      'csses':['block']
    }
  };


  function genIconList(elementsObj, node) {
    var type = elementsObj.type;
    var iconArr = elementsObj.c;
    var tagsParent = elementsObj.tags;
    var cssBase = getCssByTags(tagsParent);
    var html = '';
    for (var i = 0; i < iconArr.length; i++) {
      var obj = iconArr[i];
      var id = obj.id;
      var tags = obj.tags;
      var icon = obj.icon;
      var css = getCssByTags(tags) + ' '+ cssBase + ' ' + getCssByIcon(icon);
      html+= '<i class="'+css+'"';
      if(id) html+= ' id="' + id + '"';
      html+= '></i>';
    }
    console.log(html);
    node.html(html);
    return html;
  }


  function getCssByIcon(icon){
    if(icon2css[icon]&&icon2css[icon].css) return icon2css[icon].css;
  }

  function getCssByTags(tags){
    if(tags){
      var css = ' ';
      for(var k in tags){
        var tag = tags[k];
        var styles = tag2css[tag];
        css+= (' ' + styles.csses.join(' '));
      }
      return css+'';
    }
    return '';
  }

  // function generate(obj) {
  //   if (obj && obj.type) {
  //     var type = obj.type;
  //     var c = obj.c;
  //     if (type === 'iconList') {
  //       genIconList(c);
  //     }
  //   }
  // }

  return {
    'genIconList': genIconList
  };

});
