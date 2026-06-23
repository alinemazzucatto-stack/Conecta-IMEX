// ===== script: politica-link-anexo-js =====
(function(){
  if(window.__politicaLinkAnexoInit) return;
  window.__politicaLinkAnexoInit = true;
  function aplicar(){
    var link = document.getElementById('politicaBaixarLink');
    if(!link || !window.db) return;
    db.doc('configuracoes/politicaFerias').get().then(function(snap){
      var arquivo = snap.exists ? snap.data().arquivo : null;
      if(arquivo && arquivo.conteudo){
        link.href = arquivo.conteudo;
        link.removeAttribute('target');
        link.setAttribute('download', arquivo.nome || 'politica-ferias');
      }
    }).catch(function(){});
  }
  setTimeout(aplicar, 1500);
  var orig = window.sbNav;
  if(typeof orig === 'function'){
    window.sbNav = function(id){ var r = orig.apply(this, arguments); if(id === 'solicitacao') setTimeout(aplicar, 200); return r; };
  }
})();

