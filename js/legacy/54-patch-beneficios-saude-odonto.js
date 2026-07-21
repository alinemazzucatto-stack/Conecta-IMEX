// ===== script: patch-beneficios-saude-odonto-js =====
(function(){
  'use strict';

  // Configuração por tipo de plano
  const PLAN_CFG = {
    saude: {
      titulo: 'Plano de Saúde — Unimed',
      icone: '🩺',
      colecao: 'grh_beneficios_saude',
      planos: ['Unimed Enfermaria','Unimed Apartamento','Unimed Nacional'],
      planoPadrao: 'Unimed Enfermaria',
      modeloArquivo: 'modelo-plano-saude-unimed.xlsx',
      abaPlanilha: ['plano','saude','saúde'],
      labelCount: 'colaborador',
      kpiTotalLbl: 'No plano de saúde',
      kpiCustoLbl: 'Custo mensal — Saúde'
    },
    odonto: {
      titulo: 'Plano Odontológico — Uniodonto',
      icone: '🦷',
      colecao: 'grh_beneficios_odonto',
      planos: ['Uniodonto Básico','Uniodonto Intermediário','Uniodonto Completo'],
      planoPadrao: 'Uniodonto Básico',
      modeloArquivo: 'modelo-plano-odonto-uniodonto.xlsx',
      abaPlanilha: ['odonto','dental','uniodonto'],
      labelCount: 'colaborador',
      kpiTotalLbl: 'No plano odontológico',
      kpiCustoLbl: 'Custo mensal — Odonto'
    }
  };

  const _cache = { saude: null, odonto: null };
  let _bsaAutoIdx = -1;

  function $(id){ return document.getElementById(id); }
  function n(v){ return parseFloat(v) || 0; }
  function cfg(tipo){ return PLAN_CFG[tipo] || PLAN_CFG.saude; }
  function colName(tipo){ return typeof col==='function' ? col(cfg(tipo).colecao) : cfg(tipo).colecao; }

  async function getDados(tipo, force){
    if(_cache[tipo] && !force) return _cache[tipo];
    try{
      const snap = await db.collection(colName(tipo)).get();
      _cache[tipo] = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
    }catch(e){
      console.warn('Não foi possível carregar '+cfg(tipo).colecao+':', e);
      _cache[tipo] = _cache[tipo] || [];
    }
    return _cache[tipo];
  }

  if(typeof escapeHtml !== 'function'){
    window.escapeHtml = function(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); };
  }
  function brl(v){ return typeof grhBRL==='function' ? grhBRL(v) : 'R$ '+(parseFloat(v)||0).toFixed(2).replace('.',','); }

  // ── HTML DO CORPO DO CARD (tabela + toolbar) — usado pelo painelHTML('beneficios') ──
  window.grhBeneficioCardBody = function(tipo){
    const c = cfg(tipo);
    return `
      <div style="padding:18px 22px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)">
        <p id="grh-bsa-${tipo}-count" style="margin:0;font-size:12px;color:var(--ink-60)">Carregando...</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input id="grh-bsa-${tipo}-search" type="text" placeholder="🔍 Buscar colaborador…" style="width:200px;padding:8px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px" oninput="grhRenderBeneficioPlano('${tipo}')"/>
          <input accept=".xlsx,.xls" id="grh-bsa-${tipo}-file-input" onchange="grhImportarBeneficioPlano('${tipo}',this)" style="display:none" type="file"/>
          <button class="btn btn-g btn-sm" onclick="grhBaixarModeloBeneficioPlano('${tipo}')" style="white-space:nowrap">⬇️ Modelo Planilha</button>
          <button class="btn btn-g btn-sm" onclick="document.getElementById('grh-bsa-${tipo}-file-input').click()" style="white-space:nowrap">📤 Importar Planilha</button>
          <button class="btn btn-p btn-sm" onclick="grhAbrirModalBeneficioSaude('${tipo}',null)">➕ Novo controle</button>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table id="grh-bsa-${tipo}-table">
          <thead><tr>
            <th style="padding-left:20px">Colaborador</th>
            <th>Plano</th>
            <th>Titular</th>
            <th>Dependentes</th>
            <th>Valor Titular</th>
            <th>Valor Dependentes</th>
            <th>Total Mensal</th>
            <th>Status</th>
            <th style="width:90px">Ações</th>
          </tr></thead>
          <tbody id="grh-bsa-${tipo}-body"><tr><td colspan="9" style="text-align:center;padding:32px;color:var(--ink-60)">⏳ Carregando...</td></tr></tbody>
        </table>
      </div>`;
  };

  // ── EXPANDIR / RECOLHER CARD ──
  window.grhToggleBeneficioPlano = function(tipo){
    const card = $('grh-bplan-'+tipo);
    const body = $('grh-bplan-body-'+tipo);
    if(!card || !body) return;
    const aberto = body.style.display !== 'none';
    if(aberto){
      body.style.display = 'none';
      card.classList.remove('open');
    }else{
      body.style.display = 'block';
      card.classList.add('open');
      window.grhRenderBeneficioPlano(tipo);
    }
  };

  // ── RECALCULAR TOTAL NO MODAL ──
  window.grhBsaRecalcular = function(){
    const titular = n($('grh-bsa-valor-titular')?.value);
    const deps = n($('grh-bsa-valor-dependentes')?.value);
    const copart = n($('grh-bsa-copart')?.value);
    const total = titular + deps + copart;
    if($('grh-bsa-total-mensal')) $('grh-bsa-total-mensal').value = total.toFixed(2);
  };

  // ── AUTOCOMPLETE DE COLABORADOR ──
  window.grhAutocompleteBsa = async function(q){
    const lista = $('grh-bsa-nome-lista');
    if(!lista) return;
    const termo = (q||'').toLowerCase().trim();
    if(!termo){ lista.style.display='none'; return; }
    let colabs = [];
    try{ colabs = typeof window.grhGetColabs==='function' ? await window.grhGetColabs() : []; }catch(e){}
    const norm = s => (s||'').toLowerCase().trim();
    const matches = colabs.filter(c => norm(c.nome).includes(termo)).slice(0,10);
    if(!matches.length){ lista.style.display='none'; return; }
    _bsaAutoIdx = -1;
    lista.style.display='block';
    lista.innerHTML = matches.map((c,i) => `<div
        data-nome="${(c.nome||'').replace(/"/g,'&quot;')}"
        data-idx="${i}"
        onclick="grhSelecionarColabBsa(this)"
        onmouseenter="window.__grhBsaHoverIdx=${i}"
        style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);font-size:13px;font-weight:600;color:var(--ink)">${c.nome}</div>`).join('');
  };

  window.grhSelecionarColabBsa = function(el){
    $('grh-bsa-nome').value = el.dataset.nome;
    $('grh-bsa-nome-lista').style.display='none';
    _bsaAutoIdx = -1;
    $('grh-bsa-plano')?.focus();
  };

  window.grhAutocompleteBsaNav = function(e){
    const lista = $('grh-bsa-nome-lista');
    if(!lista || lista.style.display==='none') return;
    const items = lista.children;
    if(e.key==='ArrowDown'){ e.preventDefault(); _bsaAutoIdx = Math.min(_bsaAutoIdx+1, items.length-1); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); _bsaAutoIdx = Math.max(_bsaAutoIdx-1, 0); }
    else if(e.key==='Enter' && _bsaAutoIdx>=0){ e.preventDefault(); window.grhSelecionarColabBsa(items[_bsaAutoIdx]); return; }
    else if(e.key==='Escape'){ lista.style.display='none'; return; }
    Array.from(items).forEach((el,i)=>{ el.style.background = i===_bsaAutoIdx ? 'var(--pur-soft)' : ''; });
  };

  document.addEventListener('click', function(e){
    if(!e.target.closest('#grh-modal-bsa')){
      const lista = $('grh-bsa-nome-lista');
      if(lista) lista.style.display='none';
    }
  });

  // ── RENDER TABELA + KPIs (de um card específico) ──
  window.grhRenderBeneficioPlano = async function(tipo){
    const c = cfg(tipo);
    const tbody = $('grh-bsa-'+tipo+'-body');

    const todos = await getDados(tipo);
    const ativos = todos.filter(b => (b.status||'Ativo')==='Ativo');
    const custoTotal = ativos.reduce((s,b) => s + (n(b.valorTitular)+n(b.valorDependentes)+n(b.coparticipacao)), 0);

    // KPIs do cabeçalho (sempre atualizados, mesmo com o card fechado)
    if($('grh-bsa-'+tipo+'-total')) $('grh-bsa-'+tipo+'-total').textContent = ativos.length;
    if($('grh-bsa-'+tipo+'-custo')) $('grh-bsa-'+tipo+'-custo').textContent = brl(custoTotal);

    if(!tbody) return; // card ainda recolhido — corpo não renderizado

    try{
      const q = ($('grh-bsa-'+tipo+'-search')?.value || '').toLowerCase().trim();
      const dados = q ? todos.filter(b => (b.nome||'').toLowerCase().includes(q)) : todos.slice();
      dados.sort((a,b) => (a.nome||'').localeCompare(b.nome||'','pt-BR'));

      const countEl = $('grh-bsa-'+tipo+'-count');
      if(countEl) countEl.textContent = `${todos.length} ${c.labelCount}${todos.length===1?'':'es'} no controle`;

      if(!dados.length){
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum colaborador cadastrado. Use "➕ Novo controle" ou importe uma planilha.</td></tr>`;
        return;
      }

      tbody.innerHTML = dados.map(b => {
        const titular = n(b.valorTitular);
        const deps = n(b.valorDependentes);
        const copart = n(b.coparticipacao);
        const total = titular + deps + copart;
        const statusCor = b.status==='Cancelado' ? '#fee2e2' : b.status==='Pendente' ? '#fef3c7' : '#dcfce7';
        const statusTxt = b.status==='Cancelado' ? '#991b1b' : b.status==='Pendente' ? '#b45309' : '#166534';
        return `<tr>
          <td style="padding-left:20px;font-weight:600">${escapeHtml(b.nome||'—')}${b.observacoes?`<br><small style="color:var(--ink-60)">${escapeHtml((b.observacoes||'').slice(0,60))}${(b.observacoes||'').length>60?'…':''}</small>`:''}</td>
          <td style="font-size:12px">${escapeHtml(b.plano||c.planoPadrao)}</td>
          <td>👤 Titular</td>
          <td>${parseInt(b.qtdDependentes)||0}</td>
          <td>${brl(titular)}</td>
          <td>${brl(deps)}</td>
          <td style="font-weight:700;color:var(--pur-vibrant)">${brl(total)}</td>
          <td><span style="background:${statusCor};color:${statusTxt};border-radius:999px;padding:3px 9px;font-size:11px;font-weight:700">${escapeHtml(b.status||'Ativo')}</span></td>
          <td style="white-space:nowrap">
            <button onclick="grhAbrirModalBeneficioSaude('${tipo}','${b._id}')" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px;margin-right:4px">✏️</button>
            <button onclick="grhExcluirBeneficioSaude('${tipo}','${b._id}','${(b.nome||'').replace(/'/g,"\\'")}' )" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button>
          </td>
        </tr>`;
      }).join('');
    }catch(e){
      if(tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--rust)">Erro: ${e.message}</td></tr>`;
    }
  };

  // Renderiza ambos os cards (KPIs do cabeçalho + tabela se aberto)
  window.grhRenderBeneficiosSaude = function(){
    window.grhRenderBeneficioPlano('saude');
    window.grhRenderBeneficioPlano('odonto');
  };

  // ── ABRIR MODAL (novo / editar) ──
  window.grhAbrirModalBeneficioSaude = async function(tipo, id){
    const c = cfg(tipo);
    const modal = $('grh-modal-bsa');
    const setV = (eid,v) => { const e=$(eid); if(e) e.value = v ?? ''; };

    // Popular opções de plano de acordo com o tipo
    const selPlano = $('grh-bsa-plano');
    if(selPlano) selPlano.innerHTML = c.planos.map(p => `<option>${p}</option>`).join('');

    setV('grh-bsa-tipo', tipo);
    $('grh-modal-bsa-title').textContent = c.icone + ' ' + c.titulo;

    if(id){
      const todos = await getDados(tipo);
      const b = todos.find(x => x._id===id);
      if(!b) return;
      $('grh-modal-bsa-title').textContent = '✏️ Editar — ' + c.titulo;
      setV('grh-bsa-id', id);
      setV('grh-bsa-nome', b.nome);
      setV('grh-bsa-plano', b.plano || c.planoPadrao);
      setV('grh-bsa-status', b.status || 'Ativo');
      setV('grh-bsa-qtd-dep', b.qtdDependentes ?? 0);
      setV('grh-bsa-valor-titular', b.valorTitular ?? '');
      setV('grh-bsa-valor-dependentes', b.valorDependentes ?? '');
      setV('grh-bsa-copart', b.coparticipacao ?? '');
      setV('grh-bsa-obs', b.observacoes || '');
    }else{
      $('grh-modal-bsa-title').textContent = '➕ Novo controle — ' + c.titulo;
      ['grh-bsa-id','grh-bsa-nome','grh-bsa-valor-titular','grh-bsa-valor-dependentes','grh-bsa-copart','grh-bsa-obs'].forEach(eid=>setV(eid,''));
      setV('grh-bsa-plano', c.planoPadrao);
      setV('grh-bsa-status','Ativo');
      setV('grh-bsa-qtd-dep', 0);
    }
    window.grhBsaRecalcular();
    modal.style.display = 'flex';
  };

  // ── SALVAR ──
  window.grhSalvarBeneficioSaude = async function(){
    const tipo = $('grh-bsa-tipo')?.value || 'saude';
    const c = cfg(tipo);
    const id = $('grh-bsa-id').value;
    const g = eid => $(eid)?.value.trim() || '';
    window.grhBsaRecalcular();
    const dados = {
      nome: g('grh-bsa-nome'),
      plano: g('grh-bsa-plano') || c.planoPadrao,
      status: g('grh-bsa-status') || 'Ativo',
      qtdDependentes: parseInt(g('grh-bsa-qtd-dep')) || 0,
      valorTitular: n(g('grh-bsa-valor-titular')),
      valorDependentes: n(g('grh-bsa-valor-dependentes')),
      coparticipacao: n(g('grh-bsa-copart')),
      observacoes: g('grh-bsa-obs')
    };
    if(!dados.nome){ alert('Selecione ou digite o nome do colaborador.'); return; }
    try{
      if(id){
        await db.collection(colName(tipo)).doc(id).update(dados);
      }else{
        await db.collection(colName(tipo)).add({ ...dados, criadoEm: new Date().toISOString() });
      }
      _cache[tipo] = null;
      window.grhFecharModal ? window.grhFecharModal('grh-modal-bsa') : ($('grh-modal-bsa').style.display='none');
      await window.grhRenderBeneficioPlano(tipo);
      if(typeof addNotif==='function') addNotif(`${c.titulo}: ${dados.nome} salvo.`, 'success');
      if(typeof log==='function') log('Benefícios RH', `${c.titulo} atualizado: ${dados.nome}`, c.icone);
    }catch(e){ alert('Erro ao salvar: ' + e.message); }
  };

  // ── EXCLUIR ──
  window.grhExcluirBeneficioSaude = async function(tipo, id, nome){
    const c = cfg(tipo);
    if(!confirm(`Remover "${nome}" do controle — ${c.titulo}?`)) return;
    try{
      await db.collection(colName(tipo)).doc(id).delete();
      _cache[tipo] = null;
      await window.grhRenderBeneficioPlano(tipo);
    }catch(e){ alert('Erro ao excluir: ' + e.message); }
  };

  // ── MODELO DE PLANILHA ──
  window.grhBaixarModeloBeneficioPlano = function(tipo){
    const c = cfg(tipo);
    if(typeof XLSX==='undefined'){ alert('Biblioteca XLSX não carregada.'); return; }
    const exemplo1 = tipo==='odonto'
      ? ['Maria Silva', c.planos[0], 'Ativo', 1, 45.00, 30.00, 0, 'Dependente: filho(a)']
      : ['Maria Silva', c.planos[0], 'Ativo', 1, 320.50, 180.00, 0, 'Dependente: filho(a)'];
    const exemplo2 = tipo==='odonto'
      ? ['João Costa', c.planos[1], 'Ativo', 0, 60.00, 0, 0, '']
      : ['João Costa', c.planos[1], 'Ativo', 0, 480.00, 0, 25.00, ''];
    const ws = XLSX.utils.aoa_to_sheet([
      ['Colaborador','Plano','Status','Qtd Dependentes','Valor Titular','Valor Dependentes','Coparticipação','Observações'],
      exemplo1,
      exemplo2,
    ]);
    ws['!cols'] = [{wch:28},{wch:22},{wch:12},{wch:14},{wch:14},{wch:18},{wch:16},{wch:30}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tipo==='odonto' ? 'PlanoOdonto' : 'PlanoSaude');
    XLSX.writeFile(wb, c.modeloArquivo);
    if(typeof log==='function') log('Benefícios RH', `Modelo de planilha (${c.titulo}) exportado`, '⬇️');
  };

  // ── IMPORTAR PLANILHA ──
  window.grhImportarBeneficioPlano = function(tipo, input){
    const c = cfg(tipo);
    const file = input.files[0];
    if(!file) return;
    input.value = '';
    if(typeof XLSX==='undefined'){ alert('Biblioteca XLSX não carregada.'); return; }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try{
        const wb = XLSX.read(e.target.result, { type:'array' });
        const sheetName = wb.SheetNames.find(nm => c.abaPlanilha.some(k => nm.toLowerCase().includes(k))) || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval:'' });
        if(!rows.length){ alert('Nenhum dado encontrado na planilha.'); return; }

        const normalize = s => String(s).toLowerCase().trim();
        const keys = Object.keys(rows[0]);
        const colMap = {};
        keys.forEach(k => {
          const x = normalize(k);
          if(x.includes('colaborador') || x==='nome') colMap.nome = k;
          else if(x.includes('plano')) colMap.plano = k;
          else if(x.includes('status')) colMap.status = k;
          else if(x.includes('dependente') && (x.includes('qtd') || x.includes('quantidade'))) colMap.qtdDependentes = k;
          else if(x.includes('valor titular') || (x.includes('titular') && x.includes('valor'))) colMap.valorTitular = k;
          else if(x.includes('valor dependente') || (x.includes('dependente') && x.includes('valor'))) colMap.valorDependentes = k;
          else if(x.includes('copart')) colMap.coparticipacao = k;
          else if(x.includes('observ')) colMap.observacoes = k;
        });
        if(!colMap.nome){ alert('Coluna "Colaborador" não encontrada na planilha.'); return; }

        const existentes = await getDados(tipo, true);
        const norm = s => (s||'').toLowerCase().trim();
        let novos = 0, atualizados = 0;
        const batch = db.batch();

        rows.forEach(row => {
          const nome = String(row[colMap.nome]||'').trim();
          if(!nome) return;
          const dados = {
            nome,
            plano: colMap.plano ? String(row[colMap.plano]||c.planoPadrao).trim() : c.planoPadrao,
            status: colMap.status ? (String(row[colMap.status]||'Ativo').trim() || 'Ativo') : 'Ativo',
            qtdDependentes: colMap.qtdDependentes ? (parseInt(row[colMap.qtdDependentes]) || 0) : 0,
            valorTitular: colMap.valorTitular ? n(row[colMap.valorTitular]) : 0,
            valorDependentes: colMap.valorDependentes ? n(row[colMap.valorDependentes]) : 0,
            coparticipacao: colMap.coparticipacao ? n(row[colMap.coparticipacao]) : 0,
            observacoes: colMap.observacoes ? String(row[colMap.observacoes]||'').trim() : ''
          };
          const existente = existentes.find(x => norm(x.nome)===norm(nome));
          if(existente){
            batch.set(db.collection(colName(tipo)).doc(existente._id), dados, { merge:true });
            atualizados++;
          }else{
            batch.set(db.collection(colName(tipo)).doc(), { ...dados, criadoEm: new Date().toISOString() });
            novos++;
          }
        });

        await batch.commit();
        _cache[tipo] = null;
        await window.grhRenderBeneficioPlano(tipo);
        if(typeof addNotif==='function') addNotif(`${c.titulo} importado: ${novos} novo(s), ${atualizados} atualizado(s).`, 'success');
        if(typeof log==='function') log('Benefícios RH', `Importação ${c.titulo}: ${novos} novo(s), ${atualizados} atualizado(s)`, '📤');
      }catch(err){
        alert('Erro ao importar planilha: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Render inicial dos KPIs (cabeçalhos) quando o painel já estiver visível no carregamento
  function tryAutoRender(){
    const pane = $('grh-pane-beneficios');
    if(pane && getComputedStyle(pane).display !== 'none'){
      window.grhRenderBeneficiosSaude();
    }
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(tryAutoRender, 1500));
  setTimeout(tryAutoRender, 2000);
})();


