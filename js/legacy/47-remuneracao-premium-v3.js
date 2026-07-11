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

  // Donut genérico (N segmentos) + legenda, no mesmo estilo visual do
  // donut CLT/PJ original (conic-gradient em .rem-donut). Reutilizado pelos
  // widgets de Distribuição por Faixa Salarial e Distribuição por Tipo de
  // Contrato para não duplicar a lógica de cálculo de ângulos.
  function donutSegmentos(items){
    const total = items.reduce((s,i)=>s+i.valor,0);
    let acc = 0;
    const stops = items.map(i=>{
      const de = total ? (acc/total*100) : 0;
      acc += i.valor;
      const ate = total ? (acc/total*100) : 0;
      return `${i.cor} ${de}% ${ate}%`;
    }).join(', ');
    const principal = items[0];
    const pctPrincipal = total ? Math.round(principal.valor/total*100) : 0;
    const legenda = items.map(i=>`<div class="rem-leg"><span><i class="rem-dot" style="background:${i.cor}"></i>${esc(i.label)}</span><strong>${i.valor}</strong></div>`).join('');
    return `<div class="rem-donut" style="background:conic-gradient(${stops || '#e2e8f0 0 100%'})"><div class="rem-donut-label">${pctPrincipal}%</div></div>
      <div class="rem-legend">${legenda}</div>`;
  }

  // Tipos reconhecidos no campo `tipoContrato` (formulário de Colaboradores,
  // #grh-c-tipocontrato). Quando presente, é usado tal qual — sem isso,
  // "Estágio"/"Aprendiz"/"Terceirizado" caíam todos no fallback genérico
  // CLT abaixo e ficavam invisíveis na Distribuição por Tipo de Contrato.
  const TIPOS_CONTRATO_CONHECIDOS = ['CLT','PJ','Estágio','Aprendiz','Terceirizado'];
  function contratoOf(c){
    if(c.tipoContrato && TIPOS_CONTRATO_CONHECIDOS.indexOf(c.tipoContrato)!==-1) return c.tipoContrato;
    const raw = nvl(c.tipo,c.contrato,c.regime,c.clt,c.ehClt,c['É CLT?'],c['CLT']);
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
      nivel:nvl(c.nivel,''),
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
    const comSalario = ativos.filter(c=>c.salario>0);
    const salarios = comSalario.map(c=>c.salario);
    return {
      folha:total,
      mediaClt:clts.length ? clts.reduce((s,c)=>s+c.salario,0)/clts.length : 0,
      mediaPj:pjs.length ? pjs.reduce((s,c)=>s+c.salario,0)/pjs.length : 0,
      mediaGeral: comSalario.length ? total/comSalario.length : 0,
      maiorSalario: salarios.length ? Math.max.apply(null, salarios) : 0,
      menorSalario: salarios.length ? Math.min.apply(null, salarios) : 0,
      custo:total+benef+provisoes,
      benef:benef,
      provisoes:provisoes,
      ativos:ativos.length,
      clt:clts.length,
      pj:pjs.length,
      comHolerite:comHolerite
    };
  }

  // Horas extras / bônus / comissões / outros custos não têm nenhuma fonte
  // de dado no sistema hoje — diferente de "Custos dos Benefícios" (que só
  // calcula na tela e nunca persiste), aqui gravamos de verdade em
  // col('grh_custos_extra'), 1 documento por competência (mês), para que o
  // Comparativo Detalhado da Folha tenha um "anterior" real de verdade.
  function competenciaAtualStr(){ const h=new Date(); return h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0'); }
  function competenciaAnteriorStr(comp){ const [a,m]=comp.split('-').map(Number); const d=new Date(a,(m-1)-1,1); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
  async function carregarCustosExtra(){
    const atual = competenciaAtualStr();
    const anterior = competenciaAnteriorStr(atual);
    const vazio = {horasExtras:0,bonus:0,comissoes:0,outros:0};
    try{
      const [docAtual, docAnterior] = await Promise.all([
        db.collection(col('grh_custos_extra')).doc(atual).get(),
        db.collection(col('grh_custos_extra')).doc(anterior).get()
      ]);
      return {
        atual: docAtual.exists ? Object.assign({}, vazio, docAtual.data()) : vazio,
        anterior: docAnterior.exists ? Object.assign({}, vazio, docAnterior.data()) : vazio,
        competenciaAtual: atual, competenciaAnterior: anterior
      };
    }catch(e){
      console.warn('[remuneracao] Falha ao carregar custos extras', e);
      return { atual: vazio, anterior: vazio, competenciaAtual: atual, competenciaAnterior: anterior };
    }
  }
  window.remSalvarCustosExtraV3 = async function(){
    const g = id => parseFloat(document.getElementById(id)?.value) || 0;
    const dados = { horasExtras:g('rem-extra-horas'), bonus:g('rem-extra-bonus'), comissoes:g('rem-extra-comissoes'), outros:g('rem-extra-outros'), atualizadoEm:new Date().toISOString() };
    try{
      await db.collection(col('grh_custos_extra')).doc(competenciaAtualStr()).set(dados, {merge:true});
      notify('💾 Custos extras salvos para ' + competenciaAtualStr() + '.');
      window.__remPremiumRenderedV3 = false;
      await aplicar();
    }catch(e){ notify('❌ Erro ao salvar: ' + (e.message||e)); }
  };

  // Conta quantas "Alteração Salarial" foram registradas em grh_mov dentro
  // da competência (mês) atual — usado no KPI "Reajustes no Mês".
  async function reajustesDoMesAtual(){
    try{
      if(typeof window.grhGetMov !== 'function') return 0;
      const mov = await window.grhGetMov();
      const hoje = new Date();
      const prefixo = hoje.getFullYear()+'-'+String(hoje.getMonth()+1).padStart(2,'0');
      return (Array.isArray(mov)?mov:[]).filter(m=>m.tipo==='Alteração Salarial' && String(m.data||'').startsWith(prefixo)).length;
    }catch(e){ return 0; }
  }

  // Card KPI com indicador de variação opcional (usado nos cards executivos
  // do topo). `trend` é {pct, favoravel} ou null quando não há comparação
  // real disponível — nesse caso mostra só o valor, sem inventar tendência.
  function kpiCardRem(icon, label, valor, sub, trend){
    const trendHTML = trend ? `<div class="rem-kpi-trend ${trend.pct>=0?(trend.favoravel===false?'down':'up'):(trend.favoravel===false?'up':'down')}">${trend.pct>=0?'▲':'▼'} ${Math.abs(trend.pct).toFixed(1)}% vs anterior</div>` : '';
    return `<div class="rem-kpi"><small>${icon} ${label}</small><strong>${valor}</strong><span>${sub}</span>${trendHTML}</div>`;
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

  // Tenta montar a série de evolução da folha a partir do histórico REAL
  // (grh_rem tem um campo `competencia` 'YYYY-MM' por registro). Só usa
  // dado real se houver pelo menos 3 competências distintas nos dados —
  // com menos que isso o gráfico ficaria enganoso (poucos pontos reais
  // misturados com meses vazios), então cai no comportamento sintético
  // já existente (folhaSerie), deixando isso claro na legenda do card.
  async function folhaSerieRealOuEstimada(){
    try{
      if(typeof window.grhGetRem !== 'function') return { real:false, labels:meses, serie:folhaSerie() };
      const rem = await window.grhGetRem();
      if(!Array.isArray(rem) || !rem.length) return { real:false, labels:meses, serie:folhaSerie() };
      const porCompetencia = {};
      rem.forEach(r=>{
        const comp = (r.competencia||'').trim();
        if(!comp) return;
        const valor = parseMoney(r.custoTotal) || parseMoney(r.salario) || 0;
        porCompetencia[comp] = (porCompetencia[comp]||0) + valor;
      });
      const competencias = Object.keys(porCompetencia).sort();
      if(competencias.length < 3) return { real:false, labels:meses, serie:folhaSerie() };
      const ultimas = competencias.slice(-6);
      const labels = ultimas.map(c=>{ const [ano,mes]=c.split('-'); return (meses[(parseInt(mes,10)||1)-1]||c)+'/'+String(ano||'').slice(-2); });
      const serie = ultimas.map(c=>Math.round(porCompetencia[c]));
      return { real:true, labels, serie };
    }catch(e){
      console.warn('[remuneracao] Falha ao montar série real da folha, usando estimativa', e);
      return { real:false, labels:meses, serie:folhaSerie() };
    }
  }

  function render(serieInfo, reajustesMes, custosExtra){
    const p=pane(); if(!p) return;
    const s=stats();
    serieInfo = serieInfo || { real:false, labels:meses, serie:folhaSerie() };
    reajustesMes = reajustesMes || 0;
    custosExtra = custosExtra || { atual:{horasExtras:0,bonus:0,comissoes:0,outros:0}, anterior:{horasExtras:0,bonus:0,comissoes:0,outros:0}, competenciaAtual:competenciaAtualStr(), competenciaAnterior:'' };
    const serie=serieInfo.serie;
    const labelsSerie=serieInfo.labels;
    const maxSerie=Math.max(...serie,1);
    const setores=[...new Set(colaboradoresRem.map(c=>c.cc || c.setor || 'Não informado'))];
    const setoresReais=[...new Set(colaboradoresRem.map(c=>c.setor || 'Não informado'))];

    // Comparação com a competência anterior — só quando há uma segunda
    // competência REAL na série (serieInfo.real). Sem dado real de mês
    // anterior, os KPIs mostram só o valor atual, sem tendência inventada.
    const folhaAnterior = serieInfo.real && serie.length>=2 ? serie[serie.length-2] : null;
    const trendFolha = folhaAnterior ? { pct: ((s.folha-folhaAnterior)/(folhaAnterior||1))*100, favoravel:false } : null;

    p.innerHTML = `
      <div class="rem-premium-wrap">
        <div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important">
          <div class="h-content">
            <div class="h-eyebrow">Painel estratégico de RH</div>
            <h1>REMUNERAÇÃO</h1>
            <p>Folha, custos com pessoal, faixas salariais e simulações — tudo consolidado a partir da base real de colaboradores.</p>
          </div>
          <div class="h-stats">
            <div class="h-stat"><span class="h-num">${s.ativos}</span><span class="h-lbl">Colaboradores ativos</span></div>
            <div class="h-stat"><span class="h-num">${money(s.custo)}</span><span class="h-lbl">Custo total RH</span></div>
          </div>
        </div>

        <div class="rem-kpi-grid" style="grid-template-columns:repeat(4,minmax(135px,1fr))">
          ${kpiCardRem('💰','Folha Salarial (mês)', s.folha?money(s.folha):'R$ 0,00', `${s.comHolerite}/${s.ativos} com holerite real`, trendFolha)}
          ${kpiCardRem('🏢','Custo Total com Pessoal', money(s.custo), `folha + benefícios + provisões`, null)}
          ${kpiCardRem('📊','Salário Médio', s.mediaGeral?money(s.mediaGeral):'R$ 0,00', `${s.clt} CLT · ${s.pj} PJ`, null)}
          ${kpiCardRem('🏆','Maior Salário', s.maiorSalario?money(s.maiorSalario):'—', 'na base ativa', null)}
          ${kpiCardRem('📉','Menor Salário', s.menorSalario?money(s.menorSalario):'—', 'na base ativa', null)}
          ${kpiCardRem('🎁','Custo dos Benefícios', money(s.benef), 'saúde, odonto, VA e sindicato', null)}
          ${kpiCardRem('🔄','Reajustes no Mês', String(reajustesMes), 'alterações salariais registradas', null)}
          ${kpiCardRem('👥','Colaboradores Ativos', String(s.ativos), 'base real de colaboradores', null)}
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

        <div class="rem-card" style="margin-bottom:18px">
          <div class="rem-card-head"><div><h2>📋 Comparativo Detalhado da Folha</h2><p>Competência ${esc(custosExtra.competenciaAtual)} vs. ${custosExtra.competenciaAnterior ? esc(custosExtra.competenciaAnterior) : 'sem competência anterior registrada'}.</p></div></div>
          <div class="rem-card-body">
            ${(()=>{
              const encargosAtual = s.clt ? s.mediaClt*s.clt*TAXA_ENCARGOS_CLT : 0;
              const linhas = [
                {label:'Folha Salarial', atual:s.folha, anterior: custosExtra.competenciaAnterior ? (serie.length>=2?serie[serie.length-2]:null) : null},
                {label:'Benefícios', atual:s.benef, anterior:null},
                {label:'Encargos (estimado)', atual:encargosAtual, anterior:null},
                {label:'Horas Extras', atual:custosExtra.atual.horasExtras, anterior:custosExtra.anterior.horasExtras},
                {label:'Bônus', atual:custosExtra.atual.bonus, anterior:custosExtra.anterior.bonus},
                {label:'Comissões', atual:custosExtra.atual.comissoes, anterior:custosExtra.anterior.comissoes},
                {label:'Outros Custos', atual:custosExtra.atual.outros, anterior:custosExtra.anterior.outros}
              ];
              const totalAtual = linhas.reduce((s2,l)=>s2+(l.atual||0),0);
              const totalAnterior = linhas.every(l=>l.anterior!=null) ? linhas.reduce((s2,l)=>s2+(l.anterior||0),0) : null;
              const linhaHTML = l => {
                const temAnterior = l.anterior!=null;
                const variacao = temAnterior ? l.atual-l.anterior : null;
                const perc = temAnterior && l.anterior ? (variacao/l.anterior*100) : null;
                return `<tr><td>${esc(l.label)}</td><td>${money(l.atual||0)}</td><td>${temAnterior?money(l.anterior):'—'}</td><td>${temAnterior?(variacao>=0?'+':'')+money(variacao):'—'}</td><td>${perc!=null?(perc>=0?'+':'')+perc.toFixed(1)+'%':'—'}</td></tr>`;
              };
              return `<table class="rem-table">
                <thead><tr><th>Indicador</th><th>Competência Atual</th><th>Competência Anterior</th><th>Variação</th><th>%</th></tr></thead>
                <tbody>${linhas.map(linhaHTML).join('')}
                <tr style="font-weight:900"><td>Custo Total com Pessoal</td><td>${money(totalAtual)}</td><td>${totalAnterior!=null?money(totalAnterior):'—'}</td><td>${totalAnterior!=null?money(totalAtual-totalAnterior):'—'}</td><td>${totalAnterior?((totalAtual-totalAnterior)/totalAnterior*100).toFixed(1)+'%':'—'}</td></tr>
                </tbody></table>
              <div class="rem-sim-grid" style="margin-top:16px;grid-template-columns:repeat(4,1fr)">
                <div class="field"><label>Horas Extras (mês)</label><input id="rem-extra-horas" type="number" min="0" step="0.01" value="${custosExtra.atual.horasExtras||''}" placeholder="0,00"></div>
                <div class="field"><label>Bônus (mês)</label><input id="rem-extra-bonus" type="number" min="0" step="0.01" value="${custosExtra.atual.bonus||''}" placeholder="0,00"></div>
                <div class="field"><label>Comissões (mês)</label><input id="rem-extra-comissoes" type="number" min="0" step="0.01" value="${custosExtra.atual.comissoes||''}" placeholder="0,00"></div>
                <div class="field"><label>Outros Custos (mês)</label><input id="rem-extra-outros" type="number" min="0" step="0.01" value="${custosExtra.atual.outros||''}" placeholder="0,00"></div>
              </div>
              <div class="rem-beneficios-actions"><button class="btn btn-p btn-sm" onclick="window.remSalvarCustosExtraV3()">💾 Salvar custos do mês</button></div>`;
            })()}
          </div>
        </div>

        <div class="rem-grid-2">
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📈 Evolução da Folha</h2><p>${serieInfo.real ? 'Baseado no histórico real da folha (últimas competências registradas).' : 'Estimativa visual a partir da folha atual — ainda não há histórico mensal real suficiente.'}</p></div></div>
            <div class="rem-card-body"><div class="rem-chart-lines">
              ${serie.map((v,i)=>`<div class="rem-col"><div class="rem-col-bar" title="${money(v)}" style="height:${Math.max(18,Math.round(v/maxSerie*190))}px"></div><small>${esc(labelsSerie[i]||'')}</small></div>`).join('')}
            </div></div>
          </div>
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📊 Distribuição por Tipo de Contrato</h2><p>CLT, PJ, Estágio, Aprendiz e Terceirizado na base real de colaboradores ativos.</p></div></div>
            <div class="rem-card-body">
              ${(()=>{
                const CORES_TIPO = {CLT:'#0047FF', PJ:'#fbbf24', 'Estágio':'#22c55e', Aprendiz:'#a855f7', Terceirizado:'#f97316'};
                const ativos = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)));
                const grupos = TIPOS_CONTRATO_CONHECIDOS.map(t=>({label:t, valor:ativos.filter(c=>c.tipo===t).length, cor:CORES_TIPO[t]})).filter(g=>g.valor>0);
                return donutSegmentos(grupos.length ? grupos : [{label:'Sem dados',valor:1,cor:'#e2e8f0'}]);
              })()}
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
            <div class="rem-card-head"><div><h2>📊 Distribuição por Faixa Salarial</h2><p>Colaboradores ativos com salário informado.</p></div></div>
            <div class="rem-card-body">
              ${(()=>{
                const ativosComSalario = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)) && c.salario>0);
                const faixas = [
                  {label:'Até R$ 2.000', valor: ativosComSalario.filter(c=>c.salario<=2000).length, cor:'#0047FF'},
                  {label:'R$ 2.001 – 4.000', valor: ativosComSalario.filter(c=>c.salario>2000&&c.salario<=4000).length, cor:'#22c55e'},
                  {label:'R$ 4.001 – 7.000', valor: ativosComSalario.filter(c=>c.salario>4000&&c.salario<=7000).length, cor:'#fbbf24'},
                  {label:'Acima de R$ 7.000', valor: ativosComSalario.filter(c=>c.salario>7000).length, cor:'#f97316'}
                ];
                return donutSegmentos(faixas);
              })()}
            </div>
          </div>
        </div>

        <div class="rem-grid-2">
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📋 Remuneração por Setor</h2><p>Média e total salarial por setor, colaboradores ativos.</p></div></div>
            <div class="rem-card-body">
              <table class="rem-table"><thead><tr><th>Setor</th><th>Colaboradores</th><th>Média Salarial</th><th>Total</th></tr></thead><tbody>
                ${setoresReais.map(st=>{
                  const doSetor = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)) && (c.setor||'Não informado')===st);
                  const total = doSetor.reduce((s,c)=>s+c.salario,0);
                  const media = doSetor.length ? total/doSetor.length : 0;
                  return `<tr><td>${esc(st)}</td><td>${doSetor.length}</td><td>${money(media)}</td><td>${money(total)}</td></tr>`;
                }).join('') || '<tr><td colspan="4" class="rem-table-empty">Sem colaboradores cadastrados.</td></tr>'}
              </tbody></table>
            </div>
          </div>
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>🧮 Simulador de Reajuste</h2><p>Simule o impacto de um reajuste salarial por setor.</p></div></div>
            <div class="rem-card-body">
              <div class="rem-sim-grid">
                <div class="field"><label>Percentual de reajuste</label><input id="rem-sim-pct" type="number" min="0" step="0.1" placeholder="Ex: 8" value="8"></div>
                <div class="field"><label>Setor</label><select id="rem-sim-setor">
                  <option value="">Todos os setores</option>
                  ${setoresReais.map(st=>`<option value="${esc(st)}">${esc(st)}</option>`).join('')}
                </select></div>
              </div>
              <div class="rem-beneficios-actions"><button class="btn btn-p btn-sm" onclick="window.remSimularReajusteV3()">▶️ Executar simulação</button></div>
              <div id="rem-simulador-resultado" style="margin-top:14px"></div>
            </div>
          </div>
        </div>

        <div class="rem-grid-2">
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📈 Histórico Salarial do Colaborador</h2><p>Alterações salariais registradas por colaborador.</p></div></div>
            <div class="rem-card-body">
              <select id="rem-hist-colab" onchange="window.remHistoricoColabV3(this.value)" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #dbe3ef;margin-bottom:14px">
                <option value="">Selecione um colaborador…</option>
                ${colaboradoresRem.slice().sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`<option value="${esc(c.nome)}">${esc(c.nome)}</option>`).join('')}
              </select>
              <div id="rem-historico-resultado"><div class="empty">Selecione um colaborador para ver o histórico.</div></div>
            </div>
          </div>
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>🏗️ Estrutura Salarial do Cargo</h2><p>Faixa real observada por cargo (mínimo, médio, máximo).</p></div></div>
            <div class="rem-card-body">
              <select id="rem-estrutura-cargo" onchange="window.remEstruturaCargoV3(this.value)" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #dbe3ef;margin-bottom:14px">
                <option value="">Selecione um cargo…</option>
                ${[...new Set(colaboradoresRem.map(c=>c.cargo).filter(Boolean))].sort().map(cg=>`<option value="${esc(cg)}">${esc(cg)}</option>`).join('')}
              </select>
              <div id="rem-estrutura-resultado"><div class="empty">Selecione um cargo para ver a faixa salarial.</div></div>
            </div>
          </div>
        </div>
      </div>`;
    window.__remPremiumRenderedV3 = true;
  }

  // ── Simulador de reajuste ──
  // Taxa de encargos (68%) reaproveitada de custosHTML() neste mesmo
  // arquivo — é a mesma suposição já usada no restante do painel para
  // estimar o custo de encargos sobre folha CLT.
  const TAXA_ENCARGOS_CLT = 0.68;
  window.remSimularReajusteV3 = function(){
    const pct = parseFloat(document.getElementById('rem-sim-pct')?.value) || 0;
    const setorSel = document.getElementById('rem-sim-setor')?.value || '';
    const alvo = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)) && (!setorSel || c.setor===setorSel));
    const folhaClt = alvo.filter(c=>c.tipo==='CLT').reduce((s,c)=>s+c.salario,0);
    const folhaPj = alvo.filter(c=>c.tipo==='PJ').reduce((s,c)=>s+c.salario,0);
    const aumentoMensalClt = folhaClt * pct/100;
    const aumentoMensalPj = folhaPj * pct/100;
    const aumentoMensal = aumentoMensalClt + aumentoMensalPj;
    const impactoAnual = aumentoMensal * 12;
    const impactoComEncargos = (aumentoMensalClt*12*(1+TAXA_ENCARGOS_CLT)) + (aumentoMensalPj*12);
    const el = document.getElementById('rem-simulador-resultado'); if(!el) return;
    if(!alvo.length){ el.innerHTML = '<div class="empty">Nenhum colaborador ativo nesse setor.</div>'; return; }
    el.innerHTML = `<div class="rem-compare-kpis" style="grid-template-columns:1fr 1fr 1fr">
      <div class="rem-compare-kpi"><small>Aumento da folha</small><strong>${money(aumentoMensal)}</strong><span>mensal</span></div>
      <div class="rem-compare-kpi"><small>Impacto anual</small><strong>${money(impactoAnual)}</strong><span>sem encargos</span></div>
      <div class="rem-compare-kpi"><small>Impacto com encargos</small><strong>${money(impactoComEncargos)}</strong><span>CLT +${Math.round(TAXA_ENCARGOS_CLT*100)}%, PJ sem encargo</span></div>
    </div>`;
  };

  // ── Histórico salarial do colaborador ──
  window.remHistoricoColabV3 = async function(nome){
    const el = document.getElementById('rem-historico-resultado'); if(!el) return;
    if(!nome){ el.innerHTML = '<div class="empty">Selecione um colaborador para ver o histórico.</div>'; return; }
    el.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando…</div>';
    const c = colaboradoresRem.find(x=>x.nome===nome);
    try{
      const mov = typeof window.grhGetMov === 'function' ? await window.grhGetMov() : [];
      const nomeNorm = norm(nome);
      const alteracoes = (Array.isArray(mov)?mov:[])
        .filter(m=>norm(m.nome)===nomeNorm && m.tipo==='Alteração Salarial')
        .sort((a,b)=>String(a.data||a.criadoEm||'').localeCompare(String(b.data||b.criadoEm||'')));
      let linhas = alteracoes.map(m=>`<tr>
        <td>${esc(m.data||'—')}</td>
        <td>${m.salarioNovo!=null ? money(m.salarioNovo) : '—'}</td>
        <td>${esc(m.observacao||'—')}</td>
        <td>${esc(m.alteradoPor||'—')}</td>
      </tr>`).join('');
      if(!linhas && c){
        // Sem histórico de alterações registrado: mostra a admissão com o
        // salário atual como único ponto conhecido (dado real disponível,
        // não é um valor inventado — só não há histórico de mudanças).
        linhas = `<tr><td>${esc(c.adm||'—')}</td><td>${c.salario?money(c.salario):'—'}</td><td>Admissão — salário inicial</td><td>—</td></tr>`;
      }
      el.innerHTML = `<table class="rem-table"><thead><tr><th>Data</th><th>Salário</th><th>Motivo</th><th>Responsável</th></tr></thead><tbody>${linhas || '<tr><td colspan="4" class="rem-table-empty">Sem registros.</td></tr>'}</tbody></table>`;
    }catch(e){
      el.innerHTML = '<div class="empty">Erro ao carregar histórico: '+esc(e.message||e)+'</div>';
    }
  };

  // ── Estrutura salarial do cargo (derivada dos salários reais, não inventada) ──
  const ORDEM_NIVEIS = ['Júnior','Pleno','Sênior','Especialista','Coordenação','Gerência','Diretoria'];
  function faixaDe(lista){
    const salarios = lista.map(c=>c.salario).sort((a,b)=>a-b);
    const min = salarios[0], max = salarios[salarios.length-1];
    const mid = salarios.length % 2 ? salarios[(salarios.length-1)/2] : (salarios[salarios.length/2-1]+salarios[salarios.length/2])/2;
    return {min,mid,max,n:salarios.length};
  }
  // Faixa dinâmica derivada dos salários REAIS por cargo + nível — não são
  // valores fixos digitados em algum lugar, então se ajustam sozinhos
  // conforme o cadastro de colaboradores muda (estrutura flexível, sem
  // números fixos em código, como pedido). Usa o campo `nivel`
  // (#grh-c-nivel, Júnior…Diretoria) quando presente para segmentar por
  // nível; sem `nivel` cadastrado, mostra a faixa geral do cargo.
  window.remEstruturaCargoV3 = function(cargo){
    const el = document.getElementById('rem-estrutura-resultado'); if(!el) return;
    if(!cargo){ el.innerHTML = '<div class="empty">Selecione um cargo para ver a faixa salarial.</div>'; return; }
    const grupo = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)) && c.cargo===cargo && c.salario>0);
    if(grupo.length < 2){
      el.innerHTML = `<div class="empty">Dados insuficientes para esse cargo (${grupo.length} pessoa${grupo.length===1?'':'s'})${grupo.length?': '+money(grupo[0].salario):''}.</div>`;
      return;
    }
    const comNivel = grupo.filter(c=>c.nivel && ORDEM_NIVEIS.indexOf(c.nivel)!==-1);
    if(comNivel.length >= 2){
      const niveisPresentes = ORDEM_NIVEIS.filter(n=>comNivel.some(c=>c.nivel===n));
      const linhas = niveisPresentes.map(n=>{
        const doNivel = comNivel.filter(c=>c.nivel===n);
        const f = faixaDe(doNivel);
        return `<tr><td>${esc(n)}</td><td>${money(f.min)}</td><td>${money(f.mid)}</td><td>${money(f.max)}</td><td>${f.n}</td></tr>`;
      }).join('');
      el.innerHTML = `<table class="rem-table"><thead><tr><th>Nível</th><th>Mínimo</th><th>Midpoint</th><th>Máximo</th><th>Pessoas</th></tr></thead><tbody>${linhas}</tbody></table>
        <p style="font-size:11px;color:#64748b;margin-top:10px">Faixas calculadas a partir dos salários reais de ${comNivel.length} colaboradores com nível cadastrado neste cargo (${grupo.length-comNivel.length} sem nível informado não entram nesse cálculo).</p>`;
      return;
    }
    const f = faixaDe(grupo);
    el.innerHTML = `<div class="rem-compare-kpis" style="grid-template-columns:1fr 1fr 1fr">
      <div class="rem-compare-kpi"><small>Mínimo</small><strong>${money(f.min)}</strong><span>observado</span></div>
      <div class="rem-compare-kpi"><small>Médio</small><strong>${money(f.mid)}</strong><span>observado</span></div>
      <div class="rem-compare-kpi"><small>Máximo</small><strong>${money(f.max)}</strong><span>observado</span></div>
    </div><p style="font-size:11px;color:#64748b;margin-top:10px">Baseado em ${grupo.length} colaboradores ativos com esse cargo (nenhum tem "Nível/Senioridade" cadastrado — cadastre em Colaboradores para segmentar por Júnior/Pleno/Sênior).</p>`;
  };

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
      if(!colaboradoresRem || colaboradoresRem.length === 0) {
        console.warn('[remuneracao] Nenhum dado carregado. Verifique Firebase permissions.');
        notify('⚠️ Sem dados de remuneração. Verifique sua conexão.');
        return;
      }
      const serieInfo = await folhaSerieRealOuEstimada();
      const reajustesMes = await reajustesDoMesAtual();
      const custosExtra = await carregarCustosExtra();
      render(serieInfo, reajustesMes, custosExtra);
    }
  }

  let debounceTimer = null;
  const oldGrhTab=window.grhTab;
  window.grhTab=function(tab,btn){
    const ret=typeof oldGrhTab==='function'?oldGrhTab.apply(this,arguments):undefined;
    if(String(tab||'').toLowerCase().includes('remun')){
      window.__remPremiumRenderedV3=false;
      if(debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(aplicar, 200);
    }
    return ret;
  };
  document.addEventListener('click',function(ev){
    const el=ev.target&&ev.target.closest&&ev.target.closest('button,a,div'); if(!el)return;
    const txt=(el.innerText||'').toLowerCase(); const attrs=((el.getAttribute('onclick')||'')+' '+(el.getAttribute('data-rh-tab')||'')+' '+(el.getAttribute('data-target')||'')).toLowerCase();
    if(txt.includes('remuneração')||txt.includes('remuneracao')||attrs.includes('remun')){
      window.__remPremiumRenderedV3=false;
      if(debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(aplicar, 200);
    }
  },true);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(aplicar,900)); else setTimeout(aplicar,900);
})();
