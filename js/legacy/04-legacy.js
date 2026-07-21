// ===== script: (sem id) =====
// ── FIX: edição completa da trilha (nível hierárquico + próximo nível manual) ──
(function(){
  function safeTxt(v, fb){ if(v===undefined || v===null) return fb || ''; var t=String(v).trim(); return (t && t.toLowerCase()!=='undefined' && t.toLowerCase()!=='null') ? t : (fb || ''); }
  function normKey(v){ return safeTxt(v).toLowerCase().trim(); }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]; }); }
  function normCargo(c, idx){
    if (typeof c === 'string') c = {nome:c}; c = c || {};
    var nivel = parseInt(c.nivel ?? c.level ?? c.grade ?? 1, 10);
    var ordem = parseInt(c.ordem ?? c.order ?? (idx+1), 10);
    return Object.assign({}, c, {
      nome: safeTxt(c.nome ?? c.cargo ?? c.titulo ?? c.title ?? c.name, 'Cargo sem nome'),
      nivel: Number.isFinite(nivel) && nivel > 0 ? nivel : 1,
      ordem: Number.isFinite(ordem) && ordem > 0 ? ordem : idx + 1,
      proximo: safeTxt(c.proximo ?? c.proximoCargo ?? c.nextCargo ?? c.next, '')
    });
  }
  function getNiveis(){ return {1:'Trainee / Estagiário',2:'Júnior / Assistente',3:'Pleno / Analista',4:'Sênior / Especialista',5:'Líder / Coordenador',6:'Gerente / Diretor',7:'C-Level / Presidente'}; }
  function getProximo(cargos, cargo, idx){
    var manual = safeTxt(cargo && cargo.proximo, '');
    if (manual === '__none__' || manual.toLowerCase() === 'nenhum' || manual.toLowerCase() === 'sem próximo') return null;
    if (manual) {
      var achado = cargos.find(function(c){ return normKey(c.nome) === normKey(manual); });
      if (achado) return achado;
    }
    return cargos[idx + 1] || null;
  }
  function ensureNextField(){
    var nome = document.getElementById('intra-org-cargo-nome');
    var nivel = document.getElementById('intra-org-cargo-nivel');
    if (!nome || !nivel) return;
    if (!document.getElementById('intra-org-cargo-original')) {
      var h = document.createElement('input'); h.type='hidden'; h.id='intra-org-cargo-original';
      var setorHidden = document.getElementById('intra-org-cargo-setor-id');
      (setorHidden && setorHidden.parentNode ? setorHidden.parentNode : nome.parentNode).appendChild(h);
    }
    if (!document.getElementById('intra-org-cargo-proximo')) {
      var wrap = document.createElement('div');
      wrap.className = 'field';
      wrap.innerHTML = '<label>Próximo nível / próximo cargo</label><select id="intra-org-cargo-proximo" style="width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:8px;font-size:14px;font-family:\'Inter\',sans-serif"><option value="">Selecione o próximo cargo</option><option value="__none__">Não possui próximo nível</option></select>';
      nivel.closest('.field').insertAdjacentElement('afterend', wrap);
    }
    if (!nivel.dataset.proximoListener) {
      nivel.dataset.proximoListener = '1';
      nivel.addEventListener('change', function(){
        var setorId = (document.getElementById('intra-org-cargo-setor-id') || {}).value || '';
        var setorAtual = null;
        try { setorAtual = (window._intraOrgSetores || []).find(function(s){ return String(s.id) === String(setorId); }); } catch(e){}
        var atualNome = (document.getElementById('intra-org-cargo-nome') || {}).value || '';
        fillNextOptions(setorAtual, atualNome, '', this.value);
      });
    }
  }
  function fillNextOptions(setor, atualNome, valor, nivelAtual){
    ensureNextField();
    var sel = document.getElementById('intra-org-cargo-proximo'); if (!sel) return;
    var trilhas = [];
    if (setor) trilhas.push(setor);
    try {
      var sid = setor && setor.id;
      if ((!trilhas.length || !((setor.cargos||[]).length)) && sid && window._intraOrgSetores) {
        var sFound = window._intraOrgSetores.find(function(s){ return String(s.id) === String(sid); });
        if (sFound) trilhas = [sFound];
      }
    } catch(e){}
    if (!trilhas.length) { try { trilhas = window._intraOrgSetores || []; } catch(e){ trilhas = []; } }
    var todos = [];
    (trilhas || []).forEach(function(s){
      (Array.isArray(s.cargos) ? s.cargos : []).map(normCargo).forEach(function(c){
        if (normKey(c.nome) === normKey(atualNome)) return;
        todos.push({cargo:c, setor:s});
      });
    });
    var nivelNum = parseInt(nivelAtual || ((document.getElementById('intra-org-cargo-nivel')||{}).value) || 0, 10);
    var candidatos = [];
    if (Number.isFinite(nivelNum) && nivelNum > 0) {
      candidatos = todos.filter(function(x){ return parseInt(x.cargo.nivel || 0,10) === nivelNum + 1; });
      if (!candidatos.length) candidatos = todos.filter(function(x){ return parseInt(x.cargo.nivel || 0,10) > nivelNum; });
    }
    if (!candidatos.length) candidatos = todos;
    candidatos.sort(function(a,b){ return (a.cargo.nivel||99)-(b.cargo.nivel||99) || (a.cargo.ordem||99)-(b.cargo.ordem||99) || String(a.cargo.nome).localeCompare(String(b.cargo.nome)); });
    sel.innerHTML = '<option value="">Selecione o próximo cargo</option><option value="__none__">Não possui próximo nível</option>';
    candidatos.forEach(function(x){
      var opt = document.createElement('option');
      opt.value = x.cargo.nome;
      opt.textContent = x.cargo.nome + ' — ' + (getNiveis()[x.cargo.nivel] || ('Nível ' + x.cargo.nivel));
      sel.appendChild(opt);
    });
    sel.value = valor || '';
    if (valor && sel.value !== valor) {
      var opt = document.createElement('option'); opt.value = valor; opt.textContent = valor + ' (salvo anteriormente)'; sel.appendChild(opt); sel.value = valor;
    }
  }

  window.intraOrgRenderTrilha = function(setor, descList, isRH, ordenando){
    var body = document.getElementById('intra-org-trilha-body'); if (!body || !setor) return;
    var cor = setor.cor || '#0047FF', NIVEIS = getNiveis();
    var cargos = Array.isArray(setor.cargos) ? setor.cargos.map(normCargo).sort(function(a,b){return (a.ordem||99)-(b.ordem||99);}) : [];
    descList = Array.isArray(descList) ? descList : [];
    if (!cargos.length) { body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-30)"><div style="font-size:36px;margin-bottom:10px">📭</div><p>Nenhum cargo cadastrado nesta trilha ainda.</p>' + (isRH ? '<button class="btn btn-p btn-sm" style="margin-top:10px" onclick="intraOrgAbrirNovoCargo()">+ Adicionar Cargo</button>' : '') + '</div>'; return; }
    var html = '';
    cargos.forEach(function(cargo, idx){
      var desc = descList.find(function(d){ return normKey(d && d.cargo) === normKey(cargo.nome); });
      var nivelLabel = NIVEIS[cargo.nivel] || ('Nível ' + (cargo.nivel || '?'));
      var proximo = getProximo(cargos, cargo, idx);
      if (idx > 0) html += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:-4px 0"><div style="width:2px;height:24px;background:' + cor + '50"></div><span style="font-size:11px;color:' + cor + ';font-weight:700;opacity:.6">↓</span><div style="width:2px;height:24px;background:' + cor + '50"></div></div>';
      html += '<div class="io-trilha-item" data-cargo="' + esc(cargo.nome) + '" data-setor="' + esc(setor.id) + '" data-setornome="' + esc(setor.nome) + '" style="background:' + cor + (idx===0?'18':idx===1?'12':'08') + ';border:1.5px solid ' + cor + (idx===0?'60':'25') + '"' + (ordenando ? ' draggable="true" ondragstart="intraOrgDragStart(event,'+idx+')" ondragover="event.preventDefault()" ondrop="intraOrgDrop(event,'+idx+')"' : '') + '>';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div style="flex:1"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="font-size:15px;font-weight:800;color:var(--ink)">' + esc(cargo.nome) + '</span>' + (desc ? '<span style="font-size:10px;background:' + cor + '20;color:' + cor + ';border-radius:4px;padding:2px 7px;font-weight:700">✓ Descritivo</span>' : '') + '</div><div style="font-size:11px;color:var(--ink-60)">' + esc(nivelLabel) + '</div>' + (proximo && !ordenando ? '<div style="font-size:11px;color:' + cor + ';margin-top:4px;font-weight:600">→ Próximo: ' + esc(proximo.nome) + '</div>' : '') + '</div>';
      html += ordenando ? '<div class="io-drag-handle" style="font-size:16px;user-select:none">⋮⋮</div>' : (isRH ? '<button type="button" class="io-trilha-edit-btn" data-cargo="' + esc(cargo.nome) + '" data-setor="' + esc(setor.id) + '" style="background:rgba(0,0,0,.06);border:none;border-radius:8px;padding:5px 9px;cursor:pointer;font-size:13px">✏️</button>' : '');
      html += '</div></div>';
    });
    body.innerHTML = html; body._cargosOrder = cargos; body._setorId = setor.id;
  };
  window.intraOrgAbrirEditarCargo = async function(cargoNome, setorId){
    try{
      var m = document.getElementById('intra-org-modal-cargo'); if (m) m.style.display='none';
      ensureNextField();
      var setores = await intraOrgGetSetores(true).catch(function(){ return window._intraOrgSetores || []; });
      var setor = (setores || []).find(function(s){ return String(s.id) === String(setorId); });
      if (!setor) { alert('Não encontrei o setor para edição. Reabra a trilha e tente novamente.'); return; }
      setor.cargos = Array.isArray(setor.cargos) ? setor.cargos.map(normCargo) : [];
      var cargo = setor.cargos.find(function(c){ return normKey(c.nome) === normKey(cargoNome); }) || normCargo({nome:cargoNome}, 0);
      var descList = await orgGetDescritivos().catch(function(){ return []; });
      var desc = (descList || []).find(function(d){ return normKey(d && d.cargo) === normKey(cargo.nome); });
      var setVal = function(id,v){ var e=document.getElementById(id); if(e) e.value = v || ''; };
      var title = document.getElementById('intra-org-cargo-modal-title'); if (title) title.textContent = 'Editar: ' + cargo.nome;
      setVal('intra-org-cargo-original', cargo.nome); setVal('intra-org-cargo-id', desc && desc._id); setVal('intra-org-cargo-setor-id', setorId); setVal('intra-org-cargo-ordem', cargo.ordem); setVal('intra-org-cargo-nome', cargo.nome); setVal('intra-org-cargo-nivel', cargo.nivel);
      setVal('intra-org-cargo-missao', desc && desc.missao); setVal('intra-org-cargo-resp', desc && desc.responsabilidades); setVal('intra-org-cargo-tec', desc && desc.tecnicos); setVal('intra-org-cargo-comp', desc && desc.comportamentos); setVal('intra-org-cargo-sal-min', desc && desc.salMin); setVal('intra-org-cargo-sal-max', desc && desc.salMax);
      setVal('intra-org-cargo-proximo','intra-org-cargo-prox-comp', desc && desc.competenciasProx); setVal('intra-org-cargo-prox-tec', desc && desc.tecnicosProx); setVal('intra-org-cargo-prox-tempo', desc && desc.tempoProx); setVal('intra-org-cargo-prox-metas', desc && desc.metasProx); setVal('intra-org-cargo-prox-dicas', desc && desc.dicasProx);
      fillNextOptions(setor, cargo.nome, cargo.proximo || '', cargo.nivel);
      var delBtn = document.getElementById('intra-org-cargo-del'); if (delBtn) delBtn.style.display='block';
      if (typeof intraOrgModalTab === 'function') intraOrgModalTab('descritivo', document.querySelector('.io-modal-tab'));
      var editModal = document.getElementById('intra-org-modal-cargo-edit'); if (editModal) editModal.style.display='flex';
    }catch(e){ console.error(e); alert('Não consegui abrir a edição deste cargo. Erro: ' + (e.message || e)); }
  };
  window.intraOrgAbrirNovoCargo = async function(){
    ensureNextField();
    var setorId = window._intraOrgAtualSetor || _intraOrgAtualSetor || '';
    var setores = await intraOrgGetSetores(true).catch(function(){ return []; });
    var setor = (setores || []).find(function(s){ return String(s.id) === String(setorId); });
    var setVal = function(id,v){ var e=document.getElementById(id); if(e) e.value = v || ''; };
    var title = document.getElementById('intra-org-cargo-modal-title'); if (title) title.textContent = 'Novo Cargo na Trilha';
    ['intra-org-cargo-original','intra-org-cargo-id','intra-org-cargo-ordem','intra-org-cargo-nome','intra-org-cargo-nivel','intra-org-cargo-missao','intra-org-cargo-resp','intra-org-cargo-tec','intra-org-cargo-comp','intra-org-cargo-sal-min','intra-org-cargo-sal-max','intra-org-cargo-proximo','intra-org-cargo-prox-comp','intra-org-cargo-prox-tec','intra-org-cargo-prox-tempo','intra-org-cargo-prox-metas','intra-org-cargo-prox-dicas'].forEach(function(id){ setVal(id,''); });
    setVal('intra-org-cargo-setor-id', setorId); fillNextOptions(setor, '', '', 0);
    var delBtn = document.getElementById('intra-org-cargo-del'); if (delBtn) delBtn.style.display='none';
    var editModal = document.getElementById('intra-org-modal-cargo-edit'); if (editModal) editModal.style.display='flex';
  };
  window.intraOrgSalvarCargo = async function(){
    var g = function(id){ return (document.getElementById(id)?.value || '').trim(); };
    var cargoNome = g('intra-org-cargo-nome'), oldNome = g('intra-org-cargo-original'), setorId = g('intra-org-cargo-setor-id');
    var nivel = parseInt(g('intra-org-cargo-nivel'), 10) || 3, proximo = g('intra-org-cargo-proximo');
    if (!cargoNome) { alert('Informe o nome do cargo.'); return; }
    if (!setorId) { alert('Não encontrei o setor deste cargo. Reabra a trilha e tente novamente.'); return; }
    var setores = await intraOrgGetSetores(true); var setor = (setores || []).find(function(s){ return String(s.id) === String(setorId); });
    if (setor) {
      setor.cargos = Array.isArray(setor.cargos) ? setor.cargos.map(normCargo) : [];
      var existing = setor.cargos.find(function(c){ return normKey(c.nome) === normKey(oldNome || cargoNome); });
      if (!existing) existing = setor.cargos.find(function(c){ return normKey(c.nome) === normKey(cargoNome); });
      if (existing) { existing.nome = cargoNome; existing.nivel = nivel; existing.proximo = proximo; }
      else { var maxOrdem = Math.max(0, ...setor.cargos.map(function(c){return c.ordem || 0;})); setor.cargos.push({nome:cargoNome, nivel:nivel, proximo:proximo, ordem:maxOrdem+1}); }
      if (oldNome && normKey(oldNome) !== normKey(cargoNome)) setor.cargos.forEach(function(c){ if (normKey(c.proximo) === normKey(oldNome)) c.proximo = cargoNome; });
      await db.collection(col('org_setores')).doc(setorId).update({cargos:setor.cargos});
    }
    var dados = { cargo:cargoNome, setor:setor?.nome || '', nivel:String(nivel), proximoCargo:proximo, missao:g('intra-org-cargo-missao'), responsabilidades:g('intra-org-cargo-resp'), tecnicos:g('intra-org-cargo-tec'), comportamentos:g('intra-org-cargo-comp'), salMin:parseFloat(g('intra-org-cargo-sal-min')) || null, salMax:parseFloat(g('intra-org-cargo-sal-max')) || null, competenciasProx:g('intra-org-cargo-proximo','intra-org-cargo-prox-comp'), tecnicosProx:g('intra-org-cargo-prox-tec'), tempoProx:g('intra-org-cargo-prox-tempo'), metasProx:g('intra-org-cargo-prox-metas'), dicasProx:g('intra-org-cargo-prox-dicas'), atualizadoEm:new Date().toISOString() };
    var descId = g('intra-org-cargo-id');
    if (descId) await db.collection(col('org_descritivos')).doc(descId).update(dados); else await db.collection(col('org_descritivos')).add(Object.assign({}, dados, {criadoEm:new Date().toISOString()}));
    window._intraOrgSetores = null; if (typeof _intraOrgSetores !== 'undefined') _intraOrgSetores = null; if (typeof _orgDescritivos !== 'undefined') _orgDescritivos = null;
    var editModal = document.getElementById('intra-org-modal-cargo-edit'); if (editModal) editModal.style.display='none';
    if (typeof addNotif === 'function') addNotif('Cargo "' + cargoNome + '" salvo!', 'success');
    await intraRenderOrganograma(); if (window._intraOrgAtualSetor || _intraOrgAtualSetor) await intraOrgAbrirTrilha(window._intraOrgAtualSetor || _intraOrgAtualSetor);
  };
  window.intraOrgAbrirCargo = async function(cargoNome, setorId, setorNome){
    var setores = await intraOrgGetSetores(true).catch(function(){return [];});
    var setor = (setores || []).find(function(s){ return String(s.id) === String(setorId); });
    var cor = setor?.cor || '#0047FF', NIVEIS = getNiveis();
    var cargos = Array.isArray(setor?.cargos) ? setor.cargos.map(normCargo).sort(function(a,b){return (a.ordem||99)-(b.ordem||99);}) : [];
    var idx = cargos.findIndex(function(c){ return normKey(c.nome) === normKey(cargoNome); });
    var cargo = cargos[idx] || normCargo({nome:cargoNome}, idx < 0 ? 0 : idx);
    var proximo = getProximo(cargos, cargo, idx);
    var descList = await orgGetDescritivos().catch(function(){return [];});
    var desc = (descList || []).find(function(d){ return normKey(d && d.cargo) === normKey(cargo.nome); });
    var isRH = (_roleReal || role) === 'rh' || (_roleReal || role) === 'rh-colaborador';
    document.getElementById('intra-org-mc-setor').textContent = setorNome || setor?.nome || '';
    document.getElementById('intra-org-mc-titulo').textContent = cargo.nome;
    document.getElementById('intra-org-mc-nivel').textContent = NIVEIS[cargo.nivel] || ('Nível ' + cargo.nivel);
    document.getElementById('intra-org-mc-head').style.borderTop = '4px solid ' + cor;
    function secao(icon, titulo, conteudo){ if(!conteudo) return ''; return '<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">' + icon + ' ' + titulo + '</div><div style="background:var(--bg);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--ink);line-height:1.6;white-space:pre-wrap">' + esc(conteudo) + '</div></div>'; }
    var body = '';
    if (desc && (desc.missao || desc.responsabilidades || desc.tecnicos || desc.comportamentos)) {
      body += '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:' + cor + ';margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid ' + cor + '30">📋 Descritivo do Cargo</div>';
      body += secao('🎯','Missão',desc.missao) + secao('📝','Responsabilidades',desc.responsabilidades) + secao('⚙️','Conhecimentos Técnicos',desc.tecnicos) + secao('🧠','Perfil Comportamental',desc.comportamentos);
      if (desc.salMin || desc.salMax) body += '<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">💰 Faixa Salarial</div><span style="background:#f0fff4;color:#166534;border-radius:8px;padding:6px 14px;font-weight:700;font-size:13px">' + (desc.salMin ? grhBRL(desc.salMin) : '—') + ' → ' + (desc.salMax ? grhBRL(desc.salMax) : '—') + '</span></div>';
    } else body += '<div style="background:var(--bg);border-radius:10px;padding:14px 16px;margin-bottom:14px;font-size:13px;color:var(--ink-60)">📋 Descritivo não cadastrado ainda para este cargo.</div>';
    if (proximo) {
      var descProx = (descList || []).find(function(d){ return normKey(d && d.cargo) === normKey(proximo.nome); });
      body += '<div style="background:' + cor + '08;border:2px solid ' + cor + '30;border-radius:14px;padding:18px 20px;margin-top:6px"><div style="font-size:13px;font-weight:800;color:' + cor + ';margin-bottom:12px">🚀 Próximo nível definido</div><div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;background:#fff;border-radius:10px;padding:10px 14px"><div style="width:36px;height:36px;border-radius:50%;background:' + cor + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;flex-shrink:0">→</div><div><div style="font-size:14px;font-weight:800;color:var(--ink)">' + esc(proximo.nome) + '</div><div style="font-size:11px;color:var(--ink-60)">' + esc(NIVEIS[proximo.nivel] || '') + '</div></div></div>';
      if (descProx && (descProx.competenciasProx || descProx.tecnicosProx || descProx.tempoProx || descProx.metasProx || descProx.dicasProx)) body += secao('🎯','Competências a Desenvolver',descProx.competenciasProx)+secao('⚙️','Conhecimentos Técnicos Necessários',descProx.tecnicosProx)+secao('⏱️','Experiência / Tempo Mínimo',descProx.tempoProx)+secao('📊','Metas / Resultados Esperados',descProx.metasProx)+secao('💡','Dicas de Desenvolvimento',descProx.dicasProx); else body += '<div style="font-size:13px;color:var(--ink-60);font-style:italic">Os critérios de progressão ainda não foram cadastrados pelo RH.</div>';
      body += '</div>';
    } else body += '<div style="background:#fef3c7;border-radius:12px;padding:14px 16px;margin-top:8px;font-size:13px;color:#92400e;font-weight:600">⭐ Este cargo está configurado sem próximo nível.</div>';
    document.getElementById('intra-org-mc-body').innerHTML = body;
    var rhDiv = document.getElementById('intra-org-mc-rh-btns'); if (rhDiv) { if (isRH) { rhDiv.style.display='flex'; rhDiv.innerHTML = '<button class="btn btn-p btn-sm" onclick="intraOrgAbrirEditarCargo(' + JSON.stringify(cargo.nome) + ',' + JSON.stringify(setorId) + ')">✏️ Editar Cargo / Nível</button><button class="btn btn-g btn-sm" onclick="intraOrgRemoverCargoTrilha(' + JSON.stringify(setorId) + ',' + JSON.stringify(cargo.nome) + ')">🗑 Remover da Trilha</button>'; } else rhDiv.style.display='none'; }
    document.getElementById('intra-org-modal-cargo').style.display = 'flex';
  };
  ensureNextField();
})();

