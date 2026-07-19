/**
 * PANE: BENEFÍCIOS (FASE 2)
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerencia custos de benefícios com upload de PDF automático
 * - Upload de relatórios em PDF (Unimed, VA, Odonto, Colab+, Sindicato)
 * - Extração automática de totais
 * - Persistência no Firebase + localStorage fallback
 * - Integração com remuneração
 */

import { grhState } from '../../core/state.js';

class BeneficiosPane {
  constructor() {
    this.name = 'beneficios';
    this.container = null;
    this.listeners = [];
    this.arquivosProcessados = [];
    this.vigiaTelaRemuneracao = null;

    // Categorias de benefícios
    this.CATEGORIAS = [
      { key: 'va', label: 'Vale Alimentação', campo: 'rem-beneficio-va' },
      { key: 'saude', label: 'Plano de Saúde (Unimed)', campo: 'rem-beneficio-saude' },
      { key: 'odonto', label: 'Plano Odontológico', campo: 'rem-beneficio-odonto' },
      { key: 'colabmais', label: 'Colab+', campo: 'rem-beneficio-colabmais' },
      { key: 'sindicato', label: 'Cartão Sindicato', campo: 'rem-beneficio-sindicato' }
    ];
  }

  async init() {
    console.log('[GRH-BENEFICIOS] Inicializando pane benefícios...');
    // Carregamento de dados iniciais se necessário
    // Preparar listeners globais
  }

