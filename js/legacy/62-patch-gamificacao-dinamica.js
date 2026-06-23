// ===== script: patch-gamificacao-dinamica-js =====
(function(){
  function byId(id){return document.getElementById(id)}
  function ensureView(){
    var v=byId('view-gamificacao');
    if(!v){
      v=document.createElement('div');
      v.id='view-gamificacao';
      v.className='page';
      v.style.display='none';
      var main=document.querySelector('.main-area') || document.body;
      main.appendChild(v);
    }
    return v;
  }
  function setActiveTab(key){
    document.querySelectorAll('#view-gamificacao .gam-tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-gam-tab')===key)});
    document.querySelectorAll('#view-gamificacao .gam-section').forEach(function(s){s.classList.toggle('active',s.getAttribute('data-gam-section')===key)});
  }
  function renderGamificacao(){
    var v=ensureView();
    document.querySelectorAll('[id^="view-"]').forEach(function(el){el.classList.remove('active'); el.style.display='none';});
    v.classList.add('active'); v.style.display='block';
    document.querySelectorAll('.sb-item').forEach(function(el){el.classList.remove('active')});
    var sb=byId('sb-gamificacao'); if(sb) sb.classList.add('active');
    var title=byId('tPageTitle'); if(title) title.textContent='Gamificação';
    v.innerHTML = `
      <div class="hero">
        <div>
          <div class="h-eyebrow">Engajamento • Reconhecimento • Evolução</div>
          <h1>🏆 Gamificação</h1>
          <p>Acompanhe ranking, pontos, medalhas, desafios, missões, recompensas e sua evolução dentro da IMEX.</p>
        </div>
        <div class="h-stats">
          <div class="h-stat"><span class="h-num">8.450</span><span class="h-lbl">pontos</span></div>
          <div class="h-stat"><span class="h-num">#3</span><span class="h-lbl">ranking mensal</span></div>
          <div class="h-stat"><span class="h-num">78%</span><span class="h-lbl">progresso</span></div>
        </div>
      </div>

      <div class="gam-grid">
        <div class="gam-card"><div class="gam-ico">🏆</div><div class="gam-label">Ranking Geral</div><div class="gam-value">#5</div><div class="gam-sub">Posição acumulada no ranking geral.</div></div>
        <div class="gam-card"><div class="gam-ico">📅</div><div class="gam-label">Ranking Mensal</div><div class="gam-value">#3</div><div class="gam-sub">Sua posição neste mês.</div></div>
        <div class="gam-card"><div class="gam-ico">⭐</div><div class="gam-label">Pontuação Total</div><div class="gam-value">8.450</div><div class="gam-sub">Pontos acumulados no sistema.</div></div>
        <div class="gam-card"><div class="gam-ico">🔥</div><div class="gam-label">Barra de Progresso</div><div class="gam-value">78%</div><div class="progress-wrap"><div class="progress-fill"></div></div><div class="gam-sub">Faltam 550 pontos para o próximo nível.</div></div>
      </div>

      <div class="gam-layout">
        <div class="card">
          <div class="card-head"><div class="cht"><h2>🏆 Rankings</h2><p>Ranking geral e mensal dos colaboradores.</p></div></div>
          <div class="card-body">
            <div class="gam-tabs">
              <button class="gam-tab active" data-gam-tab="geral">Ranking Geral</button>
              <button class="gam-tab" data-gam-tab="mensal">Ranking Mensal</button>
            </div>
            <div class="gam-section active" data-gam-section="geral">
              <div class="gam-list">
                <div class="rank-row"><div class="rank-left"><div class="rank-pos">1º</div><div><div class="rank-name">Camila Souza</div><div class="rank-meta">Nível Diamante</div></div></div><span class="points-pill">12.900 pts</span></div>
                <div class="rank-row"><div class="rank-left"><div class="rank-pos">2º</div><div><div class="rank-name">Rafael Lima</div><div class="rank-meta">Nível Ouro</div></div></div><span class="points-pill">10.750 pts</span></div>
                <div class="rank-row"><div class="rank-left"><div class="rank-pos">3º</div><div><div class="rank-name">Você</div><div class="rank-meta">Nível Ouro</div></div></div><span class="points-pill">8.450 pts</span></div>
                <div class="rank-row"><div class="rank-left"><div class="rank-pos">4º</div><div><div class="rank-name">Juliana Martins</div><div class="rank-meta">Nível Prata</div></div></div><span class="points-pill">7.820 pts</span></div>
              </div>
            </div>
            <div class="gam-section" data-gam-section="mensal">
              <div class="gam-list">
                <div class="rank-row"><div class="rank-left"><div class="rank-pos">1º</div><div><div class="rank-name">Rafael Lima</div><div class="rank-meta">Maior evolução do mês</div></div></div><span class="points-pill">1.420 pts</span></div>
                <div class="rank-row"><div class="rank-left"><div class="rank-pos">2º</div><div><div class="rank-name">Camila Souza</div><div class="rank-meta">Participação ativa</div></div></div><span class="points-pill">1.190 pts</span></div>
                <div class="rank-row"><div class="rank-left"><div class="rank-pos">3º</div><div><div class="rank-name">Você</div><div class="rank-meta">Ótimo desempenho</div></div></div><span class="points-pill">980 pts</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><div class="cht"><h2>📈 Evolução do Colaborador</h2><p>Progresso de nível e engajamento.</p></div></div>
          <div class="card-body">
            <div class="gam-card" style="box-shadow:none;margin-bottom:12px"><div class="gam-label">Nível atual</div><div class="gam-value">Ouro</div><div class="progress-wrap"><div class="progress-fill"></div></div><div class="gam-sub">78% concluído para chegar ao nível Diamante.</div></div>
            <div class="hist-row"><div class="hist-left"><span>⭐</span><div><div class="hist-title">Pontuação semanal</div><div class="hist-meta">+230 pontos nos últimos 7 dias</div></div></div><span class="points-pill">+230</span></div>
            <div class="hist-row"><div class="hist-left"><span>🔥</span><div><div class="hist-title">Sequência ativa</div><div class="hist-meta">5 dias de participação</div></div></div><span class="points-pill">5 dias</span></div>
          </div>
        </div>
      </div>

      <div class="gam-layout" style="margin-top:18px">
        <div class="card">
          <div class="card-head"><div class="cht"><h2>🎯 Desafios Ativos & 🚀 Missões</h2><p>Complete ações para ganhar pontos.</p></div></div>
          <div class="card-body gam-list">
            <div class="mission-row"><div class="mission-left"><span>🎯</span><div><div class="mission-title">Responder pesquisa de clima</div><div class="mission-meta">Prazo: esta semana<div class="mini-progress"><span style="width:65%"></span></div></div></div></div><span class="points-pill">+120 pts</span></div>
            <div class="mission-row"><div class="mission-left"><span>🚀</span><div><div class="mission-title">Reconhecer um colega</div><div class="mission-meta">Missão mensal<div class="mini-progress"><span style="width:40%"></span></div></div></div></div><span class="points-pill">+80 pts</span></div>
            <div class="mission-row"><div class="mission-left"><span>📚</span><div><div class="mission-title">Concluir trilha recomendada</div><div class="mission-meta">Desenvolvimento<div class="mini-progress"><span style="width:25%"></span></div></div></div></div><span class="points-pill">+200 pts</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><div class="cht"><h2>🎖 Medalhas e Conquistas</h2><p>Conquistas liberadas por participação.</p></div></div>
          <div class="card-body">
            <div class="badge-grid">
              <div class="badge-card"><div class="bicon">🎖</div><strong>Participativo</strong><small>Conquistada</small></div>
              <div class="badge-card"><div class="bicon">💬</div><strong>Comunicador</strong><small>Conquistada</small></div>
              <div class="badge-card"><div class="bicon">🚀</div><strong>Em evolução</strong><small>Em andamento</small></div>
              <div class="badge-card"><div class="bicon">🌟</div><strong>Destaque</strong><small>Bloqueada</small></div>
              <div class="badge-card"><div class="bicon">🤝</div><strong>Colaboração</strong><small>Conquistada</small></div>
              <div class="badge-card"><div class="bicon">🏆</div><strong>Top Ranking</strong><small>Em andamento</small></div>
            </div>
          </div>
        </div>
      </div>

      <div class="gam-layout" style="margin-top:18px">
        <div class="card">
          <div class="card-head"><div class="cht"><h2>🎁 Recompensas</h2><p>Benefícios e reconhecimentos disponíveis.</p></div></div>
          <div class="card-body gam-list">
            <div class="reward-row"><div class="reward-left"><span>🎁</span><div><div class="reward-title">Vale reconhecimento</div><div class="reward-meta">Disponível com 9.000 pontos</div></div></div><span class="badge bp">Faltam 550</span></div>
            <div class="reward-row"><div class="reward-left"><span>☕</span><div><div class="reward-title">Café especial</div><div class="reward-meta">Resgate simbólico interno</div></div></div><span class="badge ba">Disponível</span></div>
            <div class="reward-row"><div class="reward-left"><span>🏅</span><div><div class="reward-title">Destaque no mural</div><div class="reward-meta">Reconhecimento mensal</div></div></div><span class="badge bb">Elegível</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><div class="cht"><h2>📊 Histórico de Pontuação</h2><p>Últimos movimentos registrados.</p></div></div>
          <div class="card-body gam-list">
            <div class="hist-row"><div class="hist-left"><span>✅</span><div><div class="hist-title">Pesquisa respondida</div><div class="hist-meta">Hoje</div></div></div><span class="points-pill">+50</span></div>
            <div class="hist-row"><div class="hist-left"><span>🤝</span><div><div class="hist-title">Reconhecimento enviado</div><div class="hist-meta">Ontem</div></div></div><span class="points-pill">+30</span></div>
            <div class="hist-row"><div class="hist-left"><span>📢</span><div><div class="hist-title">Interação na Intranet</div><div class="hist-meta">Esta semana</div></div></div><span class="points-pill">+20</span></div>
          </div>
        </div>
      </div>
    `;
    v.querySelectorAll('.gam-tab').forEach(function(btn){btn.onclick=function(){setActiveTab(btn.getAttribute('data-gam-tab'));};});
    window.scrollTo({top:0,behavior:'smooth'});
  }
  window.gamificacaoCarregar = renderGamificacao;
  window.gamCarregar = renderGamificacao;
  window.mostrarGamificacao = renderGamificacao;
  var oldSb=window.sbNav;
  window.sbNav=function(id){
    if(id==='gamificacao'){ renderGamificacao(); return; }
    if(typeof oldSb==='function') return oldSb.apply(this,arguments);
  };
})();
