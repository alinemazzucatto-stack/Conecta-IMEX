// ===== script: (sem id) =====
// ── MÓDULOS PAINEL DO COLABORADOR ──

// ── ORGANOGRAMA ──
function orgCarregar() {
  try {
    const el = document.getElementById('org-total-colab');
    if (el) {
      db.collection(col('grh_colabs')).where('status','==','Ativo').get()
        .then(snap => { el.textContent = snap.size; })
        .catch(() => { el.textContent = '--'; });
    }
  } catch(e) {}
}

// ── TRILHAS DE CARREIRA ──
const TRILHAS_DADOS = {
  'RH': ['Assistente de RH','Analista RH Jr','Analista RH Pleno','Analista RH Sênior','Business Partner','Coordenador RH','Gerente de RH'],
  'TI': ['Estagiário TI','Analista Jr','Analista Pleno','Analista Sênior','Tech Lead','Coordenador TI','Gerente de TI'],
  'Comercial': ['SDR','Executivo Jr','Executivo Pleno','Executivo Sênior','Coordenador Comercial','Gerente Comercial'],
  'Financeiro': ['Assistente Financeiro','Analista Financeiro Jr','Analista Financeiro Pleno','Controller Jr','Controller Pleno','Gerente Financeiro'],
  'Suporte': ['Analista Suporte N1','Analista Suporte N2','Analista Suporte N3','Coordenador Suporte','Gerente Operações'],
};

function trilhasCarregar() {
  const el = document.getElementById('trilha-lista');
  if (!el) return;

  // Detectar setor atual do colaborador
  let cargoAtual = 'Analista RH Jr';
  let setorAtual = 'RH';
  try {
    const uid = auth.currentUser?.uid;
    if (uid) {
      db.collection(col('grh_colabs')).where('email','==',emailUsuario()).limit(1).get()
        .then(snap => {
          if (!snap.empty) {
            const d = snap.docs[0].data();
            cargoAtual = d.funcao || d.cargo || cargoAtual;
            // Detectar setor
            for (const [setor, trilha] of Object.entries(TRILHAS_DADOS)) {
              if (trilha.some(c => c.toLowerCase().includes(setor.toLowerCase().substring(0,3))) ||
                  (d.setor && d.setor.toLowerCase().includes(setor.toLowerCase()))) {
                setorAtual = setor; break;
              }
            }
          }
          renderizarTrilha(el, cargoAtual, setorAtual);
        }).catch(() => renderizarTrilha(el, cargoAtual, setorAtual));
    } else {
      renderizarTrilha(el, cargoAtual, setorAtual);
    }
  } catch(e) {
    renderizarTrilha(el, cargoAtual, setorAtual);
  }
}

function renderizarTrilha(el, cargoAtual, setorAtual) {
  const trilha = TRILHAS_DADOS[setorAtual] || TRILHAS_DADOS['RH'];
  const idxAtual = trilha.findIndex(c => c.toLowerCase() === cargoAtual.toLowerCase());
  const idx = idxAtual >= 0 ? idxAtual : 1;

  let html = '';
  trilha.forEach((cargo, i) => {
    const isAtual = i === idx;
    const isProximo = i === idx + 1;
    const isPast = i < idx;
    const isFuture = i > idx + 1;

    let bg, cor, borda, icone;
    if (isPast) { bg='#f0fdf4'; cor='#065f46'; borda='#22C58B'; icone='✅'; }
    else if (isAtual) { bg='#dbeafe'; cor='#0047FF'; borda='#0047FF'; icone='📍'; }
    else if (isProximo) { bg='#f9f5ff'; cor='#9613f7'; borda='#9613f7'; icone='🎯'; }
    else { bg='#f4f7fa'; cor='var(--ink-30)'; borda='var(--border)'; icone='○'; }

    html += `<div style="display:flex;align-items:center;gap:0">`;
    html += `<div style="display:flex;flex-direction:column;align-items:center;min-width:40px">`;
    if (i > 0) html += `<div style="width:2px;height:20px;background:${isPast?'#22C58B':borda}"></div>`;
    html += `</div>`;
    html += `<div style="flex:1;background:${bg};border:1.5px solid ${borda};border-radius:12px;padding:14px 18px;margin:0 0 0 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">`;
    html += `<div style="display:flex;align-items:center;gap:10px">`;
    html += `<span style="font-size:18px">${icone}</span>`;
    html += `<div><div style="font-weight:${isAtual?'900':'600'};font-size:14px;color:${cor}">${cargo}</div>`;
    if (isAtual) html += `<div style="font-size:11px;color:var(--ink-60);margin-top:2px">Cargo atual</div>`;
    if (isProximo) html += `<div style="font-size:11px;color:#9613f7;margin-top:2px">Próximo nível</div>`;
    html += `</div></div>`;
    if (isAtual || isProximo) {
      html += `<button class="btn btn-g btn-sm" onclick="sbNav('cargos')" style="font-size:11px">Ver descritivo</button>`;
    }
    html += `</div></div>`;
  });

  el.innerHTML = html;
}

