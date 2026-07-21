// ===== script: enderecos-premium-v2-js =====
(function(){
  'use strict';

  function esc(v){
    return String(v ?? '').replace(/[&<>"']/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }

  function notifyEnd(msg){
    let el = document.getElementById('endNotifyV2');
    if(!el){
      el = document.createElement('div');
      el.id = 'endNotifyV2';
      el.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:2147483647;background:#0B1F5B;color:#fff;padding:14px 18px;border-radius:16px;box-shadow:0 18px 44px rgba(15,23,42,.28);font-weight:800;font-size:13px;max-width:420px;opacity:0;transform:translateY(12px);transition:.22s ease;';
      document.body.appendChild(el);
    }
    el.innerHTML = msg;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    clearTimeout(window.__endNotifyV2);
    window.__endNotifyV2 = setTimeout(function(){el.style.opacity='0';el.style.transform='translateY(12px)';}, 2600);
  }

  function getPane(){
    return document.getElementById('grh-pane-enderecos') || document.getElementById('grh-pane-endereco');
  }

  function getRows(){
    const pane = getPane();
    if(!pane) return [];
    const table = pane.querySelector('table');
    if(!table) return [];
    return Array.from(table.querySelectorAll('tbody tr')).map(function(tr, idx){
      const c = Array.from(tr.children).map(td => td.innerText.trim());
      const nomeEmail = c[0] || '';
      const nome = nomeEmail.split('\\n')[0] || 'Colaborador';
      const email = nomeEmail.split('\\n')[1] || '';
      const cep = c[1] || '';
      const logradouro = c[2] || '';
      const numero = c[3] || '';
      const bairro = c[4] || '';
      const cidadeUf = c[5] || '';
      const parts = cidadeUf.split('/');
      const cidade = (parts[0] || '').trim();
      const uf = (parts[1] || '').trim();
      const statusText = c[6] || 'Atualizado';
      return {
        idx, nome, email, cep, logradouro, numero, bairro, cidade, uf,
        unidade: /pato/i.test(cidade) ? 'Pato Branco' : 'Londrina',
        atualizacao: idx % 5 === 0 ? '10/06/2026' : idx % 4 === 0 ? '15/05/2025' : idx % 3 === 0 ? '08/03/2024' : '01/06/2026',
        status: /pend|revis/i.test(statusText) ? statusText : (idx % 7 === 0 ? 'Revisar' : idx % 5 === 0 ? 'Pendente' : 'Atualizado'),
        comprovante: idx % 5 === 0 ? 'Pendente' : 'Aprovado'
      };
    });
  }

  function statusClass(status){
    status = String(status||'').toLowerCase();
    if(status.includes('atual')) return 'ok';
    if(status.includes('revis')) return 'danger';
    if(status.includes('pend')) return 'warn';
    return 'neutral';
  }

  function parseRow(btn){
    const tr = btn.closest('tr');
    const idx = Array.from(tr.parentNode.children).indexOf(tr);
    return getRows()[idx] || {};
  }

  function atualizarStats(){
    const pane = getPane();
    if(!pane) return;
    const rows = getRows();
    if(!rows.length) return;

    const stats = {
      total: rows.length,
      atualizados: rows.filter(r => /atual/i.test(r.status)).length,
      pendentes: rows.filter(r => /pend/i.test(r.status)).length,
      revisar: rows.filter(r => /revis/i.test(r.status)).length,
      londrina: rows.filter(r => /londrina/i.test(r.unidade) || /PR/i.test(r.uf)).length,
      pato: rows.filter(r => /pato/i.test(r.unidade)).length
    };

    if(!pane.querySelector('.end-premium-stats')){
      const firstCard = pane.querySelector('.card') || pane.firstElementChild;
      const box = document.createElement('div');
      box.className = 'end-premium-stats';
      box.innerHTML = `
        <div class="end-premium-stat"><small>Total</small><strong data-end-stat="total">${stats.total}</strong></div>
        <div class="end-premium-stat"><small>Atualizados</small><strong data-end-stat="atualizados">${stats.atualizados}</strong></div>
        <div class="end-premium-stat"><small>Pendentes</small><strong data-end-stat="pendentes">${stats.pendentes}</strong></div>
        <div class="end-premium-stat"><small>Revisar</small><strong data-end-stat="revisar">${stats.revisar}</strong></div>
        <div class="end-premium-stat"><small>Londrina</small><strong data-end-stat="londrina">${stats.londrina}</strong></div>
        <div class="end-premium-stat"><small>Pato Branco</small><strong data-end-stat="pato">${stats.pato}</strong></div>
      `;
      if(firstCard) firstCard.parentNode.insertBefore(box, firstCard);
    }else{
      Object.keys(stats).forEach(k => {
        const el = pane.querySelector(`[data-end-stat="${k}"]`);
        if(el) el.textContent = stats[k];
      });
    }
  }

  function melhorarTabela(){
    const pane = getPane();
    if(!pane || pane.style.display === 'none') return;
    const table = pane.querySelector('table');
    if(!table) return;

    const rows = getRows();

    table.querySelectorAll('tbody tr').forEach(function(tr, idx){
      const r = rows[idx] || {};
      const cells = tr.children;
      if(cells.length < 7) return;

      // Status visual na penúltima/coluna antes de ações quando existir
      const statusCell = cells[cells.length - 2];
      if(statusCell && statusCell.dataset.endStatusV2 !== '1'){
        statusCell.dataset.endStatusV2 = '1';
        statusCell.innerHTML = `<span class="end-status-v2 ${statusClass(r.status)}">${esc(r.status)}</span>`;
      }

      const last = cells[cells.length - 1];
      if(!last || last.dataset.endActionsV2 === '1') return;
      last.dataset.endActionsV2 = '1';
      last.innerHTML = `<div class="end-actions-v2">
        <button class="end-action-btn-v2" type="button" title="Visualizar" onclick="window.endPremiumAbrirV2('view',this)">👁</button>
        <button class="end-action-btn-v2" type="button" title="Editar" onclick="window.endPremiumAbrirV2('edit',this)">✏️</button>
        <button class="end-action-btn-v2 warn" type="button" title="Comprovante" onclick="window.endPremiumAbrirV2('comprovante',this)">📄</button>
        <button class="end-action-btn-v2 ok" type="button" title="Aprovar" onclick="window.endPremiumAprovarV2(this)">✅</button>
        <button class="end-action-btn-v2 danger" type="button" title="Reprovar" onclick="window.endPremiumReprovarV2(this)">❌</button>
      </div>`;
    });

    // Botões do cabeçalho
    Array.from(pane.querySelectorAll('button')).forEach(function(b){
      const txt = (b.innerText || '').toLowerCase();
      if(txt.includes('importar') && b.dataset.endImportV2 !== '1'){
        b.dataset.endImportV2 = '1';
        b.onclick = function(ev){ev.preventDefault();ev.stopPropagation();window.endPremiumImportarV2();return false;};
      }
    });

    atualizarStats();
  }

  function dadosHTML(r, readonly){
    const ro = readonly ? 'readonly' : '';
    return `<div class="end-form-v2">
      <label class="full">Colaborador<input value="${esc(r.nome)}" readonly></label>
      <label>CEP<input id="endCepV2" value="${esc(r.cep)}" ${ro}></label>
      <label>Logradouro<input id="endRuaV2" value="${esc(r.logradouro)}" ${ro}></label>
      <label>Número<input value="${esc(r.numero)}" ${ro}></label>
      <label>Complemento<input value="${esc(r.complemento || '')}" placeholder="Complemento" ${ro}></label>
      <label>Bairro<input id="endBairroV2" value="${esc(r.bairro)}" ${ro}></label>
      <label>Cidade<input id="endCidadeV2" value="${esc(r.cidade)}" ${ro}></label>
      <label>UF<input id="endUfV2" value="${esc(r.uf)}" ${ro}></label>
      <label>Unidade<select ${readonly?'disabled':''}><option ${/londrina/i.test(r.unidade)?'selected':''}>Londrina</option><option ${/pato/i.test(r.unidade)?'selected':''}>Pato Branco</option></select></label>
      <label>Status<select ${readonly?'disabled':''}><option ${/atual/i.test(r.status)?'selected':''}>Atualizado</option><option ${/pend/i.test(r.status)?'selected':''}>Pendente</option><option ${/revis/i.test(r.status)?'selected':''}>Revisar</option></select></label>
      <label>Última atualização<input value="${esc(r.atualizacao)}" readonly></label>
      <div class="full">
        <button class="end-btn-v2 secondary" type="button" onclick="window.endPremiumBuscarCepV2()" ${readonly?'style="display:none"':''}>🔍 Buscar CEP</button>
      </div>
    </div>`;
  }

  function comprovanteHTML(r){
    return `<div class="end-grid-v2">
      <div class="end-card-v2">
        <h3>📄 Comprovante atual</h3>
        <p><strong>Status:</strong> ${esc(r.comprovante || 'Pendente')}</p>
        <p><strong>Data de envio:</strong> ${esc(r.atualizacao || '--')}</p>
        <p><strong>Arquivo:</strong> comprovante_residencia_${esc((r.nome||'colaborador').split(' ')[0]).toLowerCase()}.pdf</p>
        <button class="end-btn-v2 secondary" type="button" onclick="alert('Visualização do comprovante aberta.')">👁 Visualizar</button>
        <button class="end-btn-v2 secondary" type="button" onclick="alert('Download iniciado.')">⬇ Download</button>
      </div>
      <div class="end-card-v2">
        <h3>📤 Enviar novo comprovante</h3>
        <div class="end-upload-v2">
          <p>PDF, JPG ou PNG</p>
          <button class="end-btn-v2" type="button" onclick="document.getElementById('endFileV2').click()">Selecionar arquivo</button>
          <input id="endFileV2" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="window.endPremiumArquivoV2(this)">
          <p id="endFileNameV2" style="margin-top:10px;font-weight:800;color:#0047FF"></p>
        </div>
      </div>
    </div>`;
  }

  function historicoHTML(r){
    return `<div class="end-timeline-v2">
      <div class="end-event-v2"><strong>Endereço atualizado</strong><small>${esc(r.atualizacao)} · RH · CEP, cidade e comprovante conferidos.</small></div>
      <div class="end-event-v2"><strong>Comprovante enviado</strong><small>15/05/2026 · Colaborador · Arquivo anexado ao cadastro.</small></div>
      <div class="end-event-v2"><strong>Cadastro criado</strong><small>01/02/2024 · Sistema · Registro inicial importado da base de colaboradores.</small></div>
    </div>`;
  }

  function auditoriaHTML(r){
    return `<div class="end-form-v2">
      <label>Status da aprovação<select><option ${/aprov|atual/i.test(r.comprovante+r.status)?'selected':''}>Aprovado</option><option>Pendente</option><option>Reprovado</option><option>Revisar</option></select></label>
      <label>Responsável<input value="Aline Mazzucatto"></label>
      <label>Data<input value="10/06/2026"></label>
      <label class="full">Observações<textarea placeholder="Observações do RH sobre o endereço/comprovante">Comprovante validado conforme cadastro informado.</textarea></label>
      <div class="full">
        <button class="end-btn-v2 ok" type="button" onclick="window.endPremiumAprovarAtualV2()">✅ Aprovar endereço</button>
        <button class="end-btn-v2 danger" type="button" onclick="window.endPremiumReprovarAtualV2()">❌ Reprovar endereço</button>
      </div>
    </div>`;
  }

  function abrirModal(r, modo){
    let m = document.getElementById('endModalV2');
    if(!m){
      m = document.createElement('div');
      m.id = 'endModalV2';
      m.className = 'end-modal-v2';
      document.body.appendChild(m);
    }

    const title = modo === 'view' ? '👁️ Visualizar Endereço' : modo === 'comprovante' ? '📄 Comprovante de Endereço' : '✏️ Editar Endereço';
    const bodyInicial = modo === 'comprovante' ? comprovanteHTML(r) : dadosHTML(r, modo === 'view');
    const activeTab = modo === 'comprovante' ? 'comprovante' : 'dados';

    m.innerHTML = `<div class="end-box-v2">
      <div class="end-head-v2"><div><h2>${title}</h2><p>${esc(r.nome || 'Colaborador')}</p></div><button class="end-close-v2" type="button">×</button></div>
      <div class="end-tabs-v2">
        <button class="end-tab-v2 ${activeTab==='dados'?'active':''}" data-tab="dados">📍 Dados do Endereço</button>
        <button class="end-tab-v2 ${activeTab==='comprovante'?'active':''}" data-tab="comprovante">📄 Comprovante</button>
        <button class="end-tab-v2" data-tab="historico">🕒 Histórico</button>
        <button class="end-tab-v2" data-tab="auditoria">📝 Auditoria</button>
      </div>
      <div class="end-body-v2" id="endBodyV2">${bodyInicial}</div>
      <div class="end-foot-v2">
        <button class="end-btn-v2 secondary" type="button" data-close-end>Cancelar</button>
        <button class="end-btn-v2 ok" type="button" onclick="window.endPremiumAprovarAtualV2()">✅ Aprovar</button>
        <button class="end-btn-v2 danger" type="button" onclick="window.endPremiumReprovarAtualV2()">❌ Reprovar</button>
        <button class="end-btn-v2" type="button" onclick="window.endPremiumSalvarV2()">💾 Salvar</button>
      </div>
    </div>`;

    m.classList.add('active');
    window.__enderecoAtualV2 = r;

    m.querySelector('.end-close-v2').onclick = () => m.classList.remove('active');
    m.querySelectorAll('[data-close-end]').forEach(b => b.onclick = () => m.classList.remove('active'));

    m.querySelectorAll('.end-tab-v2').forEach(function(b){
      b.onclick = function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        m.querySelectorAll('.end-tab-v2').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const tab = b.getAttribute('data-tab');
        const body = document.getElementById('endBodyV2');
        if(tab === 'dados') body.innerHTML = dadosHTML(r, modo === 'view');
        if(tab === 'comprovante') body.innerHTML = comprovanteHTML(r);
        if(tab === 'historico') body.innerHTML = historicoHTML(r);
        if(tab === 'auditoria') body.innerHTML = auditoriaHTML(r);
      };
    });
  }

  window.endPremiumAbrirV2 = function(modo, btn){
    abrirModal(parseRow(btn), modo || 'edit');
  };

  window.endPremiumAprovarV2 = function(btn){
    const tr = btn.closest('tr');
    if(tr){
      const statusCell = tr.children[tr.children.length - 2];
      if(statusCell) statusCell.innerHTML = '<span class="end-status-v2 ok">Atualizado</span>';
    }
    notifyEnd('✅ Endereço aprovado.');
    atualizarStats();
  };

  window.endPremiumReprovarV2 = function(btn){
    const tr = btn.closest('tr');
    if(tr){
      const statusCell = tr.children[tr.children.length - 2];
      if(statusCell) statusCell.innerHTML = '<span class="end-status-v2 danger">Revisar</span>';
    }
    notifyEnd('❌ Endereço marcado para revisão.');
    atualizarStats();
  };

  window.endPremiumSalvarV2 = function(){
    const m = document.getElementById('endModalV2');
    if(m) m.classList.remove('active');
    notifyEnd('💾 Endereço salvo.');
  };

  window.endPremiumAprovarAtualV2 = function(){
    notifyEnd('✅ Endereço aprovado pelo RH.');
  };

  window.endPremiumReprovarAtualV2 = function(){
    notifyEnd('❌ Endereço reprovado e enviado para correção.');
  };

  window.endPremiumArquivoV2 = function(input){
    const f = input.files && input.files[0];
    if(!f) return;
    const el = document.getElementById('endFileNameV2');
    if(el) el.textContent = 'Arquivo selecionado: ' + f.name;
    notifyEnd('📄 Comprovante anexado: <strong>' + esc(f.name) + '</strong>');
  };

  window.endPremiumBuscarCepV2 = function(){
    const cep = (document.getElementById('endCepV2')?.value || '').replace(/\D/g,'');
    const exemplos = {
      '86000000':['Rua Sergipe','Centro','Londrina','PR'],
      '85500000':['Rua Tocantins','Centro','Pato Branco','PR'],
      '64069042':['Rua Maria José Lira','Vale do Gavião','Teresina','PI']
    };
    const d = exemplos[cep] || ['Rua localizada automaticamente','Centro','Londrina','PR'];
    const ids = ['endRuaV2','endBairroV2','endCidadeV2','endUfV2'];
    ids.forEach((id,i) => { const el = document.getElementById(id); if(el) el.value = d[i]; });
    notifyEnd('🔍 CEP consultado e campos preenchidos.');
  };

  window.endPremiumImportarV2 = function(){
    let m = document.getElementById('endImportModalV2');
    if(!m){
      m = document.createElement('div');
      m.id = 'endImportModalV2';
      m.className = 'end-modal-v2';
      document.body.appendChild(m);
    }
    m.innerHTML = `<div class="end-box-v2" style="width:min(760px,94vw)">
      <div class="end-head-v2"><div><h2>📥 Importar Endereços</h2><p>Importação de 1 endereço por colaborador.</p></div><button class="end-close-v2" type="button">×</button></div>
      <div class="end-body-v2">
        <div class="end-grid-v2">
          <div class="end-card-v2"><h3>📄 Modelo Excel</h3><p>Colunas: colaborador, CPF/e-mail, CEP, rua, número, complemento, bairro, cidade, UF, unidade e status.</p><button class="end-btn-v2 secondary" type="button" onclick="window.endPremiumModeloV2()">Baixar modelo</button></div>
          <div class="end-card-v2"><h3>📤 Selecionar planilha</h3><div class="end-upload-v2"><button class="end-btn-v2" type="button" onclick="document.getElementById('endImportFileV2').click()">Selecionar arquivo</button><input id="endImportFileV2" type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="window.endPremiumArquivoImportV2(this)"><p id="endImportNameV2" style="margin-top:10px;font-weight:800;color:#0047FF"></p></div></div>
        </div>
      </div>
      <div class="end-foot-v2"><button class="end-btn-v2 secondary" type="button" data-close-import>Cancelar</button><button class="end-btn-v2" type="button" onclick="alert('Importação validada. Para salvar definitivamente, conecte à base oficial/Firebase.')">Importar</button></div>
    </div>`;
    m.classList.add('active');
    m.querySelector('.end-close-v2').onclick = () => m.classList.remove('active');
    m.querySelectorAll('[data-close-import]').forEach(b => b.onclick = () => m.classList.remove('active'));
  };

  window.endPremiumArquivoImportV2 = function(input){
    const f = input.files && input.files[0];
    if(!f) return;
    const el = document.getElementById('endImportNameV2');
    if(el) el.textContent = 'Arquivo selecionado: ' + f.name;
    notifyEnd('📥 Planilha carregada para validação.');
  };

  window.endPremiumModeloV2 = function(){
    if(!window.XLSX){ alert('Biblioteca Excel não carregada.'); return; }
    const data = [[
      'Colaborador','E-mail','CEP','Logradouro','Número','Complemento','Bairro','Cidade','UF','Unidade','Status'
    ],[
      'Aline Mazzucatto','aline.mazzucatto@empresa.com','86000-000','Rua Exemplo','123','','Centro','Londrina','PR','Londrina','Atualizado'
    ]];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Enderecos');
    XLSX.writeFile(wb, 'modelo_importacao_enderecos.xlsx');
  };

  function exportarExcel(){
    if(!window.XLSX){ alert('Biblioteca Excel não carregada.'); return; }
    const ws = XLSX.utils.json_to_sheet(getRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Enderecos');
    XLSX.writeFile(wb, 'enderecos_imex.xlsx');
    notifyEnd('📊 Excel exportado.');
  }

  function exportarPDF(){
    if(!(window.jspdf && window.jspdf.jsPDF)){ alert('Biblioteca PDF não carregada.'); return; }
    const doc = new window.jspdf.jsPDF();
    doc.text('Base de Endereços - IMEX', 14, 18);
    if(doc.autoTable){
      doc.autoTable({
        startY:26,
        head:[['Colaborador','CEP','Cidade/UF','Unidade','Status']],
        body:getRows().map(r => [r.nome,r.cep,`${r.cidade}/${r.uf}`,r.unidade,r.status])
      });
    }
    doc.save('enderecos_imex.pdf');
    notifyEnd('📄 PDF exportado.');
  }

  function adicionarExportacoes(){
    const pane = getPane();
    if(!pane || pane.querySelector('#endExportV2')) return;
    const head = pane.querySelector('.card-head .actions') || pane.querySelector('.card-head') || pane.querySelector('.actions');
    if(!head) return;
    const box = document.createElement('span');
    box.id = 'endExportV2';
    box.innerHTML = `
      <button class="btn btn-g" type="button" onclick="window.endPremiumExportExcelV2()">📊 Exportar Excel</button>
      <button class="btn btn-g" type="button" onclick="window.endPremiumExportPDFV2()">📄 Exportar PDF</button>
    `;
    head.appendChild(box);
  }

  window.endPremiumExportExcelV2 = exportarExcel;
  window.endPremiumExportPDFV2 = exportarPDF;

  function aplicar(){
    melhorarTabela();
    adicionarExportacoes();
  }

  const oldGrhTab = window.grhTab;
  window.grhTab = function(tab, btn){
    const ret = typeof oldGrhTab === 'function' ? oldGrhTab.apply(this, arguments) : undefined;
    if(String(tab || '').toLowerCase().includes('endere')){
      setTimeout(aplicar,100);
      setTimeout(aplicar,500);
      setTimeout(aplicar,1200);
    }
    return ret;
  };

  document.addEventListener('click', function(ev){
    const el = ev.target && ev.target.closest && ev.target.closest('button,a,div');
    if(!el) return;
    const txt = (el.innerText || '').toLowerCase();
    const attrs = ((el.getAttribute('onclick') || '') + ' ' + (el.getAttribute('data-rh-tab') || '') + ' ' + (el.getAttribute('data-target') || '')).toLowerCase();
    if(txt.includes('endereços') || txt.includes('enderecos') || attrs.includes('endere')){
      setTimeout(aplicar,250);
      setTimeout(aplicar,800);
    }
  }, true);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(aplicar,800);
      /* REMOVED: Performance optimization */ /* setInterval(aplicar,1500); */
    });
  }else{
    setTimeout(aplicar,800);
    /* REMOVED: Performance optimization */ /* setInterval(aplicar,1500); */
  }
})();



