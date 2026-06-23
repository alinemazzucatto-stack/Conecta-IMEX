// ===== script: (sem id) =====
// ══════════════════════════════════════════
// INTRANET
// ══════════════════════════════════════════
let intraPublicacoes = [];
let intraTabAtiva = 'todos';

function intraAbrirModal() {
  document.getElementById('intraModal').style.display = 'flex';
}
// Armazenar arquivos temporariamente
let _intraAnexos = [];

function intraHandleFiles(files) {
  Array.from(files).forEach(file => {
    if (file.size > 5 * 1024 * 1024) { addNotif(file.name + ' é maior que 5MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      _intraAnexos.push({ nome: file.name, tipo: file.type, dados: e.target.result, size: file.size });
      intraRenderAnexosPreview();
    };
    reader.readAsDataURL(file);
  });
}

function intraHandleDrop(e) {
  e.preventDefault();
  const zone = document.getElementById('intra-drop-zone');
  zone.style.borderColor = 'var(--border)'; zone.style.background = 'var(--bg)';
  intraHandleFiles(e.dataTransfer.files);
}

function intraRenderAnexosPreview() {
  const preview = document.getElementById('intra-anexos-preview');
  if (!preview) return;
  preview.innerHTML = _intraAnexos.map((a, i) => {
    const isImg = a.tipo.startsWith('image/');
    return '<div style="position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--border);background:var(--bg)">' +
      (isImg
        ? '<img src="' + a.dados + '" style="width:80px;height:70px;object-fit:cover;display:block"/>'
        : '<div style="width:80px;height:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px">' +
            '<div style="font-size:22px">' + (a.tipo.includes('pdf') ? '📄' : a.tipo.includes('sheet') || a.tipo.includes('excel') ? '📊' : '📎') + '</div>' +
            '<div style="font-size:9px;color:var(--ink-60);text-align:center;margin-top:4px;word-break:break-all;max-width:70px">' + a.nome.slice(0,14) + '</div>' +
          '</div>'
      ) +
      '<button onclick="intraRemoverAnexo(' + i + ')" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,.6);border:none;border-radius:50%;width:18px;height:18px;color:#fff;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>' +
    '</div>';
  }).join('');
}

function intraRemoverAnexo(i) {
  _intraAnexos.splice(i, 1);
  intraRenderAnexosPreview();
}

function intraToggleVagaExtras(tipo) {
  const extras = document.getElementById('intra-vaga-extras');
  if (extras) extras.style.display = tipo === 'vagas' ? 'block' : 'none';
}

function intraFecharModal() {
  document.getElementById('intraModal').style.display = 'none';
  document.getElementById('intra-titulo').value = '';
  document.getElementById('intra-url').value = '';
  document.getElementById('intra-descricao').value = '';
  document.getElementById('intra-destaque').checked = false;
  document.getElementById('intra-tipo').value = 'noticias';
  ['vaga-local','vaga-regime','vaga-salario','vaga-setor'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  intraToggleVagaExtras('noticias');
  _intraAnexos = [];
  intraRenderAnexosPreview();
}

async function intraPublicar() {
  const titulo = document.getElementById('intra-titulo').value.trim();
  if (!titulo) { alert('Informe o título.'); return; }
  const btn = document.getElementById('intra-btn-publicar-modal');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Publicando...'; }
  const pub = {
    id: crypto.randomUUID(),
    tipo: document.getElementById('intra-tipo').value,
    titulo,
    url: document.getElementById('intra-url').value.trim(),
    descricao: document.getElementById('intra-descricao').value.trim(),
    destaque: document.getElementById('intra-destaque').checked,
    autor: document.getElementById('pLabel')?.textContent || 'Colaborador',
    vagaCampos: document.getElementById('intra-tipo')?.value === 'vagas' ? {
      local:   document.getElementById('vaga-local')?.value.trim()   || '',
      regime:  document.getElementById('vaga-regime')?.value.trim()  || '',
      salario: document.getElementById('vaga-salario')?.value.trim() || '',
      setor:   document.getElementById('vaga-setor')?.value.trim()   || '',
    } : null,
    autorRole: role || 'colaborador',
    criadoEm: new Date().toISOString(),
    anexos: _intraAnexos.map(a => ({ nome: a.nome, tipo: a.tipo, dados: a.dados })),
    reacoes: { like: 0, heart: 0, clap: 0, wow: 0 },
    comentarios: []
  };
  try {
    await db.collection(col('intranet')).doc(pub.id).set(pub);
    addNotif('Publicação "' + titulo + '" criada!', 'success');
    log('Intranet', 'Nova publicação: ' + titulo, '📰');
  } catch(e) { console.warn('Firestore intranet:', e); }
  intraPublicacoes.unshift(pub);
  intraFecharModal();
  intraRender();
  intraUpdateStats();
  if (btn) { btn.disabled = false; btn.textContent = '📤 Publicar'; }
}

function intraSelecionar(t) {
  const el = document.querySelector('#intra-tabs [data-intra-tab="' + t + '"]');
  intraTab(t, el);
}

function intraTab(t, el) {
  intraTabAtiva = t;
  document.querySelectorAll('#intra-tabs .tab, #intra-tabs .intra-filter-card, #intra-tabs .intra-social-card').forEach(b => b.classList.remove('active'));
  if (!el) el = document.querySelector('#intra-tabs [data-intra-tab="' + t + '"]');
  if (el) el.classList.add('active');
  const feed     = document.getElementById('intra-feed');
  const vagaPane = document.getElementById('intra-vagas-pane');
  const orgPane = document.getElementById('intra-org-pane');
  const title = document.getElementById('intra-social-title');
  const sub = document.getElementById('intra-social-sub');
  const titles = {todos:['Feed Geral','Publicações recentes da empresa em formato de rede social.'], avisos:['Avisos','Comunicados oficiais publicados pelo RH.'], documentos:['Documentos','Arquivos e materiais úteis para consulta.'], noticias:['Notícias','Novidades internas da empresa.'], links:['Links úteis','Acessos rápidos para plataformas e sistemas.'], vagas:['Vagas internas','Oportunidades abertas para candidatura.'], organograma:['Trilhas de Carreira','Progressão de cargos por área e função.'], estrutura:['Organograma','Estrutura hierárquica da empresa.']};
  if (title && titles[t]) { title.textContent = titles[t][0]; sub.textContent = titles[t][1]; }
  if (t === 'vagas') {
    if (feed)     feed.style.display     = 'none';
    if (vagaPane) vagaPane.style.display = 'flex';
    if (orgPane)  orgPane.style.display  = 'none';
    vagaRenderPainel();
  } else if (t === 'estrutura') {
    if (feed)     { feed.style.display = 'flex'; feed.innerHTML = '<div class="card" style="padding:28px;border-left:4px solid #0047FF"><div style="font-size:34px;margin-bottom:8px">🏢</div><div style="font-size:20px;font-weight:900;color:var(--ink);margin-bottom:6px">Organograma da Empresa</div><div style="font-size:14px;color:var(--ink-60);line-height:1.6">Aqui podemos montar a estrutura hierárquica oficial da IMEX: diretoria, gerências, coordenações, líderes e equipes. Este card ficou separado das Trilhas de Carreira para não misturar evolução profissional com estrutura organizacional.</div></div>'; }
    if (vagaPane) vagaPane.style.display = 'none';
    if (orgPane)  orgPane.style.display  = 'none';
  } else if (t === 'organograma') {
    if (feed)     feed.style.display     = 'none';
    if (vagaPane) vagaPane.style.display = 'none';
    if (orgPane)  orgPane.style.display  = 'block';
    intraRenderOrganograma();
  } else {
    if (feed)     feed.style.display     = 'flex';
    if (vagaPane) vagaPane.style.display = 'none';
    if (orgPane)  orgPane.style.display  = 'none';
    intraRender();
  }
}

function intraRender() {
  window.intraPublicacoes = intraPublicacoes;
  const q = document.getElementById('intra-search')?.value.toLowerCase() || '';
  let lista = intraPublicacoes.filter(p => {
    if (intraTabAtiva !== 'todos' && p.tipo !== intraTabAtiva) return false;
    if (q && !p.titulo.toLowerCase().includes(q) && !(p.descricao||'').toLowerCase().includes(q)) return false;
    return true;
  });
  const feed = document.getElementById('intra-feed');
  if (!feed) return;
  if (!lista.length) {
    feed.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-30)"><div style="font-size:36px;margin-bottom:10px">🔍</div><div style="font-size:14px">Nenhuma publicação encontrada.</div></div>';
    return;
  }
  const icons = {noticias:'📰', avisos:'📢', links:'🔗', documentos:'📄', vagas:'💼'};
  const cores = {noticias:'var(--pur)', avisos:'#0066cc', links:'#3182ce', documentos:'#38a169', vagas:'#0B1F5B'};
  const reacEmojis = {like:'👍', heart:'❤️', clap:'👏', wow:'😮'};

  feed.innerHTML = lista.map(p => {
    const reac = p.reacoes || {like:0, heart:0, clap:0, wow:0};
    const coments = p.comentarios || [];
    const totalReac = Object.values(reac).reduce((a,b) => a+b, 0);

    // Anexos
    let anexosHtml = '';
    if (p.anexos && p.anexos.length) {
      const imgs = p.anexos.filter(a => a.tipo && a.tipo.startsWith('image/'));
      const docs = p.anexos.filter(a => !a.tipo || !a.tipo.startsWith('image/'));
      if (imgs.length) {
        anexosHtml += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' +
          imgs.map(a => '<img src="' + a.dados + '" style="max-height:160px;max-width:220px;border-radius:8px;object-fit:cover;cursor:pointer;border:1px solid var(--border)" onclick="intraVerImagem(this.src)" title="' + a.nome + '"/>').join('') +
        '</div>';
      }
      if (docs.length) {
        anexosHtml += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">' +
          docs.map(a => {
            const icon = a.tipo && a.tipo.includes('pdf') ? '📄' : a.tipo && (a.tipo.includes('sheet') || a.tipo.includes('excel')) ? '📊' : '📎';
            return '<a href="' + a.dados + '" download="' + a.nome + '" style="display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;text-decoration:none;color:var(--ink);font-size:12px;font-weight:600">' + icon + ' ' + a.nome + '</a>';
          }).join('') +
        '</div>';
      }
    }

    return '<div class="card" style="' + (p.destaque ? 'border-left:4px solid var(--pur);' : '') + '">' +
      '<div style="padding:18px 22px">' +
        '<div style="display:flex;gap:14px;align-items:flex-start">' +
          '<div style="width:44px;height:44px;border-radius:12px;background:' + (cores[p.tipo]||'#ccc') + '20;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">' + (icons[p.tipo]||'📄') + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">' +
              (p.destaque ? '<span style="font-size:10px;font-weight:700;background:#fef3c7;color:#92400e;border-radius:4px;padding:2px 7px">⭐ DESTAQUE</span>' : '') +
              '<span style="font-size:11px;font-weight:700;background:' + (cores[p.tipo]||'#ccc') + '20;color:' + (cores[p.tipo]||'#666') + ';border-radius:4px;padding:2px 7px;text-transform:uppercase">' + p.tipo + '</span>' +
            '</div>' +
            '<div style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:4px">' + p.titulo + '</div>' +
            (p.descricao ? '<div style="font-size:13px;color:var(--ink-60);line-height:1.5;margin-bottom:6px">' + p.descricao + '</div>' : '') +
            (p.url ? '<a href="' + p.url + '" target="_blank" style="font-size:12px;color:var(--pur);text-decoration:none;display:inline-flex;align-items:center;gap:4px">🔗 Acessar link <span style="font-size:10px">↗</span></a>' : '') +
            anexosHtml +
            '<div style="font-size:11px;color:var(--ink-30);margin-top:8px">Por ' + p.autor + ' · ' + new Date(p.criadoEm).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}) + '</div>' +
          '</div>' +
          ((role==='rh' || role==='rh-colaborador') ? '<button data-id="' + p.id + '" onclick="intraExcluir(this.dataset.id)" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:5px 9px;cursor:pointer;font-size:12px;flex-shrink:0;color:#991b1b">🗑</button>' : '') +
        '</div>' +
        // Reações + comentários
        '<div style="border-top:1px solid var(--border);margin-top:14px;padding-top:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
          Object.entries(reacEmojis).map(([k,e]) => {
            const bg = reac[k] > 0 ? 'var(--pur-soft)' : 'var(--bg)';
            const cnt = reac[k] > 0 ? '<span style="font-size:11px;font-weight:700;color:var(--pur-vibrant)">' + reac[k] + '</span>' : '';
            return '<button data-pid="' + p.id + '" data-reac="' + k + '" onclick="intraReagir(this.dataset.pid,this.dataset.reac)" style="background:' + bg + ';border:1px solid var(--border);border-radius:20px;padding:5px 11px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:4px">' + e + cnt + '</button>';
          }).join('') +
          '<div style="flex:1"></div>' +
          '<button data-pid="' + p.id + '" onclick="intraAbrirComentarios(this.dataset.pid)" style="background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:5px 14px;cursor:pointer;font-size:12px;font-weight:600;color:var(--ink-60);display:flex;align-items:center;gap:5px">💬 ' + (coments.length > 0 ? coments.length + ' comentário' + (coments.length > 1 ? 's' : '') : 'Comentar') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// Lightbox imagem
function intraVerImagem(src) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:pointer';
  overlay.onclick = () => document.body.removeChild(overlay);
  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,.5)';
  overlay.appendChild(img);
  document.body.appendChild(overlay);
}

// Reações
async function intraReagir(id, tipo) {
  const pub = intraPublicacoes.find(p => p.id === id);
  if (!pub) return;
  if (!pub.reacoes) pub.reacoes = {like:0, heart:0, clap:0, wow:0};
  pub.reacoes[tipo] = (pub.reacoes[tipo] || 0) + 1;
  try {
    await db.collection(col('intranet')).doc(id).update({ reacoes: pub.reacoes });
  } catch(e) {}
  intraRender();
}

// Comentários
let _intraComentPubId = null;

function intraAbrirComentarios(id) {
  _intraComentPubId = id;
  const pub = intraPublicacoes.find(p => p.id === id);
  if (!pub) return;
  document.getElementById('intra-coment-titulo').textContent = '💬 ' + pub.titulo;
  intraRenderComentarios(pub);
  document.getElementById('intraComentModal').style.display = 'flex';
}

function intraRenderComentarios(pub) {
  const lista = document.getElementById('intra-coment-lista');
  if (!lista) return;
  const coments = pub.comentarios || [];
  if (!coments.length) {
    lista.innerHTML = '<div style="text-align:center;padding:24px;color:var(--ink-30);font-size:13px">Nenhum comentário ainda. Seja o primeiro! 💬</div>';
    return;
  }
  lista.innerHTML = coments.map(c =>
    '<div style="display:flex;gap:10px;align-items:flex-start">' +
      '<div style="width:34px;height:34px;border-radius:50%;background:var(--pur-soft);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:var(--pur-vibrant);flex-shrink:0">' + (c.autor||'?')[0].toUpperCase() + '</div>' +
      '<div style="flex:1;background:var(--bg);border-radius:0 12px 12px 12px;padding:10px 14px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--ink);margin-bottom:3px">' + c.autor + ' <span style="font-weight:400;color:var(--ink-30);font-size:11px">· ' + new Date(c.criadoEm).toLocaleString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) + '</span></div>' +
        '<div style="font-size:13px;color:var(--ink);line-height:1.5">' + c.texto + '</div>' +
      '</div>' +
    '</div>'
  ).join('');
}

async function intraEnviarComentario() {
  const input = document.getElementById('intra-coment-input');
  const texto = input?.value.trim();
  if (!texto || !_intraComentPubId) return;
  const pub = intraPublicacoes.find(p => p.id === _intraComentPubId);
  if (!pub) return;
  if (!pub.comentarios) pub.comentarios = [];
  const coment = {
    autor: document.getElementById('pLabel')?.textContent || 'Colaborador',
    texto, criadoEm: new Date().toISOString()
  };
  pub.comentarios.push(coment);
  try {
    await db.collection(col('intranet')).doc(pub.id).update({ comentarios: pub.comentarios });
  } catch(e) {}
  input.value = '';
  intraRenderComentarios(pub);
  intraRender();
}

async function intraExcluir(id) {
  if (!confirm('Excluir esta publicação?')) return;
  try { await db.collection(col('intranet')).doc(id).delete(); } catch(e) {}
  intraPublicacoes = intraPublicacoes.filter(p => p.id !== id);
  intraRender(); intraUpdateStats();
}

function intraUpdateStats() {
  const tipos = {noticias:0, avisos:0, links:0, documentos:0, vagas:0};
  intraPublicacoes.forEach(p => { if (tipos[p.tipo]!==undefined) tipos[p.tipo]++; });
  const el_n = document.getElementById('intra-noticias-count');
  const el_l = document.getElementById('intra-links-count');
  const el_d = document.getElementById('intra-docs-count');
  const el_v = document.getElementById('intra-vagas-count');
  if (el_n) el_n.textContent = tipos.noticias + tipos.avisos;
  if (el_l) el_l.textContent = tipos.links;
  if (el_d) el_d.textContent = tipos.documentos;
  if (el_v) el_v.textContent = tipos.vagas;
  intraRenderHomeColaborador();
}


// ── ORGANOGRAMA — FUNÇÕES BASE ──
function getImexOrg() {
  return {
    tipo:'raiz', label:'PRESIDENTE', nome:'Gilberto Gallina', cor:'#1d4ed8',
    filhos:[
      {label:'CONSELHEIRO',nome:'Jacir Paris',     cor:'#1d4ed8'},
      {label:'CONSELHEIRO',nome:'Rodrigo Torres',  cor:'#1d4ed8'},
      {label:'CONSELHEIRO',nome:'Roberval Moreno', cor:'#1d4ed8'},
      {label:'CONSELHEIRO',nome:'Ricardo Honorio', cor:'#1d4ed8'}
    ],
    operacional:{
      label:'DIRETOR GERAL', nome:'Marcio Paiva', cor:'#0047FF',
      filhos:[
        {label:'CTO',               nome:'Saulo Lima',       cor:'#0047FF', setor:'TI / Desenvolvimento'},
        {label:'RECURSOS HUMANOS',  cor:'#0066cc', setor:'Recursos Humanos',
          filhos:[
            {label:'COORD. DE RH', nome:'Rafaela Kersul', cor:'#0066cc'},
            {label:'COORD. DE RH', nome:'Vania Miotto',   cor:'#0066cc'}
          ]
        },
        {label:'SUPORTE E CONTRATOS', cor:'#0099ff', setor:'Suporte',
          filhos:[
            {label:'GER. SUPORTE GESTAO',  nome:'Luis Sanches',      cor:'#0099ff'},
            {label:'GER. SUPORTE DISTRIB', nome:'Francieli Gallina', cor:'#0099ff'}
          ]
        },
        {label:'ADM. E FINANCEIRO', cor:'#22C58B', setor:'Administrativo',
          filhos:[
            {label:'COORD. ADM. FINANCEIRO', nome:'Glaucia Azevedo', cor:'#22C58B'}
          ]
        },
        {label:'MAQUINA DE VENDAS', cor:'#f59e0b', setor:'Comercial',
          filhos:[
            {label:'GERENTE COMERCIAL', nome:'Rafael', cor:'#f59e0b'}
          ]
        },
        {label:'MARKETING E PARCERIAS', cor:'#ec4899', setor:'Marketing',
          filhos:[
            {label:'GER. MKT E PARCERIAS', nome:'Halex', cor:'#ec4899'}
          ]
        },
        {label:'DIRETOR COMERCIAL', nome:'Giovany Gallina', cor:'#0047FF', setor:'Comercial'}
      ]
    }
  };
}

function orgInjectCSS() {
  if (document.getElementById('org-tree-style')) return;
  const st = document.createElement('style');
  st.id = 'org-tree-style';
  st.textContent = [
    '.org-tree{display:flex;flex-direction:column;align-items:center;gap:0;padding:0;font-family:Inter,Montserrat,sans-serif}',
    '.org-branch{display:flex;flex-direction:column;align-items:center}',
    '.org-node-box{border-radius:14px;padding:10px 16px;text-align:center;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(0,0,0,.12);min-width:130px;max-width:175px;position:relative;z-index:2;color:#fff}',
    '.org-node-box:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(0,0,0,.22)!important}',
    '.org-node-box .lbl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.75;margin-bottom:4px}',
    '.org-node-box .nome{font-size:12px;font-weight:700;line-height:1.3}',
    '.org-node-box .av{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;margin:0 auto 8px;border:2px solid rgba(255,255,255,.35)}',
    '.org-vline{width:2px;background:#cbd5e1;margin:0 auto;min-height:32px}',
    '.org-children{display:flex;gap:20px;align-items:flex-start;justify-content:center}',
    '.org-section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--ink-30);border-bottom:2px dashed var(--border);padding-bottom:6px;margin-bottom:20px;width:580px;text-align:center}',
    '.org-divider{border-top:2px dashed #e2e8f0;margin:36px 0 28px;width:100%;max-width:860px;position:relative;text-align:center}',
    '.org-divider span{position:relative;top:-10px;background:#f8f7ff;padding:0 14px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--ink-30)}'
  ].join('');
  document.head.appendChild(st);
}

function orgMakeBox(node, setores) {
  var cor = node.cor || '#0047FF';
  var av  = (node.nome || node.label || '?')[0].toUpperCase();
  var setor = node.setor;
  var membros = setor ? Object.values(setores[setor] || {}).reduce(function(s,a){return s+a.length;},0) : 0;
  var click = setor
    ? 'if(typeof orgAbrirModalSetorByName==="function")orgAbrirModalSetorByName(' + JSON.stringify(setor) + ',' + JSON.stringify(cor) + ')'
    : node.nome
      ? 'if(typeof orgAbrirModalPessoa==="function")orgAbrirModalPessoa(' + JSON.stringify(node.nome) + ',' + JSON.stringify(node.label) + ',' + JSON.stringify(cor) + ')'
      : '';
  return '<div class="org-node-box" style="background:' + cor + ';box-shadow:0 4px 16px ' + cor + '40"' +
    (click ? ' onclick="' + click + '"' : '') + '>' +
    '<div class="av">' + av + '</div>' +
    '<div class="lbl">' + (node.label || '') + '</div>' +
    (node.nome ? '<div class="nome">' + node.nome + '</div>' : '') +
    (membros > 0 ? '<div style="font-size:10px;opacity:.7;margin-top:4px">' + membros + ' colab.</div>' : '') +
    '</div>';
}

function orgBuildBranch(node, setores) {
  var box    = orgMakeBox(node, setores);
  var filhos = node.filhos || [];
  if (!filhos.length) return '<div class="org-branch">' + box + '</div>';
  var cor = node.cor || '#0047FF';
  var vline = '<div class="org-vline" style="background:' + cor + '70"></div>';
  var filhosHTML = filhos.map(function(f) {
    if (f.filhos && f.filhos.length) return orgBuildBranch(f, setores);
    var fBox = orgMakeBox(f, setores);
    return '<div class="org-branch">' +
      '<div class="org-vline" style="background:' + f.cor + '70;min-height:28px"></div>' +
      fBox + '</div>';
  }).join('');
  return '<div class="org-branch">' + box + vline +
    '<div style="position:relative"><div class="org-children">' + filhosHTML + '</div></div>' +
    '</div>';
}

// ── ORGANOGRAMA / TRILHA DE CARREIRA (INTRANET) ──
let _intraOrgSetores = null;
let _intraOrgAtualSetor = null; // setor aberto na trilha
let _intraOrgOrdenando = false;


// Normaliza cargos vindos do Firestore/localStorage para evitar cartões "undefined"
// e manter clique/edição funcionando mesmo quando dados antigos vierem com chaves diferentes.
function intraOrgSafeText(v, fallback = '') {
  if (v === undefined || v === null) return fallback;
  const t = String(v).trim();
  return t && t.toLowerCase() !== 'undefined' && t.toLowerCase() !== 'null' ? t : fallback;
}
function intraOrgNormalizarCargo(cargo, idx = 0) {
  if (typeof cargo === 'string') cargo = { nome: cargo };
  cargo = cargo || {};
  const nome = intraOrgSafeText(cargo.nome ?? cargo.cargo ?? cargo.titulo ?? cargo.title ?? cargo.name, 'Cargo sem nome');
  const nivelNum = parseInt(cargo.nivel ?? cargo.level ?? cargo.grade ?? 1, 10);
  const ordemNum = parseInt(cargo.ordem ?? cargo.order ?? (idx + 1), 10);
  return {
    ...cargo,
    nome,
    nivel: Number.isFinite(nivelNum) && nivelNum > 0 ? nivelNum : 1,
    ordem: Number.isFinite(ordemNum) && ordemNum > 0 ? ordemNum : idx + 1
  };
}
function intraOrgNormalizarSetor(setor) {
  setor = setor || {};
  const cargos = Array.isArray(setor.cargos) ? setor.cargos.map(intraOrgNormalizarCargo) : [];
  return { ...setor, cargos };
}
function intraOrgNormKey(v) {
  return intraOrgSafeText(v).toLowerCase().trim();
}

