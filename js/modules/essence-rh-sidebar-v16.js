// Gestão RH v16: abas administrativas no menu lateral expansível.
(function(){
  'use strict';
  if(window.__ESSENCE_RH_SIDEBAR_V16__) return;
  window.__ESSENCE_RH_SIDEBAR_V16__=true;

  var items=[
    ['colaboradores','👥','Colaboradores'],
    ['enderecos','📍','Endereços'],
    ['remuneracao','💰','Remuneração'],
    ['movimentacoes','🔄','Movimentações'],
    ['admissao','📝','Admissões'],
    ['desligamentos','🚪','Desligamentos'],
    ['ferias','🏖️','Gestão de Férias'],
    ['documentos','📄','Documentos'],
    ['beneficios','🎁','Benefícios'],
    ['acessos','🔐','Acessos e Permissões'],
    ['pesquisas','📋','Pesquisas'],
    ['roadmap','🗺️','Próximas funcionalidades']
  ];
  var labels={};items.forEach(function(item){labels[item[0]]=item[2];});
  var current='colaboradores';
  var baseGrhTab=window.grhTab;
  var baseSbNav=window.sbNav;

  function hideHorizontalTabs(){
    var bar=document.getElementById('grh-tabs');
    if(bar){bar.style.setProperty('display','none','important');bar.setAttribute('aria-hidden','true');}
  }

  function expanded(value){
    var parent=document.getElementById('sb-gestao-rh'), group=document.getElementById('ess-grh-side-submenu');
    if(!parent||!group) return;
    parent.classList.toggle('ess-grh-expanded',value);
    parent.setAttribute('aria-expanded',value?'true':'false');
    group.classList.toggle('open',value);
  }

  function sync(tab){
    tab=String(tab||current).toLowerCase();if(!labels[tab])tab='colaboradores';current=tab;
    var group=document.getElementById('ess-grh-side-submenu');
    if(group) group.querySelectorAll('.ess-grh-side-link').forEach(function(btn){btn.classList.toggle('active',btn.dataset.grhTab===tab);});
    var parent=document.getElementById('sb-gestao-rh');if(parent)parent.classList.add('active');
    var title=document.getElementById('tPageTitle');if(title)title.textContent='Gestão RH · '+labels[tab];
    var icon=document.getElementById('tPageIcon');if(icon){var meta=items.find(function(item){return item[0]===tab;});icon.textContent=meta?meta[1]:'🏢';}
    try{sessionStorage.setItem('grhUltimaAba',tab);}catch(e){}
    hideHorizontalTabs();
  }

  function open(tab){
    expanded(true);
    var result=typeof baseGrhTab==='function'?baseGrhTab.call(window,tab):false;
    sync(tab);
    setTimeout(function(){sync(tab);},160);
    setTimeout(function(){sync(tab);},650);
    return result;
  }

  function build(){
    var parent=document.getElementById('sb-gestao-rh');if(!parent)return;
    var sidebar=document.getElementById('sidebar');if(!sidebar)return;
    var cluster=document.getElementById('ess-grh-side-cluster');
    if(!cluster){
      cluster=document.createElement('div');
      cluster.id='ess-grh-side-cluster';
      cluster.className='ess-grh-side-cluster';
      parent.parentNode.insertBefore(cluster,parent);
    }
    if(parent.parentNode!==cluster) cluster.appendChild(parent);

    var group=document.getElementById('ess-grh-side-submenu');
    if(group && group.parentNode!==cluster) cluster.appendChild(group);

    parent.removeAttribute('onclick');
    parent.setAttribute('role','button');
    parent.setAttribute('tabindex','0');
    parent.setAttribute('aria-controls','ess-grh-side-submenu');
    if(!parent.hasAttribute('aria-expanded')) parent.setAttribute('aria-expanded','false');

    var arrow=parent.querySelector('.ess-grh-arrow');
    if(!arrow){arrow=document.createElement('span');arrow.className='ess-grh-arrow';parent.appendChild(arrow);}
    arrow.textContent='⌄';

    if(!group){
      group=document.createElement('div');
      group.id='ess-grh-side-submenu';
      group.className='ess-grh-side-submenu';
      group.setAttribute('role','navigation');
      group.setAttribute('aria-label','Módulos de Gestão RH');
      group.innerHTML=items.map(function(item){return '<button type="button" class="ess-grh-side-link" data-grh-tab="'+item[0]+'"><span class="ess-grh-sub-icon">'+item[1]+'</span><span>'+item[2]+'</span></button>';}).join('');
      cluster.appendChild(group);
    }

    if(parent.dataset.essGrhBound!=='true'){
      parent.dataset.essGrhBound='true';
      parent.addEventListener('click',function(ev){
        ev.preventDefault();ev.stopPropagation();
        var liveGroup=document.getElementById('ess-grh-side-submenu');
        var willOpen=!!liveGroup&&!liveGroup.classList.contains('open');
        expanded(willOpen);
        if(willOpen){open(current);requestAnimationFrame(function(){parent.scrollIntoView({block:'nearest'});});}
      });
      parent.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();parent.click();}});
    }
    if(group.dataset.essGrhBound!=='true'){
      group.dataset.essGrhBound='true';
      group.addEventListener('click',function(ev){
        var btn=ev.target.closest('.ess-grh-side-link');if(!btn)return;
        ev.preventDefault();ev.stopPropagation();open(btn.dataset.grhTab);
      });
    }
    hideHorizontalTabs();
  }

  window.grhTab=function(tab){return open(tab);};
  window.sbNav=function(id){if(String(id||'').toLowerCase()==='gestao-rh')return open(current);return typeof baseSbNav==='function'?baseSbNav.apply(this,arguments):false;};;
  document.addEventListener('click',function(ev){
    var other=ev.target.closest&&ev.target.closest('#sidebar .sb-item:not(#sb-gestao-rh)');
    if(other) expanded(false);
  },true);

  function init(){
    build();
    var view=document.getElementById('view-gestao-rh');
    var pane=document.querySelector('#view-gestao-rh [id^="grh-pane-"].active');
    var tab=pane?String(pane.id).replace('grh-pane-',''):null;
    var moduleActive=!!(view&&(view.classList.contains('active')||getComputedStyle(view).display!=='none'));
    if(labels[tab]) current=tab;
    if(labels[tab]||moduleActive){expanded(true);sync(current);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,100);});
  else setTimeout(init,0);
  setTimeout(init,700);setTimeout(init,1600);setTimeout(init,3000);
})();
