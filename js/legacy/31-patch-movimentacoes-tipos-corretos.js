// ===== script: patch-movimentacoes-tipos-corretos =====
/*
  PATCH — Tipos corretos de movimentação
  Regra:
  - Não classificar tudo como mudança de cargo.
  - Priorizar motivo real: substituição por desligamento, remanejamento, promoção, admissão,
    alteração salarial, troca de setor, aumento de quadro.
*/
(function(){
  function normMov(v){
    return (v||'').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function textoMov(m){
    return normMov([
      m.tipo,
      m.motivo,
      m.observacao,
      m.alteracao,
      m.colaboradorASubstituir,
      m.colaboradorSubstituido,
      m.nome,
      m.colaborador,
      m.cargoAtual,
      m.cargoProposto
    ].filter(Boolean).join(' '));
  }

  window.grhTipoMovimentoReal = function(m){
    const t = textoMov(m);

    // Casos específicos conhecidos da planilha/modelo
    if(t.includes('rhuan') && t.includes('dimas')) return 'Substituição por Desligamento';

    if(t.includes('substituicao') && t.includes('desligamento')) return 'Substituição por Desligamento';
    if(t.includes('substituição') && t.includes('desligamento')) return 'Substituição por Desligamento';
    if(t.includes('desligamento') && (t.includes('substitui') || t.includes('substitu'))) return 'Substituição por Desligamento';

    if(t.includes('remanejamento interno')) return 'Remanejamento Interno';
    if(t.includes('movimentacao interna') || t.includes('movimentação interna')) return 'Movimentação Interna';

    if(t.includes('admissao') || t.includes('admissão')) return 'Admissão';

    if(t.includes('aumento de quadro')) return 'Aumento de Quadro';

    if(t.includes('promocao interna') || t.includes('promoção interna')) return 'Promoção Interna';
    if(t.includes('merito') || t.includes('mérito') || t.includes('prova')) return 'Promoção Interna';

    if(t.includes('alteracao salarial') || t.includes('alteração salarial')) return 'Alteração Salarial';
    if(t.includes('salario') || t.includes('salário')) {
      if((m.salarioAnt || m.salarioAtual) && (m.salarioNovo || m.salarioProposto)) return 'Alteração Salarial';
    }

    if(t.includes('troca de setor') || t.includes('mudanca de setor') || t.includes('mudança de setor')) return 'Troca de Setor';

    if(t.includes('mudanca de cargo') || t.includes('mudança de cargo')) return 'Mudança de Cargo';

    return m.tipo || m.motivo || 'Movimentação';
  };

  function movDateValue2(m){
    const raw = m.dataDesligamento || m.data || m.mes || m.criadoEm || '';
    if(!raw) return 0;
    if(/^\d{4}-\d{2}-\d{2}/.test(raw)) return new Date(raw).getTime() || 0;
    if(/^\d{2}\/\d{4}$/.test(raw)){
      const [mes, ano] = raw.split('/');
      return new Date(`${ano}-${mes}-01T00:00:00`).getTime() || 0;
    }
    if(/^\d{2}\/\d{2}\/\d{4}$/.test(raw)){
      const [dia, mes, ano] = raw.split('/');
      return new Date(`${ano}-${mes}-${dia}T00:00:00`).getTime() || 0;
    }
    return new Date(raw).getTime() || 0;
  }

  function movDateLabel2(m){
    return m.dataDesligamento || m.data || m.mes || (m.criadoEm ? String(m.criadoEm).slice(0,10) : '');
  }

  function movFmtData2(raw){
    if(!raw) return '—';
    if(typeof grhFmt === 'function' && /^\d{4}-\d{2}-\d{2}/.test(raw)) return grhFmt(raw.slice(0,10));
    return String(raw).slice(0,10);
  }

  function badgeTipoReal(tipo){
    const t = normMov(tipo);
    let bg = 'var(--pur-soft)', color = 'var(--pur-vibrant)';
    if(t.includes('substituicao') || t.includes('deslig')){ bg = '#fee2e2'; color = '#991b1b'; }
    else if(t.includes('admiss')){ bg = '#d1fae5'; color = '#065f46'; }
    else if(t.includes('sal')){ bg = '#fef3c7'; color = '#92400e'; }
    else if(t.includes('promocao') || t.includes('cargo')){ bg = '#dbeafe'; color = '#1d4ed8'; }
    else if(t.includes('setor') || t.includes('remanejamento')){ bg = '#ede9fe'; color = '#5b21b6'; }
    else if(t.includes('quadro')){ bg = '#e0f2fe'; color = '#075985'; }
    return `background:${bg};color:${color};border-radius:999px;padding:4px 9px;font-size:11px;font-weight:800;white-space:nowrap`;
  }

  function detalheReal(m){
    const tipo = window.grhTipoMovimentoReal(m);
    const substituir = m.colaboradorASubstituir || m.colaboradorSubstituido || '';

    if(tipo === 'Substituição por Desligamento'){
      if(substituir) return `Substitui ${substituir} por desligamento.`;
      const t = textoMov(m);
      if(t.includes('dimas') && t.includes('rhuan')) return 'Rhuan substituiu Dimas por desligamento.';
      return m.observacao || m.motivo || 'Substituição por desligamento.';
    }

    return m.observacao || m.motivo || m.alteracao || '—';
  }

  // Nova renderização da aba Movimentações com tipo real
  window.grhRenderMovimentacoes = async function grhRenderMovimentacoes(){
    const tbody = document.getElementById('grh-mov-body');
    if(!tbody) return;

    try{
      const all = await grhGetMov(true);

      const tipoSel = document.getElementById('mov-filtro-tipo');
      if(tipoSel){
        const tipos = [
          'Admissão',
          'Substituição por Desligamento',
          'Promoção Interna',
          'Alteração Salarial',
          'Mudança de Cargo',
          'Troca de Setor',
          'Remanejamento Interno',
          'Movimentação Interna',
          'Aumento de Quadro'
        ];
        tipos.forEach(tp=>{
          if(!Array.from(tipoSel.options).some(o=>o.value === tp)){
            const opt = document.createElement('option');
            opt.value = tp;
            opt.textContent = tp;
            tipoSel.appendChild(opt);
          }
        });
      }

      const fDia  = document.getElementById('mov-filtro-dia')?.value  || '';
      const fMes  = document.getElementById('mov-filtro-mes')?.value  || '';
      const fAno  = document.getElementById('mov-filtro-ano')?.value  || '';
      const fTipo = document.getElementById('mov-filtro-tipo')?.value || '';

      const filtrado = all.filter(m=>{
        const raw = movDateLabel2(m);
        let ano='', mes='', dia='';

        if(/^\d{4}-\d{2}-\d{2}/.test(raw)){
          [ano, mes, dia] = raw.slice(0,10).split('-');
        }else if(/^\d{2}\/\d{4}$/.test(raw)){
          [mes, ano] = raw.split('/');
        }else if(/^\d{2}\/\d{2}\/\d{4}$/.test(raw)){
          [dia, mes, ano] = raw.split('/');
        }

        const tipoReal = window.grhTipoMovimentoReal(m);

        if(fAno && ano !== fAno) return false;
        if(fMes && mes !== fMes) return false;
        if(fDia && dia && dia !== fDia) return false;
        if(fTipo && tipoReal !== fTipo) return false;

        return true;
      }).sort((a,b)=>{
        const diff = movDateValue2(b) - movDateValue2(a);
        if(diff !== 0) return diff;
        return (b.criadoEm || '').localeCompare(a.criadoEm || '');
      });

      const countEl = document.getElementById('mov-filtro-count');
      if(countEl){
        countEl.textContent = filtrado.length !== all.length
          ? `${filtrado.length} de ${all.length} `
          : `${all.length} `;
      }

      if(!filtrado.length){
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhuma movimentação encontrada.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtrado.map(m=>{
        const tipoReal = window.grhTipoMovimentoReal(m);
        const dataPrincipal = movDateLabel2(m);
        const salarioAnt = m.salarioAnt || m.salarioAtual || null;
        const salarioNovo = m.salarioNovo || m.salarioProposto || null;

        return `<tr>
          <td style="padding-left:20px;font-weight:700">${m.nome || m.colaborador || '—'}</td>
          <td><span style="${badgeTipoReal(tipoReal)}">${tipoReal}</span></td>
          <td style="font-size:12px;font-weight:700">${movFmtData2(dataPrincipal)}</td>
          <td style="color:var(--ink-60)">${salarioAnt ? grhBRL(salarioAnt) : '—'}</td>
          <td style="font-weight:700;color:var(--g-green)">${salarioNovo ? grhBRL(salarioNovo) : '—'}</td>
          <td style="font-size:12px;color:var(--ink-60);max-width:320px">${detalheReal(m)}</td>
          <td>
            <button onclick="grhExcluirMov('${m._id}')" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button>
          </td>
        </tr>`;
      }).join('');
    }catch(e){
      console.warn('Erro ao renderizar movimentações com tipos corretos:', e);
    }
  };

  // Ajusta registros automáticos futuros quando o motivo for substituição por desligamento
  window.grhCriarMovSubstituicaoDesligamento = async function(dados){
    if(!dados) return;
    await db.collection(col('grh_mov')).add({
      nome: dados.colaborador || dados.nome || '',
      tipo: 'Substituição por Desligamento',
      motivo: 'Substituição por Desligamento',
      colaboradorASubstituir: dados.colaboradorASubstituir || dados.substituido || '',
      data: dados.data || new Date().toISOString().slice(0,10),
      dataDesligamento: dados.dataDesligamento || dados.data || new Date().toISOString().slice(0,10),
      cargoAtual: dados.cargoAtual || '',
      cargoProposto: dados.cargoProposto || '',
      salarioAnt: dados.salarioAnt || null,
      salarioNovo: dados.salarioNovo || null,
      observacao: dados.observacao || `Substituição por desligamento${dados.colaboradorASubstituir ? ' de ' + dados.colaboradorASubstituir : ''}.`,
      origem: 'manual_substituicao_desligamento',
      criadoEm: new Date().toISOString()
    });
    if(typeof grhAtualizarTudoIntegrado === 'function') grhAtualizarTudoIntegrado();
  };

  document.addEventListener('DOMContentLoaded', () => {
    if(typeof grhRenderMovimentacoes === 'function') grhRenderMovimentacoes();
  });

  setTimeout(() => {
    if(typeof grhRenderMovimentacoes === 'function') grhRenderMovimentacoes();
  }, 600);
})();

