// ===== script: patch-final-observador-movimentacoes-real =====
(function(){
  'use strict';
  const MOVS = [];

  function n(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function brl(v){return (v===null||v===undefined||v==='')?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function fmt(d){if(!d)return '—'; const [a,m,dd]=String(d).split('-'); return `${dd}/${m}/${a}`;}
  function impacto(m){return Math.abs(Number(m.salarioNovo||0)-Number(m.salarioAnt||0));}
  function tipoKey(m){
    const t=n((m.tipo||'')+' '+(m.motivo||''));
    if(t.includes('aumento de quadro')) return 'quadro';
    if(t.includes('admissao')) return 'admissao';
    if(t.includes('remanejamento')||t.includes('movimentacao interna')) return 'interna';
    if(t.includes('substituicao')) return 'substituicao';
    if(t.includes('promocao')||t.includes('merito')||t.includes('prova')) return 'promocao';
    return 'outro';
  }
  function set(id,v){const e=document.getElementById(id); if(e)e.textContent=v;}
  function css(){
    if(document.getElementById('mov-final-css'))return;
    document.head.insertAdjacentHTML('beforeend',``);
  }
  function html(){
    return `
      <div class="card" data-mov-final="1">
        <div class="card-head">
          <div class="cht"><h2>🔄 Movimentações</h2><p>Histórico real de promoções, substituições, admissões, remanejamentos internos e aumentos de quadro.</p></div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button class="btn btn-g btn-sm">⬇️ Modelo Planilha</button>
            <button class="btn btn-g btn-sm">📤 Importar Planilha</button>
            <button class="btn btn-p btn-sm">➕ Registrar</button>
          </div>
        </div>
        <div style="padding:18px 24px;border-bottom:1px solid var(--border);background:#fff">
          <div class="mov-final-kpis">
            <div class="mov-final-kpi"><small>Total</small><strong id="mf-total">0</strong><span>movimentações</span></div>
            <div class="mov-final-kpi"><small>Promoções</small><strong id="mf-prom">0</strong><span>internas</span></div>
            <div class="mov-final-kpi"><small>Substituições</small><strong id="mf-sub">0</strong><span>desligamento/promoção</span></div>
            <div class="mov-final-kpi"><small>Mov. internas</small><strong id="mf-int">0</strong><span>remanejamentos</span></div>
            <div class="mov-final-kpi"><small>Aumento quadro</small><strong id="mf-quad">0</strong><span>novas posições</span></div>
          </div>
        </div>
        <div class="mov-final-filters">
          <div class="mov-final-field"><label>Mês</label><select id="mf-mes" onchange="window.movFinalRender()"><option value="">Todos</option><option value="01">Janeiro</option><option value="02">Fevereiro</option><option value="03">Março</option><option value="04">Abril</option><option value="05">Maio</option><option value="06">Junho</option><option value="07">Julho</option><option value="08">Agosto</option><option value="09">Setembro</option><option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option></select></div>
          <div class="mov-final-field"><label>Ano</label><select id="mf-ano" onchange="window.movFinalRender()"><option value="">Todos</option></select></div>
          <div class="mov-final-field"><label>Tipo</label><select id="mf-tipo" onchange="window.movFinalRender()"><option value="">Todos</option><option>Promoção Interna</option><option>Substituição</option><option>Remanejamento Interno</option><option>Movimentação Interna</option><option>Admissão</option><option>Aumento de Quadro</option></select></div>
          <div class="mov-final-field"><label>Colaborador</label><input id="mf-colab" oninput="window.movFinalRender()" placeholder="Buscar nome..."></div>
          <div class="mov-final-field"><label>Setor</label><select id="mf-setor" onchange="window.movFinalRender()"><option value="">Todos</option></select></div>
          <div class="mov-final-field"><label>Ordenação</label><select id="mf-ordem" onchange="window.movFinalRender()"><option value="recente">Mais recentes primeiro</option><option value="antiga">Mais antigas primeiro</option><option value="maior-impacto">Maior impacto salarial</option><option value="menor-impacto">Menor impacto salarial</option><option value="promocoes">Promoções primeiro</option><option value="substituicoes">Substituições primeiro</option><option value="internas">Movimentações internas primeiro</option></select></div>
          <button class="btn btn-g btn-sm" onclick="window.movFinalLimpar()">✕ Limpar</button>
          <span id="mf-count" style="font-size:12px;color:var(--ink-60);align-self:center;margin-left:auto"></span>
        </div>
        <div class="mov-final-exec">
          <div class="mov-final-exec-card"><small>Maior impacto salarial</small><strong id="mf-maior">—</strong><div id="mf-maior-sub" style="font-size:12px;color:var(--ink-60);margin-top:4px">—</div></div>
          <div class="mov-final-exec-card"><small>Última movimentação</small><strong id="mf-ultima">—</strong><div id="mf-ultima-sub" style="font-size:12px;color:var(--ink-60);margin-top:4px">—</div></div>
          <div class="mov-final-exec-card"><small>Setor com mais movimentações</small><strong id="mf-setor-top">—</strong><div id="mf-setor-sub" style="font-size:12px;color:var(--ink-60);margin-top:4px">—</div></div>
        </div>
        <div class="mov-final-wrap"><table class="mov-final-table"><thead><tr><th>Data</th><th>Motivo</th><th>Colaborador</th><th>Setor</th><th>Cargo Atual</th><th>Cargo Proposto</th><th>Salário Atual</th><th>Salário Proposto</th><th>Alteração</th></tr></thead><tbody id="mf-body"></tbody></table></div>
      </div>`;
  }
  function popular(){
    const ano=document.getElementById('mf-ano'), setor=document.getElementById('mf-setor');
    if(ano && !ano.dataset.ok){[...new Set(MOVS.map(m=>m.data.split('-')[0]))].sort().reverse().forEach(v=>ano.insertAdjacentHTML('beforeend',`<option value="${v}">${v}</option>`)); ano.dataset.ok='1';}
    if(setor && !setor.dataset.ok){[...new Set(MOVS.map(m=>m.setor))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(v=>setor.insertAdjacentHTML('beforeend',`<option value="${v}">${v}</option>`)); setor.dataset.ok='1';}
  }
  window.movFinalRender=function(){
    popular();
    const mes=document.getElementById('mf-mes')?.value||'', ano=document.getElementById('mf-ano')?.value||'', tipo=document.getElementById('mf-tipo')?.value||'', col=n(document.getElementById('mf-colab')?.value||''), setor=document.getElementById('mf-setor')?.value||'', ordem=document.getElementById('mf-ordem')?.value||'recente';
    let lista=MOVS.filter(m=>{const [a,mm]=m.data.split('-'); const texto=n((m.nome||'')+' '+(m.substituido||'')); return (!ano||a===ano)&&(!mes||mm===mes)&&(!tipo||m.tipo===tipo)&&(!col||texto.includes(col))&&(!setor||m.setor===setor);});
    lista.sort((a,b)=>{const ta=tipoKey(a),tb=tipoKey(b); if(ordem==='antiga')return a.data.localeCompare(b.data); if(ordem==='maior-impacto')return impacto(b)-impacto(a); if(ordem==='menor-impacto')return impacto(a)-impacto(b); if(ordem==='promocoes')return (ta==='promocao'?0:1)-(tb==='promocao'?0:1)||b.data.localeCompare(a.data); if(ordem==='substituicoes')return (ta==='substituicao'?0:1)-(tb==='substituicao'?0:1)||b.data.localeCompare(a.data); if(ordem==='internas')return (ta==='interna'?0:1)-(tb==='interna'?0:1)||b.data.localeCompare(a.data); return b.data.localeCompare(a.data);});
    set('mf-total',lista.length); set('mf-prom',lista.filter(m=>tipoKey(m)==='promocao').length); set('mf-sub',lista.filter(m=>tipoKey(m)==='substituicao').length); set('mf-int',lista.filter(m=>tipoKey(m)==='interna').length); set('mf-quad',lista.filter(m=>tipoKey(m)==='quadro').length); set('mf-count',`${lista.length} registros`);
    const maior=[...lista].sort((a,b)=>impacto(b)-impacto(a))[0], ultima=[...lista].sort((a,b)=>b.data.localeCompare(a.data))[0]; const setores={}; lista.forEach(m=>setores[m.setor]=(setores[m.setor]||0)+1); const top=Object.entries(setores).sort((a,b)=>b[1]-a[1])[0];
    set('mf-maior',maior?.nome||'—'); set('mf-maior-sub',maior?`${brl(maior.salarioAnt)} → ${brl(maior.salarioNovo)}`:'—'); set('mf-ultima',ultima?.nome||'—'); set('mf-ultima-sub',ultima?`${fmt(ultima.data)} • ${ultima.motivo}`:'—'); set('mf-setor-top',top?.[0]||'—'); set('mf-setor-sub',top?`${top[1]} movimentações`:'—');
    const body=document.getElementById('mf-body'); if(!body)return; body.innerHTML=lista.map(m=>`<tr><td><strong>${fmt(m.data)}</strong></td><td>${m.motivo||'—'}</td><td><strong>${m.nome||'—'}</strong>${m.substituido?`<div style="color:#64748b;font-size:11px;margin-top:3px">Substitui: ${m.substituido}</div>`:''}</td><td><span class="mov-final-tag">${m.setor}</span></td><td>${m.cargoAtual||'—'}</td><td>${m.cargoProposto||'—'}</td><td style="white-space:nowrap;color:#64748b">${brl(m.salarioAnt)}</td><td style="white-space:nowrap;color:#16a34a;font-weight:800">${brl(m.salarioNovo)}</td><td>${m.alteracao||'—'}</td></tr>`).join('')||'<tr><td colspan="9" style="text-align:center;padding:32px;color:#64748b">Nenhum registro encontrado.</td></tr>';
  };
  window.movFinalLimpar=function(){['mf-mes','mf-ano','mf-tipo','mf-colab','mf-setor'].forEach(id=>{const e=document.getElementById(id); if(e)e.value='';}); const o=document.getElementById('mf-ordem'); if(o)o.value='recente'; window.movFinalRender();};
  function aplicar(){
    css();
    const pane=document.getElementById('grh-pane-movimentacoes') || document.getElementById('view-movimentacoes');
    if(!pane)return false;
    const visible = getComputedStyle(pane).display !== 'none' || pane.classList.contains('active');
    if(visible && !pane.querySelector('[data-mov-final="1"]')){pane.innerHTML=html(); setTimeout(window.movFinalRender,30);}
    return visible;
  }
  const oldRender=window.grhRenderMovimentacoes;
  window.grhRenderMovimentacoes=function(){const r=typeof oldRender==='function'?oldRender.apply(this,arguments):undefined; setTimeout(aplicar,20); setTimeout(window.movFinalRender,60); return r;};
  new MutationObserver(()=>aplicar()).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  // REMOVED: Performance optimization - 700ms setInterval polling
  // setInterval(aplicar,700);
  document.addEventListener('click',()=>setTimeout(aplicar,60),true);
})();
