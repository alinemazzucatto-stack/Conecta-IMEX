// ===== script: grh-holerites-auto-js =====
(function(){
  'use strict';
  if(window.__grhHoleritesAutoInit) return;
  window.__grhHoleritesAutoInit = true;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // pdf.js entrega os fragmentos de texto na ordem de desenho interna do PDF,
  // que costuma ser diferente da ordem visual de leitura (colunas diferentes
  // ficam grudadas). Reconstrói a ordem de leitura usando a posição (x,y) de
  // cada fragmento, agrupando por linha — como um "pdftotext -layout" faria.
  function textoEmOrdemDeLeitura(textContent) {
    const itens = textContent.items
      .filter(it => 'str' in it && it.str)
      .map(it => ({ str: it.str, x: it.transform[4], y: it.transform[5] }));

    itens.sort((a, b) => (b.y - a.y) || (a.x - b.x));

    const linhas = [];
    let linhaAtual = [];
    let yAtual = null;
    const TOLERANCIA_Y = 1.5;

    itens.forEach(it => {
      if(yAtual === null || Math.abs(it.y - yAtual) > TOLERANCIA_Y) {
        if(linhaAtual.length) linhas.push(linhaAtual);
        linhaAtual = [it];
        yAtual = it.y;
      } else {
        linhaAtual.push(it);
      }
    });
    if(linhaAtual.length) linhas.push(linhaAtual);

    return linhas.map(linha => linha.map(it => it.str).join(' ')).join('\n');
  }

  function extrairCampos(texto) {
    const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean);
    const unido = linhas.join('\n');

    let nome = '';
    let codigo = '';
    let cpf = '';
    let mes = '';
    let ano = '';

    // CPF — padrão: XXX.XXX.XXX-XX ou XXXXXXXXXXX (nem todo modelo de holerite traz CPF)
    const cpfRx = /(?:cpf|c\.p\.f|cadastro)[\s:\-]*(\d{3}\.?\d{3}\.?\d{3}[\-.]?\d{2}|\d{11})/i;
    const cpfM = unido.match(cpfRx);
    if(cpfM) {
      cpf = cpfM[1].replace(/\D/g, ''); // Remove caracteres especiais
    }

    // Linha de dados do funcionário: "00035 ABRANHAM JOAO RESQUE VELOSO NETO 212420 001 001 000 000"
    // (código, depois o nome em maiúsculas, depois os códigos numéricos de CBO/Emp/Local/Depto).
    // É o padrão exato do modelo "Recibo de Pagamento de Salário" (Nome do Funcionário fica só
    // no cabeçalho da tabela, o valor real vem na linha seguinte).
    // /i porque o mesmo PDF traz alguns nomes TUDO MAIÚSCULO ("ABRANHAM...") e outros
    // em Caixa Normal ("Bruno de Paula Silva") — inconsistência do sistema de origem.
    const linhaValoresRx = /^(\d{2,6})\s+([A-ZÀ-ÜÇ][A-ZÀ-ÜÇÀ-ÿa-z\s]{3,70}?)\s+\d{4,7}\s+\d{1,3}\s+\d{1,3}/mi;
    const lv = unido.match(linhaValoresRx);
    if(lv) {
      codigo = lv[1];
      nome = lv[2].trim();
    }

    // Fallback: código isolado tipo "Matrícula: 231" (outros modelos de holerite)
    if(!codigo) {
      const codeRx = /(?:matr[ií]cula|c[oó]digo|cod\.?|cd\.?)\s*[:\-]?\s*(\d{2,10})/i;
      const cm = unido.match(codeRx);
      if(cm) codigo = cm[1];
    }

    // Fallback: "Nome do Funcionário: FULANO" na mesma linha (outros modelos de holerite)
    if(!nome) {
      const nameRx = /(?:nome|funcion[aá]rio|empregado)[ \t]*[:\-]?[ \t]*([A-ZÁÉÍÓÚ][A-ZÁÉÍÓÚA-Za-z \.']{4,80})/i;
      const nm = unido.match(nameRx);
      if(nm) {
        nome = nm[1].replace(/\b(cpf|rg|cargo|admiss[aã]o|dept|matr[ií]cula|c[oó]digo).*$/i, '').trim();
      }
    }
    if(!nome) {
      for(const l of linhas) {
        const letras = l.replace(/[^A-Za-zÀ-ú\s]/g, '').trim();
        const palavras = letras.split(/\s+/).filter(w => w.length > 1);
        if(palavras.length >= 2 && palavras.length <= 8 && letras === letras.toUpperCase()) {
          nome = letras;
          break;
        }
      }
    }

    // Mês/Ano
    const meses = {'janeiro':'01','fevereiro':'02','março':'03','abril':'04','maio':'05','junho':'06','julho':'07','agosto':'08','setembro':'09','outubro':'10','novembro':'11','dezembro':'12'};
    const mesRx = /(?:compet[eê]ncia|m[eê]s|refer[eê]ncia)\s*[:\-]?\s*(\w+)\s*[\/\-]?\s*(\d{4})/i;
    const mesM = unido.match(mesRx);
    if(mesM) {
      const mesNome = mesM[1].toLowerCase();
      mes = Object.keys(meses).find(k => k.includes(mesNome)) || mesNome;
      ano = mesM[2];
    }
    if(!mes) {
      const textMx = unido.match(/\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-zçãé]*\s*[\/\-]?\s*(\d{4})/i);
      if(textMx) {
        const m = textMx[1].toLowerCase();
        const mapa = {'jan':'janeiro','fev':'fevereiro','mar':'março','abr':'abril','mai':'maio','jun':'junho','jul':'julho','ago':'agosto','set':'setembro','out':'outubro','nov':'novembro','dez':'dezembro'};
        mes = mapa[m] || m;
        ano = textMx[2];
      }
    }

    return { nome, codigo, cpf, mes, ano };
  }

  // Extrai os VALORES financeiros do holerite (para alimentar os gráficos).
  function extrairValoresHolerite(texto) {
    const t = String(texto || '').replace(/\s+/g, ' ');
    const num = s => {
      if(!s) return 0;
      const n = parseFloat(String(s).replace(/\./g, '').replace(',', '.'));
      return isNaN(n) ? 0 : n;
    };
    const pega = rx => { const m = t.match(rx); return m ? num(m[1]) : 0; };

    const bruta = pega(/total de vencimentos\s*([\d.]+,\d{2})/i);
    const totalDesc = pega(/total de descontos\s*([\d.]+,\d{2})/i);
    const fgts = pega(/fgts do m[êe]s\s*([\d.]+,\d{2})/i);
    const liquida = (bruta && totalDesc) ? Math.round((bruta - totalDesc) * 100) / 100 : 0;

    // Mês em formato AAAA-MM
    const mesesMap = {janeiro:'01',fevereiro:'02',marco:'03',abril:'04',maio:'05',junho:'06',julho:'07',agosto:'08',setembro:'09',outubro:'10',novembro:'11',dezembro:'12'};
    let mesAAAAMM = '';
    const mm = t.match(/m[êe]s:\s*([a-zçãéíóú]+)\s*\/\s*(\d{4})/i);
    if(mm){
      const nomeMes = mm[1].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const key = Object.keys(mesesMap).find(k => k === nomeMes || k.slice(0,3) === nomeMes.slice(0,3));
      if(key) mesAAAAMM = mm[2] + '-' + mesesMap[key];
    }

    return { mesAAAAMM, bruta, liquida, totalDescontos: totalDesc, fgts };
  }

  // Renderiza a página do PDF, salva como documento no prontuário do colaborador
  // e (se conseguiu extrair valores) alimenta o histórico de holerites.
  // Reutilizada tanto pelo fluxo automático quanto pela resolução manual.
  function distribuirPaginaParaColaborador(pdf, p) {
    return new Promise(async (resolve, reject) => {
      try {
        const page = await pdf.getPage(p.pag);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({scale: 2});
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({canvasContext: ctx, viewport, canvas}).promise;
        canvas.toBlob(async blob => {
          const reader = new FileReader();
          reader.onload = async e => {
            try {
              const novoHolerite = {
                nome: p.nome + '_holerite_' + (p.mes||'mês') + '_' + (p.ano||'ano') + '.pdf',
                tipo: 'application/pdf',
                tipoDoc: 'Holerite',
                tamanho: blob.size,
                data: new Date().toISOString(),
                content: e.target.result
              };

              // Monta a entrada de valores (alimenta os gráficos) se extraiu bruta + mês
              const val = p.valores || {};
              const entradaHolerite = (val.mesAAAAMM && val.bruta > 0) ? {
                mes: val.mesAAAAMM,
                bruta: val.bruta,
                liquida: val.liquida || 0,
                descontoInss: 0, descontoIrrf: 0, descontoSaude: 0, descontoOdonto: 0, descontoFarmacia: 0,
                outrosDescontos: val.totalDescontos || 0,
                fgts: val.fgts || 0,
                provisao13: 0, provisaoFerias: 0,
                arquivoNome: novoHolerite.nome,
                criadoEm: new Date().toISOString()
              } : null;

              // Tenta Firebase primeiro
              try {
                const colabRef = db.collection(col('grh_colabs')).doc(p.id);
                const snap = await colabRef.get();
                const dados = snap.data() || {};
                const prontuario = dados.prontuario || [];
                prontuario.push(novoHolerite);
                const update = { prontuario };

                if(entradaHolerite){
                  const holerites = Array.isArray(dados.holerites) ? dados.holerites.slice() : [];
                  const idx = holerites.findIndex(h => h && h.mes === entradaHolerite.mes);
                  // merge não-destrutivo: valores já existentes (ex.: planilha) prevalecem
                  if(idx >= 0) holerites[idx] = Object.assign({}, entradaHolerite, holerites[idx]);
                  else holerites.push(entradaHolerite);
                  holerites.sort((a,b) => (b.mes||'').localeCompare(a.mes||''));
                  update.holerites = holerites;
                }

                await colabRef.update(update);
              } catch(fbErr) {
                console.warn('Firebase indisponível, usando localStorage', fbErr);
              }

              // Sempre salva em localStorage como backup
              try {
                const backup = JSON.parse(localStorage.getItem('grh_holerites_backup_' + p.id) || '[]');
                backup.push(novoHolerite);
                localStorage.setItem('grh_holerites_backup_' + p.id, JSON.stringify(backup));
              } catch(e2) {
                console.error('Erro ao salvar backup localStorage', e2);
              }

              resolve();
            }catch(err) { reject(err); }
          };
          reader.readAsDataURL(blob);
        });
      }catch(err) { reject(err); }
    });
  }

  // Resolução manual: usuária escolhe o colaborador certo para uma página
  // ambígua/não identificada, direto no painel de resultado (sem reenviar o PDF).
  window.grhResolverManual = async function(pag){
    const sel = document.getElementById('grh-resolver-sel-' + pag);
    const status = document.getElementById('grh-resolver-status-' + pag);
    const estado = window.__grhHoleritesEstado;
    if(!sel || !sel.value || !estado || !estado.pdf) return;

    const colaborador = estado.colabs.find(c => c._id === sel.value);
    if(!colaborador){ if(status) status.textContent = '❌ Colaborador não encontrado.'; return; }

    if(status) status.textContent = '⏳ Distribuindo…';
    try{
      const page = await estado.pdf.getPage(pag);
      const textContent = await page.getTextContent();
      const texto = textoEmOrdemDeLeitura(textContent);
      const campos = extrairCampos(texto);
      const valores = extrairValoresHolerite(texto);

      await distribuirPaginaParaColaborador(estado.pdf, {
        pag, id: colaborador._id, nome: campos.nome || colaborador.nome,
        mes: campos.mes, ano: campos.ano, valores
      });

      if(status) status.innerHTML = '✅ Distribuído para <strong>' + colaborador.nome + '</strong>';
      if(sel) sel.disabled = true;
      const btn = document.getElementById('grh-resolver-btn-' + pag);
      if(btn) btn.disabled = true;
      if(typeof window.grhGetColabs === 'function') { try{ await window.grhGetColabs(true); }catch(e){} }
    }catch(err){
      console.error(err);
      if(status) status.textContent = '❌ Erro: ' + (err.message||err);
    }
  };

  function criarModal() {
    if(document.getElementById('grh-modal-holerites')) return;
    const div = document.createElement('div');
    div.id = 'grh-modal-holerites';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:6500;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;overflow-y:auto;padding:20px';
    div.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="font-size:18px;font-weight:700;margin:0">📤 Upload Automático de Holerites</h3>
        <button type="button" onclick="document.getElementById('grh-modal-holerites').style.display='none'" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--ink-60)">✕</button>
      </div>
      <p style="font-size:13px;color:var(--ink-60);margin:0 0 16px;line-height:1.5">
        Envie um Excel com os holerites. O sistema lê os dados de cada linha e distribui para o colaborador certo, alimentando os gráficos de Evolução da Folha e Encargos. <strong>100% automático!</strong>
      </p>
      <label for="grh-holerites-file-input" style="display:block;border:2px dashed var(--border);border-radius:12px;padding:40px;text-align:center;cursor:pointer;background:var(--bg-light)">
        <div style="font-size:32px;margin-bottom:8px">📊</div>
        <p style="font-weight:600;margin:0 0 4px">Clique ou arraste um Excel</p>
        <p style="font-size:12px;color:var(--ink-60);margin:0">Formato: .xlsx ou .xls com colunas: Colaborador, Mês, Salário Bruto, Descontos, Líquido</p>
      </label>
      <input id="grh-holerites-file-input" type="file" accept=".xlsx,.xls" style="display:none" onchange="grhProcessarHolerites(this.files[0])"/>
      <div id="grh-holerites-resultado" style="margin-top:16px"></div>
      <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
        <button type="button" class="btn btn-g" onclick="document.getElementById('grh-modal-holerites').style.display='none'">Fechar</button>
      </div>
    </div>
    `;
    document.body.appendChild(div);
  }

  window.grhAbrirHolerites = function() {
    criarModal();
    document.getElementById('grh-modal-holerites').style.display = 'flex';
  };

  window.grhProcessarHolerites = async function(file) {
    if(!file) return;
    const resultado = document.getElementById('grh-holerites-resultado');
    resultado.innerHTML = '<p style="color:var(--ink-60);font-size:13px">⏳ Carregando bibliotecas…</p>';

    try {
      if(!window.XLSX) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js');
      }

      resultado.innerHTML = '<p style="color:var(--ink-60);font-size:13px">⏳ Processando ' + file.name + '…</p>';

      const arrayBuffer = await file.arrayBuffer();
      const workbook = window.XLSX.read(new Uint8Array(arrayBuffer), {type: 'array'});
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const dados = window.XLSX.utils.sheet_to_json(sheet);

      const colabs = typeof window.grhGetColabs === 'function' ? await window.grhGetColabs() : [];

      const processados = [];
      const erros = [];
      const ambiguos = [];

      // Processa cada linha do Excel
      dados.forEach((linha, idx) => {
        const nomePlanilha = String(linha['Colaborador'] || linha['COLABORADOR'] || linha['Nome'] || linha['NOME'] || '').trim();
        const mesStr = String(linha['Mês'] || linha['MÊS'] || linha['mes'] || '').trim();
        const brutuaStr = String(linha['Salário Bruto'] || linha['SALÁRIO BRUTO'] || linha['Bruta'] || linha['BRUTA'] || '').trim();

        if(!nomePlanilha) {
          erros.push({linha: idx + 2, nome: '(sem nome)', motivo: 'Coluna Colaborador vazia'});
          return;
        }

        // Tenta extrair campos do nome (para compatibilidade)
        const campos = { nome: nomePlanilha, mes: mesStr };

        // Buscar colaborador por nome (compatível com Excel)
        let colaborador = null;
        const normalizaNome = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        const STOPWORDS = new Set(['de','da','do','das','dos','e']);
        const palavras = s => normalizaNome(s).split(/\s+/).filter(w => w.length > 1 && !STOPWORDS.has(w));
        const nomeNorm = normalizaNome(nomePlanilha);
        const wCampos = palavras(nomePlanilha);

        // 1ª tentativa: nome IDÊNTICO (mesmo conjunto de palavras)
        let encontrados = colabs.filter(c => {
          const wColab = palavras(c.nome||'');
          if(!wColab.length || !wCampos.length || wColab.length !== wCampos.length) return false;
          return wColab.every(w => wCampos.includes(w));
        });

        // 2ª tentativa: bata todas as palavras de um lado no outro
        if(!encontrados.length) {
          encontrados = colabs.filter(c => {
            const wColab = palavras(c.nome||'');
            if(!wColab.length || !wCampos.length) return false;
            const menor = wColab.length <= wCampos.length ? wColab : wCampos;
            const maior = wColab.length <= wCampos.length ? wCampos : wColab;
            return menor.every(w => maior.includes(w));
          });
        }

        // 3ª tentativa: nome parcial/sobrenome
        if(!encontrados.length) {
          encontrados = colabs.filter(c => {
            const cNorm = normalizaNome(c.nome||'').trim();
            if(!cNorm) return false;
            const primeiraPalavra = cNorm.split(' ')[0];
            return (cNorm.includes(nomeNorm) || (primeiraPalavra.length > 1 && nomeNorm.includes(primeiraPalavra)));
          });
        }

        if(encontrados.length === 1) {
          colaborador = encontrados[0];
          processados.push({
            linha: idx + 2,
            id: colaborador._id,
            nome: nomePlanilha,
            colab: colaborador.nome,
            mes: mesStr,
            bruta: brutuaStr ? parseFloat(brutuaStr.replace(/[.,]/g, (m, i) => m === ',' ? '.' : '')) : 0
          });
        } else if(encontrados.length > 1) {
          ambiguos.push({linha: idx + 2, nome: nomePlanilha, tipo: 'múltiplos encontrados', encontrados: encontrados.map(e => e.nome)});
        } else {
          erros.push({linha: idx + 2, nome: nomePlanilha, motivo: 'Colaborador não encontrado'});
        }
      });

      // Distribuir dados para processados
      let distribuidos = 0;
      if(processados.length === 0) {
        mostrarResultado(0, erros, ambiguos);
        return;
      }

      for(const p of processados) {
        try {
          // Guarda a entrada de holerite (sem arquivo PDF, apenas dados)
          const colabRef = db.collection('grh_colabs').doc(p.id);
          const snap = await colabRef.get();
          const dados = snap.data() || {};
          const holerites = Array.isArray(dados.holerites) ? dados.holerites.slice() : [];

          // Monta a entrada com os dados da planilha
          const mesAnoMatch = p.mes.match(/(\d{1,2})[\/\-]?(\d{4})|(\w+)[\/\-]?(\d{4})/i);
          let mesAAAAMM = '';
          if(mesAnoMatch) {
            const meses = {janeiro:'01',fevereiro:'02',marco:'03',março:'03',abril:'04',maio:'05',junho:'06',julho:'07',agosto:'08',setembro:'09',outubro:'10',novembro:'11',dezembro:'12'};
            if(mesAnoMatch[1]) {
              mesAAAAMM = mesAnoMatch[2] + '-' + String(mesAnoMatch[1]).padStart(2, '0');
            } else if(mesAnoMatch[3]) {
              const mesNome = mesAnoMatch[3].toLowerCase();
              const mesNum = meses[mesNome] || meses[mesNome.slice(0,3)];
              mesAAAAMM = mesAnoMatch[4] + '-' + (mesNum || '01');
            }
          }

          if(mesAAAAMM) {
            const novoHolerite = {
              mes: mesAAAAMM,
              bruta: p.bruta || 0,
              liquida: 0,
              descontoInss: 0, descontoIrrf: 0, descontoSaude: 0, descontoOdonto: 0, descontoFarmacia: 0,
              outrosDescontos: 0,
              fgts: 0,
              provisao13: 0, provisaoFerias: 0,
              arquivoNome: 'holerite_' + mesAAAAMM + '.xlsx',
              criadoEm: new Date().toISOString(),
              importadoDe: 'excel'
            };

            const idx = holerites.findIndex(h => h && h.mes === mesAAAAMM);
            if(idx >= 0) holerites[idx] = Object.assign({}, novoHolerite, holerites[idx]);
            else holerites.push(novoHolerite);
            holerites.sort((a,b) => (b.mes||'').localeCompare(a.mes||''));

            await colabRef.update({ holerites });
          }

          distribuidos++;
          if(distribuidos === processados.length) {
            mostrarResultado(distribuidos, erros, ambiguos);
            if(typeof window.grhGetColabs === 'function') {
              try { await window.grhGetColabs(true); }catch(e){}
            }
          }
        }catch(err) { console.error(err); }
      }
    }catch(err) {
      console.error(err);
      resultado.innerHTML = '<div style="color:#b91c1c;font-size:13px;padding:12px;background:#fee2e2;border-radius:8px">⚠️ Erro: ' + (err.message||String(err)) + '</div>';
    }
  };

  function mostrarResultado(distribuidos, erros, ambiguos) {
    const resultado = document.getElementById('grh-holerites-resultado');
    const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let html = '';
    if(distribuidos > 0) {
      html += '<div style="color:#15803d;background:#dcfce7;padding:12px;border-radius:8px;margin-bottom:8px;font-size:13px"><strong>✅ ' + distribuidos + ' holerite(s) importado(s) com sucesso!</strong></div>';
    }
    if(ambiguos.length > 0) {
      html += '<div style="color:#b45309;background:#fef3c7;padding:12px;border-radius:8px;margin-bottom:8px;font-size:13px"><strong>⚠️ ' + ambiguos.length + ' linha(s) com múltiplos encontrados:</strong><br>' + ambiguos.map(a => 'Linha ' + a.linha + ' (' + a.nome + '): ' + a.encontrados.join(', ')).join('<br>') + '</div>';
    }
    if(erros.length > 0) {
      html += '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px"><strong>❌ ' + erros.length + ' linha(s) com erro:</strong><br>' + erros.map(e => 'Linha ' + e.linha + ' (' + e.nome + '): ' + e.motivo).join('<br>') + '</div>';
    }
    resultado.innerHTML = html || '<p style="color:var(--ink-60);font-size:13px">Processamento concluído.</p>';
  }

  // A injeção dos botões é centralizada no injetor único em index.html
  // (id="grh-botoes-injetor"), que os posiciona ao lado de "Importar holerites".
})();
