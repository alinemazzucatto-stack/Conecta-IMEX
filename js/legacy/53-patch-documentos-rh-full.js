// ===== script: patch-documentos-rh-full =====
(function(){
  'use strict';

  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function val(id){ var el=document.getElementById(id); return el ? el.value : ''; }

  window._grhDocsCache = window._grhDocsCache || [];
  window._grhDocsFiltro = window._grhDocsFiltro || { busca:'', categoria:'todos', status:'todos' };

  function grhDocsIcone(cat){
    var map = {'Política Interna':'📚','Procedimento':'🧭','Contrato':'📑','Termo':'📝'};
    return map[cat] || '📄';
  }
  function grhDocsBadge(status){
    var map = {'Ativo':'ba','Pendente assinatura':'bp','Arquivado':'bb'};
    return `<span class="badge ${map[status]||'bb'}">${esc(status)}</span>`;
  }

  function grhDocsPainelHTML(){
    return `<div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important">
      <div class="h-content">
        <div class="h-eyebrow">Gestão RH · Biblioteca de documentos</div>
        <h1>DOCUMENTOS</h1>
        <p>Políticas internas, procedimentos, contratos e termos, institucionais ou vinculados a um colaborador da Base Central, com upload, download, busca e filtros.</p>
      </div>
    </div>
    <div class="grh-patch-kpis">
      <div class="grh-patch-kpi"><small>Documentos Ativos</small><strong id="grhDocAtivosNum">—</strong><span>Disponíveis e vigentes.</span></div>
      <div class="grh-patch-kpi"><small>Assinaturas Pendentes</small><strong id="grhDocPendentesNum">—</strong><span>Aguardando ciência ou assinatura.</span></div>
      <div class="grh-patch-kpi"><small>Arquivados</small><strong id="grhDocArquivadosNum">—</strong><span>Fora de vigência.</span></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="cht"><h2>📄 Documentos RH</h2><p>Políticas, procedimentos, contratos e termos — institucionais ou vinculados a um colaborador da Base Central.</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button type="button" class="btn btn-g btn-sm" onclick="window.grhAbrirUploadMassa && window.grhAbrirUploadMassa()">📤 Upload em massa</button>
          <button type="button" class="btn btn-p btn-sm" onclick="grhDocsAbrirModal()">📤 Enviar Documento</button>
        </div>
      </div>
      <div class="card-body">
        <div class="tabs" id="grhDocsCatBar">
          <button type="button" class="tab active" onclick="grhDocsSetCategoria('todos',this)">Todos</button>
          <button type="button" class="tab" onclick="grhDocsSetCategoria('Política Interna',this)">📚 Políticas Internas</button>
          <button type="button" class="tab" onclick="grhDocsSetCategoria('Procedimento',this)">🧭 Procedimentos</button>
          <button type="button" class="tab" onclick="grhDocsSetCategoria('Contrato',this)">📑 Contratos</button>
          <button type="button" class="tab" onclick="grhDocsSetCategoria('Termo',this)">📝 Termos</button>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
          <input id="grhDocsBusca" type="search" placeholder="🔎 Buscar por nome, categoria ou colaborador…" oninput="grhDocsFiltrar()" style="flex:1;min-width:220px;padding:11px 14px;border:1px solid var(--border);border-radius:12px;font-family:inherit;font-size:13px">
          <select id="grhDocsStatusFiltro" onchange="grhDocsFiltrar()" style="padding:11px 14px;border:1px solid var(--border);border-radius:12px;font-family:inherit;font-size:13px">
            <option value="todos">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Pendente assinatura">Pendente assinatura</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>
        <div style="overflow:auto">
          <table>
            <thead><tr><th>Documento</th><th>Categoria</th><th>Vinculado a</th><th>Status</th><th>Atualizado em</th><th>Ações</th></tr></thead>
            <tbody id="grhDocsTbody"><tr><td colspan="6" style="padding:22px 12px;text-align:center;color:var(--ink-60)">Carregando documentos…</td></tr></tbody>
          </table>
        </div>
        <div class="rh-module-note" style="margin-top:16px">🔐 Documentos individuais do prontuário (recibos, exames, advertências específicas) continuam na ficha de cada colaborador, em <strong>Gestão RH → Colaboradores → Prontuário</strong>. Este módulo concentra os documentos institucionais e os formalmente vinculados a um colaborador da Base Central (contratos e termos).</div>
      </div>
    </div>
    <div id="grh-modal-doc" style="display:none;position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,0.45);align-items:center;justify-content:center">
      <div style="background:#fff;border-radius:20px;padding:36px;width:90%;max-width:620px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
          <h3 id="grh-doc-modal-titulo" style="font-size:18px;font-weight:700">📤 Enviar documento</h3>
          <button type="button" onclick="grhDocsFecharModal()" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--ink-60)">✕</button>
        </div>
        <input type="hidden" id="grh-doc-id"/>
        <div class="fg">
          <div class="field full"><label>Nome do documento</label><input id="grh-doc-nome" type="text" placeholder="Ex: Política de Férias"></div>
          <div class="field"><label>Categoria</label><select id="grh-doc-categoria"><option>Política Interna</option><option>Procedimento</option><option>Contrato</option><option>Termo</option></select></div>
          <div class="field"><label>Status</label><select id="grh-doc-status"><option>Ativo</option><option>Pendente assinatura</option><option>Arquivado</option></select></div>
          <div class="field full"><label>Colaborador vinculado (opcional)</label><select id="grh-doc-colab"><option value="">— Documento institucional (sem colaborador) —</option></select></div>
          <div class="field full"><label>Arquivo (PDF, imagem ou Word — até 900 KB)</label><input id="grh-doc-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"></div>
          <div class="field full"><label>Observações</label><textarea id="grh-doc-obs" style="min-height:70px" placeholder="Informações adicionais sobre o documento"></textarea></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:22px;justify-content:flex-end">
          <button type="button" class="btn btn-g" onclick="grhDocsFecharModal()">Cancelar</button>
          <button type="button" id="grh-doc-salvar-btn" class="btn btn-p" onclick="grhDocsSalvar()">💾 Salvar</button>
        </div>
      </div>
    </div>`;
  }

  async function grhDocsSeedSeVazio(){
    var base = [
      ['Código de Conduta e Ética','Política Interna','Ativo'],
      ['Política de Benefícios','Política Interna','Ativo'],
      ['Política de Férias','Política Interna','Ativo'],
      ['Procedimento de Admissão','Procedimento','Ativo'],
      ['Procedimento de Desligamento','Procedimento','Ativo'],
      ['Modelo de Contrato de Experiência','Contrato','Pendente assinatura'],
      ['Termo de Confidencialidade (NDA)','Termo','Ativo'],
      ['Termo de Uso de Equipamentos','Termo','Ativo']
    ];
    var agora = new Date().toISOString();
    try{
      var batch = db.batch();
      base.forEach(function(b){
        var ref = db.collection(col('grh_documentos')).doc();
        batch.set(ref, { nome:b[0], categoria:b[1], status:b[2], colaboradorId:null, colaboradorNome:null, observacoes:'', content:null, tipo:null, tamanho:null, nomeArquivo:null, criadoEm:agora, atualizadoEm:agora });
      });
      await batch.commit();
    }catch(e){ console.warn('Não foi possível semear os documentos padrão.', e); }
  }

  function grhDocsComTimeout(promessa, ms){
    return Promise.race([
      promessa,
      new Promise(function(_, reject){ setTimeout(function(){ reject(new Error('Tempo esgotado ao consultar o Firestore (mais de '+(ms/1000)+'s sem resposta). Verifique sua conexão ou as regras de segurança.')); }, ms); })
    ]);
  }

  async function grhDocsCarregar(force){
    window._grhDocsErro = null;
    if(window._grhDocsCarregando) return;
    window._grhDocsCarregando = true;
    try{
      var snap = await grhDocsComTimeout(db.collection(col('grh_documentos')).get(), 8000);
      if(snap.empty && !window.__grhDocsSeedTried){
        window.__grhDocsSeedTried = true;
        await grhDocsComTimeout(grhDocsSeedSeVazio(), 8000);
        snap = await grhDocsComTimeout(db.collection(col('grh_documentos')).get(), 8000);
      }
      window._grhDocsCache = snap.docs.map(function(d){ return Object.assign({_id:d.id}, d.data()); });
      window._grhDocsCache.sort(function(a,b){ return new Date(b.atualizadoEm||b.criadoEm||0) - new Date(a.atualizadoEm||a.criadoEm||0); });
      window._grhDocsJaCarregou = true;
    }catch(e){
      console.error('Não foi possível carregar os documentos.', e);
      window._grhDocsErro = (e && e.message) ? e.message : String(e);
      window._grhDocsCache = window._grhDocsCache || [];
    }
    window._grhDocsCarregando = false;
    grhDocsResumoAtualizar();
    grhDocsRender();
  }

  function grhDocsResumoAtualizar(){
    var set = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    if(window._grhDocsErro){
      set('grhDocAtivosNum', '⚠️'); set('grhDocPendentesNum', '⚠️'); set('grhDocArquivadosNum', '⚠️');
      return;
    }
    var cache = window._grhDocsCache || [];
    var ativos = cache.filter(function(d){ return d.status==='Ativo'; }).length;
    var pendentes = cache.filter(function(d){ return d.status==='Pendente assinatura'; }).length;
    var arquivados = cache.filter(function(d){ return d.status==='Arquivado'; }).length;
    set('grhDocAtivosNum', ativos);
    set('grhDocPendentesNum', pendentes);
    set('grhDocArquivadosNum', arquivados);
  }

  function grhDocsFiltrar(){
    var b = document.getElementById('grhDocsBusca'); if(b) window._grhDocsFiltro.busca = b.value.toLowerCase();
    var s = document.getElementById('grhDocsStatusFiltro'); if(s) window._grhDocsFiltro.status = s.value;
    grhDocsRender();
  }

  function grhDocsSetCategoria(cat, btn){
    window._grhDocsFiltro.categoria = cat;
    document.querySelectorAll('#grhDocsCatBar .tab').forEach(function(t){ t.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    grhDocsRender();
  }

  function grhDocsRender(){
    var tbody = document.getElementById('grhDocsTbody'); if(!tbody) return;
    if(window._grhDocsErro){
      tbody.innerHTML = '<tr><td colspan="6" style="padding:22px 12px;text-align:center;color:#b91c1c">⚠️ Erro ao carregar documentos: '+esc(window._grhDocsErro)+'<br><span style="font-size:11px;color:var(--ink-60)">Provável causa: as regras do Firestore ainda não liberam a coleção "grh_documentos". <button type="button" onclick="window.grhDocsCarregar(true)" style="border:none;background:none;color:#0047FF;font-weight:700;cursor:pointer;text-decoration:underline">Tentar novamente</button></span></td></tr>';
      return;
    }
    var f = window._grhDocsFiltro;
    var rows = (window._grhDocsCache||[]).filter(function(d){
      if(f.categoria!=='todos' && d.categoria!==f.categoria) return false;
      if(f.status!=='todos' && d.status!==f.status) return false;
      if(f.busca){
        var alvo = ((d.nome||'')+' '+(d.colaboradorNome||'')+' '+(d.categoria||'')).toLowerCase();
        if(alvo.indexOf(f.busca)===-1) return false;
      }
      return true;
    });
    if(!rows.length){
      tbody.innerHTML = '<tr><td colspan="6" style="padding:22px 12px;text-align:center;color:var(--ink-60)">Nenhum documento encontrado para este filtro.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function(d){
      var data = d.atualizadoEm || d.criadoEm;
      var dataFmt = data ? new Date(data).toLocaleDateString('pt-BR') : '—';
      var vinculo = d.colaboradorNome ? esc(d.colaboradorNome) : '<span style="color:var(--ink-30)">Institucional</span>';
      var acoesArquivo = d.content
        ? `<a href="${d.content}" download="${esc(d.nomeArquivo||d.nome)}" title="Baixar" style="margin-right:6px;text-decoration:none">⬇️</a><button type="button" onclick="grhDocsAbrir('${d._id}')" title="Visualizar" style="margin-right:6px;border:none;background:none;cursor:pointer">👁️</button>`
        : `<span title="Sem arquivo anexado" style="color:var(--ink-30);margin-right:6px">📎—</span>`;
      var acaoStatus = d.status==='Arquivado'
        ? `<button type="button" class="btn btn-g btn-sm" onclick="grhDocsReativar('${d._id}')">↩️ Reativar</button>`
        : `<button type="button" class="btn btn-g btn-sm" onclick="grhDocsArquivar('${d._id}')">🗄️ Arquivar</button>`;
      return `<tr>
        <td>${grhDocsIcone(d.categoria)} ${esc(d.nome)}</td>
        <td>${esc(d.categoria)}</td>
        <td>${vinculo}</td>
        <td>${grhDocsBadge(d.status)}</td>
        <td>${dataFmt}</td>
        <td style="white-space:nowrap">${acoesArquivo}<button type="button" onclick="grhDocsAbrirModal('${d._id}')" title="Editar" style="margin-right:6px;border:none;background:none;cursor:pointer">✏️</button>${acaoStatus} <button type="button" onclick="grhDocsExcluir('${d._id}')" title="Excluir" style="border:none;background:none;cursor:pointer;color:#b91c1c">🗑️</button></td>
      </tr>`;
    }).join('');
  }

  async function grhDocsAbrirModal(id){
    var modal = document.getElementById('grh-modal-doc'); if(!modal) return;
    document.getElementById('grh-doc-id').value = id || '';
    document.getElementById('grh-doc-nome').value = '';
    document.getElementById('grh-doc-categoria').value = 'Política Interna';
    document.getElementById('grh-doc-status').value = 'Ativo';
    document.getElementById('grh-doc-obs').value = '';
    document.getElementById('grh-doc-file').value = '';
    var titulo = document.getElementById('grh-doc-modal-titulo'); if(titulo) titulo.textContent = id ? '✏️ Editar documento' : '📤 Enviar documento';
    var colabSel = document.getElementById('grh-doc-colab');
    colabSel.innerHTML = '<option value="">— Documento institucional (sem colaborador) —</option>';
    try{
      var colabs = typeof grhGetColabs==='function' ? await grhGetColabs() : [];
      colabs.forEach(function(c){
        var op = document.createElement('option');
        op.value = c._id;
        op.textContent = c.nome + (c.funcao ? ' — ' + c.funcao : '');
        op.dataset.nome = c.nome;
        colabSel.appendChild(op);
      });
    }catch(e){}
    if(id){
      var doc = (window._grhDocsCache||[]).find(function(d){ return d._id===id; });
      if(doc){
        document.getElementById('grh-doc-nome').value = doc.nome || '';
        document.getElementById('grh-doc-categoria').value = doc.categoria || 'Política Interna';
        document.getElementById('grh-doc-status').value = doc.status || 'Ativo';
        document.getElementById('grh-doc-obs').value = doc.observacoes || '';
        if(doc.colaboradorId) colabSel.value = doc.colaboradorId;
      }
    }
    modal.style.display = 'flex';
  }

  function grhDocsFecharModal(){
    var modal = document.getElementById('grh-modal-doc'); if(modal) modal.style.display = 'none';
  }

  async function grhDocsSalvar(){
    var nome = val('grh-doc-nome').trim();
    if(!nome){ alert('Informe o nome do documento.'); return; }
    var categoria = val('grh-doc-categoria');
    var status = val('grh-doc-status');
    var obs = val('grh-doc-obs');
    var colabSel = document.getElementById('grh-doc-colab');
    var colaboradorId = colabSel.value || null;
    var colaboradorNome = colaboradorId ? (colabSel.selectedOptions[0].dataset.nome || colabSel.selectedOptions[0].textContent) : null;
    var id = val('grh-doc-id');
    var fileInput = document.getElementById('grh-doc-file');
    var file = fileInput.files[0];
    var btn = document.getElementById('grh-doc-salvar-btn');
    if(btn){ btn.disabled = true; btn.textContent = 'Salvando…'; }

    try{
      var fileData = null;
      if(file){
        if(file.size > 900*1024){
          alert('Arquivo muito grande. Envie um arquivo de até 900 KB.');
          if(btn){ btn.disabled=false; btn.textContent='💾 Salvar'; }
          return;
        }
        fileData = await new Promise(function(resolve, reject){
          var r = new FileReader();
          r.onload = function(){ resolve({ content:r.result, tipo:file.type, tamanho:file.size, nomeArquivo:file.name }); };
          r.onerror = reject;
          r.readAsDataURL(file);
        });
      }
      var agora = new Date().toISOString();
      var dados = { nome:nome, categoria:categoria, status:status, observacoes:obs, colaboradorId:colaboradorId, colaboradorNome:colaboradorNome, atualizadoEm:agora };
      if(fileData){ dados.content=fileData.content; dados.tipo=fileData.tipo; dados.tamanho=fileData.tamanho; dados.nomeArquivo=fileData.nomeArquivo; }
      if(id){
        await db.collection(col('grh_documentos')).doc(id).update(dados);
        addNotif('Documento "'+nome+'" atualizado.', 'success');
      } else {
        dados.criadoEm = agora;
        await db.collection(col('grh_documentos')).add(dados);
        addNotif('Documento "'+nome+'" enviado.', 'success');
      }
      grhDocsFecharModal();
      await grhDocsCarregar(true);
    }catch(e){
      console.error(e);
      alert('Erro ao salvar documento: '+e.message);
    }finally{
      if(btn){ btn.disabled=false; btn.textContent='💾 Salvar'; }
    }
  }

  async function grhDocsArquivar(id){
    try{
      await db.collection(col('grh_documentos')).doc(id).update({ status:'Arquivado', atualizadoEm:new Date().toISOString() });
      addNotif('Documento arquivado.', 'warning');
      await grhDocsCarregar(true);
    }catch(e){ alert('Erro ao arquivar: '+e.message); }
  }

  async function grhDocsReativar(id){
    try{
      await db.collection(col('grh_documentos')).doc(id).update({ status:'Ativo', atualizadoEm:new Date().toISOString() });
      addNotif('Documento reativado.', 'success');
      await grhDocsCarregar(true);
    }catch(e){ alert('Erro ao reativar: '+e.message); }
  }

  async function grhDocsExcluir(id){
    if(!confirm('Deseja excluir este documento definitivamente?')) return;
    try{
      await db.collection(col('grh_documentos')).doc(id).delete();
      addNotif('Documento excluído.', 'warning');
      await grhDocsCarregar(true);
    }catch(e){ alert('Erro ao excluir: '+e.message); }
  }

  function grhDocsAbrir(id){
    var doc = (window._grhDocsCache||[]).find(function(d){ return d._id===id; });
    if(!doc || !doc.content){ alert('Nenhum arquivo anexado a este documento. Use "✏️ Editar" para enviar um arquivo.'); return; }
    window.open(doc.content, '_blank');
  }

  window.grhDocsPainelHTML = grhDocsPainelHTML;
  window.grhDocsCarregar = grhDocsCarregar;
  window.grhDocsResumoAtualizar = grhDocsResumoAtualizar;
  window.grhDocsFiltrar = grhDocsFiltrar;
  window.grhDocsSetCategoria = grhDocsSetCategoria;
  window.grhDocsRender = grhDocsRender;
  window.grhDocsAbrirModal = grhDocsAbrirModal;
  window.grhDocsFecharModal = grhDocsFecharModal;
  window.grhDocsSalvar = grhDocsSalvar;
  window.grhDocsArquivar = grhDocsArquivar;
  window.grhDocsReativar = grhDocsReativar;
  window.grhDocsExcluir = grhDocsExcluir;
  window.grhDocsAbrir = grhDocsAbrir;

  // Gatilho robusto: observa diretamente o painel #grh-pane-documentos e carrega
  // os dados sempre que ele ficar visível — funciona independente de qual das
  // várias versões de grhTab estiver realmente ativa no navegador do usuário.
  function grhDocsObservarPane(){
    var pane = document.getElementById('grh-pane-documentos');
    if(!pane){ setTimeout(grhDocsObservarPane, 500); return; }
    if(pane.__grhDocsObservado) return;
    pane.__grhDocsObservado = true;
    var carregarSeVisivel = function(){
      var visivel = getComputedStyle(pane).display !== 'none';
      if(visivel && !window._grhDocsCarregando && (!window._grhDocsJaCarregou || window._grhDocsErro)){
        grhDocsCarregar();
      }
    };
    new MutationObserver(carregarSeVisivel).observe(pane, { attributes:true, attributeFilter:['style','class'] });
    carregarSeVisivel();
    // REMOVED: Performance optimization - 2000ms setInterval polling (MutationObserver handles updates)
    // setInterval(carregarSeVisivel, 2000); // rede de segurança extra para casos sem mudança de atributo
  }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(grhDocsObservarPane, 300); });
  setTimeout(grhDocsObservarPane, 1500);
})();

