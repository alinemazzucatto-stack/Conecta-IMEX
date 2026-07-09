// ===== script: base-cargos-unica-js =====
(function(){
  function safe(v, fb){ if(v===undefined||v===null) return fb||''; var t=String(v).trim(); return (!t||t.toLowerCase()==='undefined'||t.toLowerCase()==='null') ? (fb||'') : t; }
  function esc(v){ return safe(v).replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];}); }
  function normKey(v){ return safe(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }
  function niveis(){ return {1:'Trainee / Estagiário',2:'Júnior / Assistente',3:'Pleno / Analista',4:'Sênior / Especialista',5:'Líder / Coordenador',6:'Gerente / Diretor',7:'C-Level / Presidente'}; }
  function normCargo(c, idx){ if(typeof c==='string') c={nome:c}; c=c||{}; var n=parseInt(c.nivel||c.level||c.grade||1,10); var o=parseInt(c.ordem||c.order||(idx+1),10); return Object.assign({}, c, {nome:safe(c.nome||c.cargo||c.titulo||c.title||c.name,'Cargo sem nome'), nivel:(Number.isFinite(n)&&n>0?n:1), ordem:(Number.isFinite(o)&&o>0?o:idx+1), proximo:safe(c.proximo||c.proximoCargo||c.nextCargo||c.next,'')}); }
  // REMOVED: Consolidated in 000-core-functions.js
  // function isRH(){ return ((_roleReal||role)==='rh' || (_roleReal||role)==='rh-colaborador'); }
  window.BaseCargosState = {setores:[], filtro:'', setor:'__all__'};

  function ensureModal(){
    if(document.getElementById('base-cargos-modal')) return;
    var div=document.createElement('div'); div.id='base-cargos-modal'; div.className='bc-modal'; div.onclick=function(e){ if(e.target===this) this.style.display='none'; };
    div.innerHTML = '<div class="bc-box"><div class="bc-head"><div><h2 class="bc-title">📚 Base única de cargos e hierarquia</h2><p class="bc-sub">Cadastre cargos, nível hierárquico, ordem da trilha e próximo nível em um só lugar. Essa base alimenta automaticamente a Trilha de Carreira e evita cargos como <b>undefined</b> ou próximo nível incorreto.</p></div><button class="bc-close" onclick="document.getElementById(\'base-cargos-modal\').style.display=\'none\'">✕</button></div><div class="bc-body"><div class="bc-toolbar"><input id="bc-busca" placeholder="Buscar cargo..." oninput="BaseCargosState.filtro=this.value;renderBaseCargos()"><select id="bc-setor" onchange="BaseCargosState.setor=this.value;renderBaseCargos()"></select><button class="btn btn-p btn-sm" onclick="baseCargosNovo()">+ Novo cargo</button><button class="btn btn-g btn-sm" onclick="baseCargosReordenarAutomatico()">↕ Reordenar por nível</button><button class="btn btn-g btn-sm" onclick="baseCargosSalvarTudo()">💾 Salvar tudo</button></div><div class="bc-small" style="margin-bottom:10px">Dica: em “Próximo nível”, o sistema lista os cargos do próximo nível hierárquico para você selecionar manualmente.</div><div class="bc-table-wrap"><table class="bc-table"><thead><tr><th>Setor</th><th>Cargo</th><th>Nível hierárquico</th><th>Ordem</th><th>Próximo nível</th><th>Ações</th></tr></thead><tbody id="bc-tbody"></tbody></table></div></div></div>';
    document.body.appendChild(div);
  }
  function addToolbarButton(){
    var tb=document.getElementById('intra-org-rh-toolbar'); if(!tb || document.getElementById('btn-base-cargos')) return;
    var b=document.createElement('button'); b.id='btn-base-cargos'; b.className='btn btn-g btn-sm'; b.type='button'; b.textContent='📚 Base de Cargos'; b.onclick=abrirBaseCargos;
    tb.insertBefore(b, tb.firstChild);
  }
  window.abrirBaseCargos = async function(){
    if(!isRH()){ alert('A base de cargos é liberada apenas para o RH.'); return; }
    ensureModal();
    var modal=document.getElementById('base-cargos-modal'); modal.style.display='flex';
    modal.querySelector('#bc-tbody').innerHTML='<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--ink-30)">⏳ Carregando base...</td></tr>';
    var setores = await intraOrgGetSetores(true).catch(function(){return window._intraOrgSetores||[];});
    BaseCargosState.setores = (setores||[]).map(function(s){ return Object.assign({}, s, {cargos:Array.isArray(s.cargos)?s.cargos.map(normCargo):[]}); });
    var sel=document.getElementById('bc-setor');
    sel.innerHTML='<option value="__all__">Todos os setores</option>' + BaseCargosState.setores.map(function(s){return '<option value="'+esc(s.id)+'">'+esc(s.nome)+'</option>';}).join('');
    renderBaseCargos();
  };
  window.renderBaseCargos = function(){
    var tb=document.getElementById('bc-tbody'); if(!tb) return;
    var filtro=normKey(BaseCargosState.filtro||''), setorFiltro=BaseCargosState.setor||'__all__';
    var N=niveis(), rows=[];
    BaseCargosState.setores.forEach(function(s){
      if(setorFiltro!=='__all__' && String(s.id)!==String(setorFiltro)) return;
      var cargos=[...(s.cargos||[])].sort(function(a,b){return (a.ordem||99)-(b.ordem||99) || (a.nivel||0)-(b.nivel||0);});
      cargos.forEach(function(c, idx){ if(filtro && !normKey(c.nome).includes(filtro) && !normKey(s.nome).includes(filtro)) return; rows.push({s:s,c:c,idx:idx}); });
    });
    if(!rows.length){ tb.innerHTML='<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--ink-30)">Nenhum cargo encontrado.</td></tr>'; return; }
    tb.innerHTML = rows.map(function(r){
      var s=r.s,c=r.c, sid=esc(s.id), nome=esc(c.nome);
      var allNext=[];
      (s.cargos||[]).forEach(function(x){ if(normKey(x.nome)!==normKey(c.nome)) allNext.push({cargo:x,setor:s}); });
      var nextLevel=parseInt(c.nivel||0,10)+1;
      var nextCandidates=allNext.filter(function(x){return parseInt(x.cargo.nivel||0,10)===nextLevel;});
      if(!nextCandidates.length) nextCandidates=allNext.filter(function(x){return parseInt(x.cargo.nivel||0,10)>parseInt(c.nivel||0,10);});
      if(!nextCandidates.length) nextCandidates=allNext;
      nextCandidates.sort(function(a,b){return (a.cargo.nivel||99)-(b.cargo.nivel||99)||(a.cargo.ordem||99)-(b.cargo.ordem||99)||String(a.cargo.nome).localeCompare(String(b.cargo.nome));});
      var nextOptions='<option value="">Selecione o próximo cargo</option><option value="__none__" '+(c.proximo==='__none__'?'selected':'')+'>Não possui próximo nível</option>' + nextCandidates.map(function(x){ return '<option value="'+esc(x.cargo.nome)+'" '+(normKey(c.proximo)===normKey(x.cargo.nome)?'selected':'')+'>'+esc(x.cargo.nome)+' — '+esc(N[x.cargo.nivel]||('Nível '+x.cargo.nivel))+'</option>'; }).join('');
      var nivelOptions=Object.keys(N).map(function(k){ return '<option value="'+k+'" '+(String(c.nivel)===String(k)?'selected':'')+'>'+k+' - '+esc(N[k])+'</option>'; }).join('');
      return '<tr data-setor="'+sid+'" data-cargo="'+nome+'"><td><span class="bc-pill">'+esc(s.nome)+'</span></td><td><input value="'+nome+'" onchange="baseCargosUpdate(\''+sid+'\',\''+nome+'\',\'nome\',this.value)"></td><td><select onchange="baseCargosUpdate(\''+sid+'\',\''+nome+'\',\'nivel\',this.value)">'+nivelOptions+'</select></td><td><input type="number" min="1" value="'+esc(c.ordem)+'" style="width:80px" onchange="baseCargosUpdate(\''+sid+'\',\''+nome+'\',\'ordem\',this.value)"></td><td><select onchange="baseCargosUpdate(\''+sid+'\',\''+nome+'\',\'proximo\',this.value)">'+nextOptions+'</select></td><td><div class="bc-actions"><button class="btn btn-g btn-sm" onclick="baseCargosEditarDetalhes(\''+sid+'\',\''+nome+'\')">✏️ Detalhes</button><button class="btn btn-sm" style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca" onclick="baseCargosExcluir(\''+sid+'\',\''+nome+'\')">🗑</button></div></td></tr>';
    }).join('');
  };
  function findCargo(sid, nome){ var s=BaseCargosState.setores.find(function(x){return String(x.id)===String(sid);}); if(!s) return {}; var c=(s.cargos||[]).find(function(x){return normKey(x.nome)===normKey(nome);}); return {s:s,c:c}; }
  window.baseCargosUpdate=function(sid, nome, campo, valor){ var f=findCargo(sid,nome), s=f.s, c=f.c; if(!s||!c) return; var old=c.nome; if(campo==='nome'){ c.nome=safe(valor,'Cargo sem nome'); s.cargos.forEach(function(x){ if(normKey(x.proximo)===normKey(old)) x.proximo=c.nome; }); } else if(campo==='nivel'||campo==='ordem'){ c[campo]=parseInt(valor,10)||1; } else c[campo]=safe(valor,''); renderBaseCargos(); };
  window.baseCargosNovo=function(){
    var sid=BaseCargosState.setor && BaseCargosState.setor!=='__all__' ? BaseCargosState.setor : (BaseCargosState.setores[0]&&BaseCargosState.setores[0].id);
    if(!sid){ alert('Cadastre um setor primeiro.'); return; }
    var f=findCargo(sid,'__x__'), s=BaseCargosState.setores.find(function(x){return String(x.id)===String(sid);});
    var nome=prompt('Nome do novo cargo:'); if(!nome) return;
    var max=Math.max(0,...(s.cargos||[]).map(function(c){return c.ordem||0;}));
    s.cargos.push({nome:safe(nome),nivel:3,ordem:max+1,proximo:''}); BaseCargosState.setor=sid; var sel=document.getElementById('bc-setor'); if(sel) sel.value=sid; renderBaseCargos();
  };
  window.baseCargosExcluir=function(sid,nome){ var f=findCargo(sid,nome); if(!f.s||!f.c) return; if(!confirm('Remover este cargo da trilha?')) return; f.s.cargos=f.s.cargos.filter(function(c){return normKey(c.nome)!==normKey(nome);}); f.s.cargos.forEach(function(c){ if(normKey(c.proximo)===normKey(nome)) c.proximo=''; }); renderBaseCargos(); };
  window.baseCargosEditarDetalhes=function(sid,nome){ document.getElementById('base-cargos-modal').style.display='none'; if(typeof intraOrgAbrirEditarCargo==='function') intraOrgAbrirEditarCargo(nome,sid); };
  window.baseCargosReordenarAutomatico=function(){ BaseCargosState.setores.forEach(function(s){ s.cargos=(s.cargos||[]).sort(function(a,b){return (a.nivel||0)-(b.nivel||0) || String(a.nome).localeCompare(String(b.nome));}).map(function(c,i){c.ordem=i+1; return c;}); }); renderBaseCargos(); };
  window.baseCargosSalvarTudo=async function(){
    try{
      for(const s of BaseCargosState.setores){
        s.cargos=(s.cargos||[]).map(normCargo).sort(function(a,b){return (a.ordem||99)-(b.ordem||99);});
        await db.collection(col('org_setores')).doc(s.id).set(s,{merge:true});
      }
      window._intraOrgSetores=null; if(typeof _intraOrgSetores!=='undefined') _intraOrgSetores=null;
      if(typeof addNotif==='function') addNotif('Base de cargos salva com sucesso!', 'success'); else alert('Base de cargos salva com sucesso!');
      await intraRenderOrganograma();
      if(window._intraOrgAtualSetor|| (typeof _intraOrgAtualSetor!=='undefined'&&_intraOrgAtualSetor)) await intraOrgAbrirTrilha(window._intraOrgAtualSetor||_intraOrgAtualSetor);
    }catch(e){ console.error(e); alert('Erro ao salvar a base de cargos: '+(e.message||e)); }
  };
  var oldRender=window.intraRenderOrganograma;
  if(typeof oldRender==='function') window.intraRenderOrganograma=async function(){ var r=await oldRender.apply(this,arguments); addToolbarButton(); return r; };
  document.addEventListener('DOMContentLoaded', addToolbarButton);
  setTimeout(addToolbarButton,800);
})();
