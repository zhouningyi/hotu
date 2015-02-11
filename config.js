'use strict';
require.config({
  paths: {
    'zepto': './bower_components/zepto/zepto',
    'anim': './bower_components/anim/anim',
  },
  shim: {
    'zepto': {
      'exports': '$'
    },
    'anim': {
      'exports': '$'
    }
  }
});
