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
const keepers=["Хранитель брода","Мёртвый знаменосец","Обсидиановый князь"];
const rewards=["Лечение +12 ♥","Заточка +2 урона","Оберег +1 защиты"];
function routes(room=1,total=5){const kinds=[0,1,2];const n=Math.floor(Math.random()*3);const pair=[{elite:false,kind:kinds[n]},{elite:true,kind:kinds[(n+1+Math.floor(Math.random()*2))%3]}];const pool=room%2===1?["hunt","gather"]:["survive","clear"];if(Math.random()<.5)pool.reverse();pair.forEach((road,i)=>road.mission=room===total?"boss":pool[i]);return Math.random()<.5?pair:pair.reverse()}
function hud(){
 const r=hero.expedition;
 $("area").textContent=r?"Северное пограничье · зал "+r.room+"/"+(r.total||3):"Северное пограничье · убежище "+(hero.level>=5?"III":hero.level>=3?"II":"I");
 $("title").textContent=r?zoneNames[r.tier]:"Замок переправы";
 $("gold").textContent="◈ "+hero.coins;
 $("vitals").textContent=r?"♥ "+Math.ceil(r.hp)+"/"+maxHp()+"　✦ "+r.energy+"/3"+(combat?"　Враги: "+combat.mobs.length:""):hero.name+"　·　ур. "+hero.level;
 $("field").classList.toggle("fighting",!!combat);$("objective").hidden=!combat||!!combat.exits;if(combat&&!combat.exits)goalHud();
 $("belt").hidden=!combat;if(combat)flaskHud();
 for(const id of ["portrait","portal"])$(id).hidden=!!r;
 $("pause").hidden=!combat;$("stick").hidden=!combat;
 $("venture").textContent=r?"✧　Поход":"⚔　В поход";
 $("hint").textContent=r?"Движение: джойстик, WASD или стрелки. Удары и руна срабатывают сами.":"Коснись рыцаря, чтобы осмотреть его, или войди в портал.";
}
function clearInput(){keys.clear();pointer=null;stick={x:0,y:0};$("stick").firstElementChild.style.transform=""}
function show(page){
 clearInput();screen=page;const r=hero.expedition;
 let html="";
 dialog.classList.toggle("live-bag",page==="bag"&&!!combat);
 if(page==="hero"){
 html='<small>Рыцарь переправы</small><h2>'+safe(hero.name)+'</h2><p>Уровень '+hero.level+' · Опыт '+hero.xp+'/'+(18*hero.level)+' · Свободных очков '+hero.points+'</p>';
 for(const [k,title] of [["power","Сила"],["agility","Ловкость"],["mind","Интеллект"]])html+='<div class="row">'+title+' · '+hero[k]+(hero.points?btn("+1","stat:"+k):"")+'</div>';
 html+='<label>Имя<input id="knightName" maxlength="24" value="'+safe(hero.name)+'"></label>'+btn("Сохранить имя","name");
 }else if(page==="bag"){
 html='<small>Снаряжение</small><h2>Походная сумка</h2><p>Осколки руды · '+hero.shards+(combat?" · Бой продолжается":"")+'</p>';
 hero.bag.forEach((it,i)=>{const worn=hero.gear[it.kind]===i;html+='<div class="row"><div><strong>'+safe(it.name)+'</strong><span>'+(it.kind==="armor"?"Защита":"Урон")+' +'+it.bonus+'</span></div>'+(worn?"Надето":r?"В лагере":btn("Надеть","equip:"+i))+'</div>'});
 }else if(page==="zones"){
 html='<small>Карта переправы</small><h2>Куда отправимся?</h2><div class="preview-list" aria-label="Цели похода">'+Object.keys(contracts).map(type=>'<div>'+missionImage(type)+'<span>'+({gather:'Сбор',hunt:'Волны',survive:'Время',clear:'Зачистка',boss:'Босс'})[type]+'</span></div>').join("")+'</div>';
 zoneNames.forEach((name,i)=>{const lvl=i*2+1;html+=hero.level>=lvl?btn(name+'<span>Уровень '+lvl+' · 5 залов</span>',"zone:"+i,"route"):'<button class="route" disabled>'+name+' · ур. '+lvl+'</button>'});
 if(hero.run)html+='<p><a href="classic.html">Продолжить сохранённый пошаговый поход</a></p>';
 }else if(page==="routes"&&r){
 html='<small>Зал '+r.room+' из '+(r.total||3)+' · '+Math.ceil(r.hp)+' ♥</small><h2>Развилка</h2>';
 if(r.lastGoal)html+='<p class="completion">✓ '+r.lastGoal+'</p>';
 r.roads.forEach((road,i)=>{const name=r.room===(r.total||3)?keepers[r.tier]:road.elite?"Багровые стражи":"Болотные бесы";const prize=r.room===(r.total||3)?(road.elite?"Редкая вещь +2 к качеству":"Постоянная экипировка"):roadReward(road);
 const type=contractType(road,r.room),meta=contracts[type],goal=contractGoal(type,r.room,road.elite);
 html+=btn(missionImage(type)+'<div><small>'+(i?"Правая дорога":"Левая дорога")+' · '+(road.elite?"Элита":"Обычный бой")+'</small><b>'+meta.name+'</b><span>'+(type==="boss"?name:meta.hint)+' · '+(type==="survive"?goal+" с":type==="boss"?"1 цель":"×"+goal)+'</span><em>'+prize+'</em></div>',"road:"+i,"route contract")});
 }else if(page==="pause"){
 html='<h2>Поход приостановлен</h2>'+btn("Продолжить","close","primary")+" "+btn("Отступить в лагерь","retreat");
 }else if(page==="prize"){
 html='<small>Хранитель повержен</small><h2>'+safe(hero.trophy.name)+'</h2><p>Качество +'+hero.trophy.bonus+' · Вещь уже в сумке.</p>'+btn("Надеть сейчас","wearPrize","primary")+" "+btn("Оставить в сумке","close")
 }
 content.innerHTML=html;
 if(dialog.open)dialog.close();
 if(page==="bag"&&combat)dialog.show();else dialog.showModal();
}
function closeSheet(){if(dialog.open)dialog.close();screen="";clearInput();hud()}
function roadReward(road){return road.elite?["Лечение +20 ♥","Заточка +4 урона","Оберег +2 защиты"][road.kind]:rewards[road.kind]}
function navigate(){if(combat)show("pause");else if(hero.expedition)show("routes");else show("zones")}
$("portrait").onclick=$("character").onclick=()=>show("hero");$("inventory").onclick=()=>show("bag");$("portal").onclick=$("venture").onclick=navigate;$("pause").onclick=()=>show("pause");$("close").onclick=closeSheet;
dialog.addEventListener("cancel",e=>{e.preventDefault();closeSheet()});
content.onclick=e=>{
 const b=e.target.closest("[data-action]");if(!b)return;const [act,arg]=b.dataset.action.split(":");const idx=Number(arg);
 if(act==="zone"&&!hero.expedition){hero.expedition={tier:idx,total:5,flasks:{heal:2,mana:2},room:1,hp:maxHp(),energy:0,force:0,ward:0,roads:routes(),battle:null};$("flash").textContent="";show("routes")}
 if(act==="road"&&!combat&&hero.expedition){begin(idx);closeSheet()}
 if(act==="name"){const s=$("knightName").value.trim();if(s)hero.name=s;show("hero")}
 if(act==="stat"&&hero.points&&["power","agility","mind"].includes(arg)){hero[arg]++;hero.points--;show("hero")}
 if(act==="equip"&&!hero.expedition){hero.gear[hero.bag[idx].kind]=idx;raisedUntil=performance.now()+1600;closeSheet()}
 if(act==="wearPrize"){hero.gear[hero.trophy.kind]=hero.trophy.index;raisedUntil=performance.now()+1800;closeSheet()}
 if(act==="retreat"){end(false,"Ты вернулся к костру.");closeSheet()}
 if(act==="close")closeSheet();persist();hud();
};
function flaskHud(){
 const r=hero.expedition;r.flasks??={heal:2,mana:2};
 for(const type of ["heal","mana"]){
   const el=$(type+"Flask"),full=type==="heal"?r.hp>=maxHp():r.energy>=3;
   el.disabled=full||r.flasks[type]===0;
   el.querySelector("span").textContent=(type==="heal"?"♥ ":"✦ ")+r.flasks[type];
   el.title=(type==="heal"?"Здоровье +16":"Мана +3")+" · осталось "+r.flasks[type];
 }
}
function drink(type){
 const r=hero.expedition;if(!combat||!r||$(type+"Flask").disabled)return;
 if(type==="heal")r.hp=Math.min(maxHp(),r.hp+16);else r.energy=3;
 r.flasks[type]--;effect(combat.x,combat.y,type==="heal"?"+♥":"+✦",type==="heal"?"#ffa698":"#9adbff");
 persist();hud()
}
$("healFlask").onclick=()=>drink("heal");$("manaFlask").onclick=()=>drink("mana");
$("battleBag").onclick=()=>screen==="bag"?closeSheet():show("bag");
function begin(idx){
 const r=hero.expedition,road=r.roads[idx],count=2+r.room+(road.elite?1:0);
 combat={x:240,y:186,cooldown:0,mobs:[],time:0,dir:0,walk:false,road};
 const type=contractType(road,r.room);
 combat.task={type,goal:contractGoal(type,r.room,road.elite),kills:0,found:0,wave:4,stones:[]};
 if(type==="gather"){
   const positions=[[270,184],[155,94],[324,264],[106,219]];
   combat.task.stones=positions.slice(0,combat.task.goal).map(([x,y])=>({x,y}));
 }
 for(let i=0;i<count;i++)spawnMob((i/count)*Math.PI*2+.4,type==="boss"&&i===0);
 r.battle=combat;effects=[];swing=null;hud()
}
function spawnMob(angle,boss=false){
 const b=combat,r=hero.expedition,hp=6+2*r.tier+(b.road.elite?5:0)+(boss?28:0);
 let x=clamp(b.x+Math.cos(angle)*115,18,462),y=clamp(b.y+Math.sin(angle)*97,22,338);
 if(Math.hypot(b.x-x,b.y-y)<56){x=b.x<240?b.x+90:b.x-90;y=b.y}
 b.mobs.push({x,y,hp,max:hp,boss,delay:.3,wind:0,tx:0,ty:0})
}
function goalHud(){
 const b=combat,task=b.task,type=task.type;
 const progress=type==="survive"?Math.floor(b.time):type==="gather"?task.found:task.kills;
 const count=type==="survive"?Math.max(0,task.goal-progress)+" с":Math.min(progress,task.goal)+" / "+task.goal;
 if($("goalIcon").dataset.type!==type){$("goalIcon").src=contractIcons[type];$("goalIcon").dataset.type=type;$("goalName").textContent=contracts[type].name}
 if($("goalCount").textContent!==count)$("goalCount").textContent=count;
 $("goalBar").max=task.goal;$("goalBar").value=progress
}
function advanceMission(dt){
 const b=combat,task=b.task;
 if(task.type==="gather"){
   task.stones=task.stones.filter(stone=>{
     if(Math.hypot(b.x-stone.x,b.y-stone.y)>13)return true;
     task.found++;hero.shards++;effect(stone.x,stone.y,"+1","#9affed");return false
   });
 }
 if(task.type==="survive"?b.time>=task.goal:task.type==="gather"?task.found>=task.goal:task.kills>=task.goal){finishRoom();return}
 if(["hunt","gather","survive"].includes(task.type)){
   task.wave-=dt;
   if(task.wave<=0 && b.mobs.length<5 && (task.type!=="hunt"||task.kills+b.mobs.length<task.goal)){
     spawnMob(Math.random()*Math.PI*2);task.wave=task.type==="survive"?2.2:3.1
   }
 }
 goalHud()
}
function end(win,msg){
 const r=hero.expedition;
 if(win){const style=Math.random()<.5?"twins":"sword",isArmor=Math.random()<.33,tier=r.tier;
 const names=isArmor?["Латы дозорного","Панцирь склепа","Обсидиановые латы"]:style==="twins"?["Клыки брода","Кинжалы склепа","Обсидиановые клинки"]:["Серебряный фальшион","Меч знаменосца","Клинок князя"];
 const it=makeItem(isArmor?"armor":"weapon",names[tier],2+tier*2+(combat.road.elite?2:0)+Math.floor(Math.random()*3),isArmor?null:style);
 hero.bag.push(it);hero.trophy={...it,index:hero.bag.length-1};hero.coins+=12+tier*8;xp(10)}
 if(screen==="bag")closeSheet();hero.expedition=null;combat=null;swing=null;effects=[];$("flash").textContent=msg;persist();hud();if(win)show("prize")
}
function finishRoom(){
 const r=hero.expedition;xp(6+r.room*2);hero.shards+=1+Math.floor(Math.random()*3);hero.coins+=2;
 if(r.room===(r.total||3)){end(true,"Добыча хранителя");return}
 const road=combat.road;
 r.lastGoal="Зал пройден · "+roadReward(road);
 if(road.kind===0)r.hp=Math.min(maxHp(),r.hp+(road.elite?20:12));else if(road.kind===1)r.force+=road.elite?4:2;else r.ward+=road.elite?2:1;
 const next=r.room+1;r.roads=routes(next,r.total||3);
 const cx=clamp(combat.x,85,395),y=combat.y>180?118:235;
 combat.exits=[{x:cx-42,y},{x:cx+42,y}];combat.mobs=[];combat.task.stones=[];
 effects=[];swing=null;clearInput();persist();hud();
 $("flash").textContent=r.lastGoal+" · Выбери проход";
}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function update(dt){
 const b=combat,r=hero.expedition;b.time+=dt;b.cooldown-=dt;
 let dx=stick.x+Number(keys.has("KeyD")||keys.has("ArrowRight"))-Number(keys.has("KeyA")||keys.has("ArrowLeft"));
 let dy=stick.y+Number(keys.has("KeyS")||keys.has("ArrowDown"))-Number(keys.has("KeyW")||keys.has("ArrowUp"));
 const mag=Math.hypot(dx,dy);b.walk=mag>.05;
 b.x=clamp(b.x+dx/Math.max(1,mag)*82*dt,14,466);b.y=clamp(b.y+dy/Math.max(1,mag)*82*dt,16,346);
 if(b.exits){
   const door=b.exits.findIndex(g=>Math.hypot(b.x-g.x,b.y-g.y)<13);
   if(door>=0){r.room++;if(screen==="bag")closeSheet();begin(door);clearInput();$("flash").textContent="";persist()}
   return
 }
 for(const m of b.mobs){
 m.delay-=dt;m.flash=Math.max(0,(m.flash||0)-dt);const vx=b.x-m.x,vy=b.y-m.y,dist=Math.hypot(vx,vy);
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
 for(const m of b.mobs){if(m!==target&&(!rune||Math.hypot(m.x-b.x,m.y-b.y)>72))continue;m.hp-=hit;m.flash=.16;effect(m.x,m.y,hit,rune?"#8ef6ef":crit?"#ffd376":"#f5e7c7")}
 const dead=b.mobs.filter(m=>m.hp<=0);
 b.task.kills+=b.task.type==="boss"?dead.filter(m=>m.boss).length:dead.length;
 b.mobs=b.mobs.filter(m=>m.hp>0);hud();
 }
 advanceMission(dt);if(!combat)return;
 if(swing)swing.life-=dt;
 effects.forEach(f=>f.life-=dt);effects=effects.filter(f=>f.life>0);
 saveTime+=dt;if(saveTime>=1){persist();saveTime=0}
}
function effect(x,y,n,color){effects.push({x,y,n,color,life:.55})}
function drawDoors(b,r,t){
 const colors=["#a4e2ce","#ffb996"],next=r.room+1,boss=next===(r.total||3);
 const midX=(b.exits[0].x+b.exits[1].x)/2,midY=b.exits[0].y;
 if(Math.hypot(midX-b.x,midY-b.y)>66){
  ctx.save();ctx.translate(b.x,b.y-8);ctx.rotate(Math.atan2(midY-b.y,midX-b.x));poly("#ffe0a0",28,0,19,-4,21,0,19,4);ctx.restore()
 }
 for(const [i,gate] of b.exits.entries()){
   const road=r.roads[i],tint=colors[Number(road.elite)];
   ctx.save();ctx.translate(gate.x,gate.y);
   oval("#273d3d",0,2,19,5);oval("#727c73",0,-12,16,22);
   rect("#727c73",-16,-12,32,14);oval("#203136",0,-12,12,18);rect("#203136",-12,-12,24,14);
   glow(0,-9,22,tint+"77");line(tint,2,-12,1,12,1);
   poly(tint,-3,-1,0,-4,3,-1,0,-2);ctx.textAlign="center";ctx.font="bold 8px sans-serif";
   const type=contractType(road,next),goal=contractGoal(type,next,road.elite);
   const mission=contracts[type].name;
   const amount=type==="survive"?goal+" с":"×"+goal;
   const loot=boss?(road.elite?"Вещь +2":"Снаряжение"):["♥ +"+(road.elite?20:12),"Урон +"+(road.elite?4:2),"Защита +"+(road.elite?2:1)][road.kind];
   const label=road.elite?"Элита · "+loot:loot;
   rect("#152429f2",-39,-57,78,21);ctx.fillStyle="#f2ede0";ctx.fillText(mission,0,-49,75);ctx.fillStyle=tint;ctx.fillText(label,0,-40,75);ctx.fillStyle="#f6ead7";ctx.fillText(amount,0,-10,24);
   ctx.restore()
 }
}
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
 if(r.room>1)rect(["#0000","#273b770e","#7a412726","#34397626","#6d253738"][r.room-1],0,0,480,360);
 ctx.strokeStyle="#a79c734d";ctx.lineWidth=2;for(const rad of [54,60]){ctx.beginPath();ctx.arc(240,180,rad,0,Math.PI*2);ctx.stroke()}
 for(let i=0;i<16;i++){const a=i*Math.PI/8;line("#b0a47b88",2,240+Math.cos(a)*54,180+Math.sin(a)*54,240+Math.cos(a)*58,180+Math.sin(a)*58)}
 for(let i=0;i<12;i++){const x=12+i*41;rect("#273e41",x,0,14,17);rect("#6d7770",x,0,14,6)}
 for(const [x,y] of [[28,32],[452,32],[28,330],[452,330]]){oval("#243837",x,y+4,10,5);rect("#45494a",x-4,y-12,8,17);glow(x,y-13,26,"#ffb86866");poly("#e7a45f",x-5,y-10,x-4,y-17,x,y-24+Math.sin(t*8)*2,x+5,y-14,x+3,y-10)}
 for(const m of b.mobs)if(m.wind>0){oval("#e66c532e",m.tx,m.ty,m.boss?32:22,m.boss?32:22);ctx.strokeStyle="#ff9b70";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(m.tx,m.ty,m.boss?32:22,0,Math.PI*2);ctx.stroke()}
 if(b.exits)drawDoors(b,r,t);
 if(b.task.type==="gather"&&!b.exits){
 for(const stone of b.task.stones){glow(stone.x,stone.y-4,18,"#66fff080");crystal(ctx,stone.x,stone.y-4+Math.sin(t*3)*1.5,.66)}
 const nearest=b.task.stones.reduce((p,s)=>!p||Math.hypot(s.x-b.x,s.y-b.y)<Math.hypot(p.x-b.x,p.y-b.y)?s:p,null);
 if(nearest&&Math.hypot(nearest.x-b.x,nearest.y-b.y)>40){
   ctx.save();ctx.translate(b.x,b.y-8);ctx.rotate(Math.atan2(nearest.y-b.y+8,nearest.x-b.x));
   poly("#adfff0",26,0,19,-3,21,0,19,3);ctx.restore()
 }
 }
 const units=[...b.mobs,b].sort((a,c)=>a.y-c.y);
 for(const m of units){
 if(m===b){knightAt(b.x,b.y,.49,weapon(),t,b.walk,false,armor().bonus,swing?.life>0?Math.sin(Math.PI*swing.life/.3)*1.45:0);continue}
 ctx.save();ctx.translate(m.x,m.y);const s=m.boss?1.42:1;ctx.scale(s,s);if(!m.wind)ctx.translate(0,Math.sin(t*9+m.max)*1.1);
 oval("#1c292a88",0,1,10,4);const coat=m.flash>0?"#ffe6ba":m.boss?"#854850":b.road.elite?"#8e574b":"#526a51";
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
addEventListener("keydown",e=>{if(!combat||(dialog.open&&screen!=="bag")||!controls.includes(e.code))return;e.preventDefault();keys.add(e.code)});
addEventListener("keyup",e=>keys.delete(e.code));
const pad=$("stick");
function moveStick(e){if(e.pointerId!==pointer)return;const box=pad.getBoundingClientRect(),dx=e.clientX-box.left-box.width/2,dy=e.clientY-box.top-box.height/2;
 const r=box.width*.32,len=Math.max(r,Math.hypot(dx,dy));stick={x:dx/len,y:dy/len};pad.firstElementChild.style.transform="translate("+stick.x*r+"px,"+stick.y*r+"px)"}
pad.onpointerdown=e=>{if(pointer!==null)return;pointer=e.pointerId;pad.setPointerCapture(pointer);moveStick(e)};
pad.onpointermove=moveStick;
pad.onlostpointercapture=pad.onpointercancel=pad.onpointerup=e=>{if(e.pointerId===pointer)clearInput()};
function suspend(){clearInput();persist();if(combat&&(!dialog.open||screen==="bag"))show("pause")}
document.addEventListener("visibilitychange",()=>{if(document.hidden)suspend()});
addEventListener("blur",suspend);addEventListener("pagehide",persist);
function frame(ms){
 const dt=Math.min(.05,(ms-prev)/1000);prev=ms;
 if(combat&&(!dialog.open||screen==="bag")&&!document.hidden)update(dt);
 if(combat)arenaArt(ms/1000);else campArt(ms/1000,hero,ms<raisedUntil);
 requestAnimationFrame(frame)
}
if(hero.expedition?.battle){combat=hero.expedition.battle;combat.task??={type:"clear",goal:combat.mobs.length,kills:0,found:0,stones:[]};show("pause")}else if(hero.expedition)show("routes");
hud();requestAnimationFrame(frame);
