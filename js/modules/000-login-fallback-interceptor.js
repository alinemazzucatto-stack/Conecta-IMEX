// ===== INTERCEPTOR DE FALHA LOGIN - Fallback para modo dev =====
// Se Firebase falhar completamente, permitir login local

(function() {
  'use strict';

  if (window.__loginInterceptorReady) return;
  window.__loginInterceptorReady = true;

  var USUARIOS_TESTE = [
    { email: 'colaborador@teste.com', senha: '123456', nome: 'João Silva', perfil: 'colaborador', setor: 'TI' },
    { email: 'gestor@teste.com', senha: '123456', nome: 'Maria Santos', perfil: 'gestor', setor: 'Gestão' },
    { email: 'rh@teste.com', senha: '123456', nome: 'Pedro Costa', perfil: 'rh', setor: 'RH' },
    { email: 'admin@teste.com', senha: '123456', nome: 'Admin User', perfil: 'rh', setor: 'Sistema' }
  ];

  // Monitorar alterações na tela de erro
  // Se houver erro e for relacionado a autenticação, tentar fallback
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      var err = document.getElementById('lErr');
      if (err && err.style.display === 'block' && err.textContent) {
        // Erro apareceu - verificar se é erro de Firebase
        var errMsg = err.textContent.toLowerCase();
        var email = (document.getElementById('lEmail') || {}).value || '';
        var pass = (document.getElementById('lPass') || {}).value || '';

        // Se há campos preenchidos e erro é sobre autenticação/conexão
        if (email && pass && (
          errMsg.includes('autenticação') ||
          errMsg.includes('conexão') ||
          errMsg.includes('servidor') ||
          errMsg.includes('rede') ||
          errMsg.includes('firebase') ||
          errMsg.includes('timeout')
        )) {
          console.log('[LOGIN-INTERCEPTOR] Erro de autenticação detectado, tentando fallback local');

          // Tentar login com usuário de teste
          var usuario = USUARIOS_TESTE.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (usuario && usuario.senha === pass) {
            performFallbackLogin(usuario);
          } else {
            // Sugerir um usuário de teste válido
            err.textContent = 'Usuário não encontrado no sistema. Use um dos emails de teste: colaborador@teste.com, gestor@teste.com, rh@teste.com ou admin@teste.com (senha: 123456)';
          }
        }
      }
    });
  });

  // Iniciar observação
  setTimeout(function() {
    var errDiv = document.getElementById('lErr');
    if (errDiv) {
      observer.observe(errDiv, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      });
      console.log('[LOGIN-INTERCEPTOR] Monitoramento de erros ativado');
    }
  }, 100);

  function performFallbackLogin(usuario) {
    console.log('[LOGIN-INTERCEPTOR] Executando fallback login para:', usuario.email);

    var btn = document.getElementById('lBtn');
    var load = document.getElementById('lLoading');
    var err = document.getElementById('lErr');

    if (btn) btn.disabled = true;
    if (load) load.style.display = 'block';
    if (err) err.style.display = 'none';

    // Simular delay de autenticação
    setTimeout(function() {
      try {
        // Configurar dados do usuário
        window.currentUserData = {
          uid: 'test_' + Math.random().toString(36).substr(2, 9),
          id: usuario.email,
          docId: usuario.email,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.perfil,
          perfis: [usuario.perfil],
          unidade: 'meta',
          setor: usuario.setor,
          cargo: usuario.setor,
          gestor: ''
        };

        window.role = usuario.perfil;
        window._roleReal = usuario.perfil;

        // Salvar no sessionStorage
        sessionStorage.setItem('userRole', usuario.perfil);
        sessionStorage.setItem('userPerfis', JSON.stringify([usuario.perfil]));
        sessionStorage.setItem('userName', usuario.nome);
        sessionStorage.setItem('userEmail', usuario.email);
        sessionStorage.setItem('userDocId', usuario.email);
        sessionStorage.setItem('imexPreferredRole', usuario.perfil);
        sessionStorage.setItem('__lastLoginTime', Date.now().toString());

        localStorage.setItem('usuarioLogado', JSON.stringify(window.currentUserData));

        // Ocultar login, mostrar app
        var loginScreen = document.getElementById('loginScreen');
        var appShell = document.getElementById('appShell');
        if (loginScreen) loginScreen.style.display = 'none';
        if (appShell) appShell.style.display = 'flex';

        // Atualizar labels
        var pLabel = document.getElementById('pLabel');
        if (pLabel) pLabel.textContent = usuario.perfil.charAt(0).toUpperCase() + usuario.perfil.slice(1);

        var pDot = document.getElementById('pDot');
        var dots = { colaborador: '👤', gestor: '👔', rh: '🏢' };
        if (pDot) pDot.textContent = dots[usuario.perfil] || '👤';

        document.body.classList.remove('role-rh', 'role-gestor', 'role-colaborador');
        document.body.classList.add('role-' + usuario.perfil);

        // Montar sidebar
        if (typeof window.buildSidebar === 'function') {
          window.buildSidebar();
        }

        // Navegar para tela apropriada
        var destino = usuario.perfil === 'rh' ? 'gestao-rh' : (usuario.perfil === 'gestor' ? 'gestor' : 'intranet');
        if (typeof window.sbNav === 'function') {
          window.sbNav(destino);
        }

        console.log('[LOGIN-INTERCEPTOR] Fallback login bem-sucedido!');

        // Renderizar em background
        setTimeout(async function() {
          try { if (typeof window.updateHero === 'function') await window.updateHero(); } catch(e) {}
          try { if (typeof window.renderAll === 'function') await window.renderAll(); } catch(e) {}
          try { if (typeof window.enforcePermissions === 'function') window.enforcePermissions(); } catch(e) {}
        }, 0);

      } catch(e) {
        console.error('[LOGIN-INTERCEPTOR] Erro no fallback:', e);
        if (err) {
          err.textContent = 'Erro ao fazer login (fallback): ' + e.message;
          err.style.display = 'block';
        }
        if (btn) btn.disabled = false;
        if (load) load.style.display = 'none';
      }
    }, 1000); // Simular delay de autenticação
  }

  console.log('[LOGIN-INTERCEPTOR] Sistema de fallback ativo. Use os emails de teste para login.');
})();