// Estrutura padrão de setores com hierarquia por ordem
const IMEX_SETORES_DEFAULT = [
  { id:'dev_web', nome:'Desenvolvimento de Software', area:'Tecnologia / Desenvolvimento', trilha:'Desenvolvimento de Software', cor:'#0047FF', ordem:1, lider:'Gerente de Tecnologia',
    cargos:[
      {nome:'Desenvolvedor Web Júnior', nivel:2, ordem:1},
      {nome:'Desenvolvedor Web Pleno', nivel:3, ordem:2},
      {nome:'Desenvolvedor Web Sênior', nivel:4, ordem:3},
      {nome:'Tech Lead / Líder Técnico', nivel:5, ordem:4},
      {nome:'Coordenador de Desenvolvimento', nivel:5, ordem:5},
      {nome:'Gerente de Tecnologia', nivel:6, ordem:6}
    ]},
  { id:'dev_delphi', nome:'Desenvolvimento Delphi', area:'Tecnologia / Desenvolvimento', trilha:'Desenvolvimento Delphi', cor:'#0B1F5B', ordem:2, lider:'Coordenador de Sistemas',
    cargos:[
      {nome:'Desenvolvedor Delphi Júnior', nivel:2, ordem:1},
      {nome:'Desenvolvedor Delphi Pleno', nivel:3, ordem:2},
      {nome:'Desenvolvedor Delphi Sênior', nivel:4, ordem:3},
      {nome:'Especialista Delphi', nivel:4, ordem:4},
      {nome:'Líder Técnico', nivel:5, ordem:5},
      {nome:'Coordenador de Sistemas', nivel:5, ordem:6}
    ]},
  { id:'programacao_geral', nome:'Programação Geral', area:'Tecnologia / Desenvolvimento', trilha:'Programação Geral', cor:'#2563eb', ordem:3, lider:'Tech Lead',
    cargos:[
      {nome:'Programador Júnior', nivel:2, ordem:1},
      {nome:'Programador Pleno', nivel:3, ordem:2},
      {nome:'Programador Sênior', nivel:4, ordem:3},
      {nome:'Analista Desenvolvedor', nivel:3, ordem:4},
      {nome:'Tech Lead', nivel:5, ordem:5}
    ]},
  { id:'suporte_tecnico', nome:'Suporte Técnico', area:'Suporte / Customer Experience', trilha:'Suporte Técnico', cor:'#0099ff', ordem:4, lider:'Gerente de Suporte',
    cargos:[
      {nome:'Analista de Suporte Júnior', nivel:2, ordem:1},
      {nome:'Analista de Suporte Pleno', nivel:3, ordem:2},
      {nome:'Analista de Suporte Sênior', nivel:4, ordem:3},
      {nome:'Líder de Suporte', nivel:5, ordem:4},
      {nome:'Coordenador de Suporte', nivel:5, ordem:5},
      {nome:'Gerente de Suporte', nivel:6, ordem:6}
    ]},
  { id:'customer_success', nome:'Sucesso do Cliente', area:'Suporte / Customer Experience', trilha:'Sucesso do Cliente', cor:'#06b6d4', ordem:5, lider:'Gerente de Customer Success',
    cargos:[
      {nome:'Assistente de Sucesso do Cliente', nivel:2, ordem:1},
      {nome:'Analista de Sucesso do Cliente Júnior', nivel:2, ordem:2},
      {nome:'Analista de Sucesso do Cliente Pleno', nivel:3, ordem:3},
      {nome:'Analista de Sucesso do Cliente Sênior', nivel:4, ordem:4},
      {nome:'Coordenador de Customer Success', nivel:5, ordem:5},
      {nome:'Gerente de Customer Success', nivel:6, ordem:6}
    ]},
  { id:'projetos', nome:'Projetos', area:'Gestão de Produtos e Projetos', trilha:'Projetos', cor:'#8b5cf6', ordem:6, lider:'Coordenador de Projetos',
    cargos:[
      {nome:'Assistente de Projetos', nivel:2, ordem:1},
      {nome:'Analista de Projetos', nivel:3, ordem:2},
      {nome:'Gerente de Projetos', nivel:6, ordem:3},
      {nome:'PMO', nivel:5, ordem:4},
      {nome:'Coordenador de Projetos', nivel:5, ordem:5}
    ]},
  { id:'produto', nome:'Produto', area:'Gestão de Produtos e Projetos', trilha:'Produto', cor:'#7c3aed', ordem:7, lider:'Head de Produto',
    cargos:[
      {nome:'Assistente de Produto', nivel:2, ordem:1},
      {nome:'Product Owner Júnior', nivel:2, ordem:2},
      {nome:'Product Owner Pleno', nivel:3, ordem:3},
      {nome:'Product Owner Sênior', nivel:4, ordem:4},
      {nome:'Product Manager', nivel:5, ordem:5},
      {nome:'Head de Produto', nivel:6, ordem:6}
    ]},
  { id:'rh_trilha', nome:'RH', area:'Recursos Humanos', trilha:'RH', cor:'#22C58B', ordem:8, lider:'Gerente de Recursos Humanos',
    cargos:[
      {nome:'Assistente de Recursos Humanos', nivel:2, ordem:1},
      {nome:'Analista de Recursos Humanos Júnior', nivel:2, ordem:2},
      {nome:'Analista de Recursos Humanos Pleno', nivel:3, ordem:3},
      {nome:'Analista de Recursos Humanos Sênior', nivel:4, ordem:4},
      {nome:'Coordenador de Recursos Humanos', nivel:5, ordem:5},
      {nome:'Gerente de Recursos Humanos', nivel:6, ordem:6}
    ]},
  { id:'administrativo', nome:'Administrativo', area:'Administrativo', trilha:'Administrativo', cor:'#f59e0b', ordem:9, lider:'Coordenador Administrativo',
    cargos:[
      {nome:'Recepcionista', nivel:2, ordem:1},
      {nome:'Assistente Administrativo', nivel:2, ordem:2},
      {nome:'Analista Administrativo', nivel:3, ordem:3},
      {nome:'Supervisor Administrativo', nivel:4, ordem:4},
      {nome:'Coordenador Administrativo', nivel:5, ordem:5}
    ]},
  { id:'marketing_trilha', nome:'Marketing', area:'Marketing', trilha:'Marketing', cor:'#ec4899', ordem:10, lider:'Gerente de Marketing',
    cargos:[
      {nome:'Assistente de Marketing', nivel:2, ordem:1},
      {nome:'Analista de Marketing Júnior', nivel:2, ordem:2},
      {nome:'Analista de Marketing Pleno', nivel:3, ordem:3},
      {nome:'Analista de Marketing Sênior', nivel:4, ordem:4},
      {nome:'Coordenador de Marketing', nivel:5, ordem:5},
      {nome:'Gerente de Marketing', nivel:6, ordem:6}
    ]},
  { id:'qualidade_trilha', nome:'Qualidade', area:'Qualidade', trilha:'Qualidade', cor:'#0066cc', ordem:11, lider:'Gerente de Qualidade',
    cargos:[
      {nome:'Assistente de Qualidade', nivel:2, ordem:1},
      {nome:'Analista de Qualidade Júnior', nivel:2, ordem:2},
      {nome:'Analista de Qualidade Pleno', nivel:3, ordem:3},
      {nome:'Analista de Qualidade Sênior', nivel:4, ordem:4},
      {nome:'Coordenador de Qualidade', nivel:5, ordem:5},
      {nome:'Gerente de Qualidade', nivel:6, ordem:6}
    ]},
  { id:'pesquisas_fiscais', nome:'Pesquisas Fiscais', area:'Fiscal / Pesquisas Fiscais', trilha:'Pesquisas Fiscais', cor:'#dc2626', ordem:12, lider:'Gerente Fiscal',
    cargos:[
      {nome:'Assistente Fiscal', nivel:2, ordem:1},
      {nome:'Assistente de Pesquisas Fiscais', nivel:2, ordem:2},
      {nome:'Analista Fiscal', nivel:3, ordem:3},
      {nome:'Encarregada de Pesquisas Fiscais', nivel:4, ordem:4},
      {nome:'Coordenador Fiscal', nivel:5, ordem:5},
      {nome:'Gerente Fiscal', nivel:6, ordem:6}
    ]}
];

async function intraOrgGetSetores(force) {
  if (_intraOrgSetores && !force) return _intraOrgSetores;
  try {
    const snap = await db.collection(col('org_setores')).orderBy('ordem').get();
    if (snap.empty) {
      const batch = db.batch();
      IMEX_SETORES_DEFAULT.forEach(s => batch.set(db.collection(col('org_setores')).doc(s.id), s));
      await batch.commit();
      _intraOrgSetores = IMEX_SETORES_DEFAULT.map(s => intraOrgNormalizarSetor({...s}));
    } else {
      const docs = snap.docs.map(d => intraOrgNormalizarSetor({...d.data(), id: d.id}));
      const temBaseOficial = docs.some(s => s.id === 'dev_web') && docs.some(s => s.id === 'rh_trilha');
      if (!temBaseOficial) {
        // Migração: substitui a estrutura antiga pela base oficial cadastrada pelo RH.
        const batch = db.batch();
        IMEX_SETORES_DEFAULT.forEach(s => batch.set(db.collection(col('org_setores')).doc(s.id), s));
        await batch.commit();
        _intraOrgSetores = IMEX_SETORES_DEFAULT.map(s => intraOrgNormalizarSetor({...s}));
      } else {
        _intraOrgSetores = docs.filter(s => IMEX_SETORES_DEFAULT.some(d => d.id === s.id));
      }
    }
  } catch(e) { _intraOrgSetores = IMEX_SETORES_DEFAULT.map(s => intraOrgNormalizarSetor({...s})); }
  return _intraOrgSetores;
}

function intraOrgZoom(d) {}
function intraOrgResetZoom() {}

async function intraRenderOrganograma() {
  const canvas = document.getElementById('intra-org-canvas');
  if (!canvas) return;
  canvas.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-30)">⏳ Carregando...</div>';

  const isRH = (_roleReal || role) === 'rh' || (_roleReal || role) === 'rh-colaborador';
  const rhTb = document.getElementById('intra-org-rh-toolbar');
  if (rhTb) rhTb.style.display = isRH ? 'flex' : 'none';

  // Inject CSS
  if (!document.getElementById('intra-org-css')) {
    const st = document.createElement('style');
    st.id = 'intra-org-css';
    st.textContent = [
      '.io-setor-card{border-radius:16px;overflow:visible;box-shadow:0 4px 20px rgba(0,0,0,.1);cursor:pointer;transition:all .2s}',
      '.io-setor-card:hover{transform:translateY(-4px);box-shadow:0 10px 32px rgba(0,0,0,.18)}',
      '.io-setor-head{padding:18px 22px;color:#fff;pointer-events:none}',
      '.io-setor-preview{pointer-events:none}',
      '.io-setor-card *{pointer-events:none}',
      '.io-trilha-item button{pointer-events:auto;position:relative;z-index:5}',
      '.io-setor-preview{background:#fff;padding:12px 16px;display:flex;flex-direction:column;gap:4px}',
      '.io-nivel-pip{display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-radius:7px;font-size:12px}',
      '.io-modal-tab.active{color:#0047FF!important;border-bottom-color:#0047FF!important}',
      '.io-trilha-item{border-radius:12px;padding:14px 16px;margin-bottom:8px;cursor:pointer;transition:all .2s;position:relative}',
      '.io-trilha-item:hover{transform:translateX(4px)}',
      '.io-trilha-connector{width:2px;height:20px;margin:0 auto;background:linear-gradient(to bottom,var(--s-cor,#ccc),var(--s-cor,#ccc))}',
      '.io-drag-handle{cursor:grab;padding:4px 8px;border-radius:6px;background:rgba(0,0,0,.06);font-size:14px;touch-action:none}',
      '.io-drag-handle:active{cursor:grabbing}'
    ].join('');
    document.head.appendChild(st);
  }

  try {
    const setores  = await intraOrgGetSetores();
    const descList = await orgGetDescritivos().catch(() => []);
    const sorted   = [...setores].filter(Boolean).sort((a,b) => (a.ordem||99) - (b.ordem||99));
    const NIVEIS   = {1:'Trainee/Est.',2:'Júnior',3:'Pleno',4:'Sênior',5:'Líder',6:'Gerente',7:'C-Level'};

    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">';

    sorted.forEach(setor => {
      const cor    = setor.cor || '#0047FF';
      const cargos = [...(setor.cargos || [])].map(intraOrgNormalizarCargo).sort((a,b) => (a.ordem||99) - (b.ordem||99));
      // Show top 4 cargos as preview
      const preview = cargos.slice(0, 4);
      const temDesc = cargos.filter(c => descList.some(d => intraOrgNormKey(d.cargo) === intraOrgNormKey(c.nome))).length;

      html += '<div class="io-setor-card" data-sid="' + setor.id + '" style="border:2px solid ' + cor + '30;cursor:pointer" onclick="intraOrgAbrirTrilha(this.dataset.sid)">' +
        '<div class="io-setor-head" style="background:' + cor + '">' +
          '<div style="font-size:18px;font-weight:800;margin-bottom:4px">' + setor.nome + '</div>' +
          '<div style="font-size:12px;opacity:.8">' + cargos.length + ' cargos na trilha · ' + temDesc + ' com descritivo</div>' +
          (setor.lider ? '<div style="font-size:11px;opacity:.7;margin-top:2px">Liderado por: ' + setor.lider + '</div>' : '') +
        '</div>' +
        '<div class="io-setor-preview">';

      // Show first 4 levels
      preview.forEach((c, i) => {
        const lvl = c.nivel || 1;
        const bg  = cor + (i === 0 ? '25' : i === 1 ? '18' : i === 2 ? '12' : '08');
        html += '<div class="io-nivel-pip" style="background:' + bg + '">' +
          '<span style="font-size:12px;font-weight:700;color:var(--ink)">' + c.nome + '</span>' +
          '<span style="font-size:10px;font-weight:700;background:' + cor + '20;color:' + cor + ';border-radius:4px;padding:2px 6px">' + (NIVEIS[lvl] || 'Nível ' + lvl) + '</span>' +
        '</div>';
      });

      if (cargos.length > 4) {
        html += '<div style="text-align:center;font-size:12px;color:var(--ink-30);padding:4px">+' + (cargos.length - 4) + ' níveis • Clique para ver todos →</div>';
      } else {
        html += '<div style="text-align:center;font-size:12px;color:var(--ink-30);padding:4px">Clique para ver a trilha completa →</div>';
      }

      html += '</div></div>';
    });

    if (isRH) {
      html += '<div onclick="intraOrgAbrirModalSetor()" style="border:2px dashed var(--border);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;cursor:pointer;transition:.18s" onmouseenter="this.style.background=\'rgba(0,71,255,.04)\'" onmouseleave="this.style.background=\'\'">' +
        '<div style="font-size:32px;color:var(--ink-30);margin-bottom:8px">+</div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--ink-30)">Novo Setor</div>' +
      '</div>';
    }

    html += '</div>';
    canvas.innerHTML = html;
  } catch(e) {
    canvas.innerHTML = '<div style="padding:40px;text-align:center;color:#dc2626">Erro: ' + e.message + '</div>';
  }
}

// Abrir trilha de carreira de um setor
async function intraOrgAbrirTrilha(setorId) {
  const setores = await intraOrgGetSetores();
  const setor   = setores.find(s => s.id === setorId);
  if (!setor) return;
  _intraOrgAtualSetor = setorId;

  const isRH   = (_roleReal || role) === 'rh' || (_roleReal || role) === 'rh-colaborador';
  const cor    = setor.cor || '#0047FF';
  const rhBtns = document.getElementById('intra-org-trilha-rh-btns');
  const descList = await orgGetDescritivos().catch(() => []);

  document.getElementById('intra-org-trilha-titulo').textContent = setor.nome;
  document.getElementById('intra-org-trilha-sub').textContent    = (setor.lider ? 'Liderado por: ' + setor.lider + ' · ' : '') + (setor.cargos||[]).length + ' níveis na trilha';
  document.getElementById('intra-org-trilha-head').style.borderTop = '4px solid ' + cor;
  if (rhBtns) rhBtns.style.display = isRH ? 'flex' : 'none';

  intraOrgRenderTrilha(setor, descList, isRH, false);
  document.getElementById('intra-org-modal-trilha').style.display = 'flex';
}

function intraOrgRenderTrilha(setor, descList, isRH, ordenando) {
  const body   = document.getElementById('intra-org-trilha-body');
  const cor    = setor.cor || '#0047FF';
  const cargos = [...(setor.cargos || [])].map(intraOrgNormalizarCargo).sort((a,b) => (a.ordem||99) - (b.ordem||99));
  const NIVEIS = {1:'Trainee / Estagiário',2:'Júnior / Assistente',3:'Pleno / Analista',4:'Sênior / Especialista',5:'Líder / Coordenador',6:'Gerente / Diretor',7:'C-Level / Presidente'};

  if (!cargos.length) {
    body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-30)"><div style="font-size:36px;margin-bottom:10px">📭</div><p>Nenhum cargo cadastrado nesta trilha ainda.</p>' +
      (isRH ? '<button class="btn btn-p btn-sm" style="margin-top:10px" onclick="intraOrgAbrirNovoCargo()">+ Adicionar Cargo</button>' : '') + '</div>';
    return;
  }

  let html = '';
  cargos.forEach((cargo, idx) => {
    const desc    = descList.find(d => d.cargo && d.cargo.toLowerCase().trim() === cargo.nome.toLowerCase().trim());
    const temDesc = !!desc;
    const nivelLabel = NIVEIS[cargo.nivel] || 'Nível ' + (cargo.nivel || '?');
    const proximo    = intraOrgResolverProximo(cargos, cargo, idx);

    // Connector line (except for last)
    if (idx > 0) {
      html += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:-4px 0">' +
        '<div style="width:2px;height:24px;background:' + cor + '50"></div>' +
        '<span style="font-size:11px;color:' + cor + ';font-weight:700;opacity:.6">↓</span>' +
        '<div style="width:2px;height:24px;background:' + cor + '50"></div>' +
      '</div>';
    }

    html += '<div class="io-trilha-item" ' +
      'style="background:' + cor + (idx === 0 ? '18' : idx === 1 ? '12' : '08') + ';border:1.5px solid ' + cor + (idx === 0 ? '60' : '25') + '"' +
      (ordenando ? '' : ' onclick="intraOrgAbrirCargo(' + JSON.stringify(cargo.nome) + ',' + JSON.stringify(setor.id) + ',' + JSON.stringify(setor.nome) + ')"') +
      (ordenando ? ' draggable="true" ondragstart="intraOrgDragStart(event,' + idx + ')" ondragover="event.preventDefault()" ondrop="intraOrgDrop(event,' + idx + ')"' : '') +
      '>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
            '<span style="font-size:15px;font-weight:800;color:var(--ink)">' + cargo.nome + '</span>' +
            (temDesc ? '<span style="font-size:10px;background:' + cor + '20;color:' + cor + ';border-radius:4px;padding:2px 7px;font-weight:700">✓ Descritivo</span>' : '') +
          '</div>' +
          '<div style="font-size:11px;color:var(--ink-60)">' + nivelLabel + '</div>' +
          (proximo && !ordenando ?
            '<div style="font-size:11px;color:' + cor + ';margin-top:4px;font-weight:600">→ Próximo: ' + proximo.nome + '</div>' : '') +
        '</div>' +
        (ordenando ?
          '<div class="io-drag-handle" style="font-size:16px;user-select:none">⋮⋮</div>' :
          (isRH ?
            '<button onclick="event.stopPropagation();intraOrgAbrirEditarCargo(' + JSON.stringify(cargo.nome) + ',' + JSON.stringify(setor.id) + ')" style="background:rgba(0,0,0,.06);border:none;border-radius:8px;padding:5px 9px;cursor:pointer;font-size:13px">✏️</button>' : '')) +
      '</div>' +
    '</div>';
  });

  body.innerHTML = html;

  // Store order state for drag/drop
  body._cargosOrder = [...cargos];
  body._setorId     = setor.id;
}

// Drag and drop for ordering
let _dragIdx = null;
function intraOrgDragStart(e, idx) { _dragIdx = idx; e.dataTransfer.effectAllowed = 'move'; }
async function intraOrgDrop(e, targetIdx) {
  e.preventDefault();
  if (_dragIdx === null || _dragIdx === targetIdx) return;
  const body    = document.getElementById('intra-org-trilha-body');
  const cargos  = [...body._cargosOrder];
  const [moved] = cargos.splice(_dragIdx, 1);
  cargos.splice(targetIdx, 0, moved);
  // Update ordem
  cargos.forEach((c, i) => { c.ordem = i + 1; });
  body._cargosOrder = cargos;
  _dragIdx = null;
  // Save to Firestore
  try {
    await db.collection(col('org_setores')).doc(body._setorId).update({ cargos });
    _intraOrgSetores = null;
    const setores  = await intraOrgGetSetores();
    const setor    = setores.find(s => s.id === body._setorId);
    const descList = await orgGetDescritivos().catch(() => []);
    const isRH = (_roleReal || role) === 'rh' || (_roleReal || role) === 'rh-colaborador';
    intraOrgRenderTrilha(setor, descList, isRH, true);
  } catch(ex) {}
}

function intraOrgToggleOrdenar() {
  _intraOrgOrdenando = !_intraOrgOrdenando;
  const btn = document.getElementById('intra-org-btn-ordenar');
  if (btn) btn.textContent = _intraOrgOrdenando ? '✓ Pronto' : '↕ Ordenar';
  intraOrgAbrirTrilha(_intraOrgAtualSetor);
}

// Open cargo detail (collaborator view)
async function intraOrgAbrirCargo(cargoNome, setorId, setorNome) {
  const setores  = await intraOrgGetSetores();
  const setor    = setores.find(s => s.id === setorId);
  const cor      = setor?.cor || '#0047FF';
  const cargos   = [...(setor?.cargos || [])].map(intraOrgNormalizarCargo).sort((a,b) => (a.ordem||99) - (b.ordem||99));
  const idx      = cargos.findIndex(c => c.nome === cargoNome);
  const cargo    = cargos[idx] || intraOrgNormalizarCargo({ nome: cargoNome }, idx);
  const proximo  = intraOrgResolverProximo(cargos, cargo, idx);
  const descList = await orgGetDescritivos().catch(() => []);
  const desc     = descList.find(d => intraOrgNormKey(d.cargo) === intraOrgNormKey(cargoNome));
  const isRH     = (_roleReal || role) === 'rh' || (_roleReal || role) === 'rh-colaborador';
  const NIVEIS   = {1:'Trainee / Estagiário',2:'Júnior / Assistente',3:'Pleno / Analista',4:'Sênior / Especialista',5:'Líder / Coordenador',6:'Gerente / Diretor',7:'C-Level / Presidente'};

  document.getElementById('intra-org-mc-setor').textContent  = setorNome;
  document.getElementById('intra-org-mc-titulo').textContent = cargoNome;
  document.getElementById('intra-org-mc-nivel').textContent  = NIVEIS[cargo?.nivel] || '';
  document.getElementById('intra-org-mc-head').style.borderTop = '4px solid ' + cor;

  function secao(icon, titulo, conteudo) {
    if (!conteudo) return '';
    return '<div style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">' + icon + ' ' + titulo + '</div>' +
      '<div style="background:var(--bg);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--ink);line-height:1.6;white-space:pre-wrap">' + conteudo + '</div></div>';
  }

  let body = '';

  // Current cargo description
  if (desc && (desc.missao || desc.responsabilidades || desc.tecnicos || desc.comportamentos)) {
    body += '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:' + cor + ';margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid ' + cor + '30">📋 Descritivo do Cargo</div>';
    body += secao('🎯', 'Missão', desc.missao);
    body += secao('📝', 'Responsabilidades', desc.responsabilidades);
    body += secao('⚙️', 'Conhecimentos Técnicos', desc.tecnicos);
    body += secao('🧠', 'Perfil Comportamental', desc.comportamentos);
    if (desc.salMin || desc.salMax) {
      body += '<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">💰 Faixa Salarial</div>' +
        '<span style="background:#f0fff4;color:#166534;border-radius:8px;padding:6px 14px;font-weight:700;font-size:13px">' + (desc.salMin ? grhBRL(desc.salMin) : '—') + ' → ' + (desc.salMax ? grhBRL(desc.salMax) : '—') + '</span></div>';
    }
  } else {
    body += '<div style="background:var(--bg);border-radius:10px;padding:14px 16px;margin-bottom:14px;font-size:13px;color:var(--ink-60)">📋 Descritivo não cadastrado ainda para este cargo.</div>';
  }

  // Next level progression
  if (proximo) {
    const descProx = descList.find(d => intraOrgNormKey(d.cargo) === intraOrgNormKey(proximo.nome));
    body += '<div style="background:' + cor + '08;border:2px solid ' + cor + '30;border-radius:14px;padding:18px 20px;margin-top:6px">' +
      '<div style="font-size:13px;font-weight:800;color:' + cor + ';margin-bottom:12px">🚀 Para alcançar o próximo nível</div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;background:#fff;border-radius:10px;padding:10px 14px">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:' + cor + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;flex-shrink:0">→</div>' +
        '<div><div style="font-size:14px;font-weight:800;color:var(--ink)">' + proximo.nome + '</div>' +
          '<div style="font-size:11px;color:var(--ink-60)">' + (NIVEIS[proximo.nivel] || '') + '</div></div>' +
      '</div>';

    if (descProx && (descProx.competenciasProx || descProx.tecnicosProx || descProx.tempoProx || descProx.metasProx || descProx.dicasProx)) {
      body += secao('🎯', 'Competências a Desenvolver', descProx.competenciasProx);
      body += secao('⚙️', 'Conhecimentos Técnicos Necessários', descProx.tecnicosProx);
      body += secao('⏱️', 'Experiência / Tempo Mínimo', descProx.tempoProx);
      body += secao('📊', 'Metas / Resultados Esperados', descProx.metasProx);
      body += secao('💡', 'Dicas de Desenvolvimento', descProx.dicasProx);
    } else {
      body += '<div style="font-size:13px;color:var(--ink-60);font-style:italic">Os critérios de progressão ainda não foram cadastrados pelo RH.</div>';
    }
    body += '</div>';
  } else {
    body += '<div style="background:#fef3c7;border-radius:12px;padding:14px 16px;margin-top:8px;font-size:13px;color:#92400e;font-weight:600">⭐ Este é o nível mais alto nesta trilha!</div>';
  }

  document.getElementById('intra-org-mc-body').innerHTML = body;

  // RH buttons
  const rhDiv = document.getElementById('intra-org-mc-rh-btns');
  if (rhDiv) {
    if (isRH) {
      rhDiv.style.display = 'flex';
      rhDiv.innerHTML =
        '<button class="btn btn-p btn-sm" onclick="intraOrgAbrirEditarCargo(' + JSON.stringify(cargoNome) + ',' + JSON.stringify(setorId) + ')">✏️ Editar Descritivo</button>' +
        '<button class="btn btn-g btn-sm" onclick="intraOrgRemoverCargoTrilha(' + JSON.stringify(setorId) + ',' + JSON.stringify(cargoNome) + ')">🗑 Remover da Trilha</button>';
    } else {
      rhDiv.style.display = 'none';
    }
  }

  document.getElementById('intra-org-modal-cargo').style.display = 'flex';
}


