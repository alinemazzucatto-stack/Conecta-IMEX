// Gestão RH - Folha de Pagamento: importacao, validacao e conferencia por competencia.
(function(){
  'use strict';
  if(window.__GRH_FOLHA_PAGAMENTO_V34__) return;
  window.__GRH_FOLHA_PAGAMENTO_V34__=true;

  var state={rows:[],history:[],fileName:'',loading:false,importing:false,loaded:false,source:'empty'};
  var currentView='overview';

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function norm(v){
    return String(v==null?'':v).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }
  function key(v){return norm(v).replace(/\s+/g,'');}
  function money(v){return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function num(v){
    if(typeof v==='number') return isFinite(v)?v:0;
    var s=String(v==null?'':v).trim().replace(/[R$\s]/gi,'');
    if(!s) return 0;
    if(s.indexOf(',')>=0) s=s.replace(/\./g,'').replace(',','.');
    else if((s.match(/\./g)||[]).length>1) s=s.replace(/\./g,'');
    var n=parseFloat(s.replace(/[^\d.-]/g,''));
    return isFinite(n)?n:0;
  }
  function monthNow(){
    var d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  }
  function validMonth(v){
    var s=String(v||'').trim();
    var m=s.match(/^(\d{4})[-/](\d{1,2})/);
    if(m) return m[1]+'-'+String(Math.min(12,Math.max(1,Number(m[2])))).padStart(2,'0');
    if(v instanceof Date&&!isNaN(v)) return v.getFullYear()+'-'+String(v.getMonth()+1).padStart(2,'0');
    return '';
  }
  function pane(){return document.getElementById('grh-pane-remuneracao');}
  function wrap(){var p=pane();return p&&p.querySelector('.rem-premium-wrap');}
  function fieldAliases(){
    return {
      matricula:['matricula','registro','chapa','codigo'],
      nome:['nome','colaborador','funcionario','empregado'],
      cpf:['cpf','documento'],
      competencia:['competencia','mes','mes referencia','referencia'],
      salario:['salario base','salario','base salarial'],
      proventos:['total proventos','proventos','total vencimentos','vencimentos','bruto','salario bruto'],
      descontos:['total descontos','descontos','desconto total'],
      liquido:['salario liquido','liquido','valor liquido','total liquido'],
      inss:['inss','desconto inss'],
      irrf:['irrf','desconto irrf'],
      fgts:['fgts','fgts mes'],
      beneficios:['beneficios','total beneficios'],
      outros:['outros','outros custos','adicionais']
    };
  }
  function findColumn(headers,aliases){
    var normalized=headers.map(norm);
    for(var i=0;i<aliases.length;i++){
      var exact=normalized.indexOf(norm(aliases[i]));
      if(exact>=0) return exact;
    }
    for(var j=0;j<aliases.length;j++){
      var wanted=norm(aliases[j]);
      var partial=normalized.findIndex(function(h){return h.indexOf(wanted)>=0;});
      if(partial>=0) return partial;
    }
    return -1;
  }
  function payrollHTML(){
    return '<section id="rem-payroll-view" class="rem-payroll-view" style="display:none">'+
      '<div class="rem-payroll-hero"><div><small>REMUNERAÇÃO</small><h2>Folha de Pagamento</h2><p>Importe, valide e gerencie as folhas recebidas da contabilidade.</p></div>'+
      '<div class="rem-payroll-actions"><button type="button" class="btn btn-g" onclick="remFolhaBaixarModelo()">⬇️ Baixar modelo</button><button type="button" class="btn btn-p" onclick="remFolhaSelecionarArquivo()">＋ Importar nova folha</button></div></div>'+
      '<input id="rem-folha-file" type="file" accept=".xlsx,.xls" style="display:none" onchange="remFolhaLerArquivo(this.files&&this.files[0])">'+
      '<div class="rem-payroll-workspace"><section class="rem-payroll-guide"><div class="rem-payroll-section-title"><h3>Como funciona a importação</h3><p>Três passos para conferir a folha antes da gravação.</p></div>'+
      '<div class="rem-payroll-steps"><article><span>1</span><div><strong>Importar arquivo</strong><p>Envie a planilha gerada pela contabilidade.</p></div></article><article><span>2</span><div><strong>Validar dados</strong><p>O sistema confere valores e colaboradores.</p></div></article><article><span>3</span><div><strong>Confirmar</strong><p>Revise a prévia e conclua a importação.</p></div></article></div>'+
      '<div id="rem-folha-drop" class="rem-payroll-drop" onclick="remFolhaSelecionarArquivo()"><span>☁️</span><div><strong>Importar folha de pagamento</strong><p>Arraste o arquivo para cá ou clique para selecionar.</p><small>XLSX ou XLS • baixe o modelo de importação</small></div></div></section>'+
      '<aside class="rem-payroll-side"><section><div class="rem-payroll-side-head"><h3>Resumo da última folha</h3><span id="rem-folha-last-comp">—</span></div><dl><div><dt>Data da importação</dt><dd id="rem-folha-last-date">—</dd></div><div><dt>Colaboradores</dt><dd id="rem-folha-last-count">0</dd></div><div><dt>Valor bruto total</dt><dd id="rem-folha-last-gross">R$ 0,00</dd></div><div><dt>Valor líquido total</dt><dd id="rem-folha-last-net">R$ 0,00</dd></div></dl><button type="button" class="btn btn-g btn-sm" onclick="remFolhaAbrirUltima()">Ver detalhes da folha →</button></section>'+
      '<section class="rem-payroll-tips"><h3>Dicas importantes</h3><p>✅ Use sempre o modelo de importação para garantir os campos corretos.</p><p>🛡️ Revise alertas e inconsistências antes de confirmar.</p><p>🕘 Folhas processadas ficam salvas no histórico.</p></section></aside></div>'+
      '<div class="rem-payroll-controls"><label><span>Competência da folha</span><input id="rem-folha-competencia" type="month" value="'+monthNow()+'" onchange="remFolhaLoadSaved(true)"></label><label class="rem-payroll-file-label"><span>Arquivo selecionado</span><strong id="rem-folha-file-name">Nenhum arquivo selecionado</strong></label></div>'+
      '<div id="rem-folha-message" class="rem-payroll-message" style="display:none"></div>'+
      '<div class="rem-payroll-kpis"><article><span>📄</span><div><small>Linhas</small><strong id="rem-folha-total">0</strong><p>na competência</p></div></article><article><span>✅</span><div><small>Prontas</small><strong id="rem-folha-ready">0</strong><p>vinculadas</p></div></article><article><span>⚠️</span><div><small>Atenção</small><strong id="rem-folha-warn">0</strong><p>precisam de revisão</p></div></article><article><span>💵</span><div><small>Total líquido</small><strong id="rem-folha-net">R$ 0,00</strong><p>valor consolidado</p></div></article></div>'+
      '<section class="rem-payroll-table-card"><div class="rem-payroll-table-head"><div><h3>Conferência da competência</h3><p id="rem-folha-count">Selecione uma planilha ou consulte a competência.</p></div><div><button id="rem-folha-refresh" type="button" class="btn btn-g btn-sm" onclick="remFolhaLoadSaved(true)">↻ Atualizar</button><button id="rem-folha-import" type="button" class="btn btn-p btn-sm" onclick="remFolhaImportar()" disabled>✅ Confirmar importação</button></div></div>'+
      '<div class="rem-payroll-table-scroll"><table><thead><tr><th>Colaborador</th><th>Matrícula</th><th>Competência</th><th>Salário base</th><th>Proventos</th><th>Descontos</th><th>Líquido</th><th>Situação</th></tr></thead><tbody id="rem-folha-body"><tr><td colspan="8" class="ess-table-message">Nenhum dado carregado.</td></tr></tbody></table></div></section>'+
      '<section class="rem-payroll-table-card rem-payroll-history"><div class="rem-payroll-table-head"><div><h3>Folhas importadas</h3><p>Histórico consolidado por competência.</p></div></div><div class="rem-payroll-table-scroll"><table><thead><tr><th>Competência</th><th>Data da importação</th><th>Colaboradores</th><th>Valor bruto</th><th>Valor líquido</th><th>Status</th><th>Ações</th></tr></thead><tbody id="rem-folha-history-body"><tr><td colspan="7" class="ess-table-message">Nenhuma folha importada.</td></tr></tbody></table></div></section>'+
      '</section>';
  }
  function ensure(){
    var w=wrap(); if(!w) return false;
    if(w.querySelector('.rem-inner-tabs')){
      applyCurrentView();
      return true;
    }
    var oldChildren=Array.prototype.slice.call(w.children);
    var nav=document.createElement('nav');
    nav.className='rem-inner-tabs';
    nav.setAttribute('aria-label','Seções de Remuneração');
    nav.innerHTML='<button type="button" class="active" data-rem-view="overview" onclick="remFolhaSwitch(\'overview\')">📊 Visão Geral</button>'+
      '<button type="button" data-rem-view="payroll" onclick="remFolhaSwitch(\'payroll\')">🧾 Folha de Pagamento</button>'+
      '<button type="button" data-rem-view="benefits" onclick="remFolhaSwitch(\'benefits\')">🎁 Benefícios</button>'+
      '<button type="button" data-rem-view="salary-bands" onclick="remFolhaSwitch(\'salary-bands\')">📐 Faixas Salariais</button>'+
      '<button type="button" data-rem-view="distribution" onclick="remFolhaSwitch(\'distribution\')">📊 Distribuição</button>'+
      '<button type="button" data-rem-view="budget" onclick="remFolhaSwitch(\'budget\')">💼 Orçamento</button>'+
      '<button type="button" data-rem-view="settings" onclick="remFolhaSwitch(\'settings\')">⚙️ Configurações</button>';
    var overview=document.createElement('div');
    overview.id='rem-overview-view';
    overview.className='rem-overview-view';
    oldChildren.forEach(function(child){overview.appendChild(child);});
    w.appendChild(nav);
    w.appendChild(overview);
    w.insertAdjacentHTML('beforeend',payrollHTML());
    bindDrop();
    renderRows();
    renderHistory();
    applyCurrentView();
    return true;
  }
  function applyCurrentView(){
    var w=wrap(); if(!w) return;
    var overview=w.querySelector('#rem-overview-view');
    var payroll=w.querySelector('#rem-payroll-view');
    var benefits=w.querySelector('#rem-benefits-view');
    var salaryBands=w.querySelector('#rem-salary-bands-view');
    var budget=w.querySelector('#rem-budget-view');
    var distribution=w.querySelector('#rem-distribution-view');
    var settings=w.querySelector('#rem-settings-view');
    if(overview) overview.style.display=currentView==='overview'?'grid':'none';
    if(payroll) payroll.style.display=currentView==='payroll'?'grid':'none';
    if(benefits) benefits.style.display=currentView==='benefits'?'grid':'none';
    if(salaryBands) salaryBands.style.display=currentView==='salary-bands'?'grid':'none';
    if(budget) budget.style.display=currentView==='budget'?'grid':'none';
    if(distribution) distribution.style.display=currentView==='distribution'?'grid':'none';
    if(settings) settings.style.display=currentView==='settings'?'grid':'none';
    w.querySelectorAll('.rem-inner-tabs button').forEach(function(btn){
      btn.classList.toggle('active',btn.getAttribute('data-rem-view')===currentView);
    });
  }
  function bindDrop(){
    var drop=document.getElementById('rem-folha-drop');
    if(!drop||drop.dataset.bound==='true') return;
    drop.dataset.bound='true';
    ['dragenter','dragover'].forEach(function(evt){
      drop.addEventListener(evt,function(e){e.preventDefault();drop.classList.add('drag');});
    });
    ['dragleave','drop'].forEach(function(evt){
      drop.addEventListener(evt,function(e){e.preventDefault();drop.classList.remove('drag');});
    });
    drop.addEventListener('drop',function(e){
      var file=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
      if(file) window.remFolhaLerArquivo(file);
    });
  }
  function message(text,type){
    var el=document.getElementById('rem-folha-message'); if(!el) return;
    el.style.display=text?'block':'none';
    el.className='rem-payroll-message '+(type||'info');
    el.textContent=text||'';
  }
  function updateSummary(){
    var rows=state.rows||[];
    var ready=rows.filter(function(r){return r.status==='ready'||r.status==='imported';}).length;
    var warn=rows.filter(function(r){return r.status==='warn';}).length;
    var net=rows.reduce(function(sum,r){return sum+(Number(r.liquido)||0);},0);
    var set=function(id,value){var el=document.getElementById(id);if(el)el.textContent=value;};
    set('rem-folha-total',rows.length);
    set('rem-folha-ready',ready);
    set('rem-folha-warn',warn);
    set('rem-folha-net',money(net));
    var count=document.getElementById('rem-folha-count');
    if(count) count.textContent=rows.length+(rows.length===1?' lançamento':' lançamentos')+(state.fileName?' em '+state.fileName:' na competência');
    var file=document.getElementById('rem-folha-file-name');
    if(file) file.textContent=state.fileName||'Consulta da competência';
    var button=document.getElementById('rem-folha-import');
    if(button){
      var valid=rows.filter(function(r){return r.status!=='error';}).length;
      button.disabled=state.source!=='file'||!valid||state.importing;
      button.textContent=state.importing?'⏳ Importando…':'✅ Confirmar importação';
    }
  }
  function renderRows(){
    var body=document.getElementById('rem-folha-body'); if(!body) return;
    if(!state.rows.length){
      body.innerHTML='<tr><td colspan="8" class="ess-table-message">Nenhum lançamento encontrado para esta competência.</td></tr>';
      updateSummary();
      return;
    }
    body.innerHTML=state.rows.map(function(r){
      var status=r.status==='error'?'<span class="rem-payroll-status error">Erro</span>':r.status==='warn'?'<span class="rem-payroll-status warn">Revisar vínculo</span>':r.status==='imported'?'<span class="rem-payroll-status imported">Importado</span>':'<span class="rem-payroll-status ready">Pronto</span>';
      return '<tr class="'+(r.status==='error'?'has-error':'')+'"><td><strong>'+esc(r.nome||'Não informado')+'</strong><small>'+esc(r.cpf||r.email||'')+'</small></td>'+
        '<td>'+esc(r.matricula||'—')+'</td><td>'+esc(r.competencia||'—')+'</td><td>'+money(r.salario)+'</td><td>'+money(r.proventos)+'</td><td>'+money(r.descontos)+'</td><td><strong>'+money(r.liquido)+'</strong></td><td>'+status+(r.issue?'<small>'+esc(r.issue)+'</small>':'')+'</td></tr>';
    }).join('');
    updateSummary();
  }
  function compLabel(comp){
    var parts=String(comp||'').split('-');
    if(parts.length!==2) return comp||'—';
    var names=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return (names[Math.max(0,Number(parts[1])-1)]||parts[1])+'/'+parts[0];
  }
  function buildHistory(all){
    var groups={};
    (all||[]).filter(function(r){return r.origem==='importacao_folha'&&r.competencia;}).forEach(function(r){
      var comp=String(r.competencia).slice(0,7);
      if(!groups[comp]) groups[comp]={competencia:comp,date:'',count:0,gross:0,net:0,ids:{}};
      var g=groups[comp],identity=r.colabId||r.matricula||r.cpf||r.nome||String(g.count);
      if(!g.ids[identity]){g.ids[identity]=true;g.count++;}
      g.gross+=num(r.proventos)||num(r.salario);
      g.net+=num(r.liquido);
      var date=r.importadoEm||r.atualizadoEm||'';
      if(date>g.date) g.date=date;
    });
    return Object.keys(groups).sort().reverse().map(function(k){return groups[k];});
  }
  function dateLabel(value){
    if(!value) return '—';
    var d=new Date(value);
    return isNaN(d)?'—':d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
  }
  function updateLastSummary(){
    var last=state.history[0]||null;
    var set=function(id,value){var el=document.getElementById(id);if(el)el.textContent=value;};
    set('rem-folha-last-comp',last?compLabel(last.competencia):'—');
    set('rem-folha-last-date',last?dateLabel(last.date):'—');
    set('rem-folha-last-count',last?last.count:0);
    set('rem-folha-last-gross',last?money(last.gross):money(0));
    set('rem-folha-last-net',last?money(last.net):money(0));
  }
  function renderHistory(){
    var body=document.getElementById('rem-folha-history-body');
    updateLastSummary();
    if(!body) return;
    if(!state.history.length){
      body.innerHTML='<tr><td colspan="7" class="ess-table-message">Nenhuma folha importada.</td></tr>';
      return;
    }
    body.innerHTML=state.history.map(function(h){
      return '<tr><td><strong>📄 '+esc(compLabel(h.competencia))+'</strong></td><td>'+esc(dateLabel(h.date))+'</td><td>'+h.count+'</td><td>'+money(h.gross)+'</td><td><strong>'+money(h.net)+'</strong></td><td><span class="rem-payroll-status ready">Processada</span></td><td><button type="button" class="btn btn-g btn-sm" onclick="remFolhaAbrirCompetencia(\''+esc(h.competencia)+'\')">👁 Ver detalhes</button></td></tr>';
    }).join('');
  }
  window.remFolhaAbrirCompetencia=function(comp){
    var input=document.getElementById('rem-folha-competencia');
    if(input) input.value=comp;
    window.remFolhaLoadSaved(true);
    var card=document.querySelector('.rem-payroll-table-card');
    if(card) card.scrollIntoView({behavior:'smooth',block:'start'});
  };
  window.remFolhaAbrirUltima=function(){
    if(state.history.length) window.remFolhaAbrirCompetencia(state.history[0].competencia);
  };
  async function matchRows(rows){
    var colabs=[];
    try{colabs=typeof window.grhGetColabs==='function'?await window.grhGetColabs(true):[];}catch(e){}
    colabs=Array.isArray(colabs)?colabs:[];
    var byMat={},byCpf={},byName={};
    colabs.forEach(function(c){
      if(c.matricula) byMat[key(c.matricula)]=c;
      if(c.cpf) byCpf[key(c.cpf)]=c;
      if(c.nome) byName[norm(c.nome)]=c;
    });
    rows.forEach(function(r){
      var c=(r.matricula&&byMat[key(r.matricula)])||(r.cpf&&byCpf[key(r.cpf)])||(r.nome&&byName[norm(r.nome)]);
      if(c){
        r.colabId=c._id||c.id||null;
        r.nome=r.nome||c.nome||'';
        r.matricula=r.matricula||c.matricula||'';
        r.email=c.email||'';
      }
      if(!r.nome&&!r.matricula&&!r.cpf){r.status='error';r.issue='Identificação ausente';}
      else if(!r.competencia){r.status='error';r.issue='Competência inválida';}
      else if(r.proventos<=0&&r.salario<=0){r.status='error';r.issue='Valores da folha ausentes';}
      else if(!c){r.status='warn';r.issue='Colaborador não localizado';}
      else{r.status='ready';r.issue='';}
    });
    return rows;
  }
  async function parseSheet(matrix){
    if(!Array.isArray(matrix)||matrix.length<2) throw new Error('A planilha não possui linhas suficientes.');
    var headerIndex=matrix.findIndex(function(row){return Array.isArray(row)&&row.filter(function(v){return String(v||'').trim();}).length>=3;});
    if(headerIndex<0) throw new Error('Não foi possível localizar o cabeçalho.');
    var headers=matrix[headerIndex].map(function(v){return String(v||'');});
    var aliases=fieldAliases(),idx={};
    Object.keys(aliases).forEach(function(name){idx[name]=findColumn(headers,aliases[name]);});
    if(idx.nome<0&&idx.matricula<0&&idx.cpf<0) throw new Error('Inclua uma coluna de Nome, Matrícula ou CPF.');
    var defaultMonth=(document.getElementById('rem-folha-competencia')||{}).value||monthNow();
    var rows=matrix.slice(headerIndex+1).filter(function(row){return Array.isArray(row)&&row.some(function(v){return String(v||'').trim();});}).map(function(row,line){
      var get=function(name){return idx[name]>=0?row[idx[name]]:'';};
      var salario=num(get('salario')),proventos=num(get('proventos'))||salario,descontos=num(get('descontos')),liquido=num(get('liquido'));
      return {line:line+headerIndex+2,matricula:String(get('matricula')||'').trim(),nome:String(get('nome')||'').trim(),cpf:String(get('cpf')||'').replace(/\D/g,''),competencia:validMonth(get('competencia'))||validMonth(defaultMonth),salario:salario,proventos:proventos,descontos:descontos,liquido:liquido||(proventos-descontos),inss:num(get('inss')),irrf:num(get('irrf')),fgts:num(get('fgts')),beneficios:num(get('beneficios')),outros:num(get('outros')),status:'ready',issue:''};
    });
    return matchRows(rows);
  }
  function safeId(v){
    var value=key(v)||String(Date.now());
    return value.replace(/[^a-z0-9_-]/g,'').slice(0,80);
  }
  function dbCollection(){
    return typeof window.col==='function'?window.col('grh_rem'):(typeof col==='function'?col('grh_rem'):'grh_rem');
  }
  async function saveRows(rows){
    var collection=db.collection(dbCollection());
    for(var start=0;start<rows.length;start+=400){
      var batch=db.batch();
      rows.slice(start,start+400).forEach(function(r){
        var docId='folha_'+r.competencia.replace('-','')+'_'+safeId(r.matricula||r.cpf||r.nome);
        var ref=collection.doc(docId);
        batch.set(ref,{nome:r.nome||'',matricula:r.matricula||'',cpf:r.cpf||'',colabId:r.colabId||null,competencia:r.competencia,salario:r.salario||0,proventos:r.proventos||0,descontos:r.descontos||0,liquido:r.liquido||0,inss:r.inss||0,irrf:r.irrf||0,fgts:r.fgts||0,beneficios:r.beneficios||0,outros:r.outros||0,custoTotal:(r.proventos||0)+(r.fgts||0)+(r.beneficios||0)+(r.outros||0),origem:'importacao_folha',arquivoOrigem:state.fileName||'',importadoEm:new Date().toISOString(),atualizadoEm:new Date().toISOString()},{merge:true});
      });
      await batch.commit();
    }
  }
  window.remFolhaSwitch=function(view){
    currentView=view==='payroll'||view==='benefits'||view==='salary-bands'||view==='budget'||view==='distribution'||view==='settings'?view:'overview';
    ensure();
    if(currentView==='benefits'&&typeof window.remBeneficiosEnsure==='function') window.remBeneficiosEnsure();
    if(currentView==='salary-bands'&&typeof window.remFaixasEnsure==='function') window.remFaixasEnsure();
    if(currentView==='budget'&&typeof window.remOrcamentoEnsure==='function') window.remOrcamentoEnsure();
    if(currentView==='distribution'&&typeof window.remDistribuicaoEnsure==='function') window.remDistribuicaoEnsure();
    if(currentView==='settings'&&typeof window.remConfigEnsure==='function') window.remConfigEnsure();
    applyCurrentView();
    if(currentView==='payroll'&&!state.rows.length) window.remFolhaLoadSaved(false);
    if(currentView==='benefits'&&typeof window.remBeneficiosLoad==='function') window.remBeneficiosLoad(false);
    if(currentView==='salary-bands'&&typeof window.remFaixasLoad==='function') window.remFaixasLoad(false);
    if(currentView==='budget'&&typeof window.remOrcamentoLoad==='function') window.remOrcamentoLoad(false);
    if(currentView==='distribution'&&typeof window.remDistribuicaoLoad==='function') window.remDistribuicaoLoad(false);
    if(currentView==='settings'&&typeof window.remConfigLoad==='function') window.remConfigLoad(false);
  };
  window.remFolhaSelecionarArquivo=function(){
    var input=document.getElementById('rem-folha-file'); if(input) input.click();
  };
  window.remFolhaLerArquivo=function(file){
    if(!file) return;
    if(!/\.xlsx?$/i.test(file.name)){message('Selecione um arquivo XLSX ou XLS válido.','error');return;}
    if(!window.XLSX){message('A biblioteca de Excel ainda não foi carregada. Atualize a página e tente novamente.','error');return;}
    state.fileName=file.name;state.loading=true;state.source='file';message('Lendo e validando a planilha…','info');updateSummary();
    var reader=new FileReader();
    reader.onload=async function(e){
      try{
        var workbook=XLSX.read(e.target.result,{type:'array',cellDates:true});
        var sheet=workbook.Sheets[workbook.SheetNames[0]];
        var matrix=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true});
        state.rows=await parseSheet(matrix);
        state.loaded=true;
        message(state.rows.length+' linhas lidas. Revise as pendências antes de importar.','success');
        renderRows();
      }catch(error){state.rows=[];message('Não foi possível ler a folha: '+(error.message||error),'error');renderRows();}
      state.loading=false;
    };
    reader.onerror=function(){state.loading=false;message('Falha ao ler o arquivo selecionado.','error');};
    reader.readAsArrayBuffer(file);
  };
  window.remFolhaLoadSaved=async function(force){
    if(state.loading||state.importing) return;
    if(state.source==='file'&&!force) return;
    state.loading=true;state.source='saved';message('Consultando a folha importada…','info');
    try{
      var comp=(document.getElementById('rem-folha-competencia')||{}).value||monthNow();
      var all=typeof window.grhGetRem==='function'?await window.grhGetRem(Boolean(force)):[];
      all=Array.isArray(all)?all:[];
      state.history=buildHistory(all);
      renderHistory();
      state.rows=all.filter(function(r){return r.origem==='importacao_folha'&&String(r.competencia||'').slice(0,7)===comp;}).map(function(r){
        return {matricula:r.matricula||'',nome:r.nome||'',cpf:r.cpf||'',email:r.email||'',colabId:r.colabId||null,competencia:String(r.competencia||'').slice(0,7),salario:num(r.salario),proventos:num(r.proventos)||num(r.salario),descontos:num(r.descontos),liquido:num(r.liquido),inss:num(r.inss),irrf:num(r.irrf),fgts:num(r.fgts),beneficios:num(r.beneficios),outros:num(r.outros),status:'imported',issue:''};
      });
      state.loaded=true;state.fileName='';
      message(state.rows.length?'Folha importada carregada para conferência.':'Nenhuma folha importada nesta competência.',state.rows.length?'success':'info');
      renderRows();
    }catch(error){message('Erro ao consultar a folha: '+(error.message||error),'error');}
    state.loading=false;
  };
  window.remFolhaImportar=async function(){
    if(state.importing||state.source!=='file') return;
    var valid=state.rows.filter(function(r){return r.status!=='error';});
    if(!valid.length){message('Não há linhas válidas para importar.','error');return;}
    var errors=state.rows.length-valid.length;
    var text='Importar '+valid.length+' lançamentos da folha'+(errors?' e ignorar '+errors+' linhas com erro?':'?');
    if(!window.confirm(text)) return;
    state.importing=true;updateSummary();message('Importando a folha de pagamento…','info');
    try{
      await saveRows(valid);
      valid.forEach(function(r){r.status='imported';r.issue='';});
      state.source='saved';
      state.fileName='';
      window.__remPremiumRenderedV3=false;
      try{if(typeof window.grhGetRem==='function') await window.grhGetRem(true);}catch(e){}
      message('Folha importada com sucesso. Os lançamentos foram atualizados pela competência.','success');
      renderRows();
      if(typeof window.addNotif==='function') window.addNotif('Folha de pagamento importada com sucesso.','success');
    }catch(error){message('Erro ao importar a folha: '+(error.message||error),'error');}
    state.importing=false;updateSummary();
    if(state.source==='saved') window.remFolhaLoadSaved(true);
  };
  window.remFolhaBaixarModelo=function(){
    if(!window.XLSX){message('A biblioteca de Excel ainda não foi carregada.','error');return;}
    var data=[
      ['Matrícula','Nome','CPF','Competência','Salário Base','Total Proventos','Total Descontos','Salário Líquido','INSS','IRRF','FGTS','Benefícios','Outros'],
      ['203','ALINE DE LIMA MAZZUCATTO','',''+monthNow(),4703.45,5200.00,950.00,4250.00,520.00,130.00,416.00,600.00,0]
    ];
    var ws=XLSX.utils.aoa_to_sheet(data);
    ws['!cols']=[{wch:13},{wch:34},{wch:16},{wch:13},{wch:15},{wch:17},{wch:17},{wch:17},{wch:12},{wch:12},{wch:12},{wch:14},{wch:12}];
    var wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Folha de Pagamento');
    XLSX.writeFile(wb,'modelo_folha_pagamento.xlsx');
  };

  var queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(function(){queued=false;ensure();});
  }
  var observer=new MutationObserver(schedule);
  function boot(){
    var p=pane();
    if(p) observer.observe(p,{childList:true,subtree:true});
    schedule();
    setTimeout(schedule,300);setTimeout(schedule,900);setTimeout(schedule,1800);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();