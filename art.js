"use strict";
const stage=document.querySelector("#view");
let ctx=stage.getContext("2d");
function paintOn(canvas,draw){const original=ctx;ctx=canvas.getContext("2d");ctx.save();try{draw()}finally{ctx.restore();ctx=original}}
let width=0,height=0;
function resizeStage(){
 const box=stage.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
 width=box.width;height=box.height;stage.width=Math.round(width*dpr);stage.height=Math.round(height*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
}
new ResizeObserver(resizeStage).observe(stage);resizeStage();
function poly(color,...pts){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.closePath();ctx.fill()}
function oval(color,x,y,w,h){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,w,h,0,0,Math.PI*2);ctx.fill()}
function line(color,w,x,y,x2,y2){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()}
function rect(col,x,y,w,h){ctx.fillStyle=col;ctx.fillRect(x,y,w,h)}
function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"transparent");rect(g,x-r,y-r,r*2,r*2)}
function sword(x,y,angle,short,enchanted,model=""){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);const n=short?22:36;
 const heavy=model==="Тесаки ключника"||model==="Серебряный фальшион";
 const obsidian=model.startsWith("Обсидианов");
 if(heavy){
  poly("#d1c0a7",-3,0,-5,-n*.44,-7,-n*.74,4,-n-3,3,-n*.65,2,0);
  poly("#788188",-3,0,-5,-n*.44,-7,-n*.74,4,-n-3,-2,-n*.63,0,0)
 }else{
 poly(obsidian?"#a18db6":enchanted?"#a8d3ff":"#dddfe4",-2.8,0,-2.2,-n*.72,.5,-n-6,3.4,-n*.68,2.6,0);
 poly("#8b9aac",.5,-n-6,3.4,-n*.68,2.6,0,.5,-1);
 line("#f9edd8",.55,-2.5,-2,-2.1,-n*.7);
 }
 poly("#c59b67",-8,-2,-6,-1,0,-.5,6,-1,8,-3,7,1,2,2,-2,2,-7,1);
 rect("#563e40",-1.5,2,3.6,7);for(let i=0;i<3;i++)line("#af8d6c",.65,-1.3,3+i*2,1.8,4+i*2);
 poly("#cfb891",-2,10,.4,8,3,10,.5,13);ctx.restore()
}
