// ===== script: patch-acoes-colaboradores-v1 =====
(function(){
  'use strict';
  // DESATIVADO: este modal era decorativo — lia o texto da própria tabela
  // em vez dos dados reais, e o botão "Salvar" não gravava nada no Firestore.
  // O modal real e funcional é grhAbrirModalColab()/grhSalvarColab(), que já
  // lê/grava em grh_colabs (incluindo o campo de salário).
  return;

  function addCss(){
    if(document.getElementById('css-acoes-colaboradores-v1')) return;
    var st = document.createElement('style');
    st.id = 'css-acoes-colaboradores-v1';
    st.textContent = `
      .colab-actions-v1{display:flex;gap:8px;align-items:center;justify-content:flex-start;flex-wrap:nowrap}
      .colab-action-btn-v1{width:38px;height:38px;border:0;border-radius:12px;background:#eef4ff;color:#0047FF;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:14px;transition:.18s;box-shadow:0 1px 2px rgba(16,24,40,.06)}
      .colab-action-btn-v1:hover{transform:translateY(-1px);background:#dbeafe}
      .colab-action-btn-v1.danger{background:#fee2e2;color:#b91c1c}
      .colab-action-btn-v1.danger:hover{background:#fecaca}
      .colab-modal-v1{position:fixed;inset:0;background:rgba(15,23,42,.58);display:none;align-items:center;justify-content:center;z-index:2147483646;backdrop-filter:blur(6px)}
      .colab-modal-v1.active{display:flex}
      .colab-box-v1{background:#fff;width:min(1120px,96vw);max-height:92vh;overflow:auto;border-radius:24px;box-shadow:0 28px 90px rgba(0,0,0,.34)}
      .colab-head-v1{position:sticky;top:0;background:#fff;z-index:5;padding:22px 28px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
      .colab-head-v1 h2{margin:0;font-size:22px;color:#111827}.colab-head-v1 p{margin:4px 0 0;color:#64748b;font-size:13px}
      .colab-close-v1{border:0;background:#eef4ff;color:#0047FF;border-radius:999px;width:40px;height:40px;font-weight:950;cursor:pointer}
      .colab-tabs-v1{position:sticky;top:85px;z-index:4;background:#f8fbff;border-bottom:1px solid #e2e8f0;padding:14px 28px;display:flex;gap:9px;flex-wrap:wrap}
      .colab-tab-v1{border:1px solid #c7d7fe;background:#fff;color:#0047FF;border-radius:999px;padding:10px 15px;font-size:13px;font-weight:900;cursor:pointer}
      .colab-tab-v1.active{background:#0047FF;color:#fff}
      .colab-body-v1{padding:26px 28px 100px}
      .colab-foot-v1{position:sticky;bottom:0;background:#fff;border-top:1px solid #e2e8f0;padding:16px 28px;display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;z-index:5}
      .colab-btn-v1{border:0;border-radius:12px;padding:11px 15px;background:#0047FF;color:#fff;font-weight:900;cursor:pointer}
      .colab-btn-v1.secondary{background:#eef4ff;color:#0047FF}.colab-btn-v1.danger{background:#fee2e2;color:#b91c1c}
      .colab-form-v1{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
      .colab-form-v1 label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.05em}
      .colab-form-v1 input,.colab-form-v1 select,.colab-form-v1 textarea{border:1px solid #dbe3ef;border-radius:12px;padding:12px 13px;font-size:14px;color:#0f172a;background:#fff}
      .colab-form-v1 .full{grid-column:1/-1}.colab-sec-v1{grid-column:1/-1;margin:8px 0 0;font-weight:950;color:#0047FF;border-top:1px solid #edf2f7;padding-top:15px}
      .colab-grid-v1{display:grid;grid-template-columns:repeat(2,minmax(240px,1fr));gap:16px}
      .colab-card-v1{background:#f8fbff;border:1px solid #dbeafe;border-radius:18px;padding:18px}
      .colab-card-v1 h3{margin:0 0 8px;font-size:16px;color:#111827}.colab-card-v1 p,.colab-card-v1 li{font-size:13px;color:#475569;line-height:1.55}
      .colab-card-v1 ul{margin:8px 0 0;padding-left:18px}
      .colab-tag-v1{display:inline-flex;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900;background:#f1f5f9;color:#475569;margin-bottom:10px}
      .colab-tag-v1.ok{background:#dcfce7;color:#15803d}.colab-tag-v1.warn{background:#fef3c7;color:#b45309}
      @media(max-width:900px){.colab-form-v1,.colab-grid-v1{grid-template-columns:1fr}.colab-actions-v1{flex-wrap:wrap}}
    `;
    document.head.appendChild(st);
  }

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }

  function parseRow(btn){
    var tr = btn.closest('tr');
    var c = tr ? Array.from(tr.children).map(function(td){return td.innerText.trim();}) : [];
    return {
      nome: (c[0] || '').split('\n')[0] || 'Colaborador',
      matricula: c[1] || '',
      email: c[2] || '',
      cpf: c[3] || '',
      funcao: c[4] || '',
      setor: c[5] || '',
      contrato: c[6] || '',
      admissao: c[7] || '',
      tempo: c[8] || '',
      status: c[9] || 'Ativo',
      acesso: c[10] || 'colaborador'
    };
  }

  function dadosHTML(c){
    return '<div class="colab-form-v1">'
      + '<div class="colab-sec-v1">Dados pessoais</div>'
      + '<label>Nome completo<input value="'+esc(c.nome)+'"></label>'
      + '<label>CPF<input value="'+esc(c.cpf)+'" placeholder="000.000.000-00"></label>'
      + '<label>RG<input placeholder="RG"></label>'
      + '<label>Data nascimento<input type="date"></label>'
      + '<label>Estado civil<select><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option></select></label>'
      + '<label>Telefone<input placeholder="(00) 00000-0000"></label>'
      + '<label class="full">E-mail pessoal<input placeholder="email pessoal"></label>'
      + '<div class="colab-sec-v1">Dados contratuais</div>'
      + '<label>Matrícula<input value="'+esc(c.matricula)+'"></label>'
      + '<label>Admissão<input value="'+esc(c.admissao)+'"></label>'
      + '<label>Cargo/Função<input value="'+esc(c.funcao)+'"></label>'
      + '<label>Setor<input value="'+esc(c.setor)+'"></label>'
      + '<label>Contrato<input value="'+esc(c.contrato)+'"></label>'
      + '<label>Status<input value="'+esc(c.status)+'"></label>'
      + '<div class="colab-sec-v1">Acesso ao sistema</div>'
      + '<label>Perfil<input value="'+esc(c.acesso)+'"></label>'
      + '<label>E-mail IMEX<input value="'+esc(c.email)+'"></label>'
      + '<label>Login liberado<select><option>Sim</option><option>Não</option></select></label>'
      + '<label class="full">Observações<textarea placeholder="Observações internas do RH"></textarea></label>'
      + '</div>';
  }

  function enderecoHTML(){
    return '<div class="colab-form-v1"><div class="colab-sec-v1">Endereço residencial</div>'
      + '<label>CEP<input placeholder="00000-000"></label><label>Rua<input placeholder="Rua"></label><label>Número<input placeholder="Número"></label>'
      + '<label>Complemento<input></label><label>Bairro<input></label><label>Cidade<input></label><label>UF<input></label>'
      + '<label>Status<select><option>Atualizado</option><option>Pendente</option><option>Revisar</option></select></label>'
      + '<label>Comprovante<select><option>Pendente</option><option>Aprovado</option><option>Reprovado</option></select></label></div>';
  }

  function cardsHTML(tipo){
    var htmls = {
      documentos:[
        ['🪪 RG','Enviado','Documento de identificação.','ok'],['📄 CPF','Enviado','Cadastro de Pessoa Física.','ok'],['📘 CTPS','Pendente','Carteira de trabalho.','warn'],['🏠 Comprovante de residência','Pendente','Comprovante atualizado.','warn'],['📑 Contrato','Assinado','Contrato/termo vinculado.','ok'],['🩺 Exames','Não anexado','Exames admissionais/periódicos.','']
      ],
      beneficios:[
        ['🏥 Unimed','Ativo','Plano de saúde do titular.','ok'],['🍔 iFood Benefícios','Ativo','Vale alimentação/refeição. Recarga dia 30/31 ou último dia útil.','ok'],['💪 Wellhub','Ativo','Academias e apps parceiros. Até 3 dependentes.','ok'],['❤️ Starbem','Ativo','Saúde digital e consultas.','ok'],['🏥 Dasa NAV','Ativo','Até 4 dependentes.','ok'],['🧠 Optum','Ativo','Até 2 dependentes.','ok']
      ],
      ferias:[['🌴 Saldo','Disponível','Saldo atual: 30 dias.','ok'],['📅 Período aquisitivo','Acompanhar','Controle de vencimentos e histórico.','warn']],
      desenvolvimento:[['🌱 Experiência 45/90','Acompanhar','Controle de período de experiência.','warn'],['🧠 DISC','Disponível','Resultado e histórico.','ok'],['🚀 Trilha de carreira','','Cargo atual, próximo cargo e competências.',''],['📌 PDI','','Ações de desenvolvimento.','']]
    };
    return '<div class="colab-grid-v1">' + (htmls[tipo] || []).map(function(x){
      return '<div class="colab-card-v1"><h3>'+x[0]+'</h3><span class="colab-tag-v1 '+x[3]+'">'+x[1]+'</span><p>'+x[2]+'</p></div>';
    }).join('') + '</div>';
  }

  function simples(t){return '<div class="colab-card-v1"><h3>'+t+'</h3><p>Histórico vinculado ao cadastro do colaborador.</p></div>';}

  function abrirModal(c, modo){
    addCss();
    var m = document.getElementById('colabModalActionsV1');
    if(!m){m=document.createElement('div');m.id='colabModalActionsV1';m.className='colab-modal-v1';document.body.appendChild(m);}
    var titulo = modo === 'view' ? '👁 Visualizar colaborador' : modo === 'new' ? '+ Novo colaborador' : '✏️ Editar colaborador';
    m.innerHTML = '<div class="colab-box-v1">'
      + '<div class="colab-head-v1"><div><h2>'+titulo+'</h2><p>'+esc(c.nome || 'Cadastro de colaborador')+'</p></div><button class="colab-close-v1" type="button">×</button></div>'
      + '<div class="colab-tabs-v1">'
      + '<button class="colab-tab-v1 active" data-tab="dados">📋 Dados Gerais</button>'
      + '<button class="colab-tab-v1" data-tab="endereco">📍 Endereço</button>'
      + '<button class="colab-tab-v1" data-tab="documentos">📄 Documentos</button>'
      + '<button class="colab-tab-v1" data-tab="beneficios">🎁 Benefícios</button>'
      + '<button class="colab-tab-v1" data-tab="ferias">🌴 Férias</button>'
      + '<button class="colab-tab-v1" data-tab="desenvolvimento">🌱 Desenvolvimento</button>'
      + '<button class="colab-tab-v1" data-tab="movimentacoes">🔄 Movimentações</button>'
      + '<button class="colab-tab-v1" data-tab="auditoria">📝 Auditoria</button>'
      + '</div>'
      + '<div class="colab-body-v1" id="colabBodyActionsV1">'+dadosHTML(c)+'</div>'
      + '<div class="colab-foot-v1">'
      + '<button class="colab-btn-v1 secondary" type="button" onclick="alert(\'Senha temporária gerada.\')">🔑 Resetar Senha</button>'
      + '<button class="colab-btn-v1 secondary" type="button" onclick="alert(\'Acesso bloqueado temporariamente.\')">🚫 Bloquear Acesso</button>'
      + '<button class="colab-btn-v1 danger" type="button" onclick="alert(\'Fluxo de desligamento iniciado.\')">❌ Desligar</button>'
      + '<button class="colab-btn-v1 secondary" type="button" onclick="alert(\'PDF da ficha gerado.\')">📄 Exportar PDF</button>'
      + '<button class="colab-btn-v1" type="button" onclick="document.getElementById(\'colabModalActionsV1\').classList.remove(\'active\');alert(\'Cadastro salvo.\')">💾 Salvar</button>'
      + '</div></div>';
    m.classList.add('active');
    m.querySelector('.colab-close-v1').onclick = function(){m.classList.remove('active');};
    m.querySelectorAll('.colab-tab-v1').forEach(function(b){
      b.onclick=function(ev){
        ev.preventDefault();ev.stopPropagation();
        m.querySelectorAll('.colab-tab-v1').forEach(function(x){x.classList.remove('active');});
        b.classList.add('active');
        var tab=b.getAttribute('data-tab');
        var content = tab==='dados'?dadosHTML(c):tab==='endereco'?enderecoHTML():['documentos','beneficios','ferias','desenvolvimento'].includes(tab)?cardsHTML(tab):simples(tab==='movimentacoes'?'🔄 Movimentações':'📝 Auditoria');
        document.getElementById('colabBodyActionsV1').innerHTML = content;
      };
    });
  }

  window.colabAbrirAcaoV1 = function(modo, btn){abrirModal(parseRow(btn), modo);};
  window.colabNovaAcaoV1 = function(){abrirModal({}, 'new');};

  function trocarAcoes(){
    addCss();
    var pane = document.getElementById('grh-pane-colaboradores');
    if(!pane || pane.style.display === 'none') return;
    var table = pane.querySelector('table');
    if(!table) return;

    var novo = Array.from(pane.querySelectorAll('button')).find(function(b){return /novo/i.test(b.innerText || '');});
    if(novo && novo.dataset.colabNovoV1 !== '1'){
      novo.dataset.colabNovoV1='1';
      novo.onclick=function(ev){ev.preventDefault();ev.stopPropagation();window.colabNovaAcaoV1();return false;};
    }

    table.querySelectorAll('tbody tr').forEach(function(tr){
      var last=tr.children[tr.children.length-1];
      if(!last || last.dataset.colabActionsV1==='1') return;
      last.dataset.colabActionsV1='1';
      last.innerHTML = '<div class="colab-actions-v1">'
        + '<button class="colab-action-btn-v1" type="button" title="Visualizar" onclick="window.colabAbrirAcaoV1(\'view\',this)">👁</button>'
        + '<button class="colab-action-btn-v1" type="button" title="Editar" onclick="window.colabAbrirAcaoV1(\'edit\',this)">✏️</button>'
        + '<button class="colab-action-btn-v1" type="button" title="Resetar senha" onclick="event.stopPropagation();alert(\'Senha temporária gerada e enviada ao colaborador.\')">🔑</button>'
        + '<button class="colab-action-btn-v1" type="button" title="Bloquear acesso" onclick="event.stopPropagation();alert(\'Acesso bloqueado temporariamente.\')">🚫</button>'
        + '<button class="colab-action-btn-v1 danger" type="button" title="Desligar" onclick="event.stopPropagation();alert(\'Fluxo de desligamento iniciado.\')">❌</button>'
        + '</div>';
    });
  }

  var oldGrhTab = window.grhTab;
  window.grhTab = function(tab, btn){
    var ret = typeof oldGrhTab === 'function' ? oldGrhTab.apply(this, arguments) : undefined;
    if(String(tab || '').toLowerCase().includes('colaboradores')){
      setTimeout(trocarAcoes,100);setTimeout(trocarAcoes,500);
    }
    return ret;
  };

  document.addEventListener('click', function(ev){
    var el = ev.target && ev.target.closest && ev.target.closest('button,a,div');
    if(!el) return;
    var txt=(el.innerText||'').toLowerCase();
    var attrs=((el.getAttribute('onclick')||'')+' '+(el.getAttribute('data-rh-tab')||'')+' '+(el.getAttribute('data-target')||'')).toLowerCase();
    if(txt.includes('colaboradores') || attrs.includes('colaboradores')){
      setTimeout(trocarAcoes,250);setTimeout(trocarAcoes,800);
    }
  }, true);

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){setTimeout(trocarAcoes,800);setInterval(trocarAcoes,1500);});
  }else{
    setTimeout(trocarAcoes,800);setInterval(trocarAcoes,1500);
  }
})();
