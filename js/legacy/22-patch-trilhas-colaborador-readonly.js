// ===== script: patch-trilhas-colaborador-readonly-js =====
(function(){
  function roleAtualFinal(){
    const r=String(window.role||sessionStorage.getItem('userRole')||'colaborador').toLowerCase();
    if(r==='rh' || r==='rh-colaborador') return 'rh';
    if(r==='gestor') return 'gestor';
    return 'colaborador';
  }
  function isRHFinal(){ return roleAtualFinal()==='rh'; }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function ensureViewFinal(id){
    let v=document.getElementById('view-'+id);
    if(!v){ v=document.createElement('div'); v.id='view-'+id; v.className='page'; v.style.display='none'; (document.getElementById('appPage')||document.querySelector('.main-area')||document.body).appendChild(v); }
    return v;
  }
  function getNomeUsuario(){ return sessionStorage.getItem('userName') || sessionStorage.getItem('nomeUsuario') || (window.currentUserData&&window.currentUserData.nome) || 'Colaborador'; }
  function getCargoAtual(){
    const c=(window.currentUserData&& (window.currentUserData.cargo||window.currentUserData.funcao)) || sessionStorage.getItem('userCargo') || sessionStorage.getItem('cargoAtual') || 'Analista de RH Júnior';
    return c;
  }
  function getSetorAtual(cargo){
    const raw=(window.currentUserData&&(window.currentUserData.setor||window.currentUserData.departamento)) || sessionStorage.getItem('userSetor') || '';
    const n=(raw||cargo||'').toLowerCase();
    if(n.includes('suporte')) return 'Suporte'; if(n.includes('ti')||n.includes('dev')||n.includes('program')) return 'TI'; if(n.includes('comercial')||n.includes('venda')) return 'Comercial'; if(n.includes('finance')) return 'Financeiro'; return 'RH';
  }
  function normaliza(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
  const trilhasDefault={
    'RH':['Assistente de RH','Analista de RH Júnior','Analista de RH Pleno','Analista de RH Sênior','Business Partner','Coordenador de RH','Gerente de RH'],
    'TI':['Desenvolvedor Júnior','Desenvolvedor Pleno','Desenvolvedor Sênior','Tech Lead','Coordenador de Tecnologia','Gerente de Tecnologia'],
    'Suporte':['Analista de Suporte Júnior','Analista de Suporte Pleno','Analista de Suporte Sênior','Líder de Suporte','Coordenador de Suporte','Gerente de Suporte'],
    'Comercial':['SDR','Executivo Comercial Júnior','Executivo Comercial Pleno','Executivo Comercial Sênior','Coordenador Comercial','Gerente Comercial'],
    'Financeiro':['Assistente Financeiro','Analista Financeiro Júnior','Analista Financeiro Pleno','Analista Financeiro Sênior','Controller','Gerente Financeiro']
  };
  const competencias=[
    ['Organização de processos de RH','Controle de rotinas, documentos, benefícios e prazos.','ok'],
    ['Comunicação interna e atendimento ao colaborador','Clareza na comunicação, acolhimento e orientação aos times.','ok'],
    ['Indicadores e relatórios de RH','Construir, acompanhar e interpretar métricas para tomada de decisão.','pendente'],
    ['People Analytics / Power BI','Usar dados para gerar insights e apoiar decisões estratégicas.','pendente'],
    ['Legislação trabalhista aplicada','Conhecer regras essenciais de jornada, férias, admissões e desligamentos.','pendente']
  ];
  const cursos=['Excel Avançado aplicado ao RH','Power BI para indicadores de RH','People Analytics na prática','Feedback, PDI e desenvolvimento de pessoas','Legislação trabalhista para rotinas de RH'];
  const requisitos=['Mínimo de 12 meses no cargo atual','Competências obrigatórias concluídas','Entrega consistente das rotinas do cargo','Participação em projeto estratégico','Avaliação positiva do gestor'];
  function renderTrilhasColaborador(){
    const v=ensureViewFinal('trilhas');
    const cargo=getCargoAtual(); const setor=getSetorAtual(cargo);
    const base=(window.TRILHAS_DADOS&&window.TRILHAS_DADOS[setor]) || trilhasDefault[setor] || trilhasDefault.RH;
    let idx=base.findIndex(x=>normaliza(x)===normaliza(cargo) || normaliza(cargo).includes(normaliza(x)) || normaliza(x).includes(normaliza(cargo)));
    if(idx<0) idx=Math.min(1,base.length-1);
    const atual=base[idx]||cargo; const prox=base[idx+1]||'Último nível da trilha'; const futuros=base.slice(idx+1, idx+5);
    const progresso=Math.max(20, Math.min(95, Math.round(((idx+1)/base.length)*100)));
    const compHtml=competencias.map(c=>`<div class="trilha-item ${c[2]}"><span class="ico">${c[2]==='ok'?'✅':'⏳'}</span><div><b>${esc(c[0])}</b><small>${esc(c[1])}</small></div></div>`).join('');
    const cursosHtml=cursos.map(c=>`<div class="trilha-item"><span class="ico">📚</span><div><b>${esc(c)}</b><small>Curso recomendado para evolução ao próximo nível.</small></div></div>`).join('');
    const reqHtml=requisitos.map((r,i)=>`<div class="trilha-item ${i<2?'ok':'pendente'}"><span class="ico">${i<2?'✅':'⏳'}</span><div><b>${esc(r)}</b><small>${i<2?'Requisito atendido ou em bom andamento.':'Requisito pendente para validação com gestor/RH.'}</small></div></div>`).join('');
    const flow=[atual,...futuros].map((x,i)=>`<div class="trilha-node ${i===0?'atual':i===1?'proximo':''}"><small>${i===0?'Cargo atual':i===1?'Próximo cargo':'Próximo nível'}</small><b>${esc(x)}</b></div>`).join('');
    v.innerHTML=`<div class="trilha-colab-wrap">
      <section class="trilha-colab-hero"><div><small>Estrutura e Carreira · Somente consulta</small><h1>🚀 Minha Trilha de Carreira</h1><p>Visualize seu cargo atual, próximo cargo, níveis futuros, competências obrigatórias, cursos recomendados e requisitos para promoção. A edição da trilha é exclusiva do RH.</p></div><span class="trilha-colab-badge">🔒 Sem edição no perfil colaborador</span></section>
      <section class="trilha-colab-card"><div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap"><div><h2>Olá, ${esc(getNomeUsuario())}</h2><p>Esta é sua visão individual de evolução profissional dentro da IMEX.</p></div><span class="readonly-pill">👤 Visualização do colaborador</span></div><div class="trilha-colab-kpis"><div class="trilha-colab-kpi"><span>Cargo atual</span><strong>${esc(atual)}</strong></div><div class="trilha-colab-kpi"><span>Próximo cargo</span><strong>${esc(prox)}</strong></div><div class="trilha-colab-kpi"><span>Nível atual</span><strong>${idx+1} de ${base.length}</strong></div></div></section>
      <section class="trilha-colab-card"><h2>🧭 Caminho de crescimento</h2><p>Sequência prevista da sua trilha, com base no cargo e área atual.</p><div class="trilha-flow" style="margin-top:16px">${flow}</div></section>
      <div class="trilha-colab-grid"><section class="trilha-colab-card"><h2>✅ Competências obrigatórias</h2><div class="trilha-lista">${compHtml}</div></section><section class="trilha-colab-card"><h2>📚 Cursos recomendados</h2><div class="trilha-lista">${cursosHtml}</div></section></div>
      <div class="trilha-colab-grid"><section class="trilha-colab-card"><h2>📈 Evolução da trilha</h2><p>Percentual estimado com base no nível atual e competências concluídas.</p><div class="trilha-progress"><div class="trilha-progress-fill" style="width:${progresso}%"></div></div><strong style="font-size:24px;color:#0047ff">${progresso}% concluído</strong></section><section class="trilha-colab-card"><h2>🔒 Requisitos para promoção</h2><div class="trilha-lista">${reqHtml}</div></section></div>
      <section class="trilha-colab-card"><h2>💬 Feedback do gestor</h2><p><b>Última atualização:</b> desempenho consistente nas rotinas atuais. Próximo passo: fortalecer indicadores, visão analítica e participação em projetos estratégicos.</p><div class="trilha-actions-readonly"><button class="btn btn-p" onclick="sbNav('meu-desenvolvimento')">📄 Gerar PDI com IA</button><button class="btn btn-g" onclick="sbNav('desenvolvimento')">✨ Ver Meu Desenvolvimento</button></div></section>
    </div>`;
    aplicarBloqueioColaborador();
  }
  const oldTrilhas=window.trilhasCarregar;
  window.trilhasCarregar=function(){ if(isRHFinal() && typeof oldTrilhas==='function') return oldTrilhas.apply(this,arguments); return renderTrilhasColaborador(); };
  function aplicarClassesPerfil(){document.body.classList.toggle('perfil-colaborador', !isRHFinal()); document.body.classList.toggle('perfil-rh', isRHFinal());}
  function aplicarBloqueioColaborador(){
    aplicarClassesPerfil();
    if(isRHFinal()) return;
    const termos=['editar','excluir','salvar tudo','novo cargo','base de cargos','reordenar','detalhes','configurar trilha','criar cargo','gestão de trilhas'];
    document.querySelectorAll('button,a').forEach(el=>{
      const txt=normaliza(el.textContent||'');
      const area=el.closest('#view-trilhas,#view-organograma,#view-estrutura-carreira,#view-meu-desenvolvimento,#intra-org-modal-trilha');
      if(area && termos.some(t=>txt.includes(normaliza(t)))){ el.setAttribute('data-rh-only','true'); el.style.setProperty('display','none','important'); }
    });
  }
  const oldSb=window.sbNav;
  window.sbNav=function(id){ const r=(typeof oldSb==='function')?oldSb.apply(this,arguments):undefined; if(id==='trilhas') setTimeout(renderTrilhasColaborador,80); setTimeout(aplicarBloqueioColaborador,120); return r; };
  const oldSwitch=window.switchView;
  window.switchView=function(id){ const r=(typeof oldSwitch==='function')?oldSwitch.apply(this,arguments):undefined; if(id==='trilhas') setTimeout(renderTrilhasColaborador,80); setTimeout(aplicarBloqueioColaborador,120); return r; };
  const oldTrocar=window.trocarPerfil;
  window.trocarPerfil=function(){ const r=(typeof oldTrocar==='function')?oldTrocar.apply(this,arguments):undefined; setTimeout(aplicarBloqueioColaborador,180); return r; };
  window.renderTrilhasColaborador=renderTrilhasColaborador;
  window.aplicarBloqueioColaborador=aplicarBloqueioColaborador;
  window.abrirTrilhasColaborador=function(){
    // Esconde todas as views
    document.querySelectorAll('[id^="view-"]').forEach(function(el){
      el.style.setProperty('display','none','important');
      el.classList.remove('active');
    });
    // Mostra view-trilhas
    var v=document.getElementById('view-trilhas');
    if(!v){ v=document.createElement('div'); v.id='view-trilhas'; v.className='page'; (document.getElementById('appPage')||document.querySelector('.main-area')||document.body).appendChild(v); }
    v.style.setProperty('display','block','important');
    v.classList.add('active');
    // Atualiza sidebar ativo
    document.querySelectorAll('.sb-item').forEach(function(el){ el.classList.remove('active'); });
    // Renderiza conteúdo
    renderTrilhasColaborador();
    window.scrollTo({top:0,behavior:'smooth'});
  };
  document.addEventListener('DOMContentLoaded',function(){setTimeout(aplicarBloqueioColaborador,400);setTimeout(aplicarBloqueioColaborador,1200);});
})();
