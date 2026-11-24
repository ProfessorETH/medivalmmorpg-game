"use strict";
const chapters=[
 {title:"Молчание колокола",brief:"Цепь переправы заклинило. Кузнецу нужен железный язык колокола. Его унёс Тюремщик в казематы за красным знаменем.",ending:"Язык колокола вернулся к переправе. Ночной паром снова слышит сигналы с берега.",reward:70},
 {title:"Под каменной печатью",brief:"Колокол ответил из-под земли. Спустись в склеп за печатью знаменосца, пока мёртвый караул не вышел во двор.",ending:"Печать в твоих руках. На её обороте выбит знак Обсидианового бастиона.",reward:200},
 {title:"Последняя застава",brief:"За склепом осталась застава князя. Сломи его стражу и верни ключ к разломам переправы.",ending:"Ключ доставлен. С десятого уровня переправа ведёт в глубины разлома.",reward:420}
];
function forgePrice(){return hero.metSmith?2+2*(weapon().tempered||0):0}
function forgePanel(){
 const blade=weapon(),cost=forgePrice();
 return '<small>Двор привратника · Кузница</small><h2>Мастер Радан</h2><p>'+(!hero.metSmith?"«До ночи нужен колокол. Дай сюда клинок — первую заточку я беру на себя».":"«Руда у тебя, огонь у меня. Давай посмотрим на кромку».")+'</p><div class="forge-blade">'+gearImage("weapon",blade.style,blade)+'<div><b>'+safe(blade.name)+'</b><p>Урон +'+blade.bonus+' → +'+(blade.bonus+1)+'</p></div></div><p>Руда в сумке · '+hero.shards+'</p>'+(hero.shards>=cost?btn(cost?"Закалить · "+cost+" руды":"Заточить бесплатно","temper","primary"):'<button disabled>Нужно руды · '+cost+'</button>')+(hero.metSmith&&hero.chapter<3?btn("Узнать поручение","brief"):"")
}
function storyPanel(){
 const c=chapters[hero.chapter];
 if(!c)return '<h2>Переправа освобождена</h2><p>Разломы доступны с десятого уровня.</p>'+btn("К костру","close");
 return '<small>Поручение Радана · Глава '+(hero.chapter+1)+' / 3</small><h2>'+c.title+'</h2><p>'+c.brief+'</p><p>'+zoneNames[hero.chapter]+' · 5 залов · '+keepers[hero.chapter]+'</p>'+btn("Спуститься по лестнице","storyStart","primary")
}
function startRun(tier,mode){
 if(hero.expedition)return;
 if(mode==="story"&&(hero.base!=="castle"||!hero.metSmith||tier!==hero.chapter||!chapters[tier]))return;
 if(mode==="rift"&&(hero.level<10||!zoneNames[tier]))return;
 hero.expedition={mode,depth:mode==="rift"?(hero.riftDepth||1):0,tier,total:5,flasks:{heal:2,mana:2},room:1,hp:maxHp(),energy:0,force:0,ward:0,roads:routes(),battle:null};
 $("flash").textContent="";show("routes")
}
function storyAction(){
 if(travel||combat||hero.expedition)return;
 if(hero.base!=="castle"){depart("castle");return}
 if(!hero.metSmith){depart("smith");return}
 show(hero.chapter<3?"story":"zones")
}
