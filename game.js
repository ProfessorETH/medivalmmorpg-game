"use strict";
const slot = "ash-knight-v1";
const panel = document.getElementById("panel");
const dungeons = [
 {name:"Сторожевая переправа",level:1,mobs:["Пепельный бес","Лесной налётчик","Болотник"],boss:"Хранитель брода"},
 {name:"Склеп знаменосца",level:3,mobs:["Костяной воин","Серый призрак","Могильщик"],boss:"Мёртвый знаменосец"},
 {name:"Обсидиановый бастион",level:5,mobs:["Чёрный страж","Угольный бес","Опальный маг"],boss:"Обсидиановый князь"}];
const stats={power:"Сила",agility:"Ловкость",mind:"Интеллект"};
const weapons={sword:"Длинный меч",twins:"Парные клинки"};
let atGate=true;
let hero=null, tab="Походы", chosen="sword";
try {hero=JSON.parse(localStorage.getItem(slot))}catch{document.querySelector("#storage").textContent="Сохранение недоступно."}
function save(){try{localStorage.setItem(slot,JSON.stringify(hero))}catch{document.querySelector("#storage").textContent="Не удалось сохранить игру на устройстве."}}
function escapeName(text){const el=document.createElement("span");el.textContent=text;return el.innerHTML}
function button(label,action,options=""){return '<button type="button" data-act="'+action+'" '+options+'>'+label+'</button>'}
function selected(value){return 'aria-pressed="'+value+'"'}
function random(n){return Math.floor(Math.random()*n)}
function item(kind,name,bonus,style){return {kind,name,bonus,style}}
function equipped(kind){return hero.bag[hero.gear[kind]]}
function maxHP(){return 38+hero.level*3+equipped("armor").bonus*3}
function xpGoal(){return hero.level*18}
function grantXP(amount){hero.xp+=amount;while(hero.xp>=xpGoal()){hero.xp-=xpGoal();hero.level++;hero.points++}}
function monster(run){const zone=dungeons[run.tier];const boss=run.room===4;
 const variant=random(3),hp=(boss?25:10)+run.tier*8+run.room+variant;
 return {name:boss?zone.boss:zone.mobs[variant],hp,max:hp,damage:3+run.tier*2+variant+(boss?2:0)}}
function start(tier){if(hero.run||hero.level<dungeons[tier].level)return;
 hero.result=null;const run={tier,room:1,hp:maxHP(),max:maxHP(),force:0,block:0,charge:0,choice:false,log:"Выбери приём."};run.enemy=monster(run);hero.run=run}
function reward(run){const armor=random(2)===0,style=random(2)?"sword":"twins";
 const names=armor?["Кольчуга дозорного","Латы знаменосца","Обсидиановый панцирь"]:style==="twins"?["Клинки брода","Клыки склепа","Осколки бастиона"]:["Меч переправы","Меч знаменосца","Обсидиановый меч"];
 const loot=item(armor?"armor":"weapon",names[run.tier],2+run.tier*2+random(3),armor?null:style);
 hero.bag.push(loot);const coins=12+run.tier*8;hero.coins+=coins;
 hero.result="Подземелье пройдено. Добыча: "+loot.name+" (+"+loot.bonus+") и "+coins+" монет.";hero.run=null}
function fight(move){const r=hero.run;if(!r||r.choice||(move==="rune"&&r.charge<2))return;
 const w=equipped("weapon"),fast=w.style==="twins";let damage=3+w.bonus+hero.power+r.force;
 const crit=random(100)<Math.min(55,hero.agility*5+(fast?12:0));
 if(move==="guard")damage=Math.max(1,Math.floor(damage/2));
 if(move==="rune"){damage+=6+hero.mind*3;r.charge=0}else r.charge=Math.min(2,r.charge+1);
 damage+=fast?random(4):1;if(crit)damage*=2;
 r.enemy.hp=Math.max(0,r.enemy.hp-damage);r.log=(crit?"Критический удар! ":"")+"Твой урон "+damage+".";
 if(!r.enemy.hp){const xp=8+r.tier*4+r.room;grantXP(xp);if(r.room===4){reward(r);return}
 r.choice=true;r.log=r.enemy.name+" повержен. +"+xp+" опыта.";return}
 const hit=Math.max(0,r.enemy.damage+random(3)-equipped("armor").bonus-r.block-(move==="guard"?4:0));
 r.hp=Math.max(0,r.hp-hit);r.log+=" Ответный урон "+hit+".";
 if(!r.hp){hero.result="Рыцарь вернулся в лагерь после поражения. Полученный опыт сохранён.";hero.run=null}}
function meter(label,current,max){return '<div>'+label+' · '+current+'/'+max+'<progress aria-label="'+label+'" value="'+current+'" max="'+max+'"></progress></div>'}
function creation(){return '<h2>Создай своего рыцаря</h2><form id="create"><label>Имя рыцаря<input required maxlength="24" name="knight" autocomplete="off" placeholder="Например, Эйрик"></label><fieldset><legend>Стартовое оружие</legend><div class="actions">'+Object.entries(weapons).map(([k,v])=>button(v,"pick-"+k,selected(k===chosen))).join("")+'</div></fieldset><p class="minor" id="styleNote">'+weaponNote()+'</p><button class="primary">Принести присягу</button></form>'}
function weaponNote(){return chosen==="sword"?"Меч наносит стабильный урон.":"Клинки чаще наносят критические удары."}
function encounter(r){let out='<div class="eyebrow">Зал '+r.room+' из 4</div><h2>'+r.enemy.name+'</h2><div class="meters">'+meter("Рыцарь",r.hp,r.max)+meter("Враг",r.enemy.hp,r.enemy.max)+'</div><p role="status" class="log">'+r.log+'</p>';
 if(r.choice)return out+'<h3>Перед следующим залом</h3><div class="actions">'+button("Привал · +12 здоровья","gift-heal")+button("Заточка · +2 урона","gift-force")+button("Оберег · +1 защиты","gift-block")+'</div><p class="minor">Усиления действуют до конца похода.</p>';
 return out+'<div class="actions">'+button("Удар","hit-basic",'class="primary"')+button("Парирование","hit-guard")+button("Руна · "+r.charge+"/2","hit-rune",r.charge<2?"disabled":"")+'</div><p class="minor">Парирование снижает встречный урон. Два приёма заряжают руну.</p>'}
