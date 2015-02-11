'use strict';

/**
 *   Painter.prototype.drawLight1 = function(pt) {
    var lineWidth = 5;
    var ctx = this.ctx;
    ctx.lineJoin = 'miter';
    ctx.lineCap = 'round';

    ctx.lineWidth = Math.floor(lineWidth + lineWidth * 2 * Math.random());
    ctx.lineTo(pt[0], pt[1]);
    ctx.stroke();
    // ctx.beginPath();
    ctx.moveTo(pt[0], pt[1]);
  };
 */

var brushes = {
  'ink': {
    desc:'墨水画笔',
    opt: {
      'id': 'ink',
      'globalCompositeOperation': 'source-over',
      'lineCap': 'round',
      'lineJoin': 'round',
      'distLimit':4,
    },
    draw: function(opt) {
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = this.ctx;
      var dist = record.dist || 3;
      var speed = record.speed || 3; //速度
      var lineWidthMax = 15;
      var lineWidth = Math.min(lineWidthMax / (dist * dist * 0.02 + 0.5), 3 * lineWidthMax);
      lineWidth = lineWidth * 0.9;
      lineWidth = lineWidth + lineWidthMax * 0.5 * Math.random();

      for (var i = 0; i < 2; i++) {
        var ki = 1 / (i + 1);
        ctx.strokeStyle = 'rgba(' + 0 + ',' + 0 + ',' + 0 + ',' + 1 + ')';
        ctx.lineWidth = lineWidth * ki;
        ctx.lineTo(pt[0], pt[1]);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(pt[0], pt[1]);
    }
  },
  //发光笔触
  'light': {
    opt: {
      'id': 'light',
      'globalCompositeOperation': 'lighter',
      'strokeStyle': 'rgba(0,0,0,1)', // ;
      'lineJoin': 'miter',
      'lineCap': 'round',
      'lineWidth':1,
      'maxSize':5,
    },
    draw: function(opt) {
      var self = opt.self;
      var maxSize = self.maxSize;
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = opt.ctx;
      ctx.lineWidth = Math.floor(maxSize);
      ctx.lineTo(pt[0], pt[1]);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.moveTo(pt[0], pt[1]);
    }
  },
  'thin': {
    desc:'瘦的线条，连续 柔化',
    opt: {
      'id': 'light',
      'globalCompositeOperation': 'lighter',
      'strokeStyle': 'rgba(0,0,0,1)', // ;
      'lineJoin': 'miter',
      'lineCap': 'round',
      'lineWidth':1,
      'maxSize':1,
    },
    draw: function(opt) {
      var self = opt.self;
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = opt.ctx;
      ctx.lineWidth = self.maxSize;
      ctx.lineTo(pt[0], pt[1]);
      ctx.stroke();
    }
  },
  'fatdot': {
    desc:'可爱 画点笔触',
    opt: {
      'id': 'fatdot',
      // 'fillStyle': 'rgba(55,155,155,0.1)',
      'lineWidth': 1,
      'strokeStyle':'#000',
      'globalCompositeOperation': 'source-over',
      'distLimit':1,
      'maxSize': 8,
    },
    dot:function(pt, dt){
      if(pt && dt){
        var ctx = this.ctx;
        ctx.closePath();
        ctx.beginPath();
        var x = pt[0];
        var y = pt[1];
        var r = dt*10;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    },
    draw: function(opt) {
      var record = opt.record || {};
      var pt = opt.pt;
      var ptPrev = record.ptPrev;
      var self = opt.self;
      var x1,x2,y1,y2;
      if (pt && ptPrev) {
        var dist = record.dist*0.6 || 0.1;
        var r = (this.r || 1) * dist / 2;
        var maxSize = self.maxSize;
        if( maxSize) r = (r> maxSize)?maxSize:r;
        var ctx = opt.ctx;
        ctx.closePath();
        x1 = pt[0]*0.5+ptPrev[0]*0.5;
        y1 = pt[1]*0.5+ptPrev[1]*0.5;
        ctx.beginPath();
        ctx.arc(x1, y1, r*4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }
};

define(['./brush'], function(Brush) {
  function Brushes(ctx) {
    this.ctx = ctx;
    return this.creates(brushes);
  }

  Brushes.prototype.create = function(cfg, result) {
    var opt = cfg.opt || {};
    var id = opt.id;
    var brush = new Brush(this.ctx, opt);
    brush.drawFunc(cfg.draw);
    brush.dotFunc(cfg.dot);
    result[id] = brush;
  };

  Brushes.prototype.creates = function(cfgs) {
    var result = this.result = {};
    cfgs = cfgs || brushes;
    for (var id in cfgs) {
      var cfg = cfgs[id];
      this.create(cfg, result);
    }
    return result;
  };

  return Brushes;
});
