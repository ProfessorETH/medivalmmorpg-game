"use strict";
const campPlate=new Image(),campSeat=new Image(),campFire=new Image();
campFire.src="camp-fire.webp";
campPlate.src="camp-gate.webp";
campSeat.src="camp-log.webp";
function drawCampPlate(w,h,level){
 if(!campPlate.naturalWidth){rect("#302d29",0,0,w,h);return}
 const fit=Math.max(w/campPlate.width,h/campPlate.height);
 const dw=campPlate.width*fit,dh=campPlate.height*fit;
 ctx.drawImage(campPlate,(w-dw)/2,(h-dh)/2,dw,dh);
 if(level>=3)glow(w*.5,h*.50,12,"#ffab5788");
 if(level>=5)glow(w*.52,h*.49,12,"#ffab5788")
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
function arrivalArt(t,hero,p=0){
 const w=width,h=height;
 const back=ctx.createLinearGradient(0,0,0,h);back.addColorStop(0,"#213342");back.addColorStop(1,"#747369");rect(back,0,0,w,h);
 for(let y=0;y<h*.57;y+=18)for(let x=-32;x<w;x+=34){rect("#4b5c64",x+(y%36?17:0),y,32,16);rect("#6c777b",x+(y%36?17:0),y,32,2)}
 const scale=Math.min(w/100,h/170);archAt(w*.5,h*.55,scale,t,0,true);
 for(const x of [w*.22,w*.78]){rect("#312e31",x-3,h*.46,6,18);glow(x,h*.46,32,"#ffba6777");poly("#f7b66b",x-6,h*.46,x,h*.46-16+Math.sin(t*6)*2,x+6,h*.46)}
 poly("#834f4d",w*.43,h*.54,w*.57,h*.54,w*.77,h,w*.23,h);
 knightAt(w*.5,h*(.69-.14*p),Math.min(w/215,h/275)*(1-.6*p),hero.bag[hero.gear.weapon],t,p>0,false,hero.bag[hero.gear.armor].bonus)
}
function refugeArt(t,hero,travel,raised){
 const w=width,h=height,s=Math.min(w/190,h/270);
 drawCampPlate(w,h,hero.level);
 const shade=.06+.10*(1-Math.cos(t*Math.PI/90))/2;
 rect("rgba(24,20,19,"+shade+")",0,0,w,h);
 archAt(w*.79,h*.59,Math.min(w/320,h/450),t,travel?.to==="portal"?travel.p:0);
 const fx=w*.53-36*s,fy=h*.80;glow(fx,fy-8,s*40,"#ffb45f80");
 glow(fx,fy-4,s*61,"#ff933344");
 const flameHeight=(37+Math.sin(t*6)*.8+Math.sin(t*11)*.4)*s;
 if(campFire.naturalWidth)ctx.drawImage(campFire,fx-18*s,fy-flameHeight+4*s,36*s,flameHeight);
 for(let i=0;i<9;i++){const u=(t*.53+i/9)%1;rect("rgba(255,196,110,"+(1-u)+")",fx+u*11*s+Math.sin(i+t+u*4)*4*s,fy-u*29*s,2,2)}
 ctx.save();ctx.translate(w*.53,h*.825);ctx.scale(s,s);
 oval("#17130fc4",4,1,33,4);
 if(campSeat.naturalWidth)ctx.drawImage(campSeat,-25,-23,66,23);
 ctx.restore();
 const returning=travel?.to==="homePortal";
 const p=returning?1-travel.p:travel?.p||0,walk=Math.min(1,Math.max(0,(p-.22)/.66)),ease=walk*walk*(3-2*walk);
 const portal=returning||travel?.to==="portal",tx=portal ? .79 : .5,ty=portal?.59:.505;
 const resting=Math.max(0,1-p/.22);
 if(resting>.35){
  ctx.save();ctx.translate(w*.53+48*s,h*.85);ctx.scale(s,s);
  oval("#11152577",0,1,17,3);line("#543b32",3,-12,0,-6,-26);line("#805d46",3,10,0,5,-26);line("#9a7350",3,-12,-23,11,-23);
  const restingWeapon=weapon();
  if(restingWeapon.style==="twins"){sword(-6,-21,2.95,true,restingWeapon.bonus>1,restingWeapon.name);sword(6,-22,3.31,true,restingWeapon.bonus>1,restingWeapon.name)}
  else{sword(4,-35,3.30,false,restingWeapon.bonus>1,restingWeapon.name);poly("#b08b61",-18,-19,-10,-21,-3,-16,-6,-5,-13,-1,-18,-8);poly("#8e3449",-16,-17,-10,-19,-5,-15,-8,-6,-13,-3,-16,-9)}
  ctx.restore()
 }
 const x=w*(.53+(tx-.53)*ease),y=h*(.825+(ty-.825)*ease);
 const vanish=Math.max(0,(p-.85)/.15);
 ctx.save();ctx.globalAlpha=1-vanish;
 knightAt(x,y,s*(1-.72*ease)*(1-.9*vanish),hero.bag[hero.gear.weapon],t,walk>0&&walk<1,raised,hero.bag[hero.gear.armor].bonus,0,Math.max(0,1-p/.22));ctx.restore()
}
