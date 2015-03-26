'use strict';

//ink 毛笔的效果
define(['zepto'],function($) {
  function generateSprite(){//根据ai+drawscript得到笔触
    var width = 50;
    var height = 100;
    var canvas = $('<canvas width="'+width+'px" height="'+height+'px"></canvas>')[0];
    var ctx = canvas.getContext('2d');
    // ctx.fillStyle='#900';
    // ctx.shadowBlur = 30;
    ctx.shadowColor = '#000';
    // ctx.fillRect(0,0,width,height);
    ctx.fillStyle='rgba(0,0,0,1)';
    ctx.translate(width/2,height/2);
    ctx.beginPath();
    ctx.moveTo(-2,-48);
    ctx.bezierCurveTo(-4,-47,-12,-26,-15,-11);
    ctx.bezierCurveTo(-19,5,-25,17,-22,30);
    ctx.bezierCurveTo(-20,43,-20,41,-12,46);
    ctx.bezierCurveTo(-5,50,8,42,15,38);
    ctx.bezierCurveTo(25,32,24,12,19,-5);
    ctx.bezierCurveTo(12,-28,9,-42,7,-46);
    ctx.bezierCurveTo(4,-49,-4,-47,-4,-47);

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
    initOpt: {
      'color':'#000',
      'desc': '墨水画笔',
      'name': '书法',
      'id': 'ink',
      'globalCompositeOperation': 'source-over',
      'lineCap': 'round',
      'lineJoin': 'miter',
      'distLimit': 2,
      'sprite':generateSprite(),
      'smooth':{
        'x':{
          'N':12
        },
        'y':{
          // 'f':'Sinusoidal.In',
          'N':12
        },
        'width':{
          'N':30
        }
      }
    },
    draw: function(opt) {
      var color = this.color;
      var Easing = this.Easing;
      var record = opt.record || {};
      var pt = opt.pt || {};
      var ctx = opt.ctx;
      var dist = record.dist || 3;
      var distPhi = record.distPhi||0.1;
      var speed = record.speed || 3; //速度

      // var speedPhi = Math.log(speed)/ Math.log(5000);
      var speedPhi = speed/5000;
      speedPhi = (speedPhi<1)?speedPhi:1;
      var ki = Easing.Sinusoidal.In(1-speedPhi);
      ki = Math.pow(ki,5);
      var kFinal = this.getSmooth('width',ki);
      kFinal = (kFinal<0)?0:kFinal;

      var widthMax = 5;
      var width = widthMax * kFinal;
      var widthPrev = this.widthPrev || width;

      var x = pt[0];
      x = this.getSmooth('x',x);
      var y = pt[1];
      y = this.getSmooth('y',y);

      var xp = this.xp || x;
      var yp = this.yp||y;
      var dx = x-xp;
      var dy = y-yp;
      var phi = Math.PI/4;
      var l = Math.sqrt(dy*dy + dx*dx);
      var cos = Math.cos(phi);
      var sin = Math.sin(phi);

      // var directPhi = Math.atan(dy/dx);

      var p1x = xp + widthPrev*cos;
      var p1y = yp + widthPrev*sin;
      var p2x = xp - widthPrev*cos;
      var p2y = yp - widthPrev*sin;
      var p3x = x - width*cos;
      var p3y = y - width*sin;
      var p4x = x + width*cos;
      var p4y = y + width*sin;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(p1x,p1y);
      ctx.lineTo(p2x,p2y);
      ctx.lineTo(p3x,p3y);
      ctx.lineTo(p4x,p4y);
      ctx.lineTo(p1x,p1y);
      ctx.fill();
      ctx.closePath();
      //var  ctx = $('canvas')[0].getContext('2d')
      var sprite = this.sprite;
      // drawSprite(ctx, sprite, xp, yp, widthPrev, phi);
      // ctx.drawImage(this.sprite,xp-widthPrev,yp-widthPrev,2*widthPrev,2*widthPrev);

      var n = Math.floor(l/5)+1;
      var kkPrev,xiPrev,yiPrev,widthiPrev;
      for(var k = 0; k<n; k++){
        var kii = k/n;
        var kk = 1-kii;
        var xi = xp*kii + x*kk;
        var yi = yp*kii + y*kk;
        var widthi = widthPrev*kii + width*kk;
        // drawSprite(ctx, sprite, xi, yi, widthi, phi);
        // if(k>0){
        //   var xFrom1 =
        // }
        kkPrev = kk;
        xiPrev = xi;
        yiPrev = yi;
        widthiPrev = width;
      }

      this.widthPrev  =  width;
      this.yp = y;
      this.xp = x;
    },
    end:function(){
      this.widthPrev = null;
      this.yp = null;
      this.xp = null;
    },
    buttonStyle: function(node){
      node.css({
        'textShadow': '0 0 1px #000',
        'color': '#000'
      });
    }
  };
});
