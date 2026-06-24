/* ===== intranet-timeline-limpo-corrigido.js ===== */
(function () {
  "use strict";

  if (window.__intranetTimelineLoaded) return;
  window.__intranetTimelineLoaded = true;

  const state = {
    dropdownOpen: false,
    composeMounted: false
  };

  function injectStyles() {
    if (document.getElementById("intranet-timeline-css")) return;

    const style = document.createElement("style");
    style.id = "intranet-timeline-css";
    style.textContent = `
      #tl-compose{
        background:#fff;
        border-radius:16px;
        border:1px solid #e2e8f0;
        margin-bottom:16px;
        overflow:visible;
        width:100%;
        max-width:none;
        box-sizing:border-box;
        padding:18px;
      }

      .tl-compose-top{
        display:flex;
        align-items:center;
        gap:14px;
      }

      .tl-avatar{
        width:42px;
        height:42px;
        border-radius:50%;
        background:#4338ca;
        color:#fff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:700;
      }

      .tl-input{
        flex:1;
        height:46px;
        border:1px solid #dbe2ea;
        border-radius:999px;
        padding:0 20px;
        font-size:14px;
        color:#64748b;
      }

      .tl-compose-actions{
        margin-top:18px;
        display:flex;
        gap:12px;
        align-items:center;
        position:relative;
      }

      .tl-pub-wrap{
        position:relative;
        display:flex;
      }

      .tl-pub-main{
        height:44px;
        padding:0 18px;
        border:0;
        background:linear-gradient(135deg,#4f46e5,#6d28d9);
        color:white;
        font-weight:700;
        border-radius:12px 0 0 12px;
        cursor:pointer;
      }

      .tl-pub-arrow{
        width:38px;
        border:0;
        color:white;
        background:#5b21b6;
        border-left:1px solid rgba(255,255,255,.2);
        border-radius:0 12px 12px 0;
        cursor:pointer;
      }

      .tl-action-btn{
        height:44px;
        padding:0 20px;
        border:1px solid #dbe2ea;
        background:white;
        border-radius:12px;
        cursor:pointer;
      }

      .tl-pub-dropdown{
        position:absolute;
        top:52px;
        left:0;
        width:220px;
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:14px;
        box-shadow:0 18px 45px rgba(0,0,0,.12);
        display:none;
        z-index:99999;
        padding:8px;
      }

      .tl-pub-dropdown.open{
        display:block;
      }
      .tl-pub-item{
        display:flex;
        align-items:center;
        gap:10px;
        padding:12px;
        border-radius:10px;
        cursor:pointer;
        font-size:14px;
        font-weight:600;
        color:#1e293b;
      }

      .tl-pub-item:hover{
        background:#f4f0ff;
        color:#5b21b6;
      }

      #tl-mood-bar{
        width:100%;
        background:#fff;
        border:1px solid #e2e8f0;
        border-radius:16px;
        padding:18px;
        margin-bottom:16px;
        box-sizing:border-box;
      }

      #tl-mood-bar h4{
        margin:0 0 14px;
        font-size:15px;
        color:#0f172a;
      }

      .tl-mood-options{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
      }

      .tl-mood-btn{
        border:1px solid transparent;
        background:var(--mood-bg);
        color:var(--mood-color);
        border-radius:999px;
        padding:9px 14px;
        cursor:pointer;
        font-weight:600;
      }

      .tl-mood-btn:hover{
        transform:translateY(-1px);
      }

      .tl-mood-done{
        font-size:14px;
        color:#475569;
        background:#f8fafc;
        border-radius:12px;
        padding:12px 14px;
      }

      #intra-feed{
        width:100%;
        max-width:none;
      }

      .tl-hs2{
        background:rgba(255,255,255,.12);
        border:1px solid rgba(255,255,255,.18);
        border-radius:14px;
        padding:10px 16px 8px;
        min-width:150px;
        box-shadow:0 6px 16px rgba(10,10,40,.18);
        display:flex;flex-direction:column;justify-content:space-between;
      }
      .tl-hs2-top{display:flex;align-items:center;gap:10px}
      .tl-hs2-ico{
        width:38px;height:38px;border-radius:10px;
        display:flex;align-items:center;justify-content:center;
        font-size:17px;flex-shrink:0;
      }
      .tl-hs2-num{display:block;font-size:22px;font-weight:900;color:#fff;line-height:1}
      .tl-hs2-lbl{font-size:12px;color:rgba(255,255,255,.7);font-weight:600;white-space:nowrap}
      .tl-hs2-link{
        margin-top:7px;font-size:12px;font-weight:700;color:rgba(255,255,255,.85);
        cursor:pointer;border-top:1px solid rgba(255,255,255,.14);padding-top:6px;
      }
      .tl-hs2-link:hover{color:#fff}

      #view-intranet .tl-profile-card{background:linear-gradient(135deg,#1e1b4b 0%,#4338ca 100%) !important;text-align:center;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;box-shadow:0 10px 30px rgba(30,27,75,.25)}
      #view-intranet .tl-profile-av-wrap{position:relative !important;display:inline-block !important;align-self:center !important;width:fit-content !important}
      #view-intranet .tl-profile-av{background:rgba(255,255,255,.2) !important;border:3px solid rgba(255,255,255,.5) !important;color:#fff !important;background-position:center !important}
      #view-intranet .tl-profile-online{position:absolute;bottom:0;right:2px;width:13px;height:13px;border-radius:50%;background:#22c55e;border:2px solid #3730a3}
      #view-intranet .tl-profile-name{color:#fff !important}
      #view-intranet .tl-profile-role{color:rgba(255,255,255,.8) !important}
      #view-intranet .tl-profile-sector{background:rgba(255,255,255,.16) !important;color:#fff !important}
      #view-intranet .tl-profile-stat{background:rgba(255,255,255,.12) !important}
      #view-intranet .tl-profile-stat strong{color:#fff !important}
      #view-intranet .tl-profile-stat span{color:rgba(255,255,255,.7) !important}
      #view-intranet .tl-profile-stat small{display:block;font-size:10px;color:rgba(255,255,255,.55);margin-top:2px}

      .tl-pill-row{display:flex;gap:10px;flex-wrap:wrap}
      .tl-pill-btn{
        flex:1;min-width:110px;border:none;border-radius:12px;
        padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:6px;
        transition:transform .12s;
      }
      .tl-pill-btn:hover{transform:translateY(-1px)}

      .tl-quick-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
      .tl-quick-personalizar{font-size:11px;font-weight:700;color:#4338ca;cursor:pointer}
      .tl-quick-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .tl-quick-item{background:#eef4ff;border-radius:14px;padding:18px 8px 16px;text-align:center;cursor:pointer;transition:transform .12s;min-width:0;overflow:hidden}
      .tl-quick-item:hover{transform:translateY(-2px)}
      .tl-quick-ico{width:46px;height:46px;border-radius:13px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
      .tl-quick-label{font-size:12px;font-weight:700;color:#1e293b;overflow-wrap:break-word;word-break:break-word;hyphens:auto}

      .tl-aniv-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
      .tl-aniv-ver-todos{font-size:11px;font-weight:700;color:#4338ca;cursor:pointer}
      .tl-aniv-gift{width:28px;height:28px;border-radius:50%;background:#eef4ff;display:flex;align-items:center;justify-content:center;font-size:13px;margin-left:auto;flex-shrink:0;cursor:pointer}

      #view-intranet .tl-hero-wrap{padding:8px 32px !important;flex-wrap:nowrap !important;align-items:center !important}
      #view-intranet .tl-hero-greeting{font-size:22px !important;margin-bottom:3px !important}
      #view-intranet .tl-hero-sub{font-size:13px !important}
    `;

    document.head.appendChild(style);
  }

  const tiposPublicacao = [
    { tipo: "noticias", ico: "💬", label: "Post" },
    { tipo: "avisos", ico: "📢", label: "Aviso" },
    { tipo: "documentos", ico: "📄", label: "Documento" },
    { tipo: "vagas", ico: "💼", label: "Vaga" },
    { tipo: "reconhecimento", ico: "⭐", label: "Reconhecimento" },
    { tipo: "enquetes", ico: "📊", label: "Enquete" }
  ];

  function getInitials() {
    const label = document.getElementById("pLabel");
    const nome = label && label.textContent ? label.textContent.trim() : "Colaborador";
    const partes = nome.split(" ").filter(Boolean);

    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    return (partes[0] ? partes[0][0] : "C").toUpperCase();
  }

  function closeDropdown() {
    const dropdown = document.getElementById("tl-pub-dd");
    if (dropdown) dropdown.classList.remove("open");
    state.dropdownOpen = false;
  }

  function toggleDropdown(event) {
    if (event) event.stopPropagation();

    const dropdown = document.getElementById("tl-pub-dd");
    if (!dropdown) return;

    state.dropdownOpen = !dropdown.classList.contains("open");
    dropdown.classList.toggle("open", state.dropdownOpen);
  }

  function abrirPublicacao(tipo) {
    closeDropdown();

    const tipoField = document.getElementById("intra-tipo");
    if (tipoField) {
      tipoField.value = tipo || "noticias";

      if (typeof window.intraToggleVagaExtras === "function") {
        window.intraToggleVagaExtras(tipoField.value);
      }
    }

    const canalField = document.getElementById("intra-canal-select");
    const mapaCanal = {
      noticias: "noticias",
      avisos: "avisos",
      documentos: "documentos",
      vagas: "vagas",
      reconhecimento: "geral",
      enquetes: "geral"
    };

    if (canalField && mapaCanal[tipo]) {
      canalField.value = mapaCanal[tipo];
    }

    if (typeof window.intraAbrirModal === "function") {
      window.intraAbrirModal();
    }
  }

  window.tlTogglePubDropdown = toggleDropdown;
  window.tlClosePubDropdown = closeDropdown;
  window.tlComposeFocus = abrirPublicacao;
  function buildComposeBox() {
    if (document.getElementById("tl-compose")) return;

    const feed = document.getElementById("intra-feed");
    if (!feed) return;

    injectStyles();

    const dropdownItems = tiposPublicacao.map(item => `
      <div class="tl-pub-item" onclick="tlComposeFocus('${item.tipo}')">
        <span>${item.ico}</span>
        <span>${item.label}</span>
      </div>
    `).join("");

    const html = `
      <div id="tl-compose">
        <div class="tl-compose-top">
          <div class="tl-avatar">${getInitials()}</div>
          <div class="tl-input" onclick="tlComposeFocus('noticias')">
            Compartilhe algo com a equipe...
          </div>
        </div>

        <div class="tl-compose-actions">
          <div class="tl-pub-wrap">
            <button class="tl-pub-main" onclick="tlComposeFocus('noticias')">
              ✏️ Publicar
            </button>

            <button class="tl-pub-arrow" onclick="tlTogglePubDropdown(event)">
              ▾
            </button>

            <div class="tl-pub-dropdown" id="tl-pub-dd">
              ${dropdownItems}
            </div>
          </div>
        </div>
      </div>
    `;

    feed.insertAdjacentHTML("beforebegin", html);

    state.composeMounted = true;
  }

  function buildMoodBar() {
    if (document.getElementById("tl-mood-bar")) return;

    const compose = document.getElementById("tl-compose");
    if (!compose) return;

    const html = `
      <div id="tl-mood-bar">
        <h4>Como você está se sentindo hoje?</h4>

        <div class="tl-mood-options">
          <button class="tl-mood-btn"
                  style="--mood-bg:#fee2e2;--mood-color:#b91c1c">
            😡 Zangado
          </button>

          <button class="tl-mood-btn"
                  style="--mood-bg:#dbeafe;--mood-color:#1d4ed8">
            😢 Triste
          </button>

          <button class="tl-mood-btn"
                  style="--mood-bg:#fef3c7;--mood-color:#b45309">
            😐 Neutro
          </button>

          <button class="tl-mood-btn"
                  style="--mood-bg:#dcfce7;--mood-color:#059669">
            🙂 Satisfeito
          </button>

          <button class="tl-mood-btn"
                  style="--mood-bg:#f3e8ff;--mood-color:#7c3aed">
            😄 Alegre
          </button>
        </div>
      </div>
    `;

    compose.insertAdjacentHTML("afterend", html);
  }
  function initialsFromName(nome) {
    const partes = String(nome || "Colaborador").trim().split(" ").filter(Boolean);
    if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    return (partes[0] ? partes[0][0] : "C").toUpperCase();
  }

  function avatarColor(seed) {
    const colors = ["#0047FF", "#7c3aed", "#059669", "#ea580c", "#db2777", "#0891b2"];
    let h = 0;
    for (let i = 0; i < String(seed).length; i++) h = (h * 31 + seed.charCodeAt(i)) % colors.length;
    return colors[Math.abs(h) % colors.length];
  }

  function tempoDeEmpresa(admissaoStr) {
    if (!admissaoStr) return "—";
    const d = new Date(admissaoStr);
    if (isNaN(d.getTime())) return "—";
    const hoje = new Date();
    let anos = hoje.getFullYear() - d.getFullYear();
    let meses = hoje.getMonth() - d.getMonth();
    if (hoje.getDate() < d.getDate()) meses--;
    if (meses < 0) { anos--; meses += 12; }
    return anos + "a " + meses + "m";
  }

  function atualizarHeroStats() {
    try {
      const lista = window.intraPublicacoes || [];
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set("tl-hs-posts", lista.length);
      set("tl-hs-avisos", lista.filter(p => p.tipo === "avisos").length);
      set("tl-hs-docs", lista.filter(p => p.tipo === "documentos").length);
    } catch (e) {}
    try {
      if (typeof window.grhGetColabs === "function") {
        window.grhGetColabs().then(colabs => {
          const hoje = new Date();
          const aniv = (colabs || []).filter(c => {
            if (!c.nascimento || c.status !== "Ativo") return false;
            const d = new Date(c.nascimento);
            return !isNaN(d.getTime()) && d.getMonth() === hoje.getMonth() && d.getDate() === hoje.getDate();
          }).length;
          const el = document.getElementById("tl-hs-aniv");
          if (el) el.textContent = aniv;
        }).catch(() => {});
      }
    } catch (e) {}
  }

  function buildHero() {
    const heroEl = document.querySelector("#view-intranet .hero");
    if (!heroEl) return;
    const u = window.currentUserData || {};
    const nomeCompleto = u.nome || sessionStorage.getItem("userName") || "";
    const nomePrimeiro = nomeCompleto.split(" ")[0] || "Colaborador";
    // Reconstrói só quando o nome resolvido muda (ex.: dados de login chegam
    // depois do primeiro mount) — evita ficar travado em "Colaborador" para
    // sempre e também evita reconstruir a cada tick do observer sem motivo.
    if (heroEl.dataset.tlHero === nomePrimeiro) return;
    heroEl.dataset.tlHero = nomePrimeiro;
    heroEl.style.setProperty("padding", "0", "important");
    heroEl.style.setProperty("min-height", "0", "important");
    const h = new Date().getHours();
    const saud = h < 12 ? "Bom dia" : (h < 18 ? "Boa tarde" : "Boa noite");
    const logoSrc = (document.querySelector(".topbar-brand img") || {}).src || "";
    const ilustracao = logoSrc
      ? '<div style="position:absolute;right:32px;top:0;bottom:0;display:flex;align-items:center;pointer-events:none;opacity:.16">' +
          '<img src="' + logoSrc + '" alt="IMEX" style="width:150px;max-width:100%;object-fit:contain;filter:brightness(0) invert(1)" />' +
        "</div>"
      : "";
    const stats = [
      { id: "posts", ico: "💬", cor: "#3b82f6", lbl: "Posts", link: "ver todos", tipo: null },
      { id: "avisos", ico: "📢", cor: "#ef4444", lbl: "Avisos", link: "ver agora", tipo: "avisos" },
      { id: "aniv", ico: "🎂", cor: "#f59e0b", lbl: "Aniversário", link: "parabenizar", tipo: "aniv" }
    ];
    const statsHtml = stats.map(s =>
      '<div class="tl-hs2">' +
        '<div class="tl-hs2-top">' +
          '<div class="tl-hs2-ico" style="background:' + s.cor + '">' + s.ico + "</div>" +
          "<div><strong class=\"tl-hs2-num\" id=\"tl-hs-" + s.id + "\">—</strong><span class=\"tl-hs2-lbl\">" + s.lbl + "</span></div>" +
        "</div>" +
        '<div class="tl-hs2-link" onclick="' + (s.tipo === "aniv" ? "if(typeof window.sbNav==='function')window.sbNav('intranet')" : "if(typeof window.intraSelecionar==='function')window.intraSelecionar('" + (s.tipo || "todos") + "')") + '">' + s.link + " →</div>" +
      "</div>"
    ).join("");
    const dataFmt = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    const dataCap = dataFmt.charAt(0).toUpperCase() + dataFmt.slice(1);
    heroEl.style.setProperty("position", "relative", "important");
    heroEl.innerHTML =
      '<div class="tl-hero-wrap" style="min-width:0;width:100%;box-sizing:border-box;position:relative;justify-content:flex-start !important">' +
        '<div style="min-width:0;flex:0 0 auto">' +
          '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#c4b5fd;margin-bottom:4px;white-space:nowrap">Portal Conecta IMEX</div>' +
          '<div class="tl-hero-greeting" style="white-space:nowrap">' + saud + ", " + nomePrimeiro + "! 👋</div>" +
          '<div class="tl-hero-sub" style="white-space:nowrap">' + dataCap + "</div>" +
        "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:nowrap;min-width:0;flex:0 0 auto;margin-left:36px">' + statsHtml + "</div>" +
      "</div>" +
      ilustracao;
    const wrapEl = heroEl.querySelector(".tl-hero-wrap");
    if (wrapEl) {
      wrapEl.style.setProperty("padding-top", "6px", "important");
      wrapEl.style.setProperty("padding-bottom", "6px", "important");
      wrapEl.style.setProperty("padding-right", "32px", "important");
      wrapEl.style.setProperty("padding-left", "32px", "important");
    }
    atualizarHeroStats();
  }

  function redimensionarImagem(file, maxLado, cb) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h && w > maxLado) { h = Math.round(h * maxLado / w); w = maxLado; }
        else if (h > maxLado) { w = Math.round(w * maxLado / h); h = maxLado; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function aplicarFotoNoAvatar(avEl, fotoUrl) {
    if (!avEl) return;
    avEl.style.backgroundImage = "url(" + fotoUrl + ")";
    avEl.style.backgroundSize = "cover";
    avEl.style.backgroundPosition = "center";
    const ini = avEl.querySelector(".tl-prof-initials-txt");
    if (ini) ini.style.display = "none";
  }

  function renderProfileCard(aside) {
    const u = window.currentUserData || {};
    const email = u.email || sessionStorage.getItem("userEmail") || "";
    const nome = u.nome || sessionStorage.getItem("userName") || "Colaborador";
    const card = document.createElement("div");
    card.className = "tl-sc tl-profile-card";
    card.innerHTML =
      '<div class="tl-profile-av-wrap">' +
        '<div class="tl-profile-av" id="tl-prof-av" title="Clique para alterar a foto">' +
          '<span class="tl-prof-initials-txt">' + initialsFromName(nome) + "</span>" +
          '<div class="tl-photo-overlay">📷</div>' +
        "</div>" +
        '<div class="tl-profile-online"></div>' +
      "</div>" +
      '<input type="file" id="tl-foto-input" accept="image/*" style="display:none">' +
      '<div class="tl-profile-name">' + nome + "</div>" +
      '<div class="tl-profile-role" id="tl-prof-role">' + (u.cargo || u.funcao || "") + "</div>" +
      '<div class="tl-profile-sector" id="tl-prof-setor" style="display:' + (u.setor ? "inline-block" : "none") + '">' + (u.setor || "") + "</div>" +
      '<div class="tl-profile-stats">' +
        '<div class="tl-profile-stat"><strong id="tl-prof-tempo">—</strong><span>Tempo de empresa</span><small id="tl-prof-desde"></small></div>' +
        '<div class="tl-profile-stat"><strong id="tl-prof-matricula">—</strong><span>Matrícula</span></div>' +
      "</div>";
    aside.appendChild(card);

    let meDocId = null;
    if (typeof window.grhGetColabs === "function") {
      window.grhGetColabs().then(colabs => {
        const me = (colabs || []).find(c => (email && c.email === email) || c.nome === nome);
        if (me) {
          meDocId = me._id || me.id || null;
          const t = document.getElementById("tl-prof-tempo"); if (t) t.textContent = tempoDeEmpresa(me.admissao);
          const dEl = document.getElementById("tl-prof-desde");
          if (dEl && me.admissao) { const dd = new Date(me.admissao); if (!isNaN(dd.getTime())) dEl.textContent = "desde " + dd.toLocaleDateString("pt-BR"); }
          const m = document.getElementById("tl-prof-matricula"); if (m) m.textContent = me.matricula || "—";
          const r = document.getElementById("tl-prof-role"); if (r && !r.textContent) r.textContent = me.funcao || me.cargo || "";
          const s = document.getElementById("tl-prof-setor"); if (s && me.setor) { s.textContent = me.setor; s.style.display = "inline-block"; }
          if (me.foto) aplicarFotoNoAvatar(document.getElementById("tl-prof-av"), me.foto);
        }
      }).catch(() => {});
    }

    const avEl = document.getElementById("tl-prof-av");
    const inputEl = document.getElementById("tl-foto-input");
    if (avEl && inputEl) {
      avEl.onclick = () => inputEl.click();
      inputEl.onchange = () => {
        const file = inputEl.files && inputEl.files[0];
        if (!file) return;
        redimensionarImagem(file, 200, dataUrl => {
          aplicarFotoNoAvatar(avEl, dataUrl);
          try {
            if (meDocId && typeof db !== "undefined" && typeof col === "function") {
              db.collection(col("grh_colabs")).doc(meDocId).update({ foto: dataUrl }).catch(() => {});
            }
          } catch (e) {}
        });
      };
    }
  }

  function renderAcoesRapidas(aside) {
    const card = document.createElement("div");
    card.className = "tl-sc";
    const itens = [
      { ico: "📄", label: "Meus Documentos", acao: "if(typeof window.abrirMeusDocumentos==='function')window.abrirMeusDocumentos()", cor: "#3b82f6", bg: "#eff6ff" },
      { ico: "🌴", label: "Férias", id: "solicitacao", cor: "#10b981", bg: "#ecfdf5" },
      { ico: "❤️", label: "Benefícios", id: "beneficios", cor: "#ec4899", bg: "#fdf2f8" },
      { ico: "🎧", label: "Chamados", id: "ouvidoria", cor: "#f97316", bg: "#fff7ed" },
      { ico: "📅", label: "Agenda", id: "intranet", cor: "#0ea5e9", bg: "#f0f9ff" }
    ];
    card.innerHTML =
      '<div class="tl-quick-head"><div class="tl-sc-title" style="margin-bottom:0"><span class="tl-sc-title-ico">⚡</span>Ações rápidas</div><span class="tl-quick-personalizar">Personalizar ⚙</span></div>' +
      '<div class="tl-quick-grid">' +
      itens.map(i =>
        '<div class="tl-quick-item" onclick="' +
          (i.acao ? i.acao :
            (i.tipo ? "if(typeof window.intraSelecionar==='function')window.intraSelecionar('" + i.tipo + "');" : "") +
            "if(typeof window.sbNav==='function')window.sbNav('" + i.id + "')") + '">' +
          '<div class="tl-quick-ico" style="background:' + i.bg + ";color:" + i.cor + '">' + i.ico + "</div>" +
          '<div class="tl-quick-label">' + i.label + "</div></div>"
      ).join("") +
      "</div>";
    aside.appendChild(card);
  }

  function renderAniversarios(aside) {
    const card = document.createElement("div");
    card.className = "tl-sc";
    card.innerHTML = '<div class="tl-aniv-head"><div class="tl-sc-title" style="margin-bottom:0"><span class="tl-sc-title-ico">🎉</span>Próximos aniversários</div><span class="tl-aniv-ver-todos">Ver todos →</span></div><div id="tl-aniv-list" style="margin-top:10px"><div class="tl-pend-empty">Carregando...</div></div>';
    aside.appendChild(card);
    if (typeof window.grhGetColabs !== "function") return;
    window.grhGetColabs().then(colabs => {
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      const lista = (colabs || []).filter(c => c.nascimento && c.status === "Ativo").map(c => {
        const d = new Date(c.nascimento);
        const prox = new Date(hoje.getFullYear(), d.getMonth(), d.getDate());
        if (prox < hoje) prox.setFullYear(hoje.getFullYear() + 1);
        return { nome: c.nome, setor: c.setor, foto: c.foto, prox };
      }).sort((a, b) => a.prox - b.prox).slice(0, 5);
      const el = document.getElementById("tl-aniv-list");
      if (!el) return;
      if (!lista.length) { el.innerHTML = '<div class="tl-pend-empty">Sem aniversários cadastrados.</div>'; return; }
      el.innerHTML = lista.map(p => {
        const nomeShort = String(p.nome || "").split(" ").slice(0, 2).join(" ");
        const dataFmt = p.prox.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
        const avStyle = p.foto
          ? "background-image:url(" + p.foto + ");background-size:cover;background-position:center"
          : "background:" + avatarColor(p.nome || "C");
        return '<div class="tl-aniv-item"><div class="tl-aniv-av" style="' + avStyle + '">' + (p.foto ? "" : initialsFromName(p.nome)) + "</div>" +
          '<div><div class="tl-aniv-name">' + nomeShort + '</div><div class="tl-aniv-when">' + (p.setor || "") + " · " + dataFmt + "</div></div>" +
          '<div class="tl-aniv-gift" title="Parabenizar">🎁</div></div>';
      }).join("");
      setTimeout(() => {
        const gifts = document.querySelectorAll(".tl-aniv-gift");
        gifts.forEach(gift => {
          gift.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }, true);
        });
      }, 0);
    }).catch(() => {});
  }

  function renderRanking(aside) {
    const card = document.createElement("div");
    card.className = "tl-sc";
    card.innerHTML = '<div class="tl-sc-title"><span class="tl-sc-title-ico">🏆</span>Ranking</div><div id="tl-rank-list"><div class="tl-pend-empty">Carregando...</div></div>';
    aside.appendChild(card);
    try {
      if (typeof db === "undefined" || typeof col !== "function") return;
      db.collection(col("intra_xp")).orderBy("xpTotal", "desc").limit(5).get().then(snap => {
        const el = document.getElementById("tl-rank-list");
        if (!el) return;
        const docs = snap.docs;
        if (!docs.length) { el.innerHTML = '<div class="tl-pend-empty">Sem dados de ranking ainda.</div>'; return; }
        const medals = ["🥇", "🥈", "🥉"];
        el.innerHTML = docs.map((d, i) => {
          const data = d.data();
          const nome = String(data.nome || data.email || "Colaborador").split("@")[0];
          return '<div class="tl-aniv-item"><div style="width:24px;text-align:center;font-size:14px;flex-shrink:0">' + (medals[i] || (i + 1) + "º") + "</div>" +
            '<div style="flex:1"><div class="tl-aniv-name">' + nome + "</div></div>" +
            '<div style="font-size:12px;font-weight:800;color:#0047FF">' + (data.xpTotal || 0) + " XP</div></div>";
        }).join("");
      }).catch(() => {
        const el = document.getElementById("tl-rank-list"); if (el) el.innerHTML = '<div class="tl-pend-empty">Ranking indisponível.</div>';
      });
    } catch (e) {}
  }

  function nomeResolvidoAtual() {
    const u = window.currentUserData || {};
    return u.nome || sessionStorage.getItem("userName") || "Colaborador";
  }

  function buildTlSidebar() {
    const layout = document.querySelector("#view-intranet .intra-social-layout");
    if (!layout) return;
    const existente = document.getElementById("tl-sidebar");
    if (existente) {
      // Se os dados de login chegaram depois do primeiro mount, o cartão de
      // perfil tinha ficado travado em "Colaborador" genérico — reconstrói
      // só esse cartão quando o nome resolvido muda, sem refazer o resto.
      const nomeAtual = nomeResolvidoAtual();
      if (existente.dataset.tlPerfilNome === nomeAtual) return;
      existente.dataset.tlPerfilNome = nomeAtual;
      const cardAntigo = existente.querySelector(".tl-profile-card");
      if (cardAntigo) cardAntigo.remove();
      renderProfileCard(existente);
      existente.insertBefore(existente.lastElementChild, existente.firstChild);
      alinharAlturaPerfil();
      return;
    }
    const aside = document.createElement("div");
    aside.id = "tl-sidebar";
    aside.dataset.tlPerfilNome = nomeResolvidoAtual();
    layout.appendChild(aside);
    renderProfileCard(aside);
    renderAcoesRapidas(aside);
    renderAniversarios(aside);
    renderRanking(aside);
  }

  function toggleGlobalHeaderExtras() {
    const v = document.getElementById("view-intranet");
    const visible = !!(v && getComputedStyle(v).display !== "none");
    const sw = document.getElementById("tl-global-search-wrap");
    const ch = document.getElementById("tl-global-chat");
    if (sw) sw.style.display = visible ? "flex" : "none";
    if (ch) ch.style.display = visible ? "block" : "none";
  }

  function alinharAlturaPerfil() {
    const hero = document.querySelector("#view-intranet .hero");
    const card = document.querySelector("#tl-sidebar .tl-profile-card");
    if (!hero || !card) return;
    const h = hero.getBoundingClientRect().height;
    if (h > 0) card.style.minHeight = Math.round(h) + "px";
  }

  function mount() {
    injectStyles();
    buildComposeBox();
    buildMoodBar();
    buildHero();
    buildTlSidebar();
    atualizarHeroStats();
    toggleGlobalHeaderExtras();
    alinharAlturaPerfil();
  }

  const origSbNavTl = window.sbNav;
  if (typeof origSbNavTl === "function") {
    window.sbNav = function () {
      const r = origSbNavTl.apply(this, arguments);
      toggleGlobalHeaderExtras();
      return r;
    };
  }

  document.addEventListener("click", function (event) {
    const wrap = document.querySelector(".tl-pub-wrap");

    if (wrap && !wrap.contains(event.target)) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDropdown();
    }
  });

  const observer = new MutationObserver(function () {
    const feed = document.getElementById("intra-feed");

    if (feed && !document.getElementById("tl-compose")) {
      mount();
    }

    if (document.getElementById("tl-compose") && !document.getElementById("tl-mood-bar")) {
      buildMoodBar();
    }

    if (feed) {
      buildHero();
      buildTlSidebar();
    }

    toggleGlobalHeaderExtras();
    alinharAlturaPerfil();
  });

  window.addEventListener("resize", function () {
    setTimeout(alinharAlturaPerfil, 150);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  setTimeout(mount, 300);
  setTimeout(mount, 1000);
  setTimeout(mount, 2000);

})();