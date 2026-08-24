(function(){
  'use strict';
  var currentRoute='';
  var labels={'inicio-rh':['⌂','Início'],intranet:['🏠','Intranet'],gamificacao:['🏆','Gamificação'],dashboard:['📊','Dashboard RH'],ouvidoria:['📢','Ouvidoria RH'],'conecta-ai':['🤖','Conecta AI RH'],auditoria:['📝','Auditoria'],'roadmap-produto':['🚀','Roadmap do Produto']};
  function show(id){
    if(id==='inicio-rh'&&typeof window.rhEnsureHome==='function')window.rhEnsureHome();
    var host=document.querySelector('.main-area'),view=document.getElementById('view-'+id);
    if(!host||!view){console.error('[NAV-V83] view ausente:',id);return false}
    if(window.AuditEngine&&id!=='auditoria'&&typeof window.AuditEngine.stop==='function')window.AuditEngine.stop();
    document.querySelectorAll('[id^="view-"]').forEach(function(el){el.classList.remove('active');el.style.setProperty('display','none','important')});
    if(view.parentElement!==host)host.appendChild(view);
    view.classList.add('active');view.style.setProperty('display','block','important');view.style.setProperty('visibility','visible','important');view.style.setProperty('opacity','1','important');
    document.querySelectorAll('[id^="sb-"]').forEach(function(el){el.classList.remove('active')});var item=document.getElementById('sb-'+id);if(item)item.classList.add('active');
    var meta=labels[id]||['•',id],title=document.getElementById('tPageTitle'),icon=document.getElementById('tPageIcon');if(title)title.textContent=meta[1];if(icon)icon.textContent=meta[0];currentRoute=id;
    if(id==='intranet'){view.classList.add('intra-organizada');var home=document.getElementById('intra-social-home');if(home)home.style.setProperty('display','block','important')}
    if(id==='gamificacao'&&typeof window.gmTab==='function')setTimeout(function(){if(currentRoute===id)window.gmTab('progresso')},40);
    if(id==='auditoria'&&window.AuditEngine&&typeof window.AuditEngine.start==='function')setTimeout(function(){if(currentRoute===id)window.AuditEngine.start()},80);
    console.log('[NAV-V83] rota ativa:',id);return false
  }
  function routeFromTarget(target){var item=target&&target.closest&&target.closest('[id^="sb-"]');if(!item||item.id==='sb-sair'||item.id==='sb-gestao-rh'||item.closest('#ess-grh-side-submenu'))return '';return String(item.dataset.menuId||item.id.slice(3))}
  window.imexNavigateRh=show;
  window.addEventListener('click',function(event){var id=routeFromTarget(event.target);if(!id)return;event.preventDefault();event.stopImmediatePropagation();show(id)},true);
})();