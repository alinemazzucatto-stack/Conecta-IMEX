// ===== script: (sem id) =====
// ── AJUSTES SOLICITADOS: menu, Conecta AI por perfil e Mapa de Talentos só RH ──
(function(){
  // REMOVED: Consolidated in 000-core-functions.js
  // function isRHProfile(){ return role === 'rh' || role === 'rh-colaborador'; }
  // REMOVED: Consolidated in 000-core-functions.js
  // function isGestorProfile(){ return role === 'gestor'; }
  // REMOVED: Consolidated in 000-core-functions.js
  // function isColabProfile(){ return role === 'colaborador'; }

  function ajustarMenuFerias(){
    document.querySelectorAll('.sidebar .sb-divider').forEach(div=>{
      // Mantém apenas o divisor acima do botão sair; remove divisores que deixavam Férias isolado
      const next = div.nextElementSibling;
      if(next && !next.getAttribute('onclick')?.includes('doLogout')) div.remove();
    });
    const logo = document.querySelector('.sb-logo');
    if(logo) logo.style.marginBottom = '10px';
  }

  window.aplicarPermissoesIntranetAI = function(){
    ajustarMenuFerias();

    // Mapa de Talentos: somente RH/RH-Colaborador
    const cardTalentos = document.getElementById('card-talentos') || document.querySelector('[data-intra-tab="talentos"]');
    const talentosPane = document.getElementById('talentos-pane');
    if(cardTalentos) cardTalentos.style.display = isRHProfile() ? '' : 'none';
    if(talentosPane && !isRHProfile()) talentosPane.style.display = 'none';

    // Conecta AI: para colaborador, mostrar somente temas úteis ao colaborador
    const aiCard = document.getElementById('card-conecta-ai') || document.querySelector('[data-intra-tab="conecta-ai"]');
    const aiSub = aiCard?.querySelector('.intra-social-sub');
    const aiCount = aiCard?.querySelector('.intra-social-count');
    const aiIntro = document.querySelector('#conecta-ai-pane .conecta-chat p');
    const aiText = document.getElementById('conecta-ai-pergunta');
    const prompts = document.querySelector('#conecta-ai-pane .conecta-prompts');
    const resposta = document.getElementById('conecta-ai-resposta');
    const sugestoes = document.querySelector('#conecta-ai-pane .conecta-panel');

    if(isColabProfile()){
      if(aiSub) aiSub.textContent = 'dúvidas do colaborador';
      if(aiCount) aiCount.textContent = 'Me orientar';
      if(aiIntro) aiIntro.textContent = 'Assistente para orientar colaboradores sobre férias, trilha de carreira, PDI, pesquisas, documentos e dúvidas internas.';
      if(aiText) aiText.placeholder = 'Ex: Qual é minha próxima etapa de carreira? Como acompanho meu PDI? Onde vejo minhas férias?';
      if(prompts) prompts.innerHTML = `
        <button class="conecta-prompt" onclick="conectaAIPrompt('Explique minha trilha de carreira e o próximo cargo possível.')">🚀 Minha trilha</button>
        <button class="conecta-prompt" onclick="conectaAIPrompt('Me ajude a entender quais competências preciso desenvolver no meu PDI.')">🎯 Meu PDI</button>
        <button class="conecta-prompt" onclick="conectaAIPrompt('Como posso acompanhar minhas férias e solicitações?')">🌴 Minhas férias</button>
        <button class="conecta-prompt" onclick="conectaAIPrompt('Quais pesquisas, comunicados e documentos preciso verificar?')">📰 Pendências</button>`;
      if(resposta) resposta.textContent = 'Olá! Posso te ajudar com dúvidas sobre suas férias, PDI, trilha de carreira, pesquisas, documentos e comunicados internos.';
      if(sugestoes) sugestoes.innerHTML = `
        <h3>✨ Temas para colaboradores</h3>
        <p>Use o Conecta AI para se orientar dentro da plataforma.</p>
        <div class="intra-side-item"><span>🌴</span><span>Entender solicitações de férias, status e próximos passos.</span></div>
        <div class="intra-side-item"><span>🚀</span><span>Consultar próximos níveis da trilha de carreira.</span></div>
        <div class="intra-side-item"><span>🎯</span><span>Receber sugestões para evoluir no PDI.</span></div>
        <div class="intra-side-item"><span>📰</span><span>Localizar comunicados, pesquisas e documentos importantes.</span></div>`;
    } else {
      if(aiSub) aiSub.textContent = isRHProfile() ? 'assistente inteligente RH' : 'assistente do gestor';
      if(aiCount) aiCount.textContent = 'Perguntar';
      if(aiIntro) aiIntro.textContent = isRHProfile()
        ? 'Assistente inteligente para apoiar RH com dúvidas, trilhas, PDI, descritivos, clima e análises estratégicas.'
        : 'Assistente para apoiar gestores com equipe, PDI, carreira, clima e acompanhamento de pessoas.';
      if(aiText) aiText.placeholder = isRHProfile()
        ? 'Ex: Crie um PDI para Analista Pleno. Gere um descritivo de cargo. Analise clima da equipe.'
        : 'Ex: Como acompanhar o PDI da minha equipe? Como orientar uma promoção?';
      if(prompts) prompts.innerHTML = `
        <button class="conecta-prompt" onclick="conectaAIPrompt('Crie um PDI para o próximo nível da trilha de carreira.')">🎯 Criar PDI</button>
        <button class="conecta-prompt" onclick="conectaAIPrompt('Explique quais competências precisam ser desenvolvidas para promoção.')">🚀 Próximo nível</button>
        ${isRHProfile() ? `<button class="conecta-prompt" onclick="conectaAIPrompt('Gere um descritivo de cargo padrão com responsabilidades e requisitos.')">📋 Descritivo</button>` : ''}
        <button class="conecta-prompt" onclick="conectaAIPrompt('Analise sinais de clima organizacional e sugira ações.')">❤️ Clima</button>`;
      if(resposta) resposta.textContent = isRHProfile()
        ? 'Olá! Posso ajudar o RH com trilhas, PDI, descritivos de cargos, clima e mapa de talentos.'
        : 'Olá! Posso ajudar gestores com desenvolvimento da equipe, PDI, carreira e clima.';
      if(sugestoes) sugestoes.innerHTML = isRHProfile() ? `
        <h3>✨ Sugestões inteligentes</h3>
        <p>Ideias que o Conecta AI pode automatizar dentro do sistema.</p>
        <div class="intra-side-item"><span>📌</span><span>Transformar auto descrições dos colaboradores em descritivo oficial do cargo.</span></div>
        <div class="intra-side-item"><span>🎯</span><span>Gerar PDI automático conforme próximo cargo da trilha.</span></div>
        <div class="intra-side-item"><span>🧠</span><span>Sinalizar talentos prontos para promoção ou sucessão.</span></div>
        <div class="intra-side-item"><span>❤️</span><span>Resumir clima da semana para o RH com alertas de atenção.</span></div>` : `
        <h3>✨ Temas para gestores</h3>
        <p>Apoio rápido para acompanhar pessoas e desenvolvimento da equipe.</p>
        <div class="intra-side-item"><span>🎯</span><span>Sugestões para orientar PDI e feedbacks.</span></div>
        <div class="intra-side-item"><span>🚀</span><span>Acompanhamento de evolução na trilha de carreira.</span></div>
        <div class="intra-side-item"><span>❤️</span><span>Ações simples para melhorar clima e engajamento da equipe.</span></div>`;
    }
  };

  // Complementa a função já existente de permissões
  const oldPerm = window.aplicarPermissoesUI;
  window.aplicarPermissoesUI = function(){
    if(typeof oldPerm === 'function') oldPerm.apply(this, arguments);
    window.aplicarPermissoesIntranetAI();
  };

  // Proteção extra: se não for RH, não deixa abrir Mapa de Talentos pela URL/clique forçado
  const oldIntraTab2 = window.intraTab;
  window.intraTab = function(t, el){
    if(t === 'talentos' && !isRHProfile()){
      const box = document.getElementById('conecta-ai-resposta');
      if(box) box.textContent = 'Mapa de Talentos é um painel restrito ao RH.';
      return (typeof oldIntraTab2 === 'function') ? oldIntraTab2('conecta-ai', document.querySelector('[data-intra-tab="conecta-ai"]')) : null;
    }
    const r = (typeof oldIntraTab2 === 'function') ? oldIntraTab2(t, el) : null;
    setTimeout(window.aplicarPermissoesIntranetAI, 50);
    return r;
  };

  // Respostas do Conecta AI ajustadas para colaborador
  const oldGerar = window.conectaAIGerar;
  window.conectaAIGerar = function(){
    if(!isColabProfile()) return oldGerar ? oldGerar() : null;
    const q = (document.getElementById('conecta-ai-pergunta')?.value || '').trim();
    const box = document.getElementById('conecta-ai-resposta');
    if(!box) return;
    if(!q){ box.textContent = 'Me diga sua dúvida. Posso ajudar com férias, PDI, trilha de carreira, pesquisas, documentos e comunicados.'; return; }
    const lower = q.toLowerCase();
    if(lower.includes('férias') || lower.includes('ferias')){
      box.textContent = 'Orientação: acesse o painel Férias para acompanhar solicitações, status de aprovação, períodos programados e comunicados do RH. Em caso de divergência, fale com o RH.';
    } else if(lower.includes('pdi')){
      box.textContent = 'Sugestão para seu PDI: identifique o próximo cargo da sua trilha, veja as competências esperadas e combine com seu gestor 2 ou 3 ações práticas para evoluir nos próximos 90 dias.';
    } else if(lower.includes('trilha') || lower.includes('carreira') || lower.includes('promo')){
      box.textContent = 'Orientação de carreira: consulte Trilhas de Carreira para ver o próximo nível do seu cargo. Foque nas competências técnicas, comportamentais e entregas esperadas antes de solicitar uma conversa de evolução.';
    } else if(lower.includes('pesquisa') || lower.includes('documento') || lower.includes('comunicado')){
      box.textContent = 'Na Intranet você encontra comunicados, pesquisas disponíveis e documentos úteis. Verifique os cards do feed para acompanhar pendências e novidades.';
    } else {
      box.textContent = 'Posso te orientar sobre férias, PDI, trilha de carreira, documentos, pesquisas e comunicados internos. Para dados sensíveis ou decisões formais, confirme com o RH.';
    }
  };

  document.addEventListener('DOMContentLoaded', ()=>setTimeout(window.aplicarPermissoesIntranetAI, 300));
  setTimeout(window.aplicarPermissoesIntranetAI, 800);
})();



