// ===== script: gm-loja-js =====
(function(){
'use strict';
if(window.__gmV2Init) return;
window.__gmV2Init = true;

var LEVELS=[
  {min:0,     num:1,  nome:'Iniciante',    cor:'#6b7280', bg:'#f9fafb'},
  {min:500,   num:2,  nome:'Aprendiz',     cor:'#3b6d11', bg:'#f0fdf4'},
  {min:1500,  num:3,  nome:'Colaborador',  cor:'#185fa5', bg:'#eff6ff'},
  {min:3000,  num:4,  nome:'Experiente',   cor:'#854f0b', bg:'#fffbeb'},
  {min:5500,  num:5,  nome:'Avancado',     cor:'#0f6e56', bg:'#f0fdfa'},
  {min:8500,  num:6,  nome:'Especialista', cor:'#4338ca', bg:'#eef2ff'},
  {min:12000, num:7,  nome:'Expert',       cor:'#7c3aed', bg:'#faf5ff'},
  {min:16500, num:8,  nome:'Mestre',       cor:'#3c3489', bg:'#eef2ff'},
  {min:22000, num:9,  nome:'Elite',        cor:'#0c447c', bg:'#eff6ff'},
  {min:28500, num:10, nome:'Lenda',        cor:'#ba7517', bg:'#fffbeb'},
];

var CATS=[
  {id:'todos',          ico:'',   label:'Todos'},
  {id:'descanso',       ico:'🏖', label:'Descanso'},
  {id:'desenvolvimento',ico:'🎓', label:'Desenvolvimento'},
  {id:'beneficios',     ico:'🎁', label:'Beneficios'},
  {id:'reconhecimento', ico:'🌟', label:'Reconhecimento'},
  {id:'alimentacao',    ico:'🍃', label:'Alimentacao'},
];

var BADGES=[
  {id:'streak7',   ico:'🔥', nome:'Streak 7',    desc:'7 dias seguidos', unlocked:true,  raro:false},
  {id:'comm',      ico:'💬', nome:'Comunicador',  desc:'10 comentarios',  unlocked:true,  raro:false},
  {id:'reconh',    ico:'🤝', nome:'Reconhecedor', desc:'5 elogios dados', unlocked:true,  raro:false},
  {id:'pesq',      ico:'📝', nome:'Pesquisador',  desc:'3 pesquisas',     unlocked:true,  raro:false},
  {id:'top1',      ico:'🏆', nome:'Top 1',        desc:'Primeiro lugar',  unlocked:false, raro:true, progresso:80, meta:'Complete 50 missoes em um mes'},
  {id:'perfeito',  ico:'🚀', nome:'Mes perfeito', desc:'Todas as missoes',unlocked:false, raro:true, progresso:40, meta:'Conclua todas as missoes do mes'},
  {id:'mentor',    ico:'🧠', nome:'Mentor',       desc:'10 reconhecimentos',unlocked:false, raro:false, progresso:20, meta:'Reconheca 10 colegas'},
  {id:'loja',      ico:'🛍', nome:'Primeiro resgate',desc:'Resgate 1 item',unlocked:false, raro:false, progresso:0, meta:'Resgate 1 item na loja'},
];

var MISSOES=[
  {id:'pesquisa',  ico:'🌱', nome:'Responder pesquisa de clima',     desc:'Participe da pesquisa de clima organizacional.',     xp:50,  cat:'pink',   periodo:'semanal', status:'disponivel', prazo:'3 dias',      acao:"sbNav('pesquisas')"},
  {id:'comentar',  ico:'💬', nome:'Comentar em um comunicado',       desc:'Reaja ou comente em uma publicacao da intranet.',    xp:15,  cat:'blue',   periodo:'diaria',   status:'concluida',  meta:'1/1 feito',    acao:"sbNav('intranet')"},
  {id:'reconhecer',ico:'🤝', nome:'Reconhecer um colega',            desc:'Envie um elogio ou reconhecimento para alguem do time.', xp:30,  cat:'green',  periodo:'diaria',   status:'disponivel', prazo:'Sem prazo',   acao:"sbNav('intranet')"},
  {id:'trilha',    ico:'📚', nome:'Completar trilha de treinamento', desc:'Avance nos modulos da sua trilha de desenvolvimento.', xp:100, cat:'amber',  periodo:'mensal',   status:'andamento',  meta:'2/5 modulos',  prog:40, acao:"sbNav('trilhas')"},
  {id:'pdi',       ico:'🎯', nome:'Atualizar meu PDI',               desc:'Revise suas metas e plano de desenvolvimento individual.', xp:40,  cat:'purple', periodo:'mensal',   status:'disponivel', prazo:'Sem prazo',   acao:"sbNav('pdi')"},
  {id:'post',      ico:'✍', nome:'Publicar na intranet',            desc:'Compartilhe uma novidade ou conquista com o time.',  xp:25,  cat:'indigo', periodo:'semanal',  status:'disponivel', prazo:'Semanal',     acao:"sbNav('intranet')"},
  {id:'foto',      ico:'📸', nome:'Atualizar foto de perfil',        desc:'Mantenha seu perfil sempre atualizado.',             xp:20,  cat:'teal',   periodo:'mensal',   status:'disponivel', prazo:'Sem prazo',   acao:''},
  {id:'aniver',    ico:'🎂', nome:'Cumprimentar aniversariante',     desc:'Deixe uma mensagem para quem faz aniversario hoje.', xp:10,  cat:'rose',   periodo:'diaria',   status:'disponivel', prazo:'Hoje',        acao:"sbNav('intranet')"},
];

var TRILHA_ATUAL={
  nome:'Onboarding Comercial',
  nivelAtual:5,
  totalEtapas:10,
  colegas:12,
  nodes:[
    {n:1,status:'done'},{n:2,status:'done'},{n:3,status:'done'},{n:4,status:'done'},
    {n:5,status:'atual'},{n:6,status:'bloqueado'},{n:7,status:'bloqueado'},
    {n:8,status:'bloqueado'},{n:9,status:'bloqueado'},{n:10,status:'premio'}
  ],
  nivelTitulo:'Nivel 5 — Onboarding Comercial',
  nivelDesc:'Aprenda as praticas e ferramentas essenciais para se integrar ao time comercial e comecar a gerar valor desde os primeiros dias.',
  nivelMissoes:[
    {nome:'Estude: Fundamentos do produto', xp:70, feito:true},
    {nome:'Pratique: Simulacao de atendimento', xp:70, feito:false},
    {nome:'Desafio: Atenda um caso real', xp:60, feito:false}
  ],
  recompensaXP:200, recompensaBadge:'Comercial Jr.'
};

var STREAK_INFO={recorde:28, multiplicador:1.5, proximoMarcoDias:15};

var CAT_COR={
  pink:'#f43f5e', blue:'#3b82f6', green:'#22c55e', amber:'#f59e0b',
  purple:'#9333ea', indigo:'#4338ca', teal:'#14b8a6', rose:'#fb7185',
};

var LOJA_SEED=[
  {nome:'Day off extra',          desc:'Um dia de folga adicional para usar quando quiser.',                   categoria:'descanso',       emoji:'🏖',  xpCusto:5000,  destaque:true,  ativo:true, estoque:50},
  {nome:'Tarde livre',            desc:'Saida 4h mais cedo em uma sexta-feira a sua escolha.',                 categoria:'descanso',       emoji:'🧘',  xpCusto:2500,  destaque:false, ativo:true, estoque:50},
  {nome:'Curso a sua escolha',    desc:'Plataforma online por 3 meses (Alura, Udemy, Coursera).',              categoria:'desenvolvimento',emoji:'🎓',  xpCusto:8000,  destaque:true,  ativo:true, estoque:50},
  {nome:'Mentoria com lideranca', desc:'1 hora de mentoria individual com um diretor ou gerente.',             categoria:'desenvolvimento',emoji:'🤝',  xpCusto:10000, destaque:true,  ativo:true, estoque:50},
  {nome:'Vale experiencia',       desc:'Ingresso para cinema, teatro ou evento cultural.',                     categoria:'beneficios',     emoji:'🎟',  xpCusto:3500,  destaque:true,  ativo:true, estoque:50},
  {nome:'Home office kit',        desc:'Suporte de notebook, mousepad ergonomico ou webcam HD.',               categoria:'beneficios',     emoji:'🎧',  xpCusto:4000,  destaque:false, ativo:true, estoque:50},
  {nome:'Academia 1 mes',         desc:'Reembolso integral de mensalidade de academia.',                       categoria:'beneficios',     emoji:'🏋',  xpCusto:6000,  destaque:false, ativo:true, estoque:50},
  {nome:'Voucher alimentacao',    desc:'Credito extra no cartao de beneficio do mes.',                         categoria:'alimentacao',    emoji:'🥗',  xpCusto:1500,  destaque:false, ativo:true, estoque:50},
  {nome:'Lanche especial',        desc:'Lanche ou cafe da manha especial no escritorio.',                      categoria:'alimentacao',    emoji:'☕',  xpCusto:800,   destaque:false, ativo:true, estoque:50},
  {nome:'Destaque no mural',      desc:'Seu nome em evidencia no Portal por 1 semana.',                       categoria:'reconhecimento', emoji:'🌟',  xpCusto:500,   destaque:false, ativo:true, estoque:50},
  {nome:'Certificado de destaque',desc:'Certificado digital assinado pela diretoria.',                        categoria:'reconhecimento', emoji:'📜',  xpCusto:2000,  destaque:false, ativo:true, estoque:50},
  {nome:'Dia do lider',           desc:'Participe de uma reuniao estrategica da lideranca.',                   categoria:'reconhecimento', emoji:'👔',  xpCusto:12000, destaque:true,  ativo:true, estoque:50},
];

/* ── STATE ── */
var S={xp:0, resgates:[], lojaItems:[], catAtual:'todos', lojaLoaded:false, rankLoaded:false};

/* ── HELPERS ── */
function getLv(xp){for(var i=LEVELS.length-1;i>=0;i--)if(xp>=LEVELS[i].min)return LEVELS[i];return LEVELS[0];}
function nextLv(xp){var l=getLv(xp);return l.num<10?LEVELS[l.num]:null;}
function lvProg(xp){var l=getLv(xp),n=nextLv(xp);if(!n)return 100;return Math.min(100,Math.round(((xp-l.min)/(n.min-l.min))*100));}
function fmtXP(n){return n>=1000?(n/1000).toFixed(1).replace('.0','')+'k':String(n);}
function fmtN(n){return Number(n).toLocaleString('pt-BR');}
function getEmail(){return(typeof emailUsuario==='function'?emailUsuario():'')||sessionStorage.getItem('imexEmail')||'';}
function isRH(){return(window.role||'').toLowerCase().includes('rh');}
function getNome(){return(typeof getNomeUsuario==='function'?getNomeUsuario():'')||(document.getElementById('pLabel')||{}).textContent||'';}
function fmtDate(d){if(!d)return '';try{var dt=d&&d.toDate?d.toDate():new Date(d);return dt.toLocaleDateString('pt-BR');}catch(e){return '';}}

/* ── FIREBASE ── */
function cXP(){return col('intra_xp');}
function cLoja(){return col('intra_loja');}
function cRes(){return col('intra_resgates');}

function loadXP(cb){
  var em=getEmail();
  if(!em||!window.db){cb(0);return;}
  db.collection(cXP()).doc(em).get()
    .then(function(d){S.xp=d.exists?(d.data().xpTotal||0):0;cb(S.xp);})
    .catch(function(){cb(0);});
}

function seedLoja(cb){
  if(!window.db){cb(LOJA_SEED.map(function(i,n){return Object.assign({id:'s'+n},i);}));return;}
  db.collection(cLoja()).where('ativo','==',true).get()
    .then(function(snap){
      if(!snap.empty){var it=[];snap.forEach(function(d){it.push(Object.assign({id:d.id},d.data()));});cb(it);return;}
      var batch=db.batch();
      LOJA_SEED.forEach(function(item){batch.set(db.collection(cLoja()).doc(),Object.assign({criadoEm:new Date().toISOString()},item));});
      batch.commit().then(function(){
        db.collection(cLoja()).where('ativo','==',true).get()
          .then(function(s2){var it=[];s2.forEach(function(d){it.push(Object.assign({id:d.id},d.data()));});cb(it);});
      }).catch(function(){cb(LOJA_SEED.map(function(i,n){return Object.assign({id:'s'+n},i);}));});
    }).catch(function(){cb(LOJA_SEED.map(function(i,n){return Object.assign({id:'s'+n},i);}));});
}

function loadHist(cb){
  var em=getEmail();
  if(!em||!window.db){cb([]);return;}
  db.collection(cRes()).where('emailColab','==',em).orderBy('data','desc').limit(20).get()
    .then(function(snap){var h=[];snap.forEach(function(d){h.push(Object.assign({id:d.id},d.data()));});cb(h);})
    .catch(function(){cb([]);});
}

function resgatarItem(item,cb){
  var em=getEmail();
  if(!em||!window.db){cb({ok:false,msg:'Sem conexao.'});return;}
  if(S.xp<item.xpCusto){cb({ok:false,msg:'XP insuficiente.'});return;}
  var ref=db.collection(cXP()).doc(em);
  ref.get().then(function(doc){
    var cur=doc.exists?(doc.data().xpTotal||0):0;
    if(cur<item.xpCusto){cb({ok:false,msg:'XP insuficiente.'});return;}
    var novo=cur-item.xpCusto;
    ref.set({xpTotal:novo,email:em},{merge:true}).then(function(){
      db.collection(cRes()).add({
        emailColab:em,nomeColab:getNome(),
        itemId:item.id,itemNome:item.nome,itemEmoji:item.emoji||'🎁',
        xpGasto:item.xpCusto,
        data:firebase.firestore.FieldValue.serverTimestamp(),
        status:'pendente',
      }).then(function(){S.xp=novo;cb({ok:true});});
    });
  }).catch(function(){cb({ok:false,msg:'Erro. Tente novamente.'});});
}

function loadRanking(cb){
  if(!window.db){cb([]);return;}
  db.collection(cXP()).orderBy('xpTotal','desc').limit(10).get()
    .then(function(snap){var r=[];snap.forEach(function(d){r.push(Object.assign({id:d.id},d.data()));});cb(r);})
    .catch(function(){cb([]);});
}

/* ── ANIMATIONS ── */
function animCount(el,target,dur){
  if(!el)return;
  var start=0,step=target/(dur/16),timer=setInterval(function(){
    start+=step;
    if(start>=target){start=target;clearInterval(timer);}
    el.textContent=fmtN(Math.round(start))+' XP';
  },16);
}

function animRing(svgId,pct,cor){
  var el=document.getElementById(svgId);
  if(!el)return;
  var r=54, c=2*Math.PI*r, offset=c*(1-pct/100);
  el.style.stroke=cor;
  el.style.strokeDasharray=c;
  el.style.strokeDashoffset=c;
  setTimeout(function(){el.style.strokeDashoffset=offset;},50);
}

function animBar(elId,pct,cor){
  var el=document.getElementById(elId);
  if(!el)return;
  el.style.background=cor;
  setTimeout(function(){el.style.width=pct+'%';},50);
}

/* ── VIEW ── */
function renderGamView(){
  var v=document.getElementById('view-gamificacao');
  if(!v)return;
  var lv=getLv(S.xp),nxt=nextLv(S.xp),prog=lvProg(S.xp);
  var streak=8, rank=S.xp>0?'#3':'--', badges=BADGES.filter(function(b){return b.unlocked;}).length;

  v.innerHTML=
    '<div class="hero" style="background:linear-gradient(135deg,#1e1b4b 0%,#4338ca 60%,#7c3aed 100%);padding-bottom:0">'+
      '<div style="padding:6px 4px 16px">'+
        '<div class="h-eyebrow" style="color:rgba(255,255,255,.6)">Engajamento & Reconhecimento</div>'+
        '<h1 style="color:#fff;margin:4px 0 6px">Gamificacao</h1>'+
        '<p style="color:rgba(255,255,255,.65);margin:0">Ganhe XP, suba de nivel e resgate recompensas.</p>'+
      '</div>'+
      '<div class="gm-hero-stats">'+
        '<div class="gm-hstat"><div class="gm-hstat-num" id="gm-xp-hero">'+fmtXP(S.xp)+'</div><div class="gm-hstat-lbl">XP total</div></div>'+
        '<div class="gm-hstat"><div class="gm-hstat-num">Nv '+lv.num+'</div><div class="gm-hstat-lbl">'+lv.nome+'</div></div>'+
        '<div class="gm-hstat"><div class="gm-hstat-num">'+streak+'d</div><div class="gm-hstat-lbl">Streak</div></div>'+
        '<div class="gm-hstat"><div class="gm-hstat-num">'+rank+'</div><div class="gm-hstat-lbl">Ranking</div></div>'+
      '</div>'+
    '</div>'+

    '<div class="gm-tabs">'+
      '<button class="gm-tab on" onclick="gmTab(\'progresso\')">Meu progresso</button>'+
      '<button class="gm-tab" onclick="gmTab(\'missoes\')">Missoes</button>'+
      '<button class="gm-tab" onclick="gmTab(\'trilha\')">Trilha</button>'+
      '<button class="gm-tab" onclick="gmTab(\'conquistas\')">Conquistas</button>'+
      '<button class="gm-tab" onclick="gmTab(\'ranking\')">Ranking</button>'+
      '<button class="gm-tab" onclick="gmTab(\'streak\')">Streak</button>'+
      '<button class="gm-tab" onclick="gmTab(\'carteira\')">Carteira</button>'+
      '<button class="gm-tab" onclick="gmTab(\'loja\')">Loja</button>'+
      (isRH()?'<button class="gm-tab gm-tab-rh" onclick="gmTab(\'admin\')">Admin</button>':'')+
    '</div>'+

    '<div id="gm-panel-progresso" class="gm-panel on">'+buildProg(lv,nxt,prog,streak)+'</div>'+
    '<div id="gm-panel-missoes" class="gm-panel">'+buildMiss('todas')+'</div>'+
    '<div id="gm-panel-trilha" class="gm-panel">'+buildTrilha()+'</div>'+
    '<div id="gm-panel-conquistas" class="gm-panel">'+buildConquistas('todas')+'</div>'+
    '<div id="gm-panel-ranking" class="gm-panel"><div class="gm-loading">Carregando ranking...</div></div>'+
    '<div id="gm-panel-streak" class="gm-panel">'+buildStreak(streak)+'</div>'+
    '<div id="gm-panel-carteira" class="gm-panel">'+buildCarteira()+'</div>'+
    '<div id="gm-panel-loja" class="gm-panel"><div class="gm-loading">Carregando loja...</div></div>'+
    (isRH()?'<div id="gm-panel-admin" class="gm-panel">'+buildAdmin()+'</div>':'')+

    '<div id="gm-overlay" class="gm-modal-overlay" style="display:none" onclick="if(event.target===this)gmFechar()">'+
      '<div class="gm-modal"><div id="gm-modal-body"></div></div>'+
    '</div>';

  /* animate XP counter & ring after render */
  setTimeout(function(){
    animCount(document.getElementById('gm-xp-hero'), S.xp, 900);
    animRing('gm-ring-svg', prog, lv.cor);
    animBar('gm-prog-bar', prog, lv.cor);
  }, 80);
  renderProgLojaPreview();
}

/* ── PROGRESSO (home) ── */
function buildProg(lv,nxt,prog,streak){
  var xpFalta=nxt?(nxt.min-S.xp):0;
  var primeiroNome=(getNome()||'Colaborador').split(' ')[0];
  var faltamMissoes=nxt?Math.max(1,Math.ceil(xpFalta/50)):0;
  var proxMissao=MISSOES.find(function(m){return m.status!=='concluida';});
  var etapasFeitas=TRILHA_ATUAL.nodes.filter(function(n){return n.status==='done';}).length;
  return (
    '<div class="gm-greet">'+
      '<h2>Ola, '+primeiroNome+' 👋</h2>'+
      '<p>'+(nxt?('Voce esta a '+faltamMissoes+' missoes do proximo nivel'):'Nivel maximo atingido! Voce e uma Lenda.')+'</p>'+
    '</div>'+
    '<div class="gm-stat-tiles">'+
      '<div class="gm-stile"><div class="gm-stile-ico">⭐</div><div><div class="gm-stile-num">'+fmtN(S.xp)+'</div><div class="gm-stile-lbl">XP</div></div></div>'+
      '<div class="gm-stile"><div class="gm-stile-ico">🔥</div><div><div class="gm-stile-num">'+streak+'</div><div class="gm-stile-lbl">dias sequencia</div></div></div>'+
      '<div class="gm-stile"><div class="gm-stile-ico">🌟</div><div><div class="gm-stile-num">Nivel '+lv.num+'</div><div class="gm-stile-lbl">'+lv.nome+'</div></div></div>'+
      '<div class="gm-stile"><div class="gm-stile-ico">🏆</div><div><div class="gm-stile-num">'+BADGES.filter(function(b){return b.unlocked;}).length+'</div><div class="gm-stile-lbl">Conquistas</div></div></div>'+
    '</div>'+
    '<div class="gm-two-col">'+
      '<div class="gm-mini-card">'+
        '<div class="gm-mini-lbl">Proxima missao:</div>'+
        (proxMissao?(
          '<div class="gm-mini-title">'+proxMissao.nome+'</div>'+
          '<div class="gm-mini-sub">Progresso</div>'+
          '<div class="gm-prog-bar-wrap" style="margin:8px 0"><div class="gm-prog-bar-fill" style="width:'+(proxMissao.prog||25)+'%;background:'+(CAT_COR[proxMissao.cat]||'#8b5cf6')+'"></div></div>'+
          '<div class="gm-mini-foot">Recompensa: <strong>+'+proxMissao.xp+' XP</strong></div>'
        ):'<div class="gm-mini-title">Todas as missoes concluidas!</div>')+
      '</div>'+
      '<div class="gm-mini-card">'+
        '<div class="gm-mini-lbl">Trilha em andamento:</div>'+
        '<div class="gm-mini-title">'+TRILHA_ATUAL.nome+'</div>'+
        '<div class="gm-trilha-mini-dots">'+
          TRILHA_ATUAL.nodes.slice(0,4).map(function(n,i){
            var cls=n.status==='done'?'gm-dot-done':n.status==='atual'?'gm-dot-atual':'gm-dot-bloq';
            var html='<span class="gm-dot '+cls+'">'+(n.status==='done'?'✓':n.status==='bloqueado'?'🔒':n.n)+'</span>';
            return i<3?html+'<span class="gm-dot-line"></span>':html;
          }).join('')+
        '</div>'+
        '<div class="gm-mini-foot">'+etapasFeitas+' de '+TRILHA_ATUAL.totalEtapas+' etapas concluidas</div>'+
      '</div>'+
    '</div>'+
    '<div class="gm-prog-loja-head">'+
      '<div class="gm-mini-lbl">Resgate com seu XP:</div>'+
      '<button class="gm-miss-go" onclick="gmTab(\'loja\')">Ver loja completa</button>'+
    '</div>'+
    '<div id="gm-prog-loja-preview"><div class="gm-loading">Carregando...</div></div>'
  );
}
function renderProgLojaPreview(){
  var host=document.getElementById('gm-prog-loja-preview');if(!host)return;
  seedLoja(function(items){
    host=document.getElementById('gm-prog-loja-preview');if(!host)return;
    var destaque=items.filter(function(i){return i.ativo&&i.destaque;}).slice(0,3);
    if(!destaque.length)destaque=items.filter(function(i){return i.ativo;}).slice(0,3);
    if(!destaque.length){host.innerHTML='<div class="gm-empty">Nenhum item disponivel ainda.</div>';return;}
    host.innerHTML='<div class="gm-prog-loja-grid">'+destaque.map(function(item){
      var pode=S.xp>=item.xpCusto;
      var pct=Math.min(100,Math.round((S.xp/item.xpCusto)*100));
      return '<div class="gm-prog-loja-card">'+
        (item.imagemUrl?'<div class="gm-prog-loja-img" style="background-image:url(\''+item.imagemUrl+'\')"></div>':'<div class="gm-prog-loja-emoji">'+(item.emoji||'🎁')+'</div>')+
        '<div class="gm-prog-loja-nome">'+item.nome+'</div>'+
        '<div class="gm-prog-loja-custo">⭐ '+fmtN(item.xpCusto)+'</div>'+
        (pode?'<div class="gm-prog-loja-ok">Disponivel</div>':
          '<div class="gm-prog-bar-wrap" style="margin-top:6px"><div class="gm-prog-bar-fill" style="width:'+pct+'%;background:#8b5cf6"></div></div>')+
      '</div>';
    }).join('')+'</div>';
  });
}

/* ── MISSOES ── */
function missItemHTML(m){
  var ok=m.status==='concluida', run=m.status==='andamento';
  var cor=CAT_COR[m.cat]||'#4338ca';
  var bgIco=cor+'18';
  return '<div class="gm-miss-item '+(ok?'gm-miss-done':run?'gm-miss-run':'gm-miss-avail')+'" style="border-left-color:'+cor+'">'+
    '<div class="gm-miss-icon" style="background:'+bgIco+'">'+m.ico+'</div>'+
    '<div class="gm-miss-info">'+
      '<div class="gm-miss-nome">'+m.nome+'</div>'+
      (m.desc?'<div class="gm-miss-desc">'+m.desc+'</div>':'')+
      '<div class="gm-miss-meta">'+(m.prazo?'Prazo: <strong>'+m.prazo+'</strong>':m.meta?'Progresso: <strong>'+m.meta+'</strong>':'Disponivel')+'</div>'+
      (run&&m.prog?'<div class="gm-miss-progress"><div class="gm-miss-progress-fill" style="width:'+m.prog+'%;background:'+cor+'"></div></div>':'')+
    '</div>'+
    '<div class="gm-miss-right">'+
      '<span class="gm-xp-pill '+(ok?'gm-xp-done':run?'gm-xp-run':'gm-xp-avail')+'">+'+m.xp+' XP</span>'+
      (ok?'<span class="gm-miss-check">✓ Feito</span>':
        '<button class="gm-miss-go" onclick="try{'+m.acao+'}catch(e){}">Ir</button>')+
    '</div>'+
  '</div>';
}
function buildMiss(periodo){
  periodo=periodo||'todas';
  var lista=MISSOES.filter(function(m){return periodo==='todas'||m.periodo===periodo;});
  var avail=lista.filter(function(m){return m.status!=='concluida';}).length;
  return (
    '<div class="gm-miss-subtabs">'+
      ['todas','diaria','semanal','mensal'].map(function(p){
        var lbl=p==='todas'?'Todas':p==='diaria'?'Diarias':p==='semanal'?'Semanais':'Mensais';
        return '<button class="gm-miss-subtab'+(p===periodo?' on':'')+'" onclick="gmMissFiltro(\''+p+'\')">'+lbl+'</button>';
      }).join('')+
    '</div>'+
    '<div style="font-size:13px;color:#9ca3af;margin:12px 0">'+avail+' missoes disponiveis — complete para ganhar XP</div>'+
    '<div class="gm-missoes">'+
      (lista.length?lista.map(missItemHTML).join(''):'<div class="gm-empty">Nenhuma missao neste periodo.</div>')+
    '</div>'
  );
}
window.gmMissFiltro=function(p){
  var panel=document.getElementById('gm-panel-missoes');if(!panel)return;
  panel.innerHTML=buildMiss(p);
};

/* ── TRILHA ── */
function trilhaMapHTML(t){
  var html='<div class="gm-hex-grid">';
  t.nodes.forEach(function(n){
    var cls=n.status==='done'?'gm-hex-done':n.status==='atual'?'gm-hex-atual':n.status==='premio'?'gm-hex-premio':'gm-hex-bloq';
    var conteudo=n.status==='done'?'✓':n.status==='premio'?'🏆':n.status==='atual'?(getNome()||'V').charAt(0).toUpperCase():(n.status==='bloqueado'?'🔒':n.n);
    html+='<div class="gm-hex '+cls+'"><div class="gm-hex-inner">'+conteudo+'</div>'+(n.status==='atual'?'<div class="gm-hex-tag">'+(getNome()||'Voce').split(' ')[0]+'</div>':'')+'</div>';
  });
  html+='</div>';
  return html;
}
function buildTrilha(){
  var t=TRILHA_ATUAL;
  return (
    '<div class="gm-trilha-head">'+
      '<div class="gm-trilha-title">Trilha: '+t.nome+'</div>'+
      '<div class="gm-trilha-sub">Nivel '+t.nivelAtual+' de '+t.totalEtapas+' · '+t.colegas+' colegas em progresso</div>'+
    '</div>'+
    '<div class="gm-trilha-layout">'+
      '<div class="gm-trilha-map">'+trilhaMapHTML(t)+'</div>'+
      '<div class="gm-trilha-side">'+
        '<div class="gm-mini-card">'+
          '<div class="gm-mini-lbl">'+t.nivelTitulo+'</div>'+
          '<div class="gm-mini-sub">'+t.nivelDesc+'</div>'+
        '</div>'+
        '<div class="gm-mini-card">'+
          '<div class="gm-mini-lbl" style="margin-bottom:8px">Missoes do nivel</div>'+
          t.nivelMissoes.map(function(m){
            return '<div class="gm-trilha-missao"><span>'+(m.feito?'✅':'⬜')+' '+m.nome+'</span><strong>+'+m.xp+' XP</strong></div>';
          }).join('')+
        '</div>'+
        '<div class="gm-mini-card">'+
          '<div class="gm-mini-lbl" style="margin-bottom:8px">Recompensa do nivel</div>'+
          '<div class="gm-trilha-recompensas">'+
            '<div class="gm-trilha-recomp-item">⭐ '+t.recompensaXP+' XP</div>'+
            '<div class="gm-trilha-recomp-item">🏅 '+t.recompensaBadge+'</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'
  );
}

/* ── CONQUISTAS ── */
function conqDetailHTML(b){
  if(!b)return '<div class="gm-empty">Selecione uma conquista</div>';
  var pct=b.unlocked?100:(b.progresso||0);
  var r=46, circ=2*Math.PI*r, offset=circ*(1-pct/100);
  return (
    (b.raro?'<div class="gm-conq-tag">Epica</div>':'')+
    '<div class="gm-conq-ring-wrap"><svg viewBox="0 0 110 110">'+
      '<circle class="gm-ring-track" cx="55" cy="55" r="'+r+'"/>'+
      '<circle class="gm-ring-fill" cx="55" cy="55" r="'+r+'" stroke="'+(b.unlocked?'#22c55e':'#8b5cf6')+'" stroke-dasharray="'+circ+'" stroke-dashoffset="'+offset+'" stroke-linecap="round"/>'+
    '</svg>'+
      '<div class="gm-conq-ring-inner"><div class="gm-conq-ring-ico">'+b.ico+'</div><div class="gm-conq-ring-pct">'+pct+'%</div></div>'+
    '</div>'+
    '<div class="gm-conq-nome">'+b.nome+'</div>'+
    '<div class="gm-conq-desc">'+(b.meta||b.desc)+'</div>'+
    '<div class="gm-conq-recompensa-lbl">'+(b.unlocked?'Status':'Recompensa')+'</div>'+
    '<div class="gm-conq-recompensa">'+(b.unlocked?'✓ Desbloqueada':'+50 XP')+'</div>'
  );
}
function buildConquistas(filtro){
  filtro=filtro||'todas';
  var unlocked=BADGES.filter(function(b){return b.unlocked;}).length;
  var list=BADGES.filter(function(b){
    if(filtro==='desbloqueadas')return b.unlocked;
    if(filtro==='bloqueadas')return !b.unlocked;
    if(filtro==='raras')return b.raro;
    return true;
  });
  var sel=list[0]||BADGES[0];
  return (
    '<div class="gm-conq-head"><div class="gm-conq-title">🏆 Conquistas</div><div class="gm-conq-sub">'+unlocked+' desbloqueadas · '+BADGES.length+' disponiveis</div></div>'+
    '<div class="gm-conq-filtros">'+
      ['todas','desbloqueadas','bloqueadas','raras'].map(function(f){
        var lbl=f==='todas'?'Todas':f==='desbloqueadas'?'Desbloqueadas':f==='bloqueadas'?'Bloqueadas':'Raras';
        return '<button class="gm-conq-filtro'+(f===filtro?' on':'')+'" onclick="gmConqFiltro(\''+f+'\')">'+lbl+'</button>';
      }).join('')+
    '</div>'+
    '<div class="gm-conq-layout">'+
      '<div class="gm-badges-grid" id="gm-conq-grid">'+
        (list.length?list.map(function(b){
          return '<div class="gm-badge '+(b.unlocked?'unlocked':'locked')+'" onclick="gmConqSelecionar(\''+b.id+'\')">'+
            '<div class="gm-badge-icon">'+b.ico+'</div>'+
            '<div class="gm-badge-name">'+b.nome+'</div>'+
          '</div>';
        }).join(''):'<div class="gm-empty">Nenhuma conquista neste filtro.</div>')+
      '</div>'+
      '<div class="gm-conq-detail" id="gm-conq-detail">'+conqDetailHTML(sel)+'</div>'+
    '</div>'
  );
}
window.gmConqFiltro=function(f){
  var p=document.getElementById('gm-panel-conquistas');if(!p)return;
  p.innerHTML=buildConquistas(f);
};
window.gmConqSelecionar=function(id){
  var b=BADGES.find(function(x){return x.id===id;});if(!b)return;
  var d=document.getElementById('gm-conq-detail');if(d)d.innerHTML=conqDetailHTML(b);
};

/* ── STREAK ── */
function buildStreak(dias){
  var info=STREAK_INFO;
  var faltam=Math.max(0,info.proximoMarcoDias-dias);
  var pctMarco=Math.min(100,Math.round((dias/info.proximoMarcoDias)*100));
  var dow=['SEG','TER','QUA','QUI','SEX','SAB','DOM'];
  var hojeIdx=(new Date().getDay()+6)%7;
  var cells='';
  for(var i=0;i<7;i++){
    var estado=i<hojeIdx?'feito':i===hojeIdx?'hoje':'futuro';
    if(estado==='feito'&&i===1)estado='perdido';
    cells+='<div class="gm-streak-cell gm-streak-'+estado+'">'+(estado==='feito'?'✓':estado==='hoje'?'●':'')+'</div>';
  }
  return (
    '<div class="gm-streak-layout">'+
      '<div class="gm-mini-card gm-streak-main">'+
        '<div class="gm-mini-lbl">Seu streak</div>'+
        '<div class="gm-streak-flame">🔥</div>'+
        '<div class="gm-streak-dias">'+dias+' dias</div>'+
        '<div class="gm-streak-recorde">Recorde pessoal: '+info.recorde+' dias</div>'+
        '<div class="gm-streak-week-lbl">Ultimos 7 dias</div>'+
        '<div class="gm-streak-week">'+dow.map(function(d){return '<div class="gm-streak-dow">'+d+'</div>';}).join('')+'</div>'+
        '<div class="gm-streak-week">'+cells+'</div>'+
        '<div class="gm-streak-legend"><span class="gm-leg gm-streak-feito"></span> Concluido &nbsp; <span class="gm-leg gm-streak-perdido"></span> Perdido &nbsp; <span class="gm-leg gm-streak-futuro"></span> Futuro</div>'+
      '</div>'+
      '<div class="gm-streak-side">'+
        '<div class="gm-mini-card">'+
          '<div class="gm-mini-lbl">Proximo marco</div>'+
          '<div class="gm-mini-title">Faltam '+faltam+' dias para '+info.proximoMarcoDias+' dias</div>'+
          '<div class="gm-prog-bar-wrap" style="margin:8px 0"><div class="gm-prog-bar-fill" style="width:'+pctMarco+'%;background:#f59e0b"></div></div>'+
          '<div class="gm-mini-foot">'+dias+' / '+info.proximoMarcoDias+' dias</div>'+
        '</div>'+
        '<div class="gm-mini-card">'+
          '<div class="gm-mini-lbl">Multiplicador atual</div>'+
          '<div class="gm-mini-title" style="font-size:26px">'+info.multiplicador+'x</div>'+
          '<div class="gm-mini-foot">XP por missao</div>'+
        '</div>'+
      '</div>'+
    '</div>'
  );
}

/* ── CARTEIRA ── */
function buildCarteira(){
  return (
    '<div class="gm-carteira-saldo">'+
      '<div class="gm-carteira-coin">⭐</div>'+
      '<div class="gm-carteira-saldo-info"><div class="gm-carteira-xp" id="gm-cart-xp">'+fmtN(S.xp)+' XP</div><div class="gm-carteira-lbl">disponiveis para resgate</div></div>'+
      '<button class="btn btn-p gm-carteira-btn" onclick="gmTab(\'loja\')">Ir para a loja</button>'+
    '</div>'+
    '<div class="gm-carteira-layout">'+
      '<div class="gm-mini-card">'+
        '<div class="gm-mini-lbl" style="margin-bottom:8px">Historico de transacoes</div>'+
        '<div id="gm-cart-hist"><div class="gm-loading">Carregando...</div></div>'+
      '</div>'+
      '<div class="gm-mini-card">'+
        '<div class="gm-mini-lbl" style="margin-bottom:8px">Top fontes de XP</div>'+
        ['Missoes','Trilhas','Conquistas','Streak'].map(function(f,i){
          var pct=[50,35,12,3][i];
          return '<div class="gm-fonte-row"><span>'+f+'</span><div class="gm-prog-bar-wrap" style="flex:1;margin:0 8px"><div class="gm-prog-bar-fill" style="width:'+pct+'%;background:#8b5cf6"></div></div><span>'+pct+'%</span></div>';
        }).join('')+
      '</div>'+
    '</div>'
  );
}

/* ── RANKING ── */
function iniciais(nome){
  return ((nome||'?')).replace(/\s+/g,' ').trim().split(' ').map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase()||'?';
}
function renderRank(rows){
  var p=document.getElementById('gm-panel-ranking');
  if(!p)return;
  var em=getEmail();
  if(!rows.length){p.innerHTML='<div class="gm-empty">Nenhum dado ainda. Complete missoes para aparecer aqui!</div>';return;}
  var minhaPos=-1;
  rows.forEach(function(r,i){if(r.email===em||r.id===em)minhaPos=i+1;});
  var top3=rows.slice(0,3);

  var podioHTML='';
  if(top3.length){
    var ordem=[1,0,2].filter(function(i){return top3[i];});
    podioHTML='<div class="gm-podio">'+ordem.map(function(i){
      var r=top3[i];
      var lv=getLv(r.xpTotal||0);
      return '<div class="gm-podio-item gm-podio-'+(i+1)+'">'+
        '<div class="gm-podio-avatar">'+iniciais(r.nome||r.id)+'</div>'+
        '<div class="gm-podio-medal">'+(i===0?'🥇':i===1?'🥈':'🥉')+'</div>'+
        '<div class="gm-podio-nome">'+(r.nome||r.id||'Colaborador')+'</div>'+
        '<div class="gm-podio-xp">'+fmtN(r.xpTotal||0)+' XP</div>'+
      '</div>';
    }).join('')+'</div>';
  }

  var filtros='<div class="gm-rank-filtros">'+
    '<div class="gm-rank-filtro-grp">'+
      ['Semanal','Mensal','Trimestral','Anual'].map(function(f,i){return '<button class="gm-rank-f'+(i===1?' on':'')+'">'+f+'</button>';}).join('')+
    '</div>'+
    '<div class="gm-rank-filtro-grp">'+
      ['Toda a empresa','Minha unidade'].map(function(f,i){return '<button class="gm-rank-f'+(i===0?' on':'')+'">'+f+'</button>';}).join('')+
    '</div>'+
  '</div>';

  var lista='<div class="gm-rank-list">'+rows.map(function(r,i){
    var isMe=(r.email===em||r.id===em);
    var lv=getLv(r.xpTotal||0);
    var medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':null;
    var cls='gm-rank-item'+(isMe?' gm-rank-me':i===0?' gm-rank-1':i===1?' gm-rank-2':i===2?' gm-rank-3':'');
    return '<div class="'+cls+'">'+
      '<div class="gm-rank-pos">'+(medal||('<span style="font-size:13px;color:#9ca3af">#'+(i+1)+'</span>'))+'</div>'+
      '<div class="gm-rank-avatar" style="background:'+lv.cor+'1a;color:'+lv.cor+'">'+iniciais(r.nome||r.id)+'</div>'+
      '<div class="gm-rank-info">'+
        '<div class="gm-rank-nome">'+(r.nome||r.id||'Colaborador')+(isMe?' <span class="gm-you-badge">voce</span>':'')+'</div>'+
        '<div class="gm-rank-lv">'+lv.nome+'</div>'+
      '</div>'+
      '<div class="gm-rank-xp">'+fmtXP(r.xpTotal||0)+' XP</div>'+
    '</div>';
  }).join('')+'</div>';

  p.innerHTML=filtros+
    '<div class="gm-rank-layout">'+
      '<div>'+podioHTML+lista+'</div>'+
      '<div class="gm-mini-card gm-rank-side">'+
        '<div class="gm-mini-lbl">Sua posicao:</div>'+
        '<div class="gm-rank-side-num">'+(minhaPos>0?(minhaPos+'º'):'--')+'</div>'+
      '</div>'+
    '</div>';
}

/* ── LOJA ── */
function renderLoja(items){
  var p=document.getElementById('gm-panel-loja');
  if(!p)return;
  S.lojaItems=items;
  p.innerHTML=
    '<div id="lj-banners"></div>'+
    '<div class="lj-header">'+
      '<div class="lj-wallet">'+
        '<div class="lj-wallet-star">⭐</div>'+
        '<div><div class="lj-wallet-xp" id="lj-xp">'+fmtN(S.xp)+' XP</div>'+
        '<div class="lj-wallet-lbl">seu saldo</div></div>'+
      '</div>'+
    '</div>'+
    '<div class="lj-cats">'+
      CATS.map(function(c){return '<button class="lj-cat'+(c.id===S.catAtual?' on':'')+'" onclick="lojaCat(\''+c.id+'\')">'+c.ico+' '+c.label+'</button>';}).join('')+
    '</div>'+
    buildLojaGrid(items)+
    '<div class="lj-section-label" style="margin-top:6px">Historico de resgates</div>'+
    '<div id="lj-hist"><div class="gm-loading">Carregando...</div></div>';

  loadHist(function(h){S.resgates=h;renderHist('lj-hist');});
  renderLjBanners();
}

function renderLjBanners(){
  var host=document.getElementById('lj-banners');if(!host)return;
  loadBanners(function(banners){
    host=document.getElementById('lj-banners');if(!host)return;
    var ativos=banners.filter(function(b){return b.ativo;});
    var topo=ativos.filter(function(b){return b.tipo!=='lateral';});
    var lateral=ativos.filter(function(b){return b.tipo==='lateral';});
    if(!topo.length&&!lateral.length){host.innerHTML='';return;}
    function cardHTML(b){
      var bg=b.imagemUrl?('background-image:linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url(\''+b.imagemUrl+'\');background-size:cover;background-position:center'):('background:'+(b.corFundo||'#6d28d9'));
      return '<div class="lj-banner-card" style="'+bg+'">'+
        '<div class="lj-banner-titulo">'+(b.titulo||'')+'</div>'+
        (b.subtitulo?'<div class="lj-banner-sub">'+b.subtitulo+'</div>':'')+
      '</div>';
    }
    host.innerHTML=
      (topo.length?'<div class="lj-banners-topo">'+topo.map(cardHTML).join('')+'</div>':'')+
      (lateral.length?'<div class="lj-banners-lateral">'+lateral.map(cardHTML).join('')+'</div>':'');
  });
}

function buildLojaGrid(items){
  var dest=items.filter(function(i){return i.destaque&&i.ativo;});
  var todos=items.filter(function(i){return i.ativo&&(S.catAtual==='todos'||i.categoria===S.catAtual);});
  var html='';
  if(dest.length&&S.catAtual==='todos'){
    html+='<div class="lj-section-label">Em destaque</div><div class="lj-grid">'+dest.map(function(i){return buildCard(i,true);}).join('')+'</div>';
  }
  html+='<div class="lj-section-label">Todos os itens</div><div class="lj-grid" id="lj-grid">'+todos.map(function(i){return buildCard(i,false);}).join('')+'</div>';
  return html;
}

function buildCard(item,feat){
  var pode=S.xp>=item.xpCusto;
  var pct=Math.min(100,Math.round((S.xp/item.xpCusto)*100));
  var jaRes=S.resgates.some(function(r){return r.itemId===item.id;});
  return '<div class="lj-card'+(feat?' lj-card-feat':'')+'">'+
    (item.imagemUrl?
      '<div class="lj-card-img" style="background-image:url(\''+item.imagemUrl+'\');background-size:cover;background-position:center">'+(feat?'<span class="lj-ribbon">destaque</span>':'')+'</div>':
      '<div class="lj-card-img lj-bg-'+(item.categoria||'outros')+'"><span class="lj-card-emoji">'+(item.emoji||'🎁')+'</span>'+(feat?'<span class="lj-ribbon">destaque</span>':'')+'</div>')+
    '<div class="lj-card-body">'+
      '<div class="lj-card-name">'+item.nome+'</div>'+
      '<div class="lj-card-desc">'+item.desc+'</div>'+
      '<div class="lj-card-foot">'+
        '<div class="lj-cost">⭐ '+fmtN(item.xpCusto)+'</div>'+
        (jaRes?'<button class="lj-btn lj-btn-done" disabled>Resgatado</button>':
         pode?'<button class="lj-btn lj-btn-ok" onclick="gmResgatar(\''+item.id+'\')">Resgatar</button>':
              '<button class="lj-btn lj-btn-soon" disabled>Quase la</button>')+
      '</div>'+
      (!pode&&!jaRes?
        '<div class="lj-progress-mini"><div class="lj-progress-fill" style="width:'+pct+'%"></div></div>'+
        '<div class="lj-hint">Faltam '+fmtN(item.xpCusto-S.xp)+' XP</div>':'')+
    '</div>'+
  '</div>';
}

function renderHist(elId){
  var el=document.getElementById(elId);
  if(!el)return;
  if(!S.resgates.length){el.innerHTML='<div class="gm-empty">Nenhum resgate ainda.</div>';return;}
  el.innerHTML='<div class="lj-hist-list">'+S.resgates.map(function(r){
    return '<div class="lj-hist-item">'+
      '<div class="lj-hist-icon">'+(r.itemEmoji||'🎁')+'</div>'+
      '<div class="lj-hist-info"><div class="lj-hist-nome">'+r.itemNome+'</div>'+
      '<div class="lj-hist-status">'+(r.status==='pendente'?'Aguardando RH':r.status==='aprovado'?'Aprovado':'Concluido')+'</div></div>'+
      '<div class="lj-hist-right"><div class="lj-hist-xp">-'+fmtN(r.xpGasto||0)+' XP</div>'+
      '<div class="lj-hist-data">'+fmtDate(r.data)+'</div></div>'+
    '</div>';
  }).join('')+'</div>';
}

/* ── ADMIN ── */
var ADMIN_SECOES=[['catalogo','📦 Catalogo'],['banners','🖼 Banners'],['fila','🤝 Fila de resgates']];
var S_ADMIN={secao:'catalogo', banners:[], resgatesTodos:[]};

function buildAdmin(){
  return '<div class="gm-miss-subtabs">'+
      ADMIN_SECOES.map(function(s){return '<button class="gm-miss-subtab'+(s[0]===S_ADMIN.secao?' on':'')+'" onclick="gmAdminSecao(\''+s[0]+'\')">'+s[1]+'</button>';}).join('')+
    '</div>'+
    '<div id="gm-admin-body" style="margin-top:14px"><div class="gm-loading">Carregando...</div></div>';
}
window.gmAdminSecao=function(s){
  S_ADMIN.secao=s;
  var p=document.getElementById('gm-panel-admin');if(!p)return;
  p.innerHTML=buildAdmin();
  renderAdminSecao();
};
function renderAdminSecao(){
  if(S_ADMIN.secao==='catalogo')renderCatalogoAdmin();
  else if(S_ADMIN.secao==='banners')renderBannersAdmin();
  else renderFilaAdmin();
}

/* ── CATALOGO ── */
function renderCatalogoAdmin(){
  var el=document.getElementById('gm-admin-body');if(!el)return;
  el.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
    '<strong style="font-size:14px;color:#fff">Gerenciar produtos</strong>'+
    '<button class="btn btn-p btn-sm" onclick="try{gmNovoItem()}catch(e){alert(\'Erro ao abrir: \'+e.message)}">+ Novo item</button>'+
  '</div><div id="gm-admin-lista"><div class="gm-loading">Carregando...</div></div>';
  seedLoja(function(items){
    var l=document.getElementById('gm-admin-lista');if(!l)return;
    if(!items.length){l.innerHTML='<div class="gm-empty">Nenhum item.</div>';return;}
    l.innerHTML='<div class="lj-hist-list">'+items.map(function(item){
      return '<div class="lj-hist-item">'+
        (item.imagemUrl?'<div class="lj-hist-icon" style="background-image:url(\''+item.imagemUrl+'\');background-size:cover;background-position:center;border-radius:8px;width:38px;height:38px"></div>':'<div class="lj-hist-icon">'+(item.emoji||'🎁')+'</div>')+
        '<div class="lj-hist-info"><div class="lj-hist-nome">'+item.nome+'</div>'+
        '<div class="lj-hist-status">⭐ '+fmtN(item.xpCusto)+' XP · 📦 '+fmtN(item.estoque!=null?item.estoque:'—')+' em estoque'+(item.destaque?' · Destaque':'')+(item.ativo?' · Ativo':' · Inativo')+'</div></div>'+
        '<div class="lj-hist-right" style="display:flex;gap:6px">'+
          '<button class="gm-miss-go" onclick="gmAjustarEstoque(\''+item.id+'\','+(item.estoque||0)+')">Estoque</button>'+
          '<button class="gm-miss-go" onclick="gmToggle(\''+item.id+'\','+(!item.ativo)+')">'+(item.ativo?'Desativar':'Ativar')+'</button>'+
        '</div>'+
      '</div>';
    }).join('')+'</div>';
  });
}
window.gmAjustarEstoque=function(id,atual){
  var novo=window.prompt('Novo estoque para este item:',atual);
  if(novo===null)return;
  var n=parseInt(novo);if(isNaN(n)||n<0)return;
  if(!window.db)return;
  db.collection(cLoja()).doc(id).update({estoque:n}).then(function(){S.lojaLoaded=false;renderCatalogoAdmin();});
};

/* ── BANNERS ── */
function cBanners(){return col('intra_loja_banners');}
function loadBanners(cb){
  if(!window.db){cb([]);return;}
  db.collection(cBanners()).orderBy('ordem','asc').get()
    .then(function(snap){var b=[];snap.forEach(function(d){b.push(Object.assign({id:d.id},d.data()));});cb(b);})
    .catch(function(){cb([]);});
}
function renderBannersAdmin(){
  var el=document.getElementById('gm-admin-body');if(!el)return;
  el.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
    '<strong style="font-size:14px;color:#fff">Banners da loja</strong>'+
    '<button class="btn btn-p btn-sm" onclick="gmNovoBanner()">+ Novo banner</button>'+
  '</div><div id="gm-banners-lista"><div class="gm-loading">Carregando...</div></div>';
  loadBanners(function(banners){
    S_ADMIN.banners=banners;
    var l=document.getElementById('gm-banners-lista');if(!l)return;
    if(!banners.length){l.innerHTML='<div class="gm-empty">Nenhum banner cadastrado.</div>';return;}
    l.innerHTML=banners.map(function(b){
      var bg=b.imagemUrl?('background-image:linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url(\''+b.imagemUrl+'\');background-size:cover;background-position:center'):('background:'+(b.corFundo||'#6d28d9'));
      return '<div class="gm-banner-card" style="'+bg+'">'+
        '<div class="gm-banner-tipo">'+(b.tipo==='lateral'?'Banner lateral':'Banner topo')+'</div>'+
        '<div class="gm-banner-titulo">'+(b.titulo||'')+'</div>'+
        '<div class="gm-banner-sub">'+(b.subtitulo||'')+'</div>'+
        '<div class="gm-banner-acoes">'+
          '<button class="gm-miss-go" onclick="gmToggleBanner(\''+b.id+'\','+(!b.ativo)+')">'+(b.ativo?'Desativar':'Ativar')+'</button>'+
          '<button class="gm-miss-go" onclick="gmExcluirBanner(\''+b.id+'\')">Excluir</button>'+
        '</div>'+
      '</div>';
    }).join('');
  });
}
window.gmToggleBanner=function(id,ativo){
  if(!window.db)return;
  db.collection(cBanners()).doc(id).update({ativo:ativo}).then(renderBannersAdmin);
};
window.gmExcluirBanner=function(id){
  if(!window.db||!window.confirm('Excluir este banner?'))return;
  db.collection(cBanners()).doc(id)['delete']().then(renderBannersAdmin);
};
window.gmNovoBanner=function(){
  var ov=document.getElementById('gm-overlay'),body=document.getElementById('gm-modal-body');
  if(!ov||!body)return;
  body.innerHTML=
    '<h3 class="gm-modal-title">Novo banner</h3>'+
    '<div class="gm-form-grid">'+
      '<div class="lfield"><label>Tipo</label><select id="nb-tipo"><option value="topo">Topo (carrossel)</option><option value="lateral">Lateral</option></select></div>'+
      '<div class="lfield"><label>Cor de fundo</label><input id="nb-cor" type="color" value="#6d28d9" style="width:70px;height:34px"/></div>'+
      '<div class="lfield" style="grid-column:1/-1"><label>Titulo</label><input id="nb-titulo" type="text" placeholder="Ex: Black Friday InCoins"/></div>'+
      '<div class="lfield" style="grid-column:1/-1"><label>Subtitulo / CTA</label><input id="nb-sub" type="text" placeholder="Ex: 2x pontos em todos os produtos"/></div>'+
      '<div class="lfield" style="grid-column:1/-1"><label>Imagem (opcional)</label><input id="nb-img" type="file" accept="image/*"/></div>'+
    '</div>'+
    '<div class="gm-msg" id="gm-msg"></div>'+
    '<div class="gm-modal-btns"><button class="gm-btn-cancel" onclick="gmFechar()">Cancelar</button><button class="gm-btn-confirm" id="nb-salvar-btn" onclick="gmSalvarBanner()">Salvar</button></div>';
  ov.style.display='flex';
};
window.gmSalvarBanner=function(){
  var tipo=(document.getElementById('nb-tipo')||{}).value||'topo';
  var cor=(document.getElementById('nb-cor')||{}).value||'#6d28d9';
  var titulo=(document.getElementById('nb-titulo')||{}).value||'';
  var sub=(document.getElementById('nb-sub')||{}).value||'';
  var fileInput=document.getElementById('nb-img');
  var msg=document.getElementById('gm-msg'),btn=document.getElementById('nb-salvar-btn');
  if(!titulo){if(msg){msg.textContent='Preencha o titulo.';msg.style.display='block';}return;}
  if(!window.db){if(msg){msg.textContent='Sem conexao.';msg.style.display='block';}return;}
  function gravar(imagemUrl){
    db.collection(cBanners()).add({tipo:tipo,corFundo:cor,titulo:titulo,subtitulo:sub,imagemUrl:imagemUrl||'',ordem:Date.now(),ativo:true,criadoEm:new Date().toISOString()})
      .then(function(){gmFechar();gmToast('Banner adicionado!');renderBannersAdmin();})
      .catch(function(){if(msg){msg.textContent='Erro ao salvar.';msg.style.display='block';}if(btn){btn.disabled=false;btn.textContent='Salvar';}});
  }
  if(fileInput&&fileInput.files&&fileInput.files[0]){
    if(btn){btn.disabled=true;btn.textContent='Enviando imagem...';}
    var reader=new FileReader();
    reader.onload=function(e){gravar(e.target.result);};
    reader.onerror=function(){if(msg){msg.textContent='Erro ao ler a imagem.';msg.style.display='block';}if(btn){btn.disabled=false;btn.textContent='Salvar';}};
    reader.readAsDataURL(fileInput.files[0]);
  }else{
    gravar('');
  }
};

/* ── FILA DE RESGATES ── */
function loadResgatesTodos(cb){
  if(!window.db){cb([]);return;}
  db.collection(cRes()).orderBy('data','desc').limit(100).get()
    .then(function(snap){var r=[];snap.forEach(function(d){r.push(Object.assign({id:d.id},d.data()));});cb(r);})
    .catch(function(){cb([]);});
}
var FILA_STATUS=[['pendente','Pendente'],['processando','Processando'],['pronto','Pronto'],['entregue','Entregue'],['cancelado','Cancelado']];
function renderFilaAdmin(){
  var el=document.getElementById('gm-admin-body');if(!el)return;
  el.innerHTML='<div id="gm-fila-counts" class="gm-stat-tiles" style="margin-bottom:14px"></div><div id="gm-fila-lista"><div class="gm-loading">Carregando...</div></div>';
  loadResgatesTodos(function(rows){
    S_ADMIN.resgatesTodos=rows;
    var counts=document.getElementById('gm-fila-counts');
    if(counts){
      counts.innerHTML=FILA_STATUS.map(function(s){
        var n=rows.filter(function(r){return (r.status||'pendente')===s[0];}).length;
        return '<div class="gm-stile"><div><div class="gm-stile-num">'+n+'</div><div class="gm-stile-lbl">'+s[1]+'</div></div></div>';
      }).join('');
    }
    var l=document.getElementById('gm-fila-lista');if(!l)return;
    if(!rows.length){l.innerHTML='<div class="gm-empty">Nenhuma solicitacao ainda.</div>';return;}
    l.innerHTML='<div class="lj-hist-list">'+rows.map(function(r){
      var st=r.status||'pendente';
      return '<div class="lj-hist-item">'+
        '<div class="lj-hist-icon">'+(r.itemEmoji||'🎁')+'</div>'+
        '<div class="lj-hist-info"><div class="lj-hist-nome">'+(r.itemNome||'Item')+'</div>'+
        '<div class="lj-hist-status">'+(r.nomeColab||r.emailColab||'Colaborador')+' · -'+fmtN(r.xpGasto||0)+' XP · '+fmtDate(r.data)+'</div></div>'+
        '<div class="lj-hist-right">'+
          '<select onchange="gmAtualizarStatus(\''+r.id+'\',this.value)" style="font-size:11px;border-radius:8px;border:1px solid #d1d5db;padding:4px 8px">'+
            FILA_STATUS.map(function(s){return '<option value="'+s[0]+'"'+(s[0]===st?' selected':'')+'>'+s[1]+'</option>';}).join('')+
          '</select>'+
        '</div>'+
      '</div>';
    }).join('')+'</div>';
  });
}
window.gmAtualizarStatus=function(id,status){
  if(!window.db)return;
  db.collection(cRes()).doc(id).update({status:status}).then(function(){gmToast('Status atualizado.');});
};

/* ── MODALS ── */
window.gmResgatar=function(itemId){
  var item=S.lojaItems.find(function(i){return i.id===itemId;});if(!item)return;
  var ov=document.getElementById('gm-overlay'),body=document.getElementById('gm-modal-body');
  if(!ov||!body)return;
  body.innerHTML=
    '<div class="gm-modal-emoji-wrap"><span class="gm-modal-emoji">'+(item.emoji||'🎁')+'</span></div>'+
    '<h3 class="gm-modal-title">Resgatar '+item.nome+'?</h3>'+
    '<p class="gm-modal-desc">'+item.desc+'</p>'+
    '<div class="gm-modal-pill">'+
      '<div class="gm-modal-pill-item"><div class="gm-modal-pill-num">⭐ '+fmtN(item.xpCusto)+'</div><div class="gm-modal-pill-lbl">Custo</div></div>'+
      '<div class="gm-modal-divider"></div>'+
      '<div class="gm-modal-pill-item"><div class="gm-modal-pill-num">'+fmtN(S.xp)+'</div><div class="gm-modal-pill-lbl">Seu saldo</div></div>'+
      '<div class="gm-modal-divider"></div>'+
      '<div class="gm-modal-pill-item"><div class="gm-modal-pill-num" style="color:#4338ca">'+fmtN(S.xp-item.xpCusto)+'</div><div class="gm-modal-pill-lbl">Saldo apos</div></div>'+
    '</div>'+
    '<div class="gm-msg" id="gm-msg"></div>'+
    '<div class="gm-modal-btns">'+
      '<button class="gm-btn-cancel" onclick="gmFechar()">Cancelar</button>'+
      '<button class="gm-btn-confirm" id="gm-conf" onclick="gmConf(\''+itemId+'\')">Confirmar resgate</button>'+
    '</div>';
  ov.style.display='flex';
};

window.gmConf=function(itemId){
  var item=S.lojaItems.find(function(i){return i.id===itemId;});if(!item)return;
  var btn=document.getElementById('gm-conf'),msg=document.getElementById('gm-msg');
  if(btn){btn.disabled=true;btn.textContent='Processando...';}
  resgatarItem(item,function(res){
    if(res.ok){
      gmFechar();
      var xpEl=document.getElementById('lj-xp'),hEl=document.getElementById('gm-xp-hero'),rEl=document.getElementById('gm-xp-ring'),cEl=document.getElementById('gm-xp-count');
      if(xpEl)xpEl.textContent=fmtN(S.xp)+' XP';
      if(hEl)hEl.textContent=fmtXP(S.xp);
      if(rEl)rEl.textContent=fmtN(S.xp);
      if(cEl)cEl.textContent=fmtN(S.xp)+' XP';
      loadHist(function(h){S.resgates=h;renderLoja(S.lojaItems);});
      gmToast('Resgate solicitado! O RH confirmara em breve. 🎉');
    }else{
      if(msg){msg.textContent=res.msg;msg.style.display='block';}
      if(btn){btn.disabled=false;btn.textContent='Confirmar resgate';}
    }
  });
};

window.gmFechar=function(){var ov=document.getElementById('gm-overlay');if(ov)ov.style.display='none';};

window.gmNovoItem=function(){
  var ov=document.getElementById('gm-overlay'),body=document.getElementById('gm-modal-body');
  if(!ov||!body)return;
  body.innerHTML=
    '<h3 class="gm-modal-title">Novo item da loja</h3>'+
    '<div class="gm-form-grid">'+
      '<div class="lfield"><label>Nome</label><input id="ni-nome" type="text" placeholder="Nome do item"/></div>'+
      '<div class="lfield"><label>Emoji</label><input id="ni-emoji" type="text" placeholder="🎁" maxlength="4" style="width:70px"/></div>'+
      '<div class="lfield" style="grid-column:1/-1"><label>Descricao</label><input id="ni-desc" type="text" placeholder="Descricao breve"/></div>'+
      '<div class="lfield"><label>Categoria</label><select id="ni-cat"><option value="descanso">Descanso</option><option value="desenvolvimento">Desenvolvimento</option><option value="beneficios">Beneficios</option><option value="reconhecimento">Reconhecimento</option><option value="alimentacao">Alimentacao</option></select></div>'+
      '<div class="lfield"><label>Custo XP</label><input id="ni-xp" type="number" placeholder="1000" min="100" step="100"/></div>'+
      '<div class="lfield"><label>Estoque</label><input id="ni-estoque" type="number" placeholder="50" min="0" step="1"/></div>'+
      '<div class="lfield" style="grid-column:1/-1"><label>Imagem (opcional)</label><input id="ni-img" type="file" accept="image/*"/></div>'+
      '<div class="lfield" style="grid-column:1/-1;flex-direction:row;align-items:center;gap:8px">'+
        '<input type="checkbox" id="ni-dest" style="width:16px;height:16px"/><label for="ni-dest" style="text-transform:none;font-size:13px;font-weight:400">Exibir em destaque</label>'+
      '</div>'+
    '</div>'+
    '<div class="gm-msg" id="gm-msg"></div>'+
    '<div class="gm-modal-btns"><button class="gm-btn-cancel" onclick="gmFechar()">Cancelar</button><button class="gm-btn-confirm" id="ni-salvar-btn" onclick="try{gmSalvar()}catch(e){alert(\'Erro ao salvar: \'+e.message)}">Salvar</button></div>';
  ov.style.display='flex';
};

window.gmSalvar=function(){
  var nome=(document.getElementById('ni-nome')||{}).value||'';
  var emoji=(document.getElementById('ni-emoji')||{}).value||'🎁';
  var desc=(document.getElementById('ni-desc')||{}).value||'';
  var cat=(document.getElementById('ni-cat')||{}).value||'beneficios';
  var xp=parseInt((document.getElementById('ni-xp')||{}).value||0);
  var dest=!!(document.getElementById('ni-dest')||{}).checked;
  var estoque=parseInt((document.getElementById('ni-estoque')||{}).value||50);
  var fileInput=document.getElementById('ni-img');
  var msg=document.getElementById('gm-msg'),btn=document.getElementById('ni-salvar-btn');
  if(!nome||!xp){if(msg){msg.textContent='Preencha nome e custo.';msg.style.display='block';}return;}
  if(!window.db){if(msg){msg.textContent='Sem conexao.';msg.style.display='block';}return;}
  function gravar(imagemUrl){
    db.collection(cLoja()).add({nome:nome,emoji:emoji,desc:desc,categoria:cat,xpCusto:xp,destaque:dest,estoque:estoque,imagemUrl:imagemUrl||'',ativo:true,criadoEm:new Date().toISOString()})
      .then(function(){gmFechar();S.lojaLoaded=false;gmToast('Item adicionado!');renderAdminSecao();})
      .catch(function(err){if(msg){msg.textContent='Erro: '+(err&&err.message||err);msg.style.display='block';}alert('Erro ao salvar item: '+(err&&err.message||err));if(btn){btn.disabled=false;btn.textContent='Salvar';}});
  }
  if(fileInput&&fileInput.files&&fileInput.files[0]){
    if(btn){btn.disabled=true;btn.textContent='Enviando imagem...';}
    var reader=new FileReader();
    reader.onload=function(e){gravar(e.target.result);};
    reader.onerror=function(){if(msg){msg.textContent='Erro ao ler a imagem.';msg.style.display='block';}if(btn){btn.disabled=false;btn.textContent='Salvar';}};
    reader.readAsDataURL(fileInput.files[0]);
  }else{
    gravar('');
  }
};

window.gmToggle=function(id,ativo){
  if(!window.db)return;
  db.collection(cLoja()).doc(id).update({ativo:ativo}).then(function(){S.lojaLoaded=false;renderAdminSecao();});
};

/* ── TABS ── */
window.gmTab=function(tab){
  document.querySelectorAll('.gm-tab').forEach(function(t){t.classList.remove('on');});
  var btn=document.querySelector('.gm-tab[onclick="gmTab(\''+tab+'\')"]');if(btn)btn.classList.add('on');
  document.querySelectorAll('.gm-panel').forEach(function(p){p.classList.remove('on');});
  var p=document.getElementById('gm-panel-'+tab);if(p)p.classList.add('on');

  if(tab==='loja'&&!S.lojaLoaded){S.lojaLoaded=true;seedLoja(function(it){renderLoja(it);});}
  if(tab==='ranking'&&!S.rankLoaded){S.rankLoaded=true;loadRanking(function(r){renderRank(r);});}
  if(tab==='admin'&&isRH()){S_ADMIN.secao='catalogo';renderAdminSecao();}
  if(tab==='carteira'){
    loadHist(function(h){
      S.resgates=h;
      var el=document.getElementById('gm-cart-hist');if(!el)return;
      if(!h.length){el.innerHTML='<div class="gm-empty">Nenhum resgate ainda.</div>';return;}
      el.innerHTML='<div class="lj-hist-list">'+h.map(function(r){
        return '<div class="lj-hist-item"><div class="lj-hist-icon">'+(r.itemEmoji||'🎁')+'</div>'+
          '<div class="lj-hist-info"><div class="lj-hist-nome">'+r.itemNome+'</div>'+
          '<div class="lj-hist-status">'+(r.status==='pendente'?'Aguardando RH':'Concluido')+'</div></div>'+
          '<div class="lj-hist-right"><div class="lj-hist-xp">-'+fmtN(r.xpGasto||0)+' XP</div>'+
          '<div class="lj-hist-data">'+fmtDate(r.data)+'</div></div></div>';
      }).join('')+'</div>';
    });
  }
};

window.lojaCat=function(cat){
  S.catAtual=cat;
  document.querySelectorAll('.lj-cat').forEach(function(c){c.classList.remove('on');});
  var btn=document.querySelector('.lj-cat[onclick="lojaCat(\''+cat+'\')"]');if(btn)btn.classList.add('on');
  var grid=document.getElementById('lj-grid');if(!grid)return;
  var filtered=S.lojaItems.filter(function(i){return i.ativo&&(cat==='todos'||i.categoria===cat);});
  grid.innerHTML=filtered.map(function(i){return buildCard(i,false);}).join('');
};

/* ── TOAST ── */
function gmToast(msg){
  var t=document.createElement('div');t.className='gm-toast';t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(function(){t.classList.add('gm-toast-show');},10);
  setTimeout(function(){t.classList.remove('gm-toast-show');setTimeout(function(){t.remove();},400);},3500);
}

/* ── INIT ── */
function init(force){
  var v=document.getElementById('view-gamificacao');
  if(!v)return;
  // Nunca re-renderiza com um modal aberto (ex.: "Novo item") — senao a
  // tela inteira e recriada por baixo do modal e ele fecha sem avisar,
  // antes do usuario conseguir clicar em Salvar.
  var overlay=v.querySelector('#gm-overlay');
  if(overlay&&window.getComputedStyle(overlay).display!=='none')return;
  // Re-renderiza tambem se a aba Admin estiver dessincronizada com isRH() —
  // a tela pode ter sido montada antes do papel (RH/colaborador) terminar
  // de sincronizar no carregamento da pagina, e nesse caso ficava presa
  // sem a aba Admin para sempre, mesmo apos o RH ficar corretamente logado.
  var temTabs=!!v.querySelector('.gm-tabs');
  var temAdminTab=!!v.querySelector('.gm-tab-rh');
  if(temTabs&&!force&&temAdminTab===isRH())return;
  loadXP(function(){renderGamView();});
}

var _orig=window.sbNav;
if(typeof _orig==='function'){
  window.sbNav=function(id){var r=_orig.apply(this,arguments);if(id==='gamificacao')setTimeout(function(){init(true);},120);return r;};
}
setInterval(function(){
  var v=document.getElementById('view-gamificacao');
  if(v&&window.getComputedStyle(v).display!=='none')init();
},900);
setTimeout(init,1000);
})();

