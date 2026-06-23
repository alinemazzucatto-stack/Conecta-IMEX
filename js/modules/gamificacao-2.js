// ===== script: gm-cosmic-js =====
(function(){
  if(window.__gmCosmicInit) return;
  window.__gmCosmicInit = true;

  function montarFundo(){
    var view = document.getElementById('view-gamificacao');
    if(!view || document.getElementById('gm-cosmos-bg')) return;
    var bg = document.createElement('div');
    bg.id = 'gm-cosmos-bg';
    for(var i=0;i<70;i++){
      var s = document.createElement('div');
      s.className = 'gm-star';
      var tam = Math.random() < .15 ? 3 : 1.5;
      s.style.width = tam + 'px';
      s.style.height = tam + 'px';
      s.style.left = (Math.random()*100) + '%';
      s.style.top = (Math.random()*100) + '%';
      s.style.animationDelay = (Math.random()*2.6) + 's';
      bg.appendChild(s);
    }
    for(var j=0;j<10;j++){
      var m = document.createElement('div');
      m.className = 'gm-meteor';
      m.style.top = (Math.random()*90) + '%';
      m.style.left = (Math.random()*100) + '%';
      m.style.animationDelay = (j*1.3 + Math.random()*2) + 's';
      bg.appendChild(m);
    }
    view.insertBefore(bg, view.firstChild);
  }

  montarFundo();
  var mo = new MutationObserver(montarFundo);
  mo.observe(document.body, {childList:true, subtree:true});
  setInterval(montarFundo, 1500);
})();

