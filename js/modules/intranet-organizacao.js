/* Intranet do colaborador · ações funcionais e acabamento */
(function(){
  'use strict';
  if(window.__intranetOrganizacao) return;
  window.__intranetOrganizacao=true;

  function chaveHumor(){
    var email='colaborador';
    try{email=sessionStorage.getItem('userEmail')||email;}catch(e){}
    return '_intra_humor_'+email+'_'+new Date().toISOString().slice(0,10);
  }

  function valorHumor(btn){
    return String(btn.textContent||'').replace(/[😡😢😐🙂😄]/g,'').trim()||'Registrado';
  }

  window.intranetRegistrarHumor=function(btn){
    if(!btn) return;
    var valor=valorHumor(btn),bar=btn.closest('#tl-mood-bar');
    try{localStorage.setItem(chaveHumor(),valor);}catch(e){}
    if(bar){
      bar.querySelectorAll('.tl-mood-btn').forEach(function(b){b.classList.toggle('selecionado',b===btn);});
      var feedback=bar.querySelector('.intra-humor-feedback');
      if(!feedback){feedback=document.createElement('div');feedback.className='intra-humor-feedback';bar.appendChild(feedback);}
      feedback.textContent='✓ Humor registrado como “'+valor+'”. Obrigada por compartilhar.';
    }
  };

  function prepararHumor(view){
    var bar=view.querySelector('#tl-mood-bar');if(!bar)return;
    var salvo='';try{salvo=localStorage.getItem(chaveHumor())||'';}catch(e){}
    bar.querySelectorAll('.tl-mood-btn').forEach(function(btn){
      btn.type='button';btn.onclick=function(){window.intranetRegistrarHumor(btn);};
      if(salvo&&valorHumor(btn)===salvo)btn.classList.add('selecionado');
    });
    if(salvo&&!bar.querySelector('.intra-humor-feedback')){
      var feedback=document.createElement('div');feedback.className='intra-humor-feedback';
      feedback.textContent='✓ Humor de hoje: “'+salvo+'”.';bar.appendChild(feedback);
    }
  }

  function prepararCabecalho(view){
    var head=view.querySelector('#intra-social-home > div:first-child');if(!head||head.querySelector('.intra-head-actions'))return;
    var actions=document.createElement('div');actions.className='intra-head-actions';
    actions.innerHTML='<button type="button" class="intra-head-btn" onclick="intraAtualizarFeed()">↻ Atualizar</button><button type="button" class="intra-head-btn intra-head-btn--primary" onclick="if(typeof window.tlComposeFocus===\'function\')window.tlComposeFocus(\'noticias\');else if(typeof window.intraAbrirModal===\'function\')window.intraAbrirModal()">＋ Publicar</button>';
    head.appendChild(actions);
  }

  window.intraAtualizarFeed=function(){
    var btn=document.querySelector('.intra-head-actions .intra-head-btn');
    if(btn){btn.disabled=true;btn.textContent='Atualizando…';}
    try{
      var retorno=typeof window.intraCarregar==='function'?window.intraCarregar():(typeof window.intraRender==='function'?window.intraRender():null);
      Promise.resolve(retorno).finally(function(){if(btn){btn.disabled=false;btn.textContent='↻ Atualizar';}});
    }catch(e){if(btn){btn.disabled=false;btn.textContent='↻ Atualizar';}}
  };

  function prepararAcoesRapidas(view){
    var personalizar=view.querySelector('.tl-quick-personalizar');
    if(personalizar){
      personalizar.textContent='Editar perfil →';
      personalizar.setAttribute('role','button');personalizar.setAttribute('tabindex','0');
      personalizar.onclick=function(){if(typeof window.abrirMeusDados==='function')window.abrirMeusDados();};
      personalizar.onkeydown=function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();personalizar.click();}};
    }
    var verTodos=view.querySelector('.tl-aniv-ver-todos');
    if(verTodos){verTodos.textContent='Próximos 5';verTodos.style.cursor='default';}
  }

  function organizar(){
    var view=document.getElementById('view-intranet');if(!view)return;
    view.classList.add('intra-organizada');
    prepararCabecalho(view);prepararHumor(view);prepararAcoesRapidas(view);
  }

  document.addEventListener('click',function(ev){
    var presente=ev.target.closest&&ev.target.closest('#view-intranet .tl-aniv-gift');
    if(!presente)return;
    if(typeof window.tlComposeFocus==='function')window.tlComposeFocus('reconhecimento');
  },true);

  function iniciar(){
    organizar();
    var view=document.getElementById('view-intranet');
    if(view&&!view.__intraOrgObserver){
      var pendente=false;
      view.__intraOrgObserver=new MutationObserver(function(){
        if(pendente)return;pendente=true;requestAnimationFrame(function(){pendente=false;organizar();});
      });
      view.__intraOrgObserver.observe(view,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
  setTimeout(iniciar,400);setTimeout(iniciar,1200);
})();
