// ===== script: patch-remuneracao-beneficios-helper-imex =====
(function(){
  if(window.__remBeneficiosHelperIMEX) return;
  window.__remBeneficiosHelperIMEX = true;
  function money(v){return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  window.remCalcCustosBeneficiosIMEX = function(){
    var ids=['va','vr','saude','odonto','wellhub','outros'];
    var total=0, dados={};
    ids.forEach(function(id){
      var el=document.getElementById('rem-beneficio-'+id);
      var val=Number((el&&el.value)||0);
      dados[id]=val; total+=val;
    });
    var totalEl=document.getElementById('rem-beneficios-total-imex');
    if(totalEl) totalEl.textContent=money(total);
    var hidden=document.getElementById('rem-beneficios-json-imex');
    if(hidden) hidden.value=JSON.stringify(dados);
  };
})();
