// ===== script: patch-trilha-cards-expansiveis-js =====
(function(){
  const cargos = [
    {
      id:'atual', tipo:'atual', icon:'📍', nivel:'Cargo atual', titulo:'Analista de RH Júnior', progresso:42,
      resumo:'Você está no nível inicial da trilha de RH, consolidando rotinas operacionais e apoio aos processos de pessoas.',
      competencias:['Comunicação com colaboradores','Organização de rotinas e documentos','Atendimento interno','Controle de prazos','Apoio em benefícios e férias'],
      cursos:['Fundamentos de DP e RH','Atendimento ao colaborador','Excel/Sheets para rotinas de RH'],
      entregas:['Executar rotinas com qualidade','Apoiar admissões, férias e benefícios','Manter registros organizados']
    },
    {
      id:'pleno', icon:'🎯', nivel:'Próximo cargo', titulo:'Analista de RH Pleno', progresso:58,
      resumo:'Próximo passo da trilha, com maior autonomia, análise de indicadores e condução de processos com menor dependência do gestor.',
      competencias:['Condução de indicadores de RH','Autonomia em recrutamento e seleção','Análise de dados e relatórios','Apoio consultivo aos gestores','Comunicação assertiva em temas sensíveis'],
      cursos:['People Analytics e Indicadores de RH','Recrutamento e Seleção por Competências','Feedback e conversas difíceis','LGPD aplicada ao RH'],
      entregas:['Criar relatórios mensais de RH','Conduzir processos seletivos completos','Propor melhorias em processos internos'],
      requisitos:['12 meses no cargo atual','Avaliação mínima recomendada de 80%','Cursos obrigatórios concluídos','Validação do gestor imediato']
    },
    {
      id:'senior', icon:'⭐', nivel:'Próximo nível', titulo:'Analista de RH Sênior', progresso:26,
      resumo:'Nível com atuação estratégica, leitura de cenário, influência junto às lideranças e participação ativa em decisões de pessoas.',
      competencias:['Visão estratégica de pessoas','Gestão de projetos de RH','Influência com lideranças','Diagnóstico de clima e engajamento','Construção de políticas e processos'],
      cursos:['Gestão Estratégica de RH','Business Partner na prática','Pesquisa de Clima e Planos de Ação','Gestão de Projetos aplicada ao RH'],
      entregas:['Liderar projetos de melhoria','Apoiar decisões de gestores com dados','Desenhar políticas e fluxos de RH'],
      requisitos:['Domínio dos processos de RH','Histórico consistente de entregas','Capacidade analítica comprovada','Feedback positivo das áreas atendidas']
    },
    {
      id:'coord', icon:'🏆', nivel:'Liderança', titulo:'Coordenador(a) de RH', progresso:14,
      resumo:'Trilha de liderança, com foco em gestão de equipe, prioridades, indicadores, rituais de acompanhamento e visão sistêmica da área.',
      competencias:['Liderança e gestão de equipe','Gestão de prioridades e rituais','Tomada de decisão baseada em dados','Negociação com áreas internas','Desenvolvimento de pessoas'],
      cursos:['Liderança para RH','Gestão de Times e 1:1','Indicadores executivos de RH','Mediação de conflitos'],
      entregas:['Coordenar agenda da área','Desenvolver pessoas do time','Reportar indicadores à diretoria'],
      requisitos:['Experiência sênior consolidada','Perfil de liderança validado','Capacidade de gestão e priorização','Resultados sustentáveis na área']
    }
  ];

  function esc(v){ return String(v||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
  function list(arr){ return (arr||[]).map(x=>`<li>${esc(x)}</li>`).join(''); }

  window.abrirDetalheTrilhaCargo = function(id){
    const cargo = cargos.find(c=>c.id===id) || cargos[1];
    document.querySelectorAll('.trilha-next-card').forEach(c=>c.classList.toggle('active', c.dataset.cargo===id));
    const panel = document.getElementById('trilha-detail-panel');
    if(!panel) return;
    panel.innerHTML = `
      <div class="trilha-detail-head">
        <div>
          <h2>${cargo.icon||'🚀'} ${esc(cargo.titulo)}</h2>
          <p>${esc(cargo.resumo)}</p>
        </div>
        <button class="trilha-detail-close" onclick="fecharDetalheTrilhaCargo()">✕</button>
      </div>
      <div class="trilha-detail-grid">
        <div class="trilha-info-box">
          <h3>✅ Competências necessárias</h3>
          <ul>${list(cargo.competencias)}</ul>
        </div>
        <div class="trilha-info-box">
          <h3>🎓 Cursos recomendados</h3>
          <ul>${list(cargo.cursos)}</ul>
        </div>
        <div class="trilha-info-box">
          <h3>📌 Entregas esperadas</h3>
          <ul>${list(cargo.entregas)}</ul>
        </div>
      </div>
      ${cargo.requisitos ? `<div class="trilha-info-box" style="margin-top:16px;background:#fff7ed;border-color:#fed7aa"><h3>🧭 Requisitos para evolução</h3><ul>${list(cargo.requisitos)}</ul></div>` : ''}
    `;
    panel.classList.add('active');
    panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  };

  window.fecharDetalheTrilhaCargo = function(){
    document.querySelectorAll('.trilha-next-card').forEach(c=>c.classList.remove('active'));
    const panel=document.getElementById('trilha-detail-panel');
    if(panel) panel.classList.remove('active');
  };

  function renderTrilhaCarreiraCards(){
    const view = document.getElementById('view-trilhas');
    if(!view) return;
    const atual = cargos[0];
    const proximos = cargos.slice(1);
    view.innerHTML = `
      <div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important">
        <div class="h-content">
          <div class="h-eyebrow">Estrutura e Carreira · Evolução Profissional</div>
          <h1>TRILHAS DE CARREIRA</h1>
          <p>Visualize seu cargo atual e clique nos próximos cargos superiores para consultar competências, cursos e requisitos de evolução.</p>
        </div>
        <div class="h-stats">
          <div class="h-stat"><span class="h-num">${atual.progresso}%</span><span class="h-lbl">Evolução</span></div>
          <div class="h-stat"><span class="h-num">${proximos.length}</span><span class="h-lbl">Próximos níveis</span></div>
          <div class="h-stat"><span class="h-num">9</span><span class="h-lbl">Cursos</span></div>
        </div>
      </div>
      <div class="trilha-career-shell">
        <div class="trilha-current-card">
          <div>
            <div class="trilha-current-kicker">Cargo atual</div>
            <h2 class="trilha-current-title">${esc(atual.titulo)}</h2>
            <p class="trilha-current-desc">${esc(atual.resumo)}</p>
          </div>
          <div class="trilha-current-metrics">
            <div class="trilha-current-metric"><strong>${atual.progresso}%</strong><span>Progresso</span></div>
            <div class="trilha-current-metric"><strong>${atual.competencias.length}</strong><span>Competências</span></div>
            <div class="trilha-current-metric"><strong>${atual.cursos.length}</strong><span>Cursos base</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="trilha-section-title">
              <div>
                <h2>Próximos cargos superiores</h2>
                <p>Clique em um card para abrir competências necessárias, cursos recomendados e requisitos de evolução.</p>
              </div>
            </div>
            <div class="trilha-next-grid" style="margin-top:16px">
              ${proximos.map(c=>`
                <button type="button" class="trilha-next-card" data-cargo="${esc(c.id)}" onclick="abrirDetalheTrilhaCargo('${esc(c.id)}')">
                  <div class="trilha-next-top"><div class="trilha-next-icon">${c.icon}</div><span class="trilha-next-level">${esc(c.nivel)}</span></div>
                  <h3>${esc(c.titulo)}</h3>
                  <p>${esc(c.resumo)}</p>
                  <div class="trilha-progress-mini"><span style="width:${c.progresso}%"></span></div>
                  <div class="trilha-card-hint">Abrir detalhes →</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div id="trilha-detail-panel" class="trilha-detail-panel"></div>

        <div class="card">
          <div class="card-head"><div class="cht"><h2>🛤️ Linha de evolução</h2><p>Visão simples da sequência da trilha atual</p></div></div>
          <div class="card-body">
            <div class="trilha-road">
              <div class="trilha-road-node current"><div style="font-size:22px">📍</div><b>Atual</b><br><small>${esc(atual.titulo)}</small></div>
              ${proximos.map((c,i)=>`<div class="trilha-road-line ${i===0?'done':''}"></div><div class="trilha-road-node ${i===0?'next':''}"><div style="font-size:22px">${c.icon}</div><b>${i===0?'Próximo':'Futuro'}</b><br><small>${esc(c.titulo)}</small></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.renderTrilhaCarreiraCards = renderTrilhaCarreiraCards;
  window.trilhasCarregar = renderTrilhaCarreiraCards;

  const oldSbNav = window.sbNav;
  window.sbNav = function(id){
    const ret = oldSbNav ? oldSbNav.apply(this, arguments) : undefined;
    if(id === 'trilhas') setTimeout(renderTrilhaCarreiraCards, 0);
    return ret;
  };
})();

