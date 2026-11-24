"use strict";
const wardFoes={
 pike:{speed:22,reach:58,hp:2,damage:4,wind:1.05,length:72,width:9},
 hound:{speed:43,reach:33,hp:-2,damage:3,wind:.72,length:43,width:8},
 bell:{speed:17,reach:76,hp:0,damage:4,wind:1.2,radius:19},
 keeper:{speed:20,reach:67,hp:18,damage:7,wind:1.45,length:82,width:13,radius:43}
};
function attackArea(m,b){
 const a=wardFoes[m.species],angle=Math.atan2(b.y-m.y,b.x-m.x);
 if(m.species==="bell"){
   const lead=b.walk&&(m.order===1||m.rift)?15:0;
   return {x:b.x+lead*Math.cos(b.heading||0),y:b.y+lead*Math.sin(b.heading||0),radius:a.radius}
 }
 if(m.species==="keeper"&&m.turn%2===1)return {x:m.x,y:m.y,radius:a.radius};
 return {x:m.x,y:m.y,angle,length:a.length,width:a.width}
}
function inArea(area,x,y){
 const dx=x-area.x,dy=y-area.y;if(area.radius)return Math.hypot(dx,dy)<=area.radius;
 const ca=Math.cos(area.angle),sa=Math.sin(area.angle),along=dx*ca+dy*sa;
 return along>=0&&along<=area.length&&Math.abs(-dx*sa+dy*ca)<=area.width
}
function wardStep(m,b,dt){
 const a=wardFoes[m.species];m.delay-=dt;m.impact=Math.max(0,(m.impact||0)-dt);m.flash=Math.max(0,(m.flash||0)-dt);
 const dx=b.x-m.x,dy=b.y-m.y,d=Math.hypot(dx,dy);
 if(m.wind>0){
   m.wind=Math.max(0,m.wind-dt);
   if(m.wind)return 0;
   const hit=inArea(m.area,b.x,b.y);m.impact=.22;m.delay=m.boss?1.1:.86;m.turn++;
   if(m.species==="hound"){m.x=clamp(m.x+Math.cos(m.area.angle)*33,14,466);m.y=clamp(m.y+Math.sin(m.area.angle)*33,16,346)}
   return hit?a.damage+Math.min(8,m.rift||0):0
 }
 if(m.impact)return 0;
 if((m.rift||m.order===2)&&m.species==="pike"&&d>34&&d<110&&m.delay>0){
   m.x=clamp(m.x-dy/d*19*dt,14,466);m.y=clamp(m.y+dx/d*19*dt,16,346)
 }
 const reach=m.species==="keeper"&&m.turn%2?36:a.reach;
 if(d<reach&&m.delay<=0){m.area=attackArea(m,b);m.wind=a.wind;soundscape.play("warning",.42);m.facing=Math.sign(dx)||1}
 else if(d>reach*.6){m.x+=dx/d*a.speed*dt;m.y+=dy/d*a.speed*dt;m.facing=Math.sign(dx)||1}
 return 0
}
function wardMark(m){
 if(!m.area||(!m.wind&&!m.impact))return;
 const a=m.area,progress=1-m.wind/wardFoes[m.species].wind;
 ctx.save();ctx.translate(a.x,a.y);ctx.strokeStyle=m.impact?"#ffefd4":"#ffc3a3";ctx.fillStyle=m.impact?"#ffd6a382":"rgba(226,82,71,"+(.14+.25*progress)+")";ctx.lineWidth=1.6;
 ctx.beginPath();
 if(a.radius)ctx.arc(0,0,a.radius,0,Math.PI*2);else{ctx.rotate(a.angle);ctx.rect(0,-a.width,a.length,2*a.width)}
 ctx.fill();ctx.stroke();ctx.strokeStyle="#fff0bd";ctx.lineWidth=1;
 ctx.beginPath();if(a.radius)ctx.arc(0,0,a.radius*Math.max(.02,progress),0,Math.PI*2);else{ctx.moveTo(a.length*progress,-a.width);ctx.lineTo(a.length*progress,a.width)}ctx.stroke();ctx.restore()
}
function wardCreature(m,t){
 const spec=m.species,charging=m.wind>0,up=charging?1-m.wind/wardFoes[spec].wind:0;
 ctx.save();ctx.translate(m.x,m.y);ctx.scale(m.facing||1,1);
 if(m.rift){poly("#ac88db",-7,-12,0,-19,7,-12,0,-8);glow(0,-11,15,"#ac83d763")}
 const silver=m.flash>0?"#fff0d4":"#9ba8bb",night="#343d52",red="#973f52";
 if(m.order===1||m.order===2){ctx.shadowColor=m.order===1?"#85c8c5":"#ef815c";ctx.shadowBlur=3}
 oval("#11152299",0,1,m.boss?20:12,m.boss?6:3);
 if(spec==="hound"){
  ctx.translate(0,charging?2:Math.sin(t*13)*1.1);
  poly("#554556",-17,-13,-10,-10,0,-13,9,-10,10,-5,2,-2,-11,-4);poly("#927477",-10,-13,1,-15,8,-11,2,-8,-8,-8);
  poly(night,-12,-8,-8,-6,-13,1,-16,1);poly(night,6,-7,10,-6,14,0,10,0);
  poly("#afa5a0",7,-14,12,-21,13,-14,20,-12,24,-9,16,-6,9,-8);rect("#f09d71",15,-13,3,2);
  poly("#726374",-8,-12,-10,-18,-3,-15,-4,-20,3,-15,5,-17,8,-12);
  line("#b49a76",1.7,6,-12,8,-6);poly("#e9ddc5",17,-7,19,-7,18,-4);
  line("#988695",1.7,-11,-9,-22,-19)
 }else if(spec==="bell"){
  ctx.translate(0,Math.sin(t*3)*1.7);
  poly("#4d4c72",-12,-3,-7,-23,0,-34,8,-23,13,-4,6,-6,0,-2,-5,-6);poly("#7778a0",-6,-23,0,-32,6,-24,3,-18,-4,-18);poly(night,-3,-23,2,-26,4,-21,0,-18);
  poly("#49415d",-5,-18,1,-16,6,-19,4,-13,0,-11);line("#b4a389",1.3,-5,-17,4,-13);
  for(let i=0;i<3;i++)line("#9291ae",.85,-4+i*4,-12,-7+i*6,-4);
  oval("#bbc5d5",0,-21,1.2,.75);oval("#c6cfe2",3,-22,.9,.7);
  line("#a9875f",2,6,-15,17,-22-up*10);const y=-22-up*10;
  poly("#e2bd70",14,y,17,y-3,20,y,22,y+9,12,y+9);oval("#fff1c0",17,y+9,3,1.4);if(charging)glow(17,y+4,12,"#f4bf6590")
 }else{
  const big=spec==="keeper";if(big)ctx.scale(1.5,1.5);
  ctx.translate(0,charging?-up*2:Math.sin(t*7)*.55);
  poly(night,-9,-12,-1,-12,-2,0,-11,0);poly(night,2,-12,9,-12,12,0,4,0);
  poly(big?red:"#475c75",-9,-26,5,-29,12,-20,9,-8,1,-5,-10,-8,-14,-3);
  poly(silver,-7,-24,1,-27,9,-23,7,-16,0,-13,-7,-17);
  poly(silver,-8,-32,-4,-38,4,-38,9,-31,7,-24,-1,-22,-6,-25);
  poly(night,-6,-31,8,-32,8,-29,-5,-28);rect("#e8bb89",3,-30,3,1);
  if(big){poly("#c8aa75",-9,-35,-12,-45,-4,-40,0,-46,4,-39,12,-44,9,-35);poly("#582b41",-10,-27,-15,-24,-18,-9,-22,1,-12,-4,-8,-18);
   for(const side of [-1,1]){poly("#8993a7",side*6,-24,side*11,-28,side*15,-24,side*14,-20,side*8,-19)}
   line("#c8ac82",1,-7,-24,7,-16);oval("#d7b777",2,-19,1.7,1.7);
   const hy=m.impact?-3:charging?-35-up*12:-13;
   line("#b5a28b",2,7,-20,18,hy);line("#6d7385",2,18,hy,27,hy+7);oval("#3c4354",28,hy+8,7,7);poly("#bac2c9",23,hy+5,26,hy+1,32,hy+3,34,hy+7,28,hy+5)
  }else{
   const tilt=m.impact?-.08:charging?.16:.85;ctx.save();ctx.translate(4+(m.impact?8:charging?-up*5:0),-18);ctx.rotate(-tilt);line("#b19070",2,-13,0,24,0);poly(silver,23,-3,36,0,23,3);ctx.restore();
   poly("#52657e",-13,-22,-5,-21,-6,-10,-11,-6,-15,-13)
  }
 }
 ctx.restore();
 if(m.hp<m.max||m.boss){const w=m.boss?40:22;rect("#1b202e",m.x-w/2,m.y-(m.boss?73:43),w,3);rect(m.boss?"#ed997e":"#c6a484",m.x-w/2,m.y-(m.boss?73:43),w*m.hp/m.max,3)}
}
let wardFloor;
function wardHall(t,room){
 if(!wardFloor){
 const c=document.createElement("canvas");c.width=960;c.height=720;
 paintOn(c,()=>{ctx.scale(2,2);rect("#323d51",0,0,480,360);
 for(let j=0;j<26;j++)for(let i=-1;i<18;i++){const x=i*30+(j%2)*15,y=j*15,n=Math.abs(i*17+j*31)%6;
 poly(["#435066","#465269","#3f4d62","#455368","#414c61","#39475b"][n],x+1,y+1,x+27,y,x+30,y+4,x+28,y+14,x+2,y+14,x,y+12);
 if(n===2){line("#637086",.55,x+3,y+1,x+13,y+1);line("#303d4e",.8,x+17,y,x+12,y+6)}}
 for(const x of [48,416]){rect("#202b40",x,0,14,360);for(let y=0;y<360;y+=12){line("#526278",1.2,x,y,x+14,y);line("#34455e",1,x+4,y,x+4,y+12)}}
 for(const y of [72,276]){rect("#2b3c54",0,y,480,8);line("#77839b",.7,0,y,480,y);for(let x=4;x<480;x+=17)line("#53617b",.65,x,y+4,x+8,y+3)}
 for(const [x,y] of [[110,95],[345,222],[196,294]]){oval("#344259",x,y,36,6);line("#78889b",.7,x-23,y,x+8,y)}
 for(let i=0;i<8;i++){let x=i*64+10;poly("#2b3043",x,40,x,12,x+10,1,x+30,1,x+39,12,x+39,40);poly("#141e30",x+5,40,x+5,14,x+13,6,x+27,6,x+34,15,x+34,40);
 for(let j=0;j<4;j++)rect("#667182",x+8+j*7,13,1,26);rect("#485265",x+5,24,29,2)}
 });
 wardFloor=c
 }
 ctx.drawImage(wardFloor,0,0,480,360);
 for(const x of [106,374]){poly("#662e48",x-7,0,x+7,0,x+7,26,x,33,x-7,26);line("#bba989",1,x,8,x,21);glow(x+17,31,18,"#ec995e60");poly("#eab57e",x+14,33,x+17,22+Math.sin(t*7),x+20,33)}
 ctx.strokeStyle=room===5?"#aa7a7577":"#99a6b133";ctx.lineWidth=2;ctx.beginPath();ctx.arc(240,180,45,0,7);ctx.stroke()
}
