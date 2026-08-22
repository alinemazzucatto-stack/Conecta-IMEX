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
  var collapsedByUser=false;
  var baseGrhTab=window.grhTab;
  var baseSbNav=window.sbNav;

  function viewVisible(id){
    var view=document.getElementById('view-'+id);
    return !!(view&&getComputedStyle(view).display!=='none');
  }

  function createPrimaryItem(id,icon,label){
    var item=document.createElement('div');
    item.id='sb-'+id;
    item.className='sb-item ess-rh-primary-link';
    item.dataset.menuId=id;
    item.title=label;
    item.innerHTML='<span>'+icon+'</span><span class="sb-tip">'+label+'</span>';
    return item;
  }

  function ensurePrimaryItems(){
    var sidebar=document.getElementById('sidebar');
    var cluster=document.getElementById('ess-grh-side-cluster');
    if(!sidebar||!cluster) return;
    var defs=[['inicio-rh','⌂','Início'],['intranet','🏠','Intranet']];
    defs.forEach(function(def){
      var item=document.getElementById('sb-'+def[0]);
      if(!item) item=createPrimaryItem(def[0],def[1],def[2]);
      item.style.removeProperty('display');
      item.classList.toggle('active',viewVisible(def[0]));
      item.onclick=function(ev){
        if(ev){ev.preventDefault();ev.stopPropagation();}
        collapsedByUser=true;
        expanded(false);
        var parent=document.getElementById('sb-gestao-rh');
        if(parent) parent.classList.remove('active');
        var stableNav=window.imexBaseNavigate||baseSbNav;
        var result=typeof stableNav==='function'?stableNav.call(window,def[0]):false;
        if(def[0]==='intranet')setTimeout(function(){
          if(typeof window.intraCarregar==='function')window.intraCarregar();
        },60);
        return result;
      };
      sidebar.insertBefore(item,cluster);
    });
  }
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
    collapsedByUser=false;
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
    ensurePrimaryItems();

    if(!parent.__essGrhBound){
      parent.__essGrhBound=true;
      parent.addEventListener('click',function(ev){
        ev.preventDefault();ev.stopPropagation();
        var liveGroup=document.getElementById('ess-grh-side-submenu');
        if(!liveGroup) return;
        var willOpen=!liveGroup.classList.contains('open');
        collapsedByUser=!willOpen;
        expanded(willOpen);
        if(willOpen){
          open(current);
          requestAnimationFrame(function(){parent.scrollIntoView({block:'nearest'});});
        }
      });
      parent.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();parent.click();}});
    }
    if(!group.__essGrhBound){
      group.__essGrhBound=true;
      group.addEventListener('click',function(ev){
        var btn=ev.target.closest('.ess-grh-side-link');if(!btn)return;
        ev.preventDefault();ev.stopPropagation();open(btn.dataset.grhTab);
      });
    }
    hideHorizontalTabs();
  }

  window.grhTab=function(tab){return open(tab);};
  window.sbNav=function(id){if(String(id||'').toLowerCase()==='gestao-rh'){collapsedByUser=false;return open(current);}return typeof baseSbNav==='function'?baseSbNav.apply(this,arguments):false;};;
  document.addEventListener('click',function(ev){
    var other=ev.target.closest&&ev.target.closest('#sidebar .sb-item:not(#sb-gestao-rh)');
    if(other) expanded(false);
  },true);

  function init(){
    build();
    var view=document.getElementById('view-gestao-rh');
    var pane=document.querySelector('#view-gestao-rh [id^="grh-pane-"].active');
    var tab=pane?String(pane.id).replace('grh-pane-',''):null;
    var primaryActive=viewVisible('inicio-rh')||viewVisible('intranet');
    var moduleActive=!primaryActive&&!!(view&&getComputedStyle(view).display!=='none');
    if(labels[tab]) current=tab;
    if(moduleActive){collapsedByUser=false;expanded(true);sync(current);}
    else{collapsedByUser=true;expanded(false);var parent=document.getElementById('sb-gestao-rh');if(parent)parent.classList.remove('active');}
  }
  function guardSidebar(){
    var sidebar=document.getElementById('sidebar');
    var parent=document.getElementById('sb-gestao-rh');
    if(!sidebar||!parent) return;
    var cluster=document.getElementById('ess-grh-side-cluster');
    var group=document.getElementById('ess-grh-side-submenu');
    if(!cluster||parent.parentNode!==cluster||!group||group.parentNode!==cluster){
      build();
      group=document.getElementById('ess-grh-side-submenu');
    }
    ensurePrimaryItems();
    if(viewVisible('inicio-rh')||viewVisible('intranet')){
      collapsedByUser=true;
      expanded(false);
      parent.classList.remove('active');
      return;
    }
    var view=document.getElementById('view-gestao-rh');
    var active=!!(view&&getComputedStyle(view).display!=='none');
    if(active&&!collapsedByUser&&group&&!group.classList.contains('open')){expanded(true);sync(current);}
  }

  function watchSidebar(){
    guardSidebar();
    if(document.body.__essGrhSidebarObserver) return;
    var queued=false;
    document.body.__essGrhSidebarObserver=new MutationObserver(function(){
      if(queued) return;
      queued=true;
      requestAnimationFrame(function(){queued=false;guardSidebar();});
    });
    document.body.__essGrhSidebarObserver.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,100);setTimeout(watchSidebar,140);});
  else{setTimeout(init,0);setTimeout(watchSidebar,40);}
  setTimeout(init,700);setTimeout(init,1600);setTimeout(init,3000);setTimeout(guardSidebar,5000);
})();
