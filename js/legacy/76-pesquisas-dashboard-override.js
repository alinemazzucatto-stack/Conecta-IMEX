// ===== script: pesquisas-dashboard-override =====
(function(){
  if(window.__pesqDashboardOverride) return;
  window.__pesqDashboardOverride = true;

  var CORES_CAT={Clima:'#0047FF',Satisfação:'#9613f7',Integração:'#22C58B',Benefícios:'#f59e0b','Bem-estar':'#ec4899',Desempenho:'#ef4444',Desligamento:'#6b7280',Engajamento:'#8b5cf6',NPS:'#0ea5e9'};
  var CAT_ICON={Clima:'🌤',Satisfação:'⭐',Integração:'🤝',Benefícios:'🎁','Bem-estar':'💚',Desempenho:'📈',Desligamento:'🚪',Engajamento:'🔥',NPS:'📊'};
  var LS_ATIVAS='_grh_pesq_ativas', LS_ENCERRADAS='_grh_pesq_enc', LS_MODELOS='_grh_pesq_modelos';
  var MODELOS_DEF=[
    {id:'clima-org',nome:'Clima Organizacional',categoria:'Clima'},{id:'nps-colab',nome:'NPS do Colaborador',categoria:'NPS'},
    {id:'onboarding',nome:'Pesquisa de Onboarding',categoria:'Integração'},{id:'beneficios',nome:'Avaliação de Benefícios',categoria:'Benefícios'},
    {id:'saude-mental',nome:'Saúde Mental e Bem-estar',categoria:'Bem-estar'},{id:'feedback360',nome:'Feedback 360°',categoria:'Desempenho'},
    {id:'exit-survey',nome:'Pesquisa de Desligamento',categoria:'Desligamento'},{id:'engajamento',nome:'Engajamento de Equipe',categoria:'Engajamento'}
  ];
  function lsLer(k,d){ try{ return JSON.parse(localStorage.getItem(k))||d; }catch(e){ return d; } }

  window.grhPesquisasPainelHTML = function(){
    var mods=lsLer(LS_MODELOS,MODELOS_DEF);
    var ativas=lsLer(LS_ATIVAS,[]);
    var enc=lsLer(LS_ENCERRADAS,[]);
    if(!ativas.length) ativas=[
      {id:'demo1',nome:'Pesquisa de Clima 2024',categoria:'Clima',inicio:'2024-05-10T00:00:00',pct:67},
      {id:'demo2',nome:'NPS – Experiência do Colaborador',categoria:'NPS',inicio:'2024-05-08T00:00:00',pct:45}
    ];
    if(!enc.length) enc=[
      {id:'e1',nome:'Pesquisa de Clima – 1º Trimestre 2024',encerradaEm:'2024-04-28T00:00:00',pct:92},
      {id:'e2',nome:'NPS – Fevereiro 2024',encerradaEm:'2024-02-29T00:00:00',pct:78},
      {id:'e3',nome:'Pesquisa de Liderança 2023',encerradaEm:'2023-12-15T00:00:00',pct:85},
      {id:'e4',nome:'Bem-estar e Saúde Mental',encerradaEm:'2023-11-30T00:00:00',pct:81},
      {id:'e5',nome:'Comunicação Interna – Q3',encerradaEm:'2023-09-30T00:00:00',pct:74}
    ];

    function kpiCard(icon,bg,color,label,count,sub,link){
      return '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px 22px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 8px rgba(0,0,0,.04)">'
        +'<div style="background:'+bg+';border-radius:12px;width:50px;height:50px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">'+icon+'</div>'
        +'<div><div style="font-size:10px;font-weight:700;color:#64748b;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px">'+label+'</div>'
        +'<div style="font-size:32px;font-weight:800;color:'+color+';line-height:1">'+count+'</div>'
        +'<div style="font-size:11px;color:#94a3b8;margin-top:2px">'+sub+'</div>'
        +'<div style="font-size:11px;font-weight:700;color:'+color+';margin-top:5px">'+link+' ›</div>'
        +'</div></div>';
    }

    var kpis='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:22px">'
      +kpiCard('📋','#eff6ff','#2563eb','PESQUISAS ATIVAS',ativas.length,'Pesquisas em andamento com coleta aberta.','Ver pesquisas ativas')
      +kpiCard('📄','#faf5ff','#9613f7','MODELOS DE PESQUISAS',mods.length+'+','Modelos prontos para usar e personalizar.','Ver modelos disponíveis')
      +kpiCard('✅','#f0fdf4','#16a34a','PESQUISAS ENCERRADAS',enc.length,'Pesquisas finalizadas e seus resultados.','Ver pesquisas encerradas')
      +'</div>';

    var colAtivas='<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f1f5f9">'
      +'<h3 style="font-size:14px;font-weight:700;color:#0f172a;margin:0">Pesquisas Ativas</h3>'
      +'<span style="font-size:12px;font-weight:600;color:#9613f7;cursor:pointer">Ver todas</span></div>'
      +ativas.map(function(p){
        var cor=CORES_CAT[p.categoria]||'#9613f7';
        var icon=CAT_ICON[p.categoria]||'📋';
        var pct=p.pct||(Math.floor(Math.random()*50)+30);
        var dt=new Date(p.inicio).toLocaleDateString('pt-BR');
        return '<div style="padding:14px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:flex-start;gap:12px">'
          +'<div style="background:'+cor+'18;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">'+icon+'</div>'
          +'<div style="flex:1;min-width:0">'
          +'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px">'
          +'<span style="font-size:13px;font-weight:700;color:#0f172a">'+p.nome+'</span>'
          +'<span style="font-size:10px;font-weight:700;background:#dcfce7;color:#166534;border-radius:999px;padding:2px 10px;flex-shrink:0">Ativa</span>'
          +'</div>'
          +'<div style="font-size:11px;color:#94a3b8;margin-bottom:6px">'+p.categoria+' · Iniciada em '+dt+' · '+pct+'% respondido</div>'
          +'<div style="height:4px;background:#e2e8f0;border-radius:999px;overflow:hidden">'
          +'<div style="height:100%;width:'+pct+'%;background:'+cor+';border-radius:999px"></div>'
          +'</div></div></div>';
      }).join('')
      +'<div style="padding:12px 20px;text-align:center;border-top:1px solid #f1f5f9"><span style="font-size:12px;font-weight:600;color:#9613f7;cursor:pointer">Ver todas as ativas</span></div></div>';

    var colMods='<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f1f5f9">'
      +'<h3 style="font-size:14px;font-weight:700;color:#0f172a;margin:0">Modelos de Pesquisas</h3>'
      +'<span style="font-size:12px;font-weight:600;color:#9613f7;cursor:pointer">Ver todas</span></div>'
      +mods.slice(0,8).map(function(m){
        var cor=CORES_CAT[m.categoria]||'#0047FF';
        return '<div style="padding:12px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:center;justify-content:space-between;gap:8px">'
          +'<div style="display:flex;align-items:center;gap:10px">'
          +'<span style="color:#9613f7;font-size:14px">📄</span>'
          +'<span style="font-size:13px;font-weight:600;color:#0f172a">'+m.nome+'</span>'
          +'</div>'
          +'<span style="font-size:10px;font-weight:700;background:'+cor+'15;color:'+cor+';border-radius:999px;padding:2px 10px;white-space:nowrap">'+m.categoria+'</span>'
          +'</div>';
      }).join('')
      +'<div style="padding:12px 20px;text-align:center;border-top:1px solid #f1f5f9"><span style="font-size:12px;font-weight:600;color:#9613f7;cursor:pointer">Ver todos os modelos</span></div></div>';

    var colEnc='<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f1f5f9">'
      +'<h3 style="font-size:14px;font-weight:700;color:#0f172a;margin:0">Pesquisas Encerradas</h3>'
      +'<span style="font-size:12px;font-weight:600;color:#9613f7;cursor:pointer">Ver todas</span></div>'
      +enc.map(function(p){
        var dt=new Date(p.encerradaEm||Date.now()).toLocaleDateString('pt-BR');
        var pct=p.pct||(Math.floor(Math.random()*25)+65);
        return '<div style="padding:12px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:center;gap:10px">'
          +'<span style="color:#22c55e;font-size:16px;flex-shrink:0">✅</span>'
          +'<div style="flex:1;min-width:0">'
          +'<div style="font-size:13px;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+p.nome+'</div>'
          +'<div style="font-size:11px;color:#94a3b8">Encerrada em '+dt+' · '+pct+'% respondido</div>'
          +'</div>'
          +'<span style="font-size:10px;font-weight:700;background:#f1f5f9;color:#64748b;border-radius:999px;padding:2px 10px;white-space:nowrap;flex-shrink:0">Encerrada</span>'
          +'</div>';
      }).join('')
      +'<div style="padding:12px 20px;text-align:center;border-top:1px solid #f1f5f9"><span style="font-size:12px;font-weight:600;color:#9613f7;cursor:pointer">Ver todas as encerradas</span></div></div>';

    var infoBar='<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:14px 20px">'
      +'<div style="display:flex;align-items:center;gap:10px">'
      +'<span style="font-size:18px">ℹ️</span>'
      +'<span style="font-size:13px;color:#1e40af">Crie pesquisas personalizadas ou utilize nossos modelos prontos para ouvir sua equipe e tomar decisões baseadas em dados.</span>'
      +'</div>'
      +'<button style="background:#2563eb;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0">+ Nova Pesquisa</button>'
      +'</div>';

    return '<div data-grh-pesq="2" style="padding:4px 0">'+kpis
      +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">'+colAtivas+colMods+colEnc+'</div>'
      +infoBar+'</div>';
  };

  // REMOVED: Performance optimization - 400ms setInterval polling
  // Força re-render do pane quando visível (usa data-grh-pesq="2" como fingerprint novo)
  /*setInterval(function(){
    var pane=document.getElementById('grh-pane-pesquisas');
    if(!pane) return;
    if(window.getComputedStyle(pane).display==='none') return;
    if(!pane.querySelector('[data-grh-pesq="2"]')){
      pane.innerHTML=window.grhPesquisasPainelHTML();
    }
  },400);*/
})();

