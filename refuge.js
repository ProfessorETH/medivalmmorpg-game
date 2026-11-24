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
 const sky=c.createLinearGradient(0,0,0,H*.52);sky.addColorStop(0,"#344968");sky.addColorStop(.48,"#988ba2");sky.addColorStop(.85,"#efbb9d");sky.addColorStop(1,"#f6d5a6");block(sky,0,0,W,H);
 for(let i=0;i<42;i++){let x=roll()*W,y=H*(.08+roll()*.19);block("#e6c2b74a",x,y,5+roll()*W*.12,1+roll()*2)}
 c.fillStyle="#f6d9a6";c.beginPath();c.arc(W*.68,H*.20,Math.min(W,H)*.045,0,7);c.fill();
 for(let layer=0;layer<4;layer++){
 let pts=[[0,H*.6]];for(let i=0;i<=80;i++){const f=i/80;pts.push([f*W,H*(.32+layer*.044-.064*Math.sin(f*13+layer*2)-roll()*.015-.025*Math.cos(f*31+layer))])}
 shape(["#a49bad","#888ba1","#687c91","#536e7d"][layer],[...pts,[W,H*.6]])
 }
 function pine(x,y,size,shade,light){
 block(shade,x-size*.035,y-size*.75,size*.08,size*.76);
 for(let j=0;j<5;j++){let tip=y-size+j*size*.135,base=tip+size*(.32+j*.05),r=size*(.065+j*.034);
 shape(shade,[[x,tip],[x-r,base],[x-r*.35,base-2],[x,base+2],[x+r,base]]);
 shape(light,[[x,tip],[x-r,base],[x-r*.21,base-3]])}
 }
 for(let i=0;i<180;i++){const x=roll()*W,y=H*(.54+roll()*.018);pine(x,y,H*(.017+roll()*.05),"#496473","#73888a")}
 const lake=c.createLinearGradient(0,H*.51,0,H*.67);lake.addColorStop(0,"#a0b2ae");lake.addColorStop(1,"#506e79");block(lake,0,H*.545,W,H*.15);
 for(let i=0;i<420;i++){const y=H*(.548+roll()*.14);block(i%4?"#a3b5ae":"#ead1a6",roll()*W,y,2+roll()*12,1)}
 const ground=c.createLinearGradient(0,H*.51,0,H);ground.addColorStop(0,"#718579");ground.addColorStop(.42,"#52645b");ground.addColorStop(1,"#243e43");
 shape(ground,[[0,H*.68],[W*.19,H*.64],[W*.44,H*.52],[W*.67,H*.50],[W,H*.585],[W,H],[0,H]]);
 shape("#908575",[[W*.49,H*.49],[W*.52,H*.49],[W*.49,H*.60],[W*.62,H*.67],[W*.55,H*.73],[W*.32,H*.85],[W*.24,H],[W*.06,H],[W*.26,H*.82],[W*.54,H*.665],[W*.445,H*.60]]);
 for(let i=0;i<1600;i++){const x=roll()*W,y=H*(.68+roll()*.32);block(["#84887577","#334f4888","#a19a7277"][i%3],x,y,1+roll()*4,1)}
 const s=Math.min(W/320,H/275),cx=W*.5,cy=H*.505;
 c.save();c.translate(cx,cy);c.scale(s,s);
 function tower(x,y,a,high){
 block("#48586a",x,y,a,high);block("#82909a",x,y,a*.28,high);block("#39485a",x+a*.76,y,a*.24,high);
 shape("#654d62",[[x-4,y],[x+a*.49,y-a*1.45],[x+a+4,y]]);shape("#916c75",[[x-4,y],[x+a*.49,y-a*1.45],[x+a*.35,y]]);
 for(let j=6;j<high-3;j+=11){block("#303f50",x+a*.4,y+j,3,5);block("#f5c088",x+a*.4+1,y+j+1,1,3)}
 }
 tower(-12,-56,17,53);tower(-40,-34,12,35);tower(27,-38,14,38);
 if(stageLevel>1)tower(46,-47,13,47);if(stageLevel>2)tower(-60,-40,13,42);
 block("#6b7882",-42,-19,86,22);for(let i=-42;i<42;i+=8)block("#74818a",i,-23,5,6);
 for(let j=0;j<80;j++)block("#566574",-40+roll()*80,-16+roll()*17,2+roll()*4,1);
 tower(-18,-26,9,28);tower(9,-26,9,28);
 shape("#253746",[[-7,3],[-7,-8],[-3,-13],[1,-15],[7,-8],[7,3]]);
 c.restore();
 for(const side of [0,1])for(let i=0;i<21;i++){const x=(side?1-roll()*.2:roll()*.20)*W,y=H*(.68+roll()*.06);pine(x,y,H*(.06+roll()*.16),"#314d51","#47615f")}
 for(const side of [0,1])for(let i=0;i<7;i++){const x=(side?1-roll()*.08:roll()*.08)*W;pine(x,H*(.94+roll()*.13),H*(.16+roll()*.27),"#1c363e","#2a4547")}
 scenery={image,stamp};return image
}
function archAt(x,y,s,t,open,stone=false){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 oval("#17272c99",0,2,26,5);oval("#59696a",0,-19,21,27);rect("#59696a",-21,-19,42,20);
 oval(stone?"#293543":"#28545a",0,-18,16,23);rect(stone?"#293543":"#28545a",-16,-18,32,20);
 if(!stone){glow(0,-18,30+open*20,"#78f6df80");oval("#7acfc1",0,-19,12+Math.sin(t*2),20);oval("#315d67",0,-19,8,16);
 for(let i=0;i<9;i++){
  const a=t*(1+open*3)+i*.698,radius=13+3*Math.sin(a*2);
  oval("#b4f4db",Math.cos(a)*radius,-19+Math.sin(a)*radius*1.5,1,1.5)
 }}
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
 const w=width,h=height,s=Math.min(w/215,h/290);
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(backdrop(w,h,hero.level),0,0,w,h);ctx.restore();
 const night=(1-Math.cos(t*Math.PI/90))/2;
 rect("rgba(20,32,67,"+(night*.55)+")",0,0,w,h);
 for(let i=0;i<50;i++){const x=((i*97)%101)/101*w,y=((i*71)%103)/103*h*.23;rect("rgba(255,233,196,"+(night*.85)+")",x,y,1.3,1.3)}
 archAt(w*.79,h*.59,Math.min(w/320,h/450),t,travel?.to==="portal"?travel.p:0);
 const fx=w*.36,fy=h*.79;glow(fx,fy-8,s*40,"#ffb45f80");
 for(let i=0;i<8;i++){const a=i*.78;oval("#78766b",fx+Math.cos(a)*12*s,fy+Math.sin(a)*4*s,4*s,2.2*s)}
 for(let i=0;i<5;i++){const x=fx+(i-2)*2.8*s,z=(10+5*Math.sin(t*6+i))*s;poly(i%2?"#ffd985":"#db8050",x-3*s,fy,x+s,fy-z,x+4*s,fy)}
 for(let i=0;i<9;i++){const u=(t*.53+i/9)%1;rect("rgba(255,196,110,"+(1-u)+")",fx+u*11*s+Math.sin(i+t+u*4)*4*s,fy-u*29*s,2,2)}
 ctx.save();ctx.translate(w*.54,h*.814);ctx.scale(s,s);
 oval("#24363777",0,6,26,5);rect("#634f40",-23,-4,42,8);rect("#8d7356",-21,-4,39,2);
 oval("#b19773",-22,0,4,5);oval("#74634d",-22,0,2.2,3.1);ctx.restore();
 const returning=travel?.to==="homePortal";
 const p=returning?1-travel.p:travel?.p||0,walk=Math.min(1,Math.max(0,(p-.22)/.66)),ease=walk*walk*(3-2*walk);
 const portal=returning||travel?.to==="portal",tx=portal ? .79 : .5,ty=portal?.59:.505;
 const x=w*(.53+(tx-.53)*ease),y=h*(.825+(ty-.825)*ease);
 const vanish=Math.max(0,(p-.85)/.15);
 ctx.save();ctx.globalAlpha=1-vanish;
 knightAt(x,y,s*(1-.72*ease)*(1-.9*vanish),hero.bag[hero.gear.weapon],t,walk>0&&walk<1,raised,hero.bag[hero.gear.armor].bonus,0,Math.max(0,1-p/.22));ctx.restore()
}
