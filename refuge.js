"use strict";
// Paint the distant landscape once at pixel-art resolution. Keep actors, light and portals live.
let scenery;
function backdrop(w,h,level){
 const W=Math.min(800,Math.round(w*.8)),H=Math.max(140,Math.round(W*h/w));
 const stageLevel=level>=5?3:level>=3?2:1;
 const stamp=[W,H,stageLevel].join("-");
 if(scenery?.stamp===stamp)return scenery.image;
 const image=document.createElement("canvas");image.width=W;image.height=H;
 const c=image.getContext("2d");let seed=71;
 const roll=()=>((seed=seed*16807%2147483647)/2147483647);
 function shape(color,pts){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
 function block(color,x,y,a,b){c.fillStyle=color;c.fillRect(x|0,y|0,a,b)}
 const sky=c.createLinearGradient(0,0,0,H*.54);
 sky.addColorStop(0,"#0c1333");sky.addColorStop(.44,"#243c7b");sky.addColorStop(.83,"#7696c1");sky.addColorStop(1,"#adb8d0");block(sky,0,0,W,H);
 for(let i=0;i<140;i++){const x=roll()*W,y=roll()*H*.33;block(i%9?"#b4c6ed88":"#f4eee0",x,y,i%12?1:2,1)}
 const mx=W*.73,my=H*.19,mr=Math.min(W,H)*.047;
 const halo=c.createRadialGradient(mx,my,1,mx,my,mr*4);halo.addColorStop(0,"#d7e7ff77");halo.addColorStop(1,"#b7d1ff00");block(halo,mx-mr*4,my-mr*4,mr*8,mr*8);
 c.fillStyle="#e5eafa";c.beginPath();c.arc(mx,my,mr,0,7);c.fill();
 for(let i=0;i<20;i++){const a=roll()*6.28,r=roll()*mr*.8;c.fillStyle="#a5b4d744";c.beginPath();c.arc(mx+Math.cos(a)*r,my+Math.sin(a)*r,1+roll()*mr*.13,0,7);c.fill()}
 for(let layer=0;layer<3;layer++){
  const top=H*(.42+layer*.049);
  for(let i=-1;i<9;i++){
   const x=(i+roll()*.7)*W*.14,span=W*(.12+roll()*.09),y=top-H*(.035+roll()*.138),ridge=x+span*(roll()-.4)*.4;
   shape(["#7f95b4","#526f98","#324c70"][layer],[[x-span,top+5],[x-span*.38,y+(top-y)*.41],[x,y],[x+span*.3,y+(top-y)*.26],[x+span,top+5]]);
   shape(["#5f78a1","#405a82","#263b5c"][layer],[[x,y],[ridge,y+(top-y)*.42],[x+span*.19,top+5],[x+span,top+5],[x+span*.3,y+(top-y)*.26]]);
   if(layer<2){shape(layer?"#aebcd1":"#c2cfe0",[[x-span*.43,y+(top-y)*.47],[x,y],[x+span*.24,y+(top-y)*.22],[x+span*.1,y+(top-y)*.18],[x+span*.07,y+(top-y)*.32],[x-span*.04,y+(top-y)*.18],[x-span*.2,y+(top-y)*.38],[x-span*.16,y+(top-y)*.24]])}
  }
  block(["#7f95b4","#526f98","#324c70"][layer],0,top+4,W,H*.61-top)
 }
 function pine(x,y,size,shade,light){
  block(shade,x-size*.023,y-size*.9,Math.max(1,size*.047),size*.91);
  const pts=[[x,y-size]],lit=[];
  for(let j=1;j<=9;j++){const f=j/10,tip=y-size+size*f,r=size*(.035+f*.18);
   pts.push([x-r*.5,tip-size*.065],[x-r*(.85+roll()*.25),tip],[x-r*.39,tip-size*.009]);
   lit.push([x-r*.5,tip-size*.065],[x-r,tip],[x-r*.31,tip-size*.01])}
  pts.push([x,y-size*.09]);for(let j=9;j>=1;j--){const f=j/10,tip=y-size+size*f,r=size*(.035+f*.18);
   pts.push([x+r*.4,tip],[x+r*(.85+roll()*.3),tip+size*.02],[x+r*.45,tip-size*.07])}
  shape(shade,pts);shape(light,[[x,y-size],...lit,[x,y-size*.10]])
 }
 for(let i=0;i<180;i++){const x=roll()*W,y=H*(.54+roll()*.018);pine(x,y,H*(.017+roll()*.05),"#263d51","#3e5267")}
 const lake=c.createLinearGradient(0,H*.51,0,H*.67);lake.addColorStop(0,"#778bb7");lake.addColorStop(1,"#293e68");block(lake,0,H*.545,W,H*.15);
 for(let i=0;i<420;i++){const y=H*(.548+roll()*.14);block(i%4?"#889cc2":"#bfcae1",roll()*W,y,2+roll()*12,1)}
 const ground=c.createLinearGradient(0,H*.51,0,H);ground.addColorStop(0,"#556775");ground.addColorStop(.42,"#333e50");ground.addColorStop(1,"#171e30");
 shape(ground,[[0,H*.68],[W*.19,H*.64],[W*.44,H*.52],[W*.67,H*.50],[W,H*.585],[W,H],[0,H]]);
 shape("#5c5b6c",[[W*.49,H*.49],[W*.52,H*.49],[W*.49,H*.60],[W*.62,H*.67],[W*.55,H*.73],[W*.32,H*.85],[W*.24,H],[W*.06,H],[W*.26,H*.82],[W*.54,H*.665],[W*.445,H*.60]]);
 for(let i=0;i<1600;i++){const x=roll()*W,y=H*(.68+roll()*.32);block(["#74799177","#20283a88","#91909a77"][i%3],x,y,1+roll()*4,1)}
 const s=Math.min(W/320,H/275),cx=W*.5,cy=H*.505;
 c.save();c.translate(cx,cy);c.scale(s,s);
 function tower(x,y,a,high){
 block("#46546b",x,y,a,high);block("#82909a",x,y,a*.28,high);block("#39485a",x+a*.76,y,a*.24,high);
 shape("#242d4b",[[x-4,y],[x+a*.49,y-a*1.45],[x+a+4,y]]);shape("#495474",[[x-4,y],[x+a*.49,y-a*1.45],[x+a*.35,y]]);
 for(let j=6;j<high-3;j+=11){block("#303f50",x+a*.4,y+j,3,5);block("#f5c088",x+a*.4+1,y+j+1,1,3)}
 }
 // The gatehouse rests on a buttressed rock spur above the lake.
 shape("#31394c",[[-55,0],[-33,-10],[39,-8],[63,3],[46,13],[28,18],[-30,14],[-58,9]]);
 for(let i=0;i<6;i++){const x=-77+i*13;block("#636d82",x,0,15,4);block("#414b61",x,4,4,13-i);block("#9ba3b3",x,0,15,1)}
 tower(-12,-56,17,53);tower(-40,-34,12,35);tower(27,-38,14,38);
 if(stageLevel>1)tower(46,-47,13,47);if(stageLevel>2)tower(-60,-40,13,42);
 block("#6b7882",-42,-19,86,22);for(let i=-42;i<42;i+=8)block("#74818a",i,-23,5,6);
 for(let j=0;j<80;j++)block("#566574",-40+roll()*80,-16+roll()*17,2+roll()*4,1);
 for(let i=-2;i<=2;i++){
  const x=i*14;
  shape("#465267",[[x-2,-18],[x+1,-18],[x+1,0],[x+5,4],[x-4,4]]);
  shape("#b0baca",[[x-2,-18],[x-1,-18],[x-1,0],[x-4,4]]);
 }
 tower(-18,-26,9,28);tower(9,-26,9,28);
 shape("#a0a9b9",[[-9,3],[-8,-8],[0,-16],[8,-8],[9,3]]);
 shape("#253746",[[-7,3],[-7,-8],[-3,-13],[1,-15],[7,-8],[7,3]]);
 for(const x of [-30,23]){block("#8e243f",x,-19,5,14);shape("#b33c54",[[x,-5],[x+5,-5],[x+2,0]]);block("#d4b2a0",x+2,-18,1,8)}
 block("#7e8ba2",-4,-93,1,15);shape("#a53a52",[[-3,-93],[10,-91],[5,-88],[-3,-89]]);
 c.restore();
 for(const side of [0,1])for(let i=0;i<21;i++){const x=(side?1-roll()*.2:roll()*.20)*W,y=H*(.68+roll()*.06);pine(x,y,H*(.06+roll()*.16),"#1f3340","#354854")}
 for(const side of [0,1])for(let i=0;i<7;i++){const x=(side?1-roll()*.08:roll()*.08)*W;pine(x,H*(.94+roll()*.13),H*(.16+roll()*.27),"#101d29","#24343f")}
 // Near-bank scree and tall bent grasses frame the camp.
 for(let i=0;i<110;i++){const x=roll()*W,y=H*(.77+roll()*.23),z=(y/H-.7)*11;
  if(Math.abs(x-W*.52)<W*.15&&y<H*.88)continue;
  shape("#222938",[[x-z*1.7,y],[x-z,y-z],[x+.4*z,y-z*1.4],[x+z*2,y],[x+.6*z,y+1]]);
  shape("#626674",[[x-z,y-z],[x+.4*z,y-z*1.4],[x+.8*z,y-z*.9],[x-z*1.4,y-z*.45]])
 }
 for(let i=0;i<100;i++){const x=roll()*W,y=H*(.88+roll()*.12),z=2+roll()*H*.023;
  shape("#172637",[[x,y],[x-z*.6,y-z],[x+1,y-2],[x+z*.28,y-z*.87],[x+2,y]])}
 scenery={image,stamp};return image
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
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(backdrop(w,h,hero.level),0,0,w,h);ctx.restore();
 const night=(1-Math.cos(t*Math.PI/90))/2;
 rect("rgba(20,32,67,"+(night*.30)+")",0,0,w,h);
 for(let i=0;i<50;i++){const x=((i*97)%101)/101*w,y=((i*71)%103)/103*h*.23;rect("rgba(255,233,196,"+(night*.85)+")",x,y,1.3,1.3)}
 archAt(w*.79,h*.59,Math.min(w/320,h/450),t,travel?.to==="portal"?travel.p:0);
 const fx=w*.34,fy=h*.80;glow(fx,fy-8,s*40,"#ffb45f80");
 glow(fx,fy-4,s*61,"#ff933344");
 for(let i=0;i<3;i++)line("#593026",s*4,fx-s*(9-i),fy+s*(2-i),fx+s*(9-i*2),fy-s*i);
 for(let i=0;i<8;i++){const a=i*.78;oval("#6d5f61",fx+Math.cos(a)*12*s,fy+Math.sin(a)*4*s,4*s,2.2*s)}
 for(let i=0;i<7;i++){const x=fx+(i-3)*2.2*s,z=(13+7*Math.sin(t*5+i*1.7))*s;
  poly(i%2?"#ffb563":"#f16b39",x-3*s,fy,x-4*s,fy-z*.48,x+Math.sin(t*4+i)*3*s,fy-z,x+1.8*s,fy-z*.4,x+4*s,fy);
  poly("#ffeab0",x-2*s,fy,x,fy-z*.48,x+2*s,fy)}
 for(let i=0;i<9;i++){const u=(t*.53+i/9)%1;rect("rgba(255,196,110,"+(1-u)+")",fx+u*11*s+Math.sin(i+t+u*4)*4*s,fy-u*29*s,2,2)}
 ctx.save();ctx.translate(w*.55,h*.825-19*s);ctx.scale(s,s);
 oval("#24363777",0,6,26,5);rect("#634f40",-23,-1,43,13);rect("#8d7356",-21,-4,39,2);
 for(let i=0;i<5;i++)line(i%2?"#735747":"#453c3e",.8,-17+i,2+i*1.8,18-i,3+i*1.8);
 oval("#b19773",-22,5,5,8);oval("#74634d",-22,0,2.2,3.1);ctx.restore();
 const returning=travel?.to==="homePortal";
 const p=returning?1-travel.p:travel?.p||0,walk=Math.min(1,Math.max(0,(p-.22)/.66)),ease=walk*walk*(3-2*walk);
 const portal=returning||travel?.to==="portal",tx=portal ? .79 : .5,ty=portal?.59:.505;
 const resting=Math.max(0,1-p/.22);
 if(resting>.35){
  ctx.save();ctx.translate(w*.78,h*.85);ctx.scale(s,s);
  oval("#11152577",0,1,17,3);line("#543b32",3,-12,0,-6,-26);line("#805d46",3,10,0,5,-26);line("#9a7350",3,-12,-23,11,-23);
  if(hero.bag[hero.gear.weapon].style==="twins"){sword(-6,-21,2.95,true,false);sword(6,-22,3.31,true,false)}
  else{sword(4,-35,3.30,false,hero.bag[hero.gear.weapon].bonus>2);poly("#b08b61",-18,-19,-10,-21,-3,-16,-6,-5,-13,-1,-18,-8);poly("#8e3449",-16,-17,-10,-19,-5,-15,-8,-6,-13,-3,-16,-9)}
  ctx.restore()
 }
 const x=w*(.53+(tx-.53)*ease),y=h*(.825+(ty-.825)*ease);
 const vanish=Math.max(0,(p-.85)/.15);
 ctx.save();ctx.globalAlpha=1-vanish;
 knightAt(x,y,s*(1-.72*ease)*(1-.9*vanish),hero.bag[hero.gear.weapon],t,walk>0&&walk<1,raised,hero.bag[hero.gear.armor].bonus,0,Math.max(0,1-p/.22));ctx.restore()
}
