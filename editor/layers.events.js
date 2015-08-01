'use strict';
define(['./../utils/utils', './../libs/pinchzoom'], function (Utils, PinchZoom) {
  var prevent = Utils.prevent;
  var getPt = Utils.getPt;
  var distance = Utils.distance;
  var limit = Utils.limit;
  var getTimeAbsolute = Utils.getTimeAbsolute;

  return {
    isMove: false,
    initEvents: function () { //将所有的事件 绑在基础的节点上
      var layersNode =  this.layersNode = this.eventsNode.find('.layers-container');
      this.initEventsDraw();
      this.initEventsPinch();
    },
    /////////////绘制
    initEventsDraw: function () {
      var self = this, pt;
      var layersNode = this.layersNode;
      layersNode
      .on('mousedown touchstart', function (e) {
        e.preventDefault();
        self.isDown = true;
        if(e.touches && e.touches.length === 2) {return;}
        prevent(e);
        if (!self.isDraw) return;

        var pinch = self.pinch;
        pt = Utils.getPt(e);
        pt[2] = 0;
        if(pinch && pinch.zoomFactor && pinch.zoomFactor > 1){
          var zoomFactor = pinch.zoomFactor;
          pt[1] = pt[1] / zoomFactor;
          pt[0] = pt[0] / zoomFactor;
        }
        self.timestart = getTimeAbsolute();
        self.emit('drawstart', {
          pt: pt,
          index: self.ptIndex = 0
        });
      })
      .on('mousemove touchmove', function (e) {
        e.preventDefault();
        self.isMove = true;
        if (!self.isDown || (e.touches && e.touches.length !== 1)) return;
        if (!self.isDraw) return  window.infoPanel && infoPanel.alert('选择画布层,不要在背景层上画画..');
        prevent(e);
        self.ptIndex++;
        pt = Utils.getPt(e);
        pt[2] = getTimeAbsolute() - self.timestart;
        //
        var pinch = self.pinch;
        if(pinch && pinch.zoomFactor && pinch.zoomFactor > 1){
          var zoomFactor = pinch.zoomFactor;
          pt[1] = pt[1] / zoomFactor;
          pt[0] = pt[0] / zoomFactor;
        }
        self.emit('draw', {
          pt: pt,
          index: self.ptIndex++
        });
      })
      .on('mouseup touchend', function (e){
        e.preventDefault();
        if(self.isPinch) return;
        if (!self.isMove) window.global && global.trigger('painter-tap');
        if (!self.isDraw || self.isPinch) return;
        self.isDown = false;
        self.isMove = false;
        if (!self.ptIndex) return;
        self.emit('drawend', {
          index: self.ptIndex
        });
      });
      //
      this.isAfterDown = true; //主要解决pc、mac的问题。
    },

    initEventsPinch: function () {
      this.pinch = new PinchZoom(this.layersNode, {use2d:1});
    }
  };
});

