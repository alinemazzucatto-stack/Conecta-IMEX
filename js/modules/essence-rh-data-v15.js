// Gestão RH v15: dados administrativos limpos e controles organizados.
(function(){
  'use strict';
  if(window.__ESSENCE_RH_DATA_V15__) return;
  window.__ESSENCE_RH_DATA_V15__=true;

  var rawRemuneration=window.grhRenderRemuneracao;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function js(v){return String(v==null?'':v).replace(/'/g,'');}
  function technical(c){
    c=c||{};
    var mail=String(c.email||'').toLowerCase().trim();
    var name=String(c.nome||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    return /@teste-temporario\.com$/i.test(mail)||/^diagnostico(?:\s|[._-]|$)/i.test(name);
  }
  function managed(){
    return Promise.resolve(typeof window.grhGetColabs==='function'?window.grhGetColabs(true):[]).then(function(list){
      return (Array.isArray(list)?list:[]).filter(function(c){return !technical(c);});
    });
  }

  function ensureList(){
    var pane=document.getElementById('grh-pane-colaboradores'); if(!pane) return null;
    var table=document.getElementById('grh-colab-table');
    if(table) return table.closest('.card');
    var card=document.createElement('div');
    card.className='card ess-rh-board ess-colab-list-board';
    card.innerHTML='<div class="card-head"><div class="cht"><h2>Lista de colaboradores</h2><p id="grh-col-count">Carregando...</p></div>'+
      '<div class="ess-colab-filters"><input id="grh-search" placeholder="Buscar por nome, e-mail, função ou setor" oninput="grhRenderColabs()">'+
      '<select id="grh-filter-setor" onchange="grhRenderColabs()"><option value="">Todos os setores</option></select>'+
      '<select id="grh-filter-status" onchange="grhRenderColabs()"><option value="Ativo" selected>Ativos</option><option value="Afastado">Afastados</option><option value="">Todos</option><option value="Inativo">Somente inativos</option></select>'+
      '<select id="grh-filter-clt" onchange="grhRenderColabs()"><option value="">CLT + PJ</option><option value="Sim">Somente CLT</option><option value="Não">Somente PJ</option></select>'+
      '<button class="btn btn-p btn-sm" type="button" onclick="grhAbrirModalColab(null)">➕ Novo</button><button class="btn btn-g btn-sm" type="button" onclick="grhExportarExcel()">📊 Excel</button></div></div>'+
      '<div class="card-body" style="padding:0"><div class="ess-table-scroll"><table id="grh-colab-table"><thead><tr><th>Nome</th><th>Matrícula</th><th>E-mail</th><th>CPF</th><th>Função</th><th>Setor</th><th>CLT</th><th>Admissão</th><th>Tempo</th><th>Status</th><th>Acesso</th><th>Ações</th></tr></thead><tbody id="grh-colab-body"><tr><td colspan="12" class="ess-table-message">Carregando...</td></tr></tbody></table></div></div>';
    var sector=document.getElementById('colabSetoresBottomV1')||document.getElementById('grh-setor-stats');
    pane.insertBefore(card,sector&&sector.parentNode===pane?sector:null);
    return card;
  }

  function sectors(list){
    var box=document.getElementById('grh-setor-stats'); if(!box) return;
    var map={}; list.forEach(function(c){var key=c.setor||'Sem setor';map[key]=(map[key]||0)+1;});
    box.innerHTML=Object.keys(map).sort(function(a,b){return map[b]-map[a];}).map(function(key){
      return '<article class="ess-sector-stat"><small>'+esc(key)+'</small><strong>'+map[key]+'</strong><span>'+(map[key]===1?'colaborador':'colaboradores')+'</span></article>';
    }).join('');
  }

  function summary(list){
    var box=document.querySelector('#grh-pane-colaboradores .ess-colab-overview'); if(!box) return;
    var active=list.filter(function(c){return !/inativo|deslig/i.test(String(c.status||''));});
    var clt=active.filter(function(c){return /clt|sim|true/i.test(String(c.clt||c.contrato||''));}).length;
    var values=[['👥','Total',list.length,'cadastros reais'],['✅','Ativos',active.length,'em operação'],['📄','CLT',clt,'contratos ativos'],['🤝','PJ',Math.max(active.length-clt,0),'prestadores ativos']];
    box.innerHTML=values.map(function(v){return '<article><span>'+v[0]+'</span><div><small>'+v[1]+'</small><strong>'+v[2]+'</strong><p>'+v[3]+'</p></div></article>';}).join('');
  }

  async function renderCollaborators(){
    ensureList();
    var tbody=document.getElementById('grh-colab-body'); if(!tbody) return;
    try{
      var all=await managed(), q=String((document.getElementById('grh-search')||{}).value||'').toLowerCase();
      var sectorFilter=String((document.getElementById('grh-filter-setor')||{}).value||''), statusEl=document.getElementById('grh-filter-status'), status=statusEl?String(statusEl.value):'Ativo', cltFilter=String((document.getElementById('grh-filter-clt')||{}).value||'');
      var select=document.getElementById('grh-filter-setor');
      if(select){
        var selected=select.value; select.innerHTML='<option value="">Todos os setores</option>';
        Array.from(new Set(all.map(function(c){return c.setor;}).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'pt-BR');}).forEach(function(value){var o=document.createElement('option');o.value=value;o.textContent=value;select.appendChild(o);});
        if(Array.from(select.options).some(function(o){return o.value===selected;})) select.value=selected;
        sectorFilter=select.value;
      }
      var data=all.slice();
      if(q) data=data.filter(function(c){return [c.nome,c.email,c.funcao,c.cargo,c.setor,c.matricula].some(function(v){return String(v||'').toLowerCase().includes(q);});});
      if(sectorFilter) data=data.filter(function(c){return c.setor===sectorFilter;});
      if(cltFilter) data=data.filter(function(c){return c.clt===cltFilter;});
      if(status) data=data.filter(function(c){return String(c.status||'Ativo')===status;});
      data.sort(function(a,b){return String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR');});
      var count=document.getElementById('grh-col-count'); if(count) count.textContent=data.length+' de '+all.length+' colaboradores';
      tbody.innerHTML=data.length?data.map(function(c){
        var st=c.status||'Ativo', cls=/afast/i.test(st)?'warn':(/inativo|deslig/i.test(st)?'off':'ok');
        return '<tr><td class="ess-colab-name">'+esc(c.nome||'—')+'</td><td>'+esc(c.matricula||'—')+'</td><td>'+esc(c.email||'—')+'</td><td>'+esc(c.cpf||'—')+'</td><td>'+esc(c.funcao||c.cargo||'—')+'</td><td><span class="ess-tag">'+esc(c.setor||'—')+'</span></td><td>'+(c.clt==='Sim'?'✅ CLT':'PJ')+'</td><td>'+esc(typeof window.grhFmt==='function'?window.grhFmt(c.admissao):(c.admissao||'—'))+'</td><td>'+esc(typeof window.grhTempoEmpresa==='function'?window.grhTempoEmpresa(c.admissao):'—')+'</td><td><span class="ess-status '+cls+'">'+esc(st)+'</span></td><td>'+esc(c.roleAcesso||'colaborador')+'</td><td><button class="ess-icon-action" type="button" onclick="grhAbrirModalColab(\''+js(c._id||c.id||'')+'\')">✏️</button></td></tr>';
      }).join(''):'<tr><td colspan="12" class="ess-table-message">Nenhum colaborador encontrado.</td></tr>';
      sectors(all); summary(all);
      setTimeout(function(){summary(all);},220);setTimeout(function(){summary(all);},920);setTimeout(function(){summary(all);},1750);
    }catch(error){tbody.innerHTML='<tr><td colspan="12" class="ess-table-message error">Erro ao carregar colaboradores: '+esc(error.message||error)+'</td></tr>';}
  }

  async function renderAddresses(){
    var tbody=document.getElementById('grh-end-body'); if(!tbody) return;
    try{
      var all=await managed(), q=String((document.getElementById('grh-end-search')||{}).value||'').toLowerCase();
      var data=q?all.filter(function(c){return [c.nome,c.email,c.setor,c.funcao].some(function(v){return String(v||'').toLowerCase().includes(q);});}):all;
      var count=document.getElementById('grh-end-count'); if(count) count.textContent=data.length+' colaboradores reais';
      tbody.innerHTML=data.length?data.map(function(c){
        var a=c.endereco||{}, cep=a.cep||c.cep||'Não informado', street=a.rua||c.rua||'Não informado', number=a.num||a.numero||c.num||c.numero||'—', comp=a.comp||c.comp||'', district=a.bairro||c.bairro||'Não informado', city=a.cidade||c.cidade||'Não informado', uf=a.uf||c.uf||'', pending=cep==='Não informado'||street==='Não informado';
        return '<tr><td class="ess-address-person"><strong>'+esc(c.nome||'—')+'</strong><small>'+esc(c.email||'')+'</small></td><td>'+esc(cep)+'</td><td>'+esc(street)+'</td><td>'+esc(number)+(comp?' ('+esc(comp)+')':'')+'</td><td>'+esc(district)+'</td><td>'+esc(city)+(uf?' / '+esc(uf):'')+'</td><td><span class="ess-status '+(pending?'warn':'ok')+'">'+(pending?'Pendente':'Atualizado')+'</span><button class="ess-address-edit" type="button" onclick="grhAbrirModalEndereco(\''+js(c._id||c.id||'')+'\')">📍 Editar</button></td></tr>';
      }).join(''):'<tr><td colspan="7" class="ess-table-message">Nenhum colaborador encontrado.</td></tr>';
    }catch(error){tbody.innerHTML='<tr><td colspan="7" class="ess-table-message error">Erro ao carregar endereços: '+esc(error.message||error)+'</td></tr>';}
  }

  function organizeToolbar(){
    var bar=document.querySelector('#grh-pane-remuneracao .rem-toolbar-legacy'); if(!bar||bar.dataset.essOrganized==='true') return;
    bar.dataset.essOrganized='true';
    var items=Array.prototype.slice.call(bar.children), board=document.createElement('section');
    board.className='ess-rem-control-board'; board.innerHTML='<div class="ess-rem-control-head"><small>CONTROLES DA FOLHA</small><h2>Filtros e ações</h2><p>Ferramentas agrupadas por finalidade para facilitar a operação mensal.</p></div>';
    bar.parentNode.insertBefore(board,bar);board.appendChild(bar);
    var filters=document.createElement('div'), files=document.createElement('div'), actions=document.createElement('div');
    filters.className='rem-toolbar-group rem-toolbar-filters';files.className='rem-toolbar-group rem-toolbar-files';actions.className='rem-toolbar-group rem-toolbar-actions';
    filters.innerHTML='<span>Filtros</span>';files.innerHTML='<span>Arquivos e configurações</span>';actions.innerHTML='<span>Ações da folha</span>';
    items.forEach(function(el,index){var text=String(el.textContent||el.getAttribute('placeholder')||'').toLowerCase();if(index<4||/buscar colaborador|filtrar mês|limpar/.test(text))filters.appendChild(el);else if(/modelo|mapeamento|benefício|histórico/.test(text))files.appendChild(el);else actions.appendChild(el);});
    bar.appendChild(filters);bar.appendChild(files);bar.appendChild(actions);
  }

  window.grhRenderColabs=renderCollaborators;
  window.grhRenderEnderecos=renderAddresses;
  if(typeof rawRemuneration==='function') window.grhRenderRemuneracao=function(){var result=rawRemuneration.apply(this,arguments);setTimeout(organizeToolbar,40);setTimeout(organizeToolbar,300);setTimeout(organizeToolbar,900);setTimeout(organizeToolbar,1600);return result;};

  function refresh(){
    var colPane=document.getElementById('grh-pane-colaboradores');
    if(colPane&&getComputedStyle(colPane).display!=='none'){renderCollaborators();setTimeout(renderCollaborators,850);setTimeout(renderCollaborators,1700);}
    var endPane=document.getElementById('grh-pane-enderecos'); if(endPane&&getComputedStyle(endPane).display!=='none') renderAddresses();
    var remPane=document.getElementById('grh-pane-remuneracao'); if(remPane&&getComputedStyle(remPane).display!=='none') organizeToolbar();
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(refresh,700);});
  window.addEventListener('load',function(){setTimeout(refresh,1000);});
})();