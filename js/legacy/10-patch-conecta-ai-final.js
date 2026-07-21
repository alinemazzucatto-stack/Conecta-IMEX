// ===== script: patch-conecta-ai-final-js =====
(function(){
  // REMOVED: Consolidated in 000-core-functions.js
  // function isRH(){ return typeof role!=='undefined' && (role==='rh'||role==='rh-colaborador'); }
  // REMOVED: Consolidated in 000-core-functions.js
  // function isGestor(){ return typeof role!=='undefined' && role==='gestor'; }
  window.conectaAIAtualizarTemas=function(){
    const box=document.getElementById('ai-lateral-temas'); if(!box) return;
    let temas;
    if(isRH()){
      temas=[['📢 Comunicados','Gerar textos internos e campanhas.'],['📋 Descritivos','Criar descrições de cargos por função.'],['🧠 Talentos','Apoiar análise de PDI, performance e sucessão.'],['❤️ Clima','Sugerir ações para melhorar engajamento.']];
    }else if(isGestor()){
      temas=[['👥 Equipe','Orientações sobre acompanhamento do time.'],['🎯 PDI','Apoio para feedbacks e desenvolvimento.'],['🌴 Férias','Consulta de ausências e organização da equipe.']];
    }else{
      temas=[['🚀 Crescimento','Como crescer para o próximo cargo?'],['🧠 DISC','Explique meu resultado DISC.'],['🎯 PDI','Monte um PDI para mim.'],['🎓 Treinamentos','Sugira treinamentos para meu perfil.'],['✅ Competências','Quais competências preciso desenvolver?'],['🌴 Férias','Status, solicitação e próximos passos.'],['🏢 Organograma','Como é a estrutura da empresa?']];
    }
    box.innerHTML=temas.map(t=>'<div class="ri-item" onclick=\'document.getElementById(\"ai-lateral-pergunta\").value=\"'+t[1].replace(/[""]/g,"")+'"\' style="cursor:pointer"><b>'+t[0]+'</b><br><span class="ri-m">'+t[1]+'</span></div>').join('');
    // Quick prompts
    const qp=document.getElementById('ai-quick-prompts');
    if(qp){
      let perguntas;
      if(isRH()) perguntas=['Crie um comunicado interno','Descreva o cargo de Analista RH Pleno','Sugira ações de clima organizacional'];
      else if(isGestor()) perguntas=['Como dar um feedback eficaz?','Monte um PDI para um analista','Como organizar as férias da equipe?'];
      else perguntas=['Como crescer para o próximo cargo?','Explique meu DISC','Monte um PDI para mim','Sugira treinamentos para meu perfil','Quais competências preciso desenvolver?'];
      qp.innerHTML=perguntas.map(p=>'<button class="btn btn-g btn-sm" onclick=\'document.getElementById(\"ai-lateral-pergunta\").value=\"'+p+'\"\'style="font-size:11px;padding:5px 10px">'+p+'</button>').join('');
    }
  };
  window.conectaAIGerarLateral=function(){
    const q=(document.getElementById('ai-lateral-pergunta')?.value||'').trim();
    const box=document.getElementById('ai-lateral-resposta'); if(!box) return;
    if(!q){ alert('Digite uma pergunta para o Conecta AI.'); return; }
    if(!verificarKeyAntes()) return;
    box.textContent='⏳ Analisando sua pergunta...'; box.style.display='block';
    let perfil='colaborador';
    if(isRH()) perfil='profissional de RH';
    else if(isGestor()) perfil='gestor de equipes';
    const DISC_TEMAS=['disc','perfil','comportamento','dominância','influência','estabilidade','conformidade'];
    const isPerguntaDISC=DISC_TEMAS.some(t=>q.toLowerCase().includes(t));
    let discCtx='';
    if(isPerguntaDISC && window.__ultimoDiscResultado){
      const res=window.__ultimoDiscResultado;
      discCtx='\n\nResultado DISC do colaborador: Perfil '+res.perfil+' — Pontuações: D:'+((res.pcts||{}).D||0)+'%, I:'+((res.pcts||{}).I||0)+'%, S:'+((res.pcts||{}).S||0)+'%, C:'+((res.pcts||{}).C||0)+'%';
    }
    const sys='Você é o Conecta AI, assistente interno da IMEX. Responda de forma direta, objetiva e amigável para um '+perfil+'. Foque em orientações práticas sobre: carreira, DISC, PDI, benefícios, férias, treinamentos, competências, organograma e desenvolvimento profissional. Use emojis moderadamente. Limite a resposta a no máximo 300 palavras.'+discCtx;
    chamarAnthropicProxy({model:'claude-sonnet-4-20250514',max_tokens:600,system:sys,messages:[{role:'user',content:q}]})
    .then(d=>{
      const txt=(d.content||[]).map(c=>c.text||'').join('');
      box.textContent=txt||'Não foi possível gerar uma resposta.';
      box.style.display='block';
    }).catch(e=>{
      box.textContent='Erro ao conectar com a IA: '+e.message+'\n\nVerifique a configuração do proxy no servidor.';
    });
  };
  const oldSwitch=window.switchView;
  if(typeof oldSwitch==='function' && !window.__patchConectaSwitch){
    window.__patchConectaSwitch=true;
    window.switchView=function(v){
      const r=oldSwitch.apply(this,arguments);
      if(v==='conecta-ai') setTimeout(window.conectaAIAtualizarTemas,50);
      return r;
    };
  }
  const oldGrh=window.grhTab;
  if(typeof oldGrh==='function' && !window.__patchGrhTalentos){
    window.__patchGrhTalentos=true;
    window.grhTab=function(tab,btn){
      if(tab==='talentos'){
        document.querySelectorAll('[id^="grh-pane-"]').forEach(p=>p.style.display='none');
        const p=document.getElementById('grh-pane-talentos'); if(p) p.style.display='block';
        document.querySelectorAll('#grh-tabs .tab').forEach(b=>b.classList.remove('active')); if(btn) btn.classList.add('active');
        return;
      }
      return oldGrh.apply(this,arguments);
    };
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('#sb-talentos,#card-conecta-ai,#card-talentos,[data-intra-tab="clima-live"]').forEach(e=>e.remove());
    window.conectaAIAtualizarTemas();
  });
})();


