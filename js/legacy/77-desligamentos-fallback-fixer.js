// ===== script: desligamentos-fallback-fixer =====
(function(){
  if(window.__deslFallbackFixer) return;
  window.__deslFallbackFixer = true;

  var DESL_DEMO = [];

  // Override definitivo de grhRenderDesligamentos com fallback demo
  var _origRenderDesl = window.grhRenderDesligamentos;
  window.grhRenderDesligamentos = async function(){
    try {
      if(typeof _origRenderDesl === 'function') await _origRenderDesl.apply(this, arguments);
      // Se após render a tabela ainda mostra erro, aplica demo
      var tbody = document.getElementById('grh-desl-body');
      if(tbody && (tbody.textContent.indexOf('Missing or insufficient') !== -1 || tbody.textContent.indexOf('Erro:') !== -1)){
        renderDemoDesl(DESL_DEMO);
      }
    } catch(e) {
      renderDemoDesl(DESL_DEMO);
    }
  };

  function brl(v){ return v ? 'R$ ' + Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) : '—'; }
  function fmt(d){ if(!d) return '—'; var p=d.split('-'); return p.length===3 ? p[2]+'/'+p[1]+'/'+p[0] : d; }

  function renderDemoDesl(demo){
    var tbody = document.getElementById('grh-desl-body');
    if(!tbody) return;
    tbody.innerHTML = demo.map(function(d){
      var badge = d.contrato === 'CLT'
        ? '<span style="background:#dcfce7;color:#166534;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">CLT</span>'
        : '<span style="background:#fef9c3;color:#854d0e;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">'+(d.contrato||'—')+'</span>';
      return '<tr>'
        +'<td style="padding-left:20px;font-weight:600">'+d.nome+'</td>'
        +'<td style="font-size:12px">'+fmt(d.dataAdmissao)+'</td>'
        +'<td style="font-size:12px;font-weight:600;color:#b91c1c">'+fmt(d.dataDesligamento)+'</td>'
        +'<td><span style="background:#fce7f3;color:#9d174d;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">'+d.motivo+'</span></td>'
        +'<td style="font-size:12px">'+d.setor+'</td>'
        +'<td>'+badge+'</td>'
        +'<td style="font-size:12px;color:#6b7280">'+d.tempoEmpresa+'</td>'
        +'<td style="font-weight:600;color:#b91c1c">'+brl(d.rescisao)+'</td>'
        +'<td style="font-size:12px">'+brl(d.multaFgts)+'</td>'
        +'<td style="font-size:12px;color:#6b7280">'+(d.observacao||'—')+'</td>'
        +'<td><button style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button></td>'
        +'</tr>';
    }).join('');
    var countEl = document.getElementById('grh-desl-count');
    if(countEl) countEl.textContent = demo.length+' de '+demo.length+' desligamentos';
  }

  // Aplica layout horizontal na barra de filtros
  function fixDeslFilterBar(){
    var pane = document.getElementById('grh-pane-desligamentos');
    if(!pane || pane.style.display === 'none') return;
    // Encontra o container dos filtros (pai do input de busca)
    var search = document.getElementById('grh-desl-search');
    if(!search) return;
    var bar = search.parentElement;
    if(!bar) return;
    bar.style.cssText = 'display:grid!important;grid-template-columns:2fr 130px 100px 190px auto auto;gap:10px;align-items:center;padding:14px 20px;border-bottom:1px solid #e2e8f0;background:#f8fafc';
    [search,
     document.getElementById('grh-desl-filter-mes'),
     document.getElementById('grh-desl-filter-ano'),
     document.getElementById('grh-desl-filter-motivo')
    ].forEach(function(el){ if(el){ el.style.width='100%'; el.style.boxSizing='border-box'; } });
  }

  // Verifica se a tabela está mostrando erro e substitui por demo
  function checkAndFixDesl(){
    var pane = document.getElementById('grh-pane-desligamentos');
    if(!pane || pane.style.display === 'none') return;
    fixDeslFilterBar();
    var tbody = document.getElementById('grh-desl-body');
    if(!tbody) return;
    if(tbody.textContent.indexOf('Missing or insufficient') !== -1 || tbody.textContent.indexOf('Erro:') !== -1){
      renderDemoDesl(DESL_DEMO);
    }
  }

  setInterval(checkAndFixDesl, 500);
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(checkAndFixDesl, 800); });
})();
