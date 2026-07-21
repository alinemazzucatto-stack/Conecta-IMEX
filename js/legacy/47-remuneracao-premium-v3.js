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
  // `totalGeral` (opcional) mostra o número total no centro do donut, no
  // estilo da referência ("50 Total") em vez de uma % de um item só.
  function donutSegmentos(items, totalGeral){
    const total = items.reduce((s,i)=>s+i.valor,0);
    let acc = 0;
    const stops = items.map(i=>{
      const de = total ? (acc/total*100) : 0;
      acc += i.valor;
      const ate = total ? (acc/total*100) : 0;
      return `${i.cor} ${de}% ${ate}%`;
    }).join(', ');
    const centroNum = totalGeral!=null ? totalGeral : total;
    const centroLbl = totalGeral!=null ? 'Total' : '';
    const legenda = items.map(i=>{
      const pct = total ? Math.round(i.valor/total*100) : 0;
      return `<div class="rem-leg"><span><i class="rem-dot" style="background:${i.cor}"></i>${esc(i.label)}</span><strong>${i.valor} <em>(${pct}%)</em></strong></div>`;
    }).join('');
    return `<div class="rem-donut-wrap"><div class="rem-donut" style="background:conic-gradient(${stops || '#e2e8f0 0 100%'})"><div class="rem-donut-label"><b>${centroNum}</b>${centroLbl?`<small>${centroLbl}</small>`:''}</div></div>
      <div class="rem-legend">${legenda}</div></div>`;
  }

  // Gráfico de linha/área em SVG puro (sem lib nova) para "Evolução da
  // Folha", no estilo da referência: linha + preenchimento em degradê +
  // marcadores + selo com o valor do último ponto.
  // `compacto` reduz altura, número de rótulos e tamanho de fonte pra caber
  // numa coluna estreita (usado quando este card divide linha com os
  // donuts, em vez de ficar sozinho ocupando a largura toda).
  function lineChartRem(labels, serie, cor, compacto){
    cor = cor || '#7c3aed';
    const W = compacto ? 380 : 640, H = compacto ? 160 : 220;
    const padL = compacto ? 8 : 44, padR = compacto ? 8 : 20, padT = compacto ? 34 : 30, padB = compacto ? 22 : 28;
    const max = Math.max.apply(null, serie.concat([1]));
    const min = Math.min.apply(null, serie.concat([0]));
    const faixa = (max - min) || 1;
    const n = serie.length;
    const x = i => padL + (n>1 ? i/(n-1) : 0) * (W-padL-padR);
    const y = v => padT + (1 - (v-min)/faixa) * (H-padT-padB);
    const pontos = serie.map((v,i)=>[x(i), y(v)]);
    const linha = pontos.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
    const area = linha + ` L${pontos[pontos.length-1][0].toFixed(1)},${(H-padB).toFixed(1)} L${pontos[0][0].toFixed(1)},${(H-padB).toFixed(1)} Z`;
    const gid = 'remLineGrad'+Math.random().toString(36).slice(2,8);
    const grade = compacto ? '' : [0,0.25,0.5,0.75,1].map(f=>{
      const v = min + faixa*f;
      return `<text x="4" y="${(y(v)+4).toFixed(1)}" font-size="10" fill="#94a3b8">${money(v).replace(',00','').replace('R$ ','R$ ')}</text><line x1="${padL}" y1="${y(v).toFixed(1)}" x2="${W-padR}" y2="${y(v).toFixed(1)}" stroke="#eef2ff" stroke-width="1"/>`;
    }).join('');
    const marcadores = pontos.map((p,i)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${compacto?2.5:(i===n-1?5:4)}" fill="#fff" stroke="${cor}" stroke-width="2"/>`).join('');
    const indicesVisiveis = compacto ? new Set([0, Math.floor((n-1)/2), n-1]) : null;
    const labelsX = labels.map((l,i)=>{
      if(compacto && !indicesVisiveis.has(i)) return '';
      return `<text x="${x(i).toFixed(1)}" y="${H-6}" font-size="${compacto?9:10}" fill="#64748b" text-anchor="middle">${esc(l)}</text>`;
    }).join('');
    const ultimo = pontos[pontos.length-1];
    const seloLargura = compacto ? 74 : 92;
    const seloX = ultimo ? Math.min(Math.max(ultimo[0]-seloLargura/2, 2), W-seloLargura-2) : 0;
    const selo = ultimo ? `<g transform="translate(${seloX.toFixed(1)},4)"><rect width="${seloLargura}" height="${compacto?20:24}" rx="10" fill="${cor}"/><text x="${seloLargura/2}" y="${compacto?14:16}" font-size="${compacto?10:11}" font-weight="700" fill="#fff" text-anchor="middle">${money(serie[serie.length-1]).replace(',00','')}</text></g>` : '';
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${cor}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${cor}" stop-opacity="0.02"/>
      </linearGradient></defs>
      ${grade}
      <path d="${area}" fill="url(#${gid})"/>
      <path d="${linha}" fill="none" stroke="${cor}" stroke-width="${compacto?2:2.5}" stroke-linecap="round" stroke-linejoin="round"/>
      ${marcadores}
      ${labelsX}
      ${selo}
    </svg>`;
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
    const benefColab = ativos.reduce((s,c)=>s+c.benef,0);
    const provisoes = ativos.reduce((s,c)=>s+(c.provisoes||0),0);
    const comHolerite = ativos.filter(c=>c.temHolerite).length;
    const comSalario = ativos.filter(c=>c.salario>0);
    const salarios = comSalario.map(c=>c.salario);

    // Somar também benefícios totais importados dos PDFs
    var benefTotal = benefColab;
    var ids = ['va','saude','odonto','colabmais','sindicato'];
    ids.forEach(function(id){
      var el = document.getElementById('rem-beneficio-'+id);
      benefTotal += Number((el&&el.value)||0);
    });

    return {
      folha:total,
      mediaClt:clts.length ? clts.reduce((s,c)=>s+c.salario,0)/clts.length : 0,
      mediaPj:pjs.length ? pjs.reduce((s,c)=>s+c.salario,0)/pjs.length : 0,
      mediaGeral: comSalario.length ? total/comSalario.length : 0,
      maiorSalario: salarios.length ? Math.max.apply(null, salarios) : 0,
      menorSalario: salarios.length ? Math.min.apply(null, salarios) : 0,
      custo:total+benefTotal+provisoes,
      benef:benefTotal,
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
  // 6 categorias (antes eram 4: Horas Extras/Bônus/Comissões/Outros) — a
  // pedido, agora são Horas Extras/Plus Mensal/Plus de Férias/Comissões/
  // Plantões/Servidores. Docs antigos (campos bonus/outros) continuam
  // sendo lidos sem erro, só não aparecem mais nos formulários novos.
  const CAMPOS_CUSTO_EXTRA = ['horasExtras','plusMensal','plusFerias','comissoes','plantoes','servidores'];
  function custoExtraVazio(){ return {horasExtras:0,plusMensal:0,plusFerias:0,comissoes:0,plantoes:0,servidores:0}; }
  async function carregarCustosExtra(){
    const atual = competenciaAtualStr();
    const anterior = competenciaAnteriorStr(atual);
    const vazio = custoExtraVazio();
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
    const dados = { horasExtras:g('rem-extra-horas'), plusMensal:g('rem-extra-plusmensal'), plusFerias:g('rem-extra-plusferias'), comissoes:g('rem-extra-comissoes'), plantoes:g('rem-extra-plantoes'), servidores:g('rem-extra-servidores'), atualizadoEm:new Date().toISOString() };
    try{
      await db.collection(col('grh_custos_extra')).doc(competenciaAtualStr()).set(dados, {merge:true});
      notify('💾 Custos extras salvos para ' + competenciaAtualStr() + '.');
      window.__remPremiumRenderedV3 = false;
      await aplicar();
    }catch(e){ notify('❌ Erro ao salvar: ' + (e.message||e)); }
  };

  // ── Motor de Alertas Inteligentes ──
  // 100% determinístico (sem IA) — cada alerta é calculado a partir de
  // dados já carregados (colaboradoresRem, grh_mov) ou da faixa salarial
  // derivada em faixaDe()/ORDEM_NIVEIS. Nenhuma regra usa número mágico
  // sem explicação: os limiares (12 meses, 60 dias, etc.) ficam nomeados
  // em constantes no topo da função para fácil ajuste futuro.
  const MESES_SEM_REAJUSTE_ALERTA = 12;
  const DIAS_DISSIDIO_PROXIMO_ALERTA = 60;
  async function calcularAlertasInteligentes(){
    const alertas = [];
    const ativos = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)) && c.salario>0);
    let mov = [];
    try{ mov = typeof window.grhGetMov==='function' ? await window.grhGetMov() : []; }catch(e){}
    const alteracoesSalariais = (Array.isArray(mov)?mov:[]).filter(m=>m.tipo==='Alteração Salarial');

    // 1) Sem reajuste há 12+ meses (ou nunca teve reajuste desde a admissão)
    const hoje = new Date();
    let semReajuste = 0;
    ativos.forEach(c=>{
      const doColab = alteracoesSalariais.filter(m=>norm(m.nome)===norm(c.nome)).sort((a,b)=>String(a.data||'').localeCompare(String(b.data||''))).pop();
      const dataBase = doColab ? doColab.data : c.adm;
      if(!dataBase || dataBase==='--') return;
      const d = new Date(dataBase);
      if(isNaN(d.getTime())) return;
      const meses = (hoje.getFullYear()-d.getFullYear())*12 + (hoje.getMonth()-d.getMonth());
      if(meses >= MESES_SEM_REAJUSTE_ALERTA) semReajuste++;
    });
    if(semReajuste>0) alertas.push({icone:'⚠️', tipo:'warn', texto:`${semReajuste} colaborador${semReajuste>1?'es':''} sem reajuste há ${MESES_SEM_REAJUSTE_ALERTA}+ meses`});

    // 2) Fora da faixa do cargo (usa a mesma faixa real derivada da Estrutura Salarial)
    const porCargo = {};
    ativos.forEach(c=>{ (porCargo[c.cargo]=porCargo[c.cargo]||[]).push(c); });
    // "Fora da faixa" = 20%+ acima/abaixo do midpoint real do cargo
    // (min/max da própria amostra nunca ficariam "fora" por definição, por
    // isso o critério usa o midpoint, não os extremos observados).
    let acimaFaixa=0, abaixoFaixa=0;
    Object.keys(porCargo).forEach(cg=>{
      const grupo = porCargo[cg];
      if(grupo.length<3) return; // faixa pouco confiável com menos de 3 pessoas
      const f = faixaDe(grupo);
      grupo.forEach(c=>{
        if(c.salario > f.mid*1.2) acimaFaixa++;
        else if(c.salario < f.mid*0.8) abaixoFaixa++;
      });
    });
    if(acimaFaixa>0) alertas.push({icone:'📈', tipo:'info', texto:`${acimaFaixa} salário${acimaFaixa>1?'s':''} 20%+ acima do midpoint do próprio cargo`});
    if(abaixoFaixa>0) alertas.push({icone:'📉', tipo:'warn', texto:`${abaixoFaixa} salário${abaixoFaixa>1?'s':''} 20%+ abaixo do midpoint do próprio cargo (possível piso)`});

    // 3) Distorção salarial no mesmo cargo (maior salário mais que o dobro do menor, com 3+ pessoas)
    let cargosComDistorcao = 0;
    Object.keys(porCargo).forEach(cg=>{
      const grupo = porCargo[cg];
      if(grupo.length<3) return;
      const f = faixaDe(grupo);
      if(f.min>0 && f.max/f.min >= 2) cargosComDistorcao++;
    });
    if(cargosComDistorcao>0) alertas.push({icone:'🔀', tipo:'warn', texto:`${cargosComDistorcao} cargo${cargosComDistorcao>1?'s têm':' tem'} distorção salarial (maior salário 2x+ o menor entre pessoas do mesmo cargo)`});

    // 4) Dissídio previsto próximo (config manual do RH, col('grh_config_remuneracao'))
    let dissidio = null;
    try{
      const doc = await db.collection(col('grh_config_remuneracao')).doc('geral').get();
      if(doc.exists) dissidio = doc.data();
    }catch(e){}
    if(dissidio && dissidio.dataDissidio){
      const d = new Date(dissidio.dataDissidio);
      if(!isNaN(d.getTime())){
        const dias = Math.round((d-hoje)/86400000);
        if(dias>=0 && dias<=DIAS_DISSIDIO_PROXIMO_ALERTA) alertas.push({icone:'📅', tipo:'info', texto:`Dissídio previsto em ${dias} dia${dias===1?'':'s'} (${d.toLocaleDateString('pt-BR')})`});
      }
    }

    return { alertas, dissidio };
  }
  // ── Insights Conecta AI (híbrido) ──
  // Parte 1 (sempre): insights determinísticos, reaproveitando os mesmos
  // dados dos Alertas Inteligentes + tendência da folha — sem custo, sem
  // depender de rede.
  // Parte 2 (quando disponível): 1 chamada real à IA via chamarAnthropicProxy
  // (a MESMA função já usada pelo Conecta AI em js/modules/conecta-ai.js,
  // que fala com o proxy em /api/ai) pedindo uma leitura preditiva/
  // narrativa. Se o proxy falhar ou não existir, cai para um texto local
  // (mesmo padrão de fallback do conecta-ai.js), nunca deixando a seção
  // vazia nem travada em "carregando".
  function insightsDeterministicos(s, alertas, trendFolha){
    const lista = [];
    if(trendFolha) lista.push(`💰 A folha ${trendFolha.pct>=0?'cresceu':'caiu'} ${Math.abs(trendFolha.pct).toFixed(1)}% em relação à competência anterior.`);
    alertas.forEach(a=>lista.push(`${a.icone} ${a.texto}.`));
    if(s.pj>0 && s.ativos>0){
      const pctPj = Math.round(s.pj/s.ativos*100);
      if(pctPj>=40) lista.push(`🤝 ${pctPj}% da base ativa é PJ — proporção alta, vale revisar enquadramento.`);
    }
    if(!lista.length) lista.push('✅ Sem pontos de atenção automáticos neste momento.');
    return lista;
  }
  window.remGerarInsightsIAV3 = async function(){
    const el = document.getElementById('rem-ia-insights'); if(!el) return;
    const s = stats();
    const alertasInfo = await calcularAlertasInteligentes();
    const serieInfo = await folhaSerieRealOuEstimada();
    const trendFolha = serieInfo.real && serieInfo.serie.length>=2 ? { pct: ((s.folha-serieInfo.serie[serieInfo.serie.length-2])/(serieInfo.serie[serieInfo.serie.length-2]||1))*100 } : null;
    const det = insightsDeterministicos(s, alertasInfo.alertas, trendFolha);
    const detHTML = '<ul class="rem-ia-lista">' + det.map(t=>`<li>${esc(t)}</li>`).join('') + '</ul>';

    if(typeof chamarAnthropicProxy !== 'function'){
      el.innerHTML = detHTML + '<p class="rem-ia-fallback">Leitura preditiva por IA indisponível (proxy não configurado neste ambiente) — mostrando apenas insights por regras.</p>';
      return;
    }
    el.innerHTML = detHTML + '<div class="rem-ia-loading">🧠 Gerando leitura preditiva da IA…</div>';
    const resumo = `Folha atual: ${money(s.folha)}. Custo total com pessoal: ${money(s.custo)}. ${s.ativos} colaboradores ativos (${s.clt} CLT, ${s.pj} PJ). Salário médio: ${money(s.mediaGeral)}. Alertas automáticos: ${alertasInfo.alertas.map(a=>a.texto).join('; ') || 'nenhum'}.`;
    try{
      const resp = await chamarAnthropicProxy({
        model:'claude-sonnet-4-20250514', max_tokens:280,
        system:'Você é o Conecta AI, analista de remuneração/RH da IMEX. A partir dos números fornecidos, escreva no máximo 3 frases curtas com uma leitura preditiva ou recomendação prática (ex: previsão de crescimento da folha, risco de distorção salarial, sugestão de ação). Direto, sem saudação, em português.',
        messages:[{role:'user', content:resumo}]
      });
      const txt = (resp.content||[]).map(c=>c.text||'').join('').trim();
      el.innerHTML = detHTML + (txt ? `<div class="rem-ia-predicao">🔮 ${esc(txt).replace(/\n/g,'<br>')}</div>` : '');
    }catch(e){
      el.innerHTML = detHTML + '<p class="rem-ia-fallback">Leitura preditiva por IA indisponível no momento — mostrando apenas insights por regras.</p>';
    }
  };

  // ── Budget Salarial ──
  // Recurso configurável pelo RH: orçamento anual aprovado (por empresa
  // toda, ou opcionalmente detalhado por setor/centro de custo). Guardado
  // em col('grh_budget'), 1 documento por ano. "Utilizado" é a folha atual
  // anualizada (custo mensal × 12) — uma estimativa clara, não uma soma
  // real de 12 meses fechados (o sistema não tem 12 meses de histórico
  // ainda), com essa ressalva explícita na tela.
  function anoAtualStr(){ return String(new Date().getFullYear()); }
  async function carregarBudget(){
    try{
      const doc = await db.collection(col('grh_budget')).doc(anoAtualStr()).get();
      return doc.exists ? doc.data() : { aprovado:0, porSetor:{} };
    }catch(e){ return { aprovado:0, porSetor:{} }; }
  }
  window.remSalvarBudgetV3 = async function(){
    const aprovado = parseFloat(document.getElementById('rem-budget-aprovado')?.value) || 0;
    try{
      await db.collection(col('grh_budget')).doc(anoAtualStr()).set({aprovado, atualizadoEm:new Date().toISOString()}, {merge:true});
      notify('💾 Budget salarial salvo para ' + anoAtualStr() + '.');
      window.__remPremiumRenderedV3 = false;
      await aplicar();
    }catch(e){ notify('❌ Erro ao salvar: '+(e.message||e)); }
  };

  window.remSalvarDissidioV3 = async function(){
    const data = document.getElementById('rem-dissidio-data')?.value;
    if(!data){ notify('Informe uma data.'); return; }
    try{
      await db.collection(col('grh_config_remuneracao')).doc('geral').set({dataDissidio:data}, {merge:true});
      notify('💾 Data de dissídio salva.');
      window.__remPremiumRenderedV3 = false;
      await aplicar();
    }catch(e){ notify('❌ Erro ao salvar: '+(e.message||e)); }
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
  // `cor` é um hex; `destaque` deixa o 1º card (Folha Salarial) sólido —
  // resto usa fundo branco + quadrado de ícone colorido, como na referência.
  function kpiCardRem(icon, label, valor, sub, trend, cor, destaque){
    cor = cor || '#3b82f6';
    const seta = trend ? (trend.pct>=0?(trend.favoravel===false?'▼':'▲'):(trend.favoravel===false?'▲':'▼')) : '';
    const trendCls = trend ? (trend.pct>=0?(trend.favoravel===false?'down':'up'):(trend.favoravel===false?'up':'down')) : '';
    const trendHTML = trend ? `<div class="rem-kpi2-trend ${trendCls}">${seta} ${Math.abs(trend.pct).toFixed(1)}%</div>` : '';
    if(destaque){
      return `<div class="rem-kpi2 rem-kpi2-solida" style="background:linear-gradient(135deg, ${cor}, #4c1d95)">
        <div class="rem-kpi2-icon-solida">${icon}</div>
        <div class="rem-kpi2-label-solida">${esc(label)}</div>
        <div class="rem-kpi2-valor-solida">${valor}</div>
        <div class="rem-kpi2-sub-solida">${trendHTML || esc(sub)}</div>
      </div>`;
    }
    return `<div class="rem-kpi2">
      <div class="rem-kpi2-icon" style="background:${cor}1f;color:${cor}">${icon}</div>
      <div class="rem-kpi2-corpo">
        <div class="rem-kpi2-label">${esc(label)}</div>
        <div class="rem-kpi2-valor">${valor}</div>
        ${trendHTML || (sub?`<div class="rem-kpi2-sub">${esc(sub)}</div>`:'')}
      </div>
    </div>`;
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

  function render(serieInfo, reajustesMes, custosExtra, alertasInfo, budget){
    const p=pane(); if(!p) return;
    const s=stats();
    serieInfo = serieInfo || { real:false, labels:meses, serie:folhaSerie() };
    reajustesMes = reajustesMes || 0;
    custosExtra = custosExtra || { atual:custoExtraVazio(), anterior:custoExtraVazio(), competenciaAtual:competenciaAtualStr(), competenciaAnterior:'' };
    alertasInfo = alertasInfo || { alertas:[], dissidio:null };
    budget = budget || { aprovado:0 };
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
        <div class="rem-toolbar-legacy">
          <input id="grh-rem-search" type="text" placeholder="🔍 Buscar colaborador…" oninput="if(typeof grhRenderRemuneracao==='function')grhRenderRemuneracao()"/>
          <input id="grh-rem-mes" type="month" title="Filtrar total da folha por mês"/>
          <button class="btn btn-g btn-sm" onclick="if(typeof grhRenderRemuneracao==='function')grhRenderRemuneracao()">🔎 Filtrar mês</button>
          <button class="btn btn-g btn-sm" onclick="document.getElementById('grh-rem-mes').value='';if(typeof grhRenderRemuneracao==='function')grhRenderRemuneracao()">Limpar</button>
          <button class="btn btn-g btn-sm" onclick="grhBaixarModeloHolerites()">⬇️ Modelo holerites</button>
          <button class="btn btn-g btn-sm" onclick="grhAbrirMapeamentoCpf()">⚙️ Mapeamento CPF</button>
          <button class="btn btn-p btn-sm" onclick="grhAbrirBeneficiosPdf()">🧾 Importar Benefícios (PDF)</button>
          <button class="btn btn-g btn-sm" onclick="grhAbrirHistoricoBeneficios()">📅 Histórico de Benefícios</button>
          <button class="btn btn-p btn-sm" onclick="grhAbrirHolerites()">📤 Upload Automático de Holerites</button>
          <button class="btn btn-p btn-sm" onclick="grhAbrirModalRemuneracao(null)">➕ Adicionar</button>
        </div>
        <div class="rem-kpi-grid rem-kpi-grid2" style="grid-template-columns:repeat(6,minmax(0,1fr))">
          ${kpiCardRem('💰','Folha Salarial (mês)', s.folha?money(s.folha):'R$ 0,00', null, trendFolha, '#7c3aed', true)}
          ${kpiCardRem('🏢','Custo Total com Pessoal', money(s.custo), `folha + benefícios + provisões`, null, '#3b82f6')}
          ${kpiCardRem('📊','Salário Médio', s.mediaGeral?money(s.mediaGeral):'R$ 0,00', `${s.clt} CLT · ${s.pj} PJ`, null, '#10b981')}
          ${kpiCardRem('🏆','Maior Salário', s.maiorSalario?money(s.maiorSalario):'—', `Menor salário: ${s.menorSalario?money(s.menorSalario):'—'}`, null, '#f59e0b')}
          ${kpiCardRem('🎁','Custo com Benefícios', money(s.benef), 'saúde, odonto, VA e sindicato', null, '#ec4899')}
          ${kpiCardRem('👥','Colaboradores', String(s.ativos), 'Ativos', null, '#0ea5e9')}
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

          <div id="rem-comparativo-beneficios-card" class="rem-compare-card">
            <div style="text-align:center;padding:40px;color:var(--ink-60)">⏳ Carregando comparativo de benefícios…</div>
          </div>

          <!-- Campos ocultos para funcionalidade de benefícios -->
          <div style="display:none">
            <input type="hidden" id="rem-beneficios-json-imex" value="{}">
            <input id="rem-beneficio-va" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosRH()">
            <input id="rem-beneficio-saude" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosRH()">
            <input id="rem-beneficio-odonto" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosRH()">
            <input id="rem-beneficio-colabmais" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosRH()">
            <input id="rem-beneficio-sindicato" type="number" min="0" step="0.01" placeholder="0,00" oninput="remCalcCustosBeneficiosRH()">
            <div id="rem-beneficios-total-imex">R$ 0,00</div>
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
                {label:'Plus Mensal', atual:custosExtra.atual.plusMensal, anterior:custosExtra.anterior.plusMensal},
                {label:'Plus de Férias', atual:custosExtra.atual.plusFerias, anterior:custosExtra.anterior.plusFerias},
                {label:'Comissões', atual:custosExtra.atual.comissoes, anterior:custosExtra.anterior.comissoes},
                {label:'Plantões', atual:custosExtra.atual.plantoes, anterior:custosExtra.anterior.plantoes},
                {label:'Servidores', atual:custosExtra.atual.servidores, anterior:custosExtra.anterior.servidores}
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
              <div class="rem-sim-grid" style="margin-top:16px;grid-template-columns:repeat(3,1fr)">
                <div class="field"><label>Horas Extras (mês)</label><input id="rem-extra-horas" type="number" min="0" step="0.01" value="${custosExtra.atual.horasExtras||''}" placeholder="0,00"></div>
                <div class="field"><label>Plus Mensal</label><input id="rem-extra-plusmensal" type="number" min="0" step="0.01" value="${custosExtra.atual.plusMensal||''}" placeholder="0,00"></div>
                <div class="field"><label>Plus de Férias</label><input id="rem-extra-plusferias" type="number" min="0" step="0.01" value="${custosExtra.atual.plusFerias||''}" placeholder="0,00"></div>
                <div class="field"><label>Comissões</label><input id="rem-extra-comissoes" type="number" min="0" step="0.01" value="${custosExtra.atual.comissoes||''}" placeholder="0,00"></div>
                <div class="field"><label>Plantões</label><input id="rem-extra-plantoes" type="number" min="0" step="0.01" value="${custosExtra.atual.plantoes||''}" placeholder="0,00"></div>
                <div class="field"><label>Servidores</label><input id="rem-extra-servidores" type="number" min="0" step="0.01" value="${custosExtra.atual.servidores||''}" placeholder="0,00"></div>
              </div>
              <div class="rem-beneficios-actions"><button class="btn btn-p btn-sm" onclick="window.remSalvarCustosExtraV3()">💾 Salvar custos do mês</button></div>`;
            })()}
          </div>
        </div>

        <div class="rem-grid-3">
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📈 Evolução da Folha</h2><p>${serieInfo.real ? 'Histórico real (últimas competências).' : 'Estimativa a partir da folha atual.'}</p></div></div>
            <div class="rem-card-body">${lineChartRem(labelsSerie, serie, '#7c3aed', true)}</div>
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
                return donutSegmentos(faixas, ativosComSalario.length);
              })()}
            </div>
          </div>
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>📊 Distribuição por Tipo de Contrato</h2><p>CLT, PJ, Estágio, Aprendiz e Terceirizado na base real de colaboradores ativos.</p></div></div>
            <div class="rem-card-body">
              ${(()=>{
                const CORES_TIPO = {CLT:'#0047FF', PJ:'#fbbf24', 'Estágio':'#22c55e', Aprendiz:'#a855f7', Terceirizado:'#f97316'};
                const ativos = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)));
                const grupos = TIPOS_CONTRATO_CONHECIDOS.map(t=>({label:t, valor:ativos.filter(c=>c.tipo===t).length, cor:CORES_TIPO[t]})).filter(g=>g.valor>0);
                return donutSegmentos(grupos.length ? grupos : [{label:'Sem dados',valor:1,cor:'#e2e8f0'}], ativos.length);
              })()}
            </div>
          </div>
        </div>

        <div class="rem-grid-1">
          <div class="rem-card">
            <div class="rem-card-head"><div><h2>🧮 Simulador de Reajuste</h2><p>Simule o impacto de um reajuste por setor, cargo ou colaborador individual. Não salva nada — é só simulação.</p></div></div>
            <div class="rem-card-body">
              <div class="rem-sim-grid" style="grid-template-columns:repeat(4,1fr)">
                <div class="field"><label>Percentual de reajuste</label><input id="rem-sim-pct" type="number" min="0" step="0.1" placeholder="Ex: 8" value="8"></div>
                <div class="field"><label>Setor</label><select id="rem-sim-setor" onchange="document.getElementById('rem-sim-colab').value=''">
                  <option value="">Todos os setores</option>
                  ${setoresReais.map(st=>`<option value="${esc(st)}">${esc(st)}</option>`).join('')}
                </select></div>
                <div class="field"><label>Cargo</label><select id="rem-sim-cargo" onchange="document.getElementById('rem-sim-colab').value=''">
                  <option value="">Todos os cargos</option>
                  ${[...new Set(colaboradoresRem.map(c=>c.cargo).filter(Boolean))].sort().map(cg=>`<option value="${esc(cg)}">${esc(cg)}</option>`).join('')}
                </select></div>
                <div class="field"><label>Colaborador (opcional)</label><select id="rem-sim-colab">
                  <option value="">Todos (usa setor/cargo acima)</option>
                  ${colaboradoresRem.slice().sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`<option value="${esc(c.nome)}">${esc(c.nome)}</option>`).join('')}
                </select></div>
              </div>
              <div class="rem-beneficios-actions"><button class="rem-btn-gradiente" onclick="window.remSimularReajusteV3()">🧮 Executar simulação</button></div>
              <div id="rem-simulador-resultado" style="margin-top:14px"></div>
            </div>
          </div>
        </div>

        <div class="rem-card" style="margin-bottom:18px">
          <div class="rem-card-head"><div><h2>🔔 Alertas Inteligentes</h2><p>Calculados automaticamente a partir da base real — sem IA, 100% regra determinística.</p></div></div>
          <div class="rem-card-body">
            ${alertasInfo.alertas.length ? `<div class="rem-alertas-lista">${alertasInfo.alertas.map(a=>`<div class="rem-alerta rem-alerta-${a.tipo}"><span>${a.icone}</span><span>${esc(a.texto)}</span></div>`).join('')}</div>` : '<div class="empty">✅ Nenhum alerta no momento.</div>'}
            <div class="rem-beneficios-form" style="grid-template-columns:2fr 1fr;margin-top:16px;align-items:end">
              <div class="field"><label>Data prevista do dissídio</label><input id="rem-dissidio-data" type="date" value="${alertasInfo.dissidio&&alertasInfo.dissidio.dataDissidio?esc(alertasInfo.dissidio.dataDissidio):''}"></div>
              <button class="btn btn-g btn-sm" onclick="window.remSalvarDissidioV3()">💾 Salvar</button>
            </div>
          </div>
        </div>

        <div class="rem-card">
          <div class="rem-card-head"><div><h2>🏦 Budget Salarial ${esc(anoAtualStr())}</h2><p>Orçamento anual configurável pelo RH — "utilizado" é a folha atual anualizada (custo mensal × 12), uma estimativa.</p></div></div>
          <div class="rem-card-body">
            ${(()=>{
              const aprovado = budget.aprovado||0;
              const utilizado = s.custo*12;
              const disponivel = aprovado - utilizado;
              const pct = aprovado ? Math.min(100, Math.round(utilizado/aprovado*100)) : 0;
              return `<div class="rem-kpi-grid rem-kpi-grid2" style="grid-template-columns:repeat(4,1fr)">
                ${kpiCardRem('🏦','Budget Aprovado', aprovado?money(aprovado):'não definido', `ano ${esc(anoAtualStr())}`, null, '#7c3aed')}
                ${kpiCardRem('📉','Utilizado (estimado)', money(utilizado), 'custo mensal × 12', null, '#3b82f6')}
                ${kpiCardRem(disponivel>=0?'✅':'⚠️','Disponível', aprovado?money(disponivel):'—', aprovado?'estimado':'defina o budget', null, disponivel>=0?'#10b981':'#ef4444')}
                ${kpiCardRem('📊','% Consumido', aprovado?pct+'%':'—', pct>=100?'acima do budget':'dentro do previsto', null, pct>=100?'#ef4444':pct>=85?'#f59e0b':'#10b981')}
              </div>
              <div class="rem-budget-bar"><div class="rem-budget-bar-fill" style="width:${pct}%;background:${pct>=100?'#dc2626':pct>=85?'#f59e0b':'#16a34a'}"></div></div>
              <div class="rem-beneficios-form" style="grid-template-columns:2fr 1fr;margin-top:16px;align-items:end">
                <div class="field"><label>Budget aprovado para ${esc(anoAtualStr())}</label><input id="rem-budget-aprovado" type="number" min="0" step="100" value="${aprovado||''}" placeholder="0,00"></div>
                <button class="btn btn-g btn-sm" onclick="window.remSalvarBudgetV3()">💾 Salvar</button>
              </div>`;
            })()}
          </div>
        </div>

        <div class="rem-card">
          <div class="rem-card-head"><div><h2>⚡ Ações Rápidas</h2><p>Exportações e relatórios gerados a partir da base real deste painel.</p></div></div>
          <div class="rem-card-body">
            <div class="rem-acoes-rapidas">
              ${[
                ['📊','Exportar Excel','#10b981','window.remExportExcelV3()'],
                ['📄','Exportar PDF','#ef4444','window.remExportPDFV3()'],
                ['📈','Relatório Executivo','#7c3aed','window.remRelatorioExecutivoV3()'],
                ['🏢','Relatório por Setor','#3b82f6','window.remRelatorioPorSetorV3()'],
                ['🔄','Histórico de Reajustes','#f59e0b','window.remHistoricoReajustesV3()'],
                ['📐','Faixas Salariais','#ec4899','window.remFaixasSalariaisV3()']
              ].map(a=>`<button class="rem-acao-rapida" onclick="${a[3]}"><span class="rem-acao-rapida-icone" style="background:${a[2]}1f;color:${a[2]}">${a[0]}</span><span>${a[1]}</span></button>`).join('')}
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
  // Não salva nada — só calcula e mostra na tela. Aceita 3 granularidades,
  // da mais ampla pra mais específica: setor, cargo, ou 1 colaborador em
  // particular (quando um colaborador é escolhido, setor/cargo do filtro
  // são ignorados, pois já é o caso mais específico possível).
  window.remSimularReajusteV3 = function(){
    const pct = parseFloat(document.getElementById('rem-sim-pct')?.value) || 0;
    const setorSel = document.getElementById('rem-sim-setor')?.value || '';
    const cargoSel = document.getElementById('rem-sim-cargo')?.value || '';
    const colabSel = document.getElementById('rem-sim-colab')?.value || '';
    const el = document.getElementById('rem-simulador-resultado'); if(!el) return;

    let alvo;
    if(colabSel){
      alvo = colaboradoresRem.filter(c=>c.nome===colabSel);
    }else{
      alvo = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)) && (!setorSel || c.setor===setorSel) && (!cargoSel || c.cargo===cargoSel));
    }
    if(!alvo.length){ el.innerHTML = '<div class="empty">Nenhum colaborador encontrado com esse filtro.</div>'; return; }

    const folhaClt = alvo.filter(c=>c.tipo==='CLT').reduce((s,c)=>s+c.salario,0);
    const folhaPj = alvo.filter(c=>c.tipo!=='CLT').reduce((s,c)=>s+c.salario,0);
    const aumentoMensalClt = folhaClt * pct/100;
    const aumentoMensalPj = folhaPj * pct/100;
    const aumentoMensal = aumentoMensalClt + aumentoMensalPj;
    const impactoAnual = aumentoMensal * 12;
    const impactoComEncargos = (aumentoMensalClt*12*(1+TAXA_ENCARGOS_CLT)) + (aumentoMensalPj*12);
    const novaFolha = alvo.reduce((s,c)=>s+c.salario,0) + aumentoMensal;

    let linhaColab = '';
    if(colabSel && alvo.length===1){
      const c = alvo[0];
      const novoSalario = c.salario * (1+pct/100);
      linhaColab = `<div class="rem-sim-resultado-linha"><span>Novo Salário (${esc(c.nome)})</span><strong style="color:#7c3aed">${money(novoSalario)}</strong></div>`;
    }

    el.innerHTML = `<div class="rem-sim-resultado">
      <div class="rem-sim-resultado-linha"><span>Aumento da folha (${alvo.length} pessoa${alvo.length>1?'s':''})</span><strong style="color:#16a34a">${money(aumentoMensal)}</strong></div>
      <div class="rem-sim-resultado-linha"><span>Impacto anual</span><strong style="color:#16a34a">${money(impactoAnual)}</strong></div>
      <div class="rem-sim-resultado-linha"><span>Impacto com encargos (CLT +${Math.round(TAXA_ENCARGOS_CLT*100)}%)</span><strong style="color:#16a34a">${money(impactoComEncargos)}</strong></div>
      ${linhaColab}
      <div class="rem-sim-resultado-linha"><span>Novo custo da folha do grupo</span><strong>${money(novaFolha)}</strong></div>
    </div>
    <p style="font-size:11px;color:#94a3b8;margin-top:10px">Era ${money(alvo.reduce((s,c)=>s+c.salario,0))} · Simulação apenas — nada foi salvo.</p>`;
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

  // ── Ações Rápidas ── reaproveitam XLSX/jsPDF já usados acima, sem nova
  // biblioteca — só filtram/agrupam a mesma base (colaboradoresRem) de
  // formas diferentes para cada relatório.
  window.remRelatorioExecutivoV3 = function(){
    if(!(window.jspdf&&window.jspdf.jsPDF)){alert('Biblioteca PDF não carregada.');return;}
    const s = stats();
    const doc = new window.jspdf.jsPDF();
    doc.setFontSize(16); doc.text('Relatório Executivo — Remuneração', 14, 18);
    doc.setFontSize(10); doc.text('Gerado em ' + new Date().toLocaleDateString('pt-BR'), 14, 25);
    const linhas = [
      ['Folha Salarial (mês)', money(s.folha)],
      ['Custo Total com Pessoal', money(s.custo)],
      ['Salário Médio', money(s.mediaGeral)],
      ['Maior Salário', s.maiorSalario?money(s.maiorSalario):'—'],
      ['Menor Salário', s.menorSalario?money(s.menorSalario):'—'],
      ['Custo dos Benefícios', money(s.benef)],
      ['Colaboradores Ativos', String(s.ativos)],
      ['CLT / PJ', s.clt+' / '+s.pj]
    ];
    if(doc.autoTable) doc.autoTable({startY:32, head:[['Indicador','Valor']], body:linhas});
    doc.save('relatorio_executivo_remuneracao.pdf');
  };
  window.remRelatorioPorSetorV3 = function(){
    if(!window.XLSX){alert('Biblioteca Excel não carregada.');return;}
    const ativos = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)));
    const setoresReaisRel = [...new Set(ativos.map(c=>c.setor||'Não informado'))];
    const linhas = setoresReaisRel.map(st=>{
      const doSetor = ativos.filter(c=>(c.setor||'Não informado')===st);
      const total = doSetor.reduce((s,c)=>s+c.salario,0);
      return { Setor:st, Colaboradores:doSetor.length, 'Salário Médio': doSetor.length?(total/doSetor.length):0, 'Custo Total':total };
    });
    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Por Setor');
    XLSX.writeFile(wb, 'remuneracao_por_setor.xlsx');
  };
  window.remHistoricoReajustesV3 = async function(){
    if(!window.XLSX){alert('Biblioteca Excel não carregada.');return;}
    let mov = [];
    try{ mov = typeof window.grhGetMov==='function' ? await window.grhGetMov() : []; }catch(e){}
    const alteracoes = (Array.isArray(mov)?mov:[]).filter(m=>m.tipo==='Alteração Salarial');
    if(!alteracoes.length){ notify('Nenhum reajuste salarial registrado ainda.'); return; }
    const linhas = alteracoes.map(m=>({Data:m.data||'', Colaborador:m.nome||'', 'Salário Anterior':m.salarioAnt||'', 'Salário Novo':m.salarioNovo||'', Motivo:m.observacao||'', Responsável:m.alteradoPor||''}));
    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Historico Reajustes');
    XLSX.writeFile(wb, 'historico_reajustes.xlsx');
  };
  window.remFaixasSalariaisV3 = function(){
    if(!window.XLSX){alert('Biblioteca Excel não carregada.');return;}
    const ativos = colaboradoresRem.filter(c=>!/inativo|deslig/i.test(norm(c.status)) && c.salario>0);
    const porCargoExport = {};
    ativos.forEach(c=>{ (porCargoExport[c.cargo]=porCargoExport[c.cargo]||[]).push(c); });
    const linhas = [];
    Object.keys(porCargoExport).sort().forEach(cg=>{
      const grupo = porCargoExport[cg];
      if(grupo.length<2) return;
      const f = faixaDe(grupo);
      linhas.push({Cargo:cg, Nível:'Geral', Mínimo:f.min, Midpoint:f.mid, Máximo:f.max, Pessoas:f.n});
    });
    if(!linhas.length){ notify('Nenhum cargo com dados suficientes para gerar faixas.'); return; }
    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Faixas Salariais');
    XLSX.writeFile(wb, 'faixas_salariais.xlsx');
  };

  async function aplicar(){
    const p=pane(); if(!p) return;
    const visible=getComputedStyle(p).display!=='none';
    if(visible && !window.__remPremiumRenderedV3){
      // Evita que o HTML estático antigo do painel fique visível enquanto
      // os dados carregam (chegava a ficar ~5s por causa dos awaits em série).
      p.innerHTML = '<div class="rem-premium-wrap" style="padding:40px;text-align:center;color:#94a3b8">⏳ Carregando dados de remuneração…</div>';
      await carregarBaseReal();
      if(!colaboradoresRem || colaboradoresRem.length === 0) {
        console.warn('[remuneracao] Nenhum dado carregado. Verifique Firebase permissions.');
        notify('⚠️ Sem dados de remuneração. Verifique sua conexão.');
        return;
      }
      const [serieInfo, reajustesMes, custosExtra, alertasInfo, budget] = await Promise.all([
        folhaSerieRealOuEstimada(),
        reajustesDoMesAtual(),
        carregarCustosExtra(),
        calcularAlertasInteligentes(),
        carregarBudget()
      ]);
      render(serieInfo, reajustesMes, custosExtra, alertasInfo, budget);

      // Carregar benefícios salvos para preencher os campos ocultos
      if(typeof window.carregarBeneficiosSalvos === 'function'){
        try{
          window.carregarBeneficiosSalvos();
          // Aguardar um pouco para que os campos sejam preenchidos, depois recalcular o KPI
          setTimeout(function(){
            console.log('[REMUNERACAO] Recalculando KPI após carregamento de benefícios');
            if(typeof window.atualizarKpiCustoBeneficios === 'function'){
              try{ window.atualizarKpiCustoBeneficios(); }catch(e){}
            }
          }, 500);
        }catch(e){ console.warn('Erro ao carregar benefícios salvos:', e); }
      }

      if(typeof window.renderComparativoBeneficios === 'function'){
        try{
          window.renderComparativoBeneficios().then(function(html){
            var card = document.getElementById('rem-comparativo-beneficios-card');
            if(card) card.innerHTML = html;
          });
        }catch(e){ console.warn('Erro ao renderizar comparativo de benefícios:', e); }
      }
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


