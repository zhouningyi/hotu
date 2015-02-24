require.config({
  'paths': {
    'zepto': './bower_components/zepto/zepto',
    'anim': './bower_components/anim/anim',
    'async': './bower_components/async/lib/async',
  },
  'shim': {
    'zepto': {
      'exports': '$'
    }
  }
});
