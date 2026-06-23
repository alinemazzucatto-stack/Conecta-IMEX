// ===== script: patch-remuneracao-pj-colabs =====
(function(){
  function money(v){
    if (typeof grhBRL === 'function') return grhBRL(v);
    return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  }
  function num(v){
    if (typeof v === 'number') return v;
    const s = String(v ?? '').replace(/R\$\s*/g,'').trim().replace(/\.(?=\d{3}(\D|$))/g,'').replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  function norm(txt){ return String(txt || '').trim().toLowerCase(); }
  function contratoColab(c){
    const raw = String(c.contrato || c.tipoContrato || c.clt || '').trim().toUpperCase();
    if (raw === 'NÃO' || raw === 'NAO' || raw === 'PJ' || raw.includes('PJ')) return 'PJ';
    if (raw === 'SIM' || raw === 'CLT' || raw.includes('CLT')) return 'CLT';
    return 'CLT';
  }
  function mesAtual(){ return new Date().toISOString().slice(0,7); }

  window.grhRenderRemuneracao = async function grhRenderRemuneracao(){
    const tbody = document.getElementById('grh-rem-body');
    if (!tbody) return;
    try {
      const rem = await grhGetRem();
      const colabs = await grhGetColabs().catch(() => []);
      const colabPorNome = new Map((colabs || []).map(c => [norm(c.nome), c]));
      const nomesComRem = new Set((rem || []).map(r => norm(r.nome)).filter(Boolean));

      // 1) Registros já cadastrados na aba Remuneração
      const registrosRem = (rem || []).map(r => {
        const colab = colabPorNome.get(norm(r.nome)) || {};
        const contrato = String(r.contrato || contratoColab(colab)).toUpperCase();
        const salario = num(r.salario || colab.salario);
        const va = num(r.va || colab.va || colab.vr);
        const saude = num(r.saude || colab.saude || colab.planoSaude);
        const odonto = num(r.odonto || colab.odonto);
        const outros = num(r.outros || colab.outros);
        return {
          ...r,
          contrato,
          salario,
          va,
          saude,
          odonto,
          outros,
          custoTotal: num(r.custoTotal) || (salario + va + saude + odonto + outros),
          competencia: (r.competencia || r.mesReferencia || '').slice(0,7),
          origem: 'rem'
        };
      });

      // 2) PJs que existem na base de colaboradores, mas ainda não tinham lançamento em Remuneração
      // Assim eles entram automaticamente na aba e nos cards, sem precisar cadastrar um por um.
      const pjsSemRem = (colabs || [])
        .filter(c => contratoColab(c) === 'PJ')
        .filter(c => norm(c.nome) && !nomesComRem.has(norm(c.nome)))
        .map(c => {
          const salario = num(c.salario || c.valorContrato || c.remuneracao || c.valorMensal);
          const va = num(c.va || c.vr);
          const saude = num(c.saude || c.planoSaude);
          const odonto = num(c.odonto);
          const outros = num(c.outros);
          return {
            _id: 'auto-pj-' + (c._id || norm(c.nome).replace(/\W+/g,'-')),
            nome: c.nome,
            contrato: 'PJ',
            competencia: c.competencia || c.mesReferencia || c.admissao?.slice?.(0,7) || '',
            salario,
            va,
            saude,
            odonto,
            outros,
            custoTotal: salario + va + saude + odonto + outros,
            origem: 'colab_auto'
          };
        });

      const all = [...registrosRem, ...pjsSemRem].sort((a,b)=>(a.nome||'').localeCompare(b.nome||''));
      const q = (document.getElementById('grh-rem-search')?.value || '').toLowerCase();
      const mesFiltro = document.getElementById('grh-rem-mes')?.value || '';

      function compParaFiltro(r){
        // Registro manual respeita competência. PJ automático sem competência entra no mês selecionado/atual para não sumir da folha.
        return (r.competencia || (r.origem === 'colab_auto' ? (mesFiltro || mesAtual()) : '')).slice(0,7);
      }

      const dados = all.filter(r => {
        const nomeOk = !q || (r.nome || '').toLowerCase().includes(q);
        const mesOk = !mesFiltro || compParaFiltro(r) === mesFiltro;
        return nomeOk && mesOk;
      });

      const baseTotais = mesFiltro ? all.filter(r => compParaFiltro(r) === mesFiltro) : all;
      const clts = baseTotais.filter(r => r.contrato === 'CLT');
      const pjs  = baseTotais.filter(r => r.contrato === 'PJ');
      const totalFolha = baseTotais.reduce((s,r)=>s+num(r.salario),0);
      const totalCusto = baseTotais.reduce((s,r)=>s+num(r.custoTotal),0);
      const mediaCLT = clts.length ? clts.reduce((s,r)=>s+num(r.salario),0)/clts.length : 0;
      const mediaPJ = pjs.length ? pjs.reduce((s,r)=>s+num(r.salario),0)/pjs.length : 0;
      const totalVa = baseTotais.reduce((s,r)=>s+num(r.va),0);

      const setTxt = (id, val) => { const e=document.getElementById(id); if(e) e.textContent=money(val); };
      setTxt('grh-rem-total', totalFolha);
      setTxt('grh-rem-custo', totalCusto);
      setTxt('grh-rem-media', mediaCLT);
      setTxt('grh-rem-media-pj', mediaPJ);
      setTxt('grh-rem-va', totalVa);
      const eAt=document.getElementById('grh-rem-ativos'); if(eAt) eAt.textContent=baseTotais.length;
      (function(){
        const tot=baseTotais.length||1;
        const pctC=Math.round(clts.length/tot*100), pctP=100-pctC;
        const g=id=>document.getElementById(id);
        if(g('grh-rem-dist-clt-bar'))   g('grh-rem-dist-clt-bar').style.width   = pctC+'%';
        if(g('grh-rem-dist-pj-bar'))    g('grh-rem-dist-pj-bar').style.width    = pctP+'%';
        if(g('grh-rem-dist-clt-label')) g('grh-rem-dist-clt-label').textContent = 'CLT: '+clts.length+' ('+pctC+'%)';
        if(g('grh-rem-dist-pj-label'))  g('grh-rem-dist-pj-label').textContent  = 'PJ: '+pjs.length+' ('+pctP+'%)';
      })();

      if (!dados.length) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum resultado.</td></tr>`;
        return;
      }

      tbody.innerHTML = dados.map(r => {
        const isPJAuto = r.origem === 'colab_auto';
        const badge = r.contrato === 'CLT'
          ? `<span style="background:#dcfce7;color:#166534;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:700">CLT</span>`
          : `<span style="background:#e0f2fe;color:#075985;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:700">PJ</span>`;
        const comp = compParaFiltro(r);
        const compTxt = comp ? comp.split('-').reverse().join('/') : '—';
        const avisoAuto = isPJAuto ? `<div style="font-size:10px;color:#075985;margin-top:3px">Auto da base de colaboradores</div>` : '';
        const acao = isPJAuto
          ? `<button onclick="grhAbrirModalRemuneracao(null);setTimeout(()=>{document.getElementById('grh-r-nome').value='${String(r.nome||'').replace(/'/g,"\\'")}';document.getElementById('grh-r-contrato').value='PJ';document.getElementById('grh-r-salario').value='${num(r.salario)}';document.getElementById('grh-r-competencia').value='${comp || mesAtual()}';},50)" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">➕ Lançar</button>`
          : `<button onclick="grhAbrirModalRemuneracao('${r._id}')" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px;margin-right:4px">✏️</button><button onclick="grhExcluirRem('${r._id}','${String(r.nome||'').replace(/'/g,"\\'")}')" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button>`;
        return `<tr>
          <td style="padding-left:20px;font-weight:600">${r.nome || '—'}${avisoAuto}</td>
          <td>${badge}</td>
          <td>${compTxt}</td>
          <td style="font-weight:700;color:var(--pur-vibrant)">${money(r.salario)}</td>
          <td>${money(r.va)}</td>
          <td>${r.saude ? money(r.saude) : '—'}</td>
          <td>${r.odonto ? money(r.odonto) : '—'}</td>
          <td>${r.outros ? money(r.outros) : '—'}</td>
          <td style="font-weight:700">${money(r.custoTotal)}</td>
          <td style="white-space:nowrap">${acao}</td>
        </tr>`;
      }).join('');
    } catch(e) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--rust)">Erro: ${e.message}</td></tr>`;
    }
  };

  document.addEventListener('change', function(ev){
    if (ev.target && ev.target.id === 'grh-rem-mes' && typeof window.grhRenderRemuneracao === 'function') {
      window.grhRenderRemuneracao();
    }
  });
})();
