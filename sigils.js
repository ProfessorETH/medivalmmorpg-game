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
 soundscape.play("reward");r.boons??={};r.boons[s.kind]=(r.boons[s.kind]||0)+1;b.sigils=[];
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
  rect("#121e2bf0",-35,-44,70,19);ctx.textAlign="center";ctx.font="bold 8px sans-serif";ctx.fillStyle=color;ctx.fillText(name,0,-36);ctx.font="7px sans-serif";ctx.fillStyle="#f7ecdc";ctx.fillText(s.kind==="spark"&&weapon().style==="twins"?"Цепь на 3-й удар":s.kind==="spur"&&weapon().style!=="twins"?"Взмах после рывка":hint,0,-28);ctx.restore()
 }
}
function dash(){
 const b=combat;if(!b||arrival||layoutDialog.open||(dialog.open&&screen!=="bag")||b.rest>0)return;
 const dx=stick.x+Number(keys.has("KeyD")||keys.has("ArrowRight"))-Number(keys.has("KeyA")||keys.has("ArrowLeft"));
 const dy=stick.y+Number(keys.has("KeyS")||keys.has("ArrowDown"))-Number(keys.has("KeyW")||keys.has("ArrowUp"));
 b.dashAngle=Math.hypot(dx,dy)>.1?Math.atan2(dy,dx):b.heading??0;
 soundscape.play("dash");b.burst=.17;b.rest=1.3;b.primed=!!hero.expedition.boons?.spur
}
function buildStrike(r,b){
 const boons=r.boons||{};
 r.strikes=(r.strikes||0)+1;
 const discharge=boons.spark&&r.strikes%3===0;
 const impact=b.primed?4*(boons.spur||0):0;b.primed=false;
 return {discharge,impact}
}

const sweepRadius=74, sweepHalfAngle=Math.PI*.49;
function inSwordSweep(origin,m,angle){
 const dx=m.x-origin.x,dy=m.y-origin.y,d=Math.hypot(dx,dy);
 return d<=sweepRadius&&(d===0||(dx*Math.cos(angle)+dy*Math.sin(angle))/d>=Math.cos(sweepHalfAngle))
}
function lightningTargets(first,mobs){
 const path=[first];
 while(path.length<4){
   const from=path.at(-1);
   let next=null,distance=69;
   for(const m of mobs){
     if(path.includes(m))continue;
     const d=Math.hypot(m.x-from.x,m.y-from.y);
     if(d<=68&&d<distance){next=m;distance=d}
   }
   if(!next)break;
   path.push(next)
 }
 return path
}
function drawBuildAttack(b){
 const fx=b.buildFx;if(!fx)return;
 const age=b.time-fx.start;
 ctx.save();ctx.lineJoin="round";ctx.lineCap="round";
 if(fx.path){
   for(let i=1;i<fx.path.length;i++){
     const elapsed=age-(i-1)*.055;
     if(elapsed<0||elapsed>.27)continue;
     const a=fx.path[i-1],z=fx.path[i],dx=z.x-a.x,dy=z.y-a.y,d=Math.hypot(dx,dy)||1;
     ctx.globalAlpha=Math.min(1,(.27-elapsed)*8);
     ctx.beginPath();ctx.moveTo(a.x,a.y);
     for(let j=1;j<=6;j++){
       const f=j/6,offset=j===6?0:Math.sin(i*23+j*9)*Math.min(6,d*.2);
       ctx.lineTo(a.x+dx*f-dy/d*offset,a.y+dy*f+dx/d*offset)
     }
     ctx.lineWidth=4;ctx.strokeStyle="#49b4c8";ctx.stroke();
     ctx.lineWidth=1.4;ctx.strokeStyle="#eeffff";ctx.stroke();
     glow(z.x,z.y,10,"#97ffffcc")
   }
 }else if(age<.36){
   const f=Math.min(1,age/.18),lo=fx.angle-sweepHalfAngle,hi=lo+2*sweepHalfAngle*f;
   ctx.translate(fx.x,fx.y);
   ctx.globalAlpha=Math.min(1,(.36-age)*6);
   ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,sweepRadius,lo,hi);ctx.closePath();ctx.fillStyle="#dfa54844";ctx.fill();
   ctx.beginPath();ctx.arc(0,0,sweepRadius-1,lo,hi);ctx.strokeStyle="#ffe6a7";ctx.lineWidth=3;ctx.stroke();
   line("#fff3bd",2,10*Math.cos(hi),10*Math.sin(hi),sweepRadius*Math.cos(hi),sweepRadius*Math.sin(hi))
 }
 ctx.restore()
}