  async render() {
    this.container = document.getElementById('view-gestao-rh');
    if (!this.container) return;

    const html = `
      <div id="beneficios-pane" class="pane-beneficios">
        <div style="padding:20px">
          <h2>💰 Custos de Benefícios</h2>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:20px 0">
            <h3 style="margin:0 0 12px;font-size:14px;color:#0f172a">Importar Benefícios por PDF</h3>
            <p style="font-size:13px;color:#475569;margin:0 0 16px;line-height:1.5">
              Envie os relatórios em <strong>PDF</strong> de benefícios. O sistema extrai automaticamente os totais,
              agrupa por categoria e preenche o painel de custos de remuneração.
            </p>

            <button type="button" id="btn-abrir-beneficios-pdf" class="btn btn-p"
              style="background:#0b1f5b;color:#fff;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600">
              📄 Importar PDFs de Benefícios
            </button>
          </div>

          <div id="beneficios-resumo" style="margin:20px 0">
            <!-- Resumo dos benefícios será renderizado aqui -->
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    // Anexar listeners
    const btnAbrir = document.getElementById('btn-abrir-beneficios-pdf');
    if (btnAbrir) {
      const listener = () => this.abrirModalPdf();
      btnAbrir.addEventListener('click', listener);
      this.listeners.push({ element: btnAbrir, event: 'click', handler: listener });
    }

    await this.carregarResumo();
    console.log('[GRH-BENEFICIOS] ✓ Pane renderizada');
  }

  async carregarResumo() {
    const resumo = document.getElementById('beneficios-resumo');
    if (!resumo) return;

    try {
      const comp = this.obterCompetenciaAtual();
      const dados = await this.carregarDadosSalvos(comp);

      if (dados && Object.keys(dados).length) {
        let html = `<div style="background:#f0f9ff;border:1px solid #0284c7;border-radius:8px;padding:12px">
          <div style="font-size:12px;font-weight:700;color:#0c4a6e;margin-bottom:8px">Benefícios (${comp})</div>`;

        let total = 0;
        for (const cat of this.CATEGORIAS) {
          if (dados[cat.key]) {
            const valor = Number(dados[cat.key]);
            total += valor;
            html += `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px">
              <span>${cat.label}</span>
              <strong>${this.formatBRL(valor)}</strong>
            </div>`;
          }
        }

        html += `<div style="border-top:1px solid #0284c7;padding-top:8px;margin-top:8px;font-weight:700">
          <div style="display:flex;justify-content:space-between">
            <span>Total</span>
            <strong>${this.formatBRL(total)}</strong>
          </div>
        </div></div>`;

        resumo.innerHTML = html;
      } else {
        resumo.innerHTML = '<p style="color:#64748b;font-size:13px">Nenhum dado de benefícios salvo para ' + comp + '</p>';
      }
    } catch (e) {
      console.warn('[GRH-BENEFICIOS] Erro ao carregar resumo:', e);
    }
  }

  abrirModalPdf() {
    console.log('[GRH-BENEFICIOS] Abrindo modal PDF...');
    this.criarModalPdf();
    this.iniciarVigiaTelaRemuneracao();
    this.garantirTelaRemuneracaoVisivel();

    this.arquivosProcessados = [];
    const resultado = document.getElementById('grh-beneficios-pdf-resultado');
    if (resultado) resultado.innerHTML = '';

    const btnAplicar = document.getElementById('grh-beneficios-pdf-aplicar');
    if (btnAplicar) btnAplicar.style.display = 'none';

    const modal = document.getElementById('grh-modal-beneficios-pdf');
    if (modal) modal.style.display = 'flex';
  }

  criarModalPdf() {
    if (document.getElementById('grh-modal-beneficios-pdf')) return;

    const mesAtual = this.obterCompetenciaAtual();
    const div = document.createElement('div');
    div.id = 'grh-modal-beneficios-pdf';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:6500;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;overflow-y:auto;padding:20px';

    div.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:760px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
          <h3 style="font-size:18px;font-weight:700;margin:0">🧾 Importar Benefícios por PDF</h3>
          <button type="button" id="btn-fechar-pdf" style="border:none;background:none;font-size:22px;cursor:pointer;color:#94a3b8">✕</button>
        </div>

        <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center">
          <label style="font-size:13px;font-weight:600;color:#64748b">📅 Competência:</label>
          <input id="grh-beneficios-competencia" type="month" value="${mesAtual}"
            style="padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px"/>
        </div>

        <p style="font-size:13px;color:#64748b;margin:0 0 16px;line-height:1.5">
          Selecione os PDFs de benefícios (Unimed, VA, Odonto, Colab+, Sindicato).
          O sistema lê o total de cada um e preenche automaticamente os campos.
        </p>

        <label for="grh-beneficios-pdf-input"
          style="display:block;border:2px dashed #cbd5e1;border-radius:12px;padding:36px;text-align:center;cursor:pointer;background:#f8fafc">
          <div style="font-size:32px;margin-bottom:8px">📄</div>
          <p style="font-weight:600;margin:0 0 4px">Clique ou arraste os PDFs</p>
          <p style="font-size:12px;color:#64748b;margin:0">Unimed, Vale, Odonto, Colab+, Sindicato…</p>
        </label>
        <input id="grh-beneficios-pdf-input" type="file" accept=".pdf" multiple style="display:none" />

        <div id="grh-beneficios-pdf-resultado" style="margin-top:16px"></div>

        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
          <button type="button" id="btn-fechar-pdf-2" class="btn"
            style="background:#e2e8f0;color:#1f2937;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600">
            Fechar
          </button>
          <button type="button" id="grh-beneficios-pdf-aplicar" class="btn"
            style="display:none;background:#0b1f5b;color:#fff;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600">
            ✅ Aplicar aos campos
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(div);

    // Anexar listeners ao modal
    const btnFechar1 = document.getElementById('btn-fechar-pdf');
    const btnFechar2 = document.getElementById('btn-fechar-pdf-2');
    const btnAplicar = document.getElementById('grh-beneficios-pdf-aplicar');
    const inputFile = document.getElementById('grh-beneficios-pdf-input');
    const inputComp = document.getElementById('grh-beneficios-competencia');

    if (btnFechar1) {
      const listener = () => this.fecharModalPdf();
      btnFechar1.addEventListener('click', listener);
      this.listeners.push({ element: btnFechar1, event: 'click', handler: listener });
    }

    if (btnFechar2) {
      const listener = () => this.fecharModalPdf();
      btnFechar2.addEventListener('click', listener);
      this.listeners.push({ element: btnFechar2, event: 'click', handler: listener });
    }

    if (inputFile) {
      const listener = (e) => this.processarPdfs(e.target.files);
      inputFile.addEventListener('change', listener);
      this.listeners.push({ element: inputFile, event: 'change', handler: listener });
    }

    if (btnAplicar) {
      const listener = () => this.aplicarBeneficios();
      btnAplicar.addEventListener('click', listener);
      this.listeners.push({ element: btnAplicar, event: 'click', handler: listener });
    }

    if (inputComp) {
      const listener = () => this.carregarResumo();
      inputComp.addEventListener('change', listener);
      this.listeners.push({ element: inputComp, event: 'change', handler: listener });
    }
  }

  async processarPdfs(files) {
    if (!files || !files.length) return;

    const out = document.getElementById('grh-beneficios-pdf-resultado');
    const logs = [];

    const log = (msg) => {
      logs.push(msg);
      out.innerHTML = `<div style="font-size:11px;color:#64748b;font-family:monospace;background:#f0f9ff;padding:10px;border-radius:8px;white-space:pre-wrap;max-height:200px;overflow:auto">` +
        logs.map(l => '• ' + l).join('\n') + '</div>';
    };

    try {
      log(files.length + ' arquivo(s) selecionado(s).');
      await this.garantirPdfJs(log);

      for (let i = 0; i < files.length; i++) {
        log('Lendo ' + (i + 1) + '/' + files.length + ': ' + files[i].name);
        const texto = await this.lerTextoPdf(files[i]);
        log('  → ' + texto.length + ' caracteres extraídos');
        const categoria = this.detectarCategoria(texto, files[i].name);
        const res = this.extrairTotal(texto);
        log('  → categoria: ' + categoria + ' | valor: ' + this.formatBRL(res.valor) + ' (' + res.metodo + ')');
        this.arquivosProcessados.push({ nome: files[i].name, categoria, valor: res.valor, metodo: res.metodo });
      }

      log('Pronto! Montando tabela…');
      this.renderResultado();
    } catch (err) {
      console.error(err);
      out.innerHTML = '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap">❌ Erro: ' +
        (err.message || err) + '\n\n' + (err.stack || '') + '</div>';
    }
  }

  async lerTextoPdf(file) {
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const partes = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      partes.push(tc.items.map(it => ('str' in it) ? it.str : '').join(' '));
    }

    return partes.join(' ').replace(/\s+/g, ' ');
  }

  detectarCategoria(texto, nome) {
    const t = (texto + ' ' + (nome || '')).toLowerCase();
    if (t.indexOf('unimed') !== -1) return 'saude';
    if (t.indexOf('odont') !== -1) return 'odonto';
    if (t.indexOf('sindic') !== -1) return 'sindicato';
    if (t.indexOf('colab') !== -1 || t.indexOf('wellhub') !== -1 || t.indexOf('gympass') !== -1) return 'colabmais';
    if (t.indexOf('aliment') !== -1 || t.indexOf('alelo') !== -1 || t.indexOf('ticket') !== -1) return 'va';
    return 'sindicato';
  }

  extrairTotal(texto) {
    const reNum = '([0-9]{1,3}(?:\\.[0-9]{3})*,[0-9]{2})';

    // Boleto - mais confiável
    const ehBoleto = /nosso n[uú]mero|linha digit|ficha de compensa|valor cobrado|c[oó]digo de barras/i.test(texto);
    if (ehBoleto) {
      const reLd = /\b\d\s+(\d{14})\b/g;
      let ld = null;
      let m;
      while ((m = reLd.exec(texto)) !== null) { ld = m[1]; }
      if (ld) {
        const cents = parseInt(ld.slice(-10), 10);
        if (cents > 0) return { valor: cents / 100, metodo: 'boleto (linha digitável)' };
      }
    }

    // "Total (=): VALOR"
    const reTotalIgual = new RegExp('total\\s*\\(\\s*=\\s*\\)\\s*:?\\s*' + reNum, 'gi');
    let ultimo = null;
    let m;
    while ((m = reTotalIgual.exec(texto)) !== null) { ultimo = m[1]; }
    if (ultimo) return { valor: this.parseBRL(ultimo), metodo: 'Total (=)' };

    // "Total: VALOR"
    const reTotal = new RegExp('total\\s*:?\\s*' + reNum, 'gi');
    let ult2 = null;
    while ((m = reTotal.exec(texto)) !== null) { ult2 = m[1]; }
    if (ult2) return { valor: this.parseBRL(ult2), metodo: 'Total' };

    // Maior valor
    const reAll = new RegExp(reNum, 'g');
    let maior = 0;
    while ((m = reAll.exec(texto)) !== null) {
      const n = this.parseBRL(m[1]);
      if (n > maior) maior = n;
    }

    return { valor: maior, metodo: maior ? 'maior valor (confira!)' : 'não encontrado' };
  }

  totaisPorCategoria() {
    const soma = {};
    this.arquivosProcessados.forEach(a => {
      soma[a.categoria] = (soma[a.categoria] || 0) + a.valor;
    });
    return soma;
  }

  renderResultado() {
    const out = document.getElementById('grh-beneficios-pdf-resultado');
    if (!this.arquivosProcessados.length) { out.innerHTML = ''; return; }

    const linhas = this.arquivosProcessados.map((a, idx) => {
      const alerta = a.metodo.indexOf('confira') !== -1 || a.metodo === 'não encontrado';
      return '<tr>' +
        '<td style="padding:6px 8px;font-size:12px">' + this.esc(a.nome) + '</td>' +
        '<td style="padding:6px 8px"><select id="sel-' + idx + '" style="font-size:12px;padding:4px 6px;border:1px solid #e2e8f0;border-radius:6px">' +
        this.CATEGORIAS.map(c => '<option value="' + c.key + '"' + (c.key === a.categoria ? ' selected' : '') + '>' + c.label + '</option>').join('') +
        '</select></td>' +
        '<td style="padding:6px 8px"><input id="val-' + idx + '" value="' + this.formatBRL(a.valor) + '" style="width:120px;font-size:12px;padding:4px 6px;border:1px solid ' + (alerta ? '#f59e0b' : '#e2e8f0') + ';border-radius:6px;text-align:right"/></td>' +
        '<td style="padding:6px 8px;font-size:10px;color:' + (alerta ? '#b45309' : '#94a3b8') + '">' + a.metodo + '</td>' +
        '</tr>';
    }).join('');

    out.innerHTML =
      '<div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:14px">' +
      '<table style="width:100%;border-collapse:collapse">' +
      '<thead><tr style="background:#f0f9ff">' +
      '<th style="padding:8px;text-align:left;font-size:11px;font-weight:600">Arquivo</th>' +
      '<th style="padding:8px;text-align:left;font-size:11px;font-weight:600">Categoria</th>' +
      '<th style="padding:8px;text-align:right;font-size:11px;font-weight:600">Valor</th>' +
      '<th style="padding:8px;text-align:left;font-size:11px;font-weight:600">Detecção</th>' +
      '</tr></thead><tbody>' + linhas + '</tbody>' +
      '</table>' +
      '</div>' +
      '<div style="background:#f0f9ff;border-radius:10px;padding:12px 14px">' +
      '<div style="font-size:12px;font-weight:700;color:#0c4a6e;margin-bottom:6px">TOTAIS QUE SERÃO APLICADOS</div>' +
      '<div id="grh-beneficios-pdf-totais"></div>' +
      '</div>';

    this.atualizarTotais();
    const btnAplicar = document.getElementById('grh-beneficios-pdf-aplicar');
    if (btnAplicar) btnAplicar.style.display = '';

    // Anexar listeners aos inputs
    this.arquivosProcessados.forEach((a, idx) => {
      const sel = document.getElementById('sel-' + idx);
      const val = document.getElementById('val-' + idx);

      if (sel) {
        const listener = (e) => {
          this.arquivosProcessados[idx].categoria = e.target.value;
          this.renderResultado();
        };
        sel.addEventListener('change', listener);
        this.listeners.push({ element: sel, event: 'change', handler: listener });
      }

      if (val) {
        const listener = (e) => {
          this.arquivosProcessados[idx].valor = this.parseBRL(e.target.value.replace(/[^0-9.,]/g, ''));
          this.atualizarTotais();
        };
        val.addEventListener('change', listener);
        this.listeners.push({ element: val, event: 'change', handler: listener });
      }
    });
  }

  atualizarTotais() {
    const soma = this.totaisPorCategoria();
    const el = document.getElementById('grh-beneficios-pdf-totais');
    if (!el) return;

    el.innerHTML = this.CATEGORIAS.filter(c => soma[c.key]).map(c => {
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #cbd5e1">' +
        '<span>' + c.label + '</span><strong>' + this.formatBRL(soma[c.key]) + '</strong></div>';
    }).join('');
  }

  async aplicarBeneficios() {
    console.log('[GRH-BENEFICIOS] Aplicando benefícios...');
    const soma = this.totaisPorCategoria();
    let aplicados = 0;

    this.CATEGORIAS.forEach(c => {
      if (!soma[c.key]) return;
      const input = document.getElementById(c.campo);
      if (input) {
        input.value = (soma[c.key]).toFixed(2);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        aplicados++;
      }
    });

    // Chamar função de cálculo se existir
    if (typeof window.remCalcCustosBeneficiosIMEX === 'function') {
      try {
        window.remCalcCustosBeneficiosIMEX();
      } catch (e) {
        console.warn('[GRH-BENEFICIOS] Erro ao calcular:', e);
      }
    }

    // Atualizar KPI
    this.atualizarKpiCustoBeneficios();

    // Salvar
    if (aplicados) {
      await this.salvarBeneficios(soma);
    }

    const out = document.getElementById('grh-beneficios-pdf-resultado');
    const aviso = document.createElement('div');
    if (aplicados) {
      aviso.style.cssText = 'color:#15803d;background:#dcfce7;padding:12px;border-radius:8px;font-size:13px;margin-top:12px';
      aviso.innerHTML = '<strong>✅ ' + aplicados + ' categoria(s) preenchida(s) e salva(s)!</strong> Fechando…';
      out.appendChild(aviso);
      setTimeout(() => this.fecharModalPdf(), 1500);
    } else {
      aviso.style.cssText = 'color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px;margin-top:12px';
      aviso.innerHTML = '<strong>⚠️ Não encontrei os campos de benefícios.</strong> Feche este modal e tente novamente.';
      out.appendChild(aviso);
    }
  }

  atualizarKpiCustoBeneficios() {
    const soma = this.totaisPorCategoria();
    let total = 0;
    Object.keys(soma).forEach(key => { total += soma[key]; });

    const cards = document.querySelectorAll('.rem-kpi2-corpo');
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const label = card.querySelector('.rem-kpi2-label');
      if (label && label.textContent.includes('Custo com Benefícios')) {
        const valor = card.querySelector('.rem-kpi2-valor');
        if (valor) valor.textContent = this.formatBRL(total);
        break;
      }
    }
  }

  async garantirPdfJs(log) {
    if (window.pdfjsLib && window.pdfjsLib.getDocument) { log('pdf.js já carregado ✓'); return; }

    const BASES = [
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/',
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/'
    ];

    for (let b = 0; b < BASES.length; b++) {
      try {
        log('Carregando pdf.js de: ' + BASES[b]);
        await this.loadScript(BASES[b] + 'pdf.min.js');
        if (window.pdfjsLib && window.pdfjsLib.getDocument) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = BASES[b] + 'pdf.worker.min.js';
          log('pdf.js carregado ✓');
          return;
        }
      } catch (e) {
        log('falhou: ' + (e.message || e));
      }
    }

    throw new Error('Não foi possível carregar o leitor de PDF (pdf.js)');
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async salvarBeneficios(dados) {
    const comp = this.obterCompetenciaAtual();
    const docId = 'beneficios_' + comp;
    const payload = { competencia: comp, dados, data: new Date().toISOString() };

    if (typeof window.db !== 'undefined' && window.db) {
      try {
        window.db.collection('grh_beneficios_totais').doc(docId).set(payload);
        console.log('[GRH-BENEFICIOS] ✅ Salvos no Firebase:', comp);
      } catch (e) {
        console.warn('[GRH-BENEFICIOS] Fallback localStorage:', e.message);
        localStorage.setItem('grh_beneficios_' + comp, JSON.stringify(payload));
      }
    } else {
      localStorage.setItem('grh_beneficios_' + comp, JSON.stringify(payload));
    }
  }

  async carregarDadosSalvos(comp) {
    const docId = 'beneficios_' + comp;

    if (typeof window.db !== 'undefined' && window.db) {
      try {
        return new Promise((resolve) => {
          window.db.collection('grh_beneficios_totais').doc(docId).get().then(doc => {
            if (doc.exists) {
              resolve(doc.data().dados);
            } else {
              const local = localStorage.getItem('grh_beneficios_' + comp);
              resolve(local ? JSON.parse(local).dados : null);
            }
          }).catch(() => {
            const local = localStorage.getItem('grh_beneficios_' + comp);
            resolve(local ? JSON.parse(local).dados : null);
          });
        });
      } catch (e) {
        const local = localStorage.getItem('grh_beneficios_' + comp);
        return local ? JSON.parse(local).dados : null;
      }
    } else {
      const local = localStorage.getItem('grh_beneficios_' + comp);
      return local ? JSON.parse(local).dados : null;
    }
  }

  fecharModalPdf() {
    this.pararVigiaTelaRemuneracao();
    const modal = document.getElementById('grh-modal-beneficios-pdf');
    if (modal) modal.style.display = 'none';
    this.carregarResumo();
  }

  garantirTelaRemuneracaoVisivel() {
    const paneRem = document.getElementById('grh-pane-remuneracao');
    if (!paneRem) return;

    let precisaCorrigir = getComputedStyle(paneRem).display === 'none';
    document.querySelectorAll('[id^="view-"]').forEach(v => {
      if (v.id !== 'view-gestao-rh' && getComputedStyle(v).display !== 'none') precisaCorrigir = true;
    });

    if (!precisaCorrigir) return;

    document.querySelectorAll('[id^="view-"]').forEach(v => {
      if (v.id === 'view-gestao-rh') return;
      v.classList.remove('active', 'dev-active', 'beneficios-force-active');
      v.style.setProperty('display', 'none', 'important');
    });

    const outerView = document.getElementById('view-gestao-rh');
    if (outerView) outerView.style.setProperty('display', 'block', 'important');

    document.querySelectorAll('#view-gestao-rh [id^="grh-pane-"]').forEach(p => {
      p.style.setProperty('display', (p === paneRem) ? 'block' : 'none', 'important');
    });
  }

  iniciarVigiaTelaRemuneracao() {
    if (this.vigiaTelaRemuneracao) return;
    this.vigiaTelaRemuneracao = setInterval(() => this.garantirTelaRemuneracaoVisivel(), 500);
  }

  pararVigiaTelaRemuneracao() {
    if (!this.vigiaTelaRemuneracao) return;
    clearInterval(this.vigiaTelaRemuneracao);
    this.vigiaTelaRemuneracao = null;
  }

  obterCompetenciaAtual() {
    const h = new Date();
    return h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0');
  }

  parseBRL(s) {
    if (!s) return 0;
    const n = parseFloat(String(s).replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  formatBRL(v) {
    return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  async cleanup() {
    console.log('[GRH-BENEFICIOS] Limpando pane benefícios...');

    // Remover listeners
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];

    // Parar vigia
    this.pararVigiaTelaRemuneracao();

    // Limpar state
    this.arquivosProcessados = [];

    // Limpar container
    if (this.container) this.container.innerHTML = '';

    console.log('[GRH-BENEFICIOS] ✓ Limpeza concluída');
  }
}

export const beneficiosPane = new BeneficiosPane();
