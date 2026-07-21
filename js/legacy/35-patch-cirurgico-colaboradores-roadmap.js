// ===== script: patch-cirurgico-colaboradores-roadmap-js =====
(function(){
  const COLABS_ARQUIVO = [];

  function esc(v){
    return String(v ?? '').replace(/[&<>"']/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }

  function fmtData(v){
    if(!v) return '—';
    const s = String(v).slice(0,10);
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.split('-').reverse().join('/');
    return s;
  }

  function removerPlantinha(){
    ['sb-desenvolvimento-talentos','sb-desenvolvimento'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.remove();
    });
  }

  async function obterColaboradores(){
    try{
      if(typeof window.grhGetColabs === 'function'){
        const dados = await window.grhGetColabs(true);
        if(Array.isArray(dados) && dados.length) return dados;
      }
    }catch(e){}

    try{
      if(typeof window.db !== 'undefined' && typeof window.col === 'function'){
        const snap = await window.db.collection(window.col('grh_colabs')).get();
        const dados = snap.docs.map(d=>({_id:d.id, ...d.data()}));
        if(dados.length) return dados;
      }
    }catch(e){}

    return COLABS_ARQUIVO.map((c,i)=>({_id:c._id || 'base-'+i, ...c}));
  }

  function containerColaboradores(){
    let box = document.getElementById('grh-colaboradores-restaurado');
    if(box) return box;

    box = document.createElement('div');
    box.id = 'grh-colaboradores-restaurado';

    const back = document.getElementById('grh-back-bar');
    const pane = document.getElementById('grh-pane-colaboradores');
    const view = document.getElementById('view-gestao-rh');

    if(pane && pane.parentElement){
      pane.insertAdjacentElement('afterend', box);
    }else if(back && back.parentElement){
      back.insertAdjacentElement('afterend', box);
    }else if(view){
      view.appendChild(box);
    }

    return box;
  }

  async function renderizarColaboradoresRestaurado(){
    removerPlantinha();

    const box = containerColaboradores();
    const dados = await obterColaboradores();

    const ativos = dados.filter(c => (c.status || 'Ativo') === 'Ativo');
    const clt = dados.filter(c => c.clt === 'Sim');

    box.classList.add('active');

    // Mantém o título/barra original, mas usa este container para a tabela que sumiu.
    const title = document.getElementById('grh-back-title');
    if(title) title.textContent = '👥 Colaboradores';

    const paneOriginal = document.getElementById('grh-pane-colaboradores');
    if(paneOriginal){
      paneOriginal.style.display = 'none';
    }

    box.innerHTML = `
      <div class="card">
        <div class="card-head">
          <div class="cht">
            <h2>👥 Base de Colaboradores</h2>
            <p>${dados.length} colaboradores cadastrados · ${ativos.length} ativos · ${clt.length} CLT</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input id="grh-colab-restaurado-busca" placeholder="Buscar por nome, e-mail, função ou setor..." style="width:340px" oninput="window.filtrarColaboradoresRestaurado()">
          </div>
        </div>
        <div class="card-body" style="padding:0">
          <div style="overflow-x:auto">
            <table>
              <thead>
                <tr>
                  <th style="padding-left:20px">Nome</th>
                  <th>Matrícula</th>
                  <th>E-mail</th>
                  <th>CPF</th>
                  <th>Função</th>
                  <th>Setor</th>
                  <th>Contrato</th>
                  <th>Admissão</th>
                  <th>Status</th>
                  <th>Acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody id="grh-colab-restaurado-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    window.__colabsRestaurado = dados;
    window.filtrarColaboradoresRestaurado();
  }

  window.filtrarColaboradoresRestaurado = function(){
    const tbody = document.getElementById('grh-colab-restaurado-body');
    if(!tbody) return;

    const busca = (document.getElementById('grh-colab-restaurado-busca')?.value || '').toLowerCase();
    let dados = (window.__colabsRestaurado || []).slice();

    if(busca){
      dados = dados.filter(c => [
        c.nome,c.email,c.funcao,c.cargo,c.setor,c.matricula,c.cpf,c.status,c.roleAcesso
      ].join(' ').toLowerCase().includes(busca));
    }

    if(!dados.length){
      tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum colaborador encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = dados.map(c=>{
      const status = c.status || 'Ativo';
      const statusColor = status === 'Ativo' ? 'var(--g-green)' : status === 'Afastado' ? 'var(--g-orange)' : 'var(--g-pink)';
      const statusBg = status === 'Ativo' ? 'var(--g-green-s)' : status === 'Afastado' ? 'var(--g-orange-s)' : 'var(--g-pink-s)';
      const role = c.roleAcesso || 'colaborador';
      const id = esc(c._id || c.id || '');

      return `
        <tr>
          <td style="padding-left:20px;font-weight:700;max-width:220px">${esc(c.nome || '—')}</td>
          <td style="font-size:12px;color:var(--ink-60)">${esc(c.matricula || '—')}</td>
          <td style="font-size:12px;color:var(--ink-60)">${esc(c.email || '—')}</td>
          <td style="font-size:12px;color:var(--ink-60)">${esc(c.cpf || '—')}</td>
          <td style="font-size:12px">${esc(c.funcao || c.cargo || '—')}</td>
          <td><span style="background:var(--pur-soft);color:var(--pur-vibrant);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700">${esc(c.setor || '—')}</span></td>
          <td style="font-size:12px;font-weight:700">${c.clt === 'Sim' ? '✅ CLT' : 'PJ'}</td>
          <td style="font-size:12px;white-space:nowrap">${fmtData(c.admissao)}</td>
          <td><span style="background:${statusBg};color:${statusColor};border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700">${esc(status)}</span></td>
          <td><span style="background:var(--border);color:var(--ink-60);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700">${esc(role)}</span></td>
          <td style="white-space:nowrap">
            <button onclick="typeof grhAbrirModalColab==='function' ? grhAbrirModalColab('${id}') : null" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:5px 9px;cursor:pointer;font-size:12px" title="Editar">✏️</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  // Intercepta apenas a aba Colaboradores, sem alterar as demais abas.
  const oldGrhTab = window.grhTab;
  window.grhTab = function(tab, btn){
    const box = document.getElementById('grh-colaboradores-restaurado');
    if(box) box.classList.remove('active');

    const ret = typeof oldGrhTab === 'function' ? oldGrhTab.apply(this, arguments) : undefined;

    if(tab === 'colaboradores'){
      setTimeout(renderizarColaboradoresRestaurado, 80);
      setTimeout(renderizarColaboradoresRestaurado, 400);
    }

    return ret;
  };

  function inserirBotaoVoltarRoadmap(){
    const roadmap = document.getElementById('grh-pane-roadmap-produto') || document.getElementById('grh-pane-proximas-funcionalidades');
    if(!roadmap) return;
    if(roadmap.querySelector('#roadmap-voltar-gestao-rh')) return;

    const btnWrap = document.createElement('div');
    btnWrap.id = 'roadmap-voltar-gestao-rh';
    btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:flex-start;margin-bottom:18px';
    btnWrap.innerHTML = '<button type="button" style="border:1px solid var(--border);background:#fff;border-radius:10px;padding:10px 16px;font-weight:800;cursor:pointer;color:var(--ink)">← Voltar para Gestão de RH</button>';

    btnWrap.querySelector('button').onclick = function(){
      if(typeof voltarGestaoRH === 'function') voltarGestaoRH();
      else if(typeof sbNav === 'function') sbNav('gestao-rh');
    };

    roadmap.insertBefore(btnWrap, roadmap.firstChild);
  }

  document.addEventListener('DOMContentLoaded', function(){
    removerPlantinha();
    setTimeout(inserirBotaoVoltarRoadmap, 500);
    setTimeout(inserirBotaoVoltarRoadmap, 1500);
  });

  window.addEventListener('load', function(){
    removerPlantinha();
    setTimeout(inserirBotaoVoltarRoadmap, 800);
  });
})();




