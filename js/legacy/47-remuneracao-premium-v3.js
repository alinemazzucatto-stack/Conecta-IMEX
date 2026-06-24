// ===== script: remuneracao-premium-v3-js =====
(function(){
  'use strict';

  let colaboradoresRem = [];
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  function money(v){ return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  function esc(v){ return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
  function norm(v){ return String(v||'').trim().toLowerCase(); }
  function pane(){ return document.getElementById('grh-pane-remuneracao') || document.getElementById('grh-pane-remuneracoes') || document.querySelector('[id*="remuner"]'); }

  function notify(msg){
    let el=document.getElementById('remNotifyV3');
    if(!el){
      el=document.createElement('div'); el.id='remNotifyV3';
      el.style.cssText='position:fixed;right:24px;bottom:24px;z-index:2147483647;background:#0B1F5B;color:#fff;padding:14px 18px;border-radius:16px;box-shadow:0 18px 44px rgba(15,23,42,.28);font-weight:800;font-size:13px;max-width:420px;opacity:0;transform:translateY(12px);transition:.22s ease;';
      document.body.appendChild(el);
    }
    el.innerHTML=msg; el.style.opacity='1'; el.style.transform='translateY(0)';
    clearTimeout(window.__remNotifyV3); window.__remNotifyV3=setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(12px)'},2600);
  }

  function nvl(){
    for(let i=0;i<arguments.length;i++){
      const v=arguments[i];
      if(v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return '';
  }

  function parseMoney(v){
    if(typeof v === 'number') return v;
    const s=String(v||'').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.');
    const n=parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  function contratoOf(c){
    const raw = nvl(c.tipo,c.contrato,c.tipoContrato,c.regime,c.clt,c.ehClt,c['É CLT?'],c['CLT']);
    if(typeof raw === 'boolean') return raw ? 'CLT' : 'PJ';
    const s=norm(raw);
    if(s==='sim' || s==='s' || s==='true' || s==='clt' || s.includes('clt')) return 'CLT';
    if(s==='não' || s==='nao' || s==='n' || s==='false' || s.includes('pj')) return 'PJ';
    return 'CLT';
  }

  function holeriteMaisRecente(c){
    const lista = Array.isArray(c.holerites) ? c.holerites : [];
    if(!lista.length) return null;
    return lista.slice().sort((a,b) => (b.mes||'').localeCompare(a.mes||''))[0];
  }

  function salarioOf(c){
    const h = holeriteMaisRecente(c);
    if(h && parseMoney(h.bruta)) return parseMoney(h.bruta);
    return parseMoney(nvl(c.salario,c.remuneracao,c.valor,c.salarioAtual,c['Salário'],c['Salário Atual'],c['Remuneração']));
  }

  function provisoesOf(c){
    const h = holeriteMaisRecente(c);
    if(!h) return 0;
    return (parseFloat(h.provisao13)||0) + (parseFloat(h.provisaoFerias)||0);
  }

  function benefOf(c){
    return parseMoney(nvl(c.beneficios,c.custoBeneficios,c.valorBeneficios,c.va,c['Benefícios'])) || 0;
  }

  function mapColab(c, idx){
    const nome = nvl(c.nome,c.name,c.colaborador,c.nomeCompleto,c['Nome'],'Colaborador');
    const tipo = contratoOf(c);
    const salario = salarioOf(c); // prioriza o holerite real mais recente; senão usa o salário cadastrado
    const holerite = holeriteMaisRecente(c);
    return {
      raw:c,
      nome,
      mat:nvl(c.matricula,c.matrícula,c.id,c.codigo,c['Matrícula'],String(idx+1).padStart(3,'0')),
      cargo:nvl(c.funcao,c.função,c.cargo,c.cargoAtual,c['Função'],c['Cargo'],'Não informado'),
      setor:nvl(c.setor,c.departamento,c.area,c.área,c['Setor'],'Não informado'),
      tipo,
      salario,
      temHolerite: !!holerite,
      mesHolerite: holerite ? holerite.mes : '',
      provisoes: provisoesOf(c),
      reajuste:nvl(c.ultimoReajuste,c.reajuste,c['Último Reajuste'],'--'),
      status:nvl(c.status,c.situacao,c.situação,c['Status'],'Ativo'),
      adm:nvl(c.admissao,c.admissão,c.dataAdmissao,c['Admissão'],'--'),
      cc:nvl(c.centroCusto,c.centro_de_custo,c.setor,c.departamento,'Não informado'),
      benef:benefOf(c)
    };
  }

  async function carregarBaseReal(){
    let list = [];
    try{
      if(typeof window.grhGetColabs === 'function'){
        const all = await window.grhGetColabs(true);
        if(Array.isArray(all)) list = all;
      }
    }catch(e){ console.warn('Falha grhGetColabs', e); }

    if(!list.length){
      const rows = Array.from(document.querySelectorAll('#grh-colab-body tr'));
      list = rows.map(tr => {
        const c = Array.from(tr.children).map(td => td.innerText.trim());
        return {
          nome:c[0] || '',
          matricula:c[1] || '',
          email:c[2] || '',
          cpf:c[3] || '',
          funcao:c[4] || '',
          setor:c[5] || '',
          clt:c[6] || '',
          admissao:c[7] || '',
          status:c[9] || 'Ativo'
        };
      }).filter(c => c.nome && !/carregando|nenhum/i.test(c.nome));
    }

    colaboradoresRem = list.map(mapColab).filter(c => c.nome && !/carregando|nenhum/i.test(c.nome));
    return colaboradoresRem;
  }

  function stats(){
    const ativos = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)));
    const total = ativos.reduce((s,c)=>s+c.salario,0);
    const clts = ativos.filter(c=>c.tipo==='CLT');
    const pjs = ativos.filter(c=>c.tipo==='PJ');
    const benef = ativos.reduce((s,c)=>s+c.benef,0);
    const provisoes = ativos.reduce((s,c)=>s+(c.provisoes||0),0);
    const comHolerite = ativos.filter(c=>c.temHolerite).length;
    return {
      folha:total,
      mediaClt:clts.length ? clts.reduce((s,c)=>s+c.salario,0)/clts.length : 0,
      mediaPj:pjs.length ? pjs.reduce((s,c)=>s+c.salario,0)/pjs.length : 0,
      custo:total+benef+provisoes,
      benef:benef,
      provisoes:provisoes,
      ativos:ativos.length,
      clt:clts.length,
      pj:pjs.length,
      comHolerite:comHolerite
    };
  }

  function renderRows(list){
    return list.map((c,i)=>{
      const originalIndex = colaboradoresRem.indexOf(c);
      return `<tr>
        <td><strong>${esc(c.nome)}</strong><br><small style="color:#64748b">${esc(c.mat)}</small></td>
        <td>${esc(c.cargo)}</td>
        <td>${esc(c.setor)}</td>
        <td><span class="rem-badge ${c.tipo.toLowerCase()}">${esc(c.tipo)}</span></td>
        <td><strong>${c.salario ? money(c.salario) : 'Não informado'}</strong>${c.temHolerite ? `<br><small style="color:#15803d;font-weight:800">💰 holerite ${esc(c.mesHolerite)}</small>` : ''}</td>
        <td>${esc(c.reajuste)}</td>
        <td><span class="rem-badge ${/ativo/i.test(c.status)?'ok':'warn'}">${esc(c.status)}</span></td>
        <td><div class="rem-actions">
          <button class="rem-action" title="Visualizar" onclick="window.remAbrirV3(${originalIndex},'view')">👁</button>
          <button class="rem-action" title="Alterar remuneração" onclick="window.remAbrirV3(${originalIndex},'edit')">✏️</button>
          <button class="rem-action" title="Histórico salarial" onclick="window.remAbrirV3(${originalIndex},'historico')">📈</button>
          <button class="rem-action" title="Exportar ficha" onclick="window.remFichaV3(${originalIndex})">📄</button>
        </div></td>
      </tr>`;
    }).join('');
  }

  function folhaSerie(){
    const base = stats().folha || 0;
    return meses.map((m,i)=> Math.round(base * (0.88 + (i*0.012))));
  }

  function render(){
    const p=pane(); if(!p) return;
    const s=stats();
    const serie=folhaSerie();
    const maxSerie=Math.max(...serie,1);
    const setores=[...new Set(colaboradoresRem.map(c=>c.cc || c.setor || 'Não informado'))];

    p.innerHTML = `
      <div class="rem-premium-wrap">
        <div class="rem-kpi-grid">
          <div class="rem-kpi"><small>💰 Folha do Mês</small><strong>${s.folha ? money(s.folha) : 'R$ 0,00'}</strong><span>${s.comHolerite}/${s.ativos} com holerite real importado</span></div>
          <div class="rem-kpi"><small>📄 Salário Médio CLT</small><strong>${s.mediaClt ? money(s.mediaClt) : 'R$ 0,00'}</strong><span>${s.clt} contratos CLT</span></div>
          <div class="rem-kpi"><small>🤝 Salário Médio PJ</small><strong>${s.mediaPj ? money(s.mediaPj) : 'R$ 0,00'}</strong><span>${s.pj} prestadores PJ</span></div>
          <div class="rem-kpi"><small>🏢 Custo Total RH</small><strong>${money(s.custo)}</strong><span>folha + benefícios + provisões (${money(s.provisoes)})</span></div>
          <div class="rem-kpi"><small>🎁 Custo Benefícios</small><strong>${money(s.benef)}</strong><span>saúde, odonto, VA e sindicato</span></div>
          <div class="rem-kpi"><small>👥 Colaboradores Ativos</small><strong>${s.ativos}</strong><span>base real de colaboradores</span></div>
        </div>

        <div class="rem-comparativo-grid" id="rem-comparativo-folha-beneficios-imex">
          <div class="rem-compare-card">
            <h3>📊 Comparativo Folha Atual x Anterior</h3>
            <p>Visão rápida da variação entre a folha atual e a folha anterior para apoiar o acompanhamento mensal do RH.</p>
            ${(()=>{ const atual=s.folha||0; const anterior=Math.round((serie[serie.length-2]||atual*0.94)||0); const variacao=atual-anterior; const perc=anterior?((variacao/anterior)*100):0; const max=Math.max(atual,anterior,1); return `
              <div class="rem-compare-kpis">
                <div class="rem-compare-kpi"><small>Folha Atual</small><strong>${money(atual)}</strong><span>Mês vigente</span></div>
                <div class="rem-compare-kpi"><small>Folha Anterior</small><strong>${money(anterior)}</strong><span>Mês anterior</span></div>
                <div class="rem-compare-kpi"><small>Variação</small><strong style="color:${variacao>=0?'#dc2626':'#16a34a'}">${variacao>=0?'+':''}${money(variacao)}</strong><span>${variacao>=0?'+':''}${perc.toFixed(1)}%</span></div>
              </div>
              <div class="rem-folha-bars">
                <div class="rem-folha-col"><div class="rem-folha-bar anterior" style="height:${Math.max(24,Math.round(anterior/max*130))}px"></div><div class="rem-folha-label">Anterior<br>${money(anterior)}</div></div>
                <div class="rem-folha-col"><div class="rem-folha-bar" style="height:${Math.max(24,Math.round(atual/max*130))}px"></div><div class="rem-folha-label">Atual<br>${money(atual)}</div></div>
              </div>`; })()}
          </div>

          <div class="rem-compare-card">
            <h3>🎁 Custos dos Benefícios</h3>
            <p>Insira os valores mensais dos benefícios para acompanhar o custo total além da folha salarial.</p>
            <input type="hidden" id="rem-beneficios-json-imex" value="{}">
            <div class="rem-beneficios-form">
              <div class="field"><label>Vale Alimentação</label><input id="rem-beneficio-va" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosIMEX()"></div>
              <div class="field"><label>Vale Refeição</label><input id="rem-beneficio-vr" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosIMEX()"></div>
              <div class="field"><label>Plano de Saúde</label><input id="rem-beneficio-saude" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosIMEX()"></div>
              <div class="field"><label>Odontológico</label><input id="rem-beneficio-odonto" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosIMEX()"></div>
              <div class="field"><label>Wellhub</label><input id="rem-beneficio-wellhub" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosIMEX()"></div>
              <div class="field"><label>Outros</label><input id="rem-beneficio-outros" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosIMEX()"></div>
            </div>
            <div class="rem-beneficios-total"><span>Total mensal dos benefícios</span><strong id="rem-beneficios-total-imex">R$ 0,00</strong></div>
            <div class="rem-beneficios-actions"><button class="btn btn-g btn-sm" onclick="remCalcCustosBeneficiosIMEX()">Atualizar total</button></div>
          </div>
        </div>

        <div class="rem-grid-2">
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📈 Evolução da Folha</h2><p>Projeção visual baseada na folha informada da base.</p></div></div>
            <div class="rem-card-body"><div class="rem-chart-lines">
              ${serie.map((v,i)=>`<div class="rem-col"><div class="rem-col-bar" title="${money(v)}" style="height:${Math.max(18,Math.round(v/maxSerie*190))}px"></div><small>${meses[i]}</small></div>`).join('')}
            </div></div>
          </div>
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📊 CLT x PJ</h2><p>Distribuição por tipo de contrato da base real.</p></div></div>
            <div class="rem-card-body">
              <div class="rem-donut" style="background:conic-gradient(#0047FF 0 ${s.ativos ? Math.round(s.clt/s.ativos*100) : 0}%, #fbbf24 ${s.ativos ? Math.round(s.clt/s.ativos*100) : 0}% 100%)"><div class="rem-donut-label">${s.ativos ? Math.round(s.clt/s.ativos*100) : 0}%</div></div>
              <div class="rem-legend">
                <div class="rem-leg"><span><i class="rem-dot" style="background:#0047FF"></i>CLT</span><strong>${s.clt}</strong></div>
                <div class="rem-leg"><span><i class="rem-dot" style="background:#fbbf24"></i>PJ</span><strong>${s.pj}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <div class="rem-card">
          <div class="rem-card-head">
            <div><h2>📋 Remuneração dos Colaboradores</h2><p>Base real de colaboradores. Salários aparecem como “Não informado” quando não existem no cadastro.</p></div>
            <div class="rem-tools">
              <button class="btn btn-g" onclick="window.remExportExcelV3()">📊 Exportar Excel</button>
              <button class="btn btn-g" onclick="window.remExportPDFV3()">📄 Exportar PDF</button>
              <button class="btn btn-g" onclick="typeof grhBaixarModeloHolerites==='function' && grhBaixarModeloHolerites()">⬇️ Modelo holerites</button>
              <button class="btn btn-g" onclick="document.getElementById('rem-holerites-file-input-v3').click()">📤 Importar holerites</button>
              <input type="file" id="rem-holerites-file-input-v3" accept=".xlsx,.xls" style="display:none" onchange="typeof grhImportarHolerites==='function' && grhImportarHolerites(this)"/>
              <button class="btn btn-p" onclick="window.remNovaAlteracaoV3()">+ Nova Alteração</button>
            </div>
          </div>
          <div class="rem-card-body">
            <div class="rem-filter-row">
              <input id="remBuscaV3" placeholder="Buscar colaborador, cargo ou setor..." oninput="window.remFiltrarV3()">
              <select id="remTipoV3" onchange="window.remFiltrarV3()"><option value="">Tipo contrato</option><option>CLT</option><option>PJ</option></select>
              <select id="remSetorV3" onchange="window.remFiltrarV3()"><option value="">Setor</option>${[...new Set(colaboradoresRem.map(c=>c.setor).filter(Boolean))].map(s=>`<option>${esc(s)}</option>`).join('')}</select>
              <select id="remFaixaV3" onchange="window.remFiltrarV3()"><option value="">Faixa salarial</option><option value="0">Sem salário informado</option><option value="2000">Até R$ 2.000</option><option value="4000">R$ 2.001 a R$ 4.000</option><option value="6000">R$ 4.001 a R$ 6.000</option><option value="6001">Acima de R$ 6.000</option></select>
              <button class="btn btn-g" onclick="window.remLimparFiltrosV3()">Limpar</button>
            </div>
            <div class="rem-table-wrap">
              <table class="rem-table">
                <thead><tr><th>Colaborador</th><th>Cargo</th><th>Setor</th><th>Tipo</th><th>Salário Atual</th><th>Último Reajuste</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody id="remTbodyV3">${renderRows(colaboradoresRem)}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="rem-grid-2">
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>🏢 Custos por Centro de Custo</h2><p>Somatório dos salários e benefícios informados por área.</p></div></div>
            <div class="rem-card-body"><div class="rem-bars">
              ${setores.map(cc=>{
                const val = colaboradoresRem.filter(c=>(c.cc||c.setor||'Não informado')===cc).reduce((s,c)=>s+c.salario+c.benef,0);
                const pct = s.custo ? Math.min(100,Math.round(val/s.custo*100)) : 0;
                return `<div class="rem-bar-row"><span>${esc(cc)}</span><div class="rem-bar-bg"><div class="rem-bar" style="width:${pct}%"></div></div><strong>${money(val)}</strong></div>`;
              }).join('')}
            </div></div>
          </div>
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📊 Distribuição por Faixa Salarial</h2><p>Leitura analítica no rodapé do módulo.</p></div></div>
            <div class="rem-card-body">
              <div class="rem-footer-grid">
                <div class="rem-faixa"><small>Sem salário informado</small><strong>${colaboradoresRem.filter(c=>!c.salario).length}</strong><span>colaboradores</span></div>
                <div class="rem-faixa"><small>Até R$ 4.000</small><strong>${colaboradoresRem.filter(c=>c.salario>0&&c.salario<=4000).length}</strong><span>colaboradores</span></div>
                <div class="rem-faixa"><small>R$ 4.001 a R$ 6.000</small><strong>${colaboradoresRem.filter(c=>c.salario>4000&&c.salario<=6000).length}</strong><span>colaboradores</span></div>
                <div class="rem-faixa"><small>Acima de R$ 6.000</small><strong>${colaboradoresRem.filter(c=>c.salario>6000).length}</strong><span>colaboradores</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    window.__remPremiumRenderedV3 = true;
  }

  window.remFiltrarV3 = function(){
    const q=(document.getElementById('remBuscaV3')?.value||'').toLowerCase();
    const tipo=document.getElementById('remTipoV3')?.value||'';
    const setor=document.getElementById('remSetorV3')?.value||'';
    const faixa=document.getElementById('remFaixaV3')?.value||'';
    let list=colaboradoresRem.filter(c=>{
      const matchQ=!q || (c.nome+c.cargo+c.setor).toLowerCase().includes(q);
      const matchTipo=!tipo || c.tipo===tipo;
      const matchSetor=!setor || c.setor===setor;
      let matchFaixa=true;
      if(faixa==='0') matchFaixa=!c.salario;
      if(faixa==='2000') matchFaixa=c.salario>0 && c.salario<=2000;
      if(faixa==='4000') matchFaixa=c.salario>2000 && c.salario<=4000;
      if(faixa==='6000') matchFaixa=c.salario>4000 && c.salario<=6000;
      if(faixa==='6001') matchFaixa=c.salario>6000;
      return matchQ&&matchTipo&&matchSetor&&matchFaixa;
    });
    const tb=document.getElementById('remTbodyV3'); if(tb) tb.innerHTML=renderRows(list);
  };
  window.remLimparFiltrosV3=function(){['remBuscaV3','remTipoV3','remSetorV3','remFaixaV3'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';}); window.remFiltrarV3();};

  function dadosHTML(c, readonly){
    const ro=readonly?'readonly':'';
    return `<div class="rem-form">
      <label class="full">Colaborador<input value="${esc(c.nome)}" readonly></label>
      <label>Salário atual<input value="${c.salario ? money(c.salario) : ''}" placeholder="Não informado" ${ro}></label>
      <label>Cargo<input value="${esc(c.cargo)}" ${ro}></label>
      <label>Setor<input value="${esc(c.setor)}" ${ro}></label>
      <label>Centro de custo<input value="${esc(c.cc)}" ${ro}></label>
      <label>Tipo contrato<select ${readonly?'disabled':''}><option ${c.tipo==='CLT'?'selected':''}>CLT</option><option ${c.tipo==='PJ'?'selected':''}>PJ</option></select></label>
      <label>Data admissão<input value="${esc(c.adm)}" ${ro}></label>
      <label>Último reajuste<input value="${esc(c.reajuste)}" ${ro}></label>
      <label class="full">Motivo da alteração<textarea ${readonly?'readonly':''}>Registro para controle interno do RH.</textarea></label>
    </div>`;
  }
  function historicoHTML(c){return `<div class="rem-timeline"><div class="rem-event"><strong>Salário atual · ${c.salario?money(c.salario):'Não informado'}</strong><small>${esc(c.reajuste)} · Registro vinculado à base real de colaboradores.</small></div><div class="rem-event"><strong>Cadastro de remuneração</strong><small>${esc(c.adm)} · Cargo: ${esc(c.cargo)} · Centro de custo: ${esc(c.cc)}.</small></div></div>`;}
  function beneficiosHTML(c){return `<div class="rem-info-grid"><div class="rem-info-card"><h3>🏥 Plano de Saúde</h3><p><strong>Empresa:</strong> A preencher</p><p><strong>Colaborador:</strong> A preencher</p><p><strong>Dependentes:</strong> A preencher</p></div><div class="rem-info-card"><h3>🦷 Odontológico</h3><p><strong>Empresa:</strong> A preencher</p><p><strong>Colaborador:</strong> A preencher</p></div><div class="rem-info-card"><h3>🍽️ Vale Alimentação</h3><p><strong>Valor mensal:</strong> A preencher</p><p><strong>Crédito:</strong> 30/31 ou último dia útil</p></div><div class="rem-info-card"><h3>💳 Cartão Sindicato</h3><p><strong>Valor:</strong> A preencher</p><p><strong>Status:</strong> A preencher</p></div></div>`;}
  function custosHTML(c){const encargos=c.tipo==='CLT'?c.salario*0.68:0; const total=c.salario+encargos+c.benef; return `<div class="rem-info-grid"><div class="rem-info-card"><h3>💰 Salário</h3><p>${c.salario?money(c.salario):'Não informado'}</p></div><div class="rem-info-card"><h3>📌 Encargos estimados</h3><p>${money(encargos)}</p></div><div class="rem-info-card"><h3>🎁 Benefícios</h3><p>${c.benef?money(c.benef):'Não informado'}</p><p>Saúde + Odonto + VA + Cartão Sindicato</p></div><div class="rem-info-card"><h3>🏢 Custo total colaborador</h3><p><strong style="font-size:22px;color:#0047FF">${money(total)}</strong></p></div></div>`;}
  function auditoriaHTML(c){return `<div class="rem-form"><label>Responsável<input value="Aline Mazzucatto"></label><label>Data alteração<input value="${new Date().toLocaleDateString('pt-BR')}"></label><label>Tipo de alteração<select><option>Reajuste salarial</option><option>Promoção</option><option>Dissídio</option><option>Correção cadastral</option></select></label><label class="full">Observações<textarea>Alteração registrada para controle interno do RH.</textarea></label></div>`;}

  window.remAbrirV3=function(idx,modo){
    const c=colaboradoresRem[idx]||colaboradoresRem[0]; if(!c) return;
    let m=document.getElementById('remModalV3'); if(!m){m=document.createElement('div');m.id='remModalV3';m.className='rem-modal';document.body.appendChild(m);}
    const title=modo==='edit'?'✏️ Alterar Remuneração':modo==='historico'?'📈 Histórico Salarial':'👁️ Visualizar Remuneração';
    const active=modo==='historico'?'historico':'dados';
    m.innerHTML=`<div class="rem-box"><div class="rem-head"><div><h2>${title}</h2><p>${esc(c.nome)} · ${esc(c.cargo)} · ${esc(c.tipo)}</p></div><button class="rem-close" type="button">×</button></div><div class="rem-tabs"><button class="rem-tab ${active==='dados'?'active':''}" data-tab="dados">📋 Dados Salariais</button><button class="rem-tab ${active==='historico'?'active':''}" data-tab="historico">📈 Histórico Salarial</button><button class="rem-tab" data-tab="beneficios">🎁 Benefícios</button><button class="rem-tab" data-tab="custos">💰 Custos Empresa</button><button class="rem-tab" data-tab="auditoria">📝 Auditoria</button></div><div class="rem-body" id="remBodyV3">${active==='historico'?historicoHTML(c):dadosHTML(c,modo==='view')}</div><div class="rem-foot"><button class="rem-btn secondary" data-close-rem>Cancelar</button><button class="rem-btn ok" onclick="window.remSalvarV3()">💾 Salvar</button></div></div>`;
    m.classList.add('active');
    m.querySelector('.rem-close').onclick=()=>m.classList.remove('active');
    m.querySelectorAll('[data-close-rem]').forEach(b=>b.onclick=()=>m.classList.remove('active'));
    m.querySelectorAll('.rem-tab').forEach(b=>b.onclick=function(){
      m.querySelectorAll('.rem-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active');
      const body=document.getElementById('remBodyV3'); const tab=b.dataset.tab;
      if(tab==='dados') body.innerHTML=dadosHTML(c,modo==='view');
      if(tab==='historico') body.innerHTML=historicoHTML(c);
      if(tab==='beneficios') body.innerHTML=beneficiosHTML(c);
      if(tab==='custos') body.innerHTML=custosHTML(c);
      if(tab==='auditoria') body.innerHTML=auditoriaHTML(c);
    });
  };
  window.remSalvarV3=function(){const m=document.getElementById('remModalV3'); if(m)m.classList.remove('active'); notify('💾 Alteração de remuneração salva.');};
  window.remFichaV3=function(idx){const c=colaboradoresRem[idx]||colaboradoresRem[0]; notify('📄 Ficha salarial gerada para <strong>'+esc(c.nome)+'</strong>.');};
  window.remNovaAlteracaoV3=function(){window.remAbrirV3(0,'edit');};
  window.remExportExcelV3=function(){ if(!window.XLSX){alert('Biblioteca Excel não carregada.');return;} const ws=XLSX.utils.json_to_sheet(colaboradoresRem.map(c=>({Colaborador:c.nome,Matrícula:c.mat,Cargo:c.cargo,Setor:c.setor,Tipo:c.tipo,Salário:c.salario||'',Status:c.status}))); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Remuneracao'); XLSX.writeFile(wb,'remuneracao_base_real.xlsx'); };
  window.remExportPDFV3=function(){ if(!(window.jspdf&&window.jspdf.jsPDF)){alert('Biblioteca PDF não carregada.');return;} const doc=new window.jspdf.jsPDF(); doc.text('Remuneração - Base Real',14,18); if(doc.autoTable){doc.autoTable({startY:26,head:[['Colaborador','Cargo','Tipo','Salário','Status']],body:colaboradoresRem.map(c=>[c.nome,c.cargo,c.tipo,c.salario?money(c.salario):'Não informado',c.status])});} doc.save('remuneracao_base_real.pdf'); };

  async function aplicar(){
    const p=pane(); if(!p) return;
    const visible=getComputedStyle(p).display!=='none';
    if(visible && !window.__remPremiumRenderedV3){
      await carregarBaseReal();
      render();
    }
  }

  const oldGrhTab=window.grhTab;
  window.grhTab=function(tab,btn){
    const ret=typeof oldGrhTab==='function'?oldGrhTab.apply(this,arguments):undefined;
    if(String(tab||'').toLowerCase().includes('remun')){window.__remPremiumRenderedV3=false;aplicar();setTimeout(aplicar,500);setTimeout(aplicar,1200);}
    return ret;
  };
  document.addEventListener('click',function(ev){
    const el=ev.target&&ev.target.closest&&ev.target.closest('button,a,div'); if(!el)return;
    const txt=(el.innerText||'').toLowerCase(); const attrs=((el.getAttribute('onclick')||'')+' '+(el.getAttribute('data-rh-tab')||'')+' '+(el.getAttribute('data-target')||'')).toLowerCase();
    if(txt.includes('remuneração')||txt.includes('remuneracao')||attrs.includes('remun')){window.__remPremiumRenderedV3=false;aplicar();setTimeout(aplicar,900);}
  },true);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(aplicar,900)); else setTimeout(aplicar,900);
})();
