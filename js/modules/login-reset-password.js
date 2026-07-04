// ===== script: login-reset-password-js =====
(function(){
'use strict';
if(window.__loginResetPassword) return;
window.__loginResetPassword = true;

function log2(msg){ try{ console.log('[reset-pwd]', msg); }catch(e){} }

// Cria e abre o modal de reset de senha
window.abrirResetSenha = function(){
  var modal = document.getElementById('resetPasswordModal');
  if(!modal){
    criarModal();
    modal = document.getElementById('resetPasswordModal');
  }
  modal.style.setProperty('display', 'flex', 'important');
  var input = document.getElementById('rpEmail');
  if(input) input.focus();
};

// Fecha o modal de reset de senha
window.fecharResetSenha = function(){
  var modal = document.getElementById('resetPasswordModal');
  if(modal) modal.style.setProperty('display', 'none', 'important');
  limparResetSenha();
};

// Limpa os campos e mensagens do formulário
function limparResetSenha(){
  var input = document.getElementById('rpEmail');
  var status = document.getElementById('rpStatus');
  if(input) input.value = '';
  if(status) status.textContent = '';
  status.className = 'rp-status';
}

// Cria o modal de reset de senha
function criarModal(){
  if(document.getElementById('resetPasswordModal')) return;

  var modal = document.createElement('div');
  modal.id = 'resetPasswordModal';
  modal.className = 'reset-password-modal';
  modal.innerHTML = `
    <div class="reset-password-box">
      <div class="rp-header">
        <h2>Recuperar Senha</h2>
        <button type="button" class="rp-close" onclick="fecharResetSenha()" title="Fechar">✕</button>
      </div>

      <div class="rp-content">
        <p class="rp-intro">Digite seu e-mail para receber um link de recuperação de senha.</p>

        <div class="rp-field">
          <label for="rpEmail">E-mail</label>
          <input
            type="email"
            id="rpEmail"
            placeholder="seu@email.com"
            onkeydown="if(event.key==='Enter')enviarResetSenha()"
          />
        </div>

        <div id="rpStatus" class="rp-status"></div>

        <button
          type="button"
          class="btn btn-p"
          id="rpBtn"
          onclick="enviarResetSenha()"
          style="width:100%;justify-content:center"
        >
          Enviar Link de Recuperação →
        </button>

        <button
          type="button"
          class="rp-back-btn"
          onclick="fecharResetSenha()"
        >
          ← Voltar ao Login
        </button>
      </div>
    </div>
  `;

  modal.onclick = function(e){
    if(e.target === modal) fecharResetSenha();
  };

  document.body.appendChild(modal);
}

// Envia o e-mail de reset de senha
window.enviarResetSenha = async function(){
  var email = (document.getElementById('rpEmail') ? document.getElementById('rpEmail').value : '').trim();
  var btn = document.getElementById('rpBtn');
  var status = document.getElementById('rpStatus');

  function mostrarStatus(msg, tipo){
    if(status){
      status.textContent = msg;
      status.className = 'rp-status rp-status-' + tipo;
    } else {
      alert(msg);
    }
  }

  if(!email){
    mostrarStatus('Digite um e-mail válido.', 'error');
    return;
  }

  if(status) status.textContent = '';
  if(btn) btn.disabled = true;

  try {
    if(!firebase || !firebase.apps || firebase.apps.length === 0){
      throw new Error('Firebase não inicializado. Verifique sua conexão com a internet.');
    }

    log2('Enviando reset de senha para: ' + email);

    // Valida se o e-mail existe na base de colaboradores antes de enviar
    var existe = await db.collection('grh_colabs').where('email','==',email).limit(1).get();
    if(existe.empty){
      existe = await db.collection('meta_grh_colabs').where('email','==',email).limit(1).get();
    }
    if(existe.empty){
      existe = await db.collection('xpert_grh_colabs').where('email','==',email).limit(1).get();
    }
    if(existe.empty){
      throw new Error('E-mail não cadastrado na base de colaboradores.');
    }

    // Envia o e-mail de reset de senha
    await auth.sendPasswordResetEmail(email);

    log2('E-mail de reset enviado com sucesso');
    mostrarStatus('✓ Link de recuperação enviado! Verifique seu e-mail (e a pasta de spam).', 'success');

    // Limpa o campo e fecha após 3 segundos
    setTimeout(function(){
      fecharResetSenha();
    }, 3000);

  } catch(e) {
    var msgs = {
      'auth/user-not-found': 'E-mail não encontrado no sistema.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
      'auth/network-request-failed': 'Sem conexão com a internet.',
      'E-mail não cadastrado na base de colaboradores.': 'Este e-mail não está cadastrado na base de colaboradores.'
    };

    var msg = msgs[e.code] || msgs[e.message] || e.message || 'Erro ao enviar o link de recuperação.';
    log2('Erro: ' + msg);
    mostrarStatus('✗ ' + msg, 'error');

  } finally {
    if(btn) btn.disabled = false;
  }
};

// Inicializa o modal quando o DOM está pronto
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', criarModal);
} else {
  criarModal();
}

})();
