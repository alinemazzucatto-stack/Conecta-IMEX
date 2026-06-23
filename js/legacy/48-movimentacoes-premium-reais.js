// ===== script: movimentacoes-premium-reais-js =====
(function(){
  'use strict';
  let movs = [];

  function esc(v){return String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function moneyToNumber(v){const s=String(v||'').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.');const n=parseFloat(s);return isNaN(n)?0:n;}
  function money(v){return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function pane(){return document.getElementById('grh-pane-movimentacoes') || document.getElementById('grh-pane-movimentacao') || document.querySelector('[id*="moviment"]');}
  function norm(v){return String(v||'').toLowerCase();}
  function tipoClass(m){const s=norm(m.motivo); if(s.includes('promo'))return 'promocao'; if(s.includes('substit'))return 'substituicao'; if(s.includes('admiss'))return 'admissao'; if(s.includes('interna')||s.includes('remanej'))return 'interna'; if(s.includes('quadro'))return 'quadro'; return 'substituicao';}
  function tipoResumo(m){const s=norm(m.motivo); if(s.includes('promo'))return 'Promoção'; if(s.includes('substit'))return 'Substituição'; if(s.includes('admiss'))return 'Admissão'; if(s.includes('interna')||s.includes('remanej'))return 'Mov. Interna'; if(s.includes('quadro'))return 'Aumento Quadro'; return 'Outros';}
  function status(m){return 'Pendente';}
  function stats(){return {
    total: movs.length,
    prom: movs.filter(m=>tipoResumo(m)==='Promoção').length,
    subs: movs.filter(m=>tipoResumo(m)==='Substituição').length,
    adm: movs.filter(m=>tipoResumo(m)==='Admissão').length,
    interna: movs.filter(m=>tipoResumo(m)==='Mov. Interna').length,
    pend: movs.length
  };}
  function renderRows(list){
    return list.map((m,i)=>{const idx=movs.indexOf(m); return `<tr>
      <td><strong>${esc(m.mes)}</strong><br><small style="color:#64748b">MOV-${String(idx+1).padStart(4,'0')}</small></td>
      <td><span class="mov-badge ${tipoClass(m)}">${esc(tipoResumo(m))}</span><br><small style="color:#64748b">${esc(m.motivo||'-')}</small></td>
      <td><strong>${esc(m.colaborador||'-')}</strong></td>
      <td>${esc(m.substituir||'-')}</td>
      <td>${esc(m.cargoAtual||'-')}</td>
      <td>${esc(m.cargoProposto||'-')}</td>
      <td>${esc(m.salarioAtual||'-')}</td>
      <td>${esc(m.salarioProposto||'-')}</td>
      <td><span class="mov-badge pendente">${status(m)}</span></td>
      <td><div class="mov-actions">
        <button class="mov-action" title="Visualizar" onclick="window.movRealAbrir(${idx},'view')">👁</button>
        <button class="mov-action" title="Editar" onclick="window.movRealAbrir(${idx},'edit')">✏️</button>
        <button class="mov-action ok" title="Aprovar" onclick="window.movRealAprovar(${idx})">✅</button>
        <button class="mov-action danger" title="Reprovar" onclick="window.movRealReprovar(${idx})">❌</button>
        <button class="mov-action" title="Histórico" onclick="window.movRealAbrir(${idx},'hist')">📄</button>
      </div></td>
    </tr>`;}).join('');
  }
  function countBy(fn){const o={};movs.forEach(m=>{const k=fn(m)||'Outros';o[k]=(o[k]||0)+1;});return o;}
  function renderBars(obj){const max=Math.max(...Object.values(obj),1);return Object.entries(obj).map(([k,v])=>`<div class="mov-bar-row"><span>${esc(k)}</span><div class="mov-bar-bg"><div class="mov-bar" style="width:${Math.round(v/max*100)}%"></div></div><strong>${v}</strong></div>`).join('');}
  function render(){
    const p=pane(); if(!p)return;
    const s=stats();
    const anos=[...new Set(movs.map(m=>(m.mes||'').split('/')[1]).filter(Boolean))].sort();
    const tipos=[...new Set(movs.map(tipoResumo))];
    p.innerHTML = `<div class="mov-wrap">
      <div class="mov-kpi-grid">
        <div class="mov-kpi"><small>📈 Movimentações</small><strong>${s.total}</strong><span>dados importados do PDF</span></div>
        <div class="mov-kpi"><small>⬆️ Promoções</small><strong>${s.prom}</strong><span>prova/mérito interno</span></div>
        <div class="mov-kpi"><small>🔄 Substituições</small><strong>${s.subs}</strong><span>desligamento/remanejamento</span></div>
        <div class="mov-kpi"><small>🆕 Admissões</small><strong>${s.adm}</strong><span>novas entradas</span></div>
        <div class="mov-kpi"><small>🏢 Mov. Internas</small><strong>${s.interna}</strong><span>remanejamentos</span></div>
        <div class="mov-kpi"><small>📅 Última Movimentação</small><strong>${(movs.slice().sort((a,b)=>{const da=String(a.mes||'').split('/');const db=String(b.mes||'').split('/');return ((parseInt(db[1]||0)*100)+parseInt(db[0]||0))-((parseInt(da[1]||0)*100)+parseInt(da[0]||0));})[0]||{}).mes||'--'}</strong><span>${esc((movs.slice().sort((a,b)=>{const da=String(a.mes||'').split('/');const db=String(b.mes||'').split('/');return ((parseInt(db[1]||0)*100)+parseInt(db[0]||0))-((parseInt(da[1]||0)*100)+parseInt(da[0]||0));})[0]||{}).colaborador||'')}</span></div>
      </div>

      <div class="mov-card">
        <div class="mov-card-head">
          <div><h2>🔄 Base de Movimentações</h2><p>Dados reais extraídos da planilha/PDF enviado: mês, motivo, substituição, colaborador, cargos, salários e alteração.</p></div>
          <div class="mov-tools">
            <button class="btn btn-g" onclick="window.movRealExportExcel()">📊 Exportar Excel</button>
            <button class="btn btn-g" onclick="window.movRealExportPDF()">📄 Exportar PDF</button>
            <button class="btn btn-p" onclick="window.movRealNova()">+ Nova Movimentação</button>
          </div>
        </div>
        <div class="mov-card-body">
          <div class="mov-filter-row">
            <input id="movRealBusca" placeholder="Buscar colaborador, substituído, cargo ou motivo..." oninput="window.movRealFiltrar()">
            <select id="movRealTipo" onchange="window.movRealFiltrar()"><option value="">Tipo</option>${tipos.map(t=>`<option>${esc(t)}</option>`).join('')}</select>
            <select id="movRealAno" onchange="window.movRealFiltrar()"><option value="">Ano</option>${anos.map(a=>`<option>${esc(a)}</option>`).join('')}</select>
            <select id="movRealAlteracao" onchange="window.movRealFiltrar()"><option value="">Alteração</option><option>CTPS</option><option>PLUS</option><option>PJ</option><option>CLT</option><option>Sem alterações</option></select>
            <select id="movRealOrdem" onchange="window.movRealFiltrar()">
              <option value="recente">Mais recentes primeiro</option>
              <option value="antiga">Mais antigas primeiro</option>
              <option value="maior-impacto">Maior impacto salarial</option>
              <option value="menor-impacto">Menor impacto salarial</option>
              <option value="promocoes">Promoções</option>
              <option value="substituicoes">Substituições</option>
              <option value="admissoes">Admissões</option>
            </select>
            <button class="btn btn-g" onclick="window.movRealLimpar()">Limpar</button>
          </div>
          <div class="mov-table-wrap">
            <table class="mov-table"><thead><tr><th>Mês</th><th>Tipo/Motivo</th><th>Colaborador</th><th>A substituir</th><th>Cargo atual</th><th>Cargo proposto</th><th>Salário atual</th><th>Salário proposto</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody id="movRealTbody">${renderRows(movs.slice().sort((a,b)=>{const da=String(a.mes||"").split("/");const db=String(b.mes||"").split("/");return ((parseInt(db[1]||0)*100)+parseInt(db[0]||0))-((parseInt(da[1]||0)*100)+parseInt(da[0]||0));}))}</tbody></table>
          </div>
        </div>
      </div>

      <div class="mov-grid-2">
        <div class="mov-card"><div class="mov-card-head"><div><h2>📊 Movimentações por Tipo</h2><p>Resumo dos motivos registrados.</p></div></div><div class="mov-card-body"><div class="mov-bars">${renderBars(countBy(tipoResumo))}</div></div></div>
        <div class="mov-card"><div class="mov-card-head"><div><h2>📅 Movimentações por Ano</h2><p>Distribuição cronológica da base.</p></div></div><div class="mov-card-body"><div class="mov-bars">${renderBars(countBy(m=>(m.mes||'').split('/')[1]||'Sem ano'))}</div></div></div>
      </div>

      <div class="mov-card"><div class="mov-card-head"><div><h2>📈 Rodapé Executivo</h2><p>Resumo rápido da base histórica.</p></div></div><div class="mov-card-body">
        <div class="mov-footer-grid">
          <div class="mov-mini"><small>Promoções</small><strong>${s.prom}</strong><span>registros</span></div>
          <div class="mov-mini"><small>Substituições</small><strong>${s.subs}</strong><span>registros</span></div>
          <div class="mov-mini"><small>Admissões</small><strong>${s.adm}</strong><span>registros</span></div>
          <div class="mov-mini"><small>Total</small><strong>${s.total}</strong><span>movimentações</span></div>
        </div>
      </div></div>
    </div>`;
    window.__movRealRendered=true;
  }
  window.movRealFiltrar=function(){
    const q=norm(document.getElementById('movRealBusca')?.value||'');
    const tipo=document.getElementById('movRealTipo')?.value||'';
    const ano=document.getElementById('movRealAno')?.value||'';
    const alt=norm(document.getElementById('movRealAlteracao')?.value||'');
    const list=movs.filter(m=>(!q||norm(Object.values(m).join(' ')).includes(q))&&(!tipo||tipoResumo(m)===tipo)&&(!ano||String(m.mes).includes(ano))&&(!alt||norm(m.alteracao).includes(alt)));
    const tb=document.getElementById('movRealTbody'); if(tb)tb.innerHTML=renderRows(list);
  };
  window.movRealLimpar=function(){['movRealBusca','movRealTipo','movRealAno','movRealAlteracao'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});window.movRealFiltrar();};
  function dadosHTML(m,readonly){
    const ro=readonly?'readonly':'';
    return `<div class="mov-form">
      <label>Mês<input value="${esc(m.mes)}" ${ro}></label>
      <label>Motivo<input value="${esc(m.motivo)}" ${ro}></label>
      <label>Colaborador<input value="${esc(m.colaborador)}" ${ro}></label>
      <label>Colaborador a substituir<input value="${esc(m.substituir)}" ${ro}></label>
      <label>Cargo atual<input value="${esc(m.cargoAtual)}" ${ro}></label>
      <label>Cargo proposto<input value="${esc(m.cargoProposto)}" ${ro}></label>
      <label>Salário atual<input value="${esc(m.salarioAtual)}" ${ro}></label>
      <label>Salário proposto<input value="${esc(m.salarioProposto)}" ${ro}></label>
      <label>Status<select ${readonly?'disabled':''}><option>Pendente</option><option>Aprovado</option><option>Reprovado</option></select></label>
      <label class="full">Alteração / Observações<textarea ${readonly?'readonly':''}>${esc(m.alteracao)}</textarea></label>
    </div>`;
  }
  function impactoHTML(m){
    const atual=moneyToNumber(m.salarioAtual), prop=moneyToNumber(m.salarioProposto), dif=prop-atual;
    return `<div class="mov-info-grid">
      <div class="mov-info-card"><h3>Antes</h3><p><strong>${m.salarioAtual||'Não informado'}</strong></p></div>
      <div class="mov-info-card"><h3>Depois</h3><p><strong>${m.salarioProposto||'Não informado'}</strong></p></div>
      <div class="mov-info-card"><h3>Diferença mensal</h3><p><strong style="color:${dif>=0?'#15803d':'#b91c1c'}">${money(dif)}</strong></p></div>
      <div class="mov-info-card"><h3>Impacto anual</h3><p><strong style="font-size:22px;color:#0047FF">${money(dif*12)}</strong></p></div>
    </div>`;
  }
  function historicoHTML(m){return `<div class="mov-info-grid"><div class="mov-info-card"><h3>Origem</h3><p>${esc(m.substituir||'-')}</p><p>${esc(m.cargoAtual||'-')}</p></div><div class="mov-info-card"><h3>Destino</h3><p>${esc(m.colaborador||'-')}</p><p>${esc(m.cargoProposto||'-')}</p></div><div class="mov-info-card"><h3>Alteração</h3><p>${esc(m.alteracao||'-')}</p></div><div class="mov-info-card"><h3>Integração futura</h3><p>Ao aprovar, poderá atualizar Colaboradores, Remuneração, Histórico e Auditoria.</p></div></div>`;}
  window.movRealAbrir=function(idx,modo){
    const m=movs[idx]; if(!m)return;
    let modal=document.getElementById('movRealModal'); if(!modal){modal=document.createElement('div');modal.id='movRealModal';modal.className='mov-modal';document.body.appendChild(modal);}
    modal.innerHTML=`<div class="mov-box">
      <div class="mov-head"><div><h2>${modo==='edit'?'✏️ Editar Movimentação':modo==='hist'?'📄 Histórico':'👁️ Visualizar Movimentação'}</h2><p>${esc(m.colaborador||'-')} · ${esc(tipoResumo(m))} · ${esc(m.mes)}</p></div><button class="mov-close" type="button">×</button></div>
      <div class="mov-tabs"><button class="mov-tab active" data-tab="dados">📋 Dados</button><button class="mov-tab" data-tab="impacto">💰 Impacto</button><button class="mov-tab" data-tab="historico">📚 Histórico</button><button class="mov-tab" data-tab="auditoria">📝 Auditoria</button></div>
      <div class="mov-body" id="movRealBody">${modo==='hist'?historicoHTML(m):dadosHTML(m,modo==='view')}</div>
      <div class="mov-foot"><button class="mov-btn secondary" data-close>Cancelar</button><button class="mov-btn ok" onclick="window.movRealAprovar(${idx},true)">✅ Aprovar</button><button class="mov-btn danger" onclick="window.movRealReprovar(${idx},true)">❌ Reprovar</button><button class="mov-btn" onclick="window.movRealSalvar()">💾 Salvar</button></div>
    </div>`;
    modal.classList.add('active');
    modal.querySelector('.mov-close').onclick=()=>modal.classList.remove('active');
    modal.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal.classList.remove('active'));
    modal.querySelectorAll('.mov-tab').forEach(b=>b.onclick=function(){modal.querySelectorAll('.mov-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');const body=document.getElementById('movRealBody');if(b.dataset.tab==='dados')body.innerHTML=dadosHTML(m,modo==='view');if(b.dataset.tab==='impacto')body.innerHTML=impactoHTML(m);if(b.dataset.tab==='historico')body.innerHTML=historicoHTML(m);if(b.dataset.tab==='auditoria')body.innerHTML=`<div class="mov-info-card"><h3>Auditoria</h3><p>Registro importado do arquivo Gestão RH - Movimentações.</p><p>Mês: ${esc(m.mes)} · Motivo: ${esc(m.motivo)}</p></div>`;});
  };
  window.movRealSalvar=function(){const m=document.getElementById('movRealModal');if(m)m.classList.remove('active');alert('Movimentação salva em modo demonstrativo.');};
  window.movRealAprovar=function(idx,modal){if(modal)document.getElementById('movRealModal')?.classList.remove('active');alert('Movimentação aprovada.');};
  window.movRealReprovar=function(idx,modal){if(modal)document.getElementById('movRealModal')?.classList.remove('active');alert('Movimentação reprovada.');};
  window.movRealNova=function(){window.movRealAbrir(0,'edit');};
  window.movRealExportExcel=function(){if(!window.XLSX){alert('Biblioteca Excel não carregada.');return;} const ws=XLSX.utils.json_to_sheet(movs); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Movimentacoes'); XLSX.writeFile(wb,'movimentacoes_reais_imex.xlsx');};
  window.movRealExportPDF=function(){if(!(window.jspdf&&window.jspdf.jsPDF)){alert('Biblioteca PDF não carregada.');return;} const doc=new window.jspdf.jsPDF(); doc.text('Movimentações Reais - IMEX',14,18); if(doc.autoTable)doc.autoTable({startY:26,head:[['Mês','Motivo','Colaborador','Cargo Atual','Cargo Proposto','Salário Proposto']],body:movs.map(m=>[m.mes,m.motivo,m.colaborador,m.cargoAtual,m.cargoProposto,m.salarioProposto])}); doc.save('movimentacoes_reais_imex.pdf');};
  function aplicar(){const p=pane(); if(!p)return; if(getComputedStyle(p).display!=='none'&&!window.__movRealRendered)render();}
  const old=window.grhTab; window.grhTab=function(tab,btn){const r=typeof old==='function'?old.apply(this,arguments):undefined;if(String(tab||'').toLowerCase().includes('moviment')){window.__movRealRendered=false;setTimeout(aplicar,100);setTimeout(aplicar,600);} return r;};
  document.addEventListener('click',e=>{const el=e.target&&e.target.closest&&e.target.closest('button,a,div'); if(!el)return; const txt=(el.innerText||'').toLowerCase(); const attrs=((el.getAttribute('onclick')||'')+' '+(el.getAttribute('data-rh-tab')||'')+' '+(el.getAttribute('data-target')||'')).toLowerCase(); if(txt.includes('moviment')||attrs.includes('moviment')){window.__movRealRendered=false;setTimeout(aplicar,250);}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(aplicar,900)); else setTimeout(aplicar,900);
})();
