"use strict";
// Faceted armour sections are described by horizontal elliptical cross-sections.
// Coordinates are in model space: the face and the shield point toward negative Y.
function knightAt(x,y,size,weapon,time,walking=false,raised=false,armor=1,slash=0,seated=0){
 const faces=[],yaw=-.46-.62*seated,sy=Math.sin(yaw),cy=Math.cos(yaw);
 const shade=(rgb,n)=>"rgb("+rgb.map((v,i)=>Math.min(255,Math.round(v*(.63+.46*n)+(i===0?12:4)*Math.max(0,n)))).join(",")+")";
 const iron=armor>1?[145,159,172]:[121,137,161],edge=[186,196,208],dark=[55,64,87],ox=[79,81,98],red=[150,36,51],fold=[93,30,48],brass=[200,155,94],hide=[81,55,55];
 const project=([a,b,z])=>{b-=Math.max(0,z-22)*.16*seated;return [a*cy-b*sy,(a*sy+b*cy)*.19-z,a*sy+b*cy-z*.19]};
 function face(points,color){
  const p=points.map(project),a=points[0],u=points[1].map((v,i)=>v-a[i]),v=points[2].map((n,i)=>n-a[i]);
  const nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0],d=Math.hypot(nx,ny,nz)||1;
  const light=(-nx*.55-ny*.55+nz*.58)/d;
  faces.push({p,z:p.reduce((s,t)=>s+t[2],0)/p.length,color:shade(color,light)})
 }
 function shell(cx,baseY,rings,color,n=10){
  const layers=rings.map(([z,rx,ry,off=0])=>Array.from({length:n},(_,i)=>{const a=(i+.5)*Math.PI*2/n;return [cx+rx*Math.cos(a),baseY+off+ry*Math.sin(a),z]}));
  for(let j=1;j<layers.length;j++)for(let i=0;i<n;i++){const k=(i+1)%n;face([layers[j-1][i],layers[j-1][k],layers[j][k],layers[j][i]],color)}
  face(layers.at(-1),color)
 }
 const stride=walking?Math.sin(time*11):0,hip=34-14*seated,torso=hip+2+Math.sin(time*2)*.35;
 for(const sign of [-1,1]){
  const a=sign*5.6,footY=-(26+sign*4)*seated+stride*sign*5;
  shell(a,footY,[[.4,4,6,-2],[2.7,4.3,7,-2],[5,3.1,4]],dark);
  shell(a,footY,[[4,2.8,3],[8,3.3,3.4],[15,4.2,4,2],[18,3.6,3.8,2]],iron,8);
  shell(a,footY+2,[[15,3.7,3.7],[18,4.5,4.6],[20,3.2,3.4]],edge,8);
  shell(a,0,[[18,3.8,4,footY+2],[hip+1,4.8,5.1,0]],iron,8)
 }
 // The split mantle has deep folds behind the shoulders.
 for(let i=0;i<7;i++){
  const u=i/7,v=(i+1)/7;
  const hem=k=>[-16+32*k,8+(k%1)*3+Math.sin(k*22)*2,hip-20+seated*13+Math.sin(k*21)*2];
  face([[-10+20*u,5,torso+23],hem(u),hem(v),[-10+20*v,5,torso+23]],i%2?fold:red)
 }
 shell(0,0,[[hip-6,10,6],[hip,10,6.5],[hip+3,9,6]],dark);
 for(let i=0;i<3;i++)shell(0,0,[[torso+i*3-2,10-i*.1,7],[torso+i*3,10.6,7.2],[torso+i*3+1,9.6,6.7]],i===1?ox:iron);
 shell(0,0,[[torso+6,9,6.5],[torso+12,12.5,8.6],[torso+19,12,7],[torso+22,7,4.8]],iron,12);
 face([[-4,-8,torso+17],[2,-8.8,torso+17],[4,-8.4,torso+12],[0,-8.8,torso+8],[-3,-8.2,torso+12]],red);
 for(const sign of [-1,1]){
  const X=sign;
  face([[X*4,-8.4,torso+10],[X*8,-7.6,torso+16],[X*10,-5.5,torso+19],[X*8.2,-7.3,torso+14]],edge);
 }
 shell(0,0,[[hip-1,10.5,7],[hip+2,10.5,7]],hide);
 const belt=hero.bag[hero.gear.belt];
 if(belt){
  shell(0,0,[[hip-2,11,7.8],[hip+2.8,11,7.8]],hide);
  shell(8,-6,[[hip-7,2.8,2],[hip-5,3.4,2.3],[hip+.5,3.2,2]],hide,8);
  face([[-3,-8,hip-2],[3,-8,hip-2],[3,-8,hip+2],[-3,-8,hip+2]],brass)
 }
 face([[-2,-7.5,hip-1],[2,-7.5,hip-1],[2,-7.5,hip+2],[-2,-7.5,hip+2]],brass);
 for(const sign of [-1,1]){
  const a=sign*12.4;
  shell(a,0,[[torso+10,4.3,4.7],[torso+16,6.2,6.5],[torso+20,5.7,6],[torso+23,2.8,3]],iron);
  shell(a,0,[[torso+11,5.2,5.2],[torso+12.3,5.8,6.1]],brass);
  shell(a+sign*1.8,-1,[[torso,3.4,3.6,-2-seated*9],[torso+7,4,4.3],[torso+10,3.8,4]],dark,8);
  shell(a+sign*2.4,-4-14*seated,[[torso-7,2.6,2.6],[torso-5,3.4,3.3],[torso-2,3,3.5]],dark,8);
  shell(a+sign*2.1,-3-10*seated,[[torso-3,3.1,3.2],[torso+2,3.9,4],[torso+5,3.4,3.6]],iron,8)
 }
 const neck=torso+22;
 shell(0,0,[[neck-3,6,5],[neck,7,5.6],[neck+1,6,5.2]],dark);
 shell(0,0,[[neck,5.6,5],[neck+5,8,7],[neck+12,8.2,7.3],[neck+17,6.6,6.1],[neck+20,2.6,3.1]],iron,12);
 const mask=(u,v,z)=>[u,v,z+neck];
 face([mask(-7,-4,12),mask(0,-9,10),mask(7,-4,12),mask(6,-6,8),mask(0,-9.4,7),mask(-6,-6,9)], [27,30,43]);
 for(const sign of [-1,1]){
  face([mask(0,-9.5,7.4),mask(sign*7,-5.6,9),mask(sign*6.4,-5.4,4),mask(0,-8,0)],sign<0?edge:iron);
  face([mask(0,-9.5,11),mask(sign*7.6,-5.4,13.2),mask(sign*7,-5.9,12),mask(0,-9.6,10)],brass);
  for(let i=1;i<4;i++){const a=i*1.45;face([mask(sign*a,-8.9+a*.39,6.4),mask(sign*(a+.55),-8.7+a*.39,6.6),mask(sign*(a+.55),-8.4+a*.39,4.1)],dark)}
 }
 for(let i=0;i<5;i++){
  const a=(i-2)*1.4,wave=Math.sin(time*2+i*.65)*1.2;
  face([[a,0,neck+19],[a-1,1,neck+23],[a+4,6,neck+26-i*.4],[a+8,12,neck+25],[a+9+wave,15,neck+14-i],[a+4,10,neck+21]],i%2?red:fold)
 }
 if(weapon.style!=="twins"&&seated<.35){
  const sx=-15,front=-9,mid=torso+4;
  const shield=(dx,dz,f=0)=>[sx+dx,front+f,mid+dz];
  const outline=[[-6,9],[0,11],[7,8],[6,-3],[1,-12],[-5,-6]];
  face(outline.map(([a,b])=>shield(a,b)),brass);
  face(outline.map(([a,b])=>shield(a*.81,b*.83,-1)),red);
  face([shield(-3,3,-2),shield(1,1,-2),shield(4,5,-2),shield(2,-1,-2),shield(0,-4,-2)],edge)
 }
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);oval("#090e1d80",0,1,18,4);
 faces.sort((a,b)=>b.z-a.z);
 for(const f of faces)poly(f.color,...f.p.flatMap(p=>p.slice(0,2)));
 if(seated>.35){ctx.restore();return}
 const angle=.32+seated*1.03+slash;
 sword(13+Math.sin(angle)*6,raised?-torso-25:-torso+6-Math.cos(angle)*6,angle,weapon.style==="twins",weapon.bonus>2);
 if(weapon.style==="twins")sword(-13,-torso,-.75-slash*.5,true,weapon.bonus>2);
 ctx.restore()
}
