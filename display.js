"use strict";
(()=>{
 const toggle=document.getElementById("wide"), external=document.getElementById("externalGame");
 external.href=location.origin+location.pathname;
 const app=()=>window.Telegram?.WebApp;
 function sync(){
   const tg=app();
   const full=Boolean(document.fullscreenElement||tg?.isFullscreen);
   document.body.classList.toggle("wide-mode",full);
   toggle.setAttribute("aria-pressed",String(full));
   toggle.title=full?"Выйти из полного экрана":"На весь экран";
   toggle.setAttribute("aria-label",toggle.title);
   toggle.hidden=!document.fullscreenEnabled&&!tg?.isVersionAtLeast("8.0");
 }
 function bind(){
   app()?.onEvent("fullscreenChanged",sync);
   app()?.onEvent("fullscreenFailed",()=>{document.getElementById("hint").textContent="Полный экран недоступен в этом окне. Открой игру в браузере через настройки."});
   sync()
 }
 external.onclick=e=>{if(app()?.openLink){e.preventDefault();app().openLink(external.href)}};
 toggle.onclick=async()=>{
   const tg=app();
   try{
     if(tg?.isVersionAtLeast("8.0")){if(tg.isFullscreen)tg.exitFullscreen();else tg.requestFullscreen()}
     else if(document.fullscreenElement)await document.exitFullscreen();
     else await document.documentElement.requestFullscreen()
   }catch{document.getElementById("hint").textContent="Браузер отклонил полноэкранный режим."}
 };
 document.addEventListener("fullscreenchange",sync);
 if(app())bind();else{window.addEventListener("telegram-ready",bind,{once:true});sync()}
})();
