"use strict";
const journeyPhase=(p,start,end)=>Math.max(0,Math.min(1,(p-start)/(end-start)));
const between=(a,b,p)=>a+(b-a)*p;
const hullArt=new Image();hullArt.src="ferry-hull.webp";
function drawSkiff(x,y,s,t,rowing,rider){
 const stroke=rowing?Math.sin(t*5):0;
 ctx.save();ctx.translate(x,y+Math.sin(t*2)*s*.6);ctx.scale(s,s);
 for(let i=0;i<3;i++){
   const u=(t*.45+i/3)%1;
   ctx.strokeStyle="rgba(218,229,215,"+((1-u)*(rowing?.6:.2))+")";ctx.lineWidth=.8;
   ctx.beginPath();ctx.ellipse(-5,4,24+u*14,3+u*4,.05,0,Math.PI*1.8);ctx.stroke()
 }
 if(hullArt.naturalWidth)ctx.drawImage(hullArt,-40,-16,80,22);
 if(rider)knightAt(0,-4,.60,weapon(),t,false,false,armor().bonus,0,1);
 if(hullArt.naturalWidth){
  ctx.save();ctx.beginPath();ctx.moveTo(-40,1);ctx.lineTo(40,-6);ctx.lineTo(40,7);ctx.lineTo(-40,7);ctx.closePath();ctx.clip();
  ctx.drawImage(hullArt,-40,-16,80,22);ctx.restore()
 }
 const blade=rowing?stroke*15:-13;
 const grip=rowing?4+stroke*3:9;
 line("#ccb58b",1.8,grip,-14,blade-10,4);
 if(rider){line("#69727a",2.5,-3,-19,grip,-14);oval("#9a8770",grip,-14,1.6,1.2)}
 poly("#87725a",blade-10,2,blade-17,5,blade-20,9,blade-17,10,blade-9,5);
 ctx.restore()
}
function mooring(w,h){
 const portrait=w/h<.87;
 const dh=Math.max(h,w/(portrait?1120/1920:5504/3072));
 return {x:w*.34,y:h*.5+((portrait?.69:.76)-.5)*dh}
}
function boatPass(t,hero,p){
 const w=width,h=height,s=Math.min(w/190,h/270),gate=gatePosition(w,h);
 const dock=mooring(w,h);
 const far={x:w*gate.x-4*s,y:h*gate.y+8*s};
 const sail=journeyPhase(p,.34,.82),ease=sail*sail*(3-2*sail);
 const bx=between(dock.x,far.x,ease),by=between(dock.y,far.y,ease);
 const bs=s*between(.82,.21,ease);
 const aboard=p>=.34&&p<=.82;
 drawSkiff(bx,by,bs,t,aboard,aboard);
 if(aboard)return;
 let x,y,size,seat;
 if(p<.34){
   const step=journeyPhase(p,.09,.34),jump=journeyPhase(p,.24,.34);
   x=between(w*.53,dock.x,step);y=between(h*.91,dock.y-3*bs,step)-Math.sin(Math.PI*jump)*10*s;
   size=s*between(1,.82*.63,step);seat=1-journeyPhase(p,0,.09)+jump
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
 const x=between(between(startX,.5,walk),.35,smithStep),y=between(between(startY,.85,walk),tall?.705:.80,smithStep);
 knightAt(w*x-kindle*s*6,h*y,s*between(.30,1,walk)*(1-.18*smithStep),weapon(),t,walk<1||(smithStep>0&&smithStep<1),false,armor().bonus,0,(settle+kindle*.59)*(1-Math.min(1,smithStep*4)))
}
function journeyScene(t,path){
 const p=path.p;
 if(path.to==="castle"||path.to==="camp"){
   const forward=path.to==="castle"?p:1-p;
   if(forward<.72)refugeArt(t,hero,{boat:forward/.72},false);
   else courtyardCamp(t,(forward-.72)/.28);
   return
 }
 if(path.to==="smith"||path.to==="smithBack"){courtyardCamp(t,1,false,path.to==="smith"?p:1-p);return}
 if(path.to==="storyHome"){refugeArt(t,hero,{boat:1-p,relight:true},false);return}
 if(path.to==="stairs"){
   if(path.fromSmith&&p<.36)courtyardCamp(t,1,false,1-p/.36);
   else courtyardCamp(t,1-(path.fromSmith?(p-.36)/.64:p),false,0,true);
   return
 }
 if(path.to==="homePortal"){courtyardCamp(t,p,true);return}
 if(hero.base==="castle"){courtyardCamp(t,1-p,true);return}
 refugeArt(t,hero,path,false)
}
