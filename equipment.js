"use strict";
const fittings={head:["Шлем","Салад караульного"],cloak:["Плащ","Плащ дозора"],armor:["Грудь","Латы дозорного"],hands:["Перчатки","Краги смотрителя"],weapon:["Оружие","Клинок переправы"],belt:["Пояс","Пояс ключника"],ring:["Кольцо","Перстень караула"],feet:["Сапоги","Сапоги дозора"]};
let bagSlot="weapon";
const icons=new Map();
function itemIcon(kind,style){
 const key=kind+(style||"");if(icons.has(key))return icons.get(key);
 const c=document.createElement("canvas");c.width=c.height=72;
 paintOn(c,()=>{
 ctx.scale(1.5,1.5);ctx.translate(24,24);
 const steel="#a5b5cc",shadow="#596b86",gold="#ddba80",red="#b7475b";
 if(kind==="weapon"){ctx.scale(.72,.72);sword(style==="twins"?-10:-9,13,.56,style==="twins",false);if(style==="twins")sword(3,18,.56,true,false)}
 if(kind==="head"){poly(steel,-14,-7,-8,-16,2,-18,12,-12,15,-2,11,10,1,17,-12,9);poly(shadow,-14,-7,1,-3,15,-6,12,10,1,17,1,2,-12,0);poly("#1b2336",-13,-5,1,-2,14,-6,12,-2,1,2,-12,-1);line(gold,1.4,1,2,1,12)}
 if(kind==="armor"){poly(steel,-17,-10,-11,-16,-5,-12,4,-11,10,-16,17,-10,13,-3,10,-2,9,11,0,16,-10,11,-11,-2);poly(shadow,-10,-1,0,5,11,-2,9,10,0,16,-10,11);line(gold,2,-9,9,8,9)}
 if(kind==="cloak"){poly(red,-5,-16,6,-16,10,-8,16,16,5,12,0,16,-7,12,-16,16,-10,-8);poly("#752e49",0,-10,5,12,1,16,-4,9);oval(gold,0,-10,2.5,2.5)}
 if(kind==="hands"){poly(steel,-10,-14,4,-16,7,-5,13,-2,14,3,8,2,10,11,6,15,0,16,-7,11,-9,2);line(gold,2,-9,-7,6,-9);for(let i=0;i<3;i++)line(shadow,1,-4+i*4,4,-2+i*4,12)}
 if(kind==="belt"){poly("#895d48",-19,-7,17,-10,18,4,-18,9);rect(gold,-6,-9,12,15);rect("#51413c",-3,-6,6,9);line(gold,1.6,-1,-2,5,-2);oval("#cfac7c",11,-4,1.2,1.2)}
 if(kind==="ring"){ctx.strokeStyle=gold;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,4,10,12,-.2,0,7);ctx.stroke();poly(red,-8,-9,-2,-16,5,-15,9,-8,1,-3);line("#efc4bc",2,-6,-9,-1,-14)}
 if(kind==="feet"){poly("#886655",-8,-16,8,-14,5,4,15,9,16,14,-9,14,-11,10,-7,2);poly(steel,-7,-14,7,-13,5,-7,-8,-8);line(gold,2,-7,0,5,2)}
 });
 const url=c.toDataURL();icons.set(key,url);return url
}
function gearImage(kind,style){return '<img alt="" src="'+itemIcon(kind,style)+'">'}
function bagPage(){
 const worn=hero.gear[bagSlot],picked=hero.bag[worn];
 const slots=Object.entries(fittings).map(([kind,[label]])=>{
 const it=hero.bag[hero.gear[kind]];
 return '<button data-action="slot:'+kind+'" class="socket '+(it?"filled":"empty")+'" aria-pressed="'+(kind===bagSlot)+'" aria-label="'+label+'">'+gearImage(kind,it?.style)+'<span>'+label+'</span></button>'
 }).join("");
 const items=hero.bag.map((it,i)=>({it,i})).filter(({it})=>it.kind===bagSlot);
 const options=items.map(({it,i})=>'<div class="gear-item">'+gearImage(it.kind,it.style)+'<div><strong>'+safe(it.name)+'</strong><span>'+ (it.kind==="weapon"?"Урон +":it.kind==="armor"?"Защита +":"Здоровье +")+it.bonus+'</span></div>'+(i===worn?"Надето":hero.expedition?"В лагере":btn("Надеть","equip:"+i))+'</div>').join("");
 return '<small>Снаряжение · ур. '+hero.level+'</small><h2>'+safe(hero.name)+'</h2><div class="paperdoll"><canvas id="paperKnight" width="240" height="380" aria-label="Рыцарь в надетой экипировке"></canvas>'+slots+'</div><h3>'+fittings[bagSlot][0]+' · '+(picked?safe(picked.name):"Свободно")+'</h3>'+ (options||'<p>В сумке пока нет предмета для этой ячейки.</p>')+'<p>Руда · '+hero.shards+(combat?"　Бой продолжается":"")+'</p>'
}
function drawPaperKnight(){
 const c=$("paperKnight");if(!c)return;
 paintOn(c,()=>{ctx.clearRect(0,0,c.width,c.height);glow(120,200,120,"#8198bf40");knightAt(113,317,3,weapon(),0,false,false,armor().bonus)})
}
