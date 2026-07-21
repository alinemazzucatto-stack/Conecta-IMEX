// ===== script: patch-disc-resultado-acoes-js =====
(function(){
  const DISC_INFO_PATCH = {
    D:{nome:'Dominante',cor:'#e53e3e',emoji:'🦁',desc:'Orientado a resultados, direto, determinado e focado em ação.',dicas:'Pratique escuta ativa, empatia e paciência com processos e pessoas.'},
    I:{nome:'Influente',cor:'#0066cc',emoji:'🌟',desc:'Comunicativo, entusiasta, persuasivo e voltado a relacionamentos.',dicas:'Desenvolva foco, organização e atenção aos detalhes para sustentar entregas.'},
    S:{nome:'Estável',cor:'#38a169',emoji:'🌳',desc:'Paciente, colaborativo, constante e focado em harmonia.',dicas:'Fortaleça assertividade e flexibilidade diante de mudanças.'},
    C:{nome:'Consciente',cor:'#3182ce',emoji:'🔬',desc:'Analítico, preciso, organizado e focado em qualidade.',dicas:'Pratique decisões com informações incompletas e avance mesmo sem perfeição total.'}
  };

  function fmtData(iso){
    try{return new Date(iso).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});}catch(e){return 'Data não informada';}
  }
  function pct(res,k){
    if(res && res.pcts && res.pcts[k] != null) return Number(res.pcts[k]) || 0;
    if(res && res.scores){ const total=Object.values(res.scores).reduce((a,b)=>a+(Number(b)||0),0)||1; return Math.round((Number(res.scores[k])||0)/total*100); }
    return k===res?.perfil?100:0;
  }
  function montarResultadoHTML(res){
    const perfil=(res&&res.perfil)||'C';
    const p=DISC_INFO_PATCH[perfil]||DISC_INFO_PATCH.C;
    return `
      <div class="card" style="border-top:5px solid ${p.cor}">
        <div class="card-body">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:56px;margin-bottom:8px">${p.emoji}</div>
            <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${p.cor};margin-bottom:4px">Seu Perfil DISC</div>
            <h2 style="font-size:28px;font-weight:900;color:var(--ink);margin-bottom:4px">${p.nome} <span style="color:${p.cor}">(${perfil})</span></h2>
            <p style="font-size:14px;color:var(--ink-60);max-width:520px;margin:0 auto;line-height:1.6">${p.desc}</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(220px,1fr));gap:12px;margin-bottom:20px">
            ${Object.entries(DISC_INFO_PATCH).map(([k,v])=>`
              <div style="background:var(--bg);border-radius:12px;padding:14px 16px;border:1px solid var(--border)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <span style="font-size:13px;font-weight:800;color:${v.cor}">${k} — ${v.nome}</span>
                  <span style="font-size:15px;font-weight:900;color:${v.cor}">${pct(res,k)}%</span>
                </div>
                <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden">
                  <div style="height:100%;background:${v.cor};border-radius:4px;width:${pct(res,k)}%"></div>
                </div>
              </div>`).join('')}
          </div>
          <div style="background:linear-gradient(135deg,${p.cor}15,${p.cor}08);border:1px solid ${p.cor}30;border-radius:12px;padding:16px 18px;margin-bottom:16px">
            <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:${p.cor};margin-bottom:6px">💡 Dica de Desenvolvimento</div>
            <div style="font-size:14px;color:var(--ink);line-height:1.6">${p.dicas}</div>
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
            <button class="btn btn-p" onclick="discRefazer()">🔄 Refazer Teste</button>
            <button class="btn btn-g" onclick="discBaixarResultadoSalvo()">📥 Baixar PDF</button>
          </div>
        </div>
      </div>`;
  }

  window.discAbrirResultadoSalvo = function(){
    const res = window.__ultimoDiscResultado;
    if(!res){ alert('Nenhum resultado DISC encontrado para acessar.'); return; }
    const inicio=document.getElementById('disc-inicio'); if(inicio) inicio.style.display='none';
    const quiz=document.getElementById('disc-quiz'); if(quiz) quiz.style.display='none';
    const out=document.getElementById('disc-resultado');
    if(out){ out.style.display='block'; out.innerHTML=montarResultadoHTML(res); }
    try{ out?.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){}
  };

  window.discBaixarResultadoSalvo = function(){
    const res = window.__ultimoDiscResultado;
    if(!res){ alert('Nenhum resultado DISC encontrado para baixar.'); return; }
    const perfil=res.perfil||'C'; const p=DISC_INFO_PATCH[perfil]||DISC_INFO_PATCH.C;
    try{
      const jsPDF = window.jspdf && window.jspdf.jsPDF;
      if(!jsPDF) throw new Error('jsPDF indisponível');
      const doc=new jsPDF();
      doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text('Resultado DISC',20,20);
      doc.setFontSize(13); doc.text(`Perfil ${perfil} — ${p.nome}`,20,34);
      doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text(`Realizado em: ${fmtData(res.data)}`,20,42);
      doc.setFontSize(11);
      const desc=doc.splitTextToSize(p.desc,170); doc.text(desc,20,56);
      let y=72; doc.setFont('helvetica','bold'); doc.text('Distribuição dos perfis',20,y); y+=8; doc.setFont('helvetica','normal');
      ['D','I','S','C'].forEach(k=>{ const v=DISC_INFO_PATCH[k]; doc.text(`${k} — ${v.nome}: ${pct(res,k)}%`,20,y); y+=8; });
      y+=4; doc.setFont('helvetica','bold'); doc.text('Dica de desenvolvimento',20,y); y+=8; doc.setFont('helvetica','normal');
      doc.text(doc.splitTextToSize(p.dicas,170),20,y);
      doc.save(`resultado-disc-perfil-${perfil}.pdf`);
    }catch(e){
      window.discAbrirResultadoSalvo();
      setTimeout(()=>window.print(),250);
    }
  };

  window.discMostrarResultadoSalvo = function(res){
    const div=document.getElementById('disc-resultado-salvo');
    if(!div || !res) return;
    window.__ultimoDiscResultado = res;
    const perfil=res.perfil||'C'; const pi=DISC_INFO_PATCH[perfil]||DISC_INFO_PATCH.C;
    div.style.display='block';
    div.innerHTML = `<div class="disc-saved-card" style="--disc-color:${pi.cor};--disc-bg:${pi.cor}20">
      <div class="disc-saved-inner">
        <div class="disc-saved-icon">${perfil}</div>
        <div class="disc-saved-info">
          <div class="disc-saved-title">Seu último resultado: Perfil ${perfil} — ${pi.nome}</div>
          <div class="disc-saved-date">${fmtData(res.data)}</div>
        </div>
        <div class="disc-saved-actions">
          <button class="btn-disc-access" onclick="discAbrirResultadoSalvo()">🧠 Acessar resultado</button>
          <button class="btn-disc-download" onclick="discBaixarResultadoSalvo()">📥 Baixar PDF</button>
          <button class="btn-disc-redo" onclick="discRefazer()">🔄 Refazer teste</button>
        </div>
      </div>
    </div>`;
    const btn=document.getElementById('disc-btn-iniciar'); if(btn) btn.textContent='🔄 Refazer Test DISC';
  };
})();


