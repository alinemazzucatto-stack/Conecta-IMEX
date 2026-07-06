// ===== script: grh-beneficios-upload-js =====
(function(){
  'use strict';
  if(window.__grhBeneficiosUploadInit) return;
  window.__grhBeneficiosUploadInit = true;

  // Parser do Excel
  function parseExcelBeneficios(data) {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const beneficios = {};

    rows.forEach(row => {
      const nomeRaw = row.FUNCIONÁRIO || row.funcionário || row.Nome || row.nome || '';
      if(!nomeRaw) return;

      beneficios[nomeRaw] = {
        nomeRaw: nomeRaw,
        valeAlimentacao: parseFloat(row['VALE ALIMENTAÇÃO'] || row['Vale Alimentação'] || row['VALE ALIMENTACAO'] || 0) || 0,
        colab: parseFloat(row['COLAB+'] || row['Colab+'] || row['COLAB'] || 0) || 0,
        odontologico: parseFloat(row['ODONTOLÓGICO'] || row['Odontológico'] || row['ODONTOLOGICO'] || 0) || 0,
        unimed: parseFloat(row['UNIMED'] || row['Unimed'] || row['SAÚDE'] || row['Saúde'] || 0) || 0,
        sindicato: parseFloat(row['SINDICATO'] || row['Sindicato'] || row['CARTÃO SINDICATO'] || row['Cartão Sindicato'] || 0) || 0,
        data: new Date().toISOString()
      };
    });

    return beneficios;
  }

  // Salva no Firebase ou localStorage
  async function salvarBeneficios(beneficios, colabs) {
    const resultados = { distribuidos: 0, erros: [], ambiguos: [] };
    const beneficiosFirebase = {};

    for(const nomeRaw in beneficios) {
      const dados = beneficios[nomeRaw];

      // Procura colaborador
      const normalizaNome = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const nomeNorm = normalizaNome(nomeRaw);

      const encontrados = colabs.filter(c => {
        const cNorm = normalizaNome(c.nome||'');
        return cNorm.includes(nomeNorm) || nomeNorm.includes(cNorm.split(' ')[0]);
      });

      if(encontrados.length === 0) {
        resultados.erros.push(nomeRaw);
      } else if(encontrados.length > 1) {
        resultados.ambiguos.push({ nome: nomeRaw, encontrados: encontrados.map(c => c.nome) });
      } else {
        const colab = encontrados[0];
        const benef = {
          colaboradorId: colab._id,
          colaboradorNome: colab.nome,
          valeAlimentacao: dados.valeAlimentacao,
          colab: dados.colab,
          odontologico: dados.odontologico,
          unimed: dados.unimed,
          sindicato: dados.sindicato,
          atualizadoEm: dados.data
        };

        beneficiosFirebase[colab._id] = benef;

        // Tenta salvar no Firebase
        try {
          await db.collection(col('grh_beneficios')).doc(colab._id).set(benef, { merge: true });
        } catch(e) {
          console.warn('Firebase indisponível para ' + colab.nome + ', usando localStorage', e);
        }

        resultados.distribuidos++;
      }
    }

    // Sempre salva em localStorage como backup
    try {
      const backup = JSON.parse(localStorage.getItem('grh_beneficios_backup') || '{}');
      Object.assign(backup, beneficiosFirebase);
      localStorage.setItem('grh_beneficios_backup', JSON.stringify(backup));
    } catch(e) {
      console.error('Erro ao salvar backup localStorage', e);
    }

    return resultados;
  }

  // Modal de upload
  function criarModal() {
    if(document.getElementById('grh-modal-beneficios-upload')) return;
    const div = document.createElement('div');
    div.id = 'grh-modal-beneficios-upload';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:6500;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;overflow-y:auto;padding:20px';
    div.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="font-size:18px;font-weight:700;margin:0">📊 Upload de Benefícios</h3>
        <button type="button" onclick="document.getElementById('grh-modal-beneficios-upload').style.display='none'" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--ink-60)">✕</button>
      </div>
      <p style="font-size:13px;color:var(--ink-60);margin:0 0 16px;line-height:1.5">
        Envie um Excel com as colunas: <strong>FUNCIONÁRIO</strong>, <strong>VALE ALIMENTAÇÃO</strong>, <strong>COLAB+</strong>, <strong>ODONTOLÓGICO</strong>, <strong>UNIMED</strong>, <strong>SINDICATO</strong>. O sistema identificará automaticamente cada colaborador e atualizará os valores.
      </p>
      <div style="border:2px dashed var(--border);border-radius:12px;padding:40px;text-align:center;cursor:pointer;background:var(--bg-light);margin-bottom:16px" onclick="document.getElementById('grh-beneficios-file-input').click()">
        <div style="font-size:32px;margin-bottom:8px">📊</div>
        <p style="font-weight:600;margin:0 0 4px">Clique ou arraste um Excel</p>
        <p style="font-size:12px;color:var(--ink-60);margin:0">.xlsx ou .xls com dados de benefícios</p>
      </div>
      <input id="grh-beneficios-file-input" type="file" accept=".xlsx,.xls" style="display:none" onchange="grhProcessarBeneficios(this.files[0])"/>
      <div id="grh-beneficios-resultado" style="margin-bottom:16px"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button type="button" class="btn btn-g" onclick="document.getElementById('grh-modal-beneficios-upload').style.display='none'">Fechar</button>
      </div>
    </div>
    `;
    document.body.appendChild(div);
  }

  window.grhAbrirBeneficios = function() {
    criarModal();
    document.getElementById('grh-modal-beneficios-upload').style.display = 'flex';
    document.getElementById('grh-beneficios-resultado').innerHTML = '';
  };

  window.grhProcessarBeneficios = async function(file) {
    if(!file) return;
    const resultado = document.getElementById('grh-beneficios-resultado');
    resultado.innerHTML = '<p style="color:var(--ink-60);font-size:13px">⏳ Processando…</p>';

    try {
      const arrayBuffer = await file.arrayBuffer();
      const beneficios = parseExcelBeneficios(arrayBuffer);

      if(Object.keys(beneficios).length === 0) {
        resultado.innerHTML = '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px">❌ Nenhum registro encontrado. Verifique se o Excel tem as colunas esperadas.</div>';
        return;
      }

      const colabs = typeof window.grhGetColabs === 'function' ? await window.grhGetColabs() : [];
      const res = await salvarBeneficios(beneficios, colabs);

      let html = '';
      if(res.distribuidos > 0) {
        html += '<div style="color:#15803d;background:#dcfce7;padding:12px;border-radius:8px;margin-bottom:8px;font-size:13px"><strong>✅ ' + res.distribuidos + ' colaborador(es) atualizado(s)!</strong></div>';
      }
      if(res.ambiguos.length > 0) {
        html += '<div style="color:#b45309;background:#fef3c7;padding:12px;border-radius:8px;margin-bottom:8px;font-size:13px"><strong>⚠️ ' + res.ambiguos.length + ' ambíguo(s):</strong><br>' + res.ambiguos.map(a => a.nome + ' (encontrou: ' + a.encontrados.join(', ') + ')').join('<br>') + '</div>';
      }
      if(res.erros.length > 0) {
        html += '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px"><strong>❌ ' + res.erros.length + ' não identificado(s):</strong><br>' + res.erros.join('<br>') + '</div>';
      }

      resultado.innerHTML = html || '<p style="color:var(--ink-60);font-size:13px">Processamento concluído.</p>';

      if(typeof addNotif === 'function') {
        addNotif('Benefícios atualizado para ' + res.distribuidos + ' colaborador(es).', 'success');
      }

      // Recarrega a página pra atualizar
      if(res.distribuidos > 0) {
        setTimeout(() => location.reload(), 2000);
      }
    } catch(err) {
      console.error(err);
      resultado.innerHTML = '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px">❌ Erro: ' + (err.message || String(err)) + '</div>';
    }
  };

  // A injeção do botão é centralizada no injetor único em index.html.
})();
