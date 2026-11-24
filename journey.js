"use strict";
const journeyPhase=(p,start,end)=>Math.max(0,Math.min(1,(p-start)/(end-start)));
const between=(a,b,p)=>a+(b-a)*p;
const hullArt=new Image();hullArt.src="ferry-rowboat.webp";
function waterArc(x,y,rx,ry,alpha){
 ctx.strokeStyle="rgba(232,240,217,"+alpha+")";ctx.lineWidth=.72;
 ctx.beginPath();ctx.ellipse(x,y,rx,ry,-.10,.12,Math.PI*1.72);ctx.stroke()
}
function ferryOar(side,phase,active){
 const reach=active?Math.cos(phase):.72, lift=active?Math.max(0,Math.sin(phase))*4:1;
 const pivotX=side>0?-5:1,pivotY=side>0?-2:-12;
 const dx=-8+reach*16,dy=side*15-lift;
 const x=pivotX+dx,y=pivotY+dy;
 line("#483c30",2.1,pivotX-dx*.45,pivotY-dy*.45,x,y);
 line("#c0a77b",1,pivotX-dx*.45,pivotY-dy*.45,x,y);
 ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));
 poly("#63513c",-2,-.7,2,-2,9,-1.8,11,.3,8,1.7,1,1.5);line("#c3a67b",.7,1,0,9,0);ctx.restore();
 if(active&&Math.sin(phase)<-.1)waterArc(x+dx*.16,y+dy*.16,4+3*-Math.sin(phase),1.7,.65);
 return {x:pivotX-dx*.45,y:pivotY-dy*.45}
}
function drawSkiff(x,y,s,t,rowing,rider,reverse=false,moored=false){
 const wave=reducedMotion.matches?0:Math.sin(t*2.45),phase=t*4.7;
 if(rowing&&Math.sin(phase)<-.75)soundscape.play("oar",1);
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 if(reverse)ctx.scale(-1,1);
 oval("#4b615933",0,4,40,4);
 if(rowing)for(let i=0;i<4;i++){
   const u=(t*.55+i/4)%1;
   waterArc(-30-u*48,6+u*11,9+u*18,2+u*4,.58*(1-u))
 }
 ctx.translate(0,wave*.65+(rider?1.4:0));ctx.rotate(wave*(rowing?.015:.008));
 if(rowing)ferryOar(-1,phase,true);
 if(hullArt.naturalWidth)ctx.drawImage(hullArt,-48,-27,96,38);
 if(rider){
   ctx.save();ctx.translate(-6,-2);ctx.rotate(Math.sin(phase)*.07);
   knightAt(0,0,.56,weapon(),t,false,false,armor().bonus,0,1);ctx.restore();
   ctx.save();ctx.beginPath();ctx.moveTo(-48,1);ctx.quadraticCurveTo(8,4,48,-25);ctx.lineTo(48,14);ctx.lineTo(-48,14);ctx.clip();
   if(hullArt.naturalWidth)ctx.drawImage(hullArt,-48,-27,96,38);ctx.restore();
   const grip=ferryOar(1,phase,true);
   line("#666c69",2.8,-7,-16,grip.x,grip.y);oval("#997f66",grip.x,grip.y,1.5,1.2)
 }
 if(moored){
   ctx.beginPath();ctx.moveTo(33,-15);ctx.quadraticCurveTo(39,3-wave,49,14-wave);ctx.strokeStyle="#665542";ctx.lineWidth=1.3;ctx.stroke();
   rect("#695e4b",47,10-wave,4,7);oval("#a99a7e",49,10-wave,2.4,.95)
 }
 ctx.restore()
}
function mooring(w,h){
 const portrait=w/h<.87;
 const dh=Math.max(h,w/(portrait?1120/1920:5504/3072));
 return {x:w*.34,y:h*.5+((portrait?.674:.745)-.5)*dh}
}
function boatPass(t,hero,p,reverse=false){
 const w=width,h=height,s=Math.min(w/190,h/270),gate=gatePosition(w,h);
 const dock=mooring(w,h);
 const far={x:w*gate.x-4*s,y:h*gate.y+8*s};
 const sail=journeyPhase(p,.34,.82),ease=sail*sail*(3-2*sail);
 const bx=between(dock.x,far.x,ease)-Math.sin(Math.PI*ease)*w*.045,by=between(dock.y,far.y,ease);
 const bs=s*between(.82,.21,ease);
 const aboard=p>=.34&&p<=.82;
 drawSkiff(bx,by,bs,t,aboard,aboard,reverse,p<.24);
 if(aboard)return;
 let x,y,size,seat;
 if(p<.34){
   const step=journeyPhase(p,.09,.34),jump=journeyPhase(p,.24,.34);
   const origin=travel?.to==="castle"?travel.origin:null;
   x=between(w*(origin?.x??.53),dock.x,step);y=between(h*(origin?.y??.91),dock.y-3*bs,step)-Math.sin(Math.PI*jump)*10*s;
   size=s*between(1,.82*.63,step);seat=(origin?0:1-journeyPhase(p,0,.09))+jump
 }else{
   const step=journeyPhase(p,.82,1);
   x=between(far.x,w*gate.x,step);y=between(far.y,h*gate.y,step)-Math.sin(Math.PI*step)*s;
   size=s*between(.21*.63,.095,step);seat=1-journeyPhase(step,0,.25)
 }
 knightAt(x,y,size,weapon(),t,seat<.5,false,armor().bonus,0,seat)
}
function courtyardCamp(t,p,throughPortal=false,smithStep=0,stairs=false){
 // p follows the knight from the entrance (0) to the lit camp (1).
 const w=width,h=height,s=Math.min(w/205,h/275);
 arrivalArt(t);
 const fx=w*.47-27*s,fy=h*.82;
 const behind=!travel&&walker&&walker.y<.835;
 if(behind)drawWalker(t,s);
 const lit=journeyPhase(p,.66,.88);
 oval("#3b2b27",fx,fy,14*s,4*s);
 for(let i=0;i<3;i++)line("#5f422f",2*s,fx-(9-i)*s,fy-i*s,fx+(8-i)*s,fy+s);
 if(lit){
   glow(fx,fy-4,37*s*lit,"#ffb66766");
   if(campFire.naturalWidth)ctx.drawImage(campFire,fx-15*s,fy-(28+Math.sin(t*6))*s*lit,30*s,(29+Math.sin(t*6))*s*lit);
   for(let i=0;i<5;i++){const u=(t*.52+i/5)%1;oval("#efbd7d",fx+s*(3*Math.sin(u*4+i)+u*4),fy-s*(12+18*u)*lit,s*.45,s*.55)}
 }
 if(campSeat.naturalWidth)ctx.drawImage(campSeat,w*.5-22*s,h*.85-21*s,56*s,21*s);
 const walk=journeyPhase(p,0,.57),settle=journeyPhase(p,.78,1);
 const tall=w/h<.95;
 const startX=throughPortal ? .86 : stairs ? .77 : .51;
 const startY=throughPortal ? .88 : tall && !stairs ? .65 : .70;
 if(hero.level>=10)ferryThreshold(w*.86,h*.88,s*.52,t,throughPortal?1-p:0);
 const kindle=Math.sin(Math.PI*journeyPhase(p,.54,.84));
 if(behind||(!travel&&drawWalker(t,s)))return;
 const origin=hero.base==="castle"&&travel?.to!=="homePortal"?travel?.origin:null;
 const x=between(between(startX,origin?.x??.5,walk),.35,smithStep),y=between(between(startY,origin?.y??.85,walk),tall?.705:.80,smithStep);
 knightAt(w*x-kindle*s*6,h*y,s*between(.30,1,walk)*(1-.18*smithStep),weapon(),t,walk<1||(smithStep>0&&smithStep<1),false,armor().bonus,0,(settle+kindle*.59)*(1-Math.min(1,smithStep*4)))
}
function journeyScene(t,path){
 const p=path.p;
 if(path.to==="castle"||path.to==="camp"){
   const forward=path.to==="castle"?p:1-p;
   if(forward<.72)refugeArt(t,hero,{boat:forward/.72,reverse:path.to==="camp"},false);
   else courtyardCamp(t,(forward-.72)/.28);
   return
 }
 if(path.to==="smith"||path.to==="smithBack"){courtyardCamp(t,1,false,path.to==="smith"?p:1-p);return}
 if(path.to==="storyHome"){refugeArt(t,hero,{boat:1-p,relight:true,reverse:true},false);return}
 if(path.to==="stairs"){
   if(path.fromSmith&&p<.36)courtyardCamp(t,1,false,1-p/.36);
   else courtyardCamp(t,1-(path.fromSmith?(p-.36)/.64:p),false,0,true);
   return
 }
 if(path.to==="homePortal"){courtyardCamp(t,p,true);return}
 if(hero.base==="castle"){courtyardCamp(t,1-p,true);return}
 refugeArt(t,hero,path,false)
}
