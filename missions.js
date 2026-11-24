"use strict";
const contracts = {
 gather:{name:"Собрать осколки",unit:"осколков",color:"#72ddd2",hint:"Подбери все светящиеся кристаллы."},
 hunt:{name:"Отбить натиск",unit:"врагов",color:"#f0af73",hint:"Уничтожь бойцов из нескольких волн."},
 survive:{name:"Дожить до рассвета",unit:"секунд",color:"#e2bf78",hint:"Держись до конца отсчёта."},
 clear:{name:"Зачистить двор",unit:"стражей",color:"#b4c9df",hint:"Уничтожь весь гарнизон."},
 boss:{name:"Победить хранителя",unit:"хранитель",color:"#ed9282",hint:"Цель — вождь в багровом плаще."}
};
function contractType(road,room){return road.mission||(room===3?"boss":"clear")}
function contractGoal(type,room,elite){
 const extra=Number(elite);
 return {gather:3+extra,hunt:7+2*extra,survive:22+6*extra,clear:2+room+extra,boss:1}[type]
}
function crystal(c,x,y,size){
 c.save();c.translate(x,y);c.scale(size,size);
 const facet=(color,...pts)=>{c.fillStyle=color;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fill()};
 facet("#b7fff0",0,-14,7,-7,5,5,-1,11,-6,3,-6,-5);
 facet("#399b92",0,-14,7,-7,5,5,-1,11,1,0);
 facet("#67d9ca",0,-14,1,0,-1,11,-3,-1);
 c.restore()
}
const contractIcons={};
for(const [type,meta] of Object.entries(contracts)){
 const canvas=document.createElement("canvas");canvas.width=128;canvas.height=128;const c=canvas.getContext("2d");
 const path=(color,...pts)=>{c.fillStyle=color;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fill()};
 const bar=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
 const bg=c.createRadialGradient(60,58,2,64,64,81);bg.addColorStop(0,meta.color+"60");bg.addColorStop(1,"#121f26");bar(bg,0,0,128,128);
 c.strokeStyle=meta.color+"55";c.lineWidth=1.4;c.beginPath();c.arc(64,64,47,0,2*Math.PI);c.stroke();
 if(type==="gather"){
 crystal(c,43,74,1.25);crystal(c,83,75,1.25);crystal(c,64,58,2.4)
 }else if(type==="survive"){
 path("#c89c60",37,32,91,32,75,59,68,65,90,94,38,94,59,65,52,59);
 path("#28454c",44,36,84,36,68,58,62,61);path("#25404a",62,69,68,69,84,92,44,92);
 path("#f3d697",50,45,78,45,65,60);path("#f3d697",48,90,64,78,80,90);
 bar("#ffdda1",34,28,60,6);bar("#ac784d",34,95,60,6);bar("#fae7aa",63,58,2,23)
 }else if(type==="clear"){
 path("#9aadc3",36,38,64,28,92,38,88,70,76,90,64,101,51,90,40,70);
 path("#495d72",43,43,64,36,85,43,81,68,70,85,64,91,50,74);
 path("#e9d4a5",62,43,69,43,69,57,79,57,79,63,69,63,68,80,64,84,62,64,51,64,51,57,62,57)
 }else{
 path(type==="boss"?"#a9605b":"#966747",27,95,42,77,51,73,78,73,89,78,102,97,70,105,58,101);
 path("#cebda2",38,47,22,32,28,54,37,65,43,77,62,89,79,78,90,61,99,34,84,47,77,37,49,37);
 path("#917e6d",64,43,78,40,83,53,79,69,64,83);
 path("#363235",42,56,60,60,58,66,45,63);path("#363235",68,60,84,55,79,65,69,66);
 bar("#ffc27b",49,60,7,2);bar("#ffc27b",71,61,6,2);
 if(type==="boss")path("#f4c77a",44,41,38,20,53,31,64,14,75,31,89,20,83,41)
 }
 contractIcons[type]=canvas.toDataURL()
}
function missionImage(type){return '<img class="mission-icon" alt="" src="'+contractIcons[type]+'">'}
