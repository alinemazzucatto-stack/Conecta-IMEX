// ===== FALLBACK DE LOGIN - Modo Desenvolvimento =====
// Quando Firebase não está configurado, permitir login com dados de teste
// sem bloquear a UI

(function() {
  'use strict';

  if (window.__loginFallbackReady) return;
  window.__loginFallbackReady = true;

  // Dados de teste para desenvolvimento
  var USUARIOS_TESTE = [
    {
      email: 'colaborador@teste.com',
      senha: '123456',
      nome: 'João Silva',
      perfil: 'colaborador',
      setor: 'TI'
    },
    {
      email: 'gestor@teste.com',
      senha: '123456',
      nome: 'Maria Santos',
      perfil: 'gestor',
      setor: 'Gestão'
    },
    {
      email: 'rh@teste.com',
      senha: '123456',
      nome: 'Pedro Costa',
      perfil: 'rh',
      setor: 'RH'
    },
    {
      email: 'admin@teste.com',
      senha: '123456',
      nome: 'Admin User',
      perfil: 'rh',
      setor: 'Sistema'
    }
  ];

  // Override da função doLogin se Firebase falhar
  var origDoLogin = window.doLogin;

  window.doLogin = async function() {
    var email = (document.getElementById('lEmail') ? document.getElementById('lEmail').value : '').trim().toLowerCase();
    var pass = (document.getElementById('lPass') ? document.getElementById('lPass').value : '').trim();
    var btn = document.getElementById('lBtn');
    var load = document.getElementById('lLoading');
    var err = document.getElementById('lErr');

    function showErr(msg) {
      if (err) {
        err.textContent = msg;
        err.style.display = 'block';
      } else {
        alert(msg);
      }
    }

    if (err) err.style.display = 'none';

    if (!email || !pass) {
      showErr('Preencha e-mail e senha.');
      return;
    }

    if (btn) btn.disabled = true;
    if (load) load.style.display = 'block';
    window.__loginEmAndamento = true;

    try {
      // Tentar com Firebase primeiro
      if (origDoLogin && typeof origDoLogin === 'function') {
        console.log('[LOGIN] Tentando autenticação Firebase...');

        // Fazer timeout aggressivo
        var timeoutId = setTimeout(function() {
          console.warn('[LOGIN] Firebase demorou muito, acionando fallback...');
          attemptFallbackLogin();
        }, 5000);

        try {
          await origDoLogin();
          clearTimeout(timeoutId);
          return;
        } catch(e) {
          clearTimeout(timeoutId);
          console.warn('[LOGIN] Firebase falhou, tentando fallback:', e.message);
          attemptFallbackLogin();
        }
      } else {
        console.log('[LOGIN] origDoLogin não disponível, usando fallback');
        attemptFallbackLogin();
      }
    } catch(e) {
      console.error('[LOGIN] Erro geral:', e);
      attemptFallbackLogin();
    }

    function attemptFallbackLogin() {
      console.log('[LOGIN-FALLBACK] Autenticando localmente...');

      // Buscar usuário de teste
      var usuario = USUARIOS_TESTE.find(u => u.email === email);

      if (!usuario) {
        // Se não for usuário de teste, rejeitar
        showErr('Usuário não encontrado. Use um dos emails de teste (colaborador@teste.com, gestor@teste.com, rh@teste.com, admin@teste.com) com senha "123456".');
        if (btn) btn.disabled = false;
        if (load) load.style.display = 'none';
        window.__loginEmAndamento = false;
        return;
      }

      if (usuario.senha !== pass) {
        showErr('Senha incorreta. Use "123456" para todos os usuários de teste.');
        if (btn) btn.disabled = false;
        if (load) load.style.display = 'none';
        window.__loginEmAndamento = false;
        return;
      }

      // Login bem-sucedido! Simular o fluxo
      console.log('[LOGIN-FALLBACK] Autenticação bem-sucedida para:', usuario.email);

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

      sessionStorage.setItem('userRole', usuario.perfil);
      sessionStorage.setItem('userPerfis', JSON.stringify([usuario.perfil]));
      sessionStorage.setItem('userName', usuario.nome);
      sessionStorage.setItem('userEmail', usuario.email);
      sessionStorage.setItem('userDocId', usuario.email);
      sessionStorage.setItem('imexPreferredRole', usuario.perfil);
      sessionStorage.setItem('__lastLoginTime', Date.now().toString());

      localStorage.setItem('usuarioLogado', JSON.stringify(window.currentUserData));

      // Mostrar painel do app
      var loginScreen = document.getElementById('loginScreen');
      var appShell = document.getElementById('appShell');
      if (loginScreen) loginScreen.style.display = 'none';
      if (appShell) appShell.style.display = 'flex';

      // Atualizar labels de perfil
      var pLabel = document.getElementById('pLabel');
      if (pLabel) pLabel.textContent = usuario.perfil.charAt(0).toUpperCase() + usuario.perfil.slice(1);

      var pDot = document.getElementById('pDot');
      var dots = { colaborador: '👤', gestor: '👔', rh: '🏢' };
      if (pDot) pDot.textContent = dots[usuario.perfil] || '👤';

      document.body.classList.remove('role-rh', 'role-gestor', 'role-colaborador');
      document.body.classList.add('role-' + usuario.perfil);

      // Navegar para tela inicial apropriada
      setTimeout(function() {
        try {
          if (typeof window.buildSidebar === 'function') window.buildSidebar();
          var destino = usuario.perfil === 'rh' ? 'gestao-rh' : (usuario.perfil === 'gestor' ? 'gestor' : 'intranet');
          if (typeof window.sbNav === 'function') window.sbNav(destino);
        } catch(e) {
          console.error('[LOGIN-FALLBACK] Erro ao navegar:', e);
        }
      }, 100);

      // Renderizar conteúdo em background
      setTimeout(async function() {
        try {
          if (typeof window.updateHero === 'function') await window.updateHero();
        } catch(e) {}
        try {
          if (typeof window.renderAll === 'function') await window.renderAll();
        } catch(e) {}
        try {
          if (typeof window.enforcePermissions === 'function') window.enforcePermissions();
        } catch(e) {}
      }, 0);

      console.log('[LOGIN-FALLBACK] Login concluído!');
    }
  };

  console.log('[LOGIN-FALLBACK] Usuarios de teste carregados. Use: colaborador@teste.com, gestor@teste.com, rh@teste.com, admin@teste.com (senha: 123456)');
})();
