// ===== script: fix-final-login-docs =====
(function(){
'use strict';
if(window.__FIX_FINAL_V2__) return;
window.__FIX_FINAL_V2__ = true;

var $ = function(id){ return document.getElementById(id); };

/* ══ PARTE 1: LOGIN ══ */
function _setLoginRole(r, btnEl){
  r = String(r||'colaborador').toLowerCase().trim();
  window._supremoLoginRole = r;
  window.loginRole = r;
  try{ sessionStorage.setItem('imexPreferredRole',r); sessionStorage.setItem('userRole',r); }catch(e){}
  var grid=$('loginRoleGrid');
  if(grid) grid.querySelectorAll('.role-btn').forEach(function(b){ b.classList.remove('selected'); });
  if(btnEl) btnEl.classList.add('selected');
  else if(grid){ var t=grid.querySelector('.role-btn[data-role="'+r+'"]'); if(t) t.classList.add('selected'); }
}
function fixarRoleBtns(){
  var grid=$('loginRoleGrid');
  if(!grid||grid.__fixV2Done) return;
  grid.__fixV2Done=true;
  grid.querySelectorAll('.role-btn[data-role]').forEach(function(btn){
    btn.onclick=function(){ _setLoginRole(this.getAttribute('data-role'),this); };
  });
}
function fixarBotaoLogin(){
  var lBtn=$('lBtn');
  if(!lBtn||lBtn.__fixV2Done) return;
  lBtn.__fixV2Done=true;
  lBtn.onclick=function(ev){
    if(ev){ev.preventDefault();ev.stopPropagation();}
    var sel=document.querySelector('#loginRoleGrid .role-btn.selected');
    var perfil=(sel&&sel.getAttribute('data-role'))||window._supremoLoginRole||window.loginRole||'colaborador';
    perfil=perfil.toLowerCase().trim();
    _setLoginRole(perfil,sel);
    if(typeof window.entrarDemo==='function') window.entrarDemo(perfil);
    return false;
  };
  var lEmail=$('lEmail');
  if(lEmail&&!lEmail.__fixV2Enter){ lEmail.__fixV2Enter=true; lEmail.addEventListener('keydown',function(ev){ if((ev.key==='Enter'||ev.keyCode===13)&&lBtn) lBtn.click(); }); }
}

/* ══ PARTE 2: DOCUMENTOS — HTML DO MÓDULO ══ */
function buildDocumentosHTML(){
  return '<div style="padding:0 0 24px">'
    /* Cabeçalho */
    +'<div style="background:linear-gradient(135deg,#6d28d9,#0B1F5B);border-radius:16px;padding:28px 36px;margin:0 0 18px;color:#fff">'
    +'<h2 style="font-size:26px;font-weight:900;margin:0 0 6px;line-height:1">&#128196; Documentos</h2>'
    +'<p style="opacity:.82;margin:0;font-size:14px">Contratos, advert&ecirc;ncias, termos, pol&iacute;ticas e arquivos do prontu&aacute;rio.</p>'
    +'</div>'
    /* Stats */
    +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:0 0 18px">'
    +'<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center"><div id="dstat-total" style="font-size:24px;font-weight:900;color:#6d28d9">0</div><div style="font-size:11px;color:#64748b;margin-top:2px">Total</div></div>'
    +'<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center"><div id="dstat-contratos" style="font-size:24px;font-weight:900;color:#0ea5e9">0</div><div style="font-size:11px;color:#64748b;margin-top:2px">Contratos</div></div>'
    +'<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center"><div id="dstat-adv" style="font-size:24px;font-weight:900;color:#f59e0b">0</div><div style="font-size:11px;color:#64748b;margin-top:2px">Advert&ecirc;ncias</div></div>'
    +'<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center"><div id="dstat-outros" style="font-size:24px;font-weight:900;color:#10b981">0</div><div style="font-size:11px;color:#64748b;margin-top:2px">Outros</div></div>'
    +'</div>'
    /* Toolbar */
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0 0 14px">'
    +'<input id="docs-search" type="text" placeholder="&#128269; Buscar documentos..." style="flex:1;min-width:180px;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none" oninput="window.__docsRender&&window.__docsRender()">'
    +'<select id="docs-filter" style="padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;background:#fff;cursor:pointer" onchange="window.__docsRender&&window.__docsRender()">'
    +'<option value="">Todos os tipos</option>'
    +'<option value="Contrato">Contratos</option>'
    +'<option value="Advertencia">Advert&ecirc;ncias</option>'
    +'<option value="Termo">Termos</option>'
    +'<option value="Politica">Pol&iacute;ticas</option>'
    +'<option value="Outros">Outros</option>'
    +'</select>'
    +'<button onclick="window.__docsNovoDoc&&window.__docsNovoDoc()" style="padding:10px 20px;background:#6d28d9;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap">+ Novo Documento</button>'
    +'</div>'
    /* Tabela */
    +'<div style="background:#fff;border-radius:14px;border:1.5px solid #e2e8f0;overflow:auto">'
    +'<table style="width:100%;border-collapse:collapse;font-size:13px">'
    +'<thead><tr style="background:#f8fafc;border-bottom:1.5px solid #e2e8f0">'
    +'<th style="padding:11px 14px;text-align:left;font-weight:700;color:#475569">Colaborador</th>'
    +'<th style="padding:11px 14px;text-align:left;font-weight:700;color:#475569">Tipo</th>'
    +'<th style="padding:11px 14px;text-align:left;font-weight:700;color:#475569">Descri&ccedil;&atilde;o</th>'
    +'<th style="padding:11px 14px;text-align:left;font-weight:700;color:#475569">Data</th>'
    +'<th style="padding:11px 14px;text-align:center;font-weight:700;color:#475569">A&ccedil;&otilde;es</th>'
    +'</tr></thead>'
    +'<tbody id="docs-tbody"><tr><td colspan="5" style="padding:40px;text-align:center;color:#94a3b8">Nenhum documento cadastrado ainda.</td></tr></tbody>'
    +'</table></div>'
    /* Modal upload */
    +'<div id="docs-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99999;align-items:center;justify-content:center">'
    +'<div style="background:#fff;border-radius:18px;padding:30px;max-width:460px;width:92%;box-shadow:0 20px 60px rgba(0,0,0,.22)">'
    +'<h3 style="margin:0 0 18px;font-size:17px;font-weight:900">&#128196; Novo Documento</h3>'
    +'<label style="display:block;font-size:12px;font-weight:700;color:#475569;margin-bottom:3px">Colaborador</label>'
    +'<select id="docs-m-colab" style="width:100%;padding:9px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-bottom:12px;background:#fff"><option value="">Selecione...</option></select>'
    +'<label style="display:block;font-size:12px;font-weight:700;color:#475569;margin-bottom:3px">Tipo</label>'
    +'<select id="docs-m-tipo" style="width:100%;padding:9px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-bottom:12px;background:#fff">'
    +'<option value="Contrato">Contrato</option>'
    +'<option value="Advertencia">Advert&ecirc;ncia</option>'
    +'<option value="Termo">Termo</option>'
    +'<option value="Politica">Pol&iacute;tica</option>'
    +'<option value="Outros">Outros</option>'
    +'</select>'
    +'<label style="display:block;font-size:12px;font-weight:700;color:#475569;margin-bottom:3px">Descri&ccedil;&atilde;o</label>'
    +'<input id="docs-m-desc" type="text" placeholder="Ex: Contrato de trabalho 2025" style="width:100%;box-sizing:border-box;padding:9px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-bottom:12px">'
    +'<label style="display:block;font-size:12px;font-weight:700;color:#475569;margin-bottom:3px">Arquivo (opcional)</label>'
    +'<input id="docs-m-file" type="file" style="font-size:13px;margin-bottom:18px">'
    +'<div style="display:flex;gap:10px;justify-content:flex-end">'
    +'<button onclick="document.getElementById(\'docs-modal\').style.display=\'none\'" style="padding:9px 18px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:700">Cancelar</button>'
    +'<button onclick="window.__docsSalvar&&window.__docsSalvar()" style="padding:9px 22px;background:#6d28d9;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Salvar</button>'
    +'</div></div></div>'
    +'</div>';
}

/* ══ DATA LAYER ══ */
var _docs = [];
function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function _cor(t){ return {Contrato:'#0ea5e9',Advertencia:'#f59e0b',Termo:'#8b5cf6',Politica:'#10b981'}[t]||'#6b7280'; }
function _salvarLocal(){ try{ localStorage.setItem('_docs_rh_v2',JSON.stringify(_docs)); }catch(e){} }
function _carregarLocal(){ try{ var s=localStorage.getItem('_docs_rh_v2'); if(s) _docs=JSON.parse(s)||[]; }catch(e){ _docs=[]; } }

function docsRender(){
  var tbody=$('docs-tbody'); if(!tbody) return;
  var q=(($('docs-search')||{}).value||'').toLowerCase();
  var t=($('docs-filter')||{}).value||'';
  var rows=_docs.filter(function(d){
    return (!q||(d.colab||'').toLowerCase().includes(q)||(d.desc||'').toLowerCase().includes(q))&&(!t||d.tipo===t);
  });
  if(!rows.length){
    tbody.innerHTML='<tr><td colspan="5" style="padding:40px;text-align:center;color:#94a3b8">Nenhum documento encontrado.</td></tr>';
  } else {
    tbody.innerHTML=rows.map(function(d,i){
      var c=_cor(d.tipo);
      return '<tr style="border-bottom:1px solid #f1f5f9">'
        +'<td style="padding:10px 14px;font-weight:600">'+_esc(d.colab||'—')+'</td>'
        +'<td style="padding:10px 14px"><span style="background:'+c+'22;color:'+c+';font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px">'+_esc(d.tipo||'—')+'</span></td>'
        +'<td style="padding:10px 14px;color:#475569">'+_esc(d.desc||'—')+'</td>'
        +'<td style="padding:10px 14px;color:#94a3b8;font-size:12px">'+_esc(d.data||'—')+'</td>'
        +'<td style="padding:10px 14px;text-align:center"><button onclick="window.__docsExcluir('+i+')" title="Excluir" style="background:none;border:none;cursor:pointer;font-size:15px;color:#ef4444">&#128465;</button></td>'
        +'</tr>';
    }).join('');
  }
  /* stats */
  function set(id,v){ var el=$(id); if(el) el.textContent=v; }
  set('dstat-total',_docs.length);
  set('dstat-contratos',_docs.filter(function(d){return d.tipo==='Contrato';}).length);
  set('dstat-adv',_docs.filter(function(d){return d.tipo==='Advertencia';}).length);
  set('dstat-outros',_docs.filter(function(d){return d.tipo!=='Contrato'&&d.tipo!=='Advertencia';}).length);
}

window.__docsRender = docsRender;
window.__docsNovoDoc = function(){
  _carregarLocal();
  var modal=$('docs-modal'); if(!modal) return;
  var sel=$('docs-m-colab');
  if(sel){
    sel.innerHTML='<option value="">Selecione...</option>';
    var colabs=window._allColaboradores||window.todosColaboradores||[];
    if(typeof window.getColaboradores==='function'){ try{ colabs=window.getColaboradores()||[]; }catch(e){} }
    colabs.forEach(function(c){ var n=c.nome||c.name||String(c); var o=document.createElement('option'); o.value=n; o.textContent=n; sel.appendChild(o); });
  }
  var di=$('docs-m-desc'); if(di) di.value='';
  var fi=$('docs-m-file'); if(fi) fi.value='';
  modal.style.display='flex';
};
window.__docsSalvar = function(){
  var colab=($('docs-m-colab')||{}).value||'';
  var tipo=($('docs-m-tipo')||{}).value||'Outros';
  var desc=(($('docs-m-desc')||{}).value||'').trim();
  if(!colab){ alert('Selecione um colaborador.'); return; }
  if(!desc){ alert('Preencha a descrição.'); return; }
  var data=new Date().toLocaleDateString('pt-BR');
  _docs.unshift({colab:colab,tipo:tipo,desc:desc,data:data});
  _salvarLocal();
  var modal=$('docs-modal'); if(modal) modal.style.display='none';
  docsRender();
};
window.__docsExcluir = function(idx){
  if(!confirm('Excluir este documento?')) return;
  _docs.splice(idx,1); _salvarLocal(); docsRender();
};

/* ══ ABERTURA LIMPA DO MÓDULO ══ */
function abrirDocumentosClean(){
  var host=$('view-gestao-rh');
  if(!host){ setTimeout(abrirDocumentosClean,200); return; }

  /* Marca o container — CSS [data-docs-mode="open"] esconde hero e tabs */
  host.setAttribute('data-docs-mode','open');
  document.body.classList.add('docs-rh-open');

  /* Força inline também (garante mesmo se CSS não carregar) */
  var tabs=$('grh-tabs'); if(tabs) tabs.style.setProperty('display','none','important');
  var grhHero=host.querySelector('.hero:not(.docs-hero-main)');
  if(grhHero) grhHero.style.setProperty('display','none','important');
  var grhStats=host.querySelector('.h-stats');
  if(grhStats) grhStats.style.setProperty('display','none','important');

  /* Esconde todos os panes */
  host.querySelectorAll('[id^="grh-pane-"]').forEach(function(p){ p.style.setProperty('display','none','important'); });

  /* Garante o pane */
  var pane=$('grh-pane-documentos');
  if(!pane){ pane=document.createElement('div'); pane.id='grh-pane-documentos'; host.appendChild(pane); }

  /* Constrói o HTML uma vez */
  if(!pane.__docsBuilt){ pane.__docsBuilt=true; pane.innerHTML=buildDocumentosHTML(); }

  /* Mostra o pane */
  pane.style.cssText='';
  pane.style.setProperty('display','block','important');
  pane.style.setProperty('padding','0','important');

  /* Back bar */
  var bb=$('grh-back-bar');
  if(bb){ bb.style.setProperty('display','flex','important'); var bt=$('grh-back-title'); if(bt) bt.textContent='&#128196; Documentos'; }

  /* Tab ativa */
  document.querySelectorAll('#grh-tabs .tab').forEach(function(b){ b.classList.remove('active'); });
  var tabDoc=document.querySelector('#grh-tabs .tab[onclick*="documentos"]');
  if(tabDoc) tabDoc.classList.add('active');

  window.scrollTo({top:0,behavior:'smooth'});

  /* Carrega dados */
  _carregarLocal();
  setTimeout(docsRender,60);
}

window.abrirDocumentosClean=abrirDocumentosClean;
window.__abrirDocumentosRobust=abrirDocumentosClean;

/* ══ VOLTA PARA AS ABAS ══ */
function sairModoDocumentos(){
  document.body.classList.remove('docs-rh-open');
  var host=$('view-gestao-rh');
  if(host){
    host.removeAttribute('data-docs-mode');
    var tabs=$('grh-tabs'); if(tabs) tabs.style.removeProperty('display');
    var grhHero=host.querySelector('.hero:not(.docs-hero-main)');
    if(grhHero) grhHero.style.removeProperty('display');
    var grhStats=host.querySelector('.h-stats');
    if(grhStats) grhStats.style.removeProperty('display');
    host.querySelectorAll('[id^="grh-pane-"]').forEach(function(p){ p.style.setProperty('display','none','important'); });
  }
  var bb=$('grh-back-bar'); if(bb) bb.style.removeProperty('display');
}
var _prevVoltar=window.voltarGestaoRHSeguro||window.voltarGestaoRH;
window.voltarGestaoRHSeguro=window.voltarGestaoRH=function(){
  sairModoDocumentos();
  return typeof _prevVoltar==='function'?_prevVoltar.apply(this,arguments):undefined;
};

/* ══ INTERCEPTA grhTab('documentos') ══ */
(function(){
  var prev=window.grhTab;
  window.grhTab=function(aba,btn){
    if(String(aba||'').toLowerCase()==='documentos'){ abrirDocumentosClean(); return; }
    sairModoDocumentos();
    return typeof prev==='function'?prev.apply(this,arguments):undefined;
  };
})();

/* ══ PATCH DIRETO NO BOTÃO DA ABA ══ */
function patchDocsBtn(){
  var btn=document.querySelector('#grh-tabs .tab[onclick*="documentos"]')
       ||document.querySelector('button[onclick*="grhTab"][onclick*="documentos"]');
  if(!btn||btn.__docsCleanDone) return;
  btn.__docsCleanDone=true;
  btn.setAttribute('onclick','');
  btn.onclick=function(ev){ if(ev){ev.stopPropagation();ev.preventDefault();} abrirDocumentosClean(); return false; };
}

/* ══ SETUP ══ */
function setup(){
  fixarRoleBtns();
  fixarBotaoLogin();
  patchDocsBtn();
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',function(){ [0,100,300,700].forEach(function(t){ setTimeout(setup,t); }); });
} else {
  [0,100,300,700].forEach(function(t){ setTimeout(setup,t); });
}

})();
