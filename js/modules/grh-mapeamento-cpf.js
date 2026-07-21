// ===== script: grh-mapeamento-cpf-js =====
(function(){
  'use strict';
  if(window.__grhMapeamentoCpfInit) return;
  window.__grhMapeamentoCpfInit = true;

  // Armazena em Firebase ou localStorage
  window.grhMapeamentoCpf = {};

  // Carrega mapeamento do Firebase ou localStorage
  async function carregarMapeamento() {
    // Tenta Firebase primeiro
    try {
      const snap = await db.collection(col('grh_mapeamento_cpf')).doc('dados').get();
      if(snap.exists) {
        window.grhMapeamentoCpf = snap.data() || {};
        localStorage.setItem('grh_mapeamento_cpf_backup', JSON.stringify(window.grhMapeamentoCpf));
        return;
      }
    } catch(e) {
      console.warn('Firebase indisponível, usando localStorage', e);
    }

    // Fallback para localStorage
    const backup = localStorage.getItem('grh_mapeamento_cpf_backup');
    if(backup) {
      window.grhMapeamentoCpf = JSON.parse(backup);
    }
  }

  // Salva mapeamento no Firebase ou localStorage
  async function salvarMapeamento(dados) {
    let sucesso = false;

    // Tenta Firebase primeiro
    try {
      await db.collection(col('grh_mapeamento_cpf')).doc('dados').set(dados, { merge: true });
      sucesso = true;
    } catch(e) {
      console.warn('Firebase indisponível, salvando em localStorage', e);
    }

    // Sempre salva em localStorage como backup
    try {
      localStorage.setItem('grh_mapeamento_cpf_backup', JSON.stringify(dados));
      window.grhMapeamentoCpf = dados;
      return true; // Sucesso no localStorage
    } catch(e) {
      console.error('Erro ao salvar mapeamento', e);
      return false;
    }
  }

  // Parse do Excel
  function parseExcelMapeamento(data) {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const mapeamento = {};
    rows.forEach(row => {
      const cpf = String(row.CPF || row.cpf || '').replace(/\D/g, '').trim();
      const codigo = String(row.CÓDIGO || row.Código || row.codigo || row.CODIGO || row.codigo || '').trim();

      if(cpf && cpf.length === 11 && codigo) {
        mapeamento[cpf] = codigo;
      }
    });

    return mapeamento;
  }

  // Modal de upload
  function criarModal() {
    if(document.getElementById('grh-modal-mapeamento-cpf')) return;
    const div = document.createElement('div');
    div.id = 'grh-modal-mapeamento-cpf';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:6500;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;overflow-y:auto;padding:20px';
    div.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="font-size:18px;font-weight:700;margin:0">⚙️ Mapeamento CPF → Código</h3>
        <button type="button" onclick="document.getElementById('grh-modal-mapeamento-cpf').style.display='none'" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--ink-60)">✕</button>
      </div>
      <p style="font-size:13px;color:var(--ink-60);margin:0 0 16px;line-height:1.5">
        Envie um Excel com as colunas: <strong>CPF</strong>, <strong>CÓDIGO</strong> (e opcionalmente NOME). Isso permite que o sistema identifique automaticamente qual holerite pertence a cada colaborador pelo código.
      </p>
      <label for="grh-mapeamento-file-input" style="display:block;border:2px dashed var(--border);border-radius:12px;padding:40px;text-align:center;cursor:pointer;background:var(--bg-light);margin-bottom:16px">
        <div style="font-size:32px;margin-bottom:8px">📊</div>
        <p style="font-weight:600;margin:0 0 4px">Clique ou arraste um Excel</p>
        <p style="font-size:12px;color:var(--ink-60);margin:0">.xlsx ou .xls com CPF, CÓDIGO e nome (opcional)</p>
      </label>
      <input id="grh-mapeamento-file-input" type="file" accept=".xlsx,.xls" style="display:none" onchange="grhProcessarMapeamentoCpf(this.files[0])"/>
      <div id="grh-mapeamento-resultado" style="margin-bottom:16px"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button type="button" class="btn btn-g" onclick="document.getElementById('grh-modal-mapeamento-cpf').style.display='none'">Fechar</button>
      </div>
    </div>
    `;
    document.body.appendChild(div);
  }

  window.grhAbrirMapeamentoCpf = function() {
    criarModal();
    document.getElementById('grh-modal-mapeamento-cpf').style.display = 'flex';
    document.getElementById('grh-mapeamento-resultado').innerHTML = '';
  };

  window.grhProcessarMapeamentoCpf = async function(file) {
    if(!file) return;
    const resultado = document.getElementById('grh-mapeamento-resultado');
    resultado.innerHTML = '<p style="color:var(--ink-60);font-size:13px">⏳ Processando…</p>';

    try {
      const arrayBuffer = await file.arrayBuffer();
      const mapeamento = parseExcelMapeamento(arrayBuffer);

      if(Object.keys(mapeamento).length === 0) {
        resultado.innerHTML = '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px">❌ Nenhum registro válido encontrado. Verifique se o Excel tem as colunas CPF e CÓDIGO.</div>';
        return;
      }

      // Salva no Firebase
      const sucesso = await salvarMapeamento(mapeamento);
      if(sucesso) {
        resultado.innerHTML = '<div style="color:#15803d;background:#dcfce7;padding:12px;border-radius:8px;font-size:13px"><strong>✅ Mapeamento carregado com sucesso!</strong><br>Total de ' + Object.keys(mapeamento).length + ' registros salvos no sistema.</div>';
        if(typeof addNotif === 'function') {
          addNotif('Mapeamento CPF atualizado com ' + Object.keys(mapeamento).length + ' colaboradores.', 'success');
        }
      } else {
        resultado.innerHTML = '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px">⚠️ Erro ao salvar no Firebase. Verifique as permissões.</div>';
      }
    } catch(err) {
      console.error(err);
      resultado.innerHTML = '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px">❌ Erro: ' + (err.message || String(err)) + '</div>';
    }
  };

  // A injeção do botão é centralizada no injetor único em index.html.

  // Carrega mapeamento ao iniciar
  carregarMapeamento();

  window.grhCarregarMapeamentoCpf = carregarMapeamento;
})();

