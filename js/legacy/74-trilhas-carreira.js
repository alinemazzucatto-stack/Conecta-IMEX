// ===== script: trilhas-carreira-js =====
(function(){
'use strict';

// ── Dados das trilhas por setor ──
var TRILHAS_DADOS = {
  'RH':         ['Assistente de RH','Analista RH Jr','Analista RH Pleno','Analista RH Sênior','Business Partner','Coordenador RH','Gerente de RH'],
  'TI':         ['Estagiário TI','Analista Jr','Analista Pleno','Analista Sênior','Tech Lead','Coordenador TI','Gerente de TI'],
  'Comercial':  ['SDR','Executivo Jr','Executivo Pleno','Executivo Sênior','Coordenador Comercial','Gerente Comercial'],
  'Financeiro': ['Assistente Financeiro','Analista Financeiro Jr','Analista Financeiro Pleno','Controller Jr','Controller Pleno','Gerente Financeiro'],
  'Suporte':    ['Analista Suporte N1','Analista Suporte N2','Analista Suporte N3','Coordenador Suporte','Gerente Operações'],
};

var COMPETENCIAS_TRILHA = {
  'RH':         ['Comunicação Assertiva','Gestão de Pessoas','Liderança Situacional','Negociação','Legislação Trabalhista','HRBP','Gestão de Projetos'],
  'TI':         ['Lógica de Programação','Arquitetura de Sistemas','DevOps','Liderança Técnica','Gestão de Times','Planejamento Estratégico','Cloud Computing'],
  'Comercial':  ['Técnicas de Vendas','CRM','Negociação Avançada','Gestão de Contas','Liderança Comercial','Estratégia de Mercado','Customer Success'],
  'Financeiro': ['Excel Avançado','Contabilidade','Controladoria','Planejamento Financeiro','Gestão de Riscos','Compliance','Power BI'],
  'Suporte':    ['ITIL','Atendimento N1','Escalação N2','Gestão de SLA','Liderança de Suporte','Gestão de Operações','Documentação Técnica'],
};

var CURSOS_TRILHA = {
  'RH':         [['Liderança e Influência','Coursera · 20h'],['Gestão de Conflitos','LinkedIn Learning · 8h'],['OKRs e Metas','Alura · 12h'],['HRBP na Prática','Udemy · 15h']],
  'TI':         [['Clean Code','Udemy · 10h'],['AWS Certified','Amazon · 40h'],['Docker e Kubernetes','Alura · 20h'],['System Design','Coursera · 25h']],
  'Comercial':  [['Spin Selling','Udemy · 8h'],['Sales Ops','LinkedIn · 12h'],['Negociação Harvard','Coursera · 15h'],['Growth Hacking','Alura · 10h']],
  'Financeiro': [['Excel Power BI','Alura · 20h'],['Análise Financeira','Coursera · 18h'],['FP&A','CFI · 30h'],['Valuation','Udemy · 12h']],
  'Suporte':    [['ITIL 4 Foundation','PeopleCert · 20h'],['Gestão de Incidentes','Alura · 10h'],['Atendimento ao Cliente','Udemy · 8h'],['Liderança em TI','LinkedIn · 12h']],
};

// Estado atual da trilha
var _trilhaSetor = 'RH';
var _trilhaCargo = '';

// ── Helpers ──
function _getEmail(){ try{ return emailUsuario ? emailUsuario() : ''; }catch(e){ return ''; } }
function _getDB(){ try{ return (typeof db !== 'undefined') ? db : null; }catch(e){ return null; } }
function _getUserData(){ try{ return window.currentUserData || null; }catch(e){ return null; } }

function _detectarSetor(setor, cargo){
  var s = (setor||'').toLowerCase();
  var c = (cargo||'').toLowerCase();
  for(var k in TRILHAS_DADOS){
    var kl = k.toLowerCase();
    if(s.includes(kl) || c.includes(kl.substring(0,3))) return k;
  }
  return 'RH';
}

// ── Renderiza a escada de cargos ──
function _renderTrilha(el, cargoAtual, setorAtual){
  var trilha = TRILHAS_DADOS[setorAtual] || TRILHAS_DADOS['RH'];
  var idxAtual = trilha.findIndex(function(c){ return c.toLowerCase()===cargoAtual.toLowerCase(); });
  var idx = idxAtual >= 0 ? idxAtual : 1;

  // Atualiza info cards e progress
  var elCa = document.getElementById('trilha-cargo-atual');
  var elCp = document.getElementById('trilha-cargo-proximo');
  var elPb = document.getElementById('trilha-progress-bar');
  var elPct = document.getElementById('trilha-progress-pct');
  var elNivel = document.getElementById('trilha-stat-nivel');

  if(elCa) elCa.textContent = trilha[idx] || cargoAtual;
  if(elCp) elCp.textContent = trilha[idx+1] || 'Último nível ✓';
  var pct = Math.round((idx / Math.max(trilha.length-1,1)) * 100);
  if(elPb) elPb.style.width = pct + '%';
  if(elPct) elPct.textContent = pct + '% concluído';
  if(elNivel) elNivel.textContent = (idx+1) + '/' + trilha.length;

  // Sincroniza select
  var sel = document.getElementById('trilha-setor-select');
  if(sel) sel.value = setorAtual;

  // Escada de cargos
  var html = '';
  trilha.forEach(function(cargo, i){
    var isAtual   = i === idx;
    var isProximo = i === idx + 1;
    var isPast    = i < idx;

    var bg, cor, borda, icone;
    if      (isPast)    { bg='#f0fdf4'; cor='#065f46'; borda='#22C58B'; icone='✅'; }
    else if (isAtual)   { bg='#dbeafe'; cor='#0047FF'; borda='#0047FF'; icone='📍'; }
    else if (isProximo) { bg='#f9f5ff'; cor='#9613f7'; borda='#9613f7'; icone='🎯'; }
    else                { bg='#f8fafc'; cor='#94a3b8'; borda='#e2e8f0'; icone='○'; }

    html += '<div style="display:flex;align-items:stretch;gap:0">';
    // Linha vertical
    html += '<div style="display:flex;flex-direction:column;align-items:center;width:32px;flex-shrink:0">';
    if(i > 0) html += '<div style="width:2px;height:14px;background:'+(isPast?'#22C58B':borda)+';margin:0 auto"></div>';
    else      html += '<div style="height:14px"></div>';
    html += '<div style="width:10px;height:10px;border-radius:50%;background:'+borda+';flex-shrink:0;margin:0 auto"></div>';
    html += '<div style="width:2px;flex:1;background:'+(i<idx?'#22C58B':i===idx&&i<trilha.length-1?'#0047FF':'#e2e8f0')+';margin:0 auto'+(i===trilha.length-1?';visibility:hidden':'')+'""></div>';
    html += '</div>';
    // Card do cargo
    html += '<div style="flex:1;background:'+bg+';border:1.5px solid '+borda+';border-radius:12px;padding:12px 16px;margin:4px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">';
    html += '<div style="display:flex;align-items:center;gap:10px">';
    html += '<span style="font-size:16px">'+icone+'</span>';
    html += '<div>';
    html += '<div style="font-weight:'+(isAtual?'900':'600')+';font-size:14px;color:'+cor+'">'+cargo+'</div>';
    if(isAtual)   html += '<div style="font-size:11px;color:#64748b;margin-top:1px">📍 Cargo atual</div>';
    if(isProximo) html += '<div style="font-size:11px;color:#9613f7;margin-top:1px">🎯 Próximo nível</div>';
    if(isPast)    html += '<div style="font-size:11px;color:#065f46;margin-top:1px">✓ Concluído</div>';
    html += '</div></div>';
    if(isAtual || isProximo){
      html += '<span style="font-size:11px;font-weight:700;color:'+cor+';background:'+bg+';border:1px solid '+borda+';border-radius:8px;padding:4px 10px">'+(isAtual?'Você está aqui':'Próximo passo')+'</span>';
    }
    html += '</div></div>';
  });
  el.innerHTML = html;
}

// ── Renderiza competências ──
function _renderCompetencias(setorAtual){
  var el = document.getElementById('trilha-competencias');
  if(!el) return;
  var lista = COMPETENCIAS_TRILHA[setorAtual] || COMPETENCIAS_TRILHA['RH'];
  var cores = ['#22C58B','#22C58B','#F4B740','#F4B740','#94a3b8','#94a3b8','#94a3b8'];
  var ics   = ['✔','✔','⏳','⏳','○','○','○'];
  var bgs   = ['#f0fdf4','#f0fdf4','#fffbeb','#fffbeb','#f8fafc','#f8fafc','#f8fafc'];
  var bds   = ['#bbf7d0','#bbf7d0','#fde68a','#fde68a','#e2e8f0','#e2e8f0','#e2e8f0'];
  var status= ['Concluída','Concluída','Em desenvolvimento','Em desenvolvimento','Pendente','Pendente','Pendente'];
  el.innerHTML = lista.map(function(c,i){
    return '<div style="display:flex;align-items:center;gap:12px;background:'+bgs[i]+';border:1px solid '+bds[i]+';border-radius:12px;padding:11px 14px">'+
      '<span style="font-size:18px;flex-shrink:0">'+ics[i]+'</span>'+
      '<div style="flex:1"><div style="font-weight:700;font-size:13px;color:#0f172a">'+c+'</div>'+
      '<div style="font-size:11px;color:#64748b;margin-top:2px">'+status[i]+'</div></div></div>';
  }).join('');
  var elStat = document.getElementById('trilha-stat-comp');
  if(elStat) elStat.textContent = lista.length;
}

// ── Renderiza cursos ──
function _renderCursos(setorAtual){
  var el = document.getElementById('trilha-cursos');
  if(!el) return;
  var lista = CURSOS_TRILHA[setorAtual] || CURSOS_TRILHA['RH'];
  var cores = ['#9613f7','#0047FF','#22C58B','#F4B740'];
  var bgs   = ['#f9f5ff','#dbeafe','#f0fdf4','#fef3c7'];
  el.innerHTML = lista.map(function(item,i){
    return '<div style="background:'+bgs[i%4]+';border-radius:12px;padding:14px;border-left:4px solid '+cores[i%4]+'">'+
      '<div style="font-weight:900;font-size:13px;color:'+cores[i%4]+'">'+item[0]+'</div>'+
      '<div style="font-size:12px;color:#64748b;margin-top:4px">'+item[1]+'</div></div>';
  }).join('');
  var elStat = document.getElementById('trilha-stat-cursos');
  if(elStat) elStat.textContent = lista.length;
}

// ── Renderiza requisitos ──
function _renderRequisitos(cargoAtual, setorAtual){
  var el = document.getElementById('trilha-requisitos');
  if(!el) return;
  var trilha = TRILHAS_DADOS[setorAtual] || TRILHAS_DADOS['RH'];
  var idx = trilha.findIndex(function(c){ return c.toLowerCase()===cargoAtual.toLowerCase(); });
  var proximo = idx >= 0 && trilha[idx+1] ? trilha[idx+1] : 'Último nível da trilha';

  var reqs = [
    ['🎯','Próximo cargo',proximo,'Objetivo de evolução imediato'],
    ['⏱','Tempo mínimo no cargo','12 meses','Atuação consistente no nível atual'],
    ['📊','Avaliação de desempenho','≥ 80%','Resultado mínimo recomendado'],
    ['🎓','Cursos obrigatórios','Mín. 2 concluídos','Indicados pelo RH e gestor'],
    ['✅','Aprovação do gestor','Necessária','Feedback formal das entregas'],
  ];
  el.innerHTML = reqs.map(function(r){
    return '<div style="border:1px solid #e2e8f0;border-radius:12px;padding:13px 16px;background:#fff;display:flex;gap:12px;align-items:flex-start">'+
      '<span style="font-size:18px;flex-shrink:0">'+r[0]+'</span>'+
      '<div><div style="font-weight:700;font-size:13px;color:#0f172a">'+r[1]+': <span style="color:#9613f7">'+r[2]+'</span></div>'+
      '<div style="font-size:12px;color:#64748b;margin-top:2px">'+r[3]+'</div></div></div>';
  }).join('');
}

// ── Função principal ──
window.trilhasCarregar = function(){
  var el = document.getElementById('trilha-lista');
  if(!el) return;

  var cargoDefault = 'Analista RH Jr';
  var setorDefault = 'RH';

  // Tenta pegar dados do usuário logado já em memória
  var ud = _getUserData();
  if(ud && (ud.funcao || ud.cargo)){
    cargoDefault = ud.funcao || ud.cargo || cargoDefault;
    setorDefault = _detectarSetor(ud.setor || '', cargoDefault);
  }

  function renderTudo(cargo, setor){
    _trilhaCargo = cargo;
    _trilhaSetor = setor;
    _renderTrilha(el, cargo, setor);
    _renderCompetencias(setor);
    _renderCursos(setor);
    _renderRequisitos(cargo, setor);
  }

  // Tenta buscar do Firestore (não bloqueia se falhar)
  var db2 = _getDB();
  var email = _getEmail();
  if(db2 && email){
    try{
      db2.collection(col ? col('grh_colabs') : 'grh_colabs')
        .where('email','==',email).limit(1).get()
        .then(function(snap){
          if(!snap.empty){
            var d = snap.docs[0].data();
            var cargo = d.funcao || d.cargo || cargoDefault;
            var setor = _detectarSetor(d.setor||'', cargo);
            renderTudo(cargo, setor);
          } else {
            renderTudo(cargoDefault, setorDefault);
          }
        }).catch(function(){ renderTudo(cargoDefault, setorDefault); });
    } catch(e){ renderTudo(cargoDefault, setorDefault); }
  } else {
    renderTudo(cargoDefault, setorDefault);
  }
};

// ── Mudar setor manualmente ──
window.trilhaMudarSetor = function(setor){
  if(!TRILHAS_DADOS[setor]) return;
  _trilhaSetor = setor;
  var trilha = TRILHAS_DADOS[setor];
  // Mantém o cargo mais próximo que exista na nova trilha, ou o primeiro
  var cargo = trilha[1] || trilha[0];
  _trilhaCargo = cargo;
  var el = document.getElementById('trilha-lista');
  if(!el) return;
  _renderTrilha(el, cargo, setor);
  _renderCompetencias(setor);
  _renderCursos(setor);
  _renderRequisitos(cargo, setor);
};

// ── Hook no switchView ──
(function(){
  var oldSwitch = window.switchView;
  if(typeof oldSwitch === 'function' && !window.__trilhasHook){
    window.__trilhasHook = true;
    window.switchView = function(v){
      var r = oldSwitch.apply(this, arguments);
      if(v === 'trilhas') setTimeout(window.trilhasCarregar, 80);
      return r;
    };
  }
  // Também dispara ao abrir diretamente
  document.addEventListener('DOMContentLoaded', function(){
    var v = document.getElementById('view-trilhas');
    if(v && v.style.display !== 'none') window.trilhasCarregar();
  });
})();

})();