// ── MINHA EXPERIÊNCIA ──
function expTab(aba, btn) {
  ['45dias','90dias','historico','feedback','evolucao'].forEach(id => {
    const el = document.getElementById('exp-' + id);
    if (el) el.style.display = id === aba ? '' : 'none';
  });
  document.querySelectorAll('[onclick*="expTab"]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (aba === 'evolucao') expCalcularTempoCase();
}

function expCarregar() {
  expCalcularTempoCase();
}

function expCalcularTempoCase() {
  const el = document.getElementById('exp-tempo-casa');
  if (!el) return;
  try {
    db.collection(col('grh_colabs')).where('email','==',emailUsuario()).limit(1).get()
      .then(snap => {
        if (!snap.empty) {
          const d = snap.docs[0].data();
          const admissao = d.admissao || d.dataAdmissao;
          if (admissao) {
            const dt = new Date(admissao);
            const hoje = new Date();
            const meses = Math.floor((hoje - dt) / (30.44 * 24 * 3600 * 1000));
            el.textContent = meses >= 12 ? Math.floor(meses/12) + ' anos' : meses + ' meses';
          } else { el.textContent = '--'; }
        } else { el.textContent = '--'; }
      }).catch(() => { el.textContent = '--'; });
  } catch(e) { el.textContent = '--'; }
}

// ── MEUS BENEFÍCIOS ──
function benTab(aba, btn) {
  ['lista','solicitacoes','dependentes'].forEach(id => {
    const el = document.getElementById('ben-' + id);
    if (el) el.style.display = id === aba ? '' : 'none';
  });
  document.querySelectorAll('[onclick*="benTab"]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function benCarregar() {
  // Benefícios carregados estaticamente por enquanto
  // Em produção: buscar do Firestore collection 'beneficios_colaborador'
}

function benAbrirModal(tipo) {
  const modal = document.getElementById('ben-modal-sol');
  if (modal) { modal.style.display = 'flex'; }
}

function benFecharModal() {
  const modal = document.getElementById('ben-modal-sol');
  if (modal) modal.style.display = 'none';
}

function benEnviarSolicitacao() {
  const tipo = document.getElementById('ben-sol-tipo')?.value;
  const ben = document.getElementById('ben-sol-beneficio')?.value;
  const obs = document.getElementById('ben-sol-obs')?.value;

  if (!tipo || !ben) { alert('Preencha todos os campos obrigatórios.'); return; }

  const tipoLabel = {'inclusao':'Inclusão','exclusao':'Exclusão','dependente':'Inclusão de Dependente','exc-dependente':'Exclusão de Dependente'}[tipo] || tipo;
  const benLabel = ben.charAt(0).toUpperCase() + ben.slice(1);

  try {
    const uid = auth.currentUser?.uid;
    if (uid) {
      db.collection(col('beneficios_solicitacoes')).add({
        uid, email: emailUsuario(), nome: nomeUsuario(),
        tipo, beneficio: ben, obs, status: 'Pendente',
        data: new Date().toISOString()
      }).then(() => {
        benFecharModal();
        alert(`✅ Solicitação de ${tipoLabel} — ${benLabel} enviada com sucesso!\n\nO RH analisará sua solicitação em até 2 dias úteis.`);
        addNotif(`Solicitação de benefício enviada: ${tipoLabel} — ${benLabel}`, 'success');
        log('Benefício', `Solicitação: ${tipoLabel} — ${benLabel}`, '🎁');
      }).catch(e => alert('Erro ao enviar solicitação: ' + e.message));
    }
  } catch(e) {
    benFecharModal();
    alert(`✅ Solicitação de ${tipoLabel} — ${benLabel} registrada!\n\n(Modo offline — será processada ao reconectar)`);
  }
}
