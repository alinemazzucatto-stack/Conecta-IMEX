// ===== script: ouv-v3-js =====
(function(){
'use strict';
if(window.__ouvV3Fix) return;
window.__ouvV3Fix = true;

/* Categoria — mesma lógica original, agora também alterna classe
   para o selo de selecionado (✓) via CSS. */
window.ouvSelecionarCategoria = function(cat){
  window._ouvCatSelecionada = cat;
  var hidden = document.getElementById('ouv-categoria');
  if(hidden) hidden.value = cat;
  var cats = ['sugestao','elogio','reclamacao','duvida'];
  var cores = {sugestao:'#0047FF', elogio:'#22C58B', reclamacao:'#f59e0b', duvida:'#6b7280'};
  cats.forEach(function(c){
    var el = document.getElementById('ouv-cat-' + c);
    if(!el) return;
    if(c === cat){
      el.style.borderColor = cores[c];
      el.style.background  = cores[c] + '12';
      el.style.color       = cores[c];
      el.classList.add('ouv-selected');
    } else {
      el.style.borderColor = 'var(--border)';
      el.style.background  = '';
      el.style.color       = 'var(--ink)';
      el.classList.remove('ouv-selected');
    }
  });
};

/* Identificação — mesma lógica original, com selo de selecionado */
window.ouvSelecionarId = function(tipo){
  window._ouvIdTipo = tipo;
  var hidden = document.getElementById('ouv-anonimo');
  if(hidden) hidden.value = tipo === 'anonimo' ? 'sim' : 'nao';
  var elAnon = document.getElementById('ouv-id-anonimo');
  var elId   = document.getElementById('ouv-id-identificado');
  if(tipo === 'anonimo'){
    if(elAnon){ elAnon.style.borderColor = '#0047FF'; elAnon.style.background = 'rgba(0,71,255,.05)'; elAnon.classList.add('ouv-id-selected'); }
    if(elId){ elId.style.borderColor = 'var(--border)'; elId.style.background = ''; elId.classList.remove('ouv-id-selected'); }
  } else {
    if(elId){ elId.style.borderColor = '#0047FF'; elId.style.background = 'rgba(0,71,255,.05)'; elId.classList.add('ouv-id-selected'); }
    if(elAnon){ elAnon.style.borderColor = 'var(--border)'; elAnon.style.background = ''; elAnon.classList.remove('ouv-id-selected'); }
  }
};

/* Botão de envio com estado de carregamento (spinner) */
var _origEnviar = window.ouvEnviar;
if(typeof _origEnviar === 'function'){
  window.ouvEnviar = async function(){
    var btn = document.querySelector('#ouv-card-envio .actions .btn-p, #ouv-card-envio > .card-body > button.btn-p');
    if(!btn) btn = document.querySelector('#ouv-card-envio button.btn-p');
    var original = btn ? btn.innerHTML : '';
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="ouv-send-spinner"><span></span><span></span><span></span></span>Enviando...'; }
    try{
      await _origEnviar();
    } finally {
      if(btn){ btn.disabled = false; btn.innerHTML = original; }
    }
  };
}
})();

// ===== script: ouv-v5-js =====
(function(){
'use strict';
if(window.__ouvV5Fix) return;
window.__ouvV5Fix = true;

function tempoRelativo(iso){
  var diff = Date.now() - new Date(iso).getTime();
  var min = Math.floor(diff / 60000), hr = Math.floor(min / 60), dia = Math.floor(hr / 24);
  if(dia > 0) return dia === 1 ? 'há 1 dia' : 'há ' + dia + ' dias';
  if(hr > 0) return hr === 1 ? 'há 1 hora' : 'há ' + hr + ' horas';
  if(min > 0) return min === 1 ? 'há 1 minuto' : 'há ' + min + ' minutos';
  return 'agora mesmo';
}

/* "Minhas Mensagens" como conversa em formato de chat */
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

  lista.innerHTML = '<div class="ouv-chat-thread">' + msgs.map(function(m, idx){
    var cat = catInfo[m.categoria] || {icon:'📣',cor:'#0047FF',label:m.categoria||''};
    var quando = tempoRelativo(m.criadoEm);
    var bolhaUser =
      '<div class="ouv-bubble-user" style="animation-delay:' + (idx*60) + 'ms">' +
        '<div class="ouv-bubble-meta"><span class="ouv-bubble-cat">' + cat.icon + ' ' + cat.label + '</span><span class="ouv-bubble-time">' + quando + '</span></div>' +
        '<div class="ouv-bubble-text">' + m.mensagem + '</div>' +
      '</div>';
    var bolhaResp = m.resposta
      ? ('<div class="ouv-bubble-rh" style="animation-delay:' + (idx*60+90) + 'ms">' +
          '<div class="ouv-bubble-avatar">RH</div>' +
          '<div class="ouv-bubble-rh-body"><div class="ouv-bubble-rh-lbl">Resposta do RH</div><div class="ouv-bubble-text">' + m.resposta + '</div></div>' +
        '</div>')
      : '<div class="ouv-bubble-pending">⏳ Aguardando resposta do RH</div>';
    return '<div class="ouv-thread-item">' + bolhaUser + bolhaResp + '</div>';
  }).join('') + '</div>';
};
})();