function camp(){let out='<div class="row"><h2>'+escapeName(hero.name)+'</h2><span class="minor">Уровень '+hero.level+' · Опыт '+hero.xp+'/'+xpGoal()+'</span></div><nav>'+["Походы","Рыцарь","Сумка"].map(v=>button(v,"tab-"+v,selected(v===tab))).join("")+'</nav>';
 if(hero.result)out+='<p role="status" class="log">'+hero.result+'</p>';
 if(tab==="Походы")return out+'<h3>Подземелья</h3><div class="tiles">'+dungeons.map((d,i)=>'<div class="row tile"><div><strong>'+d.name+'</strong><span class="minor">Уровень '+d.level+' · 4 зала</span></div>'+button(hero.level<d.level?"С ур. "+d.level:"Войти","zone-"+i,hero.level<d.level?"disabled":'class="primary"')+'</div>').join("")+'</div>';
 if(tab==="Рыцарь")return out+'<h3>Характеристики</h3><p>Свободные очки: '+hero.points+'</p><div class="tiles">'+Object.entries(stats).map(([k,v])=>'<div class="row tile"><span>'+v+' · '+hero[k]+'</span>'+button("Повысить","stat-"+k,hero.points?"":"disabled")+'</div>').join("")+'</div><p class="minor">Сила увеличивает урон, ловкость — шанс критического удара, интеллект усиливает руну.</p>';
 return out+'<h3>Снаряжение</h3><div class="tiles">'+hero.bag.map((it,i)=>'<div class="row tile"><div><strong>'+it.name+'</strong><span class="minor">'+(it.kind==="armor"?"Защита":"Урон")+' +'+it.bonus+'</span></div>'+button(hero.gear[it.kind]===i?"Надето":"Надеть","equip-"+i,hero.gear[it.kind]===i?"disabled":"")+'</div>').join("")+'</div>'}
function render(attack=false){const run=hero?.run;
 document.querySelector("#region").textContent=run?"Подземелье · уровень "+dungeons[run.tier].level:"Северное пограничье";
 document.querySelector("#place").textContent=run?dungeons[run.tier].name:"Лагерь у переправы";
 document.querySelector("#wallet").textContent="◈ "+(hero?.coins||0);
 if(atGate){
  document.querySelector("#region").textContent="Северное пограничье";
  document.querySelector("#place").textContent="Огонь на переправе";
  const title=hero?"С возвращением, "+escapeName(hero.name):"У костра есть место";
  const words=hero?(run?"Твой поход ждёт. Вернись в зал, где остановился.":"Угли ещё тёплые. Твоё снаряжение ждёт в лагере."):"Сними плащ, путник. За переправой лежат старые подземелья. Если вернёшься с добычей, здесь будет куда её сложить.";
  panel.innerHTML='<div class="eyebrow">Смотритель переправы</div><h2>'+title+'</h2><p class="greeting">'+words+'</p>'+button(hero?(run?"Продолжить поход":"Вернуться в лагерь"):"Создать рыцаря","enter",'class="primary"');
  drawWorld(null,hero?equipped("weapon").style:chosen);return;
 }
 panel.innerHTML=hero?(run?encounter(run):camp()):creation();drawWorld(run,hero?equipped("weapon").style:chosen,attack)}
panel.addEventListener("submit",e=>{e.preventDefault();if(hero)return;const input=e.target.elements.knight,name=input.value.trim();if(!name){input.focus();return}
 hero={name,level:1,xp:0,points:0,power:1,agility:1,mind:1,coins:0,gear:{weapon:0,armor:1},bag:[item("weapon",weapons[chosen],1,chosen),item("armor","Походная кольчуга",1,null)],run:null};save();render()});
panel.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b||b.disabled)return;
 const [act,arg]=b.dataset.act.split("-");if(act==="enter"){atGate=false;render();panel.querySelector("input,button")?.focus({preventScroll:true});return}
 if(act==="pick"){chosen=arg;panel.querySelectorAll("[data-act^=pick]").forEach(el=>el.setAttribute("aria-pressed",el===b));document.querySelector("#styleNote").textContent=weaponNote();drawWorld(null,chosen);return}
 if(act==="tab")tab=arg;
 if(act==="zone")start(Number(arg));
 if(act==="stat"&&hero.points>0&&arg in stats){hero.points--;hero[arg]++}
 if(act==="equip"){const index=Number(arg);hero.gear[hero.bag[index].kind]=index}
 if(act==="hit")fight(arg);
 if(act==="gift"&&hero.run?.choice){const r=hero.run;if(arg==="heal")r.hp=Math.min(r.max,r.hp+12);if(arg==="force")r.force+=2;if(arg==="block")r.block++;r.room++;r.enemy=monster(r);r.choice=false;r.log="Из темноты выступает "+r.enemy.name+"."}
 save();render(act==="hit")});
render();
