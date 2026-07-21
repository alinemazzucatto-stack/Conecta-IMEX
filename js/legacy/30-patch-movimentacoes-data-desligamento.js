// ===== script: patch-movimentacoes-data-desligamento =====
/*
  PATCH — Movimentações por data de desligamento/movimentação
  - Ordena por dataDesligamento quando existir.
  - Caso contrário, usa data da movimentação.
  - Caso contrário, usa criadoEm.
  - Cria movimentação automática de Desligamento quando colaborador é inativado.
*/
(function(){
  function movDateValue(m){
    const raw = m.dataDesligamento || m.data || m.criadoEm || '';
    if(!raw) return 0;

    // YYYY-MM-DD ou ISO
    if(/^\d{4}-\d{2}-\d{2}/.test(raw)){
      return new Date(raw).getTime() || 0;
    }

    // MM/YYYY vindo de planilhas antigas
    if(/^\d{2}\/\d{4}$/.test(raw)){
      const [mes, ano] = raw.split('/');
      return new Date(`${ano}-${mes}-01T00:00:00`).getTime() || 0;
    }

    // DD/MM/YYYY
    if(/^\d{2}\/\d{2}\/\d{4}$/.test(raw)){
      const [dia, mes, ano] = raw.split('/');
      return new Date(`${ano}-${mes}-${dia}T00:00:00`).getTime() || 0;
    }

    return new Date(raw).getTime() || 0;
  }

  function movDateLabel(m){
    return m.dataDesligamento || m.data || (m.criadoEm ? String(m.criadoEm).slice(0,10) : '');
  }

  function movFmtData(raw){
    if(!raw) return '—';
    if(typeof grhFmt === 'function' && /^\d{4}-\d{2}-\d{2}/.test(raw)) return grhFmt(raw.slice(0,10));
    if(/^\d{2}\/\d{4}$/.test(raw)) return raw;
    if(/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
    return String(raw).slice(0,10);
  }

  function tipoBadge(tipo){
    const t = (tipo || '').toLowerCase();
    let bg = 'var(--pur-soft)', color = 'var(--pur-vibrant)';
    if(t.includes('deslig')){ bg = '#fee2e2'; color = '#991b1b'; }
    else if(t.includes('admiss')){ bg = '#d1fae5'; color = '#065f46'; }
    else if(t.includes('sal')){ bg = '#fef3c7'; color = '#92400e'; }
    else if(t.includes('cargo') || t.includes('promo')){ bg = '#dbeafe'; color = '#1d4ed8'; }
    return `background:${bg};color:${color};border-radius:999px;padding:4px 9px;font-size:11px;font-weight:800;white-space:nowrap`;
  }

  // Renderização atualizada
  window.grhRenderMovimentacoes = async function grhRenderMovimentacoes() {
    const tbody = document.getElementById('grh-mov-body');
    if (!tbody) return;

    try {
      const all = await grhGetMov(true);

      const anoSel = document.getElementById('mov-filtro-ano');
      const diaSel = document.getElementById('mov-filtro-dia');

      if (anoSel && anoSel.options.length <= 1) {
        const anosFixos = ['2026','2025','2024','2023'];
        const anosRegistros = [...new Set(all.map(m => {
          const raw = movDateLabel(m);
          if(/^\d{4}-/.test(raw)) return raw.split('-')[0];
          if(/^\d{2}\/\d{4}$/.test(raw)) return raw.split('/')[1];
          if(/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw.split('/')[2];
          return null;
        }).filter(Boolean))];
        const anos = [...new Set([...anosFixos, ...anosRegistros])].sort().reverse();
        anos.forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = a; anoSel.appendChild(o); });
      }

      if (diaSel && diaSel.options.length <= 1) {
        for (let d = 1; d <= 31; d++) {
          const o = document.createElement('option');
          const v = String(d).padStart(2,'0');
          o.value = v;
          o.textContent = d;
          diaSel.appendChild(o);
        }
      }

      const tipoSel = document.getElementById('mov-filtro-tipo');
      if(tipoSel && !Array.from(tipoSel.options).some(o => o.value === 'Desligamento')){
        const opt = document.createElement('option');
        opt.value = 'Desligamento';
        opt.textContent = 'Desligamento';
        tipoSel.appendChild(opt);
      }

      const fDia  = document.getElementById('mov-filtro-dia')?.value  || '';
      const fMes  = document.getElementById('mov-filtro-mes')?.value  || '';
      const fAno  = document.getElementById('mov-filtro-ano')?.value  || '';
      const fTipo = document.getElementById('mov-filtro-tipo')?.value || '';

      const filtrado = all.filter(m => {
        const raw = movDateLabel(m);
        let ano='', mes='', dia='';

        if(/^\d{4}-\d{2}-\d{2}/.test(raw)){
          [ano, mes, dia] = raw.slice(0,10).split('-');
        }else if(/^\d{2}\/\d{4}$/.test(raw)){
          [mes, ano] = raw.split('/');
        }else if(/^\d{2}\/\d{2}\/\d{4}$/.test(raw)){
          [dia, mes, ano] = raw.split('/');
        }

        if (fAno && ano !== fAno) return false;
        if (fMes && mes !== fMes) return false;
        if (fDia && dia && dia !== fDia) return false;
        if (fTipo && (m.tipo || '') !== fTipo) return false;
        return true;
      }).sort((a, b) => {
        const diff = movDateValue(b) - movDateValue(a);
        if(diff !== 0) return diff;
        return (b.criadoEm || '').localeCompare(a.criadoEm || '');
      });

      const countEl = document.getElementById('mov-filtro-count');
      if (countEl) {
        countEl.textContent = filtrado.length !== all.length
          ? `${filtrado.length} de ${all.length} registros · ordenado por data`
          : `${all.length} registros · mais recentes primeiro`;
      }

      if (!filtrado.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--ink-60)">${all.length ? 'Nenhum resultado para os filtros aplicados.' : 'Nenhuma movimentação registrada.'}</td></tr>`;
        return;
      }

      tbody.innerHTML = filtrado.map(m => {
        const dataPrincipal = movDateLabel(m);
        const tipo = m.tipo || 'Movimentação';
        return `<tr>
          <td style="padding-left:20px;font-weight:700">${m.nome || '—'}</td>
          <td><span style="${tipoBadge(tipo)}">${tipo}</span></td>
          <td style="font-size:12px;font-weight:700">${movFmtData(dataPrincipal)}</td>
          <td style="color:var(--ink-60)">${m.salarioAnt ? grhBRL(m.salarioAnt) : '—'}</td>
          <td style="font-weight:700;color:var(--g-green)">${m.salarioNovo ? grhBRL(m.salarioNovo) : '—'}</td>
          <td style="font-size:12px;color:var(--ink-60);max-width:260px">${m.observacao || m.motivo || '—'}</td>
          <td>
            <button onclick="grhExcluirMov('${m._id}')" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button>
          </td>
        </tr>`;
      }).join('');
    } catch(e) {
      console.warn('Erro ao renderizar movimentações:', e);
    }
  };

  // Ajusta cabeçalho da tabela para deixar claro que usa a data principal.
  function ajustarCabecalhoMov(){
    const ths = document.querySelectorAll('#grh-pane-movimentacoes thead th');
    ths.forEach(th => {
      if((th.textContent || '').trim().toLowerCase() === 'data'){
        th.textContent = 'Data / Desligamento';
      }
    });
  }

  // Ao registrar desligamento automático, também lança na movimentação geral.
  const oldRegistrarDesligamento = window.grhRegistrarDesligamentoAutomatico;
  if(typeof oldRegistrarDesligamento === 'function'){
    window.grhRegistrarDesligamentoAutomatico = async function(colabId, antigo, novo){
      await oldRegistrarDesligamento.apply(this, arguments);

      try{
        const nome = novo?.nome || antigo?.nome || '';
        if(!nome) return;

        const movs = await grhGetMov(true);
        const hoje = new Date().toISOString().slice(0,10);
        const existe = movs.some(m =>
          (m.nome || '').toLowerCase() === nome.toLowerCase() &&
          (m.tipo || '') === 'Desligamento' &&
          (m.dataDesligamento || m.data || '') === hoje
        );

        if(!existe){
          await db.collection(col('grh_mov')).add({
            nome,
            tipo: 'Desligamento',
            data: hoje,
            dataDesligamento: hoje,
            salarioAnt: antigo?.salario || novo?.salario || null,
            salarioNovo: null,
            observacao: 'Desligamento/inativação registrada automaticamente pela aba Colaboradores.',
            origem: 'automatico_desligamento',
            colabId: colabId || '',
            criadoEm: new Date().toISOString()
          });
        }
      }catch(e){}
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    ajustarCabecalhoMov();
    if(typeof grhRenderMovimentacoes === 'function') grhRenderMovimentacoes();
  });

  setTimeout(() => {
    ajustarCabecalhoMov();
    if(typeof grhRenderMovimentacoes === 'function') grhRenderMovimentacoes();
  }, 500);
})();


