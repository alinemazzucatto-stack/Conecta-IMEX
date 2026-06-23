// ===== script: patch-roadmap-lugar-certo =====
(function(){
  const ROADMAP_HTML = `
    <div class="card">
      <div class="card-head">
        <div class="cht">
          <h2>🚀 Roadmap do Produto</h2>
          <p>Conheça a evolução planejada do Conecta IMEX.</p>
        </div>
      </div>
      <div class="card-body">
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px">
          <span class="badge ba">✅ Implantada</span>
          <span class="badge bb">🔮 Planejada</span>
        </div>

        <div class="roadmap-produto-grid">
          <div class="roadmap-produto-card">
            <div class="roadmap-status ok">✅ Fase 1 — Implantada</div>
            <h3>Versão Atual</h3>

            <h4>Gestão de RH</h4>
            <div class="roadmap-list">
              <span>Colaboradores</span>
              <span>Endereços</span>
              <span>Remuneração</span>
              <span>Movimentações</span>
              <span>Admissões</span>
              <span>Desligamentos</span>
              <span>Gestão de Férias</span>
              <span>Documentos</span>
              <span>Benefícios</span>
            </div>

            <h4>Conexão</h4>
            <div class="roadmap-list">
              <span>Intranet Corporativa</span>
              <span>Comunicados</span>
              <span>Pesquisas Internas</span>
              <span>Ouvidoria</span>
              <span>Aniversariantes</span>
              <span>Reconhecimento</span>
            </div>
          </div>

          <div class="roadmap-produto-card">
            <div class="roadmap-status plan">🔮 Fase 2 — Planejada</div>
            <h3>Desenvolvimento & Talentos</h3>
            <div class="roadmap-list">
              <span>Trilhas de Carreira</span>
              <span>Meu Desenvolvimento</span>
              <span>PDI</span>
              <span>DISC</span>
              <span>Avaliação de Desempenho</span>
              <span>Mapeamento de Talentos</span>
              <span>Matriz 9 Box</span>
              <span>Universidade Corporativa</span>
            </div>
          </div>

          <div class="roadmap-produto-card">
            <div class="roadmap-status plan">🔮 Fase 3 — Planejada</div>
            <h3>Recrutamento & Seleção</h3>
            <div class="roadmap-list">
              <span>Gestão de Vagas</span>
              <span>Banco de Talentos</span>
              <span>Pipeline de Candidatos</span>
              <span>Entrevistas</span>
              <span>Indicadores de R&S</span>
              <span>Triagem Inteligente com IA</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  function addStyle(){
    if(document.getElementById('roadmap-produto-style-correto')) return;
    const style = document.createElement('style');
    style.id = 'roadmap-produto-style-correto';
    style.textContent = `
      #grh-pane-roadmap-produto{display:none}
      .roadmap-produto-grid{display:grid;grid-template-columns:1.15fr 1fr 1fr;gap:18px}
      .roadmap-produto-card{background:#fff;border:1px solid var(--border);border-radius:22px;padding:24px;box-shadow:0 14px 34px rgba(16,24,40,.07);position:relative;overflow:hidden}
      .roadmap-produto-card::after{content:'';position:absolute;right:-55px;top:-55px;width:150px;height:150px;border-radius:999px;background:rgba(0,71,255,.06)}
      .roadmap-produto-card h3{font-size:22px;font-weight:900;color:var(--ink);margin:0 0 14px;position:relative;z-index:1}
      .roadmap-produto-card h4{font-size:14px;font-weight:900;color:#0047FF;margin:16px 0 8px;position:relative;z-index:1}
      .roadmap-status{display:inline-flex;border-radius:999px;padding:7px 12px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;margin-bottom:16px;position:relative;z-index:1}
      .roadmap-status.ok{background:#d1fae5;color:#065f46}
      .roadmap-status.plan{background:#dbeafe;color:#0047FF}
      .roadmap-list{display:grid;gap:8px;position:relative;z-index:1}
      .roadmap-list span{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:700;color:#334155}
      @media(max-width:1100px){.roadmap-produto-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function removerRoadmapDoLugarErrado(){
    const candidatos = document.querySelectorAll('#grh-colabs-list * , #grh-pane-colaboradores * , #grh-colab-body *');
    candidatos.forEach(el=>{
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(txt.includes('roadmap do produto') || txt.includes('próximas funcionalidades') || txt.includes('proximas funcionalidades')){
        const item = el.closest('.tab') || el.closest('.rh-card') || el.closest('.grh-card') || el.closest('button') || el.closest('div') || el;
        if(item && !item.closest('#grh-tabs') && !item.closest('#grh-pane-roadmap-produto')) item.remove();
      }
    });
  }

  function instalarRoadmapCorreto(){
    addStyle();
    removerRoadmapDoLugarErrado();

    const tabs = document.getElementById('grh-tabs');
    if(!tabs || !tabs.parentElement) return;

    const oldPane = document.getElementById('grh-pane-proximas-funcionalidades');
    if(oldPane) oldPane.remove();

    let pane = document.getElementById('grh-pane-roadmap-produto');
    if(!pane){
      pane = document.createElement('div');
      pane.id = 'grh-pane-roadmap-produto';
      pane.innerHTML = ROADMAP_HTML;
      tabs.parentElement.appendChild(pane);
    }else if(!pane.innerHTML.includes('Fase 1')){
      pane.innerHTML = ROADMAP_HTML;
    }

    let btn = Array.from(tabs.querySelectorAll('.tab')).find(b=>{
      const t=(b.textContent||'').toLowerCase();
      const o=(b.getAttribute('onclick')||'').toLowerCase();
      return t.includes('roadmap') || t.includes('próximas') || t.includes('proximas') || o.includes('roadmap-produto') || o.includes('proximas-funcionalidades');
    });

    if(!btn){
      btn = document.createElement('button');
      btn.className = 'tab';
      tabs.appendChild(btn);
    }

    btn.setAttribute('onclick',"grhTab('roadmap-produto',this)");
    btn.innerHTML = '<span><span class="grh-card-title">Roadmap do Produto</span><span class="grh-card-sub">Fases planejadas da plataforma</span></span>';
  }

  function abrirRoadmap(btn){
    instalarRoadmapCorreto();
    const view = document.getElementById('view-gestao-rh');
    if(view) view.classList.add('grh-module-open');

    document.querySelectorAll('#view-gestao-rh [id^="grh-pane-"]').forEach(p=>p.style.display='none');
    document.querySelectorAll('#grh-tabs .tab').forEach(b=>b.classList.remove('active'));

    const pane = document.getElementById('grh-pane-roadmap-produto');
    if(pane) pane.style.display='block';
    if(btn) btn.classList.add('active');

    const title = document.getElementById('grh-back-title');
    if(title) title.textContent='🚀 Roadmap do Produto';
  }

  const oldGrhTab = window.grhTab;
  window.grhTab = function(tab, btn){
    if(tab === 'roadmap-produto' || tab === 'proximas-funcionalidades'){
      return abrirRoadmap(btn);
    }
    return typeof oldGrhTab === 'function' ? oldGrhTab.apply(this, arguments) : null;
  };

  document.addEventListener('DOMContentLoaded', instalarRoadmapCorreto);
  window.addEventListener('load', instalarRoadmapCorreto);
  if(document.readyState !== 'loading') instalarRoadmapCorreto();
  setTimeout(instalarRoadmapCorreto, 800);
})();
