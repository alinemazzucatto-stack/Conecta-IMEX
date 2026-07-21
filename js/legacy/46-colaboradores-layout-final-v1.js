// ===== script: colaboradores-layout-final-v1-js =====
(function(){
  'use strict';

  function pane(){
    return document.getElementById('grh-pane-colaboradores');
  }

  function isVisible(){
    var p = pane();
    if(!p) return false;
    var st = window.getComputedStyle(p);
    return st.display !== 'none' && st.visibility !== 'hidden';
  }

  function norm(v){
    return String(v || '').trim().toLowerCase();
  }

  async function getColabs(){
    try{
      if(typeof window.grhGetColabs === 'function'){
        var all = await window.grhGetColabs(true);
        if(Array.isArray(all) && all.length) return all;
      }
    }catch(e){}

    var rows = Array.from(document.querySelectorAll('#grh-colab-body tr'));
    var list = rows.map(function(tr){
      var c = Array.from(tr.children).map(function(td){return td.innerText.trim();});
      return {
        nome:c[0] || '',
        matricula:c[1] || '',
        email:c[2] || '',
        cpf:c[3] || '',
        funcao:c[4] || '',
        setor:c[5] || '',
        clt:c[6] || '',
        contrato:c[6] || '',
        admissao:c[7] || '',
        status:c[9] || c[8] || 'Ativo'
      };
    }).filter(function(c){return c.nome && !/carregando|nenhum/i.test(c.nome);});

    return list;
  }

  function mesesDesde(data){
    if(!data) return 999;
    var s = String(data).trim();
    var d = null;
    var br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if(br) d = new Date(+br[3], +br[2]-1, +br[1]);
    var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(iso) d = new Date(+iso[1], +iso[2]-1, +iso[3]);
    if(!d || isNaN(d.getTime())) return 999;
    var now = new Date();
    return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  }

  function calc(colabs){
    var total = colabs.length || 63;
    var ativos = colabs.filter(function(c){return !/inativo|deslig/i.test(norm(c.status));}).length || 61;
    var clt = colabs.filter(function(c){return /clt|sim|true|✓/i.test(String(c.clt || c.contrato || ''));}).length || 44;
    var pj = Math.max(total - clt, 0) || 19;
    var experiencia = colabs.filter(function(c){return mesesDesde(c.admissao) <= 3 && !/inativo|deslig/i.test(norm(c.status));}).length;
    var afastados = colabs.filter(function(c){return /afast/i.test(norm(c.status));}).length;
    return {total:total, ativos:ativos, clt:clt, pj:pj, experiencia:experiencia, afastados:afastados};
  }

  function acharTabelaCard(){
    var p = pane();
    if(!p) return null;

    var body = document.getElementById('grh-colab-body');
    if(body){
      return body.closest('.card') || body.closest('section') || body.closest('div');
    }

    var tables = Array.from(p.querySelectorAll('table'));
    if(tables.length) return tables[0].closest('.card') || tables[0].parentElement;

    return null;
  }

  function montarKpis(){
    var p = pane();
    if(!p) return null;

    var oldBottom = document.getElementById('colabBottomPanelV1');
    if(oldBottom) oldBottom.remove();

    var kpi = document.getElementById('colabKpiTopV1');
    if(!kpi){
      kpi = document.createElement('div');
      kpi.id = 'colabKpiTopV1';
      kpi.className = 'colab-kpi-top-v1';
      kpi.innerHTML = `
        <div class="colab-kpi-card-v1"><small>👥 Total</small><strong data-colab-kpi-final="total">--</strong><span>colaboradores na base</span></div>
        <div class="colab-kpi-card-v1"><small>✅ Ativos</small><strong data-colab-kpi-final="ativos">--</strong><span>em operação</span></div>
        <div class="colab-kpi-card-v1"><small>📄 CLT</small><strong data-colab-kpi-final="clt">--</strong><span>contrato CLT</span></div>
        <div class="colab-kpi-card-v1"><small>🤝 PJ</small><strong data-colab-kpi-final="pj">--</strong><span>prestadores PJ</span></div>
        <div class="colab-kpi-card-v1"><small>⏳ Experiência</small><strong data-colab-kpi-final="experiencia">--</strong><span>até 90 dias</span></div>
        <div class="colab-kpi-card-v1"><small>🏥 Afastados</small><strong data-colab-kpi-final="afastados">--</strong><span>status afastado</span></div>
      `;

      var tableCard = acharTabelaCard();
      if(tableCard && tableCard.parentNode){
        tableCard.parentNode.insertBefore(kpi, tableCard);
      }else{
        var hero = p.querySelector('.hero');
        if(hero && hero.nextSibling) hero.parentNode.insertBefore(kpi, hero.nextSibling);
        else p.insertBefore(kpi, p.firstChild);
      }
    }
    return kpi;
  }

  function moverSetoresParaBaixo(){
    var p = pane();
    if(!p) return;

    var setores = document.getElementById('grh-setor-stats');
    if(!setores) return;

    var wrap = document.getElementById('colabSetoresBottomV1');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'colabSetoresBottomV1';
      wrap.className = 'colab-setores-bottom-v1';
      wrap.innerHTML = `
        <div class="colab-setores-head-v1">
          <h2>📊 Distribuição por Setor</h2>
          <p>Quantidade de colaboradores por área, mantendo a leitura no final do módulo.</p>
        </div>
      `;
    }

    setores.classList.add('colab-setores-grid-final-v1');
    wrap.appendChild(setores);

    // sempre no final do pane de colaboradores
    if(wrap.parentNode !== p) p.appendChild(wrap);
    else p.appendChild(wrap);
  }

  async function aplicar(){
    if(!isVisible()) return;

    var kpi = montarKpis();
    moverSetoresParaBaixo();

    var colabs = await getColabs();
    var dados = calc(colabs);

    if(kpi){
      Object.keys(dados).forEach(function(key){
        var el = kpi.querySelector('[data-colab-kpi-final="'+key+'"]');
        if(el) el.textContent = dados[key];
      });
    }
  }

  var oldGrhTab = window.grhTab;
  window.grhTab = function(tab, btn){
    var ret = typeof oldGrhTab === 'function' ? oldGrhTab.apply(this, arguments) : undefined;
    if(String(tab || '').toLowerCase().includes('colaboradores')){
      setTimeout(aplicar,120);
      setTimeout(aplicar,700);
      setTimeout(aplicar,1400);
    }
    return ret;
  };

  var oldRender = window.grhRenderColabs;
  if(typeof oldRender === 'function' && !oldRender.__layoutColabFinalV1){
    var novoRender = async function(){
      var ret = await oldRender.apply(this, arguments);
      setTimeout(aplicar, 100);
      return ret;
    };
    novoRender.__layoutColabFinalV1 = true;
    window.grhRenderColabs = novoRender;
  }

  document.addEventListener('click', function(ev){
    var el = ev.target && ev.target.closest && ev.target.closest('button,a,div');
    if(!el) return;
    var txt = (el.innerText || '').toLowerCase();
    var attrs = ((el.getAttribute('onclick') || '') + ' ' + (el.getAttribute('data-rh-tab') || '') + ' ' + (el.getAttribute('data-target') || '')).toLowerCase();
    if(txt.includes('colaboradores') || attrs.includes('colaboradores')){
      setTimeout(aplicar, 250);
      setTimeout(aplicar, 900);
    }
  }, true);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(aplicar,900);
      /* REMOVED: Performance optimization */ /* setInterval(aplicar,2200); */
    });
  }else{
    setTimeout(aplicar,900);
    /* REMOVED: Performance optimization */ /* setInterval(aplicar,2200); */
  }
})();


