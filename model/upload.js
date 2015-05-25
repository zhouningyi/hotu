'use strict';

//上传到七牛云的方法

define(['zepto'], function($) {
  function upload(base64, cb) {
    var now = new Date();
    var fileName = now.getTime() + 'hotu' + parseInt(Math.random() * 20);
    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: '/upload',
      data: {
        imageData: base64,
        imageName: fileName
      },
      success: function(e) {
        console.log(e);
        cb(e);
      }
    });
  }

  return {
    'upload': upload
  };
});