(function(){
  'use strict';
  if(window.__GESTOR_HIBRIDO__)return;window.__GESTOR_HIBRIDO__=true;
  var defaults={salario:false,dadosColaboradores:false,organograma:false,relatorios:false,indicadores:false,reuniao1a1:true,metas:false,feriasVisualizar:'Somente de liderados diretos',feriasAprovar:'Somente de liderados diretos',solicitarFeriasEmNome:false,aprovacaoReembolsos:false,pdiEvolucaoCargo:false};
  var perms=Object.assign({},defaults),loaded=false,oldToggle=window.trocarPerfil,oldNav=window.sbNav;
  function norm(v){return String(v||'').toLowerCase().trim()}
  function profiles(){var u=window.currentUserData||{},p=Array.isArray(u.perfis)?u.perfis:[];if(!p.length){try{p=JSON.parse(sessionStorage.getItem('userPerfis')||'[]')}catch(e){p=[]}}return p.map(norm)}
  function manager(){var u=window.currentUserData||{};return profiles().includes('gestor')||norm(u.roleAcesso)==='gestor'||u.gestorAtivo===true||u.funcaoGestor===true}
  function rh(){return profiles().includes('rh')||norm((window.currentUserData||{}).role)==='rh'}
  function managerView(){return norm(window.role)==='gestor'||sessionStorage.getItem('imexManagerView')==='1'}
  function setGlobalRole(value){
    window.role=value;window._roleReal=value;window.currentUserRole=value;window.selectedRole=value;
    try{role=value}catch(e){}try{_roleReal=value}catch(e){}
    if(window.currentUserData)window.currentUserData.role=value;
    sessionStorage.setItem('userRole',value);sessionStorage.setItem('imexRoleReal',value);
    document.body.classList.remove('role-rh','role-gestor','role-colaborador');document.body.classList.add('role-'+value);
  }
  function can(key){return perms[key]===true||typeof perms[key]==='string'&&perms[key].length>0}
  window.gestorPode=function(key){return !manager()||can(key)};
  function allowedView(id){
    if(!managerView())return true;
    if(['organograma','trilhas','estrutura-carreira'].includes(id))return can('organograma');
    if(id==='pesquisas')return can('relatorios')||can('indicadores');
    if(id==='solicitacao')return can('feriasVisualizar')||can('feriasAprovar')||can('solicitarFeriasEmNome');
    if(id==='dashboard')return can('indicadores');
    return true;
  }
  function applyMenuPermissions(){
    if(!managerView())return;
    var map={estruturaCarreira:'organograma',estrutura:'organograma',pesquisas:'relatorios',dashboard:'indicadores'};
    [['estrutura-carreira',can('organograma')],['pesquisas',can('relatorios')||can('indicadores')],['solicitacao',can('feriasVisualizar')||can('feriasAprovar')||can('solicitarFeriasEmNome')],['dashboard',can('indicadores')]].forEach(function(x){var e=document.getElementById('sb-'+x[0]);if(e&&!x[1])e.style.setProperty('display','none','important')});
  }
  function labels(){
    var b=document.getElementById('btnTrocarPerfil'),l=document.getElementById('btnTrocarPerfilLabel'),pl=document.getElementById('pLabel'),pd=document.getElementById('pDot');
    if(!b)return;
    if(manager()&&!rh()){
      b.classList.add('manager-mode-switch');b.style.removeProperty('display');
      if(l)l.textContent=managerView()?'Minha área':'Gestão da equipe';
      if(pl)pl.textContent=managerView()?'Gestão da equipe':'Colaborador';
      if(pd)pd.textContent=managerView()?'👔':'👤';
    }
  }
  function switchMode(toManager){
    if(!manager()||rh())return;
    if(toManager){sessionStorage.setItem('imexManagerView','1');setGlobalRole('gestor')}else{sessionStorage.removeItem('imexManagerView');setGlobalRole('colaborador')}
    if(typeof window.buildSidebar==='function')window.buildSidebar();
    labels();setTimeout(applyMenuPermissions,30);
    var dest=toManager?'gestor':'intranet';if(typeof window.sbNav==='function')window.sbNav(dest);
  }
  window.trocarPerfil=function(){if(manager()&&!rh()){switchMode(!managerView());return}if(typeof oldToggle==='function')return oldToggle.apply(this,arguments)};
  function loadPermissions(){
    var database=window.db;try{if(!database&&typeof db!=='undefined')database=db}catch(e){}
    if(loaded||!database||typeof database.doc!=='function')return;loaded=true;
    try{database.doc('configuracoes/acessosPermissoes').get().then(function(s){var d=s&&s.exists?s.data():{};perms=Object.assign({},defaults,d&&d.gestor||{});window.gestorPermissoes=perms;applyMenuPermissions()}).catch(function(){loaded=false})}catch(e){loaded=false}
  }
  function normalizeLogin(){
    var grid=document.getElementById('loginRoleGrid'),g=grid&&grid.querySelector('[data-role="gestor"]'),c=grid&&grid.querySelector('[data-role="colaborador"]');if(g)g.remove();
    if(norm(sessionStorage.getItem('imexPreferredRole'))==='gestor')sessionStorage.setItem('imexPreferredRole','colaborador');
    if(norm(window.loginRole)==='gestor')window.loginRole='colaborador';
    if(c&&!grid.querySelector('.role-btn.selected'))c.classList.add('selected');
  }
  function explainAccess(){
    var pane=document.getElementById('ap-pane-acessos');if(pane&&!pane.querySelector('.manager-access-note'))pane.insertAdjacentHTML('afterbegin','<div class="manager-access-note"><span>👥</span><div><strong>Gestor é uma função adicional</strong><p>A pessoa continua entrando como colaborador. Quando o RH habilita a função Gestor no cadastro, ela recebe o botão “Gestão da equipe” e somente as permissões marcadas abaixo.</p></div></div>');
    var sel=document.getElementById('grh-c-role');if(sel){sel.classList.add('manager-role-select');var field=sel.closest('.field'),lab=field&&field.querySelector('label');if(lab)lab.textContent='Perfil principal / função adicional';var opt=sel.querySelector('option[value="gestor"]');if(opt)opt.textContent='👤👔 Colaborador + função Gestor'}
  }
  function sync(){
    normalizeLogin();explainAccess();
    if(!window.currentUserData)return;
    loadPermissions();
    if(manager()&&!rh()){
      if(sessionStorage.getItem('imexManagerView')==='1')setGlobalRole('gestor');else if(norm(window.role)==='gestor')setGlobalRole('colaborador');
      labels();setTimeout(applyMenuPermissions,20);
    }
  }
  window.sbNav=function(id){if(managerView()&&!allowedView(id)){alert('Este acesso não foi liberado pelo RH para a função Gestor.');return}var r=oldNav&&oldNav.apply(this,arguments);setTimeout(function(){labels();applyMenuPermissions()},20);return r};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
  var tries=0,timer=setInterval(function(){sync();if(++tries>40||window.currentUserData&&loaded)clearInterval(timer)},250);
})();
