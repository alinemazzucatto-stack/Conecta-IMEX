(function(){
'use strict';
var docsTab='overview';
function tabButton(id,label,icon){return '<button data-docs-module-tab="'+id+'" onclick="docsModuleTab(\''+id+'\',this)">'+icon+' '+label+'</button>'}
function enhanceDocs(){
 var pane=document.getElementById('grh-pane-documentos'),page=pane&&pane.querySelector('.docs-rh-page');if(!page||page.dataset.organizedDocs)return;
 var hero=page.querySelector('.docs-hero-main'),summary=page.querySelector('.docs-rh-summary'),toolbar=page.querySelector('.docs-rh-toolbar'),library=page.querySelector('.docs-rh-library');if(!summary||!toolbar||!library)return;
 page.dataset.organizedDocs='1';page.classList.add('documents-organized');if(hero)hero.remove();
 var nav=document.createElement('nav');nav.className='people-cycle-tabs documents-module-tabs';nav.innerHTML=tabButton('overview','Visão Geral','📊')+tabButton('library','Biblioteca','📚')+tabButton('pending','Pendentes de Assinatura','✍️')+tabButton('archived','Arquivados','🗄️');
 var overview=document.createElement('section');overview.dataset.docsModuleView='overview';overview.className='documents-overview';overview.append(summary);overview.insertAdjacentHTML('beforeend','<div class="people-cycle-overview-grid"><article class="people-cycle-overview-card"><span>📚</span><div><h3>Biblioteca central</h3><p>Políticas, procedimentos, contratos e termos organizados em um só lugar.</p><button class="btn btn-p" onclick="docsModuleTab(\'library\')">Abrir biblioteca</button></div></article><article class="people-cycle-overview-card"><span>✍️</span><div><h3>Assinaturas pendentes</h3><p>Acompanhe documentos que ainda aguardam ciência ou assinatura.</p><button class="btn btn-g" onclick="docsModuleTab(\'pending\')">Ver pendências</button></div></article><article class="people-cycle-overview-card action"><span>📤</span><div><h3>Novo documento</h3><p>Envie um arquivo institucional ou vinculado a um colaborador.</p><button class="btn btn-p" onclick="grhDocsAbrirModal()">Enviar documento</button></div></article></div>');
 var records=document.createElement('section');records.dataset.docsModuleView='records';records.className='documents-records';records.hidden=true;records.append(toolbar,library);
 page.prepend(nav,overview,records);applyDocsTab(docsTab)
}
function applyDocsTab(tab){
 docsTab=tab;var pane=document.getElementById('grh-pane-documentos'),page=pane&&pane.querySelector('.docs-rh-page');if(!page)return;
 var overview=page.querySelector('[data-docs-module-view="overview"]'),records=page.querySelector('[data-docs-module-view="records"]');if(overview)overview.hidden=tab!=='overview';if(records)records.hidden=tab==='overview';
 page.querySelectorAll('[data-docs-module-tab]').forEach(function(btn){btn.classList.toggle('active',btn.dataset.docsModuleTab===tab)});
 if(tab!=='overview'){var status=tab==='pending'?'Pendente assinatura':tab==='archived'?'Arquivado':'todos',select=document.getElementById('grhDocsStatusFiltro');if(select)select.value=status;window._grhDocsFiltro=window._grhDocsFiltro||{};window._grhDocsFiltro.status=status;if(typeof window.grhDocsFiltrar==='function')window.grhDocsFiltrar();else if(typeof window.grhDocsRender==='function')window.grhDocsRender()}
}
window.docsModuleTab=function(tab){applyDocsTab(tab||'overview')};
var oldLoad=window.grhDocsCarregar;if(typeof oldLoad==='function')window.grhDocsCarregar=function(){var result=oldLoad.apply(this,arguments);setTimeout(enhanceDocs,80);setTimeout(function(){applyDocsTab(docsTab)},180);return result};
function watch(){var pane=document.getElementById('grh-pane-documentos');if(!pane)return;new MutationObserver(function(){setTimeout(enhanceDocs,10)}).observe(pane,{childList:true,subtree:false});enhanceDocs()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();setTimeout(watch,600)
})();