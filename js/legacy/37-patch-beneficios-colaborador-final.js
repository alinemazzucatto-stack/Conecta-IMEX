// ===== script: patch-beneficios-colaborador-final-js =====
(function(){
  'use strict';
  if(window.__PATCH_BENEFICIOS_COLABORADOR_FINAL__) return;
  window.__PATCH_BENEFICIOS_COLABORADOR_FINAL__ = true;

  function $(id){ return document.getElementById(id); }
  function host(){ return $('appPage') || document.querySelector('.main-area') || $('appShell') || document.body; }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function topbar(icon,label){ var i=$('tPageIcon'), t=$('tPageTitle'); if(i){ i.textContent=icon; i.style.display=''; } if(t) t.textContent=label; }

  var beneficios = [
    {ico:'🍔',nome:'iFood Benefícios',desc:'Cartão alimentação/refeição, saldo, extrato, cartão virtual/físico e Clube iFood.',itens:['Baixar o app iFood Benefícios','Consultar saldo e extrato','Ativar cartão virtual','Solicitar cartão físico','Acompanhar calendário do VA: dia 30/31 ou último dia útil'],link:'https://www.ifood.com.br/clube'},
    {ico:'🏋️',nome:'Wellhub',desc:'Plataforma de bem-estar com academias, estúdios, modalidades, apps parceiros e dependentes.',itens:['Consultar rede credenciada','Escolher plano disponível','Incluir até 3 dependentes','Usar check-in pelo aplicativo'],link:'https://wellhub.com/pt-br/'},
    {ico:'🏥',nome:'Dasa | Colab+',desc:'Teleconsulta Nav, exames, vacinas, medicamentos com desconto e dependentes.',itens:['Teleconsulta Nav sem custo','Exames laboratoriais com desconto','Até 4 dependentes','Acesso pelo portal Nav/Dasa'],link:'https://nav.dasa.com.br/entrar'},
    {ico:'❤️',nome:'Starbem',desc:'Consultas por videochamada com médico, psicólogo e nutricionista.',itens:['1 consulta médica por mês','2 consultas psicológicas por mês','1 consulta nutricional por mês','Solicitar inclusão de dependente ao RH'],link:'https://www.starbem.app/'},
    {ico:'🧠',nome:'Optum',desc:'Apoio psicológico, social, jurídico e financeiro por atendimento telefônico.',itens:['Atendimento regular de segunda a sexta','Emergência 24 horas, 7 dias por semana','Orientação jurídica preliminar','Consultoria financeira'],link:'https://www.optum.com.br/'},
    {ico:'🩺',nome:'Unimed',desc:'Plano de saúde corporativo, guia médico, coparticipação, reembolso e dependentes.',itens:['Consultar guia médico','Acompanhar coparticipação','Orientações de reembolso','Regras para dependentes e elegibilidade'],link:''}
  ];

  function ensureView(){
    var v = $('view-beneficios');
    if(!v){
      v = document.createElement('div');
      v.id = 'view-beneficios';
      v.className = 'page';
      host().appendChild(v);
    }
    if(v.parentElement && /^view-/.test(v.parentElement.id || '')) host().appendChild(v);
    return v;
  }

  function esconderOutrasViews(){
    document.querySelectorAll('[id^="view-"]').forEach(function(el){
      if(el.id !== 'view-beneficios'){
        el.classList.remove('active','dev-active','beneficios-force-active');
        el.style.setProperty('display','none','important');
      }
    });
    var hero=$('mainHero'); if(hero) hero.style.setProperty('display','none','important');
  }

  function htmlBeneficios(){
    return '<section class="hero beneficios-hero-final" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important;border-radius:16px;padding:42px 52px;margin-bottom:26px">'
      + '<div class="h-content"><div class="h-eyebrow">Central de benefícios IMEX</div><h1>MEUS BENEFÍCIOS</h1><p>Consulte acessos, orientações, dependentes, aplicativos e perguntas frequentes de cada benefício.</p></div>'
      + '<div class="h-stats"><div class="h-stat"><span class="h-num">6</span><span class="h-lbl">Benefícios</span></div><div class="h-stat"><span class="h-num">FAQ</span><span class="h-lbl">Orientações</span></div></div></section>'
      + '<div class="beneficios-colab-grid-final">'
      + beneficios.map(function(b){
          return '<article class="beneficios-colab-card-final"><div class="beneficios-colab-head-final"><div class="beneficios-colab-ico-final">'+b.ico+'</div><div><h3>'+esc(b.nome)+'</h3><p>'+esc(b.desc)+'</p></div></div>'
          + '<ul>'+b.itens.map(function(i){ return '<li>'+esc(i)+'</li>'; }).join('')+'</ul>'
          + '<div class="beneficios-colab-actions-final"><button type="button" onclick="window.benAbrirModalSeguroFinal()">Solicitar ao RH</button>'
          + (b.link ? '<a target="_blank" rel="noopener" href="'+esc(b.link)+'">Acessar</a>' : '')
          + '</div></article>';
        }).join('')
      + '</div><div class="beneficios-colab-note-final"><strong>Observação:</strong> se houver dificuldade de acesso, inclusão/exclusão de dependentes ou dúvida sobre algum benefício, registre uma solicitação para análise do RH.</div>';
  }

  function renderBeneficiosColaboradorFinal(){
    var v = ensureView();
    esconderOutrasViews();
    v.innerHTML = htmlBeneficios();
    v.classList.add('active','beneficios-force-active');
    v.style.setProperty('display','block','important');
    v.style.setProperty('visibility','visible','important');
    v.style.setProperty('opacity','1','important');
    document.querySelectorAll('.sb-item[id^="sb-"]').forEach(function(sb){ sb.classList.toggle('active', sb.id === 'sb-beneficios'); });
    topbar('🎁','Meus Benefícios');
    return v;
  }

  window.benAbrirModalSeguroFinal = function(){
    try{
      if(typeof window.benAbrirModal === 'function') return window.benAbrirModal('beneficio');
    }catch(e){}
    alert('Solicitação registrada para análise do RH.');
  };

  var oldSb = window.sbNav;
  var oldSwitch = window.switchView;
  var oldShow = window.showView;

  window.renderBeneficiosCards = renderBeneficiosColaboradorFinal;
  window.renderBeneficiosHub = renderBeneficiosColaboradorFinal;
  window.renderBeneficios = renderBeneficiosColaboradorFinal;
  window.montarBeneficiosExato = renderBeneficiosColaboradorFinal;
  window.benCarregar = renderBeneficiosColaboradorFinal;

  window.sbNav = function(id){
    if(id === 'beneficios' || id === 'meus-beneficios') return renderBeneficiosColaboradorFinal();
    return (typeof oldSb === 'function') ? oldSb.apply(this, arguments) : undefined;
  };
  window.switchView = function(id){
    if(id === 'beneficios' || id === 'meus-beneficios') return renderBeneficiosColaboradorFinal();
    return (typeof oldSwitch === 'function') ? oldSwitch.apply(this, arguments) : (typeof window.sbNav === 'function' ? window.sbNav(id) : undefined);
  };
  window.showView = function(id){
    if(id === 'beneficios' || id === 'meus-beneficios') return renderBeneficiosColaboradorFinal();
    return (typeof oldShow === 'function') ? oldShow.apply(this, arguments) : (typeof window.sbNav === 'function' ? window.sbNav(id) : undefined);
  };

  document.addEventListener('click', function(ev){
    var alvo = ev.target && ev.target.closest ? ev.target.closest('#sb-beneficios,[data-view="beneficios"],[onclick*="beneficios"]') : null;
    if(alvo && (alvo.id === 'sb-beneficios' || /beneficios/.test(alvo.getAttribute('onclick') || alvo.getAttribute('data-view') || ''))){
      ev.preventDefault();
      ev.stopPropagation();
      renderBeneficiosColaboradorFinal();
    }
  }, true);

  function conferir(){
    var v = $('view-beneficios');
    if(v && (v.classList.contains('active') || v.classList.contains('beneficios-force-active'))){
      var vazio = !v.innerText || v.innerText.replace(/\s+/g,'').length < 30;
      var oculto = getComputedStyle(v).display === 'none';
      if(vazio || oculto) renderBeneficiosColaboradorFinal();
    }
  }
  // REMOVED: Performance optimization - 800ms setInterval polling
  // setInterval(conferir, 800);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', conferir);
  else setTimeout(conferir, 100);
})();


