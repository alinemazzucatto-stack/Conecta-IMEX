// ===== script: meus-docs-js =====
(function(){
'use strict';
if(window.__meusDocsInit) return;
window.__meusDocsInit = true;

function getEmail(){
  try{
    return sessionStorage.getItem('userEmail') || (typeof emailUsuario==='function' ? emailUsuario() : '') || '';
  }catch(e){ return ''; }
}

function ensureSidebarIcon(){
  var sidebar = document.getElementById('sidebar');
  if(!sidebar) return;
  if(document.getElementById('sb-meus-documentos')) return;
  var spacer = sidebar.querySelector('.sb-spacer');
  var item = document.createElement('div');
  item.className = 'sb-item';
  item.id = 'sb-meus-documentos';
  item.title = 'Meus Documentos';
  item.innerHTML = '<span>📄</span><span class="sb-tip">Meus Documentos</span>';
  item.onclick = function(ev){ if(ev){ev.preventDefault();ev.stopPropagation();} window.abrirMeusDocumentos(); return false; };
  if(spacer) sidebar.insertBefore(item, spacer);
  else sidebar.appendChild(item);
}

function ensureView(){
  var v = document.getElementById('view-meus-documentos');
  if(!v){
    v = document.createElement('div');
    v.id = 'view-meus-documentos';
    v.className = 'page';
    v.style.display = 'none';
    (document.querySelector('.main-area') || document.body).appendChild(v);
  }
  return v;
}

function esconderOutras(){
  document.querySelectorAll('[id^="view-"]').forEach(function(el){
    if(el.id !== 'view-meus-documentos'){
      el.classList.remove('active','dev-active','beneficios-force-active');
      el.style.setProperty('display','none','important');
    }
  });
  var hero = document.getElementById('mainHero');
  if(hero) hero.style.setProperty('display','none','important');
}

var TIPOS_LABEL = {
  Sim: [['Holerite','📄'], ['Férias','🌴'], ['IR','🧮']],
  Não: [['Ordem de Serviço','📋'], ['Nota Fiscal','🧾'], ['IR','🧮']]
};

async function carregarMeusDocumentos(){
  var v = ensureView();
  v.innerHTML =
    '<div class="hero" style="background:linear-gradient(135deg,#0B1F5B,#0047FF)">'+
      '<div class="h-content"><div class="h-eyebrow">Seus documentos pessoais</div><h1>MEUS DOCUMENTOS</h1>'+
      '<p>Holerites, férias, ordens de serviço e notas fiscais enviados pelo RH para você.</p></div>'+
    '</div>'+
    '<div id="meusdocs-body" style="padding:24px 0"><div style="text-align:center;padding:40px;color:var(--ink-30)">⏳ Carregando...</div></div>';

  var email = getEmail();
  var body = document.getElementById('meusdocs-body');
  if(!email){
    body.innerHTML = '<div class="empty"><div class="ei">📭</div>Não foi possível identificar seu e-mail de login.</div>';
    return;
  }

  try{
    var colabs = typeof window.grhGetColabs === 'function' ? await window.grhGetColabs() : [];
    var colab = colabs.find(function(c){ return (c.email||'').toLowerCase() === email.toLowerCase(); });
    if(!colab){
      body.innerHTML = '<div class="empty"><div class="ei">📭</div>Nenhum cadastro de colaborador encontrado para o seu e-mail.</div>';
      return;
    }
    var clt = colab.clt === 'Sim' ? 'Sim' : 'Não';
    var tipos = TIPOS_LABEL[clt];
    var prontuario = colab.prontuario || [];

    var html = '';
    tipos.forEach(function(t){
      var nomeTipo = t[0], icone = t[1];
      var docs = prontuario.filter(function(d){ return d.tipoDoc === nomeTipo; })
        .sort(function(a,b){ return (b.data||'').localeCompare(a.data||''); });
      html += '<div class="card" style="margin-bottom:16px"><div class="card-head"><div class="cht"><h2>'+icone+' '+nomeTipo+'</h2><p>'+docs.length+' documento(s) disponíveis</p></div></div><div class="card-body">';
      if(!docs.length){
        html += '<div style="text-align:center;padding:24px;color:var(--ink-30)">Nenhum documento enviado ainda.</div>';
      } else {
        html += '<div class="doc-list" style="display:flex;flex-direction:column;gap:8px">' + docs.map(function(d){
          var ico = (d.tipo||'').includes('pdf') ? '📄' : '🖼️';
          var data = d.data ? new Date(d.data).toLocaleDateString('pt-BR') : '—';
          var kb = d.tamanho ? (d.tamanho/1024).toFixed(1)+' KB' : '';
          return '<div class="doc-item"><div class="doc-info"><span>'+ico+'</span><div><div style="font-weight:600">'+d.nome+'</div>'+
            '<div style="font-size:10px;color:var(--ink-30)">'+data+(kb?' · '+kb:'')+'</div></div></div>'+
            '<div class="doc-actions"><a href="'+d.content+'" download="'+d.nome+'" class="btn-doc-view" title="Baixar">📥 Baixar</a></div></div>';
        }).join('') + '</div>';
      }
      html += '</div></div>';
    });
    body.innerHTML = html;
  }catch(e){
    body.innerHTML = '<div class="empty"><div class="ei">⚠️</div>Erro ao carregar documentos: '+e.message+'</div>';
  }
}

window.abrirMeusDocumentos = function(){
  esconderOutras();
  var v = ensureView();
  v.classList.add('active');
  v.style.setProperty('display','block','important');
  v.style.setProperty('visibility','visible','important');
  v.style.setProperty('opacity','1','important');
  document.querySelectorAll('.sb-item[id^="sb-"]').forEach(function(sb){
    sb.classList.toggle('active', sb.id === 'sb-meus-documentos');
  });
  var pi = document.getElementById('tPageIcon'); if(pi){ pi.textContent = '📄'; pi.style.display = ''; }
  var pt = document.getElementById('tPageTitle'); if(pt) pt.textContent = 'Meus Documentos';
  carregarMeusDocumentos();
};

setInterval(ensureSidebarIcon, 900);
setTimeout(ensureSidebarIcon, 300);

// Mantém a view estável caso o vigia de navegação do sistema tente escondê-la
setInterval(function(){
  var v = document.getElementById('view-meus-documentos');
  if(v && v.classList.contains('active') && window.getComputedStyle(v).display === 'none'){
    v.style.setProperty('display','block','important');
  }
}, 400);
})();

