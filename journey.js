"use strict";
const journeyPhase=(p,start,end)=>Math.max(0,Math.min(1,(p-start)/(end-start)));
const between=(a,b,p)=>a+(b-a)*p;
function drawSkiff(x,y,s,t,rowing,rider){
 const stroke=rowing?Math.sin(t*5):0;
 ctx.save();ctx.translate(x,y+Math.sin(t*2)*s*.6);ctx.scale(s,s);
 for(let i=0;i<3;i++){
   const u=(t*.45+i/3)%1;
   ctx.strokeStyle="rgba(218,229,215,"+((1-u)*(rowing?.6:.2))+")";ctx.lineWidth=.8;
   ctx.beginPath();ctx.ellipse(-5,4,24+u*14,3+u*4,.05,0,Math.PI*1.8);ctx.stroke()
 }
 poly("#352f26",-31,-5,-23,-10,17,-10,31,-6,19,0,-22,0);
 poly("#82715c",-28,-6,-19,-8,18,-8,25,-6,13,-2,-20,-2);
 line("#c6af86",1,-24,-6,22,-7);
 if(rider)knightAt(0,-3,.63,weapon(),t,false,false,armor().bonus,0,1);
 poly("#514336",-32,-6,-21,-2,17,-3,32,-8,22,1,12,4,-18,4,-28,0);
 line("#ad9975",1.3,-29,-5,-19,-1);line("#c6b28c",1.2,-19,-1,20,-3);
 line("#302c28",.8,-21,1,17,0);
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
function courtyardCamp(t,p,throughPortal=false){
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
 const startX=throughPortal?.77:.5,startY=throughPortal?.65:.55;
 ferryThreshold(w*.77,h*.65,s*.52,t,throughPortal?1-p:0);
 const kindle=Math.sin(Math.PI*journeyPhase(p,.54,.84));
 knightAt(w*between(startX,.5,walk)-kindle*s*6,h*between(startY,.85,walk),s*between(.30,1,walk),weapon(),t,walk<1,false,armor().bonus,0,settle+kindle*.59)
}
function journeyScene(t,path){
 const p=path.p;
 if(path.to==="castle"||path.to==="camp"){
   const forward=path.to==="castle"?p:1-p;
   if(forward<.72)refugeArt(t,hero,{boat:forward/.72},false);
   else courtyardCamp(t,(forward-.72)/.28);
   return
 }
 if(path.to==="homePortal"){courtyardCamp(t,p,true);return}
 if(hero.base==="castle"){courtyardCamp(t,1-p,true);return}
 refugeArt(t,hero,path,false)
}
