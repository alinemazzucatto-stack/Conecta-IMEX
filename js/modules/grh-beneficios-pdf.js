// ===== script: grh-beneficios-pdf-js =====
// Importa relatórios de benefícios em PDF e preenche os TOTAIS por categoria
// no painel "Custos dos Benefícios" (Remuneração). Não é por colaborador —
// pega apenas o valor total de cada relatório.
(function(){
  'use strict';
  if(window.__grhBeneficiosPdfInit) return;
  window.__grhBeneficiosPdfInit = true;

  function loadScript(src){
    return new Promise((resolve, reject) => {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // "12.263,95" -> 12263.95
  function parseBRL(s){
    if(!s) return 0;
    var n = parseFloat(String(s).replace(/\./g,'').replace(',','.'));
    return isNaN(n) ? 0 : n;
  }
  function fmtBRL(v){
    return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  }

  // Campos do painel de benefícios (arquivo 47) — precisa bater com os ids
  // reais gerados em render() (js/legacy/47-remuneracao-premium-v3.js):
  // rem-beneficio-va/saude/odonto/colabmais/sindicato. Não existe mais
  // Vale Refeição nem "Outros" genérico nesse painel — Wellhub/Gympass caiu
  // dentro de "Colab+".
  var CATEGORIAS = [
    { key:'va',        label:'Vale Alimentação',       campo:'rem-beneficio-va' },
    { key:'saude',     label:'Plano de Saúde (Unimed)', campo:'rem-beneficio-saude' },
    { key:'odonto',    label:'Plano Odontológico',      campo:'rem-beneficio-odonto' },
    { key:'colabmais', label:'Colab+',                  campo:'rem-beneficio-colabmais' },
    { key:'sindicato', label:'Cartão Sindicato',        campo:'rem-beneficio-sindicato' }
  ];

  function opcoesCategoria(sel){
    return CATEGORIAS.map(function(c){
      return '<option value="'+c.key+'"'+(c.key===sel?' selected':'')+'>'+c.label+'</option>';
    }).join('');
  }

  // Detecta a categoria pelo conteúdo do relatório + nome do arquivo
  function detectarCategoria(texto, nome){
    var t = (texto + ' ' + (nome||'')).toLowerCase();
    if(t.indexOf('unimed') !== -1) return 'saude';
    if(t.indexOf('odont') !== -1) return 'odonto';
    if(t.indexOf('sindic') !== -1) return 'sindicato';
    if(t.indexOf('colab') !== -1 || t.indexOf('wellhub') !== -1 || t.indexOf('gympass') !== -1) return 'colabmais';
    if(t.indexOf('aliment') !== -1 || t.indexOf('alelo') !== -1 || t.indexOf('ticket') !== -1 || t.indexOf('refei') !== -1) return 'va';
    return 'sindicato';
  }

  // Extrai o valor TOTAL do relatório. Estratégias em ordem de confiança.
  function extrairTotal(texto){
    var reNum = '([0-9]{1,3}(?:\\.[0-9]{3})*,[0-9]{2})';
    var m;

    // 0) BOLETO — o valor está codificado na linha digitável / código de barras
    // (últimos 10 dígitos = valor em centavos). É a fonte mais confiável.
    var ehBoleto = /nosso n[uú]mero|linha digit|ficha de compensa|valor cobrado|c[oó]digo de barras/i.test(texto);
    if(ehBoleto){
      // linha digitável: "<DV> <14 dígitos>" — pega a última ocorrência
      var reLd = /\b\d\s+(\d{14})\b/g, ld = null;
      while((m = reLd.exec(texto)) !== null){ ld = m[1]; }
      if(ld){
        var cents = parseInt(ld.slice(-10), 10);
        if(cents > 0) return { valor: cents/100, metodo: 'boleto (linha digitável)' };
      }
      // código de barras contíguo (44–48 dígitos)
      var reBc = /\d{44,48}/g, bc = null;
      while((m = reBc.exec(texto)) !== null){ bc = m[0]; }
      if(bc){
        var cents2 = parseInt(bc.slice(-10), 10);
        if(cents2 > 0) return { valor: cents2/100, metodo: 'boleto (código de barras)' };
      }
      // campo "Valor do Documento / Valor Cobrado / VALOR:" (número BR)
      var reVal = new RegExp('(?:valor do documento|valor cobrado|valor)\\D{0,25}?(\\d{1,3}(?:\\.\\d{3})*,\\d{2}|\\d+,\\d{2})', 'i');
      var vm = texto.match(reVal);
      if(vm) return { valor: parseBRL(vm[1]), metodo: 'boleto (campo Valor)' };
    }

    // 1) "Total (=): VALOR"  (pega a ÚLTIMA ocorrência)
    var reTotalIgual = new RegExp('total\\s*\\(\\s*=\\s*\\)\\s*:?\\s*' + reNum, 'gi');
    var m, ultimo = null;
    while((m = reTotalIgual.exec(texto)) !== null){ ultimo = m[1]; }
    if(ultimo) return { valor: parseBRL(ultimo), metodo: 'Total (=)' };

    // 2) Mensalidade (+) + Despesas (+)
    var mens = texto.match(new RegExp('mensalidade\\s*\\(\\s*\\+\\s*\\)\\s*:?\\s*' + reNum, 'i'));
    var desp = texto.match(new RegExp('despesas?\\s*\\(\\s*\\+\\s*\\)\\s*:?\\s*' + reNum, 'i'));
    if(mens){
      var v = parseBRL(mens[1]) + (desp ? parseBRL(desp[1]) : 0);
      return { valor: v, metodo: 'Mensalidade + Despesas' };
    }

    // 3) "Total: VALOR" (última ocorrência)
    var reTotal = new RegExp('total\\s*:?\\s*' + reNum, 'gi');
    var ult2 = null;
    while((m = reTotal.exec(texto)) !== null){ ult2 = m[1]; }
    if(ult2) return { valor: parseBRL(ult2), metodo: 'Total' };

    // 4) Maior valor monetário da página
    var reAll = new RegExp(reNum, 'g'), maior = 0;
    while((m = reAll.exec(texto)) !== null){
      var n = parseBRL(m[1]); if(n > maior) maior = n;
    }
    return { valor: maior, metodo: maior ? 'maior valor (confira!)' : 'não encontrado' };
  }

  async function lerTextoPdf(file){
    var buf = await file.arrayBuffer();
    var pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    var partes = [];
    for(var i=1; i<=pdf.numPages; i++){
      var page = await pdf.getPage(i);
      var tc = await page.getTextContent();
      partes.push(tc.items.map(function(it){ return ('str' in it) ? it.str : ''; }).join(' '));
    }
    // normaliza espaços múltiplos
    return partes.join(' ').replace(/\s+/g, ' ');
  }

  var arquivosProcessados = []; // {nome, categoria, valor, metodo}

  window.grhFecharBeneficiosPdf = function(){
    pararVigiaTelaRemuneracao();
    var modal = document.getElementById('grh-modal-beneficios-pdf');
    if(modal) modal.remove();
    var viewBen = document.getElementById('view-beneficios');
    if(viewBen){
      viewBen.style.removeProperty('display');
      viewBen.classList.remove('beneficios-force-active');
    }
    var paneRem = document.getElementById('grh-pane-remuneracao');
    if(paneRem) paneRem.style.setProperty('display', 'block', 'important');
  };

  function criarModal(){
    if(document.getElementById('grh-modal-beneficios-pdf')) return;
    var div = document.createElement('div');
    div.id = 'grh-modal-beneficios-pdf';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:6500;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;overflow-y:auto;padding:20px';
    div.addEventListener('click', function(e){ e.stopPropagation(); }, true);
    div.innerHTML =
      '<div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:760px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">' +
          '<h3 style="font-size:18px;font-weight:700;margin:0">🧾 Importar Benefícios por PDF</h3>' +
          '<button type="button" onclick="grhFecharBeneficiosPdf()" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--ink-60)">✕</button>' +
        '</div>' +
        '<p style="font-size:13px;color:var(--ink-60);margin:0 0 16px;line-height:1.5">Envie os relatórios em <strong>PDF</strong> (pode selecionar vários de uma vez — ex.: as 3 Unimeds). O sistema lê o <strong>total</strong> de cada um, agrupa por categoria e preenche o painel de custos. Confira os valores antes de aplicar.</p>' +
        '<label for="grh-beneficios-pdf-input" style="display:block;border:2px dashed var(--border);border-radius:12px;padding:36px;text-align:center;cursor:pointer;background:var(--bg-light)">' +
          '<div style="font-size:32px;margin-bottom:8px">📄</div>' +
          '<p style="font-weight:600;margin:0 0 4px">Clique ou arraste os PDFs</p>' +
          '<p style="font-size:12px;color:var(--ink-60);margin:0">Unimed, Vale Alimentação, Odontológico, Colab+, Sindicato…</p>' +
        '</label>' +
        '<input id="grh-beneficios-pdf-input" type="file" accept=".pdf" multiple style="display:none" onchange="grhBeneficiosPdfProcessar(this.files)"/>' +
        '<div id="grh-beneficios-pdf-resultado" style="margin-top:16px"></div>' +
        '<div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">' +
          '<button type="button" class="btn btn-g" onclick="grhFecharBeneficiosPdf()">Fechar</button>' +
          '<button type="button" id="grh-beneficios-pdf-aplicar" class="btn btn-p" style="display:none" onclick="grhBeneficiosPdfAplicar()">✅ Aplicar aos campos</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(div);
  }

  // O modal cobre a tela com um fundo semi-transparente — se o painel de
  // Remuneração não estiver realmente ativo por trás dele (ex.: a tela
  // "Meus Benefícios" do colaborador é forçada visível por 37/beneficios.js
  // com display:...!important em algum clique/observador daquele módulo),
  // reexibe ele. Só alterna display (sem chamar grhTab/aplicar): isso evita
  // um recarregamento completo de ~4-5s do painel, que pareceria o sistema
  // "travando" bem no meio do fluxo de importar/aplicar benefícios.
  // Precisa usar !important e desativar as OUTRAS telas explicitamente,
  // porque alguns módulos (ex.: js/modules/beneficios.js) forçam
  // #view-beneficios visível com !important — um display normal não vence
  // isso, as duas telas ficavam sobrepostas.
  function garantirTelaRemuneracaoVisivel(){
    var paneRem = document.getElementById('grh-pane-remuneracao');
    if (!paneRem) return;
    var precisaCorrigir = getComputedStyle(paneRem).display === 'none';
    document.querySelectorAll('[id^="view-"]').forEach(function(v){
      if (v.id !== 'view-gestao-rh' && getComputedStyle(v).display !== 'none') precisaCorrigir = true;
    });
    if (!precisaCorrigir) return;
    document.querySelectorAll('[id^="view-"]').forEach(function(v){
      if (v.id === 'view-gestao-rh') return;
      v.classList.remove('active', 'dev-active', 'beneficios-force-active');
      v.style.setProperty('display', 'none', 'important');
    });
    var outerView = document.getElementById('view-gestao-rh');
    if (outerView) outerView.style.setProperty('display', 'block', 'important');
    document.querySelectorAll('#view-gestao-rh [id^="grh-pane-"]').forEach(function(p){
      p.style.setProperty('display', (p === paneRem) ? 'block' : 'none', 'important');
    });
  }

  var vigiaTelaRemuneracao = null;
  function iniciarVigiaTelaRemuneracao(){
    if (vigiaTelaRemuneracao) return;
    vigiaTelaRemuneracao = setInterval(garantirTelaRemuneracaoVisivel, 500);
  }
  function pararVigiaTelaRemuneracao(){
    if (!vigiaTelaRemuneracao) return;
    clearInterval(vigiaTelaRemuneracao);
    vigiaTelaRemuneracao = null;
  }
  // Fecha o vigia sempre que o modal for escondido, não importa por qual
  // botão (Fechar, X ou outro código que mude o display diretamente).
  var vigiaModalObserver = null;
  function observarFechamentoModal(){
    if (vigiaModalObserver) return;
    var modal = document.getElementById('grh-modal-beneficios-pdf');
    if (!modal) return;
    vigiaModalObserver = new MutationObserver(function(){
      if (getComputedStyle(modal).display === 'none'){
        pararVigiaTelaRemuneracao();
        var viewBen = document.getElementById('view-beneficios');
        if(viewBen){
          viewBen.style.removeProperty('display');
          viewBen.classList.remove('beneficios-force-active');
        }
      }
    });
    vigiaModalObserver.observe(modal, { attributes: true, attributeFilter: ['style'] });
  }

  window.grhAbrirBeneficiosPdf = function(){
    garantirTelaRemuneracaoVisivel();
    criarModal();
    observarFechamentoModal();
    iniciarVigiaTelaRemuneracao();
    arquivosProcessados = [];
    document.getElementById('grh-beneficios-pdf-resultado').innerHTML = '';
    document.getElementById('grh-beneficios-pdf-aplicar').style.display = 'none';
    var viewBen = document.getElementById('view-beneficios');
    if(viewBen){
      viewBen.classList.remove('beneficios-force-active');
      viewBen.style.setProperty('display', 'none', 'important');
    }
    document.getElementById('grh-modal-beneficios-pdf').style.display = 'flex';
  };

  var PDFJS_BASES = [
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/',
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/'
  ];

  async function garantirPdfJs(log){
    if(window.pdfjsLib && window.pdfjsLib.getDocument) { log('pdf.js já carregado ✓'); return; }
    var ultimoErro = null;
    for(var b=0; b<PDFJS_BASES.length; b++){
      try{
        log('Carregando pdf.js de: ' + PDFJS_BASES[b]);
        await loadScript(PDFJS_BASES[b] + 'pdf.min.js');
        if(window.pdfjsLib && window.pdfjsLib.getDocument){
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASES[b] + 'pdf.worker.min.js';
          log('pdf.js carregado ✓');
          return;
        }
        log('script carregou mas window.pdfjsLib não apareceu, tentando próximo…');
      }catch(e){ ultimoErro = e; log('falhou: ' + (e.message||e)); }
    }
    throw new Error('Não foi possível carregar o leitor de PDF (pdf.js). ' + (ultimoErro ? ultimoErro.message : ''));
  }

  window.grhBeneficiosPdfProcessar = async function(files){
    if(!files || !files.length) return;
    var out = document.getElementById('grh-beneficios-pdf-resultado');
    var logs = [];
    function log(msg){
      logs.push(msg);
      out.innerHTML = '<div style="font-size:11px;color:var(--ink-60);font-family:monospace;background:var(--bg-light);padding:10px;border-radius:8px;white-space:pre-wrap;max-height:200px;overflow:auto">' +
        logs.map(function(l){ return '• ' + l; }).join('\n') + '</div>';
    }

    try{
      log(files.length + ' arquivo(s) selecionado(s).');
      await garantirPdfJs(log);

      for(var i=0; i<files.length; i++){
        log('Lendo ' + (i+1) + '/' + files.length + ': ' + files[i].name);
        var texto = await lerTextoPdf(files[i]);
        log('  → ' + texto.length + ' caracteres extraídos');
        var categoria = detectarCategoria(texto, files[i].name);
        var res = extrairTotal(texto);
        log('  → categoria: ' + categoria + ' | valor: ' + fmtBRL(res.valor) + ' (' + res.metodo + ')');
        arquivosProcessados.push({ nome: files[i].name, categoria: categoria, valor: res.valor, metodo: res.metodo });
      }

      log('Pronto! Montando tabela…');
      renderResultado();
    }catch(err){
      console.error(err);
      out.innerHTML = '<div style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap">❌ Erro: ' + (err.message||err) + '\n\n' + (err.stack||'') + '</div>';
    }
  };

  window.grhBeneficiosPdfSetCategoria = function(idx, val){
    if(arquivosProcessados[idx]) arquivosProcessados[idx].categoria = val;
    renderResultado();
  };
  window.grhBeneficiosPdfSetValor = function(idx, val){
    if(arquivosProcessados[idx]) arquivosProcessados[idx].valor = parseBRL(val.replace(/[^0-9.,]/g,''));
    // não re-renderiza pra não perder o foco do input; recalcula só os totais
    atualizarTotais();
  };

  function totaisPorCategoria(){
    var soma = {};
    arquivosProcessados.forEach(function(a){ soma[a.categoria] = (soma[a.categoria]||0) + a.valor; });
    return soma;
  }

  function atualizarTotais(){
    var soma = totaisPorCategoria();
    var el = document.getElementById('grh-beneficios-pdf-totais');
    if(!el) return;
    el.innerHTML = CATEGORIAS.filter(function(c){ return soma[c.key]; }).map(function(c){
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)"><span>'+c.label+'</span><strong>'+fmtBRL(soma[c.key])+'</strong></div>';
    }).join('');
  }

  function renderResultado(){
    var out = document.getElementById('grh-beneficios-pdf-resultado');
    if(!arquivosProcessados.length){ out.innerHTML = ''; return; }

    var linhas = arquivosProcessados.map(function(a, idx){
      var alerta = a.metodo.indexOf('confira') !== -1 || a.metodo === 'não encontrado';
      return '<tr>' +
        '<td style="padding:6px 8px;font-size:12px">'+a.nome+'</td>' +
        '<td style="padding:6px 8px"><select onchange="grhBeneficiosPdfSetCategoria('+idx+',this.value)" style="font-size:12px;padding:4px 6px;border:1px solid var(--border);border-radius:6px">'+opcoesCategoria(a.categoria)+'</select></td>' +
        '<td style="padding:6px 8px"><input value="'+fmtBRL(a.valor)+'" onchange="grhBeneficiosPdfSetValor('+idx+',this.value)" style="width:120px;font-size:12px;padding:4px 6px;border:1px solid '+(alerta?'#f59e0b':'var(--border)')+';border-radius:6px;text-align:right"/></td>' +
        '<td style="padding:6px 8px;font-size:10px;color:'+(alerta?'#b45309':'var(--ink-30)')+'">'+a.metodo+'</td>' +
      '</tr>';
    }).join('');

    out.innerHTML =
      '<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:14px">' +
        '<table style="width:100%;border-collapse:collapse">' +
          '<thead><tr style="background:var(--bg-light)">' +
            '<th style="padding:8px;text-align:left;font-size:11px">Arquivo</th>' +
            '<th style="padding:8px;text-align:left;font-size:11px">Categoria</th>' +
            '<th style="padding:8px;text-align:right;font-size:11px">Valor</th>' +
            '<th style="padding:8px;text-align:left;font-size:11px">Detecção</th>' +
          '</tr></thead><tbody>'+linhas+'</tbody>' +
        '</table>' +
      '</div>' +
      '<div style="background:var(--bg-light);border-radius:10px;padding:12px 14px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--ink-60);margin-bottom:6px">TOTAIS QUE SERÃO APLICADOS</div>' +
        '<div id="grh-beneficios-pdf-totais"></div>' +
      '</div>';

    atualizarTotais();
    document.getElementById('grh-beneficios-pdf-aplicar').style.display = '';
  }

  window.grhBeneficiosPdfAplicar = function(){
    var soma = totaisPorCategoria();
    var aplicados = 0;

    CATEGORIAS.forEach(function(c){
      if(!soma[c.key]) return;
      var input = document.getElementById(c.campo);
      if(input){
        input.value = (soma[c.key]).toFixed(2);
        input.dispatchEvent(new Event('input', { bubbles:true }));
        aplicados++;
      }
    });

    if(typeof window.remCalcCustosBeneficiosIMEX === 'function'){
      try{ window.remCalcCustosBeneficiosIMEX(); }catch(e){}
    }

    var out = document.getElementById('grh-beneficios-pdf-resultado');
    var aviso = document.createElement('div');
    if(aplicados){
      aviso.style.cssText = 'color:#15803d;background:#dcfce7;padding:12px;border-radius:8px;font-size:13px;margin-top:12px';
      aviso.innerHTML = '<strong>✅ '+aplicados+' categoria(s) preenchida(s) no painel!</strong> Fechando…';
      out.appendChild(aviso);
      if(typeof addNotif === 'function') addNotif('Benefícios importados do PDF e aplicados ao painel.', 'success');
      setTimeout(function(){ grhFecharBeneficiosPdf(); }, 1500);
    } else {
      aviso.style.cssText = 'color:#b91c1c;background:#fee2e2;padding:12px;border-radius:8px;font-size:13px;margin-top:12px';
      aviso.innerHTML = '<strong>⚠️ Não encontrei os campos de benefícios na tela.</strong> Feche este modal, abra o painel de Remuneração e tente novamente.';
      out.appendChild(aviso);
    }
  };
})();
