// ===== script: move-kpi-top-colab =====
(function(){
function move(){
 const panel=document.getElementById('colabBottomPanelV1');
 const table=document.querySelector('#grh-pane-colaboradores .card, #grh-pane-colaboradores table')?.closest('.card') || document.querySelector('#grh-pane-colaboradores');
 if(panel && table && panel.parentNode){
   panel.style.marginBottom='18px';
   table.parentNode.insertBefore(panel, table);
 }
}
setInterval(move,1000);
})();
