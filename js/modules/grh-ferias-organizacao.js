(function(){
'use strict';
function enhanceVacations(){
 var pane=document.getElementById('grh-pane-ferias');if(!pane||pane.dataset.organizedVacations)return;
 var children=Array.from(pane.children),kpis=children.find(function(el){return el.querySelector&&el.querySelector('#rPend')}),control=children.find(function(el){return el.querySelector&&el.querySelector('#rTable')}),reports=children.find(function(el){return el.classList&&el.classList.contains('cg')&&el.querySelector('[onclick="exportPDF()"]')}),policy=document.getElementById('politicaEditorCard');
 if(!kpis||!control)return;pane.dataset.organizedVacations='1';pane.classList.add('vacations-organized');
 var nav=document.createElement('nav');nav.className='people-cycle-tabs vacation-module-tabs';nav.innerHTML='<button class="active" data-vacation-tab="overview" onclick="feriasModuloTab(\'overview\',this)">📊 Visão Geral</button><button data-vacation-tab="history" onclick="feriasModuloTab(\'history\',this)">🕘 Histórico</button><button data-vacation-tab="reports" onclick="feriasModuloTab(\'reports\',this)">📈 Relatórios e Regras</button><button data-vacation-tab="policy" onclick="feriasModuloTab(\'policy\',this)">📋 Política de Férias</button>';
 var main=document.createElement('section');main.dataset.vacationView='main';main.className='vacation-view';
 var reportView=document.createElement('section');reportView.dataset.vacationView='reports';reportView.className='vacation-view';reportView.hidden=true;
 var policyView=document.createElement('section');policyView.dataset.vacationView='policy';policyView.className='vacation-view';policyView.hidden=true;
 main.append(kpis,control);if(reports)reportView.append(reports);if(policy)policyView.append(policy);pane.prepend(nav,main,reportView,policyView);
 var subtabs=control.querySelector('#fr-subtabs');if(subtabs)subtabs.hidden=true;
 Array.from(kpis.children).forEach(function(card,index){card.classList.add('vacation-kpi',['blue','green','yellow','purple'][index%4])});control.classList.add('vacation-control-card')
}
window.feriasModuloTab=function(tab,button){var pane=document.getElementById('grh-pane-ferias');if(!pane)return;var main=tab==='overview'||tab==='history';pane.querySelector('[data-vacation-view="main"]').hidden=!main;pane.querySelector('[data-vacation-view="reports"]').hidden=tab!=='reports';pane.querySelector('[data-vacation-view="policy"]').hidden=tab!=='policy';pane.querySelectorAll('[data-vacation-tab]').forEach(function(btn){btn.classList.toggle('active',btn===button)});if(main){var head=pane.querySelector('.vacation-control-card .cht');if(head){var title=head.querySelector('h2'),desc=head.querySelector('p');if(title)title.textContent=tab==='history'?'Histórico de Férias':'Controle RH';if(desc)desc.textContent=tab==='history'?'Solicitações concluídas, encerradas ou que exigiram ajustes.':'Solicitações atuais, programadas e pendentes de análise.';}if(typeof window.feriasAba==='function')window.feriasAba(tab==='history'?'historico':'geral')}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhanceVacations);else enhanceVacations();setTimeout(enhanceVacations,500)
})();