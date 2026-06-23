// ===== script: patch-menu-roadmap-interno-js =====
(function(){
  function hideItem(id){
    const el=document.getElementById(id);
    if(el){
      el.style.setProperty('display','none','important');
      el.setAttribute('aria-hidden','true');
      el.classList.remove('active');
    }
  }
  function limparMenuLateral(){
    // Remover Roadmap como módulo lateral independente
    hideItem('sb-roadmap-produto');
    // Remover Desenvolvimento/Talentos dos menus principais do RH e do Colaborador
    hideItem('sb-desenvolvimento-talentos');
    hideItem('sb-desenvolvimento');
  }
  function garantirCardRoadmapNaGestaoRH(){
    const btns=[...document.querySelectorAll('#view-gestao-rh button, #view-gestao-rh .grh-card, #view-gestao-rh [onclick]')];
    let existe=btns.some(el=>(el.textContent||'').toLowerCase().includes('roadmap'));
    const hub=document.querySelector('#grh-hub-grid, .grh-hub-grid, #grh-home-grid, .rh-hub-grid, #view-gestao-rh .card-body');
    if(!existe && hub){
      const card=document.createElement('button');
      card.type='button';
      card.className='grh-card';
      card.setAttribute('onclick',"sbNav('roadmap-produto')");
      card.innerHTML='<span class="grh-card-ico">🚀</span><span><span class="grh-card-title">Roadmap do Produto</span><span class="grh-card-sub">Fases planejadas da plataforma</span></span>';
      hub.appendChild(card);
    }
  }
  const oldSbNav=window.sbNav;
  if(!window.__patchMenuRoadmapInternoSbNav){
    window.__patchMenuRoadmapInternoSbNav=true;
    window.sbNav=function(view){
      limparMenuLateral();
      if(view==='desenvolvimento' || view==='desenvolvimento-talentos'){
        if(typeof window.voltarGestaoRH==='function') return window.voltarGestaoRH();
        return typeof oldSbNav==='function' ? oldSbNav.call(this,'gestao-rh') : null;
      }
      return typeof oldSbNav==='function' ? oldSbNav.apply(this,arguments) : null;
    };
  }
  function run(){
    limparMenuLateral();
    garantirCardRoadmapNaGestaoRH();
  }
  document.addEventListener('DOMContentLoaded',()=>{ run(); setTimeout(run,300); setTimeout(run,900);
});
  setTimeout(run,300); setTimeout(run,1200);
})();
