// ===== script: patch-rh-menu-reorganizado-js =====
(function(){
  'use strict';
  if(window.__IMEX_RH_MENU_REORGANIZADO__) return;
  window.__IMEX_RH_MENU_REORGANIZADO__ = true;

  const RH_ORDER_FINAL = ['gestao-rh','dashboard','ouvidoria','conecta-ai','auditoria','roadmap-produto'];
  const META_RH_FINAL = {
    'gestao-rh':['🏢','Gestão RH'],
    'dashboard':['📊','Dashboard RH'],
    'ouvidoria':['📢','Ouvidoria RH'],
    'conecta-ai':['🤖','Conecta AI RH'],
    'auditoria':['📝','Auditoria'],
    'roadmap-produto':['🚀','Roadmap do Produto']
  };

  function $(id){ return document.getElementById(id); }
  // Causa de um flash real do menu de RH ao logar como colaborador: esta
  // função checava a CLASSE do <body> e o TEXTO do rótulo de perfil ANTES
  // das variáveis vivas do papel — mas body/pLabel podem ficar um instante
  // com o valor de uma renderização anterior (ex.: sessão de RH anterior na
  // mesma aba) até o login atual terminar de os atualizar. Como esta função
  // roda em timers independentes do login (100ms/500ms após o carregamento
  // da página), ela podia "ver" esse resíduo e montar o menu de RH mesmo
  // quando `window.role` já dizia "colaborador" corretamente. Agora as
  // variáveis vivas (mesma fonte usada no login) têm prioridade absoluta.
  function roleAtualSeguro(){
    const vivo = String(window.currentUserRole || window.selectedRole || window._roleReal || window.role || '').toLowerCase().trim();
    if(vivo === 'rh' || vivo === 'rh-colaborador') return 'rh';
    if(vivo === 'gestor' || vivo === 'colaborador') return vivo;
    const bodyRh = document.body && document.body.classList.contains('role-rh');
    const label = (($('pLabel') && $('pLabel').textContent) || '').toLowerCase();
    const stored = String(sessionStorage.getItem('userRole') || sessionStorage.getItem('imexPreferredRole') || '').toLowerCase();
    if(bodyRh || label === 'rh' || stored === 'rh' || stored.includes('rh')) return 'rh';
    if(stored.includes('gestor')) return 'gestor';
    return 'colaborador';
  }

  function sidebar(){ return $('sidebar') || document.querySelector('.sidebar'); }

  function criarItemRh(id){
    const meta = META_RH_FINAL[id] || ['•', id];
    const el = document.createElement('div');
    el.className = 'sb-item';
    el.id = 'sb-' + id;
    el.dataset.menuId = id;
    el.title = meta[1];
    el.innerHTML = '<span>' + meta[0] + '</span><span class="sb-tip">' + meta[1] + '</span>';
    el.onclick = function(ev){
      if(ev) ev.preventDefault();
      if(typeof window.switchView === 'function') return window.switchView(id);
      if(typeof window.sbNav === 'function') return window.sbNav(id);
      return false;
    };
    return el;
  }

  function renderRhMenuFinal(){
    if(roleAtualSeguro() !== 'rh') return false;
    const s = sidebar();
    if(!s) return false;

    let logo = s.querySelector('.sb-logo');
    if(!logo){
      logo = document.createElement('div');
      logo.className = 'sb-logo';
      logo.textContent = 'IMEX';
    }

    const frag = document.createDocumentFragment();
    frag.appendChild(logo);
    RH_ORDER_FINAL.forEach(id => frag.appendChild(criarItemRh(id)));

    const spacer = document.createElement('div');
    spacer.className = 'sb-spacer';
    frag.appendChild(spacer);

    const divider = document.createElement('div');
    divider.className = 'sb-divider';
    frag.appendChild(divider);

    const sair = document.createElement('div');
    sair.className = 'sb-item';
    sair.id = 'sb-sair';
    sair.innerHTML = '<span>🚪</span><span class="sb-tip">Sair</span>';
    sair.onclick = function(){ if(typeof window.doLogout === 'function') return window.doLogout(); };
    frag.appendChild(sair);

    s.replaceChildren(frag);

    // Garantia extra: nenhum item duplicado de Colaborador fica visível no RH.
    ['pesquisas','beneficios','gamificacao','desenvolvimento-talentos','estrutura-carreira','intranet','solicitacao'].forEach(id=>{
      const el = $('sb-' + id);
      if(el) el.style.setProperty('display','none','important');
    });
    // Esta função passou a ser o caminho final pra montar o menu do RH, mas
    // ela só cuidava dos ícones — o botão "Minha Visão" (que depende de
    // outras funções antigas que pararam de ser chamadas) ficava escondido
    // mesmo a conta tendo perfil de RH. Mostra ele aqui também.
    const btnTrocar = $('btnTrocarPerfil');
    if(btnTrocar){
      const perfis = (window.currentUserData && window.currentUserData.perfis) || [];
      const ehHibrido = perfis.includes('rh') || perfis.includes('colaborador');
      btnTrocar.style.setProperty('display', ehHibrido ? 'inline-flex' : 'none', 'important');
      const lblTrocar = $('btnTrocarPerfilLabel');
      if(lblTrocar) lblTrocar.textContent = 'Visão Colaborador';
    }
    return true;
  }

  window.imexRenderRhMenuFinal = renderRhMenuFinal;

  const oldBuild = window.buildSidebar;
  window.buildSidebar = function(){
    if(roleAtualSeguro() === 'rh'){
      const r = renderRhMenuFinal();
      // renderRhMenuFinal só troca os ÍCONES do menu lateral — não decide
      // qual painel de conteúdo fica visível. No carregamento/F5, a tela
      // já vem com algo padrão marcado como ativo (geralmente Intranet,
      // com aparência de colaborador) antes do papel real ser confirmado.
      // Por isso força sempre a ida pra Gestão RH quando este código roda
      // (que só acontece logo após o Firebase confirmar que é RH).
      [50,250,600].forEach(function(t){
        setTimeout(function(){ if(typeof window.sbNav === 'function') window.sbNav('gestao-rh'); }, t);
      });
      return r;
    }
    if(typeof oldBuild === 'function') return oldBuild.apply(this, arguments);
  };

  const oldRender = window.renderSidebar || window.renderMenu || window.atualizarSidebar;
  window.renderSidebar = window.renderMenu = window.atualizarSidebar = function(){
    if(roleAtualSeguro() === 'rh') return renderRhMenuFinal();
    if(typeof oldRender === 'function') return oldRender.apply(this, arguments);
  };

  const oldDoLogin = window.doLogin;
  if(typeof oldDoLogin === 'function'){
    window.doLogin = function(){
      const ret = oldDoLogin.apply(this, arguments);
      setTimeout(renderRhMenuFinal, 80);
      setTimeout(renderRhMenuFinal, 300);
      return ret;
    };
  }

  const oldEntrarDemo = window.entrarDemo;
  if(typeof oldEntrarDemo === 'function'){
    window.entrarDemo = function(){
      const ret = oldEntrarDemo.apply(this, arguments);
      setTimeout(renderRhMenuFinal, 80);
      setTimeout(renderRhMenuFinal, 300);
      return ret;
    };
  }

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(renderRhMenuFinal, 100);
    setTimeout(renderRhMenuFinal, 500);
  });
})();
