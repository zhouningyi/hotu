'use strict';

// brush 初始设置为this.style() 绘制有3个过程 开始画线 画线和 结束
define(function() {

  function Brush(ctx, opt){
    var emptyFunc = function(){};
    this.ctx = ctx;
    opt = opt || {};

    this.opt = opt;
    this.styles();
    this._drawFunc = emptyFunc;
    this._dotFunc = emptyFunc;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////记录分析///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Brush.prototype.record = function(pt) { //判断是否记录点
    var drawBol = true;
    var ptPrev = this.pt;
    var timePrev = this.time;

    var ptThis = pt;
    var timeThis = ptThis[2];

    if (ptPrev && timePrev) {
      var dx = pt[0] - ptPrev[0];
      var dy = pt[1] - ptPrev[1];
      var dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < this.distLimit) {
        return {
          'drawBol': false
        };
      } else {
        this.pt = ptThis;
        this.time = timeThis;
        var dTime = timeThis - timePrev;
        var speed = dist / dTime;
        this.speed = speed;
        return {
          'speed': speed,
          'dist': dist,
          'drawBol': drawBol,
          'ptPrev':ptPrev,
        };
      }
    } else {
      this.pt = ptThis;
      this.time = timeThis;
      return{
        'drawBol': false
      };
    }
  };

  Brush.prototype.styles = function() { //静态的设置
    var opt = this.opt;
    if (opt) {
      var ctx = this.ctx;
      for(var name in opt){
        this[name] = opt[name];
      }
      //绘图本身的设置
      this.hue = opt.hue || this.hue || 170;
      this.maxSize = opt.maxSize;
      this.distLimit = opt.distLimit || this.distLimit || 10;
      //画布相关的设置
      ctx.globalCompositeOperation = opt.globalCompositeOperation || this.globalCompositeOperation || 'source-over';
      ctx.lineCap = opt.lineCap || this.lineCap ||'round';
      ctx.lineJoin = opt.lineJoin || this.lineJoin || 'round';
      ctx.strokeStyle = opt.strokeStyle || this.strokeStyle ||'#000';
      ctx.fillStyle = opt.fillStyle || this.fillStyle || '#fff';
      ctx.lineWidth = opt.lineWidth || this.lineWidth || 1;
      //名字
      ctx.curStyle = this.id = opt.id;
    }
  };

//////////////////////开始画线//////////////////////
  Brush.prototype.beginFunc= function(cb) {
    if (cb) this._beginFunc = cb;
  };

  Brush.prototype.begin= function(pt) {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(pt[0], pt[1]);
    this.record(pt);
  };

//////////////////////中间过程//////////////////////


  Brush.prototype.dotFunc = function(cb) {
    if (cb) this._dotFunc = cb;
  };

  Brush.prototype.drawFunc= function(cb) {
    if (cb) this._drawFunc = cb;
  };

  Brush.prototype.dot= function(pt, dt) {//中间过程
    if (this._dotFunc) this._dotFunc(pt, dt);
  };

  Brush.prototype.draw= function(pt) {//中间过程
    var ctx = this.ctx;
    var record = this.record(pt) || {};
    if (record.drawBol) {
      this.check();//是否ctx的类型是正确的
      this._drawFunc({
       'pt': pt,
       'record': record,
       'ctx': ctx,
       'maxSize':this.maxSize,
       'self':this
     });
    }
  };


//////////////////////结束过程//////////////////////
  Brush.prototype.endFunc= function(cb) {//结束
    if (cb) this._endFunc = cb;
  };

  Brush.prototype.end= function() {//结束
    this.ctx.closePath();
    this.pt = null;
  };

  Brush.prototype.check = function(pt, record) {
    if (this.ctx.curStyle !== this.id) this.styles();
  };

  return Brush;
});
