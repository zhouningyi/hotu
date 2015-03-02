'use strict';

// brush 初始设置为this.style() 绘制有3个过程 开始画线 画线和 结束
define(['./easing'], function(Easing) {

  var emptyFunc = function() {};

  function Brush(opt) {
    opt = opt || {};

    this.opt = opt;
    this.styles();
    this.Easing = Easing;
    this.maxDist = 80;
    this.smoothList = [];
  }


  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////记录分析///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  Brush.prototype.record = function(pt) { //判断是否记录点
    var maxDist = this.maxDist;
    var drawBol = true;
    var ptPrev = this.pt;
    var timePrev = this.time;

    var ptThis = pt;
    var timeThis = ptThis[2];

    if (ptPrev && timePrev) {
      var dx = pt[0] - ptPrev[0];
      var dy = pt[1] - ptPrev[1];
      var dist = Math.sqrt(dx * dx + dy * dy);
      var distPhi = dist/maxDist;
      distPhi = (distPhi<1)?distPhi:1;
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
          'ptPrev': ptPrev,
          'distPhi':distPhi
        };
      }
    } else {
      this.pt = ptThis;
      this.time = timeThis;
      return {
        'drawBol': false
      };
    }
  };

  Brush.prototype.smoothFunc = function(i, N){
    var easing = this.Easing.Back.In;
    return easing((i+1)/N) - easing(i/N);
  };

  Brush.prototype.getSmooth = function(num) {
    var smoothN = this.smoothN;
    var sList = this.smoothList;
    var sFunc = this.smoothFunc.bind(this);

    sList.push(num);
    if (sList.length > smoothN) {
      sList.splice(0, 1);
    }
    var ki, result = 0; // ki为权重
    var sListN = sList.length;
    for (var k = 0; k < sListN; k++) {
      var value = sList[k];
      ki = sFunc(k, sListN);
      result += ki * value;
    }
    return result;
  };

  Brush.prototype.styles = function(ctx) { //静态的设置
    var opt = this.opt;
    if (opt) {
      for (var name in opt) {
        this[name] = opt[name];
      }

      //绘图本身的设置
      this.hue = opt.hue || this.hue || 170;
      this.maxSize = opt.maxSize;
      this.distLimit = opt.distLimit || this.distLimit || 10;
      this.smoothN = opt.smoothN || this.smoothN || 6;
      //画布相关的设置
      if (ctx) {
        ctx.globalCompositeOperation = opt.globalCompositeOperation || this.globalCompositeOperation || 'source-over';
        ctx.lineCap = opt.lineCap || this.lineCap || 'round';
        ctx.lineJoin = opt.lineJoin || this.lineJoin || 'round';
        ctx.strokeStyle = opt.strokeStyle || this.strokeStyle || '#000';
        ctx.fillStyle = opt.fillStyle || this.fillStyle || '#fff';
        ctx.lineWidth = opt.lineWidth || this.lineWidth || 1;
        //名字
        ctx.curStyle = this.id = opt.id;
      }
    }
  };

  //////////////////////开始画线//////////////////////

  Brush.prototype.begin = function(ctx, pt) {
    this.check(ctx); //是否ctx的类型是正确的
    ctx.moveTo(pt[0], pt[1]);
    this.record(pt);
    this.smoothList = [];
  };

  //////////////////////中间过程//////////////////////

  Brush.prototype.dotFunc = emptyFunc;
  Brush.prototype.drawFunc = emptyFunc;
  Brush.prototype.buttonStyleFunc = emptyFunc;
  Brush.prototype.endFunc = emptyFunc;


  Brush.prototype.dot = function(ctx, pt, dt) { //中间过程
    this.dotFunc(ctx, pt, dt);
  };

  Brush.prototype.buttonStyle = function(node) { //中间过程
    try {
      node.removeStyle('box-shadow').removeStyle('text-shadow').removeStyle('border');
    } catch (e) {}
    this.buttonStyleFunc(node);
  };

  Brush.prototype.draw = function(ctx, pt) { //中间过程
    var record = this.record(pt) || {};
    if (record.drawBol) {
      this.drawFunc({
        'pt': pt,
        'record': record,
        'ctx': ctx,
        'maxSize': this.maxSize,
        'self': this
      });
    }
  };

  //////////////////////结束过程//////////////////////

  Brush.prototype.end = function(ctx) { //结束
    this.endFunc();
    ctx.closePath();
    this.pt = null;
  };

  Brush.prototype.check = function(ctx) {
    if (ctx.curStyle !== this.id) this.styles(ctx);
  };

  return Brush;
});
