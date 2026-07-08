// ═══════════════════════════════════════════════════════════════
// SCRIPT DE DIAGNÓSTICO - Cole no Console (F12) e execute
// ═══════════════════════════════════════════════════════════════

console.log('=== DIAGNÓSTICO DE LOGIN ===');
console.log('');

// 1. Verificar se doLogin existe
console.log('1. window.doLogin existe?', typeof window.doLogin === 'function');

// 2. Verificar se fallback está carregado
console.log('2. window.__loginFallbackReady?', window.__loginFallbackReady);

// 3. Verificar elementos de login
console.log('3. #lEmail existe?', !!document.getElementById('lEmail'));
console.log('4. #lPass existe?', !!document.getElementById('lPass'));
console.log('5. #lBtn existe?', !!document.getElementById('lBtn'));
console.log('6. #lErr existe?', !!document.getElementById('lErr'));

// 4. Verificar se Firebase está inicializado
console.log('7. Firebase inicializado?', !!(window.firebase && window.firebase.apps && window.firebase.apps.length > 0));

// 5. Verificar se auth existe
console.log('8. window.auth existe?', !!window.auth);

// 6. Verificar dados salvos
console.log('9. sessionStorage.userRole:', sessionStorage.getItem('userRole'));
console.log('10. sessionStorage.userEmail:', sessionStorage.getItem('userEmail'));

// 7. Estados de tela
console.log('11. #loginScreen display:', document.getElementById('loginScreen')?.style.display);
console.log('12. #appShell display:', document.getElementById('appShell')?.style.display);

// 8. Tentar login programaticamente
console.log('');
console.log('=== TENTANDO LOGIN AUTOMÁTICO ===');
document.getElementById('lEmail').value = 'colaborador@teste.com';
document.getElementById('lPass').value = '123456';
console.log('Email e senha preenchidos. Executando window.doLogin()...');
window.doLogin().then(() => {
  console.log('✅ LOGIN SUCEDIDO');
  console.log('userRole:', sessionStorage.getItem('userRole'));
  console.log('userEmail:', sessionStorage.getItem('userEmail'));
}).catch(err => {
  console.log('❌ LOGIN FALHOU:', err.message);
});
