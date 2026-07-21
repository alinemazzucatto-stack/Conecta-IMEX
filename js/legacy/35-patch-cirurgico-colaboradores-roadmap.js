// ===== script: patch-cirurgico-colaboradores-roadmap-js =====
(function(){
  const COLABS_ARQUIVO = [
      {nome:'ABIMAEL DA CRUZ MENDES',matricula:'--',email:'abimael.mendes@empresa.com',clt:'Não',nascimento:'1997-05-13',admissao:'2024-07-08',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'ABRANH AM JOÃO RESQUE VELOSO NETO',matricula:'231',email:'neto.veloso@empresa.com',clt:'Sim',nascimento:'1993-09-22',admissao:'2023-11-27',funcao:'Analista de suporte',setor:'Suporte',salario:2985.21,status:'Ativo'},
      {nome:'ADAN LUCAS PEREIRA DE OLIVEIRA',matricula:'194',email:'adan.oliveira@empresa.com',clt:'Sim',nascimento:'1992-10-18',admissao:'2021-08-22',funcao:'Programador',setor:'Prog. PDV',salario:3980.02,status:'Ativo'},
      {nome:'ALINE DE LIMA MAZZUCATTO',matricula:'203',email:'aline.mazzucatto@empresa.com',clt:'Sim',nascimento:'1990-08-17',admissao:'2021-11-25',funcao:'Analista de RH',setor:'Recursos Humanos',salario:2582.63,status:'Ativo'},
      {nome:'BRUNO CESAR CASADO VILA VERDE',matricula:'--',email:'bruno.casado@empresa.com',clt:'Não',nascimento:'1982-12-14',admissao:'2025-10-01',funcao:'Executivo de canais',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'BRUNO DE OLIVEIRA',matricula:'231',email:'bruno.oliveira@empresa.com',clt:'Sim',nascimento:'1988-09-18',admissao:'2016-08-17',funcao:'Programador',setor:'Prog. Financeiro',salario:4266.19,status:'Ativo'},
      {nome:'BRUNO DE PAULA SILVA',matricula:'194',email:'bruno.silva@empresa.com',clt:'Sim',nascimento:'1996-10-31',admissao:'2024-04-26',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'BRUNO FRIEDRICH RAQUEL',matricula:'203',email:'bruno.friedrich@empresa.com',clt:'Sim',nascimento:'2004-09-22',admissao:'2024-07-01',funcao:'Programador',setor:'Prog. PDV',salario:4264.95,status:'Ativo'},
      {nome:'BRUNO ROSA DE OLIVEIRA',matricula:'222',email:'bruno.rosa@empresa.com',clt:'Sim',nascimento:'1997-09-15',admissao:'2023-08-22',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'CAMILA ESTEFANI BORGES',matricula:'--',email:'camila.borges@empresa.com',clt:'Não',nascimento:'1992-06-06',admissao:'2025-08-29',funcao:'Executivo de canais',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'DANIEL BOMFIM',matricula:'--',email:'daniel.sgarbi@empresa.com',clt:'Não',nascimento:'2003-12-06',admissao:'2025-07-01',funcao:'Programador',setor:'Prog. PDV',salario:1300,status:'Ativo'},
      {nome:'DAVID DA SILVA LIMA',matricula:'239',email:'david.lima@empresa.com',clt:'Sim',nascimento:'2002-05-26',admissao:'2024-10-22',funcao:'Trainee de suporte',setor:'Suporte',salario:2303.02,status:'Ativo'},
      {nome:'DIEGO FABIANO DE SOUSA',matricula:'230',email:'diego.sousa@empresa.com',clt:'Sim',nascimento:'1998-05-14',admissao:'2024-02-22',funcao:'Analista Sucesso do cliente',setor:'Sucesso do Cliente',salario:3253.87,status:'Ativo'},
      {nome:'DIOGO MAURICIO FONTOLAN',matricula:'46',email:'diogo@empresa.com',clt:'Sim',nascimento:'1983-09-12',admissao:'2011-02-17',funcao:'Product Owner',setor:'Product Owner',salario:4466.92,status:'Ativo'},
      {nome:'DORALICE AP. DOS SANTOS BORGES',matricula:'229',email:'doralice.borges@empresa.com',clt:'Sim',nascimento:'1982-01-17',admissao:'2024-01-16',funcao:'Líder de suporte',setor:'Suporte',salario:3867.25,status:'Ativo'},
      {nome:'EDSON NAKAMURA',matricula:'10',email:'edson.nakamura@imex.com',clt:'Sim',nascimento:'1970-09-23',admissao:'2007-06-05',funcao:'Assistente administrativo',setor:'Administrativo',salario:3240.93,status:'Ativo'},
      {nome:'EDUARDO RIPKE FAHR',matricula:'--',email:'eduardo.rike@empresa.com',clt:'Não',nascimento:'1995-08-24',admissao:'2022-04-07',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'EVERSON ADELMO BRITO DE MARINHO',matricula:'240',email:'everson.adelmo@empresa.com',clt:'Sim',nascimento:'2001-11-22',admissao:'2025-06-20',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'EVERSON DA SILVA SANTANA',matricula:'137',email:'everson.santana@empresa.com',clt:'Sim',nascimento:'1982-03-11',admissao:'2018-04-24',funcao:'Líder de suporte',setor:'Suporte',salario:3867.25,status:'Ativo'},
      {nome:'FABIO HENRIQUE CARDOSO NOBRE',matricula:'193',email:'fabio.nobre@empresa.com',clt:'Sim',nascimento:'1992-01-18',admissao:'2021-06-07',funcao:'Programador',setor:'Prog. Fiscal',salario:3980.02,status:'Ativo'},
      {nome:'FABIO VENDRAMIN GUIMARAES ROSINI',matricula:'21',email:'fabio@empresa.com',clt:'Sim',nascimento:'1980-09-24',admissao:'2008-06-09',funcao:'Gerente de Projetos',setor:'Prog. PDV',salario:9465,status:'Ativo'},
      {nome:'FERNANDA CHER',matricula:'162',email:'fernanda.cher@empresa.com',clt:'Sim',nascimento:'1973-01-05',admissao:'2019-09-10',funcao:'Assistente administrativo',setor:'Administrativo',salario:2459.5,status:'Ativo'},
      {nome:'GABRIEL DE CASTRO MIRANDA LOPES',matricula:'103',email:'gabriel.castro@empresa.com',clt:'Sim',nascimento:'1988-01-18',admissao:'2015-02-18',funcao:'Programador',setor:'Prog. PDV',salario:6246.14,status:'Ativo'},
      {nome:'GABRIEL SEIJI GONCALVES BANDO',matricula:'',email:'gabriel.seiji@empresa.com',clt:'Não',nascimento:'2001-01-11',admissao:'2019-11-21',funcao:'Product Owner',setor:'Product Owner',salario:null,status:'Ativo'},
      {nome:'GILMAR SERGIO BIANCHI JUNIOR',matricula:'152',email:'gilmar.bianchi@empresa.com',clt:'Sim',nascimento:'1988-02-18',admissao:'2020-04-01',funcao:'Programador',setor:'Prog. PDV',salario:4008.84,status:'Ativo'},
      {nome:'GUILHERME DE ASSIS VILAS BOAS',matricula:'223',email:'guilherme.assis@empresa.com',clt:'Sim',nascimento:'2002-07-31',admissao:'2023-08-22',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'GUSTAVO BEGTSOM RIBEIRO',matricula:'220',email:'gustavo.begtsom@empresa.com',clt:'Sim',nascimento:'2004-04-12',admissao:'2023-03-01',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'GUSTAVO PINHEIRO DA SILVA',matricula:'111',email:'gustavo.pinheiro@empresa.com',clt:'Sim',nascimento:'1994-07-25',admissao:'2015-07-21',funcao:'Líder de suporte N3',setor:'Suporte N3',salario:4266.19,status:'Ativo'},
      {nome:'HEITOR GONÇALVES',matricula:'',email:'',clt:'Não',nascimento:'',admissao:'',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'IVAN PIONELLI JUNIOR',matricula:'89',email:'ivan.pionelli@empresa.com',clt:'Sim',nascimento:'1993-05-25',admissao:'2013-11-26',funcao:'Programador',setor:'Prog. Fiscal',salario:3199.65,status:'Ativo'},
      {nome:'JULIO CESAR ANDREATA JUNIOR',matricula:'70',email:'julio.andreata@empresa.com',clt:'Sim',nascimento:'1991-10-24',admissao:'2012-07-18',funcao:'Programador',setor:'Prog. Fiscal',salario:4266.19,status:'Ativo'},
      {nome:'LEANDRO ANDRADE DOS SANTOS',matricula:'--',email:'leandro.santos@empresa.com',clt:'Não',nascimento:'1985-11-09',admissao:'2025-07-16',funcao:'Programador',setor:'Prog. Fiscal',salario:null,status:'Ativo'},
      {nome:'LEONARDO GOMES',matricula:'--',email:'leonardo.gomes@empresa.com',clt:'Não',nascimento:'1991-02-23',admissao:'2023-08-29',funcao:'Líder de suporte',setor:'Suporte',salario:null,status:'Ativo'},
      {nome:'LEONARDO SCHAURICH DE ARAÚJO',matricula:'237',email:'leonardo.araujo@empresa.com',clt:'Sim',nascimento:'1986-08-17',admissao:'2024-07-11',funcao:'Analista de suporte',setor:'Suporte',salario:3197.04,status:'Ativo'},
      {nome:'LUCAS DE MATTOS MARQUINI',matricula:'135',email:'lucas.marquini@empresa.com',clt:'Sim',nascimento:'1992-10-16',admissao:'2018-04-05',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'LUIS FERNANDO ALMEIDA SANCHES',matricula:'--',email:'luis.sanches@empresa.com',clt:'Não',nascimento:'1993-11-07',admissao:'2013-06-13',funcao:'Gerente de suporte',setor:'Suporte',salario:null,status:'Ativo'},
      {nome:'LUIZ FERNANDO RODRIGUES PEREIRA',matricula:'154',email:'luiz.rodrigues@empresa.com',clt:'Sim',nascimento:'1992-10-18',admissao:'2020-05-07',funcao:'Programador',setor:'Prog. Fiscal',salario:4266.19,status:'Ativo'},
      {nome:'MARCELA APARECIDA MENDES',matricula:'85',email:'marcela.mendes@empresa.com',clt:'Sim',nascimento:'1993-01-09',admissao:'2013-06-06',funcao:'Programador',setor:'ADM',salario:4847.65,status:'Ativo'},
      {nome:'MATEUS BAHIS VIEIRA',matricula:'5',email:'mateus@empresa.com',clt:'Sim',nascimento:'1978-07-10',admissao:'2005-10-06',funcao:'Gerente de projetos',setor:'Prog. Financeiro',salario:12619.99,status:'Ativo'},
      {nome:'MATHEUS HENRIQUE MARQUES FREITAS',matricula:'175',email:'henrique.freitas@empresa.com',clt:'Sim',nascimento:'1995-09-30',admissao:'2020-01-24',funcao:'Analista especialista de suporte',setor:'Suporte N3',salario:4266.19,status:'Ativo'},
      {nome:'MAYKON ALBERTO ELIAS',matricula:'--',email:'maykon.alberto@empresa.com',clt:'Não',nascimento:'1983-08-22',admissao:'2025-03-24',funcao:'Programador',setor:'Prog. Fiscal',salario:null,status:'Ativo'},
      {nome:'MORVAN DE JESUS JAIR',matricula:'--',email:'morvan.jesus@empresa.com',clt:'Não',nascimento:'1979-04-18',admissao:'2023-03-30',funcao:'Analista de suporte',setor:'Grandes Contas',salario:null,status:'Ativo'},
      {nome:'PAULO ANDRE LOT',matricula:'57',email:'paulo.lot@empresa.com',clt:'Sim',nascimento:'1985-01-13',admissao:'2011-10-15',funcao:'Gerente de projetos',setor:'Prog. Fiscal',salario:8018.74,status:'Ativo'},
      {nome:'PAULO HENRIQUE DA CRUZ RIECHEL',matricula:'--',email:'paulo.riechel@empresa.com',clt:'Não',nascimento:'1985-06-07',admissao:'2023-12-20',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'RAFAEL BRAYNER OLIVEIRA DE CERQUEIRA',matricula:'202',email:'rafael.brayner@empresa.com',clt:'Sim',nascimento:'1988-02-18',admissao:'2021-11-25',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'RAFAEL FRANCOVIG CAVICCHIOLLI',matricula:'109',email:'rafael.cavicchiolli@empresa.com',clt:'Sim',nascimento:'1993-03-08',admissao:'2015-06-26',funcao:'Programador',setor:'Prog. Financeiro',salario:4266.19,status:'Ativo'},
      {nome:'RAFAEL HONORIO RAQUEL JUNIOR',matricula:'--',email:'rafael@empresa.com',clt:'Não',nascimento:'1995-01-13',admissao:'2014-10-08',funcao:'Gerente Comercial',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'RAFAELLA MARRA KERSUL',matricula:'182',email:'rafaella@empresa.com',clt:'Sim',nascimento:'1992-03-12',admissao:'2020-11-01',funcao:'Coordenadora de RH',setor:'Recursos Humanos',salario:6387.72,status:'Ativo'},
      {nome:'RAMON OLIVEIRA',matricula:'--',email:'',clt:'Não',nascimento:'',admissao:'',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'RENAN MALAGUTTI',matricula:'204',email:'renan.malagutti@empresa.com',clt:'Sim',nascimento:'1992-08-03',admissao:'2021-12-13',funcao:'Analista de suporte',setor:'Suporte',salario:3979.97,status:'Ativo'},
      {nome:'RHENAN AZEVEDO CANO',matricula:'',email:'rhenan.azevedo@empresa.com',clt:'Não',nascimento:'1988-08-11',admissao:'2024-05-01',funcao:'Gerente de suporte',setor:'Suporte/Grandes Contas',salario:null,status:'Ativo'},
      {nome:'RHUAN VERLY DA FONSECA',matricula:'246',email:'rhuan.verli@empresa.com',clt:'Sim',nascimento:'1994-05-31',admissao:'2026-01-01',funcao:'Analista de suporte',setor:'Suporte',salario:2839.81,status:'Ativo'},
      {nome:'RODOLFO CACERAGHI DOS SANTOS',matricula:'184',email:'rodolfo.caceraghi@empresa.com',clt:'Sim',nascimento:'1986-06-22',admissao:'2020-12-25',funcao:'Programador',setor:'Prog. Fiscal',salario:5169.02,status:'Ativo'},
      {nome:'RODRIGO CAMPOS',matricula:'241',email:'rodrigo.campos@empresa.com',clt:'Sim',nascimento:'1996-02-04',admissao:'2025-06-26',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'ROGÉRIO PAMPLONA BUSTAMANTE',matricula:'219',email:'rogerio.pamplona@empresa.com',clt:'Sim',nascimento:'1996-05-23',admissao:'2023-03-01',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'RUBENS JOSÉ FACCO FILHO',matricula:'--',email:'rubens.facco@empresa.com',clt:'Não',nascimento:'1994-07-28',admissao:'2025-02-05',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'SEVERINO OLÍMPIO FELIX NETO',matricula:'--',email:'severino.neto@empresa.com',clt:'Não',nascimento:'1988-08-07',admissao:'2021-05-23',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'SIRYUS CANUTO SAMBULSKI',matricula:'176',email:'siryus.canuto@empresa.com',clt:'Sim',nascimento:'1993-10-30',admissao:'2020-08-04',funcao:'Programador',setor:'DBA',salario:3980.02,status:'Ativo'},
      {nome:'VAGNER LUIS RODRIGUES',matricula:'--',email:'vagner.luis@empresa.com',clt:'Não',nascimento:'1995-12-30',admissao:'2026-01-21',funcao:'Programador',setor:'Prog. Financeiro',salario:null,status:'Ativo'},
      {nome:'VANDILSON GUELLERI',matricula:'207',email:'vandilson.guellleri@empresa.com',clt:'Sim',nascimento:'1989-09-27',admissao:'2022-01-13',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'VARLEY DA SILVA RIBEIRO',matricula:'244',email:'varley.ribeiro@empresa.com',clt:'Sim',nascimento:'1992-01-17',admissao:'2025-11-05',funcao:'Analista de suporte',setor:'Suporte',salario:2585,status:'Ativo'},
      {nome:'VINÍCIUS MARTINS DE CARVALHO',matricula:'235',email:'vinicius.martins@empresa.com',clt:'Sim',nascimento:'1994-06-18',admissao:'2024-06-26',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'VINNIE TAVARES DE CARVALHO',matricula:'133',email:'vinnie.carvalho@empresa.com',clt:'Sim',nascimento:'1989-07-15',admissao:'2018-03-08',funcao:'Líder de suporte',setor:'Suporte',salario:3522.43,status:'Ativo'},
      {nome:'WALLYSSON MATEUS BARBOSA',matricula:'243',email:'wallysson.mateus@empresa.com',clt:'Sim',nascimento:'1997-01-21',admissao:'2025-10-15',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'WILLIAN SANTOS',matricula:'--',email:'william.santos@empresa.com',clt:'Não',nascimento:'2001-04-23',admissao:'2025-10-08',funcao:'Programador',setor:'Prog. Financeiro',salario:null,status:'Ativo'},
      {nome:'WILLIAM NASCIMENTO DA SILVA',matricula:'216',email:'william.nascimento@empresa.com',clt:'Sim',nascimento:'1991-09-14',admissao:'2023-01-16',funcao:'Analista de suporte',setor:'Suporte N3',salario:2717.47,status:'Ativo'},
      {nome:'WILLIAM DIAS',matricula:'--',email:'william.dias@empresa.com',clt:'Não',nascimento:'1977-09-11',admissao:'2020-04-01',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
    ];

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



