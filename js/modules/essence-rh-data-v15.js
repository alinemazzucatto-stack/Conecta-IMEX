// Gestão RH v15: dados administrativos limpos e controles organizados.
(function(){
  'use strict';
  if(window.__ESSENCE_RH_DATA_V15__) return;
  window.__ESSENCE_RH_DATA_V15__=true;

  var rawRemuneration=window.grhRenderRemuneracao;
  var colRequest=0, addressRequest=0;
  var addressPage=1, addressPageSize=15, addressFilterKey='';
  var colPage=1, colPageSize=15, colFilterKey='';

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function js(v){return String(v==null?'':v).replace(/'/g,'');}
  function technical(c){
    c=c||{};
    var mail=String(c.email||'').toLowerCase().trim();
    var name=String(c.nome||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    return /@teste-temporario\.com$/i.test(mail)||/^diagnostico(?:\s|[._-]|$)/i.test(name);
  }
  function contractType(c){
    c=c||{};
    var raw=String(c.tipoContrato||c.contrato||c.clt||'').trim();
    if(/estag/i.test(raw)) return 'Estagiário';
    if(/^(clt|sim|true)$/i.test(raw)) return 'CLT';
    if(/^(pj|não|nao|false)$/i.test(raw)) return 'PJ';
    return raw||'—';
  }
  function managed(){
    return Promise.resolve(typeof window.grhGetColabs==='function'?window.grhGetColabs(true):[]).then(function(list){
      return (Array.isArray(list)?list:[]).filter(function(c){return c && !technical(c) && (String(c.nome||'').trim() || String(c.email||'').trim());});
    });
  }

  function ensureCollaboratorPager(card){
    if(!card) return null;
    var pager=document.getElementById('grh-colab-pager');
    if(!pager){
      pager=document.createElement('div');
      pager.id='grh-colab-pager';
      pager.className='ess-colab-pager';
      card.appendChild(pager);
    }
    return pager;
  }

  function renderCollaboratorPager(total,start,end){
    var table=document.getElementById('grh-colab-table');
    var pager=ensureCollaboratorPager(table&&table.closest('.card'));
    if(!pager) return;
    var pages=Math.max(1,Math.ceil(total/colPageSize));
    colPage=Math.min(Math.max(colPage,1),pages);
    var summaryText=total?(start+1)+'–'+end+' de '+total:'Nenhum resultado';
    pager.innerHTML='<div class="ess-colab-page-summary"><strong>'+summaryText+'</strong><span>resultados filtrados</span></div>'+
      '<div class="ess-colab-page-size"><label for="grh-colab-page-size">Linhas por página</label><select id="grh-colab-page-size" onchange="grhSetColabPageSize(this.value)">'+
      [10,15,25,50].map(function(size){return '<option value="'+size+'"'+(size===colPageSize?' selected':'')+'>'+size+'</option>';}).join('')+'</select></div>'+
      '<nav class="ess-colab-page-nav" aria-label="Paginação de colaboradores">'+
      '<button type="button" onclick="grhColabPage(1)" '+(colPage===1?'disabled':'')+' aria-label="Primeira página">«</button>'+
      '<button type="button" onclick="grhColabPage('+(colPage-1)+')" '+(colPage===1?'disabled':'')+'>Anterior</button>'+
      '<span>Página <strong>'+colPage+'</strong> de <strong>'+pages+'</strong></span>'+
      '<button type="button" onclick="grhColabPage('+(colPage+1)+')" '+(colPage===pages?'disabled':'')+'>Próxima</button>'+
      '<button type="button" onclick="grhColabPage('+pages+')" '+(colPage===pages?'disabled':'')+' aria-label="Última página">»</button></nav>';
  }
  function ensureList(){
    var pane=document.getElementById('grh-pane-colaboradores'); if(!pane) return null;
    var table=document.getElementById('grh-colab-table');
    if(table){var existingCard=table.closest('.card');ensureCollaboratorPager(existingCard);return existingCard;}
    var card=document.createElement('div');
    card.className='card ess-rh-board ess-colab-list-board';
    card.innerHTML='<div class="card-head"><div class="cht"><h2>Lista de colaboradores</h2><p id="grh-col-count">Carregando...</p></div>'+
      '<div class="ess-colab-filters"><input id="grh-search" placeholder="Buscar por nome, e-mail, função ou setor" oninput="grhRenderColabs()">'+
      '<select id="grh-filter-setor" onchange="grhRenderColabs()"><option value="">Todos os setores</option></select>'+
      '<select id="grh-filter-status" onchange="grhRenderColabs()"><option value="Ativo" selected>Ativos</option><option value="Afastado">Afastados</option><option value="">Todos</option><option value="Inativo">Somente inativos</option></select>'+
      '<select id="grh-filter-clt" onchange="grhRenderColabs()"><option value="">Todos os contratos</option><option value="CLT">Somente CLT</option><option value="PJ">Somente PJ</option><option value="Estagiário">Somente Estagiário</option></select>'+
      '<button class="btn btn-p btn-sm" type="button" onclick="grhAbrirModalColab(null)">➕ Novo</button><button class="btn btn-g btn-sm" type="button" onclick="grhExportarExcel()">📊 Excel</button></div></div>'+
      '<div class="card-body" style="padding:0"><div class="ess-table-scroll"><table id="grh-colab-table"><thead><tr><th>Nome</th><th>Matrícula</th><th>E-mail</th><th>CPF</th><th>Função</th><th>Setor</th><th>CLT</th><th>Admissão</th><th>Tempo</th><th>Status</th><th>Acesso</th><th>Ações</th></tr></thead><tbody id="grh-colab-body"><tr><td colspan="12" class="ess-table-message">Carregando...</td></tr></tbody></table></div></div>';
    var sector=document.getElementById('colabSetoresBottomV1')||document.getElementById('grh-setor-stats');
    pane.insertBefore(card,sector&&sector.parentNode===pane?sector:null);
    ensureCollaboratorPager(card);
    return card;
  }

  function setStableHTML(node,html){ if(node && node.innerHTML!==html) node.innerHTML=html; }

  function sectors(list){
    var box=document.getElementById('grh-setor-stats'); if(!box) return;
    var map={}; list.forEach(function(c){var key=c.setor||'Sem setor';map[key]=(map[key]||0)+1;});
    var html=Object.keys(map).sort(function(a,b){return map[b]-map[a];}).map(function(key){
      return '<article class="ess-sector-stat"><small>'+esc(key)+'</small><strong>'+map[key]+'</strong><span>'+(map[key]===1?'colaborador':'colaboradores')+'</span></article>';
    }).join('');
    setStableHTML(box,html);
  }

  function summary(list){
    var box=document.querySelector('#grh-pane-colaboradores .ess-colab-overview'); if(!box) return;
    var active=list.filter(function(c){return !/inativo|deslig/i.test(String(c.status||''));});
    var clt=active.filter(function(c){return /clt|sim|true/i.test(String(c.clt||c.contrato||''));}).length;
    var values=[['👥','Total',list.length,'cadastros reais'],['✅','Ativos',active.length,'em operação'],['📄','CLT',clt,'contratos ativos'],['🤝','PJ',Math.max(active.length-clt,0),'prestadores ativos']];
    setStableHTML(box,values.map(function(v){return '<article><span>'+v[0]+'</span><div><small>'+v[1]+'</small><strong>'+v[2]+'</strong><p>'+v[3]+'</p></div></article>';}).join(''));
  }

  async function renderCollaborators(){
    var request=++colRequest;
    ensureList();
    var tbody=document.getElementById('grh-colab-body'); if(!tbody) return;
    try{
      var all=await managed(); if(request!==colRequest) return;
      var q=String((document.getElementById('grh-search')||{}).value||'').toLowerCase();
      var sectorFilter=String((document.getElementById('grh-filter-setor')||{}).value||''), statusEl=document.getElementById('grh-filter-status'), status=statusEl?String(statusEl.value):'Ativo', cltFilter=String((document.getElementById('grh-filter-clt')||{}).value||'');
      var select=document.getElementById('grh-filter-setor');
      if(select){
        var selected=select.value, sectorValues=Array.from(new Set(all.map(function(c){return c.setor;}).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'pt-BR');});
        var sectorHTML='<option value="">Todos os setores</option>'+sectorValues.map(function(value){return '<option value="'+esc(value)+'">'+esc(value)+'</option>';}).join('');
        setStableHTML(select,sectorHTML);
        if(Array.from(select.options).some(function(o){return o.value===selected;})) select.value=selected;
        sectorFilter=select.value;
      }
      var filterKey=[q,sectorFilter,status,cltFilter].join('|');
      if(filterKey!==colFilterKey){colFilterKey=filterKey;colPage=1;}
      var data=all.slice();
      if(q) data=data.filter(function(c){return [c.nome,c.email,c.funcao,c.cargo,c.setor,c.matricula].some(function(v){return String(v||'').toLowerCase().includes(q);});});
      if(sectorFilter) data=data.filter(function(c){return c.setor===sectorFilter;});
      if(cltFilter) data=data.filter(function(c){return contractType(c)===cltFilter;});
      if(status) data=data.filter(function(c){return String(c.status||'Ativo')===status;});
      data.sort(function(a,b){return String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR');});
      var pages=Math.max(1,Math.ceil(data.length/colPageSize));
      colPage=Math.min(Math.max(colPage,1),pages);
      var start=(colPage-1)*colPageSize, end=Math.min(start+colPageSize,data.length), pageData=data.slice(start,end);
      var count=document.getElementById('grh-col-count'); if(count) count.textContent=data.length+' de '+all.length+' colaboradores encontrados';
      var html=pageData.length?pageData.map(function(c){
        var st=c.status||'Ativo', cls=/afast/i.test(st)?'warn':(/inativo|deslig/i.test(st)?'off':'ok');
        return '<tr><td class="ess-colab-name">'+esc(c.nome||'—')+'</td><td>'+esc(c.matricula||'—')+'</td><td>'+esc(c.email||'—')+'</td><td>'+esc(c.cpf||'—')+'</td><td>'+esc(c.funcao||c.cargo||'—')+'</td><td><span class="ess-tag">'+esc(c.setor||'—')+'</span></td><td>'+esc(contractType(c))+'</td><td>'+esc(typeof window.grhFmt==='function'?window.grhFmt(c.admissao):(c.admissao||'—'))+'</td><td>'+esc(typeof window.grhTempoEmpresa==='function'?window.grhTempoEmpresa(c.admissao):'—')+'</td><td><span class="ess-status '+cls+'">'+esc(st)+'</span></td><td>'+esc(c.roleAcesso||'colaborador')+'</td><td><button class="ess-icon-action" type="button" onclick="grhAbrirModalColab(\''+js(c._id||c.id||'')+'\')">✏️</button></td></tr>';
      }).join(''):'<tr><td colspan="12" class="ess-table-message">Nenhum colaborador encontrado com os filtros selecionados.</td></tr>';
      setStableHTML(tbody,html);
      renderCollaboratorPager(data.length,start,end);
      sectors(all); summary(all);
    }catch(error){tbody.innerHTML='<tr><td colspan="12" class="ess-table-message error">Erro ao carregar colaboradores: '+esc(error.message||error)+'</td></tr>';}
  }

  function activeAddressPane(){
    var host=document.getElementById('view-gestao-rh');
    if(!host) return null;
    return host.querySelector('#grh-pane-enderecos.active') || host.querySelector('#grh-pane-enderecos');
  }

  function addressFields(c){
    c=c||{};
    var a=c.endereco||{};
    return {
      cep:a.cep||c.cep||'',
      street:a.rua||c.rua||'',
      number:a.num||a.numero||c.num||c.numero||'',
      comp:a.comp||c.comp||'',
      district:a.bairro||c.bairro||'',
      city:a.cidade||c.cidade||'',
      uf:String(a.uf||c.uf||'').toUpperCase()
    };
  }

  function addressComplete(c){
    var a=addressFields(c);
    return Boolean(a.cep&&a.street&&a.city&&a.uf);
  }

  function renderAddressSummary(list){
    var pane=activeAddressPane(), box=pane&&pane.querySelector('#grh-address-summary'); if(!box) return;
    var updated=list.filter(addressComplete).length, pending=Math.max(list.length-updated,0);
    var cities=new Set(list.map(function(c){return addressFields(c).city;}).filter(Boolean)).size;
    var values=[['📍','Total',list.length,'colaboradores'],['✅','Atualizados',updated,'cadastros completos'],['⚠️','Pendentes',pending,'precisam de revisão'],['🏙️','Cidades',cities,'localidades registradas']];
    setStableHTML(box,values.map(function(v){return '<article><span>'+v[0]+'</span><div><small>'+v[1]+'</small><strong>'+v[2]+'</strong><p>'+v[3]+'</p></div></article>';}).join(''));
  }

  function renderAddressPager(total,start,end){
    var pane=activeAddressPane(), pager=pane&&pane.querySelector('#grh-address-pager'); if(!pager) return;
    var pages=Math.max(1,Math.ceil(total/addressPageSize));
    addressPage=Math.min(Math.max(addressPage,1),pages);
    var summaryText=total?(start+1)+'–'+end+' de '+total:'Nenhum resultado';
    pager.innerHTML='<div class="ess-address-page-summary"><strong>'+summaryText+'</strong><span>endereços filtrados</span></div>'+
      '<div class="ess-address-page-size"><label for="grh-address-page-size">Linhas por página</label><select id="grh-address-page-size" onchange="grhSetAddressPageSize(this.value)">'+
      [10,15,25,50].map(function(size){return '<option value="'+size+'"'+(size===addressPageSize?' selected':'')+'>'+size+'</option>';}).join('')+'</select></div>'+
      '<nav class="ess-address-page-nav" aria-label="Paginação de endereços">'+
      '<button type="button" onclick="grhAddressPage(1)" '+(addressPage===1?'disabled':'')+' aria-label="Primeira página">«</button>'+
      '<button type="button" onclick="grhAddressPage('+(addressPage-1)+')" '+(addressPage===1?'disabled':'')+'>Anterior</button>'+
      '<span>Página <strong>'+addressPage+'</strong> de <strong>'+pages+'</strong></span>'+
      '<button type="button" onclick="grhAddressPage('+(addressPage+1)+')" '+(addressPage===pages?'disabled':'')+'>Próxima</button>'+
      '<button type="button" onclick="grhAddressPage('+pages+')" '+(addressPage===pages?'disabled':'')+' aria-label="Última página">»</button></nav>';
  }
  async function renderAddresses(){
    var request=++addressRequest;
    var pane=activeAddressPane(), tbody=pane&&pane.querySelector('#grh-end-body'); if(!tbody) return;
    try{
      var all=await managed(); if(request!==addressRequest) return;
      renderAddressSummary(all);
      var q=String(((pane.querySelector('#grh-end-search'))||{}).value||'').toLowerCase();
      var statusFilter=String(((pane.querySelector('#grh-end-status'))||{}).value||'');
      var ufSelect=pane.querySelector('#grh-end-uf'), ufFilter=String((ufSelect||{}).value||'');
      if(ufSelect){
        var selectedUf=ufSelect.value, ufs=Array.from(new Set(all.map(function(c){return addressFields(c).uf;}).filter(Boolean))).sort();
        var ufHTML='<option value="">Todas as UFs</option>'+ufs.map(function(uf){return '<option value="'+esc(uf)+'">'+esc(uf)+'</option>';}).join('');
        setStableHTML(ufSelect,ufHTML);
        if(Array.from(ufSelect.options).some(function(o){return o.value===selectedUf;})) ufSelect.value=selectedUf;
        ufFilter=ufSelect.value;
      }
      var filterKey=[q,statusFilter,ufFilter].join('|');
      if(filterKey!==addressFilterKey){addressFilterKey=filterKey;addressPage=1;}
      var data=all.filter(function(c){
        var a=addressFields(c);
        if(q && ![c.nome,c.email,c.setor,c.funcao,a.cep,a.street,a.district,a.city,a.uf].some(function(v){return String(v||'').toLowerCase().includes(q);})) return false;
        if(statusFilter==='Atualizado'&&!addressComplete(c)) return false;
        if(statusFilter==='Pendente'&&addressComplete(c)) return false;
        if(ufFilter&&a.uf!==ufFilter) return false;
        return true;
      });
      data.sort(function(a,b){return String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR');});
      var pages=Math.max(1,Math.ceil(data.length/addressPageSize));
      addressPage=Math.min(Math.max(addressPage,1),pages);
      var start=(addressPage-1)*addressPageSize, end=Math.min(start+addressPageSize,data.length), pageData=data.slice(start,end);
      var count=pane.querySelector('#grh-end-count'); if(count) count.textContent=data.length+' de '+all.length+' colaboradores encontrados';
      var html=pageData.length?pageData.map(function(c){
        var a=addressFields(c), complete=addressComplete(c);
        return '<tr><td class="ess-address-person"><strong>'+esc(c.nome||'—')+'</strong><small>'+esc(c.email||'')+'</small></td><td>'+esc(a.cep||'Não informado')+'</td><td>'+esc(a.street||'Não informado')+'</td><td>'+esc(a.number||'—')+(a.comp?' ('+esc(a.comp)+')':'')+'</td><td>'+esc(a.district||'Não informado')+'</td><td>'+esc(a.city||'Não informado')+(a.uf?' / '+esc(a.uf):'')+'</td><td><span class="ess-status '+(complete?'ok':'warn')+'">'+(complete?'Atualizado':'Pendente')+'</span><button class="ess-address-edit" type="button" onclick="grhAbrirModalEndereco(\''+js(c._id||c.id||'')+'\')">📍 Editar</button></td></tr>';
      }).join(''):'<tr><td colspan="7" class="ess-table-message">Nenhum endereço encontrado com os filtros selecionados.</td></tr>';
      setStableHTML(tbody,html);
      renderAddressPager(data.length,start,end);
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
  window.grhColabPage=function(page){colPage=Math.max(1,Number(page)||1);return renderCollaborators();};
  window.grhSetColabPageSize=function(size){colPageSize=Math.max(10,Number(size)||15);colPage=1;return renderCollaborators();};
  window.grhRenderEnderecos=renderAddresses;
  window.grhAddressPage=function(page){addressPage=Math.max(1,Number(page)||1);return renderAddresses();};
  window.grhSetAddressPageSize=function(size){addressPageSize=Math.max(10,Number(size)||15);addressPage=1;return renderAddresses();};
  if(typeof rawRemuneration==='function') window.grhRenderRemuneracao=function(){window.__remPremiumRenderedV3=false;var result=typeof window.remAplicarPremiumV3==='function'?window.remAplicarPremiumV3():rawRemuneration.apply(this,arguments);setTimeout(organizeToolbar,40);setTimeout(organizeToolbar,300);return result;};

  function refresh(){
    var colPane=document.getElementById('grh-pane-colaboradores');
    if(colPane&&getComputedStyle(colPane).display!=='none') renderCollaborators();
    var endPane=document.getElementById('grh-pane-enderecos'); if(endPane&&getComputedStyle(endPane).display!=='none') renderAddresses();
    var remPane=document.getElementById('grh-pane-remuneracao'); if(remPane&&getComputedStyle(remPane).display!=='none') organizeToolbar();
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(refresh,700);});

})();
