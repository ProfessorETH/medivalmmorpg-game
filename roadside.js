"use strict";
// Camera tracks in room coordinates. The same projection is inverted for tap navigation.
function followRoom(view, x, y, vx, vy, scale, roomW, roomH, time) {
 const dt=Math.min(.08,Math.max(0,time-(view.time??time)));
 const lead=reducedMotion.matches?0:.17;
 const tx=x+vx*lead,ty=y+vy*lead;
 const ease=reducedMotion.matches?1:1-Math.exp(-dt*8);
 if(view.time===undefined){view.x=tx;view.y=ty}
 // Small foot corrections and idle motion stay within a screen-space dead zone.
 const margin=reducedMotion.matches?0:Math.min(width,height)*.026/scale;
 const dx=tx-view.x,dy=ty-view.y;
 view.x+=(dx-clamp(dx,-margin,margin))*ease;
 view.y+=(dy-clamp(dy,-margin*.7,margin*.7))*ease;view.time=time;
 view.scale=scale;
 view.left=clamp(width*.50-view.x*scale,width-roomW*scale,0);
 view.top=clamp(height*.54-view.y*scale,height-roomH*scale,0);
}
const roadPlate=new Image();
let roadside=null,roadLoading=false,arenaView={},arenaSubject=null;
function laneY(x){
 const metres=(x-900)*27/1800;
 return 500-(metres*.17+.65*Math.sin(metres*.45))*Math.SQRT1_2*1800/27;
}
function roadLimits(x){const middle=laneY(x);return [middle-69,middle+69]}
function leaveRoad(){
 roadside=null;resetGround();clearInput();hud();
}
async function enterRoad(){
 if(!canExplore()||roadLoading||inYard())return;
 roadLoading=true;
 try{
  if(!roadPlate.src)roadPlate.src="ferry-road.webp";
  await roadPlate.decode();
  if(!canExplore()||inYard()||roadside)return;
  resetGround();clearInput();
  roadside={x:505,y:laneY(505),vx:0,vy:0,step:0,face:1,turn:0,view:{}};
  hud();enterTitle("Колокольный брод","Тракт перевозчика")
 }catch{roadPlate.removeAttribute("src");$("hint").textContent="Тракт не загрузился. Нажми «На тракт», чтобы повторить."}
 finally{roadLoading=false}
}
function roadAction(){
 if(!roadside)return;
 if(roadside.x>1410){
  const dock=mooring(width,height);
  depart("castle");
  travel.origin={x:dock.x/width,y:floorEdge(dock.x/width)};
  return
 }
 if(roadside.x<545){leaveRoad();return}
 if(Math.abs(roadside.x-1385)<110){ringFordBell()}
}
function roadMove(dt){
 const a=roadside;
 let dx=stick.x+Number(keys.has("KeyD")||keys.has("ArrowRight"))-Number(keys.has("KeyA")||keys.has("ArrowLeft"));
 let dy=stick.y+Number(keys.has("KeyS")||keys.has("ArrowDown"))-Number(keys.has("KeyW")||keys.has("ArrowUp"));
 if(dx||dy)a.goal=null;
 if(a.goal){
  dx=a.goal.x-a.x;dy=a.goal.y-a.y;const length=Math.hypot(dx,dy);
  if(length<6){a.goal=null;dx=dy=0}else{dx/=length;dy/=length}
 }
 const mag=Math.max(1,Math.hypot(dx,dy)),ease=1-Math.exp(-dt*16);
 a.vx+=(dx/mag*260-a.vx)*ease;a.vy+=(dy/mag*220-a.vy)*ease;
 const x=clamp(a.x+a.vx*dt,365,1510),[lo,hi]=roadLimits(x),y=clamp(a.y+a.vy*dt,lo,hi);
 const dist=Math.hypot(x-a.x,y-a.y),phase=a.step;
 a.walk=dist>dt*8;a.step+=dist*.072;
 if(a.walk){if(Math.abs(x-a.x)>.03)a.face=Math.sign(x-a.x);a.turn+=((y-a.y)/(dist||1)*1.25-a.turn)*ease}
 if(Math.floor(phase/Math.PI)!==Math.floor(a.step/Math.PI))soundscape.play("step",.14);
 a.x=x;a.y=y;
 const use=$("groundUse"),label=x>1410?"Переправиться в замок":x<545?"К костру":Math.abs(x-1385)<110?"Ударить в колокол":"";
 use.hidden=!label;if(label)use.textContent=label;
}
function roadTap(e){
 const a=roadside,v=a.view,box=stage.getBoundingClientRect();
 if(!v.scale)return;
 const x=clamp((e.clientX-box.left-v.left)/v.scale,365,1510);
 const [lo,hi]=roadLimits(x);a.goal={x,y:clamp((e.clientY-box.top-v.top)/v.scale,lo,hi)}
}
function roadArt(t){
 const a=roadside,v=a.view,scale=Math.max(width/1280,height/730);
 followRoom(v,a.x,a.y-27,a.vx,a.vy,scale,1800,1000,t);
 ctx.save();ctx.translate(v.left,v.top);ctx.scale(scale,scale);
 ctx.drawImage(roadPlate,0,0,1800,1000);
 if(!reducedMotion.matches){
  for(let i=0;i<12;i++){
   const phase=(t*.29+i*.17)%1;
   ctx.globalAlpha=Math.sin(phase*Math.PI)*.25;
   const x=520+(i*177)%1180,y=124+(i*31)%94;
   line("#e8e5bd",1.3,x,y,x+15*phase,y)
  }ctx.globalAlpha=1;
 }
 if(!reducedMotion.matches){
  for(let i=0;i<8;i++){
   const u=(t*.105+i*.293)%1,origin=240+(i*239)%1420;
   const px=origin+u*65+Math.sin(u*8+i)*13,py=laneY(origin)-115+u*156;
   ctx.save();ctx.globalAlpha=.64*Math.sin(Math.PI*u);ctx.translate(px,py);ctx.rotate(u*5+i);
   oval(i%2?"#ae8549":"#b2a052",0,0,3.5,1.4);ctx.restore()
  }
 }
 if(a.goal){
  ctx.strokeStyle="#ffeac1";ctx.lineWidth=1.7;ctx.beginPath();ctx.ellipse(a.goal.x,a.goal.y,8,4,0,0,Math.PI*2);ctx.stroke()
 }
 ctx.translate(a.x,a.y);ctx.scale(a.face,1);
 knightAt(0,0,1.05,weapon(),a.walk?a.step/11:t,a.walk,false,armor().bonus,0,0,a.turn);
 ctx.restore()
}
const campView={zoom:1,left:0,top:0};
let journeyFocus=null;
function trackJourney(x,y,zoom){
 if(travel)journeyFocus={path:travel,x:x/width,y:y/height,zoom};
}

