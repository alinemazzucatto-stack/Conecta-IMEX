// ===== script: patch-rh-cards-inteligentes-beneficios-v1 =====
(function(){
  'use strict';

  function ensureStyle(){
    if(document.getElementById('style-rh-cards-inteligentes-v1')) return;
    const st = document.createElement('style');
    st.id = 'style-rh-cards-inteligentes-v1';
    st.textContent = `
      .conecta-rh-rh-grid-final{
        display:grid;
        grid-template-columns:repeat(3,minmax(260px,1fr));
        gap:18px;
        margin:24px 0 38px;
      }
      .conecta-rh-rh-card-final{
        background:#fff;
        border:1px solid var(--border,#e2e8f0);
        border-radius:22px;
        padding:22px;
        text-align:left;
        cursor:pointer;
        box-shadow:0 14px 34px rgba(16,24,40,.06);
        transition:.22s ease;
        color:inherit;
        font-family:inherit;
        min-height:230px;
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        overflow:hidden;
        position:relative;
      }
      .conecta-rh-rh-card-final::after{
        content:'';
        position:absolute;
        width:150px;
        height:150px;
        right:-70px;
        top:-70px;
        border-radius:999px;
        background:rgba(0,71,255,.06);
        transition:.22s ease;
      }
      .conecta-rh-rh-card-final:hover{
        transform:translateY(-4px);
        border-color:#0047FF;
        box-shadow:0 18px 42px rgba(0,71,255,.14);
      }
      .conecta-rh-rh-card-final:hover::after{transform:scale(1.18)}
      .conecta-rh-rh-icon-final{
        width:58px;
        height:58px;
        border-radius:18px;
        background:linear-gradient(135deg,#edf4ff,#ffffff);
        color:#0047FF;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:30px;
        box-shadow:inset 0 0 0 1px rgba(0,71,255,.10);
        margin-bottom:14px;
        position:relative;
        z-index:2;
      }
      .conecta-rh-rh-card-final h3{
        font-size:18px;
        line-height:1.2;
        margin:0 0 8px;
        color:#111827;
        font-weight:900;
        position:relative;
        z-index:2;
      }
      .conecta-rh-rh-card-final p{
        font-size:13px;
        line-height:1.45;
        color:var(--ink-60,#4a5568);
        margin:0 0 14px;
        position:relative;
        z-index:2;
      }
      .conecta-rh-rh-metrics-final{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:8px;
        margin:12px 0 16px;
        position:relative;
        z-index:2;
      }
      .conecta-rh-rh-metric-final{
        background:#f8fbff;
        border:1px solid #dbeafe;
        border-radius:14px;
        padding:10px 9px;
        min-height:62px;
      }
      .conecta-rh-rh-metric-final strong{
        display:block;
        font-size:17px;
        line-height:1.1;
        color:#0047FF;
        font-weight:900;
        margin-bottom:4px;
      }
      .conecta-rh-rh-metric-final span{
        display:block;
        font-size:10px;
        line-height:1.25;
        color:#64748b;
        font-weight:800;
        text-transform:uppercase;
        letter-spacing:.03em;
      }
      .conecta-rh-rh-open-final{
        width:100%;
        border:1.5px solid #c7d7fe;
        background:#fff;
        color:#0047FF;
        border-radius:999px;
        padding:11px 16px;
        font-size:13px;
        font-weight:900;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        position:relative;
        z-index:2;
        transition:.2s ease;
      }
      .conecta-rh-rh-card-final:hover .conecta-rh-rh-open-final{
        background:#0047FF;
        color:#fff;
        border-color:#0047FF;
      }
      .conecta-rh-roadmap-mini-final{
        display:grid;
        gap:8px;
        margin:12px 0 16px;
        position:relative;
        z-index:2;
      }
      .conecta-rh-roadmap-row-final{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        background:#f8fbff;
        border:1px solid #dbeafe;
        border-radius:14px;
        padding:9px 11px;
      }
      .conecta-rh-roadmap-row-final b{
        font-size:12px;
        color:#111827;
      }
      .conecta-rh-roadmap-row-final span{
        font-size:10px;
        font-weight:900;
        color:#0047FF;
        background:#edf4ff;
        padding:5px 8px;
        border-radius:999px;
        white-space:nowrap;
      }
      .conecta-rh-rh-card-final.conecta-rh-roadmap-card-final{
        border-color:rgba(0,71,255,.25);
        background:linear-gradient(135deg,#ffffff,#f8fbff);
      }
      .conecta-rh-rh-card-final.conecta-rh-benef-card-final{
        border-color:rgba(0,71,255,.22);
      }
      .conecta-rh-rh-legend-final{
        margin-top:18px;
        background:#eef4ff;
        border:1px solid #c7d7fe;
        color:#1e3a8a;
        border-radius:18px;
        padding:14px 18px;
        font-size:13px;
        line-height:1.55;
      }
      @media(max-width:1180px){.conecta-rh-rh-grid-final{grid-template-columns:repeat(2,minmax(240px,1fr))}}
      @media(max-width:760px){
        .conecta-rh-rh-grid-final{grid-template-columns:1fr}
        .conecta-rh-rh-metrics-final{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(st);
  }

  function ensureView(id){
    let v = document.getElementById('view-' + id);
    if(!v){
      v = document.createElement('div');
      v.id = 'view-' + id;
      v.className = 'page';
      v.style.display = 'none';
      const host = document.getElementById('appPage') || document.querySelector('.main-area') || document.body;
      host.appendChild(v);
    }
    return v;
  }

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  const cards = [
    {
      icon:'👥', title:'Colaboradores',
      desc:'Base central de colaboradores, contratos, cargo, setor, status e acesso.',
      target:'colaboradores',
      metrics:[['63','Colaboradores'],['44','CLT'],['19','PJ']]
    },
    {
      icon:'📍', title:'Endereços',
      desc:'Cadastro, atualização e conferência de endereço dos colaboradores.',
      target:'gestao-rh',
      tab:'enderecos',
      metrics:[['63','Cadastros'],['—','Pendências'],['—','Atualizações']]
    },
    {
      icon:'💰', title:'Remuneração',
      desc:'Folha mensal, médias salariais, histórico e movimentações de remuneração.',
      target:'gestao-rh',
      tab:'remuneracao',
      metrics:[['Folha','Mês'],['CLT','Médio'],['PJ','Médio']]
    },
    {
      icon:'🌴', title:'Férias',
      desc:'Solicitações, aprovações, saldos, vencimentos, calendário e bloqueios.',
      target:'gestao-rh',
      tab:'ferias',
      metrics:[['8','Pendentes'],['12','Aprovadas'],['3','Vencendo']]
    },
    {
      icon:'🎁', title:'Benefícios',
      desc:'Unimed, Wellhub, Starbem, Dasa, Optum e iFood Benefícios.',
      target:'beneficios',
      metrics:[['6','Benefícios'],['VA','30/31'],['FAQ','Ativo']],
      extraClass:'imex-benef-card-final'
    },
    {
      icon:'📄', title:'Documentos',
      desc:'Contratos, termos, políticas internas, arquivos e prontuário.',
      target:'gestao-rh',
      tab:'documentos',
      metrics:[['Políticas','Internas'],['Termos','RH'],['Arquivos','Gerais']]
    },
    {
      icon:'📋', title:'Pesquisas',
      desc:'Pesquisas ativas, modelos, participação, encerradas e relatórios.',
      target:'gestao-rh',
      tab:'pesquisas-rh',
      metrics:[['Ativas','—'],['Encerradas','—'],['Taxa','—']]
    },
    {
      icon:'📝', title:'Admissão',
      desc:'Checklist admissional, contratos, documentos, integração e acessos.',
      target:'gestao-rh',
      tab:'admissao',
      metrics:[['Checklist','RH'],['Docs','Pendentes'],['Integração','Ativa']]
    },
    {
      icon:'🚪', title:'Desligamentos',
      desc:'Controle de desligamentos, histórico, motivos, entrevistas e indicadores.',
      target:'gestao-rh',
      tab:'desligamentos',
      metrics:[['Mês','—'],['Histórico','Ativo'],['Entrevista','Saída']]
    },
    {
      icon:'🔄', title:'Movimentações',
      desc:'Alterações de cargo, salário, setor, gestor, unidade e histórico.',
      target:'gestao-rh',
      tab:'movimentacoes',
      metrics:[['Cargo','Setor'],['Salário','Histórico'],['Gestor','Unidade']]
    },
    {
      icon:'🗺️', title:'Roadmap do Produto',
      desc:'Acompanhe a evolução do sistema, fases implantadas e próximas entregas.',
      target:'gestao-rh',
      tab:'roadmap-produto',
      roadmap:true,
      extraClass:'imex-roadmap-card-final'
    }
  ];

  function metricHTML(card){
    if(card.roadmap){
      return `<div class="imex-roadmap-mini-final">
        <div class="imex-roadmap-row-final"><b>✅ Fase 1</b><span>Implantada</span></div>
        <div class="imex-roadmap-row-final"><b>🔮 Fase 2</b><span>Planejada</span></div>
        <div class="imex-roadmap-row-final"><b>🚀 Fase 3</b><span>Futura</span></div>
      </div>`;
    }
    return `<div class="imex-rh-metrics-final">${card.metrics.map(m=>`
      <div class="imex-rh-metric-final"><strong>${esc(m[0])}</strong><span>${esc(m[1])}</span></div>
    `).join('')}</div>`;
  }

  function openAction(card){
    const tabAction = card.tab ? `data-rh-tab="${esc(card.tab)}"` : '';
    const target = esc(card.target || 'gestao-rh');
    return `<button class="imex-rh-open-final" type="button" ${tabAction} data-target="${target}">Abrir módulo →</button>`;
  }

  function cardHTML(card){
    const tabAction = card.tab ? `data-rh-tab="${esc(card.tab)}"` : '';
    const target = esc(card.target || 'gestao-rh');
    return `<article class="imex-rh-card-final ${card.extraClass||''}" role="button" tabindex="0" ${tabAction} data-target="${target}">
      <div>
        <div class="imex-rh-icon-final">${card.icon}</div>
        <h3>${esc(card.title)}</h3>
        <p>${esc(card.desc)}</p>
        ${metricHTML(card)}
      </div>
      ${openAction(card)}
    </article>`;
  }

  function renderGestaoRHFinal(){
    ensureStyle();
    const v = ensureView('gestao-rh');
    v.innerHTML = `
      <section class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important">
        <div class="h-content">
          <div class="h-eyebrow">Painel exclusivo · RH</div>
          <h1>GESTÃO DE RH</h1>
          <p>Base centralizada de colaboradores, endereços, remuneração, férias, benefícios, documentos e movimentações.</p>
        </div>
        <div class="h-stats">
          <div class="h-stat"><span class="h-num">63</span><span class="h-lbl">Colaboradores</span></div>
          <div class="h-stat"><span class="h-num">44</span><span class="h-lbl">CLT</span></div>
          <div class="h-stat"><span class="h-num">19</span><span class="h-lbl">PJ</span></div>
        </div>
      </section>
      <div class="imex-rh-grid-final">${cards.map(cardHTML).join('')}</div>
      <div class="imex-rh-legend-final">
        <strong>Organização oficial da Gestão RH:</strong> Colaboradores, Endereços, Remuneração, Férias, Benefícios, Documentos, Pesquisas, Admissão, Desligamentos, Movimentações e Roadmap do Produto.
      </div>
    `;
    bindGestaoCards(v);
    return v;
  }

  function bindGestaoCards(scope){
    scope.querySelectorAll('.conecta-rh-rh-card-final,.conecta-rh-rh-open-final').forEach(el=>{
      el.onclick = function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        const root = el.closest('.conecta-rh-rh-card-final') || el;
        const target = root.getAttribute('data-target') || 'gestao-rh';
        const tab = root.getAttribute('data-rh-tab');
        if(target === 'beneficios'){
          if(typeof window.sbNav === 'function') window.sbNav('beneficios');
          else if(typeof window.renderBeneficios === 'function') window.renderBeneficios();
          return;
        }
        if(typeof window.sbNav === 'function') window.sbNav(target);
        if(tab){
          setTimeout(()=>{
            const btn = Array.from(document.querySelectorAll('#grh-tabs .tab')).find(b => (b.getAttribute('onclick')||'').includes("'" + tab + "'"));
            if(btn && typeof window.grhTab === 'function') window.grhTab(tab, btn);
          },120);
        }
      };
      el.onkeydown = function(ev){
        if(ev.key === 'Enter' || ev.key === ' '){
          ev.preventDefault();
          el.click();
        }
      };
    });
  }

  function renderRoadmapPane(){
    const pane = document.getElementById('grh-pane-roadmap-produto');
    if(!pane) return;
    pane.innerHTML = `<div class="card">
      <div class="card-head"><div class="cht"><h2>🗺️ Roadmap do Produto</h2><p>Evolução planejada do sistema RH.</p></div></div>
      <div class="card-body">
        <div class="imex-roadmap-mini-final">
          <div class="imex-roadmap-row-final"><b>✅ Fase 1 — Gestão RH + Intranet + Benefícios</b><span>Implantada</span></div>
          <div class="imex-roadmap-row-final"><b>🔮 Fase 2 — Desenvolvimento & Talentos</b><span>Planejada</span></div>
          <div class="imex-roadmap-row-final"><b>🚀 Fase 3 — Recrutamento & Seleção</b><span>Futura</span></div>
        </div>
      </div>
    </div>`;
  }

  const oldGarantir = window.garantirGestaoRHTabs;
  window.garantirGestaoRHTabs = function(){
    try{ if(typeof oldGarantir === 'function') oldGarantir(); }catch(e){}
    renderRoadmapPane();
  };

  window.renderGestaoRH = renderGestaoRHFinal;
  window.gestaoRhCarregar = renderGestaoRHFinal;

  const oldSbNav = window.sbNav;
  window.sbNav = function(id){
    if(id === 'gestao-rh') return renderGestaoRHFinal();
    return typeof oldSbNav === 'function' ? oldSbNav(id) : undefined;
  };

  const oldSwitchView = window.switchView;
  window.switchView = function(id){
    if(id === 'gestao-rh') return renderGestaoRHFinal();
    return typeof oldSwitchView === 'function' ? oldSwitchView(id) : undefined;
  };

  const oldShowView = window.showView;
  window.showView = function(id){
    if(id === 'gestao-rh') return renderGestaoRHFinal();
    return typeof oldShowView === 'function' ? oldShowView(id) : undefined;
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      setTimeout(()=>{
        const active = document.getElementById('view-gestao-rh');
        if(active && (active.classList.contains('active') || active.style.display === 'block')) renderGestaoRHFinal();
      },300);
    });
  }else{
    setTimeout(()=>{
      const active = document.getElementById('view-gestao-rh');
      if(active && (active.classList.contains('active') || active.style.display === 'block')) renderGestaoRHFinal();
    },300);
  }
})();



