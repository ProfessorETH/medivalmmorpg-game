"use strict";
// Project the Blender mesh into small reusable pose frames for the 2D game canvas.
const actorFrames=new Map();
const actorShield=new Image();
actorShield.src="bogatyr-shield.webp";
let actorMesh=null;
function refreshActor(){
 actorFrames.clear();
 if(document.getElementById("paperKnight"))drawPaperKnight()
}
actorShield.onload=refreshActor;
fetch("bogatyr-mesh.json").then(response=>{
 if(!response.ok)throw Error(response.status);
 return response.json()
}).then(mesh=>{actorMesh=mesh;refreshActor()}).catch(error=>console.warn("Модель героя:",error));

function actorPose(walk,phase,seat,slash,raised){
 const stride=walk?Math.sin(phase):0;
 const pose={};
 function segment(key,parent,angle){
  const g=actorMesh.groups[key];if(!g)return;
  const [x,y,z]=g.pivot,base=parent?pose[parent](x,y,z):[x,y,z+(walk?Math.abs(stride)*32:Math.cos(phase)*6)-seat*430];
  const cs=Math.cos(angle),sn=Math.sin(angle);
  pose[key]=(a,b,c)=>[a-x+base[0],(b-y)*cs-(c-z)*sn+base[1],(b-y)*sn+(c-z)*cs+base[2]]
 }
 segment("torso",null,.08*walk+.10*seat);
 for(const key of ["cape","head","helmet"])segment(key,"torso",key==="cape"?-.10*walk:0);
 for(const side of ["L","R"]){
  const step=side==="L"?stride:-stride;
  const thigh=step*.60-seat*1.42,shin=thigh+Math.max(0,-step)*.82+seat*1.48;
  segment("upperLeg"+side,"torso",thigh);segment("shin"+side,"upperLeg"+side,shin);segment("foot"+side,"shin"+side,0);
  const arm=-step*.48-seat*.34-(side==="R"?(raised?1.8:slash*.55):.12);
  segment("upperArm"+side,"torso",arm);segment("forearm"+side,"upperArm"+side,arm-.16-seat*.68);
  segment("hand"+side,"forearm"+side,arm-.16-seat*.68)
 }
 return pose
}

