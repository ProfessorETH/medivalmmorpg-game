const canvas = document.getElementById("world"), ink = canvas.getContext("2d");
const knight = [
"        rrrr        ","      rrRrr         ","     ssSSs          ","    sSSSWWs         ","    sKKKKKs         ","     sWKKss         ","    RRssSSs         ","   RrrsSSSSs        ","  RrrsSSWsSss       ","  RrrsSSSssss       "," RRrrsGggGsss       "," RRrrsKKKss         "," RrrsssssSs         "," rr  sss ss         ","    sSs  sSs        ","   sSSs  sSSs       "];
const foe = ["      g  g     ","     gg  gg    ","    GGgggGG    ","    gRgggRg    ","     gWWWg     ","     KgggK     ","   gggKKgggg   ","  gg GggG  gg  ","  g  GGGG   g  ","     gg gg     ","    ggg ggg    "];
const colors={r:"#87394a",R:"#d36963",s:"#546579",S:"#95a6ac",W:"#e3d9bc",K:"#272c3a",G:"#bb9258",g:"#6d694b"};
function paint(color,x,y,w,h){ink.fillStyle=color;ink.fillRect(Math.round(x),Math.round(y),w,h)}
function polygon(color,points){ink.fillStyle=color;ink.beginPath();points.forEach(([x,y],i)=>i?ink.lineTo(x,y):ink.moveTo(x,y));ink.closePath();ink.fill()}
function sprite(map,x,y,scale){map.forEach((line,row)=>[...line].forEach((p,col)=>{if(colors[p])paint(colors[p],x+col*scale,y+row*scale,scale,scale)}))}
function landscape(battle,tier){
 let seed=94+tier;const rnd=()=>((seed=seed*16807%2147483647)/2147483647);
 const sky=ink.createLinearGradient(0,0,0,155);sky.addColorStop(0,battle?"#2a293e":"#655579");sky.addColorStop(.73,battle?"#8c5c61":"#dc9481");sky.addColorStop(1,"#ecc39a");paint(sky,0,0,384,210);
 paint("#f3c39a",252,35,26,24);paint("#f3c39a",255,32,20,30);
 for(let i=0;i<35;i++)paint("#dda598",rnd()*384,rnd()*80,4+rnd()*25,1);
 for(const [base,color] of [[98,"#887389"],[118,"#62596f"],[145,"#48485d"]]){
  let path=[[0,170],[0,base]];let x=0;while(x<385){x+=8+Math.floor(rnd()*13);path.push([x,base-38*rnd()])}polygon(color,[...path,[400,170]]);
 }
 function tower(x,y,w){paint("#3b3d50",x,y,w,153-y);paint("#505166",x,y,3,153-y);polygon("#39394c",[[x-3,y],[x+w/2,y-16],[x+w+3,y]]);for(let i=0;i<3;i++)paint("#cc966e",x+4,y+5+i*11,2,4)}
 paint("#414054",244,95,69,55);for(let x=244;x<318;x+=9)paint("#414054",x,90,5,8);tower(248,79,13);tower(273,65,17);tower(300,85,11);
 for(let i=0;i<56;i++){const x=rnd()*390,y=105+rnd()*44,h=8+rnd()*20;polygon("#303b49",[[x-6,y+h],[x,y-h],[x+6,y+h]])}
 polygon("#3e4144",[[0,142],[95,129],[168,144],[249,134],[384,151],[384,210],[0,210]]);
 polygon("#797165",[[0,169],[92,143],[215,150],[316,141],[384,150],[384,158],[228,156],[82,165],[0,192]]);
 for(let i=0;i<280;i++){let x=rnd()*384,y=148+rnd()*62;paint(i%3?"#4b4c49":"#70695a",x,y,1+rnd()*5,1)}
 for(const [x,y] of [[45,126],[67,131],[326,129],[350,138]]){paint("#38303a",x,y-41,2,46);polygon("#843e50",[[x+2,y-41],[x+19,y-39],[x+14,y-34],[x+19,y-31],[x+2,y-32]])}
}
let motionId=0;
function drawWorld(run,weapon,attack=false){
 const id=++motionId, start=performance.now(), animate=attack&&!matchMedia("(prefers-reduced-motion: reduce)").matches;
 function draw(now){if(id!==motionId)return;const t=animate?Math.min(1,(now-start)/330):1, swing=Math.sin(Math.PI*t);
 if(run)crypt(run.tier,run.room);else landscape(false,0);
 let x=run?122+Math.round(swing*23):162,y=96;
 sprite(knight,x,y,3);
 function blade(hx,hy,angle,length){ink.save();ink.translate(hx,hy);ink.rotate(angle);paint("#ccd3c8",-1,-length,3,length);paint("#8c989c",2,-length+3,2,length-3);paint("#c29358",-4,0,9,2);paint("#53454a",0,2,3,5);ink.restore()}
 blade(x+41,y+30,.43+swing*1.5,weapon==="twins"?19:31);if(weapon==="twins")blade(x+15,y+30,-.58+swing,17);
 if(!run){
 const glow=ink.createRadialGradient(213,135,1,213,135,24);
 glow.addColorStop(0,"#fca249a8");glow.addColorStop(1,"#ff913c00");
 paint(glow,189,111,48,48);paint("#574435",202,144,22,3);
 polygon("#c96639",[[204,143],[204,135],[208,137],[210,126],[213,132],[216,121],[219,138],[222,133],[220,144]]);
 polygon("#ffcd73",[[208,142],[211,136],[213,138],[215,131],[217,142]]);
 }
 if(run){const scale=run.room===4?4:3;sprite(foe,209+Math.round(swing*4),144-foe.length*scale,scale)}
 if(t<1)requestAnimationFrame(draw)}
 draw(start)
}
function crypt(tier,room){
 const stone=[["#4b4752","#66606a","#413d49"],["#3e4856","#5c6872","#353c48"],["#483d4b","#695263","#39323f"]][tier];
 paint(stone[2],0,0,384,210);
 for(let y=0;y<146;y+=10)for(let x=-18;x<384;x+=23){const offset=y%20?12:0;
 paint(stone[0],x+offset,y,22,9);paint(stone[1],x+offset+1,y,16,1)}
 for(let x=12;x<384;x+=72){
 polygon("#222331",[[x,134],[x,69],[x+5,52],[x+18,38],[x+30,52],[x+36,69],[x+36,134]]);
 for(let k=0;k<4;k++)paint("#343340",x+5+k*8,64,2,70);
 paint(stone[1],x-6,48,4,87);paint(stone[0],x-10,132,14,6)}
 paint("#373541",0,139,384,71);
 for(let y=139;y<211;y+=10)for(let x=-20;x<384;x+=40){let px=x+(y%20===9?20:0);paint("#504952",px,y,38,1);paint("#2c2b36",px,y,1,9)}
 for(const x of [69,291]){const glow=ink.createRadialGradient(x,91,2,x,91,44);glow.addColorStop(0,"#ed9c6075");glow.addColorStop(1,"#dd755500");paint(glow,x-44,47,88,88);paint("#312938",x-2,92,4,12);polygon("#e99158",[[x-5,93],[x-4,84],[x-1,86],[x+2,76-room%3],[x+5,89],[x+3,94]]);paint("#ffd899",x-1,87,3,6)}
}