function campCamera(dt){
 const a=!combat&&!travel&&!roadside?walker:null;
 const focus=travel&&journeyFocus?.path===travel?journeyFocus:null;
 const target=reducedMotion.matches?1:focus?focus.zoom:a?1.16:1;
 const k=1-Math.exp(-dt*6);
 campView.zoom+=(target-campView.zoom)*k;
 if(target===1&&campView.zoom<1.001)campView.zoom=1;
 const z=campView.zoom;
 const left=clamp(width*.5-(a?a.x*width+a.vx*.13:(focus?.x??.5)*width)*z,width-width*z,0);
 const top=clamp(height*.59-(a?a.y*height+a.vy*.10:(focus?.y??.5)*height)*z,height-height*z,0);
 campView.left=clamp(campView.left+(left-campView.left)*k,width-width*z,0);
 campView.top=clamp(campView.top+(top-campView.top)*k,height-height*z,0);
 if(combat||roadside){campView.zoom=1;campView.left=campView.top=0}
 if(campView.zoom===1&&!campView.positioned)return;
 for(const id of ["portal","keep","smith","stairs","returnCamp","portrait"]){
  const el=$(id);
  if(campView.zoom===1){el.style.translate="";continue}
  if(!el.hidden)el.style.translate=(campView.left+el.offsetLeft*(z-1))+"px "+(campView.top+el.offsetTop*(z-1))+"px";
 }
 campView.positioned=campView.zoom!==1;
}
function campPointer(e){
 const box=stage.getBoundingClientRect(),v=campView;
 return {x:(e.clientX-box.left-v.left)/(width*v.zoom),y:(e.clientY-box.top-v.top)/(height*v.zoom)}
}
