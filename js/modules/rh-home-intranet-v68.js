(function(){
'use strict';
if(window.__RH_HOME_INTRANET_V68__)return;window.__RH_HOME_INTRANET_V68__=true;
var automaticUntil=0,oldBuild=window.buildSidebar,oldNav=window.sbNav;
function norm(v){return String(v||'').toLowerCase().trim()}
function isRh(){var u=window.currentUserData||{},p=Array.isArray(u.perfis)?u.perfis:[];if(!p.length){try{p=JSON.parse(sessionStorage.getItem('userPerfis')||'[]')}catch(e){p=[]}}return p.map(norm).includes('rh')||norm(window.role)==='rh'||norm(u.role)==='rh'}
function addHome(){
  if(!isRh())return;
  var side=document.getElementById('sidebar');if(!side)return;
  var item=document.getElementById('sb-intranet');
  if(!item){item=document.createElement('div');item.className='sb-item rh-home-item';item.id='sb-intranet';item.title='Intranet';item.setAttribute('aria-label','Intranet');item.innerHTML='<span>⌂</span><span class="sb-tip">Intranet</span>';item.onclick=function(e){if(e)e.preventDefault();window.sbNav('intranet')};var logo=side.querySelector('.sb-logo');if(logo&&logo.nextSibling)side.insertBefore(item,logo.nextSibling);else side.insertBefore(item,side.firstChild)}
  item.style.removeProperty('display');
}
window.sbNav=function(id){var target=norm(id);if(isRh()&&target==='gestao-rh'&&Date.now()<automaticUntil)target='intranet';var result=oldNav&&oldNav.call(this,target);setTimeout(addHome,0);return result};
window.buildSidebar=function(){if(isRh())automaticUntil=Date.now()+1100;var result=oldBuild&&oldBuild.apply(this,arguments);addHome();if(isRh())setTimeout(function(){addHome();window.sbNav('intranet')},650);return result};
function observe(){var side=document.getElementById('sidebar');if(!side||side.__rhHomeObserver)return;side.__rhHomeObserver=new MutationObserver(function(){setTimeout(addHome,0)});side.__rhHomeObserver.observe(side,{childList:true})}
function initial(){if(!isRh())return;automaticUntil=Date.now()+1100;observe();addHome();setTimeout(function(){addHome();window.sbNav('intranet')},700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initial);else initial();
var tries=0,timer=setInterval(function(){if(window.currentUserData&&isRh()){initial();clearInterval(timer)}else if(++tries>40)clearInterval(timer)},250);
})();
