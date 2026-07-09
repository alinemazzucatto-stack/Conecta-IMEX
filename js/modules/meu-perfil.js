// ===== script: meu-perfil-js =====
// Tela do colaborador para ver seus dados cadastrais e editar as informações
// pessoais (contato, RG, estado civil, contato de emergência, dados bancários).
// Dados estruturais (cargo, setor, salário, admissão etc.) ficam só leitura —
// só o RH edita isso pela ficha em Gestão RH.
(function(){
'use strict';
if(window.__meuPerfilInit) return;
window.__meuPerfilInit = true;

// Se algo aqui dentro quebrar, mostra um aviso bem visível na tela em vez de
// falhar em silêncio (mais fácil de diagnosticar do que abrir o Console).
window.addEventListener('error', function(ev){
  if(!ev || !ev.filename || ev.filename.indexOf('meu-perfil.js') === -1) return;
  if(document.getElementById('meu-perfil-erro-banner')) return;
  var b = document.createElement('div');
  b.id = 'meu-perfil-erro-banner';
  b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#b91c1c;color:#fff;padding:12px 16px;font-family:monospace;font-size:12px;white-space:pre-wrap';
  b.textContent = '⚠️ Erro em meu-perfil.js: ' + ev.message + ' (linha ' + ev.lineno + ')';
  document.body.appendChild(b);
});

function getEmail(){
  try{
    return sessionStorage.getItem('userEmail') || (typeof emailUsuario==='function' ? emailUsuario() : '') || '';
  }catch(e){ return ''; }
}

function ensureSidebarIcon(){
  var sidebar = document.getElementById('sidebar');
  if(!sidebar) return;
  var item = document.getElementById('sb-meus-dados');
  if(!item){
    var spacer = sidebar.querySelector('.sb-spacer');
    item = document.createElement('div');
    item.className = 'sb-item';
    item.id = 'sb-meus-dados';
    item.title = 'Meus Dados';
    item.innerHTML = '<span>🪪</span><span class="sb-tip">Meus Dados</span>';
    item.onclick = function(ev){ if(ev){ev.preventDefault();ev.stopPropagation();} window.abrirMeusDados(); return false; };
    if(spacer) sidebar.insertBefore(item, spacer);
    else sidebar.appendChild(item);
  }
  // Outros scripts legados escondem TODOS os itens da sidebar que não conhecem
  // (whitelist própria deles). Reafirma a visibilidade sempre que checarmos.
  item.style.setProperty('display','flex','important');
  item.style.removeProperty('visibility');
  item.style.removeProperty('opacity');
}

function ensureView(){
  var v = document.getElementById('view-meus-dados');
  if(!v){
    v = document.createElement('div');
    v.id = 'view-meus-dados';
    v.className = 'page';
    v.style.display = 'none';
    (document.querySelector('.main-area') || document.body).appendChild(v);
  }
  return v;
}

function esconderOutras(){
  document.querySelectorAll('[id^="view-"]').forEach(function(el){
    if(el.id !== 'view-meus-dados'){
      el.classList.remove('active','dev-active','beneficios-force-active');
      el.style.setProperty('display','none','important');
    }
  });
  var hero = document.getElementById('mainHero');
  if(hero) hero.style.setProperty('display','none','important');
}

function esc(v){ return String(v ?? '').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

function iniciaisNome(nome){
  var partes = String(nome||'').trim().split(/\s+/).filter(Boolean);
  if(!partes.length) return '?';
  var ini = partes[0][0];
  if(partes.length > 1) ini += partes[partes.length-1][0];
  return ini.toUpperCase();
}

// Redimensiona a imagem no navegador antes de salvar (evita fotos gigantes no Firestore).
function redimensionarImagem(file, maxLado, cb){
  var reader = new FileReader();
  reader.onload = function(e){
    var img = new Image();
    img.onload = function(){
      var w = img.width, h = img.height;
      if(w > h && w > maxLado){ h = Math.round(h * maxLado / w); w = maxLado; }
      else if(h > maxLado){ w = Math.round(w * maxLado / h); h = maxLado; }
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

var colabAtual = null;

function campoLeitura(label, valor){
  return '<div class="field"><label>'+esc(label)+'</label><input type="text" value="'+esc(valor||'—')+'" disabled style="background:var(--bg-light);color:var(--ink-60)"></div>';
}
function campoTexto(id, label, valor, placeholder){
  return '<div class="field"><label>'+esc(label)+'</label><input id="'+id+'" type="text" value="'+esc(valor)+'" placeholder="'+esc(placeholder||'')+'"></div>';
}
function campoSelect(id, label, valor, opcoes){
  return '<div class="field"><label>'+esc(label)+'</label><select id="'+id+'"><option value="">—</option>'+
    opcoes.map(function(o){ return '<option'+(o===valor?' selected':'')+'>'+esc(o)+'</option>'; }).join('')+
  '</select></div>';
}

async function carregarMeusDados(){
  var v = ensureView();
  v.innerHTML =
    '<div class="hero" style="background:linear-gradient(135deg,#0B1F5B,#0047FF)">'+
      '<div class="h-content"><div class="h-eyebrow">Seu cadastro</div><h1>MEUS DADOS</h1>'+
      '<p>Veja seus dados cadastrais e mantenha suas informações pessoais atualizadas.</p></div>'+
    '</div>'+
    '<div id="meusdados-body" style="padding:24px 0"><div style="text-align:center;padding:40px;color:var(--ink-30)">⏳ Carregando...</div></div>';

  var email = getEmail();
  var body = document.getElementById('meusdados-body');
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
    colabAtual = colab;

    var fotoStyle = colab.foto
      ? 'background-image:url(' + colab.foto + ');background-size:cover;background-position:center'
      : 'background:linear-gradient(135deg,#4338ca,#818cf8);display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:800';

    body.innerHTML =
      '<div class="card" style="margin-bottom:16px">'+
        '<div class="card-body" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">'+
          '<label for="md-foto-input" style="cursor:pointer;position:relative;display:block" title="Clique para trocar a foto">'+
            '<div id="md-foto-avatar" style="width:84px;height:84px;border-radius:50%;'+fotoStyle+'">'+(colab.foto ? '' : esc(iniciaisNome(colab.nome)))+'</div>'+
            '<div style="position:absolute;bottom:-2px;right:-2px;width:28px;height:28px;border-radius:50%;background:#4338ca;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;border:2px solid #fff">📷</div>'+
          '</label>'+
          '<input type="file" id="md-foto-input" accept="image/*" style="display:none">'+
          '<div>'+
            '<div style="font-weight:800;font-size:16px;color:var(--ink)">'+esc(colab.nome)+'</div>'+
            '<div style="font-size:12px;color:var(--ink-60);margin-top:2px">Clique na foto para atualizar</div>'+
            '<div id="md-foto-status" style="font-size:11px;margin-top:6px"></div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="card" style="margin-bottom:16px">'+
        '<div class="card-head"><div class="cht"><h2>🏢 Dados cadastrais</h2><p>Controlados pelo RH — fale com o RH se algo estiver errado.</p></div></div>'+
        '<div class="card-body"><div class="fg">'+
          campoLeitura('Nome completo', colab.nome)+
          campoLeitura('Matrícula', colab.matricula)+
          campoLeitura('E-mail corporativo', colab.email)+
          campoLeitura('Função / Cargo', colab.funcao)+
          campoLeitura('Setor', colab.setor)+
          campoLeitura('Unidade', colab.unidade)+
          campoLeitura('Tipo de Contrato', colab.tipoContrato || (colab.clt === 'Sim' ? 'CLT' : 'PJ'))+
          campoLeitura('Data de Admissão', colab.admissao ? new Date(colab.admissao+'T00:00:00').toLocaleDateString('pt-BR') : '')+
        '</div></div>'+
      '</div>'+
      '<div class="card">'+
        '<div class="card-head"><div class="cht"><h2>✏️ Dados pessoais</h2><p>Você pode editar essas informações a qualquer momento.</p></div></div>'+
        '<div class="card-body">'+
          '<div class="fg">'+
            campoTexto('md-telefone', 'Telefone / Celular', colab.telefone, '(43) 99999-9999')+
            campoTexto('md-email-pessoal', 'E-mail Pessoal', colab.emailPessoal, 'nome@gmail.com')+
            campoTexto('md-rg', 'RG', colab.rg, '00.000.000-0')+
            campoSelect('md-estadocivil', 'Estado Civil', colab.estadoCivil, ['Solteiro(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União Estável'])+
            campoTexto('md-emerg-nome', 'Contato de Emergência', colab.emergenciaNome, 'Nome do contato')+
            campoTexto('md-emerg-tel', 'Telefone de Emergência', colab.emergenciaTelefone, '(43) 99999-9999')+
          '</div>'+
          '<div class="fg" style="margin-top:4px">'+
            '<div class="field full" style="grid-column:1/-1;margin-top:6px;padding-top:14px;border-top:1px solid var(--border)"><strong style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.04em">🏦 Dados bancários</strong></div>'+
            campoTexto('md-banco', 'Banco', colab.banco, 'Ex: Itaú')+
            campoTexto('md-agencia', 'Agência', colab.agencia, '0000')+
            campoTexto('md-conta', 'Conta', colab.conta, '00000-0')+
            campoSelect('md-tipoconta', 'Tipo de Conta', colab.tipoConta, ['Corrente','Poupança','Salário'])+
          '</div>'+
          '<div style="display:flex;justify-content:flex-end;margin-top:20px">'+
            '<button type="button" class="btn btn-p" id="md-salvar-btn" onclick="window.salvarMeusDados()">💾 Salvar alterações</button>'+
          '</div>'+
          '<div id="meusdados-status" style="margin-top:10px;font-size:12px"></div>'+
        '</div>'+
      '</div>';

    var fotoInput = document.getElementById('md-foto-input');
    if(fotoInput){
      fotoInput.onchange = function(){
        var file = fotoInput.files && fotoInput.files[0];
        if(!file) return;
        var status = document.getElementById('md-foto-status');
        if(status) status.textContent = '⏳ Enviando foto…';
        redimensionarImagem(file, 240, async function(dataUrl){
          var avatar = document.getElementById('md-foto-avatar');
          if(avatar){
            avatar.style.background = 'url(' + dataUrl + ')';
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
            avatar.textContent = '';
          }
          try{
            await db.collection(col('grh_colabs')).doc(colabAtual._id).set({ foto: dataUrl }, { merge: true });
            colabAtual.foto = dataUrl;
            if(typeof window.grhGetColabs === 'function') { try{ await window.grhGetColabs(true); }catch(e){} }
            if(status) status.innerHTML = '<span style="color:#15803d">✅ Foto atualizada!</span>';
          }catch(e){
            if(status) status.innerHTML = '<span style="color:#b91c1c">❌ Erro ao salvar a foto: '+esc(e.message)+'</span>';
          }
        });
      };
    }
  }catch(e){
    body.innerHTML = '<div class="empty"><div class="ei">⚠️</div>Erro ao carregar seus dados: '+esc(e.message)+'</div>';
  }
}

window.salvarMeusDados = async function(){
  if(!colabAtual || !colabAtual._id){ alert('Não foi possível identificar seu cadastro.'); return; }
  var g = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var status = document.getElementById('meusdados-status');
  var btn = document.getElementById('md-salvar-btn');

  // Apenas os campos pessoais — nunca mexe em cargo/salário/setor/admissão etc.
  var dados = {
    telefone: g('md-telefone'),
    emailPessoal: g('md-email-pessoal'),
    rg: g('md-rg'),
    estadoCivil: g('md-estadocivil'),
    emergenciaNome: g('md-emerg-nome'),
    emergenciaTelefone: g('md-emerg-tel'),
    banco: g('md-banco'),
    agencia: g('md-agencia'),
    conta: g('md-conta'),
    tipoConta: g('md-tipoconta')
  };

  if(btn){ btn.disabled = true; btn.textContent = 'Salvando…'; }
  if(status) status.innerHTML = '';

  try{
    await db.collection(col('grh_colabs')).doc(colabAtual._id).set(dados, { merge: true });
    Object.assign(colabAtual, dados);
    if(typeof window.grhGetColabs === 'function') { try{ await window.grhGetColabs(true); }catch(e){} }
    if(status) status.innerHTML = '<span style="color:#15803d">✅ Dados salvos com sucesso!</span>';
    if(typeof addNotif === 'function') addNotif('Seus dados pessoais foram atualizados.', 'success');
  }catch(e){
    if(status) status.innerHTML = '<span style="color:#b91c1c">❌ Erro ao salvar: '+esc(e.message)+'</span>';
  }finally{
    if(btn){ btn.disabled = false; btn.textContent = '💾 Salvar alterações'; }
  }
};

window.abrirMeusDados = function(){
  esconderOutras();
  var v = ensureView();
  v.classList.add('active');
  v.style.setProperty('display','block','important');
  v.style.setProperty('visibility','visible','important');
  v.style.setProperty('opacity','1','important');
  document.querySelectorAll('.sb-item[id^="sb-"]').forEach(function(sb){
    sb.classList.toggle('active', sb.id === 'sb-meus-dados');
  });
  var pi = document.getElementById('tPageIcon'); if(pi){ pi.textContent = '🪪'; pi.style.display = ''; }
  var pt = document.getElementById('tPageTitle'); if(pt) pt.textContent = 'Meus Dados';
  carregarMeusDados();
};

// REMOVED: Performance optimization - 900ms setInterval polling
// setInterval(ensureSidebarIcon, 900);
setTimeout(ensureSidebarIcon, 300);
// Reforço: reage na hora se algum outro script reconstruir a sidebar
// (mesmo padrão que resolveu o sumiço dos botões em Remuneração).
try{
  var moSidebar = new MutationObserver(function(){ ensureSidebarIcon(); });
  moSidebar.observe(document.body, { childList:true, subtree:true });
}catch(e){}

// Diagnóstico visível: se depois de alguns segundos o ícone ainda não existir
// (sem erro de JS), mostra na tela o motivo exato em vez de falhar em silêncio.
setTimeout(function(){
  if(document.getElementById('sb-meus-dados')) return; // deu certo, nada a avisar
  if(document.getElementById('meu-perfil-erro-banner')) return;
  var sidebar = document.getElementById('sidebar');
  var motivo = !sidebar ? 'elemento #sidebar não encontrado na página' :
    (!sidebar.querySelector('.sb-spacer') ? 'elemento .sb-spacer não encontrado dentro da sidebar' : 'motivo desconhecido');
  var b = document.createElement('div');
  b.id = 'meu-perfil-erro-banner';
  b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#b45309;color:#fff;padding:12px 16px;font-family:monospace;font-size:12px;white-space:pre-wrap';
  b.textContent = '⚠️ Ícone "Meus Dados" não foi criado — ' + motivo;
  document.body.appendChild(b);
}, 4000);

// REMOVED: Performance optimization - 400ms setInterval polling
// Mantém a view estável caso o vigia de navegação do sistema tente escondê-la
/*setInterval(function(){
  var v = document.getElementById('view-meus-dados');
  if(v && v.classList.contains('active') && window.getComputedStyle(v).display === 'none'){
    v.style.setProperty('display','block','important');
  }
}, 400);*/
})();
