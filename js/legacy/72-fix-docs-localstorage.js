// ===== script: fix-docs-localstorage =====
(function(){
'use strict';
if(window.__FIX_DOCS_LS__) return;
window.__FIX_DOCS_LS__ = true;

var LS_KEY = '_grh_documentos_local';
function lsLer(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]')||[]; }catch(e){ return []; } }
function lsGravar(arr){ try{ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }catch(e){} }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2); }
function agora(){ return new Date().toISOString(); }
function val(id){ var el=document.getElementById(id); return el?el.value:''; }

/* ═══════════════════════════════════════════════
   PRÉ-CARREGA IMEDIATAMENTE — impede o observer
   interno de chamar o Firebase (ele checa
   _grhDocsJaCarregou antes de chamar)
   ═══════════════════════════════════════════════ */
window._grhDocsErro        = null;
window._grhDocsCarregando  = false;
window._grhDocsJaCarregou  = true;
window._grhDocsFiltro      = window._grhDocsFiltro || {categoria:'todos',status:'todos',busca:''};
window._grhDocsCache       = lsLer();
window._grhDocsCache.sort(function(a,b){
  return new Date(b.atualizadoEm||b.criadoEm||0)-new Date(a.atualizadoEm||a.criadoEm||0);
});

/* ═══════════════════════════════════════════════
   OVERRIDE grhDocsCarregar — usa localStorage
   ═══════════════════════════════════════════════ */
window.grhDocsCarregar = function(force){
  window._grhDocsErro       = null;
  window._grhDocsCarregando = false;
  window._grhDocsJaCarregou = true;
  window._grhDocsCache = lsLer();
  window._grhDocsCache.sort(function(a,b){
    return new Date(b.atualizadoEm||b.criadoEm||0)-new Date(a.atualizadoEm||a.criadoEm||0);
  });
  if(typeof window.grhDocsResumoAtualizar==='function') window.grhDocsResumoAtualizar();
  if(typeof window.grhDocsRender==='function') window.grhDocsRender();
  return Promise.resolve();
};

// REMOVED: Performance optimization - 400ms setInterval polling
/* ═══════════════════════════════════════════════
   GUARD — caso alguma chamada residual ao Firebase
   consiga setar _grhDocsErro, limpa em 400ms
   ═══════════════════════════════════════════════ */
/*setInterval(function(){
  if(window._grhDocsErro){
    window._grhDocsErro       = null;
    window._grhDocsCarregando = false;
    window._grhDocsJaCarregou = true;
    window._grhDocsCache = lsLer();
    if(typeof window.grhDocsResumoAtualizar==='function') window.grhDocsResumoAtualizar();
    if(typeof window.grhDocsRender==='function') window.grhDocsRender();
  }
}, 400);*/

/* ═══════════════════════════════════════════════
   SALVAR (novo ou editar)
   ═══════════════════════════════════════════════ */
window.grhDocsSalvar = function(){
  var nome = val('grh-doc-nome').trim();
  if(!nome){ alert('Informe o nome do documento.'); return; }
  var categoria      = val('grh-doc-categoria');
  var status         = val('grh-doc-status');
  var obs            = val('grh-doc-obs');
  var colabSel       = document.getElementById('grh-doc-colab');
  var colaboradorId  = colabSel ? colabSel.value||null : null;
  var colaboradorNome= colaboradorId&&colabSel.selectedOptions[0] ? (colabSel.selectedOptions[0].dataset.nome||colabSel.selectedOptions[0].textContent) : null;
  var id             = val('grh-doc-id');
  var fileInput      = document.getElementById('grh-doc-file');
  var file           = fileInput&&fileInput.files[0];
  var btn            = document.getElementById('grh-doc-salvar-btn');
  if(btn){ btn.disabled=true; btn.textContent='Salvando…'; }

  function concluir(fileData){
    var ts   = agora();
    var docs = lsLer();
    if(id){
      var idx=docs.findIndex(function(d){return d._id===id;});
      if(idx>-1){
        docs[idx]=Object.assign(docs[idx],{nome:nome,categoria:categoria,status:status,observacoes:obs,colaboradorId:colaboradorId,colaboradorNome:colaboradorNome,atualizadoEm:ts});
        if(fileData) Object.assign(docs[idx],fileData);
      }
    } else {
      var novo={_id:uid(),nome:nome,categoria:categoria,status:status,observacoes:obs,colaboradorId:colaboradorId,colaboradorNome:colaboradorNome,criadoEm:ts,atualizadoEm:ts};
      if(fileData) Object.assign(novo,fileData);
      docs.unshift(novo);
    }
    lsGravar(docs);
    if(btn){btn.disabled=false;btn.textContent='💾 Salvar';}
    if(typeof window.grhDocsFecharModal==='function') window.grhDocsFecharModal();
    window.grhDocsCarregar(true);
  }

  if(file){
    if(file.size>900*1024){ alert('Arquivo muito grande. Máximo 900 KB.'); if(btn){btn.disabled=false;btn.textContent='💾 Salvar';} return; }
    var r=new FileReader();
    r.onload=function(){ concluir({content:r.result,tipo:file.type,tamanho:file.size,nomeArquivo:file.name}); };
    r.onerror=function(){ alert('Erro ao ler o arquivo.'); if(btn){btn.disabled=false;btn.textContent='💾 Salvar';} };
    r.readAsDataURL(file);
  } else { concluir(null); }
};

/* ═══════════════════════════════════════════════
   ARQUIVAR / REATIVAR / EXCLUIR
   ═══════════════════════════════════════════════ */
window.grhDocsArquivar = function(id){
  var docs=lsLer(); var d=docs.find(function(x){return x._id===id;});
  if(d){d.status='Arquivado';d.atualizadoEm=agora();lsGravar(docs);}
  window.grhDocsCarregar(true);
};
window.grhDocsReativar = function(id){
  var docs=lsLer(); var d=docs.find(function(x){return x._id===id;});
  if(d){d.status='Ativo';d.atualizadoEm=agora();lsGravar(docs);}
  window.grhDocsCarregar(true);
};
window.grhDocsExcluir = function(id){
  if(!confirm('Deseja excluir este documento definitivamente?')) return;
  lsGravar(lsLer().filter(function(d){return d._id!==id;}));
  window.grhDocsCarregar(true);
};

})();
