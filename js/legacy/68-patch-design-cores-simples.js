// ===== script: patch-design-cores-simples =====
(function(){
  if(window.__designCoresSimples) return;
  window.__designCoresSimples = true;

  var css = `
    /* Cores pastel sutis nos cards - Design minimalista */
    .rem-compare-card {
      background: #fafbfc !important;
      border-color: #e2e8f0 !important;
    }

    .rem-compare-kpi {
      background: #f8fafc !important;
      border-color: #cbd5e1 !important;
    }

    .rem-compare-kpi:nth-child(1) {
      background: #f5f3ff !important;
      border-left-color: #a78bfa !important;
    }

    .rem-compare-kpi:nth-child(2) {
      background: #f0fdf4 !important;
      border-left-color: #86efac !important;
    }

    .rem-compare-kpi:nth-child(3) {
      background: #eff6ff !important;
      border-left-color: #60a5fa !important;
    }

    .rem-kpi2-corpo {
      background: #fafbfc !important;
    }

    .rem-table tbody tr {
      background: #f8fafc !important;
    }

    .rem-table tbody tr:hover {
      background: #f1f5f9 !important;
    }
  `;

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();
