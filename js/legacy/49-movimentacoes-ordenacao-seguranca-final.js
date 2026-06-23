// ===== script: movimentacoes-ordenacao-seguranca-final =====
(function(){
  'use strict';
  function norm(v){ return String(v || '').toLowerCase(); }
  function dateKey(txt){
    const s = String(txt || '');
    let m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if(m) return Number(m[3] + m[2] + m[1]);
    m = s.match(/(\d{2})\/(\d{4})/);
    if(m) return Number(m[2] + m[1] + '01');
    m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if(m) return Number(m[1] + m[2] + m[3]);
    return 0;
  }
  function brl(v){
    const n = parseFloat(String(v || '').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'));
    return isNaN(n) ? 0 : n;
  }
  function table(){
    return Array.from(document.querySelectorAll('table')).find(t => {
      const text = norm(t.innerText);
      return text.includes('colaborador') && text.includes('salário') && (text.includes('movimenta') || text.includes('tipo'));
    });
  }
  function tipoRow(tr){
    const t = norm(tr.innerText);
    if(t.includes('promo')) return 'promocao';
    if(t.includes('substit')) return 'substituicao';
    if(t.includes('transfer') || t.includes('mudança') || t.includes('mudanca') || t.includes('interna')) return 'interna';
    return 'outro';
  }
  function impacto(tr){
    const nums = Array.from(tr.children).map(td => brl(td.innerText)).filter(Boolean);
    if(nums.length >= 2) return Math.abs(nums[nums.length-1] - nums[nums.length-2]);
    return 0;
  }
  function ordenar(){
    const sel = document.getElementById('mov-filtro-ordem');
    const tb = table()?.querySelector('tbody');
    if(!sel || !tb) return;
    const ordem = sel.value || 'recente';
    const rows = Array.from(tb.querySelectorAll('tr'));
    rows.sort((a,b)=>{
      if(ordem === 'antiga') return dateKey(a.innerText)-dateKey(b.innerText);
      if(ordem === 'maior-impacto') return impacto(b)-impacto(a);
      if(ordem === 'menor-impacto') return impacto(a)-impacto(b);
      if(ordem === 'promocoes') return (tipoRow(a)==='promocao'?0:1)-(tipoRow(b)==='promocao'?0:1) || dateKey(b.innerText)-dateKey(a.innerText);
      if(ordem === 'substituicoes') return (tipoRow(a)==='substituicao'?0:1)-(tipoRow(b)==='substituicao'?0:1) || dateKey(b.innerText)-dateKey(a.innerText);
      if(ordem === 'internas') return (tipoRow(a)==='interna'?0:1)-(tipoRow(b)==='interna'?0:1) || dateKey(b.innerText)-dateKey(a.innerText);
      return dateKey(b.innerText)-dateKey(a.innerText);
    });
    rows.forEach(r => tb.appendChild(r));
  }
  document.addEventListener('change', e => {
    if(e.target && e.target.id === 'mov-filtro-ordem') ordenar();
  }, true);
  const old = window.grhRenderMovimentacoes;
  if(typeof old === 'function' && !old.__ordemMovFinal){
    window.grhRenderMovimentacoes = function(){
      const ret = old.apply(this, arguments);
      setTimeout(ordenar, 80);
      return ret;
    };
    window.grhRenderMovimentacoes.__ordemMovFinal = true;
  }
})();
