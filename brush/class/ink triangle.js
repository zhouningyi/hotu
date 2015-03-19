'use strict';

//ink 毛笔的效果
define(function() {

  function generateSprite(){//根据ai+drawscript得到笔触
    var width = 50;
    var height = 100;
    var canvas = $('<canvas width="'+width+'px" height="'+height+'px"></canvas>')[0];
    var ctx = canvas.getContext('2d');
    // ctx.fillStyle='#900';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#000';
    // ctx.fillRect(0,0,width,height);
    ctx.fillStyle='rgba(0,0,0,0.8)';
    ctx.translate(width/2,height/2);
    ctx.beginPath();
    ctx.moveTo(-2,-48);
    ctx.bezierCurveTo(-2,-48,-9,-29,-15,-12);
    ctx.bezierCurveTo(-20,4,-24,16,-22,29);
    ctx.bezierCurveTo(-19,42,-20,40,-11,45);
    ctx.bezierCurveTo(-5,50,9,41,15,37);
    ctx.bezierCurveTo(25,31,24,12,18,-4);
    ctx.bezierCurveTo(10,-28,4,-43,1,-46);
    ctx.bezierCurveTo(0,-49,-2,-48,-2,-48);
    ctx.fill();
    return canvas;
  }
  function drawSprite(ctx, sprite, x, y, scale, phi) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-phi);
    var wPhi = sprite.width / sprite.height;
    ctx.drawImage(sprite, -scale, -scale, 2 * scale * wPhi, 2 * scale);
    ctx.restore();
  }
  function limit(d, limi){
    return Math.floor(d/limi)*limi;
  }
  return {
    desc: '墨水画笔',
    name: '书法',
    initOpt: {
      'id': 'ink',
      'globalCompositeOperation': 'source-over',
      'lineCap': 'round',
      'lineJoin': 'miter',
      'distLimit': 10,
      'sprite':generateSprite(),
      'smoothN':6
    },

    draw: function(opt) {
      var Easing = this.Easing;
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = opt.ctx;
      var dist = record.dist || 3;
      var distPhi = record.distPhi||0.1;
      var ptPrev = record.ptPrev;
      var speed = record.speed || 3; //速度

      // var speedPhi = Math.log(speed)/ Math.log(5000);
      var speedPhi = speed/5000;
      speedPhi = (speedPhi<1)?speedPhi:1;
      var ki = Easing.Sinusoidal.In(1-speedPhi);
      ki = Math.pow(ki,3);
      var kFinal = this.getSmooth(ki);
      kFinal = (kFinal<0)?0:kFinal;

      var widthMax = 20;
      var width = widthMax * kFinal;
      var widthPrev = this.widthPrev || width;
      var directPhiPrev = this.directPhiPrev || directPhi;

      var x = pt[0];
      var y = pt[1];
      var xp = ptPrev[0];
      var yp = ptPrev[1];
      var dx = x-xp;
      var dy = y-yp;
      var phi = Math.PI/4;
      var l = Math.sqrt(dy*dy + dx*dx);
      var cos = Math.cos(phi);
      var sin = Math.sin(phi);

      var directPhi = Math.atan(dy/dx);

      var p1x = xp + widthPrev;
      var p1y = yp + widthPrev;
      var p2x = xp - widthPrev;
      var p2y = yp - widthPrev;
      var p3x = x - width;
      var p3y = y - width;
      var p4x = x + width;
      var p4y = y + width;
//var  ctx = $('canvas')[0].getContext('2d')
      var sprite = this.sprite;
      // ctx.drawImage(this.sprite,xp-widthPrev,yp-widthPrev,2*widthPrev,2*widthPrev);
      var k = Math.floor(Math.random()*50);
      ctx.fillStyle = 'hsla(180,'+(80-k+'%')+','+(20+k+'%')+',1)';
      ctx.beginPath();
      ctx.moveTo(p1x,p1y);
      ctx.lineTo(p2x,p2y);
      ctx.lineTo(p3x,p3y);
      ctx.lineTo(p1x,p1y);
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      k = Math.floor(Math.random()*10);
      // ctx.fillStyle = 'rgb(200,100,100)';
      ctx.fillStyle = 'hsla(180,'+(80-k+'%')+','+(10+k+'%')+',1)';
      ctx.moveTo(p3x,p3y);
      ctx.lineTo(p4x,p4y);
      ctx.lineTo(p1x,p1y);
      ctx.lineTo(p3x,p3y);
      ctx.fill();
      ctx.closePath();

      var n = Math.floor(l/5)+1;
      for(var k = 0; k<n; k++){
        var kii = k/n;
        var kk = 1-kii;
        var xi = xp*kii + x*kk;
        var yi = yp*kii + y*kk;
        var widthi = widthPrev*kii + width*kk;
        // drawSprite(ctx, sprite, xi, yi, widthi, phi);
      }

      this.widthPrev  =  width;
      this.directPhiPrev = directPhi;
    },
    end:function(){
      this.widthPrev = null;
      this.directPhiPrev = null;
    },
    buttonStyle: function(node){
      node.css({
        'textShadow': '0 0 1px #000',
        'color': '#000'
      });
    }
  };
});
