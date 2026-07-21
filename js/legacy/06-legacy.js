// ===== script: (sem id) =====
// ── Conecta AI / Talentos / Clima: extensão segura da Intranet Social ──
(function(){
  const oldIntraTab = window.intraTab;
  window.conectaAIPrompt = function(txt){
    const el = document.getElementById('conecta-ai-pergunta');
    if(el){ el.value = txt; el.focus(); }
  };
  window.conectaAIGerar = function(){
    const q = (document.getElementById('conecta-ai-pergunta')?.value || '').trim();
    const box = document.getElementById('conecta-ai-resposta');
    if(!box) return;
    if(!q){ box.textContent = 'Me diga o que você quer gerar ou analisar. Exemplo: “Crie um PDI para Analista de RH Pleno virar Sênior”.'; return; }
    const lower = q.toLowerCase();
    let resposta = '';
    if(lower.includes('pdi')){
      resposta = 'Sugestão de PDI:\n\n1. Competências a desenvolver: visão analítica, comunicação, autonomia e domínio técnico.\n2. Ações práticas: participar de projeto estratégico, mentoria mensal com gestor e curso técnico direcionado.\n3. Indicadores: entregas no prazo, qualidade técnica e evolução comportamental.\n4. Prazo sugerido: 90 dias para revisão inicial.';
    } else if(lower.includes('descritivo') || lower.includes('cargo')){
      resposta = 'Modelo de descritivo de cargo:\n\nMissão: garantir entregas consistentes na área, atuando com responsabilidade técnica e colaboração.\nResponsabilidades: executar rotinas, propor melhorias, documentar processos e apoiar decisões.\nRequisitos técnicos: domínio das ferramentas da função, organização e capacidade analítica.\nPerfil comportamental: comunicação clara, senso de prioridade, proatividade e trabalho em equipe.';
    } else if(lower.includes('clima')){
      resposta = 'Análise de clima sugerida:\n\nO RH pode acompanhar humor diário, comentários recorrentes e áreas com queda de engajamento. Quando houver alerta por 3 dias seguidos, recomenda-se conversa preventiva com gestor e plano de ação simples.';
    } else {
      resposta = 'Resposta sugerida do Conecta AI:\n\nCom base nas informações do sistema, o ideal é cruzar cargo atual, trilha de carreira, avaliação de desempenho, competências e histórico do colaborador. A partir disso, podemos gerar recomendações de desenvolvimento, próximos passos e plano de ação para RH ou gestor.';
    }
    box.textContent = resposta;
  };
  window.climaResponder = function(btn, txt){
    document.querySelectorAll('#clima-options .clima-btn').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    const fb = document.getElementById('clima-feedback');
    if(fb){ fb.textContent = 'Resposta registrada: ' + txt + '. Obrigada por compartilhar 💚'; fb.style.display = 'block'; }
  };
  window.intraTab = function(t, el){
    const custom = ['conecta-ai','talentos','clima-live','meu-rh'];
    const feed = document.getElementById('intra-feed');
    const vagaPane = document.getElementById('intra-vagas-pane');
    const orgPane = document.getElementById('intra-org-pane');
    const aiPane = document.getElementById('conecta-ai-pane');
    const talentosPane = document.getElementById('talentos-pane');
    const climaPane = document.getElementById('clima-live-pane');
    const meuRhPane = document.getElementById('meu-rh-pane');
    [aiPane,talentosPane,climaPane,meuRhPane].forEach(p=>{ if(p) p.style.display='none'; });
    if(custom.includes(t)){
      window.intraTabAtiva = t;
      document.querySelectorAll('#intra-tabs .tab, #intra-tabs .intra-filter-card, #intra-tabs .intra-social-card').forEach(b => b.classList.remove('active'));
      if(!el) el = document.querySelector('#intra-tabs [data-intra-tab="' + t + '"]');
      if(el) el.classList.add('active');
      if(feed) feed.style.display='none';
      if(vagaPane) vagaPane.style.display='none';
      if(orgPane) orgPane.style.display='none';
      const title = document.getElementById('intra-social-title');
      const sub = document.getElementById('intra-social-sub');
      const map = {
        'conecta-ai':['Conecta AI','Assistente inteligente para dúvidas, PDI, descritivos, clima e carreira.'],
        'talentos':['Mapa de Talentos','Visão estratégica de potencial, sucessão e risco de atenção.'],
        'clima-live':['Clima em Tempo Real','Termômetro simples para medir o humor do dia.'],
        'meu-rh':['Meu RH','Sua central rápida de férias, PDI, avaliações, documentos e carreira.']
      };
      if(title && map[t]){ title.textContent = map[t][0]; sub.textContent = map[t][1]; }
      if(t==='conecta-ai' && aiPane) aiPane.style.display='block';
      if(t==='talentos' && talentosPane) talentosPane.style.display='block';
      if(t==='clima-live' && climaPane) climaPane.style.display='block';
      if(t==='meu-rh' && meuRhPane) meuRhPane.style.display='block';
      return;
    }
    if(oldIntraTab) return oldIntraTab(t, el);
  };
})();

