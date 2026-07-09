// ===== script: patch-modulos-brancos-final-js =====
(function(){
  'use strict';

  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function setTop(icon,title){
    const pi=document.getElementById('tPageIcon'); if(pi) pi.textContent=icon;
    const pt=document.getElementById('tPageTitle'); if(pt) pt.textContent=title;
  }
  function showOnly(id){
    document.querySelectorAll('[id^="view-"]').forEach(v=>{
      v.classList.remove('active','dev-active');
      v.style.display='none';
    });
    const hero=document.getElementById('mainHero'); if(hero) hero.style.display='none';
    let view=document.getElementById('view-'+id);
    if(!view){
      const main=document.querySelector('.main-area')||document.body;
      view=document.createElement('div');
      view.id='view-'+id;
      view.className='page';
      main.appendChild(view);
    }
    view.classList.add('active');
    view.style.display='block';
    return view;
  }

  function beneficiosHTML(){
    return `
      <div class="fix-module-page">
        <div class="hero">
          <div>
            <div class="h-eyebrow">PACOTE DE BENEFÍCIOS IMEX</div>
            <h1>Benefícios</h1>
            <p>Central de benefícios com fornecedores, regras, dependentes, acessos e calendário de pagamento.</p>
          </div>
          <div class="h-stats">
            <div class="h-stat"><span class="h-num">5</span><span class="h-lbl">benefícios</span></div>
            <div class="h-stat"><span class="h-num">30/31</span><span class="h-lbl">VA mensal</span></div>
          </div>
        </div>

        <div class="fix-grid">
          <div class="fix-card"><div class="fix-icon">🍽️</div><h3>iFood Benefícios</h3><p>Vale alimentação/refeição. Pagamento previsto todo dia 30/31 ou no último dia útil do mês.</p><div class="actions"><button class="btn btn-g btn-sm">📱 App iFood</button><button class="btn btn-g btn-sm">❓ FAQ</button></div></div>
          <div class="fix-card"><div class="fix-icon">🏋️</div><h3>Wellhub</h3><p>Acesso a academias e parceiros de bem-estar. Permite inclusão de até 3 dependentes.</p><div class="actions"><button class="btn btn-g btn-sm">📱 Acessar app</button></div></div>
          <div class="fix-card"><div class="fix-icon">🩺</div><h3>Starbem</h3><p>Consultas gratuitas mensais: psicologia, nutrição e médico conforme regras do pacote.</p><div class="actions"><button class="btn btn-g btn-sm">➕ Solicitar dependente</button></div></div>
          <div class="fix-card"><div class="fix-icon">🧬</div><h3>Dasa</h3><p>Benefício de saúde e exames. Acesso pela plataforma NAV Dasa.</p><div class="actions"><button class="btn btn-g btn-sm">🔗 Acessar Dasa</button></div></div>
          <div class="fix-card"><div class="fix-icon">🧠</div><h3>Optum</h3><p>Apoio emocional e saúde mental. Sem login próprio para colaborador neste momento.</p><div class="actions"><button class="btn btn-g btn-sm">ℹ️ Orientações</button></div></div>
          <div class="fix-card"><div class="fix-icon">💳</div><h3>Cartão Sindicato</h3><p>Controle e acompanhamento do benefício sindical no pacote de benefícios.</p><div class="actions"><button class="btn btn-g btn-sm">📄 Regras</button></div></div>
        </div>

        <div class="card" style="margin-top:18px">
          <div class="card-head"><div class="cht"><h2>❓ FAQ rápido</h2><p>Perguntas frequentes dos colaboradores</p></div></div>
          <div class="card-body">
            <div class="fix-list">
              <div class="fix-row"><div><strong>Quando cai o VA?</strong><br><span>Todo dia 30/31 ou último dia útil do mês.</span></div><span class="fix-pill">Calendário</span></div>
              <div class="fix-row"><div><strong>Como incluir dependentes?</strong><br><span>Solicitação deve ser feita ao RH conforme benefício e limite permitido.</span></div><span class="fix-pill">RH</span></div>
              <div class="fix-row"><div><strong>Quais consultas são gratuitas?</strong><br><span>4 psicólogos/mês, 1 nutricionista/mês e 1 médico/mês por colaborador.</span></div><span class="fix-pill">Saúde</span></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function documentosHTML(){
    return `
      <div class="fix-module-page">
        <div class="hero">
          <div>
            <div class="h-eyebrow">GESTÃO RH • DOCUMENTOS</div>
            <h1>Documentos</h1>
            <p>Central de políticas internas, processos, formulários, documentos gerais e comprovantes.</p>
          </div>
          <div class="h-stats">
            <div class="h-stat"><span class="h-num">4</span><span class="h-lbl">pastas</span></div>
            <div class="h-stat"><span class="h-num">RH</span><span class="h-lbl">controle</span></div>
          </div>
        </div>

        <div class="fix-grid">
          <div class="fix-card"><div class="fix-icon">📘</div><h3>Políticas Internas</h3><p>Código de conduta, políticas corporativas, regras internas e documentos institucionais.</p><div class="actions"><button class="btn btn-g btn-sm">Abrir pasta</button></div></div>
          <div class="fix-card"><div class="fix-icon">🧭</div><h3>Processos RH</h3><p>Fluxos de admissão, desligamento, férias, benefícios, movimentações e rotinas do RH.</p><div class="actions"><button class="btn btn-g btn-sm">Abrir pasta</button></div></div>
          <div class="fix-card"><div class="fix-icon">📝</div><h3>Formulários</h3><p>Modelos de solicitações, termos, declarações e documentos de apoio aos colaboradores.</p><div class="actions"><button class="btn btn-g btn-sm">Abrir pasta</button></div></div>
          <div class="fix-card"><div class="fix-icon">📎</div><h3>Documentos Gerais</h3><p>Arquivos úteis, comunicados oficiais, comprovantes e documentos de consulta rápida.</p><div class="actions"><button class="btn btn-g btn-sm">Abrir pasta</button></div></div>
          <div class="fix-card"><div class="fix-icon">🔎</div><h3>Busca Rápida</h3><p>Localize documentos por nome, categoria, responsável, data de atualização ou palavra-chave.</p><div class="actions"><input placeholder="Buscar documento..." style="margin-top:8px"></div></div>
          <div class="fix-card"><div class="fix-icon">🕓</div><h3>Controle de Versão</h3><p>Histórico de revisão, data da última atualização e responsável por cada documento.</p><div class="actions"><button class="btn btn-g btn-sm">Ver histórico</button></div></div>
        </div>
      </div>`;
  }

  function pesquisasHTML(){
    const perguntas = [
      'Como você avalia o clima geral da empresa?',
      'Você se sente ouvido pela liderança?',
      'Você tem clareza sobre suas responsabilidades?',
      'As ferramentas disponíveis atendem sua rotina?',
      'Você recomendaria a empresa como bom lugar para trabalhar?',
      'Como avalia a comunicação interna?',
      'Você percebe oportunidades de crescimento?',
      'Seu gestor acompanha seu desenvolvimento?',
      'Você sente reconhecimento pelo seu trabalho?',
      'A carga de trabalho está equilibrada?',
      'Você entende as metas da sua área?',
      'O ambiente favorece colaboração?',
      'Você recebe feedbacks com frequência?',
      'Os benefícios atendem suas necessidades?',
      'Que melhoria você sugere para a empresa?'
    ];
    return `
      <div class="fix-module-page">
        <div class="hero">
          <div>
            <div class="h-eyebrow">GESTÃO RH • PESQUISAS</div>
            <h1>Pesquisas RH</h1>
            <p>Modelos prontos de clima, liderança, NPS interno e engajamento com indicadores para tomada de decisão.</p>
          </div>
          <div class="h-stats">
            <div class="h-stat"><span class="h-num">4</span><span class="h-lbl">modelos</span></div>
            <div class="h-stat"><span class="h-num">15</span><span class="h-lbl">perguntas</span></div>
          </div>
        </div>

        <div class="fix-grid">
          <div class="fix-survey-model"><div class="fix-icon">🌡️</div><h3>Pesquisa de Clima</h3><p>Diagnóstico do ambiente, comunicação, engajamento e percepção geral.</p><ol>${perguntas.map(p=>`<li>${p}</li>`).join('')}</ol><div class="actions"><button class="btn btn-p btn-sm">Criar pesquisa</button><button class="btn btn-g btn-sm">Editar modelo</button></div></div>
          <div class="fix-survey-model"><div class="fix-icon">👔</div><h3>Pesquisa de Liderança</h3><p>Avaliação de comunicação, acompanhamento, feedback e suporte da gestão.</p><ol>${perguntas.slice(0,15).map(p=>`<li>${p}</li>`).join('')}</ol><div class="actions"><button class="btn btn-p btn-sm">Criar pesquisa</button><button class="btn btn-g btn-sm">Editar modelo</button></div></div>
          <div class="fix-survey-model"><div class="fix-icon">⭐</div><h3>NPS Interno</h3><p>Mede recomendação, satisfação e percepção da experiência do colaborador.</p><ol>${perguntas.slice(0,15).map(p=>`<li>${p}</li>`).join('')}</ol><div class="actions"><button class="btn btn-p btn-sm">Criar pesquisa</button><button class="btn btn-g btn-sm">Editar modelo</button></div></div>
          <div class="fix-survey-model"><div class="fix-icon">🚀</div><h3>Engajamento</h3><p>Acompanha motivação, pertencimento, propósito e intenção de permanência.</p><ol>${perguntas.slice(0,15).map(p=>`<li>${p}</li>`).join('')}</ol><div class="actions"><button class="btn btn-p btn-sm">Criar pesquisa</button><button class="btn btn-g btn-sm">Editar modelo</button></div></div>
        </div>
      </div>`;
  }

  function roadmapHTML(){
    return `
      <div class="fix-module-page">
        <div class="hero">
          <div>
            <div class="h-eyebrow">ROADMAP DO PRODUTO</div>
            <h1>Roadmap</h1>
            <p>Evolução planejada do sistema RH por fases, mantendo a Fase 1 operacional e as próximas etapas organizadas.</p>
          </div>
          <div class="h-stats">
            <div class="h-stat"><span class="h-num">3</span><span class="h-lbl">fases</span></div>
            <div class="h-stat"><span class="h-num">F1</span><span class="h-lbl">implantada</span></div>
          </div>
        </div>

        <div class="fix-list">
          <div class="fix-roadmap-phase">
            <h3>✅ Fase 1 — Implantada</h3>
            <p>Gestão RH operacional e conexão interna.</p>
            <ul>
              <li>Gestão RH: Colaboradores, Endereços, Remuneração, Movimentações, Férias, Documentos e Benefícios.</li>
              <li>Conexão: Intranet, Comunicados, Pesquisas Internas, Ouvidoria, Aniversariantes e Reconhecimento.</li>
            </ul>
          </div>
          <div class="fix-roadmap-phase">
            <h3>🔮 Fase 2 — Planejada</h3>
            <p>Desenvolvimento & Talentos.</p>
            <ul>
              <li>Trilhas de carreira, Meu Desenvolvimento, PDI, DISC e Descritivo de Cargos.</li>
              <li>Avaliação de Desempenho, Mapeamento de Talentos, Matriz 9 Box e Universidade Corporativa.</li>
            </ul>
          </div>
          <div class="fix-roadmap-phase">
            <h3>🔮 Fase 3 — Planejada</h3>
            <p>Recrutamento & Seleção.</p>
            <ul>
              <li>Vagas, Banco de Talentos, Pipeline, Entrevistas, Indicadores e Triagem com IA.</li>
            </ul>
          </div>
        </div>
      </div>`;
  }

  const renderers = {
    beneficios: {icon:'🎁', title:'Benefícios', html:beneficiosHTML},
    documentos: {icon:'📄', title:'Documentos', html:documentosHTML},
    pesquisas: {icon:'📋', title:'Pesquisas RH', html:pesquisasHTML},
    'roadmap-produto': {icon:'🗺️', title:'Roadmap do Produto', html:roadmapHTML},
    roadmap: {icon:'🗺️', title:'Roadmap do Produto', html:roadmapHTML}
  };

  function renderFixed(id){
    const cfg = renderers[id];
    if(!cfg) return false;
    const view = showOnly(id);
    view.innerHTML = cfg.html();
    setTop(cfg.icon, cfg.title);
    document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
    const sb = document.getElementById('sb-'+id);
    if(sb) sb.classList.add('active');
    return true;
  }

  const oldSb = window.sbNav;
  window.sbNav = function(id){
    if(renderers[id]) return renderFixed(id);
    return typeof oldSb === 'function' ? oldSb.apply(this, arguments) : undefined;
  };

  const oldSwitch = window.switchView;
  window.switchView = function(id){
    if(renderers[id]) return renderFixed(id);
    return typeof oldSwitch === 'function' ? oldSwitch.apply(this, arguments) : undefined;
  };

  function tryClickFix(e){
    if(e.target.closest && e.target.closest('.imex-rh-card-final,.imex-rh-grid-final,#grh-tabs,#grh-back-bar,[id^="grh-pane-"],.intra-social-card,#intra-feed,#intra-tabs,#view-meus-documentos')) return;
    const el = e.target.closest('button,a,div,[onclick]');
    if(!el) return;
    const txt = norm(el.innerText || el.title || el.getAttribute('onclick') || '');
    let id = null;
    if(txt.includes('beneficio')) id = 'beneficios';
    else if(txt.includes('documento')) id = 'documentos';
    else if(txt.includes('pesquisa')) id = 'pesquisas';
    else if(txt.includes('roadmap')) id = 'roadmap-produto';
    if(id && (txt.includes('abrir modulo') || txt.includes('abrir módulo') || txt.includes('roadmap') || txt === 'beneficios' || txt === 'documentos' || txt === 'pesquisas')){
      setTimeout(()=>renderFixed(id), 30);
    }
  }

  document.addEventListener('click', tryClickFix, true);

  // Observa se uma dessas views abre em branco e preenche automaticamente
  function repairBlank(){
    Object.keys(renderers).forEach(id=>{
      const v = document.getElementById('view-'+id);
      if(!v) return;
      const visible = getComputedStyle(v).display !== 'none' || v.classList.contains('active');
      const text = norm(v.innerText);
      if(visible && text.length < 40) renderFixed(id);
    });
  }

  new MutationObserver(repairBlank).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  // REMOVED: Performance optimization - 1000ms setInterval polling (MutationObserver handles updates)
  // setInterval(repairBlank, 1000);
})();
