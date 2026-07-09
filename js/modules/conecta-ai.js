// ===== script: conecta-ai-v2-js =====
(function(){
'use strict';
if(window.__conectaAiV2) return;
window.__conectaAiV2 = true;

// ── CONSOLIDAÇÃO DE ESTADO (02-legacy.js é a única fonte de verdade) ──
// As funções isRH() e isGestor() foram desativadas aqui para usar as definições globais
// de 02-legacy.js. Isto evita lógica duplicada que causava oscilações.
// Consulte a Fase 2 da auditoria de estabilidade para detalhes.
// ANTES (REMOVIDO):
// function isRH(){ return typeof role!=='undefined' && (role==='rh'||role==='rh-colaborador'); }
// function isGestor(){ return typeof role!=='undefined' && role==='gestor'; }

// AGORA: Usa as funções globais de 02-legacy.js que também verificam window.__IMEX_STATE
// if isRH e isGestor não existem globalmente, isto falhará - é proposital
// para forçar que o desenvolvedor saiba que está usando estado global

function setPergunta(txt){
  var el = document.getElementById('ai-lateral-pergunta');
  if(el) el.value = txt;
}

/* 1) Temas sugeridos — agora clicáveis novamente, preenchendo a pergunta */
window.conectaAIAtualizarTemas = function(){
  var box = document.getElementById('ai-lateral-temas');
  if(!box) return;
  var temas;
  if(isRH()){
    temas=[['📢 Comunicados','Crie um comunicado interno sobre um tema que eu vou descrever.'],['📋 Descritivos','Gere o descritivo de cargo para uma função que eu vou informar.'],['🧠 Gestão de RH','Como apoiar PDI, talentos e sucessão na minha equipe?'],['❤️ Clima','Sugira ações para melhorar o engajamento e clima organizacional.']];
  } else if(isGestor()){
    temas=[['👥 Equipe','Como organizar o acompanhamento e a rotina do meu time?'],['🎯 PDI','Como dar feedbacks melhores e apoiar o desenvolvimento da equipe?'],['🌴 Férias','Como organizar as ausências e férias da equipe?']];
  } else {
    temas=[['🚀 Crescimento','Como crescer para o próximo cargo?'],['🧠 DISC','Explique meu resultado DISC.'],['🎯 PDI','Monte um PDI para mim.'],['🎓 Treinamentos','Sugira treinamentos para meu perfil.'],['✅ Competências','Quais competências preciso desenvolver?'],['🌴 Férias','Status, solicitação e próximos passos das minhas férias.'],['🏢 Organograma','Como é a estrutura da empresa?']];
  }
  box.innerHTML = temas.map(function(t){
    return '<div class="ri-item" data-q="'+t[1].replace(/"/g,'&quot;')+'"><b>'+t[0]+'</b><br><span class="ri-m">'+t[1]+'</span></div>';
  }).join('');
  box.querySelectorAll('.ri-item').forEach(function(item){
    item.addEventListener('click', function(){ setPergunta(item.getAttribute('data-q')); });
  });

  var qp = document.getElementById('ai-quick-prompts');
  if(qp){
    var perguntas;
    if(isRH()) perguntas=['Crie um comunicado interno','Descreva o cargo de Analista RH Pleno','Sugira ações de clima organizacional'];
    else if(isGestor()) perguntas=['Como dar um feedback eficaz?','Monte um PDI para um analista','Como organizar as férias da equipe?'];
    else perguntas=['Como crescer para o próximo cargo?','Explique meu DISC','Monte um PDI para mim','Sugira treinamentos para meu perfil','Quais competências preciso desenvolver?'];
    qp.innerHTML = perguntas.map(function(p){
      return '<button class="btn btn-g btn-sm" data-q="'+p.replace(/"/g,'&quot;')+'" style="font-size:11px;padding:5px 10px">'+p+'</button>';
    }).join('');
    qp.querySelectorAll('button[data-q]').forEach(function(btn){
      btn.addEventListener('click', function(){ setPergunta(btn.getAttribute('data-q')); });
    });
  }
};

/* 2) Resposta local contextual — usada quando a IA real (proxy) não está disponível */
function respostaLocal(perfilLabel, q){
  var ql = q.toLowerCase();

  function temDISC(){ return window.__ultimoDiscResultado; }

  var TOPICOS = [
    { chave:['disc','perfil comportamental','dominância','influência','estabilidade','conformidade'], gerar:function(){
        if(!temDISC()) return '🧠 Você ainda não fez o teste DISC. Acesse o módulo "DISC" no menu lateral para responder — leva poucos minutos e o resultado mostra suas tendências de Dominância, Influência, Estabilidade e Conformidade, ajudando a entender seu estilo de comunicação e decisão.';
        var res = window.__ultimoDiscResultado, p = res.pcts || {};
        return '🧠 Seu perfil DISC é **' + res.perfil + '**.\n\n' +
          '• Dominância: ' + (p.D||0) + '% — assertividade, foco em resultado e decisões rápidas.\n' +
          '• Influência: ' + (p.I||0) + '% — comunicação, entusiasmo e relacionamento.\n' +
          '• Estabilidade: ' + (p.S||0) + '% — paciência, consistência e trabalho em equipe.\n' +
          '• Conformidade: ' + (p.C||0) + '% — atenção a detalhes, regras e qualidade.\n\n' +
          'Use o traço mais forte como sua principal força no dia a dia, e o mais baixo como ponto de atenção em situações que exigem esse comportamento (ex: se Conformidade é baixa, reforce checagem de detalhes em entregas importantes).';
      }},
    { chave:['férias','ferias'], gerar:function(){
        return '🌴 Sobre suas férias:\n\n' +
          '1. Acesse o módulo "Férias" no menu lateral — lá você vê seu saldo atual, período aquisitivo e o prazo limite para tirar o descanso.\n' +
          '2. Para solicitar: preencha o formulário "Nova solicitação", escolha se quer abono pecuniário (até 10 dias convertidos em dinheiro) e como fracionar o período (1 a 3 partes, sendo uma com no mínimo 14 dias).\n' +
          '3. Após enviar, a solicitação segue para aprovação do seu gestor e depois validação do RH — acompanhe o status em "Minhas férias" digitando seu e-mail.\n\n' +
          'Dica: solicite com pelo menos 30 dias de antecedência para evitar imprevistos na aprovação.';
      }},
    { chave:['pdi','plano de desenvolvimento'], gerar:function(){
        return '🎯 Para montar um PDI consistente, siga esta estrutura:\n\n' +
          '1. **Objetivo de carreira** — onde você quer chegar em 1-2 anos (próximo cargo, nova área, especialização).\n' +
          '2. **Lacunas atuais** — 2 ou 3 competências que separam você desse objetivo (técnicas ou comportamentais).\n' +
          '3. **Ações concretas** — para cada lacuna, defina uma ação prática: um curso, uma mentoria com alguém da área, um projeto onde você pode praticar.\n' +
          '4. **Prazos** — coloque datas realistas (ex: "concluir curso X até o fim do trimestre").\n' +
          '5. **Acompanhamento** — registre tudo no módulo "PDI" e revise com seu gestor a cada ciclo de feedback.\n\n' +
          'Se já fez o teste DISC, use seu perfil para escolher ações que reforcem seus pontos fortes e mitiguem os pontos de atenção.';
      }},
    { chave:['treinamento','curso','capacitação','capacitacao'], gerar:function(){
        return '🎓 Para identificar os treinamentos certos para você:\n\n' +
          '• Olhe a trilha de carreira do seu cargo atual no módulo "Estrutura e Carreira" — ela lista as competências esperadas para o próximo nível.\n' +
          '• Compare com seu PDI: as lacunas que você já mapeou indicam o tipo de curso (técnico, liderança, comunicação, ferramentas específicas).\n' +
          '• Priorize: escolha 1 treinamento técnico (relacionado à sua função) e, se possível, 1 comportamental (alinhado ao seu perfil DISC).\n' +
          '• Registre o treinamento concluído no seu PDI para que ele conte na sua avaliação de desenvolvimento.\n\n' +
          'Se precisar de sugestões de plataformas ou cursos específicos, fale com seu gestor ou o RH — eles podem indicar parcerias e benefícios de capacitação já disponíveis na empresa.';
      }},
    { chave:['competência','competencia'], gerar:function(){
        return '✅ Competências geralmente se dividem em dois grupos:\n\n' +
          '**Técnicas (hard skills)** — específicas da sua função, normalmente listadas no descritivo do seu cargo (módulo "Descritivo de Cargos").\n\n' +
          '**Comportamentais (soft skills)** — comunicação, trabalho em equipe, gestão do tempo, resolução de problemas. Seu resultado DISC ajuda a identificar quais reforçar.\n\n' +
          'Passo prático: compare o descritivo do seu cargo atual com o do próximo nível na trilha de carreira — a diferença entre os dois é exatamente o conjunto de competências que vale priorizar no seu PDI.';
      }},
    { chave:['cargo','crescer','carreira','promo','próximo nível','proximo nivel'], gerar:function(){
        return '🚀 Para evoluir de cargo, o caminho mais direto é:\n\n' +
          '1. Consulte a trilha de carreira do seu cargo atual no módulo "Estrutura e Carreira" — ela mostra o(s) próximo(s) cargo(s) possível(eis) e os requisitos de cada um.\n' +
          '2. Identifique as competências que faltam comparando seu perfil atual com os requisitos do próximo nível.\n' +
          '3. Transforme essas lacunas em um PDI com ações e prazos concretos (veja o tema "PDI" para o passo a passo).\n' +
          '4. Converse com seu gestor sobre esse plano nos próximos 1:1s — ele(a) pode validar se a expectativa de prazo é realista e abrir oportunidades de prática (projetos, substituições, novas responsabilidades).\n\n' +
          'Crescimento de cargo raramente é só "tempo de empresa" — é competência demonstrada + visibilidade junto à liderança.';
      }},
    { chave:['organograma','estrutura','hierarquia'], gerar:function(){
        return '🏢 A estrutura da empresa pode ser consultada no módulo "Organograma" no menu lateral — lá você vê seu gestor direto, a equipe, o departamento ao qual pertence e como as áreas se conectam entre si.\n\nIsso é útil para entender a quem reportar determinados assuntos, identificar pontos de contato em outras áreas e visualizar caminhos de crescimento horizontal (mudar de área) além do vertical (subir de cargo).';
      }},
    { chave:['comunicado','campanha interna'], gerar:function(){
        return '📢 Para criar um comunicado interno eficaz:\n\n' +
          '1. **Título direto** — diga o assunto em poucas palavras.\n' +
          '2. **O quê + Por quê** — o que está mudando/acontecendo e a razão (contexto gera adesão).\n' +
          '3. **O que muda na prática** — liste de forma objetiva o impacto para quem lê.\n' +
          '4. **Próximos passos** — se exigir ação do colaborador, deixe isso bem claro com prazo.\n' +
          '5. **Canal e tom** — adapte a linguagem ao público (mais formal para políticas, mais leve para campanhas de engajamento).\n\n' +
          'Publique pelo módulo "Intranet" para alcançar todos os colaboradores de forma centralizada.';
      }},
    { chave:['descritivo'], gerar:function(){
        return '📋 Para gerar um descritivo de cargo completo, estruture em:\n\n' +
          '• **Missão do cargo** — o porquê dessa função existir, em uma frase.\n' +
          '• **Responsabilidades principais** — 5 a 8 atividades centrais, em ordem de relevância.\n' +
          '• **Requisitos** — formação, experiência e competências técnicas/comportamentais esperadas.\n' +
          '• **Indicadores de performance** — como o sucesso nesse cargo é medido.\n' +
          '• **Trilha de carreira** — para onde esse cargo pode evoluir.\n\n' +
          'Use o módulo "Descritivo de Cargos" para registrar e manter isso atualizado — ajuda em recrutamento, PDI dos colaboradores e clareza de expectativas.';
      }},
    { chave:['talento','sucessão','sucessao','gestão de rh','gestao de rh'], gerar:function(){
        return '🧠 Para apoiar gestão de talentos e sucessão:\n\n' +
          '• Mapeie os PDIs registrados no sistema para identificar quem está se preparando para quais posições.\n' +
          '• Cruze isso com os resultados DISC da equipe para entender o fit comportamental de cada sucessor em potencial.\n' +
          '• Priorize posições críticas (sem backup definido) e monte planos de desenvolvimento acelerado para os candidatos internos mais próximos do perfil ideal.\n' +
          '• Revise esse mapa periodicamente (a cada 6 meses) junto com as lideranças de cada área.';
      }},
    { chave:['clima','engajamento'], gerar:function(){
        return '❤️ Para melhorar o clima organizacional, algumas ações práticas:\n\n' +
          '• Use o módulo "Pesquisas" para aplicar uma pesquisa de clima curta e recorrente (pulse survey) em vez de uma única pesquisa anual extensa.\n' +
          '• Compartilhe os resultados (mesmo os críticos) com transparência — isso aumenta a confiança na próxima rodada.\n' +
          '• Transforme os 2-3 pontos mais críticos em um plano de ação visível, com responsável e prazo.\n' +
          '• Use a Ouvidoria como termômetro contínuo entre pesquisas formais — reclamações recorrentes ali são sinal de alerta antecipado.';
      }},
    { chave:['equipe','time'], gerar:function(){
        return '👥 Para acompanhar e organizar sua equipe:\n\n' +
          '• Revise o módulo "Equipe" para ver visão consolidada de colaboradores, pendências de férias e pesquisas em aberto.\n' +
          '• Mantenha 1:1s regulares — mesmo que curtos, ajudam a antecipar problemas antes que cresçam.\n' +
          '• Acompanhe os PDIs de cada liderado para saber em que estágio de desenvolvimento cada um está.\n' +
          '• Para organização de férias da equipe, veja o tema "Férias" — evite que todos tirem no mesmo período.';
      }},
    { chave:['feedback'], gerar:function(){
        return '🎯 Um feedback eficaz segue geralmente esta estrutura (SCI: Situação, Comportamento, Impacto):\n\n' +
          '1. **Situação** — descreva o contexto específico (data, projeto, reunião).\n' +
          '2. **Comportamento observado** — seja factual, sem julgamento ("você entregou 2 dias após o prazo" em vez de "você é desorganizado").\n' +
          '3. **Impacto** — explique a consequência daquele comportamento (no time, no resultado, no cliente).\n' +
          '4. **Próximo passo combinado** — encerre com uma ação concreta e prazo, idealmente sugerida pela própria pessoa.\n\n' +
          'Feedbacks positivos também merecem essa estrutura — reforçar o que funcionou bem é tão importante quanto corrigir.';
      }}
  ];

  for(var i=0;i<TOPICOS.length;i++){
    var t = TOPICOS[i];
    for(var j=0;j<t.chave.length;j++){
      if(ql.includes(t.chave[j])) return t.gerar();
    }
  }

  // Sem correspondência direta — resposta geral por perfil, mas já reconhecendo a pergunta
  var base = '';
  if(isRH()) base = 'Como RH, você pode usar o Conecta AI para apoiar comunicados, descritivos de cargos, gestão de talentos/sucessão e ações de clima organizacional.';
  else if(isGestor()) base = 'Como gestor, você pode usar o Conecta AI para organizar a equipe, preparar feedbacks, acompanhar PDI e planejar férias do time.';
  else base = 'Como colaborador, você pode consultar orientações sobre férias, PDI, DISC, trilha de carreira, treinamentos e organograma.';

  if(q){
    base += '\n\nSobre "' + q + '": não tenho uma orientação pronta para esse ponto específico — recomendo levar essa pergunta diretamente ao seu gestor ou ao RH para uma resposta mais precisa ao seu caso.';
  }
  return base;
}

/* 3) Geração da resposta: tenta IA real (proxy) primeiro, cai para resposta local se indisponível */
window.conectaAIGerarLateral = function(){
  var q = (document.getElementById('ai-lateral-pergunta')||{}).value || '';
  q = q.trim();
  var box = document.getElementById('ai-lateral-resposta');
  if(!box) return;
  if(!q){ alert('Digite uma pergunta para o Conecta AI.'); return; }

  box.innerHTML = '<div class="ai-thinking">Analisando sua pergunta<span class="ai-thinking-dots"><span></span><span></span><span></span></span></div>';
  box.style.display = 'block';

  var perfil = 'colaborador';
  if(isRH()) perfil = 'profissional de RH';
  else if(isGestor()) perfil = 'gestor de equipes';

  var DISC_TEMAS = ['disc','perfil','comportamento','dominância','influência','estabilidade','conformidade'];
  var isPerguntaDISC = DISC_TEMAS.some(function(t){ return q.toLowerCase().includes(t); });
  var discCtx = '';
  if(isPerguntaDISC && window.__ultimoDiscResultado){
    var res = window.__ultimoDiscResultado;
    var p = res.pcts || {};
    discCtx = '\n\nResultado DISC do colaborador: Perfil ' + res.perfil + ' — Pontuações: D:' + (p.D||0) + '%, I:' + (p.I||0) + '%, S:' + (p.S||0) + '%, C:' + (p.C||0) + '%';
  }
  var sys = 'Você é o Conecta AI, assistente interno da IMEX. Responda de forma direta, objetiva e amigável para um ' + perfil + '. Foque em orientações práticas sobre: carreira, DISC, PDI, benefícios, férias, treinamentos, competências, organograma e desenvolvimento profissional. Use emojis moderadamente. Limite a resposta a no máximo 300 palavras.' + discCtx;

  if(typeof chamarAnthropicProxy !== 'function'){
    box.innerHTML = respostaLocal(perfil, q).replace(/\n/g,'<br>') + '<span class="ai-fallback-tag">resposta local · IA em nuvem não configurada</span>';
    return;
  }

  chamarAnthropicProxy({model:'claude-sonnet-4-20250514', max_tokens:600, system:sys, messages:[{role:'user', content:q}]})
    .then(function(d){
      var txt = (d.content||[]).map(function(c){ return c.text||''; }).join('');
      box.innerHTML = (txt || 'Não foi possível gerar uma resposta.').replace(/\n/g,'<br>');
    })
    .catch(function(){
      box.innerHTML = respostaLocal(perfil, q).replace(/\n/g,'<br>') + '<span class="ai-fallback-tag">resposta local · IA em nuvem indisponível agora</span>';
    });
};

var _oldSwitch = window.switchView;
if(typeof _oldSwitch === 'function' && !window.__conectaAiV2Switch){
  window.__conectaAiV2Switch = true;
  window.switchView = function(v){
    var r = _oldSwitch.apply(this, arguments);
    if(v === 'conecta-ai') setTimeout(window.conectaAIAtualizarTemas, 30);
    return r;
  };
}
var _oldSb = window.sbNav;
if(typeof _oldSb === 'function' && !window.__conectaAiV2Sb){
  window.__conectaAiV2Sb = true;
  window.sbNav = function(id){
    var r = _oldSb.apply(this, arguments);
    if(id === 'conecta-ai') setTimeout(window.conectaAIAtualizarTemas, 30);
    return r;
  };
}

var _conectaAiEstavaVisivel = false;
function tentarInicializar(){
  var v = document.getElementById('view-conecta-ai');
  var visivel = !!v && window.getComputedStyle(v).display !== 'none';
  if(visivel && !_conectaAiEstavaVisivel) window.conectaAIAtualizarTemas();
  _conectaAiEstavaVisivel = visivel;
}
// REMOVED: Performance optimization - 700ms setInterval polling
// setInterval(tentarInicializar, 700);
setTimeout(window.conectaAIAtualizarTemas, 200);
})();

