// ===== script: patch-remuneracao-beneficios-helper-imex =====
(function(){
  if(window.__remBeneficiosHelperIMEX) return;
  window.__remBeneficiosHelperIMEX = true;
  function money(v){return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  window.remCalcCustosBeneficiosIMEX = function(){
    // Campos atualizados a pedido: Vale Alimentação / Plano de Saúde /
    // Plano Odontológico / Colab+ / Cartão Sindicato (antes tinha Vale
    // Refeição, Wellhub e Outros no lugar de Colab+/Sindicato).
    var ids=['va','saude','odonto','colabmais','sindicato'];
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
