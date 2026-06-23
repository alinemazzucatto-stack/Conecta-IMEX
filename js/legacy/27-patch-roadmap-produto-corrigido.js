// ===== script: patch-roadmap-produto-corrigido-js =====
(function(){
  const HIDE_IDS = ['desenvolvimento','estrutura-carreira','desenvolvimento-talentos','trilhas','disc','pdi','cargos','meu-desenvolvimento','organograma','experiencia','selecao'];

  function mainArea(){ return document.querySelector('.main-area') || document.getElementById('appShell') || document.body; }

  function setTopbar(icon,label){
    const pi=document.getElementById('tPageIcon'); if(pi) pi.textContent=icon;
    const pt=document.getElementById('tPageTitle'); if(pt) pt.textContent=label;
  }

  function hideOldMenus(){
    HIDE_IDS.forEach(id=>{ const el=document.getElementById('sb-'+id); if(el) el.style.setProperty('display','none','important'); });
    const intranetTip=document.querySelector('#sb-intranet .sb-tip');
    if(intranetTip) intranetTip.textContent='Conexão';
    const intranet=document.getElementById('sb-intranet');
    if(intranet) intranet.setAttribute('title','Conexão');
  }

  function ensureSidebarRoadmap(){
    hideOldMenus();
    let item=document.getElementById('sb-roadmap-produto');
    if(!item){
      item=document.createElement('div');
      item.className='sb-item';
      item.id='sb-roadmap-produto';
      item.setAttribute('onclick',"sbNav('roadmap-produto')");
      item.innerHTML='<span>🚀</span><span class="sb-tip">Roadmap do Produto</span>';
      const ref=document.getElementById('sb-gestao-rh') || document.getElementById('sb-intranet') || document.querySelector('.sb-spacer');
      if(ref && ref.parentNode){ ref.parentNode.insertBefore(item, ref.nextSibling); }
      else { const sidebar=document.getElementById('sidebar'); if(sidebar) sidebar.appendChild(item); }
    }
    // Roadmap lateral desabilitado
  }

  function roadmapHTML(){
    return `
      <div class="hero">
        <div>
          <div class="h-eyebrow">Planejamento · Evolução da plataforma</div>
          <h1>ROADMAP DO PRODUTO</h1>
          <p>Conheça a evolução planejada do Conecta IMEX: o que já está implantado e quais módulos estão previstos para futuras versões.</p>
        </div>
      </div>
      <div class="roadmap-legend">
        <span>✅ Implantada</span>
        <span>🔮 Planejada</span>
      </div>
      <div class="roadmap-grid">
        <div class="roadmap-card">
          <div class="roadmap-status ok">✅ Fase 1 · Implantada</div>
          <h2>Versão atual</h2>
          <h3>👥 Gestão de RH</h3>
          <div class="roadmap-list">
            <span>Colaboradores</span><span>Endereços</span><span>Remuneração</span><span>Movimentações</span><span>Admissões</span><span>Desligamentos</span><span>Gestão de Férias</span><span>Documentos</span><span>Benefícios</span>
          </div>
          <h3>🌐 Conexão</h3>
          <div class="roadmap-list">
            <span>Intranet Corporativa</span><span>Comunicados</span><span>Pesquisas Internas</span><span>Ouvidoria</span><span>Aniversariantes</span><span>Reconhecimento</span>
          </div>
        </div>
        <div class="roadmap-card">
          <div class="roadmap-status plan">🔮 Fase 2 · Planejada</div>
          <h2>Desenvolvimento & Talentos</h2>
          <div class="roadmap-list">
            <span>🎯 Trilhas de Carreira</span><span>📚 Meu Desenvolvimento</span><span>📝 PDI</span><span>🧠 DISC</span><span>⭐ Avaliação de Desempenho</span><span>🚀 Mapeamento de Talentos</span><span>📊 Matriz 9 Box</span><span>🎓 Universidade Corporativa</span>
          </div>
          <div class="roadmap-note">Status: planejado para futuras versões. Esta frente está pausada no momento.</div>
        </div>
        <div class="roadmap-card">
          <div class="roadmap-status plan">🔮 Fase 3 · Planejada</div>
          <h2>Recrutamento & Seleção</h2>
          <div class="roadmap-list">
            <span>📋 Gestão de Vagas</span><span>👤 Banco de Talentos</span><span>📄 Currículos</span><span>📅 Entrevistas</span><span>📊 Pipeline de Candidatos</span><span>🤖 Triagem Inteligente com IA</span><span>📈 Indicadores de R&S</span><span>✉️ Comunicação com candidatos</span>
          </div>
          <div class="roadmap-note">Status: planejado para expansão futura da plataforma.</div>
        </div>
      </div>`;
  }

  function ensureRoadmapView(){
    let v=document.getElementById('view-roadmap-produto');
    if(!v){
      v=document.createElement('div');
      v.id='view-roadmap-produto';
      v.className='page';
      mainArea().appendChild(v);
    }
    v.innerHTML=roadmapHTML();
    return v;
  }

  function abrirRoadmap(){
    ensureSidebarRoadmap();
    const v=ensureRoadmapView();
    document.querySelectorAll('[id^="view-"]').forEach(el=>{
      const show = el.id==='view-roadmap-produto';
      el.classList.toggle('active',show);
      el.style.setProperty('display',show?'block':'none','important');
    });
    document.querySelectorAll('.sb-item[id^="sb-"]').forEach(el=>el.classList.remove('active'));
    const sb=document.getElementById('sb-roadmap-produto'); if(sb) sb.classList.add('active');
    const hero=document.getElementById('mainHero'); if(hero) hero.style.display='none';
    setTopbar('🚀','Roadmap do Produto');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  window.abrirRoadmapProduto = abrirRoadmap;

  function patchNavigation(){
    if(!window.__roadmapProdutoNavPatch){
      window.__roadmapProdutoNavPatch=true;
      const oldSb=window.sbNav;
      window.sbNav=function(v){
        if(v==='roadmap-produto') return abrirRoadmap();
        return typeof oldSb==='function' ? oldSb.apply(this,arguments) : null;
      };
      const oldSwitch=window.switchView;
      window.switchView=function(v){
        if(v==='roadmap-produto') return abrirRoadmap();
        return typeof oldSwitch==='function' ? oldSwitch.apply(this,arguments) : null;
      };
    }
  }

  function patchGestaoRHCard(){
    const tabs=document.getElementById('grh-tabs');
    if(!tabs) return;
    [...tabs.querySelectorAll('button.tab')].forEach(btn=>{
      const txt=(btn.innerText||'').toLowerCase();
      const onclick=btn.getAttribute('onclick')||'';
      if(txt.includes('próximas') || txt.includes('proximas') || onclick.includes('proximas-funcionalidades') || txt.includes('roadmap')){
        btn.setAttribute('data-icon','🚀');
        btn.setAttribute('onclick',"sbNav('roadmap-produto')");
        if(!btn.dataset.roadmapOk){
      btn.innerHTML='<span><span class="grh-card-title">Roadmap do Produto</span><span class="grh-card-sub">Fases planejadas da plataforma</span></span>';
      btn.dataset.roadmapOk='1';
    }
      }
    });
  }

  function patchGrhTabRedirect(){
    if(window.__roadmapProdutoGrhPatch) return;
    window.__roadmapProdutoGrhPatch=true;
    const old=window.grhTab;
    window.grhTab=function(tab,btn){
      if(tab==='proximas-funcionalidades' || tab==='roadmap-produto') return abrirRoadmap();
      return typeof old==='function' ? old.apply(this,arguments) : null;
    };
  }

  function run(){
    ensureSidebarRoadmap();
    ensureRoadmapView();
    patchNavigation();
    patchGrhTabRedirect();
    patchGestaoRHCard();
  }

  document.addEventListener('DOMContentLoaded',()=>{ run(); setTimeout(run,500); setTimeout(run,1400); setTimeout(run,2600); });
  setTimeout(run,300);
  setTimeout(run,1200);
  setTimeout(run,2500);
  setTimeout(run,4000);
})();
