// ===== script: patch-docs-hero-compacto-js =====
(function(){
  'use strict';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function $(id){return document.getElementById(id)}
  function localDocs(){
    var now=new Date().toISOString();
    return [
      { _id:'local-conduta',nome:'Código de Conduta e Ética',categoria:'Políticas Internas',status:'Ativo',colaboradorNome:null,atualizadoEm:now,downloads:4,observacoes:'Política institucional vigente.'},
      { _id:'local-beneficios',nome:'Política de Benefícios IMEX',categoria:'Políticas Internas',status:'Ativo',colaboradorNome:null,atualizadoEm:now,downloads:8,observacoes:'Regras gerais dos benefícios.'},
      { _id:'local-ferias',nome:'Procedimento de Solicitação de Férias',categoria:'Procedimentos',status:'Ativo',colaboradorNome:null,atualizadoEm:now,downloads:6,observacoes:'Fluxo de solicitação e aprovação.'},
      { _id:'local-admissao',nome:'Checklist de Admissão',categoria:'Formulários',status:'Ativo',colaboradorNome:null,atualizadoEm:now,downloads:11,observacoes:'Formulário operacional de admissão.'},
      { _id:'local-nda',nome:'Termo de Confidencialidade',categoria:'Contratos',status:'Pendente assinatura',colaboradorNome:'Colaborador vinculado',atualizadoEm:now,downloads:2,observacoes:'Termo vinculado à base central.'},
      { _id:'local-prontuario',nome:'Comprovante de Entrega de Equipamentos',categoria:'Documentos de Colaboradores',status:'Ativo',colaboradorNome:'Colaborador vinculado',atualizadoEm:now,downloads:3,observacoes:'Documento individual do colaborador.'}
    ];
  }
  function mapCategoria(c){
    var n=norm(c);
    if(n.includes('politica')) return 'Políticas Internas';
    if(n.includes('proced')) return 'Procedimentos';
    if(n.includes('contrato')) return 'Contratos';
    if(n.includes('form')) return 'Formulários';
    if(n.includes('termo')) return 'Formulários';
    if(n.includes('colaborador')) return 'Documentos de Colaboradores';
    return c || 'Políticas Internas';
  }
  function icon(cat){cat=mapCategoria(cat);return {'Políticas Internas':'📄','Procedimentos':'🧭','Contratos':'📁','Formulários':'📝','Documentos de Colaboradores':'👤'}[cat]||'📄';}
  function statusBadge(status){var cls=status==='Ativo'?'ba':(status==='Pendente assinatura'?'bp':'bb');return '<span class="badge '+cls+'">'+esc(status||'Ativo')+'</span>';}
  function getDownloads(){try{return JSON.parse(localStorage.getItem('grh_docs_downloads')||'{}')||{};}catch(e){return {};}}
  function setDownloads(map){try{localStorage.setItem('grh_docs_downloads',JSON.stringify(map||{}));}catch(e){}}
  window._grhDocsFiltro = window._grhDocsFiltro || {busca:'',categoria:'todos',status:'todos',colaborador:'todos'};
  function docsBase(){
    var cache=(window._grhDocsCache&&window._grhDocsCache.length)?window._grhDocsCache:localDocs();
    var dls=getDownloads();
    return cache.map(function(d){var x=Object.assign({},d); x.categoria=mapCategoria(x.categoria); x.downloads=(parseInt(x.downloads||0,10)||0)+(parseInt(dls[x._id]||0,10)||0); return x;});
  }
  function colaboradoresOptions(){
    var nomes=[...new Set(docsBase().map(function(d){return d.colaboradorNome;}).filter(Boolean))].sort(function(a,b){return a.localeCompare(b,'pt-BR');});
    return '<option value="todos">Todos os colaboradores</option><option value="institucional">Institucional</option>'+nomes.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');
  }
  window.grhDocsPainelHTML=function(){
    return '<div class="docs-rh-page" data-docs-rh="1">'+
      '<section class="hero docs-hero-main"><div class="h-content"><div class="h-eyebrow">Gestão RH · Biblioteca de Documentos</div><h1>DOCUMENTOS</h1><p>Políticas internas, procedimentos, contratos, formulários e documentos vinculados aos colaboradores da Base Central.</p></div></section>'+
      '<div class="docs-rh-summary">'+
        '<div class="docs-rh-summary-card"><div class="docs-rh-summary-ico">📄</div><div><small>Documentos Ativos</small><strong id="grhDocAtivosNum">—</strong><span>Vigentes na biblioteca</span></div></div>'+
        '<div class="docs-rh-summary-card"><div class="docs-rh-summary-ico">📁</div><div><small>Categorias</small><strong id="grhDocCategoriasNum">5</strong><span>Organização por tipo</span></div></div>'+
        '<div class="docs-rh-summary-card"><div class="docs-rh-summary-ico">⬇️</div><div><small>Downloads Realizados</small><strong id="grhDocDownloadsNum">0</strong><span>Controle local de acessos</span></div></div>'+
      '</div>'+
      '<div class="docs-rh-toolbar">'+
        '<div class="docs-rh-toolbar-title"><div><h2>Área de Busca</h2><p>Pesquise por documento e filtre por categoria, status ou colaborador.</p></div><button type="button" class="btn btn-p btn-sm" onclick="grhDocsAbrirModal()">📤 Upload</button></div>'+
        '<div class="docs-rh-filters">'+
          '<input id="grhDocsBusca" type="search" placeholder="Pesquisar documento" oninput="grhDocsFiltrar()">'+
          '<select id="grhDocsCategoriaFiltro" onchange="grhDocsFiltrar()"><option value="todos">Todas as categorias</option><option>Políticas Internas</option><option>Procedimentos</option><option>Contratos</option><option>Formulários</option><option>Documentos de Colaboradores</option></select>'+
          '<select id="grhDocsColabFiltro" onchange="grhDocsFiltrar()">'+colaboradoresOptions()+'</select>'+
          '<select id="grhDocsStatusFiltro" onchange="grhDocsFiltrar()"><option value="todos">Todos os status</option><option value="Ativo">Ativo</option><option value="Pendente assinatura">Pendente assinatura</option><option value="Arquivado">Arquivado</option></select>'+
        '</div>'+
      '</div>'+
      '<section class="docs-rh-library">'+
        '<div class="docs-rh-library-head"><div><h2>Biblioteca de Documentos</h2><p>Documentos institucionais e documentos individuais vinculados à Base Central de Colaboradores.</p></div><span class="fix-pill" id="grhDocsTotalLabel">0 documentos</span></div>'+
        '<div class="docs-rh-cats" id="grhDocsCatBar">'+
          ['todos','Políticas Internas','Procedimentos','Contratos','Formulários','Documentos de Colaboradores'].map(function(c,i){return '<button type="button" class="docs-rh-cat '+(i===0?'active':'')+'" onclick="grhDocsSetCategoria(\''+esc(c)+'\',this)">'+(c==='todos'?'Todos':icon(c)+' '+c)+'</button>';}).join('')+
        '</div>'+
        '<div class="docs-rh-table-wrap"><table class="docs-rh-table"><thead><tr><th>Documento</th><th>Categoria</th><th>Colaborador</th><th>Status</th><th>Atualização</th><th>Downloads</th><th>Ações</th></tr></thead><tbody id="grhDocsTbody"><tr><td colspan="7" style="text-align:center;padding:24px;color:#64748b">Carregando documentos…</td></tr></tbody></table></div>'+
        '<div class="docs-rh-note">🔐 Documentos individuais permanecem vinculados ao colaborador da Base Central quando aplicável. Documentos institucionais ficam disponíveis sem duplicar cadastros.</div>'+
      '</section>'+modalHTML()+'</div>';
  };
  function modalHTML(){return '<div id="grh-modal-doc" style="display:none;position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,0.45);align-items:center;justify-content:center"><div style="background:#fff;border-radius:20px;padding:32px;width:90%;max-width:620px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px"><h3 id="grh-doc-modal-titulo" style="font-size:18px;font-weight:800">📤 Enviar documento</h3><button type="button" onclick="grhDocsFecharModal()" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--ink-60)">✕</button></div><input type="hidden" id="grh-doc-id"/><div class="fg"><div class="field full"><label>Nome do documento</label><input id="grh-doc-nome" type="text" placeholder="Ex: Política de Férias"></div><div class="field"><label>Categoria</label><select id="grh-doc-categoria"><option>Políticas Internas</option><option>Procedimentos</option><option>Contratos</option><option>Formulários</option><option>Documentos de Colaboradores</option></select></div><div class="field"><label>Status</label><select id="grh-doc-status"><option>Ativo</option><option>Pendente assinatura</option><option>Arquivado</option></select></div><div class="field full"><label>Colaborador vinculado</label><select id="grh-doc-colab"><option value="">— Documento institucional —</option></select></div><div class="field full"><label>Arquivo</label><input id="grh-doc-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"></div><div class="field full"><label>Observações</label><textarea id="grh-doc-obs" style="min-height:70px" placeholder="Informações adicionais"></textarea></div></div><div style="display:flex;gap:10px;margin-top:22px;justify-content:flex-end"><button type="button" class="btn btn-g" onclick="grhDocsFecharModal()">Cancelar</button><button type="button" id="grh-doc-salvar-btn" class="btn btn-p" onclick="grhDocsSalvar()">💾 Salvar</button></div></div></div>';}
  window.grhDocsResumoAtualizar=function(){
    var docs=docsBase(); var ativos=docs.filter(function(d){return (d.status||'Ativo')==='Ativo'}).length; var cats=new Set(docs.map(function(d){return mapCategoria(d.categoria)})).size||5; var downloads=docs.reduce(function(s,d){return s+(parseInt(d.downloads||0,10)||0)},0);
    if($('grhDocAtivosNum')) $('grhDocAtivosNum').textContent=ativos;
    if($('grhDocCategoriasNum')) $('grhDocCategoriasNum').textContent=cats;
    if($('grhDocDownloadsNum')) $('grhDocDownloadsNum').textContent=downloads;
  };
  window.grhDocsFiltrar=function(){
    var b=$('grhDocsBusca'); if(b) window._grhDocsFiltro.busca=norm(b.value);
    var c=$('grhDocsCategoriaFiltro'); if(c) window._grhDocsFiltro.categoria=c.value;
    var s=$('grhDocsStatusFiltro'); if(s) window._grhDocsFiltro.status=s.value;
    var co=$('grhDocsColabFiltro'); if(co) window._grhDocsFiltro.colaborador=co.value;
    window.grhDocsRender();
  };
  window.grhDocsSetCategoria=function(cat,btn){
    window._grhDocsFiltro.categoria=cat;
    var sel=$('grhDocsCategoriaFiltro'); if(sel) sel.value=cat;
    document.querySelectorAll('#grhDocsCatBar .docs-rh-cat').forEach(function(x){x.classList.remove('active')}); if(btn) btn.classList.add('active');
    window.grhDocsRender();
  };
  window.grhDocsRender=function(){
    var tbody=$('grhDocsTbody'); if(!tbody) return;
    var f=window._grhDocsFiltro||{}; var rows=docsBase().filter(function(d){
      var cat=mapCategoria(d.categoria); var status=d.status||'Ativo'; var colab=d.colaboradorNome||'';
      if(f.categoria&&f.categoria!=='todos'&&cat!==f.categoria) return false;
      if(f.status&&f.status!=='todos'&&status!==f.status) return false;
      if(f.colaborador&&f.colaborador!=='todos'){ if(f.colaborador==='institucional'){if(colab) return false;} else if(colab!==f.colaborador) return false; }
      if(f.busca){var alvo=norm((d.nome||'')+' '+cat+' '+status+' '+colab+' '+(d.observacoes||'')); if(!alvo.includes(f.busca)) return false;}
      return true;
    });
    if($('grhDocsTotalLabel')) $('grhDocsTotalLabel').textContent=rows.length+' documento'+(rows.length===1?'':'s');
    window.grhDocsResumoAtualizar();
    if(!rows.length){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:28px;color:#64748b">Nenhum documento encontrado para os filtros selecionados.</td></tr>';return;}
    tbody.innerHTML=rows.map(function(d){var data=d.atualizadoEm||d.criadoEm; var dataFmt=data?new Date(data).toLocaleDateString('pt-BR'):'—'; var colab=d.colaboradorNome?esc(d.colaboradorNome):'<span class="docs-rh-muted">Institucional</span>'; var content=d.content; var view=content?'<button type="button" onclick="grhDocsAbrir(\''+esc(d._id)+'\')">👁️ Ver</button>':'<button type="button" onclick="grhDocsAbrirModal(\''+esc(d._id)+'\')">📎 Anexar</button>'; var down=content?'<a href="'+esc(content)+'" download="'+esc(d.nomeArquivo||d.nome)+'" onclick="grhDocsRegistrarDownload(\''+esc(d._id)+'\')">⬇ Baixar</a>':'<button type="button" onclick="grhDocsRegistrarDownload(\''+esc(d._id)+'\')">⬇ Baixar</button>'; var arquivar=(d.status==='Arquivado')?'<button type="button" onclick="grhDocsReativar(\''+esc(d._id)+'\')">↩ Reativar</button>':'<button type="button" onclick="grhDocsArquivar(\''+esc(d._id)+'\')">🗄 Arquivar</button>'; return '<tr><td><div class="docs-rh-docname"><span class="docs-rh-docico">'+icon(d.categoria)+'</span><div>'+esc(d.nome||'Documento')+'<div class="docs-rh-muted">'+esc(d.observacoes||d.nomeArquivo||'Biblioteca RH')+'</div></div></div></td><td>'+esc(mapCategoria(d.categoria))+'</td><td>'+colab+'</td><td>'+statusBadge(d.status||'Ativo')+'</td><td>'+dataFmt+'</td><td><strong>'+((parseInt(d.downloads||0,10)||0))+'</strong></td><td><div class="docs-rh-actions">'+view+down+'<button type="button" onclick="grhDocsAbrirModal(\''+esc(d._id)+'\')">✏ Editar</button>'+arquivar+'<button type="button" onclick="grhDocsExcluir(\''+esc(d._id)+'\')">🗑</button></div></td></tr>';}).join('');
  };
  window.grhDocsRegistrarDownload=function(id){var m=getDownloads();m[id]=(parseInt(m[id]||0,10)||0)+1;setDownloads(m);setTimeout(function(){window.grhDocsRender();},40);};
  var oldCarregar=window.grhDocsCarregar;
  window.grhDocsCarregar=function(force){
    var r;
    try{ if(typeof oldCarregar==='function') r=oldCarregar.apply(this,arguments); }catch(e){}
    Promise.resolve(r).catch(function(){}).finally(function(){setTimeout(function(){var sel=$('grhDocsColabFiltro'); if(sel) sel.innerHTML=colaboradoresOptions(); window.grhDocsRender();},120);});
    setTimeout(function(){window.grhDocsRender();},180);
    return r;
  };
  function removeHeroTextNodes(){
    document.querySelectorAll('#view-gestao-rh,.main-area').forEach(function(root){
      Array.from(root.childNodes).forEach(function(n){ if(n.nodeType===3 && norm(n.nodeValue)==='hero') n.nodeValue=''; });
      root.querySelectorAll('*').forEach(function(el){ if(el.childNodes.length===1 && el.childNodes[0].nodeType===3 && norm(el.textContent)==='hero') el.remove(); });
    });
  }
  function applyDocsMode(on){document.body.classList.toggle('docs-rh-open',!!on); removeHeroTextNodes(); if(on){var t=$('grh-back-title'); if(t) t.textContent='📄 Documentos';}}
  var oldTab=window.grhTab;
  window.grhTab=function(aba,btn){
    var a=String(aba||'').toLowerCase();
    if(a==='documentos'){
      var r=typeof oldTab==='function'?oldTab.apply(this,arguments):undefined;
      var pane=$('grh-pane-documentos'); if(pane){pane.innerHTML=window.grhDocsPainelHTML(); pane.style.display='block'; pane.classList.add('active');}
      applyDocsMode(true); setTimeout(function(){window.grhDocsCarregar(true);window.grhDocsRender();},80); window.scrollTo({top:0,behavior:'smooth'}); return r;
    }
    applyDocsMode(false); return typeof oldTab==='function'?oldTab.apply(this,arguments):undefined;
  };
  var oldVoltar=window.voltarGestaoRHSeguro||window.voltarGestaoRH;
  window.voltarGestaoRHSeguro=function(){applyDocsMode(false); return typeof oldVoltar==='function'?oldVoltar.apply(this,arguments):undefined;};
  window.voltarGestaoRH=window.voltarGestaoRHSeguro;
  document.addEventListener('click',function(){setTimeout(removeHeroTextNodes,30)},true);
  document.addEventListener('DOMContentLoaded',function(){removeHeroTextNodes(); if($('grh-pane-documentos') && getComputedStyle($('grh-pane-documentos')).display!=='none') applyDocsMode(true);});
  // REMOVED: Performance optimization - 1200ms setInterval polling
  // setInterval(function(){removeHeroTextNodes(); var p=$('grh-pane-documentos'); if(p && getComputedStyle(p).display!=='none' && !p.querySelector('[data-docs-rh="1"]')){p.innerHTML=window.grhDocsPainelHTML(); window.grhDocsCarregar(true);} },1200);
})();

