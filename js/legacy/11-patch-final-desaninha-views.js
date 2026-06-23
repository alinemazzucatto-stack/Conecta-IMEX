// ===== script: patch-final-desaninha-views =====
(function(){
  const MODULOS = ['pesquisas','disc','pdi','cargos','conecta-ai','ouvidoria'];

  function mainArea(){ return document.querySelector('.main-area') || document.getElementById('appShell') || document.body; }

  function desaninharViews(){
    const area = mainArea();
    MODULOS.forEach(id => {
      const el = document.getElementById('view-' + id);
      if(!el) return;
      const parentView = el.parentElement && el.parentElement.id && el.parentElement.id.startsWith('view-') ? el.parentElement.id : '';
      if(parentView && parentView !== ('view-' + id)) {
        area.appendChild(el);
      }
      el.classList.add('page');
      if(!el.style.display || el.style.display === '') el.style.display = 'none';
    });
  }

  function esconderViews(exceto){
    document.querySelectorAll('[id^="view-"]').forEach(el => {
      const id = el.id.replace('view-','');
      el.style.display = (id === exceto) ? 'block' : 'none';
      el.classList.toggle('active', id === exceto);
    });
    document.querySelectorAll('.sb-item[id^="sb-"]').forEach(sb => {
      sb.classList.toggle('active', sb.id === 'sb-' + exceto);
    });
    const hero = document.getElementById('mainHero');
    if(hero) hero.style.display = ['solicitacao','gestor','rh'].includes(exceto) ? 'flex' : 'none';
  }

  function preencherSeVazio(id, html){
    const el = document.getElementById('view-' + id);
    if(!el) return;
    const txt = (el.innerText || '').replace(/\s+/g,' ').trim();
    if(txt.length < 80) el.innerHTML = html;
  }

  function fallbackPanels(){
    preencherSeVazio('pesquisas', `<div class="hero"><div><div class="h-eyebrow">Engajamento · Pesquisas internas</div><h1>PESQUISAS</h1><p>Central de pesquisas internas, clima, enquetes e formulários pendentes.</p></div></div><div class="card"><div class="card-head"><div class="cht"><h2>📝 Pesquisas disponíveis</h2><p>Acompanhe pesquisas abertas e respostas recebidas.</p></div></div><div class="card-body"><div class="empty"><div class="ei">📝</div>Nenhuma pesquisa aberta no momento.</div></div></div>`);
    preencherSeVazio('disc', `<div class="hero"><div><div class="h-eyebrow">Perfil comportamental</div><h1>TESTE DISC</h1><p>Painel para aplicação e acompanhamento de testes comportamentais.</p></div></div><div class="card"><div class="card-head"><div class="cht"><h2>🧠 Teste DISC</h2><p>Mapeie perfis, tendências comportamentais e pontos de desenvolvimento.</p></div></div><div class="card-body"><div class="empty"><div class="ei">🧠</div>Nenhum teste respondido ainda.</div></div></div>`);
    preencherSeVazio('pdi', `<div class="hero"><div><div class="h-eyebrow">Desenvolvimento individual</div><h1>PDI & AVALIAÇÃO</h1><p>Central para planos de desenvolvimento, avaliações e evolução profissional.</p></div></div><div class="card"><div class="card-head"><div class="cht"><h2>🎯 Planos de desenvolvimento</h2><p>Acompanhe metas, ações, prazos e feedbacks.</p></div></div><div class="card-body"><div class="empty"><div class="ei">🎯</div>Nenhum PDI cadastrado ainda.</div></div></div>`);
    preencherSeVazio('cargos', `<div class="hero"><div><div class="h-eyebrow">Cargos · Rotinas · Competências</div><h1>DESCRITIVO DE CARGOS</h1><p>Coleta de atividades reais e geração de descritivos com apoio de IA.</p></div></div><div class="card"><div class="card-head"><div class="cht"><h2>📝 Auto descrição do colaborador</h2><p>Preencha rotinas, responsabilidades e conhecimentos técnicos do cargo.</p></div></div><div class="card-body"><div class="fg"><div class="field"><label>Colaborador</label><input placeholder="Nome"></div><div class="field"><label>Cargo atual</label><input placeholder="Ex: Analista de Suporte"></div><div class="field full"><label>Rotinas e atividades</label><textarea placeholder="Liste atividades do dia a dia."></textarea></div></div></div></div>`);
  }

  function patchSwitchView(){
    if(window.__viewsDesaninhadasPatch) return;
    window.__viewsDesaninhadasPatch = true;
    const original = window.switchView;
    window.switchView = function(v){
      desaninharViews();
      // Para os módulos que estavam ficando vazios, usamos navegação direta e segura.
      if(['pesquisas','disc','pdi','cargos','conecta-ai','ouvidoria'].includes(v)){
        esconderViews(v);
        fallbackPanels();
        if(v === 'conecta-ai' && typeof window.conectaAIAtualizarTemas === 'function') setTimeout(window.conectaAIAtualizarTemas, 30);
        if(v === 'ouvidoria' && typeof window.ouvCarregar === 'function') setTimeout(window.ouvCarregar, 30);
        if(v === 'cargos' && typeof window.cargosCarregar === 'function') setTimeout(window.cargosCarregar, 30);
        return;
      }
      if(typeof original === 'function') return original.apply(this, arguments);
      esconderViews(v);
    };
  }

  function run(){ desaninharViews(); fallbackPanels(); patchSwitchView(); }
  document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 100);
  setTimeout(run, 600);
  setTimeout(run, 1500);
})();
