'use strict';
define(['./../utils/utils'], function (Utils) {
  var prevent = Utils.prevent;
  var getTimeAbsolute = Utils.getTimeAbsolute;
//工具函数
  function getHammerDistance(e) {
    if (!e) return;
    var pointers = e.pointers;
    var pointer1 = pointers[0];
    var pointer2 = pointers[1];
    var screenX1 = pointer1.screenX;
    var screenY1 = pointer1.screenY;
    var screenX2 = pointer2.screenX;
    var screenY2 = pointer2.screenY;
    return Utils.distance(screenX1, screenY1, screenX2, screenY2);
  }

  return {
    isMove: false,
    initEvents: function () { //将所有的事件 绑在基础的节点上
      var eventsNode = this.eventsNode;
      var hammer = this.hammer = new Hammer(eventsNode[0], {});
      hammer.get('pinch').set({
        enable: true
      });
      hammer.get('rotate').set({
        enable: true
      });
      //
      this.initEventsPinch();
      this.initEventsDraw();
    },
    /////////////绘制
    initEventsDraw: function () {
      var self = this, pt;
      this.eventsNode.find('.layers-container')
      .on('mousedown touchstart', function (e) {
        prevent(e);
        self.isDown = true;
        if (!self.isDraw) return;
        pt = Utils.getPt(e);
        pt[2] = 0;
        self.timestart = getTimeAbsolute();
        self.emit('drawstart', {
          pt: pt,
          index: self.ptIndex = 0
        });
      })
      .on('mousemove touchmove', function (e) {
        prevent(e);
        self.isMove = true;
        if (!self.isDraw) return  window.infoPanel && infoPanel.alert('选择画布层,不要在背景层上画画..');
        if (!self.isDown) return;
        self.ptIndex++;
        pt = Utils.getPt(e);
        pt[2] = getTimeAbsolute() - self.timestart;
        self.emit('draw', {
          pt: pt,
          index: self.ptIndex++
        });
      })
      .on('mouseup touchend', function (e){
        prevent(e);
        if (!self.isMove) window.global && global.trigger('painter-tap');
        if (!self.isDraw) return;
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

    /////////////缩放
    initEventsPinch: function () {
      var eventsNode = this.eventsNode;
      var self = this;
      this.pinchedScale = this.pinchScale = 1;
      this.pinchedX = this.pinchX = 0;
      this.pinchedY = this.pinchY = 0;
      this.cx = this.width / 2;
      this.cy = this.height / 2;
      this.isFirstPinch = true;
      this.hammer
        .on('pinchstart', function (e) {
          if (self.isFirstPinch) {
            self.cxFirst = e.center.x;
            self.cyFirst = e.center.y;
            // self.disFirst = getHammerDistance(e);
            self.isFirstPinch = false;
          }
          self.isPinch = true;
          if (self.isAfterDown) {
            self.isAfterDown = false;
            self.redraw();
            self.mvPt = null;
          }
          self.cxS = e.center.x;
          self.cyS = e.center.y;
          self.disS = getHammerDistance(e);
        })
        .on('pinchmove', function (e) {
          if (!self.isPinch) return;
          var scale = self.pinchScale = getHammerDistance(e) / self.disS * self.pinchedScale;
          testNode.text('dx' + '|' + 'dy' + '|' + scale);
          // * self.pinchedScale;
          var center = e.center;
          self.cx = center.x, self.cy = center.y;
          self.pinchX = center.x - self.cxFirst; // + self.pinchedX;
          self.pinchY = center.y - self.cyFirst; // + self.pinchedY;
          self.updateZoom();
        })
        .on('pinchend', function () {
          self.pinchedX = self.pinchX;
          self.pinchedY = self.pinchY;

          self.checkIsOutOfBound();

          self.pinchedScale = self.pinchScale;
          self.isPinch = false;
          self.disS = null;
        });
    },
    checkIsOutOfBound: function () {
      var zoom = this.options.zoom;
      var maxZoom = zoom.max, minZoom = zoom.min;
      if (this.pinchScale > maxZoom) {
        this.pinchScale = maxZoom;
        this.updateZoom();
      } else if (this.pinchScale < minZoom) {
        this.pinchScale = minZoom;
        this.pinchX = 0;
        this.pinchY = 0;
        this.pinchedX = 0;
        this.pinchedY = 0;
        this.pinchedScale = 1;
        this.updateZoom();
        this.cx = this.mainContainer.width() / 2;
        this.cy = this.mainContainer.height() / 2;
      }
      var scale = this.pinchedScale;
      var leftTop = (this.pinchX - this.cx) * scale + this.cx;
      // testNode.text(leftTop);
    },
    updateZoom: function () {
      var dx = this.pinchX,
        dy = this.pinchY,
        scale = this.pinchScale;
      var translate = 'translate3d(' + dx + 'px,' + dy + 'px,' + 0 + 'px) scale(' + scale + ',' + scale + ')';

      var origin = this.cx + 'px ' + this.cy + 'px';
      this.mainContainer.css({
        'transformOrigin': origin,
        '-webkitTransformOrigin': origin,
        'transform': translate,
        '-webkitTransform': translate
      });
    }
  };
});
