// Interface compacta v18: remove heroes repetidos e protege o painel RH ativo.
(function(){
  'use strict';
  if(window.__ESSENCE_CLEAN_LAYOUT_V18__) return;
  window.__ESSENCE_CLEAN_LAYOUT_V18__=true;

  function hideHero(hero){
    if(!hero || !hero.matches || !hero.matches('#mainHero,.main-area .hero')) return;
    if(hero.style.getPropertyValue('display')!=='none' || hero.style.getPropertyPriority('display')!=='important'){
      hero.style.setProperty('display','none','important');
    }
    hero.setAttribute('aria-hidden','true');
  }

  function protectPane(pane){
    if(!pane || !pane.id || pane.id.indexOf('grh-pane-')!==0) return;
    var view=document.getElementById('view-gestao-rh');
    if(!view || (getComputedStyle(view).display==='none' && !view.classList.contains('active'))) return;
    var active=pane.classList.contains('active');
    var expected=active?'block':'none';
    if(pane.style.getPropertyValue('display')!==expected || pane.style.getPropertyPriority('display')!=='important'){
      pane.style.setProperty('display',expected,'important');
    }
    pane.setAttribute('aria-hidden',active?'false':'true');
  }

  function scan(root){
    root=root||document;
    if(root.matches){hideHero(root);protectPane(root);}
    if(root.querySelectorAll){
      root.querySelectorAll('#mainHero,.main-area .hero').forEach(hideHero);
      root.querySelectorAll('#view-gestao-rh [id^="grh-pane-"]').forEach(protectPane);
    }
  }

  function audit(){
    var expected=['colaboradores','enderecos','remuneracao','movimentacoes','admissao','desligamentos','ferias','documentos','beneficios','acessos','pesquisas','roadmap'];
    window.__ESSENCE_RH_AUDIT_V18__=expected.reduce(function(report,id){
      var pane=document.getElementById('grh-pane-'+id);
      var button=document.querySelector('[data-grh-tab="'+id+'"]');
      report[id]={menu:!!button,pane:!!pane,content:!!(pane&&pane.textContent.trim().length>30)};
      return report;
    },{});
  }

  function init(){
    scan(document);
    audit();
    var main=document.querySelector('.main-area');
    if(main && !main.__essCleanObserver){
      var queued=false, roots=[];
      main.__essCleanObserver=new MutationObserver(function(records){
        records.forEach(function(record){
          if(record.type==='attributes') roots.push(record.target);
          Array.prototype.forEach.call(record.addedNodes||[],function(node){if(node.nodeType===1) roots.push(node);});
        });
        if(queued) return;
        queued=true;
        requestAnimationFrame(function(){
          queued=false;
          var pending=roots.splice(0);
          pending.forEach(scan);
          audit();
        });
      });
      main.__essCleanObserver.observe(main,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();