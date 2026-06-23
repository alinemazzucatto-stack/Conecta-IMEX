// ===== script: copilot-rh-expansao-final =====
(function(){
  function nowMinus(days){ return new Date(Date.now()-days*86400000).toISOString(); }
  function postSeed(){
    return [
      {id:'seed-fixado-beneficios',tipo:'avisos',titulo:'Comunicado fixado do RH',descricao:'Este espaço pode ser usado para campanhas importantes, benefícios, políticas internas e avisos que precisam ficar no topo do feed.',autor:'RH IMEX',criadoEm:nowMinus(0),destaque:true,reacoes:{like:6,heart:3,clap:2,wow:0},comentarios:[]},
      {id:'seed-evento-aniversarios',tipo:'noticias',titulo:'🎂 Eventos automáticos da semana',descricao:'O sistema pode gerar automaticamente posts de aniversariantes, tempo de casa, novas vagas internas e lembretes de pesquisas pendentes.',autor:'Conecta AI',criadoEm:nowMinus(1),destaque:false,reacoes:{like:4,heart:5,clap:1,wow:0},comentarios:[]},
      {id:'seed-copilot-rh',tipo:'noticias',titulo:'🤖 Conecta AI Copilot RH',descricao:'Copiloto interno para apoiar RH, gestores e colaboradores com comunicados, descritivos, PDI, trilhas de carreira e dúvidas do dia a dia.',autor:'Conecta AI',criadoEm:nowMinus(2),destaque:true,reacoes:{like:8,heart:2,clap:4,wow:1},comentarios:[]}
    ];
  }
  function garantirFeedDemo(){
    if(Array.isArray(window.intraPublicacoes) && window.intraPublicacoes.length === 0){
      window.intraPublicacoes = postSeed();
      try{ window.intraRender && window.intraRender(); window.intraUpdateStats && window.intraUpdateStats(); }catch(e){}
    }
  }
  const oldCarregar = window.intraCarregar;
  window.intraCarregar = async function(){
    if(typeof oldCarregar === 'function') await oldCarregar.apply(this, arguments);
    garantirFeedDemo();
  };
  const oldRender = window.intraRender;
  window.intraRender = function(){
    if(Array.isArray(window.intraPublicacoes)){
      window.intraPublicacoes.sort((a,b)=>{
        const da = a.destaque ? 1 : 0, db = b.destaque ? 1 : 0;
        if(da !== db) return db-da;
        return new Date(b.criadoEm||0) - new Date(a.criadoEm||0);
      });
    }
    return oldRender ? oldRender.apply(this, arguments) : null;
  };
  document.addEventListener('DOMContentLoaded', ()=>setTimeout(garantirFeedDemo, 900));
})();
