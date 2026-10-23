// Limpeza única dos históricos locais anteriores à exclusão de 23/10/2026.
// Credenciais e persistência do Firebase Auth são preservadas.
(function () {
  'use strict';
  var marker = '__conecta_employee_cleanup_20261023';
  var keys = [
    'auditLogs', '_grh_pesq_ativas', '_grh_pesq_enc',
    'grh_beneficios_backup', 'grh_docs_downloads',
    'grh_faixas_historico_backup', 'grh_lancamentos_mensais_backup',
    'grh_mapeamento_cpf_backup', 'grh_orcamentos_backup',
    'grh_remuneracao_config_historico_backup', 'imex_folha_anterior_v84'
  ];
  try {
    if (localStorage.getItem(marker) === 'done') return;
    [localStorage, sessionStorage].forEach(function (storage) {
      var remove = [];
      for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (keys.indexOf(key) !== -1 || /^grh_holerites_backup_/.test(key) ||
            (/^grh_beneficios_/.test(key) && key !== 'grh_beneficios_catalogo')) {
          remove.push(key);
        }
      }
      remove.forEach(function (key) { storage.removeItem(key); });
    });
    localStorage.setItem(marker, 'done');
  } catch (error) {
    console.error('Não foi possível concluir a limpeza dos históricos locais.');
  }
})();
