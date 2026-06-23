// ===== script: patch-grh-sincronizacao-abas =====
/*
  PATCH — Gestão de RH integrada
  Regra central:
  - Colaboradores é a base mestre.
  - Novo colaborador aparece em Admissões.
  - Colaborador inativado gera registro em Desligamentos.
  - Alteração salarial, cargo/função ou setor gera Movimentação.
  - Alteração de remuneração também atualiza Colaboradores e Movimentações.
*/
(function(){
  function grhHojeISO(){ return new Date().toISOString().split('T')[0]; }
  function grhAgoraISO(){ return new Date().toISOString(); }
  function grhNorm(v){ return (v||'').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' '); }
  function grhNum(v){ const n=parseFloat(String(v||'').replace(',','.')); return isNaN(n)?0:n; }
  // Expostas no window para que outras telas (ex.: Cadastro Mestre do
  // colaborador) usem exatamente a mesma lógica de normalização/gatilhos,
  // em vez de duplicá-la.
  window.grhNorm = grhNorm;
  window.grhNum = grhNum;

  async function grhAtualizarTudoIntegrado(){
    _grhColabs = null;
    _grhRem = null;
    _grhMov = null;
    _grhDesl = null;

    const tasks = [];
    if (typeof grhAtualizarHero === 'function') tasks.push(grhAtualizarHero());
    if (typeof grhRenderColabs === 'function') tasks.push(grhRenderColabs());
    if (typeof grhRenderAdmissao === 'function') tasks.push(grhRenderAdmissao());
    if (typeof grhRenderDesligamentos === 'function') tasks.push(grhRenderDesligamentos());
    if (typeof grhRenderMovimentacoes === 'function') tasks.push(grhRenderMovimentacoes());
    if (typeof grhRenderRemuneracao === 'function') tasks.push(grhRenderRemuneracao());
    if (typeof grhRenderEnderecos === 'function') tasks.push(grhRenderEnderecos());
    await Promise.allSettled(tasks);
  }
  window.grhAtualizarTudoIntegrado = grhAtualizarTudoIntegrado;

  async function grhJaExisteDesligamento(nome){
    try{
      const snap = await db.collection(col('grh_desl')).where('nome','==',nome).get();
      return !snap.empty;
    }catch(e){ return false; }
  }

  async function grhRegistrarDesligamentoAutomatico(colabId, antigo, novo){
    if(!novo.nome) return;
    const existe = await grhJaExisteDesligamento(novo.nome);
    if(existe) return;

    let tempoEmpresa = '';
    if(novo.admissao){
      const adm = new Date(novo.admissao);
      const desl = new Date();
      const meses = (desl.getFullYear() - adm.getFullYear()) * 12 + (desl.getMonth() - adm.getMonth());
      const anos = Math.floor(meses / 12);
      const mesesRest = meses % 12;
      tempoEmpresa = anos > 0 ? `${anos} ano${anos>1?'s':''}, ${mesesRest}m` : `${Math.max(mesesRest,0)} mês(es)`;
    }

    const dados = {
      nome: novo.nome,
      dataAdmissao: novo.admissao || '',
      dataDesligamento: grhHojeISO(),
      motivo: 'Inativado na base de colaboradores',
      setor: novo.setor || '',
      contrato: novo.clt === 'Sim' ? 'CLT' : (novo.clt === 'Não' ? 'PJ' : ''),
      rescisao: null,
      multaFgts: null,
      tempoEmpresa,
      observacao: 'Registro gerado automaticamente ao alterar o status do colaborador para Inativo.',
      origem: 'automatico_colaboradores',
      colabId: colabId || '',
      criadoEm: grhAgoraISO()
    };

    await db.collection(col('grh_desl')).add(dados);
    if(typeof log === 'function') log('Desligamento automático', `${dados.nome} — status Inativo`, '🚪');
  }

  async function grhRegistrarMovAutomatico(nome, tipo, valorAntigo, valorNovo, extras={}){
    if(!nome) return;
    const data = extras.data || grhHojeISO();

    const dados = {
      nome,
      tipo,
      data,
      salarioAnt: extras.salarioAnt ?? null,
      salarioNovo: extras.salarioNovo ?? null,
      observacao: extras.observacao || `${tipo}: ${valorAntigo || '—'} → ${valorNovo || '—'}`,
      origem: 'automatico',
      criadoEm: grhAgoraISO()
    };

    // Evita duplicidade exata no mesmo dia
    try{
      const movs = await grhGetMov(true);
      const existe = movs.some(m =>
        grhNorm(m.nome) === grhNorm(nome) &&
        m.tipo === tipo &&
        m.data === data &&
        (m.observacao || '') === dados.observacao
      );
      if(existe) return;
    }catch(e){}

    await db.collection(col('grh_mov')).add(dados);
    if(typeof log === 'function') log('Movimentação automática', `${tipo} — ${nome}`, '🔄');
  }
  window.grhRegistrarMovAutomatico = grhRegistrarMovAutomatico;
  window.grhRegistrarDesligamentoAutomatico = grhRegistrarDesligamentoAutomatico;

  async function grhSincronizarRemuneracaoDoColaborador(colab){
    if(!colab || !colab.nome) return;
    const nomeNorm = grhNorm(colab.nome);
    const competencia = (document.getElementById('grh-rem-mes')?.value || grhMesAtual?.() || new Date().toISOString().slice(0,7));
    const salario = grhNum(colab.salario);
    const contrato = colab.clt === 'Sim' ? 'CLT' : 'PJ';

    try{
      const rems = await grhGetRem(true);
      const rem = rems.find(r => grhNorm(r.nome) === nomeNorm && (r.competencia || competencia) === competencia)
               || rems.find(r => grhNorm(r.nome) === nomeNorm);

      if(rem){
        const va = grhNum(rem.va), saude = grhNum(rem.saude), odonto = grhNum(rem.odonto), outros = grhNum(rem.outros);
        await db.collection(col('grh_rem')).doc(rem._id).update({
          nome: colab.nome,
          contrato,
          competencia: rem.competencia || competencia,
          salario,
          custoTotal: salario + va + saude + odonto + outros
        });
      }else if(salario){
        await db.collection(col('grh_rem')).add({
          nome: colab.nome,
          contrato,
          competencia,
          salario,
          va: 0,
          saude: 0,
          odonto: 0,
          outros: 0,
          custoTotal: salario,
          origem: 'automatico_colaboradores',
          criadoEm: grhAgoraISO()
        });
      }
    }catch(e){}
  }

  // Sobrescreve salvar colaborador para integrar abas
  window.grhSalvarColab = async function grhSalvarColab(){
    const id = document.getElementById('grh-colab-id')?.value || '';
    const g = eid => document.getElementById(eid)?.value.trim() || '';
    const roleAcesso = g('grh-c-role') || 'colaborador';

    let antigo = null;
    if(id){
      try{
        const doc = await db.collection(col('grh_colabs')).doc(id).get();
        antigo = doc.exists ? { _id:id, ...doc.data() } : null;
      }catch(e){}
    }

    const dados = {
      nome:       g('grh-c-nome'),
      matricula:  g('grh-c-matricula'),
      email:      g('grh-c-email'),
      cpf:        g('grh-c-cpf'),
      funcao:     g('grh-c-funcao'),
      setor:      g('grh-c-setor'),
      unidade:    g('grh-c-unidade'),
      gestor:     g('grh-c-gestor'),
      gestorEmail: g('grh-c-gestor-email'),
      nascimento: g('grh-c-nasc'),
      admissao:   g('grh-c-admissao'),
      clt:        g('grh-c-clt'),
      status:     g('grh-c-status'),
      salario:    parseFloat(g('grh-c-salario')) || null,
      roleAcesso
    };

    if(!dados.nome){ alert('Nome é obrigatório.'); return; }

    try{
      let colabId = id;

      if(id){
        await db.collection(col('grh_colabs')).doc(id).update(dados);

        // Sincronizar role no Firestore users pelo e-mail
        if(dados.email){
          try{
            const usersSnap = await db.collection('users').where('email','==',dados.email).get();
            usersSnap.forEach(doc => doc.ref.update({ role: roleAcesso }));
          }catch(e){}
        }

        // Gatilho: Inativação -> Desligamentos
        if((antigo?.status || '') !== 'Inativo' && dados.status === 'Inativo'){
          await grhRegistrarDesligamentoAutomatico(id, antigo, dados);
        }

        // Gatilho: Alteração salarial -> Movimentações + Remuneração
        const salAnt = antigo ? grhNum(antigo.salario) : 0;
        const salNovo = grhNum(dados.salario);
        if(salNovo && salAnt !== salNovo){
          await grhRegistrarMovAutomatico(dados.nome, 'Alteração Salarial', salAnt ? grhBRL(salAnt) : '—', grhBRL(salNovo), {
            salarioAnt: salAnt || null,
            salarioNovo: salNovo,
            observacao: `Alteração salarial automática: ${salAnt ? grhBRL(salAnt) : '—'} → ${grhBRL(salNovo)}`
          });
        }

        // Gatilho: Mudança de cargo/função -> Movimentações
        if(antigo && grhNorm(antigo.funcao) !== grhNorm(dados.funcao)){
          await grhRegistrarMovAutomatico(dados.nome, 'Mudança de Cargo', antigo.funcao || '—', dados.funcao || '—', {
            observacao: `Mudança de cargo/função automática: ${antigo.funcao || '—'} → ${dados.funcao || '—'}`
          });
        }

        // Gatilho: Troca de setor -> Movimentações
        if(antigo && grhNorm(antigo.setor) !== grhNorm(dados.setor)){
          await grhRegistrarMovAutomatico(dados.nome, 'Troca de Setor', antigo.setor || '—', dados.setor || '—', {
            observacao: `Troca de setor automática: ${antigo.setor || '—'} → ${dados.setor || '—'}`
          });
        }

        // Gatilho: Mudança de gestor -> Movimentações
        if(antigo && grhNorm(antigo.gestor) !== grhNorm(dados.gestor)){
          await grhRegistrarMovAutomatico(dados.nome, 'Mudança de Gestor', antigo.gestor || '—', dados.gestor || '—', {
            observacao: `Mudança de gestor direto: ${antigo.gestor || '—'} → ${dados.gestor || '—'}`
          });
        }

        // Gatilho: Transferência de unidade -> Movimentações
        if(antigo && grhNorm(antigo.unidade) !== grhNorm(dados.unidade)){
          await grhRegistrarMovAutomatico(dados.nome, 'Transferência de Unidade', antigo.unidade || '—', dados.unidade || '—', {
            observacao: `Transferência de unidade: ${antigo.unidade || '—'} → ${dados.unidade || '—'}`
          });
        }

        // Gatilho: Alteração contratual (CLT/PJ) -> Movimentações
        if(antigo && grhNorm(antigo.clt) !== grhNorm(dados.clt)){
          const rotuloAnt = antigo.clt === 'Sim' ? 'CLT' : 'PJ';
          const rotuloNovo = dados.clt === 'Sim' ? 'CLT' : 'PJ';
          await grhRegistrarMovAutomatico(dados.nome, 'Alteração Contratual', rotuloAnt, rotuloNovo, {
            observacao: `Alteração de tipo de contrato: ${rotuloAnt} → ${rotuloNovo}`
          });
        }

        await grhSincronizarRemuneracaoDoColaborador(dados);
        if(typeof log === 'function') log('Colaborador atualizado', dados.nome, '✏️');
      }else{
        const ref = await db.collection(col('grh_colabs')).add({
          ...dados,
          criadoEm: grhAgoraISO(),
          manual: true,
          origem: 'cadastro_colaboradores'
        });
        colabId = ref.id;

        // Gatilho: Novo colaborador -> Admissões
        // A aba Admissões já lê manual:true e criadoEm, então o novo cadastro aparece automaticamente.
        await grhSincronizarRemuneracaoDoColaborador(dados);

        if(typeof log === 'function') log('Admissão automática', `${dados.nome} — novo colaborador cadastrado`, '📝');
      }

      grhFecharModal('grh-modal-colab');
      await grhAtualizarTudoIntegrado();

      if(dados.status === 'Inativo'){
        if(typeof addNotif === 'function') addNotif(`🚪 ${dados.nome} foi inativado e lançado automaticamente em Desligamentos.`, 'warning');
      }else if(!id){
        if(typeof addNotif === 'function') addNotif(`📝 ${dados.nome} cadastrado e lançado automaticamente em Admissões.`, 'success');
      }else{
        if(typeof addNotif === 'function') addNotif(`✅ ${dados.nome} atualizado e abas sincronizadas.`, 'success');
      }
    }catch(e){
      const u = (typeof auth !== 'undefined' && auth.currentUser) ? auth.currentUser : null;
      const debugAuth = u ? `Logado como: ${u.email} (uid: ${u.uid})` : 'NENHUM usuário autenticado no Firebase Auth (auth.currentUser está vazio).';
      alert('Erro ao salvar: ' + e.message + '\n\n[Diagnóstico]\n' + debugAuth);
    }
  };

  // Sobrescreve salvar remuneração para atualizar Colaboradores + Movimentações
  window.grhSalvarRemuneracao = async function grhSalvarRemuneracao(){
    const id = document.getElementById('grh-rem-id')?.value || '';
    const g  = eid => document.getElementById(eid)?.value.trim() || '';
    const n  = v => parseFloat(String(v||'').replace(',','.')) || 0;

    // Exige um colaborador real selecionado — Remuneração não cadastra
    // salário/pessoa nova por conta própria, apenas benefícios vinculados.
    const colabs = await grhGetColabs();
    const nomeDigitado = g('grh-r-nome');
    const colab = colabs.find(c => grhNorm(c.nome) === grhNorm(nomeDigitado));
    if(!colab){
      alert('Selecione um colaborador já cadastrado em Colaboradores. Remuneração não permite criar um colaborador novo.');
      return;
    }

    // Salário e contrato são sempre os do cadastro mestre — o campo na tela
    // é somente leitura; isso evita qualquer divergência com Colaboradores.
    const salario = grhNum(colab.salario);
    const va      = n(g('grh-r-va'));
    const saude   = n(g('grh-r-saude'));
    const odonto  = n(g('grh-r-odonto'));
    const outros  = n(g('grh-r-outros'));

    const dados = {
      nome: colab.nome,
      contrato: grhContratoColab(colab),
      competencia: g('grh-r-competencia') || (typeof grhMesAtual === 'function' ? grhMesAtual() : new Date().toISOString().slice(0,7)),
      salario, va, saude, odonto, outros,
      custoTotal: salario + va + saude + odonto + outros
    };

    try{
      if(id){
        await db.collection(col('grh_rem')).doc(id).update(dados);
      }else{
        const rems = await grhGetRem(true);
        const existente = rems.find(r => grhNorm(r.nome) === grhNorm(dados.nome) && (r.competencia||'') === dados.competencia);
        if(existente){
          await db.collection(col('grh_rem')).doc(existente._id).update(dados);
        }else{
          await db.collection(col('grh_rem')).add({ ...dados, criadoEm: grhAgoraISO(), origem:'cadastro_remuneracao' });
        }
      }

      // Importante: Remuneração NÃO grava mais salário/contrato de volta em
      // Colaboradores. Essa via deixou de existir — o salário só é alterado
      // em Gestão RH → Colaboradores, que já gera a Movimentação automática.

      grhFecharModal('grh-modal-rem');
      await grhAtualizarTudoIntegrado();
      if(typeof addNotif === 'function') addNotif(`🎁 Benefícios de ${dados.nome} salvos. Salário segue sincronizado de Colaboradores.`, 'success');
    }catch(e){
      alert('Erro: ' + e.message);
    }
  };

  // Reforça salvamento de movimentação para atualizar tudo após alteração
  const grhSalvarMovimentacaoOriginalIntegrado = window.grhSalvarMovimentacao;
  if(typeof grhSalvarMovimentacaoOriginalIntegrado === 'function'){
    window.grhSalvarMovimentacao = async function(){
      await grhSalvarMovimentacaoOriginalIntegrado.apply(this, arguments);
      await grhAtualizarTudoIntegrado();
    };
  }

})();
