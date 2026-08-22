/* Dashboard RH — atualização, integração de navegação e exportação completa */
(function(){
  'use strict';
  if(window.__dashboardRhOrganizacao) return;
  window.__dashboardRhOrganizacao = true;

  var view, carimbo, aberturaTimer;

  function agora(){
    return new Date().toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
  }

  function montarCabecalho(){
    view = document.getElementById('view-dashboard');
    if(!view) return;
    view.classList.add('dash-rh-organizado');
    if(view.querySelector('.dash-rh-cabecalho')) return;
    var tabs = document.getElementById('dash-subtabs');
    var header = document.createElement('section');
    header.className = 'dash-rh-cabecalho';
    header.innerHTML =
      '<div class="dash-rh-cabecalho__texto">'+
        '<div class="dash-rh-cabecalho__rotulo">Indicadores de pessoas</div>'+
        '<h1>Dashboard RH</h1>'+
        '<p>Acompanhe os principais indicadores da operação em uma visão consolidada.</p>'+
      '</div>'+
      '<div class="dash-rh-cabecalho__acoes">'+
        '<span class="dash-rh-atualizado" id="dash-rh-atualizado">Atualizado em '+agora()+'</span>'+
        '<button type="button" class="dash-rh-botao" onclick="dashboardRHAtualizar()">↻ Atualizar</button>'+
        '<button type="button" class="dash-rh-botao" onclick="dashExportarPDF()">📄 PDF</button>'+
        '<button type="button" class="dash-rh-botao dash-rh-botao--primario" onclick="dashExportarExcel()">📊 Excel</button>'+
      '</div>';
    if(tabs) view.insertBefore(header, tabs); else view.insertBefore(header, view.firstChild);
    carimbo = document.getElementById('dash-rh-atualizado');
  }

  function atualizarCarimbo(texto){
    carimbo = carimbo || document.getElementById('dash-rh-atualizado');
    if(carimbo) carimbo.textContent = texto;
  }

  window.dashboardRHAtualizar = function(){
    montarCabecalho();
    atualizarCarimbo('Atualizando dados…');
    try{
      if(typeof window.dashRecarregarTudo === 'function') window.dashRecarregarTudo();
    }finally{
      window.setTimeout(function(){ atualizarCarimbo('Atualizado em '+agora()); }, 850);
    }
  };

  function aoAbrirDashboard(id){
    if(id !== 'dashboard') return;
    window.clearTimeout(aberturaTimer);
    aberturaTimer = window.setTimeout(function(){
      montarCabecalho();
      window.dashboardRHAtualizar();
    }, 40);
  }

  function envolverNavegacao(nome){
    var anterior = window[nome];
    if(typeof anterior !== 'function' || anterior.__dashRhEnvolvida) return;
    var envolvida = function(id){
      var retorno = anterior.apply(this, arguments);
      aoAbrirDashboard(id);
      return retorno;
    };
    envolvida.__dashRhEnvolvida = true;
    window[nome] = envolvida;
  }

  function texto(el, seletor){
    var no = el.querySelector(seletor);
    return no ? no.textContent.replace(/\s+/g,' ').trim() : '';
  }

  function coletarSecao(id, titulo){
    var pane = document.getElementById(id);
    var dados = {titulo:titulo, kpis:[], tabela:{cabecalhos:[], linhas:[]}};
    if(!pane) return dados;
    pane.querySelectorAll('.sc').forEach(function(card){
      dados.kpis.push([texto(card,'.sc-lbl'), texto(card,'.sc-num'), texto(card,'.sc-sub')]);
    });
    var tabela = pane.querySelector('table');
    if(tabela){
      tabela.querySelectorAll('thead th').forEach(function(th){ dados.tabela.cabecalhos.push(th.textContent.trim()); });
      tabela.querySelectorAll('tbody tr').forEach(function(tr){
        var linha=[];
        tr.querySelectorAll('td').forEach(function(td){ linha.push(td.textContent.replace(/\s+/g,' ').trim()); });
        if(linha.length) dados.tabela.linhas.push(linha);
      });
    }
    return dados;
  }

  function secoes(){
    return [
      coletarSecao('dash-pane-geral','Visão Geral'),
      coletarSecao('dash-pane-colaboradores','Colaboradores'),
      coletarSecao('dash-pane-remuneracao','Remuneração'),
      coletarSecao('dash-pane-movimentacoes','Movimentações'),
      coletarSecao('dash-pane-pesquisas','Pesquisas')
    ];
  }

  window.dashExportarExcel = function(){
    try{
      if(typeof XLSX === 'undefined'){ alert('Biblioteca de Excel não carregada.'); return; }
      var wb = XLSX.utils.book_new();
      secoes().forEach(function(sec){
        var linhas = [['DASHBOARD RH — '+sec.titulo], ['Gerado em', agora()], []];
        if(sec.kpis.length){
          linhas.push(['INDICADOR','VALOR','DETALHE']);
          linhas = linhas.concat(sec.kpis);
          linhas.push([]);
        }
        if(sec.tabela.linhas.length){
          linhas.push(sec.tabela.cabecalhos);
          linhas = linhas.concat(sec.tabela.linhas);
        }
        var ws = XLSX.utils.aoa_to_sheet(linhas);
        ws['!cols'] = [{wch:28},{wch:22},{wch:28},{wch:22},{wch:22}];
        XLSX.utils.book_append_sheet(wb, ws, sec.titulo.substring(0,31));
      });
      XLSX.writeFile(wb, 'dashboard-rh-'+new Date().toISOString().slice(0,10)+'.xlsx');
    }catch(e){ alert('Não foi possível exportar o Dashboard: '+e.message); }
  };

  window.dashExportarPDF = function(){
    try{
      var Ctor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if(!Ctor){ alert('Biblioteca de PDF não carregada.'); return; }
      var doc = new Ctor({orientation:'landscape'}), y=15;
      doc.setFontSize(17); doc.setTextColor(15,84,144); doc.text('Dashboard RH - Relatorio completo',14,y);
      doc.setFontSize(9); doc.setTextColor(90,108,128); doc.text('Gerado em '+agora(),14,y+7); y+=17;
      secoes().forEach(function(sec){
        if(y>175){ doc.addPage(); y=15; }
        doc.setFontSize(12); doc.setTextColor(23,34,56); doc.text(sec.titulo,14,y); y+=4;
        var corpo = sec.kpis.slice();
        if(corpo.length && typeof doc.autoTable === 'function'){
          doc.autoTable({head:[['Indicador','Valor','Detalhe']],body:corpo,startY:y,styles:{fontSize:7},theme:'grid'});
          y=doc.lastAutoTable.finalY+6;
        }
        if(sec.tabela.linhas.length && typeof doc.autoTable === 'function'){
          doc.autoTable({head:[sec.tabela.cabecalhos],body:sec.tabela.linhas,startY:y,styles:{fontSize:6},theme:'striped'});
          y=doc.lastAutoTable.finalY+10;
        } else { y+=8; }
      });
      doc.save('dashboard-rh-'+new Date().toISOString().slice(0,10)+'.pdf');
    }catch(e){ alert('Não foi possível exportar o Dashboard: '+e.message); }
  };

  function iniciar(){
    montarCabecalho();
    envolverNavegacao('sbNav');
    envolverNavegacao('switchView');
    view = document.getElementById('view-dashboard');
    if(view && getComputedStyle(view).display !== 'none') window.dashboardRHAtualizar();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
  window.setTimeout(iniciar, 500);
})();
