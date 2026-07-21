// ===== script: grh-beneficios-historico =====
(function(){
  'use strict';
  if(window.__grhBeneficiosHistoricoInit) return;
  window.__grhBeneficiosHistoricoInit = true;

  function money(v){ return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  function fmtBRL(v){ return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

  function criarModalHistorico(){
    if(document.getElementById('grh-modal-historico-beneficios')) return;
    var div = document.createElement('div');
    div.id = 'grh-modal-historico-beneficios';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:6500;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;overflow-y:auto;padding:20px';
    div.innerHTML =
      '<div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:900px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.2)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">' +
          '<h3 style="font-size:18px;font-weight:700;margin:0">📅 Histórico de Benefícios por Mês</h3>' +
          '<button type="button" onclick="grhFecharHistoricoBeneficios()" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--ink-60)">✕</button>' +
        '</div>' +
        '<p style="font-size:13px;color:var(--ink-60);margin:0 0 16px;line-height:1.5">Visualize, edite ou exporte o histórico de benefícios importados por mês.</p>' +
        '<div id="grh-historico-conteudo" style="min-height:200px"></div>' +
        '<div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">' +
          '<button type="button" class="btn btn-g" onclick="grhFecharHistoricoBeneficios()">Fechar</button>' +
          '<button type="button" class="btn btn-p" onclick="grhExportarHistoricoBeneficios()">📥 Exportar Excel</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(div);
  }

  window.grhAbrirHistoricoBeneficios = async function(){
    criarModalHistorico();
    var modal = document.getElementById('grh-modal-historico-beneficios');
    modal.style.display = 'flex';
    await carregarHistorico();
  };

  window.grhFecharHistoricoBeneficios = function(){
    var modal = document.getElementById('grh-modal-historico-beneficios');
    if(modal) modal.style.display = 'none';
  };

  async function carregarHistorico(){
    var conteudo = document.getElementById('grh-historico-conteudo');
    conteudo.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-60)">⏳ Carregando histórico…</div>';

    var historico = [];

    if(typeof window.db !== 'undefined' && window.db){
      try{
        var snapshot = await window.db.collection('grh_beneficios_totais').get();
        snapshot.forEach(function(doc){
          var dados = doc.data();
          historico.push({
            id: doc.id,
            competencia: dados.competencia,
            dados: dados.dados,
            data: dados.data,
            origem: 'firebase'
          });
        });
      }catch(e){
        console.warn('Erro ao carregar do Firebase:', e.message);
      }
    }

    if(historico.length === 0){
      var keys = Object.keys(localStorage);
      keys.forEach(function(key){
        if(key.startsWith('grh_beneficios_')){
          try{
            var payload = JSON.parse(localStorage.getItem(key));
            historico.push({
              id: key,
              competencia: payload.competencia,
              dados: payload.dados,
              data: payload.data,
              origem: 'localStorage'
            });
          }catch(e){}
        }
      });
    }

    historico.sort(function(a, b){
      return b.competencia.localeCompare(a.competencia);
    });

    if(historico.length === 0){
      conteudo.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-60)">Nenhum histórico de benefícios encontrado.</div>';
      return;
    }

    var html = '<table style="width:100%;border-collapse:collapse">';
    html += '<thead><tr style="background:var(--bg-light)">';
    html += '<th style="padding:12px;text-align:left;font-size:12px;font-weight:600">Competência</th>';
    html += '<th style="padding:12px;text-align:right;font-size:12px;font-weight:600">Total</th>';
    html += '<th style="padding:12px;text-align:left;font-size:12px;font-weight:600">Data Importação</th>';
    html += '<th style="padding:12px;text-align:center;font-size:12px;font-weight:600">Ações</th>';
    html += '</tr></thead><tbody>';

    historico.forEach(function(item, idx){
      var total = 0;
      Object.keys(item.dados).forEach(function(key){
        total += item.dados[key];
      });
      var data = item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '—';
      html += '<tr style="border-bottom:1px solid var(--border)">';
      html += '<td style="padding:12px;font-size:13px"><strong>' + item.competencia + '</strong></td>';
      html += '<td style="padding:12px;font-size:13px;text-align:right">' + fmtBRL(total) + '</td>';
      html += '<td style="padding:12px;font-size:13px">' + data + '</td>';
      html += '<td style="padding:12px;text-align:center">';
      html += '<button class="btn btn-sm" onclick="grhVisualizarBeneficios(\'' + item.id + '\')" style="padding:4px 8px;font-size:11px">👁️ Ver</button> ';
      html += '<button class="btn btn-sm" onclick="grhDeletarBeneficios(\'' + item.id + '\')" style="padding:4px 8px;font-size:11px;background:#fee2e2;color:#991b1b">🗑️ Deletar</button>';
      html += '</td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    conteudo.innerHTML = html;
  }

  window.grhVisualizarBeneficios = function(id){
    var item = null;
    if(typeof window.db !== 'undefined' && window.db){
      window.db.collection('grh_beneficios_totais').doc(id).get().then(function(doc){
        if(doc.exists) exibirDetalhes(id, doc.data());
      });
    } else {
      var local = localStorage.getItem(id);
      if(local){
        var payload = JSON.parse(local);
        exibirDetalhes(id, payload);
      }
    }

    function exibirDetalhes(id, dados){
      var modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;z-index:6501;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:20px';
      var total = 0;
      var linhas = '';
      var categorias = {va: 'Vale Alimentação', saude: 'Plano de Saúde', odonto: 'Odontológico', colabmais: 'Colab+', sindicato: 'Sindicato'};
      Object.keys(dados.dados || dados.payload.dados).forEach(function(key){
        var valor = dados.dados ? dados.dados[key] : dados.payload.dados[key];
        total += valor;
        linhas += '<tr><td style="padding:8px">'+categorias[key]+'</td><td style="padding:8px;text-align:right">'+fmtBRL(valor)+'</td></tr>';
      });
      modal.innerHTML = '<div style="background:#fff;border-radius:16px;padding:32px;max-width:500px;box-shadow:0 24px 64px rgba(0,0,0,0.2)">' +
        '<h3 style="margin:0 0 16px">Benefícios - '+dados.competencia+'</h3>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:16px">'+linhas+'</table>' +
        '<div style="padding:12px;background:var(--bg-light);border-radius:8px;margin-bottom:16px">' +
          '<strong>Total:</strong> '+fmtBRL(total)+
        '</div>' +
        '<button class="btn btn-p" onclick="this.parentElement.parentElement.remove()">Fechar</button>' +
      '</div>';
      document.body.appendChild(modal);
    }
  };

  window.grhDeletarBeneficios = function(id){
    if(!confirm('Tem certeza que deseja deletar o histórico de benefícios de ' + id + '?')) return;

    if(typeof window.db !== 'undefined' && window.db){
      window.db.collection('grh_beneficios_totais').doc(id).delete().then(function(){
        console.log('✅ Benefícios deletados do Firebase');
        carregarHistorico();
      });
    } else {
      localStorage.removeItem(id);
      carregarHistorico();
    }
  };

  window.grhExportarHistoricoBeneficios = async function(){
    var historico = [];

    if(typeof window.db !== 'undefined' && window.db){
      try{
        var snapshot = await window.db.collection('grh_beneficios_totais').get();
        snapshot.forEach(function(doc){
          var dados = doc.data();
          historico.push({competencia: dados.competencia, ...dados.dados, data: dados.data});
        });
      }catch(e){ console.warn(e); }
    }

    if(historico.length === 0){
      var keys = Object.keys(localStorage);
      keys.forEach(function(key){
        if(key.startsWith('grh_beneficios_')){
          try{
            var payload = JSON.parse(localStorage.getItem(key));
            historico.push({competencia: payload.competencia, ...payload.dados, data: payload.data});
          }catch(e){}
        }
      });
    }

    if(historico.length === 0){
      alert('Nenhum dado para exportar');
      return;
    }

    if(typeof XLSX === 'undefined'){
      alert('Biblioteca XLSX não disponível');
      return;
    }

    historico.sort(function(a,b){ return b.competencia.localeCompare(a.competencia); });

    var ws = XLSX.utils.json_to_sheet(historico.map(function(h){
      return {
        'Competência': h.competencia,
        'Vale Alimentação': h.va || 0,
        'Plano de Saúde': h.saude || 0,
        'Odontológico': h.odonto || 0,
        'Colab+': h.colabmais || 0,
        'Sindicato': h.sindicato || 0,
        'Total': (h.va || 0) + (h.saude || 0) + (h.odonto || 0) + (h.colabmais || 0) + (h.sindicato || 0),
        'Data Importação': h.data ? new Date(h.data).toLocaleDateString('pt-BR') : '—'
      };
    }));

    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico Benefícios');
    XLSX.writeFile(wb, 'historico_beneficios.xlsx');
  };
})();

