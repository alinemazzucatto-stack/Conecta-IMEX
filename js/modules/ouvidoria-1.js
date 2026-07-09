// ===== script: ouv-v2-js =====
(function(){
'use strict';
if(window.__ouvV2Fix) return;
window.__ouvV2Fix = true;

/* 1) Corrige o roteamento: ouvidoriaCarregar precisa chamar a função
   completa (ouvCarregar), que alterna grid RH/colaborador e popula
   "Minhas Mensagens" — o stub anterior só atualizava os contadores. */
window.ouvidoriaCarregar = function(){
  if(typeof window.ouvCarregar === 'function') return window.ouvCarregar();
};

/* 2) Garante o carregamento real sempre que a view ficar visível,
   mesmo se outro roteador a exibir sem chamar ouvidoriaCarregar. */
function tentarCarregar(){
  var v = document.getElementById('view-ouvidoria');
  if(!v) return;
  if(window.getComputedStyle(v).display === 'none'){
    v.removeAttribute('data-ouv-loaded');
    return;
  }
  if(v.getAttribute('data-ouv-loaded') === '1') return;
  v.setAttribute('data-ouv-loaded','1');
  if(typeof window.ouvCarregar === 'function') window.ouvCarregar();
}
var mo = new MutationObserver(function(){ tentarCarregar(); });
(function observe(){
  var v = document.getElementById('view-ouvidoria');
  if(v) mo.observe(v, {attributes:true, attributeFilter:['style','class']});
  else requestAnimationFrame(observe);
})();
// REMOVED: Performance optimization - 600ms setInterval polling (MutationObserver handles updates)
// setInterval(tentarCarregar, 600);

/* 3) Animação de contagem nos números do hero */
function animarNumero(id, valor){
  var el = document.getElementById(id);
  if(!el) return;
  var atual = parseInt(el.textContent, 10) || 0;
  if(atual === valor){ el.textContent = valor; return; }
  var passos = 16, i = 0, inicio = atual;
  var timer = setInterval(function(){
    i++;
    el.textContent = Math.round(inicio + (valor - inicio) * (i / passos));
    if(i >= passos){ clearInterval(timer); el.textContent = valor; }
  }, 25);
}
window.ouvAtualizarStats = async function(){
  try{
    var snap = await db.collection(col('ouvidoria')).get();
    var msgs = snap.docs.map(function(d){ return d.data(); });
    animarNumero('ouv-total', msgs.length);
    animarNumero('ouv-novas', msgs.filter(function(m){ return m.status === 'nova'; }).length);
    animarNumero('ouv-respondidas', msgs.filter(function(m){ return m.status === 'respondida'; }).length);
  }catch(e){}
};

/* 4) Visual aprimorado para "Minhas Mensagens" */
window.ouvRenderProprias = async function(){
  var lista = document.getElementById('ouv-lista-proprias');
  if(!lista) return;
  var nome = sessionStorage.getItem('userName') || '';
  if(!nome) return;
  var msgs = [];
  try{
    var snap = await db.collection(col('ouvidoria')).orderBy('criadoEm','desc').get();
    msgs = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); }).filter(function(m){ return m.remetenteReal === nome; });
  }catch(e){}

  if(!msgs.length){
    lista.innerHTML = '<div class="ouv-empty"><div class="ouv-empty-ico">📭</div><p>Nenhuma mensagem enviada ainda.</p><span>Use o formulário ao lado para entrar em contato com o RH.</span></div>';
    return;
  }

  var catInfo = {
    sugestao:{icon:'💡',cor:'#0047FF',label:'Sugestão'},
    elogio:{icon:'🌟',cor:'#22C58B',label:'Elogio'},
    reclamacao:{icon:'⚠️',cor:'#f59e0b',label:'Reclamação'},
    duvida:{icon:'❓',cor:'#6b7280',label:'Dúvida'}
  };
  lista.innerHTML = msgs.map(function(m, idx){
    var cat = catInfo[m.categoria] || {icon:'📣',cor:'#0047FF',label:m.categoria||''};
    var data = new Date(m.criadoEm).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
    var respondida = !!m.resposta;
    return '<div class="ouv-msg-card" style="animation-delay:'+(idx*40)+'ms;border-left-color:'+cat.cor+'">'+
      '<div class="ouv-msg-top">'+
        '<span class="ouv-msg-cat" style="background:'+cat.cor+'15;color:'+cat.cor+'">'+cat.icon+' '+cat.label+'</span>'+
        '<span class="ouv-msg-data">'+data+'</span>'+
      '</div>'+
      '<div class="ouv-msg-texto">'+m.mensagem+'</div>'+
      (respondida
        ? '<div class="ouv-msg-resp"><div class="ouv-msg-resp-lbl">💬 Resposta do RH</div><div class="ouv-msg-resp-txt">'+m.resposta+'</div></div>'
        : '<div class="ouv-msg-pendente">⏳ Aguardando resposta do RH</div>')+
    '</div>';
  }).join('');
};
})();

