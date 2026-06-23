// ===== script: grh-roadmap-js =====
(function(){
'use strict';

window.grhRoadmapPainelHTML = function(){
  return '<div class="rdm-wrap" data-grh-roadmap="1">' +
    '<div class="rdm-timeline">' +
      '<div class="rdm-tl-step done"><div class="rdm-tl-num">Fase 1</div><div class="rdm-tl-label">RH Operacional</div><span class="rdm-tl-badge">✅ Implantada</span></div>' +
      '<div class="rdm-tl-step next"><div class="rdm-tl-num">Fase 2</div><div class="rdm-tl-label">Desenvolvimento & Talentos</div><span class="rdm-tl-badge">Planejada</span></div>' +
      '<div class="rdm-tl-step next"><div class="rdm-tl-num">Fase 3</div><div class="rdm-tl-label">Recrutamento & Seleção</div><span class="rdm-tl-badge">Planejada</span></div>' +
      '<div class="rdm-tl-step next"><div class="rdm-tl-num">Fase 4</div><div class="rdm-tl-label">People Analytics</div><span class="rdm-tl-badge">Planejada</span></div>' +
    '</div>' +
    '<div class="rdm-grid">' +

      /* ── FASE 1 ── */
      '<div class="rdm-card">' +
        '<div class="rdm-card-head" style="background:linear-gradient(135deg,#10b981,#059669)">' +
          '<div class="rdm-phase-badge">✅ Fase 1</div>' +
          '<div class="rdm-card-title">RH Operacional</div>' +
          '<div class="rdm-card-sub">Módulos implantados e em produção</div>' +
        '</div>' +
        '<div class="rdm-card-body">' +
          '<div class="rdm-section-label">Gestão de RH</div>' +
          '<div class="rdm-items">' +
            '<span class="rdm-item done">✓ Colaboradores</span>' +
            '<span class="rdm-item done">✓ Endereços</span>' +
            '<span class="rdm-item done">✓ Remuneração</span>' +
            '<span class="rdm-item done">✓ Movimentações</span>' +
            '<span class="rdm-item done">✓ Férias</span>' +
            '<span class="rdm-item done">✓ Documentos</span>' +
            '<span class="rdm-item done">✓ Benefícios</span>' +
            '<span class="rdm-item done">✓ Admissão</span>' +
            '<span class="rdm-item done">✓ Desligamentos</span>' +
          '</div>' +
          '<div class="rdm-section-label">Conexão Interna</div>' +
          '<div class="rdm-items">' +
            '<span class="rdm-item done">✓ Intranet</span>' +
            '<span class="rdm-item done">✓ Comunicados</span>' +
            '<span class="rdm-item done">✓ Pesquisas</span>' +
            '<span class="rdm-item done">✓ Ouvidoria</span>' +
            '<span class="rdm-item done">✓ Aniversariantes</span>' +
            '<span class="rdm-item done">✓ Reconhecimento</span>' +
          '</div>' +
          '<div class="rdm-foot">🚀 100% operacional · Sistema em produção</div>' +
        '</div>' +
      '</div>' +

      /* ── FASE 2 ── */
      '<div class="rdm-card">' +
        '<div class="rdm-card-head" style="background:linear-gradient(135deg,#3b82f6,#4f46e5)">' +
          '<div class="rdm-phase-badge">⏳ Fase 2</div>' +
          '<div class="rdm-card-title">Desenvolvimento & Talentos</div>' +
          '<div class="rdm-card-sub">Crescimento e carreira dos colaboradores</div>' +
        '</div>' +
        '<div class="rdm-card-body">' +
          '<div class="rdm-section-label">Carreira</div>' +
          '<div class="rdm-items">' +
            '<span class="rdm-item plan">Trilhas de Carreira</span>' +
            '<span class="rdm-item plan">Meu Desenvolvimento</span>' +
            '<span class="rdm-item plan">PDI</span>' +
            '<span class="rdm-item plan">Descritivo de Cargos</span>' +
          '</div>' +
          '<div class="rdm-section-label">Talentos</div>' +
          '<div class="rdm-items">' +
            '<span class="rdm-item plan">Avaliação de Desempenho</span>' +
            '<span class="rdm-item plan">Mapeamento 9 Box</span>' +
            '<span class="rdm-item plan">DISC Comportamental</span>' +
            '<span class="rdm-item plan">Universidade Corporativa</span>' +
          '</div>' +
          '<div class="rdm-foot">📋 Planejamento em andamento</div>' +
        '</div>' +
      '</div>' +

      /* ── FASE 3 ── */
      '<div class="rdm-card">' +
        '<div class="rdm-card-head" style="background:linear-gradient(135deg,#9613f7,#7c3aed)">' +
          '<div class="rdm-phase-badge">⏳ Fase 3</div>' +
          '<div class="rdm-card-title">Recrutamento & Seleção</div>' +
          '<div class="rdm-card-sub">Atração e contratação de talentos</div>' +
        '</div>' +
        '<div class="rdm-card-body">' +
          '<div class="rdm-section-label">Processos Seletivos</div>' +
          '<div class="rdm-items">' +
            '<span class="rdm-item soon">Gestão de Vagas</span>' +
            '<span class="rdm-item soon">Banco de Talentos</span>' +
            '<span class="rdm-item soon">Pipeline de Candidatos</span>' +
            '<span class="rdm-item soon">Agendamento de Entrevistas</span>' +
          '</div>' +
          '<div class="rdm-section-label">Tecnologia</div>' +
          '<div class="rdm-items">' +
            '<span class="rdm-item soon">Triagem com IA</span>' +
            '<span class="rdm-item soon">Indicadores de R&amp;S</span>' +
            '<span class="rdm-item soon">Integração Job Boards</span>' +
          '</div>' +
          '<div class="rdm-foot">🔮 Especificação técnica prevista</div>' +
        '</div>' +
      '</div>' +

      /* ── FASE 4 — PEOPLE ANALYTICS ── */
      '<div class="rdm-card">' +
        '<div class="rdm-card-head" style="background:linear-gradient(135deg,#f59e0b,#ea580c)">' +
          '<div class="rdm-phase-badge">⏳ Fase 4</div>' +
          '<div class="rdm-card-title">People Analytics</div>' +
          '<div class="rdm-card-sub">Inteligência de dados para decisões estratégicas</div>' +
        '</div>' +
        '<div class="rdm-card-body">' +
          '<div class="rdm-section-label">Dashboards & KPIs</div>' +
          '<div class="rdm-items">' +
            '<span class="rdm-item analytics">Dashboard RH em Tempo Real</span>' +
            '<span class="rdm-item analytics">Turnover & Headcount</span>' +
            '<span class="rdm-item analytics">Absenteísmo & Produtividade</span>' +
            '<span class="rdm-item analytics">Heatmap por Setor</span>' +
          '</div>' +
          '<div class="rdm-section-label">Inteligência Preditiva</div>' +
          '<div class="rdm-items">' +
            '<span class="rdm-item analytics">Predição de Desligamentos</span>' +
            '<span class="rdm-item analytics">Análise de Clima</span>' +
            '<span class="rdm-item analytics">BI Integrado ao RH</span>' +
            '<span class="rdm-item analytics">Relatórios Automáticos</span>' +
          '</div>' +
          '<div class="rdm-foot">📊 Inovação estratégica com dados de RH</div>' +
        '</div>' +
      '</div>' +

    '</div>' +
  '</div>';
};

window.grhRenderRoadmap = function(){
  var pane = document.getElementById('grh-pane-roadmap');
  if(pane) pane.innerHTML = window.grhRoadmapPainelHTML();
};

setInterval(function(){
  var pane = document.getElementById('grh-pane-roadmap');
  if(!pane) return;
  if(window.getComputedStyle(pane).display === 'none') return;
  if(!pane.querySelector('[data-grh-roadmap="1"]')){
    pane.innerHTML = window.grhRoadmapPainelHTML();
  }
}, 400);

})();
