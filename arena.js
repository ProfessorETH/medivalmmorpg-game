"use strict";
const $=id=>document.getElementById(id);
const key="ash-knight-v1", dialog=$("sheet"), content=$("inside");
const makeItem=(kind,name,bonus,style=null)=>({kind,name,bonus,style});
const fresh=()=>({name:"Странник",level:1,xp:0,points:0,power:1,agility:1,mind:1,coins:0,gear:{weapon:0,armor:2},bag:[makeItem("weapon","Длинный меч",1,"sword"),makeItem("weapon","Парные клинки",1,"twins"),makeItem("armor","Походная кольчуга",1)],run:null});
let hero;try{hero=JSON.parse(localStorage.getItem(key))||fresh()}catch{hero=fresh()}
hero.shards??=0;hero.expedition??=null;
const weapon=()=>hero.bag[hero.gear.weapon], armor=()=>hero.bag[hero.gear.armor];
const maxHp=()=>38+hero.level*3+armor().bonus*3;
function persist(){try{localStorage.setItem(key,JSON.stringify(hero))}catch{$("saveError").textContent="Устройству не удалось сохранить прогресс."}}
function xp(n){hero.xp+=n;while(hero.xp>=hero.level*18){hero.xp-=hero.level*18;hero.level++;hero.points++}}
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const btn=(label,action,css="")=>'<button class="'+css+'" data-action="'+action+'">'+label+'</button>';
let raisedUntil=0;
let keys=new Set(),stick={x:0,y:0},pointer=null,screen="",combat=null,effects=[],swing=null,prev=0,saveTime=0;
const zoneNames=["Казематы брода","Склеп знаменосца","Обсидиановый бастион"];
const rewards=["Лечение +12 ♥","Заточка +2 урона","Оберег +1 защиты"];
function routes(){const kinds=[0,1,2];const n=Math.floor(Math.random()*3);const pair=[{elite:false,kind:kinds[n]},{elite:true,kind:kinds[(n+1+Math.floor(Math.random()*2))%3]}];return Math.random()<.5?pair:pair.reverse()}
function hud(){
 const r=hero.expedition;
 $("area").textContent=r?"Северное пограничье · зал "+r.room+"/3":"Северное пограничье · убежище "+(hero.level>=5?"III":hero.level>=3?"II":"I");
 $("title").textContent=r?zoneNames[r.tier]:"Замок переправы";
 $("gold").textContent="◈ "+hero.coins;
 $("vitals").textContent=r?"♥ "+Math.ceil(r.hp)+"/"+maxHp()+"　✦ "+r.energy+"/3"+(combat?"　Враги: "+combat.mobs.length:""):hero.name+"　·　ур. "+hero.level;
 for(const id of ["portrait","portal"])$(id).hidden=!!r;
 $("pause").hidden=!combat;$("stick").hidden=!combat;
 $("venture").textContent=r?"✧　Поход":"⚔　В поход";
 $("hint").textContent=r?"Движение: джойстик, WASD или стрелки. Удары и руна срабатывают сами.":"Коснись рыцаря, чтобы осмотреть его, или войди в портал.";
}
function clearInput(){keys.clear();pointer=null;stick={x:0,y:0};$("stick").firstElementChild.style.transform=""}
function show(page){
 clearInput();screen=page;const r=hero.expedition;
 let html="";
 if(page==="hero"){
 html='<small>Рыцарь переправы</small><h2>'+safe(hero.name)+'</h2><p>Уровень '+hero.level+' · Опыт '+hero.xp+'/'+(18*hero.level)+' · Свободных очков '+hero.points+'</p>';
 for(const [k,title] of [["power","Сила"],["agility","Ловкость"],["mind","Интеллект"]])html+='<div class="row">'+title+' · '+hero[k]+(hero.points?btn("+1","stat:"+k):"")+'</div>';
 html+='<label>Имя<input id="knightName" maxlength="24" value="'+safe(hero.name)+'"></label>'+btn("Сохранить имя","name");
 }else if(page==="bag"){
 html='<small>Снаряжение</small><h2>Походная сумка</h2><p>Осколки руды · '+hero.shards+'</p>';
 hero.bag.forEach((it,i)=>{const worn=hero.gear[it.kind]===i;html+='<div class="row"><div><strong>'+safe(it.name)+'</strong><span>'+(it.kind==="armor"?"Защита":"Урон")+' +'+it.bonus+'</span></div>'+(worn?"Надето":r?"В лагере":btn("Надеть","equip:"+i))+'</div>'});
 }else if(page==="zones"){
 html='<small>Карта переправы</small><h2>Куда отправимся?</h2>';
 zoneNames.forEach((name,i)=>{const lvl=i*2+1;html+=hero.level>=lvl?btn(name+'<span>Уровень '+lvl+' · 3 зала</span>',"zone:"+i,"route"):'<button class="route" disabled>'+name+' · ур. '+lvl+'</button>'});
 if(hero.run)html+='<p><a href="classic.html">Продолжить сохранённый пошаговый поход</a></p>';
 }else if(page==="routes"&&r){
 html='<small>Зал '+r.room+' из 3 · '+Math.ceil(r.hp)+' ♥</small><h2>Развилка</h2>';
 r.roads.forEach((road,i)=>{const name=r.room===3?"Хранитель брода":road.elite?"Багровые стражи":"Болотные бесы";const prize=r.room===3?(road.elite?"Редкая вещь +2 к качеству":"Постоянная экипировка"):roadReward(road);
 html+=btn((i?"Направо":"Налево")+' · '+name+'<span>'+(road.elite?"Элита · больше здоровья и урона":"Обычный бой")+'<br>Добыча: '+prize+'</span>',"road:"+i,"route")});
 }else if(page==="pause"){
 html='<h2>Поход приостановлен</h2>'+btn("Продолжить","close","primary")+" "+btn("Отступить в лагерь","retreat");
 }else if(page==="prize"){
 html='<small>Хранитель повержен</small><h2>'+safe(hero.trophy.name)+'</h2><p>Качество +'+hero.trophy.bonus+' · Вещь уже в сумке.</p>'+btn("Надеть сейчас","wearPrize","primary")+" "+btn("Оставить в сумке","close")
 }
 content.innerHTML=html;if(!dialog.open)dialog.showModal();
}
function closeSheet(){if(dialog.open)dialog.close();screen="";clearInput();hud()}
function roadReward(road){return road.elite?["Лечение +20 ♥","Заточка +4 урона","Оберег +2 защиты"][road.kind]:rewards[road.kind]}
function navigate(){if(combat)show("pause");else if(hero.expedition)show("routes");else show("zones")}
$("portrait").onclick=$("character").onclick=()=>show("hero");$("inventory").onclick=()=>show("bag");$("portal").onclick=$("venture").onclick=navigate;$("pause").onclick=()=>show("pause");$("close").onclick=closeSheet;
dialog.addEventListener("cancel",e=>{e.preventDefault();closeSheet()});
content.onclick=e=>{
 const b=e.target.closest("[data-action]");if(!b)return;const [act,arg]=b.dataset.action.split(":");const idx=Number(arg);
 if(act==="zone"&&!hero.expedition){hero.expedition={tier:idx,room:1,hp:maxHp(),energy:0,force:0,ward:0,roads:routes(),battle:null};$("flash").textContent="";show("routes")}
 if(act==="road"&&!combat&&hero.expedition){begin(idx);closeSheet()}
 if(act==="name"){const s=$("knightName").value.trim();if(s)hero.name=s;show("hero")}
 if(act==="stat"&&hero.points&&["power","agility","mind"].includes(arg)){hero[arg]++;hero.points--;show("hero")}
 if(act==="equip"&&!hero.expedition){hero.gear[hero.bag[idx].kind]=idx;raisedUntil=performance.now()+1600;closeSheet()}
 if(act==="wearPrize"){hero.gear[hero.trophy.kind]=hero.trophy.index;raisedUntil=performance.now()+1800;closeSheet()}
 if(act==="retreat"){end(false,"Ты вернулся к костру.");closeSheet()}
 if(act==="close")closeSheet();persist();hud();
};
function begin(idx){
 const r=hero.expedition,road=r.roads[idx],count=2+r.room+(road.elite?1:0);
 combat={x:240,y:186,cooldown:0,mobs:[],time:0,dir:0,walk:false,road};
 for(let i=0;i<count;i++){
 const a=(i/count)*Math.PI*2+.4,boss=r.room===3&&i===0,hp=6+2*r.tier+(road.elite?5:0)+(boss?28:0);
 combat.mobs.push({x:240+Math.cos(a)*115,y:180+Math.sin(a)*97,hp,max:hp,boss,delay:i*.09,wind:0,tx:0,ty:0})}
 r.battle=combat;effects=[];swing=null;hud()
}
function end(win,msg){
 const r=hero.expedition;
 if(win){const style=Math.random()<.5?"twins":"sword",isArmor=Math.random()<.33,tier=r.tier;
 const names=isArmor?["Латы дозорного","Панцирь склепа","Обсидиановые латы"]:style==="twins"?["Клыки брода","Кинжалы склепа","Обсидиановые клинки"]:["Серебряный фальшион","Меч знаменосца","Клинок князя"];
 const it=makeItem(isArmor?"armor":"weapon",names[tier],2+tier*2+(combat.road.elite?2:0)+Math.floor(Math.random()*3),isArmor?null:style);
 hero.bag.push(it);hero.trophy={...it,index:hero.bag.length-1};hero.coins+=12+tier*8;xp(10)}
 hero.expedition=null;combat=null;swing=null;effects=[];$("flash").textContent=msg;persist();hud();if(win)show("prize")
}
function finishRoom(){
 const r=hero.expedition;xp(6+r.room*2);hero.shards+=1+Math.floor(Math.random()*3);hero.coins+=2;
 if(r.room===3){end(true,"Добыча хранителя");return}
 const road=combat.road;
 if(road.kind===0)r.hp=Math.min(maxHp(),r.hp+(road.elite?20:12));else if(road.kind===1)r.force+=road.elite?4:2;else r.ward+=road.elite?2:1;
 r.room++;r.roads=routes();r.battle=null;combat=null;effects=[];swing=null;persist();hud();show("routes")
}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function update(dt){
 const b=combat,r=hero.expedition;b.time+=dt;b.cooldown-=dt;
 let dx=stick.x+Number(keys.has("KeyD")||keys.has("ArrowRight"))-Number(keys.has("KeyA")||keys.has("ArrowLeft"));
 let dy=stick.y+Number(keys.has("KeyS")||keys.has("ArrowDown"))-Number(keys.has("KeyW")||keys.has("ArrowUp"));
 const mag=Math.hypot(dx,dy);b.walk=mag>.05;
 b.x=clamp(b.x+dx/Math.max(1,mag)*82*dt,14,466);b.y=clamp(b.y+dy/Math.max(1,mag)*82*dt,16,346);
 for(const m of b.mobs){
 m.delay-=dt;const vx=b.x-m.x,vy=b.y-m.y,dist=Math.hypot(vx,vy);
 if(m.wind>0){m.wind-=dt;if(m.wind<=0){if(Math.hypot(b.x-m.tx,b.y-m.ty)<(m.boss?32:22)){
 const hit=Math.max(1,4+(m.boss?4:0)+r.tier+(b.road.elite?2:0)-r.ward-armor().bonus);r.hp-=hit;effect(b.x,b.y,-hit,"#ff9a83");hud()}
 m.delay=.9}continue}
 if(dist<25&&m.delay<=0){m.wind=.7;m.tx=b.x;m.ty=b.y}
 else if(dist>13){const v=(m.boss?22:29)+r.tier*3;m.x+=vx/dist*v*dt;m.y+=vy/dist*v*dt}
 }
 if(r.hp<=0){end(false,"Поражение · рыцарь вернулся к костру");return}
 const target=b.mobs.reduce((best,m)=>!best||Math.hypot(m.x-b.x,m.y-b.y)<Math.hypot(best.x-b.x,best.y-b.y)?m:best,null);
 const twin=weapon().style==="twins",range=twin?42:54;
 if(target&&Math.hypot(target.x-b.x,target.y-b.y)<=range&&b.cooldown<=0){
 const rune=r.energy>=3,crit=Math.random()<Math.min(.55,.04*hero.agility+(twin?.12:0));
 const hit=(3+weapon().bonus+hero.power+r.force)*(crit?2:1)+(rune?4+hero.mind*2:0);
 b.dir=Math.atan2(target.y-b.y,target.x-b.x);swing={angle:b.dir,life:.3,rune,range};b.cooldown=twin?.43:.72;r.energy=rune?0:r.energy+1;
 for(const m of b.mobs){if(m!==target&&(!rune||Math.hypot(m.x-b.x,m.y-b.y)>72))continue;m.hp-=hit;effect(m.x,m.y,hit,rune?"#8ef6ef":crit?"#ffd376":"#f5e7c7")}
 b.mobs=b.mobs.filter(m=>m.hp>0);hud();
 if(!b.mobs.length){finishRoom();return}
 }
 if(swing)swing.life-=dt;
 effects.forEach(f=>f.life-=dt);effects=effects.filter(f=>f.life>0);
 saveTime+=dt;if(saveTime>=1){persist();saveTime=0}
}
function effect(x,y,n,color){effects.push({x,y,n,color,life:.55})}
function arenaArt(t){
 const b=combat,r=hero.expedition;
 const scale=Math.max(width/480,height/360);
 const ox=clamp(width/2-b.x*scale,width-480*scale,0),oy=clamp(height/2-b.y*scale,height-360*scale,0);
 ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
 rect("#374d4c",0,0,480,360);
 for(let j=0;j<20;j++)for(let i=-1;i<17;i++){
 const x=i*32+(j%2)*16,y=j*19,v=(i*17+j*13+55)%5;
 poly(["#536661","#566962","#4e615c","#586a63","#4b605d"][v],x+1,y+2,x+30,y+1,x+32,y+14,x+27,y+18,x+2,y+17);
 if(v===1)line("#425952",.7,x+6,y+2,x+10,y+8)
 }
 ctx.strokeStyle="#a79c734d";ctx.lineWidth=2;for(const rad of [54,60]){ctx.beginPath();ctx.arc(240,180,rad,0,Math.PI*2);ctx.stroke()}
 for(let i=0;i<16;i++){const a=i*Math.PI/8;line("#b0a47b88",2,240+Math.cos(a)*54,180+Math.sin(a)*54,240+Math.cos(a)*58,180+Math.sin(a)*58)}
 for(let i=0;i<12;i++){const x=12+i*41;rect("#273e41",x,0,14,17);rect("#6d7770",x,0,14,6)}
 for(const [x,y] of [[28,32],[452,32],[28,330],[452,330]]){oval("#243837",x,y+4,10,5);rect("#45494a",x-4,y-12,8,17);glow(x,y-13,26,"#ffb86866");poly("#e7a45f",x-5,y-10,x-4,y-17,x,y-24+Math.sin(t*8)*2,x+5,y-14,x+3,y-10)}
 for(const m of b.mobs)if(m.wind>0){oval("#e66c532e",m.tx,m.ty,m.boss?32:22,m.boss?32:22);ctx.strokeStyle="#ff9b70";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(m.tx,m.ty,m.boss?32:22,0,Math.PI*2);ctx.stroke()}
 const units=[...b.mobs,b].sort((a,c)=>a.y-c.y);
 for(const m of units){
 if(m===b){knightAt(b.x,b.y,.49,weapon(),t,b.walk,false,armor().bonus,swing?.life>0?Math.sin(Math.PI*swing.life/.3)*1.45:0);continue}
 ctx.save();ctx.translate(m.x,m.y);const s=m.boss?1.42:1;ctx.scale(s,s);
 oval("#1c292a88",0,1,10,4);const coat=m.boss?"#854850":b.road.elite?"#8e574b":"#526a51";
 poly("#343944",-6,-7,6,-7,8,0,3,1,0,-3,-4,1,-8,1);
 poly(coat,-9,-12,-5,-19,4,-20,10,-12,8,-4,-7,-4);poly("#384851",-6,-16,0,-22,6,-16,4,-11,-4,-11);
 poly("#bcba9a",-7,-18,-10,-24,-4,-21,0,-23,5,-21,10,-24,7,-17,3,-13,-4,-14);rect("#463d3f",-5,-18,10,2);rect("#ffc684",1,-18,3,1);
 sword(8,-8,m.wind>0?-.55:1.0,true,false);if(m.hp<m.max){rect("#293331",-10,-29,20,2);rect("#e5a274",-10,-29,20*m.hp/m.max,2)}ctx.restore()
 }
 if(swing&&swing.life>0){const f=1-swing.life/.3;ctx.strokeStyle=swing.rune?"#88ffea":"#ffe8a6";ctx.lineWidth=4*(1-f)+.5;ctx.beginPath();ctx.arc(b.x,b.y-6,swing.range*.82,swing.angle-1.1+f*.7,swing.angle+.2+f*.95);ctx.stroke();
 if(swing.rune){ctx.beginPath();ctx.arc(b.x,b.y,15+f*57,0,Math.PI*2);ctx.stroke()}}
 ctx.font="bold 11px Georgia";ctx.textAlign="center";for(const e of effects){ctx.fillStyle=e.color;ctx.fillText(String(e.n),e.x,e.y-23-(.55-e.life)*23)}ctx.restore()
}
stage.addEventListener("click",e=>{
 if(hero.expedition)return;
 const box=stage.getBoundingClientRect(),x=(e.clientX-box.left)/width,y=(e.clientY-box.top)/height;
 if(Math.abs(x-.80)<.085&&y>.40&&y<.60)navigate();
});
const controls=["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"];
addEventListener("keydown",e=>{if(!combat||dialog.open||!controls.includes(e.code))return;e.preventDefault();keys.add(e.code)});
addEventListener("keyup",e=>keys.delete(e.code));
const pad=$("stick");
function moveStick(e){if(e.pointerId!==pointer)return;const box=pad.getBoundingClientRect(),dx=e.clientX-box.left-box.width/2,dy=e.clientY-box.top-box.height/2;
 const r=box.width*.32,len=Math.max(r,Math.hypot(dx,dy));stick={x:dx/len,y:dy/len};pad.firstElementChild.style.transform="translate("+stick.x*r+"px,"+stick.y*r+"px)"}
pad.onpointerdown=e=>{if(pointer!==null)return;pointer=e.pointerId;pad.setPointerCapture(pointer);moveStick(e)};
pad.onpointermove=moveStick;
pad.onlostpointercapture=pad.onpointercancel=pad.onpointerup=e=>{if(e.pointerId===pointer)clearInput()};
function suspend(){clearInput();persist();if(combat&&!dialog.open)show("pause")}
document.addEventListener("visibilitychange",()=>{if(document.hidden)suspend()});
addEventListener("blur",suspend);addEventListener("pagehide",persist);
function frame(ms){
 const dt=Math.min(.05,(ms-prev)/1000);prev=ms;
 if(combat&&!dialog.open&&!document.hidden)update(dt);
 if(combat)arenaArt(ms/1000);else campArt(ms/1000,hero,ms<raisedUntil);
 requestAnimationFrame(frame)
}
if(hero.expedition?.battle){combat=hero.expedition.battle;show("pause")}else if(hero.expedition)show("routes");
hud();requestAnimationFrame(frame);
