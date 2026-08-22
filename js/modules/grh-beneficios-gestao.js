// Gestão RH - aba administrativa de Benefícios dentro de Remuneração.
(function(){
  'use strict';
  if(window.__GRH_BENEFICIOS_GESTAO_V35__) return;
  window.__GRH_BENEFICIOS_GESTAO_V35__=true;

  var state={loading:false,loaded:false,colabs:[],assignments:[],catalog:[],requests:[],cards:[]};
  var defaults=[
    {id:'saude',key:'unimed',icon:'💚',nome:'Plano de Saúde',fornecedor:'Unimed',regra:'Titular + dependentes',descricao:'Assistência médica para colaboradores e dependentes.'},
    {id:'alimentacao',key:'valeAlimentacao',icon:'🍴',nome:'Vale Alimentação',fornecedor:'iFood Benefícios',regra:'Crédito mensal',descricao:'Crédito para compras de alimentação e mercado.'},
    {id:'odontologico',key:'odontologico',icon:'🦷',nome:'Plano Odontológico',fornecedor:'Plano odontológico',regra:'Titular + dependentes',descricao:'Cobertura odontológica para titulares e dependentes.'},
    {id:'colabmais',key:'colab',icon:'🏥',nome:'Programa Colab+',fornecedor:'Dasa',regra:'Programa corporativo',descricao:'Saúde preventiva, teleatendimento e rede de apoio.'},
    {id:'sindicato',key:'sindicato',icon:'🛡️',nome:'Cartão Sindicato',fornecedor:'Sindicato',regra:'Conforme elegibilidade',descricao:'Benefícios e convênios vinculados ao sindicato.'}
  ];

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function norm(v){return String(v==null?'':v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  function num(v){var n=Number(v);return isFinite(n)?n:0;}
  function money(v){return num(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function active(c){var s=norm(c.status||c.situacao||'ativo');return c.ativo!==false&&s!=='inativo'&&s!=='desligado'&&s!=='demitido';}
  function wrap(){var p=document.getElementById('grh-pane-remuneracao');return p&&p.querySelector('.rem-premium-wrap');}
  function collectionName(name){return typeof window.col==='function'?window.col(name):(typeof col==='function'?col(name):name);}
  async function readCollection(name){
    if(!window.db) return [];
    var snap=await db.collection(collectionName(name)).get();
    var out=[];snap.forEach(function(doc){out.push(Object.assign({_id:doc.id},doc.data()||{}));});
    return out;
  }
  function catalogLocal(){
    try{return JSON.parse(localStorage.getItem('grh_beneficios_catalogo')||'[]');}catch(e){return [];}
  }
  function html(){
    return '<section id="rem-benefits-view" class="rem-benefits-view" style="display:none">'+
      '<header class="rem-benefits-head"><div><small>REMUNERAÇÃO</small><h2>Benefícios</h2><p>Gerencie os benefícios oferecidos pela empresa e acompanhe adesão e utilização.</p></div><div class="rem-benefits-actions"><button type="button" class="btn btn-g" onclick="remBeneficiosRelatorio()">📊 Relatórios</button><button type="button" class="btn btn-g" onclick="remBeneficiosImportar()">⬆️ Importar planilha</button><button type="button" class="btn btn-p" onclick="remBeneficiosNovo()">＋ Novo benefício</button></div></header>'+
      '<div id="rem-benefits-message" class="rem-benefits-message" style="display:none"></div>'+
      '<div class="rem-benefits-kpis"><article><span>👥</span><div><small>Colaboradores ativos</small><strong id="rem-ben-active">0</strong><p>base atual</p></div></article><article><span>✅</span><div><small>Participantes</small><strong id="rem-ben-participants">0</strong><p id="rem-ben-adhesion">0% de adesão</p></div></article><article><span>💳</span><div><small>Custo mensal empresa</small><strong id="rem-ben-company">R$ 0,00</strong><p id="rem-ben-month">competência atual</p></div></article><article><span>🎁</span><div><small>Custo mensal total</small><strong id="rem-ben-total">R$ 0,00</strong><p>benefícios ativos</p></div></article></div>'+
      '<section class="rem-benefits-offered"><div class="rem-benefits-section-head"><div><h3>Benefícios oferecidos</h3><p>Custos e participação calculados com os dados dos colaboradores.</p></div><button type="button" class="btn btn-g btn-sm" onclick="remBeneficiosLoad(true)">↻ Atualizar</button></div><div id="rem-benefits-grid" class="rem-benefits-grid"><div class="ess-table-message">Carregando benefícios…</div></div></section>'+
      '<section class="rem-benefits-central"><div class="rem-benefits-central-icon">♙</div><div><h3>Central de solicitações</h3><p>Acompanhe adesões, alterações, inclusões de dependentes e cancelamentos.</p></div><span id="rem-ben-request-count">0 pendentes</span><button type="button" class="btn btn-g" onclick="remBeneficiosSolicitacoes()">Acessar solicitações →</button></section>'+
      '</section>';
  }
  function ensureModal(){
    var m=document.getElementById('rem-benefits-modal');
    if(m) return m;
    m=document.createElement('div');m.id='rem-benefits-modal';m.className='rem-benefits-modal';m.style.display='none';
    m.innerHTML='<div class="rem-benefits-modal-card"><div class="rem-benefits-modal-head"><h3 id="rem-benefits-modal-title">Benefícios</h3><button type="button" onclick="remBeneficiosFechar()">✕</button></div><div id="rem-benefits-modal-body"></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click',function(e){if(e.target===m) window.remBeneficiosFechar();});
    return m;
  }
  function modal(title,body){
    var m=ensureModal();document.getElementById('rem-benefits-modal-title').textContent=title;document.getElementById('rem-benefits-modal-body').innerHTML=body;m.style.display='flex';
  }
  window.remBeneficiosFechar=function(){var m=document.getElementById('rem-benefits-modal');if(m)m.style.display='none';};
  function message(text,type){
    var el=document.getElementById('rem-benefits-message');if(!el)return;
    el.style.display=text?'block':'none';el.className='rem-benefits-message '+(type||'info');el.textContent=text||'';
  }
  function mergedCatalog(custom){
    var map={};defaults.forEach(function(x){map[x.key]=Object.assign({},x);});
    (custom||[]).forEach(function(x){var k=x.key||norm(x.nome);if(k)map[k]=Object.assign({},map[k]||{},x,{key:k,id:x._id||x.id||norm(x.nome)});});
    return Object.keys(map).map(function(k){return map[k];});
  }
  function assignmentValue(a,key){return num(a[key]||(a.valores&&a.valores[key]));}
  function calculate(){
    var activeColabs=state.colabs.filter(active),activeIds={};
    activeColabs.forEach(function(c){activeIds[String(c._id||c.id||c.matricula||c.nome)]=true;});
    var participantIds={};
    state.cards=state.catalog.map(function(item){
      var participants=0,cost=0;
      state.assignments.forEach(function(a){
        var value=assignmentValue(a,item.key);
        if(value>0){participants++;cost+=value;participantIds[String(a.colaboradorId||a._id||a.colaboradorNome||participants)]=true;}
      });
      return Object.assign({},item,{participants:participants,cost:cost,status:item.status||'Ativo'});
    });
    var total=state.cards.reduce(function(s,c){return s+c.cost;},0);
    return {active:activeColabs.length,participants:Object.keys(participantIds).length,total:total};
  }
  function render(){
    var totals=calculate(),set=function(id,v){var el=document.getElementById(id);if(el)el.textContent=v;};
    set('rem-ben-active',totals.active);set('rem-ben-participants',totals.participants);
    set('rem-ben-adhesion',totals.active?((totals.participants/totals.active)*100).toFixed(1).replace('.',',')+'% de adesão':'0% de adesão');
    set('rem-ben-company',money(totals.total));set('rem-ben-total',money(totals.total));
    set('rem-ben-month',new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));
    var pending=state.requests.filter(function(r){var s=norm(r.status||'pendente');return s==='pendente'||s==='aberto'||s==='em-analise';}).length;
    set('rem-ben-request-count',pending+(pending===1?' pendente':' pendentes'));
    var grid=document.getElementById('rem-benefits-grid');if(!grid)return;
    grid.innerHTML=state.cards.map(function(c,i){
      var palette=['green','blue','orange','violet','cyan'][i%5];
      return '<article class="rem-benefit-card '+palette+'"><div class="rem-benefit-card-icon">'+esc(c.icon||'🎁')+'</div><div class="rem-benefit-card-title"><h4>'+esc(c.nome||'Benefício')+'</h4><span>● '+esc(c.status||'Ativo')+'</span></div><p>'+esc(c.descricao||'Benefício corporativo')+'</p><dl><div><dt>Fornecedor</dt><dd>'+esc(c.fornecedor||'Não informado')+'</dd></div><div><dt>Regra</dt><dd>'+esc(c.regra||'Conforme política')+'</dd></div><div><dt>Participantes</dt><dd>'+c.participants+'</dd></div><div><dt>Custo empresa (mês)</dt><dd>'+money(c.cost)+'</dd></div></dl><button type="button" onclick="remBeneficiosDetalhes(\''+esc(c.key)+'\')">Ver detalhes →</button></article>';
    }).join('')||'<div class="ess-table-message">Nenhum benefício cadastrado.</div>';
    message('', '');
  }
  window.remBeneficiosEnsure=function(){
    var w=wrap();if(!w||!w.querySelector('.rem-inner-tabs'))return false;
    var view=w.querySelector('#rem-benefits-view');
    if(!view){w.insertAdjacentHTML('beforeend',html());view=w.querySelector('#rem-benefits-view');}
    return Boolean(view);
  };
  window.remBeneficiosLoad=async function(force){
    if(state.loading||(!force&&state.loaded))return;
    if(!window.remBeneficiosEnsure())return;
    state.loading=true;message('Carregando dados administrativos de benefícios…','info');
    try{
      var results=await Promise.all([
        typeof window.grhGetColabs==='function'?window.grhGetColabs(Boolean(force)):Promise.resolve([]),
        readCollection('grh_beneficios').catch(function(){return [];}),
        readCollection('grh_beneficios_catalogo').then(function(items){return items.length?items:catalogLocal();}).catch(function(){return catalogLocal();}),
        readCollection('grh_beneficios_solicitacoes').catch(function(){return [];})
      ]);
      state.colabs=Array.isArray(results[0])?results[0]:[];
      state.assignments=Array.isArray(results[1])?results[1]:[];
      state.catalog=mergedCatalog(results[2]);
      state.requests=Array.isArray(results[3])?results[3]:[];
      state.loaded=true;render();
    }catch(e){message('Não foi possível carregar os benefícios: '+(e.message||e),'error');}
    state.loading=false;
  };
  window.remBeneficiosDetalhes=function(key){
    var c=state.cards.find(function(x){return x.key===key;});if(!c)return;
    var people=state.assignments.filter(function(a){return assignmentValue(a,key)>0;}).slice(0,12);
    modal(c.icon+' '+c.nome,'<div class="rem-benefits-detail-summary"><article><small>Participantes</small><strong>'+c.participants+'</strong></article><article><small>Custo mensal</small><strong>'+money(c.cost)+'</strong></article></div><div class="rem-benefits-detail-info"><p><strong>Fornecedor:</strong> '+esc(c.fornecedor||'Não informado')+'</p><p><strong>Regra:</strong> '+esc(c.regra||'Conforme política')+'</p><p>'+esc(c.descricao||'')+'</p></div><h4>Participantes recentes</h4><div class="rem-benefits-people">'+(people.length?people.map(function(a){return '<div><span>'+esc(a.colaboradorNome||a.nome||'Colaborador')+'</span><strong>'+money(assignmentValue(a,key))+'</strong></div>';}).join(''):'<p>Nenhum participante com valor lançado.</p>')+'</div>');
  };
  window.remBeneficiosNovo=function(){
    modal('Novo benefício','<form class="rem-benefits-form" onsubmit="remBeneficiosSalvar(event)"><label><span>Nome do benefício</span><input id="rem-ben-form-name" required placeholder="Ex.: Seguro de Vida"></label><label><span>Fornecedor</span><input id="rem-ben-form-provider" placeholder="Nome do fornecedor"></label><label><span>Ícone</span><input id="rem-ben-form-icon" value="🎁" maxlength="4"></label><label><span>Regra de participação</span><input id="rem-ben-form-rule" placeholder="Ex.: 100% empresa"></label><label class="wide"><span>Descrição</span><textarea id="rem-ben-form-desc" rows="3" placeholder="Descreva o benefício"></textarea></label><div class="wide rem-benefits-form-actions"><button type="button" class="btn btn-g" onclick="remBeneficiosFechar()">Cancelar</button><button type="submit" class="btn btn-p">Salvar benefício</button></div></form>');
  };
  window.remBeneficiosSalvar=async function(e){
    e.preventDefault();
    var nome=document.getElementById('rem-ben-form-name').value.trim(),key=norm(nome);
    if(!nome||!key)return;
    var item={nome:nome,key:key,icon:document.getElementById('rem-ben-form-icon').value||'🎁',fornecedor:document.getElementById('rem-ben-form-provider').value.trim(),regra:document.getElementById('rem-ben-form-rule').value.trim(),descricao:document.getElementById('rem-ben-form-desc').value.trim(),status:'Ativo',atualizadoEm:new Date().toISOString()};
    try{
      if(window.db){try{await db.collection(collectionName('grh_beneficios_catalogo')).doc(key).set(item,{merge:true});}catch(dbError){console.warn('Catálogo salvo apenas localmente:',dbError);}}
      var local=catalogLocal().filter(function(x){return x.key!==key;});local.push(item);localStorage.setItem('grh_beneficios_catalogo',JSON.stringify(local));
      window.remBeneficiosFechar();state.loaded=false;await window.remBeneficiosLoad(true);message('Benefício cadastrado com sucesso.','success');
    }catch(err){message('Erro ao salvar o benefício: '+(err.message||err),'error');}
  };
  window.remBeneficiosRelatorio=function(){
    var rows=[['Benefício','Fornecedor','Participantes','Custo mensal','Status']].concat(state.cards.map(function(c){return [c.nome,c.fornecedor,c.participants,c.cost,c.status];}));
    var csv='\uFEFF'+rows.map(function(row){return row.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}).join(';');}).join('\n');
    var url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='relatorio-beneficios.csv';a.click();setTimeout(function(){URL.revokeObjectURL(url);},500);
  };
  window.remBeneficiosImportar=function(){
    if(typeof window.grhAbrirBeneficios==='function')window.grhAbrirBeneficios();
    else message('A rotina de importação ainda não está disponível.','error');
  };
  window.remBeneficiosSolicitacoes=function(){
    var rows=state.requests.map(function(r){return '<tr><td>'+esc(r.colaboradorNome||r.nome||'—')+'</td><td>'+esc(r.tipo||r.assunto||'Solicitação')+'</td><td>'+esc(r.beneficio||'—')+'</td><td><span class="rem-payroll-status '+(norm(r.status)==='concluido'?'ready':'warn')+'">'+esc(r.status||'Pendente')+'</span></td></tr>';}).join('');
    modal('Central de solicitações','<div class="rem-benefits-request-table"><table><thead><tr><th>Colaborador</th><th>Solicitação</th><th>Benefício</th><th>Status</th></tr></thead><tbody>'+(rows||'<tr><td colspan="4" class="ess-table-message">Nenhuma solicitação registrada.</td></tr>')+'</tbody></table></div>');
  };

  var queued=false,observer=new MutationObserver(function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;window.remBeneficiosEnsure();});});
  function boot(){var p=document.getElementById('grh-pane-remuneracao');if(p)observer.observe(p,{childList:true,subtree:true});window.remBeneficiosEnsure();setTimeout(window.remBeneficiosEnsure,300);setTimeout(window.remBeneficiosEnsure,900);setTimeout(window.remBeneficiosEnsure,1800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
