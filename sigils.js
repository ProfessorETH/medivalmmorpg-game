"use strict";
const sigils={
 spark:{name:"Гром",hint:"Разряд на 3-й удар",color:"#97e2de"},
 spur:{name:"Шпора",hint:"Удар после рывка",color:"#ffd08a"}
};
function scatterSigils(b){
 if(b.offered)return;
 b.offered=true;
 const x=clamp(b.x,66,414),y=b.y<170?b.y+35:b.y-35;
 b.sigils=Object.keys(sigils).map((kind,i)=>({kind,x:x+(i?36:-36),y}));
}
function takeSigil(b,r){
 const s=b.sigils?.find(s=>Math.hypot(b.x-s.x,b.y-s.y)<12);
 if(!s)return;
 r.boons??={};r.boons[s.kind]=(r.boons[s.kind]||0)+1;b.sigils=[];
 $("flash").textContent=sigils[s.kind].name+" · "+sigils[s.kind].hint+" · ур. "+r.boons[s.kind];hud()
}
function drawSigils(b,t){
 for(const s of b.sigils||[]){
  const {color,name,hint}=sigils[s.kind];
  ctx.save();ctx.translate(s.x,s.y);
  oval("#101c2a",0,0,12,4);line(color,1,-8,0,8,0);
  ctx.translate(0,Math.sin(t*3)*1.5);
  glow(0,-10,21,color+"66");poly("#243142",0,-22,10,-12,0,-2,-10,-12);
  if(s.kind==="spark")poly(color,3,-21,-6,-10,-1,-10,-3,-4,6,-14,1,-14);
  else{poly(color,-7,-12,3,-19,1,-13,7,-14,-3,-5,-1,-11)}
  rect("#121e2bf0",-35,-44,70,19);ctx.textAlign="center";ctx.font="bold 8px sans-serif";ctx.fillStyle=color;ctx.fillText(name,0,-36);ctx.font="7px sans-serif";ctx.fillStyle="#f7ecdc";ctx.fillText(hint,0,-28);ctx.restore()
 }
}
function dash(){
 const b=combat;if(!b||hero.expedition.tier!==0||arrival||layoutDialog.open||(dialog.open&&screen!=="bag")||b.rest>0)return;
 const dx=stick.x+Number(keys.has("KeyD")||keys.has("ArrowRight"))-Number(keys.has("KeyA")||keys.has("ArrowLeft"));
 const dy=stick.y+Number(keys.has("KeyS")||keys.has("ArrowDown"))-Number(keys.has("KeyW")||keys.has("ArrowUp"));
 b.dashAngle=Math.hypot(dx,dy)>.1?Math.atan2(dy,dx):b.heading??0;
 b.burst=.17;b.rest=1.3;b.primed=!!hero.expedition.boons?.spur
}
function buildStrike(r,b){
 const boons=r.boons||{};
 r.strikes=(r.strikes||0)+1;
 const discharge=boons.spark&&r.strikes%3===0;
 const impact=b.primed?4*(boons.spur||0):0;b.primed=false;
 return {discharge,impact}
}
