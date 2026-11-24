"use strict";
const campPlate=new Image(),campSeat=new Image(),campFire=new Image();
const signalLamp=new Image();
signalLamp.src="ford-lamp.webp";
campFire.src="camp-fire.webp";
let plateFile="";
function selectPlate(w,h){
 const file=w/h<.87?"ford-portrait.webp?v=water2":w*Math.min(2,devicePixelRatio)>2520?"ford-4k.webp?v=water2":"ford-wide.webp?v=water2";
 if(file!==plateFile){plateFile=file;campPlate.src=file}
}
campSeat.src="camp-log.webp";
function gatePosition(w,h){
 const portrait=w/h<.87,ratio=portrait?1120/1920:5504/3072;
 const dw=Math.max(w,h*ratio),dh=dw/ratio;
 return {x:.5+((portrait?.644:.565)-.5)*dw/w,y:.5+((portrait?.464:.505)-.5)*dh/h}
}
function drawCampPlate(w,h,level,t){
 selectPlate(w,h);
 if(!campPlate.naturalWidth){rect("#302d29",0,0,w,h);return}
 const fit=Math.max(w/campPlate.width,h/campPlate.height);
 const dw=campPlate.width*fit,dh=campPlate.height*fit;
 ctx.drawImage(campPlate,(w-dw)/2,(h-dh)/2,dw,dh);
 if(signalLamp.naturalWidth){
   const tall=w/h<.87, scale=dw/(tall?350:550);
   const x=(w-dw)/2+dw*(tall?260/350:397/550);
   const y=(h-dh)/2+dh*(tall?324/600:145/307);
   ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
   if(!reducedMotion.matches)ctx.rotate(.045*Math.sin(t*1.48));
   line("#514730",1,0,-1,0,5);
   glow(0,17,15,"#ffba4a50");
   ctx.drawImage(signalLamp,-9.5,3,19,26);
   ctx.restore()
 }
 // Glints sit on the open water below the ferry chain in both compositions.
 if(!reducedMotion.matches){
   for(let i=0;i<7;i++){
     const phase=(t*.18+i*.38)%1;
     const x=w*(.33+(i*17%31)/100)+phase*4,y=h*(.58+(i*5%8)/100);
     ctx.globalAlpha=.26*Math.sin(phase*Math.PI);
     line("#f6f4db",.8,x,y,x+3+w*.009*phase,y)
   }
   ctx.globalAlpha=1
 }
 const gate=gatePosition(w,h);
 if(campPlate.layoutWidth!==w||campPlate.layoutHeight!==h){
   const keep=document.getElementById("keep");keep.style.left=gate.x*100+"%";keep.style.top=gate.y*100+"%";
   campPlate.layoutWidth=w;campPlate.layoutHeight=h
 }
 if(level>=3)glow(w*gate.x,h*gate.y,12,"#ffab5788");
 if(level>=5)glow(w*gate.x+5,h*gate.y-5,12,"#ffab5788")
}
function archAt(x,y,s,t,open,stone=false){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 oval("#10152588",0,2,28,6);
 poly("#384158",-22,2,-22,-20,-17,-38,-6,-48,0,-50,8,-46,18,-36,23,-18,22,2);
 poly("#171d35",-15,1,-15,-19,-11,-31,0,-41,11,-31,16,-18,15,1);
 for(const side of [-1,1]){
  ctx.save();ctx.scale(side,1);
  for(let i=0;i<5;i++){
   const a=i*Math.PI/10,b=(i+1)*Math.PI/10-.026;
   poly(i%2?"#67718a":"#7d8194",Math.cos(a)*21,-14-Math.sin(a)*34,Math.cos(b)*21,-14-Math.sin(b)*34,Math.cos(b)*16,-14-Math.sin(b)*26,Math.cos(a)*16,-14-Math.sin(a)*26)
  }
  rect("#576178",16,-14,6,15);rect("#9398a7",21,-14,1,15);ctx.restore()
 }
 if(!stone){
  glow(0,-19,30+open*24,"#b9b6ff80");
  for(let i=0;i<3;i++){ctx.beginPath();ctx.strokeStyle=["#9188e4","#c2bdfa","#e2ddff"][i];ctx.lineWidth=1.5-i*.3;
   const a=t*(.8+i*.12)+i*2;ctx.ellipse(0,-18,11+i,16+i*2,Math.sin(t+i)*.12,a,a+4.3);ctx.stroke()}
  for(let i=0;i<7;i++){const a=t*(1+open)+i*.898;oval("#fff4ed",Math.cos(a)*12,-19+Math.sin(a)*18,1,.8)}
 }
 ctx.restore()
}
// Two tide-marked quay stones frame a thin sheet of water at the expedition landing.
function ferryThreshold(x,y,scale,t,charge){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 oval("#262b2466",2,2,24,3.7);
 for(const k of [-1,1]){
   ctx.save();ctx.scale(k,1);
   poly("#565749",12,1,12,-24,15,-29,20,-27,22,1);
   poly("#9e9b80",12,-24,15,-29,17,-27,16,1,12,1);
   for(let i=0;i<4;i++)line("#d3c99e",.6,12,-4-i*5,15+(i%2),-4-i*5);
   rect("#525145",12,-21,8,1.6);ctx.restore()
 }
 const pulse=.5+.5*Math.sin(t*1.9);
 ctx.fillStyle="rgba(69,133,125,"+(.19+.08*pulse+.18*charge)+")";
 ctx.beginPath();ctx.ellipse(0,-14,11,18,0,0,Math.PI*2);ctx.fill();
 for(let i=0;i<2;i++){
   ctx.beginPath();ctx.strokeStyle=i?"#c1d3b5":"#71b7a7";ctx.lineWidth=i?.7:1.4;
   ctx.ellipse(0,-14,10+i*1.6,17+i*1.4,0,t*.65+i*2,t*.65+i*2+3.6);ctx.stroke()
 }
 ctx.restore()
}
const wardYard=new Image();
function arrivalArt(t){
 const tall=width/height<.95,file=tall?"yard-tall.webp":"yard-wide.webp";
 if(wardYard.dataset.file!==file){wardYard.dataset.file=file;wardYard.src=file}
 rect("#ac9c80",0,0,width,height);
 if(wardYard.complete&&wardYard.naturalWidth)ctx.drawImage(wardYard,0,0,width,height);
 const x=width*(tall?.28:.30),y=height*(tall?.64:.67);
 if((t*.85)%3<.09)soundscape.play("anvil",2.8);
 glow(x,y,Math.min(width,height)*.024,"#ffbc4980");
 if(!reducedMotion.matches)for(let i=0;i<4;i++){
   const u=(t*.85+i*.09)%1;ctx.globalAlpha=(1-u)*.8;
   oval("#ffd083",x+(i-2)*u*12,y-19*u*(1-u),1.4,.9)
 }
 ctx.globalAlpha=1
}
function refugeArt(t,hero,travel,raised){
 const w=width,h=height,s=Math.min(w/190,h/270);
 drawCampPlate(w,h,hero.level,t);fordBirds(t);
 const shade=.025+.065*(1-Math.cos(t*Math.PI/90))/2;
 rect("rgba(24,20,19,"+shade+")",0,0,w,h);
 if(hero.level>=10)ferryThreshold(w*.79,h*.765,Math.min(w/320,h/450),t,travel?.to==="portal"?travel.p:0);
 const behind=!travel&&walker&&walker.y<.89;
 if(behind)drawWalker(t,s);
 const kindle=travel?.relight?journeyPhase(1-travel.boat,.81,.96):1;
 ctx.save();ctx.globalAlpha=kindle;
 const fx=w*.53-36*s,fy=h*.889;glow(fx,fy-8,s*40,"#ffb45f80");
 glow(fx,fy-4,s*61,"#ff933344");
 const flameHeight=(37+Math.sin(t*6)*.8+Math.sin(t*11)*.4)*s;
 if(campFire.naturalWidth)ctx.drawImage(campFire,fx-18*s,fy-flameHeight+4*s,36*s,flameHeight);
 for(let i=0;i<9;i++){const u=(t*.53+i/9)%1;rect("rgba(255,196,110,"+(1-u)+")",fx+u*11*s+Math.sin(i+t+u*4)*4*s,fy-u*29*s,2,2)}
 ctx.restore();ctx.save();ctx.translate(w*.53,h*.91);ctx.scale(s,s);
 ctx.save();ctx.filter="blur(2px)";oval("#28252066",6,-1,32,3);ctx.restore();
 if(campSeat.naturalWidth)ctx.drawImage(campSeat,-25,-23,66,23);
 ctx.restore();
 const returning=travel?.to==="homePortal";
 const p=returning?1-travel.p:travel?.p||0,walk=Math.min(1,Math.max(0,(p-.22)/.66)),ease=walk*walk*(3-2*walk);
 const portal=returning||travel?.to==="portal",tx=portal ? .79 : gatePosition(w,h).x,ty=portal?.765:gatePosition(w,h).y;
 const resting=Math.max(0,1-p/.22);
 if(!walker&&resting>.35&&(travel?.boat??0)<.09){
  ctx.save();ctx.translate(w*.53+48*s,h*.93);ctx.scale(s,s);
  oval("#11152577",0,1,17,3);line("#543b32",3,-12,0,-6,-26);line("#805d46",3,10,0,5,-26);line("#9a7350",3,-12,-23,11,-23);
  const restingWeapon=weapon();
  if(restingWeapon.style==="twins"){sword(-6,-21,2.95,true,restingWeapon.bonus>1,restingWeapon.name);sword(6,-22,3.31,true,restingWeapon.bonus>1,restingWeapon.name)}
  else{sword(4,-35,3.30,false,restingWeapon.bonus>1,restingWeapon.name);poly("#b08b61",-18,-19,-10,-21,-3,-16,-6,-5,-13,-1,-18,-8);poly("#8e3449",-16,-17,-10,-19,-5,-15,-8,-6,-13,-3,-16,-9)}
  ctx.restore()
 }
 if(travel?.boat!==undefined){boatPass(t,hero,travel.boat,travel.reverse);return}
 const dock=mooring(w,h);
 drawSkiff(dock.x,dock.y,s*.82,t,false,false,false,true);
 if(behind||(!travel&&drawWalker(t,s)))return;
 const x=w*(.53+(tx-.53)*ease),y=h*(.91+(ty-.91)*ease);
 const vanish=Math.max(0,(p-.85)/.15);
 ctx.save();ctx.globalAlpha=1-vanish;
 knightAt(x,y,s*(1-.72*ease)*(1-.9*vanish),hero.bag[hero.gear.weapon],t,walk>0&&walk<1,raised,hero.bag[hero.gear.armor].bonus,0,Math.max(0,1-p/.22));ctx.restore()
}
