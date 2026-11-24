"use strict";
const stage=document.querySelector("#view"), ctx=stage.getContext("2d");
let width=0,height=0;
function resizeStage(){
 const box=stage.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
 width=box.width;height=box.height;stage.width=Math.round(width*dpr);stage.height=Math.round(height*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
}
new ResizeObserver(resizeStage).observe(stage);resizeStage();
function poly(color,...pts){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.closePath();ctx.fill()}
function oval(color,x,y,w,h){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,w,h,0,0,Math.PI*2);ctx.fill()}
function line(color,w,x,y,x2,y2){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()}
function rect(col,x,y,w,h){ctx.fillStyle=col;ctx.fillRect(x,y,w,h)}
function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"transparent");rect(g,x-r,y-r,r*2,r*2)}
function sword(x,y,angle,short,enchanted){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);const n=short?22:36;
 poly(enchanted?"#8de6dd":"#e6e1ca",-2,0,-2,-n,1,-n-5,3,-n,3,0);
 poly("#859aa0",1,0,1,-n-4,3,-n,3,0);rect("#d2aa64",-6,0,13,2);rect("#6c4836",-1,2,4,7);oval("#debb73",1,10,2,2);ctx.restore()
}
function knightAt(x,y,s,weapon,t,walking=false,raised=false,armor=1,slash=0){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval("#10212788",0,1,22,5);
 const step=walking?Math.sin(t*12)*3:0;ctx.translate(0,Math.sin(t*(walking?12:2))*(walking?1.2:.55));
 const metal=armor>1?"#aabcad":"#9aaeba";
 poly("#5b3036",-8,-48,-17,-43,-21,-16,-27,-5,-14,-8,-5,-4,5,-12,5,-44);
 poly("#a04942",-13,-42,-18,-15,-22,-8,-15,-11,-9,-39);
 for(const [xx,dy] of [[-7,step],[8,-step]]){ctx.save();ctx.translate(xx,dy);poly("#414f59",-5,-21,4,-21,5,-12,3,-3,-3,-3,-5,-12);poly(metal,-4,-16,1,-18,3,-13,0,-5,-4,-5);poly("#34404a",-4,-4,3,-5,7,-1,7,1,-6,1);ctx.restore()}
 poly("#405360",-12,-43,11,-45,15,-35,9,-21,0,-16,-10,-22);
 poly(metal,-10,-43,1,-46,12,-43,9,-32,0,-27,-9,-31);poly("#c6ceca",-7,-41,0,-43,7,-42,-1,-39,-8,-36);
 poly("#647b87",0,-28,10,-33,9,-24,1,-19,-9,-25,-9,-30);
 rect("#755441",-11,-25,22,3);rect("#d8ac62",-2,-25,5,3);
 poly("#8f3e3a",-6,-22,5,-22,6,-11,0,-8,-6,-12);
 for(const side of [-1,1]){ctx.save();ctx.scale(side,1);poly("#465965",9,-41,16,-42,21,-36,17,-31,10,-33);poly(metal,9,-41,15,-44,21,-39,20,-36,10,-36);poly("#657c87",15,-34,20,-35,20,-26,17,-23,14,-27);ctx.restore()}
 poly("#30424c",-10,-53,-7,-62,2,-65,10,-60,12,-50,7,-44,0,-41,-8,-45);
 poly("#bbc8c8",-9,-54,-6,-60,1,-63,7,-60,9,-55,1,-52);
 poly("#849da8",-9,-53,1,-52,10,-54,8,-47,1,-43,-7,-47);
 poly("#23313c",-8,-53,0,-52,10,-54,9,-51,1,-49,-7,-50);
 line("#c8b482",1.6,1,-51,1,-45);
 poly("#bb5147",-2,-63,0,-70,9,-75,17,-73,22,-67,14,-69,8,-67,4,-62);
 if(weapon.style==="twins")sword(-17,-25,-.8,true,weapon.bonus>2);
 else {poly("#7d633c",-20,-35,-10,-34,-11,-21,-17,-15,-23,-22,-25,-31);poly("#405664",-19,-32,-13,-32,-14,-23,-17,-19,-21,-24,-22,-30);line("#d6b77e",1.4,-18,-30,-17,-22)}
 sword(17,raised?-61:-26,raised?-.25:.65+slash,weapon.style==="twins",weapon.bonus>2);ctx.restore()
}
function castle(x,y,s,level){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 function tower(tx,ty,w,h){rect("#485966",tx,ty,w,h);rect("#748087",tx,ty,w*.24,h);rect("#374a56",tx+w*.75,ty,w*.25,h);
 poly("#383d4c",tx-5,ty,tx+w/2,ty-30,tx+w+5,ty);poly("#6c5861",tx-5,ty,tx+w/2,ty-30,tx+w*.42,ty);
 for(let j=8;j<h-4;j+=19){rect("#253741",tx+w*.44,ty+j,3,8);rect("#e9bc76",tx+w*.44,ty+j+3,2,4)}}
 rect("#596b76",-68,-37,134,44);for(let i=-68;i<68;i+=12)rect("#596b76",i,-42,7,8);
 tower(-58,-60,18,66);tower(-10,-82,25,88);tower(39,-54,18,62);
 if(level>=3)tower(68,-68,18,75);if(level>=5)tower(-90,-80,22,86);
 line("#423e47",1,2,-112,2,-128);poly("#a9554d",3,-127,20,-124,11,-121,3,-121);
 ctx.restore()
}
function campCrate(x,y,size){
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);poly("#665743",-11,-9,7,-9,7,4,-11,4);poly("#554c3d",7,-9,13,-12,13,0,7,4);poly("#917b59",-11,-9,-5,-13,13,-12,7,-9);line("#a18b62",2,-9,-8,5,2);rect("#47483e",-9,-9,2,13);rect("#47483e",5,-9,2,13);ctx.restore()
}
function campArt(t,hero,raised=false){
 const w=width,h=height;
 const sky=ctx.createLinearGradient(0,0,0,h*.68);sky.addColorStop(0,"#334653");sky.addColorStop(.6,"#beb0a1");sky.addColorStop(1,"#e7be99");rect(sky,0,0,w,h);
 oval("#f2d4a0",w*.73,h*.20,24,24);glow(w*.73,h*.20,70,"#f3c79855");
 for(let layer=0;layer<3;layer++){const base=h*(.36+layer*.073),pts=[0,h*.72];for(let i=0;i<=50;i++){const y=base+Math.sin(i*.53+layer*2)*h*.046+Math.cos(i*1.23+layer)*h*.026;pts.push(w*i/50,y)}poly(["#89929a","#727e88","#566b74"][layer],...pts,w,h*.72)}
 castle(w*.49,h*.49,Math.min(w/345,h/342),hero.level);
 for(let i=0;i<68;i++){let x=w*i/67,y=h*(.54+.027*Math.sin(i*2)),z=8+(i*23%28);poly("#344d53",x-z*.34,y,x,y-z,x+z*.34,y)}
 const ground=ctx.createLinearGradient(0,h*.52,0,h);ground.addColorStop(0,"#738379");ground.addColorStop(1,"#344c49");poly(ground,0,h*.53,w,h*.52,w,h,0,h);
 poly("#928a73",w*.48,h*.52,w*.54,h*.52,w*.78,h,w*.18,h);for(let i=0;i<230;i++){const x=((i*139.27)%997)/997*w,y=h*(.55+((i*113)%461)/1040);line("#40595277",1.4,x,y,x+2+(i%8),y-1)}
 const px=w*.80,py=h*.57,ps=Math.min(w/410,h/550)*.95;
 ctx.save();ctx.translate(px,py);ctx.scale(ps,ps);glow(0,-26,58,"#70d9c888");oval("#293c42",0,0,30,6);oval("#496568",0,-23,25,32);oval("#b6ba9e",0,-24,21,29);oval("#254b52",0,-24,17,25);oval("#64bcb3",0,-24,12+Math.sin(t*2),21);oval("#294751",0,-24,8,17);ctx.restore();
 campCrate(w*.18,h*.66,1.05);campCrate(w*.15,h*.67,.74);
 const cx=w*.32,cy=h*.72;glow(cx,cy-8,36,"#ff9b4655");poly("#bf693f",cx-7,cy,cx-8,cy-9,cx-4,cy-8,cx+1,cy-23+Math.sin(t*9)*2,cx+3,cy-12,cx+7,cy-16,cx+7,cy);poly("#ffcc78",cx-4,cy,cx,cy-13,cx+4,cy);
 knightAt(w*.5,h*.78,Math.min(w/208,h/254),hero.bag[hero.gear.weapon],t,false,raised,hero.bag[hero.gear.armor].bonus)
}
