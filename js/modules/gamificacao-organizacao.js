/* Gamificação · atalhos, rótulos e integração com o shell */
(function(){
  'use strict';
  if(window.__gamificacaoOrganizacao)return;
  window.__gamificacaoOrganizacao=true;

  var rotulos={
    progresso:'Meu progresso',missoes:'Missões',trilha:'Trilha',conquistas:'Conquistas',
    ranking:'Ranking',streak:'Sequência',carteira:'Carteira',loja:'Loja',admin:'Administração'
  };

  function abrirAba(nome){
    if(typeof window.gmTab==='function')window.gmTab(nome);
    setTimeout(aprimorar,30);
  }

  function ligarAtalho(el,aba,descricao){
    if(!el||el.dataset.gamAtalho)return;
    el.dataset.gamAtalho=aba;
    el.setAttribute('role','button');el.setAttribute('tabindex','0');
    el.setAttribute('aria-label',descricao);
    el.addEventListener('click',function(){abrirAba(aba);});
    el.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();abrirAba(aba);}});
  }

  function aprimorar(){
    var view=document.getElementById('view-gamificacao');if(!view)return;
    view.classList.add('gamificacao-organizada');
    if(getComputedStyle(view).display!=='none'){
      var titulo=document.getElementById('tPageTitle');if(titulo)titulo.textContent='Gamificação';
      var icone=document.getElementById('tPageIcon');if(icone){icone.textContent='🏆';icone.style.display='';}
    }

    view.querySelectorAll('.gm-tab').forEach(function(btn){
      var match=String(btn.getAttribute('onclick')||'').match(/gmTab\('([^']+)'\)/);
      if(match&&rotulos[match[1]])btn.textContent=rotulos[match[1]];
      btn.type='button';
    });
    var saudacao=view.querySelector('.gm-greet h2');
    if(saudacao)saudacao.textContent=saudacao.textContent.replace(/^Ola,?/,'Olá,');
    var progresso=view.querySelector('#gm-panel-progresso');
    if(progresso&&!progresso.querySelector('.gm-progresso-cosmos')){
      var cosmos=document.createElement('div');cosmos.className='gm-progresso-cosmos';
      for(var i=0;i<34;i++){
        var estrela=document.createElement('i');estrela.className='gm-cosmo-star'+(i%3?' small':'');
        estrela.style.left=((i*37)%97)+'%';estrela.style.top=((i*53)%91)+'%';
        estrela.style.animationDelay=((i%9)*.31)+'s';cosmos.appendChild(estrela);
      }
      for(var m=0;m<3;m++){
        var meteoro=document.createElement('i');meteoro.className='gm-cosmo-meteor';
        meteoro.style.left=(96+m*17)+'%';meteoro.style.top=(-7+m*18)+'%';
        meteoro.style.animationDelay=(m*2.8)+'s';meteoro.style.animationDuration=(7.8+m*.7)+'s';cosmos.appendChild(meteoro);
      }
      progresso.insertBefore(cosmos,progresso.firstChild);
    }

    var cards=view.querySelectorAll('.gm-stile');
    ligarAtalho(cards[0],'carteira','Abrir carteira de pontos');
    ligarAtalho(cards[1],'streak','Abrir sequência de participação');
    ligarAtalho(cards[2],'trilha','Abrir trilha e evolução de nível');
    ligarAtalho(cards[3],'conquistas','Abrir medalhas e conquistas');

    var minis=view.querySelectorAll('.gm-two-col .gm-mini-card');
    ligarAtalho(minis[0],'missoes','Abrir missões disponíveis');
    ligarAtalho(minis[1],'trilha','Abrir trilha em andamento');

    view.querySelectorAll('button').forEach(function(btn){if(!btn.type)btn.type='button';});
  }

  var navAnterior=window.sbNav;
  if(typeof navAnterior==='function'){
    window.sbNav=function(id){
      var retorno=navAnterior.apply(this,arguments);
      if(String(id||'').toLowerCase()==='gamificacao')setTimeout(aprimorar,160);
      return retorno;
    };
  }

  function iniciar(){
    aprimorar();
    var view=document.getElementById('view-gamificacao');
    if(view&&!view.__gamOrgObserver){
      var agendado=false;
      view.__gamOrgObserver=new MutationObserver(function(){
        if(agendado)return;agendado=true;
        requestAnimationFrame(function(){agendado=false;aprimorar();});
      });
      view.__gamOrgObserver.observe(view,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
  setTimeout(iniciar,500);setTimeout(iniciar,1400);
})();
