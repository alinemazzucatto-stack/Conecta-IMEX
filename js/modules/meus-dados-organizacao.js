/* Perfil do colaborador · organização da tela Meus Dados */
(function(){
  'use strict';
  if(window.__meusDadosOrganizacao) return;
  window.__meusDadosOrganizacao=true;

  function campo(id){ var el=document.getElementById(id); return el&&el.closest('.field'); }

  window.mdAbrirAba=function(nome,botao){
    var view=document.getElementById('view-meus-dados'); if(!view) return;
    view.querySelectorAll('.md-aba').forEach(function(b){b.classList.toggle('ativa',b===botao||b.dataset.mdAba===nome);});
    view.querySelectorAll('.md-painel').forEach(function(p){p.classList.toggle('ativo',p.dataset.mdPainel===nome);});
  };

  window.mdIrParaEdicao=function(){
    var card=document.querySelector('#view-meus-dados .md-cartao-edicao');
    if(card) card.scrollIntoView({behavior:'smooth',block:'start'});
  };

  function cabecalho(view,body){
    var existente=view.querySelector('.md-cabecalho-compacto');
    if(existente) return;
    var head=document.createElement('section');
    head.className='md-cabecalho-compacto';
    head.innerHTML='<div><small>PERFIL DO COLABORADOR</small><h1>Meus Dados</h1><p>Consulte seu cadastro e mantenha suas informações pessoais atualizadas.</p></div><button type="button" onclick="mdIrParaEdicao()">✏️ Atualizar dados</button>';
    view.insertBefore(head,body||view.firstChild);
  }

  function mover(ids,painel){
    ids.forEach(function(id){var el=campo(id);if(el)painel.appendChild(el);});
  }

  function organizarFormulario(view){
    var telefone=document.getElementById('md-telefone');
    if(!telefone) return;
    var body=document.getElementById('meusdados-body');
    cabecalho(view,body);
    var cards=body?body.querySelectorAll(':scope > .card'):[];
    if(cards[0]) cards[0].classList.add('md-cartao-perfil');
    if(cards[1]) cards[1].classList.add('md-cartao-cadastro');
    var edit=cards[2]; if(!edit||edit.dataset.mdOrganizado==='1') return;
    edit.dataset.mdOrganizado='1'; edit.classList.add('md-cartao-edicao');
    var cardBody=edit.querySelector('.card-body'); if(!cardBody) return;
    var abas=document.createElement('div'); abas.className='md-abas';
    abas.innerHTML='<button type="button" class="md-aba ativa" data-md-aba="contato" onclick="mdAbrirAba(\'contato\',this)">📱 Contato</button><button type="button" class="md-aba" data-md-aba="pessoal" onclick="mdAbrirAba(\'pessoal\',this)">🪪 Documentos e emergência</button><button type="button" class="md-aba" data-md-aba="banco" onclick="mdAbrirAba(\'banco\',this)">🏦 Dados bancários</button>';
    var contato=document.createElement('section');contato.className='md-painel ativo';contato.dataset.mdPainel='contato';
    contato.innerHTML='<div class="md-painel-aviso">Use um telefone e e-mail pessoal atualizados para que o RH consiga entrar em contato quando necessário.</div>';
    var pessoal=document.createElement('section');pessoal.className='md-painel';pessoal.dataset.mdPainel='pessoal';
    pessoal.innerHTML='<div class="md-painel-aviso">Seus documentos e o contato de emergência ficam visíveis somente para os perfis autorizados.</div>';
    var banco=document.createElement('section');banco.className='md-painel';banco.dataset.mdPainel='banco';
    banco.innerHTML='<div class="md-painel-aviso">Confira os dados bancários com atenção antes de salvar qualquer alteração.</div>';
    mover(['md-telefone','md-email-pessoal'],contato);
    mover(['md-rg','md-estadocivil','md-emerg-nome','md-emerg-tel'],pessoal);
    mover(['md-banco','md-agencia','md-conta','md-tipoconta'],banco);
    cardBody.querySelectorAll('.fg').forEach(function(grid){if(!grid.querySelector('input,select'))grid.remove();});
    var acao=cardBody.querySelector('#md-salvar-btn');
    var acaoWrap=acao&&acao.parentElement;if(acaoWrap)acaoWrap.classList.add('md-acoes-edicao');
    cardBody.insertBefore(abas,cardBody.firstChild);
    cardBody.insertBefore(contato,acaoWrap||null);
    cardBody.insertBefore(pessoal,acaoWrap||null);
    cardBody.insertBefore(banco,acaoWrap||null);
  }

  function organizar(){
    var view=document.getElementById('view-meus-dados');if(!view)return;
    view.classList.add('md-organizado');
    var body=document.getElementById('meusdados-body');if(body)cabecalho(view,body);
    organizarFormulario(view);
  }

  function iniciar(){
    organizar();
    var view=document.getElementById('view-meus-dados');
    if(view&&!view.__mdObserver){
      view.__mdObserver=new MutationObserver(function(){requestAnimationFrame(organizar);});
      view.__mdObserver.observe(view,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
  setTimeout(iniciar,400);setTimeout(iniciar,1200);
})();
