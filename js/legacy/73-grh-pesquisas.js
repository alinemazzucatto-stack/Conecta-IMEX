// ===== script: grh-pesquisas-js =====
(function(){
'use strict';
if(window.__GRH_PESQ_V1__) return;
window.__GRH_PESQ_V1__ = true;

var LS_MODELOS='_grh_pesq_modelos', LS_ATIVAS='_grh_pesq_ativas', LS_ENCERRADAS='_grh_pesq_enc';

var MODELOS_PADRAO=[
  {id:'clima-org',nome:'Clima Organizacional',categoria:'Clima',
   descricao:'Avalia a percepção sobre ambiente de trabalho, cultura e liderança.',
   perguntas:['Como você avalia o ambiente de trabalho?','Você se sente valorizado pela empresa?','A comunicação interna é clara e eficiente?','Seu gestor oferece feedbacks construtivos?','Você recomendaria esta empresa a um amigo?']},
  {id:'nps-colab',nome:'NPS do Colaborador',categoria:'Satisfação',
   descricao:'Mede lealdade e satisfação com base no Net Promoter Score.',
   perguntas:['Em uma escala de 0 a 10, quanto recomendaria esta empresa?','Qual o principal motivo da sua nota?','O que poderia melhorar sua satisfação?','Como avalia as oportunidades de crescimento?']},
  {id:'onboarding',nome:'Pesquisa de Onboarding',categoria:'Integração',
   descricao:'Coleta feedback de novos colaboradores nos primeiros 90 dias.',
   perguntas:['O processo de integração foi claro e bem estruturado?','Você recebeu suporte suficiente nos primeiros dias?','As expectativas sobre o cargo foram bem comunicadas?','Como avalia a recepção da equipe?','O que poderia ter sido melhor no seu processo de entrada?']},
  {id:'beneficios',nome:'Avaliação de Benefícios',categoria:'Benefícios',
   descricao:'Avalia a percepção e satisfação com os benefícios oferecidos.',
   perguntas:['Você conhece todos os benefícios disponíveis?','Os benefícios atendem suas necessidades?','Como avalia o plano de saúde?','O vale-refeição/alimentação é adequado?','Que benefício você gostaria que a empresa oferecesse?']},
  {id:'saude-mental',nome:'Saúde Mental e Bem-estar',categoria:'Bem-estar',
   descricao:'Avalia bem-estar emocional e equilíbrio entre vida pessoal e profissional.',
   perguntas:['Como você avalia seu equilíbrio vida/trabalho?','Você sente que tem carga de trabalho adequada?','A empresa oferece suporte para saúde mental?','Você se sente seguro para falar sobre dificuldades?','Como está seu nível de estresse no trabalho?']},
  {id:'feedback360',nome:'Feedback 360°',categoria:'Desempenho',
   descricao:'Avaliação multidirecional de competências e comportamentos.',
   perguntas:['O colaborador demonstra proatividade e iniciativa?','Como avalia a comunicação dele com a equipe?','Ele cumpre prazos com qualidade?','Como é seu relacionamento interpessoal?','Quais os principais pontos de desenvolvimento?']},
  {id:'exit-survey',nome:'Pesquisa de Desligamento',categoria:'Desligamento',
   descricao:'Coleta feedback de colaboradores em processo de desligamento.',
   perguntas:['Qual o principal motivo da saída?','Como avalia a liderança da empresa?','As oportunidades de crescimento foram adequadas?','Como foi seu relacionamento com a equipe?','O que a empresa poderia ter feito diferente?']},
  {id:'engajamento',nome:'Engajamento de Equipe',categoria:'Engajamento',
   descricao:'Mede engajamento, motivação e pertencimento dos colaboradores.',
   perguntas:['Você se sente motivado para trabalhar?','Entende como seu trabalho contribui para os objetivos?','Sua equipe é colaborativa?','Você tem autonomia para tomar decisões?','Se sente parte da cultura da empresa?']}
];

var CORES_CAT={Clima:'#0047FF',Satisfação:'#9613f7',Integração:'#22C58B',Benefícios:'#f59e0b','Bem-estar':'#ec4899',Desempenho:'#ef4444',Desligamento:'#6b7280',Engajamento:'#8b5cf6'};

function lsLer(k,def){ try{ return JSON.parse(localStorage.getItem(k))||def; }catch(e){ return def; } }
function lsGravar(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

function getModelos(){ return lsLer(LS_MODELOS, MODELOS_PADRAO); }
function getAtivas(){ return lsLer(LS_ATIVAS, []); }
function getEncerradas(){ return lsLer(LS_ENCERRADAS, []); }

// grhPesquisasPainelHTML definida em pesquisas-dashboard-override (fim do arquivo)

window.grhPesqIniciar = function(id){
  var m=getModelos().find(function(x){ return x.id===id; });
  if(!m) return;
  var ativas=getAtivas();
  ativas.push({id:Date.now()+'',nome:m.nome,modeloId:id,categoria:m.categoria,inicio:new Date().toISOString()});
  lsGravar(LS_ATIVAS, ativas);
  var pane=document.getElementById('grh-pane-pesquisas');
  if(pane){ pane.__pesqBuilt=false; pane.innerHTML=window.grhPesquisasPainelHTML(); }
};

window.grhPesqEncerrar = function(id){
  var ativas=getAtivas();
  var idx=ativas.findIndex(function(x){ return x.id===id; });
  if(idx<0) return;
  var p=ativas.splice(idx,1)[0];
  p.encerradaEm=new Date().toISOString();
  var enc=getEncerradas(); enc.push(p);
  lsGravar(LS_ATIVAS,ativas); lsGravar(LS_ENCERRADAS,enc);
  var pane=document.getElementById('grh-pane-pesquisas');
  if(pane){ pane.__pesqBuilt=false; pane.innerHTML=window.grhPesquisasPainelHTML(); }
};

window.grhPesqEditar = function(id){
  var m=getModelos().find(function(x){ return x.id===id; });
  if(!m) return;
  var modal=document.getElementById('grh-pesq-modal');
  if(!modal){ modal=document.createElement('div'); modal.id='grh-pesq-modal'; modal.style.cssText='position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;padding:20px'; document.body.appendChild(modal); }
  modal.innerHTML='<div style="background:#fff;border-radius:16px;max-width:640px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 32px 64px rgba(0,0,0,.25)">'
    +'<div style="background:#9613f7;border-radius:16px 16px 0 0;padding:18px 24px;display:flex;align-items:center;justify-content:space-between">'
    +'<h2 style="color:#fff;font-size:17px;margin:0">✏️ Editar Modelo de Pesquisa</h2>'
    +'<button onclick="document.getElementById(\'grh-pesq-modal\').style.display=\'none\'" style="background:rgba(255,255,255,.2);border:none;border-radius:50%;width:30px;height:30px;color:#fff;font-size:18px;cursor:pointer;line-height:1">×</button>'
    +'</div>'
    +'<div style="padding:22px;display:flex;flex-direction:column;gap:14px">'
    +'<div><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.06em;display:block;margin-bottom:5px">Nome do Modelo</label>'
    +'<input id="pesq-edit-nome" value="'+m.nome.replace(/"/g,'&quot;')+'" style="width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box"></div>'
    +'<div><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.06em;display:block;margin-bottom:5px">Categoria</label>'
    +'<input id="pesq-edit-cat" value="'+m.categoria.replace(/"/g,'&quot;')+'" style="width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box"></div>'
    +'<div><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.06em;display:block;margin-bottom:5px">Descrição</label>'
    +'<textarea id="pesq-edit-desc" rows="2" style="width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box">'+m.descricao+'</textarea></div>'
    +'<div><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.06em;display:block;margin-bottom:5px">Perguntas <span style="font-weight:400;text-transform:none">(uma por linha)</span></label>'
    +'<textarea id="pesq-edit-pergs" rows="8" style="width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;resize:vertical;box-sizing:border-box;line-height:1.6">'+m.perguntas.join('\n')+'</textarea></div>'
    +'<div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px">'
    +'<button onclick="document.getElementById(\'grh-pesq-modal\').style.display=\'none\'" style="padding:10px 22px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;font-size:13px">Cancelar</button>'
    +'<button onclick="window.grhPesqSalvar(\''+id+'\')" style="padding:10px 22px;background:#9613f7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px">💾 Salvar Alterações</button>'
    +'</div>'
    +'</div>'
    +'</div>';
  modal.style.display='flex';
};

window.grhPesqSalvar = function(id){
  var mods=getModelos();
  var idx=mods.findIndex(function(x){ return x.id===id; });
  if(idx<0) return;
  mods[idx].nome=(document.getElementById('pesq-edit-nome').value||'').trim()||mods[idx].nome;
  mods[idx].categoria=(document.getElementById('pesq-edit-cat').value||'').trim()||mods[idx].categoria;
  mods[idx].descricao=(document.getElementById('pesq-edit-desc').value||'').trim()||mods[idx].descricao;
  var raw=(document.getElementById('pesq-edit-pergs').value||'');
  mods[idx].perguntas=raw.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
  lsGravar(LS_MODELOS,mods);
  document.getElementById('grh-pesq-modal').style.display='none';
  var pane=document.getElementById('grh-pane-pesquisas');
  if(pane){ pane.__pesqBuilt=false; pane.innerHTML=window.grhPesquisasPainelHTML(); }
};

/* Renderiza o pane quando aberto e ainda sem conteúdo */
setInterval(function(){
  var pane=document.getElementById('grh-pane-pesquisas');
  if(!pane) return;
  var style=window.getComputedStyle(pane);
  if(style.display==='none') return;
  if(!pane.querySelector('[data-grh-pesq="2"]')){
    pane.innerHTML=window.grhPesquisasPainelHTML();
  }
},400);

})();
