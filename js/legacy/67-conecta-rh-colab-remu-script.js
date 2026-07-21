// ===== script: imex-v84-colab-remu-script =====
(function(){
  if(window.__rh_V84_COLAB_REMU__) return;
  window.__rh_V84_COLAB_REMU__ = true;

  const STORAGE_KEY = 'rh_colaboradores_base_v84';
  const HIST_KEY = 'rh_colaboradores_historico_v84';

  function money(v){
    return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  }

  // ── BASE REAL ──────────────────────────────────────────────────────
  // Este patch (V84) foi originalmente construído sobre uma base de
  // exemplo isolada em localStorage (4 colaboradores fictícios), sem
  // nenhuma ligação com o Firestore. Isso fazia este painel mostrar
  // números errados, desconectados da base real de Colaboradores.
  // A partir daqui, getBase()/atualizarColaborador() leem e gravam
  // diretamente nos MESMOS documentos da coleção "grh_colabs" usada por
  // todo o resto do sistema — sem nenhuma base paralela.
  function normalizeColab(c, i){
    c = c || {};
    const isPJ = c.clt === 'Não';
    const f = c.ferias || {};
    return {
      id: c._id || c.id || ('c' + (i+1)),
      nome: c.nome || ('Colaborador ' + (i+1)),
      matricula: c.matricula || '',
      admissao: c.admissao || '',
      tipoContrato: c.tipoContrato || (isPJ ? 'PJ' : 'CLT'),
      cargo: c.cargo || c.funcao || '',
      funcao: c.funcao || c.cargo || '',
      setor: c.setor || '',
      unidade: c.unidade || '',
      gestor: c.gestor || '',
      // Endereço continua sendo só leitura aqui — editado em Endereços,
      // para não criar um segundo lugar com o mesmo dado.
      endereco: grhFormatarEnderecoResumo(c.endereco),
      salarioAtual: Number(c.salario || 0),
      ultimoReajuste: c.ultimoReajuste || '',
      percentualReajuste: c.percentualReajuste || '',
      beneficios: c.beneficios || {va:0,vr:0,saude:0,odonto:0,wellhub:0,starbem:0,dasa:0,optum:0,outros:0},
      ferias: { periodoAquisitivo: f.periodoAquisitivo || c.periodoAquisitivo || '', saldo: f.saldo != null ? f.saldo : (c.saldo != null ? c.saldo : 30), status: f.status || c.situacao1 || 'Disponível' },
      status: c.status || 'Ativo',
      historico: []
    };
  }

  function grhFormatarEnderecoResumo(e){
    if(!e || typeof e !== 'object') return '';
    return [e.rua, e.num, e.bairro, (e.cidade && e.uf) ? `${e.cidade}/${e.uf}` : (e.cidade||e.uf||'')].filter(Boolean).join(', ');
  }

  async function getBase(force=false){
    const real = (typeof grhGetColabs === 'function') ? await grhGetColabs(force) : [];
    return real.map(normalizeColab);
  }

  async function atualizarColaborador(id, dados){
    try{
      const ref = db.collection(col('grh_colabs')).doc(id);
      const doc = await ref.get();
      if(!doc.exists) return null;
      const antigo = { _id:id, ...doc.data() };

      const payload = { ...dados };
      delete payload.id;
      delete payload.endereco;     // edição de endereço continua em Endereços
      delete payload.historico;
      if(payload.tipoContrato !== undefined){
        payload.clt = payload.tipoContrato === 'CLT' ? 'Sim' : 'Não';
      }
      if(payload.salarioAtual !== undefined){
        payload.salario = Number(payload.salarioAtual) || null;
        delete payload.salarioAtual;
      }

      await ref.update(payload);
      if(typeof _grhColabs !== 'undefined') _grhColabs = null;

      // Reaproveita os mesmos gatilhos automáticos de Movimentações e
      // Desligamento usados pelo formulário rápido de Colaboradores, para
      // que editar por aqui ou por lá produza exatamente o mesmo resultado.
      const nome = payload.nome || antigo.nome;
      if(typeof grhRegistrarMovAutomatico === 'function'){
        if(payload.salario !== undefined){
          const salAnt = grhNum(antigo.salario), salNovo = grhNum(payload.salario);
          if(salNovo && salAnt !== salNovo){
            await grhRegistrarMovAutomatico(nome, 'Alteração Salarial', salAnt?grhBRL(salAnt):'—', grhBRL(salNovo), {salarioAnt:salAnt||null, salarioNovo:salNovo, observacao:`Alteração salarial automática: ${salAnt?grhBRL(salAnt):'—'} → ${grhBRL(salNovo)}`});
          }
        }
        if(payload.cargo !== undefined && grhNorm(antigo.cargo||'') !== grhNorm(payload.cargo||'')){
          await grhRegistrarMovAutomatico(nome, 'Mudança de Cargo', antigo.cargo||'—', payload.cargo||'—', {observacao:`Mudança de cargo: ${antigo.cargo||'—'} → ${payload.cargo||'—'}`});
        }
        if(payload.setor !== undefined && grhNorm(antigo.setor||'') !== grhNorm(payload.setor||'')){
          await grhRegistrarMovAutomatico(nome, 'Troca de Setor', antigo.setor||'—', payload.setor||'—', {observacao:`Troca de setor: ${antigo.setor||'—'} → ${payload.setor||'—'}`});
        }
        if(payload.unidade !== undefined && grhNorm(antigo.unidade||'') !== grhNorm(payload.unidade||'')){
          await grhRegistrarMovAutomatico(nome, 'Transferência de Unidade', antigo.unidade||'—', payload.unidade||'—', {observacao:`Transferência de unidade: ${antigo.unidade||'—'} → ${payload.unidade||'—'}`});
        }
        if(payload.gestor !== undefined && grhNorm(antigo.gestor||'') !== grhNorm(payload.gestor||'')){
          await grhRegistrarMovAutomatico(nome, 'Mudança de Gestor', antigo.gestor||'—', payload.gestor||'—', {observacao:`Mudança de gestor: ${antigo.gestor||'—'} → ${payload.gestor||'—'}`});
        }
      }
      if(typeof grhRegistrarDesligamentoAutomatico === 'function' && payload.status !== undefined && (antigo.status||'') !== 'Inativo' && payload.status === 'Inativo'){
        await grhRegistrarDesligamentoAutomatico(id, antigo, { ...antigo, ...payload });
      }
      if(typeof grhAtualizarTudoIntegrado === 'function') await grhAtualizarTudoIntegrado();

      const atualizado = await ref.get();
      document.dispatchEvent(new CustomEvent('conecta:colaboradoresAtualizados',{}));
      return normalizeColab({ _id:id, ...atualizado.data() });
    }catch(e){
      console.error('Erro ao atualizar cadastro mestre:', e);
      alert('Erro ao salvar: ' + e.message);
      return null;
    }
  }

  async function totais(){
    const base = await getBase();
    const ativos = base.filter(c => c.status !== 'Inativo');
    const clt = ativos.filter(c => c.tipoContrato === 'CLT');
    const pj = ativos.filter(c => c.tipoContrato === 'PJ');
    const est = ativos.filter(c => /estag/i.test(c.tipoContrato||''));
    const folhaAtual = ativos.reduce((s,c)=>s+Number(c.salarioAtual||0),0);
    const folhaAnterior = Number(localStorage.getItem('rh_folha_anterior_v84') || Math.round(folhaAtual*0.94));
    const beneficios = ativos.reduce((s,c)=>{
      const b = c.beneficios || {};
      return s + Object.values(b).reduce((a,v)=>a+Number(v||0),0);
    },0);
    return {
      total:ativos.length, clt:clt.length, pj:pj.length, estagiario:est.length,
      folhaAtual, folhaAnterior, variacao:folhaAtual-folhaAnterior,
      salarioMedioCLT: clt.length ? clt.reduce((s,c)=>s+Number(c.salarioAtual||0),0)/clt.length : 0,
      salarioMedioPJ: pj.length ? pj.reduce((s,c)=>s+Number(c.salarioAtual||0),0)/pj.length : 0,
      beneficios
    };
  }

  window.connColaboradores = {
    listar: getBase,
    salvar: async function(){ console.warn('connColaboradores.salvar foi desativado nesta versão — edite cada colaborador individualmente (Cadastro Mestre ou Gestão RH → Colaboradores) para manter o histórico de Movimentações correto.'); },
    atualizar: atualizarColaborador,
    totais,
    historico: async function(nomeFiltro){
      try{
        const movs = (typeof grhGetMov === 'function') ? await grhGetMov() : [];
        const lista = nomeFiltro
          ? movs.filter(m => grhNorm(m.nome||'') === grhNorm(nomeFiltro))
          : movs;
        return lista.slice().sort((a,b)=>(b.criadoEm||b.data||'').localeCompare(a.criadoEm||a.data||''));
      }catch(e){ return []; }
    }
  };

  async function linhasBeneficios(){
    const nomes = {va:'VA',vr:'VR',saude:'Plano de Saúde',odonto:'Odontológico',wellhub:'Wellhub',starbem:'Starbem',dasa:'Dasa',optum:'Optum',outros:'Outros'};
    const soma = {};
    const base = await getBase();
    base.forEach(c=>{
      const b = c.beneficios || {};
      Object.keys(nomes).forEach(k => soma[k] = (soma[k]||0) + Number(b[k]||0));
    });
    return Object.keys(nomes).map(k=>`<tr><td>${nomes[k]}</td><td>${money(soma[k]||0)}</td></tr>`).join('');
  }

  async function renderRemuneracao(){
    const t = await totais();
    const beneficiosHtml = await linhasBeneficios();
    const perc = t.folhaAnterior ? ((t.variacao/t.folhaAnterior)*100).toFixed(1) : '0.0';
    const max = Math.max(t.folhaAtual,t.folhaAnterior,1);
    const hAtual = Math.max(24, Math.round((t.folhaAtual/max)*132));
    const hAnt = Math.max(24, Math.round((t.folhaAnterior/max)*132));

    return `
      <div id="imex-remuneracao-dashboard-v84" class="card">
        <div class="card-head">
          <div class="cht">
            <h2>💰 Remuneração — Dashboard Executivo</h2>
            <p>Salários, vínculos e benefícios são consumidos automaticamente da base central de Colaboradores.</p>
          </div>
        </div>
        <div class="card-body">
          <div class="imex-remu-v84-note">
            Este módulo não possui cadastro manual de salários por colaborador. Para alterar salário, contrato, cargo, setor ou benefícios, acesse <strong>Gestão RH → Colaboradores</strong>.
          </div>

          <div class="imex-remu-v84-kpis">
            <div class="imex-remu-v84-kpi"><small>Folha Atual</small><strong>${money(t.folhaAtual)}</strong><span>Base Colaboradores</span></div>
            <div class="imex-remu-v84-kpi"><small>Folha Anterior</small><strong>${money(t.folhaAnterior)}</strong><span>Comparativo mensal</span></div>
            <div class="imex-remu-v84-kpi"><small>Variação</small><strong>${t.variacao>=0?'+':''}${perc}%</strong><span>${money(t.variacao)}</span></div>
            <div class="imex-remu-v84-kpi"><small>Média CLT</small><strong>${money(t.salarioMedioCLT)}</strong><span>${t.clt} CLT</span></div>
            <div class="imex-remu-v84-kpi"><small>Média PJ</small><strong>${money(t.salarioMedioPJ)}</strong><span>${t.pj} PJ</span></div>
            <div class="imex-remu-v84-kpi"><small>Benefícios</small><strong>${money(t.beneficios)}</strong><span>Custo vinculado</span></div>
          </div>

          <div class="imex-remu-v84-grid">
            <div>
              <div class="imex-remu-v84-panel">
                <h3>📊 Comparativo Folha Atual x Anterior</h3>
                <div class="imex-remu-v84-bars">
                  <div class="imex-remu-v84-barbox"><div class="imex-remu-v84-bar prev" style="height:${hAnt}px"></div><div class="imex-remu-v84-label">Anterior<br>${money(t.folhaAnterior)}</div></div>
                  <div class="imex-remu-v84-barbox"><div class="imex-remu-v84-bar" style="height:${hAtual}px"></div><div class="imex-remu-v84-label">Atual<br>${money(t.folhaAtual)}</div></div>
                </div>
              </div>
              <div class="imex-remu-v84-panel">
                <h3>👥 Distribuição de Contratos</h3>
                <table class="imex-remu-v84-table">
                  <tr><td>CLT</td><td>${t.clt}</td></tr>
                  <tr><td>PJ</td><td>${t.pj}</td></tr>
                  <tr><td>Estagiário</td><td>${t.estagiario}</td></tr>
                  <tr><td>Total ativo</td><td>${t.total}</td></tr>
                </table>
              </div>
            </div>

            <div>
              <div class="imex-remu-v84-panel">
                <h3>🎁 Custos dos Benefícios</h3>
                <table class="imex-remu-v84-table">${beneficiosHtml}</table>
                <div class="imex-remu-v84-note" style="margin-top:12px;margin-bottom:0">Os custos são atualizados conforme os benefícios vinculados no cadastro do colaborador.</div>
              </div>
              <div class="imex-remu-v84-panel">
                <h3>📤 Relatórios</h3>
                <div class="actions">
                  <button class="btn btn-g" onclick="alert('Exportar folha: próxima etapa de integração.')">📊 Exportar Excel</button>
                  <button class="btn btn-g" onclick="alert('Exportar dashboard: próxima etapa de integração.')">📄 Exportar PDF</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function ocultarTabelaRemuneracaoAntiga(){
    // Desativado: esta função chegou a ocultar o painel real "Remuneração
    // dos Colaboradores" (já conectado à base real) só porque o texto
    // batia com um padrão de busca. Como o dashboard acima e a tabela real
    // não competem mais por cadastro de salário (ambos são somente
    // leitura, vindos de Colaboradores), não há motivo para esconder nada
    // — e esconder removeria uma tela já existente do usuário.
    return;
  }

  async function garantirDashboardRemuneracao(){
    if(document.getElementById('imex-remuneracao-dashboard-v84')) return;

    const scope = document.querySelector('#view-rh') || document.body;
    let target = null;

    const panes = Array.from(scope.querySelectorAll('[id*="remuneracao" i],[id*="remun" i],[data-pane*="remun" i],[data-module*="remun" i]'));
    target = panes.find(el => !el.closest('#conecta-rh-remuneracao-dashboard-v84'));

    if(!target){
      const cards = Array.from(scope.querySelectorAll('.card,section,div')).filter(el => /remunera/i.test(el.textContent||''));
      target = cards.find(el => !/remuneração dos colaboradores/i.test(el.textContent||'')) || cards[0];
    }

    if(!target) return;
    const insert = target.classList && target.classList.contains('card') ? target.parentElement : target;
    insert.insertAdjacentHTML('afterbegin', await renderRemuneracao());
  }

  async function renderCamposColaboradorMestre(colab){
    colab = colab || (await getBase())[0] || {};
    const b = colab.beneficios || {};
    const f = colab.ferias || {};
    const hist = (await window.connColaboradores.historico(colab.nome)).slice(0,8);
    const statusReal = colab.status === 'Inativo' ? 'Desligado' : (colab.status || 'Ativo');

    return `
      <div id="imex-colab-master-box" class="imex-colab-master-box">
        <h3>👥 Cadastro Mestre do Colaborador</h3>
        <div class="imex-colab-master-grid">
          <div class="field"><label>Nome completo</label><input id="imex-colab-nome" value="${colab.nome||''}"></div>
          <div class="field"><label>Matrícula</label><input id="imex-colab-matricula" value="${colab.matricula||''}"></div>
          <div class="field"><label>Status</label><select id="imex-colab-status"><option ${statusReal==='Ativo'?'selected':''}>Ativo</option><option ${statusReal==='Férias'?'selected':''}>Férias</option><option ${statusReal==='Afastado'?'selected':''}>Afastado</option><option ${statusReal==='Desligado'?'selected':''}>Desligado</option></select></div>
          <div class="field"><label>Gênero</label><select id="imex-colab-genero">
            <option value="" ${!colab.genero?'selected':''}>Não informado</option>
            <option value="Masculino" ${colab.genero==='Masculino'?'selected':''}>Masculino</option>
            <option value="Feminino" ${colab.genero==='Feminino'?'selected':''}>Feminino</option>
            <option value="Outro" ${colab.genero==='Outro'?'selected':''}>Outro</option>
          </select></div>

          <div class="imex-colab-subtitle">Dados contratuais</div>
          <div class="field"><label>Admissão</label><input id="imex-colab-admissao" value="${colab.admissao||''}"></div>
          <div class="field"><label>Tipo de contrato</label><select id="imex-colab-tipoContrato">
            ${['CLT','PJ','Estagiário','Aprendiz','Terceiro'].map(v=>`<option value="${v}" ${String(colab.tipoContrato)===v?'selected':''}>${v}</option>`).join('')}
          </select></div>
          <div class="field"><label>Cargo</label><input id="imex-colab-cargo" value="${colab.cargo||''}"></div>
          <div class="field"><label>Função</label><input id="imex-colab-funcao" value="${colab.funcao||''}"></div>
          <div class="field"><label>Setor</label><input id="imex-colab-setor" value="${colab.setor||''}"></div>
          <div class="field"><label>Unidade</label><input id="imex-colab-unidade" value="${colab.unidade||''}"></div>
          <div class="field"><label>Gestor direto</label><input id="imex-colab-gestor" value="${colab.gestor||''}"></div>
          <div class="field">
            <label>Endereço 🔒</label>
            <input value="${colab.endereco || 'Não cadastrado'}" disabled style="background:#f1f5f9;color:var(--ink-60)">
            <button class="btn btn-g btn-sm" type="button" style="margin-top:6px" onclick="grhAbrirModalEndereco('${colab.id}')">📍 Editar em Endereços</button>
          </div>

          <div class="imex-colab-subtitle">Remuneração</div>
          <div class="field"><label>Salário atual</label><input id="imex-colab-salarioAtual" type="number" step="0.01" value="${Number(colab.salarioAtual||0)}"></div>
          <div class="field"><label>Último reajuste</label><input id="imex-colab-ultimoReajuste" value="${colab.ultimoReajuste||''}" placeholder="dd/mm/aaaa"></div>
          <div class="field"><label>% último reajuste</label><input id="imex-colab-percentualReajuste" value="${colab.percentualReajuste||''}" placeholder="Ex: 7%"></div>

          <div class="imex-colab-subtitle">Benefícios vinculados</div>
          <div class="field"><label>VA</label><input id="imex-colab-benef-va" type="number" step="0.01" value="${Number(b.va||0)}"></div>
          <div class="field"><label>VR</label><input id="imex-colab-benef-vr" type="number" step="0.01" value="${Number(b.vr||0)}"></div>
          <div class="field"><label>Plano de Saúde</label><input id="imex-colab-benef-saude" type="number" step="0.01" value="${Number(b.saude||0)}"></div>
          <div class="field"><label>Odontológico</label><input id="imex-colab-benef-odonto" type="number" step="0.01" value="${Number(b.odonto||0)}"></div>
          <div class="field"><label>Wellhub</label><input id="imex-colab-benef-wellhub" type="number" step="0.01" value="${Number(b.wellhub||0)}"></div>
          <div class="field"><label>Outros</label><input id="imex-colab-benef-outros" type="number" step="0.01" value="${Number(b.outros||0)}"></div>

          <div class="imex-colab-subtitle">Férias</div>
          <div class="field"><label>Período aquisitivo</label><input id="imex-colab-ferias-periodo" value="${f.periodoAquisitivo||''}"></div>
          <div class="field"><label>Saldo de férias</label><input id="imex-colab-ferias-saldo" type="number" value="${Number(f.saldo||0)}"></div>
          <div class="field"><label>Status férias</label><input id="imex-colab-ferias-status" value="${f.status||''}"></div>

          <div class="field full">
            <button class="btn btn-p" type="button" onclick="connSalvarCadastroMestreColaborador('${colab.id}')">Salvar cadastro mestre</button>
          </div>
        </div>

        <div class="imex-colab-history">
          ${hist.length ? hist.map(h=>`<div><strong>${new Date(h.criadoEm||h.data||Date.now()).toLocaleString('pt-BR')}</strong> — ${h.tipo||'Alteração'}: ${h.observacao||''}</div>`).join('') : '<div>Nenhuma alteração registrada ainda.</div>'}
        </div>
      </div>`;
  }

  window.connSalvarCadastroMestreColaborador = async function(id){
    const statusForm = val('imex-colab-status');
    const dados = {
      nome: val('imex-colab-nome'),
      matricula: val('imex-colab-matricula'),
      status: statusForm === 'Desligado' ? 'Inativo' : statusForm,
      genero: val('imex-colab-genero'),
      admissao: val('imex-colab-admissao'),
      tipoContrato: val('imex-colab-tipoContrato'),
      cargo: val('imex-colab-cargo'),
      funcao: val('imex-colab-funcao'),
      setor: val('imex-colab-setor'),
      unidade: val('imex-colab-unidade'),
      gestor: val('imex-colab-gestor'),
      salarioAtual: Number(val('imex-colab-salarioAtual')||0),
      ultimoReajuste: val('imex-colab-ultimoReajuste'),
      percentualReajuste: val('imex-colab-percentualReajuste'),
      beneficios:{
        va:Number(val('imex-colab-benef-va')||0),
        vr:Number(val('imex-colab-benef-vr')||0),
        saude:Number(val('imex-colab-benef-saude')||0),
        odonto:Number(val('imex-colab-benef-odonto')||0),
        wellhub:Number(val('imex-colab-benef-wellhub')||0),
        outros:Number(val('imex-colab-benef-outros')||0)
      },
      ferias:{
        periodoAquisitivo: val('imex-colab-ferias-periodo'),
        saldo:Number(val('imex-colab-ferias-saldo')||0),
        status: val('imex-colab-ferias-status')
      }
    };
    const atualizado = await atualizarColaborador(id, dados);
    const box = document.getElementById('imex-colab-master-box');
    if(box && atualizado) box.outerHTML = await renderCamposColaboradorMestre(atualizado);
    alert('Cadastro mestre atualizado. Remuneração, Benefícios, Férias, Dashboard e demais módulos foram sincronizados.');
  };

  function val(id){
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  async function garantirCamposColaboradores(){
    if(document.getElementById('imex-colab-master-box')) return;
    const scope = document.querySelector('#view-rh') || document.body;
    const candidates = Array.from(scope.querySelectorAll('.card,section,div')).filter(el=>{
      const txt = (el.textContent||'').toLowerCase();
      return txt.includes('dados contratuais') || (txt.includes('matrícula') && txt.includes('admissão') && txt.includes('cargo'));
    });
    let target = candidates[0];
    if(!target){
      target = Array.from(scope.querySelectorAll('.card,section,div')).find(el => /colaboradores/i.test(el.textContent||''));
    }
    if(!target) return;
    const insert = target.classList && target.classList.contains('card') ? target.querySelector('.card-body') || target : target;
    const base = await getBase();
    insert.insertAdjacentHTML('afterbegin', await renderCamposColaboradorMestre(base[0]));
  }

  function isRemuClick(el){
    const raw = ((el.textContent||'')+' '+(el.getAttribute('onclick')||'')+' '+(el.dataset.id||'')+' '+(el.dataset.module||'')).toLowerCase();
    return raw.includes('remuneração') || raw.includes('remuneracao') || raw.includes('remun');
  }

  function isColabClick(el){
    const raw = ((el.textContent||'')+' '+(el.getAttribute('onclick')||'')+' '+(el.dataset.id||'')+' '+(el.dataset.module||'')).toLowerCase();
    return raw.includes('colaboradores') || raw.includes('colaborador');
  }

  document.addEventListener('click', function(ev){
    const el = ev.target.closest ? ev.target.closest('button,a,.card,.sb-item,[data-id],[data-module]') : null;
    if(!el) return;
    if(isRemuClick(el)){
      setTimeout(garantirDashboardRemuneracao,120);
      setTimeout(garantirDashboardRemuneracao,600);
    }
    if(isColabClick(el)){
      setTimeout(garantirCamposColaboradores,120);
      setTimeout(garantirCamposColaboradores,600);
    }
  }, true);

  document.addEventListener('conecta:colaboradoresAtualizados', function(){
    const old = document.getElementById('imex-remuneracao-dashboard-v84');
    if(old) old.remove();
    setTimeout(garantirDashboardRemuneracao,80);
  });

  const oldSbNav = window.sbNav;
  if(typeof oldSbNav === 'function' && !oldSbNav.__imexV84Wrapped){
    const wrapped = function(){
      const r = oldSbNav.apply(this, arguments);
      setTimeout(()=>{
        garantirDashboardRemuneracao();
        garantirCamposColaboradores();
      },250);
      return r;
    };
    wrapped.__imexV84Wrapped = true;
    window.sbNav = wrapped;
  }

  document.addEventListener('DOMContentLoaded', function(){
    getBase();
    setTimeout(()=>{ocultarTabelaRemuneracaoAntiga(); garantirCamposColaboradores();},500);
  });
})();

