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

  function esc(valor){
    return String(valor||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }

  window.intraAbrirAcao=function(tipo){
    if(typeof window.tlComposeFocus==='function')window.tlComposeFocus(tipo||'noticias');
    else if(typeof window.intraAbrirModal==='function')window.intraAbrirModal();
  };

  function preencherAniversariosVazio(){
    var alvo=document.getElementById('intra-empty-aniversarios');
    if(!alvo||typeof window.grhGetColabs!=='function')return;
    Promise.resolve(window.grhGetColabs()).then(function(lista){
      var hoje=new Date();hoje.setHours(0,0,0,0);
      var proximos=(lista||[]).filter(function(c){return c.nascimento&&String(c.status||'Ativo').toLowerCase()!=='inativo';}).map(function(c){
        var nasc=new Date(c.nascimento),prox=new Date(hoje.getFullYear(),nasc.getMonth(),nasc.getDate());
        if(prox<hoje)prox.setFullYear(prox.getFullYear()+1);
        return {nome:c.nome||'Colaborador',setor:c.setor||'',data:prox};
      }).sort(function(a,b){return a.data-b.data;}).slice(0,3);
      alvo.innerHTML=proximos.length?proximos.map(function(p){
        var ini=String(p.nome).split(/\s+/).filter(Boolean).slice(0,2).map(function(x){return x[0];}).join('').toUpperCase();
        return '<div class="intra-empty-person"><span>'+esc(ini)+'</span><div><strong>'+esc(p.nome)+'</strong><small>'+esc(p.setor)+(p.setor?' · ':'')+p.data.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})+'</small></div><button type="button" onclick="intraAbrirAcao(\'reconhecimento\')">🎁</button></div>';
      }).join(''):'<div class="intra-empty-muted">Nenhum aniversário cadastrado para os próximos dias.</div>';
    }).catch(function(){alvo.innerHTML='<div class="intra-empty-muted">Aniversários indisponíveis no momento.</div>';});
  }

  function montarEstadoVazio(view){
    var feed=view.querySelector('#intra-feed');if(!feed||feed.querySelector('.card')||feed.querySelector('.intra-empty-dinamico'))return;
    if(!/nenhuma publica|nenhuma publicação|nenhuma publicaçao/i.test(feed.textContent||''))return;
    var nome=((window.currentUserData&&window.currentUserData.nome)||sessionStorage.getItem('userName')||'Colaborador').split(' ')[0];
    feed.innerHTML='<section class="intra-empty-dinamico">'+
      '<div class="intra-empty-banner"><div><small>ESPAÇO DE CONEXÃO</small><h2>Vamos movimentar a Intranet, '+esc(nome)+'?</h2><p>Compartilhe uma novidade, reconheça alguém do time ou abra uma conversa com a empresa.</p></div><button type="button" onclick="intraAbrirAcao(\'noticias\')">＋ Criar publicação</button></div>'+
      '<div class="intra-empty-actions">'+
        '<button type="button" onclick="intraAbrirAcao(\'reconhecimento\')"><span>⭐</span><strong>Reconhecer colega</strong><small>Valorize uma atitude ou conquista</small></button>'+
        '<button type="button" onclick="intraAbrirAcao(\'enquetes\')"><span>📊</span><strong>Criar enquete</strong><small>Ouça rapidamente a equipe</small></button>'+
        '<button type="button" onclick="intraAbrirAcao(\'noticias\')"><span>🎉</span><strong>Compartilhar conquista</strong><small>Comemore resultados e novidades</small></button>'+
        '<button type="button" onclick="intraAbrirAcao(\'vagas\')"><span>💼</span><strong>Divulgar oportunidade</strong><small>Publique uma vaga interna</small></button>'+
      '</div>'+
      '<div class="intra-empty-bottom">'+
        '<article><div class="intra-empty-title">🎂 Próximos aniversários</div><div id="intra-empty-aniversarios"><div class="intra-empty-muted">Carregando pessoas…</div></div></article>'+
        '<article><div class="intra-empty-title">⚡ Acessos rápidos</div><div class="intra-empty-links"><button onclick="abrirMeusDados()">🪪 Meus dados</button><button onclick="sbNav(\'solicitacao\')">🏖️ Férias</button><button onclick="sbNav(\'beneficios\')">🎁 Benefícios</button></div></article>'+
      '</div>'+
    '</section>';
    preencherAniversariosVazio();
  }

  function sincronizarTitulo(view){
    if(!view||getComputedStyle(view).display==='none')return;
    var titulo=document.getElementById('tPageTitle');if(titulo)titulo.textContent='Intranet';
    var icone=document.getElementById('tPageIcon');if(icone){icone.textContent='🏠';icone.style.display='';}
  }
  function organizar(){
    var view=document.getElementById('view-intranet');if(!view)return;
    view.classList.add('intra-organizada');
    prepararCabecalho(view);prepararHumor(view);prepararAcoesRapidas(view);montarEstadoVazio(view);sincronizarTitulo(view);
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
  var sbNavAnterior=window.sbNav;
  if(typeof sbNavAnterior==='function'){
    window.sbNav=function(id){
      var retorno=sbNavAnterior.apply(this,arguments);
      if(String(id||'').toLowerCase()==='intranet')setTimeout(function(){organizar();sincronizarTitulo(document.getElementById('view-intranet'));},50);
      return retorno;
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
  setTimeout(iniciar,400);setTimeout(iniciar,1200);
})();
