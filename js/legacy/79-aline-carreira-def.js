// ===== script: aline-carreira-def =====
(function(){
  // Hub de origem para o botão voltar
  window.__devLastHub = 'desenvolvimento';

  function navFrom(hub, dest){
    window.__devLastHub = hub;
    if(typeof window.sbNav === 'function') window.sbNav(dest);
  }

  window.AlineCarreira = {
    go: function(id){
      navFrom('desenvolvimento', id);
    },
    renderOrganograma: function(){
      navFrom('estrutura-carreira', 'organograma');
    },
    renderSetores: function(){
      navFrom('estrutura-carreira', 'cargos');
    },
    renderReferencia: function(){
      navFrom('estrutura-carreira', 'trilhas');
    },
    renderMeuDesenvolvimento: function(){
      navFrom('desenvolvimento', 'meu-desenvolvimento');
      setTimeout(function(){ if(typeof window.renderMeuDesenvolvimento==='function') window.renderMeuDesenvolvimento(); }, 200);
    }
  };

  // Injeta barra de voltar dentro do hero de cada sub-view
  var SUB_VIEWS = {
    'disc':              'desenvolvimento',
    'cargos':            'desenvolvimento',
    'meu-desenvolvimento': 'desenvolvimento',
    'experiencia':       'desenvolvimento',
    'trilhas':           'estrutura-carreira'
  };

  function hubLabel(hub){
    return hub === 'estrutura-carreira' ? '← Voltar para Estrutura e Carreira' : '← Voltar para Desenvolvimento';
  }

  function injectBackBars(){
    Object.keys(SUB_VIEWS).forEach(function(vid){
      var v = document.getElementById('view-'+vid);
      if(!v || v.querySelector('.dev-back-bar')) return;
      var hero = v.querySelector('.hero');
      var bar = document.createElement('div');
      bar.className = 'dev-back-bar';
      bar.innerHTML = '<button class="dev-back-btn" onclick="window.sbNav(window.__devLastHub||\''
        + SUB_VIEWS[vid] + '\')">' + hubLabel(SUB_VIEWS[vid]) + '</button>';
      if(hero) hero.insertBefore(bar, hero.firstChild);
      else v.insertBefore(bar, v.firstChild);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectBackBars);
  } else {
    injectBackBars();
  }
  setTimeout(injectBackBars, 600);
})();


