// ===== script: patch-somente-remove-plantinha-e-restaura-colaboradores =====
/*
  Correção cirúrgica:
  - Remove somente a plantinha Desenvolvimento/Desenvolvimento & Talentos da sidebar.
  - Não recria a tela de Colaboradores.
  - Usa a renderização original grhRenderColabs().
  - Religa botões Editar/Prontuário ao modal real existente.
*/
(function(){
  function norm(v){
    return String(v||'').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function removerPlantinha(){
    document.querySelectorAll('.sidebar .sb-item').forEach(el => {
      const id = norm(el.id);
      const onclick = norm(el.getAttribute('onclick'));
      const texto = norm(el.textContent);
      const title = norm(el.getAttribute('title') || el.getAttribute('aria-label'));

      const remover =
        id === 'sb-desenvolvimento' ||
        id === 'sb-desenvolvimento-talentos' ||
        onclick.includes('desenvolvimento') ||
        texto.includes('desenvolvimento & talentos') ||
        title.includes('desenvolvimento & talentos');

      if(remover){
        el.style.setProperty('display','none','important');
        el.classList.remove('active');
        el.setAttribute('aria-hidden','true');
      }
    });
  }

  // Aliases seguros: caso algum botão use nomes antigos, aponta para o modal real.
  window.grhEditarColab = function(id){
    if(typeof window.grhAbrirModalColab === 'function'){
      return window.grhAbrirModalColab(id);
    }
    alert('Não foi possível abrir a edição do colaborador.');
  };

  window.grhAbrirProntuario = function(id){
    if(typeof window.grhAbrirModalColab === 'function'){
      const r = window.grhAbrirModalColab(id);
      setTimeout(() => {
        const area = document.getElementById('grh-c-prontuario-area');
        if(area){
          area.style.display = 'block';
          area.scrollIntoView({behavior:'smooth', block:'center'});
        }
      }, 350);
      return r;
    }
    alert('Não foi possível abrir o prontuário do colaborador.');
  };

  // Redireciona somente as rotas removidas para não abrir tela em branco.
  const oldSbNav = window.sbNav;
  window.sbNav = function(view){
    if(view === 'desenvolvimento' || view === 'desenvolvimento-talentos'){
      removerPlantinha();
      return typeof oldSbNav === 'function' ? oldSbNav.call(this, 'gestao-rh') : false;
    }
    removerPlantinha();
    return typeof oldSbNav === 'function' ? oldSbNav.apply(this, arguments) : false;
  };

  const oldSwitchView = window.switchView;
  window.switchView = function(view){
    if(view === 'desenvolvimento' || view === 'desenvolvimento-talentos'){
      removerPlantinha();
      return typeof oldSbNav === 'function' ? oldSbNav.call(this, 'gestao-rh') : false;
    }
    removerPlantinha();
    return typeof oldSwitchView === 'function' ? oldSwitchView.apply(this, arguments) : false;
  };

  // Reforça renderização original se Colaboradores estiver aberto.
  function restaurarColaboradores(){
    removerPlantinha();

    const pane = document.getElementById('grh-pane-colaboradores');
    const tbody = document.getElementById('grh-colab-body');

    if(pane && pane.style.display !== 'none' && tbody && typeof window.grhRenderColabs === 'function'){
      window.grhRenderColabs();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    removerPlantinha();
    setTimeout(removerPlantinha, 300);
    setTimeout(restaurarColaboradores, 800);
  });

  window.addEventListener('load', () => {
    removerPlantinha();
    setTimeout(restaurarColaboradores, 500);
  });

  if(document.readyState !== 'loading'){
    removerPlantinha();
    setTimeout(restaurarColaboradores, 500);
  }
})();
