// ===== script: patch-somente-sem-plantinha-js =====
(function(){
  function removerPlantinha(){
    ['sb-desenvolvimento-talentos','sb-desenvolvimento'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.remove();
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{removerPlantinha();setTimeout(removerPlantinha,500);setTimeout(removerPlantinha,1500);});
  window.addEventListener('load',removerPlantinha);
})();


