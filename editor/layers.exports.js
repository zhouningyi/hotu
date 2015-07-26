'use strict';
define(['./../utils/utils'], function (Utils) {
  return {
    initExports: function () {
      this.initCanvasExports();
    },
    initCanvasExports: function () {
      var ctx = this.ctxExports = Utils.genCanvas({
        quality: this.options.quality,
        appendBol: false,
        container: this.container
      });
      this.canvasExports = ctx.canvas;
    },
    toCanvas: function () {
      var ctx = this.ctxExports;
      var quality = this.options.quality;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.each(function (layer) {
        var canvasList = layer.getCanvas();
        for (var i in canvasList) {
          var canvas = canvasList[i];
          ctx.drawImage(canvas, 0, 0, ctx.canvas.width / quality, ctx.canvas.height / quality);
        }
      });
      return ctx.canvas;
    },
    toDataURL: function () {
      var dataURL, encoder, canvas = this.canvasExports, ctx = this.ctxExports;
      window.global && global.trigger('draw-image-url', dataURL);
      if (!canvas.toDataURL) {
        encoder = new JPEGEncoder();
        dataURL = encoder.encode(ctx.getImageData(0, 0, canvas.width, canvas.height), 90);
      } else {
        dataURL = canvas.toDataURL('image/png');
        if (dataURL.length < 20) { //有时 dataURL 会错误 长度很短
          encoder = new JPEGEncoder();
          dataURL = encoder.encode(ctx.getImageData(0, 0, canvas.width, canvas.height), 90);
        }
        return dataURL;
      }
    },
    toImage: function () {
      this.toCanvas();
      var dataURL = this.toDataURL();
      var style = 'width:100%;height:auto;pointer-events:auto;position:relative;left:0;top:0;';
      window.global && global.trigger('draw-image', '<img width="' + this.width + '" height="' + this.height + '" src="' + dataURL + '" style="'+style+'"></img>');
      // var dataURLDownload = dataURL.replace('image/png', 'image/octet-stream');
    }
  };
});