function drawActorFrame(canvas,weapon,walk,phase,seat,yaw,slash,raised,gear,klass,zoom){
 const c=canvas.getContext("2d");c.translate(canvas.width/2,canvas.height-8);c.scale(zoom,zoom);
 const cs=Math.cos(yaw),sn=Math.sin(yaw),scale=.043;
 function view([x,y,z]){
  const side=x*cs-y*sn,depth=x*sn+y*cs;
  return [side*scale,(-depth*.20-z)*scale,depth-z*.20]
 }
 const posed=actorPose(walk,phase,seat,slash,raised),faces=[],colors=actorMesh.palette.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
 function tinted(rgb,name,key){
  if((gear.cloak||klass==="bellringer")&&(/cape/i.test(key)||/cloak|mantle|russet/i.test(name)))return [rgb[2]*.8,rgb[0]*.8,rgb[0]*.79];
  if(gear.armor&&/iron|steel|plate|lamell/i.test(name))return [rgb[0]*.88,rgb[1]*1.12,rgb[2]*1.18];
  if(gear.head&&key==="helmet")return [rgb[0]*.86,rgb[1]*1.17,rgb[2]*1.13];
  if((gear.hands&&key.startsWith("forearm")||gear.feet&&key.startsWith("foot"))&&!/skin/i.test(name))return [rgb[0]*1.4,rgb[1]*1.13,rgb[2]*.8];
  return rgb
 }
 for(const [key,g] of Object.entries(actorMesh.groups)){
  if(key==="helmet"&&klass==="bellringer"&&!gear.head)continue;
  const fn=posed[key]||posed.torso,points=[];
  for(let i=0;i<g.v.length;i+=3)points.push(view(fn(g.v[i],g.v[i+1],g.v[i+2])));
  const materials=colors.map((rgb,i)=>{
   const base=tinted(rgb,actorMesh.materials?.[i]||"",key);
   return Array.from({length:17},(_,step)=>"rgb("+base.map(channel=>Math.min(255,Math.round(channel*(.60+.02625*step)))).join(",")+")")
  });
  for(let i=0;i<g.f.length;i+=4){
   const a=points[g.f[i]],b=points[g.f[i+1]],d=points[g.f[i+2]];
   const cross=(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]);
   if(Math.abs(cross)<.014)continue;
   const ux=b[0]-a[0],uy=b[1]-a[1],uz=(b[2]-a[2])*scale,vx=d[0]-a[0],vy=d[1]-a[1],vz=(d[2]-a[2])*scale;
   const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=cross,len=Math.hypot(nx,ny,nz)||1;
   const light=.74+.28*Math.max(-.5,(nx*.37+ny*.65+nz*.65)*Math.sign(nz)/len);
   faces.push({depth:(a[2]+b[2]+d[2])/3,a,b,d,color:materials[g.f[i+3]][Math.round((light-.60)/.02625)]})
  }
 }
 if(klass==="bellringer"){
  const bell=view(posed.torso(-145,-95,930));
  overlay(bell,-44,()=>{
   c.rotate(walk?.23*Math.sin(phase):.08);c.strokeStyle="#855b39";c.lineWidth=1;c.beginPath();c.moveTo(0,-1);c.lineTo(0,2);c.stroke();
   c.fillStyle="#ca944b";c.beginPath();c.moveTo(-1.6,2);c.lineTo(1.6,2);c.lineTo(3.1,7);c.lineTo(-3.1,7);c.fill();
   c.fillStyle="#6b4736";c.fillRect(-2.9,6.5,5.8,1);c.fillRect(-.6,7.4,1.2,1)
  })
 }
 if(gear.belt){
  const buckle=view(posed.torso(0,-145,945));
  overlay(buckle,-24,()=>{c.fillStyle="#7e503c";c.fillRect(-6,-1.3,12,2.8);c.strokeStyle="#f0bf73";c.lineWidth=.8;c.strokeRect(-1.6,-1.4,3.2,2.8)})
 }
 const hand=side=>{
  const key="hand"+side,[x,y,z]=actorMesh.groups[key].pivot;
  return view(posed[key](x,y-45,z-55))
 };
 function overlay(point,offset,draw){faces.push({depth:point[2]+offset,draw:()=>{c.save();c.translate(point[0],point[1]);draw();c.restore()}})}
 if(gear.ring){
  overlay(hand("R"),-85,()=>{c.fillStyle="#8dd4ba";c.beginPath();c.arc(0,1,1.3,0,2*Math.PI);c.fill()})
 }
 const twin=weapon.style==="twins";
 if(!twin&&seat<.55&&actorShield.naturalWidth){
  overlay(hand("L"),-100,()=>{
   c.rotate(-.12-.16*seat+.06*Math.sin(phase)*walk);
   const h=42,w=h*actorShield.naturalWidth/actorShield.naturalHeight*(.62+.38*Math.abs(cs));
   c.drawImage(actorShield,-w*.5,-h*.38,w,h)
  })
 }
 if(seat<.55){
  const blade=(side,angle)=>overlay(hand(side),-75,()=>{const previous=ctx;ctx=c;try{sword(0,-3,angle,twin,weapon.bonus>1,weapon.name)}finally{ctx=previous}});
  blade("R",-.6-slash);if(twin)blade("L",.6+slash*.55)
 }
 faces.sort((a,b)=>b.depth-a.depth);
 for(const f of faces){
  if(f.draw){f.draw();continue}
  c.fillStyle=f.color;c.beginPath();c.moveTo(f.a[0],f.a[1]);c.lineTo(f.b[0],f.b[1]);c.lineTo(f.d[0],f.d[1]);c.closePath();c.fill();
  // Cover subpixel seams between adjacent coplanar Blender triangles.
  c.strokeStyle=f.color;c.lineWidth=.22;c.stroke()
 }
}
function blenderActor(x,y,size,weapon,time,walk,raised,slash,seat,turn){
 if(!actorMesh)return false;
 const slots=["armor","head","cloak","feet","hands","belt","ring"],gear={};
 for(const slot of slots){const item=hero.bag[hero.gear[slot]];gear[slot]=item&&(slot==="armor"?item.bonus>1:item.bonus>0||slot==="belt"||slot==="ring")}
 const steps=walk?12:4,phase=Math.floor((time*(walk?11:2)/(Math.PI*2)%1+1)%1*steps);
 seat=Math.round(seat*6)/6;turn=Math.round(turn*8)/8;slash=Math.round(slash*6)/6;
 const zoom=size>=2?4:2,key=[appearance(),...slots.map(k=>+!!gear[k]),weapon.name,weapon.bonus,zoom,phase,walk,raised,slash,seat,turn].join("|");
 let frame=actorFrames.get(key);
 if(!frame){
  frame=document.createElement("canvas");frame.width=130*zoom;frame.height=130*zoom;
  drawActorFrame(frame,weapon,walk,phase*2*Math.PI/steps,seat,-.46-.28*seat+turn,slash,raised,gear,appearance(),zoom);
  if(actorFrames.size>=28)actorFrames.delete(actorFrames.keys().next().value);
  actorFrames.set(key,frame)
 }
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);if(seat<.5)oval("#090e1d70",0,0,17,3.5);
 ctx.drawImage(frame,-65,-130+8/zoom,130,130);ctx.restore();return true
}
