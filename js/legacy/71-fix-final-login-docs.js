// ===== script: fix-final-login-docs =====
(function(){
'use strict';
if(window.__FIX_FINAL_LOGIN_DOCS__) return;
window.__FIX_FINAL_LOGIN_DOCS__ = true;

var $ = function(id){ return document.getElementById(id); };

// REMOVIDO (auditoria de segurança/duplicidade): `_setLoginRole`,
// `fixarRoleBtns()` e `fixarBotaoLogin()` duplicavam exatamente o que
// `70-fix-final-login-docs.js` também fazia (mesmo código, flags de guarda
// diferentes) — os dois arquivos reatribuíam `#lBtn.onclick` e adicionavam
// dois listeners extras de "Enter", fazendo `doLogin()` disparar em
// paralelo várias vezes por clique/Enter. Ver comentário equivalente em
// `70-fix-final-login-docs.js`. A fonte única de login é
// `js/modules/login-auth.js`; a de seleção de perfil é `selectRole` em
// `61-patch-hotfix-login-menu.js`.

/* ── FIX ABA DOCUMENTOS ── */
function abrirDocumentos(){
  /* 1. Garante que o pane existe */
  var host = $('view-gestao-rh');
  if(!host) return;
  var pane = $('grh-pane-documentos');
  if(!pane){
    pane = document.createElement('div');
    pane.id = 'grh-pane-documentos';
    pane.style.display = 'none';
    host.appendChild(pane);
  }

  /* 2. Esconde outros panes */
  host.querySelectorAll('[id^="grh-pane-"]').forEach(function(p){ p.style.display='none'; });

  /* 3. Preenche o pane com o HTML completo */
  if(typeof window.grhDocsPainelHTML === 'function' && !pane.querySelector('[data-docs-rh="1"]')){
    pane.innerHTML = window.grhDocsPainelHTML();
  } else if(!pane.innerHTML.trim()){
    pane.innerHTML = '<div class="card"><div class="card-head"><div class="cht"><h2>📄 Documentos</h2><p>Contratos, advertências, termos, políticas e arquivos do prontuário.</p></div></div><div class="card-body"><div class="empty"><div class="ei">📄</div>Módulo de documentos carregando…</div></div></div>';
  }

  /* 4. Mostra o pane */
  pane.style.setProperty('display','block','important');
  pane.classList.add('active');

  /* 5. Ativa modo docs (CSS docs-rh-open) */
  document.body.classList.add('docs-rh-open');
  var title = $('grh-back-title');
  if(title) title.textContent = '📄 Documentos';

  /* 6. Marca a tab como ativa */
  document.querySelectorAll('#grh-tabs .tab').forEach(function(b){ b.classList.remove('active'); });
  var tabDoc = document.querySelector('#grh-tabs .tab[onclick*="documentos"]');
  if(tabDoc) tabDoc.classList.add('active');

  /* 7. Carrega dados */
  if(typeof window.grhDocsCarregar === 'function') setTimeout(function(){ try{ window.grhDocsCarregar(true); }catch(e){} }, 100);
  if(typeof window.grhDocsRender === 'function') setTimeout(function(){ try{ window.grhDocsRender(); }catch(e){} }, 200);

  window.scrollTo({top:0,behavior:'smooth'});
}

/* ── EXPOSE como fallback global ── */
window.__abrirDocumentosRobust = abrirDocumentos;

/* ── OVERRIDE grhTab: intercepta 'documentos' ── */
(function(){
  var prevGrhTab = window.grhTab;
  window.grhTab = function(aba, btn){
    if(String(aba||'').toLowerCase() === 'documentos'){
      abrirDocumentos();
      return;
    }
    document.body.classList.remove('docs-rh-open');
    return typeof prevGrhTab === 'function' ? prevGrhTab.apply(this, arguments) : undefined;
  };
})();

/* ── LISTENER de clique nos tabs (fallback) ── */
document.addEventListener('click', function(ev){
  var el = ev.target && ev.target.closest ? ev.target.closest('.tab[onclick*="documentos"], button[onclick*="documentos"]') : null;
  if(!el) return;
  if(el.closest('#grh-tabs, #view-gestao-rh')){
    ev.preventDefault();
    ev.stopImmediatePropagation();
    abrirDocumentos();
  }
}, true);

})();


