// ===== script: pcb-cards-js =====
(function(){
'use strict';
if(window.__pcbCardsInit) return;
window.__pcbCardsInit = true;

function esc(s){return String(s||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}

var BENEFICIOS = [
  {ico:'🍔', nome:'iFood Benefícios', pill:'Central do cartão',
   desc:'Vale alimentação/refeição: app, saldo, cartão virtual, cartão físico e calendário de recarga.',
   passos:['Baixe o app iFood Benefícios no celular.','Faça login com CPF e dados cadastrados.','Confira o cartão virtual para usar enquanto o físico não chega.','Acompanhe saldo, extrato e uso pelo aplicativo.'],
   servicos:['Consulta de saldo e extrato','Cartão virtual e físico','Pagamento em estabelecimentos habilitados','Recarga todo dia 30/31 ou último dia útil do mês'],
   dependentes:'Não se aplica como benefício de dependentes.',
   botoes:[['📲 Baixar Android','https://play.google.com/store/search?q=iFood%20Benef%C3%ADcios&c=apps'],['🍎 Baixar iPhone','https://apps.apple.com/br/app/ifood-benef%C3%ADcios/id1550867930'],['💳 Acessar iFood Benefícios','https://beneficios.ifood.com.br/']]},
  {ico:'🏋️', nome:'Wellhub', pill:'Saúde e academias',
   desc:'Plataforma de bem-estar com academias, estúdios, modalidades, apps parceiros e dependentes.',
   passos:['Acesse o app ou site Wellhub.','Faça o cadastro com seus dados corporativos.','Escolha o plano disponível.','Ative academias, apps e parceiros conforme o plano escolhido.'],
   servicos:['Academias e estúdios parceiros','Apps de treino e bem-estar','Até 3 dependentes','Dependentes podem ser familiares, amigos ou pessoas conhecidas'],
   dependentes:'Permite até 3 dependentes.',
   botoes:[['🌐 Acessar Wellhub','https://wellhub.com/pt-br/'],['📲 Android','https://play.google.com/store/search?q=wellhub&c=apps'],['🍎 iPhone','https://wellhub.com/pt-br/']]},
  {ico:'❤️', nome:'Starbem', pill:'Telemedicina',
   desc:'Consultas por videochamada com médico, psicólogo e nutricionista.',
   passos:['Acesse a plataforma Starbem.','Realize o cadastro conforme orientação do RH.','Escolha o tipo de atendimento disponível.','Agende ou inicie a consulta conforme disponibilidade.'],
   servicos:['1 consulta médica gratuita por mês','2 consultas gratuitas com psicólogos por mês','1 consulta gratuita com nutricionista por mês','Dependentes mediante solicitação ao RH'],
   dependentes:'Inclusão de dependentes mediante solicitação ao RH.',
   botoes:[['🌐 Acessar Starbem','https://www.starbem.app/'],['🎫 Solicitar inclusão de dependente','https://forms.gle/8m7s3qyMopPHKnq27']]},
  {ico:'🏥', nome:'Dasa | Colab+', pill:'Exames e saúde',
   desc:'Teleconsulta Nav, exames, vacinas, medicamentos com desconto e dependentes.',
   passos:['Acesse o portal NAV Dasa.','Entre com seus dados cadastrados.','Consulte serviços, rede e orientações.','Em caso de erro de acesso, acione o RH.'],
   servicos:['Teleconsulta Nav sem custo','Exames laboratoriais com desconto','Até 4 dependentes','Acesso pelo portal Nav/Dasa'],
   dependentes:'Permite até 4 dependentes.',
   botoes:[['🌐 Acessar Dasa NAV','https://nav.dasa.com.br/entrar'],['📲 Android','https://play.google.com/store/search?q=nav%20dasa&c=apps'],['🍎 iPhone','https://nav.dasa.com.br/entrar']]},
  {ico:'🧠', nome:'Optum', pill:'Apoio emocional',
   desc:'Apoio psicológico, social, jurídico e financeiro por atendimento telefônico.',
   passos:['Consulte os canais de atendimento divulgados pelo RH.','Informe que faz parte do benefício corporativo IMEX.','Escolha o tipo de orientação desejada.','Em caso de dúvida, peça apoio ao RH.'],
   servicos:['Atendimento regular de segunda a sexta','Emergência 24 horas, 7 dias por semana','Orientação jurídica preliminar','Consultoria financeira'],
   dependentes:'Permite até 2 dependentes.',
   botoes:[['🌐 Site Optum','https://www.optum.com.br/'],['📩 Falar com RH','mailto:rh@empresa.com?subject=D%C3%BAvida%20sobre%20Optum']]},
  {ico:'🩺', nome:'Unimed', pill:'Plano de saúde',
   desc:'Plano de saúde corporativo, guia médico, coparticipação, carências e dependentes.',
   passos:['Consulte a carteirinha e dados do plano.','Use o guia médico para localizar atendimento.','Acompanhe coparticipação quando houver.','Solicite orientação ao RH para inclusão de dependentes.'],
   servicos:['Plano nacional coparticipativo','Mensalidade do colaborador custeada pela empresa','Dependentes não custeados pela empresa','Carência de obstetrícia: 300 dias'],
   dependentes:'Dependentes podem ser incluídos conforme regra do plano e custo vigente.',
   botoes:[['🌐 Guia médico Unimed','https://www.unimed.coop.br/'],['📩 Falar com RH','mailto:rh@empresa.com?subject=D%C3%BAvida%20sobre%20Unimed']]}
];

function buildCard(b){
  return '<article class="pcb-item">'+
    '<button class="pcb-toggle" type="button" onclick="pcbToggle(this)">'+
      '<div class="pcb-icon">'+b.ico+'</div>'+
      '<div class="pcb-main"><h3>'+esc(b.nome)+'</h3><p>'+esc(b.desc)+'</p></div>'+
      '<div class="pcb-meta"><span class="pcb-pill">'+esc(b.pill)+'</span><span class="pcb-plus">+</span></div>'+
    '</button>'+
    '<div class="pcb-detail"><div class="pcb-detail-shell"><div class="pcb-grid">'+
      '<div class="pcb-info pcb-span-7"><h4>📲 Como usar</h4><ol>'+b.passos.map(function(p){return '<li>'+esc(p)+'</li>';}).join('')+'</ol></div>'+
      '<div class="pcb-info pcb-span-5 pcb-black"><h4>👨‍👩‍👧 Dependentes</h4><p>'+esc(b.dependentes)+'</p><div class="pcb-chips">'+b.servicos.slice(0,3).map(function(s){return '<span class="pcb-chip">'+esc(s)+'</span>';}).join('')+'</div></div>'+
      '<div class="pcb-info pcb-span-6"><h4>✅ O que está incluso</h4><ul>'+b.servicos.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ul></div>'+
      '<div class="pcb-info pcb-span-6"><h4>🔗 Acessos rápidos</h4><p>Use os botões abaixo para acessar plataforma, aplicativo ou acionar o RH.</p>'+
        '<div class="pcb-btn-row">'+b.botoes.map(function(bt,i){return '<a class="pcb-btn '+(i===0?'pcb-btn-blue':'pcb-btn-dark')+'" target="_blank" rel="noopener" href="'+esc(bt[1])+'">'+esc(bt[0])+'</a>';}).join('')+
        '<button class="pcb-btn pcb-btn-dark" type="button" onclick="window.benAbrirModalSeguroFinal&&window.benAbrirModalSeguroFinal()">📩 Solicitar ao RH</button></div>'+
        '<div class="pcb-notice"><strong>Importante:</strong> em caso de dificuldade de acesso, inclusão/exclusão de dependentes ou inconsistência, fale com o RH.</div>'+
      '</div>'+
    '</div></div></div>'+
  '</article>';
}

window.pcbToggle = function(btn){
  var item = btn.closest('.pcb-item');
  if(!item) return;
  item.classList.toggle('open');
};

function findGrid(v){
  return v.querySelector('.beneficios-colab-grid-final') || v.querySelector('.beneficios-grid');
}
function upgradeCards(){
  var v = document.getElementById('view-beneficios');
  if(!v) return;
  if(window.getComputedStyle(v).display === 'none') return;
  var grid = findGrid(v);
  if(!grid) return;
  if(grid.getAttribute('data-pcb-upgraded') === '1') return;
  grid.className = 'pcb-grid-wrap';
  grid.innerHTML = BENEFICIOS.map(buildCard).join('');
  grid.setAttribute('data-pcb-upgraded','1');
}

/* MutationObserver: aplica o upgrade no mesmo instante em que qualquer
   renderizador escreve o conteudo da view, antes do navegador pintar a
   tela (evita o flash dos cards antigos). */
var __pcbObserving = false;
function observeBeneficios(){
  var v = document.getElementById('view-beneficios');
  if(!v){ requestAnimationFrame(observeBeneficios); return; }
  if(!__pcbObserving){
    __pcbObserving = true;
    var mo = new MutationObserver(function(){ upgradeCards(); });
    mo.observe(v, {childList:true, subtree:true});
  }
  upgradeCards();
}
observeBeneficios();
// REMOVED: Performance optimization - 250ms setInterval polling (MutationObserver handles updates)
/*setInterval(function(){
  var v = document.getElementById('view-beneficios');
  if(v && window.getComputedStyle(v).display !== 'none') upgradeCards();
}, 250);*/
})();

// ===== script: pcb-click-fix-js =====
(function(){
'use strict';
if(window.__pcbClickFix) return;
window.__pcbClickFix = true;

var __pcbScrollY = null;
document.addEventListener('mousedown', function(ev){
  var t = ev.target;
  if(!t || !t.closest) return;
  if(!t.closest('#view-beneficios')) return;
  __pcbScrollY = window.scrollY;
}, true);
document.addEventListener('touchstart', function(ev){
  var t = ev.target;
  if(!t || !t.closest) return;
  if(!t.closest('#view-beneficios')) return;
  __pcbScrollY = window.scrollY;
}, true);

document.addEventListener('click', function(ev){
  var t = ev.target;
  if(!t || !t.closest) return;
  if(!t.closest('#view-beneficios')) return;
  var v = document.getElementById('view-beneficios');
  if(!v) return;
  var hidden = window.getComputedStyle(v).display === 'none' || !v.classList.contains('active');
  if(hidden){
    v.classList.add('active','beneficios-force-active');
    v.style.setProperty('display','block','important');
    v.style.setProperty('visibility','visible','important');
    v.style.setProperty('opacity','1','important');
    document.querySelectorAll('.sb-item[id^="sb-"]').forEach(function(sb){
      sb.classList.toggle('active', sb.id === 'sb-beneficios');
    });
  }
  if(__pcbScrollY !== null){
    var target = __pcbScrollY;
    window.scrollTo(0, target);
    requestAnimationFrame(function(){ window.scrollTo(0, target); });
    __pcbScrollY = null;
  }
}, false);
})();

// ===== script: pcb-forms-fix-js =====
(function(){
'use strict';
if(window.__pcbFormsLinkFix) return;
window.__pcbFormsLinkFix = true;

document.addEventListener('click', function(ev){
  var t = ev.target;
  if(!t || !t.closest) return;
  var link = t.closest('a[href*="forms.gle"]');
  if(!link) return;
  if(!link.closest('#view-beneficios')) return;
  ev.preventDefault();
  ev.stopPropagation();
  window.open(link.href, '_blank', 'noopener');
}, true);
})();


