'use strict';

// brush 初始设置为this.style() 绘制有3个过程 开始画线 画线和 结束
define( [ './easing' ], function( Easing ) {

  var emptyFunc = function() {};

  function Brush( opt ) {
    this.opt = opt || {};
    this.Easing = Easing;

    this.smoothNames = [];
    this.styles(opt);

    this.maxDist = 80;
    this.smoothList = [];
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////记录分析/////////////////////////////////////////////
  ////////////////////////////////////////////// /////// ////////////////////////////////////////////
  Brush.prototype.record = function( pt ) { //判断是否记录点
    var maxDist = this.maxDist;
    var drawBol = true;
    var ptPrev = this.pt;
    var timePrev = this.time;

    var ptThis = pt;
    var timeThis = ptThis[ 2 ];

    if ( ptPrev && timePrev ) {
      var dx = pt[ 0 ] - ptPrev[ 0 ];
      var dy = pt[ 1 ] - ptPrev[ 1 ];
      var dist = Math.sqrt( dx * dx + dy * dy );
      var distPhi = dist / maxDist;
      distPhi = ( distPhi < 1 ) ? distPhi : 1;
      if ( dist < this.distLimit ) {
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
          'distPhi': distPhi
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

  Brush.prototype.styles = function( opt, ctx ) { //静态的设置
    ctx = this.ctx = ctx || this.ctx;
    opt = this.opt = opt || this.opt;
    this.setOptions( opt, ctx );
    //平滑的设置
    if ( opt.smooth ) {
      var smoothList = opt.smooth;
      var smooth;
      for ( var key in smoothList ) {
        smooth = smoothList[ key ];
        this.initSmooth( key, smooth.N, smooth.f );
      }
    }
    //如果样式发生变化 导致一些变化 如改sprite的颜色
    if(this.onStyleChange) this.onStyleChange(opt);
  };


  Brush.prototype.setOptions = function( op, ctx ) {
    var ctxOpts = {
      'lineCap': 1,
      'globalCompositeOperation': 1,
      'lineJoin': 1,
      'strokeStyle': 1,
      'fillStyle': 1,
      'lineWidth': 1,
      'curStyle': 1
    };
    var value;

    var opt = this.opt;

    for ( var key in opt ) {
      value = opt[ key ] = this[ key ] = ( op[ key ] === undefined || op[ key ] === null ) ? this[ key ] : op[ key ];
      if ( ctx ) {
        if ( key in ctxOpts ) {
          ctx[ key ] = value;
        }
      }
    }
  };

  /**
   * [initSmooth description]
   * @param  {String} variableName [进行smooth的变量]
   * @param  {Int} N               [进行smooth的数量]
   * @param  {String} type         [easing的方式]
   */
  Brush.prototype.initSmooth = function( variableName, N, type ) { //type:back.inout
    type = type || 'Sinusoidal.In';
    this[ 'smoothN' + variableName ] = N;
    this[ 'smoothList' + variableName ] = [];
    this.smoothNames.push( variableName );
    var typeNames = type.split( '.' );
    var easing = this.Easing[ typeNames[ 0 ] ][ typeNames[ 1 ] ];
    var smoothMap = this[ 'smoothMap' + variableName ] = [];
    for ( var k = 0; k < N; k++ ) {
      smoothMap[ k ] = easing( ( k + 1 ) / N ) - easing( k / N );
    }
    this[ 'smoothFunc' + variableName ] = function( k, N ) {
      return easing( ( k + 1 ) / N ) - easing( k / N );
    };
  };

  Brush.prototype.getSmooth = function( variableName, num ) { //如果sList的点不足 采用函数处理 点到了阈值 用储存好的list
    var smoothN = this[ 'smoothN' + variableName ];
    var sList = this[ 'smoothList' + variableName ];
    var smoothMap = this[ 'smoothMap' + variableName ];
    var sFunc = this[ 'smoothFunc' + variableName ];
    if ( smoothMap ) {
      sList.push( num );
      if ( sList.length > smoothN ) {
        sList.splice( 0, 1 );
        sFunc = function( k ) {
          return smoothMap[ k ];
        };
      }
      var ki, result = 0; // ki为权重
      var sListN = sList.length;
      for ( var k = 0; k < sListN; k++ ) {
        var value = sList[ k ];
        ki = sFunc( k, sListN );
        result += ki * value;
      }
      return result;
    } else {
      console.log( '该变量没加入smooth列表' );
      return null;
    }
  };


  //////////////////////开始画线//////////////////////
  Brush.prototype.begin = function(ctx, pt ) {
    this.ctx = ctx;
    this.check( ctx ); //是否ctx的类型是正确的
    this.record( pt );
    this.smoothList = [];
    this.smoothListX = [];
    this.smoothListY = [];
    this.beginFunc();
  };

  //////////////////////中间过程//////////////////////

  Brush.prototype.dotFunc = emptyFunc;
  Brush.prototype.drawFunc = emptyFunc;
  Brush.prototype.buttonStyleFunc = emptyFunc;
  Brush.prototype.endFunc = emptyFunc;
  Brush.prototype.beginFunc = emptyFunc;


  Brush.prototype.dot = function( ctx, pt, dt ) { //中间过程
    this.ctx = ctx;
    this.dotFunc( ctx, pt, dt );
  };

  Brush.prototype.buttonStyle = function( node ) { //中间过程
    try {
      node.removeStyle( 'box-shadow' ).removeStyle( 'text-shadow' ).removeStyle( 'border' );
    } catch ( e ) {}
    this.buttonStyleFunc( node );
  };

  Brush.prototype.draw = function( ctx, pt ) { //中间过程
    ctx.save();
    var record = this.record( pt ) || {};
    if ( record.drawBol ) {
      this.drawFunc( {
        'pt': pt,
        'record': record,
        'ctx': ctx,
        'maxSize': this.maxSize,
        'self': this
      } );
    }
    ctx.restore();
  };

  //////////////////////结束过程//////////////////////
  Brush.prototype.end = function( ctx ) { //结束
    ctx = ctx || this.ctx;
    this.endFunc();
    this.widthPrev = null;
    this.pt = null;
    ctx.closePath();
    ctx.fillStyle = null;
    ctx.strokeStyle = null;
    var smoothNames = this.smoothNames;
    for ( var i in smoothNames ) {
      var name = smoothNames[ i ];
      this[ 'smoothList' + name ] = [];
    }
  };

  Brush.prototype.check = function( ctx ) {
    if ( ctx.curStyle === undefined || ctx.curStyle === null || ctx.curStyle !== this.id ) {
      this.styles();
      ctx.curStyle = this.id;
    }
  };

  Brush.prototype.change = function( obj ) {};
  return Brush;
} );
