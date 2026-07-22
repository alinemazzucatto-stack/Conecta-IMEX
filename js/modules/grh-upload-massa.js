// ===== script: grh-upload-massa-js =====
(function(){
  'use strict';
  if (window.__grhUploadMassaInit) return;
  window.__grhUploadMassaInit = true;

  var TIPOS = [['Holerite','📄'], ['Férias','🌴'], ['IR','🧮'], ['Ordem de Serviço','📋'], ['Nota Fiscal','🧾']];

  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  function normFile(nome){
    return String(nome||'').toLowerCase();
  }

  function ensureModal(){
    if (document.getElementById('grh-modal-upload-massa')) return;
    var div = document.createElement('div');
    div.id = 'grh-modal-upload-massa';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,0.45);align-items:center;justify-content:center';
    div.innerHTML =
      '<div style="background:#fff;border-radius:20px;padding:32px;width:92%;max-width:680px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">' +
          '<h3 style="font-size:18px;font-weight:700;margin:0">📤 Upload em massa de documentos</h3>' +
          '<button type="button" onclick="window.grhFecharUploadMassa()" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--ink-60)">✕</button>' +
        '</div>' +
        '<p style="font-size:13px;color:var(--ink-60);margin:0 0 16px;line-height:1.5">Nomeie cada arquivo com o <strong>e-mail</strong> ou a <strong>matrícula</strong> do colaborador (ex: <code>joao.silva@imex.com_holerite_06-2026.pdf</code>). O sistema identifica o colaborador pelo nome do arquivo e distribui automaticamente para "Meus Documentos" de cada um.</p>' +
        '<div class="fg">' +
          '<div class="field full"><label>Tipo de documento (aplicado a todos os arquivos deste envio)</label>' +
            '<select id="grh-massa-tipo">' + TIPOS.map(function(t){ return '<option value="'+t[0]+'">'+t[1]+' '+t[0]+'</option>'; }).join('') + '</select>' +
          '</div>' +
          '<div class="field full"><label>Arquivos (PDF, imagem ou Word — até 900 KB cada)</label>' +
            '<input id="grh-massa-files" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">' +
          '</div>' +
        '</div>' +
        '<div id="grh-massa-resultado" style="margin-top:16px"></div>' +
        '<div style="display:flex;gap:10px;margin-top:22px;justify-content:flex-end">' +
          '<button type="button" class="btn btn-g" onclick="window.grhFecharUploadMassa()">Fechar</button>' +
          '<button type="button" id="grh-massa-processar-btn" class="btn btn-p" onclick="window.grhProcessarUploadMassa()">⚙️ Processar e Distribuir</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(div);
  }

  window.grhAbrirUploadMassa = function(){
    ensureModal();
    document.getElementById('grh-massa-resultado').innerHTML = '';
    document.getElementById('grh-massa-files').value = '';
    document.getElementById('grh-modal-upload-massa').style.display = 'flex';
  };

  window.grhFecharUploadMassa = function(){
    var m = document.getElementById('grh-modal-upload-massa');
    if (m) m.style.display = 'none';
  };

  function lerArquivoBase64(file){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(e){ resolve(e.target.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function encontrarColaborador(nomeArquivo, colabs){
    var alvo = normFile(nomeArquivo);
    var encontrados = colabs.filter(function(c){
      var email = String(c.email||'').toLowerCase();
      var mat = String(c.matricula||'').toLowerCase();
      return (email && alvo.indexOf(email) !== -1) || (mat && mat.length >= 3 && alvo.indexOf(mat) !== -1);
    });
    return encontrados;
  }

  window.grhProcessarUploadMassa = async function(){
    var input = document.getElementById('grh-massa-files');
    var tipoDoc = document.getElementById('grh-massa-tipo').value;
    var resultado = document.getElementById('grh-massa-resultado');
    var btn = document.getElementById('grh-massa-processar-btn');
    var files = input.files;

    if (!files || !files.length){
      resultado.innerHTML = '<div class="rh-module-note" style="color:#b91c1c">Selecione ao menos um arquivo.</div>';
      return;
    }

    btn.disabled = true;
    resultado.innerHTML = '<div class="rh-module-note">⏳ Processando ' + files.length + ' arquivo(s)…</div>';

    var colabs = typeof window.grhGetColabs === 'function' ? await window.grhGetColabs() : [];
    var distribuidos = [];
    var naoIdentificados = [];
    var ambiguos = [];

    for (var i = 0; i < files.length; i++){
      var file = files[i];
      if (file.size > 900 * 1024){
        naoIdentificados.push(file.name + ' (arquivo maior que 900 KB)');
        continue;
      }
      var encontrados = encontrarColaborador(file.name, colabs);
      if (encontrados.length === 0){
        naoIdentificados.push(file.name);
        continue;
      }
      if (encontrados.length > 1){
        ambiguos.push(file.name + ' (encontrou ' + encontrados.length + ' colaboradores — renomeie o arquivo com o e-mail completo)');
        continue;
      }

      var colab = encontrados[0];
      try{
        var base64 = await lerArquivoBase64(file);
        var docData = {
          nome: file.name,
          tipo: file.type,
          tipoDoc: tipoDoc,
          tamanho: file.size,
          data: new Date().toISOString(),
          content: base64
        };
        var colabRef = db.collection(col('grh_colabs')).doc(colab._id);
        var snap = await colabRef.get();
        var dadosAtuais = snap.data() || {};
        var prontuario = dadosAtuais.prontuario || [];
        prontuario.push(docData);
        await colabRef.update({ prontuario: prontuario });
        distribuidos.push(file.name + ' → ' + (colab.nome || colab.email));
      }catch(e){
        naoIdentificados.push(file.name + ' (erro ao salvar: ' + e.message + ')');
      }
    }

    if (typeof window.grhGetColabs === 'function') { try{ await window.grhGetColabs(true); }catch(e){} }

    var html = '';
    if (distribuidos.length){
      html += '<div class="rh-module-note" style="color:#15803d;margin-bottom:8px"><strong>✅ ' + distribuidos.length + ' distribuído(s) automaticamente:</strong><br>' + distribuidos.map(esc).join('<br>') + '</div>';
    }
    if (ambiguos.length){
      html += '<div class="rh-module-note" style="color:#b45309;margin-bottom:8px"><strong>⚠️ ' + ambiguos.length + ' ambíguo(s):</strong><br>' + ambiguos.map(esc).join('<br>') + '</div>';
    }
    if (naoIdentificados.length){
      html += '<div class="rh-module-note" style="color:#b91c1c"><strong>❌ ' + naoIdentificados.length + ' não identificado(s) — envie manualmente pela ficha do colaborador:</strong><br>' + naoIdentificados.map(esc).join('<br>') + '</div>';
    }
    resultado.innerHTML = html;
    input.value = '';
    btn.disabled = false;

    if (typeof addNotif === 'function' && distribuidos.length){
      addNotif(distribuidos.length + ' documento(s) distribuído(s) via upload em massa.', 'success');
    }
  };
})();

