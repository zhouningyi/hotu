  //   Painter.prototype.grid = function () { //米字格
  //   var containerW = this.containerW;
  //   var containerH = this.containerH;
  //   var phi = 0.12;
  //   var offset = containerW * phi;
  //   var p1 = [offset, offset];
  //   var p2 = [containerW - offset, offset];
  //   var p3 = [containerW - offset, containerH - offset];
  //   var p4 = [offset, containerH - offset];

  //   var p12 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  //   var p23 = [(p2[0] + p3[0]) / 2, (p2[1] + p3[1]) / 2];
  //   var p34 = [(p3[0] + p4[0]) / 2, (p3[1] + p4[1]) / 2];
  //   var p41 = [(p4[0] + p1[0]) / 2, (p4[1] + p1[1]) / 2];

  //   var ctx = this.ctxMainBack;
  //   ctx.strokeStyle = '#f00';
  //   ctx.lineWidth = 3;
  //   ctx.beginPath();
  //   ctx.moveTo(p1[0], p1[1]);
  //   ctx.lineTo(p2[0], p2[1]);
  //   ctx.lineTo(p3[0], p3[1]);
  //   ctx.lineTo(p4[0], p4[1]);
  //   ctx.lineTo(p1[0], p1[1]);
  //   ctx.stroke();
  //   //+线
  //   ctx.strokeStyle = 'rgba(200,0,0,0.5)';
  //   ctx.lineWidth = 2;
  //   ctx.moveTo(p12[0], p12[1]);
  //   ctx.lineTo(p34[0], p34[1]);
  //   ctx.moveTo(p23[0], p23[1]);
  //   ctx.lineTo(p41[0], p41[1]);
  //   ctx.stroke();
  //   //斜线
  //   ctx.strokeStyle = 'rgba(200,0,0,0.3)';
  //   ctx.lineWidth = 1;
  //   ctx.beginPath();
  //   ctx.moveTo(p1[0], p1[1]);
  //   ctx.lineTo(p3[0], p3[1]);
  //   ctx.moveTo(p2[0], p2[1]);
  //   ctx.lineTo(p4[0], p4[1]);
  //   ctx.stroke();
  //   ctx.closePath();
  // };