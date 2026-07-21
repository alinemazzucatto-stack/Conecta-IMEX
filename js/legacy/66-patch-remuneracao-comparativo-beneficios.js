// ===== script: patch-remuneracao-comparativo-beneficios =====
(function(){
  if(window.__remComparativoBeneficiosInit) return;
  window.__remComparativoBeneficiosInit = true;

  function money(v){ return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

  function competenciaAtual(){
    var h = new Date();
    return h.getFullYear() + '-' + String(h.getMonth()+1).padStart(2,'0');
  }

  function competenciaAnterior(comp){
    var parts = comp.split('-');
    var ano = parseInt(parts[0]);
    var mes = parseInt(parts[1]);
    mes--;
    if(mes < 1){
      mes = 12;
      ano--;
    }
    return ano + '-' + String(mes).padStart(2,'0');
  }

  window.carregarComparativoBeneficios = async function(){
    var comp = competenciaAtual();
    var compAnterior = competenciaAnterior(comp);

    var beneficiosAtual = 0;
    var beneficiosAnterior = 0;

    if(typeof window.db !== 'undefined' && window.db){
      try{
        var docAtual = await window.db.collection('grh_beneficios_totais').doc('beneficios_' + comp).get();
        if(docAtual.exists){
          var dados = docAtual.data().dados || {};
          Object.keys(dados).forEach(function(key){
            beneficiosAtual += dados[key];
          });
        }
      }catch(e){ console.warn('Erro ao carregar benefícios atual:', e.message); }

      try{
        var docAnterior = await window.db.collection('grh_beneficios_totais').doc('beneficios_' + compAnterior).get();
        if(docAnterior.exists){
          var dados = docAnterior.data().dados || {};
          Object.keys(dados).forEach(function(key){
            beneficiosAnterior += dados[key];
          });
        }
      }catch(e){ console.warn('Erro ao carregar benefícios anterior:', e.message); }
    } else {
      var localAtual = localStorage.getItem('grh_beneficios_' + comp);
      if(localAtual){
        var payload = JSON.parse(localAtual);
        Object.keys(payload.dados).forEach(function(key){
          beneficiosAtual += payload.dados[key];
        });
      }

      var localAnterior = localStorage.getItem('grh_beneficios_' + compAnterior);
      if(localAnterior){
        var payload = JSON.parse(localAnterior);
        Object.keys(payload.dados).forEach(function(key){
          beneficiosAnterior += payload.dados[key];
        });
      }
    }

    return {
      atual: beneficiosAtual,
      anterior: beneficiosAnterior,
      competenciaAtual: comp,
      competenciaAnterior: compAnterior
    };
  };

  window.renderComparativoBeneficios = async function(){
    var dados = await window.carregarComparativoBeneficios();
    var atual = dados.atual || 0;
    var anterior = dados.anterior || 0;
    var variacao = atual - anterior;
    var perc = anterior ? ((variacao/anterior)*100) : 0;
    var max = Math.max(atual, anterior, 1);

    return `
      <div class="rem-compare-card">
        <h3>🎁 Comparativo Benefícios Atual x Anterior</h3>
        <p>Variação dos custos totais de benefícios entre o mês atual e anterior.</p>
        <div class="rem-compare-kpis">
          <div class="rem-compare-kpi"><small>Benefícios Atual</small><strong>${money(atual)}</strong><span>${dados.competenciaAtual}</span></div>
          <div class="rem-compare-kpi"><small>Benefícios Anterior</small><strong>${money(anterior)}</strong><span>${dados.competenciaAnterior}</span></div>
          <div class="rem-compare-kpi"><small>Variação</small><strong style="color:${variacao>=0?'#dc2626':'#16a34a'}">${variacao>=0?'+':''}${money(variacao)}</strong><span>${variacao>=0?'+':''}${perc.toFixed(1)}%</span></div>
        </div>
        <div class="rem-folha-bars">
          <div class="rem-folha-col"><div class="rem-folha-bar anterior" style="height:${Math.max(24,Math.round(anterior/max*130))}px"></div><div class="rem-folha-label">Anterior<br>${money(anterior)}</div></div>
          <div class="rem-folha-col"><div class="rem-folha-bar" style="height:${Math.max(24,Math.round(atual/max*130))}px"></div><div class="rem-folha-label">Atual<br>${money(atual)}</div></div>
        </div>
      </div>
    `;
  };
})();



