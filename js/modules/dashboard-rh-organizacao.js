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

  function normalizarRotulo(valor){
    return String(valor||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  }

  function destinoDoCard(card){
    var rotulo = normalizarRotulo(texto(card,'.sc-lbl'));
    if(!rotulo) return '';
    if(/ferias/.test(rotulo)) return 'grh:ferias';
    if(/turnover|desligamento/.test(rotulo)) return 'grh:desligamentos';
    if(/admiss/.test(rotulo)) return 'grh:admissao';
    if(/folha|salario|remuneracao|custo medio|custo total|maior salario/.test(rotulo)) return 'grh:remuneracao';
    if(/pesquisa|resposta|nps|nota media/.test(rotulo)) return 'grh:pesquisas';
    if(/moviment|promocao|transferencia|mudanca/.test(rotulo)) return 'grh:movimentacoes';
    if(/colaborador|total ativos|^clt$|^pj|tempo medio|maior setor|aniversariante/.test(rotulo)) return 'grh:colaboradores';
    var pane = card.closest('.dash-section');
    if(pane && pane.id==='dash-pane-movimentacoes') return 'grh:movimentacoes';
    return '';
  }

  function decorarAtalhos(){
    view = view || document.getElementById('view-dashboard');
    if(!view) return;
    view.querySelectorAll('.sc').forEach(function(card){
      var destino = destinoDoCard(card);
      if(!destino) return;
      card.dataset.dashDestino = destino;
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label','Abrir detalhes de '+texto(card,'.sc-lbl'));
      card.title = 'Clique para abrir os detalhes';
    });
  }

  function abrirCard(card){
    var destino = card && card.dataset.dashDestino;
    if(!destino) return;
    var partes = destino.split(':');
    if(partes[0]==='grh' && typeof window.grhTab==='function') window.grhTab(partes[1]);
  }

  function ativarCards(){
    view = view || document.getElementById('view-dashboard');
    if(!view || view.__dashCardsAtivos) return;
    view.__dashCardsAtivos = true;
    view.addEventListener('click',function(ev){
      var card = ev.target.closest('.sc[data-dash-destino]');
      if(!card) return;
      ev.preventDefault();
      abrirCard(card);
    });
    view.addEventListener('keydown',function(ev){
      var card = ev.target.closest('.sc[data-dash-destino]');
      if(!card || (ev.key!=='Enter' && ev.key!==' ')) return;
      ev.preventDefault();
      abrirCard(card);
    });
    var observer = new MutationObserver(function(){ decorarAtalhos(); });
    observer.observe(view,{childList:true,subtree:true});
    decorarAtalhos();
  }
  window.dashboardRHAtualizar = function(){
    montarCabecalho();
    atualizarCarimbo('Atualizando dados…');
    try{
      if(typeof window.dashRecarregarTudo === 'function') window.dashRecarregarTudo();
    }finally{
      window.setTimeout(function(){ decorarAtalhos(); atualizarCarimbo('Atualizado em '+agora()); }, 850);
    }
  };

  function aoAbrirDashboard(id){
    if(id !== 'dashboard') return;
    window.clearTimeout(aberturaTimer);
    aberturaTimer = window.setTimeout(function(){
      montarCabecalho();
      ativarCards();
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
    ativarCards();
    envolverNavegacao('sbNav');
    envolverNavegacao('switchView');
    view = document.getElementById('view-dashboard');
    if(view && getComputedStyle(view).display !== 'none') window.dashboardRHAtualizar();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
  window.setTimeout(iniciar, 500);
})();
