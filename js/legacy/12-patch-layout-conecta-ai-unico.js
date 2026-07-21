// ===== script: patch-layout-conecta-ai-unico =====
(function(){
  function removeDuplicados(){
    const views=[...document.querySelectorAll('#view-conecta-ai')];
    views.forEach((el,i)=>{ if(i>0) el.remove(); });
    document.querySelectorAll('#card-conecta-ai,#card-talentos,[data-intra-tab="conecta-ai"],[data-intra-tab="clima-live"],#sb-talentos').forEach(e=>e.remove());
  }
  // REMOVED: Consolidated in 000-core-functions.js
  // function isRH(){ return typeof role!=='undefined' && (role==='rh'||role==='rh-colaborador'); }
  // REMOVED: Consolidated in 000-core-functions.js
  // function isGestor(){ return typeof role!=='undefined' && role==='gestor'; }
  window.conectaAIAtualizarTemas=function(){
    const box=document.getElementById('ai-lateral-temas'); if(!box) return;
    let temas;
    if(isRH()) temas=[['📢 Comunicados','Gerar textos internos e campanhas.'],['📋 Descritivos','Criar descrições de cargos por função.'],['🧠 Gestão de RH','Apoio para PDI, talentos e sucessão.'],['❤️ Clima','Sugerir ações para melhorar engajamento.']];
    else if(isGestor()) temas=[['👥 Equipe','Acompanhamento e rotina do time.'],['🎯 PDI','Apoio para feedbacks e desenvolvimento.'],['🌴 Férias','Organização de ausências da equipe.']];
    else temas=[['🌴 Férias','Status, solicitação e próximos passos.'],['🚀 Carreira','Próximo cargo, trilhas e PDI.'],['📄 Documentos','Onde encontrar políticas e arquivos úteis.'],['📝 Pesquisas','Como responder pendências abertas.']];
    box.innerHTML=temas.map(t=>'<div class="ri-item"><b>'+t[0]+'</b><br><span class="ri-m">'+t[1]+'</span></div>').join('');
  };
  window.conectaAIGerarLateral=function(){
    const q=(document.getElementById('ai-lateral-pergunta')?.value||'').trim();
    const box=document.getElementById('ai-lateral-resposta'); if(!box) return;
    let txt='Orientação sugerida:\n\n';
    if(isRH()) txt+='Como RH, você pode usar o Conecta AI para criar comunicados, descritivos de cargos, apoiar PDI, analisar clima e estruturar ações de desenvolvimento.';
    else if(isGestor()) txt+='Como gestor, você pode usar o Conecta AI para organizar férias da equipe, preparar feedbacks, acompanhar PDI e entender pendências do time.';
    else txt+='Como colaborador, você pode consultar orientações sobre férias, documentos, pesquisas, trilhas de carreira, PDI e comunicados internos.';
    if(q) txt+='\n\nPergunta analisada: '+q;
    box.textContent=txt; box.style.display='block';
  };
  const css=document.createElement('style');
  css.textContent='.conecta-ai-layout{max-width:1180px;margin:0 auto}.page{width:100%}@media(max-width:1000px){.conecta-ai-layout{grid-template-columns:1fr!important}.hero{padding:28px!important}}';
  document.head.appendChild(css);
  const old=window.switchView;
  if(typeof old==='function' && !window.__conectaUnicoSwitch){
    window.__conectaUnicoSwitch=true;
    window.switchView=function(v){
      removeDuplicados();
      const r=old.apply(this,arguments);
      if(v==='conecta-ai') setTimeout(window.conectaAIAtualizarTemas,30);
      return r;
    };
  }
  function run(){ removeDuplicados(); window.conectaAIAtualizarTemas(); }
  document.addEventListener('DOMContentLoaded',run); setTimeout(run,200); setTimeout(run,1000);
})();


