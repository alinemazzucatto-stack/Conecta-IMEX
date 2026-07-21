// ===== Dashboard RH — VERSÃO COMPLETA E INTERATIVA =====
(function(){
'use strict';
if(window.__dashRhInit) return;
window.__dashRhInit = true;

// ─── ESTILOS CSS INTEGRADOS ───
var cssDash = `
<style>
:root {
  --clr-azul: #3b82f6;
  --clr-verde: #10b981;
  --clr-laranja: #f59e0b;
  --clr-vermelho: #ef4444;
  --clr-bg: #f8fafc;
  --clr-border: #e2e8f0;
  --ink-60: #64748b;
}

#dash-container {
  background: var(--clr-bg);
  border-radius: 12px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* CABEÇALHO COM EXPORTAÇÃO */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--clr-border);
}

.dash-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--clr-azul);
}

.dash-export-btns {
  display: flex;
  gap: 12px;
}

.btn-export {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}

.btn-export-pdf {
  background: var(--clr-vermelho);
  color: white;
}

.btn-export-pdf:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-export-excel {
  background: var(--clr-verde);
  color: white;
}

.btn-export-excel:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* ABAS DE NAVEGAÇÃO */
#dash-subtabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--clr-border);
  overflow-x: auto;
  padding-bottom: 0;
}

.fr-subtab {
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: var(--ink-60);
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.fr-subtab:hover {
  color: var(--clr-azul);
  background: rgba(59, 130, 246, 0.05);
}

.fr-subtab.on {
  color: var(--clr-azul);
  border-bottom-color: var(--clr-azul);
}

/* CARDS KPI */
.sc {
  background: white;
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.sc:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--clr-azul);
}

.sc-lbl {
  font-size: 12px;
  color: var(--ink-60);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.sc-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--clr-azul);
  margin-bottom: 4px;
}

.sc-sub {
  font-size: 12px;
  color: var(--ink-60);
  margin-top: 6px;
}

/* KPI EM CAIXA SÓLIDA COLORIDA (estilo referência) */
.sc-solida {
  position: relative;
  display: block;
  text-align: left;
  border: none !important;
  padding: 16px 56px 14px 18px;
  box-shadow: 0 4px 14px rgba(0,0,0,.12);
  min-height: 84px;
}
.sc-solida:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 26px rgba(0,0,0,.22);
}
.sc-solida .sc-num {
  color: #fff;
  font-size: 24px;
  margin-bottom: 2px;
  white-space: nowrap;
}
.sc-solida .sc-lbl {
  color: rgba(255,255,255,.92);
  font-size: 11px;
  margin-bottom: 0;
  letter-spacing: .2px;
  white-space: nowrap;
}
.sc-solida .sc-sub {
  color: rgba(255,255,255,.75);
  font-size: 10.5px;
  white-space: nowrap;
}
.sc-solida-texto { width: 100%; min-width: 0; }
.sc-solida-icone {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 24px;
  opacity: .85;
}
@media (max-width: 1100px) {
  .sc-solida .sc-num, .sc-solida .sc-lbl, .sc-solida .sc-sub { white-space: normal; }
}

/* CONTAINER DE KPIS */
.kpis-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

/* GRÁFICOS DE BARRAS */
.dash-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 0;
}

.dash-bar-lbl {
  width: 120px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-60);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-bar-track {
  flex: 1;
  height: 24px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
}

.dash-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--clr-azul), #60a5fa);
  transition: width 0.4s ease;
}

.dash-bar-val {
  width: 80px;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: var(--clr-azul);
}

/* TABELAS */
.dash-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.dash-table thead {
  background: #f1f5f9;
}

.dash-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: var(--ink-60);
  border-bottom: 2px solid var(--clr-border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dash-table td {
  padding: 12px;
  border-bottom: 1px solid var(--clr-border);
  font-size: 13px;
  color: #1e293b;
}

.dash-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.dash-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

/* SEÇÕES */
.dash-section {
  display: none;
  animation: fadeIn 0.3s ease;
}

.dash-section.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dash-section h3 {
  margin-top: 24px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  border-left: 4px solid var(--clr-azul);
  padding-left: 12px;
}

/* ESTADO VAZIO */
.empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--ink-60);
}

.ei {
  font-size: 48px;
  margin-bottom: 12px;
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .kpis-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dash-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .dash-export-btns {
    width: 100%;
  }
  
  .btn-export {
    flex: 1;
  }
  
  .dash-table {
    font-size: 12px;
  }
  
  .dash-table td, .dash-table th {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .kpis-grid {
    grid-template-columns: 1fr;
  }
  
  #dash-subtabs {
    gap: 4px;
  }
  
  .fr-subtab {
    padding: 10px 12px;
    font-size: 12px;
  }
}
</style>
`;

// ─── INJETAR CSS ───
document.head.insertAdjacentHTML('beforeend', cssDash);

// ─── FUNÇÕES AUXILIARES ───
window.dashIrPara = function(secao, btn){
  document.querySelectorAll('.dash-section').forEach(function(s){ s.classList.remove('active'); });
  document.querySelectorAll('#dash-subtabs .fr-subtab').forEach(function(b){ b.classList.remove('on'); });
  if(btn) btn.classList.add('on');
  var el = document.getElementById('dash-pane-'+secao);
  if(el) { 
    el.classList.add('active');
    el.scrollIntoView({behavior:'smooth', block:'start'});
  }
};

function kpiCard(label, valor, sub, cor, icon){
  cor = cor || '--clr-azul';
  icon = icon || '📊';
  return '<div class="sc sc-solida" style="background: var('+cor+')">'+
    '<div class="sc-solida-texto">'+
      '<div class="sc-num">'+valor+'</div>'+
      '<div class="sc-lbl">'+label+'</div>'+
      (sub?'<div class="sc-sub">'+sub+'</div>':'')+
    '</div>'+
    '<div class="sc-solida-icone">'+icon+'</div>'+
  '</div>';
}

function fmtBRL(n){ return 'R$ '+Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }

function barChart(items, valueFmt){
  if(!items.length) return '<div class="empty"><div class="ei">📭</div>Sem dados.</div>';
  var max = Math.max.apply(null, items.map(function(i){ return i.valor; })) || 1;
  return items.map(function(i){
    var pct = Math.max(2, Math.round((i.valor/max)*100));
    var cor = i.cor || '--clr-azul';
    return '<div class="dash-bar-row">'+
      '<div class="dash-bar-lbl" title="'+i.label+'">'+i.label+'</div>'+
      '<div class="dash-bar-track"><div class="dash-bar-fill" style="background: linear-gradient(90deg, var('+cor+'), var('+cor+')80%); width:'+pct+'%"></div></div>'+
      '<div class="dash-bar-val">'+(valueFmt?valueFmt(i.valor):i.valor)+'</div>'+
    '</div>';
  }).join('');
}

async function dashColabsAtivos(){
  var cols = typeof window.grhGetColabs==='function' ? await window.grhGetColabs() : (typeof window.getCols==='function' ? await window.getCols() : []);
  return (cols||[]).filter(function(c){ return (c.status||'Ativo')!=='Inativo'; });
}

function verticalBarChart(items, opts){
  opts = opts || {};
  if(!items.length) return '<div class="empty"><div class="ei">📭</div>Sem dados.</div>';
  var max = Math.max.apply(null, items.map(function(i){ return i.valor; })) || 1;
  var cor = opts.cor || '--clr-azul';
  return '<div style="display:flex;align-items:flex-end;gap:6px;height:140px;padding:6px 2px">'+
    items.map(function(i){
      var pct = Math.max(2, Math.round((i.valor/max)*100));
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">'+
        '<div style="font-size:10px;font-weight:700;color:var('+cor+');margin-bottom:3px">'+(i.valor||'')+'</div>'+
        '<div style="width:100%;max-width:26px;height:'+pct+'%;background:linear-gradient(180deg, var('+cor+'), var('+cor+')cc);border-radius:5px 5px 0 0;transition:height .4s ease" title="'+i.label+': '+i.valor+'"></div>'+
        '<div style="font-size:10px;color:var(--ink-60);margin-top:5px;text-transform:capitalize">'+i.label+'</div>'+
      '</div>';
    }).join('') +
  '</div>';
}

function lineChart(items, opts){
  opts = opts || {};
  if(!items.length) return '<div class="empty"><div class="ei">📭</div>Sem dados.</div>';
  var w = 280, h = 120, pad = 18;
  var max = Math.max.apply(null, items.map(function(i){ return i.valor; })) || 1;
  var stepX = items.length>1 ? (w-pad*2)/(items.length-1) : 0;
  var cor = opts.corHex || '#10b981';
  var pontos = items.map(function(i,idx){
    var x = pad + idx*stepX;
    var y = h-pad - ((i.valor/max)*(h-pad*2));
    return {x:x, y:y, valor:i.valor, label:i.label};
  });
  var pathD = pontos.map(function(p,idx){ return (idx===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1); }).join(' ');
  var areaD = pathD + ' L'+pontos[pontos.length-1].x.toFixed(1)+','+(h-pad)+' L'+pontos[0].x.toFixed(1)+','+(h-pad)+' Z';
  var svg = '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:140px">'+
    '<path d="'+areaD+'" fill="'+cor+'" opacity="0.12"></path>'+
    '<path d="'+pathD+'" fill="none" stroke="'+cor+'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></path>'+
    pontos.map(function(p){ return '<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="3" fill="'+cor+'"><title>'+p.label+': '+p.valor+'</title></circle>'; }).join('') +
  '</svg>';
  var legendas = '<div style="display:flex;justify-content:space-between;padding:0 2px;margin-top:2px">'+
    items.map(function(i){ return '<span style="font-size:9px;color:var(--ink-60);text-transform:capitalize">'+i.label+'</span>'; }).join('') +
  '</div>';
  return svg + legendas;
}

function donutChart(items){
  if(!items.length || items.every(function(i){ return !i.valor; })) return '<div class="empty"><div class="ei">📭</div>Sem dados.</div>';
  var total = items.reduce(function(s,i){ return s+i.valor; },0) || 1;
  var acc = 0;
  var stops = items.map(function(i){
    var inicio = (acc/total)*360; acc += i.valor; var fim = (acc/total)*360;
    return i.cor+' '+inicio.toFixed(1)+'deg '+fim.toFixed(1)+'deg';
  }).join(', ');
  var legenda = items.map(function(i){
    var pct = Math.round((i.valor/total)*100);
    return '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--ink-60);margin-bottom:4px">'+
      '<span style="width:10px;height:10px;border-radius:50%;background:'+i.cor+';flex-shrink:0"></span>'+
      '<span style="flex:1">'+i.label+'</span><strong style="color:#1e293b">'+pct+'%</strong>'+
    '</div>';
  }).join('');
  return '<div style="display:flex;align-items:center;gap:16px">'+
    '<div style="width:110px;height:110px;border-radius:50%;background:conic-gradient('+stops+');flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.08)"></div>'+
    '<div style="flex:1">'+legenda+'</div>'+
  '</div>';
}

function dashFaixaTempoCasa(admissao){
  if(!admissao) return null;
  var adm = new Date(admissao);
  if(isNaN(adm.getTime())) return null;
  var anos = (Date.now()-adm.getTime())/(1000*60*60*24*365.25);
  if(anos < 2) return 'Até 2 anos';
  if(anos < 5) return 'De 2 a 5 anos';
  if(anos < 10) return 'De 5 a 10 anos';
  if(anos < 15) return 'De 10 a 15 anos';
  if(anos < 20) return 'De 15 a 20 anos';
  return 'Acima de 20 anos';
}

function renderHeadcountPorMes(ativos){
  var el = document.getElementById('dg-headcount-mes');
  if(!el) return;
  var hoje = new Date();
  var meses = [];
  for(var i=11;i>=0;i--){ meses.push(new Date(hoje.getFullYear(), hoje.getMonth()-i, 1)); }
  var itens = meses.map(function(m){
    var fimMes = new Date(m.getFullYear(), m.getMonth()+1, 0);
    var qtd = ativos.filter(function(c){ var adm=new Date(c.admissao||0); return !isNaN(adm.getTime()) && adm<=fimMes; }).length;
    return {label:m.toLocaleDateString('pt-BR',{month:'short'}), valor:qtd};
  });
  el.innerHTML = verticalBarChart(itens, {cor:'--clr-azul'});
}

async function renderTaxaPromocao(){
  var el = document.getElementById('dg-promocao');
  if(!el) return;
  try{
    var mov = typeof window.grhGetMov==='function' ? await window.grhGetMov() : [];
    var ativos = await dashColabsAtivos();
    var totalAtivos = ativos.length || 1;
    var hoje = new Date(), anoAtual = hoje.getFullYear();
    var meses = [];
    for(var i=0;i<12;i++){ meses.push(new Date(anoAtual, i, 1)); }
    var itens = meses.filter(function(m){ return m<=hoje; }).map(function(m){
      var fimMes = new Date(m.getFullYear(), m.getMonth()+1, 0);
      var promocoes = (mov||[]).filter(function(mv){
        var d = new Date(mv.data||0);
        return /cargo/i.test(mv.tipo||'') && d.getFullYear()===m.getFullYear() && d.getMonth()===m.getMonth();
      }).length;
      var taxa = Math.round((promocoes/totalAtivos)*1000)/10;
      return {label:m.toLocaleDateString('pt-BR',{month:'short'}), valor:taxa};
    });
    el.innerHTML = lineChart(itens, {corHex:'#10b981'}) + '<div style="font-size:10px;color:var(--ink-60);margin-top:4px">% de mudanças de cargo sobre o total de ativos, por mês</div>';
  }catch(e){
    el.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

function renderTempoDeCasa(ativos){
  var el = document.getElementById('dg-tempocasa');
  if(!el) return;
  var cores = {'Até 2 anos':'#3b82f6','De 2 a 5 anos':'#f59e0b','De 5 a 10 anos':'#10b981','De 10 a 15 anos':'#8b5cf6','De 15 a 20 anos':'#ec4899','Acima de 20 anos':'#1e293b'};
  var ordem = ['Até 2 anos','De 2 a 5 anos','De 5 a 10 anos','De 10 a 15 anos','De 15 a 20 anos','Acima de 20 anos'];
  var contagem = {};
  ordem.forEach(function(f){ contagem[f]=0; });
  ativos.forEach(function(c){ var f = dashFaixaTempoCasa(c.admissao); if(f && contagem.hasOwnProperty(f)) contagem[f]++; });
  var itens = ordem.map(function(f){ return {label:f, valor:contagem[f], cor:cores[f]}; });
  el.innerHTML = donutChart(itens);
}

async function renderAlertasImportantes(ativos){
  var el = document.getElementById('dg-alertas');
  if(!el) return;
  el.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    var hoje = new Date();
    var itens = [];

    // Férias vencendo nos próximos 30 dias
    var em30 = new Date(hoje.getTime() + 30*24*60*60*1000);
    var feriasVencendo = ativos.filter(function(c){
      var prazo = c.ferias && c.ferias.prazoLimite ? new Date(c.ferias.prazoLimite) : (c.prazoLimite ? new Date(c.prazoLimite) : null);
      return prazo && !isNaN(prazo.getTime()) && prazo>=hoje && prazo<=em30;
    }).length;
    if(feriasVencendo>0) itens.push({icone:'🌴', cor:'#f59e0b', titulo:'Férias vencendo nos próximos 30 dias', sub:feriasVencendo+' colaborador(es)'});

    // Pendências de férias no RH
    if(typeof window.getR === 'function'){
      var reqs = await window.getR();
      var pendentes = (reqs||[]).filter(function(r){ return ['Aguardando gestor','Em análise pelo RH'].includes(r.statusFinal); }).length;
      if(pendentes>0) itens.push({icone:'⏳', cor:'#3b82f6', titulo:'Solicitações de férias pendentes', sub:pendentes+' aguardando aprovação'});
    }

    // Documentos pendentes de assinatura
    try{
      if(typeof db!=='undefined' && typeof col==='function'){
        var snapDocs = await db.collection(col('grh_documentos')).get();
        var pendentesDocs = snapDocs.docs.filter(function(d){ return (d.data().status)==='Pendente assinatura'; }).length;
        if(pendentesDocs>0) itens.push({icone:'📄', cor:'#8b5cf6', titulo:'Documentos pendentes de assinatura', sub:pendentesDocs+' documento(s)'});
      }
    }catch(e){}

    // Desligamentos recentes (30 dias)
    var desl = typeof window.grhGetDesl==='function' ? await window.grhGetDesl() : [];
    var em30trasD = new Date(hoje.getTime() - 30*24*60*60*1000);
    var deslRecentes = (desl||[]).filter(function(d){
      var data = new Date(d.data||d.dataDesligamento||0);
      return !isNaN(data.getTime()) && data>=em30trasD;
    }).length;
    if(deslRecentes>0) itens.push({icone:'🚪', cor:'#ef4444', titulo:'Desligamentos nos últimos 30 dias', sub:deslRecentes+' colaborador(es)'});

    if(!itens.length){
      el.innerHTML = '<div class="empty"><div class="ei">✅</div>Nenhum alerta no momento.</div>';
      return;
    }
    el.innerHTML = itens.map(function(i){
      return '<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--clr-border)">'+
        '<div style="font-size:20px;background:'+i.cor+'1a;color:'+i.cor+';border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+i.icone+'</div>'+
        '<div style="min-width:0"><div style="font-size:13px;font-weight:600;color:#1e293b">'+i.titulo+'</div><div style="font-size:12px;color:var(--ink-60)">'+i.sub+'</div></div>'+
      '</div>';
    }).join('');
  }catch(e){
    el.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

function dashRelativo(data){
  var hoje = new Date(); hoje.setHours(0,0,0,0);
  var d = new Date(data); d.setHours(0,0,0,0);
  var diffDias = Math.round((hoje.getTime()-d.getTime())/(1000*60*60*24));
  if(diffDias===0) return 'Hoje';
  if(diffDias===1) return 'Ontem';
  if(diffDias>1 && diffDias<7) return 'Há '+diffDias+' dias';
  return new Date(data).toLocaleDateString('pt-BR');
}

async function renderTimelineRH(){
  var el = document.getElementById('dg-timeline');
  if(!el) return;
  el.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    var mov = typeof window.grhGetMov==='function' ? await window.grhGetMov() : [];
    var eventos = (mov||[]).filter(function(m){ return m.data; }).sort(function(a,b){ return new Date(b.data)-new Date(a.data); }).slice(0,8);
    if(!eventos.length){
      el.innerHTML = '<div class="empty"><div class="ei">📭</div>Sem eventos recentes.</div>';
      return;
    }
    var iconePorTipo = {'Promoção':'⭐','Mudança de Cargo':'⭐','Transferência':'🔄','Admissão':'✅','Desligamento':'🚪','Reajuste Salarial':'💰'};
    el.innerHTML = eventos.map(function(m){
      var icone = iconePorTipo[m.tipo] || '📌';
      var nome = m.nome || m.colaborador || 'Colaborador';
      var detalhe = m.detalhe || m.observacao || m.tipo || '';
      return '<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--clr-border)">'+
        '<div style="font-size:16px;flex-shrink:0">'+icone+'</div>'+
        '<div style="min-width:0"><div style="font-size:13px;color:#1e293b"><strong>'+nome+'</strong> — '+detalhe+'</div><div style="font-size:11px;color:var(--ink-60)">'+dashRelativo(m.data)+'</div></div>'+
      '</div>';
    }).join('');
  }catch(e){
    el.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

async function renderKpisExtras(ativos, rem, porSetor, hoje){
  var el = document.getElementById('dg-kpis-2');
  if(!el) return;
  el.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    // Tempo médio de empresa
    var anosSoma = 0, comAdmissao = 0;
    ativos.forEach(function(c){
      var adm = new Date(c.admissao||0);
      if(!isNaN(adm.getTime())){ anosSoma += (hoje.getTime()-adm.getTime())/(1000*60*60*24*365.25); comAdmissao++; }
    });
    var tempoMedio = comAdmissao ? (anosSoma/comAdmissao).toFixed(1) : '—';

    // Salário médio
    var salarios = (rem||[]).map(function(r){ return parseFloat(r.salario)||0; }).filter(function(v){ return v>0; });
    var salarioMedio = salarios.length ? salarios.reduce(function(a,b){ return a+b; },0)/salarios.length : 0;

    // Setor com mais colaboradores
    var setoresOrdenados = Object.keys(porSetor||{}).sort(function(a,b){ return porSetor[b]-porSetor[a]; });
    var topSetor = setoresOrdenados.length ? setoresOrdenados[0] : '—';
    var topSetorQtd = setoresOrdenados.length ? porSetor[topSetor] : 0;

    // Pendências de férias no RH
    var pendentesFerias = '—';
    try{
      if(typeof window.getR === 'function'){
        var todasReqs = await window.getR();
        pendentesFerias = (todasReqs||[]).filter(function(r){ return ['Aguardando gestor','Em análise pelo RH'].includes(r.statusFinal); }).length;
      }
    }catch(e){}

    // Aniversariantes do mês
    var mesAtual = hoje.getMonth();
    var aniversariantes = ativos.filter(function(c){
      if(!c.nascimento) return false;
      var nasc = new Date(c.nascimento+'T12:00:00');
      return !isNaN(nasc.getTime()) && nasc.getMonth()===mesAtual;
    }).length;

    // Admissões no mês atual
    var admissoesMes = ativos.filter(function(c){
      var adm = new Date(c.admissao||0);
      return !isNaN(adm.getTime()) && adm.getFullYear()===hoje.getFullYear() && adm.getMonth()===hoje.getMonth();
    }).length;

    el.innerHTML =
      '<div class="kpis-grid" style="grid-template-columns:repeat(3,1fr)">'+
      kpiCard('Tempo Médio de Empresa', tempoMedio+(tempoMedio!=='—'?' anos':''), '', '--clr-azul', '🕒') +
      kpiCard('Salário Médio', fmtBRL(salarioMedio), '', '--clr-verde', '💵') +
      kpiCard('Maior Setor', topSetor, topSetorQtd+' colaboradores', '--clr-laranja', '🏢') +
      kpiCard('Pendências de Férias', pendentesFerias, 'Aguardando aprovação', '--clr-vermelho', '⏳') +
      kpiCard('Aniversariantes', aniversariantes, 'Neste mês', '--clr-azul', '🎂') +
      kpiCard('Admissões', admissoesMes, 'Neste mês', '--clr-verde', '✅') +
      '</div>';
  }catch(e){
    el.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

function renderGenero(ativos){
  var el = document.getElementById('dg-genero');
  if(!el) return;
  var masc = ativos.filter(function(c){ return c.genero==='Masculino'; }).length;
  var fem = ativos.filter(function(c){ return c.genero==='Feminino'; }).length;
  var outro = ativos.filter(function(c){ return c.genero==='Outro'; }).length;
  var semInfo = ativos.length - masc - fem - outro;
  var total = ativos.length || 1;
  if(masc+fem+outro===0){
    el.innerHTML = '<div class="empty"><div class="ei">🚻</div>Nenhum colaborador com gênero preenchido ainda.<br><span style="font-size:11px">Adicione no cadastro mestre de cada colaborador.</span></div>';
    return;
  }
  var pctMasc = Math.round((masc/total)*100), pctFem = Math.round((fem/total)*100);
  el.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:14px">'+
      '<div style="text-align:center"><div style="font-size:32px">♂️</div><div style="font-size:20px;font-weight:800;color:#3b82f6">'+pctMasc+'%</div><div style="font-size:11px;color:var(--ink-60)">Homens ('+masc+')</div></div>'+
      '<div style="text-align:center"><div style="font-size:32px">♀️</div><div style="font-size:20px;font-weight:800;color:#ec4899">'+pctFem+'%</div><div style="font-size:11px;color:var(--ink-60)">Mulheres ('+fem+')</div></div>'+
    '</div>'+
    '<div style="height:10px;border-radius:6px;overflow:hidden;display:flex;margin-bottom:8px">'+
      '<div style="background:#3b82f6;width:'+pctMasc+'%"></div>'+
      '<div style="background:#ec4899;width:'+pctFem+'%"></div>'+
      (outro?'<div style="background:#8b5cf6;width:'+Math.round((outro/total)*100)+'%"></div>':'')+
    '</div>'+
    (outro ? '<div style="font-size:11px;color:var(--ink-60);text-align:center">⚧ Outro: '+outro+'</div>' : '') +
    (semInfo ? '<div style="font-size:11px;color:var(--ink-60);text-align:center;margin-top:4px">'+semInfo+' colaborador(es) sem gênero preenchido</div>' : '');
}

// ─── VISÃO GERAL ───
async function renderDashGeral(){
  var kpisEl = document.getElementById('dg-kpis');
  if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    var ativos = await dashColabsAtivos();
    var rem = typeof window.grhGetRem==='function' ? await window.grhGetRem() : [];
    var desl = typeof window.grhGetDesl==='function' ? await window.grhGetDesl() : [];

    var totalColabs = ativos.length;
    var clt = ativos.filter(function(c){ return c.clt==='Sim'; }).length;
    var pj = totalColabs - clt;
    var custoTotal = (rem||[]).reduce(function(s,r){ return s+(parseFloat(r.custoTotal)||parseFloat(r.salario)||0); },0);

    var hoje = new Date(), d180 = new Date(hoje); d180.setDate(d180.getDate()-180);
    var deslUlt6m = (desl||[]).filter(function(d){ var dt=new Date(d.data||d.dataDesligamento||0); return dt>=d180; }).length;
    var turnover = totalColabs ? ((deslUlt6m/totalColabs)*100).toFixed(1) : '0.0';

    var hojeStr = hoje.toISOString().split('T')[0];
    var d30 = new Date(hoje); d30.setDate(d30.getDate()+30); var d30s = d30.toISOString().split('T')[0];
    var vencendo30 = ativos.filter(function(c){ return c.prazoLimite && c.prazoLimite>=hojeStr && c.prazoLimite<=d30s; }).length;

    if(kpisEl) kpisEl.innerHTML =
      '<div class="kpis-grid">'+
      kpiCard('Colaboradores Ativos', totalColabs, clt+' CLT · '+pj+' PJ', '--clr-azul', '📋') +
      kpiCard('Custo da Folha', fmtBRL(custoTotal), 'Custo total mensal', '--clr-verde', '💰') +
      kpiCard('Férias (30 dias)', vencendo30, 'Precisam ser agendadas', '--clr-laranja', '🌴') +
      kpiCard('Turnover (6m)', turnover+'%', deslUlt6m+' desligamentos', '--clr-vermelho', '⏻') +
      '</div>';

    var porSetor = {};
    ativos.forEach(function(c){ var s=c.setor||'Sem setor'; porSetor[s]=(porSetor[s]||0)+1; });
    var grafEl = document.getElementById('dg-setor-graf');
    if(grafEl){
      var itens = Object.keys(porSetor).map(function(s){ return {label:s, valor:porSetor[s]}; }).sort(function(a,b){ return b.valor-a.valor; });
      grafEl.innerHTML = '<h3>📊 Headcount por Setor</h3>' + barChart(itens);
    }

    renderHeadcountPorMes(ativos);
    await renderTaxaPromocao();
    renderTempoDeCasa(ativos);
    renderGenero(ativos);
    await renderKpisExtras(ativos, rem, porSetor, hoje);
    await renderAlertasImportantes(ativos);
    await renderTimelineRH();

    var meses = [];
    for(var i=5;i>=0;i--){ var d=new Date(hoje.getFullYear(),hoje.getMonth()-i,1); meses.push({key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'), lbl:d.toLocaleDateString('pt-BR',{month:'short'})}); }
    var admPorMes = {}, deslPorMes = {};
    meses.forEach(function(m){ admPorMes[m.key]=0; deslPorMes[m.key]=0; });
    ativos.forEach(function(c){ var k=(c.admissao||'').slice(0,7); if(admPorMes.hasOwnProperty(k)) admPorMes[k]++; });
    (desl||[]).forEach(function(d){ var k=(d.data||d.dataDesligamento||'').slice(0,7); if(deslPorMes.hasOwnProperty(k)) deslPorMes[k]++; });
    var admdeslEl = document.getElementById('dg-admdesl');
    if(admdeslEl){
      admdeslEl.innerHTML = '<h3>📈 Admissões vs Desligamentos (6 meses)</h3>' + meses.map(function(m){
        var a=admPorMes[m.key], d=deslPorMes[m.key];
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'+
          '<span style="width:36px;font-size:11px;color:var(--ink-60);text-transform:capitalize">'+m.lbl+'</span>'+
          '<span style="flex:1;background:#dcfce7;border-radius:6px;height:18px;position:relative"><span style="position:absolute;left:0;top:0;bottom:0;background:var(--clr-verde);border-radius:6px;width:'+Math.min(100,a*20)+'%"></span></span>'+
          '<span style="width:16px;font-size:11px;font-weight:700;color:#15803d">'+a+'</span>'+
          '<span style="flex:1;background:#fee2e2;border-radius:6px;height:18px;position:relative"><span style="position:absolute;left:0;top:0;bottom:0;background:var(--clr-vermelho);border-radius:6px;width:'+Math.min(100,d*20)+'%"></span></span>'+
          '<span style="width:16px;font-size:11px;font-weight:700;color:#b91c1c">'+d+'</span>'+
        '</div>';
      }).join('') + '<div style="font-size:11px;color:var(--ink-60);margin-top:12px;padding-top:12px;border-top:1px solid var(--clr-border)">🟢 Admissões &nbsp; 🔴 Desligamentos</div>';
    }
  }catch(e){
    if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

// ─── COLABORADORES ───
async function renderDashColaboradores(){
  var kpisEl = document.getElementById('dc-kpis');
  if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    var ativos = await dashColabsAtivos();
    var clt = ativos.filter(function(c){ return c.clt==='Sim'; }).length;
    var pj = ativos.length - clt;
    var comAdmissaoRecente = ativos.filter(function(c){ var adm=new Date(c.admissao||0); var d90=new Date(); d90.setDate(d90.getDate()-90); return adm>=d90; }).length;

    if(kpisEl) kpisEl.innerHTML =
      '<div class="kpis-grid">'+
      kpiCard('Total Ativos', ativos.length, '', '--clr-azul', '👥') +
      kpiCard('CLT', clt, ativos.length ? Math.round(clt/ativos.length*100)+'%' : '0%', '--clr-verde', '📄') +
      kpiCard('PJ / Outros', pj, ativos.length ? Math.round(pj/ativos.length*100)+'%' : '0%', '--clr-laranja', '🧾') +
      kpiCard('Admitidos (90d)', comAdmissaoRecente, '', '--clr-azul', '✅') +
      '</div>';

    var porSetor = {};
    ativos.forEach(function(c){
      var s = c.setor||'Sem setor';
      if(!porSetor[s]) porSetor[s] = {clt:0,pj:0,outros:0,total:0};
      porSetor[s].total++;
      if(c.clt==='Sim') porSetor[s].clt++;
      else if((c.tipoContrato||'').toLowerCase()==='pj') porSetor[s].pj++;
      else porSetor[s].outros++;
    });
    var tb = document.getElementById('dc-setor-tb');
    if(tb){
      var keys = Object.keys(porSetor).sort(function(a,b){ return porSetor[b].total-porSetor[a].total; });
      tb.innerHTML = '<h3>📋 Distribuição por Setor e Contrato</h3><table class="dash-table"><thead><tr><th>Setor</th><th>CLT</th><th>PJ</th><th>Outros</th><th>Total</th></tr></thead><tbody>' + (keys.length ? keys.map(function(s){
        var d = porSetor[s];
        return '<tr><td>'+s+'</td><td>'+d.clt+'</td><td>'+d.pj+'</td><td>'+d.outros+'</td><td><strong>'+d.total+'</strong></td></tr>';
      }).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--ink-60);padding:18px">Sem dados.</td></tr>') + '</tbody></table>';
    }
  }catch(e){
    if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

// ─── REMUNERAÇÃO ───
async function renderDashRemuneracao(){
  var kpisEl = document.getElementById('dr-kpis');
  if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    var rem = typeof window.grhGetRem==='function' ? await window.grhGetRem() : [];
    var ativos = await dashColabsAtivos();
    var custoTotal = (rem||[]).reduce(function(s,r){ return s+(parseFloat(r.custoTotal)||parseFloat(r.salario)||0); },0);
    var folha = (rem||[]).reduce(function(s,r){ return s+(parseFloat(r.salario)||0); },0);
    var custoMedio = rem.length ? custoTotal/rem.length : 0;
    var maior = rem.reduce(function(m,r){ return Math.max(m, parseFloat(r.salario)||0); }, 0);

    if(kpisEl) kpisEl.innerHTML =
      '<div class="kpis-grid">'+
      kpiCard('Custo Total', fmtBRL(custoTotal), 'Folha + encargos', '--clr-verde', '💰') +
      kpiCard('Folha (Salários)', fmtBRL(folha), 'Soma de salários', '--clr-azul', '💵') +
      kpiCard('Custo Médio', fmtBRL(custoMedio), 'Por colaborador', '--clr-laranja', '📊') +
      kpiCard('Maior Salário', fmtBRL(maior), 'Máximo registrado', '--clr-vermelho', '🏆') +
      '</div>';

    var nomeParaSetor = {};
    ativos.forEach(function(c){ nomeParaSetor[(c.email||c.nome||'').toLowerCase()] = c.setor||'Sem setor'; });
    var porSetor = {};
    rem.forEach(function(r){
      var key = (r.email||r.nome||'').toLowerCase();
      var setor = nomeParaSetor[key] || r.setor || 'Sem setor';
      if(!porSetor[setor]) porSetor[setor] = {qtd:0,total:0};
      porSetor[setor].qtd++;
      porSetor[setor].total += (parseFloat(r.custoTotal)||parseFloat(r.salario)||0);
    });
    var keys = Object.keys(porSetor).sort(function(a,b){ return porSetor[b].total-porSetor[a].total; });

    var grafEl = document.getElementById('dr-setor-graf');
    if(grafEl){
      var itens = keys.map(function(s){ return {label:s, valor:porSetor[s].total, cor:'--clr-verde'}; });
      grafEl.innerHTML = '<h3>💰 Custo por Setor</h3>' + barChart(itens, fmtBRL);
    }
    var tb = document.getElementById('dr-setor-tb');
    if(tb){
      tb.innerHTML = '<h3>📊 Detalhamento por Setor</h3><table class="dash-table"><thead><tr><th>Setor</th><th>Qtd</th><th>Custo Total</th><th>Custo Médio</th></tr></thead><tbody>' + (keys.length ? keys.map(function(s){
        var d = porSetor[s];
        return '<tr><td>'+s+'</td><td>'+d.qtd+'</td><td>'+fmtBRL(d.total)+'</td><td>'+fmtBRL(d.qtd?d.total/d.qtd:0)+'</td></tr>';
      }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--ink-60);padding:18px">Sem dados.</td></tr>') + '</tbody></table>';
    }
  }catch(e){
    if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

// ─── MOVIMENTAÇÕES ───
async function renderDashMovimentacoes(){
  var kpisEl = document.getElementById('dm-kpis');
  if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    var mov = typeof window.grhGetMov==='function' ? await window.grhGetMov() : [];
    var hoje = new Date(), d90 = new Date(hoje); d90.setDate(d90.getDate()-90);
    var recentes = (mov||[]).filter(function(m){ return new Date(m.data||0) >= d90; }).sort(function(a,b){ return new Date(b.data||0)-new Date(a.data||0); });

    var porTipo = {};
    recentes.forEach(function(m){ var t=m.tipo||'Outro'; porTipo[t]=(porTipo[t]||0)+1; });
    var tipos = Object.keys(porTipo).sort(function(a,b){ return porTipo[b]-porTipo[a]; });

    if(kpisEl) kpisEl.innerHTML =
      '<div class="kpis-grid">'+
      kpiCard('Total (90d)', recentes.length, 'Últimos 90 dias', '--clr-azul', '🔄') +
      (tipos.slice(0,3).map(function(t,i){ var cores=['--clr-verde','--clr-laranja','--clr-vermelho']; return kpiCard(t, porTipo[t], '', cores[i%3]); }).join('')) +
      '</div>';

    var grafEl = document.getElementById('dm-graf');
    if(grafEl){
      var itens = tipos.map(function(t,i){ var cores=['--clr-verde','--clr-laranja','--clr-vermelho','--clr-azul']; return {label:t, valor:porTipo[t], cor:cores[i%4]}; });
      grafEl.innerHTML = '<h3>📈 Movimentações por Tipo (90d)</h3>' + barChart(itens);
    }

    var tb = document.getElementById('dm-tb');
    if(tb){
      tb.innerHTML = '<h3>📋 Movimentações Recentes</h3><table class="dash-table"><thead><tr><th>Colaborador</th><th>Tipo</th><th>Data</th><th>Detalhe</th></tr></thead><tbody>' + (recentes.length ? recentes.slice(0,50).map(function(m){
        return '<tr><td>'+(m.nome||m.colaborador||'—')+'</td><td>'+(m.tipo||'—')+'</td><td>'+(m.data?new Date(m.data).toLocaleDateString('pt-BR'):'—')+'</td><td>'+(m.detalhe||m.observacao||'—')+'</td></tr>';
      }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--ink-60);padding:18px">Nenhuma movimentação nos últimos 90 dias.</td></tr>') + '</tbody></table>';
    }
  }catch(e){
    if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

// ─── PESQUISAS ───
async function renderDashPesquisas(){
  var kpisEl = document.getElementById('dp-kpis');
  if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    var snap = typeof db !== 'undefined' ? await db.collection(col('pesquisas')).get() : {docs:[]};
    var lista = snap.docs ? snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); }) : [];
    var ativas = lista.filter(function(p){ return p.status!=='encerrada'; }).length;
    var totalRespostas = lista.reduce(function(s,p){ return s+((p.respostas||[]).length); },0);

    var npsValores = [];
    lista.forEach(function(p){ (p.respostas||[]).forEach(function(r){ if(typeof r.nota==='number') npsValores.push(r.nota); }); });
    var npsMedio = npsValores.length ? (npsValores.reduce(function(a,b){ return a+b; },0)/npsValores.length).toFixed(1) : '—';

    if(kpisEl) kpisEl.innerHTML =
      '<div class="kpis-grid">'+
      kpiCard('Pesquisas Ativas', ativas, '', '--clr-azul', '📋') +
      kpiCard('Total de Pesquisas', lista.length, '', '--clr-verde', '📝') +
      kpiCard('Total de Respostas', totalRespostas, '', '--clr-laranja', '💬') +
      kpiCard('Nota Média (NPS)', npsMedio, 'Satisfação', '--clr-verde', '⭐') +
      '</div>';

    var tb = document.getElementById('dp-tb');
    if(tb){
      tb.innerHTML = '<h3>📊 Pesquisas Cadastradas</h3><table class="dash-table"><thead><tr><th>Título</th><th>Status</th><th>Respostas</th><th>Nota Média</th></tr></thead><tbody>' + (lista.length ? lista.map(function(p){
        var respostas = (p.respostas||[]);
        var notas = respostas.filter(function(r){ return typeof r.nota==='number'; }).map(function(r){ return r.nota; });
        var media = notas.length ? (notas.reduce(function(a,b){ return a+b; },0)/notas.length).toFixed(1) : '—';
        return '<tr><td>'+(p.titulo||p.nome||'—')+'</td><td><span style="background:'+(p.status==='encerrada'?'#fee2e2':'#dcfce7')+';color:'+(p.status==='encerrada'?'#991b1b':'#15803d')+';padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600">'+(p.status==='encerrada'?'Encerrada':'Ativa')+'</span></td><td>'+respostas.length+'</td><td>'+media+'</td></tr>';
      }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--ink-60);padding:18px">Nenhuma pesquisa cadastrada.</td></tr>') + '</tbody></table>';
    }
  }catch(e){
    if(kpisEl) kpisEl.innerHTML = '<div class="empty"><div class="ei">❌</div>Erro: '+e.message+'</div>';
  }
}

// ─── CARREGA TUDO ───
var dashJaCarregou = false;
function dashCarregarTudo(){
  if(dashJaCarregou) return;
  dashJaCarregou = true;
  renderDashGeral();
  renderDashColaboradores();
  renderDashRemuneracao();
  renderDashMovimentacoes();
  renderDashPesquisas();
  if(typeof window.renderDash==='function') window.renderDash();
}
window.dashRecarregarTudo = function(){ dashJaCarregou=false; dashCarregarTudo(); };

// ─── EXPORTAÇÃO ───
function dashColetarTabela(tbId){
  var tbody = document.getElementById(tbId);
  if(!tbody) return {headers:[], rows:[]};
  var table = tbody.closest('table');
  var headers = table ? Array.prototype.map.call(table.querySelectorAll('thead th'), function(th){ return th.textContent.trim(); }) : [];
  var rows = Array.prototype.map.call(tbody.querySelectorAll('tr'), function(tr){
    return Array.prototype.map.call(tr.querySelectorAll('td'), function(td){ return td.textContent.trim(); });
  });
  return {headers:headers, rows:rows};
}

function dashColetarKPIs(){
  var wrap = document.getElementById('dg-kpis');
  if(!wrap) return {headers:[], rows:[]};
  var cards = wrap.querySelectorAll('.sc');
  var rows = Array.prototype.map.call(cards, function(card){
    var lbl = card.querySelector('.sc-lbl');
    var num = card.querySelector('.sc-num');
    var sub = card.querySelector('.sc-sub');
    return [lbl?lbl.textContent.trim():'', num?num.textContent.trim():'', sub?sub.textContent.trim():''];
  });
  return {headers:['Indicador','Valor','Detalhe'], rows:rows};
}

var DASH_SECOES_EXPORT = [
  {titulo:'Visão Geral - Indicadores', tbId:null, coletor:dashColetarKPIs}
];

window.dashExportarPDF = function(){
  try{
    if(typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined'){ alert('Biblioteca de PDF não carregada.'); return; }
    var JsPdfCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    var doc = new JsPdfCtor();
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text('📊 Dashboard RH — Relatório Completo', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Gerado em ' + new Date().toLocaleString('pt-BR'), 14, 24);
    var y = 32;
    DASH_SECOES_EXPORT.forEach(function(sec){
      var dados = sec.coletor ? sec.coletor() : dashColetarTabela(sec.tbId);
      if(!dados.rows.length) return;
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(sec.titulo, 14, y);
      try{
        doc.autoTable({ head:[dados.headers], body:dados.rows, startY:y+3, styles:{fontSize:8}, margin:{top:y+3} });
        y = doc.lastAutoTable.finalY + 12;
      }catch(e){}
      if(y > 260){ doc.addPage(); y = 16; }
    });
    doc.save('dashboard-rh-'+new Date().toISOString().split('T')[0]+'.pdf');
  }catch(e){
    alert('Erro ao exportar PDF: ' + e.message);
  }
};

window.dashExportarExcel = function(){
  try{
    if(typeof XLSX === 'undefined'){ alert('Biblioteca XLSX não carregada.'); return; }
    var wb = XLSX.utils.book_new();
    var algumaPlanilha = false;
    DASH_SECOES_EXPORT.forEach(function(sec){
      var dados = sec.coletor ? sec.coletor() : dashColetarTabela(sec.tbId);
      if(!dados.rows.length) return;
      algumaPlanilha = true;
      var aoa = [dados.headers].concat(dados.rows);
      var ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = dados.headers.map(function(){ return {wch:18}; });
      XLSX.utils.book_append_sheet(wb, ws, sec.titulo.substring(0,28));
    });
    if(!algumaPlanilha){ alert('Sem dados para exportar ainda.'); return; }
    XLSX.writeFile(wb, 'dashboard-rh-'+new Date().toISOString().split('T')[0]+'.xlsx');
  }catch(e){
    alert('Erro ao exportar Excel: ' + e.message);
  }
};

// Observa quando a tela do Dashboard fica visível e carrega tudo nesse
// momento — mais confiável do que tentar interceptar sbNav/switchView,
// já que vários outros scripts sobrescrevem essas funções por cima.
var dashEstavaVisivel = false;
function dashChecarVisibilidade(){
  var v = document.getElementById('view-dashboard');
  var visivel = !!v && window.getComputedStyle(v).display !== 'none';
  if(visivel && !dashEstavaVisivel) dashCarregarTudo();
  dashEstavaVisivel = visivel;
}
// REMOVED: Performance optimization - 500ms setInterval polling
// setInterval(dashChecarVisibilidade, 500);
setTimeout(dashChecarVisibilidade, 300);
})();
