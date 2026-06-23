// ===== script: patch-final-colaborador-estrutura-roadmap-js =====
(function(){
  'use strict';
  const $ = (id)=>document.getElementById(id);
  function roleAtualFinal(){
    const raw = (window.currentUserRole || window.selectedRole || sessionStorage.getItem('imexPreferredRole') || sessionStorage.getItem('role') || localStorage.getItem('imexPreferredRole') || localStorage.getItem('role') || '').toLowerCase();
    if(['rh','gestor','colaborador'].includes(raw)) return raw;
    const lbl = (($('pLabel')||{}).textContent||'').toLowerCase();
    if(lbl.includes('rh')) return 'rh';
    if(lbl.includes('gestor')) return 'gestor';
    return 'colaborador';
  }
  const COLAB_ORDER = ['intranet','gamificacao','estrutura-carreira','beneficios','solicitacao','pesquisas','ouvidoria','conecta-ai'];
  const GESTOR_ORDER = ['intranet','gamificacao','estrutura-carreira','solicitacao','gestor','pesquisas','beneficios','ouvidoria','conecta-ai'];
  const RH_ORDER = ['gestao-rh','usuarios','dashboard','auditoria','pesquisas','beneficios','conecta-ai','ouvidoria','gamificacao','roadmap-produto'];
  const META = {
    intranet:['🏠','Intranet'], gamificacao:['🏆','Gamificação'], 'estrutura-carreira':['🏢','Estrutura e Carreira'], beneficios:['🎁','Meus Benefícios'], solicitacao:['🌴','Férias'], pesquisas:['📋','Pesquisas'], ouvidoria:['📢','Ouvidoria'], 'conecta-ai':['🤖','Conecta AI'], gestor:['👔','Gestor'], 'gestao-rh':['🏢','Gestão RH'], usuarios:['🔑','Gestão de Acessos'], dashboard:['📊','Dashboard RH'], auditoria:['📝','Auditoria'], 'roadmap-produto':['🚀','Roadmap do Produto']
  };
  function sidebar(){ return $('sidebar') || document.querySelector('.sidebar'); }
  function getItem(id){ return $('sb-'+id); }
  function ensureSidebarItem(id){
    const s = sidebar(); if(!s) return null;
    let item = getItem(id);
    if(!item){
      item = document.createElement('div');
      item.className = 'sb-item'; item.id = 'sb-'+id;
      item.onclick = function(){ if(typeof window.sbNav==='function') window.sbNav(id); };
      const m = META[id] || ['•', id];
      item.innerHTML = '<span>'+m[0]+'</span><span class="sb-tip">'+m[1]+'</span>';
      s.appendChild(item);
    }else{
      item.onclick = function(){ if(typeof window.sbNav==='function') window.sbNav(id); };
      const tip = item.querySelector('.sb-tip'); if(tip && META[id]) tip.textContent = META[id][1];
      const icon = item.querySelector('span:first-child'); if(icon && META[id]) icon.textContent = META[id][0];
    }
    return item;
  }
  function applyColaboradorSidebar(){
    const r = roleAtualFinal();
    const order = r==='rh' ? RH_ORDER : (r==='gestor' ? GESTOR_ORDER : COLAB_ORDER);
    const allowed = new Set(order.concat(['organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','desenvolvimento']));
    const s = sidebar(); if(!s) return;
    const logo = s.querySelector('.sb-logo');
    let after = logo || null;
    order.forEach(id=>{
      const item = ensureSidebarItem(id); if(!item) return;
      if(after) after.insertAdjacentElement('afterend', item); else s.insertBefore(item, s.firstChild);
      after = item;
      item.style.display = '';
    });
    s.querySelectorAll('.sb-item[id^="sb-"]').forEach(item=>{
      const id = item.id.replace(/^sb-/,'');
      if(!allowed.has(id)) item.style.setProperty('display','none','important');
    });
    if(r!=='rh'){
      ['gestao-rh','usuarios','dashboard','auditoria','desenvolvimento','desenvolvimento-talentos','pdi','disc','cargos','meu-desenvolvimento','experiencia','organograma','trilhas'].forEach(id=>{ const el=getItem(id); if(el) el.style.setProperty('display','none','important'); });
    }
  }
  function estruturaCarreiraFase1HTML(){
    return `
      <div class="hero">
        <div>
          <div class="h-eyebrow">Estrutura & Carreira · Fase 1</div>
          <h1>ESTRUTURA E CARREIRA</h1>
          <p>Visualize a estrutura organizacional, sua equipe e as trilhas de carreira disponíveis. Os demais recursos de desenvolvimento entram na Fase 2 do Roadmap.</p>
        </div>
      </div>
      <div class="estrutura-fase1-grid">
        <div class="estrutura-fase1-card">
          <h2>🏢 Organograma</h2>
          <p>Visão simples da estrutura hierárquica e posicionamento do colaborador dentro da empresa.</p>
          <div class="estrutura-lista">
            <span>Gestor direto: Coordenação da área</span>
            <span>Diretoria: Diretoria Executiva</span>
            <span>Departamento: Recursos Humanos</span>
            <span>Unidade: IMEX</span>
            <span>Contatos corporativos da área</span>
          </div>
        </div>
        <div class="estrutura-fase1-card">
          <h2>👥 Minha Equipe</h2>
          <p>Informações principais dos integrantes da equipe e contato interno.</p>
          <div class="estrutura-lista">
            <span>Gestor imediato</span>
            <span>Integrantes da equipe</span>
            <span>Cargo de cada colaborador</span>
            <span>E-mail corporativo</span>
            <span>Ramal / contato interno</span>
          </div>
        </div>
        <div class="estrutura-fase1-card" onclick="window.abrirTrilhasColaborador&&window.abrirTrilhasColaborador()" style="cursor:pointer;transition:.15s;border:1.5px solid #e2e8f0" onmouseover="this.style.borderColor='#9613f7';this.style.boxShadow='0 12px 32px rgba(150,19,247,.18)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.boxShadow=''">
          <h2>🚀 Trilhas de Carreira</h2>
          <p>Sua jornada de crescimento: cargo atual, próximo nível, competências e cursos recomendados.</p>
          <div class="estrutura-lista">
            <span>Cargo atual → Próximo nível</span>
            <span>Competências obrigatórias</span>
            <span>Cursos recomendados</span>
            <span>Progresso e requisitos para promoção</span>
          </div>
          <div class="estrutura-progress"><i style="width:60%"></i></div>
          <div style="margin-top:12px;font-size:12px;font-weight:700;color:#9613f7">Ver trilha completa →</div>
        </div>
      </div>`;
  }
  function roadmapHTMLFinal(){
    return `
      <div class="hero">
        <div>
          <div class="h-eyebrow">Planejamento · Evolução da plataforma</div>
          <h1>ROADMAP DO PRODUTO</h1>
          <p>Conheça a evolução planejada do Conecta IMEX: o que já está implantado e quais módulos entram nas próximas fases.</p>
        </div>
      </div>
      <div class="roadmap-legend"><span>✅ Implantada</span><span>🔮 Planejada</span></div>
      <div class="roadmap-grid">
        <div class="roadmap-card">
          <div class="roadmap-status ok">✅ Fase 1 · Implantada</div>
          <h2>Versão atual</h2>
          <h3>🌐 Painel do Colaborador</h3>
          <div class="roadmap-list"><span>Intranet</span><span>Gamificação</span><span>Estrutura e Carreira: Organograma</span><span>Estrutura e Carreira: Minha Equipe</span><span>Estrutura e Carreira: Trilhas de Carreira</span><span>Meus Benefícios</span><span>Férias</span><span>Pesquisas</span><span>Ouvidoria</span><span>Conecta AI</span></div>
          <h3>👥 Gestão RH</h3>
          <div class="roadmap-list"><span>Colaboradores</span><span>Endereços</span><span>Remuneração</span><span>Movimentações</span><span>Admissões</span><span>Desligamentos</span><span>Gestão de Férias</span><span>Documentos</span><span>Benefícios</span></div>
        </div>
        <div class="roadmap-card">
          <div class="roadmap-status plan">🔮 Fase 2 · Planejada</div>
          <h2>Desenvolvimento & Talentos</h2>
          <div class="roadmap-list"><span>📚 Meu Desenvolvimento</span><span>📝 PDI</span><span>🧠 DISC</span><span>⭐ Avaliação de Desempenho</span><span>🎯 Competências</span><span>📘 Cursos Recomendados</span><span>📈 Histórico de Carreira</span><span>🚀 Próximos Passos</span><span>🧩 Mapeamento de Talentos</span><span>📊 Matriz 9 Box</span><span>🏦 Banco de Competências</span><span>🎓 Universidade Corporativa</span></div>
          <div class="roadmap-note">Status: planejado para futuras versões. Os cards avançados saíram da Fase 1 para manter o módulo Estrutura e Carreira mais limpo.</div>
        </div>
        <div class="roadmap-card">
          <div class="roadmap-status plan">🔮 Fase 3 · Planejada</div>
          <h2>Recrutamento & Seleção</h2>
          <div class="roadmap-list"><span>📋 Gestão de Vagas</span><span>👤 Banco de Talentos</span><span>📄 Currículos</span><span>📅 Entrevistas</span><span>📊 Pipeline de Candidatos</span><span>🤖 Triagem Inteligente com IA</span><span>📈 Indicadores de R&S</span><span>✉️ Comunicação com candidatos</span></div>
          <div class="roadmap-note">Status: planejado para expansão futura da plataforma.</div>
        </div>
      </div>`;
  }
  function mainArea(){ return document.querySelector('.main-area') || document.body; }
  function ensureView(id){
    let v = $('view-'+id);
    if(!v){ v=document.createElement('div'); v.id='view-'+id; v.className='page'; mainArea().appendChild(v); }
    if(v.parentElement !== mainArea()) mainArea().appendChild(v);
    return v;
  }
  function renderEstruturaFase1(){ const v=ensureView('estrutura-carreira'); v.innerHTML=estruturaCarreiraFase1HTML(); return v; }
  function renderRoadmapFinal(){ const v=ensureView('roadmap-produto'); v.innerHTML=roadmapHTMLFinal(); return v; }
  const previousSbNav = window.sbNav;
  window.sbNav = function(id){
    id = String(id||'intranet').trim();
    if(id==='estrutura-carreira'){
      renderEstruturaFase1();
    }
    if(id==='roadmap-produto'){
      renderRoadmapFinal();
    }
    if(roleAtualFinal()!=='rh' && ['gestao-rh','usuarios','dashboard','auditoria','desenvolvimento','desenvolvimento-talentos','pdi','disc','cargos','meu-desenvolvimento','experiencia','organograma','trilhas'].includes(id)){
      id='intranet';
    }
    try{ if(typeof previousSbNav==='function') previousSbNav(id); }catch(e){ console.warn('[PATCH FINAL] navegação anterior ignorada', e); }
    if(id==='estrutura-carreira') renderEstruturaFase1();
    if(id==='roadmap-produto') renderRoadmapFinal();
    applyColaboradorSidebar();
    return false;
  };
  window.switchView = window.sbNav;
  window.renderEstruturaCarreira = renderEstruturaFase1;
  window.renderEstrutura = renderEstruturaFase1;
  function bootFinal(){
    applyColaboradorSidebar();
    renderEstruturaFase1();
    renderRoadmapFinal();
    const dev = getItem('desenvolvimento'); if(dev && roleAtualFinal()!=='rh') dev.style.setProperty('display','none','important');
    console.log('[PATCH FINAL] Colaborador: Gamificação abaixo da Intranet; Estrutura e Carreira com 3 cards; Fase 2 no Roadmap.');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bootFinal); else bootFinal();
  setTimeout(bootFinal,120);
})();