function intraOrgResolverProximo(cargos, cargo, idx) {
  if (!cargo) return null;
  if (cargo.proximoCargo === '__fim__') return null;
  if (cargo.proximoCargo) {
    const manual = cargos.find(c => intraOrgNormKey(c.nome) === intraOrgNormKey(cargo.proximoCargo));
    if (manual) return manual;
  }
  return cargos[idx + 1] || null;
}

function intraOrgPopularProximos(setorId, cargoNome, selecionado) {
  const select = document.getElementById('intra-org-cargo-proximo');
  if (!select) return;
  const setores = _intraOrgSetores || IMEX_SETORES_DEFAULT;
  const setor = setores.find(s => s.id === setorId);
  const cargos = [...(setor?.cargos || [])].map(intraOrgNormalizarCargo).sort((a,b)=>(a.ordem||99)-(b.ordem||99));
  const atualKey = intraOrgNormKey(cargoNome);
  select.innerHTML = '<option value="">Automático pela ordem da trilha</option><option value="__fim__">Não possui próximo nível</option>' +
    cargos.filter(c => intraOrgNormKey(c.nome) !== atualKey).map(c => '<option value="' + c.nome.replace(/"/g,'&quot;') + '">' + c.nome + '</option>').join('');
  select.value = selecionado || '';
}

// RH: Edit cargo descriptor + progression
async function intraOrgAbrirEditarCargo(cargoNome, setorId) {
  document.getElementById('intra-org-modal-cargo').style.display = 'none';
  const setores  = await intraOrgGetSetores();
  const setor    = setores.find(s => s.id === setorId);
  const cargos   = (setor?.cargos || []).map(intraOrgNormalizarCargo);
  const cargo    = cargos.find(c => intraOrgNormKey(c.nome) === intraOrgNormKey(cargoNome));
  const descList = await orgGetDescritivos().catch(() => []);
  const desc     = descList.find(d => intraOrgNormKey(d.cargo) === intraOrgNormKey(cargoNome));

  document.getElementById('intra-org-cargo-modal-title').textContent = 'Editar: ' + cargoNome;
  document.getElementById('intra-org-cargo-id').value       = desc?._id || '';
  document.getElementById('intra-org-cargo-setor-id').value = setorId;
  document.getElementById('intra-org-cargo-ordem').value    = cargo?.ordem || '';
  const sv = (id, v) => { const e = document.getElementById(id); if(e) e.value = v || ''; };
  sv('intra-org-cargo-nome',  cargoNome);
  sv('intra-org-cargo-nivel', cargo?.nivel || '');
  intraOrgPopularProximos(setorId, cargoNome, cargo?.proximoCargo || '');
  sv('intra-org-cargo-missao', desc?.missao || '');
  sv('intra-org-cargo-resp',   desc?.responsabilidades || '');
  sv('intra-org-cargo-tec',    desc?.tecnicos || '');
  sv('intra-org-cargo-comp',   desc?.comportamentos || '');
  sv('intra-org-cargo-sal-min', desc?.salMin || '');
  sv('intra-org-cargo-sal-max', desc?.salMax || '');
  sv('intra-org-cargo-prox-comp',  desc?.competenciasProx || '');
  sv('intra-org-cargo-prox-tec',   desc?.tecnicosProx || '');
  sv('intra-org-cargo-prox-tempo', desc?.tempoProx || '');
  sv('intra-org-cargo-prox-metas', desc?.metasProx || '');
  sv('intra-org-cargo-prox-dicas', desc?.dicasProx || '');
  const delBtn = document.getElementById('intra-org-cargo-del');
  if (delBtn) delBtn.style.display = 'block';
  intraOrgModalTab('descritivo', document.querySelector('.io-modal-tab'));
  document.getElementById('intra-org-modal-cargo-edit').style.display = 'flex';
}

function intraOrgAbrirNovoCargo() {
  document.getElementById('intra-org-cargo-modal-title').textContent = 'Novo Cargo na Trilha';
  document.getElementById('intra-org-cargo-id').value = '';
  document.getElementById('intra-org-cargo-setor-id').value = _intraOrgAtualSetor || '';
  document.getElementById('intra-org-cargo-ordem').value = '';
  ['intra-org-cargo-nome','intra-org-cargo-nivel','intra-org-cargo-missao','intra-org-cargo-resp',
   'intra-org-cargo-tec','intra-org-cargo-comp','intra-org-cargo-sal-min','intra-org-cargo-sal-max',
   'intra-org-cargo-proximo','intra-org-cargo-prox-comp','intra-org-cargo-prox-tec','intra-org-cargo-prox-tempo',
   'intra-org-cargo-prox-metas','intra-org-cargo-prox-dicas'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  intraOrgPopularProximos(_intraOrgAtualSetor || '', '', '');
  const delBtn = document.getElementById('intra-org-cargo-del');
  if (delBtn) delBtn.style.display = 'none';
  document.getElementById('intra-org-modal-cargo-edit').style.display = 'flex';
}

function intraOrgModalTab(aba, btn) {
  ['descritivo','progressao'].forEach(t => {
    const el = document.getElementById('io-tab-' + t);
    if (el) el.style.display = t === aba ? 'block' : 'none';
  });
  document.querySelectorAll('.io-modal-tab').forEach(b => {
    b.classList.remove('active');
    b.style.color = 'var(--ink-60)';
    b.style.borderBottomColor = 'transparent';
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.color = '#0047FF';
    btn.style.borderBottomColor = '#0047FF';
  }
}

async function intraOrgSalvarCargo() {
  const g = id => document.getElementById(id)?.value.trim() || '';
  const cargoNome = g('intra-org-cargo-nome');
  const setorId   = g('intra-org-cargo-setor-id');
  const nivel     = parseInt(g('intra-org-cargo-nivel')) || 3;
  if (!cargoNome) { alert('Informe o nome do cargo.'); return; }

  // 1. Update setor cargos list
  const setores = await intraOrgGetSetores();
  const setor   = setores.find(s => s.id === setorId);
  if (setor) {
    setor.cargos = (setor.cargos || []).map(intraOrgNormalizarCargo);
    const existing = setor.cargos.find(c => intraOrgNormKey(c.nome) === intraOrgNormKey(cargoNome));
    if (existing) {
      existing.nivel = nivel;
      existing.proximoCargo = g('intra-org-cargo-proximo');
    } else {
      const maxOrdem = Math.max(0, ...setor.cargos.map(c => c.ordem || 0));
      setor.cargos.push({ nome: cargoNome, nivel, ordem: maxOrdem + 1, proximoCargo: g('intra-org-cargo-proximo') });
    }
    await db.collection(col('org_setores')).doc(setorId).update({ cargos: setor.cargos });
  }

  // 2. Save descritivo (current + progressão)
  const descList = await orgGetDescritivos().catch(() => []);
  const desc = descList.find(d => intraOrgNormKey(d.cargo) === intraOrgNormKey(cargoNome));
  const dados = {
    cargo: cargoNome,
    setor: setor?.nome || '',
    nivel: g('intra-org-cargo-nivel'),
    proximoCargo:       g('intra-org-cargo-proximo'),
    missao:            g('intra-org-cargo-missao'),
    responsabilidades: g('intra-org-cargo-resp'),
    tecnicos:          g('intra-org-cargo-tec'),
    comportamentos:    g('intra-org-cargo-comp'),
    salMin:            parseFloat(g('intra-org-cargo-sal-min')) || null,
    salMax:            parseFloat(g('intra-org-cargo-sal-max')) || null,
    competenciasProx:  g('intra-org-cargo-prox-comp'),
    tecnicosProx:      g('intra-org-cargo-prox-tec'),
    tempoProx:         g('intra-org-cargo-prox-tempo'),
    metasProx:         g('intra-org-cargo-prox-metas'),
    dicasProx:         g('intra-org-cargo-prox-dicas'),
    atualizadoEm:      new Date().toISOString()
  };
  const descId = g('intra-org-cargo-id');
  if (descId) {
    await db.collection(col('org_descritivos')).doc(descId).update(dados);
  } else {
    await db.collection(col('org_descritivos')).add({...dados, criadoEm: new Date().toISOString()});
  }

  _intraOrgSetores = null;
  _orgDescritivos  = null;
  document.getElementById('intra-org-modal-cargo-edit').style.display = 'none';
  addNotif('Cargo "' + cargoNome + '" salvo!', 'success');
  await intraRenderOrganograma();
  if (_intraOrgAtualSetor) await intraOrgAbrirTrilha(_intraOrgAtualSetor);
}

async function intraOrgExcluirCargo() {
  const nome    = document.getElementById('intra-org-cargo-nome')?.value.trim();
  const setorId = document.getElementById('intra-org-cargo-setor-id').value;
  const descId  = document.getElementById('intra-org-cargo-id').value;
  if (!confirm('Remover "' + nome + '" da trilha?')) return;

  const setores = await intraOrgGetSetores();
  const setor   = setores.find(s => s.id === setorId);
  if (setor) {
    setor.cargos = (setor.cargos || []).map(intraOrgNormalizarCargo).filter(c => intraOrgNormKey(c.nome) !== intraOrgNormKey(nome));
    await db.collection(col('org_setores')).doc(setorId).update({ cargos: setor.cargos });
  }
  if (descId) await db.collection(col('org_descritivos')).doc(descId).delete();

  _intraOrgSetores = null;
  _orgDescritivos  = null;
  document.getElementById('intra-org-modal-cargo-edit').style.display = 'none';
  addNotif('Cargo removido.', 'success');
  await intraRenderOrganograma();
  if (_intraOrgAtualSetor) await intraOrgAbrirTrilha(_intraOrgAtualSetor);
}

async function intraOrgRemoverCargoTrilha(setorId, cargoNome) {
  if (!confirm('Remover "' + cargoNome + '" desta trilha?')) return;
  document.getElementById('intra-org-modal-cargo').style.display = 'none';
  const setores = await intraOrgGetSetores();
  const setor   = setores.find(s => s.id === setorId);
  if (setor) {
    setor.cargos = (setor.cargos || []).map(intraOrgNormalizarCargo).filter(c => intraOrgNormKey(c.nome) !== intraOrgNormKey(cargoNome));
    await db.collection(col('org_setores')).doc(setorId).update({ cargos: setor.cargos });
    _intraOrgSetores = null;
    await intraRenderOrganograma();
    await intraOrgAbrirTrilha(setorId);
  }
  addNotif('Cargo removido da trilha.', 'success');
}

// Setor CRUD
function intraOrgAbrirModalSetor(setorId) {
  const setor = setorId ? (_intraOrgSetores || []).find(s => s.id === setorId) : null;
  document.getElementById('intra-org-setor-modal-title').textContent = setor ? 'Editar Setor' : 'Novo Setor';
  document.getElementById('intra-org-setor-id').value    = setorId || '';
  document.getElementById('intra-org-setor-nome').value  = setor?.nome || '';
  document.getElementById('intra-org-setor-lider').value = setor?.lider || '';
  intraOrgSelecionarCor(setor?.cor || '#0047FF');
  const delBtn = document.getElementById('intra-org-setor-del');
  if (delBtn) delBtn.style.display = setor ? 'block' : 'none';
  document.getElementById('intra-org-modal-setor-edit').style.display = 'flex';
}

function intraOrgSelecionarCor(cor) {
  document.getElementById('intra-org-setor-cor').value = cor;
  document.querySelectorAll('#intra-org-cor-picks div').forEach(d => {
    const match = d.dataset.cor === cor;
    d.style.border    = match ? '3px solid #0047FF' : '3px solid transparent';
    d.style.transform = match ? 'scale(1.2)' : 'scale(1)';
  });
}

async function intraOrgSalvarSetor() {
  const nome  = document.getElementById('intra-org-setor-nome')?.value.trim();
  const cor   = document.getElementById('intra-org-setor-cor')?.value || '#0047FF';
  const lider = document.getElementById('intra-org-setor-lider')?.value.trim() || '';
  if (!nome) { alert('Informe o nome do setor.'); return; }
  const id = document.getElementById('intra-org-setor-id').value;
  try {
    if (id) {
      await db.collection(col('org_setores')).doc(id).update({ nome, cor, lider, atualizadoEm: new Date().toISOString() });
    } else {
      const newId = nome.toLowerCase().replace(/[^a-z0-9]/g,'_').slice(0,14) + '_' + Date.now();
      const ordem = (_intraOrgSetores || []).length + 1;
      await db.collection(col('org_setores')).doc(newId).set({ id:newId, nome, cor, lider, ordem, cargos:[], criadoEm: new Date().toISOString() });
    }
    _intraOrgSetores = null;
    document.getElementById('intra-org-modal-setor-edit').style.display = 'none';
    addNotif('Setor salvo!', 'success');
    await intraRenderOrganograma();
  } catch(e) { alert('Erro: ' + e.message); }
}

async function intraOrgExcluirSetor() {
  const id = document.getElementById('intra-org-setor-id').value;
  if (!id || !confirm('Excluir este setor e toda sua trilha?')) return;
  await db.collection(col('org_setores')).doc(id).delete();
  _intraOrgSetores = null;
  document.getElementById('intra-org-modal-setor-edit').style.display = 'none';
  addNotif('Setor excluído.', 'success');
  await intraRenderOrganograma();
}


// ── VAGAS ──
let _vagaCVDados = null;
let _vagaTipo = 'proprio';
let _vagaPubId = null;

function vagaSwitchTipo(tipo) {
  _vagaTipo = tipo;
  const wrapInd = document.getElementById('vaga-indicado-wrap');
  const btnProp = document.getElementById('vaga-btn-proprio');
  const btnInd  = document.getElementById('vaga-btn-indicar');
  const nomeLabel = document.getElementById('vaga-nome-label');
  if (tipo === 'indicar') {
    wrapInd.style.display = 'block';
    btnInd.style.cssText  = 'flex:1;padding:10px;border-radius:10px;border:2px solid var(--pur-vibrant);background:var(--pur-soft);color:var(--pur-vibrant);font-weight:700;font-size:13px;cursor:pointer';
    btnProp.style.cssText = 'flex:1;padding:10px;border-radius:10px;border:2px solid var(--border);background:var(--bg);color:var(--ink-60);font-weight:700;font-size:13px;cursor:pointer';
    if (nomeLabel) nomeLabel.textContent = 'Seu nome (quem indica) *';
  } else {
    wrapInd.style.display = 'none';
    btnProp.style.cssText = 'flex:1;padding:10px;border-radius:10px;border:2px solid var(--pur-vibrant);background:var(--pur-soft);color:var(--pur-vibrant);font-weight:700;font-size:13px;cursor:pointer';
    btnInd.style.cssText  = 'flex:1;padding:10px;border-radius:10px;border:2px solid var(--border);background:var(--bg);color:var(--ink-60);font-weight:700;font-size:13px;cursor:pointer';
    if (nomeLabel) nomeLabel.textContent = 'Seu nome *';
  }
}

function vagaHandleCV(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) vagaProcessarCV(file);
  const zone = document.getElementById('vaga-cv-zone');
  if (zone) { zone.style.borderColor = 'var(--border)'; zone.style.background = 'var(--bg)'; }
}

function vagaSelectCV(input) {
  if (input.files[0]) vagaProcessarCV(input.files[0]);
}

function vagaProcessarCV(file) {
  if (file.size > 5 * 1024 * 1024) { addNotif('Arquivo maior que 5MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    _vagaCVDados = { nome: file.name, tipo: file.type, dados: e.target.result };
    const lbl = document.getElementById('vaga-cv-label');
    const zone = document.getElementById('vaga-cv-zone');
    if (lbl) lbl.textContent = '✅ ' + file.name;
    if (zone) { zone.style.borderColor = '#22C58B'; zone.style.background = '#f0fff4'; }
  };
  reader.readAsDataURL(file);
}

function intraAbrirCandidatura(vagaId, vagaTitulo) {
  _vagaPubId  = vagaId;
  _vagaCVDados = null;
  _vagaTipo    = 'proprio';
  const titulo = document.getElementById('vaga-modal-titulo');
  if (titulo) titulo.textContent = vagaTitulo;
  // Reset form
  ['vaga-nome','vaga-mensagem','vaga-indicado-nome','vaga-indicado-tel','vaga-indicado-email'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const lbl = document.getElementById('vaga-cv-label');
  if (lbl) lbl.textContent = 'Clique ou arraste o currículo aqui';
  const zone = document.getElementById('vaga-cv-zone');
  if (zone) { zone.style.borderColor = 'var(--border)'; zone.style.background = 'var(--bg)'; }
  const cvInput = document.getElementById('vaga-cv-input');
  if (cvInput) cvInput.value = '';
  vagaSwitchTipo('proprio');
  // Pré-preencher nome do usuário logado
  const nomeUser = sessionStorage.getItem('userName') || '';
  const nomeEl = document.getElementById('vaga-nome');
  if (nomeEl && nomeUser) nomeEl.value = nomeUser;
  document.getElementById('intraCandidModal').style.display = 'flex';
}

async function vagaEnviarCandidatura() {
  const nome = document.getElementById('vaga-nome')?.value.trim();
  if (!nome) { alert('Informe seu nome.'); return; }
  const btn = document.getElementById('vaga-enviar-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Enviando...'; }

  const candidatura = {
    id:         crypto.randomUUID(),
    vagaId:     _vagaPubId,
    tipo:       _vagaTipo,
    nome,
    mensagem:   document.getElementById('vaga-mensagem')?.value.trim() || '',
    curriculo:  _vagaCVDados || null,
    indicadoNome:  _vagaTipo === 'indicar' ? (document.getElementById('vaga-indicado-nome')?.value.trim() || '') : '',
    indicadoTel:   _vagaTipo === 'indicar' ? (document.getElementById('vaga-indicado-tel')?.value.trim() || '')  : '',
    indicadoEmail: _vagaTipo === 'indicar' ? (document.getElementById('vaga-indicado-email')?.value.trim() || '') : '',
    criadoEm:   new Date().toISOString()
  };

  try {
    await db.collection(col('vaga_candidaturas')).doc(candidatura.id).set(candidatura);
    addNotif(_vagaTipo === 'indicar' ? 'Indicação enviada com sucesso!' : 'Candidatura enviada com sucesso!', 'success');
    log('Vagas', (_vagaTipo === 'indicar' ? 'Indicação' : 'Candidatura') + ' para: ' + _vagaPubId, '💼');
  } catch(e) { addNotif('Erro ao enviar: ' + e.message, 'error'); }

  document.getElementById('intraCandidModal').style.display = 'none';
  if (btn) { btn.disabled = false; btn.textContent = '📤 Enviar'; }
  // Atualizar contador de candidaturas na vaga
  vagaRenderPainel();
}

async function vagaRenderPainel() {
  const pane = document.getElementById('intra-vagas-pane');
  if (!pane || pane.style.display === 'none') return;
  const vagas = intraPublicacoes.filter(p => p.tipo === 'vagas');
  if (!vagas.length) {
    pane.innerHTML = '<div style="text-align:center;padding:60px;color:var(--ink-30)"><div style="font-size:48px;margin-bottom:12px">💼</div><p style="font-size:14px">Nenhuma vaga publicada ainda.</p>' +
      ((role === 'rh' || role === 'rh-colaborador') ? '<button class="btn btn-p btn-sm" style="margin-top:12px" onclick="intraAbrirModal()">+ Publicar Vaga</button>' : '') +
      '</div>';
    return;
  }

  // Buscar candidaturas
  let candidaturas = [];
  try {
    const snap = await db.collection(col('vaga_candidaturas')).get();
    candidaturas = snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch(e) {}

  const isRH = role === 'rh' || role === 'rh-colaborador';

  pane.innerHTML = vagas.map(v => {
    const cands  = candidaturas.filter(c => c.vagaId === v.id);
    const campos = v.vagaCampos || {};

    // ── Imagens e documentos anexados ──
    let anexosHtml = '';
    if (v.anexos && v.anexos.length) {
      const imgs = v.anexos.filter(a => a.tipo && a.tipo.startsWith('image/'));
      const docs = v.anexos.filter(a => !a.tipo || !a.tipo.startsWith('image/'));
      if (imgs.length) {
        anexosHtml += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">' +
          imgs.map(a =>
            '<img src="' + a.dados + '" style="max-height:200px;max-width:100%;border-radius:10px;object-fit:cover;cursor:pointer;border:1px solid var(--border)" onclick="intraVerImagem(this.src)" title="' + a.nome + '"/>'
          ).join('') + '</div>';
      }
      if (docs.length) {
        anexosHtml += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">' +
          docs.map(a => {
            const icon = a.tipo && a.tipo.includes('pdf') ? '📄' : '📎';
            return '<a href="' + a.dados + '" download="' + a.nome + '" style="display:inline-flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;text-decoration:none;color:var(--ink);font-size:12px;font-weight:600">' + icon + ' ' + a.nome + '</a>';
          }).join('') + '</div>';
      }
    }

    return '<div class="card" style="border-left:4px solid #f59e0b">' +
      '<div style="padding:20px 24px">' +
        // Header badges
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
          '<span style="font-size:11px;font-weight:700;background:#fef3c7;color:#92400e;border-radius:5px;padding:3px 9px">💼 VAGA</span>' +
          (v.destaque ? '<span style="font-size:11px;font-weight:700;background:#fef3c7;color:#92400e;border-radius:5px;padding:3px 9px">⭐ DESTAQUE</span>' : '') +
        '</div>' +
        // Título
        '<h3 style="font-size:18px;font-weight:800;color:var(--ink);margin-bottom:8px">' + v.titulo + '</h3>' +
        // Tags de campos
        '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px">' +
          (campos.local   ? '<span style="font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:4px 10px">📍 ' + campos.local + '</span>'   : '') +
          (campos.regime  ? '<span style="font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:4px 10px">🕐 ' + campos.regime + '</span>'  : '') +
          (campos.salario ? '<span style="font-size:12px;background:#f0fff4;border:1px solid #bbf7d0;border-radius:6px;padding:4px 10px;color:#166534">💰 ' + campos.salario + '</span>' : '') +
          (campos.setor   ? '<span style="font-size:12px;background:var(--pur-soft);border:1px solid var(--pur-soft);border-radius:6px;padding:4px 10px;color:var(--pur-vibrant)">🏢 ' + campos.setor + '</span>'   : '') +
        '</div>' +
        // Descrição completa
        (v.descricao ? '<div style="font-size:14px;color:var(--ink);line-height:1.7;margin-bottom:10px;white-space:pre-wrap">' + v.descricao + '</div>' : '') +
        // Imagens e documentos
        anexosHtml +
        // Rodapé
        '<div style="font-size:11px;color:var(--ink-30);margin-top:10px;margin-bottom:14px">Publicado por ' + v.autor + ' · ' + new Date(v.criadoEm).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}) + '</div>' +
        // Botões
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
          '<button data-vid="' + v.id + '" data-vtitulo="' + v.titulo.replace(/"/g,'&quot;') + '" onclick="intraAbrirCandidatura(this.dataset.vid,this.dataset.vtitulo)" class="btn btn-p btn-sm" style="white-space:nowrap">✉️ Candidatar / Indicar</button>' +
          (isRH && cands.length > 0 ? '<button data-vid="' + v.id + '" onclick="vagaVerCandidaturas(this.dataset.vid)" class="btn btn-g btn-sm" style="white-space:nowrap">👥 ' + cands.length + ' candidatura' + (cands.length > 1 ? 's' : '') + '</button>' : '') +
          (isRH ? '<button data-vid="' + v.id + '" onclick="intraExcluir(this.dataset.vid)" style="margin-left:auto;border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:5px 9px;cursor:pointer;font-size:12px;color:#991b1b">🗑</button>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function vagaVerCandidaturas(vagaId) {
  const vaga = intraPublicacoes.find(p => p.id === vagaId);
  const titulo = vaga ? vaga.titulo : 'Vaga';
  let candidaturas = [];
  try {
    const snap = await db.collection(col('vaga_candidaturas')).where('vagaId','==',vagaId).get();
    candidaturas = snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch(e) {}
  // Reusar modal de comentários para listar
  document.getElementById('intra-coment-titulo').textContent = '👥 Candidaturas — ' + titulo;
  const lista = document.getElementById('intra-coment-lista');
  if (!candidaturas.length) {
    lista.innerHTML = '<div style="text-align:center;padding:24px;color:var(--ink-30)">Nenhuma candidatura recebida ainda.</div>';
  } else {
    lista.innerHTML = candidaturas.map(c =>
      '<div style="background:var(--bg);border-radius:12px;padding:14px 16px;border:1px solid var(--border)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
          '<div style="font-size:13px;font-weight:700;color:var(--ink)">' + (c.tipo === 'indicar' ? '🤝 Indicação por ' + c.nome : '👤 ' + c.nome) + '</div>' +
          '<div style="font-size:11px;color:var(--ink-30)">' + new Date(c.criadoEm).toLocaleDateString('pt-BR') + '</div>' +
        '</div>' +
        (c.tipo === 'indicar' ? '<div style="font-size:12px;color:var(--pur-vibrant);margin-bottom:4px">Indicado: <strong>' + c.indicadoNome + '</strong>' + (c.indicadoTel ? ' · ' + c.indicadoTel : '') + (c.indicadoEmail ? ' · ' + c.indicadoEmail : '') + '</div>' : '') +
        (c.mensagem ? '<div style="font-size:12px;color:var(--ink-60);margin-bottom:6px">' + c.mensagem + '</div>' : '') +
        (c.curriculo ? '<a href="' + c.curriculo.dados + '" download="' + c.curriculo.nome + '" style="display:inline-flex;align-items:center;gap:6px;background:var(--pur-soft);color:var(--pur-vibrant);border-radius:7px;padding:5px 12px;text-decoration:none;font-size:12px;font-weight:600">📄 Baixar Currículo</a>' : '') +
      '</div>'
    ).join('');
  }
  // Hide the comment input (not applicable here)
  const inputArea = document.querySelector('#intraComentModal > div > div:last-child');
  if (inputArea) inputArea.style.display = 'none';
  document.getElementById('intraComentModal').style.display = 'flex';
}


function intraRenderHomeColaborador() {
  const nome = (document.getElementById('pLabel')?.textContent || 'Colaborador').trim();
  const saud = document.getElementById('intra-home-saudacao');
  if (saud) saud.textContent = 'Olá, ' + nome + '! O que você precisa acessar hoje?';

  const destaques = intraPublicacoes.filter(p => p.destaque).length;
  const avisos = intraPublicacoes.filter(p => p.tipo === 'avisos').length;
  const docs = intraPublicacoes.filter(p => p.tipo === 'documentos').length;
  const vagas = intraPublicacoes.filter(p => p.tipo === 'vagas').length;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('intra-kpi-destaques', destaques);
  setTxt('intra-kpi-avisos', avisos);
  setTxt('intra-kpi-docs', docs);
  setTxt('intra-kpi-vagas', vagas);

  intraRenderCentralNotificacoes({ destaques, avisos, docs, vagas });
}

function intraRenderCentralNotificacoes(stats) {
  const list = document.getElementById('intra-notif-list');
  const count = document.getElementById('intra-notif-count');
  if (!list) return;

  const recentes = [...intraPublicacoes]
    .sort((a,b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0))
    .slice(0, 3);

  const itens = [];
  if (stats.destaques > 0) itens.push({ico:'⭐', titulo: stats.destaques + ' destaque(s) ativo(s)', sub:'Conteúdos priorizados pelo RH para leitura.'});
  if (stats.avisos > 0) itens.push({ico:'📢', titulo: stats.avisos + ' aviso(s) publicado(s)', sub:'Acompanhe os comunicados oficiais da empresa.'});
  if (stats.vagas > 0) itens.push({ico:'💼', titulo: stats.vagas + ' vaga(s) interna(s)', sub:'Confira oportunidades de movimentação interna.'});

  recentes.forEach(p => itens.push({
    ico: p.tipo === 'documentos' ? '📄' : p.tipo === 'links' ? '🔗' : p.tipo === 'vagas' ? '💼' : p.tipo === 'avisos' ? '📢' : '📰',
    titulo: p.titulo || 'Nova publicação',
    sub: 'Publicado em ' + (p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : 'data não informada')
  }));

  const finalItens = itens.slice(0, 5);
  if (count) count.textContent = finalItens.length + (finalItens.length === 1 ? ' alerta' : ' alertas');
  list.innerHTML = finalItens.length ? finalItens.map(n =>
    '<div class="intra-notif-item"><div class="intra-notif-ico">' + n.ico + '</div><div><b>' + n.titulo + '</b><small>' + n.sub + '</small></div></div>'
  ).join('') : '<div class="intra-notif-item"><div class="intra-notif-ico">✅</div><div><b>Tudo certo por aqui</b><small>Sem novas notificações no momento.</small></div></div>';
}

async function intraCarregar() {
  // Todos os perfis podem publicar
  const btnP = document.getElementById('intra-btn-publicar');
  if (btnP) btnP.style.display = '';
  try {
    const snap = await db.collection(col('intranet')).orderBy('criadoEm','desc').get();
    intraPublicacoes = snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch(e) { intraPublicacoes = []; }
  intraRender(); intraUpdateStats();
}

// ══════════════════════════════════════════
// PESQUISAS
// ══════════════════════════════════════════
let pesqLista = [];
let pesqModoResposta = null;
let pesqTabAtiva = 'ativas';

// Modelos prontos de pesquisas
const PESQ_MODELOS = {
  clima_nps: {
    titulo: 'NPS de Clima Geral',
    descricao: 'Pesquisa rápida para medir o nível de satisfação e engajamento dos colaboradores. Totalmente anônima.',
    tipo: 'nps',
    anonima: true,
    opcoes: [],
    perguntas: [
      'Em uma escala de 0 a 10, o quanto você recomendaria esta empresa como um bom lugar para trabalhar?',
      'Em uma escala de 0 a 10, como você avalia seu nível de satisfação no trabalho atualmente?',
      'Em uma escala de 0 a 10, o quanto você se sente valorizado(a) pela empresa?',
      'Em uma escala de 0 a 10, como você avalia a qualidade do seu relacionamento com seu gestor imediato?',
      'Em uma escala de 0 a 10, o quanto você se sente motivado(a) para entregar o seu melhor no trabalho?'
    ],
    modelo: 'clima_nps'
  },
  clima_multi: {
    titulo: 'Pesquisa de Clima Multidimensional',
    descricao: 'Avalie sua percepção sobre diferentes aspectos do ambiente de trabalho. Responda com honestidade — a pesquisa é totalmente anônima.',
    tipo: 'escala',
    anonima: true,
    opcoes: ['1 - Muito insatisfeito','2 - Insatisfeito','3 - Neutro','4 - Satisfeito','5 - Muito satisfeito'],
    perguntas: [
      'Como você avalia a liderança e gestão da sua equipe?',
      'Como você avalia a comunicação interna da empresa?',
      'Como você se sente em relação ao reconhecimento pelo seu trabalho?',
      'Como você avalia o equilíbrio entre vida pessoal e trabalho?',
      'Como você avalia o ambiente e a cultura da empresa?',
      'Como você avalia as oportunidades de crescimento e desenvolvimento profissional?',
      'Como você avalia a clareza sobre metas e objetivos da empresa?',
      'Como você avalia a colaboração e o trabalho em equipe no seu setor?',
      'Como você avalia os recursos e ferramentas disponíveis para realizar seu trabalho?',
      'Como você avalia o alinhamento entre os valores da empresa e as práticas do dia a dia?'
    ],
    modelo: 'clima_multi'
  },
  pulso_semanal: {
    titulo: 'Pulso Semanal — Como você está?',
    descricao: 'Check-in rápido semanal para entender como a equipe está se sentindo. Anônimo e leva menos de 2 minutos.',
    tipo: 'enquete',
    anonima: true,
    opcoes: ['😞 Muito mal','😕 Mal','😐 Mais ou menos','🙂 Bem','😄 Excelente'],
    perguntas: [
      'Como você está se sentindo em relação ao trabalho esta semana?',
      'Como está seu nível de energia e disposição esta semana?',
      'Como está seu relacionamento com a equipe esta semana?',
      'Como você avalia sua produtividade esta semana?',
      'Como está seu nível de estresse esta semana?'
    ],
    modelo: 'pulso_semanal'
  },
  avaliacao_lideranca: {
    titulo: 'Avaliação da Liderança',
    descricao: 'Sua percepção é importante para o desenvolvimento da liderança. Responda com sinceridade — a pesquisa é anônima.',
    tipo: 'enquete',
    anonima: true,
    opcoes: ['Raramente','Às vezes','Frequentemente','Sempre'],
    perguntas: [
      'Meu gestor me dá clareza sobre as expectativas e objetivos.',
      'Meu gestor me fornece feedbacks úteis e construtivos.',
      'Meu gestor me ouve quando tenho dúvidas ou sugestões.',
      'Meu gestor reconhece meu trabalho e contribuições.',
      'Meu gestor me dá autonomia para realizar meu trabalho.',
      'Meu gestor me apoia no meu desenvolvimento profissional.',
      'Meu gestor trata todos os membros da equipe de forma justa.',
      'Meu gestor comunica as decisões importantes de forma transparente.',
      'Meu gestor me motiva e inspira a dar o meu melhor.',
      'Meu gestor resolve conflitos e problemas da equipe de forma eficaz.',
      'Me sinto à vontade para compartilhar ideias e opiniões com meu gestor.',
      'Meu gestor demonstra interesse genuíno pelo meu bem-estar.'
    ],
    modelo: 'avaliacao_lideranca'
  },
  saude_bemestar: {
    titulo: 'Bem-Estar e Saúde Mental no Trabalho',
    descricao: 'Esta pesquisa é totalmente anônima e sigilosa. Os resultados são analisados apenas de forma agregada pelo RH. Sua resposta sincera nos ajuda a criar um ambiente mais saudável.',
    tipo: 'enquete',
    anonima: true,
    opcoes: ['Nunca','Raramente','Às vezes','Frequentemente','Sempre'],
    perguntas: [
      'Me sinto com energia para realizar minhas atividades diárias.',
      'Consigo me desconectar do trabalho fora do horário.',
      'Me sinto motivado(a) para ir trabalhar.',
      'Consigo gerenciar meu estresse no trabalho.',
      'Me sinto apoiado(a) pela empresa em questões de bem-estar.',
      'Consigo manter um equilíbrio saudável entre trabalho e vida pessoal.',
      'Me sinto psicologicamente seguro(a) para expressar opiniões no trabalho.',
      'Tenho tempo suficiente para pausas e descanso durante o dia.',
      'Me sinto produtivo(a) sem precisar sacrificar minha saúde.',
      'A empresa demonstra preocupação genuína com a saúde mental dos colaboradores.'
    ],
    modelo: 'saude_bemestar'
  },
  burnout_screening: {
    titulo: 'Screening de Esgotamento (Burnout)',
    descricao: '🔒 Pesquisa 100% anônima e sigilosa. Os resultados são apresentados SOMENTE de forma agregada ao RH. Responda com sinceridade — suas respostas nos ajudam a agir preventivamente.',
    tipo: 'enquete',
    anonima: true,
    opcoes: ['Nunca','Raramente','Às vezes','Frequentemente','Quase sempre'],
    perguntas: [
      'Sinto-me esgotado(a) emocionalmente pelo trabalho.',
      'Sinto que estou me tornando menos empático(a) com colegas e clientes.',
      'Sinto que meu trabalho não está fazendo diferença.',
      'Tenho dificuldade de me concentrar nas atividades.',
      'Sinto que não consigo mais dar o meu melhor no trabalho.',
      'Tenho dificuldade para descansar mesmo quando estou em folga.',
      'Sinto que a quantidade de trabalho é maior do que consigo gerenciar.',
      'Me sinto desmotivado(a) ao começar o dia de trabalho.',
      'Tenho sintomas físicos relacionados ao estresse (dor de cabeça, insônia, etc.).',
      'Sinto que meus esforços não são reconhecidos ou valorizados.',
      'Tenho vontade de largar o emprego frequentemente.',
      'Me sinto emocionalmente distante do meu trabalho e da equipe.'
    ],
    modelo: 'burnout_screening'
  },
  qvt: {
    titulo: 'Qualidade de Vida no Trabalho (QVT)',
    descricao: 'Avalie sua percepção sobre os fatores que impactam sua qualidade de vida no ambiente de trabalho. Pesquisa anônima.',
    tipo: 'enquete',
    anonima: true,
    opcoes: ['Muito insatisfeito','Insatisfeito','Neutro','Satisfeito','Muito satisfeito'],
    perguntas: [
      'Como está sua carga horária de trabalho?',
      'Como está seu ambiente físico e ergonômico de trabalho?',
      'Como você avalia suas relações com colegas?',
      'Como você avalia sua autonomia nas tarefas?',
      'Como você avalia os benefícios e remuneração oferecidos?',
      'Como você avalia as oportunidades de desenvolvimento profissional?',
      'Como você avalia a segurança psicológica no seu ambiente de trabalho?',
      'Como você avalia a flexibilidade de horário e modelo de trabalho?',
      'Como você avalia o reconhecimento e valorização pelo seu trabalho?',
      'Como você avalia a clareza sobre seu plano de carreira na empresa?',
      'Como você avalia os recursos tecnológicos disponíveis para o seu trabalho?',
      'Como você avalia o suporte oferecido pela empresa para sua saúde e bem-estar?'
    ],
    modelo: 'qvt'
  },
  engajamento: {
    titulo: 'Engajamento e Pertencimento',
    descricao: 'Entenda o nível de engajamento e senso de pertencimento dos colaboradores. Pesquisa anônima com escala de concordância.',
    tipo: 'enquete',
    anonima: true,
    opcoes: ['Discordo totalmente','Discordo','Neutro','Concordo','Concordo totalmente'],
    perguntas: [
      'Me sinto parte importante da equipe e da empresa.',
      'Entendo claramente como meu trabalho contribui para os objetivos da empresa.',
      'Tenho orgulho de trabalhar nesta empresa.',
      'Me sinto comprometido(a) com o sucesso da empresa.',
      'Recomendaria esta empresa como um bom lugar para trabalhar.',
      'Me sinto incluído(a) e respeitado(a) independente das minhas características pessoais.',
      'Acredito no futuro e nas perspectivas de crescimento da empresa.',
      'Tenho clareza sobre os valores e a missão da empresa.',
      'Me sinto confortável para ser eu mesmo(a) no trabalho.',
      'Sinto que minha opinião é ouvida e considerada nas decisões.'
    ],
    modelo: 'engajamento'
  },
  onboarding: {
    titulo: 'Avaliação de Onboarding (30/60/90 dias)',
    descricao: 'Como está sendo sua experiência de integração na empresa? Suas respostas nos ajudam a melhorar o processo para futuros colaboradores.',
    tipo: 'enquete',
    anonima: true,
    opcoes: ['Muito ruim','Ruim','Regular','Bom','Muito bom'],
    perguntas: [
      'Como você avalia o processo de boas-vindas e integração?',
      'Como você avalia as informações recebidas sobre a empresa, cultura e valores?',
      'Como você avalia o suporte do seu gestor imediato durante a integração?',
      'Como você avalia o suporte do RH durante o processo de integração?',
      'Como você avalia a recepção e suporte dos colegas de equipe?',
      'Como você avalia a clareza sobre suas responsabilidades e expectativas do cargo?',
      'Como você avalia os treinamentos e capacitações oferecidos?',
      'Como você avalia as ferramentas e recursos disponibilizados para seu trabalho?',
      'Como você avalia a comunicação sobre processos e rotinas internas?',
      'Como você avalia o alinhamento entre o que foi apresentado no processo seletivo e a realidade do trabalho?'
    ],
    modelo: 'onboarding'
  },
  desligamento: {
    titulo: 'Pesquisa de Desligamento (Exit Interview)',
    descricao: 'Sua opinião é muito importante para melhorarmos. Esta pesquisa é confidencial e os dados são analisados de forma agregada.',
    tipo: 'enquete',
    anonima: true,
    opcoes: ['Discordo totalmente','Discordo','Neutro','Concordo','Concordo totalmente'],
    perguntas: [
      'O motivo da minha saída está relacionado à liderança imediata.',
      'O motivo da minha saída está relacionado à remuneração e benefícios.',
      'O motivo da minha saída está relacionado à falta de oportunidades de crescimento.',
      'O motivo da minha saída está relacionado ao clima e cultura organizacional.',
      'O motivo da minha saída está relacionado a uma proposta externa de emprego.',
      'Durante meu tempo na empresa, me senti reconhecido(a) e valorizado(a).',
      'As condições de trabalho atenderam às minhas expectativas.',
      'Recebi feedbacks claros e regulares sobre meu desempenho.',
      'Tive oportunidades reais de desenvolvimento e crescimento.',
      'Indicaria a empresa para um amigo ou colega como local de trabalho.',
      'Se as circunstâncias fossem diferentes, consideraria retornar à empresa.',
      'As informações passadas no processo seletivo condiziam com a realidade do trabalho.'
    ],
    modelo: 'desligamento'
  },
  abertura_apoio: {
    titulo: 'Espaço de Escuta — Como posso ser apoiado(a)?',
    descricao: '🤲 Este é um espaço seguro e sigiloso. Compartilhe como você está se sentindo e se há algo que a empresa possa fazer para te apoiar. Anônimo e sem julgamentos.',
    tipo: 'texto',
    anonima: true,
    opcoes: [],
    perguntas: [
      'Como você está se sentindo em relação ao seu trabalho no momento?',
      'Há alguma situação ou desafio que está impactando seu desempenho ou bem-estar?',
      'O que a empresa ou seu gestor poderia fazer para te apoiar melhor?',
      'Há algo que você gostaria que mudasse no seu ambiente de trabalho?',
      'Tem algo positivo que você gostaria de destacar sobre a empresa ou equipe?'
    ],
    modelo: 'abertura_apoio'
  }
};

function pesqIsAdmin() {
  return isRH();
}

function pesqTab(t, el) {
  const isAdmin = pesqIsAdmin();
  // Colaborador e gestor não acessam criação, modelos prontos, encerradas ou resultados consolidados.
  if (!isAdmin && t !== 'ativas') t = 'ativas';

  pesqTabAtiva = t;
  document.querySelectorAll('#pesq-tabs .tab').forEach(b => b.classList.remove('active'));
  const activeBtn = el && (!el.id || el.style.display !== 'none') ? el : document.querySelector('#pesq-tabs .tab[onclick*="ativas"]');
  if (activeBtn) activeBtn.classList.add('active');

  ['ativas','modelos','encerradas'].forEach(p => {
    const pane = document.getElementById('pesq-pane-' + p);
    if (pane) pane.style.display = (p === t) ? 'block' : 'none';
  });

  if (t === 'encerradas' && isAdmin) pesqRenderEncerradas();
  if (t === 'ativas') pesqRender();

  const btnCriar = document.getElementById('pesq-btn-criar');
  if (btnCriar) btnCriar.style.display = (isAdmin && t !== 'modelos') ? '' : 'none';
}

async function pesqAplicarModelo(modeloKey) {
  if (!pesqIsAdmin()) { addNotif('Apenas o RH pode aplicar modelos de pesquisa.', 'error'); pesqTab('ativas'); return; }
  const modelo = PESQ_MODELOS[modeloKey];
  if (!modelo) return;
  if (!confirm(`Deseja criar a pesquisa "${modelo.titulo}" agora?\n\nEla ficará disponível imediatamente para todos os colaboradores.`)) return;
  const pesq = {
    id: crypto.randomUUID(),
    ...modelo,
    respostas: [],
    status: 'aberta',
    criadoEm: new Date().toISOString(),
    criador: document.getElementById('pLabel')?.textContent || 'RH',
  };
  try { await db.collection(col('pesquisas')).doc(pesq.id).set(pesq); } catch(e) {}
  pesqLista.unshift(pesq);
  pesqUpdateStats();
  addNotif('Pesquisa "' + modelo.titulo + '" criada com sucesso!', 'success');
  log('Pesquisas', 'Modelo aplicado: ' + modelo.titulo, '📝');
  // Ir para aba ativas
  const tab = document.querySelector('#pesq-tabs .tab');
  pesqTab('ativas', tab);
  document.querySelectorAll('#pesq-tabs .tab')[0].classList.add('active');
  pesqRender();
}

function pesqAbrirModal(pesq) {
  pesqModoResposta = pesq || null;
  const modal = document.getElementById('pesqModal');
  const criacao = document.getElementById('pesq-criacao');
  const resposta = document.getElementById('pesq-resposta');
  const footer = document.getElementById('pesq-modal-footer');
  const titulo = document.getElementById('pesq-modal-titulo');
  modal.style.display = 'flex';
  if (pesq) {
    titulo.textContent = '📝 ' + pesq.titulo;
    criacao.style.display = 'none';
    resposta.style.display = 'block';
    footer.innerHTML = '<button class="btn btn-g btn-sm" onclick="pesqFecharModal()">Cancelar</button><button class="btn btn-p btn-sm" onclick="pesqResponder()">Enviar Resposta</button>';
    let html = '';
    if (pesq.descricao) html += `<div style="background:var(--pur-soft);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--ink-60);margin-bottom:18px;line-height:1.6">${pesq.descricao}</div>`;

    // Modelo multidimensional ou com perguntas múltiplas
    if (pesq.perguntas && pesq.perguntas.length) {
      pesq.perguntas.forEach((perg, idx) => {
        html += `<div style="margin-bottom:18px"><div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:10px">${idx+1}. ${perg}</div>`;
        if (pesq.tipo === 'escala') {
          html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
          [1,2,3,4,5].forEach(n => {
            const cor = n<=2?'#ef4444':n===3?'#F4B740':'#22C58B';
            html += `<button onclick="pesqSelEscala(this,${idx},${n})" data-perg="${idx}" data-val="${n}" style="border:1.5px solid var(--border);border-radius:8px;padding:8px 14px;cursor:pointer;font-weight:700;font-size:13px;background:var(--bg);transition:.15s;flex:1;min-width:36px">${n}</button>`;
          });
          html += '</div><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--ink-30);margin-top:4px"><span>Muito insatisfeito</span><span>Muito satisfeito</span></div>';
        } else {
          html += pesq.opcoes.map((op,oi) => `
            <label style="display:flex;align-items:center;gap:10px;padding:9px 12px;border:1.5px solid var(--border);border-radius:9px;cursor:pointer;margin-bottom:6px;transition:.15s" onmouseover="this.style.borderColor='var(--pur)'" onmouseout="this.style.borderColor='var(--border)'">
              <input type="radio" name="pesq-resp-${idx}" value="${oi}" style="width:auto;accent-color:var(--pur)"/>
              <span style="font-size:13px">${op}</span>
            </label>`).join('');
        }
        html += '</div>';
      });
    } else if (pesq.tipo === 'enquete') {
      html += pesq.opcoes.map((op,i) => `
        <label style="display:flex;align-items:center;gap:10px;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;margin-bottom:8px;transition:.15s" onmouseover="this.style.borderColor='var(--pur)'" onmouseout="this.style.borderColor='var(--border)'">
          <input type="radio" name="pesq-resp" value="${i}" style="width:auto;accent-color:var(--pur)"/>
          <span style="font-size:14px">${op}</span>
        </label>`).join('');
    } else if (pesq.tipo === 'nps') {
      html += '<div style="margin-bottom:8px;font-size:13px;font-weight:600;color:var(--ink)">Selecione sua nota:</div>';
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
        [...Array(11).keys()].map(n => {
          const cor = n<=6?'#ef4444':n<=8?'#F4B740':'#22C58B';
          return `<button onclick="pesqSelNPS(this,${n})" data-nps="${n}" style="border:1.5px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;font-weight:700;font-size:14px;background:var(--bg);transition:.15s;flex:1;min-width:38px">${n}</button>`;
        }).join('') +
        '</div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-30)"><span>Muito improvável</span><span>Muito provável</span></div>';
    } else if (pesq.tipo === 'escala') {
      html += '<div style="margin-bottom:8px;font-size:13px;font-weight:600;color:var(--ink)">Selecione sua nota:</div>';
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
      [1,2,3,4,5].forEach(n => {
        html += `<button onclick="pesqSelNPS(this,${n})" data-nps="${n}" style="border:1.5px solid var(--border);border-radius:8px;padding:12px;cursor:pointer;font-weight:700;font-size:16px;background:var(--bg);transition:.15s;flex:1">${n}</button>`;
      });
      html += '</div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-30);margin-top:4px"><span>Muito insatisfeito</span><span>Muito satisfeito</span></div>';
    } else {
      html += '<textarea id="pesq-resp-texto" placeholder="Compartilhe sua resposta aqui…" style="width:100%;min-height:120px;border:1.5px solid var(--border);border-radius:10px;padding:12px;font-size:14px;font-family:inherit;outline:none;resize:vertical;transition:.18s" onfocus="this.style.borderColor=\'var(--pur)\'" onblur="this.style.borderColor=\'var(--border)\'"></textarea>';
    }
    resposta.innerHTML = html;
  } else {
    titulo.textContent = '📝 Nova Pesquisa';
    criacao.style.display = 'block';
    resposta.style.display = 'none';
    footer.innerHTML = '<button class="btn btn-g btn-sm" onclick="pesqFecharModal()">Cancelar</button><button class="btn btn-p btn-sm" onclick="pesqSalvar()">Criar Pesquisa</button>';
    pesqAtualizarOpcoes();
  }
}

function pesqSelNPS(el, n) {
  document.querySelectorAll('[data-nps]').forEach(b => { b.style.background='var(--bg)'; b.style.borderColor='var(--border)'; b.style.color='var(--ink)'; delete b.dataset.selected; });
  el.style.background = 'var(--pur)'; el.style.borderColor = 'var(--pur)'; el.style.color = '#fff';
  el.dataset.selected = '1';
}

function pesqSelEscala(el, pergIdx, val) {
  document.querySelectorAll(`[data-perg="${pergIdx}"]`).forEach(b => { b.style.background='var(--bg)'; b.style.borderColor='var(--border)'; b.style.color='var(--ink)'; delete b.dataset.selected; });
  el.style.background = 'var(--pur)'; el.style.borderColor = 'var(--pur)'; el.style.color = '#fff';
  el.dataset.selected = '1';
}

function pesqFecharModal() {
  document.getElementById('pesqModal').style.display = 'none';
  pesqModoResposta = null;
}

function pesqAtualizarOpcoes() {
  const tipo = document.getElementById('pesq-tipo')?.value;
  const wrap = document.getElementById('pesq-opcoes-wrap');
  const hint = document.getElementById('pesq-escala-hint');
  if (wrap) wrap.style.display = (tipo === 'enquete') ? 'block' : 'none';
  if (hint) hint.style.display = (tipo === 'escala') ? 'block' : 'none';
}

function pesqAddOpcao() {
  const lista = document.getElementById('pesq-opcoes-lista');
  const n = lista.children.length + 1;
  const d = document.createElement('div');
  d.style.cssText = 'display:flex;gap:7px';
  d.innerHTML = `<input type="text" class="pesq-op" placeholder="Opção ${n}" style="flex:1"/><button onclick="pesqRemoverOpcao(this)" style="border:none;background:#fee2e2;border-radius:7px;padding:6px 10px;cursor:pointer;color:#991b1b;font-size:13px">✕</button>`;
  lista.appendChild(d);
}
function pesqRemoverOpcao(btn) {
  const lista = document.getElementById('pesq-opcoes-lista');
  if (lista.children.length <= 2) { alert('Mínimo 2 opções.'); return; }
  btn.parentElement.remove();
}

async function pesqSalvar() {
  const titulo = document.getElementById('pesq-titulo').value.trim();
  if (!titulo) { alert('Informe o título.'); return; }
  const tipo = document.getElementById('pesq-tipo').value;
  let opcoes = [];
  if (tipo === 'enquete') {
    opcoes = [...document.querySelectorAll('.pesq-op')].map(i => i.value.trim()).filter(Boolean);
    if (opcoes.length < 2) { alert('Adicione ao menos 2 opções.'); return; }
  }
  const pesq = {
    id: crypto.randomUUID(),
    titulo,
    descricao: document.getElementById('pesq-desc').value.trim(),
    tipo,
    anonima: document.getElementById('pesq-anon').value === 'anonima',
    opcoes,
    respostas: [],
    status: 'aberta',
    criadoEm: new Date().toISOString(),
    criador: document.getElementById('pLabel')?.textContent || 'RH',
  };
  try { await db.collection(col('pesquisas')).doc(pesq.id).set(pesq); } catch(e) {}
  pesqLista.unshift(pesq);
  pesqFecharModal();
  pesqRender();
  pesqUpdateStats();
  addNotif('Pesquisa "' + titulo + '" criada!', 'success');
  log('Pesquisas', 'Nova pesquisa: ' + titulo, '📝');
}

async function pesqResponder() {
  const p = pesqModoResposta;
  if (!p) return;
  let valor = null;

  if (p.perguntas && p.perguntas.length) {
    // Pesquisa multidimensional
    const respostas = {};
    let incompleto = false;
    p.perguntas.forEach((perg, idx) => {
      if (p.tipo === 'escala') {
        const sel = document.querySelector(`[data-perg="${idx}"][data-selected="1"]`);
        if (!sel) { incompleto = true; return; }
        respostas[idx] = {pergunta: perg, valor: parseInt(sel.dataset.val)};
      } else {
        const sel = document.querySelector(`input[name="pesq-resp-${idx}"]:checked`);
        if (!sel) { incompleto = true; return; }
        respostas[idx] = {pergunta: perg, valor: p.opcoes[parseInt(sel.value)]};
      }
    });
    if (incompleto) { alert('Por favor, responda todas as perguntas.'); return; }
    valor = respostas;
  } else if (p.tipo === 'enquete') {
    const sel = document.querySelector('input[name="pesq-resp"]:checked');
    if (!sel) { alert('Selecione uma opção.'); return; }
    valor = p.opcoes[parseInt(sel.value)];
  } else if (p.tipo === 'nps' || p.tipo === 'escala') {
    const sel = document.querySelector('[data-nps][data-selected="1"]');
    if (!sel) { alert('Selecione uma nota.'); return; }
    valor = parseInt(sel.dataset.nps);
  } else {
    valor = document.getElementById('pesq-resp-texto')?.value.trim();
    if (!valor) { alert('Por favor, compartilhe sua resposta.'); return; }
  }
  const usuario = currentUserData || {};
  const resp = {
    id: crypto.randomUUID(),
    pesquisaId: p.id,
    pesquisaTitulo: p.titulo,
    valor,
    respondidoEm: new Date().toISOString(),
    anonima: !!p.anonima,
    respondente: p.anonima ? 'Anônimo' : (usuario.nome || sessionStorage.getItem('userName') || ''),
    respondenteEmail: p.anonima ? null : (usuario.email || sessionStorage.getItem('userEmail') || null),
    respondenteId: p.anonima ? null : (usuario.docId || usuario.id || null),
    setor: p.anonima ? null : (usuario.setor || null),
    cargo: p.anonima ? null : (usuario.cargo || usuario.funcao || null)
  };
  p.respostas = p.respostas || [];
  p.respostas.push(resp);
  try {
    await db.collection(col('pesquisas')).doc(p.id).update({respostas: p.respostas, atualizadoEm: new Date().toISOString()});
    await db.collection(col('respostas_pesquisa')).doc(resp.id).set(resp);
    await db.collection(col('recebimentos_rh')).doc(resp.id).set({
      id: resp.id, tipo:'pesquisa', titulo:p.titulo, status:'novo', criadoEm:resp.respondidoEm, origemId:p.id, resumo:'Nova resposta recebida'
    });
  } catch(e) { console.warn('Erro ao salvar resposta:', e.message); }
  pesqFecharModal();
  pesqRender();
  addNotif('Resposta enviada! Obrigado pela participação.', 'success');
}

function pesqRender() {
  const lista = document.getElementById('pesq-lista');
  if (!lista) return;
  const abertas = pesqLista.filter(p => p.status === 'aberta');
  if (!abertas.length) {
    lista.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-30)"><div style="font-size:36px;margin-bottom:10px">📝</div><div style="font-size:14px">Nenhuma pesquisa ativa no momento.</div></div>';
    return;
  }
  const tipoIcon = {enquete:'🗳️',nps:'⭐',texto:'💬',escala:'📏'};
  const tipoLabel = {enquete:'Enquete',nps:'NPS',texto:'Aberta',escala:'Escala 1–5'};
  lista.innerHTML = abertas.map(p => {
    const total = (p.respostas||[]).length;
    const modelo = p.modelo ? PESQ_MODELOS[p.modelo] : null;
    const tagColor = p.modelo && p.modelo.includes('saude') ? '#3B82F6' : p.modelo && p.modelo.includes('burnout') ? '#F87171' : p.modelo ? '#0099ff' : 'var(--pur)';
    return `<div class="card" style="border-left:4px solid ${tagColor}">
      <div style="padding:18px 22px;display:flex;gap:14px;align-items:flex-start">
        <div style="width:44px;height:44px;border-radius:12px;background:${tagColor}15;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${tipoIcon[p.tipo]||'📝'}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
            <span style="font-size:11px;font-weight:700;background:#d1fae5;color:#065f46;border-radius:4px;padding:2px 8px">● Aberta</span>
            <span style="font-size:11px;color:var(--ink-30)">${tipoLabel[p.tipo]||''} · ${p.anonima?'🔒 Anônima':'👤 Identificada'}</span>
            ${p.modelo ? `<span style="font-size:10px;font-weight:700;background:${tagColor}15;color:${tagColor};border-radius:4px;padding:2px 7px">Modelo Pronto</span>` : ''}
          </div>
          <div style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:3px">${p.titulo}</div>
          ${p.descricao ? `<div style="font-size:13px;color:var(--ink-60);margin-bottom:6px;line-height:1.5">${p.descricao.slice(0,120)}${p.descricao.length>120?'...':''}</div>` : ''}
          <div style="font-size:12px;color:var(--ink-30)">Por ${p.criador} · ${total} resposta${total!==1?'s':''} · ${new Date(p.criadoEm).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex-shrink:0">
          <button class="btn btn-p btn-sm" onclick="pesqAbrirModal(pesqLista.find(x=>x.id==='${p.id}'))">✏️ Responder</button>
          ${pesqIsAdmin() ? `<button class="btn btn-sm" onclick="pesqVerResultados('${p.id}')" style="background:var(--pur-soft);color:var(--pur);border:1px solid var(--pur-mid);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;font-weight:600">📊 Resultados</button>` : ''}
          ${pesqIsAdmin() ? `<button onclick="pesqExcluir('${p.id}')" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:5px 9px;cursor:pointer;font-size:12px;color:#991b1b">🗑</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function pesqRenderEncerradas() {
  const lista = document.getElementById('pesq-lista-encerradas');
  if (!lista) return;
  const encerradas = pesqLista.filter(p => p.status !== 'aberta');
  if (!encerradas.length) {
    lista.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-30)"><div style="font-size:36px;margin-bottom:10px">🗂</div><div style="font-size:14px">Nenhuma pesquisa encerrada ainda.</div></div>';
    return;
  }
  const tipoIcon = {enquete:'🗳️',nps:'⭐',texto:'💬',escala:'📏'};
  lista.innerHTML = encerradas.map(p => {
    const total = (p.respostas||[]).length;
    return `<div class="card" style="opacity:.85">
      <div style="padding:18px 22px;display:flex;gap:14px;align-items:flex-start">
        <div style="width:44px;height:44px;border-radius:12px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${tipoIcon[p.tipo]||'📝'}</div>
        <div style="flex:1">
          <div style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:3px">${p.titulo}</div>
          <div style="font-size:12px;color:var(--ink-30)">${total} resposta${total!==1?'s':''} · Encerrada · ${new Date(p.criadoEm).toLocaleDateString('pt-BR')}</div>
        </div>
        ${pesqIsAdmin() ? `<button class="btn btn-sm" onclick="pesqVerResultados('${p.id}')" style="background:var(--pur-soft);color:var(--pur);border:1px solid var(--pur-mid);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;font-weight:600;flex-shrink:0">📊 Ver</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function pesqVerResultados(id) {
  const p = pesqLista.find(x => x.id === id);
  if (!p) return;
  const total = (p.respostas||[]).length;
  const modal = document.getElementById('pesqResultadosModal');
  const body = document.getElementById('pesq-res-body');
  const titulo = document.getElementById('pesq-res-titulo');
  const btnEnc = document.getElementById('pesq-res-btn-encerrar');
  titulo.textContent = '📊 ' + p.titulo;
  if (btnEnc) {
    btnEnc.style.display = (p.status === 'aberta' && pesqIsAdmin()) ? 'block' : 'none';
    btnEnc.onclick = () => pesqEncerrar(id);
  }

  let html = `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
    <div style="background:var(--pur-soft);border-radius:10px;padding:12px 18px;text-align:center;flex:1;min-width:80px">
      <div style="font-size:24px;font-weight:800;color:var(--pur)">${total}</div>
      <div style="font-size:11px;color:var(--ink-60);font-weight:600">Respostas</div>
    </div>
    <div style="background:#d1fae5;border-radius:10px;padding:12px 18px;text-align:center;flex:1;min-width:80px">
      <div style="font-size:24px;font-weight:800;color:#065f46">${p.status==='aberta'?'Aberta':'Encerrada'}</div>
      <div style="font-size:11px;color:#065f46;font-weight:600">Status</div>
    </div>
    <div style="background:#DBEAFE;border-radius:10px;padding:12px 18px;text-align:center;flex:1;min-width:80px">
      <div style="font-size:24px;font-weight:800;color:var(--pur)">${p.anonima?'🔒':'👤'}</div>
      <div style="font-size:11px;color:var(--ink-60);font-weight:600">${p.anonima?'Anônima':'Identificada'}</div>
    </div>
  </div>`;

  if (!total) {
    html += '<div style="text-align:center;padding:30px;color:var(--ink-30)"><div style="font-size:32px;margin-bottom:8px">📭</div><div>Nenhuma resposta ainda.</div></div>';
  } else if (p.perguntas && p.perguntas.length) {
    // Resultados multidimensional
    html += '<div style="font-size:13px;font-weight:700;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em;margin-bottom:14px">Resultados por Dimensão</div>';
    p.perguntas.forEach((perg, idx) => {
      const respostasArr = p.respostas.map(r => {
        if (typeof r.valor === 'object' && r.valor[idx]) return r.valor[idx].valor;
        return null;
      }).filter(v => v !== null);
      if (!respostasArr.length) return;
      html += `<div style="margin-bottom:18px"><div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:10px">${idx+1}. ${perg}</div>`;
      if (p.tipo === 'escala') {
        const media = (respostasArr.reduce((a,v)=>a+Number(v),0)/respostasArr.length).toFixed(1);
        const pct = ((media/5)*100).toFixed(0);
        const cor = media<=2?'#ef4444':media<=3?'#F4B740':'#22C58B';
        html += `<div style="display:flex;align-items:center;gap:12px"><div style="flex:1;height:10px;background:var(--border);border-radius:5px;overflow:hidden"><div style="height:100%;background:${cor};border-radius:5px;width:${pct}%"></div></div><span style="font-size:15px;font-weight:800;color:${cor};min-width:32px">${media}</span></div><div style="font-size:11px;color:var(--ink-30);margin-top:4px">${respostasArr.length} resp. · Escala 1–5</div>`;
      } else {
        const counts = {};
        respostasArr.forEach(v => counts[v] = (counts[v]||0)+1);
        const n = respostasArr.length;
        Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([op,cnt]) => {
          const pct = Math.round(cnt/n*100);
          html += `<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:3px"><span>${op}</span><span>${pct}% (${cnt})</span></div><div style="height:7px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;background:var(--pur);border-radius:4px;width:${pct}%"></div></div></div>`;
        });
      }
      html += '</div>';
    });
  } else if (p.tipo === 'enquete') {
    html += '<div style="font-size:13px;font-weight:700;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em;margin-bottom:14px">Distribuição de Respostas</div>';
    const counts = {};
    p.respostas.forEach(r => counts[r.valor] = (counts[r.valor]||0)+1);
    p.opcoes.forEach(op => {
      const n = counts[op]||0;
      const pct = total ? Math.round(n/total*100) : 0;
      html += `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:4px"><span>${op}</span><span style="color:var(--pur)">${pct}% <span style="color:var(--ink-30);font-weight:400">(${n})</span></span></div><div style="height:9px;background:var(--border);border-radius:5px;overflow:hidden"><div style="height:100%;background:var(--pur);border-radius:5px;width:${pct}%;transition:width .6s ease"></div></div></div>`;
    });
  } else if (p.tipo === 'nps' || p.tipo === 'escala') {
    const soma = p.respostas.reduce((a,r)=>a+(Number(r.valor)||0),0);
    const media = (soma/total).toFixed(1);
    const maxV = p.tipo === 'escala' ? 5 : 10;
    const pct = Math.round((media/maxV)*100);
    const cor = pct < 50 ? '#ef4444' : pct < 70 ? '#F4B740' : '#22C58B';
    html += `<div style="text-align:center;padding:20px 0">
      <div style="font-size:56px;font-weight:900;color:${cor};line-height:1">${media}</div>
      <div style="font-size:16px;color:var(--ink-30);margin-top:4px">de ${maxV}</div>
      <div style="height:12px;background:var(--border);border-radius:6px;overflow:hidden;margin:16px 0">
        <div style="height:100%;background:${cor};border-radius:6px;width:${pct}%;transition:width .6s ease"></div>
      </div>
      <div style="font-size:13px;color:var(--ink-60)">Baseado em ${total} respostas</div>
    </div>`;
    if (p.tipo === 'nps') {
      const detrat = p.respostas.filter(r=>r.valor<=6).length;
      const neutr = p.respostas.filter(r=>r.valor>=7&&r.valor<=8).length;
      const prom = p.respostas.filter(r=>r.valor>=9).length;
      const npsScore = Math.round(((prom-detrat)/total)*100);
      html += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px">
        <div style="background:#fef2f2;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;font-weight:800;color:#ef4444">${detrat}</div><div style="font-size:11px;color:#991b1b">Detratores<br>(0–6)</div></div>
        <div style="background:#fffbeb;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;font-weight:800;color:#d97706">${neutr}</div><div style="font-size:11px;color:#92400e">Neutros<br>(7–8)</div></div>
        <div style="background:#d1fae5;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;font-weight:800;color:#065f46">${prom}</div><div style="font-size:11px;color:#065f46">Promotores<br>(9–10)</div></div>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:14px;color:var(--ink-60)">Score NPS: <strong style="font-size:20px;color:${npsScore>=50?'#22C58B':npsScore>=0?'#F4B740':'#ef4444'}">${npsScore > 0 ? '+' : ''}${npsScore}</strong></div>`;
    }
  } else {
    html += '<div style="font-size:13px;font-weight:700;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em;margin-bottom:14px">Respostas Abertas</div>';
    html += p.respostas.map(r=>`<div style="background:var(--bg);border-radius:10px;padding:12px 14px;font-size:13px;margin-bottom:8px;border-left:3px solid var(--pur);line-height:1.6">${r.valor}<br><span style="font-size:11px;color:var(--ink-30)">${r.respondente} · ${new Date(r.respondidoEm).toLocaleDateString('pt-BR')}</span></div>`).join('');
  }
  body.innerHTML = html;
  modal.style.display = 'flex';
}

async function pesqEncerrar(id) {
  if (!confirm('Encerrar esta pesquisa? Ela ficará visível apenas na aba "Encerradas".')) return;
  const p = pesqLista.find(x => x.id === id);
  if (!p) return;
  p.status = 'encerrada';
  try { await db.collection(col('pesquisas')).doc(id).update({status: 'encerrada'}); } catch(e) {}
  document.getElementById('pesqResultadosModal').style.display = 'none';
  pesqRender();
  pesqUpdateStats();
  addNotif('Pesquisa encerrada.', 'success');
}

async function pesqExcluir(id) {
  if (!confirm('Excluir esta pesquisa permanentemente?')) return;
  try { await db.collection(col('pesquisas')).doc(id).delete(); } catch(e) {}
  pesqLista = pesqLista.filter(p => p.id !== id);
  pesqRender(); pesqUpdateStats();
}

function pesqUpdateStats() {
  const el_t = document.getElementById('pesq-total');
  const el_a = document.getElementById('pesq-abertas');
  const el_r = document.getElementById('pesq-respostas');
  if (el_t) el_t.textContent = pesqLista.length;
  if (el_a) el_a.textContent = pesqLista.filter(p=>p.status==='aberta').length;
  if (el_r) el_r.textContent = pesqLista.reduce((a,p)=>a+(p.respostas||[]).length,0);
}

async function pesqCarregar() {
  // Permissões: colaboradores/gestores respondem apenas pesquisas ativas; RH cria, aplica modelos e vê encerradas/resultados.
  const isAdmin = pesqIsAdmin();
  const tabModelos = document.getElementById('pesq-tab-modelos-btn');
  const tabEncerradas = document.getElementById('pesq-tab-encerradas-btn');
  const btnCriar = document.getElementById('pesq-btn-criar');
  if (tabModelos) tabModelos.style.display = isAdmin ? '' : 'none';
  if (tabEncerradas) tabEncerradas.style.display = isAdmin ? '' : 'none';
  if (btnCriar) btnCriar.style.display = isAdmin ? '' : 'none';

  // Garante que usuário sem perfil RH nunca fique preso em uma aba administrativa já aberta no navegador.
  if (!isAdmin) pesqTabAtiva = 'ativas';
  try {
    const snap = await db.collection(col('pesquisas')).orderBy('criadoEm','desc').get();
    pesqLista = snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch(e) { pesqLista = []; }
  pesqTab(pesqTabAtiva || 'ativas');
  pesqUpdateStats();
}

// ══════════════════════════════════════════
// TEST DISC
// ══════════════════════════════════════════
const DISC_PERGUNTAS = [
  {texto:"Quando enfrento um desafio, costumo...", ops:[
    {t:"Agir de forma imediata e direta",d:"D"},{t:"Motivar outros e buscar apoio",d:"I"},
    {t:"Analisar cuidadosamente antes de agir",d:"C"},{t:"Manter a calma e a estabilidade",d:"S"}]},
  {texto:"Em reuniões, meu comportamento mais frequente é...", ops:[
    {t:"Liderar a discussão e apresentar ideias",d:"D"},{t:"Animar o grupo e engajar todos",d:"I"},
    {t:"Ouvir e observar antes de opinar",d:"S"},{t:"Fazer perguntas detalhadas",d:"C"}]},
  {texto:"Quando recebo uma crítica, costumo...", ops:[
    {t:"Rebater com argumentos firmes",d:"D"},{t:"Tentar converter o crítico",d:"I"},
    {t:"Refletir e verificar os fatos",d:"C"},{t:"Aceitar e buscar harmonia",d:"S"}]},
  {texto:"Meu maior ponto forte profissional é...", ops:[
    {t:"Velocidade e foco em resultados",d:"D"},{t:"Comunicação e entusiasmo",d:"I"},
    {t:"Precisão e atenção aos detalhes",d:"C"},{t:"Lealdade e consistência",d:"S"}]},
  {texto:"Diante de mudanças, eu...", ops:[
    {t:"Abraço e lidero a mudança",d:"D"},{t:"Me adapto facilmente e entusiasmo os outros",d:"I"},
    {t:"Prefiro mudanças graduais e planejadas",d:"S"},{t:"Analiso riscos e consequências antes",d:"C"}]},
  {texto:"Ao trabalhar em equipe, prefiro...", ops:[
    {t:"Ser o líder e tomar decisões",d:"D"},{t:"Motivar e conectar as pessoas",d:"I"},
    {t:"Ser o ponto de apoio e estabilidade",d:"S"},{t:"Garantir qualidade e precisão",d:"C"}]},
  {texto:"Minha maior motivação no trabalho é...", ops:[
    {t:"Superar metas e desafios",d:"D"},{t:"Reconhecimento e interação social",d:"I"},
    {t:"Estabilidade e ambiente harmonioso",d:"S"},{t:"Resolver problemas complexos",d:"C"}]},
  {texto:"Em situações de pressão, costumo ficar...", ops:[
    {t:"Impaciente e direto",d:"D"},{t:"Otimista mas disperso",d:"I"},
    {t:"Resistente à mudança",d:"S"},{t:"Excessivamente analítico",d:"C"}]},
  {texto:"Ao tomar decisões, prefiro...", ops:[
    {t:"Agir rápido com base na intuição",d:"D"},{t:"Consultar pessoas e obter consenso",d:"I"},
    {t:"Seguir processos já estabelecidos",d:"S"},{t:"Coletar dados e analisar tudo",d:"C"}]},
  {texto:"Meu estilo de comunicação é...", ops:[
    {t:"Direto e assertivo",d:"D"},{t:"Expressivo e entusiasmado",d:"I"},
    {t:"Calmo e diplomático",d:"S"},{t:"Lógico e detalhado",d:"C"}]},
  {texto:"Quando cometo um erro, eu...", ops:[
    {t:"Reconheço e parto para corrigir rapidamente",d:"D"},{t:"Peço desculpas e envolvo outros na solução",d:"I"},
    {t:"Me cobro muito internamente",d:"S"},{t:"Analiso detalhadamente o que deu errado",d:"C"}]},
  {texto:"Meu ambiente de trabalho ideal é...", ops:[
    {t:"Dinâmico, com autonomia e desafios",d:"D"},{t:"Colaborativo e descontraído",d:"I"},
    {t:"Estável, previsível e organizado",d:"S"},{t:"Estruturado, com processos claros",d:"C"}]},
  {texto:"Ao receber instruções, prefiro...", ops:[
    {t:"Um resumo rápido — eu resolvo o resto",d:"D"},{t:"Uma conversa inspiradora sobre o objetivo",d:"I"},
    {t:"Instruções passo a passo detalhadas",d:"C"},{t:"Tempo para entender bem antes de começar",d:"S"}]},
  {texto:"Meu maior desafio no trabalho é lidar com...", ops:[
    {t:"Lentidão e falta de objetividade",d:"D"},{t:"Rotinas repetitivas e pouca interação",d:"I"},
    {t:"Conflitos e ambientes tensos",d:"S"},{t:"Falta de dados e processos imprecisos",d:"C"}]},
  {texto:"Quando penso em sucesso profissional, imagino...", ops:[
    {t:"Atingir resultados expressivos e ser referência",d:"D"},{t:"Ser reconhecido e influenciar pessoas",d:"I"},
    {t:"Ter estabilidade e ser valorizado pela equipe",d:"S"},{t:"Dominar minha área com excelência técnica",d:"C"}]},
  {texto:"Minha relação com regras e procedimentos é...", ops:[
    {t:"Sigo quando fazem sentido, mas questiono quando acho necessário",d:"D"},
    {t:"Prefiro flexibilidade para improvisar",d:"I"},
    {t:"Sigo rigorosamente para garantir consistência",d:"C"},
    {t:"Respeito, mas às vezes acho engessante",d:"S"}]},
  {texto:"Quando tenho que apresentar um projeto, costumo...", ops:[
    {t:"Ir direto ao ponto com foco nos resultados",d:"D"},
    {t:"Contar uma história envolvente e emocionar",d:"I"},
    {t:"Preparar slides detalhados e precisos",d:"C"},
    {t:"Destacar o impacto na equipe e nas pessoas",d:"S"}]},
  {texto:"Em relação a novas tecnologias, eu...", ops:[
    {t:"Adoto rápido se trouxer vantagem competitiva",d:"D"},
    {t:"Amo experimentar e compartilhar com outros",d:"I"},
    {t:"Adoto com cuidado após entender bem",d:"S"},
    {t:"Avalio detalhadamente antes de implementar",d:"C"}]},
  {texto:"Minha principal característica de liderança é...", ops:[
    {t:"Direcionamento e foco em resultados",d:"D"},
    {t:"Inspiração e motivação da equipe",d:"I"},
    {t:"Suporte e desenvolvimento das pessoas",d:"S"},
    {t:"Precisão e organização dos processos",d:"C"}]},
  {texto:"Em conflitos interpessoais, costumo...", ops:[
    {t:"Enfrentar diretamente para resolver logo",d:"D"},
    {t:"Usar o humor para aliviar a tensão",d:"I"},
    {t:"Evitar conflito e buscar conciliação",d:"S"},
    {t:"Analisar objetivamente os fatos",d:"C"}]},
  {texto:"Minha relação com prazos é...", ops:[
    {t:"Cumpro ou questiono se irrealistas",d:"D"},
    {t:"Às vezes me perco com tantas ideias",d:"I"},
    {t:"Sigo à risca para não comprometer a equipe",d:"S"},
    {t:"Planejo com antecedência para garantir qualidade",d:"C"}]},
  {texto:"Ao aprender algo novo, prefiro...", ops:[
    {t:"Aprender fazendo, na prática",d:"D"},
    {t:"Em grupo, com discussões e trocas",d:"I"},
    {t:"Com tutoriais e passo a passo detalhado",d:"C"},
    {t:"No meu ritmo, com tempo para absorver",d:"S"}]},
  {texto:"O que mais me incomoda em colegas de trabalho é...", ops:[
    {t:"Falta de iniciativa e passividade",d:"D"},
    {t:"Frieza e falta de entusiasmo",d:"I"},
    {t:"Instabilidade emocional e conflitos",d:"S"},
    {t:"Desorganização e imprecisão",d:"C"}]},
  {texto:"Minha abordagem para resolver problemas é...", ops:[
    {t:"Identificar a solução mais rápida e eficiente",d:"D"},
    {t:"Brainstorm com a equipe para ideias criativas",d:"I"},
    {t:"Seguir processos testados e confiáveis",d:"S"},
    {t:"Investigar a causa raiz com dados",d:"C"}]},
  {texto:"Quando percebo que algo não vai bem no projeto, eu...", ops:[
    {t:"Tomo o controle e redireciono imediatamente",d:"D"},
    {t:"Reúno a equipe para motivar e reorientar",d:"I"},
    {t:"Mantenho a calma e o ritmo para estabilizar",d:"S"},
    {t:"Faço uma análise profunda para entender o problema",d:"C"}]},
  {texto:"Meu planejamento de carreira é...", ops:[
    {t:"Ambicioso e orientado a resultados rápidos",d:"D"},
    {t:"Focado em impacto e reconhecimento",d:"I"},
    {t:"Gradual, com segurança e consistência",d:"S"},
    {t:"Especializado e baseado em competências técnicas",d:"C"}]},
  {texto:"Quando estou com energia baixa, costumo...", ops:[
    {t:"Forçar foco e resolver as tarefas prioritárias",d:"D"},
    {t:"Buscar conexão com pessoas para me energizar",d:"I"},
    {t:"Manter a rotina e aguardar a recuperação",d:"S"},
    {t:"Me isolar para recarregar e reorganizar",d:"C"}]},
  {texto:"Ao encerrar o dia de trabalho, me sinto satisfeito quando...", ops:[
    {t:"Concluí metas e avancei em resultados",d:"D"},
    {t:"Tive boas interações e inspirei alguém",d:"I"},
    {t:"Mantive harmonia e ajudei a equipe",d:"S"},
    {t:"Entreguei trabalho de alta qualidade e sem erros",d:"C"}]},
];

let discRespostas = {};
let discQAtual = 0;
let discFeitos = 0;

async function discIniciar() {
  discRespostas = {};
  discQAtual = 0;
  document.getElementById('disc-inicio').style.display = 'none';
  document.getElementById('disc-quiz').style.display = 'block';
  document.getElementById('disc-resultado').style.display = 'none';
  document.getElementById('disc-q-total').textContent = DISC_PERGUNTAS.length;
  discMostrarPergunta();
}

function discAbandonar() {
  if (!confirm('Deseja cancelar o teste?')) return;
  document.getElementById('disc-inicio').style.display = 'block';
  document.getElementById('disc-quiz').style.display = 'none';
  document.getElementById('disc-resultado').style.display = 'none';
}

function discMostrarPergunta() {
  const q = DISC_PERGUNTAS[discQAtual];
  document.getElementById('disc-q-num').textContent = discQAtual + 1;
  document.getElementById('disc-progress').style.width = (((discQAtual)/DISC_PERGUNTAS.length)*100) + '%';
  document.getElementById('disc-q-texto').textContent = q.texto;
  // Embaralhar opções
  const ops = [...q.ops].sort(() => Math.random() - 0.5);
  document.getElementById('disc-opcoes').innerHTML = ops.map((op,i) => `
    <button onclick="discSelecionarOpcao(this,'${op.d}')" data-disc="${op.d}"
      style="text-align:left;width:100%;border:1.5px solid var(--border);border-radius:10px;padding:12px 16px;cursor:pointer;font-size:14px;font-family:inherit;background:var(--bg);color:var(--ink);transition:.15s;line-height:1.4"
      onmouseover="if(!this.dataset.sel)this.style.borderColor='var(--pur)'"
      onmouseout="if(!this.dataset.sel)this.style.borderColor='var(--border)'">
      ${String.fromCharCode(65+i)}. ${op.t}
    </button>`).join('');
  const btnPrev = document.getElementById('disc-btn-anterior');
  const btnNext = document.getElementById('disc-btn-proximo');
  if (btnPrev) btnPrev.style.display = discQAtual > 0 ? 'inline-flex' : 'none';
  if (btnNext) {
    btnNext.disabled = !discRespostas[discQAtual];
    btnNext.textContent = discQAtual === DISC_PERGUNTAS.length-1 ? 'Ver Resultado ✓' : 'Próxima →';
  }
  // Restaurar seleção se existir
  if (discRespostas[discQAtual]) {
    document.querySelectorAll('#disc-opcoes button').forEach(b => {
      if (b.dataset.disc === discRespostas[discQAtual]) discAtivarBotao(b);
    });
  }
}

function discAtivarBotao(btn) {
  document.querySelectorAll('#disc-opcoes button').forEach(b => {
    b.style.background = 'var(--bg)'; b.style.borderColor = 'var(--border)'; b.style.color = 'var(--ink)'; b.style.fontWeight = '400'; delete b.dataset.sel;
  });
  btn.style.background = 'var(--pur-soft)'; btn.style.borderColor = 'var(--pur)'; btn.style.color = 'var(--pur-dark)'; btn.style.fontWeight = '700'; btn.dataset.sel = '1';
}

function discSelecionarOpcao(btn, tipo) {
  discRespostas[discQAtual] = tipo;
  discAtivarBotao(btn);
  const btnNext = document.getElementById('disc-btn-proximo');
  if (btnNext) btnNext.disabled = false;
}

function discAnterior() {
  if (discQAtual > 0) { discQAtual--; discMostrarPergunta(); }
}

function discProximo() {
  if (!discRespostas[discQAtual]) return;
  if (discQAtual < DISC_PERGUNTAS.length - 1) {
    discQAtual++;
    discMostrarPergunta();
  } else {
    discCalcular();
  }
}

async function discCalcular() {
  const scores = {D:0,I:0,S:0,C:0};
  Object.values(discRespostas).forEach(t => { if (scores[t]!==undefined) scores[t]++; });
  const total = Object.values(scores).reduce((a,b)=>a+b,0);
  const pcts = {D:Math.round(scores.D/total*100),I:Math.round(scores.I/total*100),S:Math.round(scores.S/total*100),C:Math.round(scores.C/total*100)};
  const perfil = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];

  const info = {
    D:{nome:'Dominante',cor:'#e53e3e',emoji:'🦁',desc:'Você é orientado a resultados, direto e determinado. Lidera pelo exemplo, assume riscos e busca desafios constantemente. Sua maior força é transformar visão em ação.', dicas:'Pratique a escuta ativa e desenvolva paciência com processos. Seu ímpeto é valioso — canalize-o com empatia.'},
    I:{nome:'Influente',cor:'#0066cc',emoji:'🌟',desc:'Você é comunicativo, entusiasta e inspirador. Constrói relacionamentos com facilidade e energiza as equipes. Sua maior força é motivar e conectar pessoas.', dicas:'Desenvolva foco e atenção aos detalhes. Sua energia é contagiante — use-a com disciplina para entregar resultados consistentes.'},
    S:{nome:'Estável',cor:'#38a169',emoji:'🌳',desc:'Você é paciente, leal e consistente. Valoriza harmonia e é o pilar de sustentação das equipes. Sua maior força é construir relações duradouras e ambientes seguros.', dicas:'Trabalhe a flexibilidade diante de mudanças. Sua estabilidade é um presente para a equipe — fortaleça sua assertividade.'},
    C:{nome:'Consciente',cor:'#3182ce',emoji:'🔬',desc:'Você é analítico, preciso e meticuloso. Busca excelência em tudo que faz e garante qualidade nos processos. Sua maior força é resolver problemas complexos com rigor.', dicas:'Pratique tomar decisões com informações incompletas. Sua precisão é admirável — aprenda a avançar mesmo sem a perfeição.'},
  };
  const p = info[perfil];

  // Salvar resultado
  const resultado = { perfil, scores, pcts, data: new Date().toISOString(), usuario: document.getElementById('pLabel')?.textContent || '' };
  try {
    const uid = auth.currentUser?.uid;
    if (uid) await db.collection(col('disc_resultados')).doc(uid).set(resultado);
    discFeitos++;
    const el = document.getElementById('disc-feitos'); if (el) el.textContent = discFeitos;
  } catch(e) {}
  log('Test DISC', `Perfil: ${perfil} — ${p.nome}`, '🧠');
  addNotif(`Test DISC concluído! Perfil: ${p.nome} (${perfil})`, 'success');

  // Exibir resultado
  document.getElementById('disc-quiz').style.display = 'none';
  const resDiv = document.getElementById('disc-resultado');
  resDiv.style.display = 'block';
  resDiv.innerHTML = `
    <div class="card" style="border-top:5px solid ${p.cor}">
      <div class="card-body">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:56px;margin-bottom:8px">${p.emoji}</div>
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${p.cor};margin-bottom:4px">Seu Perfil DISC</div>
          <h2 style="font-size:28px;font-weight:800;color:var(--ink);margin-bottom:4px">${p.nome} <span style="color:${p.cor}">(${perfil})</span></h2>
          <p style="font-size:14px;color:var(--ink-60);max-width:460px;margin:0 auto;line-height:1.6">${p.desc}</p>
        </div>
        <!-- Barras -->
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px">
          ${Object.entries(info).map(([k,v])=>`
          <div style="background:var(--bg);border-radius:12px;padding:14px 16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-size:13px;font-weight:700;color:${v.cor}">${k} — ${v.nome}</span>
              <span style="font-size:15px;font-weight:800;color:${v.cor}">${pcts[k]}%</span>
            </div>
            <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden">
              <div style="height:100%;background:${v.cor};border-radius:4px;width:${pcts[k]}%;transition:width 1s ease"></div>
            </div>
          </div>`).join('')}
        </div>
        <div style="background:linear-gradient(135deg,${p.cor}15,${p.cor}08);border:1px solid ${p.cor}30;border-radius:12px;padding:16px 18px;margin-bottom:16px">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${p.cor};margin-bottom:6px">💡 Dica de Desenvolvimento</div>
          <div style="font-size:14px;color:var(--ink);line-height:1.6">${p.dicas}</div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-p" onclick="discRefazer()">🔄 Refazer Teste</button>
          <button class="btn btn-g" onclick="discImprimirResultado()">🖨️ Imprimir</button>
        </div>
      </div>
    </div>`;
  // Atualizar resultado salvo na tela inicial
  discMostrarResultadoSalvo(resultado, p);
}

function discRefazer() {
  document.getElementById('disc-resultado').style.display = 'none';
  document.getElementById('disc-inicio').style.display = 'block';
}

function discImprimirResultado() { window.print(); }

function discMostrarResultadoSalvo(res, p) {
  const div = document.getElementById('disc-resultado-salvo');
  if (!div || !res) return;
  const info = {D:{nome:'Dominante',cor:'#e53e3e'},I:{nome:'Influente',cor:'#0066cc'},S:{nome:'Estável',cor:'#38a169'},C:{nome:'Consciente',cor:'#3182ce'}};
  const pi = info[res.perfil] || info['D'];
  div.style.display = 'block';
  div.innerHTML = `<div class="card" style="border-left:4px solid ${pi.cor};margin-bottom:0">
    <div style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      <div style="width:48px;height:48px;border-radius:12px;background:${pi.cor}20;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:${pi.cor}">${res.perfil}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--ink)">Seu último resultado: Perfil ${res.perfil} — ${pi.nome}</div>
        <div style="font-size:12px;color:var(--ink-30);margin-top:2px">${new Date(res.data).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</div>
      </div>
    </div>
  </div>`;
  const btn = document.getElementById('disc-btn-iniciar');
  if (btn) btn.textContent = '🔄 Refazer Test DISC';
}

async function discCarregar() {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const doc = await db.collection(col('disc_resultados')).doc(uid).get();
    if (doc.exists) {
      const res = doc.data();
      const info = {D:{nome:'Dominante',cor:'#e53e3e'},I:{nome:'Influente',cor:'#0066cc'},S:{nome:'Estável',cor:'#38a169'},C:{nome:'Consciente',cor:'#3182ce'}};
      discMostrarResultadoSalvo(res, info[res.perfil]);
    }
    // Contar quantos fizeram
    const snap = await db.collection(col('disc_resultados')).get();
    discFeitos = snap.size;
    const el = document.getElementById('disc-feitos'); if (el) el.textContent = discFeitos;
  } catch(e) {}
}


// ══════════════════════════════════════════
// PDI & AVALIAÇÃO
// ══════════════════════════════════════════
let pdiLista = [];
function pdiGerarSugestao(){
  const melhorias = document.getElementById('pdi-melhorias')?.value.trim();
  const cargo = document.getElementById('pdi-cargo')?.value.trim() || 'cargo avaliado';
  const box = document.getElementById('pdi-sugestao');
  if(!box) return;
  box.style.display='block';
  box.innerHTML = `<strong>✨ Sugestão de PDI para ${cargo}</strong><br><br>1. Definir 1 competência prioritária para evolução nos próximos 60 dias.<br>2. Criar uma ação prática semanal relacionada ao ponto de melhoria: ${melhorias || 'desenvolvimento técnico/comportamental'}.<br>3. Registrar evidências de evolução: entregas, feedbacks, indicadores ou observação do gestor.<br>4. Fazer check-in quinzenal com gestor/RH para ajustar rota.`;
}
async function pdiSalvar(){
  const item={id:crypto.randomUUID(),colaborador:document.getElementById('pdi-colab').value.trim(),cargo:document.getElementById('pdi-cargo').value.trim(),ciclo:document.getElementById('pdi-ciclo').value.trim(),status:document.getElementById('pdi-status').value,fortes:document.getElementById('pdi-fortes').value.trim(),melhorias:document.getElementById('pdi-melhorias').value.trim(),acoes:document.getElementById('pdi-acoes').value.trim(),criadoEm:new Date().toISOString()};
  if(!item.colaborador){alert('Informe o colaborador.');return;}
  try{await db.collection(col('pdis')).doc(item.id).set(item);}catch(e){}
  pdiLista.unshift(item); pdiRender(); pdiStats(); addNotif('PDI salvo com sucesso!', 'success');
}
function pdiRender(){
  const el=document.getElementById('pdi-lista'); if(!el) return;
  if(!pdiLista.length){el.innerHTML='<div class="empty"><div class="ei">🎯</div>Nenhum PDI cadastrado ainda.</div>';return;}
  const cor=s=>s==='Concluído'?'#065f46':s==='Em atraso'?'#991b1b':'#92400e';
  const bg=s=>s==='Concluído'?'#d1fae5':s==='Em atraso'?'#fee2e2':'#fef3c7';
  el.innerHTML=pdiLista.map(p=>`<div class="ri-item"><div class="ri-head"><div class="ri-name">${p.colaborador}</div><span style="font-size:11px;font-weight:700;border-radius:999px;padding:4px 10px;background:${bg(p.status)};color:${cor(p.status)}">${p.status}</span></div><div class="ri-meta"><span class="ri-m"><strong>Cargo:</strong> ${p.cargo||'-'}</span><span class="ri-m"><strong>Ciclo:</strong> ${p.ciclo||'-'}</span></div><div style="font-size:12px;color:var(--ink-60);line-height:1.5"><strong>Ações:</strong> ${p.acoes||'Sem ações registradas.'}</div></div>`).join('');
}
function pdiStats(){
  const t=document.getElementById('pdi-total'), a=document.getElementById('pdi-andamento'), c=document.getElementById('pdi-concluido');
  if(t)t.textContent=pdiLista.length; if(a)a.textContent=pdiLista.filter(x=>x.status==='Em andamento').length; if(c)c.textContent=pdiLista.filter(x=>x.status==='Concluído').length;
}
async function pdiCarregar(){try{const snap=await db.collection(col('pdis')).orderBy('criadoEm','desc').get();pdiLista=snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){pdiLista=[];}pdiRender();pdiStats();}
// ══════════════════════════════════════════
// ORGANOGRAMA & DESCRITIVO DE CARGOS
// ══════════════════════════════════════════
let _orgDescritivos = null;
let _orgCargoSelecionado = null;

async function cargosCarregar() {
  // Permissões por perfil
  const isColab = role === 'colaborador';
  const cardIA  = document.getElementById('cargos-card-ia');
  const grid    = document.getElementById('cargos-grid');
  if (cardIA) cardIA.style.display = isColab ? 'none' : '';
  if (grid) {
    grid.style.gridTemplateColumns = isColab ? '1fr' : '1fr 1.15fr';
    grid.style.maxWidth = isColab ? '680px' : '';
  }
  // Pré-preencher nome se colaborador
  if (isColab) {
    const nome  = sessionStorage.getItem('userName') || '';
    const campo = document.getElementById('cargo-colab');
    if (campo && nome) { campo.value = nome; campo.readOnly = true; campo.style.background='var(--bg)'; campo.style.color='var(--ink-60)'; }
  }
  // Carregar respostas
  try {
    const snap = await db.collection(col('descricoes_cargos')).orderBy('criadoEm','desc').get();
    cargosLista = snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch(e) { cargosLista = []; }
  cargosRender();
  cargosStats();
}

function orgAba(aba, btn) {
  ['descritivos','autodesc'].forEach(a => {
    const pane = document.getElementById('org-pane-' + a);
    const tab  = document.getElementById('org-tab-' + a);
    if (pane) pane.style.display = a === aba ? 'block' : 'none';
    if (tab)  tab.classList.toggle('active', a === aba);
  });
  if (aba === 'descritivos') orgRenderListaCargos();
  if (aba === 'autodesc')    autoDescCarregar();
}

async function autoDescCarregar() {
  // Pré-preencher nome se for colaborador
  if (typeof role !== 'undefined' && role === 'colaborador') {
    const nome  = sessionStorage.getItem('userName') || '';
    const campo = document.getElementById('cargo-colab');
    if (campo && nome) { campo.value = nome; campo.readOnly = true; campo.style.background='var(--bg)'; campo.style.color='var(--ink-60)'; }
    const cardIA = document.getElementById('cargos-card-ia');
    if (cardIA) cardIA.style.display = 'none';
  }
  // Carregar respostas existentes
  try {
    const snap = await db.collection(col('descricoes_cargos')).orderBy('criadoEm','desc').get();
    cargosLista = snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch(e) { cargosLista = []; }
  cargosRender();
}

async function orgGetDescritivos(force = false) {
  if (_orgDescritivos && !force) return _orgDescritivos;
  try {
    const snap = await db.collection(col('org_descritivos')).get();
    _orgDescritivos = snap.docs.map(d => ({ _id: d.id, ...d.data(), cargo: intraOrgSafeText(d.data().cargo || d.data().nome || d.data().funcao, '') }));
  } catch(e) { _orgDescritivos = []; }
  return _orgDescritivos;
}

async function orgCarregarDescritivos() {
  await orgGetDescritivos(true);
}

// ── ORGANOGRAMA ──
// ══ ORGANOGRAMA VISUAL — IMEX (estrutura real) ══
let _orgZoom = 1;
let _orgData = {};
let _orgCores = [];
let _orgDescData = [];

function orgZoom(delta) {
  _orgZoom = Math.min(2.5, Math.max(0.3, _orgZoom + delta));
  const c = document.getElementById('org-canvas');
  if (c) c.style.transform = `scale(${_orgZoom})`;
  const lbl = document.getElementById('org-zoom-label');
  if (lbl) lbl.textContent = Math.round(_orgZoom * 100) + '%';
}
function orgResetZoom() {
  _orgZoom = 1;
  const c = document.getElementById('org-canvas');
  if (c) { c.style.transform = 'scale(1)'; c.style.transformOrigin = 'top center'; }
  const lbl = document.getElementById('org-zoom-label');
  if (lbl) lbl.textContent = '100%';
}

// Estrutura hierárquica REAL da IMEX (do organograma oficial)
const IMEX_ORG = {
  conselho: {
    label: 'PRESIDENTE',
    nome: 'Gilberto Gallina',
    cor: '#1d4ed8',
    filhos: [
      { label: 'CONSELHEIRO', nome: 'Jacir Paris',       cor: '#1d4ed8' },
      { label: 'CONSELHEIRO', nome: 'Rodrigo Torres',    cor: '#1d4ed8' },
      { label: 'CONSELHEIRO', nome: 'Roberval Moreno',   cor: '#1d4ed8' },
      { label: 'CONSELHEIRO', nome: 'Ricardo Honório',   cor: '#1d4ed8' },
    ]
  },
  operacional: {
    label: 'DIRETOR GERAL',
    nome: 'Marcio Paiva',
    cor: '#0047FF',
    filhos: [
      {
        label: 'CTO', nome: 'Saulo Lima', cor: '#0047FF', setor: 'TI / Desenvolvimento', filhos: []
      },
      {
        label: 'RECURSOS HUMANOS', nome: null, cor: '#0099ff', setor: 'Recursos Humanos',
        filhos: [
          { label: 'COORD. DE RH', nome: 'Rafaela Kersul', cor: '#0099ff' },
          { label: 'COORD. DE RH', nome: 'Vania Miotto',   cor: '#0099ff' },
        ]
      },
      {
        label: 'SUPORTE E CONTRATOS', nome: null, cor: '#0099ff', setor: 'Suporte',
        filhos: [
          { label: 'GER. DE SUPORTE GESTÃO E DESENV.', nome: 'Luis Sanches',      cor: '#0099ff' },
          { label: 'GER. DE SUPORTE E DISTRIBUIÇÃO',  nome: 'Francieli Gallina',  cor: '#0099ff' },
        ]
      },
      {
        label: 'ADMINISTRATIVO E FINANCEIRO', nome: null, cor: '#22C58B', setor: 'Administrativo',
        filhos: [
          { label: 'COORD. ADM. E FINANCEIRO', nome: 'Glaucia Azevedo', cor: '#22C58B' },
        ]
      },
      {
        label: 'MÁQUINA DE VENDAS', nome: null, cor: '#f59e0b', setor: 'Comercial',
        filhos: [
          { label: 'GERENTE COMERCIAL', nome: 'Rafael', cor: '#f59e0b' },
        ]
      },
      {
        label: 'MARKETING E PARCERIAS', nome: null, cor: '#0099ff', setor: 'Marketing',
        filhos: [
          { label: 'GER. MKT E PARCERIAS', nome: 'Halex', cor: '#0099ff' },
        ]
      },
      {
        label: 'DIRETOR COMERCIAL', nome: 'Giovany Gallina', cor: '#0047FF', setor: 'Comercial', filhos: []
      },
    ]
  }
};

async function orgRenderOrganograma() {
  const wrap = document.getElementById('org-canvas');
  if (!wrap) return;

  const colabs      = await grhGetColabs();
  const descritivos = await orgGetDescritivos();
  _orgDescData = descritivos;

  // Agrupar colabs por setor → cargo
  const setores = {};
  colabs.forEach(c => {
    if (!c.nome || c.status === 'Inativo') return;
    const s = c.setor || 'Sem Setor';
    const f = c.funcao || 'Sem Cargo';
    if (!setores[s]) setores[s] = {};
    if (!setores[s][f]) setores[s][f] = [];
    setores[s][f].push(c);
  });
  _orgData = setores;

  // Stats hero
  const totalCargosUnicos = new Set(colabs.map(c => c.funcao).filter(Boolean)).size;
  const eid = id => document.getElementById(id);
  if(eid('org-total-setores')) eid('org-total-setores').textContent = Object.keys(setores).length;
  if(eid('org-total-cargos'))  eid('org-total-cargos').textContent  = totalCargosUnicos;
  if(eid('org-total-colab'))   eid('org-total-colab').textContent   = colabs.filter(c => c.status !== 'Inativo').length;

  wrap.style.transformOrigin = 'top center';

  // Injetar CSS uma vez
  if (!document.getElementById('org-tree-style')) {
    const st = document.createElement('style');
    st.id = 'org-tree-style';
    st.textContent = `
      .org-tree { display:flex; flex-direction:column; align-items:center; font-family:'Inter','Montserrat',sans-serif; }
      .org-branch { display:flex; flex-direction:column; align-items:center; }
      .org-node-box {
        border-radius:14px; padding:10px 16px; text-align:center; cursor:pointer;
        transition:all .2s; box-shadow:0 4px 18px rgba(0,0,0,0.13);
        min-width:130px; max-width:175px; position:relative; z-index:2;
      }
      .org-node-box:hover { transform:translateY(-4px); box-shadow:0 10px 30px rgba(0,0,0,0.22); }
      .org-node-box .lbl  { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; opacity:.75; margin-bottom:4px; }
      .org-node-box .nome { font-size:12px; font-weight:700; line-height:1.3; }
      .org-node-box .avatar { width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; margin:0 auto 8px; border:2px solid rgba(255,255,255,0.4); }
      .org-line-v { width:2px; background:#cbd5e1; margin:0 auto; }
      .org-children { display:flex; gap:20px; align-items:flex-start; justify-content:center; }
      .org-section-title { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.12em; color:var(--ink-30); border-bottom:2px dashed var(--border); padding-bottom:6px; margin-bottom:20px; width:100%; text-align:center; }
    `;
    document.head.appendChild(st);
  }

  // Construir HTML separado para cada seção
  const htmlConselho    = orgBuildTree(IMEX_ORG.conselho, setores);
  const htmlOperacional = orgBuildTree(IMEX_ORG.operacional, setores);

  wrap.innerHTML =
    '<div class="org-tree" style="padding-bottom:40px">' +
      '<div class="org-section-title" style="margin-bottom:24px;width:600px">⚖️ Conselho Administrativo</div>' +
      htmlConselho +
      '<div style="width:100%;max-width:900px;border-top:2px dashed #e2e8f0;margin:40px 0 32px;position:relative">' +
        '<div style="position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:#f8f7ff;padding:0 16px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--ink-30)">Estrutura Operacional</div>' +
      '</div>' +
      htmlOperacional +
    '</div>';
}

function orgBuildTree(node, setores) {
  const cor    = node.cor || '#0047FF';
  const isDark = true;
  const avatar = node.nome ? node.nome[0].toUpperCase() : (node.label[0] || '?');

  // Contar membros do setor se houver
  const setorData = node.setor ? (setores[node.setor] || {}) : null;
  const totalMembros = setorData ? Object.values(setorData).reduce((s,a) => s+a.length, 0) : 0;
  const clickable = node.setor || (node.filhos && node.filhos.length > 0);

  const onclick = node.setor
    ? `orgAbrirModalSetorByName('${(node.setor||'').replace(/'/g,"\\'")}','${cor}')`
    : (node.filhos && node.filhos.length === 0 && node.nome)
      ? `orgAbrirModalPessoa('${(node.nome||'').replace(/'/g,"\\'")}','${(node.label||'').replace(/'/g,"\\'")}','${cor}')`
      : '';

  const boxHTML = `
    <div class="org-node-box" style="background:${cor};color:#fff${clickable?'':';cursor:default'}"
      ${onclick ? `onclick="${onclick}"` : ''}
      onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px ${cor}55'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 18px rgba(0,0,0,0.13)'">
      <div class="avatar">${avatar}</div>
      <div class="lbl">${node.label}</div>
      ${node.nome ? `<div class="nome">${node.nome}</div>` : ''}
      ${totalMembros > 0 ? `<div style="font-size:10px;opacity:.75;margin-top:4px">${totalMembros} colaborador${totalMembros!==1?'es':''}</div>` : ''}
    </div>`;

  if (!node.filhos || node.filhos.length === 0) {
    return `<div class="org-branch">${boxHTML}</div>`;
  }

  const filhosHTML = node.filhos.map(f => {
    const fHasChildren = f.filhos && f.filhos.length > 0;
    if (fHasChildren) {
      return orgBuildTree(f, setores);
    }
    const fSetor = f.setor ? (setores[f.setor] || {}) : null;
    const fTotal = fSetor ? Object.values(fSetor).reduce((s,a) => s+a.length, 0) : 0;
    const fOnclick = f.setor
      ? `orgAbrirModalSetorByName('${(f.setor||'').replace(/'/g,"\\'")}','${f.cor}')`
      : `orgAbrirModalPessoa('${(f.nome||'').replace(/'/g,"\\'")}','${(f.label||'').replace(/'/g,"\\'")}','${f.cor}')`;
    return `<div class="org-branch">
      <div class="org-line-v" style="height:36px;background:${f.cor}80"></div>
      <div class="org-node-box" style="background:${f.cor};color:#fff;min-width:120px;max-width:155px"
        onclick="${fOnclick}"
        onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px ${f.cor}55'"
        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 18px rgba(0,0,0,0.13)'">
        <div class="avatar" style="width:36px;height:36px;font-size:14px">${(f.nome||f.label)[0]}</div>
        <div class="lbl">${f.label}</div>
        ${f.nome ? `<div class="nome">${f.nome}</div>` : ''}
        ${fTotal > 0 ? `<div style="font-size:10px;opacity:.75;margin-top:3px">${fTotal} colab.</div>` : ''}
      </div>
    </div>`;
  });

  // Calcular largura da linha horizontal
  return `<div class="org-branch">
    ${boxHTML}
    <div class="org-line-v" style="height:36px;background:${cor}80"></div>
    <div style="position:relative;width:100%">
      <div class="org-children">${filhosHTML.join('')}</div>
    </div>
  </div>`;
}

function orgAbrirModalSetorByName(setor, cor) {
  const cargos = _orgData[setor] || {};
  const si = 0;
  const totalColab  = Object.values(cargos).reduce((s,a) => s+a.length, 0);
  const totalCargos = Object.keys(cargos).length;

  document.getElementById('org-ms-titulo').textContent = setor;
  document.getElementById('org-ms-sub').textContent    = `${totalCargos} cargo${totalCargos!==1?'s':''} · ${totalColab} colaborador${totalColab!==1?'es':''}`;
  document.getElementById('org-ms-head').style.borderTop = `4px solid ${cor}`;

  if (!totalColab) {
    document.getElementById('org-ms-cargos').innerHTML = `<div style="text-align:center;padding:30px;color:var(--ink-30);grid-column:1/-1"><div style="font-size:32px;margin-bottom:8px">👥</div><p>Nenhum colaborador cadastrado neste setor ainda.</p></div>`;
  } else {
    document.getElementById('org-ms-cargos').innerHTML = Object.entries(cargos)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([cargo, membros]) => {
        const temDesc = _orgDescData.some(d => d.cargo && d.cargo.toLowerCase().trim() === cargo.toLowerCase().trim());
        return `<div onclick="orgAbrirModalCargo('${cargo.replace(/'/g,"\\'")}','${setor.replace(/'/g,"\\'")}','${cor}')"
          style="border:2px solid ${cor}35;border-radius:14px;padding:16px;cursor:pointer;transition:.18s;background:${cor}06;text-align:center"
          onmouseenter="this.style.background='${cor}15';this.style.borderColor='${cor}'"
          onmouseleave="this.style.background='${cor}06';this.style.borderColor='${cor}35'">
          <div style="width:38px;height:38px;border-radius:10px;background:${cor};display:flex;align-items:center;justify-content:center;font-size:17px;margin:0 auto 8px">💼</div>
          <div style="font-size:13px;font-weight:700;color:var(--ink);margin-bottom:3px">${cargo}</div>
          <div style="font-size:11px;color:var(--ink-60)">${membros.length} pessoa${membros.length!==1?'s':''}</div>
          ${temDesc ? '<div style="font-size:10px;color:#22c58b;font-weight:700;margin-top:5px">✓ Descritivo</div>' : ''}
        </div>`;
      }).join('');
  }
  document.getElementById('org-modal-setor').style.display = 'flex';
}

function orgAbrirModalPessoa(nome, label, cor) {
  // Abre modal de cargo com o nome da pessoa
  document.getElementById('org-mc-setor').textContent  = label;
  document.getElementById('org-mc-titulo').textContent = nome;
  document.getElementById('org-mc-sub').textContent    = '';
  document.getElementById('org-mc-head').style.borderTop = `4px solid ${cor}`;
  document.getElementById('org-mc-desc').innerHTML = '';
  document.getElementById('org-mc-membros').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--border);border-radius:12px">
      <div style="width:48px;height:48px;border-radius:50%;background:${cor}25;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:${cor}">${nome[0]}</div>
      <div>
        <div style="font-size:15px;font-weight:800;color:var(--ink)">${nome}</div>
        <div style="font-size:12px;color:var(--ink-60);margin-top:2px">${label}</div>
      </div>
    </div>`;
  const btn = document.getElementById('org-mc-desc-btn');
  btn.textContent = '📋 Ver Descritivo do Cargo';
  btn.onclick = () => {
    document.getElementById('org-modal-cargo').style.display = 'none';
    orgAba('descritivos', null);
    document.getElementById('org-tab-descritivos').classList.add('active');
    document.getElementById('org-tab-organograma').classList.remove('active');
  };
  document.getElementById('org-modal-cargo').style.display = 'flex';
}

function orgAbrirModalCargo(cargo, setor, cor) {
  const membros = (_orgData[setor] || {})[cargo] || [];
  const desc    = _orgDescData.find(d => d.cargo && d.cargo.toLowerCase().trim() === cargo.toLowerCase().trim());

  document.getElementById('org-mc-setor').textContent  = setor;
  document.getElementById('org-mc-titulo').textContent = cargo;
  document.getElementById('org-mc-sub').textContent    = `${membros.length} colaborador${membros.length!==1?'es':''}`;
  document.getElementById('org-mc-head').style.borderTop = `4px solid ${cor}`;

  const descBox = document.getElementById('org-mc-desc');
  descBox.innerHTML = desc?.missao
    ? `<div style="background:${cor}10;border-left:3px solid ${cor};border-radius:0 10px 10px 0;padding:12px 16px;margin-bottom:16px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:4px">🎯 Missão</div>
        <div style="font-size:13px;color:var(--ink);line-height:1.6">${desc.missao}</div>
       </div>` : '';

  document.getElementById('org-mc-membros').innerHTML = membros.length
    ? membros.map(m =>
        `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid var(--border);border-radius:10px">
          <div style="width:36px;height:36px;border-radius:50%;background:${cor}25;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:${cor};flex-shrink:0">${(m.nome||'?')[0]}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:var(--ink)">${m.nome}</div>
            <div style="font-size:11px;color:var(--ink-60);margin-top:2px">${m.clt==='Sim'?'CLT':'PJ'}${m.admissao?' · Desde '+grhFmt(m.admissao):''}${m.salario?' · '+grhBRL(m.salario):''}</div>
          </div>
          ${m.email?`<a href="mailto:${m.email}" style="font-size:17px;text-decoration:none" title="${m.email}">✉️</a>`:''}
        </div>`).join('')
    : '<div style="text-align:center;padding:20px;color:var(--ink-30);font-size:13px">Nenhum colaborador neste cargo</div>';

  const btn = document.getElementById('org-mc-desc-btn');
  btn.textContent = desc ? '📋 Ver/Editar Descritivo' : '+ Criar Descritivo';
  btn.onclick = () => {
    document.getElementById('org-modal-cargo').style.display = 'none';
    document.getElementById('org-modal-setor').style.display = 'none';
    orgAba('descritivos', null);
    document.getElementById('org-tab-descritivos').classList.add('active');
    document.getElementById('org-tab-organograma').classList.remove('active');
    setTimeout(() => orgSelecionarCargo(cargo, setor), 120);
  };
  document.getElementById('org-modal-cargo').style.display = 'flex';
}

// Alias para compatibilidade
async function orgRenderSetores() { await orgRenderOrganograma(); }
function orgAbrirModalSetor(setor, si) { orgAbrirModalSetorByName(setor, _orgCores[si % _orgCores.length]); }
function orgExpandirTodos() {}
function orgRecolherTodos() {}


// ── DESCRITIVOS ──
async function orgRenderListaCargos() {
  const lista = document.getElementById('desc-lista-cargos');
  if (!lista) return;

  const colabs = await grhGetColabs();
  const descritivos = await orgGetDescritivos();
  const q = (document.getElementById('desc-search')?.value || '').toLowerCase().trim();

  // Montar mapa único setor→cargos
  const mapa = {};
  colabs.forEach(c => {
    if (!c.funcao) return;
    const setor = c.setor || 'Sem Setor';
    const cargo = c.funcao;
    if (q && !cargo.toLowerCase().includes(q) && !setor.toLowerCase().includes(q)) return;
    if (!mapa[setor]) mapa[setor] = new Set();
    mapa[setor].add(cargo);
  });

  if (!Object.keys(mapa).length) {
    lista.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-30);font-size:12px">Nenhum cargo encontrado</div>';
    return;
  }

  lista.innerHTML = Object.entries(mapa).sort((a,b) => a[0].localeCompare(b[0])).map(([setor, cargosSet]) => {
    const cargos = [...cargosSet].sort();
    return `<div style="margin-bottom:8px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);padding:4px 8px">${setor}</div>
      ${cargos.map(cargo => {
        const temDesc = descritivos.some(d => d.cargo && d.cargo.toLowerCase().trim() === cargo.toLowerCase().trim());
        return `<div onclick="orgSelecionarCargo('${cargo.replace(/'/g,"\'")}','${setor.replace(/'/g,"\'")}'')"
          style="padding:8px 10px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;font-weight:600;color:var(--ink);transition:.15s"
          onmouseenter="this.style.background='var(--pur-soft)'" onmouseleave="this.style.background=_orgCargoSelecionado===('${cargo}|${setor}')?'var(--pur-soft)':''">
          <span>${cargo}</span>
          <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${temDesc?'var(--g-green-s)':'var(--border)'};color:${temDesc?'var(--g-green)':'var(--ink-30)'}">${temDesc?'✓':'—'}</span>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

async function orgSelecionarCargo(cargo, setor) {
  _orgCargoSelecionado = cargo + '|' + setor;
  const descritivos = await orgGetDescritivos();
  const desc = descritivos.find(d => d.cargo && d.cargo.toLowerCase().trim() === cargo.toLowerCase().trim());
  const colabs = await grhGetColabs();
  const membros = colabs.filter(c => c.funcao && c.funcao.toLowerCase().trim() === cargo.toLowerCase().trim());
  const detalhe = document.getElementById('desc-detalhe');
  if (!detalhe) return;

  detalhe.innerHTML = `<div class="card">
    <div class="card-head">
      <div class="cht">
        <h2>📋 ${cargo}</h2>
        <p style="color:var(--ink-60)">${setor} · ${membros.length} colaborador${membros.length!==1?'es':''}</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-p btn-sm" onclick="orgAbrirModalDescritivo('${cargo.replace(/'/g,"\'")}','${setor.replace(/'/g,"\'")}')">
          ${desc ? '✏️ Editar' : '+ Criar Descritivo'}
        </button>
        ${desc ? `<button class="btn btn-g btn-sm" onclick="orgExcluirDescritivo('${desc._id}')">🗑</button>` : ''}
      </div>
    </div>
    <div class="card-body">
      <!-- Membros -->
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:10px">Colaboradores neste cargo</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${membros.length ? membros.map(m => `<div style="display:flex;align-items:center;gap:8px;background:var(--pur-soft);border-radius:8px;padding:7px 12px">
            <div style="width:26px;height:26px;border-radius:50%;background:#0047FF;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff">${(m.nome||'?')[0]}</div>
            <div>
              <div style="font-size:12px;font-weight:600;color:var(--ink)">${m.nome}</div>
              <div style="font-size:10px;color:var(--ink-60)">${m.salario ? grhBRL(m.salario) : 'Salário —'}</div>
            </div>
          </div>`).join('') : '<span style="color:var(--ink-30);font-size:13px">Nenhum colaborador neste cargo</span>'}
        </div>
      </div>

      ${desc ? `
      <!-- Descritivo -->
      ${desc.missao ? `<div style="margin-bottom:18px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">🎯 Missão do Cargo</div><div style="background:var(--pur-soft);border-radius:10px;padding:14px 16px;font-size:13px;color:var(--ink);line-height:1.6">${desc.missao}</div></div>` : ''}
      ${desc.responsabilidades ? `<div style="margin-bottom:18px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">📝 Responsabilidades</div><div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px 16px;font-size:13px;color:var(--ink);line-height:1.8;white-space:pre-wrap">${desc.responsabilidades}</div></div>` : ''}
      ${desc.tecnicos ? `<div style="margin-bottom:18px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">⚙️ Conhecimentos Técnicos</div><div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px 16px;font-size:13px;color:var(--ink);line-height:1.8;white-space:pre-wrap">${desc.tecnicos}</div></div>` : ''}
      ${desc.comportamentos ? `<div style="margin-bottom:18px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">🧠 Perfil Comportamental</div><div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px 16px;font-size:13px;color:var(--ink);line-height:1.8;white-space:pre-wrap">${desc.comportamentos}</div></div>` : ''}
      ${(desc.salMin || desc.salMax) ? `<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin-bottom:6px">💰 Faixa Salarial</div><div style="display:flex;gap:12px"><span style="background:var(--g-green-s);color:var(--g-green);padding:6px 14px;border-radius:8px;font-weight:700;font-size:13px">${desc.salMin ? grhBRL(desc.salMin) : '—'} → ${desc.salMax ? grhBRL(desc.salMax) : '—'}</span></div></div>` : ''}
      ` : `<div style="text-align:center;padding:40px;color:var(--ink-30)"><div style="font-size:36px;margin-bottom:10px">📋</div><p style="font-size:13px">Nenhum descritivo cadastrado para este cargo.</p><button class="btn btn-p btn-sm" style="margin-top:12px" onclick="orgAbrirModalDescritivo('${cargo.replace(/'/g,"\'")}','${setor.replace(/'/g,"\'")}')">+ Criar Descritivo</button></div>`}
    </div>
  </div>`;
}

async function orgAbrirModalDescritivo(cargo = '', setor = '') {
  const descritivos = await orgGetDescritivos();
  const desc = cargo ? descritivos.find(d => d.cargo && d.cargo.toLowerCase().trim() === cargo.toLowerCase().trim()) : null;
  const setV = (id, v) => { const e = document.getElementById(id); if(e) e.value = v || ''; };
  document.getElementById('org-desc-id').value = desc?._id || '';
  document.getElementById('org-modal-desc-title').textContent = desc ? '✏️ Editar Descritivo' : '📋 Novo Descritivo';
  setV('org-desc-cargo',            cargo || (desc?.cargo || ''));
  setV('org-desc-setor',            setor || (desc?.setor || ''));
  setV('org-desc-nivel',            desc?.nivel || '');
  setV('org-desc-tipo',             desc?.tipo || '');
  setV('org-desc-missao',           desc?.missao || '');
  setV('org-desc-responsabilidades',desc?.responsabilidades || '');
  setV('org-desc-tecnicos',         desc?.tecnicos || '');
  setV('org-desc-comportamentos',   desc?.comportamentos || '');
  setV('org-desc-sal-min',          desc?.salMin || '');
  setV('org-desc-sal-max',          desc?.salMax || '');
  document.getElementById('org-modal-descritivo').style.display = 'flex';
}

async function orgSalvarDescritivo() {
  const g = id => document.getElementById(id)?.value.trim() || '';
  const dados = {
    cargo:             g('org-desc-cargo'),
    setor:             g('org-desc-setor'),
    nivel:             g('org-desc-nivel'),
    tipo:              g('org-desc-tipo'),
    missao:            g('org-desc-missao'),
    responsabilidades: g('org-desc-responsabilidades'),
    tecnicos:          g('org-desc-tecnicos'),
    comportamentos:    g('org-desc-comportamentos'),
    salMin:            parseFloat(g('org-desc-sal-min')) || null,
    salMax:            parseFloat(g('org-desc-sal-max')) || null,
    atualizadoEm:      new Date().toISOString()
  };
  if (!dados.cargo) { alert('Informe o cargo.'); return; }
  const id = document.getElementById('org-desc-id').value;
  try {
    if (id) {
      await db.collection(col('org_descritivos')).doc(id).update(dados);
    } else {
      await db.collection(col('org_descritivos')).add({ ...dados, criadoEm: new Date().toISOString() });
    }
    _orgDescritivos = null;
    document.getElementById('org-modal-descritivo').style.display = 'none';
    await orgGetDescritivos(true);
    orgRenderListaCargos();
    if (_orgCargoSelecionado) {
      const [cargo, setor] = _orgCargoSelecionado.split('|');
      await orgSelecionarCargo(cargo, setor);
    }
    addNotif(`Descritivo de "${dados.cargo}" salvo com sucesso.`, 'success');
  } catch(e) { alert('Erro: ' + e.message); }
}

async function orgExcluirDescritivo(id) {
  if (!confirm('Excluir este descritivo?')) return;
  await db.collection(col('org_descritivos')).doc(id).delete();
  _orgDescritivos = null;
  await orgGetDescritivos(true);
  orgRenderListaCargos();
  if (_orgCargoSelecionado) {
    const [cargo, setor] = _orgCargoSelecionado.split('|');
    await orgSelecionarCargo(cargo, setor);
  }
  addNotif('Descritivo excluído.', 'success');
}

// ── BAIXAR MODELO DE PLANILHA DE DESCRITIVOS ──
function orgBaixarModeloDescritivos() {
  if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }
  const ws = XLSX.utils.aoa_to_sheet([
    ['Cargo','Setor','Nivel','Tipo Contrato','Missao do Cargo','Responsabilidades','Conhecimentos Tecnicos','Perfil Comportamental','Salario Minimo','Salario Maximo'],
    ['Analista de Suporte','Suporte','Pleno','CLT','Garantir a resolucao eficiente de chamados e a satisfacao dos clientes.','Atender chamados; Diagnosticar problemas; Documentar solucoes; Escalar casos N3','Sistemas de atendimento, ERP, Pacote Office','Comunicacao clara, empatia, organizacao, proatividade',3000,4500],
    ['Programador','Prog. PDV','Senior','CLT','Desenvolver e manter sistemas de PDV com qualidade e performance.','Desenvolver funcionalidades; Corrigir bugs; Code reviews; Documentar processos','Delphi, SQL Server, Git, metodologias ageis','Autonomia, atencao a detalhes, colaboracao, aprendizado continuo',4000,7000],
  ]);
  ws['!cols'] = [
    {wch:28},{wch:22},{wch:14},{wch:14},{wch:40},
    {wch:50},{wch:40},{wch:40},{wch:14},{wch:14}
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Descritivos');
  XLSX.writeFile(wb, 'modelo-descritivos-cargos.xlsx');
  addNotif('Modelo de descritivos baixado!', 'success');
}

// ── IMPORTAR DESCRITIVOS VIA PLANILHA ──
async function orgImportarDescritivos(input) {
  const file = input.files[0];
  if (!file) return;
  input.value = '';
  if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const wb   = XLSX.read(e.target.result, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rows.length) { alert('Nenhum dado encontrado na planilha.'); return; }

      // Normalizar cabeçalhos
      const norm = s => String(s).toLowerCase().trim()
        .normalize('NFD').replace(/[̀-ͯ]/g,'')
        .replace(/[^a-z0-9]/g,' ').trim();

      const keys = Object.keys(rows[0]);
      const col = (keywords) => keys.find(k => keywords.some(kw => norm(k).includes(kw))) || null;

      const colCargo        = col(['cargo','funcao','função']);
      const colSetor        = col(['setor','area','área','departamento']);
      const colNivel        = col(['nivel','nível','senioridade','nivel']);
      const colTipo         = col(['tipo','contrato','clt']);
      const colMissao       = col(['missao','missão','proposito','propósito','objetivo']);
      const colResp         = col(['responsabilidade','atividade','atribuicao']);
      const colTecnico      = col(['tecnico','técnico','conhecimento','ferramenta','sistema']);
      const colComport      = col(['comportament','perfil','competencia','soft']);
      const colSalMin       = col(['minimo','mínimo','sal min','salario min','salário min']);
      const colSalMax       = col(['maximo','máximo','sal max','salario max','salário max']);

      if (!colCargo) { alert('Coluna "Cargo" não encontrada. Baixe o modelo e preencha corretamente.'); return; }

      const validas = rows.filter(r => String(r[colCargo]||'').trim());
      if (!validas.length) { alert('Nenhum cargo válido encontrado.'); return; }

      const confirmar = confirm(`Importar ${validas.length} descritivo(s)?

Se o cargo já existir, o descritivo será atualizado.`);
      if (!confirmar) return;

      addNotif('⏳ Importando descritivos...', 'info');

      // Carregar existentes para verificar duplicatas
      const existentes = await orgGetDescritivos(true);
      let ok = 0, atualizados = 0, erros = 0;

      for (const row of validas) {
        try {
          const cargo = String(row[colCargo]||'').trim();
          const dados = {
            cargo,
            setor:             String(row[colSetor]||'').trim(),
            nivel:             String(row[colNivel]||'').trim(),
            tipo:              String(row[colTipo]||'').trim(),
            missao:            String(row[colMissao]||'').trim(),
            responsabilidades: String(row[colResp]||'').trim(),
            tecnicos:          String(row[colTecnico]||'').trim(),
            comportamentos:    String(row[colComport]||'').trim(),
            salMin:            parseFloat(row[colSalMin]) || null,
            salMax:            parseFloat(row[colSalMax]) || null,
            atualizadoEm:      new Date().toISOString(),
          };

          // Verificar se já existe
          const existente = existentes.find(d =>
            d.cargo && d.cargo.toLowerCase().trim() === cargo.toLowerCase().trim()
          );

          if (existente) {
            await db.collection(col('org_descritivos')).doc(existente._id).update(dados);
            atualizados++;
          } else {
            await db.collection(col('org_descritivos')).add({ ...dados, criadoEm: new Date().toISOString() });
            ok++;
          }
        } catch(err) { erros++; }
      }

      _orgDescritivos = null;
      await orgGetDescritivos(true);
      orgRenderListaCargos();
      if (_orgCargoSelecionado) {
        const [cargo, setor] = _orgCargoSelecionado.split('|');
        await orgSelecionarCargo(cargo, setor);
      }

      const msg = `✅ ${ok} novo(s) importado(s), ${atualizados} atualizado(s)${erros ? ` | ${erros} erro(s)` : ''}.`;
      addNotif(msg, 'success');
      log('Importação descritivos', msg, '📋');
    } catch(err) {
      alert('Erro ao processar planilha: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}


// ══════════════════════════════════════════
// AUTO DESCRIÇÃO DE CARGOS
// ══════════════════════════════════════════
let cargosLista = []; let cargosAnalises = 0;

async function cargoSalvarResposta() {
  const item = {
    id: crypto.randomUUID(),
    colaborador: document.getElementById('cargo-colab').value.trim(),
    funcao:      document.getElementById('cargo-funcao').value.trim(),
    rotinas:     document.getElementById('cargo-rotinas').value.trim(),
    tecnicos:    document.getElementById('cargo-tecnicos').value.trim(),
    comportamentos: document.getElementById('cargo-comportamentos').value.trim(),
    criadoEm:    new Date().toISOString()
  };
  if (!item.colaborador || !item.funcao) { alert('Informe colaborador e cargo.'); return; }
  try { await db.collection(col('descricoes_cargos')).doc(item.id).set(item); } catch(e) {}
  cargosLista.unshift(item);
  cargosRender();
  addNotif('Descrição enviada!', 'success');
  // Limpar campos
  ['cargo-rotinas','cargo-tecnicos','cargo-comportamentos'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
}

function cargosStats() {
  const t = document.getElementById('cargos-total');
  const f = document.getElementById('cargos-funcoes');
  const a = document.getElementById('cargos-analises');
  if(t) t.textContent = cargosLista.length;
  if(f) f.textContent = new Set(cargosLista.map(x=>x.funcao).filter(Boolean)).size;
  if(a) a.textContent = cargosAnalises;
}

function cargosRender() {
  const el = document.getElementById('cargos-respostas');
  if (!el) return;
  if (!cargosLista.length) {
    el.innerHTML = '<div class="empty" style="text-align:center;padding:24px;color:var(--ink-30)"><div style="font-size:32px">📌</div>Nenhuma descrição recebida ainda.</div>';
    return;
  }
  el.innerHTML = cargosLista.slice(0, 8).map(c =>
    '<div class="ri-item" style="border:1px solid var(--border);border-radius:10px;padding:12px 16px;margin-bottom:8px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
        '<div style="font-weight:700;font-size:13px">' + (c.funcao||'—') + '</div>' +
        '<span style="background:var(--pur-soft);color:var(--pur-vibrant);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">' + (c.colaborador||'—') + '</span>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--ink-60);line-height:1.5">' + (c.rotinas||'').slice(0, 180) + ((c.rotinas||'').length > 180 ? '…' : '') + '</div>' +
    '</div>'
  ).join('');
}

function cargoMontarDescritivoLocal(base) {
  const func = base[0]?.funcao || 'Função analisada';
  const rot  = base.map(x => x.rotinas).filter(Boolean).join('; ');
  const tec  = base.map(x => x.tecnicos).filter(Boolean).join('; ');
  const comp = base.map(x => x.comportamentos).filter(Boolean).join('; ');
  const lista = txt => txt.split(/[.;\n]+/).map(s=>s.trim()).filter(Boolean).slice(0,8);
  const responsabilidades = lista(rot);
  const tecnicos = lista(tec);
  const comport = lista(comp);
  return [
    'DESCRITIVO PADRÃO — ' + func,
    '',
    'Missão do cargo:',
    'Atuar na execução, melhoria e acompanhamento das rotinas da função, garantindo qualidade, organização, cumprimento de prazos e alinhamento aos processos internos da empresa.',
    '',
    'Principais responsabilidades:',
    '• ' + (responsabilidades.join('\n• ') || 'Mapear, executar e acompanhar as atividades-chave do cargo, mantendo registros e comunicando desvios quando necessário.'),
    '',
    'Conhecimentos técnicos esperados:',
    '• ' + (tecnicos.join('\n• ') || 'Conhecimento dos sistemas internos, ferramentas da área, regras de negócio e processos relacionados à função.'),
    '',
    'Perfil comportamental esperado:',
    '• ' + (comport.join('\n• ') || 'Organização, comunicação clara, responsabilidade, atenção aos detalhes, colaboração e senso de prioridade.'),
    '',
    'Entregas esperadas:',
    '• Execução das atividades com qualidade e dentro dos prazos definidos.\n• Registro adequado das informações.\n• Apoio à melhoria contínua dos processos.\n• Comunicação clara com pares, gestores e áreas envolvidas.',
    '',
    'Critérios para evolução:',
    '• Domínio consistente das rotinas do cargo.\n• Autonomia para resolver demandas recorrentes.\n• Capacidade de apoiar colegas e propor melhorias.\n• Entrega de resultados com qualidade, postura profissional e aderência aos valores da empresa.'
  ].join('\n');
}

function cargoMontarPromptIA(base) {
  const func = base[0]?.funcao || 'Função analisada';
  const evidencias = base.map((x, i) => [
    `Colaborador ${i+1}: ${x.colaborador || 'Não informado'}`,
    `Cargo informado: ${x.funcao || func}`,
    `Rotinas e atividades: ${x.rotinas || 'Não informado'}`,
    `Conhecimentos técnicos usados: ${x.tecnicos || 'Não informado'}`,
    `Comportamentos necessários: ${x.comportamentos || 'Não informado'}`
  ].join('\n')).join('\n\n---\n\n');
  return `Você é uma especialista sênior em Recursos Humanos, cargos e salários e gestão por competências.\n\nCrie um DESCRITIVO PADRÃO DE CARGO profissional para a função: ${func}.\n\nUse somente as evidências abaixo como base, consolidando informações repetidas e corrigindo a linguagem para um padrão corporativo. Não invente dados específicos que não estejam nas evidências; quando necessário, use descrições gerais e seguras.\n\nFormato obrigatório:\n1. Título do cargo\n2. Missão do cargo\n3. Principais responsabilidades\n4. Conhecimentos técnicos necessários\n5. Competências comportamentais esperadas\n6. Entregas esperadas\n7. Indicadores sugeridos de desempenho\n8. Critérios para evolução para o próximo nível\n\nEvidências dos colaboradores:\n${evidencias}`;
}

async function cargoChamarAnthropic(prompt) {
  const data = await chamarAnthropicProxy({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1800,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }]
  });
  return (data.content || []).map(c => c.text || '').join('\n').trim();
}

async function cargoGerarDescricaoIdeal() {
  const filtro = (document.getElementById('cargo-filtro')?.value || '').toLowerCase().trim();
  const base   = cargosLista.filter(c => !filtro || (c.funcao||'').toLowerCase().includes(filtro));
  const box    = document.getElementById('cargo-ia');
  const actions = document.getElementById('cargo-ia-actions');
  if (!box) return;
  if (!base.length) {
    box.style.display = 'block';
    if (actions) actions.style.display = 'none';
    box.textContent = 'Nenhuma resposta encontrada para essa função. Cadastre pelo menos uma auto descrição.';
    return;
  }

  box.style.display = 'block';
  if (actions) actions.style.display = 'none';
  box.textContent = '🤖 Gerando descritivo com IA...';

  try {
    let texto = '';
    if (getAnthropicKey()) {
      texto = await cargoChamarAnthropic(cargoMontarPromptIA(base));
    } else {
      const configurar = confirm('A chave da IA ainda não foi configurada. Deseja configurar agora?\n\nSe clicar em Cancelar, vou gerar uma versão automática local com base nas respostas cadastradas.');
      if (configurar) {
        abrirConfigKey();
        if (getAnthropicKey()) texto = await cargoChamarAnthropic(cargoMontarPromptIA(base));
      }
      if (!texto) texto = cargoMontarDescritivoLocal(base);
    }
    cargosAnalises++;
    cargosStats();
    box.textContent = texto;
    if (actions) actions.style.display = 'flex';
    addNotif('Descritivo de cargo gerado com sucesso!', 'success');
  } catch (err) {
    console.error(err);
    const fallback = cargoMontarDescritivoLocal(base);
    cargosAnalises++;
    cargosStats();
    box.textContent = '⚠️ Não consegui conectar com a IA agora. Gere uma chave válida ou verifique sua conexão.\n\nVersão automática local gerada abaixo:\n\n' + fallback;
    if (actions) actions.style.display = 'flex';
  }
}

function cargoCopiarDescricaoIA() {
  const texto = document.getElementById('cargo-ia')?.textContent || '';
  if (!texto.trim()) return;
  navigator.clipboard?.writeText(texto).then(() => addNotif('Descritivo copiado!', 'success')).catch(() => alert('Não foi possível copiar automaticamente.'));
}

function cargoBaixarDescricaoIA() {
  const texto = document.getElementById('cargo-ia')?.textContent || '';
  if (!texto.trim()) return;
  const nomeCargo = (document.getElementById('cargo-filtro')?.value || 'descritivo-cargo').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'descritivo-cargo';
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nomeCargo + '.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 300);
}

// ══════════════════════════════════════════
// OUVIDORIA
// ══════════════════════════════════════════
let _ouvMsgRespondendo = null;
let _ouvCatSelecionada = '';
let _ouvIdTipo = 'anonimo';
let _ouvAnexo = null;

function ouvHandleAnexo(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) ouvProcessarAnexo(file);
  const z = document.getElementById('ouv-drop-zone');
  if (z) { z.style.borderColor = 'var(--border)'; z.style.background = 'var(--bg)'; }
}
function ouvSelecionarAnexo(input) {
  if (input.files[0]) ouvProcessarAnexo(input.files[0]);
}
function ouvProcessarAnexo(file) {
  if (file.size > 5 * 1024 * 1024) { addNotif('Arquivo maior que 5MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    _ouvAnexo = { nome: file.name, tipo: file.type, dados: e.target.result };
    const lbl  = document.getElementById('ouv-anexo-nome');
    const zone = document.getElementById('ouv-drop-zone');
    if (lbl)  lbl.textContent = '✅ ' + file.name;
    if (zone) { zone.style.borderColor = '#22C58B'; zone.style.background = '#f0fff4'; }
  };
  reader.readAsDataURL(file);
}

async function ouvCarregar() {
  // Usar _roleReal para detectar se é RH mesmo em "Minha Visão"
  const realRole = _roleReal || role;
  const isRH = realRole === 'rh' || realRole === 'rh-colaborador';
  const gridRH    = document.getElementById('ouv-grid-rh');
  const gridColab = document.getElementById('ouv-grid-colab');

  if (isRH) {
    if (gridRH)    gridRH.style.display    = 'block';
    if (gridColab) gridColab.style.display = 'none';
  } else {
    if (gridRH)    gridRH.style.display    = 'none';
    if (gridColab) gridColab.style.display = 'grid';
    ouvSelecionarId('anonimo');
  }

  await ouvAtualizarStats();
  if (isRH) await ouvRenderPainel();
  else await ouvRenderProprias();
}

function ouvSelecionarCategoria(cat) {
  _ouvCatSelecionada = cat;
  document.getElementById('ouv-categoria').value = cat;
  const cats = ['sugestao','elogio','reclamacao','duvida'];
  const cores = {sugestao:'#0047FF', elogio:'#22C58B', reclamacao:'#f59e0b', duvida:'#6b7280'};
  cats.forEach(c => {
    const el = document.getElementById('ouv-cat-' + c);
    if (!el) return;
    if (c === cat) {
      el.style.borderColor = cores[c];
      el.style.background  = cores[c] + '12';
      el.style.color       = cores[c];
    } else {
      el.style.borderColor = 'var(--border)';
      el.style.background  = '';
      el.style.color       = 'var(--ink)';
    }
  });
}

function ouvSelecionarId(tipo) {
  _ouvIdTipo = tipo;
  document.getElementById('ouv-anonimo').value = tipo === 'anonimo' ? 'sim' : 'nao';
  const elAnon = document.getElementById('ouv-id-anonimo');
  const elId   = document.getElementById('ouv-id-identificado');
  if (tipo === 'anonimo') {
    if (elAnon) { elAnon.style.borderColor = '#0047FF'; elAnon.style.background = 'rgba(0,71,255,.05)'; }
    if (elId)   { elId.style.borderColor   = 'var(--border)'; elId.style.background   = ''; }
  } else {
    if (elId)   { elId.style.borderColor   = '#0047FF'; elId.style.background   = 'rgba(0,71,255,.05)'; }
    if (elAnon) { elAnon.style.borderColor = 'var(--border)'; elAnon.style.background = ''; }
  }
}

async function ouvEnviar() {
  const mensagem  = document.getElementById('ouv-mensagem')?.value.trim();
  const categoria = document.getElementById('ouv-categoria')?.value;
  const anonimo   = document.getElementById('ouv-anonimo')?.value === 'sim';

  if (!mensagem) { alert('Escreva sua mensagem antes de enviar.'); return; }
  if (!categoria) { alert('Selecione uma categoria.'); return; }

  const usuario = currentUserData || {};
  const remetente = anonimo ? 'Anônimo' : (usuario.nome || sessionStorage.getItem('userName') || 'Colaborador');
  const msg = {
    id:         crypto.randomUUID(),
    categoria,
    mensagem,
    anonimo,
    remetente:  anonimo ? 'Anônimo' : remetente,
    remetenteReal: anonimo ? null : remetente,
    remetenteEmail: anonimo ? null : (usuario.email || sessionStorage.getItem('userEmail') || null),
    remetenteId: anonimo ? null : (usuario.docId || usuario.id || null),
    setor: anonimo ? null : (usuario.setor || null),
    cargo: anonimo ? null : (usuario.cargo || usuario.funcao || null),
    anexo:      _ouvAnexo || null,
    status:     'nova',
    resposta:   null,
    respondidoEm: null,
    criadoEm:   new Date().toISOString()
  };

  try {
    await db.collection(col('ouvidoria')).doc(msg.id).set(msg);
    await db.collection(col('recebimentos_rh')).doc(msg.id).set({
      id: msg.id, tipo:'ouvidoria', titulo:'Nova mensagem de ouvidoria', categoria, status:'novo', criadoEm:msg.criadoEm, origemId:msg.id, resumo: anonimo ? 'Mensagem anônima recebida' : ('Mensagem recebida de ' + remetente)
    });
    addNotif('Mensagem enviada com sucesso!', 'success');
    log('Ouvidoria', 'Nova ' + categoria + (anonimo ? ' (anônima)' : ''), '📣');
  } catch(e) { addNotif('Erro ao enviar: ' + e.message, 'error'); return; }

  // Reset form
  document.getElementById('ouv-mensagem').value = '';
  ouvSelecionarCategoria('');
  ouvSelecionarId('anonimo');
  _ouvAnexo = null;
  const lbl  = document.getElementById('ouv-anexo-nome');
  const zone = document.getElementById('ouv-drop-zone');
  const inp  = document.getElementById('ouv-file-input');
  if (lbl)  lbl.textContent = 'Clique para anexar arquivo';
  if (zone) { zone.style.borderColor = 'var(--border)'; zone.style.background = 'var(--bg)'; }
  if (inp)  inp.value = '';
  document.getElementById('ouv-confirmacao').style.display = 'block';
  setTimeout(() => {
    const c = document.getElementById('ouv-confirmacao');
    if (c) c.style.display = 'none';
  }, 4000);

  await ouvAtualizarStats();
  await ouvRenderProprias();
}

async function ouvAtualizarStats() {
  try {
    const snap = await db.collection(col('ouvidoria')).get();
    const msgs = snap.docs.map(d => ({...d.data(), id: d.id}));
    const total       = msgs.length;
    const novas       = msgs.filter(m => m.status === 'nova').length;
    const respondidas = msgs.filter(m => m.status === 'respondida').length;
    const eid = id => document.getElementById(id);
    if (eid('ouv-total'))       eid('ouv-total').textContent       = total;
    if (eid('ouv-novas'))       eid('ouv-novas').textContent       = novas;
    if (eid('ouv-respondidas')) eid('ouv-respondidas').textContent = respondidas;
  } catch(e) {}
}

async function ouvRenderPainel() {
  const lista = document.getElementById('ouv-lista-rh');
  const count = document.getElementById('ouv-rh-count');
  if (!lista) return;

  lista.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-30)">⏳ Carregando...</div>';

  const filtCat    = document.getElementById('ouv-filtro-cat')?.value    || '';
  const filtStatus = document.getElementById('ouv-filtro-status')?.value || '';

  let msgs = [];
  try {
    const snap = await db.collection(col('ouvidoria')).orderBy('criadoEm','desc').get();
    msgs = snap.docs.map(d => ({...d.data(), id: d.id}));
  } catch(e) { lista.innerHTML = '<div style="padding:20px;color:var(--rust)">Erro ao carregar.</div>'; return; }

  if (filtCat)    msgs = msgs.filter(m => m.categoria === filtCat);
  if (filtStatus) msgs = msgs.filter(m => m.status    === filtStatus);

  if (count) count.textContent = msgs.length + ' mensagen' + (msgs.length !== 1 ? 's' : '') + ' recebida' + (msgs.length !== 1 ? 's' : '');

  if (!msgs.length) {
    lista.innerHTML = '<div style="text-align:center;padding:32px;color:var(--ink-30)"><div style="font-size:36px;margin-bottom:8px">📭</div><p>Nenhuma mensagem encontrada.</p></div>';
    return;
  }

  const catInfo = {
    sugestao:  {icon:'💡', cor:'#0047FF', label:'Sugestão'},
    elogio:    {icon:'🌟', cor:'#22C58B', label:'Elogio'},
    reclamacao:{icon:'⚠️', cor:'#f59e0b', label:'Reclamação'},
    duvida:    {icon:'❓', cor:'#6b7280', label:'Dúvida'}
  };
  const statusInfo = {
    nova:       {badge:'🔵 Nova',       cor:'#0047FF'},
    lida:       {badge:'✅ Lida',       cor:'#22C58B'},
    respondida: {badge:'💬 Respondida', cor:'#6b7280'}
  };

  lista.innerHTML = msgs.map(m => {
    const cat  = catInfo[m.categoria]  || {icon:'📣', cor:'#0047FF', label: m.categoria};
    const stat = statusInfo[m.status]  || {badge: m.status, cor:'#6b7280'};
    const data = new Date(m.criadoEm).toLocaleDateString('pt-BR', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
    return '<div style="border:1px solid var(--border);border-left:4px solid ' + cat.cor + ';border-radius:10px;padding:14px 16px;background:#fff">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;flex-wrap:wrap">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-size:16px">' + cat.icon + '</span>' +
          '<span style="font-size:12px;font-weight:700;background:' + cat.cor + '15;color:' + cat.cor + ';border-radius:5px;padding:2px 8px">' + cat.label + '</span>' +
          '<span style="font-size:12px;font-weight:700;background:' + stat.cor + '15;color:' + stat.cor + ';border-radius:5px;padding:2px 8px">' + stat.badge + '</span>' +
        '</div>' +
        '<span style="font-size:11px;color:var(--ink-30)">' + data + '</span>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--ink);line-height:1.6;margin-bottom:8px">' + m.mensagem + '</div>' +
      '<div style="font-size:11px;color:var(--ink-30);margin-bottom:10px">De: ' + (m.anonimo ? '🔒 Anônimo' : '👤 ' + m.remetente) + '</div>' +
      (m.anexo ? '<div style="margin-bottom:8px"><a href="' + m.anexo.dados + '" download="' + m.anexo.nome + '" style="display:inline-flex;align-items:center;gap:6px;background:rgba(0,71,255,.07);border:1px solid #0047FF;border-radius:8px;padding:6px 12px;text-decoration:none;color:#0047FF;font-size:12px;font-weight:600">📎 ' + m.anexo.nome + '</a></div>' : '') +
      (m.resposta ? '<div style="background:var(--bg);border-radius:8px;padding:10px 12px;margin-bottom:10px;border-left:3px solid #22C58B"><div style="font-size:11px;font-weight:700;color:#22C58B;margin-bottom:4px">✅ Resposta do RH</div><div style="font-size:13px;color:var(--ink);line-height:1.5">' + m.resposta + '</div></div>' : '') +
      '<div style="display:flex;gap:7px;flex-wrap:wrap">' +
        (m.status !== 'lida' && m.status !== 'respondida' ? '<button data-mid="' + m.id + '" onclick="ouvMarcarLida(this.dataset.mid)" style="font-size:12px;padding:5px 10px;border:1px solid var(--border);background:var(--bg);border-radius:7px;cursor:pointer">✅ Marcar lida</button>' : '') +
        '<button data-mid="' + m.id + '" data-mmsg="' + m.mensagem.replace(/"/g,'&quot;').slice(0,100) + '" onclick="ouvAbrirResposta(this.dataset.mid, this.dataset.mmsg)" style="font-size:12px;padding:5px 10px;border:1px solid #0047FF;background:rgba(0,71,255,.07);color:#0047FF;border-radius:7px;cursor:pointer;font-weight:600">💬 Responder</button>' +
        '<button data-mid="' + m.id + '" onclick="ouvExcluir(this.dataset.mid)" style="font-size:12px;padding:5px 10px;border:1px solid #fca5a5;background:#fef2f2;border-radius:7px;cursor:pointer;color:#991b1b">🗑</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function ouvRenderProprias() {
  const lista = document.getElementById('ouv-lista-proprias');
  if (!lista) return;
  const nome = sessionStorage.getItem('userName') || '';
  if (!nome) return;

  let msgs = [];
  try {
    const snap = await db.collection(col('ouvidoria')).orderBy('criadoEm','desc').get();
    msgs = snap.docs.map(d => ({...d.data(), id:d.id})).filter(m => m.remetenteReal === nome);
  } catch(e) {}

  if (!msgs.length) {
    lista.innerHTML = '<div style="text-align:center;padding:32px;color:var(--ink-30)"><div style="font-size:36px;margin-bottom:8px">📭</div><p>Nenhuma mensagem enviada ainda.</p></div>';
    return;
  }

  const catInfo = {sugestao:{icon:'💡',cor:'#0047FF'},elogio:{icon:'🌟',cor:'#22C58B'},reclamacao:{icon:'⚠️',cor:'#f59e0b'},duvida:{icon:'❓',cor:'#6b7280'}};
  lista.innerHTML = msgs.map(m => {
    const cat  = catInfo[m.categoria] || {icon:'📣',cor:'#0047FF'};
    const data = new Date(m.criadoEm).toLocaleDateString('pt-BR', {day:'2-digit',month:'short',year:'numeric'});
    return '<div style="border:1px solid var(--border);border-left:4px solid ' + cat.cor + ';border-radius:10px;padding:14px 16px;background:#fff">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<span style="font-size:16px">' + cat.icon + ' <span style="font-size:12px;font-weight:700;color:' + cat.cor + '">' + (m.categoria||'') + '</span></span>' +
        '<span style="font-size:11px;color:var(--ink-30)">' + data + '</span>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--ink);line-height:1.6;margin-bottom:8px">' + m.mensagem + '</div>' +
      (m.resposta ? '<div style="background:#f0fff4;border-radius:8px;padding:10px 12px;border-left:3px solid #22C58B"><div style="font-size:11px;font-weight:700;color:#22C58B;margin-bottom:4px">💬 Resposta do RH</div><div style="font-size:13px;color:var(--ink);line-height:1.5">' + m.resposta + '</div></div>' :
        '<div style="font-size:11px;color:var(--ink-30);font-style:italic">⏳ Aguardando resposta do RH</div>') +
    '</div>';
  }).join('');
}

async function ouvMarcarLida(id) {
  try {
    await db.collection(col('ouvidoria')).doc(id).update({ status: 'lida' });
    await ouvRenderPainel();
    await ouvAtualizarStats();
  } catch(e) {}
}

function ouvAbrirResposta(id, msgPreview) {
  _ouvMsgRespondendo = id;
  document.getElementById('ouv-modal-msg-preview').textContent = '"' + msgPreview + (msgPreview.length >= 100 ? '...' : '') + '"';
  document.getElementById('ouv-resposta-texto').value = '';
  document.getElementById('ouv-modal-resposta').style.display = 'flex';
}

async function ouvEnviarResposta() {
  const texto = document.getElementById('ouv-resposta-texto')?.value.trim();
  if (!texto) { alert('Escreva uma resposta.'); return; }
  try {
    await db.collection(col('ouvidoria')).doc(_ouvMsgRespondendo).update({
      resposta: texto, status: 'respondida', respondidoEm: new Date().toISOString()
    });
    addNotif('Resposta enviada com sucesso!', 'success');
    document.getElementById('ouv-modal-resposta').style.display = 'none';
    await ouvRenderPainel();
    await ouvAtualizarStats();
  } catch(e) { alert('Erro: ' + e.message); }
}

async function ouvExcluir(id) {
  if (!confirm('Excluir esta mensagem permanentemente?')) return;
  await db.collection(col('ouvidoria')).doc(id).delete();
  await ouvRenderPainel();
  await ouvAtualizarStats();
  addNotif('Mensagem excluída.', 'success');
}

// ══════════════════════════════════════════
// ANÁLISE C&S
// ══════════════════════════════════════════
let selecaoLista=[];
function selecaoGerarParecer(){
  const nT=Number(document.getElementById('sel-tecnica').value||0), nC=Number(document.getElementById('sel-comport').value||0), media=Math.round(((nT+nC)/20)*100);
  const nome=document.getElementById('sel-candidato').value.trim()||'Candidato';
  const decisao=media>=80?'Aprovado para próxima etapa':media>=60?'Manter em avaliação / validar pontos de risco':'Não recomendado neste momento';
  document.getElementById('sel-parecer').value=`${nome} apresentou aderência geral de ${media}%. Parecer sugerido: ${decisao}.\n\nResumo: validar evidências técnicas apresentadas na dinâmica e confrontar com comportamentos observados na entrevista. Registrar pontos de atenção antes da decisão final.`;
}
async function selecaoSalvar(){
  const tecnica=Number(document.getElementById('sel-tecnica').value||0), comport=Number(document.getElementById('sel-comport').value||0);
  const item={id:crypto.randomUUID(),candidato:document.getElementById('sel-candidato').value.trim(),vaga:document.getElementById('sel-vaga').value.trim(),tecnica,comport,aderencia:Math.round(((tecnica+comport)/20)*100),evTec:document.getElementById('sel-ev-tec').value.trim(),evComp:document.getElementById('sel-ev-comp').value.trim(),parecer:document.getElementById('sel-parecer').value.trim(),status:((tecnica+comport)/20)>=0.8?'Aprovado':((tecnica+comport)/20)>=0.6?'Em avaliação':'Não recomendado',criadoEm:new Date().toISOString()};
  if(!item.candidato||!item.vaga){alert('Informe candidato e vaga.');return;}
  try{await db.collection(col('selecao_analises')).doc(item.id).set(item);}catch(e){}
  selecaoLista.unshift(item); selecaoRender(); selecaoStats(); addNotif('Análise de C&S salva!', 'success');
}
function selecaoRender(){
  const el=document.getElementById('sel-lista'); if(!el)return;
  if(!selecaoLista.length){el.innerHTML='<div class="empty"><div class="ei">🧩</div>Nenhuma análise registrada ainda.</div>';return;}
  const lista=[...selecaoLista].sort((a,b)=>b.aderencia-a.aderencia);
  el.innerHTML=lista.map(s=>`<div class="ri-item"><div class="ri-head"><div class="ri-name">${s.candidato}</div><span style="font-size:13px;font-weight:800;color:var(--pur)">${s.aderencia}%</span></div><div class="ri-meta"><span class="ri-m"><strong>Vaga:</strong> ${s.vaga}</span><span class="ri-m"><strong>Técnica:</strong> ${s.tecnica}/10</span><span class="ri-m"><strong>Comport.:</strong> ${s.comport}/10</span></div><div style="height:8px;background:var(--border);border-radius:5px;overflow:hidden;margin:8px 0"><div style="height:100%;background:var(--pur);width:${s.aderencia}%"></div></div><div style="font-size:12px;color:var(--ink-60)"><strong>Parecer:</strong> ${s.status}</div></div>`).join('');
}
function selecaoStats(){
  const t=document.getElementById('sel-total'), a=document.getElementById('sel-aprovados'), m=document.getElementById('sel-media');
  const media=selecaoLista.length?Math.round(selecaoLista.reduce((x,y)=>x+y.aderencia,0)/selecaoLista.length):0;
  if(t)t.textContent=selecaoLista.length; if(a)a.textContent=selecaoLista.filter(x=>x.status==='Aprovado').length; if(m)m.textContent=media+'%';
}
async function selecaoCarregar(){try{const snap=await db.collection(col('selecao_analises')).orderBy('criadoEm','desc').get();selecaoLista=snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){selecaoLista=[];}selecaoRender();selecaoStats();}
