// ===== script: patch-remuneracao-design-moderno =====
(function(){
  if(window.__remDesignModernoInit) return;
  window.__remDesignModernoInit = true;

  var styles = `
    /* Comparativo Cards - Design Moderno */
    .rem-compare-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,1) 100%);
      border: 1px solid rgba(203,213,225,0.4);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.04);
      transition: all 0.3s ease;
    }

    .rem-compare-card:hover {
      box-shadow: 0 8px 24px rgba(15,23,42,0.1), 0 4px 8px rgba(15,23,42,0.06);
      border-color: rgba(203,213,225,0.6);
    }

    .rem-compare-card h3 {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 6px 0;
    }

    .rem-compare-card p {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 18px 0;
      line-height: 1.4;
    }

    /* KPI Cards */
    .rem-compare-kpi {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 12px;
      text-align: center;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
    }

    .rem-compare-kpi:nth-child(1) {
      border-left-color: #a78bfa;
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    }

    .rem-compare-kpi:nth-child(2) {
      border-left-color: #86efac;
      background: linear-gradient(135deg, #f0fdf4 0%, #f1fce4 100%);
    }

    .rem-compare-kpi:nth-child(3) {
      border-left-color: #60a5fa;
      background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
    }

    .rem-compare-kpi small {
      display: block;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .rem-compare-kpi strong {
      display: block;
      font-size: 20px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .rem-compare-kpi span {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    /* Bars Chart */
    .rem-folha-bars {
      display: flex;
      justify-content: center;
      gap: 32px;
      align-items: flex-end;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(203,213,225,0.3);
    }

    .rem-folha-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .rem-folha-bar {
      width: 48px;
      background: linear-gradient(180deg, #818cf8 0%, #6366f1 100%);
      border-radius: 8px 8px 0 0;
      box-shadow: 0 2px 8px rgba(99,102,241,0.2);
      transition: all 0.3s ease;
    }

    .rem-folha-bar.anterior {
      background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
      box-shadow: 0 2px 8px rgba(148,163,184,0.15);
    }

    .rem-folha-col:hover .rem-folha-bar {
      box-shadow: 0 4px 16px rgba(99,102,241,0.3);
    }

    .rem-folha-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-align: center;
      line-height: 1.4;
    }

    /* Comparativo Grid */
    .rem-comparativo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 20px;
    }

    /* Table Styling */
    .rem-table {
      background: transparent;
    }

    .rem-table thead tr {
      background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
      border-bottom: 2px solid #e2e8f0;
    }

    .rem-table thead th {
      color: #475569;
      padding: 14px 12px;
      text-align: left;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .rem-table tbody tr {
      border-bottom: 1px solid rgba(203,213,225,0.3);
      transition: background-color 0.2s ease;
    }

    .rem-table tbody tr:hover {
      background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .rem-table tbody td {
      padding: 12px;
      color: #334155;
      font-size: 13px;
    }

    .rem-table tbody tr:last-child {
      font-weight: 700;
      background: linear-gradient(90deg, #eff6ff 0%, #f0f9ff 100%);
      border-top: 2px solid #bfdbfe;
      border-bottom: none;
    }
  `;

  var style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style);
})();
