// ===== script: (sem id) =====
// Detectar file:// automaticamente ao carregar
(function() {
  if (location.protocol === 'file:') {
    const el = document.getElementById('lFileWarning');
    if (el) el.style.display = 'block';
    const btn = document.getElementById('lBtn');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; btn.textContent = '⚠️ Servidor HTTP necessário'; }
  }
})();

