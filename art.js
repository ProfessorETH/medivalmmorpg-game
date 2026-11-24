"use strict";
const stage=document.querySelector("#view"), ctx=stage.getContext("2d");
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
function sword(x,y,angle,short,enchanted){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);const n=short?22:36;
 poly(enchanted?"#8de6dd":"#e6e1ca",-2,0,-2,-n,1,-n-5,3,-n,3,0);
 poly("#859aa0",1,0,1,-n-4,3,-n,3,0);rect("#d2aa64",-6,0,13,2);rect("#6c4836",-1,2,4,7);oval("#debb73",1,10,2,2);ctx.restore()
}
function knightAt(x,y,s,weapon,t,walking=false,raised=false,armor=1,slash=0,seated=0){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval("#10212788",0,1,22,5);
 const step=walking?Math.sin(t*12)*3:0;ctx.translate(0,Math.sin(t*(walking?12:2))*(walking?1.2:.55));
 ctx.translate(0,seated*11);
 const metal=armor>1?"#aabcad":"#9aaeba";
 poly("#5b3036",-8,-48,-17,-43,-21,-16,-27,-5,-14,-8,-5,-4,5,-12,5,-44);
 poly("#a04942",-13,-42,-18,-15,-22,-8,-15,-11,-9,-39);
 for(const [xx,dy] of [[-7,step],[8,-step]]){ctx.save();ctx.translate(xx,dy);
 if(seated){
   const kneeX=-15*seated,kneeY=-14+3*seated;
   poly("#455865",-4,-25,4,-24,kneeX+4,kneeY+1,kneeX-4,kneeY-1);
   poly(metal,-3,-24,2,-23,kneeX+1,kneeY-2,kneeX-4,kneeY-3);
   ctx.translate(kneeX,-5*seated);ctx.rotate(.14*seated)
 }poly("#414f59",-5,-21,4,-21,5,-12,3,-3,-3,-3,-5,-12);poly(metal,-4,-16,1,-18,3,-13,0,-5,-4,-5);poly("#34404a",-4,-4,3,-5,7,-1,7,1,-6,1);ctx.restore()}
 poly("#405360",-12,-43,11,-45,15,-35,9,-21,0,-16,-10,-22);
 poly(metal,-10,-43,1,-46,12,-43,9,-32,0,-27,-9,-31);poly("#c6ceca",-7,-41,0,-43,7,-42,-1,-39,-8,-36);
 poly("#647b87",0,-28,10,-33,9,-24,1,-19,-9,-25,-9,-30);
 rect("#755441",-11,-25,22,3);rect("#d8ac62",-2,-25,5,3);
 poly("#8f3e3a",-6,-22,5,-22,6,-11,0,-8,-6,-12);
 for(const side of [-1,1]){ctx.save();ctx.scale(side,1);poly("#465965",9,-41,16,-42,21,-36,17,-31,10,-33);poly(metal,9,-41,15,-44,21,-39,20,-36,10,-36);poly("#657c87",15,-34,20,-35,20,-26,17,-23,14,-27);ctx.restore()}
 poly("#30424c",-10,-53,-7,-62,2,-65,10,-60,12,-50,7,-44,0,-41,-8,-45);
 poly("#bbc8c8",-9,-54,-6,-60,1,-63,7,-60,9,-55,1,-52);
 poly("#849da8",-9,-53,1,-52,10,-54,8,-47,1,-43,-7,-47);
 poly("#23313c",-8,-53,0,-52,10,-54,9,-51,1,-49,-7,-50);
 line("#c8b482",1.6,1,-51,1,-45);
 poly("#bb5147",-2,-63,0,-70,9,-75,17,-73,22,-67,14,-69,8,-67,4,-62);
 if(weapon.style==="twins")sword(-17,-25,-.8,true,weapon.bonus>2);
 else {poly("#7d633c",-20,-35,-10,-34,-11,-21,-17,-15,-23,-22,-25,-31);poly("#405664",-19,-32,-13,-32,-14,-23,-17,-19,-21,-24,-22,-30);line("#d6b77e",1.4,-18,-30,-17,-22)}
 sword(17,raised?-61:-26,raised?-.25:.65+slash+.65*seated,weapon.style==="twins",weapon.bonus>2);ctx.restore()
}
