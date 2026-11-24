"use strict";
let walker=null,groundGoal=null,nearAction=null,bellTime=-20;
function inYard(){return hero.base==="castle"}
function homePose(){return inYard()?{x:.5,y:.85}:{x:.53,y:.91}}
function canExplore(){return !combat&&!travel&&!hero.expedition&&!layoutDialog.open&&!dialog.open}
function floorEdge(x){
 if(inYard())return (width/height<.95?.693:.783)+.035*Math.abs(x-.52);
 const d=mooring(width,height);
 return Math.min(.93,d.y/height+.019+Math.max(0,.3-x)*.29)
}
function moveOnGround(dt){
 if(!canExplore())return;
 const pos=walker||(inYard()&&atAnvil?{x:.35,y:width/height<.95?.705:.80}:homePose());
 let dx=stick.x+Number(keys.has("KeyD")||keys.has("ArrowRight"))-Number(keys.has("KeyA")||keys.has("ArrowLeft"));
 let dy=stick.y+Number(keys.has("KeyS")||keys.has("ArrowDown"))-Number(keys.has("KeyW")||keys.has("ArrowUp"));
 if(dx||dy)groundGoal=null;
 if(groundGoal){
   dx=(groundGoal.x-pos.x)*width;dy=(groundGoal.y-pos.y)*height;
   const d=Math.hypot(dx,dy);if(d<6){groundGoal=null;dx=dy=0}else{dx/=d;dy/=d}
 }
 const mag=Math.hypot(dx,dy);
 if(!walker&&mag<.08)return;
 if(!walker){$("field").classList.add("exploring");atAnvil=false;walker={...pos,vx:0,vy:0,face:1,step:0,rise:0}};
 const a=walker,speed=Math.min(width*.57,height*.51,450),acc=1-Math.exp(-dt*(mag?12:18));
 a.rise=Math.min(1,a.rise+dt*4);
 a.vx+=(dx/Math.max(1,mag)*speed-a.vx)*acc;a.vy+=(dy/Math.max(1,mag)*speed*.75-a.vy)*acc;
 const nx=clamp(a.x+a.vx*dt/width,.05,.95),ny=clamp(a.y+a.vy*dt/height,floorEdge(nx),.98);
 const stride=Math.hypot((nx-a.x)*width,(ny-a.y)*height);
 const oldStep=Math.floor(a.step/Math.PI);
 a.walk=stride>dt*9;a.step+=stride/Math.max(.6,Math.min(width/230,height/300))*.135;
 if(a.walk&&Math.floor(a.step/Math.PI)!==oldStep)soundscape.play("step",.16);
 if(a.walk){const target=clamp(-a.vy/(Math.hypot(a.vx,a.vy)||1),-1,1);a.turn=(a.turn||0)+(target-(a.turn||0))*acc}
 if(Math.abs(a.vx)>8)a.face=Math.sign(a.vx);
 a.x=nx;a.y=ny;
 const dock=mooring(width,height),fire=homePose();
 const spots=inYard()?[[.32,width/height<.95?.72:.80,"Кузнец","smith"],[.77,width/height<.95?.70:.80,"Лестница","stairs"],[.51,floorEdge(.51),"К лодке","returnCamp"]]:[[dock.x/width,floorEdge(.34),"В лодку","keep"]];
 spots.push([fire.x,fire.y,"Сесть у огня","rest"]);
 if(hero.level>=10)spots.push([inYard()?.86:.79,inYard()?.88:floorEdge(.79),"Разлом","portal"]);
 nearAction=spots.filter(v=>v[3]!=="stairs"||hero.metSmith&&hero.chapter<3)
 .map(v=>({v,d:Math.hypot((v[0]-a.x)*width,(v[1]-a.y)*height)})).sort((l,r)=>l.d-r.d)[0];
 if(!nearAction||nearAction.d>Math.max(32,speed*.21))nearAction=null;
 const btn=$("groundUse");btn.hidden=!nearAction;if(nearAction)btn.textContent=nearAction.v[2]
}
function useGround(){
 if(!canExplore()||!nearAction)return;
 const id=nearAction.v[3];
 if(id==="rest"){resetGround();return}
 $(id).click()
}
function resetGround(){$("field").classList.remove("exploring");walker=null;nearAction=null;groundGoal=null;$("groundUse").hidden=true}
function drawWalker(t,s){
 if(!walker)return false;
 const a=walker,size=s*(.85+(a.y-.75)*.9);
 ctx.save();ctx.translate(a.x*width,a.y*height);ctx.scale(a.face,1);
 knightAt(0,0,size,weapon(),a.walk?a.step/11:t,a.walk,false,armor().bonus,0,1-a.rise,(a.turn||0)*-1.65);
 ctx.restore();
 if(groundGoal){ctx.strokeStyle="#eeddb78c";ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(groundGoal.x*width,groundGoal.y*height,7,2.8,0,0,7);ctx.stroke()}
 return true
}
function bellPoint(){
 const tall=width/height<.87,ratio=tall?1120/1920:5504/3072;
 const dw=Math.max(width,height*ratio),dh=dw/ratio;
 return {x:width*.5+((tall?.16:.145)-.5)*dw,y:height*.5+((tall?.455:.335)-.5)*dh}
}
function ringFordBell(){
 const t=performance.now()/1000;if(t-bellTime<1)return;bellTime=t;
 soundscape.play("bell");
}
function fordBirds(t){
 const age=t-bellTime;if(age<0||age>5||reducedMotion.matches)return;
 const bell=bellPoint();
 for(let i=0;i<5;i++){const f=Math.max(0,age-i*.11),x=bell.x+f*(42+i*6)+i*3,y=bell.y-Math.sin(Math.min(1,f/3)*1.55)*(28+i*7)-f*6,wing=Math.sin(t*12+i)*3;
 line("#48564d",1.3,x-4,y+wing,x,y);line("#48564d",1.3,x,y,x+4,y+wing)}
}
let groundTouch=null,dragEnded=0;
stage.addEventListener("pointerdown",e=>{
 if(e.pointerType==="mouse"||!canExplore())return;
 const box=stage.getBoundingClientRect(),x=(e.clientX-box.left)/width,y=(e.clientY-box.top)/height;
 if(y<floorEdge(x)-.025||groundTouch)return;
 groundTouch={id:e.pointerId,x:e.clientX,y:e.clientY,drag:false};stage.setPointerCapture(e.pointerId)
});
stage.addEventListener("pointermove",e=>{
 if(!groundTouch||e.pointerId!==groundTouch.id)return;
 const dx=e.clientX-groundTouch.x,dy=e.clientY-groundTouch.y,d=Math.hypot(dx,dy);
 if(!groundTouch.drag&&d<9)return;
 groundTouch.drag=true;stick={x:dx/Math.max(34,d),y:dy/Math.max(34,d)}
});
function releaseGroundTouch(e){
 if(!groundTouch||e.pointerId!==groundTouch.id)return;
 if(groundTouch.drag)dragEnded=performance.now();
 groundTouch=null;stick={x:0,y:0}
}
stage.addEventListener("pointerup",releaseGroundTouch);
stage.addEventListener("pointercancel",releaseGroundTouch);
stage.addEventListener("lostpointercapture",releaseGroundTouch);
